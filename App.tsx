
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KeywordTab from './components/KeywordTab';
import TagTab from './components/TagTab';
import ThumbnailTab from './components/ThumbnailTab';
import AffiliateTab from './components/AffiliateTab';
import AudienceTab from './components/AudienceTab';
import SettingsTab from './components/SettingsTab';
import PrivacyPolicy from './components/PrivacyPolicy';
import { ThemeColor } from './types';
import { GeminiService } from './services/geminiService';

const gemini = new GeminiService();

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('keywords');
  const [theme, setTheme] = useState<ThemeColor>('red');
  const [daysCount, setDaysCount] = useState(90);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // التعامل مع الروابط (Hash Routing)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['keywords', 'audience', 'tags', 'thumbnail', 'affiliate', 'settings', 'privacy'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // التحقق عند التحميل الأول

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // تحديث الهاش عند تغيير التاب يدوياً
  useEffect(() => {
    if (window.location.hash !== `#${activeTab}`) {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  // تهيئة الخدمة بالمفاتيح الافتراضية عند التشغيل
  useEffect(() => {
    const appId = '1621960245609280';
    const token = localStorage.getItem('fb_access_token') || 'EAAXDKgxHg0ABQqFr3H5GP7ktODgxBUfzbtviA9F6ycHjQvhZClJ9bShSZBcQciSDR8YgaUsnejZCdvVP92HJZCGB6QZCD53b0W6D4rYveAWzZA1P4cCpFNgQaKbdp7DZAPDmAwuQkctVT5oK4mbZBQHPzXgZCBOb0qhnmegaiLiBke47T5xVqvDddqVymnN42';
    
    // Fix: Using existing updatePlatformConfig instead of non-existent setFacebookConfig
    gemini.updatePlatformConfig('meta', { appId, token });
  }, []);

  const renderContent = () => {
    const commonProps = { theme, daysCount };
    switch (activeTab) {
      case 'keywords':
        return <KeywordTab {...commonProps} />;
      case 'audience':
        return <AudienceTab {...commonProps} />;
      case 'tags':
        return <TagTab {...commonProps} />;
      case 'thumbnail':
        return <ThumbnailTab theme={theme} />;
      case 'affiliate':
        return <AffiliateTab {...commonProps} />;
      case 'settings':
        return <SettingsTab theme={theme} />;
      case 'privacy':
        return <PrivacyPolicy theme={theme} />;
      default:
        return <KeywordTab {...commonProps} />;
    }
  };

  const themeOptions: { color: ThemeColor; class: string }[] = [
    { color: 'red', class: 'bg-red-500' },
    { color: 'blue', class: 'bg-blue-500' },
    { color: 'purple', class: 'bg-purple-500' },
  ];

  const getTitle = () => {
    switch (activeTab) {
      case 'keywords': return 'تحليل الكلمات المفتاحية';
      case 'audience': return 'تحليل الجمهور والتوجهات';
      case 'tags': return 'توليد العلامات (Tags)';
      case 'thumbnail': return 'تصميم الصور المصغرة';
      case 'affiliate': return 'تحليل التسويق بالعمولة';
      case 'settings': return 'إعدادات الربط المباشر';
      case 'privacy': return 'سياسة الخصوصية';
      default: return 'SEO Master';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row-reverse">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 md:mr-64 p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                {getTitle()}
              </h1>
              {activeTab !== 'privacy' && activeTab !== 'settings' && (
                <p className="text-gray-500 mt-1 font-medium text-xs md:text-sm">
                  نطاق التحليل الحالي: {daysCount} يوم
                </p>
              )}
            </div>
            {/* Mobile Hamburger Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-xl"
            >
              ☰
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            {activeTab !== 'privacy' && activeTab !== 'settings' && (
              <div className="flex items-center gap-4 bg-white p-3 px-6 rounded-2xl shadow-sm border border-gray-100 w-full md:min-w-[280px]">
                <span className="text-[10px] font-black text-gray-400 uppercase">المدة</span>
                <input 
                  type="range" 
                  min="1" 
                  max="90" 
                  value={daysCount} 
                  onChange={(e) => setDaysCount(parseInt(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="text-sm font-black text-blue-600 min-w-[2.5rem] text-center">{daysCount}ي</span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
              {themeOptions.map((opt) => (
                <button
                  key={opt.color}
                  onClick={() => setTheme(opt.color)}
                  className={`w-5 h-5 rounded-full ${opt.class} transition-transform hover:scale-125 shadow-sm ${
                    theme === opt.color ? 'ring-2 ring-offset-2 ring-gray-400 scale-125' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        <div className="animate-in fade-in duration-500 overflow-hidden">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Quick Access) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 shadow-2xl z-50">
        {[
          { id: 'keywords', icon: '🔍' },
          { id: 'audience', icon: '👥' },
          { id: 'tags', icon: '🏷️' },
          { id: 'thumbnail', icon: '🎨' },
          { id: 'settings', icon: '⚙️' }
        ].map(btn => (
          <button 
            key={btn.id}
            onClick={() => setActiveTab(btn.id)} 
            className={`p-2 flex flex-col items-center transition-colors ${activeTab === btn.id ? (theme === 'red' ? 'text-red-600' : theme === 'blue' ? 'text-blue-600' : 'text-purple-600') : 'text-gray-400'}`}
          >
            <span className="text-xl">{btn.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
