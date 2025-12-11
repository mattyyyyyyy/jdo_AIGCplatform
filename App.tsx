import React, { useState } from 'react';
import ColorBends from './components/ColorBends';
import Landing from './components/Landing';
import Studio from './components/Studio';
import CursorSystem from './components/CursorSystem';
import { Settings, X, Sparkles, Undo2, ArrowRight, Plus, Trash2, Save as SaveIcon } from 'lucide-react';
import { AppModule } from './types';

// --- Config Constants ---
const INITIAL_PRESETS: Record<string, any> = {
  default: {
    colors: ["#FF0000", "#0000FF", "#00FF00"],
    rotation: 0, // Updated to 0 based on request
    autoRotate: 0,
    speed: 0.2,
    scale: 1,
    frequency: 1,
    warpStrength: 1,
    mouseInfluence: 1,
    parallax: 0.5,
    noise: 0.04, // Reduced noise to prevent moiré/grain in blacks
  },
  neon: {
    colors: ["#2c3e50", "#E83A14", "#D9EAFD"],
    rotation: 90,
    autoRotate: 5,
    speed: 0.5,
    scale: 1.5,
    frequency: 0.5,
    warpStrength: 2.5,
    mouseInfluence: 0.2,
    parallax: 0.1,
    noise: 0.05,
  },
  soft: {
    colors: ["#F5F5F7", "#D4F6FF", "#FBFBFB"],
    rotation: 180,
    autoRotate: 1,
    speed: 0.1,
    scale: 0.8,
    frequency: 2.0,
    warpStrength: 0.5,
    mouseInfluence: 1.5,
    parallax: 0.8,
    noise: 0.02,
  },
  dark: {
    colors: ["#050505", "#1a1a1a", "#333333"],
    rotation: 0,
    autoRotate: 0.5,
    speed: 0.1,
    scale: 1.2,
    frequency: 0.8,
    warpStrength: 1.2,
    mouseInfluence: 0.5,
    parallax: 0.2,
    noise: 0.05,
  }
};

