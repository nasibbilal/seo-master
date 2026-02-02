
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KeywordTab from './components/KeywordTab';
import TagTab from './components/TagTab';
import ThumbnailTab from './components/ThumbnailTab';
import AffiliateTab from './components/AffiliateTab';
import AudienceTab from './components/AudienceTab';
import CompetitorTab from './components/CompetitorTab';
import SettingsTab from './components/SettingsTab';
import PrivacyPolicy from './components/PrivacyPolicy';
import { ThemeColor } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('keywords');
  const [theme, setTheme] = useState<ThemeColor>('red');
  const [daysCount, setDaysCount] = useState(90);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const valid = ['keywords', 'audience', 'tags', 'thumbnail', 'affiliate', 'settings', 'privacy', 'competitors'];
      if (valid.includes(hash)) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => { window.location.hash = activeTab; }, [activeTab]);

  const renderContent = () => {
    const commonProps = { theme, daysCount };
    switch (activeTab) {
      case 'keywords': return <KeywordTab {...commonProps} />;
      case 'competitors': return <CompetitorTab theme={theme} />;
      case 'audience': return <AudienceTab {...commonProps} />;
      case 'tags': return <TagTab {...commonProps} />;
      case 'thumbnail': return <ThumbnailTab theme={theme} />;
      case 'affiliate': return <AffiliateTab {...commonProps} />;
      case 'settings': return <SettingsTab theme={theme} />;
      case 'privacy': return <PrivacyPolicy theme={theme} />;
      default: return <KeywordTab {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row-reverse">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="flex-1 md:mr-64 p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
           <h1 className="text-2xl md:text-3xl font-black text-gray-900">SEOMaster Intelligence</h1>
           <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden">☰</button>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
