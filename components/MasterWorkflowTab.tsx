import React, { useState } from 'react';
import { ThemeColor, Platform, KeywordMetric, GapAnalysis, AudienceInsight } from '../types';
import { GeminiService } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';

interface MasterWorkflowTabProps {
  theme: ThemeColor;
  daysCount?: number;
  activeChannelId?: string;
}

export interface WorkflowResult {
  topic: string;
  primaryKeyword: string;
  keywordMetrics: KeywordMetric[];
  exploitKeywords: string[];
  gapInfo: GapAnalysis | null;
  audienceInsight: AudienceInsight | null;
  bestPublishTime: string;
  finalTitle: string;
  finalDescription: string;
  finalTags: string[];
  thumbnailHookText: string;
  thumbnailUrl: string;
  timestamp: string;
}

const gemini = new GeminiService();

const MasterWorkflowTab: React.FC<MasterWorkflowTabProps> = ({ theme, daysCount = 30 }) => {
  const { lang, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [topicInput, setTopicInput] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.YOUTUBE);
  const [selectedCountry, setSelectedCountry] = useState('GLOBAL');
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepStatus, setStepStatus] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stepsList = [
    {
      id: 1,
      title: isRtl ? 'تحليل الكلمات' : 'Keyword Analysis',
      desc: isRtl ? 'استخراج أسرار البحث والكلمة الذهبية' : 'Extracting golden keyword & search volume',
      icon: '🔍'
    },
    {
      id: 2,
      title: isRtl ? 'تحليل المنافسين والفجوات' : 'Competitor & Gap Analysis',
      desc: isRtl ? 'صيد فجوات التعليقات والوسوم القوية' : 'Hunting comment gaps & high-impact tags',
      icon: '🕵️'
    },
    {
      id: 3,
      title: isRtl ? 'تحليل الجمهور' : 'Audience Insights',
      desc: isRtl ? 'استخراج سلوك الجمهور وأفضل موعد للنشر' : 'Extracting audience behavior & best post times',
      icon: '👥'
    },
    {
      id: 4,
      title: isRtl ? 'صياغة المحتوى الاستهدافي' : 'Targeted Copywriting',
      desc: isRtl ? 'إنشاء عنوان استهدافي ووصف متوافق مع SEO' : 'Crafting targeted magnetic title & SEO description',
      icon: '✍️'
    },
    {
      id: 5,
      title: isRtl ? 'تصميم الصورة المصغرة' : 'Thumbnail Generation',
      desc: isRtl ? 'توليد صورة تنافسية عالية التفاعل' : 'Generating high-CTR competitive thumbnail',
      icon: '🎨'
    }
  ];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const executeMasterWorkflow = async () => {
    if (!topicInput.trim()) {
      alert(isRtl ? 'يرجى إدخال موضوع الفيديو أولاً' : 'Please enter a video topic first');
      return;
    }

    // Check if the required API key for the selected platform exists in Settings
    const keyCheck = gemini.checkPlatformApiKey(selectedPlatform, isRtl);
    if (!keyCheck.hasKey) {
      setErrorMsg(keyCheck.message || 'Missing API key');
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    setErrorMsg(null);
    setResult(null);

    try {
      // ----------------------------------------------------
      // Step 1: Keyword Analysis
      // ----------------------------------------------------
      setCurrentStep(1);
      setStepStatus(isRtl ? 'جاري تحليل الكلمات المفتاحية وسحب أحجام البحث...' : 'Analyzing keywords & search volumes...');
      
      const keywordData = await gemini.analyzeKeywords(topicInput, selectedPlatform, selectedCountry);
      const metricsList: KeywordMetric[] = Array.isArray(keywordData) ? keywordData : (keywordData?.keywords || []);
      
      const primaryKeyword = metricsList.length > 0 ? metricsList[0].keyword : topicInput;

      // ----------------------------------------------------
      // Step 2: Competitor & Gap Analysis
      // ----------------------------------------------------
      setCurrentStep(2);
      setStepStatus(isRtl ? 'جاري تحليل المنافسين واستخراج فجوات المحتوى...' : 'Analyzing competitors & content gaps...');

      const competitorTags = await gemini.generateTags(primaryKeyword, selectedPlatform, selectedCountry);
      const gapInfo = await gemini.checkContentGap(primaryKeyword);

      const exploitKeywords = gapInfo?.exploitKeywords || [];
      const combinedTags = Array.from(new Set([...competitorTags, ...exploitKeywords, primaryKeyword])).slice(0, 20);

      // ----------------------------------------------------
      // Step 3: Audience Analysis
      // ----------------------------------------------------
      setCurrentStep(3);
      setStepStatus(isRtl ? 'جاري استخراج بيانات الجمهور وأفضل مواعيد للنشر...' : 'Extracting audience insights & peak posting hours...');

      const audienceInsight = await gemini.getAudienceInsights(primaryKeyword, selectedPlatform, selectedCountry, daysCount);
      
      const bestPublishTime = audienceInsight?.engagementTimesShorts || audienceInsight?.engagementTimesLong || audienceInsight?.engagementTimes || (isRtl ? 'الخميس والجمعة (من 6:00 م إلى 9:00 م)' : 'Thu & Fri (6:00 PM - 9:00 PM)');

      // ----------------------------------------------------
      // Step 4: Targeted AI Copywriting (Expanded 2-3 Paragraph SEO Description)
      // ----------------------------------------------------
      setCurrentStep(4);
      setStepStatus(isRtl ? 'جاري صياغة العنوان الاستهدافي والوصف الموسع (2-3 فقرات SEO)...' : 'Crafting targeted title & expanded 2-3 paragraph SEO description...');

      const currentYear = new Date().getFullYear();
      const contentPrompt = `Topic: "${topicInput}". Year: ${currentYear}. Primary Keyword: "${primaryKeyword}". Competitor Gap Message: "${gapInfo?.message || ''}". Exploit Keywords: ${exploitKeywords.join(', ')}. CRITICAL: Automatically detect the input language of topic/keyword and output EVERYTHING 100% in THAT SAME LANGUAGE.`;
      
      let finalTitle = gapInfo?.suggestedTitle || '';
      
      const generatedContent = await gemini.generatePlatformContent(combinedTags.slice(0, 5), selectedPlatform, topicInput);
      if (!finalTitle) {
        finalTitle = generatedContent.title || `${topicInput} ${currentYear}`;
      }

      // Generate rich 2-3 paragraph SEO description
      let finalDescription = await gemini.generateExpandedSeoDescription(topicInput, primaryKeyword, exploitKeywords, currentYear);
      if (!finalDescription || finalDescription.length < 50) {
        finalDescription = generatedContent.description || `${topicInput} (${currentYear}) - ${primaryKeyword}`;
      }

      // ----------------------------------------------------
      // Step 5: High-CTR Thumbnail Generation (Simplified 1-Sentence Hook)
      // ----------------------------------------------------
      setCurrentStep(5);
      setStepStatus(isRtl ? 'جاري توليد الجملة الخاطفة والصورة المصغرة التنافسية...' : 'Generating punchy 1-sentence hook & competitive thumbnail...');

      // Generate a short 3-5 word curiosity hook for high CTR simplification
      const shortHookText = await gemini.generateCuriosityHook(topicInput, primaryKeyword);

      const thumbnailPrompt = `Professional high-CTR YouTube thumbnail for topic "${topicInput}". Prominent expressive focal point, vibrant contrasting lighting, 3D elements, ultra detailed, 4K resolution. Clean visual hierarchy with minimal text: only display the short 3-word punchline "${shortHookText}".`;
      
      let thumbnailUrl = '';
      try {
        thumbnailUrl = await gemini.generateThumbnail(
          thumbnailPrompt,
          shortHookText, // ONLY pass the short punchy hook text!
          'حماس وثقة (High Contrast Yellow & Cyan)',
          'Tajawal',
          '16:9',
          '3d',
          true
        );
      } catch (imgErr) {
        console.warn('Thumbnail generation failed in workflow:', imgErr);
        thumbnailUrl = `https://picsum.photos/seed/${encodeURIComponent(topicInput)}/1280/720`;
      }

      // ----------------------------------------------------
      // Save & Set Final Combined Result
      // ----------------------------------------------------
      const finalWorkflowResult: WorkflowResult = {
        topic: topicInput,
        primaryKeyword,
        keywordMetrics: metricsList.slice(0, 5),
        exploitKeywords,
        gapInfo,
        audienceInsight,
        bestPublishTime,
        finalTitle,
        finalDescription,
        finalTags: combinedTags,
        thumbnailHookText: shortHookText,
        thumbnailUrl,
        timestamp: new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setResult(finalWorkflowResult);
      setCurrentStep(6); // Completed
    } catch (err: any) {
      console.error('Master Workflow error:', err);
      if (err.message === 'QUOTA_EXHAUSTED' || (err.message || '').includes('QUOTA')) {
        setErrorMsg(isRtl ? 'انتهت حصة الـ API مؤقتاً، يرجى المحاولة لاحقاً أو تجديد المفتاح في الإعدادات.' : 'API quota exceeded temporarily. Please try again later.');
      } else {
        setErrorMsg(isRtl ? 'حدث خطأ أثناء تنفيذ المسار المتكامل. يرجى إعادة المحاولة.' : 'An error occurred during workflow execution. Please try again.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-blue-800/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-black mb-4 border border-blue-400/30 backdrop-blur-md">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            ⚡ {isRtl ? 'مُوجه المسار التلقائي الخارق (Master Workflow)' : 'Master Workflow Automation Pipeline'}
          </div>
          <h2 className="text-2xl md:text-4xl font-black leading-tight mb-3">
            {isRtl ? 'ربط الأقسام التلقائي: من الموضوع إلى المنتج النهائي بضغطة واحدة 🚀' : 'Automation Pipeline: From Topic to Full Asset Package in One Click'}
          </h2>
          <p className="text-gray-300 text-xs md:text-sm font-bold leading-relaxed max-w-2xl">
            {isRtl 
              ? 'يقوم هذا المسار الآلي بالربط بين تحليل الكلمات، استخبارات المنافسين، دراسة سلوك الجمهور، وصياغة العنوان والوصف وتصميم الصورة المصغرة في خط إنتاج متسلسل يعطيك الخلاصة والزبدة مباشرة.'
              : 'Executes a background pipeline connecting keyword analysis, competitor gaps, audience timing, targeted copywriting, and thumbnail creation into one final actionable report.'
            }
          </p>
        </div>
      </div>

      {/* Input Control Box */}
      <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">
            🎯 {isRtl ? 'موضوع الفيديو أو الفكرة الأساسية (Topic Input)' : 'Video Topic or Core Idea'}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder={isRtl ? `مثلاً: أسرار ربح المال لعام ${new Date().getFullYear()}، أو مراجعة آيفون برو...` : `e.g. How to start ecommerce business in ${new Date().getFullYear()}...`}
              disabled={isRunning}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isRunning) executeMasterWorkflow();
              }}
            />

            <button
              onClick={executeMasterWorkflow}
              disabled={isRunning || !topicInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl md:rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shrink-0 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isRtl ? 'جاري تنفيذ المسار...' : 'Running Pipeline...'}</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>{isRtl ? 'تشغيل المسار التلقائي' : 'Start Master Workflow'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Target Platform & Country Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
              📺 {isRtl ? 'منصة الاستهداف' : 'Target Platform'}
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
              disabled={isRunning}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value={Platform.YOUTUBE}>YouTube 🎥</option>
              <option value={Platform.TIKTOK}>TikTok 🎵</option>
              <option value={Platform.INSTAGRAM}>Instagram 📸</option>
              <option value={Platform.FACEBOOK}>Facebook 📘</option>
              <option value={Platform.GOOGLE}>Google Search 🔍</option>
              <option value={Platform.PINTEREST}>Pinterest 📌</option>
              <option value={Platform.AMAZON}>Amazon 🛍️</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
              🌍 {isRtl ? 'النطاق الجغرافي' : 'Region'}
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              disabled={isRunning}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="GLOBAL">{isRtl ? 'عالمي (جميع الدول)' : 'Global (All Countries)'}</option>
              <option value="SA">السعودية 🇸🇦</option>
              <option value="EG">مصر 🇪🇬</option>
              <option value="AE">الإمارات 🇦🇪</option>
              <option value="US">الولايات المتحدة 🇺🇸</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step Progress Tracker Bar */}
      {(isRunning || result || currentStep > 0) && (
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-lg">
                🔄
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-sm md:text-base">
                  {isRtl ? 'حالة خط الإنتاج المتسلسل' : 'Pipeline Execution Tracker'}
                </h3>
                <p className="text-gray-400 text-xs font-bold mt-0.5">
                  {isRunning ? stepStatus : (result ? (isRtl ? 'اكتملت جميع الخطوات بنجاح! 🌟' : 'All steps completed successfully!') : (isRtl ? 'في انتظار البدء...' : 'Waiting to start...'))}
                </p>
              </div>
            </div>

            {isRunning && (
              <span className="bg-blue-50 text-blue-600 text-xs font-black px-3 py-1.5 rounded-xl border border-blue-100 animate-pulse">
                {isRtl ? `الخطوة ${currentStep} من 5` : `Step ${currentStep} of 5`}
              </span>
            )}
          </div>

          {/* Sequential Steps Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {stepsList.map((step) => {
              const isDone = currentStep > step.id || (result && !isRunning);
              const isCurrent = currentStep === step.id && isRunning;

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                    isDone
                      ? 'bg-green-50/50 border-green-200 text-green-950'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-500/20 shadow-md scale-[1.02]'
                      : 'bg-gray-50/50 border-gray-100 text-gray-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{step.icon}</span>
                    <span
                      className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center ${
                        isDone
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white animate-bounce'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isDone ? '✓' : step.id}
                    </span>
                  </div>

                  <h4 className="font-black text-xs mb-1 line-clamp-1">{step.title}</h4>
                  <p className="text-[10px] font-semibold opacity-80 leading-tight">{step.desc}</p>

                  {isCurrent && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {errorMsg && (
        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl md:rounded-[2rem] text-red-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in zoom-in-95 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h4 className="font-black text-sm">{isRtl ? 'تنبيه إعدادات API' : 'API Configuration Alert'}</h4>
              <p className="text-xs font-bold mt-1 opacity-90">{errorMsg}</p>
            </div>
          </div>
          {onNavigateTab && errorMsg.includes('الإعدادات') && (
            <button
              onClick={() => onNavigateTab('settings')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md transition-all whitespace-nowrap self-end sm:self-auto"
            >
              ⚙️ {isRtl ? 'الذهاب إلى الإعدادات' : 'Go to Settings'}
            </button>
          )}
        </div>
      )}

      {/* FINAL OUTPUT REPORT (الخلاصة والزبدة) */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Output Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 text-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl gap-4">
            <div>
              <div className="flex items-center gap-2 text-green-400 text-xs font-black mb-1">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
                {isRtl ? 'التقرير التجميعي النهائي جاهز (الخلاصة والزبدة)' : 'Final Master Summary Report Ready'}
              </div>
              <h3 className="text-xl md:text-2xl font-black">
                {result.topic}
              </h3>
              <p className="text-gray-400 text-xs font-bold mt-1">
                {isRtl ? `تم الحساب والتأكد في: ${result.timestamp}` : `Generated at: ${result.timestamp}`}
              </p>
            </div>

            <button
              onClick={() => {
                const fullSummary = `📌 العنوان الاستهدافي:\n${result.finalTitle}\n\n📝 الوصف المحسن للـ SEO:\n${result.finalDescription}\n\n🏷️ الوسوم المفتاحية:\n${result.finalTags.join(', ')}\n\n⏰ موعد النشر الموصى به:\n${result.bestPublishTime}`;
                handleCopy(fullSummary, 'fullReport');
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl md:rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>{copiedField === 'fullReport' ? '✓' : '📋'}</span>
              <span>{copiedField === 'fullReport' ? (isRtl ? 'تم نسخ التقرير الكامل!' : 'Copied Full Report!') : (isRtl ? 'نسخ التقرير بالكامل' : 'Copy Full Summary')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (8 cols): Title, Description, Tags, Schedule */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Target Magnetic Title */}
              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 space-y-3 relative group">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <span>📌</span>
                    <span>{isRtl ? '1. العنوان الاستهدافي الجذاب (High-CTR Title)' : '1. Targeted Magnetic Title'}</span>
                  </span>

                  <button
                    onClick={() => handleCopy(result.finalTitle, 'title')}
                    className="text-xs font-bold bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    {copiedField === 'title' ? (isRtl ? '✓ تم النسخ' : '✓ Copied') : (isRtl ? 'نسخ العنوان' : 'Copy Title')}
                  </button>
                </div>

                <div className="bg-gray-50 p-4 md:p-5 rounded-2xl border border-gray-100 text-gray-900 font-black text-base md:text-lg leading-snug">
                  {result.finalTitle}
                </div>
              </div>

              {/* 2. SEO Optimized Description */}
              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-purple-600 uppercase tracking-wider flex items-center gap-2">
                    <span>📝</span>
                    <span>{isRtl ? '2. الوصف الاستهدافي المحسن للـ SEO' : '2. SEO Optimized Description'}</span>
                  </span>

                  <button
                    onClick={() => handleCopy(result.finalDescription, 'description')}
                    className="text-xs font-bold bg-gray-100 hover:bg-purple-50 hover:text-purple-600 text-gray-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    {copiedField === 'description' ? (isRtl ? '✓ تم النسخ' : '✓ Copied') : (isRtl ? 'نسخ الوصف' : 'Copy Description')}
                  </button>
                </div>

                <div className="bg-gray-50 p-4 md:p-5 rounded-2xl border border-gray-100 text-gray-800 font-bold text-xs md:text-sm leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
                  {result.finalDescription}
                </div>
              </div>

              {/* 3. Tags & Keywords */}
              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                    <span>🏷️</span>
                    <span>{isRtl ? '3. الوسوم والكلمات المفتاحية المجمعة' : '3. Aggregated High-Converting Tags'}</span>
                  </span>

                  <button
                    onClick={() => handleCopy(result.finalTags.join(', '), 'tags')}
                    className="text-xs font-bold bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 text-gray-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    {copiedField === 'tags' ? (isRtl ? '✓ تم النسخ' : '✓ Copied') : (isRtl ? 'نسخ جميع الوسوم' : 'Copy All Tags')}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.finalTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. Best Publishing Schedule */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-amber-200/80 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-md">
                  ⏰
                </div>
                <div>
                  <h4 className="text-amber-900 font-black text-xs uppercase tracking-wider mb-1">
                    {isRtl ? '4. أفضل موعد موصى به للنشر (Publishing Timing)' : '4. Best Recommended Publishing Schedule'}
                  </h4>
                  <p className="text-gray-900 font-black text-sm md:text-base leading-relaxed">
                    {result.bestPublishTime}
                  </p>
                  <p className="text-amber-700 text-[11px] font-semibold mt-1">
                    {isRtl
                      ? 'تم حساب هذا التوقيت بناءً على ذروة تواجد واهتمام الجمهور المستهدف لمنع الضياع وسط المنافسة.'
                      : 'Calculated based on audience peak engagement hours for maximum day-one exposure.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Thumbnail Image & Pipeline Intelligence */}
            <div className="lg:col-span-5 space-y-6">
              {/* Thumbnail Result Card */}
              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
                <span className="text-xs font-black text-rose-600 uppercase tracking-wider flex items-center gap-2">
                  <span>🎨</span>
                  <span>{isRtl ? '5. الصورة المصغرة التنافسية (High-CTR Thumbnail)' : '5. Competitive Thumbnail'}</span>
                </span>

                <div className="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-slate-900 aspect-video">
                  {result.thumbnailUrl ? (
                    <img
                      src={result.thumbnailUrl}
                      alt="Thumbnail Result"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                      {isRtl ? 'جاري العرض...' : 'Loading image...'}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                    {result.thumbnailUrl && (
                      <a
                        href={result.thumbnailUrl}
                        download={`thumbnail-${Date.now()}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white text-gray-900 px-4 py-2 rounded-xl font-black text-xs shadow-lg hover:bg-gray-100 transition-all flex items-center gap-2"
                      >
                        <span>⬇️</span>
                        <span>{isRtl ? 'تحميل الصورة' : 'Download Image'}</span>
                      </a>
                    )}
                  </div>
                </div>

                {result.thumbnailHookText && (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider shrink-0">
                      {isRtl ? '🔥 النص الخاطف المكتوب على الصورة (3-5 كلمات):' : '🔥 Thumbnail Punchline (High CTR):'}
                    </span>
                    <span className="text-xs font-black text-rose-950 bg-white px-2.5 py-1 rounded-lg border border-rose-100 shadow-sm">
                      "{result.thumbnailHookText}"
                    </span>
                  </div>
                )}

                <p className="text-[11px] font-bold text-gray-400 text-center">
                  {isRtl
                    ? 'تم توليد هذه الصورة بأبعاد 16:9 وألوان عالية التباين لزيادة نسبة النقر (CTR).'
                    : 'Generated in 16:9 ratio with high-contrast palette for maximum click-through rate.'
                  }
                </p>
              </div>

              {/* Pipeline Intelligence Insights Breakdown */}
              <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl space-y-4">
                <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-2">
                  <span>📊</span>
                  <span>{isRtl ? 'استخبارات المسار المتكامل' : 'Pipeline Intelligence Breakdown'}</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex justify-between items-center">
                    <span className="text-gray-400 font-semibold">{isRtl ? 'الكلمة المفتاحية الرئيسية:' : 'Primary Keyword:'}</span>
                    <span className="font-black text-blue-300">{result.primaryKeyword}</span>
                  </div>

                  {result.exploitKeywords.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                      <span className="text-gray-400 font-semibold block">{isRtl ? 'كلمات الفجوة المستغلة:' : 'Exploited Gap Words:'}</span>
                      <div className="flex flex-wrap gap-1">
                        {result.exploitKeywords.slice(0, 4).map((kw, i) => (
                          <span key={i} className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/50">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.gapInfo?.message && (
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                      <span className="text-gray-400 font-semibold block">{isRtl ? 'تحليل فجوة المنافسين:' : 'Competitor Gap:'}</span>
                      <span className="text-gray-300 font-medium text-[11px] leading-tight block">
                        {result.gapInfo.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterWorkflowTab;
