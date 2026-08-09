
import React, { useState, useEffect, useMemo } from 'react';
import { GeminiService } from '../services/geminiService';
import { Platform, RadarInsight, ThemeColor, CATEGORIES, COUNTRIES, GapAnalysis } from '../types';
import { openDirectAdLink } from '../utils/adHelper';

const gemini = new GeminiService();

const RadarTab: React.FC<{ theme: ThemeColor; daysCount: number; onTrendDetected?: (title: string) => void }> = ({ theme, daysCount, onTrendDetected }) => {
  const [selectedCategory, setSelectedCategory] = useState('tech');
  const [selectedCountry, setSelectedCountry] = useState('GLOBAL');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.YOUTUBE);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<RadarInsight[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [strategyResult, setStrategyResult] = useState<{ [key: string]: { title: string, desc: string } }>({});
  const [genId, setGenId] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const handleScan = async () => {
    openDirectAdLink();
    setLoading(true);
    setGapAnalysis(null);
    setStrategyResult({});
    try {
      const data = await gemini.fetchRadarTrends(selectedCategory, selectedCountry, daysCount, selectedPlatform);
      setInsights(data || []);
      if (data && data.length > 0) {
        const topTrend = data[0];
        const gap = await gemini.checkContentGap(topTrend.title);
        setGapAnalysis(gap);
        if (gap.isGap && onTrendDetected) onTrendDetected(topTrend.title);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleGen = async (trend: RadarInsight) => {
    setGenId(trend.id);
    try {
      const res = await gemini.generatePlatformContent([trend.title], trend.platform as Platform, trend.title);
      setStrategyResult(prev => ({ ...prev, [trend.id]: { title: res.title, desc: res.description } }));
    } finally { setGenId(null); }
  };

  const handleCopy = (text: string, type: 'title' | 'desc') => {
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const parseVol = (v?: string) => {
    if (!v) return 0;
    const n = v.toUpperCase().replace(/,/g, '');
    if (n.endsWith('M')) return parseFloat(n) * 1000000;
    if (n.endsWith('K')) return parseFloat(n) * 1000;
    return parseFloat(n) || 0;
  };

  const sorted = useMemo(() => {
    if (!Array.isArray(insights)) return [];
    return [...insights].sort((a, b) => parseVol(b.searchVolume) - parseVol(a.searchVolume));
  }, [insights]);

  const platformOptions = [
    { id: Platform.YOUTUBE, name: 'يوتيوب 🎥', icon: '🎥' },
    { id: Platform.TIKTOK, name: 'تيك توك 🎵', icon: '🎵' },
    { id: Platform.GOOGLE, name: 'جوجل 🔍', icon: '🔍' },
    { id: Platform.INSTAGRAM, name: 'إنستغرام 📸', icon: '📸' },
    { id: Platform.FACEBOOK, name: 'فيسبوك 👥', icon: '👥' },
    { id: Platform.PINTEREST, name: 'بينتريست 📌', icon: '📌' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 font-cairo text-right">
      <div className="bg-white rounded-2xl md:rounded-[3rem] p-6 md:p-12 shadow-xl border border-gray-100 mb-8 md:mb-10">
        <h2 className="text-xl md:text-3xl font-black mb-8 flex items-center gap-3">📡 الرادار الذكي للاستخبارات</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          <div>
            <label className="text-[9px] font-black text-gray-400 mb-1.5 block uppercase tracking-widest">التخصص (Niche)</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 font-bold outline-none cursor-pointer focus:border-blue-500 transition-all text-sm">
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black text-gray-400 mb-1.5 block uppercase tracking-widest">المنصة</label>
            <select value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value as Platform)} className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 font-bold outline-none cursor-pointer focus:border-blue-500 transition-all text-sm">
              {platformOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-[9px] font-black text-gray-400 mb-1.5 block uppercase tracking-widest">النطاق الجغرافي</label>
            <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 font-bold outline-none cursor-pointer focus:border-blue-500 transition-all text-sm">
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={handleScan} 
          disabled={loading} 
          className="w-full px-10 py-4.5 rounded-xl md:rounded-[2rem] bg-slate-900 text-white font-black text-md md:text-xl shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>🔥</span> بدء المسح والتحليل المباشر</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">📊 نتائج الرصد المباشر</h3>
          {sorted && sorted.length > 0 ? (
            <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[500px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase">الكلمة / المنصة</th>
                    <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase text-center">الطلب</th>
                    <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(ins => {
                    const platInfo = platformOptions.find(p => p.id === ins.platform);
                    return (
                      <React.Fragment key={ins.id}>
                        <tr className="border-b border-gray-50 hover:bg-gray-50/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-lg font-black">{platInfo?.icon || '🌐'}</span>
                              <span className="font-black text-gray-900 text-sm">{ins.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-black text-[9px] border border-blue-100">{ins.searchVolume || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleGen(ins)} 
                              className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black hover:bg-black transition-all shadow-md"
                            >
                              {genId === ins.id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'توليد خطة'}
                            </button>
                          </td>
                        </tr>
                        {strategyResult[ins.id] && (
                          <tr>
                            <td colSpan={3} className="px-4 py-3 bg-blue-50/10">
                              <div className="p-5 rounded-2xl border border-blue-100 bg-white shadow-sm animate-in fade-in slide-in-from-top-1">
                                <div className="mb-3">
                                  <span className="text-[9px] font-black text-blue-600 uppercase mb-1 block">العنوان الجاذب:</span>
                                  <p className="text-xs font-black text-gray-900 leading-snug">{strategyResult[ins.id].title}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] font-black text-purple-600 uppercase mb-1 block">خطة التنفيذ:</span>
                                  <p className="text-[10px] font-bold text-gray-600 leading-relaxed">{strategyResult[ins.id].desc}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-2xl border-4 border-dashed border-gray-100 opacity-40">
              <span className="text-5xl mb-4 block">🔭</span>
              <p className="font-black text-gray-400 text-sm">الرادار بانتظار مسح التوجهات الحالية..</p>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-8 h-fit">
           <h3 className="text-lg font-black mb-4 flex items-center gap-2">
             <span className="text-blue-600">⬛</span> المربع الأسود (تحليل الفجوات)
           </h3>
           <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-10 text-white min-h-[450px] shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full"></div>
              {gapAnalysis ? (
                <div className="animate-in slide-in-from-top-4 relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl">🎯</span>
                    <div>
                      <h4 className="text-xl font-black leading-tight">فجوة مكتشفة!</h4>
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{gapAnalysis.urgency}</p>
                    </div>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                      <span className="text-[9px] font-black text-gray-500 uppercase block mb-3">الكلمات المفتاحية للأهداف 🚀</span>
                      <div className="flex flex-wrap gap-2">
                        {gapAnalysis.exploitKeywords?.map((kw, idx) => (
                          <span key={idx} className="bg-blue-600/30 text-white px-3 py-1.5 rounded-lg text-[10px] font-black">#{kw}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="group">
                        <span className="text-[9px] font-black text-blue-500 uppercase block mb-2 mr-1">العنوان المقترح للتصدر</span>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-xs font-black text-gray-100 flex justify-between items-center group-hover:bg-white/10 transition-all">
                          <span className="truncate flex-1">{gapAnalysis.suggestedTitle}</span>
                          <button onClick={() => handleCopy(gapAnalysis.suggestedTitle, 'title')} className={`text-[8px] px-2 py-1.5 rounded-lg shrink-0 mr-2 transition-all ${copiedTitle ? 'bg-green-600' : 'bg-white/10 hover:text-white'}`}>
                            {copiedTitle ? '✓ تم' : '📋 نسخ'}
                          </button>
                        </div>
                      </div>

                      <div className="group">
                        <span className="text-[9px] font-black text-purple-500 uppercase block mb-2 mr-1">وصف SEO الاستراتيجي</span>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-[10px] font-bold text-gray-400 leading-relaxed group-hover:bg-white/10 transition-all relative">
                          <p className="mb-8">{gapAnalysis.suggestedDesc}</p>
                          <button onClick={() => handleCopy(gapAnalysis.suggestedDesc, 'desc')} className={`absolute bottom-3 left-3 text-[8px] px-2 py-1.5 rounded-lg transition-all ${copiedDesc ? 'bg-green-600 text-white font-black' : 'bg-white/10 hover:text-white'}`}>
                            {copiedDesc ? '✓ تم النسخ' : '📋 نسخ الوصف'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-25 text-center py-12">
                  <span className="text-6xl mb-4 block">🔭</span>
                  <p className="text-lg font-black">بانتظار تحليل الرادار..</p>
                  <p className="text-[10px] font-bold mt-2">سيتم جلب أفضل الكلمات لضرب النتائج فور الاكتشاف.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RadarTab;
