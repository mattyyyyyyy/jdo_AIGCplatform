import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Mic, 
  Phone, 
  PhoneOff, 
  ChevronDown, 
  Play, 
  Save, 
  User, 
  ArrowLeft,
  Send,
  AlertTriangle,
  Upload,
  Globe,
  History,
  X,
  Box,
  Crown,
  Cat,
  Ghost,
  Sword,
  Sparkles,
  Zap,
  Flower,
  Moon,
  MessageSquare,
  Check,
  Glasses,
  Shirt,
  Video,
  Square,
  Volume2,
  Gauge,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCcw,
  Footprints, 
  Scissors,
  Loader2,
  Square as SquareIcon 
} from 'lucide-react';
import { AppModule, Asset, ChatMessage } from '../types';

interface StudioProps {
  module: AppModule;
  onChangeModule: (module: AppModule) => void;
  lang: 'zh' | 'en';
  toggleLanguage: () => void;
  onBack: () => void;
  onOpenSettings: () => void;
  t: any;
}

// --- New Voice Config Constants ---
const VOICE_LANGUAGES = [
  { id: 'zh', name: '中文' },
  { id: 'en', name: 'English' }
];

const VOICE_PRESETS = [
  { id: 'gentle_sister', name: '温柔姐姐', gender: 'female', color: '#fbcfe8' },
  { id: 'youthful_maiden', name: '青春少女', gender: 'female', color: '#f472b6' },
  { id: 'playful_girl', name: '俏皮女童', gender: 'female', color: '#fb7185' },
  { id: 'sunny_boy', name: '阳光少年', gender: 'male', color: '#facc15' },
  { id: 'artsy_guy', name: '文艺小哥', gender: 'male', color: '#60a5fa' },
  { id: 'obedient_shota', name: '乖巧正太', gender: 'male', color: '#4ade80' }
];

const VOICE_EMOTIONS = [
  { id: 'default', name: '默认' },
  { id: 'happy', name: '开心' },
  { id: 'sad', name: '悲伤' },
  { id: 'angry', name: '生气' },
  { id: 'excited', name: '激动' },
  { id: 'whisper', name: '低语' }
];

// --- Custom Rainbow Star Loader ---
const RainbowLoader = ({ size = 16 }: { size?: number }) => (
  <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 animate-[spin_2s_linear_infinite]">
        <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">
            <defs>
                <linearGradient id="rainbow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#eab308" />
                    <stop offset="50%" stopColor="#22c55e" />
                    <stop offset="75%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
            </defs>
            {/* Main 4-Point Star */}
            <path 
                d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" 
                fill="none" 
                stroke="url(#rainbow-grad)" 
                strokeWidth="2"
                strokeLinejoin="round"
            />
            {/* Rotated 4-Point Star (Creating 8-point effect) */}
             <path 
                d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" 
                fill="none" 
                stroke="url(#rainbow-grad)" 
                strokeWidth="2"
                strokeLinejoin="round"
                transform="rotate(45, 12, 12)"
                className="opacity-80"
            />
        </svg>
      </div>
  </div>
);

// --- Simplified Audio Visualizer Hook for Small Card ---
const useAudioVisualizer = (active: boolean, bars: number = 32) => {
  const [levels, setLevels] = useState<number[]>(new Array(bars).fill(10));
  
  useEffect(() => {
    if (!active) {
        setLevels(new Array(bars).fill(10));
        return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let stream: MediaStream | null = null;
    let rafId: number;
    let isMounted = true;
    let dataArray: Uint8Array;

    const startAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        if (!isMounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
        }

        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; 
        analyser.smoothingTimeConstant = 0.5;
        
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const update = () => {
          if (!analyser || !isMounted) return;
          analyser.getByteFrequencyData(dataArray);
          
          const step = Math.floor(bufferLength / bars);
          const newLevels = [];
          for (let i = 0; i < bars; i++) {
             const val = dataArray[i * step];
             newLevels.push(10 + (val / 255) * 90);
          }
          setLevels(newLevels);
          rafId = requestAnimationFrame(update);
        };
        update();

      } catch (err) {
        console.warn("Microphone access denied or error:", err);
        const fallbackInterval = setInterval(() => {
           if(isMounted) setLevels(prev => prev.map(() => 10 + Math.random() * 40));
        }, 100);
        return () => clearInterval(fallbackInterval);
      }
    };

    startAudio();

    return () => {
      isMounted = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (source) source.disconnect();
      if (analyser) analyser.disconnect();
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
    };
  }, [active, bars]);

  return levels;
};

// --- Voice Card Component (Small, Top Right) ---
const VoiceCard = ({ onCancel }: { onCancel: () => void }) => {
  const [time, setTime] = useState(0);
  const levels = useAudioVisualizer(true, 32);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-[#1a1a1a]/90 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 w-72 backdrop-blur-xl relative overflow-hidden animate-in zoom-in-95 duration-200 origin-bottom-right">
        {/* Close Button */}
        <button 
          onClick={onCancel} 
          className="absolute top-2 right-2 p-1.5 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <X size={14} />
        </button>

        {/* Dynamic Waveform */}
        <div className="flex items-center justify-center gap-[2px] h-12 w-full px-2">
          {levels.map((level, i) => (
              <div 
                key={i} 
                className="w-1 bg-white rounded-full transition-all duration-75 ease-linear"
                style={{ 
                  height: `${Math.max(10, level)}%`,
                  opacity: 0.5 + (level / 200) 
                }} 
              />
          ))}
        </div>

        {/* Timer */}
        <span className="font-mono text-xl font-medium text-white/90 tracking-widest">
          {formatTime(time)}
        </span>
        
        {/* Little triangle arrow pointing down */}
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45 transform" />
    </div>
  );
};

