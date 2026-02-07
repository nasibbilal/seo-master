
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import KeywordTab from './components/KeywordTab';
import RadarTab from './components/RadarTab';
import TagTab from './components/TagTab';
import ThumbnailTab from './components/ThumbnailTab';
import AffiliateTab from './components/AffiliateTab';
import AudienceTab from './components/AudienceTab';
import CompetitorTab from './components/CompetitorTab';
import SettingsTab from './components/SettingsTab';
import PrivacyPolicy from './components/PrivacyPolicy';
import AuthGate from './components/AuthGate';
import { ThemeColor, ChannelMetadata } from './types';
import { GeminiService } from './services/geminiService';

const gemini = new GeminiService();

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('keywords');
  const [theme, setTheme] = useState<ThemeColor>('red');
  const [daysCount, setDaysCount] = useState(90);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  
  const [channels, setChannels] = useState<ChannelMetadata[]>([]);
  const [activeChannelId, setActiveChannelId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Partial<ChannelMetadata>>({});
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const initialChannels = gemini.getChannels();
      const initialActiveId = gemini.getActiveChannelId();
      setChannels(initialChannels);
      setActiveChannelId(initialActiveId);
    } catch (e) {
      console.error("Initial data load failed", e);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsChannelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const valid = ['keywords', 'radar', 'audience', 'tags', 'thumbnail', 'affiliate', 'settings', 'privacy', 'competitors'];
      if (valid.includes(hash)) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => { window.location.hash = activeTab; }, [activeTab]);

  const handleChannelSwitch = (channelId: string) => {
    setActiveChannelId(channelId);
    gemini.setChannel(channelId);
    setIsChannelDropdownOpen(false);
    showNotification(`تم التبديل إلى: ${channels.find(c => c.id === channelId)?.name || channelId}`);
  };

  const handleAddChannel = () => {
    setModalData({ id: `channel_${Date.now()}`, name: '' });
    setIsModalOpen(true);
  };

  const saveChannelConfig = () => {
    if (!modalData.name) return alert("يرجى إدخال اسم القناة");
    const updated = [...channels];
    const idx = updated.findIndex(c => c.id === modalData.id);
    if (idx > -1) {
      updated[idx] = modalData as ChannelMetadata;
    } else {
      updated.push(modalData as ChannelMetadata);
    }
    
    setChannels(updated);
    gemini.saveChannels(updated);
    
    if (modalData.id) {
        setActiveChannelId(modalData.id);
        gemini.setChannel(modalData.id);
    }
    
    setIsModalOpen(false);
    showNotification("تم حفظ إعدادات القناة بنجاح.");
  };

  const showNotification = (title: string) => {
    setNotification(title);
    setHasNewAlert(true);
    setTimeout(() => setNotification(null), 5000);
  };

  const activeChannelName = useMemo(() => {
    const name = channels.find(c => c.id === activeChannelId)?.name;
    return name?.replace(/قناة \d+/g, '').trim() || name || 'مشروع جديد';
  }, [channels, activeChannelId]);

  const renderContent = useMemo(() => {
    if (!activeChannelId) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل إعدادات القناة...</div>;
    
    const commonProps = { theme, daysCount, activeChannelId };
    switch (activeTab) {
      case 'keywords': return <KeywordTab {...commonProps} key={`kw-${activeChannelId}`} />;
      case 'radar': return <RadarTab theme={theme} onTrendDetected={showNotification} key={`rd-${activeChannelId}`} />;
      case 'competitors': return <CompetitorTab theme={theme} key={`cp-${activeChannelId}`} />;
      case 'audience': return <AudienceTab {...commonProps} key={`ad-${activeChannelId}`} />;
      case 'tags': return <TagTab {...commonProps} key={`tg-${activeChannelId}`} />;
      case 'thumbnail': return <ThumbnailTab theme={theme} key={`th-${activeChannelId}`} />;
      case 'affiliate': return <AffiliateTab {...commonProps} key={`af-${activeChannelId}`} />;
      case 'settings': return <SettingsTab theme={theme} activeChannelId={activeChannelId} key={`st-${activeChannelId}`} />;
      case 'privacy': return <PrivacyPolicy theme={theme} />;
      default: return <KeywordTab {...commonProps} key={`def-${activeChannelId}`} />;
    }
  }, [activeTab, theme, daysCount, activeChannelId, channels]);

  if (!isLoggedIn) {
    return <AuthGate onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row-reverse overflow-x-hidden font-cairo">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Notifications Container */}
      <div className="fixed top-4 left-4 md:top-10 md:left-10 z-[1000] flex flex-col gap-4 max-w-[calc(100%-2rem)] md:max-w-sm">
        {notification && (
          <div className="bg-slate-900 text-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border-l-8 border-red-600 animate-in slide-in-from-left-full duration-500">
             <div className="flex items-center gap-4">
                <span className="text-2xl md:text-3xl animate-bounce">🔔</span>
                <div>
                  <h4 className="font-black text-xs md:text-sm mb-1">تنبيه النظام</h4>
                  <p className="text-[10px] md:text-[11px] text-gray-400 font-bold leading-relaxed">{notification}</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl md:text-2xl font-black mb-6 text-gray-900 flex items-center gap-2">
               <span className="bg-blue-600 text-white p-2 rounded-xl text-lg">➕</span>
               مشروع جديد
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-2">اسم القناة / المشروع</label>
                <input 
                  type="text" 
                  value={modalData.name || ''} 
                  onChange={(e) => setModalData({...modalData, name: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="مثال: مدونة التقنية العربية"
                />
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button 
                onClick={saveChannelConfig} 
                className="flex-1 bg-blue-600 text-white font-black py-4 md:py-5 rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
              >
                حفظ وإضافة
              </button>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-4 md:py-5 border-2 border-gray-100 font-bold rounded-2xl text-gray-400 hover:bg-gray-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 md:mr-72 p-4 md:p-10 min-h-screen">
        <header className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 gap-5 md:gap-0">
           <div className="flex items-center justify-between w-full md:w-auto md:gap-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-2xl p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">☰</button>
                <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Intelligence</h1>
              </div>
              
              <button 
                onClick={() => { setHasNewAlert(false); setActiveTab('radar'); }}
                className="relative p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group md:ml-0 ml-auto"
              >
                <span className="text-xl md:text-2xl grayscale group-hover:grayscale-0 transition-all">🔔</span>
                {hasNewAlert && <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-ping"></span>}
              </button>
           </div>

           <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <button 
                onClick={handleAddChannel}
                className="bg-blue-600 text-white w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black shadow-lg hover:bg-blue-700 active:scale-90 transition-all shrink-0"
                title="إضافة قناة جديدة"
              >
                <span className="text-2xl md:text-2xl">+</span>
              </button>
              
              <div className="relative flex-1 md:flex-none" ref={dropdownRef}>
                <button
                  onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
                  className="w-full bg-gray-50 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black flex items-center justify-between md:justify-start gap-3 transition-all hover:bg-gray-100 border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="max-w-[100px] md:max-w-[150px] truncate">{activeChannelName}</span>
                  </div>
                  <span className={`transition-transform duration-300 text-gray-400 ${isChannelDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {isChannelDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full md:w-64 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl py-4 z-[1500] max-h-72 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                    <p className="px-6 mb-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">مشاريعك الحالية</p>
                    {channels.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleChannelSwitch(ch.id)}
                        className={`w-full text-right px-6 py-4 text-xs font-bold transition-colors flex items-center justify-between ${activeChannelId === ch.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span className="truncate">{ch.name.replace(/قناة \d+/g, '').trim() || ch.name}</span>
                        {activeChannelId === ch.id && <span className="text-blue-500">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
           </div>
        </header>

        <div className="transition-all duration-500 animate-in fade-in duration-700 pb-10">
            {renderContent}
        </div>
      </main>
    </div>
  );
};

export default App;
