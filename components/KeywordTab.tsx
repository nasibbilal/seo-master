
import React, { useState, useEffect } from 'react';
import { Platform, KeywordMetric, ThemeColor, COUNTRIES } from '../types';
import { GeminiService } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const platformsInfo = [
    { id: Platform.GOOGLE, name: 'Google Search', icon: '🔍', color: 'bg-blue-600', hover: 'hover:bg-blue-700' },
    { id: Platform.YOUTUBE, name: 'YouTube Trends', icon: '🎥', color: 'bg-red-600', hover: 'hover:bg-red-700' },
    { id: Platform.TIKTOK, name: 'TikTok Hashtags', icon: '🎵', color: 'bg-black', hover: 'hover:bg-gray-900' },
    { id: Platform.FACEBOOK, name: 'Facebook Ads', icon: '👥', color: 'bg-blue-800', hover: 'hover:bg-blue-900' },
    { id: Platform.INSTAGRAM, name: 'Instagram Trends', icon: '📸', color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600', hover: 'hover:opacity-90' },
    { id: Platform.PINTEREST, name: 'Pinterest Pins', icon: '📌', color: 'bg-red-500', hover: 'hover:bg-red-600' },
  ];

  const currentPlatform = platformsInfo.find(p => p.id === selectedPlatform) || platformsInfo[0];

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setData([]);
    setRecommendationText(null);
    setSuccessMsg(false);
    setErrorMsg(null);
    try {
      const results = await gemini.analyzeKeywords(query, selectedPlatform, country, daysCount);
      setData(results);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 5000);

      const avgGoogle = results.reduce((acc, curr) => acc + (curr.googleScore || 0), 0) / (results.length || 1);
      const avgYoutube = results.reduce((acc, curr) => acc + (curr.youtubeScore || 0), 0) / (results.length || 1);

      if (selectedPlatform === Platform.TIKTOK) {
        setRecommendationText("تيك توك منصة تفاعلية سريعة؛ هذه الهاشتاقات في أوج قوتها الآن. ركز على المحتوى القصير التفاعلي.");
      } else if (selectedPlatform === Platform.INSTAGRAM) {
        setRecommendationText("إنستقرام محرك بحث بصري واجتماعي؛ استخدم هذه الكلمات في العناوين والوسوم (Hashtags) لزيادة الوصول.");
      } else if (selectedPlatform === Platform.PINTEREST) {
        setRecommendationText("بينتريست محرك بحث بصري؛ الصور المصغرة الطولية (Portrait) هي المفتاح لزيادة الحفظ والزيارات.");
      } else if (avgYoutube > avgGoogle * 1.3) {
        setRecommendationText("هذا المحتوى مرئي بامتياز! نوصي بالتركيز على يوتيوب واستخدام كلماتك المفتاحية في أول 30 حرفاً من العنوان.");
      } else if (avgGoogle > avgYoutube) {
        setRecommendationText("جمهورك يبحث عن معلومات عميقة؛ تدوينة مفصلة ستتصدر نتائج البحث هنا.");
      } else {
        setRecommendationText("توازن مثالي! ننصح باستراتيجية هجينة بين البحث النصي والمحتوى المرئي.");
      }
    } catch (error: any) {
      if (error.message?.includes("MISSING_KEY")) {
        setErrorMsg(`يرجى إدخال مفتاح الـ API لـ ${currentPlatform.name} في صفحة الإعدادات لتفعيل جلب البيانات الحقيقية.`);
      } else {
        setErrorMsg("حدث خطأ أثناء جلب البيانات. تأكد من صحة المفاتيح في الإعدادات.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (p?: Platform) => {
    return platformsInfo.find(info => info.id === p)?.icon || '⚡';
  };

  const getVolumeColor = (volume: string) => {
    const v = volume?.toLowerCase();
    if (v === 'high') return '#22c55e'; 
    if (v === 'medium') return '#f59e0b'; 
    if (v === 'low') return '#ef4444'; 
    return '#94a3b8';
  };

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 font-cairo">
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-100 rounded-3xl text-green-700 font-black text-center animate-bounce shadow-sm text-xs md:text-sm">
          ✅ تم جلب البيانات بنجاح من {currentPlatform.name}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-3xl text-red-700 font-black text-center shadow-sm flex flex-col md:flex-row items-center justify-center gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-2"><span>⚠️</span> {errorMsg}</div>
          <button onClick={() => window.location.hash = 'settings'} className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] md:text-xs">اذهب للإعدادات</button>
        </div>
      )}

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl border border-gray-100 mb-6 md:mb-10 transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
              <span>🚀</span> تحليل السوق المستهدف
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              نظام جلب مباشر: {currentPlatform.name}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-[10px] font-black text-gray-400 whitespace-nowrap">المنطقة:</span>
            <select 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-gray-100 border-none px-4 py-2 rounded-xl text-[10px] md:text-xs font-black outline-none cursor-pointer w-full md:w-auto"
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="w-full">
            <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 md:mr-4 uppercase">كلمة البحث</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`ابحث في ${currentPlatform.name}...`}
              className="w-full px-6 md:px-10 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-white border-2 border-gray-200 text-black font-black text-lg md:text-2xl outline-none transition-all focus:border-blue-500 shadow-sm"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 md:mr-4 uppercase">المنصة</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                className="w-full px-6 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] border-2 border-gray-100 bg-white outline-none font-black text-gray-700 shadow-sm appearance-none cursor-pointer text-sm md:text-lg"
              >
                {platformsInfo.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-[2] flex flex-col">
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 md:mr-4 uppercase">تأكيد</label>
              <button
                onClick={handleSearch}
                disabled={loading}
                className={`${currentPlatform.color} ${currentPlatform.hover} w-full text-white px-6 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] transition-all font-black disabled:opacity-50 shadow-lg flex items-center justify-center gap-4 text-sm md:text-xl active:scale-95`}
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>تحليل {currentPlatform.name}</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {data.length > 0 && (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
              <h3 className="text-sm md:text-xl font-black mb-6 md:mb-10 flex items-center gap-3">
                <span className="bg-gray-100 p-2 rounded-xl">📊</span> المنافسة مقابل الطلب
              </h3>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="keyword" tick={{ fontSize: 8, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontSize: '10px' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }}/>
                    <Bar dataKey="competition" name="المنافسة" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={10} />
                    <Bar dataKey="strength" name="الفرصة" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
              <h3 className="text-sm md:text-xl font-black mb-6 md:mb-10 flex items-center gap-3">
                <span className="bg-gray-100 p-2 rounded-xl">⚡</span> نية بحث الجمهور
              </h3>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="keyword" tick={{ fontSize: 8, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontSize: '10px' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }}/>
                    <Bar dataKey="googleScore" name="معلوماتية" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={10} />
                    <Bar dataKey="youtubeScore" name="تفاعلية" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {recommendationText && (
            <div className="p-6 md:p-10 bg-amber-50 rounded-[2rem] md:rounded-[3rem] border-2 border-amber-100 flex flex-col md:flex-row items-start gap-4 md:gap-8 shadow-sm">
              <div className="bg-white p-3 md:p-5 rounded-2xl shadow-md text-2xl md:text-4xl">💡</div>
              <div className="flex-1">
                <h4 className="text-amber-900 font-black text-lg md:text-2xl mb-2">تحليل SEO Master لبيانات {currentPlatform.name}</h4>
                <p className="text-amber-800 font-bold text-sm md:text-lg leading-relaxed">{recommendationText}</p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-sm md:text-xl font-black mb-6 flex items-center gap-3">
              <span className="bg-gray-100 p-2 rounded-xl">💎</span> فرص النمو المكتشفة
            </h3>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-right min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-gray-50">
                    <th className="py-4 px-2 text-[10px] text-gray-400 font-black uppercase">الكلمة</th>
                    <th className="py-4 px-2 text-[10px] text-gray-400 font-black uppercase text-center">الجمهور</th>
                    <th className="py-4 px-2 text-[10px] text-gray-400 font-black uppercase text-center">حجم البحث</th>
                    <th className="py-4 px-2 text-[10px] text-gray-400 font-black uppercase text-center">قوة الفرصة</th>
                    <th className="py-4 px-2 text-[10px] text-gray-400 font-black uppercase text-center">المنصة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-all border-b border-gray-50/50">
                      <td className="py-4 px-2">
                        <p className="font-black text-gray-900 text-sm md:text-base">{item.keyword}</p>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className="font-black text-blue-600 text-sm">{item.audienceSize || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-4 py-1.6 rounded-xl text-[10px] font-black text-white ${
                          item.searchVolume?.toLowerCase() === 'high' ? 'bg-green-500' : 'bg-amber-500'
                        }`}>
                          {item.searchVolume || 'Medium'}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center gap-2">
                           <div className="w-16 md:w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full" style={{ width: `${item.strength}%`, backgroundColor: getVolumeColor(item.searchVolume) }}></div>
                           </div>
                           <span className="text-[10px] font-black text-gray-900">{item.strength}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">
                          {getPlatformIcon(selectedPlatform)} {selectedPlatform}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordTab;
