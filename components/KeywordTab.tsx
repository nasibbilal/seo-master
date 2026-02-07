
import React, { useState } from 'react';
import { Platform, KeywordMetric, ThemeColor, COUNTRIES } from '../types';
import { GeminiService } from '../services/geminiService';

const gemini = new GeminiService();

interface KeywordTabProps {
  theme: ThemeColor;
  daysCount: number;
}

const KeywordTab: React.FC<KeywordTabProps> = ({ theme, daysCount }) => {
  const [query, setQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.GOOGLE);
  const [country, setCountry] = useState('GLOBAL');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeywordMetric[]>([]);
  const [recommendationText, setRecommendationText] = useState<string | null>(null);
  
  // SEO Tools State
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiTitle, setAiTitle] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [copyTitleSuccess, setCopyTitleSuccess] = useState(false);
  const [copyDescSuccess, setCopyDescSuccess] = useState(false);

  const platformsInfo = [
    { id: Platform.GOOGLE, name: 'Google Search', icon: '🔍', color: 'bg-blue-600' },
    { id: Platform.YOUTUBE, name: 'YouTube Trends', icon: '🎥', color: 'bg-red-600' },
    { id: Platform.TIKTOK, name: 'TikTok Hashtags', icon: '🎵', color: 'bg-black' },
    { id: Platform.FACEBOOK, name: 'Facebook Ads', icon: '👥', color: 'bg-blue-800' },
    { id: Platform.INSTAGRAM, name: 'Instagram Trends', icon: '📸', color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' },
    { id: Platform.PINTEREST, name: 'Pinterest Pins', icon: '📌', color: 'bg-red-500' },
  ];

  const currentPlatform = platformsInfo.find(p => p.id === selectedPlatform) || platformsInfo[0];

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setData([]);
    setRecommendationText(null);
    setAiTitle('');
    setAiDescription('');
    try {
      const results = await gemini.analyzeKeywords(query, selectedPlatform, country);
      setData(results);

      // توليد نصيحة ذكية تلقائية
      const avgStrength = results.reduce((acc, curr) => acc + (curr.strength || 0), 0) / (results.length || 1);
      if (avgStrength > 70) {
        setRecommendationText("هذا المجال واعد جداً! الكلمات المفتاحية المختارة تتمتع بقوة انتشار عالية ومنافسة متوسطة. ابدأ فوراً.");
      } else {
        setRecommendationText("المنافسة قوية في هذا النيش. ننصح بالتركيز على الكلمات الطويلة (Long-tail keywords) لضمان الظهور.");
      }

      // توليد العناوين والأوصاف بناءً على النتائج والمنصة المختارة
      handleGenerateCopy(results.map(r => r.keyword));

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء جلب البيانات.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCopy = async (keywords: string[]) => {
    if (keywords.length === 0) return;
    setIsGeneratingContent(true);
    try {
      const { title, description } = await gemini.generatePlatformContent(keywords, selectedPlatform, query);
      setAiTitle(title);
      setAiDescription(description);
    } catch (error) {
      console.error("Failed to generate AI copy", error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const copyToClipboard = (text: string, type: 'title' | 'desc') => {
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setCopyTitleSuccess(true);
      setTimeout(() => setCopyTitleSuccess(false), 2000);
    } else {
      setCopyDescSuccess(true);
      setTimeout(() => setCopyDescSuccess(false), 2000);
    }
  };

  const getLevelColor = (val: number) => {
    if (val >= 70) return 'text-green-600 bg-green-50';
    if (val >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 font-cairo text-right">
      {/* Search Console */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
            <span>🚀</span> تحليل الكلمات المتصدرة
          </h2>
          <select 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl text-xs font-black outline-none cursor-pointer"
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>
        </div>
        
        <div className="space-y-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`ابحث عن كلمات رائجة في ${currentPlatform.name}...`}
            className="w-full px-8 py-5 md:py-6 rounded-3xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 text-black font-black text-xl outline-none shadow-inner transition-all"
          />
          
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
              className="flex-1 px-8 py-4 rounded-2xl border-2 border-gray-100 bg-white font-black text-gray-700 outline-none appearance-none cursor-pointer"
            >
              {platformsInfo.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
            </select>

            <button
              onClick={handleSearch}
              disabled={loading}
              className={`${currentPlatform.color} text-white px-12 py-4 rounded-2xl font-black disabled:opacity-50 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3`}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "تحليل النيش المختار"}
            </button>
          </div>
        </div>
      </div>

      {data.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {/* Keywords List (Enhanced with Audience Size) */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <span className="bg-blue-50 p-2 rounded-xl text-blue-600">📊</span> الكلمات الأكثر بحثاً وقوة
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {data.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50/50 border border-gray-100 rounded-3xl group hover:bg-white hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sm font-black shadow-sm text-gray-400">{idx + 1}</span>
                    <div>
                      <h4 className="font-black text-lg text-gray-900">{item.keyword}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">حجم البحث: <span className="text-gray-600">{item.searchVolume}</span></p>
                        <p className="text-[10px] font-bold text-blue-400 uppercase">عدد الجمهور: <span className="text-blue-600">{item.audienceSize}</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black ${getLevelColor(item.strength)}`}>
                      قوة التصدر: {item.strength}%
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black ${getLevelColor(100 - item.competition)}`}>
                      المنافسة: {item.competition}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recommendationText && (
              <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                <p className="text-blue-900 font-bold text-sm leading-relaxed">
                  <span className="font-black">💡 نصيحة الخوارزمية:</span> {recommendationText}
                </p>
              </div>
            )}
          </div>

          {/* SEO AI Assistant Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Title Assistant */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full"></div>
               <h3 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10">
                 <span className="text-blue-600">✍️</span> عنوان {currentPlatform.name} مغناطيسي
               </h3>
               {isGeneratingContent ? (
                 <div className="h-32 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div></div>
               ) : (
                 <div className="space-y-4 relative z-10">
                    <textarea 
                      value={aiTitle} 
                      onChange={(e) => setAiTitle(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent p-5 rounded-2xl font-black text-lg outline-none focus:border-blue-500 h-32 resize-none"
                    />
                    <button 
                      onClick={() => copyToClipboard(aiTitle, 'title')}
                      className={`w-full py-4 rounded-xl font-black text-sm transition-all ${copyTitleSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}
                    >
                      {copyTitleSuccess ? '✅ تم النسخ' : '📋 نسخ العنوان'}
                    </button>
                 </div>
               )}
            </div>

            {/* Description Assistant */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 blur-3xl rounded-full"></div>
               <h3 className="text-xl font-black mb-1 flex items-center gap-3 relative z-10">
                 <span className="text-purple-600">📝</span> وصف مهيأ لخوارزمية {currentPlatform.name}
               </h3>
               <p className="text-[10px] text-gray-400 font-bold mb-5 mr-10 relative z-10 uppercase tracking-tighter">الترتيب: Hook -> Value -> Keywords -> CTA</p>
               {isGeneratingContent ? (
                 <div className="h-32 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div></div>
               ) : (
                 <div className="space-y-4 relative z-10">
                    <textarea 
                      value={aiDescription} 
                      onChange={(e) => setAiDescription(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent p-5 rounded-2xl font-bold text-xs leading-relaxed outline-none focus:border-purple-500 h-32 resize-none"
                    />
                    <button 
                      onClick={() => copyToClipboard(aiDescription, 'desc')}
                      className={`w-full py-4 rounded-xl font-black text-sm transition-all ${copyDescSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}
                    >
                      {copyDescSuccess ? '✅ تم النسخ' : '📋 نسخ الوصف'}
                    </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordTab;
