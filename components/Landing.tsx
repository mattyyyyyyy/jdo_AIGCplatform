import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { Mic, MessageSquare, Box, Globe, Ghost } from 'lucide-react';
import { AppModule } from '../types';
import GlassCard3D from './GlassCard3D';

interface LandingProps {
  onSelectModule: (module: AppModule) => void;
  lang: 'zh' | 'en';
  toggleLanguage: () => void;
  t: any;
}

const JDOLogo = memo(() => (
  <svg 
    width="106" 
    height="32" 
    viewBox="0 0 106 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
    aria-label="JDO Logo"
  >
    <defs>
      <mask id="bean-cutout">
        <rect width="32" height="32" fill="white" />
        <path 
          d="M17 9C21.5 9 25 12.5 25 17C25 21.5 21.5 25 17 25C14.5 25 12.5 22.5 11.5 20.5C10.5 18.5 12.5 17 14 17C15.5 17 16.5 18 16.5 19C16.5 19.5 16.2 20 16 20.5C17 21 19 20.5 20 18.5C21 16.5 20 14.5 18 13.5C16 12.5 14 13.5 13 14.5C11 12.5 12.5 9 17 9Z" 
          fill="black" 
        />
      </mask>
    </defs>
    <circle cx="16" cy="16" r="16" fill="white" mask="url(#bean-cutout)" />
    <text 
      x="40" 
      y="24" 
      fontFamily="'Noto Sans SC', sans-serif" 
      fontWeight="900" 
      fontSize="24" 
      fill="white" 
      letterSpacing="-0.5"
    >
      JDO
    </text>
  </svg>
));

// --- Isolated Typewriter Component ---
interface TypewriterProps {
  phrases: string[];
}

const Typewriter = memo(({ phrases }: TypewriterProps) => {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const currentPhrase = phrases[phraseIndex % phrases.length];

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText(prev => prev.slice(0, -1));
        setTypingSpeed(50);
      }, typingSpeed);
    } else {
      timer = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        setTypingSpeed(100 + Math.random() * 50);
      }, typingSpeed);
    }

    if (!isDeleting && displayText === currentPhrase) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsDeleting(true);
        setTypingSpeed(50);
      }, 3000);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setPhraseIndex(prev => prev + 1);
      setTypingSpeed(150);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex, typingSpeed, phrases]);

  return (
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal text-center tracking-[0.2em] leading-tight text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.8)] min-h-[1.2em]">
      {displayText}
      <span className="ml-1 animate-[blink_1s_step-end_infinite]">_</span>
    </h1>
  );
});

interface FeatureCardProps {
  id: AppModule;
  type3D: 'mic' | 'camera' | 'ghost' | 'human';
  title: string;
  image?: string;
  video?: string;
  style: React.CSSProperties;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = memo(({ 
  id,
  type3D,
  title, 
  image,
  video,
  style,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle Video Playback on Hover
  useEffect(() => {
    if (video && videoRef.current) {
      if (isHovered) {
        // Play when hovered
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play was prevented
          });
        }
      } else {
        // Pause and reset when not hovered
        videoRef.current.pause();
        videoRef.current.currentTime = 0; 
      }
    }
  }, [isHovered, video]);

