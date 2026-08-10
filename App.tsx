
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import KeywordTab from './components/KeywordTab';
import RadarTab from './components/RadarTab';
import TagTab from './components/TagTab';
import ThumbnailTab from './components/ThumbnailTab';
import AudienceTab from './components/AudienceTab';
import CompetitorTab from './components/CompetitorTab';
import SettingsTab from './components/SettingsTab';
import PrivacyPolicy from './components/PrivacyPolicy';
import AuthGate from './components/AuthGate';
import { ThemeColor, ChannelMetadata, Platform } from './types';
import { GeminiService } from './services/geminiService';
import { useLanguage } from './context/LanguageContext';

const gemini = new GeminiService();

const App: React.FC = () => {
  const { lang, toggleLang, t, dir } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('keywords');
  const [theme] = useState<ThemeColor>('red');
  const [daysCount, setDaysCount] = useState(30);
  const [channels, setChannels] = useState<ChannelMetadata[]>([]);
  const [activeChannelId, setActiveChannelId] = useState('');
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Add Channel Modal State
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelPlatform, setNewChannelPlatform] = useState<Platform>(Platform.YOUTUBE);
  const [newChannelIdentifier, setNewChannelIdentifier] = useState('');
  const [tempKey, setTempKey] = useState('');
  const [tempKey2, setTempKey2] = useState('');
  const [fetchingLogo, setFetchingLogo] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialChannels = gemini.getChannels();
    setChannels(initialChannels);
    const active = gemini.getActiveChannelId();
    if (active && initialChannels.some(c => c.id === active)) {
      setActiveChannelId(active);
    } else if (initialChannels.length > 0) {
      const firstId = initialChannels[0].id;
      setActiveChannelId(firstId);
      gemini.setChannel(firstId);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsChannelDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeChannel = useMemo(() => channels.find(c => c.id === activeChannelId), [channels, activeChannelId]);

  const handleChannelSwitch = (id: string) => {
    if (activeChannelId !== id) {
      setActiveChannelId(id);
      gemini.setChannel(id);
      setIsChannelDropdownOpen(false);
    }
  };

  const handlePreviewLogo = async () => {
    if (!newChannelIdentifier && !newChannelName) {
      alert(lang === 'ar' ? "يرجى إدخال اسم القناة أو معرفها أولاً" : "Please enter channel name or handle first");
      return;
    }
    setFetchingLogo(true);
    setPreviewLogo(null);
    try {
      const logo = await gemini.fetchChannelRealLogo(
        newChannelPlatform, 
        newChannelIdentifier || newChannelName, 
        tempKey
      );
      setPreviewLogo(logo);
    } catch (e) {
      console.error(e);
      alert(lang === 'ar' ? "تعذر جلب الشعار الحقيقي عبر API، سيتم استخدام شعار افتراضي." : "Could not fetch avatar via API, using default avatar.");
    } finally {
      setFetchingLogo(false);
    }
  };

  const handleSaveChannel = () => {
    if (!newChannelName || !newChannelIdentifier) {
      alert(lang === 'ar' ? "يرجى إكمال جميع الحقول الأساسية" : "Please complete all required fields");
      return;
    }
    const id = `ch_${Date.now()}`;
    const newChannel: ChannelMetadata = {
      id,
      name: newChannelName,
      platform: newChannelPlatform,
      logoUrl: previewLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(newChannelName)}&background=random`,
      youtubeId: newChannelPlatform === Platform.YOUTUBE ? newChannelIdentifier : undefined,
      youtubeKey: newChannelPlatform === Platform.YOUTUBE ? tempKey : undefined,
      youtubeKey2: newChannelPlatform === Platform.YOUTUBE ? tempKey2 : undefined,
    };
    
    gemini.addChannel(newChannel);
    const updatedChannels = gemini.getChannels();
    setChannels(updatedChannels);
    setActiveChannelId(id);
    gemini.setChannel(id);
    
    if (newChannelPlatform === Platform.YOUTUBE && tempKey) {
       gemini.updatePlatformConfig('youtube', { 
         youtube_key: tempKey,
         youtube_key_2: tempKey2
       });
    }

    setIsAddChannelModalOpen(false);
    setNewChannelName('');
    setNewChannelIdentifier('');
    setTempKey('');
    setTempKey2('');
    setPreviewLogo(null);
  };

  const renderContent = () => {
    const props = { theme, daysCount, activeChannelId };
    switch (activeTab) {
      case 'keywords': return <KeywordTab {...props} />;
      case 'radar': return <RadarTab {...props} onTrendDetected={() => {}} />;
      case 'settings': return <SettingsTab theme={theme} activeChannelId={activeChannelId} />;
      case 'tags': return <TagTab {...props} />;
      case 'thumbnail': return <ThumbnailTab theme={theme} />;
      case 'audience': return <AudienceTab {...props} />;
      case 'competitors': return <CompetitorTab theme={theme} />;
      case 'privacy': return <PrivacyPolicy theme={theme} />;
      default: return <KeywordTab {...props} />;
    }
  };

  if (!isLoggedIn) return <AuthGate onLogin={() => setIsLoggedIn(true)} />;

  const isRtl = dir === 'rtl';

  return (
    <div className={`min-h-screen bg-gray-50 flex ${isRtl ? 'flex-col md:flex-row-reverse' : 'flex-col md:flex-row'} font-cairo overflow-x-hidden`} dir={dir}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className={`flex-1 ${isRtl ? 'lg:mr-72' : 'lg:ml-72'} p-3 md:p-10 min-h-screen transition-all duration-300`}>
        {/* Header - Optimized for Responsive */}
        <header className="mb-6 md:mb-8 flex flex-col lg:flex-row justify-between items-center bg-white p-4 md:p-5 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 gap-4 md:gap-6">
          <div className="flex items-center justify-between w-full lg:w-auto gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">{t('app.title')}</h1>
                <div className="hidden sm:flex bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase border border-green-100 items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  {t('app.connected')}
                </div>
              </div>

              {/* Language Switcher Toggle Button in Header */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black px-3 py-1.5 rounded-xl text-xs transition-all border border-gray-200 shadow-xs active:scale-95 cursor-pointer ml-1 sm:ml-2"
                title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
              >
                <span className="text-sm">🌐</span>
                <span className={lang === 'ar' ? 'text-blue-600 font-black' : 'text-gray-400 font-bold'}>AR</span>
                <span className="text-gray-300">/</span>
                <span className={lang === 'en' ? 'text-blue-600 font-black' : 'text-gray-400 font-bold'}>EN</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Add Button Visible on all screens in mobile top bar */}
              <button 
                onClick={() => setIsAddChannelModalOpen(true)}
                className="lg:hidden w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-blue-700 active:scale-95 transition-all text-xl font-bold border-b-2 border-blue-800"
                title={t('app.addChannel')}
              >
                +
              </button>
              
              <div className="lg:hidden relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
                  className="w-10 h-10 rounded-full border-2 border-blue-100 overflow-hidden shadow-sm"
                >
                  <img src={activeChannel?.logoUrl || `https://ui-avatars.com/api/?name=SEO`} className="w-full h-full object-cover" alt="avatar" />
                </button>
                {isChannelDropdownOpen && (
                  <div className={`absolute top-full ${isRtl ? 'left-0' : 'right-0'} mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl py-3 z-[1500] animate-in fade-in slide-in-from-top-2`}>
                    <div className="px-4 mb-2 text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">{t('app.channels')}</div>
                    {channels.map(ch => (
                      <button key={ch.id} onClick={() => handleChannelSwitch(ch.id)} className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-4 py-2 text-[10px] font-bold transition-all flex items-center gap-3 ${activeChannelId === ch.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>
                        <img src={ch.logoUrl || ''} className="w-6 h-6 rounded-full object-cover" alt="" /> 
                        <span className="flex-1 truncate">{ch.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Search Range Slider - Centered on Mobile */}
            <div className="bg-slate-900 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl flex flex-row items-center gap-4 shadow-lg w-full max-w-[340px] sm:w-auto sm:min-w-[280px] mx-auto lg:mx-0">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase whitespace-nowrap">{t('app.range')}</span>
                <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-black min-w-[40px] text-center">{daysCount}{t('app.days')}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="90" 
                value={daysCount} 
                onChange={(e) => setDaysCount(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            
            {/* Desktop Only Actions */}
            <div className="hidden lg:flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setIsAddChannelModalOpen(true)}
                className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-700 active:scale-95 transition-all text-xl md:text-2xl font-bold shrink-0 border-b-4 border-blue-800"
                title={t('app.addChannel')}
              >
                +
              </button>

              <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
                <button 
                  onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)} 
                  className="w-full bg-white border border-gray-100 px-4 py-3 rounded-xl md:rounded-2xl text-[10px] font-black flex items-center gap-3 shadow-sm hover:border-blue-500 transition-all min-w-[200px] group"
                >
                  <div className="relative">
                    {activeChannel?.logoUrl ? (
                      <img src={activeChannel.logoUrl} className="w-8 h-8 rounded-full object-cover border-2 border-blue-50 shadow-sm" alt="logo" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">SEO</div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <span className={`truncate text-gray-900 leading-tight flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>{activeChannel?.name || t('app.selectChannel')}</span>
                  <span className="text-gray-400 text-[10px] transform transition-transform duration-300 group-hover:text-blue-500" style={{ transform: isChannelDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </button>
                {isChannelDropdownOpen && (
                  <div className={`absolute top-full ${isRtl ? 'right-0' : 'left-0'} mt-3 w-full bg-white border border-gray-100 rounded-2xl md:rounded-[2rem] shadow-2xl py-4 z-[1500] animate-in fade-in slide-in-from-top-2`}>
                    <div className="px-6 mb-2 text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">{t('app.connectedChannels')}</div>
                    <div className="max-h-[250px] overflow-y-auto">
                      {channels.map(ch => (
                        <button key={ch.id} onClick={() => handleChannelSwitch(ch.id)} className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-6 py-3.5 text-xs font-bold transition-all flex items-center gap-4 ${activeChannelId === ch.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>
                          <img src={ch.logoUrl || ''} className="w-7 h-7 rounded-full object-cover shadow-sm" alt="" /> 
                          <span className="flex-1 truncate">{ch.name}</span>
                          {activeChannelId === ch.id && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => { setIsChannelDropdownOpen(false); setIsAddChannelModalOpen(true); }} className="w-full text-blue-600 text-[10px] font-black py-3 border-t border-gray-50 hover:bg-gray-50 mt-2 italic">{t('app.addNewChannel')}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {isAddChannelModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[2000] flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl border-4 border-blue-100 relative overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
               <button onClick={() => setIsAddChannelModalOpen(false)} className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} text-gray-400 hover:text-red-500 transition-colors text-xl font-black`}>✕</button>
               
               <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🛰️</div>
                  <h2 className="text-xl font-black text-gray-900">{t('modal.connectNewChannel')}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{t('modal.apiFormatting')}</p>
               </div>

               <div className="space-y-5">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase mx-3 mb-1.5 block">{t('modal.channelName')}</label>
                    <input 
                      type="text" 
                      value={newChannelName} 
                      onChange={(e) => setNewChannelName(e.target.value)} 
                      placeholder={t('modal.channelNamePlaceholder')} 
                      className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase mx-3 mb-1.5 block">{t('modal.platform')}</label>
                      <select 
                        value={newChannelPlatform} 
                        onChange={(e) => setNewChannelPlatform(e.target.value as Platform)} 
                        className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold outline-none cursor-pointer text-sm"
                      >
                        <option value={Platform.YOUTUBE}>YouTube 🎥</option>
                        <option value={Platform.TIKTOK}>TikTok 🎵</option>
                        <option value={Platform.INSTAGRAM}>Instagram 📸</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase mx-3 mb-1.5 block">{t('modal.handle')}</label>
                      <input 
                        type="text" 
                        value={newChannelIdentifier} 
                        onChange={(e) => setNewChannelIdentifier(e.target.value)} 
                        placeholder="@Handle or UC..." 
                        className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold outline-none text-sm" 
                      />
                    </div>
                  </div>

                  {newChannelPlatform === Platform.YOUTUBE && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase mx-3 mb-1.5 block tracking-widest">YouTube Key 1</label>
                        <input 
                          type="password" 
                          value={tempKey} 
                          onChange={(e) => setTempKey(e.target.value)} 
                          placeholder="AIzaSy..." 
                          className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold outline-none text-sm" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase mx-3 mb-1.5 block tracking-widest">YouTube Key 2</label>
                        <input 
                          type="password" 
                          value={tempKey2} 
                          onChange={(e) => setTempKey2(e.target.value)} 
                          placeholder="AIzaSy..." 
                          className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 font-bold outline-none text-sm" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-4 py-4 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200">
                     {previewLogo ? (
                       <div className="flex flex-col items-center animate-in fade-in scale-in-95">
                         <div className="relative">
                            <img src={previewLogo} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg mb-2" alt="Real Preview" />
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full text-[8px]">✓</div>
                         </div>
                         <span className="text-[9px] font-black text-green-600 uppercase">{t('modal.confirmLogo')}</span>
                       </div>
                     ) : (
                       <button 
                        onClick={handlePreviewLogo} 
                        disabled={fetchingLogo || (!newChannelIdentifier && !newChannelName)} 
                        className="flex flex-col items-center gap-2 group transition-all"
                       >
                         <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100 ${fetchingLogo ? 'animate-spin' : 'group-hover:scale-110'}`}>
                           {fetchingLogo ? '⏳' : '🔍'}
                         </div>
                         <span className="text-blue-600 font-black text-[10px] underline">
                           {fetchingLogo ? t('modal.fetchingApi') : t('modal.clickToFetchAvatar')}
                         </span>
                       </button>
                     )}
                  </div>

                  <button 
                    onClick={handleSaveChannel}
                    disabled={!newChannelName || !newChannelIdentifier}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl sm:rounded-2xl font-black text-md hover:bg-black transition-all shadow-xl disabled:opacity-50"
                  >
                    {t('modal.connectAndStart')}
                  </button>
               </div>
            </div>
          </div>
        )}

        <div className="animate-in fade-in duration-700">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;

