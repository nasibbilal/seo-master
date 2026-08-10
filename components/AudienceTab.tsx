
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ThemeColor, Platform, COUNTRIES, AudienceInsight } from '../types';
import { useLanguage } from '../context/LanguageContext';

const gemini = new GeminiService();

interface AudienceTabProps {
  theme: ThemeColor;
  daysCount: number;
  activeChannelId?: string;
}

const AudienceTab: React.FC<AudienceTabProps> = ({ theme, daysCount, activeChannelId }) => {
  const { lang, t, dir } = useLanguage();
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.YOUTUBE);
  const [country, setCountry] = useState('GLOBAL');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<AudienceInsight | null>(null);

  const checkKeyStatus = (plt: Platform) => {
    switch (plt) {
      case Platform.YOUTUBE: {
        const cfg = gemini.getPlatformConfig('youtube');
        return Boolean(cfg.youtube_key || cfg.youtube_key_2);
      }
      case Platform.TIKTOK: {
        const cfg = gemini.getPlatformConfig('tiktok');
        return Boolean(cfg.tiktok_secret);
      }
      case Platform.INSTAGRAM:
      case Platform.FACEBOOK: {
        const cfg = gemini.getPlatformConfig('meta');
        return Boolean(cfg.meta_token);
      }
      case Platform.GOOGLE: {
        const cfg = gemini.getPlatformConfig('google_search');
        return Boolean(cfg.google_token);
      }
      case Platform.PINTEREST: {
        const cfg = gemini.getPlatformConfig('pinterest');
        return Boolean(cfg.pinterest_token);
      }
      default: return false;
    }
  };

  const isKeyConnected = checkKeyStatus(platform);

  const handleAnalyze = async () => {
    if (!category) return;
    setLoading(true);
    setInsight(null);
    try {
      const result = await gemini.getAudienceInsights(category, platform, country, daysCount);
      if (result) {
        setInsight(result);
      } else {
        alert(lang === 'ar' ? "لم نتمكن من جلب بيانات دقيقة، يرجى المحاولة لاحقاً." : "Could not fetch audience insights, please try again later.");
      }
    } catch (error: any) {
      console.error(error);
      alert(lang === 'ar' ? "خطأ في جلب بيانات الجمهور الحقيقية. تأكد من ربط الـ API في الإعدادات." : "Error fetching audience data. Please verify API settings.");
    } finally {
      setLoading(false);
    }
  };

  const themeClasses = {
    red: { button: 'bg-red-600 hover:bg-red-700 shadow-red-200', text: 'text-red-600', badge: 'bg-red-50 text-red-600' },
    blue: { button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-600' },
    purple: { button: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200', text: 'text-purple-600', badge: 'bg-purple-50 text-purple-600' },
  }[theme];

  const platforms = [
    { id: Platform.YOUTUBE, name: lang === 'ar' ? 'يوتيوب 🎥' : 'YouTube 🎥' },
    { id: Platform.TIKTOK, name: lang === 'ar' ? 'تيك توك 🎵' : 'TikTok 🎵' },
    { id: Platform.INSTAGRAM, name: lang === 'ar' ? 'إنستغرام 📸' : 'Instagram 📸' },
    { id: Platform.FACEBOOK, name: lang === 'ar' ? 'فيسبوك 👥' : 'Facebook 👥' },
    { id: Platform.GOOGLE, name: lang === 'ar' ? 'جوجل 🔍' : 'Google 🔍' },
    { id: Platform.PINTEREST, name: lang === 'ar' ? 'بينتريست 📌' : 'Pinterest 📌' },
  ];

  const isRtl = dir === 'rtl';

  return (
    <div className={`max-w-7xl mx-auto p-4 md:p-6 font-cairo ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      {/* Header Controls */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 shadow-2xl border border-gray-100 mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50 transition-colors"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 flex items-center gap-4">
            <span className="bg-slate-900 text-white w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-xl">👥</span>
            {t('audience.title')}
          </h2>
          <select 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-gray-50 border-2 border-transparent px-6 py-3 rounded-2xl text-xs font-black outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm"
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {lang === 'en' && c.code === 'GLOBAL' ? 'Global' : c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest mx-4">{t('audience.interestLabel')}</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t('audience.interestPlaceholder')}
              className="w-full px-8 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none font-bold text-gray-800 shadow-inner transition-all h-[68px]"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2 px-2">
              <label className="text-[10px] font-black text-gray-400 block uppercase tracking-widest">{lang === 'ar' ? 'المنصة (الربط المباشر)' : 'Platform (Direct Link)'}</label>
              {isKeyConnected ? (
                <span className="text-[9px] font-black bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  {lang === 'ar' ? 'مفتاح API متصل' : 'API Key Connected'}
                </span>
              ) : (
                <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {lang === 'ar' ? 'ذكاء اصطناعي + بحث حي' : 'AI + Live Search'}
                </span>
              )}
            </div>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full px-6 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent font-bold outline-none cursor-pointer focus:bg-white focus:border-blue-500 transition-all appearance-none h-[68px]"
            >
              {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`${themeClasses.button} text-white w-full py-5 rounded-[1.5rem] font-black disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 h-[68px] text-lg cursor-pointer`}
            >
              {loading ? <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : (lang === 'ar' ? 'استخراج بيانات الجمهور' : 'Extract Audience Data')}
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Result Cards */}
      {insight && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Interests Card */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50 text-center relative overflow-hidden h-[240px] flex flex-col justify-center">
               <div className="absolute top-4 right-6 text-gray-400 font-black text-[10px] uppercase">{lang === 'ar' ? 'اهتمامات الجمهور' : 'Audience Interests'}</div>
               <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {(insight?.demographics?.interests || []).length > 0 ? (
                    insight?.demographics?.interests?.map((interest, i) => (
                      <span key={i} className={`${themeClasses.badge} px-4 py-2 rounded-xl text-xs font-black shadow-sm`}>#{interest}</span>
                    ))
                  ) : (
                    <p className="text-gray-400 font-bold">{lang === 'ar' ? 'لا توجد اهتمامات حالياً' : 'No interests currently'}</p>
                  )}
               </div>
            </div>

            {/* Engagement Time Card */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50 text-center relative h-[240px] flex flex-col items-center justify-center">
               <div className="absolute top-4 right-6 text-gray-400 font-black text-[10px] uppercase">{lang === 'ar' ? 'وقت التفاعل' : 'Engagement Time'}</div>
               <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">⏰</div>
               <p className="text-2xl font-black text-gray-900">{insight?.engagementTimes || (lang === 'ar' ? 'غير محدد' : 'Not Specified')}</p>
            </div>

            {/* Age Group Card */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50 text-center relative h-[240px] flex flex-col items-center justify-center">
               <div className="absolute top-4 right-6 text-gray-400 font-black text-[10px] uppercase">{lang === 'ar' ? 'الفئة العمرية' : 'Age Group'}</div>
               <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm text-blue-600">👤</div>
               <p className="text-2xl font-black text-gray-900">{insight?.demographics?.ageRange || (lang === 'ar' ? 'غير محدد' : 'Not Specified')}</p>
            </div>
          </div>

          {/* Best Performing Formats */}
          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-50 relative overflow-hidden">
             <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">🎬 {lang === 'ar' ? 'أفضل التنسيقات أداءً' : 'Best Performing Formats'}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(insight?.contentFormats || []).length > 0 ? (
                  insight?.contentFormats?.map((format, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
                       <div className="flex justify-between items-center mb-4">
                          <span className="font-black text-lg">{format.format}</span>
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black">{format.performanceScore}%</span>
                       </div>
                       <div className="h-2 w-full bg-white rounded-full overflow-hidden mb-4 border border-gray-100">
                          <div className={`h-full ${themeClasses.button.split(' ')[0]}`} style={{ width: `${format.performanceScore}%` }} />
                       </div>
                       <p className="text-xs font-bold text-gray-500 leading-relaxed">{format.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-10 text-center text-gray-400 font-bold">{lang === 'ar' ? 'لا توجد بيانات متاحة' : 'No data available'}</div>
                )}
             </div>
          </div>

          {/* Bottom Section: Topics and Search Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
             <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">{lang === 'ar' ? 'المواضيع المتفاعلة' : 'Engaging Topics'}</h3>
                <div className="space-y-4">
                  {(insight?.currentMonthTopics || []).length > 0 ? (
                    insight?.currentMonthTopics?.map((topic, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors">
                        <span className="font-black text-gray-800">{topic.topic}</span>
                        <span className="bg-white px-3 py-1 rounded-xl text-[10px] font-black shadow-sm text-blue-600 border border-blue-50">{topic.volume}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 font-bold py-6">{lang === 'ar' ? 'لا توجد مواضيع' : 'No topics'}</p>
                  )}
                </div>
             </div>

             <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">{lang === 'ar' ? 'كلمات البحث الرائجة' : 'Trending Search Queries'}</h3>
                <div className="space-y-4">
                  {(insight?.topSearchQueries || []).length > 0 ? (
                    insight?.topSearchQueries?.map((query, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-colors">
                        <span className="font-black text-gray-800">{query.topic}</span>
                        <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-xl">{lang === 'ar' ? `+${query.competition}% طلب` : `+${query.competition}% demand`}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 font-bold py-6">{lang === 'ar' ? 'لا توجد كلمات بحث' : 'No search queries'}</p>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}

      {insight === null && !loading && (
        <div className="p-32 text-center bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-6xl shadow-sm mb-8">👥</div>
          <p className="font-black text-gray-400 text-2xl">{lang === 'ar' ? 'بانتظار تحديد الفئة والمنصة لبدء التحليل الحقيقي..' : 'Awaiting niche and platform selection to start analysis..'}</p>
          <p className="text-xs font-bold mt-4 max-w-md mx-auto leading-relaxed">{lang === 'ar' ? 'تأكد من إدخال مفاتيح الـ API في الإعدادات لضمان أعلى دقة في سحب بيانات اهتمامات الجمهور.' : 'Ensure API keys are configured in settings for maximum audience data accuracy.'}</p>
        </div>
      )}
    </div>
  );
};

export default AudienceTab;