// --- Updated Particle System from "Friend AI" logic ---
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;

  constructor(w: number, h: number, centerY: number) {
    this.x = Math.random() * w;
    // Particles concentrated in the middle ripple area
    this.y = centerY + (Math.random() - 0.5) * 100;
    // Speed reduced by 50% (0.5 -> 0.25)
    this.vx = (Math.random() - 0.5) * 0.25; 
    // Vertical speed reduced by 50%
    this.vy = ((Math.random() - 1) * 0.8 - 0.2) * 0.5; 
    this.life = 1.0; // Life value
    this.decay = Math.random() * 0.01 + 0.005; // Decay speed
    this.size = Math.random() * 2 + 0.5; // Size
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    // Silver white, with transparency
    ctx.fillStyle = `rgba(220, 230, 255, ${this.life * 0.8})`;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Reusable Real-time Visualizer for Calls (Friend AI Logic - Optimized) ---
const CallVisualizer = ({ active, scale = 1 }: { active: boolean, scale?: number }) => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const audioContextRef = useRef<AudioContext | null>(null);
   const analyserRef = useRef<AnalyserNode | null>(null);
   const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
   const streamRef = useRef<MediaStream | null>(null);
   const rafRef = useRef<number | null>(null);
   const particlesRef = useRef<Particle[]>([]);
   
   // Optimization: Reuse data array to prevent GC jitter
   const dataArrayRef = useRef<Uint8Array | null>(null);

   // Visual Config from "Friend AI" spec - Reverted to richer values
   const config = {
     color: '255, 255, 255', 
     speed: 0.18,            
     lines: 8,               
     baseAmplitude: 15, 
     // OPTIMIZATION: Reduced particle count for performance
     // Reduced by 30%: 50 * 0.7 = 35
     particleCount: 35       
   };

   useEffect(() => {
     if (!active) {
         if (rafRef.current) cancelAnimationFrame(rafRef.current);
         if (sourceRef.current) sourceRef.current.disconnect();
         if (analyserRef.current) analyserRef.current.disconnect();
         if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
         if (audioContextRef.current) audioContextRef.current.close();
         
         rafRef.current = null;
         sourceRef.current = null;
         analyserRef.current = null;
         streamRef.current = null;
         audioContextRef.current = null;
         particlesRef.current = [];
         dataArrayRef.current = null;
         
         // Clear canvas on exit
         if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
         }
         return;
     }

     const initAudio = async () => {
         try {
             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
             streamRef.current = stream;
             
             const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
             const ctx = new AudioContextClass();
             audioContextRef.current = ctx;

             const analyser = ctx.createAnalyser();
             // OPTIMIZATION: Reduced FFT Size from 2048 to 1024 for 2x faster processing
             analyser.fftSize = 1024; 
             analyser.smoothingTimeConstant = 0.85; // High smoothing for fluid movement
             analyserRef.current = analyser;
             
             // Optimization: Allocation happens once
             dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

             const source = ctx.createMediaStreamSource(stream);
             source.connect(analyser);
             sourceRef.current = source;

             animate();
         } catch (e) {
             console.error("Mic access error:", e);
         }
     };

     const animate = () => {
         if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
         const canvas = canvasRef.current;
         const ctx = canvas.getContext('2d');
         if (!ctx) return;

         const width = canvas.width;
         const height = canvas.height;
         const centerY = height * 0.5;

         const dataArray = dataArrayRef.current;
         analyserRef.current.getByteFrequencyData(dataArray);

         // 2. Calculate Energy
         let sum = 0;
         // Take a slightly wider frequency band (first 200 bins)
         for(let i = 0; i < 200; i++) {
             sum += dataArray[i];
         }
         const volume = sum / 200; 
         const energy = Math.max(volume / 255, 0.05); 
         // Scale amplitude based on energy. Reverted to higher multiplier.
         const amplitude = energy * 60 + config.baseAmplitude; 

         ctx.clearRect(0, 0, width, height);
         ctx.globalCompositeOperation = 'lighter'; // Additive blending for glow

         // --- 3. Particles ---
         const spawnCount = Math.floor(energy * 3); 
         if (particlesRef.current.length < config.particleCount && Math.random() < 0.5 + energy) {
             for(let k=0; k<spawnCount + 1; k++) {
                 particlesRef.current.push(new Particle(width, height, centerY));
             }
         }

         ctx.shadowBlur = 5;
         ctx.shadowColor = 'white';
         
         for (let i = particlesRef.current.length - 1; i >= 0; i--) {
             const p = particlesRef.current[i];
             p.update();
             p.draw(ctx);
             if (p.life <= 0) {
                 particlesRef.current.splice(i, 1);
             }
         }

         // --- 4. Wave Rendering ---
         const time = Date.now() * 0.002;
         
         // Enhanced Glow Settings
         ctx.shadowBlur = 25; 
         ctx.shadowColor = `rgba(${config.color}, 0.7)`; 

         for (let i = 0; i < config.lines; i++) {
             ctx.beginPath();
             
             // Dynamic transparency: clearer in middle, fainter at edges
             const distFromCenter = Math.abs(i - config.lines / 2);
             const alpha = Math.max(0, 1 - (distFromCenter / (config.lines / 2.5)));
             
             ctx.strokeStyle = `rgba(${config.color}, ${alpha * 0.6 + 0.1})`;
             // Line thickness varies slightly with energy
             ctx.lineWidth = 1.5 + (energy * 2); 

             for (let x = 0; x <= width; x += 5) {
                 const k = x / width;
                 
                 // Optimization Attenuation Function: Reverted to fluid bell curve
                 const attenuation = Math.pow(4 * k * (1 - k), 4); 

                 const frequency = 0.008 + (i * 0.003); 
                 // Increased phase offset for more flow
                 const phase = time * (config.speed + i * 0.02) + (i * 2); 

                 // Complex wave superposition with secondary perturbation
                 const y = centerY + 
                           Math.sin(x * frequency + phase) * amplitude * attenuation * (1 + Math.sin(time * 1.5 + i) * 0.2); 

                 if (x === 0) ctx.moveTo(x, y);
                 else ctx.lineTo(x, y);
             }
             ctx.stroke();
         }

         rafRef.current = requestAnimationFrame(animate);
     };

     initAudio();

     return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
     };
   }, [active]);
   
   // Cleanup on unmount
   useEffect(() => {
     return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (sourceRef.current) sourceRef.current.disconnect();
        if (analyserRef.current) analyserRef.current.disconnect();
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();
     }
   }, []);

   if (!active) return null;

   // Updated Container: Added dynamic margin based on scale to prevent overlap
   const baseOffset = -30;
   // Half height of card (250) * (scale - 1) gives the extra distance the bottom moves down
   const dynamicOffset = Math.max(0, (scale - 1) * 250);

   return (
    <div 
        className="absolute top-full left-1/2 -translate-x-1/2 w-[500px] h-[200px] flex items-center justify-center pointer-events-none pb-0 z-30 animate-in fade-in zoom-in duration-500 transition-all duration-300 ease-out"
        style={{ marginTop: `${baseOffset + dynamicOffset}px` }}
    >
       <canvas 
          ref={canvasRef}
          width={500} 
          height={200}
          className="w-full h-full object-contain"
          style={{ 
            filter: 'blur(0.5px) contrast(1.2)', 
            maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)'
          }}
       />
    </div>
   );
}