  return (
    <div 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        // Use CSS animation for hover glow, static shadow otherwise
        boxShadow: isHovered 
          ? undefined 
          : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
      // OPTIMIZATION: Reduced blur from xl to md/lg for performance
      className={`absolute w-64 h-96 cursor-pointer group origin-center will-change-transform rounded-[2rem] bg-white/5 backdrop-blur-md border transition-all duration-500 overflow-hidden
        ${isHovered ? 'animate-border-pulse bg-white/10' : 'border-white/10'}
      `}
    >
        {/* Content Container */}
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-end pb-8 select-none">
            {/* Visual Content (3D or Image) */}
            {image ? (
              <div className="absolute inset-0">
                 {/* Static Image */}
                 <img 
                    src={image} 
                    alt={title}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-all duration-700 absolute inset-0 z-0 ${isHovered ? 'animate-image-pulse' : ''}`}
                    style={{
                      opacity: isHovered ? 1 : 0.6,
                      // When hovered, the CSS animation 'animate-image-pulse' takes over brightness/contrast
                      // If there is a video, we rely on the video overlay to cover this
                      filter: isHovered 
                        ? 'none' 
                        : 'grayscale(100%) blur(0.5px)'
                    }}
                 />
                 
                 {/* Optional Video Overlay */}
                 {video && (
                   <video
                      ref={videoRef}
                      src={video}
                      muted
                      loop
                      playsInline
                      className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                   />
                 )}

                 {/* Dark gradient at bottom to ensure text readability */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 z-20" />
              </div>
            ) : (
              // Only render 3D canvas if no image (saves WebGL context)
              <div className="absolute inset-0 top-0 bottom-16 flex items-center justify-center transition-all duration-500 group-hover:scale-105">
                <GlassCard3D type={type3D} isHovered={isHovered} />
              </div>
            )}
            
            {/* Title */}
            <span className="relative z-30 text-2xl font-bold text-white tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              {title}
            </span>
        </div>
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />
    </div>
  );
});

export default function Landing({ onSelectModule, lang, toggleLanguage, t }: LandingProps) {
  const [animData, setAnimData] = useState<{
    module: AppModule;
    rect: DOMRect;
    title: string;
  } | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [deckScale, setDeckScale] = useState(1);

  // Card Deck State
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Responsive scaling
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      // Debounce resize
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const baseWidth = 1400; 
        const scale = Math.min(1, Math.max(0.6, window.innerWidth / baseWidth));
        setDeckScale(scale);
      }, 100);
    };
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    }
  }, []);

  const handleModuleSelect = (module: AppModule, title: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnimData({ module, rect, title });

    setTimeout(() => {
      setIsExpanding(true);
    }, 10);

    setTimeout(() => {
      onSelectModule(module);
    }, 275);
  };

  // --- Card Deck Logic ---
  const CARD_SPACING = 190; 
  const PUSH_DISTANCE = 220; 
  const CENTER_INDEX = 1.5; // Adjusted center for 4 items

  const getCardStyle = (index: number) => {
    // 1. Calculate Base Position (Idle State)
    const relativeIndex = index - CENTER_INDEX;
    const baseX = relativeIndex * CARD_SPACING;
    const baseRotate = relativeIndex * 4; // Slight fan effect

    // 2. Determine State
    const isHovered = index === hoveredIndex;
    const isIdle = hoveredIndex === null;
    
    // 3. Calculate Transforms
    let transform = '';
    let zIndex = 10;
    let opacity = 1;
    let filter = 'blur(0px)';
    
    if (isIdle) {
      // Idle: Stacked with overlap
      transform = `translateX(${baseX}px) rotate(${baseRotate}deg) scale(0.9)`;
      zIndex = 10 + index; 
    } else if (isHovered) {
      // Hovered: Pop up and straight
      transform = `translateX(${baseX}px) rotate(0deg) scale(1.05) translateY(-30px)`;
      zIndex = 50;
      opacity = 1;
    } else {
      // Dodge: Push away neighbors
      const isLeft = index < hoveredIndex;
      const pushDir = isLeft ? -1 : 1;
      const targetX = baseX + (pushDir * PUSH_DISTANCE);
      const targetRotate = baseRotate + (pushDir * 8); 
      
      transform = `translateX(${targetX}px) rotate(${targetRotate}deg) scale(0.85)`;
      zIndex = 40 - Math.abs(index - hoveredIndex); 
      opacity = 0.5;
      // OPTIMIZATION: Reduced Blur for inactive cards
      filter = 'blur(2px)'; 
    }

    const transition = 'all 800ms cubic-bezier(0.2, 1, 0.2, 1)';

    return {
      transform,
      zIndex,
      opacity,
      filter,
      transition
    };
  };

  // Optimized images: w=600 is sufficient for the cards, saving massive bandwidth/memory compared to original 2000px+
  const featureList: { 
    id: AppModule; 
    type3D: 'mic' | 'camera' | 'ghost' | 'human'; 
    title: string; 
    image?: string;
    video?: string; // Optional video property
  }[] = [
    { 
      id: '2d-audio', 
      type3D: 'mic', 
      title: t.features[0], 
      image: "https://images.unsplash.com/photo-1765420263504-8b1f2f33a486?q=80&w=600&auto=format&fit=crop",
      video: "https://res.cloudinary.com/djmxoehe9/video/upload/v1765437646/macphone_rbh44x.mp4"
    },
    { 
      id: '2d-chat', 
      type3D: 'camera', 
      title: t.features[1],
      image: "https://github.com/mattyyyyyyy/picture2bed/blob/main/jimeng-2025-12-11-8086-%E7%BB%93%E5%90%88%E6%9E%81%E7%AE%80%E4%B8%BB%E4%B9%89%E3%80%81%E5%88%9B%E6%84%8F%E5%90%88%E6%88%90%E7%94%9F%E6%88%90%EF%BC%9A%E5%A2%A8%E9%BB%91%E7%9C%9F%E7%A9%BA%E5%AE%87%E5%AE%99%E4%B8%AD%EF%BC%8C%E7%82%B9%E7%82%B9%E6%98%9F%E5%85%89%EF%BC%8C%E4%B8%AD%E5%BF%83%E5%8C%BA%E5%9F%9F%E6%B5%AE%E7%8E%B0%E7%94%B1%E6%97%A0%E6%95%B0%E9%93%B6%E8%89%B2%E5%85%89%E7%82%B9....png?raw=true",
      video: "https://res.cloudinary.com/djmxoehe9/video/upload/v1765437646/shexiangji_cnko5j.mp4"
    },
    { 
      id: '2d-avatar', 
      type3D: 'ghost', 
      title: t.features[2],
      image: "https://github.com/mattyyyyyyy/picture2bed/blob/main/jimeng-2025-12-11-6300-%E7%BB%93%E5%90%88%E6%9E%81%E7%AE%80%E4%B8%BB%E4%B9%89%E3%80%81%E5%88%9B%E6%84%8F%E5%90%88%E6%88%90%E7%94%9F%E6%88%90%EF%BC%9A%E5%A2%A8%E9%BB%91%E7%9C%9F%E7%A9%BA%E5%AE%87%E5%AE%99%E4%B8%AD%EF%BC%8C%E7%82%B9%E7%82%B9%E6%98%9F%E5%85%89%EF%BC%8C%E4%B8%AD%E5%BF%83%E5%8C%BA%E5%9F%9F%E6%B5%AE%E7%8E%B0%E7%94%B1%E6%97%A0%E6%95%B0%E9%93%B6%E8%89%B2%E5%85%89%E7%82%B9....png?raw=true",
      video: "https://res.cloudinary.com/djmxoehe9/video/upload/v1765437646/plant_pwucfi.mp4"
    },
    { 
      id: '3d-avatar', 
      type3D: 'human', 
      title: t.features[3],
      image: "https://images.unsplash.com/photo-1765417696283-9e3522262c4a?q=80&w=600&auto=format&fit=crop",
      // Updated video URL
      video: "https://res.cloudinary.com/djmxoehe9/video/upload/v1765437646/littlegirl_gzwaui.mp4"
    },
  ];

  // Helper to get image for transition
  const getSelectedImage = (moduleId: string) => {
    return featureList.find(f => f.id === moduleId)?.image;
  };

  // Construct phrases (Subtitle removed from loop)
  const typewriterPhrases = useMemo(() => [
    t.heroTitle,
    "Make Cars Smarter",
    "重新定义美学创造"
  ], [t.heroTitle]);

  return (
    <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto overflow-x-hidden">
      <style>{`
        @keyframes white-glow-pulse {
          0%, 100% { 
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            opacity: 0.8;
          }
          50% { 
            text-shadow: 0 0 25px rgba(255, 255, 255, 0.9), 0 0 10px rgba(255, 255, 255, 0.5);
            opacity: 1;
          }
        }
        @keyframes image-pulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.25); }
        }
        @keyframes border-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 10px rgba(255,255,255,0.05); 
            border-color: rgba(255, 255, 255, 0.2); 
          }
          50% { 
            box-shadow: 0 0 40px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(255,255,255,0.2); 
            border-color: rgba(255, 255, 255, 0.6); 
          }
        }
        .animate-white-glow {
          animation: white-glow-pulse 3s ease-in-out infinite;
        }
        .animate-image-pulse {
          animation: image-pulse 3s ease-in-out infinite;
        }
        .animate-border-pulse {
          animation: border-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <nav className="flex-none flex justify-between items-center px-6 py-6 md:px-10">
        <div className="flex items-center gap-3 select-none">
           <JDOLogo />
        </div>
        
        <div 
          onClick={toggleLanguage}
          className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white cursor-pointer transition-colors opacity-80 hover:opacity-100 select-none z-20"
        >
          <span>{t.navLang}</span>
          <Globe size={16} />
        </div>
      </nav>

      <main className="flex-shrink-0 flex flex-col items-center px-4 relative pt-16 md:pt-20 pb-[30px]">
        {/* Title Container - Adjusted margins for balance */}
        <div className="mb-6 flex items-center justify-center min-h-[120px] md:min-h-[160px]">
           <Typewriter phrases={typewriterPhrases} />
        </div>
        
        {/* Subtitle with Glowing White Animation - Reduced bottom margin to pull cards up */}
        <p className="text-lg md:text-xl text-white text-center mb-10 font-light max-w-2xl leading-relaxed tracking-wide animate-white-glow">
          {t.heroSubtitle}
        </p>

        {/* Interactive Card Deck with Scale Transform */}
        <div 
           className={`relative flex items-center justify-center h-[450px] w-full max-w-6xl perspective-1000 animate-in fade-in zoom-in-95 duration-1000 delay-200 ${animData ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}
           style={{ transform: `scale(${deckScale})`, transformOrigin: 'top center' }}
        >
           {featureList.map((feature, index) => (
              <FeatureCard 
                key={feature.id}
                id={feature.id}
                type3D={feature.type3D}
                title={feature.title}
                image={feature.image}
                video={feature.video}
                style={getCardStyle(index)}
                isHovered={hoveredIndex === index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(e) => handleModuleSelect(feature.id, feature.title, e)}
              />
           ))}
        </div>
      </main>

      {/* Transition Overlay */}
      {animData && (
        <div 
          className="fixed z-50 bg-[#191919]/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl"
          style={{
            top: isExpanding ? 0 : animData.rect.top,
            left: isExpanding ? 0 : animData.rect.left,
            width: isExpanding ? '100vw' : animData.rect.width,
            height: isExpanding ? '100vh' : animData.rect.height,
            borderRadius: isExpanding ? 0 : '2rem', 
            transition: 'all 300ms cubic-bezier(0.2, 0, 0.2, 1)', 
          }}
        >
           <div className={`w-full h-full flex flex-col items-center justify-center transition-all duration-300 relative ${isExpanding ? 'opacity-100' : 'opacity-100'}`}>
              
              {/* Expanding Image */}
              {getSelectedImage(animData.module) ? (
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={getSelectedImage(animData.module)} 
                    alt="transition"
                    className="w-full h-full object-cover opacity-100" 
                  />
                  {/* Overlay to ensure seamless visual with card state */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  {/* Additional dark overlay for studio background transition */}
                  <div className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${isExpanding ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              ) : (
                // Fallback if no image found (though all have images now)
                 <div className="p-6 rounded-3xl bg-white/10 mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    {animData.module === '2d-audio' && <Mic size={64} className="text-white" />}
                    {animData.module === '2d-chat' && <MessageSquare size={64} className="text-white" />}
                    {animData.module === '2d-avatar' && <Ghost size={64} className="text-white" />}
                    {animData.module === '3d-avatar' && <Box size={64} className="text-white" />}
                 </div>
              )}

              {/* Centered Title during Transition */}
              <div className={`absolute z-20 flex flex-col items-center justify-center transition-all duration-300 ${isExpanding ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
                  <span className="text-3xl font-bold text-white uppercase tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{animData.title}</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}