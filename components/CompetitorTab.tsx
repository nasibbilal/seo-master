
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Platform, CompetitorData, ThemeColor, EnhancedCompetitorData } from '../types';

const gemini = new GeminiService();

const CompetitorTab: React.FC<{ theme: ThemeColor }> = ({ theme }) => {
  const [competitorInput, setCompetitorInput] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.YOUTUBE);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EnhancedCompetitorData[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!competitorInput) return;
    setLoading(true);
    setResults([]);
    try {
      const data = await gemini.analyzeCompetitor(competitorInput, [selectedPlatform]);
      if (data && Array.isArray(data) && data.length > 0) {
        setResults(data as EnhancedCompetitorData[]);
      } else {
        alert("لم يتمكن النظام من سحب بيانات الرابط. تأكد من صحة الرابط أو مفتاح الـ API في الإعدادات.");
      }
    } catch (error) {
      alert("خطأ في الاتصال بالاستخبارات. يرجى مراجعة إعدادات الـ API.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const themeClasses = {
    red: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
    purple: 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20',
  }[theme];

  const platformsList = [
    { id: Platform.YOUTUBE, name: 'يوتيوب 🎥' },
    { id: Platform.TIKTOK, name: 'تيك توك 🎵' },
    { id: Platform.INSTAGRAM, name: 'إنستغرام 📸' },
    { id: Platform.FACEBOOK, name: 'فيسبوك 👥' },
    { id: Platform.GOOGLE, name: 'جوجل 🔍' },
    { id: Platform.PINTEREST, name: 'بينتريست 📌' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-cairo text-right">
      <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 shadow-2xl border border-gray-100 mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50 transition-colors"></div>
        <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-10 flex items-center gap-4 relative z-10">
          <span className="bg-slate-900 text-white w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-xl">🕵️</span>
          استخبارات المنافسين (صيد فجوات التعليقات)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest mr-4">رابط فيديو المنافس</label>
            <div className="relative">
              <input
                type="text"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-8 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none font-bold text-gray-800 shadow-inner transition-all"
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">🔗</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest mr-4">تحديد المنصة</label>
            <select 
              value={selectedPlatform} 
              onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
              className="w-full px-6 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent font-bold outline-none cursor-pointer focus:bg-white focus:border-blue-500 transition-all appearance-none"
            >
              {platformsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`${themeClasses} text-white w-full py-5 rounded-[1.5rem] font-black disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 h-[68px] text-lg`}
            >
              {loading ? <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : "بدء التجسس والتحليل"}
            </button>
          </div>
        </div>
      </div>

      {(results || []).length > 0 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <h3 className="font-black text-2xl mb-2 flex items-center gap-3">
                <span className="text-blue-600">📊</span> تفكيك استراتيجية المنافس
              </h3>
              {results.map((res, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-6">
                  <div className="flex items-center gap-4 mb-4 border-b border-gray-50 pb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-xl">👤</div>
                    <span className="font-black text-xl">{res.competitorName}</span>
                  </div>

                  <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-black text-blue-600 uppercase mb-3 block tracking-widest">أسئلة الجمهور (فجوات التعليقات) ❓</span>
                    <ul className="space-y-3">
                      {(res.audienceQuestions || []).length > 0 ? (
                        res.audienceQuestions?.map((q, idx) => (
                          <li key={idx} className="text-xs font-black text-gray-700 flex gap-2">
                            <span className="text-blue-500">•</span> {q}
                          </li>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">لا توجد أسئلة مكتشفة</p>
                      )}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-purple-600 uppercase mb-3 block tracking-widest">الهاشتاغات المستخدمة 🏷️</span>
                    <div className="flex flex-wrap gap-3">
                      {res.hashtags?.map((tag, idx) => (
                        <span key={idx} className="bg-purple-50 text-purple-700 px-5 py-2 rounded-xl text-xs font-black border border-purple-100 shadow-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              <h3 className="font-black text-2xl mb-2 flex items-center gap-3">
                <span className="text-red-600">🗣️</span> محتوى الفيديو (التحليل الصوتي)
              </h3>
              <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden h-full flex flex-col border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full"></div>
                <div className="relative z-10 flex-1">
                   <div className="bg-white/5 p-4 rounded-xl mb-6 border border-white/10 flex items-center gap-3">
                      <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ملخص ما قاله المنافس</span>
                   </div>
                   <p className="text-base font-bold text-gray-300 leading-loose">
                      {results[0]?.whatWasSaid || "الذكاء الاصطناعي يستخرج أهم النقاط الكلامية..."}
                   </p>
                </div>
                <div className="mt-8 bg-blue-600/20 p-4 rounded-2xl border border-blue-500/30 text-center">
                  <span className="text-[10px] font-black text-blue-400">سر تفضيل الخوارزمية: {results[0]?.algoReason}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-[3.5rem] md:rounded-[5rem] p-10 md:p-20 text-white shadow-[0_35px_80px_rgba(220,38,38,0.3)] relative overflow-hidden border-8 border-white group">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/10 blur-[120px] rounded-full group-hover:bg-white/20 transition-all"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
                <div className="bg-white text-red-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl animate-bounce">🚀</div>
                <div className="text-center md:text-right">
                  <h3 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">خطة الهجوم المضاد (خوارزمية الأجوبة)</h3>
                  <p className="text-red-100 text-lg font-bold">الوصف بالأسفل مدمج به أجوبة ذكية لأسئلة جمهور المنافس لتظهر أنت كخبير أول لديهم.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-inner group hover:bg-white/20 transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-red-200 uppercase tracking-widest">العنوان المتفوق ✍️</span>
                    <button 
                      onClick={() => handleCopy(results[0]?.counterAttack?.title || "", 'atktitle')}
                      className={`text-[10px] px-5 py-2 rounded-xl font-black transition-all ${copied === 'atktitle' ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white'}`}
                    >
                      {copied === 'atktitle' ? '✓ تم النسخ' : '📋 نسخ'}
                    </button>
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-white leading-tight">
                    {results[0]?.counterAttack?.title || "جاري توليد العنوان..."}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-inner group hover:bg-white/20 transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-red-200 uppercase tracking-widest">وصف الـ SEO (يحتوي على الأجوبة الذكية) 📝</span>
                    <button 
                      onClick={() => handleCopy(results[0]?.counterAttack?.description || "", 'atkdesc')}
                      className={`text-[10px] px-5 py-2 rounded-xl font-black transition-all ${copied === 'atkdesc' ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white'}`}
                    >
                      {copied === 'atkdesc' ? '✓ تم النسخ' : '📋 نسخ'}
                    </button>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-red-50 leading-loose opacity-80">
                    {results[0]?.counterAttack?.description || "جاري كتابة وصف استراتيجي يجيب على تساؤلات الجمهور..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(results || []).length === 0 && !loading && (
        <div className="p-32 text-center bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-6xl shadow-sm mb-8">🕵️‍♂️</div>
          <p className="font-black text-gray-400 text-2xl">بانتظار الرابط لسحب أسئلة الجمهور..</p>
          <p className="text-xs font-bold mt-4 max-w-md mx-auto leading-relaxed">سنقوم بالدخول لتعليقات المنافس، سحب الأسئلة المحيرة، وتوليد أجوبة لها في وصف فيديوك لتتصدر النتائج.</p>
        </div>
      )}
    </div>
  );
};

export default CompetitorTab;
