import React, { useState } from 'react';
import { Settings, X, Sliders } from 'lucide-react';
import { BackgroundConfig } from '../types';

interface BackgroundControlsProps {
  config: BackgroundConfig;
  onChange: (newConfig: BackgroundConfig) => void;
}

export default function BackgroundControls({ config, onChange }: BackgroundControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof BackgroundConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all shadow-lg group"
      >
        <Sliders size={20} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-72 bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Settings size={14} />
          Customize
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        {/* Single Color */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-white/70">Single Color</label>
          <input 
            type="checkbox" 
            checked={config.singleColor}
            onChange={(e) => handleChange('singleColor', e.target.checked)}
            className="accent-indigo-500"
          />
        </div>

        {config.singleColor && (
           <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-medium text-white/70">Color Hex</label>
              <div className="flex gap-2">
                 <input 
                    type="color" 
                    value={config.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/20 p-0.5"
                 />
                 <input 
                    type="text" 
                    value={config.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 text-xs text-white font-mono focus:outline-none focus:border-white/30 transition-colors"
                 />
              </div>
           </div>
        )}

        {/* Sliders */}
        <ControlSlider label="Rotation (deg)" value={config.rotation} min={0} max={360} onChange={(v) => handleChange('rotation', v)} />
        <ControlSlider label="Auto Rotate (deg/s)" value={config.autoRotate} min={-360} max={360} onChange={(v) => handleChange('autoRotate', v)} />
        <ControlSlider label="Speed" value={config.speed} min={0} max={2} step={0.1} onChange={(v) => handleChange('speed', v)} />
        <ControlSlider label="Scale" value={config.scale} min={0.1} max={5} step={0.1} onChange={(v) => handleChange('scale', v)} />
        <ControlSlider label="Frequency" value={config.frequency} min={0} max={10} step={0.1} onChange={(v) => handleChange('frequency', v)} />
        <ControlSlider label="Warp Strength" value={config.warpStrength} min={0} max={5} step={0.1} onChange={(v) => handleChange('warpStrength', v)} />
        <ControlSlider label="Mouse Influence" value={config.mouseInfluence} min={0} max={5} step={0.1} onChange={(v) => handleChange('mouseInfluence', v)} />
      </div>
    </div>
  );
}

const ControlSlider = ({ label, value, min, max, step=1, onChange }: any) => (
  <div className="space-y-1.5">
    <div className="flex justify-between">
      <label className="text-xs font-medium text-white/60">{label}</label>
      <span className="text-xs font-mono text-white/40">{Math.round(value * 100) / 100}</span>
    </div>
    <div className="relative h-2 flex items-center">
       <input 
         type="range" 
         min={min} max={max} step={step}
         value={value} 
         onChange={(e) => onChange(parseFloat(e.target.value))}
         className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/20 z-10 focus:outline-none"
       />
       <div 
         className="absolute h-1 bg-white/30 rounded-l-lg pointer-events-none left-0" 
         style={{ width: `${Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))}%` }} 
       />
    </div>
  </div>
);
