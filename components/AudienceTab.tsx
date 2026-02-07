

import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ThemeColor, Platform, COUNTRIES, AudienceInsight } from '../types';

const gemini = new GeminiService();

interface AudienceTabProps {
  theme: ThemeColor;
  daysCount: number;
}

const AudienceTab: React.FC<AudienceTabProps> = ({ theme, daysCount }) => {
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.YOUTUBE);
  const [country, setCountry] = useState('GLOBAL');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<AudienceInsight | null>(null);

  const handleAnalyze = async () => {
    if (!category) return;
    setLoading(true);
    setInsight(null);
    try {
      /* Fixed: analyzeKeywords no longer used, getAudienceInsights implemented in geminiService */
      const result = await gemini.getAudienceInsights(category, platform, country, daysCount);
      setInsight(result);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء جلب البيانات.");
    } finally {
      setLoading(false);
    }
  };

  const themeClasses = {
    red: { button: 'bg-red-600 hover:bg-red-700', badge: 'bg-red-100 text-red-700', text: 'text-red-600' },
    blue: { button: 'bg-blue-600 hover:bg-blue-700', badge: 'bg-blue-100 text-blue-700', text: 'text-blue-600' },
    purple: { button: 'bg-purple-600 hover:bg-purple-700', badge: 'bg-purple-100 text-purple-700', text: 'text-purple-600' }
  }[theme];

  const platforms = [
    { id: Platform.YOUTUBE, name: 'يوتيوب', icon: '🎥' },
    { id: Platform.INSTAGRAM, name: 'إنستغرام', icon: '📸' },
    { id: Platform.FACEBOOK, name: 'فيسبوك', icon: '👥' },
    { id: Platform.TIKTOK, name: 'تيك توك', icon: '🎵' },
    { id: Platform.GOOGLE, name: 'جوجل', icon: '🔍' },
    { id: Platform.PINTEREST, name: 'بينتريست', icon: '📌' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 font-cairo text-right">
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl border border-gray-100 mb-6 md:mb-10 transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
            <span>👥</span> تحليل الجمهور
          </h2>
          <select 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-gray-100 border-none px-4 py-2 rounded-xl text-[10px] md:text-xs font-black outline-none w-full md:w-auto"
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>
        </div>

        <div className="space-y-6">
          <div className="w-full">
            <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase">فئة الجمهور</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="مثلاً: محبي التقنية..."
              className="w-full px-6 md:px-10 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-white border-2 border-gray-200 text-black font-black text-lg md:text-2xl outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase">المنصة</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-6 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] border-2 border-gray-100 bg-white font-black text-gray-700 outline-none text-sm md:text-lg appearance-none cursor-pointer"
              >
                {platforms.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
              </select>
            </div>

            <div className="flex-[2]">
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase">تأكيد</label>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`${themeClasses.button} w-full text-white px-6 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] transition-all font-black disabled:opacity-50 shadow-lg flex items-center justify-center gap-4 text-sm md:text-xl active:scale-95`}
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>بدء التحليل المباشر</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {insight && (
        <div className="animate-in slide-in-from-bottom-5 duration-700 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center text-2xl md:text-3xl mx-auto mb-4">👤</div>
              <h3 className="text-gray-400 font-black text-[10px] uppercase mb-1">الفئة العمرية</h3>
              <p className="text-lg md:text-2xl font-black text-gray-900">{insight.demographics.ageRange}</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-50 rounded-full flex items-center justify-center text-2xl md:text-3xl mx-auto mb-4">⏰</div>
              <h3 className="text-gray-400 font-black text-[10px] uppercase mb-1">وقت التفاعل</h3>
              <p className="text-base md:text-xl font-black text-gray-900">{insight.engagementTimes}</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-sm md:text-lg font-black mb-4">اهتمامات الجمهور</h3>
              <div className="flex flex-wrap gap-2">
                {insight.demographics.interests.map((interest, idx) => (
                  <span key={idx} className={`${themeClasses.badge} px-3 py-1.5 rounded-lg text-[10px] font-black`}>#{interest}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span>🎬</span> أفضل التنسيقات أداءً
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {insight.contentFormats.map((format, idx) => (
                <div key={idx} className="bg-gray-50 rounded-[1.5rem] p-5 md:p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm md:text-lg font-black">{format.format}</span>
                    <span className="px-2 py-1 rounded-full text-[8px] font-black text-white bg-green-500">{format.performanceScore}%</span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden mb-3 border border-gray-100 shadow-inner">
                    <div className={`h-full ${themeClasses.button}`} style={{ width: `${format.performanceScore}%` }} />
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500 font-medium leading-relaxed">{format.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100">
              <h3 className="font-black text-base md:text-xl mb-4">المواضيع المتفاعلة</h3>
              <div className="space-y-3">
                {insight.currentMonthTopics.map((topic, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-black text-xs md:text-sm">{topic.topic}</span>
                    <span className="bg-white px-2 py-1 rounded-lg text-[8px] md:text-[10px] font-black shadow-sm">{topic.volume}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100">
              <h3 className="font-black text-base md:text-xl mb-4">كلمات البحث الرائجة</h3>
              <div className="space-y-3">
                {insight.topSearchQueries.map((query, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-black text-xs md:text-sm">{query.topic}</span>
                    <span className="text-[8px] md:text-[10px] font-black text-blue-600">{query.competition}% طلب</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudienceTab;
