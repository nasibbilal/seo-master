
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { Platform, RadarInsight, ThemeColor, CATEGORIES, COUNTRIES } from '../types';

const gemini = new GeminiService();

interface RadarTabProps {
  theme: ThemeColor;
  onTrendDetected?: (title: string) => void;
}

const RadarTab: React.FC<RadarTabProps> = ({ theme, onTrendDetected }) => {
  const [selectedCategory, setSelectedCategory] = useState('tech');
  const [selectedCountry, setSelectedCountry] = useState('GLOBAL');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<RadarInsight[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<{ isGap: boolean; message: string; urgency: string } | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setGapAnalysis(null);
    try {
      const data = await gemini.fetchRadarTrends(selectedCategory, selectedCountry);
      setInsights(data);
      
      // تحليل فجوة المحتوى لأعلى تريند
      if (data.length > 0) {
        const topTrend = data.reduce((prev, current) => (prev.growthPercentage > current.growthPercentage) ? prev : current);
        const gap = await gemini.checkContentGap(topTrend.title);
        setGapAnalysis(gap);
        if (gap.isGap && onTrendDetected) {
          onTrendDetected(topTrend.title);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const themeClasses = {
    red: 'bg-red-600 hover:bg-red-700 shadow-red-200',
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    purple: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200',
  }[theme];

  return (
    <div className="max-w-7xl mx-auto p-4 font-cairo text-right">
      {/* Control Panel */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-4">
              <span className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl animate-pulse">📡</span>
              الرادار الذكي - Smart Radar
            </h2>
            <p className="text-gray-400 font-bold mt-2">نظام مراقبة حي لكافة المنصات لاقتناص التريندات الصاعدة.</p>
          </div>
          <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-gray-100 border-none px-6 py-3 rounded-2xl text-xs font-black outline-none cursor-pointer w-full md:w-auto"
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="w-full">
            <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4 uppercase tracking-widest">اختر تخصص القناة (Niche)</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none font-black text-lg shadow-inner appearance-none transition-all cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
              <span className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleScan}
              disabled={loading}
              className={`${themeClasses} text-white px-10 py-5 rounded-[2rem] font-black disabled:opacity-50 transition-all flex items-center justify-center gap-4 text-xl shadow-2xl active:scale-95`}
            >
              {loading ? <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>🔥</span> تفعيل رادار التريندات</>}
            </button>
          </div>
        </div>
      </div>

      {/* Radar Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <span className="text-blue-600">📡</span> رصد مباشر للنمو
          </h3>
          
          {insights.length > 0 ? (
            insights.map((insight) => (
              <div key={insight.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl transition-all">
                <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg ${insight.platform === Platform.YOUTUBE ? 'bg-red-600' : insight.platform === Platform.TIKTOK ? 'bg-black' : 'bg-blue-600'}`}>
                  <span className="text-2xl">{insight.platform === Platform.YOUTUBE ? '🎥' : insight.platform === Platform.TIKTOK ? '🎵' : '🔍'}</span>
                  <span className="text-[8px] uppercase">{insight.platform}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{insight.title}</h4>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black">+{insight.growthPercentage}% نمو</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${insight.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                      أولوية: {insight.priority === 'high' ? 'قصوى' : 'متوسطة'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">التصنيف: {insight.category}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 border-4 border-dashed border-gray-200 rounded-[3rem] p-20 text-center opacity-50 grayscale">
              <span className="text-6xl block mb-4">🛸</span>
              <p className="font-black text-gray-400">الرادار جاهز للمسح.. اختر تخصصك وابدأ البحث</p>
            </div>
          )}
        </div>

        {/* Black Box Analysis */}
        <div className="space-y-6">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <span className="text-amber-500">⬛</span> المربع الأسود (فجوات المحتوى)
          </h3>
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white min-h-[400px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[60px] rounded-full"></div>
            
            {gapAnalysis ? (
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center animate-bounce">⚠️</div>
                  <h4 className="text-xl font-black">تنبيه فجوة ضرورية</h4>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">
                  <p className="text-gray-400 text-[10px] font-black uppercase mb-2 tracking-widest">تحليل الذكاء الاصطناعي</p>
                  <p className="text-sm font-bold leading-relaxed">
                    "{gapAnalysis.message || 'تم اكتشاف موضوع ينمو بسرعة الصاروخ في مجالك، ولم يتم تغطيته في محتواك الأخير. هذا قد يؤدي لفقدان نسبة كبيرة من المشاهدات المحتملة.'}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-600/20 border border-red-600/30 rounded-2xl p-4 text-center">
                    <span className="block text-[8px] font-black text-red-400 uppercase">مستوى الإلحاح</span>
                    <span className="text-lg font-black text-red-500 uppercase">{gapAnalysis.urgency}</span>
                  </div>
                  <div className="bg-blue-600/20 border border-blue-600/30 rounded-2xl p-4 text-center">
                    <span className="block text-[8px] font-black text-blue-400 uppercase">حالة القناة</span>
                    <span className="text-lg font-black text-blue-500 uppercase">تأخر</span>
                  </div>
                </div>

                <button className="w-full mt-10 py-5 bg-white text-slate-900 font-black rounded-[1.5rem] hover:bg-gray-200 transition-all active:scale-95 shadow-xl">
                   إنشاء خطة تصوير فورية ⚡
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                <span className="text-5xl">🔭</span>
                <p className="font-bold">جاري انتظار بيانات الرادار لمطابقتها مع قناتك..</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarTab;
