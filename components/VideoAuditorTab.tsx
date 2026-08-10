
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ThemeColor, Platform, VideoAuditResult } from '../types';
import { useLanguage } from '../context/LanguageContext';

const gemini = new GeminiService();

interface VideoAuditorTabProps {
  theme: ThemeColor;
}

const VideoAuditorTab: React.FC<VideoAuditorTabProps> = ({ theme }) => {
  const { lang, t, dir } = useLanguage();
  const [videoInput, setVideoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VideoAuditResult | null>(null);

  const handleAudit = async () => {
    if (!videoInput) return;
    setLoading(true);
    setResult(null);
    try {
      const ytConfig = gemini.getPlatformConfig('youtube');
      const ttConfig = gemini.getPlatformConfig('tiktok');
      
      const targetPlatforms = [Platform.GOOGLE];
      if (ytConfig.youtube_key) targetPlatforms.push(Platform.YOUTUBE);
      if (ttConfig.tiktok_secret) targetPlatforms.push(Platform.TIKTOK);

      const auditResult = await gemini.auditVideoContent(videoInput, targetPlatforms);
      setResult(auditResult);
    } catch (error) {
      console.error(error);
      alert(lang === 'ar' ? "حدث خطأ أثناء فحص الفيديو. يرجى التأكد من الرابط." : "An error occurred during video audit. Please check the link or input.");
    } finally {
      setLoading(false);
    }
  };

  const themeClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  }[theme];

  const isRtl = dir === 'rtl';

  return (
    <div className={`max-w-6xl mx-auto p-4 font-cairo ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 mb-10">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
          <span className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl">🔬</span>
          {lang === 'ar' ? 'محلل الفيديو الذكي (Video Auditor)' : 'Smart Video Auditor'}
        </h2>
        
        <div className="space-y-6">
          <div className="w-full">
            <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">{lang === 'ar' ? 'رابط الفيديو أو وصف المحتوى' : 'Video Link or Content Description'}</label>
            <textarea
              rows={3}
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              placeholder={lang === 'ar' ? "ضع رابط يوتيوب/تيك توك أو اكتب تفاصيل الفيديو (عنوان، فكرة، سيناريو)..." : "Paste YouTube/TikTok link or enter video details (title, concept, script)..."}
              className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none font-bold shadow-inner transition-all resize-none"
            />
          </div>
          
          <button
            onClick={handleAudit}
            disabled={loading}
            className={`${themeClasses} text-white w-full py-5 rounded-2xl font-black disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 cursor-pointer`}
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (lang === 'ar' ? "بدء الفحص المخبري للفيديو" : "Start Video Audit")}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
               <h3 className="font-black text-xl mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">🚀 {lang === 'ar' ? 'خطة التحسين الاستراتيجية' : 'Strategic Optimization Plan'}</h3>
               <div className="space-y-4">
                  {result.optimizationPlan?.map((step, idx) => (
                    <div key={idx} className="bg-gray-50 p-6 rounded-2xl border-r-4 border-blue-500 flex justify-between items-center group hover:bg-blue-50 transition-all">
                       <div className="flex-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 block">{lang === 'ar' ? `الهدف: ${step.target}` : `Target: ${step.target}`}</span>
                          <p className="text-sm font-bold text-gray-800 leading-relaxed">{step.suggestion}</p>
                       </div>
                       <div className={`px-4 py-2 rounded-xl text-[10px] font-black ${step.impact === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {lang === 'ar' ? `تأثير: ${step.impact === 'High' ? 'عالي' : 'متوسط'}` : `Impact: ${step.impact === 'High' ? 'High' : 'Medium'}`}
                       </div>
                    </div>
                  )) || <p className="text-gray-400 text-center">{lang === 'ar' ? 'لا توجد توصيات' : 'No recommendations'}</p>}
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
               <h3 className="font-black text-xl mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">⚠️ {lang === 'ar' ? 'نقاط الخلل الحرجة' : 'Critical Flaws'}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.criticalFlaws?.map((flaw, idx) => (
                    <div key={idx} className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                       <span className="text-red-500 text-lg">✖</span>
                       <p className="text-xs font-black text-red-900 leading-snug">{flaw}</p>
                    </div>
                  )) || <p className="text-gray-400 text-center col-span-2">{lang === 'ar' ? 'لا توجد عيوب مكتشفة' : 'No flaws detected'}</p>}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full"></div>
               <div className="relative z-10 text-center">
                  <div className="inline-block p-4 bg-white/5 rounded-3xl mb-4 border border-white/10">
                     <span className="text-4xl">📊</span>
                  </div>
                  <h4 className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2">{lang === 'ar' ? 'مجموع نقاط الـ SEO' : 'SEO Score'}</h4>
                  <div className="text-6xl font-black mb-6">{result.seoScore}<span className="text-xl text-gray-500">/100</span></div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                         <span>{lang === 'ar' ? 'فرصة التفاعل' : 'Engagement Potential'}</span>
                         <span>{result.engagementPotential}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                         <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${result.engagementPotential}%` }} />
                      </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                       <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">{lang === 'ar' ? 'توقع الاحتفاظ بالجمهور' : 'Audience Retention Estimate'}</span>
                       <p className="text-xs font-bold text-gray-300 italic">"{result.retentionEstimate || (lang === 'ar' ? 'غير متوفر' : 'N/A')}"</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <h4 className="font-black text-sm mb-4">{lang === 'ar' ? 'مطابقة معايير المنصات' : 'Platform Standards Match'}</h4>
               <div className="space-y-4">
                  {result.platformStandardsMatch?.map((std, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-900">{std.platform}</span>
                          <span className="text-[9px] text-gray-400 font-bold">{std.notes}</span>
                       </div>
                       <span className={`px-2 py-1 rounded-lg text-[8px] font-black ${std.status === 'Exceeds' ? 'bg-green-100 text-green-600' : std.status === 'Meets' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                          {std.status}
                       </span>
                    </div>
                  )) || <p className="text-xs text-gray-400">{lang === 'ar' ? 'لا توجد بيانات' : 'No data'}</p>}
               </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default VideoAuditorTab;