import React, { useState } from 'react';
import ColorBends from './components/ColorBends';
import Landing from './components/Landing';
import Studio from './components/Studio';
import CursorSystem from './components/CursorSystem';
import { AppModule } from './types';

const TEXT_CONTENT = {
  zh: {
    navLang: 'EN',
    heroTitle: "新一代 AIGC 创作平台",
    heroSubtitle: "我们赋予你重塑数字命运的力量",
    // Order: 2D Audio, 2D Chat, 2D Avatar (Index 2), 3D Avatar (Index 3 - Rightmost)
    features: ["2D 对口型", "2D 实时对话", "2D 虚拟化身", "3D 虚拟化身"],
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
  
  const t = TEXT_CONTENT[lang];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white selection:bg-indigo-500/30">
      
      {/* 0. Custom Cursor System */}
      <CursorSystem />

      {/* 1. Global Background Layer */}
      <div className="absolute inset-0 z-0">
        <ColorBends 
          rotation={0}
          autoRotate={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          colors={undefined} // Use default rainbow
        />
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
            onOpenSettings={() => {}} 
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
    </div>
  );
}