// Anime-style Assets with Compatibility Logic & SubCategories
const ASSETS: Asset[] = [
  // ... (Same assets as before)
  // Female Models
  { id: 'f1', name: 'Ganyu Style', type: 'base', category: 'female', previewColor: '#A5C9FF' },
  { id: 'f2', name: 'Keqing Style', type: 'base', category: 'female', previewColor: '#D4A5FF' },
  { id: 'f3', name: 'Barbara Style', type: 'base', category: 'female', previewColor: '#FFB7C5' },
  { id: 'f4', name: 'Nahida Style', type: 'base', category: 'female', previewColor: '#B5EAD7' },
  // Male Models
  { id: 'm1', name: 'Xiao Style', type: 'base', category: 'male', previewColor: '#4ADE80' },
  { id: 'm2', name: 'Childe Style', type: 'base', category: 'male', previewColor: '#F87171' },
  { id: 'm3', name: 'Kazuha Style', type: 'base', category: 'male', previewColor: '#E2E8F0' },
  { id: 'm4', name: 'Zhongli Style', type: 'base', category: 'male', previewColor: '#FCD34D' },
  // Pets
  { id: 'p1', name: 'Paimon', type: 'base', category: 'pet', previewColor: '#FFFFFF' },
  { id: 'p2', name: 'Guoba', type: 'base', category: 'pet', previewColor: '#F97316' },
  
  // --- Accessories (Specific to models) ---
  
  // f1 Ganyu (8 items)
  { id: 'a_f1_1', name: 'Qilin Horns', type: 'accessory', subCategory: 'decoration', previewColor: '#ef4444', compatibleWith: ['f1'] },
  { id: 'a_f1_2', name: 'Ice Bell', type: 'accessory', subCategory: 'decoration', previewColor: '#93c5fd', compatibleWith: ['f1'] },
  { id: 'a_f1_3', name: 'Frost Top', type: 'accessory', subCategory: 'top', previewColor: '#bfdbfe', compatibleWith: ['f1'] },
  { id: 'a_f1_4', name: 'Cryo Orb', type: 'accessory', subCategory: 'decoration', previewColor: '#60a5fa', compatibleWith: ['f1'] },
  { id: 'a_f1_5', name: 'Goat Plushie', type: 'accessory', subCategory: 'decoration', previewColor: '#ffffff', compatibleWith: ['f1'] },
  { id: 'a_f1_6', name: 'Spirit Boots', type: 'accessory', subCategory: 'shoes', previewColor: '#3b82f6', compatibleWith: ['f1'] },
  { id: 'a_f1_7', name: 'Cloud Cape', type: 'accessory', subCategory: 'top', previewColor: '#e0f2fe', compatibleWith: ['f1'] },
  { id: 'a_f1_8', name: 'Jade Skirt', type: 'accessory', subCategory: 'bottom', previewColor: '#10b981', compatibleWith: ['f1'] },

  // f2 Keqing (8 items)
  { id: 'a_f2_1', name: 'Cat Twin Tails', type: 'accessory', subCategory: 'decoration', previewColor: '#a855f7', compatibleWith: ['f2'] },
  { id: 'a_f2_2', name: 'Electro Vision', type: 'accessory', subCategory: 'decoration', previewColor: '#c084fc', compatibleWith: ['f2'] },
  { id: 'a_f2_3', name: 'Stiletto Heels', type: 'accessory', subCategory: 'shoes', previewColor: '#e879f9', compatibleWith: ['f2'] },
  { id: 'a_f2_4', name: 'Golden Shrimp', type: 'accessory', subCategory: 'decoration', previewColor: '#facc15', compatibleWith: ['f2'] },
  { id: 'a_f2_5', name: 'Purple Top', type: 'accessory', subCategory: 'top', previewColor: '#7e22ce', compatibleWith: ['f2'] },
  { id: 'a_f2_6', name: 'Night Gown', type: 'accessory', subCategory: 'top', previewColor: '#4c1d95', compatibleWith: ['f2'] },
  { id: 'a_f2_7', name: 'Lightning Skirt', type: 'accessory', subCategory: 'bottom', previewColor: '#d8b4fe', compatibleWith: ['f2'] },
  { id: 'a_f2_8', name: 'Star Hairpin', type: 'accessory', subCategory: 'decoration', previewColor: '#fbbf24', compatibleWith: ['f2'] },

  // f3 Barbara (8 items)
  { id: 'a_f3_1', name: 'Idol Hat', type: 'accessory', subCategory: 'decoration', previewColor: '#f472b6', compatibleWith: ['f3'] },
  { id: 'a_f3_2', name: 'Song Book', type: 'accessory', subCategory: 'decoration', previewColor: '#fbcfe8', compatibleWith: ['f3'] },
  { id: 'a_f3_3', name: 'Water Notes', type: 'accessory', subCategory: 'decoration', previewColor: '#38bdf8', compatibleWith: ['f3'] },
  { id: 'a_f3_4', name: 'Duck Toy', type: 'accessory', subCategory: 'decoration', previewColor: '#fef08a', compatibleWith: ['f3'] },
  { id: 'a_f3_5', name: 'White Dress', type: 'accessory', subCategory: 'top', previewColor: '#f3f4f6', compatibleWith: ['f3'] },
  { id: 'a_f3_6', name: 'Sparkle Mic', type: 'accessory', subCategory: 'decoration', previewColor: '#94a3b8', compatibleWith: ['f3'] },
  { id: 'a_f3_7', name: 'Rainbow Skirt', type: 'accessory', subCategory: 'bottom', previewColor: '#f472b6', compatibleWith: ['f3'] },
  { id: 'a_f3_8', name: 'Healer Shoes', type: 'accessory', subCategory: 'shoes', previewColor: '#22d3ee', compatibleWith: ['f3'] },

  // f4 Nahida (8 items)
  { id: 'a_f4_1', name: 'Leaf Hairclip', type: 'accessory', subCategory: 'decoration', previewColor: '#86efac', compatibleWith: ['f4'] },
  { id: 'a_f4_2', name: 'Dendro Lamp', type: 'accessory', subCategory: 'decoration', previewColor: '#bbf7d0', compatibleWith: ['f4'] },
  { id: 'a_f4_3', name: 'Wisdom Orb', type: 'accessory', subCategory: 'decoration', previewColor: '#4ade80', compatibleWith: ['f4'] },
  { id: 'a_f4_4', name: 'Swing Set', type: 'accessory', subCategory: 'decoration', previewColor: '#166534', compatibleWith: ['f4'] },
  { id: 'a_f4_5', name: 'Green Cape', type: 'accessory', subCategory: 'top', previewColor: '#15803d', compatibleWith: ['f4'] },
  { id: 'a_f4_6', name: 'Forest Shorts', type: 'accessory', subCategory: 'bottom', previewColor: '#84cc16', compatibleWith: ['f4'] },
  { id: 'a_f4_7', name: 'Dream Shoes', type: 'accessory', subCategory: 'shoes', previewColor: '#d9f99d', compatibleWith: ['f4'] },
  { id: 'a_f4_8', name: 'Tech Terminal', type: 'accessory', subCategory: 'decoration', previewColor: '#22c55e', compatibleWith: ['f4'] },
  
  // m1 Xiao
  { id: 'a_m1_1', name: 'Yaksha Mask', type: 'accessory', subCategory: 'decoration', previewColor: '#22c55e', compatibleWith: ['m1'] },
  { id: 'a_m1_2', name: 'Jade Spear', type: 'accessory', subCategory: 'decoration', previewColor: '#10b981', compatibleWith: ['m1'] },
  // m2 Childe
  { id: 'a_m2_1', name: 'Fatui Mask', type: 'accessory', subCategory: 'decoration', previewColor: '#ef4444', compatibleWith: ['m2'] },
  { id: 'a_m2_2', name: 'Water Daggers', type: 'accessory', subCategory: 'decoration', previewColor: '#3b82f6', compatibleWith: ['m2'] },
  // m3 Kazuha
  { id: 'a_m3_1', name: 'Red Streak', type: 'accessory', subCategory: 'decoration', previewColor: '#ef4444', compatibleWith: ['m3'] },
  { id: 'a_m3_2', name: 'Maple Leaf', type: 'accessory', subCategory: 'decoration', previewColor: '#fdba74', compatibleWith: ['m3'] },
  // m4 Zhongli
  { id: 'a_m4_1', name: 'Dragon Horns', type: 'accessory', subCategory: 'decoration', previewColor: '#f59e0b', compatibleWith: ['m4'] },
  { id: 'a_m4_2', name: 'Meteor', type: 'accessory', subCategory: 'decoration', previewColor: '#fbbf24', compatibleWith: ['m4'] },

  // p1 Paimon
  { id: 'a_p1_1', name: 'Halo', type: 'accessory', subCategory: 'decoration', previewColor: '#fbbf24', compatibleWith: ['p1'] },
  
  // 2D Templates (Using Unsplash Images)
  { id: 't1', name: '新闻主播', type: 'template', previewColor: '#3b82f6', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
  { id: 't2', name: '英语老师', type: 'template', previewColor: '#10b981', src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop' },
  { id: 't3', name: '虚拟偶像', type: 'template', previewColor: '#ec4899', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
];

// Helper Component for Voice Dropdowns
const VoiceDropdown = ({ label, value, options, onChange }: { label: string; value: string; options: { id: string; name: string; }[]; onChange: (v: string) => void; }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-white/60 pl-1">{label}</label>
    <div className="relative group">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] hover:bg-[#1a1a1a] border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white appearance-none focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-hover:text-white transition-colors" size={14} />
    </div>
  </div>
);

// Helper Slider Component
const VoiceSlider = ({ label, icon: Icon, value, min, max, onChange }: { label: string; icon?: any; value: number; min: number; max: number; onChange: (v: number) => void }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center px-1">
      <label className="text-xs font-bold text-white/60 flex items-center gap-1">
        {Icon && <Icon size={10} />}
        {label}
      </label>
      <span className="text-[10px] font-mono text-white/40">{value}</span>
    </div>
    <div className="relative h-2 flex items-center">
       <input 
         type="range" 
         min={min} max={max} 
         value={value} 
         onChange={(e) => onChange(parseInt(e.target.value))}
         className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/20 transition-colors z-10 focus:outline-none"
       />
       <div 
         className="absolute h-1 bg-white/30 rounded-l-lg pointer-events-none left-0" 
         style={{ width: `${((value - min) / (max - min)) * 100}%` }} 
       />
    </div>
  </div>
);

export default function Studio({ module, onChangeModule, lang, toggleLanguage, onBack, onOpenSettings, t }: StudioProps) {
  // --- States ---
  const [isMounted, setIsMounted] = useState(false);
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);
  
  // Control Panel
  // New Voice Config State
  const [voiceConfig, setVoiceConfig] = useState({
    lang: 'zh',
    genderFilter: 'all' as 'all' | 'male' | 'female',
    selectedVoice: 'gentle_sister',
    emotion: 'default',
    speed: 50,
    pitch: 50
  });

  const [isCallActive, setIsCallActive] = useState(false);
  
  // Voice Input State
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false); // Default Closed
  
  // 2D Audio Specific
  const [uploadedHistory, setUploadedHistory] = useState<Asset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // Audio playback state
  
  const generationTimerRef = useRef<number | null>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas
  const [baseModel, setBaseModel] = useState<string>('f1');
  const [accessory, setAccessory] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingModel, setPendingModel] = useState<string | null>(null);
  
  // 3D Canvas Controls
  const [canvasTransform, setCanvasTransform] = useState({ scale: 1, rotation: 0 });
  const [isRotating, setIsRotating] = useState(false); // Track if currently rotating via buttons
  const rotationRafRef = useRef<number | null>(null);

  // Asset Library
  // 3D Tabs: female, male, pet, mine
  // 2D Tabs: public, mine
  const [activeTab, setActiveTab] = useState<string>(module === '3d-avatar' ? 'female' : 'public');
  const [accessoryFilter, setAccessoryFilter] = useState<'all' | 'top' | 'bottom' | 'shoes' | 'decoration'>('all');
  const [savedAssets, setSavedAssets] = useState<Asset[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Voice Recognition Ref
  const recognitionRef = useRef<any>(null);

  // Map Feature Title from current module
  const featureTitle = useMemo(() => {
    switch (module) {
        case '2d-audio': return t.features[0];
        case '2d-chat': return t.features[1];
        case '2d-avatar': return t.features[2];
        case '3d-avatar': return t.features[3];
        default: return 'Studio';
    }
  }, [module, t.features]);

  // --- Effects ---
  
  // Trigger entry animations
  useEffect(() => {
    // Small delay to ensure CSS transitions trigger after render
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Reset state when module changes
    if (module === '2d-audio') {
      setBaseModel('t1');
      setActiveTab('public');
    } else if (module === '2d-chat') {
      setBaseModel('t1');
      setActiveTab('public');
    } else if (module === '2d-avatar') {
      setBaseModel('t1');
      setActiveTab('public');
    } else if (module === '3d-avatar') {
      setBaseModel('f1');
      setActiveTab('female');
    }
    setAccessory(null);
    setMessages([
        // Initial Dummy Message for visual
        { id: '0', role: 'assistant', text: lang === 'zh' ? '你好，我是你的数字助手。' : 'Hello, I am your digital assistant.', timestamp: Date.now() }
    ]);
    setIsCallActive(false);
    setIsGenerating(false);
    setIsPlaying(false);
    setInputValue('');
    setIsHistoryExpanded(false);
    setIsVoiceRecording(false);
    setCanvasTransform({ scale: 1, rotation: 0 });
    setIsRotating(false);
    setAccessoryFilter('all');
    setIsModuleMenuOpen(false); // Close menu on change
    
    // Clear timers
    if (generationTimerRef.current) clearTimeout(generationTimerRef.current);
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
  }, [module, lang]);

  // Voice Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = lang === 'zh' ? 'zh-CN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        // Only get final results to avoid jittery input updates
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
             setInputValue(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsVoiceRecording(false);
      };
      
      recognitionRef.current.onend = () => {
         // Optionally restart if supposed to be recording, but for now allow manual stop
      };
    }
  }, [lang]);

  useEffect(() => {
    if (isHistoryExpanded) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isHistoryExpanded]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Cleanup rotation raf on unmount
  useEffect(() => {
    return () => {
        if (rotationRafRef.current) {
            cancelAnimationFrame(rotationRafRef.current);
        }
        if (generationTimerRef.current) clearTimeout(generationTimerRef.current);
        if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
        if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // --- Handlers ---
  const handleCanvasTransform = (type: 'zoomIn' | 'zoomOut') => {
      setCanvasTransform(prev => {
          switch(type) {
              case 'zoomIn': return { ...prev, scale: Math.min(prev.scale + 0.1, 1.5) };
              case 'zoomOut': return { ...prev, scale: Math.max(prev.scale - 0.1, 0.5) };
              default: return prev;
          }
      });
  };

  const handleResetRotation = () => {
      setCanvasTransform(prev => ({ ...prev, rotation: 0 }));
  };

  const startRotation = (direction: 'left' | 'right', e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault(); // Prevent default behavior to avoid double firing (mouse + touch)
    stopRotation(); // Ensure clear before start
    
    setIsRotating(true); // Disable transition for instant updates

    const rotate = () => {
        setCanvasTransform(prev => ({ 
            ...prev, 
            rotation: prev.rotation + (direction === 'left' ? -2 : 2) // 2 degrees per frame @ 60fps ~ 120deg/s
        }));
        rotationRafRef.current = requestAnimationFrame(rotate);
    };
    
    rotate();
  };

  const stopRotation = () => {
    setIsRotating(false); // Re-enable transition for smooth settling
    if (rotationRafRef.current) {
        cancelAnimationFrame(rotationRafRef.current);
        rotationRafRef.current = null;
    }
  };

  const handleAssetClick = (asset: Asset) => {
    if (module === '3d-avatar') {
      if (asset.type === 'base') {
        // If switching base model and we have accessories, warn user
        if (accessory && asset.id !== baseModel) {
          setPendingModel(asset.id);
          setShowConfirmDialog(true);
        } else {
          setBaseModel(asset.id);
        }
      } else if (asset.type === 'accessory') {
        setAccessory(asset.id === accessory ? null : asset.id);
      } else if (asset.type === 'snapshot') {
        // Restore saved state
        if (asset.state) {
           setBaseModel(asset.state.baseModel);
           setAccessory(asset.state.accessory);
        }
      }
    } else {
      // 2D logic
      setBaseModel(asset.id);
    }
  };

  const confirmModelChange = () => {
    if (pendingModel) {
      setBaseModel(pendingModel);
      setAccessory(null); // Clear accessory on base change
    }
    setShowConfirmDialog(false);
    setPendingModel(null);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    
    setIsTyping(true);
    setIsHistoryExpanded(true); // Auto expand on send
    
    setTimeout(() => {
      const responseMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: lang === 'zh' ? "收到指令，正在处理..." : "Received. Processing...",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, responseMsg]);
      setIsTyping(false);
      
      // Trigger Visuals for Audio Reply
      if (!isCallActive && !isPlaying) {
          setIsPlaying(true);
          // Simulate 4s audio clip
          if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
          playbackTimerRef.current = setTimeout(() => {
              setIsPlaying(false);
          }, 4000);
      }

    }, 1500);
  };

  // Voice Input Handlers
  const toggleVoiceRecording = () => {
    if (isVoiceRecording) {
      recognitionRef.current?.stop();
      setIsVoiceRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsVoiceRecording(true);
    }
  };

  const cancelVoiceRecording = () => {
    recognitionRef.current?.stop();
    setIsVoiceRecording(false);
  };

  const handleSaveState = () => {
    if (module === '3d-avatar') {
      const currentBase = ASSETS.find(a => a.id === baseModel);
      const currentAcc = ASSETS.find(a => a.id === accessory);
      
      const newSnapshot: Asset = {
        id: `snap-${Date.now()}`,
        name: `Custom ${currentBase?.name.split(' ')[0] || 'Avatar'}`,
        type: 'snapshot',
        previewColor: currentBase?.previewColor || '#555',
        state: {
          baseModel: baseModel,
          accessory: accessory
        }
      };
      setSavedAssets(prev => [newSnapshot, ...prev]);
    } else {
      // 2D Save
      const newAsset: Asset = {
        id: `saved-${Date.now()}`,
        name: `Save ${new Date().toLocaleTimeString()}`,
        type: 'template',
        previewColor: '#4f46e5'
      };
      setSavedAssets(prev => [newAsset, ...prev]);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      const newAsset: Asset = {
        id: `upload-${Date.now()}`,
        name: file.name,
        type: 'upload',
        src: url,
        mediaType: isVideo ? 'video' : 'image',
        previewColor: '#555'
      };
      setUploadedHistory(prev => [newAsset, ...prev]);
      setBaseModel(newAsset.id);
      if (module === '2d-audio') setActiveTab('mine');
    }
  };

  const handleStop = () => {
    if (generationTimerRef.current) clearTimeout(generationTimerRef.current);
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    setIsGenerating(false);
    setIsPlaying(false);
  };

  const handleGenerate = () => {
    if (isGenerating || isPlaying) {
        handleStop();
        return;
    }

    setIsGenerating(true);
    
    // Add command to history if using 2d audio
    if (module === '2d-audio' && inputValue.trim()) {
       setMessages(prev => [...prev, {
         id: Date.now().toString(),
         role: 'user',
         text: inputValue,
         timestamp: Date.now()
       }]);
       setInputValue('');
    }

    // Clear previous timers just in case
    if (generationTimerRef.current) clearTimeout(generationTimerRef.current);
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);

    // Simulate generation delay
    generationTimerRef.current = setTimeout(() => {
      setIsGenerating(false);
      setIsPlaying(true);
      
      // Auto-stop playback after some time (simulating audio duration)
      playbackTimerRef.current = setTimeout(() => {
          setIsPlaying(false);
      }, 5000);
    }, 3000);
  };

  // --- Render Helpers ---
  const isSpeaking = isPlaying || isCallActive; // Updated Logic: Speaking is active during 2D Playback OR Real-time Call
  const shouldMoveUp = isCallActive || isGenerating || isPlaying; // Move card up if any activity

  // Filter Voices
  const filteredVoices = useMemo(() => {
      return VOICE_PRESETS.filter(voice => {
          if (voiceConfig.genderFilter === 'all') return true;
          return voice.gender === voiceConfig.genderFilter;
      });
  }, [voiceConfig.genderFilter]);

  const render3dCanvas = () => {
    const model = ASSETS.find(a => a.id === baseModel);
    const acc = ASSETS.find(a => a.id === accessory);
    
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8 perspective-[1000px]">
        {/* Wrapper for Translation to avoid conflict with 3D Transforms */}
        <div className={`relative transition-transform duration-500 z-10 ${shouldMoveUp ? '-translate-y-24' : 'translate-y-0'}`}>
            {/* Card Container with Glow Effect and Transform Control */}
            <div className={`w-[85vw] max-w-[300px] aspect-[3/5] max-h-[60vh] rounded-2xl flex items-center justify-center border-2 border-white overflow-hidden backdrop-blur-md group transform-style-3d ${isSpeaking ? 'scale-105' : ''}`}
                 style={{ 
                    background: `linear-gradient(to bottom, ${model?.previewColor || '#444'}80, #0f0f0f80)`,
                    boxShadow: isSpeaking ? 'none' : '0 0 25px rgba(255,255,255,0.2)',
                    animation: isSpeaking ? 'talking-glow 0.8s infinite' : 'none',
                    // APPLY TRANSFORM HERE
                    // Dynamic transition: none when rotating manually to avoid lag, else smooth
                    transition: isRotating ? 'none' : 'all 0.3s ease',
                    transform: `scale(${canvasTransform.scale}) rotateY(${canvasTransform.rotation}deg)`
                 }}
            >
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                {/* 3D Content in Card */}
                <div className="relative z-20 flex flex-col items-center gap-8 transform-style-3d">
                    
                    {/* Avatar Composition */}
                    <div className="relative transform-style-3d animate-bounce" style={{ animationDuration: '4s' }}>
                         {/* Accessory */}
                         {acc && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse">
                                 {acc.name.includes('Mask') ? <Ghost size={24} style={{ color: acc.previewColor }} /> :
                                  acc.name.includes('Horn') ? <Moon size={24} style={{ color: acc.previewColor }} /> :
                                  acc.name.includes('Leaf') ? <Flower size={24} style={{ color: acc.previewColor }} /> :
                                  <Zap size={24} style={{ color: acc.previewColor }} />}
                            </div>
                         )}

                         {/* Main Avatar Icon */}
                         <div className="relative z-10 drop-shadow-2xl">
                            {model?.category === 'female' ? (
                                <User size={100} className="text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                            ) : model?.category === 'male' ? (
                                <User size={100} className="text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                            ) : (
                                <Cat size={80} className="text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                            )}
                         </div>
                    </div>

                    {/* Text Info */}
                    <div className="text-center px-6">
                        <h3 className="text-2xl font-bold text-white drop-shadow-md">{model?.name}</h3>
                        <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">3D Avatar Model</p>
                    </div>
                </div>

                {/* Particles inside card */}
                <div className="absolute inset-0 pointer-events-none">
                     {[1,2,3,4].map(i => (
                        <div 
                            key={i}
                            className="absolute w-1 h-1 bg-white/40 rounded-full blur-[1px] animate-pulse"
                            style={{
                                top: `${20 + Math.random() * 60}%`,
                                left: `${20 + Math.random() * 60}%`,
                                animationDelay: `${i * 0.5}s`
                            }}
                        />
                     ))}
                </div>
            </div>

            {/* Audio Visualizer (Attached to Moving Container, centered below) */}
            {/* Pass scale to adjust overlap dynamics */}
            <CallVisualizer active={isCallActive} scale={canvasTransform.scale} />
        </div>
        
        {/* Canvas Controls Overlay (Independent of Scale/Rotate) */}
        <div className="absolute bottom-8 right-8 z-50 flex gap-2">
           <div className="bg-black/50 backdrop-blur-md rounded-lg p-1.5 flex flex-col gap-1 border border-white/10 shadow-lg">
              <button onClick={() => handleCanvasTransform('zoomIn')} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors" title="Zoom In"><ZoomIn size={16}/></button>
              <button onClick={() => handleCanvasTransform('zoomOut')} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors" title="Zoom Out"><ZoomOut size={16}/></button>
           </div>
           <div className="bg-black/50 backdrop-blur-md rounded-lg p-1.5 flex flex-col gap-1 border border-white/10 shadow-lg">
              <button 
                onMouseDown={(e) => startRotation('left', e)} 
                onMouseUp={stopRotation} 
                onMouseLeave={stopRotation}
                onTouchStart={(e) => startRotation('left', e)}
                onTouchEnd={stopRotation}
                onContextMenu={(e) => e.preventDefault()}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors" 
                title="Rotate Left"
              >
                <RotateCcw size={16}/>
              </button>
              <button 
                onClick={handleResetRotation}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors" 
                title="Reset Rotation"
              >
                <RefreshCcw size={16}/>
              </button>
              <button 
                onMouseDown={(e) => startRotation('right', e)} 
                onMouseUp={stopRotation} 
                onMouseLeave={stopRotation}
                onTouchStart={(e) => startRotation('right', e)}
                onTouchEnd={stopRotation}
                onContextMenu={(e) => e.preventDefault()}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors" 
                title="Rotate Right"
              >
                <RotateCw size={16}/>
              </button>
           </div>
        </div>
        
        {/* Loading Indicator Below Card */}
        {isGenerating && (
            <div className="absolute top-1/2 mt-[240px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300 z-20">
               <RainbowLoader size={48} />
               <span className="text-xs text-white/60 tracking-widest uppercase font-medium">{t.studio.controls.generating}</span>
            </div>
        )}

      </div>
    );
  };

  const render2dCanvas = () => {
    const currentAsset = [...ASSETS, ...uploadedHistory, ...savedAssets].find(a => a.id === baseModel);
    
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
        {/* Card Container with Glow Effect */}
        <div className={`relative w-auto h-auto flex items-center justify-center transition-all duration-500 ${shouldMoveUp ? '-translate-y-24' : 'translate-y-0'} ${isSpeaking ? 'scale-105' : ''}`}>
           {currentAsset?.src ? (
             <div 
                className="w-[85vw] max-w-[300px] aspect-[3/5] max-h-[60vh] rounded-2xl overflow-hidden shadow-2xl relative z-10 border-2 border-white"
                style={{
                  boxShadow: isSpeaking ? 'none' : '0 0 25px rgba(255,255,255,0.2)',
                  animation: isSpeaking ? 'talking-glow 0.8s infinite' : 'none'
                }}
             >
                 {currentAsset.mediaType === 'video' ? (
                    <video src={currentAsset.src} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                 ) : (
                    <img src={currentAsset.src} alt="avatar" className="w-full h-full object-cover" />
                 )}
             </div>
           ) : (
             <div 
                className="w-[85vw] max-w-[300px] aspect-[3/5] max-h-[60vh] rounded-2xl flex items-center justify-center transition-colors duration-500 relative z-10 shadow-2xl border-2 border-white overflow-hidden backdrop-blur-md" 
                style={{ 
                    background: `linear-gradient(to bottom, ${currentAsset?.previewColor || '#444'}80, #0f0f0f80)`,
                    boxShadow: isSpeaking ? 'none' : '0 0 25px rgba(255,255,255,0.2)',
                    animation: isSpeaking ? 'talking-glow 0.8s infinite' : 'none'
                }}
             >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="relative z-20 flex flex-col items-center gap-6">
                    <span className="text-7xl select-none filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-in zoom-in duration-500">
                        {currentAsset?.id.startsWith('t') ? '👨‍💼' : '🤖'}
                    </span>
                    <div className="text-center px-6">
                        <h3 className="text-2xl font-bold text-white drop-shadow-md">{currentAsset?.name}</h3>
                        <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">AI Template</p>
                    </div>
                </div>
             </div>
           )}

           {/* Call Effects */}
           {isSpeaking && (
              <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute -inset-4 bg-green-500/20 rounded-[2rem] animate-pulse blur-xl" />
              </div>
           )}

           {/* Audio Visualizer (Attached to Moving Container) */}
           <CallVisualizer active={isCallActive} />
        </div>

        {/* Loading Indicator Below Card */}
        {isGenerating && (
            <div className="absolute top-1/2 mt-[240px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300 z-20">
               <RainbowLoader size={48} />
               <span className="text-xs text-white/60 tracking-widest uppercase font-medium">{t.studio.controls.generating}</span>
            </div>
        )}
      </div>
    );
  }

  // 3D Tab Helper
  const get3DTabs = () => ['female', 'male', 'pet', 'mine'] as const;

  // Added Custom CSS for the button
  const buttonStyle = `
    .fancy-button {
      /* Theme Variables - Default (Yellow/Lime) */
      --bg-1: #ddff00;
      --bg-2: #b7ff00;
      --shadow-color: rgba(187, 255, 0, 0.4);
    
      position: relative;
      padding: 0; /* Handled by flex container */
      font-size: 18px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #1a1a1a;
      background: linear-gradient(135deg, var(--bg-1), var(--bg-2));
      border: none;
      border-radius: 12px;
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap;
      
      /* Simplified Transition - No complex physics/perspective */
      transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
      
      box-shadow: 0 4px 12px var(--shadow-color);
      outline: none;
      z-index: 1;
    }

    /* Green Variant (Voice Call) */
    .fancy-button.green {
      --bg-1: #4ade80; /* green-400 */
      --bg-2: #22c55e; /* green-500 */
      --shadow-color: rgba(34, 197, 94, 0.4);
    }

    /* Red Variant (End Call / Stop) */
    .fancy-button.red {
      --bg-1: #f87171; /* red-400 */
      --bg-2: #ef4444; /* red-500 */
      --shadow-color: rgba(239, 68, 68, 0.4);
    }

    /* Hover State - Simple Lift & Brightness */
    .fancy-button:hover {
      transform: translateY(-2px);
      filter: brightness(1.1);
      box-shadow: 0 8px 20px var(--shadow-color);
    }

    /* Active State - Press down */
    .fancy-button:active {
      transform: translateY(0) scale(0.98);
      filter: brightness(0.95);
      box-shadow: 0 2px 8px var(--shadow-color);
    }
    
    .fancy-button:disabled {
      background: linear-gradient(135deg, #555, #333);
      color: #777;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
      filter: grayscale(1);
    }

    .fancy-button span {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      height: 100%;
    }

    @keyframes talking-glow {
      0% { box-shadow: 0 0 10px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.1); }
      50% { box-shadow: 0 0 25px rgba(255,255,255,0.5), 0 0 50px rgba(255,255,255,0.3); }
      100% { box-shadow: 0 0 10px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.1); }
    }
  `;

  return (
    <div className="w-full h-full flex flex-col relative z-10 bg-transparent">
      
      {/* Inject Style for Button and Animation */}
      <style>{buttonStyle}</style>

      {/* 
        TRANSITION OVERLAY 
        mimics the final state of the Landing Page expansion (bg-[#191919]/40 + blur)
        and fades out to reveal the studio.
      */}
      <div 
        className={`absolute inset-0 z-[100] bg-[#191919]/40 backdrop-blur-xl pointer-events-none transition-opacity duration-700 ease-in-out ${isMounted ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Top Bar - Slide Down */}
      <div className={`h-16 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 z-30 shrink-0 transition-all duration-700 delay-100 ${isMounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
              <ArrowLeft size={18} />
            </button>
            
            {/* Feature Selector Dropdown */}
            <div className="relative">
               <button 
                 onClick={() => setIsModuleMenuOpen(!isModuleMenuOpen)}
                 className="flex items-center gap-2 text-base font-bold text-white hover:text-white/80 transition-colors group tracking-wide"
               >
                 {featureTitle}
                 <ChevronDown size={16} className={`text-white/60 transition-transform duration-200 ${isModuleMenuOpen ? 'rotate-180' : ''}`} />
               </button>

               {isModuleMenuOpen && (
                 <>
                   {/* Backdrop for click outside */}
                   <div className="fixed inset-0 z-40" onClick={() => setIsModuleMenuOpen(false)} />
                   
                   {/* Dropdown Menu */}
                   <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left flex flex-col p-1">
                      {['2d-audio', '2d-chat', '2d-avatar', '3d-avatar'].map((key, index) => (
                        <button
                          key={key}
                          onClick={() => {
                            onChangeModule(key as AppModule);
                            setIsModuleMenuOpen(false);
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left group ${module === key ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                        >
                          <div className="flex items-center gap-3">
                             {index === 0 && <Mic size={14} />}
                             {index === 1 && <MessageSquare size={14} />}
                             {index === 2 && <Ghost size={14} />}
                             {index === 3 && <Box size={14} />}
                             {t.features[index]}
                          </div>
                          {module === key && <Check size={12} className="text-green-400" />}
                        </button>
                      ))}
                   </div>
                 </>
               )}
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded-full border border-white/5">
                 <Globe size={12} />
                 <span>{lang === 'zh' ? '中文' : 'EN'}</span>
            </button>

            <button 
              onClick={handleSaveState}
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs font-medium text-white transition-colors border border-white/5 flex items-center gap-2"
            >
              <Save size={14} />
              {t.studio.nav.saveSettings}
            </button>
         </div>
      </div>

      {/* Main Layout - Modified for Mobile Responsiveness (flex-col on mobile) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* --- Left Panel: Controls & Chat --- */}
        <div className={`w-full md:w-80 border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col z-20 relative shadow-xl transition-all duration-700 delay-200 order-2 md:order-1 ${isMounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'} h-1/3 md:h-full`}>
           
           {/* 1. Header Section: Voice & Config */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
               {/* Language */}
               <VoiceDropdown 
                   label={t.studio.controls.voiceLangLabel} 
                   value={voiceConfig.lang} 
                   options={VOICE_LANGUAGES} 
                   onChange={(v) => setVoiceConfig(prev => ({...prev, lang: v}))} 
               />
               
               {/* Gender Filters */}
               <div className="space-y-1.5">
                   <label className="text-xs font-bold text-white/60 pl-1">{t.studio.controls.voiceGenderLabel}</label>
                   <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
                       {['all', 'male', 'female'].map((g) => (
                           <button 
                               key={g} 
                               onClick={() => setVoiceConfig(prev => ({...prev, genderFilter: g as any}))}
                               className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${voiceConfig.genderFilter === g ? 'bg-white text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
                           >
                               {t.studio.controls.voiceFilters[g as keyof typeof t.studio.controls.voiceFilters]}
                           </button>
                       ))}
                   </div>
               </div>

               {/* Voice Library (Visual Grid) */}
               <div className="space-y-1.5">
                   <label className="text-xs font-bold text-white/60 pl-1">{t.studio.controls.voiceSelectLabel}</label>
                   <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                       {filteredVoices.map(voice => (
                           <div 
                               key={voice.id}
                               onClick={() => setVoiceConfig(prev => ({...prev, selectedVoice: voice.id}))}
                               className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all ${voiceConfig.selectedVoice === voice.id ? 'bg-white/10 border-white/40' : 'bg-[#111] border-white/5 hover:border-white/20'}`}
                           >
                               <div 
                                   className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner"
                                   style={{ backgroundColor: voice.color }}
                               >
                                   <User size={14} className="text-black/50" />
                               </div>
                               <div className="overflow-hidden">
                                   <div className={`text-xs font-medium truncate ${voiceConfig.selectedVoice === voice.id ? 'text-white' : 'text-white/70'}`}>{voice.name}</div>
                               </div>
                               {voiceConfig.selectedVoice === voice.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]" />}
                           </div>
                       ))}
                       {filteredVoices.length === 0 && (
                           <div className="col-span-2 py-4 text-center text-xs text-white/30 italic">No voices found</div>
                       )}
                   </div>
               </div>
               
               {/* Emotion */}
               <VoiceDropdown 
                   label={t.studio.controls.voiceEmotionLabel} 
                   value={voiceConfig.emotion} 
                   options={VOICE_EMOTIONS} 
                   onChange={(v) => setVoiceConfig(prev => ({...prev, emotion: v}))} 
               />

               {/* Sliders (Speed & Pitch) */}
               <div className="space-y-3 pt-1 border-t border-white/5">
                   <VoiceSlider 
                       label={t.studio.controls.voiceSpeedLabel} 
                       icon={Gauge}
                       value={voiceConfig.speed} 
                       min={0} max={100} 
                       onChange={(v) => setVoiceConfig(prev => ({...prev, speed: v}))} 
                   />
                   <VoiceSlider 
                       label={t.studio.controls.voicePitchLabel} 
                       icon={Volume2}
                       value={voiceConfig.pitch} 
                       min={0} max={100} 
                       onChange={(v) => setVoiceConfig(prev => ({...prev, pitch: v}))} 
                   />
               </div>

               {/* 2D Audio Image Upload (Only here) */}
               {module === '2d-audio' && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                     <label className="text-sm font-bold text-white uppercase tracking-widest block">
                        {t.studio.controls.refImage}
                     </label>
                     <div className="flex gap-2 h-16">
                        <div onClick={() => fileInputRef.current?.click()} className="w-16 h-full shrink-0 rounded-lg border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all group">
                           <Upload size={14} className="text-white/30 group-hover:text-white" />
                           <span className="text-[8px] text-white/30 group-hover:text-white/50">{t.studio.controls.upload}</span>
                           <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleUpload} />
                        </div>
                        <div className="flex-1 overflow-x-auto flex gap-2 custom-scrollbar items-center">
                           {uploadedHistory.map((asset) => (
                             <div key={asset.id} onClick={() => setBaseModel(asset.id)} className={`w-16 h-full shrink-0 rounded-lg overflow-hidden cursor-pointer border relative bg-black ${baseModel === asset.id ? 'border-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'border-white/5'}`}>
                               {asset.mediaType === 'video' ? (
                                 <video src={asset.src} className="w-full h-full object-cover opacity-80" muted />
                               ) : (
                                 <img src={asset.src} alt="" className="w-full h-full object-cover" />
                               )}
                               {asset.mediaType === 'video' && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Video size={12} className="text-white drop-shadow-md" /></div>}
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
           </div>

           {/* Bottom Controls Group (Fixed at bottom) */}
           <div className="bg-black/20 border-t border-white/5 flex flex-col relative z-20 shrink-0">
               
               {/* 1. History Section */}
               <div className="flex flex-col border-b border-white/5 bg-transparent">
                   {/* Header Toggle */}
                   <div 
                     onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                     className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors select-none"
                   >
                      <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                         <History size={12} />
                         {t.studio.controls.history}
                      </div>
                      <ChevronDown size={12} className={`text-white/40 transition-transform duration-300 ${isHistoryExpanded ? '' : 'rotate-180'}`} />
                   </div>
                   
                   {/* Content */}
                   {isHistoryExpanded && (
                     <div className="h-48 overflow-y-auto p-4 space-y-3 custom-scrollbar border-t border-white/5 bg-black/40 backdrop-blur-md">
                        {messages.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-white/20 gap-2">
                             <MessageSquare size={20} />
                             <p className="text-[10px]">No history</p>
                          </div>
                        )}
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[90%] p-2.5 rounded-xl text-xs leading-relaxed ${
                               msg.role === 'user' 
                                 ? 'bg-indigo-600 text-white rounded-tr-none' 
                                 : 'bg-[#222] text-gray-300 border border-white/5 rounded-tl-none'
                             }`}>
                                {msg.text}
                             </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                     </div>
                   )}
               </div>

               {/* 2. Input Bar (Textarea + Icons) */}
               <div className="p-4 pb-2 space-y-3 relative">
                  {/* Voice Input Card Overlay (Positioned Absolute Above) */}
                  {isVoiceRecording && (
                     <div className="absolute bottom-full right-4 mb-2 z-50">
                        <VoiceCard onCancel={cancelVoiceRecording} />
                     </div>
                  )}

                  <div className="relative flex items-end bg-black/20 border border-white/10 rounded-xl px-2 py-1 focus-within:border-white/30 transition-colors">
                      {/* Text Input */}
                      <textarea
                        ref={textareaRef}
                        rows={1}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (module !== '2d-audio' && e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder={module === '2d-audio' ? t.studio.controls.drivePlaceholder : t.studio.controls.chatPlaceholder}
                        className="flex-1 bg-transparent border-none text-xs text-white placeholder:text-white/20 px-2 focus:outline-none resize-none py-2 max-h-32 min-h-[32px] custom-scrollbar"
                      />
                      
                      {/* Right Side Icons */}
                      <div className="flex items-center gap-1 mb-0.5 pb-1">
                          {/* Mic (Toggle Record) - Modified Logic */}
                          <button
                            onClick={toggleVoiceRecording}
                            className={`p-1.5 rounded-lg transition-all ${isVoiceRecording ? 'bg-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                            title={t.studio.controls.voiceInput}
                          >
                            {isVoiceRecording ? <Square fill="currentColor" size={16} /> : <Mic size={16} />}
                          </button>

                          {/* Send Button (Hidden for 2D Audio) */}
                          {module !== '2d-audio' && (
                            <button 
                              onClick={handleSendMessage} 
                              disabled={!inputValue.trim()}
                              className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:bg-transparent disabled:text-gray-500 transition-colors"
                            >
                              <Send size={14} />
                            </button>
                          )}
                      </div>
                  </div>
               </div>

               {/* 3. Action Button (Bottom-most) */}
               <div className="px-4 pb-4">
                  {(module === '2d-chat' || module === '3d-avatar' || module === '2d-avatar') ? (
                      <button 
                         onClick={() => setIsCallActive(!isCallActive)} 
                         className={`fancy-button ${isCallActive ? 'red' : 'green'} w-full h-12 flex items-center justify-center`}
                      >
                         <span className="text-base font-bold">
                           {isCallActive ? <PhoneOff size={18} /> : <Phone size={18} />}
                           {isCallActive ? t.studio.controls.endCall : t.studio.controls.voiceCall}
                         </span>
                      </button>
                  ) : (
                      <button 
                        onClick={handleGenerate} 
                        disabled={(!inputValue.trim() && module === '2d-audio' && !isGenerating && !isPlaying)} 
                        className={`fancy-button ${isGenerating || isPlaying ? 'red' : ''} w-full h-12 flex items-center justify-center`}
                      >
                         <span className="text-base font-bold">
                             {(isGenerating || isPlaying) ? <SquareIcon size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                             {(isGenerating || isPlaying) ? t.studio.controls.cancelVoice : t.studio.controls.generate}
                         </span>
                      </button>
                  )}
               </div>

           </div>

        </div>

        {/* --- Center: Canvas - Fade & Zoom In --- */}
        <div className={`flex-1 relative bg-black/10 backdrop-blur-sm overflow-hidden flex items-center justify-center transition-all duration-1000 delay-300 order-1 md:order-2 ${isMounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} min-h-[40vh]`}>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
           
           {module === '3d-avatar' ? render3dCanvas() : render2dCanvas()}

           {/* Confirm Dialog */}
           {showConfirmDialog && (
             <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-[#1a1a1a] border border-red-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                   <div className="flex items-center gap-3 text-red-400 mb-4">
                      <AlertTriangle size={24} />
                      <h3 className="text-lg font-bold">{t.studio.dialog.title}</h3>
                   </div>
                   <p className="text-gray-400 mb-6 text-sm">{t.studio.dialog.desc}</p>
                   <div className="flex gap-3">
                      <button onClick={() => setShowConfirmDialog(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">{t.studio.dialog.cancel}</button>
                      <button onClick={confirmModelChange} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium text-white transition-colors">{t.studio.dialog.confirm}</button>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* --- Right: Asset Library - Slide in from Right --- */}
        <div className={`w-full md:w-80 border-l border-white/10 bg-black/50 backdrop-blur-xl flex flex-col z-20 transition-all duration-700 delay-200 order-3 md:order-3 ${isMounted ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'} h-1/3 md:h-full`}>
           {/* Tabs */}
           <div className="flex items-center px-6 pt-6 mb-4 border-b border-white/10 overflow-x-auto no-scrollbar">
              {module === '3d-avatar' ? (
                get3DTabs().map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 px-3 text-xs font-bold uppercase transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'text-white border-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-white/40 border-transparent hover:text-white'}`}>
                    {t.studio.assets.tabs[tab]}
                  </button>
                ))
              ) : (
                 <>
                  <button onClick={() => setActiveTab('public')} className={`pb-3 px-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'public' ? 'text-white border-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-white/40 border-transparent hover:text-white'}`}>{t.studio.assets.tabs.public}</button>
                  <button onClick={() => setActiveTab('mine')} className={`pb-3 px-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'mine' ? 'text-white border-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-white/40 border-transparent hover:text-white'}`}>{t.studio.assets.tabs.mine}</button>
                 </>
              )}
           </div>

           {/* Grid */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2">
                 
                 {/* 3D Content */}
                 {module === '3d-avatar' && (
                   <div className="space-y-6">
                      
                      {/* Mine Tab: Show Saved Snapshots */}
                      {activeTab === 'mine' ? (
                        <div className="space-y-3">
                           <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider">
                             <Save size={12} />
                             {t.studio.assets.tabs.mine}
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              {savedAssets.filter(a => a.type === 'snapshot').map(asset => (
                                <div key={asset.id} onClick={() => handleAssetClick(asset)} className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border flex flex-col bg-[#111] group hover:border-white/30 transition-all border-white/5">
                                   <div className="flex-1 flex items-center justify-center bg-white/5 relative">
                                      <Crown size={24} className="text-yellow-500" />
                                   </div>
                                   <div className="p-3 bg-[#151515]">
                                     <p className="text-[10px] font-medium text-gray-300 text-center truncate">{asset.name}</p>
                                    </div>
                                  </div>
                              ))}
                              {savedAssets.filter(a => a.type === 'snapshot').length === 0 && (
                                <div className="col-span-2 text-center text-xs text-white/20 py-4 italic border border-dashed border-white/10 rounded">No saved avatars</div>
                              )}
                           </div>
                        </div>
                      ) : (
                        <>
                          {/* Standard Categories: Models */}
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider">
                               <User size={12} />
                               {t.studio.assets.models}
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                               {ASSETS.filter(a => a.type === 'base' && a.category === activeTab).map(asset => (
                                  <div 
                                    key={asset.id} 
                                    onClick={() => handleAssetClick(asset)}
                                    className={`aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border flex flex-col bg-[#111] group hover:border-white/30 transition-all ${baseModel === asset.id ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-white/5'}`}
                                  >
                                    <div className="flex-1 flex items-center justify-center bg-white/5 relative overflow-hidden">
                                      {/* Placeholder Visuals */}
                                      {asset.category === 'female' ? <Sparkles size={32} className="text-pink-400" /> : 
                                       asset.category === 'male' ? <Sword size={32} className="text-blue-400" /> : 
                                       <Cat size={32} className="text-orange-400" />}
                                    </div>
                                    <div className="p-3 bg-[#151515]">
                                      <p className="text-[10px] font-medium text-gray-300 text-center truncate">{asset.name}</p>
                                    </div>
                                  </div>
                               ))}
                             </div>
                          </div>

                          {/* Accessories: Filtered by Compatibility */}
                          {/* Only show if activeTab is not 'mine' and baseModel is set */}
                          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider">
                                  <Glasses size={12} />
                                  {t.studio.assets.accessories}
                                </div>
                             </div>

                             {/* Accessory Filters (Tops, Bottoms, etc.) */}
                             <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                {[
                                  { id: 'all', label: '全部', icon: null },
                                  { id: 'top', label: '上衣', icon: Shirt },
                                  { id: 'bottom', label: '下衣', icon: Scissors }, // Scissors abstract for cut/pants
                                  { id: 'shoes', label: '鞋子', icon: Footprints },
                                  { id: 'decoration', label: '配饰', icon: Glasses },
                                ].map((cat) => (
                                   <button 
                                      key={cat.id}
                                      onClick={() => setAccessoryFilter(cat.id as any)}
                                      className={`px-2.5 py-1.5 rounded-full text-[10px] font-medium border transition-all flex items-center gap-1 whitespace-nowrap ${
                                        accessoryFilter === cat.id 
                                        ? 'bg-white text-black border-white' 
                                        : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10 hover:text-white'
                                      }`}
                                   >
                                      {cat.icon && <cat.icon size={10} />}
                                      {cat.label}
                                   </button>
                                ))}
                             </div>
                             
                             {/* Filter Accessories: Must be type accessory AND compatibleWith includes current baseModel AND match subCategory */}
                             <div className="grid grid-cols-3 gap-3">
                               {ASSETS.filter(a => 
                                  a.type === 'accessory' && 
                                  a.compatibleWith?.includes(baseModel) &&
                                  (accessoryFilter === 'all' || a.subCategory === accessoryFilter)
                               ).map(asset => (
                                  <div 
                                    key={asset.id} 
                                    onClick={() => handleAssetClick(asset)}
                                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer border flex flex-col bg-[#111] group hover:border-white/30 transition-all ${accessory === asset.id ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-white/5'}`}
                                  >
                                    <div className="flex-1 flex items-center justify-center bg-white/5 relative">
                                      {/* Icon Variety based on name logic for demo */}
                                      {asset.name.includes('Mask') ? <Ghost size={20} style={{ color: asset.previewColor }} /> :
                                       asset.name.includes('Horn') ? <Moon size={20} style={{ color: asset.previewColor }} /> :
                                       asset.name.includes('Leaf') ? <Flower size={20} style={{ color: asset.previewColor }} /> :
                                       <Zap size={20} style={{ color: asset.previewColor }} />}
                                    </div>
                                    <div className="p-2 bg-[#151515]">
                                      <p className="text-[9px] font-medium text-gray-400 text-center truncate">{asset.name}</p>
                                    </div>
                                  </div>
                               ))}
                               {/* Empty State */}
                               {ASSETS.filter(a => a.type === 'accessory' && a.compatibleWith?.includes(baseModel)).length === 0 && (
                                 <div className="col-span-3 text-center py-4 text-xs text-white/20 italic">
                                   No accessories for this model
                                 </div>
                               )}
                             </div>
                          </div>
                        </>
                      )}
                   </div>
                 )}

                 {/* 2D Content */}
                 {module !== '3d-avatar' && (
                    <div className="grid grid-cols-2 gap-4">
                      {activeTab === 'mine' && (
                          <>
                            {uploadedHistory.map(asset => (
                              <div key={asset.id} onClick={() => setBaseModel(asset.id)} className={`aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border flex flex-col bg-[#111] group hover:border-white/30 transition-all ${baseModel === asset.id ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-white/5'}`}>
                                <img src={asset.src} className="w-full h-full object-cover" />
                                <div className="p-3 bg-[#151515]"><p className="text-[10px] text-white/80 truncate text-center">{asset.name}</p></div>
                              </div>
                            ))}
                          </>
                      )}
                      {activeTab === 'public' && ASSETS.filter(a => a.type === 'template').map(asset => (
                          <div key={asset.id} onClick={() => setBaseModel(asset.id)} className={`aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border flex flex-col bg-[#111] group hover:border-white/30 transition-all ${baseModel === asset.id ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-white/5'}`}>
                             {/* Display Image if SRC exists */}
                             {asset.src ? (
                                <img src={asset.src} alt={asset.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                             ) : (
                                <div className="flex-1 flex items-center justify-center bg-white/5"><Shirt size={32} className="text-white/50" /></div>
                             )}
                             <div className="p-3 bg-[#151515]"><p className="text-[10px] text-white/80 truncate text-center">{asset.name}</p></div>
                          </div>
                      ))}
                    </div>
                 )}
           </div>
        </div>

      </div>
    </div>
  );
}