const TEXT_CONTENT = {
  zh: {
    navLang: 'EN',
    heroTitle: "新一代 AIGC 创作平台",
    heroSubtitle: "我们赋予你重塑数字命运的力量",
    // Order: 2D Audio, 2D Chat, 2D Avatar (Index 2), 3D Avatar (Index 3 - Rightmost)
    features: ["2D 对口型", "2D 实时对话", "2D 虚拟化身", "3D 虚拟化身"],
    settings: {
      title: "背景特效",
      presets: "预设",
      reset: "重置",
      colors: "颜色",
      advanced: "高级设置",
      savePreset: "保存",
      deletePreset: "删除",
      labels: {
        rotation: "旋转",
        speed: "速度",
        scale: "缩放",
        warp: "扭曲强度",
        noise: "噪点",
        autoRotate: "自动旋转",
        freq: "频率",
        mouse: "鼠标跟随",
        parallax: "视差"
      }
    },
    studio: {
      nav: {
        saveSettings: "保存设置",
        systemSettings: "系统设置"
      },
      controls: {
        title: "控制台",
        subtitle2d: "配置你的数字代理",
        subtitle3d: "塑造你的虚拟化身",
        voice: "音色选择",
        voiceSelectLabel: "选择音色",
        voiceLangLabel: "语言",
        voiceGenderLabel: "性别",
        voiceFilters: {
            all: "全部",
            male: "男声",
            female: "女声"
        },
        voiceEmotionLabel: "情绪",
        voiceSpeedLabel: "语速",
        voicePitchLabel: "语调",
        refImage: "参考形象 / 视频",
        upload: "上传",
        input: "输入模式",
        placeholder: "输入对话内容...",
        drivePlaceholder: "输入想要数字人播报的内容...",
        chatPlaceholder: "输入消息或按住说话...",
        initiate: "建立连接",
        terminate: "断开连接",
        generate: "开始生成",
        generating: "生成中...",
        ready: "READY",
        history: "历史记录",
        voiceCall: "语音通话",
        endCall: "结束通话",
        send: "发送",
        voiceInput: "语音输入文字",
        listening: "正在听...",
        cancelVoice: "取消",
        finishVoice: "说完了",
        releaseToSend: "松开发送",
        callActive: "通话中"
      },
      dialog: {
        title: "覆盖模型?",
        desc: "切换基础模型将重置当前的配饰组合。确定要继续吗？",
        confirm: "确定覆盖",
        cancel: "取消"
      },
      assets: {
        title: "资产库",
        save: "保存状态 (云端)",
        tabs: {
          public: "公共资产库",
          mine: "我的",
          male: "男",
          female: "女",
          pet: "宠物"
        },
        models: "角色模型",
        accessories: "形象配饰"
      }
    }
  },
  en: {
    navLang: '中',
    heroTitle: "Next-Gen AIGC Platform",
    heroSubtitle: "Empowering you to reshape your digital destiny",
    // Order: 2D Audio, 2D Chat, 2D Avatar (Index 2), 3D Avatar (Index 3 - Rightmost)
    features: ["2D Lip Sync", "2D Real-time Chat", "2D Virtual Avatar", "3D Virtual Avatar"],
    settings: {
      title: "Background Effects",
      presets: "Presets",
      reset: "Reset",
      colors: "Colors",
      advanced: "Advanced Settings",
      savePreset: "Save",
      deletePreset: "Delete",
      labels: {
        rotation: "Rotation",
        speed: "Speed",
        scale: "Scale",
        warp: "Warp Strength",
        noise: "Noise",
        autoRotate: "Auto Rotate",
        freq: "Frequency",
        mouse: "Mouse Influence",
        parallax: "Parallax"
      }
    },
    studio: {
      nav: {
        saveSettings: "Save Settings",
        systemSettings: "System Settings"
      },
      controls: {
        title: "Control Panel",
        subtitle2d: "Configure your Digital Agent",
        subtitle3d: "Sculpt your Virtual Avatar",
        voice: "Voice Selection",
        voiceSelectLabel: "Select Voice",
        voiceLangLabel: "Language",
        voiceGenderLabel: "Gender",
        voiceFilters: {
            all: "All",
            male: "Male",
            female: "Female"
        },
        voiceEmotionLabel: "Emotion",
        voiceSpeedLabel: "Speed",
        voicePitchLabel: "Pitch",
        refImage: "Reference Image / Video",
        upload: "Upload",
        input: "Input Mode",
        placeholder: "Type your message...",
        drivePlaceholder: "Enter text for the avatar to speak...",
        chatPlaceholder: "Type message or hold to speak...",
        initiate: "Initiate Link",
        terminate: "Terminate Link",
        generate: "Start Generating",
        generating: "Generating...",
        ready: "READY",
        history: "History",
        voiceCall: "Voice Call",
        endCall: "End Call",
        send: "Send",
        voiceInput: "Voice Input to Text",
        listening: "Listening...",
        cancelVoice: "Cancel",
        finishVoice: "Done",
        releaseToSend: "Release to Send",
        callActive: "In Call"
      },
      dialog: {
        title: "Overwrite Model?",
        desc: "Switching the base model will reset your current accessory combination. Are you sure?",
        confirm: "Overwrite",
        cancel: "Cancel"
      },
      assets: {
        title: "Asset Library",
        save: "Save State (Cloud)",
        tabs: {
          public: "Public Library",
          mine: "Mine",
          male: "Male",
          female: "Female",
          pet: "Pet"
        },
        models: "Character Model",
        accessories: "Accessories"
      }
    }
  }
};

