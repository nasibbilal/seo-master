
import React, { useState } from 'react';
import { GeminiService, ThumbnailEvaluation } from '../services/geminiService';
import { ThemeColor } from '../types';

const gemini = new GeminiService();

interface ThumbnailTabProps {
  theme: ThemeColor;
}

interface ThumbnailResult {
  url: string;
  evaluation: ThumbnailEvaluation | null;
}

const ThumbnailTab: React.FC<ThumbnailTabProps> = ({ theme }) => {
  const [prompt, setPrompt] = useState('');
  const [thumbnailText, setThumbnailText] = useState('');
  const [includeText, setIncludeText] = useState(true);
  const [addCatchyTitle, setAddCatchyTitle] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Cairo (عصري وعريض)');
  const [selectedSize, setSelectedSize] = useState('16:9'); 
  const [selectedType, setSelectedType] = useState('thumbnail');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [results, setResults] = useState<ThumbnailResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [psychology, setPsychology] = useState('Energy and Activity (Orange/Red)');

  const canvasSizes = [
    { label: '🎥 يوتيوب: صورة مصغرة (16:9)', value: '16:9', type: 'thumbnail' },
    { label: '🖼️ يوتيوب: غلاف القناة (16:9)', value: '16:9', type: 'channel_art' },
    { label: '💠 تصميم شعار (Logo) (1:1)', value: '1:1', type: 'logo' },
    { label: '📱 يوتيوب: Shorts (9:16)', value: '9:16', type: 'thumbnail' },
    { label: '📌 بينتريست: دبوس طولي (3:4)', value: '3:4', type: 'thumbnail' },
  ];

  const psychologyOptions = [
    { label: '💥 طاقة وحيوية (برتقالي/أحمر)', value: 'Energy and Activity (Orange/Red)' },
    { label: '💼 احترافية وذكاء (أزرق داكن/فضي)', value: 'Professionalism and Intelligence (Dark Blue/Silver)' },
    { label: '🌿 صحة ونمو (أخضر/أبيض)', value: 'Health and Growth (Green/White)' },
    { label: '✨ أنوثة وأناقة (وردي/بنفسجي فاتح)', value: 'Femininity and Elegance (Pink/Light Purple)' },
    { label: '🕵️ غموض وتشويق (أسود/بنفسجي داكن)', value: 'Mystery and Intrigue (Black/Deep Purple)' },
    { label: '🛡️ ثقة وهدوء (أزرق فاتح/أبيض)', value: 'Trust and Calm (Light Blue/White)' },
    { label: '👑 فخامة وتميز (ذهبي/أسود)', value: 'Luxury and Prestige (Gold/Black)' },
    { label: '⚠️ تنبيه واستعجال (أصفر/أسود)', value: 'Urgency and Attention (Yellow/Black)' },
  ];

  const fontOptions = [
    'Cairo (عصري وعريض)',
    'Tajawal (ناعم وأنيق)',
    'Almarai (رسمي وواضح)',
    'El Messiri (فني ومزخرف)',
  ];

  const handleGenerate = async () => {
    if (!prompt) {
      alert("يرجى إدخال وصف الصورة أولاً");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setResults([]);
    
    try {
      let finalText = thumbnailText;
      if (includeText) {
        setStatusMessage('جاري تدقيق النص وتحسين الجذب...');
        finalText = await gemini.correctAndEnhanceText(thumbnailText || prompt, prompt, addCatchyTitle);
      }
      
      setStatusMessage('جاري توليد 3 خيارات متنوعة للتصميم...');
      
      const styles = [
        "Cinematic and highly detailed with dramatic lighting",
        "Vibrant, colorful, and high-impact commercial style",
        "Minimalist, modern, and clean professional aesthetic"
      ];

      const thumbnailPromises = styles.map(async (styleModifier) => {
        const enhancedPrompt = `${prompt} (${styleModifier})`;
        const imgUrl = await gemini.generateThumbnail(enhancedPrompt, finalText, psychology, selectedFont, selectedSize, selectedType, includeText);
        const evalData = await gemini.evaluateThumbnail(imgUrl, prompt);
        return { url: imgUrl, evaluation: evalData };
      });

      const generatedResults = await Promise.all(thumbnailPromises);
      setResults(generatedResults);
      
    } catch (error: any) {
      if (error.message === 'QUOTA_EXCEEDED') {
        setErrorMsg('انتهت حصة توليد الصور حالياً، لكن يمكنك الاستمرار في استخدام أدوات تحليل الكلمات والوسوم.');
      } else {
        setErrorMsg('حدث خطأ أثناء التوليد. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const themeClasses = {
    red: 'bg-red-600 hover:bg-red-700 shadow-red-200',
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    purple: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200',
  }[theme];

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `seo-master-thumbnail-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStars = (score: number) => {
    const starsCount = Math.round(score / 2);
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-lg ${i < starsCount ? 'text-yellow-400' : 'text-gray-200'}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-black text-gray-500 uppercase">{label}</span>
        <span className="text-[10px] font-black text-gray-700">{value}/10</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full transition-all duration-1000 ${color}`} 
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 font-cairo text-right">
      {/* Input Section */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 mb-10 transition-all">
        <h2 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-3">
          <span>🎨</span> استديو التصميم الذكي (3 خيارات)
        </h2>

        {errorMsg && (
          <div className="mb-6 p-5 bg-red-50 border-2 border-red-100 rounded-2xl text-red-700 font-black text-sm flex items-center gap-4">
            <span className="text-2xl">⚠️</span> {errorMsg}
          </div>
        )}

        <div className="space-y-8">
          {/* Row 1: Prompt */}
          <div className="w-full">
            <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4 uppercase tracking-widest">وصف المشهد الفني</label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثلاً: رائد فضاء عربي يمسك بعملة بيتكوين في الفضاء، بأسلوب سايبيربانك..."
              className="w-full px-10 py-6 rounded-[2rem] bg-gray-50 border-2 border-transparent text-black font-black text-xl outline-none focus:bg-white focus:border-blue-500 shadow-inner transition-all resize-none"
            />
          </div>

          {/* Row 2: Text & Psychology */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`relative ${!includeText ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4 uppercase tracking-widest">النص المكتوب على التصميم</label>
              <input
                type="text"
                value={thumbnailText}
                onChange={(e) => setThumbnailText(e.target.value)}
                className="w-full px-8 py-5 rounded-2xl border-2 border-gray-100 bg-white font-black text-gray-900 outline-none focus:border-blue-500 shadow-sm transition-all"
                placeholder="أدخل النص هنا..."
              />
              <div className="mt-3 flex items-center justify-between px-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={addCatchyTitle} onChange={(e) => setAddCatchyTitle(e.target.checked)} className="w-5 h-5 rounded border-gray-300 accent-blue-600 transition-all" />
                  <span className="text-[10px] font-black text-gray-500 uppercase group-hover:text-blue-600 transition-colors">تحسين العنوان تلقائياً</span>
                </label>
                <div onClick={() => setIncludeText(!includeText)} className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-[10px] font-black text-gray-500 uppercase group-hover:text-blue-600">إظهار النص؟</span>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${includeText ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includeText ? 'right-6' : 'right-1'}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4 uppercase tracking-widest">سيكولوجية الألوان</label>
              <select 
                value={psychology}
                onChange={(e) => setPsychology(e.target.value)}
                className="w-full px-8 py-5 rounded-2xl border-2 border-gray-100 bg-white font-black text-gray-700 outline-none focus:border-blue-500 shadow-sm transition-all appearance-none cursor-pointer"
              >
                {psychologyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Font, Size & Action */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
             <div className="w-full">
                <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4 uppercase tracking-widest">نوع الخط العربي</label>
                <select 
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full px-8 py-5 rounded-2xl border-2 border-gray-100 bg-white font-black text-gray-700 outline-none focus:border-blue-500 shadow-sm transition-all appearance-none cursor-pointer"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
             </div>

             <div className="w-full">
                <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4 uppercase tracking-widest">مقاس التصميم</label>
                <select 
                  onChange={(e) => {
                    const s = canvasSizes.find(sz => sz.label === e.target.value);
                    if (s) { setSelectedSize(s.value); setSelectedType(s.type); }
                  }} 
                  className="w-full px-8 py-5 rounded-2xl border-2 border-gray-100 bg-white font-black text-gray-700 outline-none focus:border-blue-500 shadow-sm transition-all appearance-none cursor-pointer"
                >
                  {canvasSizes.map(size => <option key={size.label}>{size.label}</option>)}
                </select>
             </div>

             <button 
              onClick={handleGenerate} 
              disabled={loading} 
              className={`${themeClasses} w-full text-white px-6 py-5 rounded-2xl font-black disabled:opacity-50 shadow-lg flex items-center justify-center gap-3 transform active:scale-95 h-[68px] transition-all relative group overflow-hidden`}
            >
              {loading ? (
                <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-2xl group-hover:rotate-12 transition-transform">✨</span>
                  <span>توليد 3 خيارات احترافية</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-10">
        {loading && (
          <div className="bg-slate-900 rounded-[3.5rem] p-20 flex flex-col items-center justify-center text-center animate-pulse border-8 border-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 animate-[shimmer_2s_infinite]"></div>
            <div className="w-20 h-20 border-8 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-8" />
            <h3 className="text-white text-3xl font-black mb-4">{statusMessage}</h3>
            <p className="text-slate-400 font-bold max-w-md mx-auto leading-relaxed">
              الذكاء الاصطناعي يقوم الآن بتحليل الوصف المكتوب ومطابقته مع سيكولوجية الألوان المختارة لإنتاج أفضل النتائج..
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {results.map((res, idx) => (
              <div key={idx} className="bg-white rounded-[3.5rem] overflow-hidden shadow-xl border border-gray-100 flex flex-col transform hover:scale-[1.03] transition-all duration-500 group">
                {/* Image Preview */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                   <img src={res.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={`Option ${idx + 1}`} />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full font-black text-xs shadow-lg border border-white/50">
                      خيار {idx + 1}
                   </div>
                </div>

                {/* Info & Actions */}
                <div className="p-8 flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50/50">
                  {res.evaluation ? (
                    <div className="mb-8 flex-1">
                      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">التقييم العام</span>
                          {renderStars(res.evaluation.score)}
                        </div>
                        <span className="text-3xl font-black text-gray-900 leading-none">{res.evaluation.score}<span className="text-xs text-gray-400">/10</span></span>
                      </div>

                      <div className="space-y-4 mb-6">
                        <MetricBar label="وضوح النص" value={res.evaluation.readability} color="bg-blue-500" />
                        <MetricBar label="التأثير البصري" value={res.evaluation.visualImpact} color="bg-purple-500" />
                      </div>

                      <div className="bg-white p-5 rounded-3xl border border-blue-50 shadow-inner relative">
                        <span className="absolute -top-3 right-5 bg-white px-2 text-[10px] font-black text-blue-500 uppercase">ملاحظة الذكاء الاصطناعي</span>
                        <p className="text-xs text-blue-900 font-bold leading-relaxed italic">
                          "{res.evaluation.critique}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}

                  <button 
                    onClick={() => downloadImage(res.url, idx)}
                    className="w-full py-5 rounded-[2rem] bg-gray-900 hover:bg-black text-white font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-gray-200 transform active:scale-95"
                  >
                    <span className="text-xl">📥</span> تحميل التصميم عالي الدقة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {results.length === 0 && !loading && (
        <div className="text-center p-24 bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-200">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm grayscale opacity-50">🖼️</div>
          <p className="font-black text-gray-400 text-xl">استعد لتصميم صورك المصغرة!</p>
          <p className="text-gray-300 font-bold mt-2">ادخل وصف المشهد أعلاه لتوليد 3 خيارات احترافية تناسب هوية علامتك التجارية.</p>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ThumbnailTab;
