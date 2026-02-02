
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Platform, CompetitorData, ThemeColor } from '../types';

const gemini = new GeminiService();

interface CompetitorTabProps {
  theme: ThemeColor;
}

const CompetitorTab: React.FC<CompetitorTabProps> = ({ theme }) => {
  const [competitorId, setCompetitorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompetitorData[]>([]);
  const [gapData, setGapData] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!competitorId) return;
    setLoading(true);
    setGapData(null);
    try {
      const data = await gemini.analyzeCompetitor(competitorId, [Platform.YOUTUBE, Platform.FACEBOOK]);
      setResults(data);
      
      const gap = await gemini.calculateCompetitiveGap("نفس نيش المنافس", data);
      setGapData(gap);
    } catch (error) {
      alert("فشل جلب بيانات المنافس. تأكد من إعدادات الـ API.");
    } finally {
      setLoading(false);
    }
  };

  const themeClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  }[theme];

  return (
    <div className="max-w-7xl mx-auto p-4 font-cairo">
      <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 mb-10">
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <span>🕵️</span> وحدة استخبارات المنافسين
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={competitorId}
            onChange={(e) => setCompetitorId(e.target.value)}
            placeholder="أدخل اسم المستخدم للمنافس (Handle or ID)..."
            className="flex-1 px-8 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none font-bold"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`${themeClasses} text-white px-10 py-5 rounded-2xl font-black disabled:opacity-50 transition-all flex items-center justify-center gap-3`}
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "تحليل المنافس"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="font-black text-xl mb-4">نشاط المنافس عبر المنصات</h3>
            {results.map((res, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-gray-100 px-4 py-1 rounded-xl font-black text-xs">{res.platform}</span>
                  <span className="text-green-600 font-black">%{res.engagementRate} تفاعل</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {res.topKeywords.map((kw, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black">#{kw}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <span className="text-amber-400">⚡</span> الفجوة التنافسية المكتشفة
            </h3>
            {gapData ? (
              <div className="space-y-4">
                {gapData.gapKeywords?.map((gap: any, idx: number) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-lg">{gap.keyword}</span>
                      <span className="text-green-400 font-black">فرصة {gap.opportunityScore}%</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{gap.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 font-bold text-center py-20">جاري حساب الفجوة السوقية بناءً على نشاط المنافسين والطلب الحالي...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorTab;
