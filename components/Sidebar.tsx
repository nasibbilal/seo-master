
import React, { useState, useEffect } from 'react';
import { ThemeColor, APIUsageStats } from '../types';
import { GeminiService } from '../services/geminiService';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: ThemeColor;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, theme, isOpen, onClose }) => {
  const [usage, setUsage] = useState<APIUsageStats>({ usedTokens: 0, limit: 100, percentage: 0 });
  const gemini = new GeminiService();

  useEffect(() => {
    setUsage(gemini.getUsageStats());
    
    const handleUsageUpdate = (event: any) => {
      setUsage(event.detail);
    };

    window.addEventListener('gemini_usage_updated', handleUsageUpdate);
    return () => window.removeEventListener('gemini_usage_updated', handleUsageUpdate);
  }, []);

  const menuItems = [
    { id: 'keywords', label: 'تحليل الكلمات', icon: '🔍' },
    { id: 'audience', label: 'تحليل الجمهور', icon: '👥' },
    { id: 'affiliate', label: 'التسويق بالعمولة', icon: '💰' },
    { id: 'tags', label: 'توليد العلامات', icon: '🏷️' },
    { id: 'thumbnail', label: 'مصمم الصور المصغرة', icon: '🎨' },
    { id: 'settings', label: 'إعدادات الـ API', icon: '⚙️' },
    { id: 'privacy', label: 'سياسة الخصوصية', icon: '📜' },
  ];

  const themeStyles = {
    red: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-600' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-600' },
  };

  const currentTheme = themeStyles[theme];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`w-64 bg-white h-screen border-l border-gray-200 shadow-sm fixed right-0 top-0 z-40 transition-transform duration-300 transform md:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h1 className={`text-2xl font-black flex items-center gap-2 ${currentTheme.text}`}>
            <span>🚀</span> SEO Master
          </h1>
          <button onClick={onClose} className="md:hidden text-gray-400 p-2">✕</button>
        </div>
        <nav className="mt-6 flex flex-col min-h-[calc(100%-250px)]">
          <div className="flex-1">
            {menuItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); if(onClose) onClose(); }}
                className={`w-full flex items-center gap-4 px-6 py-4 text-right transition-all ${
                  activeTab === item.id
                    ? `${currentTheme.bg} ${currentTheme.text} border-r-4 ${currentTheme.border} font-bold`
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-50 pt-2 pb-6">
            {menuItems.slice(5).map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); if(onClose) onClose(); }}
                className={`w-full flex items-center gap-4 px-6 py-4 text-right transition-all ${
                  activeTab === item.id
                    ? `${currentTheme.bg} ${currentTheme.text} border-r-4 ${currentTheme.border} font-bold`
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Mini Usage Monitor */}
        <div className="p-6 mt-auto border-t border-gray-50 bg-gray-50/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase">حصة الـ API</span>
            <span className={`text-[10px] font-black ${usage.percentage > 90 ? 'text-red-600' : 'text-blue-600'}`}>{Math.round(usage.percentage)}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${usage.percentage > 95 ? 'bg-red-500' : usage.percentage > 80 ? 'bg-orange-500' : 'bg-blue-500'}`}
              style={{ width: `${usage.percentage}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
