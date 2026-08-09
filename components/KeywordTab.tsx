
import React, { useState, useEffect } from 'react';
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
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [aiTitle, setAiTitle] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);

  const platformsInfo = [
    { id: Platform.GOOGLE, name: 'جوجل 🔍', icon: '🔍', color: 'bg-blue-600' },
    { id: Platform.YOUTUBE, name: 'يوتيوب 🎥', icon: '🎥', color: 'bg-red-600' },
    { id: Platform.TIKTOK, name: 'تيك توك 🎵', icon: '🎵', color: 'bg-black' },
    { id: Platform.FACEBOOK, name: 'فيسبوك 👥', icon: '👥', color: 'bg-blue-800' },
    { id: Platform.INSTAGRAM, name: 'إنستغرام 📸', icon: '📸', color: 'bg-pink-600' },
    { id: Platform.PINTEREST, name: 'بينتريست 📌', icon: '📌', color: 'bg-red-500' },
  ];

  const currentPlat = platformsInfo.find(p => p.id === selectedPlatform) || platformsInfo[0];

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setQuotaExceeded(false);
    setData([]);
    setAiTitle('');
    setAiDescription('');
    setActiveKeyword(null);
    try {
      const results = await gemini.analyzeKeywords(query, selectedPlatform, country);
      setData(results);
      if (results.length > 0) {
        // توليد تلقائي باستخدام الكلمة الأولى والموضوع الرئيسي
        await generateContent(results.map(r => r.keyword), query);
      }
    } catch (e: any) {
      if (e.message === "QUOTA_EXHAUSTED") setQuotaExceeded(true);
      else alert("حدث خطأ في الاتصال بالذكاء الاصطناعي.");
    } finally { setLoading(false); }
  };

  const generateContent = async (keywords: string[], topic: string) => {
    setGenLoading(true);
    try {
      const { title, description } = await gemini.generatePlatformContent(keywords, selectedPlatform, topic);
      setAiTitle(title);
      setAiDescription(description);
    } catch (e) {
      console.error("Failed to generate content", e);
    } finally { setGenLoading(false); }
  };

  const handleKeywordClick = (keyword: string) => {
    if (genLoading) return;
    setActiveKeyword(keyword);
    generateContent([keyword], keyword);
  };

  const handleCopy = (text: string, type: 'title' | 'desc') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const getStatus = (strength: number) => {
    if (strength >= 90) return { label: '🔥 ممتاز جداً', color: 'bg-green-100 text-green-700 border-green-200' };
    if (strength >= 80) return { label: '🌟 ممتاز', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (strength >= 65) return { label: '✅ جيد جداً', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (strength >= 50) return { label: '⚖️ متوسط', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    if (strength >= 30) return { label: '⚠️ ضعيف', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: '❌ سيء جداً', color: 'bg-red-100 text-red-700 border-red-200' };
  };

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-4 font-cairo text-right">
      {quotaExceeded && <div className="bg-amber-50 p-4 md:p-6 rounded-2xl mb-6 font-black text-amber-700 border-2 border-amber-100 text-xs sm:text-sm text-center">⏳ حصة المفتاح مستنفدة حالياً. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.</div>}

      <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 shadow-sm border border-gray-100 mb-8 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4">
          <h2 className="text-xl md:text-3xl font-black text-gray-900 flex items-center gap-3">🚀 الاستخبارات البحثية</h2>
          <select value={country} onChange={e => setCountry(e.target.value)} className="bg-gray-100 px-4 py-2 rounded-xl text-[10px] font-black outline-none border border-gray-200 cursor-pointer w-full sm:w-auto">
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>
        </div>

        <div className="space-y-4 md:space-y-6">
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder={`نيش أو موضوع في ${currentPlat.name}...`} 
            className="w-full px-6 md:px-8 py-4 md:py-6 rounded-xl md:rounded-3xl bg-gray-50 border-2 border-transparent focus:border-blue-500 font-black text-lg md:text-2xl outline-none shadow-inner" 
          />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={selectedPlatform} 
              onChange={e => setSelectedPlatform(e.target.value as Platform)} 
              className="flex-1 px-6 py-3.5 md:py-5 rounded-xl md:rounded-2xl border-2 border-gray-100 bg-white font-black text-sm md:text-lg outline-none cursor-pointer focus:border-blue-500"
            >
              {platformsInfo.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button 
              onClick={handleSearch} 
              disabled={loading} 
              className="px-8 py-3.5 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-xl shadow-lg hover:bg-black disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'بدء المسح'}
            </button>
          </div>
        </div>
      </div>

      {(data.length > 0 || aiTitle) && (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
           {/* AI Recommendations Section */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-2 bg-blue-600"></div>
                 <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-2">
                    <div className="flex flex-col">
                      <h3 className="font-black text-md md:text-xl text-blue-600 flex items-center gap-2">
                        <span>✍️</span> العنوان المقترح ({currentPlat.name})
                      </h3>
                      {activeKeyword && <span className="text-[10px] font-bold text-gray-400">مخصص للكلمة: {activeKeyword}</span>}
                    </div>
                    {aiTitle && !genLoading && (
                      <button 
                        onClick={() => handleCopy(aiTitle, 'title')}
                        className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${copiedTitle ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-blue-600 hover:text-white'}`}
                      >
                        {copiedTitle ? '✅ تم' : '📋 نسخ'}
                      </button>
                    )}
                 </div>
                 {genLoading ? (
                   <div className="h-24 flex flex-col items-center justify-center gap-2 animate-pulse bg-gray-50 rounded-xl">
                     <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
                     <span className="text-[10px] font-black text-blue-600">الذكاء الاصطناعي يحلل الخوارزميات...</span>
                   </div>
                 ) : (
                   <div className="bg-blue-50/50 p-4 md:p-6 rounded-xl font-black text-md md:text-xl border-r-4 md:border-r-8 border-blue-600 text-gray-900 shadow-inner min-h-[100px] flex items-center leading-relaxed">
                     {aiTitle || 'أدخل موضوعاً للبدء'}
                   </div>
                 )}
              </div>

              <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-2 bg-purple-600"></div>
                 <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-2">
                    <div className="flex flex-col">
                      <h3 className="font-black text-md md:text-xl text-purple-600 flex items-center gap-2">
                        <span>📝</span> وصف SEO الاستراتيجي
                      </h3>
                    </div>
                    {aiDescription && !genLoading && (
                      <button 
                        onClick={() => handleCopy(aiDescription, 'desc')}
                        className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${copiedDesc ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-purple-600 hover:text-white'}`}
                      >
                        {copiedDesc ? '✅ تم' : '📋 نسخ'}
                      </button>
                    )}
                 </div>
                 {genLoading ? (
                   <div className="h-24 flex flex-col items-center justify-center gap-2 animate-pulse bg-gray-50 rounded-xl">
                     <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin"></div>
                     <span className="text-[10px] font-black text-purple-600">جاري صياغة وصف يتصدر النتائج...</span>
                   </div>
                 ) : (
                   <div className="bg-purple-50/50 p-4 md:p-6 rounded-xl font-bold text-[11px] md:text-xs leading-relaxed text-gray-700 border-r-4 md:border-r-8 border-purple-600 shadow-inner min-h-[100px] overflow-y-auto max-h-[150px]">
                     {aiDescription || 'أدخل موضوعاً للبدء'}
                   </div>
                 )}
              </div>
           </div>

           {/* Metrics Table */}
           <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-sm border border-gray-100 overflow-x-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-3">
                <h3 className="font-black text-lg md:text-2xl flex items-center gap-3">📊 تحليل الخوارزمية واستخراج الفجوات</h3>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                  اضغط على أي كلمة لتوليد محتوى مخصص لها
                </span>
              </div>
              <div className="space-y-4">
                 {data.map((it, i) => {
                   const status = getStatus(it.strength);
                   const isSelected = activeKeyword === it.keyword;
                   return (
                     <div 
                       key={i} 
                       onClick={() => handleKeywordClick(it.keyword)}
                       className={`flex flex-col md:flex-row justify-between md:items-center p-5 md:p-8 rounded-2xl border transition-all cursor-pointer gap-4 ${isSelected ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-xl'}`}
                     >
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-md shrink-0 transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>{i+1}</span>
                          <div>
                            <h4 className="font-black text-md md:text-xl text-gray-900 mb-0.5">{it.keyword}</h4>
                            <span className="text-[9px] bg-white px-2 py-0.5 rounded-lg font-black border border-gray-100 text-gray-500 inline-flex items-center gap-1">
                              {currentPlat.icon} {currentPlat.name}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center border-t md:border-t-0 pt-4 md:pt-0">
                          <div className="text-right sm:text-center">
                            <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5">البحث الشهري</p>
                            <p className="font-black text-sm md:text-lg text-gray-800">{it.searchVolume}</p>
                          </div>
                          <div className="text-right sm:text-center">
                            <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5">المنافسة</p>
                            <p className="font-black text-sm md:text-lg text-amber-600">{it.competition}%</p>
                          </div>
                          <div className="text-right sm:text-center">
                            <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5">الفرصة</p>
                            <p className="font-black text-sm md:text-lg text-green-600">{it.strength}%</p>
                          </div>
                          <div className="col-span-2 sm:col-span-1 flex justify-center">
                            <span className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-[9px] font-black uppercase text-center border ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KeywordTab;
