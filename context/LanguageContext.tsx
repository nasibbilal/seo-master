import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // App Header & Navigation
    'app.title': 'SEO Master 🚀',
    'app.connected': 'متصل',
    'app.range': 'المدى:',
    'app.days': 'ي',
    'app.addChannel': 'إضافة قناة',
    'app.channels': 'القنوات',
    'app.connectedChannels': 'القنوات المربوطة',
    'app.selectChannel': 'اختر القناة',
    'app.addNewChannel': '+ إضافة قناة جديدة',

    // Sidebar
    'nav.keywords': 'تحليل الكلمات',
    'nav.radar': 'الرادار الذكي',
    'nav.competitors': 'تحليل المنافسين',
    'nav.audience': 'تحليل الجمهور',
    'nav.tags': 'توليد العلامات',
    'nav.thumbnail': 'مصمم الصور',
    'nav.settings': 'إعدادات الـ API',
    'nav.privacy': 'سياسة الخصوصية',
    'nav.quota': 'حصتك اليومية',

    // Add Channel Modal
    'modal.connectNewChannel': 'ربط قناة جديدة',
    'modal.apiFormatting': 'تنسيق البيانات الحقيقي عبر API',
    'modal.channelName': 'اسم القناة',
    'modal.channelNamePlaceholder': 'اسم القناة للتمييز',
    'modal.platform': 'المنصة',
    'modal.handle': 'معرف القناة / Handle',
    'modal.confirmLogo': 'تم تأكيد الشعار الحقيقي',
    'modal.fetchingApi': 'جاري الاتصال بقواعد البيانات...',
    'modal.clickToFetchAvatar': 'اضغط هنا لجلب صورة القناة الحقيقية',
    'modal.connectAndStart': '🚀 ربط القناة وبدء التحليل',

    // Keywords Tab
    'keywords.title': 'تحليل وتتبع الكلمات المفتاحية',
    'keywords.subtitle': 'استكشف أداء الكلمات وحجم البحث والمنافسة مباشرة',
    'keywords.placeholder': 'أدخل الكلمة المفتاحية...',
    'keywords.allPlatforms': 'جميع المنصات',
    'keywords.analyzeBtn': 'تحليل الكلمات',
    'keywords.colKeyword': 'الكلمة المفتاحية',
    'keywords.colVolume': 'حجم البحث',
    'keywords.colCompetition': 'درجة المنافسة',
    'keywords.colTrend': 'الاتجاه',
    'keywords.colScore': 'درجة قوة SEO',

    // Radar Tab
    'radar.title': 'الرادار الذكي للاستخبارات',
    'radar.category': 'التخصص (Niche)',
    'radar.region': 'النطاق الجغرافي',
    'radar.startScan': 'بدء المسح والتحليل المباشر 💥',
    'radar.liveResults': 'نتائج الرصد المباشر',
    'radar.blackbox': 'المربع الأسود (تحليل الفجوات)',

    // Competitor Tab
    'competitor.title': 'استخبارات المنافسين (صيد فجوات التعليقات)',
    'competitor.urlPlaceholder': 'رابط فيديو المنافس...',
    'competitor.platform': 'تحديد المنصة',
    'competitor.startSpy': 'بدء التجسس والتحليل',
    'competitor.apiKeyConnected': 'مفتاح API متصل',
    'competitor.aiAnalysis': 'ذكاء اصطناعي + تحليل',
    'competitor.strategyBreakdown': 'تفكيك استراتيجية المنافس',
    'competitor.videoContent': 'محتوى الفيديو (التحليل الصوتي)',
    'competitor.counterAttack': 'خطة الهجوم المضاد (خوارزمية الأجوبة)',

    // Audience Tab
    'audience.title': 'تحليل الجمهور Real-Time (Insights)',
    'audience.interestPlaceholder': 'مثلاً: عشاق القهوة، مبرمجي بايثون...',
    'audience.interestLabel': 'اهتمام الجمهور المستهدف',
    'audience.extractBtn': 'استخراج بيانات الجمهور',

    // Tag Tab
    'tag.title': 'مولد العلامات الذكي',
    'tag.topicPlaceholder': 'عن ماذا يتحدث المحتوى الخاص بك؟',
    'tag.generateBtn': 'توليد العلامات',

    // Thumbnail Tab
    'thumbnail.title': 'مصمم واختبار الصور المصغرة',
    'thumbnail.descPlaceholder': 'مثلاً: رائد فضاء عربي يمسك بعملة بيتكوين في الفضاء...',
    'thumbnail.descLabel': 'وصف المشهد الفني',
    'thumbnail.generateBtn': 'توليد 3 خيارات احترافية 🦄',

    // Settings Tab
    'settings.title': 'إعدادات مفاتيح API',
    'settings.saveBtn': 'حفظ الإعدادات',

    // Global
    'global.globalRegion': 'عالمي (جميع الدول)',
  },
  en: {
    // App Header & Navigation
    'app.title': 'SEO Master 🚀',
    'app.connected': 'Connected',
    'app.range': 'Range:',
    'app.days': 'd',
    'app.addChannel': 'Add Channel',
    'app.channels': 'Channels',
    'app.connectedChannels': 'Connected Channels',
    'app.selectChannel': 'Select Channel',
    'app.addNewChannel': '+ Add New Channel',

    // Sidebar
    'nav.keywords': 'Keyword Analysis',
    'nav.radar': 'Smart Radar',
    'nav.competitors': 'Competitor Analysis',
    'nav.audience': 'Audience Analysis',
    'nav.tags': 'Tag Generator',
    'nav.thumbnail': 'Thumbnail Designer',
    'nav.settings': 'API Settings',
    'nav.privacy': 'Privacy Policy',
    'nav.quota': 'Daily Quota',

    // Add Channel Modal
    'modal.connectNewChannel': 'Connect New Channel',
    'modal.apiFormatting': 'Real-time API Data Formatting',
    'modal.channelName': 'Channel Name',
    'modal.channelNamePlaceholder': 'Channel Name for Distinction',
    'modal.platform': 'Platform',
    'modal.handle': 'Channel ID / Handle',
    'modal.confirmLogo': 'Real Avatar Confirmed',
    'modal.fetchingApi': 'Connecting to API Database...',
    'modal.clickToFetchAvatar': 'Click here to fetch real channel avatar',
    'modal.connectAndStart': '🚀 Connect Channel & Start Analysis',

    // Keywords Tab
    'keywords.title': 'Keyword Analysis & Tracking',
    'keywords.subtitle': 'Explore keyword performance, volume, and live competition',
    'keywords.placeholder': 'Enter keyword...',
    'keywords.allPlatforms': 'All Platforms',
    'keywords.analyzeBtn': 'Analyze Keywords',
    'keywords.colKeyword': 'Keyword',
    'keywords.colVolume': 'Search Volume',
    'keywords.colCompetition': 'Competition',
    'keywords.colTrend': 'Trend',
    'keywords.colScore': 'SEO Score',

    // Radar Tab
    'radar.title': 'Smart Intelligence Radar',
    'radar.category': 'Niche / Category',
    'radar.region': 'Geographic Region',
    'radar.startScan': 'Start Scan & Live Analysis 💥',
    'radar.liveResults': 'Live Monitoring Results',
    'radar.blackbox': 'Blackbox (Gap Analysis)',

    // Competitor Tab
    'competitor.title': 'Competitor Intelligence (Comment Gap Hunting)',
    'competitor.urlPlaceholder': 'Competitor video URL...',
    'competitor.platform': 'Select Platform',
    'competitor.startSpy': 'Start Spy & Analysis',
    'competitor.apiKeyConnected': 'API Key Connected',
    'competitor.aiAnalysis': 'AI + Analysis',
    'competitor.strategyBreakdown': 'Competitor Strategy Breakdown',
    'competitor.videoContent': 'Video Content (Audio Analysis)',
    'competitor.counterAttack': 'Counter-Attack Plan (Answers Algo)',

    // Audience Tab
    'audience.title': 'Real-Time Audience Insights',
    'audience.interestPlaceholder': 'e.g. Coffee Lovers, Python Developers...',
    'audience.interestLabel': 'Target Audience Interest',
    'audience.extractBtn': 'Extract Audience Data',

    // Tag Tab
    'tag.title': 'Smart Tag Generator',
    'tag.topicPlaceholder': 'What is your content about?',
    'tag.generateBtn': 'Generate Tags',

    // Thumbnail Tab
    'thumbnail.title': 'Thumbnail Designer & Analyzer',
    'thumbnail.descPlaceholder': 'e.g. An astronaut holding a bitcoin in space, cyberpunk style...',
    'thumbnail.descLabel': 'Art Scene Description',
    'thumbnail.generateBtn': 'Generate 3 Pro Options 🦄',

    // Settings Tab
    'settings.title': 'API Key Settings',
    'settings.saveBtn': 'Save Settings',

    // Global
    'global.globalRegion': 'Global (All Countries)',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
  dir: 'rtl'
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app_lang');
      return (saved === 'en' || saved === 'ar') ? saved : 'ar';
    } catch {
      return 'ar';
    }
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem('app_lang', lang);
    } catch (e) {
      console.error(e);
    }
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const toggleLang = () => {
    setLangState(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['ar']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
