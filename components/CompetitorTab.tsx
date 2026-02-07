
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Platform, CompetitorData, ThemeColor, CommentGapInsight } from '../types';

const gemini = new GeminiService();

interface CompetitorTabProps {
  theme: ThemeColor;
}

const CompetitorTab: React.FC<CompetitorTabProps> = ({ theme }) => {
  const [competitorId, setCompetitorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [hunting, setHunting] = useState(false);
  const [results, setResults] = useState<CompetitorData[]>([]);
  const [commentGaps, setCommentGaps] = useState<CommentGapInsight | null>(null);

  const handleAnalyze = async () => {
    if (!competitorId) return;
    setLoading(true);
    setCommentGaps(null);
    try {
      const data = await gemini.analyzeCompetitor(competitorId, [Platform.YOUTUBE, Platform.TIKTOK]);
      setResults(data);
    } catch (error) {
      alert("فشل جلب بيانات المنافس. تأكد من إعدادات الـ API للقناة الحالية.");
    } finally {
      setLoading(false);
    }
  };

  const handleHuntGaps = async (platform: Platform) => {
    setHunting(true);
    setCommentGaps(null);
    try {
      const gaps = await gemini.huntCommentGaps(competitorId, platform);
      setCommentGaps(gaps);
    } catch (error) {
      alert("فشل صيد الفجوات. يرجى المحاولة لاحقاً.");
    } finally {
      setHunting(false);
    }
  };

  const themeClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  }[theme];

  return (
    <div className="max-w-7xl mx-auto p-4 font-cairo text-right">
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 mb-10">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
          <span className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl">🕵️</span>
          وحدة استخبارات المنافسين (Spy Mode)
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={competitorId}
            onChange={(e) => setCompetitorId(e.target.value)}
            placeholder="أدخل رابط قناة المنافس أو اسم المستخدم..."
            className="flex-1 px-8 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none font-bold shadow-inner transition-all"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`${themeClasses} text-white px-10 py-5 rounded-2xl font-black disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95`}
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "بدء المسح العميق"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-black text-xl mb-4 flex items-center gap-2">📊 ملخص الأداء المكتشف</h3>
              {results.map((res, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-center mb-6">
                    <span className={`px-4 py-2 rounded-xl font-black text-[10px] text-white ${res.platform === Platform.YOUTUBE ? 'bg-red-600' : 'bg-black'}`}>{res.platform}</span>
                    <button 
                      onClick={() => handleHuntGaps(res.platform)}
                      disabled={hunting}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                    >
                      {hunting ? 'جاري الصيد...' : '🎯 صيد الأسئلة المكررة'}
                    </button>
                  </div>

                  <div className="mb-6">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">أكثر العناوين مشاهدة</p>
                     <ul className="space-y-2">
                       {res.topTitles.map((title, idx) => (
                         <li key={idx} className="bg-gray-50 p-3 rounded-xl text-xs font-bold border-r-4 border-blue-500 truncate">{title}</li>
                       ))}
                     </ul>
                  </div>

                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">الوسوم المستخدمة (Secret Tags)</p>
                     <div className="flex flex-wrap gap-2">
                        {res.topKeywords.map((kw, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black">#{kw}</span>
                        ))}
                     </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
               <h3 className="font-black text-xl mb-4 flex items-center gap-2">🧠 تحليل SWOT الاحترافي</h3>
               {results[0]?.swot && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100">
                      <h4 className="font-black text-green-700 mb-3 flex items-center gap-2 text-sm"><span>💪</span> نقاط القوة</h4>
                      <ul className="text-[10px] font-bold text-green-800 space-y-2">
                        {results[0].swot.strengths.map((s, idx) => <li key={idx}>• {s}</li>)}
                      </ul>
                    </div>

                    <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
                      <h4 className="font-black text-red-700 mb-3 flex items-center gap-2 text-sm"><span>📉</span> نقاط الضعف</h4>
                      <ul className="text-[10px] font-bold text-red-800 space-y-2">
                        {results[0].swot.weaknesses.map((s, idx) => <li key={idx}>• {s}</li>)}
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 col-span-1 md:col-span-2">
                      <h4 className="font-black text-blue-700 mb-3 flex items-center gap-2 text-sm"><span>🎯</span> فجوات المنافس</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results[0].swot.opportunities.map((s, idx) => (
                          <div key={idx} className="bg-white/60 p-3 rounded-xl text-[10px] font-black text-blue-900 border border-blue-200 shadow-sm flex items-center gap-2">
                             <span className="text-blue-500">✨</span> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {commentGaps && (
            <div className="bg-slate-900 rounded-[3.5rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600"></div>
               
               <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                     <div>
                        <h3 className="text-3xl font-black mb-3 flex items-center gap-4">
                           <span className="bg-red-600 p-2 rounded-xl text-xl">🎯</span>
                           خطة الأسئلة المكررة (Recurring Questions Engine)
                        </h3>
                        <p className="text-gray-400 font-bold">هذه الأسئلة تكررت بكثرة في تعليقات المنافس ولم تجد إجابة وافية.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                     <div className="xl:col-span-2 space-y-8">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                           <h4 className="font-black text-lg mb-6 flex items-center gap-3 text-blue-400">
                             <span>💬</span> الأسئلة الأكثر تكراراً المكتشفة
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {commentGaps.recurringQuestions.map((q, i) => (
                                 <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0">{i+1}</span>
                                    <p className="text-sm font-bold text-gray-300">{q}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                        <h4 className="font-black text-lg mb-6 text-green-400">الاستراتيجية المغناطيسية</h4>
                        <div className="space-y-6">
                           <div>
                              <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">العنوان المقترح لضرب المنافس</span>
                              <p className="text-sm font-black text-white p-3 bg-white/5 rounded-xl border border-white/10">{commentGaps.blueprint.magneticTitle}</p>
                           </div>
                           <div>
                              <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">تأثير الخوارزمية</span>
                              <p className="text-xs text-gray-400 leading-relaxed italic">{commentGaps.blueprint.algorithmImpact}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitorTab;