export default function App() {
  // Global State
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [currentModule, setCurrentModule] = useState<AppModule | null>(null);
  
  // Background State
  const [presets, setPresets] = useState(INITIAL_PRESETS);
  const [bgParams, setBgParams] = useState(INITIAL_PRESETS.default);
  const [isBgPanelOpen, setIsBgPanelOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('default');

  const t = TEXT_CONTENT[lang];

  // Handlers
  const handleBgChange = (key: keyof typeof bgParams, value: number) => {
    setBgParams(prev => ({ ...prev, [key]: value }));
    setActivePreset('custom');
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...bgParams.colors];
    newColors[index] = value;
    setBgParams(prev => ({ ...prev, colors: newColors }));
    setActivePreset('custom');
  };

  const addColor = () => {
    if (bgParams.colors.length >= 8) return;
    setBgParams(prev => ({ ...prev, colors: [...prev.colors, "#ffffff"] }));
    setActivePreset('custom');
  };

  const removeColor = (index: number) => {
    if (bgParams.colors.length <= 2) return;
    const newColors = bgParams.colors.filter((_, i) => i !== index);
    setBgParams(prev => ({ ...prev, colors: newColors }));
    setActivePreset('custom');
  };

  const handlePreset = (name: string) => {
    setBgParams(presets[name]);
    setActivePreset(name);
  };

  const saveCurrentPreset = () => {
    const name = prompt("Enter preset name:");
    if (name) {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      setPresets(prev => ({ ...prev, [id]: { ...bgParams } }));
      setActivePreset(id);
    }
  };

  const deletePreset = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete preset "${name}"?`)) {
      const newPresets = { ...presets };
      delete newPresets[name];
      setPresets(newPresets);
      if (activePreset === name) {
        handlePreset('default');
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white selection:bg-indigo-500/30">
      
      {/* 0. Custom Cursor System */}
      <CursorSystem />

      {/* 1. Global Background Layer */}
      <div className="absolute inset-0 z-0">
        <ColorBends {...bgParams} />
        {/* Dark overlay for text readability - Pure black base with transparency */}
        <div className={`absolute inset-0 transition-colors duration-700 pointer-events-none ${currentModule ? 'bg-black/60' : 'bg-black/30'}`} />
      </div>

      {/* 2. Content Router */}
      <div className="relative z-10 w-full h-full">
        {currentModule ? (
          <Studio 
            module={currentModule} 
            onChangeModule={setCurrentModule}
            lang={lang} 
            toggleLanguage={() => setLang(prev => prev === 'zh' ? 'en' : 'zh')}
            onBack={() => setCurrentModule(null)}
            onOpenSettings={() => setIsBgPanelOpen(true)}
            t={t}
          />
        ) : (
          <Landing 
            onSelectModule={setCurrentModule} 
            lang={lang}
            toggleLanguage={() => setLang(prev => prev === 'zh' ? 'en' : 'zh')}
            t={t}
          />
        )}
      </div>

      {/* 3. Global Background Settings (Floating Button on Landing only, since Studio has top bar) */}
      {!currentModule && (
        <div className="absolute bottom-8 right-8 z-50 animate-in zoom-in duration-300">
          <button 
            onClick={() => setIsBgPanelOpen(true)}
            className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-lg border border-white/10 group active:scale-95"
            title="Customize Background"
          >
            <Settings className="text-white/60 group-hover:text-white group-hover:rotate-90 transition-all duration-500" size={22} />
          </button>
        </div>
      )}

      {/* 4. Settings Modal */}
      {isBgPanelOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="absolute inset-0" onClick={() => setIsBgPanelOpen(false)} />
           <div className="relative w-full max-w-sm bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles size={16} className="text-indigo-400"/> 
                  <span className="font-semibold text-sm">{t.settings.title}</span>
                </div>
                <button 
                  onClick={() => setIsBgPanelOpen(false)} 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Controls */}
              <div className="overflow-y-auto p-5 space-y-6 custom-scrollbar text-sm">
                {/* Presets */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">{t.settings.presets}</h3>
                     <div className="flex gap-2">
                        <button 
                          onClick={saveCurrentPreset}
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                          <SaveIcon size={10} /> {t.settings.savePreset}
                        </button>
                        <button 
                          onClick={() => handlePreset('default')}
                          className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <Undo2 size={10} /> {t.settings.reset}
                        </button>
                     </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(presets).map((name) => (
                      <div key={name} className="relative group/preset">
                        <button
                          onClick={() => handlePreset(name)}
                          className={`w-full py-1.5 px-1 rounded-md text-xs font-medium transition-all border truncate ${
                            activePreset === name 
                              ? 'bg-white text-black border-white shadow-md' 
                              : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </button>
                        {/* Delete Button */}
                        {!['default', 'neon', 'soft', 'dark'].includes(name) && (
                          <button 
                            onClick={(e) => deletePreset(name, e)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/preset:opacity-100 transition-opacity shadow-sm"
                          >
                            <X size={8} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">{t.settings.colors}</h3>
                    <span className="text-[10px] text-white/30">{bgParams.colors.length} / 8</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 items-center">
                    {bgParams.colors.map((color, i) => (
                      <div key={i} className="relative group">
                        <div 
                          className="w-8 h-8 rounded-full border border-white/20 shadow-sm cursor-pointer hover:scale-110 transition-transform overflow-hidden ring-1 ring-white/10 relative"
                          style={{ backgroundColor: color }}
                        >
                          <input 
                            type="color" 
                            value={color}
                            onChange={(e) => handleColorChange(i, e.target.value)}
                            className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                          />
                        </div>
                        {/* Remove Color Button */}
                        {bgParams.colors.length > 2 && (
                          <button 
                            onClick={() => removeColor(i)}
                            className="absolute -top-1 -right-1 bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-white/20"
                          >
                            <X size={8} />
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Add Color Button */}
                    {bgParams.colors.length < 8 && (
                      <button 
                        onClick={addColor}
                        className="w-8 h-8 rounded-full border border-dashed border-white/30 flex items-center justify-center text-white/30 hover:text-white hover:border-white/60 hover:bg-white/5 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <hr className="border-white/10" />

                {/* Sliders */}
                <div className="space-y-5">
                  <ControlSlider label={t.settings.labels.rotation} value={bgParams.rotation} min={0} max={360} step={1} onChange={(v) => handleBgChange('rotation', v)} />
                  <ControlSlider label={t.settings.labels.speed} value={bgParams.speed} min={0} max={2} step={0.1} onChange={(v) => handleBgChange('speed', v)} />
                  <ControlSlider label={t.settings.labels.scale} value={bgParams.scale} min={0.1} max={3} step={0.1} onChange={(v) => handleBgChange('scale', v)} />
                  <ControlSlider label={t.settings.labels.warp} value={bgParams.warpStrength} min={0} max={5} step={0.1} onChange={(v) => handleBgChange('warpStrength', v)} />
                  <ControlSlider label={t.settings.labels.noise} value={bgParams.noise} min={0} max={0.5} step={0.01} onChange={(v) => handleBgChange('noise', v)} />
                  
                  <div className="pt-2">
                     <details className="group">
                        <summary className="text-xs text-white/40 hover:text-white cursor-pointer list-none flex items-center gap-2 transition-colors">
                           <span>{t.settings.advanced}</span>
                           <ArrowRight size={10} className="group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="space-y-5 pt-4 animate-in slide-in-from-top-2">
                           <ControlSlider label={t.settings.labels.autoRotate} value={bgParams.autoRotate} min={0} max={20} step={0.5} onChange={(v) => handleBgChange('autoRotate', v)} />
                           <ControlSlider label={t.settings.labels.freq} value={bgParams.frequency} min={0} max={5} step={0.1} onChange={(v) => handleBgChange('frequency', v)} />
                           <ControlSlider label={t.settings.labels.mouse} value={bgParams.mouseInfluence} min={0} max={3} step={0.1} onChange={(v) => handleBgChange('mouseInfluence', v)} />
                           <ControlSlider label={t.settings.labels.parallax} value={bgParams.parallax} min={0} max={1} step={0.1} onChange={(v) => handleBgChange('parallax', v)} />
                        </div>
                     </details>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// Reusable Slider
const ControlSlider = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange 
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  onChange: (val: number) => void 
}) => {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{label}</label>
        <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 min-w-[30px] text-center">
          {value.toFixed(step < 0.1 ? 2 : 1)}
        </span>
      </div>
      <div className="relative h-4 flex items-center">
         <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/20 transition-colors z-10 focus:outline-none"
        />
        <div 
          className="absolute h-1 bg-white/30 rounded-l-lg pointer-events-none left-0" 
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  );
};