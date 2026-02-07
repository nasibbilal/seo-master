
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
    const handleUsageUpdate = (event: any) => setUsage(event.detail);
    window.addEventListener('gemini_usage_updated', handleUsageUpdate);
    return () => window.removeEventListener('gemini_usage_updated', handleUsageUpdate);
  }, []);

  const menuItems = [
    { id: 'keywords', label: 'تحليل الكلمات', icon: '🔍' },
    { id: 'radar', label: 'الرادار الذكي', icon: '📡' },
    { id: 'competitors', label: 'تحليل المنافسين', icon: '🕵️' },
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
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      
      {/* Sidebar Drawer */}
      <div className={`w-72 bg-white h-screen border-l border-gray-100 shadow-2xl fixed right-0 top-0 z-50 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform md:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <h1 className={`text-2xl font-black flex items-center gap-2 ${currentTheme.text}`}>🚀 SEO Master</h1>
          <button onClick={onClose} className="md:hidden text-gray-400 p-2 hover:bg-gray-100 rounded-full transition-colors">✕</button>
        </div>
        
        <nav className="mt-4 flex flex-col pb-10">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if(onClose) onClose(); }}
              className={`w-full flex items-center gap-4 px-8 py-4.5 text-right transition-all group ${
                activeTab === item.id 
                  ? `${currentTheme.bg} ${currentTheme.text} border-r-4 ${currentTheme.border} font-bold` 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className={`text-2xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[15px] font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Usage Stats at bottom of sidebar */}
        <div className="p-6 mt-auto border-t border-gray-50">
          <div className="bg-gray-50 p-4 rounded-2xl">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase">استهلاك الـ API</span>
                <span className="text-[10px] font-black text-gray-600">{usage.usedTokens}/{usage.limit}</span>
             </div>
             <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${usage.percentage > 80 ? 'bg-red-500' : 'bg-blue-600'}`} 
                  style={{ width: `${usage.percentage}%` }}
                />
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
