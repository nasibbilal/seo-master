
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ThemeColor, ThumbnailEvaluation } from '../types';
import { useLanguage } from '../context/LanguageContext';

const gemini = new GeminiService();

interface ThumbnailResult {
  url: string;
  evaluation: ThumbnailEvaluation | null;
  mockupDescription?: string;
}

interface ThumbnailTabProps {
  theme: ThemeColor;
}

const ThumbnailTab: React.FC<ThumbnailTabProps> = ({ theme }) => {
  const { lang, t, dir } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [productMode, setProductMode] = useState<boolean>(true);
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
    { label: lang === 'ar' ? '🎥 يوتيوب: صورة مصغرة (16:9)' : '🎥 YouTube Thumbnail (16:9)', value: '16:9', type: 'thumbnail' },
    { label: lang === 'ar' ? '🖼️ يوتيوب: غلاف القناة (16:9)' : '🖼️ YouTube Channel Art (16:9)', value: '16:9', type: 'channel_art' },
    { label: lang === 'ar' ? '💠 تصميم شعار (Logo) (1:1)' : '💠 Channel Logo (1:1)', value: '1:1', type: 'logo' },
    { label: lang === 'ar' ? '📱 يوتيوب: Shorts (9:16)' : '📱 YouTube Shorts (9:16)', value: '9:16', type: 'thumbnail' },
    { label: lang === 'ar' ? '📌 بينتريست: دبوس طولي (3:4)' : '📌 Pinterest Pin (3:4)', value: '3:4', type: 'thumbnail' },
    { label: lang === 'ar' ? '📸 انستغرام وفيسبوك: بوست (1:1)' : '📸 Instagram & FB Post (1:1)', value: '1:1', type: 'thumbnail' },
  ];

  const psychologyOptions = [
    { label: lang === 'ar' ? '💥 طاقة وحيوية (برتقالي/أحمر)' : '💥 Energy & Activity (Orange/Red)', value: 'Energy and Activity (Orange/Red)' },
    { label: lang === 'ar' ? '💼 احترافية وذكاء (أزرق داكن/فضي)' : '💼 Professionalism & Intelligence (Blue/Silver)', value: 'Professionalism and Intelligence (Dark Blue/Silver)' },
    { label: lang === 'ar' ? '🌿 صحة ونمو (أخضر/أبيض)' : '🌿 Health & Growth (Green/White)', value: 'Health and Growth (Green/White)' },
    { label: lang === 'ar' ? '✨ أنوثة وأناقة (وردي/بنفسجي فاتح)' : '✨ Elegance & Femininity (Pink/Purple)', value: 'Femininity and Elegance (Pink/Light Purple)' },
    { label: lang === 'ar' ? '🕵️ غموض وتشويق (أسود/بنفسجي داكن)' : '🕵️ Mystery & Suspense (Black/Dark Purple)', value: 'Mystery and Intrigue (Black/Deep Purple)' },
    { label: lang === 'ar' ? '🛡️ ثقة وهدوء (أزرق فاتح/أبيض)' : '🛡️ Trust & Calm (Light Blue/White)', value: 'Trust and Calm (Light Blue/White)' },
    { label: lang === 'ar' ? '👑 فخامة وتميز (ذهبي/أسود)' : '👑 Luxury & Prestige (Gold/Black)', value: 'Luxury and Prestige (Gold/Black)' },
    { label: lang === 'ar' ? '⚠️ تنبيه واستعجال (أصفر/أسود)' : '⚠️ Urgency & Attention (Yellow/Black)', value: 'Urgency and Attention (Yellow/Black)' },
  ];

  const fontOptions = [
    'Cairo (عصري وعريض)',
    'Tajawal (ناعم وأنيق)',
    'Almarai (رسمي وواضح)',
    'El Messiri (فني ومزخرف)',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      alert(lang === 'ar' ? "يرجى إدخال وصف الصورة أولاً" : "Please enter image description first");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setResults([]);
    
    try {
      let finalText = thumbnailText;
      if (includeText) {
        setStatusMessage(lang === 'ar' ? 'جاري تدقيق النص وتحسين الجذب...' : 'Auditing text and enhancing hook...');
        finalText = await gemini.correctAndEnhanceText(thumbnailText || prompt, prompt, addCatchyTitle);
      }
      
      setStatusMessage(lang === 'ar' ? 'جاري بناء وتحليل التصميم الفني...' : 'Generating and analyzing art design...');
      
      const isProductMode = productMode && referenceImage;
      const actualPrompt = isProductMode ? `${prompt}. VERY IMPORTANT: The main subject (e.g., the t-shirt, mug, or billboard) MUST BE COMPLETELY BLANK AND SOLID COLORED. DO NOT generate ANY text, logos, or designs on it, as a real logo will be added later. (High-impact commercial YouTube thumbnail style, vibrant and cinematic)` : `${prompt} (High-impact commercial YouTube thumbnail style, vibrant and cinematic)`;

      const imgUrl = await gemini.generateThumbnail(
        actualPrompt, 
        finalText, 
        psychology, 
        selectedFont, 
        selectedSize, 
        selectedType, 
        includeText, 
        isProductMode ? null : referenceImage
      );
      
      let finalImgUrl = imgUrl;

      // Realistically composite the logo using Canvas (Mockup Mode)
      if (isProductMode && referenceImage) {
        setStatusMessage(lang === 'ar' ? 'جاري تحليل هيكل الجسم وتحديد موقع الطباعة (Pose Estimation)...' : 'Analyzing body structure for placement...');
        const placement = await gemini.analyzeMockupPlacement(imgUrl, prompt);
        
        setStatusMessage(lang === 'ar' ? 'جاري تطبيق النسيج ودمج الألوان بدقة...' : 'Applying fabric texture and blending...');
        finalImgUrl = await new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const bgImg = new Image();
          const overlayImg = new Image();
          
          bgImg.crossOrigin = "anonymous";
          bgImg.onload = () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
            ctx.drawImage(bgImg, 0, 0);
            
            overlayImg.crossOrigin = "anonymous";
            overlayImg.onload = () => {
              let overlayWidth, overlayHeight, x, y;

              if (placement) {
                // AI placement
                const boxW = (placement.xmax - placement.xmin) * canvas.width;
                const boxH = (placement.ymax - placement.ymin) * canvas.height;
                // Add breathing room (margin) inside the detected chest box (max 70% of the box)
                const targetW = boxW * 0.7;
                const targetH = boxH * 0.7;
                
                // Fit logo into target box preserving aspect ratio
                const ratio = Math.min(targetW / overlayImg.width, targetH / overlayImg.height);
                overlayWidth = overlayImg.width * ratio;
                overlayHeight = overlayImg.height * ratio;
                
                // Center precisely inside the detected bounding box
                x = (placement.xmin * canvas.width) + (boxW - overlayWidth) / 2;
                y = (placement.ymin * canvas.height) + (boxH - overlayHeight) / 2;
              } else {
                // Math fallback
                const maxOverlayWidth = canvas.width * 0.3;
                const maxOverlayHeight = canvas.height * 0.3;
                overlayWidth = overlayImg.width;
                overlayHeight = overlayImg.height;
                const ratio = Math.min(maxOverlayWidth / overlayWidth, maxOverlayHeight / overlayHeight);
                overlayWidth *= ratio;
                overlayHeight *= ratio;
                x = (canvas.width - overlayWidth) / 2;
                y = (canvas.height - overlayHeight) / 2 + (canvas.height * 0.1);
              }
              
              // 1. Draw base logo normally
              ctx.globalCompositeOperation = 'source-over';
              ctx.globalAlpha = 0.90;
              ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);
              
              // 2. Blend the shadows of the shirt over the logo to make it look embedded
              ctx.globalCompositeOperation = 'multiply';
              ctx.globalAlpha = 0.6;
              ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);

              // 3. Add textile noise/texture overlay
              ctx.globalCompositeOperation = 'overlay';
              ctx.globalAlpha = 0.15;
              ctx.fillStyle = '#ffffff';
              // Draw a simple noise grid pattern over the logo area
              for(let i = 0; i < overlayWidth; i+=4) {
                for(let j = 0; j < overlayHeight; j+=4) {
                  if (Math.random() > 0.5) {
                    ctx.fillRect(x + i, y + j, 2, 2);
                  }
                }
              }
              
              resolve(canvas.toDataURL('image/png'));
            };
            overlayImg.src = referenceImage;
          };
          bgImg.src = imgUrl;
        });
      }

      setStatusMessage(lang === 'ar' ? 'جاري تقييم التصميم لرفع نسبة النقر (CTR)...' : 'Evaluating design for CTR impact...');
      const evalData = await gemini.evaluateThumbnail(finalImgUrl, prompt);
      
      
      let mockupDesc = undefined;
      if (isProductMode && referenceImage) {
        setStatusMessage(lang === 'ar' ? 'جاري كتابة وصف التصميم النهائي...' : 'Generating final mockup description...');
        mockupDesc = await gemini.generateMockupDescription(finalImgUrl);
      }

      const generatedResults = [{ 
        url: finalImgUrl, 
        evaluation: evalData,
        mockupDescription: mockupDesc
      }];
      setResults(generatedResults);
      
    } catch (error: any) {
      if (error.message === 'QUOTA_EXHAUSTED' || error.message === 'QUOTA_EXCEEDED' || (error.message || '').includes('QUOTA')) {
        setErrorMsg(lang === 'ar' ? 'انتهت حصة توليد الصور حالياً، لكن يمكنك الاستمرار في استخدام أدوات تحليل الكلمات والوسوم.' : 'Image generation quota exceeded for now, but you can continue using keyword and tag analysis tools.');
      } else {
        setErrorMsg(lang === 'ar' ? 'حدث خطأ أثناء التوليد. يرجى المحاولة لاحقاً.' : 'An error occurred during generation. Please try again later.');
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

  const isRtl = dir === 'rtl';

  return (
    <div className={`max-w-7xl mx-auto font-cairo ${isRtl ? 'text-right' : 'text-left'} px-2 md:px-0`} dir={dir}>
      {/* Input Section */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-xl border border-gray-100 mb-8 md:mb-10 transition-all">
        <h2 className="text-xl md:text-3xl font-black text-gray-900 mb-8 md:mb-10 flex items-center gap-3">
          <span>🎨</span> {t('thumbnail.title')}
        </h2>

        {errorMsg && (
          <div className="mb-6 p-4 md:p-5 bg-red-50 border-2 border-red-100 rounded-2xl text-red-700 font-black text-xs md:text-sm flex items-center gap-4">
            <span className="text-xl md:text-2xl">⚠️</span> {errorMsg}
          </div>
        )}

        <div className="space-y-6 md:space-y-8">
          {/* Row 1: Prompt */}
          <div className="w-full">
            <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">{lang === 'ar' ? 'وصف المشهد الفني' : 'Artistic Scene Description'}</label>
            <div className="relative">
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={lang === 'ar' ? "مثلاً: رائد فضاء عربي يمسك بعملة بيتكوين في الفضاء، بأسلوب سايبيربانك..." : "e.g. Arab astronaut holding bitcoin in space, cyberpunk style..."}
                className="w-full px-6 md:px-10 py-5 md:py-6 pl-16 rounded-[1.5rem] md:rounded-[2rem] bg-gray-50 border-2 border-transparent text-black font-black text-base md:text-xl outline-none focus:bg-white focus:border-blue-500 shadow-inner transition-all resize-none"
                style={{ paddingLeft: isRtl ? 'auto' : '5rem', paddingRight: isRtl ? '5rem' : 'auto' }}
              />
              <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4 md:left-6' : 'right-4 md:right-6'} flex items-center gap-2`}>
                {referenceImage && (
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-sm border-2 border-white group">
                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setReferenceImage(null)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="flex flex-col gap-1 items-end">
                  <label className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 cursor-pointer transition-all active:scale-95" title={lang === 'ar' ? 'إرفاق صورة مرجعية أو منتج' : 'Upload reference or product image'}>
                    <span className="text-xl md:text-2xl font-light leading-none">+</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
            </div>
            {referenceImage && (
              <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 w-max mt-2">
                <input 
                  type="checkbox" 
                  id="productModeToggle" 
                  checked={productMode} 
                  onChange={(e) => setProductMode(e.target.checked)} 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                />
                <label htmlFor="productModeToggle" className="text-xs font-bold text-blue-900 cursor-pointer select-none">
                  {lang === 'ar' ? 'وضع الموك أب (دمج الشعار/التصميم كطباعة واقعية على الملابس أو المنتجات)' : 'Mockup Mode (Realistically print logo/design onto clothing or product)'}
                </label>
              </div>
            )}
          </div>
          {/* Row 2: Text & Psychology */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`relative ${!includeText ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">{lang === 'ar' ? 'النص المكتوب على التصميم' : 'Text Overlay'}</label>
              <input
                type="text"
                value={thumbnailText}
                onChange={(e) => setThumbnailText(e.target.value)}
                className="w-full px-6 md:px-8 py-4 md:py-5 rounded-2xl border-2 border-gray-100 bg-white font-black text-gray-900 outline-none focus:border-blue-500 shadow-sm transition-all"
                placeholder={lang === 'ar' ? "أدخل النص هنا..." : "Enter text here..."}
              />
              <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between px-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={addCatchyTitle} onChange={(e) => setAddCatchyTitle(e.target.checked)} className="w-5 h-5 rounded border-gray-300 accent-blue-600 transition-all cursor-pointer" />
                  <span className="text-[10px] font-black text-gray-500 uppercase group-hover:text-blue-600 transition-colors">{lang === 'ar' ? 'تحسين العنوان تلقائياً' : 'Auto-enhance title'}</span>
                </label>
                <div onClick={() => setIncludeText(!includeText)} className="flex items-center gap-3 cursor-pointer group">
                  <span className="text-[10px] font-black text-gray-500 uppercase group-hover:text-blue-600">{lang === 'ar' ? 'إظهار النص؟' : 'Show Text?'}</span>
                  <div className={`w-12 h-6 rounded-full relative transition-all ${includeText ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${includeText ? (isRtl ? 'right-7' : 'left-7') : (isRtl ? 'right-1' : 'left-1')}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">{lang === 'ar' ? 'سيكولوجية الألوان' : 'Color Psychology'}</label>
              <select 
                value={psychology}
                onChange={(e) => setPsychology(e.target.value)}
                className="w-full px-6 md:px-8 py-4 md:py-5 rounded-2xl border-2 border-gray-100 bg-white font-black text-gray-700 outline-none focus:border-blue-500 shadow-sm transition-all appearance-none cursor-pointer"
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
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">{lang === 'ar' ? 'نوع الخط' : 'Font Style'}</label>
                <select 
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full px-6 md:px-8 py-4 md:py-5 rounded-2xl border-2 border-gray-100 bg-white font-black text-gray-700 outline-none focus:border-blue-500 shadow-sm transition-all appearance-none cursor-pointer"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
             </div>

             <div className="w-full">
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">{lang === 'ar' ? 'مقاس التصميم' : 'Canvas Size'}</label>
                <select 
                  onChange={(e) => {
                    const s = canvasSizes.find(sz => sz.label === e.target.value);
                    if (s) { setSelectedSize(s.value); setSelectedType(s.type); }
                  }} 
                  className="w-full px-6 md:px-8 py-4 md:py-5 rounded-2xl border-2 border-gray-100 bg-white font-black text-gray-700 outline-none focus:border-blue-500 shadow-sm transition-all appearance-none cursor-pointer"
                >
                  {canvasSizes.map(size => <option key={size.label}>{size.label}</option>)}
                </select>
             </div>

             <button 
              onClick={handleGenerate} 
              disabled={loading} 
              className={`${themeClasses} w-full text-white px-6 py-4 md:py-5 rounded-2xl font-black disabled:opacity-50 shadow-lg flex items-center justify-center gap-3 transform active:scale-95 h-[60px] md:h-[68px] transition-all relative group overflow-hidden cursor-pointer`}
            >
              {loading ? (
                <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-xl md:text-2xl group-hover:rotate-12 transition-transform">✨</span>
                  <span className="text-sm md:text-base">{lang === 'ar' ? 'توليد تصميم احترافي' : 'Generate Pro Design'}</span>
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
          <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-12 md:p-20 flex flex-col items-center justify-center text-center animate-pulse border-4 md:border-8 border-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 animate-[shimmer_2s_infinite]"></div>
            <div className="w-16 h-16 md:w-20 md:h-20 border-4 md:border-8 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-8" />
            <h3 className="text-white text-xl md:text-3xl font-black mb-4 px-4">{statusMessage}</h3>
            <p className="text-slate-400 font-bold max-w-md mx-auto leading-relaxed text-xs md:text-sm px-6">
              {lang === 'ar' ? 'الذكاء الاصطناعي يقوم الآن بتحليل الوصف المكتوب ومطابقته مع سيكولوجية الألوان المختارة لإنتاج أفضل النتائج..' : 'AI is analyzing description and matching color psychology for optimal output..'}
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {results.map((res, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-xl border border-gray-100 flex flex-col transform hover:scale-[1.02] transition-all duration-500 group">
                {/* Image Preview */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                   <img src={res.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={`Option ${idx + 1}`} />
                   
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full font-black text-[10px] shadow-lg border border-white/50 uppercase">
                      {lang === 'ar' ? `خيار ${idx + 1}` : `Option ${idx + 1}`}
                   </div>
                </div>

                {/* Info & Actions */}
                <div className="p-6 md:p-8 flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50/50">
                  {res.evaluation ? (
                    <div className="mb-6 md:mb-8 flex-1">
                      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'التقييم العام' : 'Overall Score'}</span>
                          {renderStars(res.evaluation.score)}
                        </div>
                        <span className="text-2xl md:text-3xl font-black text-gray-900 leading-none">{res.evaluation.score}<span className="text-xs text-gray-400">/10</span></span>
                      </div>

                      <div className="space-y-4 mb-6">
                        <MetricBar label={lang === 'ar' ? "وضوح النص" : "Text Readability"} value={res.evaluation.readability} color="bg-blue-500" />
                        <MetricBar label={lang === 'ar' ? "التأثير البصري" : "Visual Impact"} value={res.evaluation.visualImpact} color="bg-purple-500" />
                      </div>

                      <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-blue-50 shadow-inner relative mt-4">
                        <span className="absolute -top-3 right-5 bg-white px-2 text-[10px] font-black text-blue-500 uppercase">{lang === 'ar' ? 'ملاحظة الذكاء الاصطناعي' : 'AI Critique'}</span>
                        <p className="text-[11px] md:text-xs text-blue-900 font-bold leading-relaxed italic">
                          "{res.evaluation.critique}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}

                  <button 
                    onClick={() => downloadImage(res.url, idx)}
                    className="w-full py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-gray-900 hover:bg-black text-white font-black text-xs md:text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-gray-200 transform active:scale-95 cursor-pointer"
                  >
                    <span className="text-xl">📥</span> {lang === 'ar' ? 'تحميل التصميم عالي الدقة' : 'Download High-Res Design'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {results.length === 0 && !loading && (
        <div className="text-center p-12 md:p-24 bg-gray-50/50 rounded-[3rem] md:rounded-[4rem] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-4xl md:text-5xl mb-6 shadow-sm grayscale opacity-50">🖼️</div>
          <p className="font-black text-gray-400 text-lg md:text-xl">{lang === 'ar' ? 'استعد لتصميم صورك المصغرة!' : 'Ready to design your thumbnails!'}</p>
          <p className="text-gray-300 font-bold mt-2 text-sm md:text-base max-w-sm mx-auto">{lang === 'ar' ? 'ادخل وصف المشهد أعلاه لتوليد 3 خيارات احترافية تناسب هوية علامتك التجارية.' : 'Enter scene description above to generate 3 pro options matching your brand.'}</p>
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