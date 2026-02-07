

import React, { useState } from 'react';
import { Platform, KeywordMetric, ThemeColor, COUNTRIES } from '../types';
import { GeminiService } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const gemini = new GeminiService();

interface AffiliateTabProps {
  theme: ThemeColor;
  daysCount: number;
}

const AffiliateTab: React.FC<AffiliateTabProps> = ({ theme, daysCount }) => {
  const [query, setQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.AMAZON);
  const [country, setCountry] = useState('GLOBAL');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeywordMetric[]>([]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setData([]);
    try {
      /* Fixed: Removed extra argument 'daysCount' which analyzeKeywords does not support */
      const results = await gemini.analyzeKeywords(query, selectedPlatform, country);
      setData(results);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء جلب عروض الأفلييت.");
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { id: Platform.AMAZON, name: 'Amazon Associates', icon: '🛒', color: 'bg-orange-500' },
    { id: Platform.ETSY, name: 'Etsy Affiliate', icon: '🎨', color: 'bg-orange-600' },
    { id: Platform.REDBUBBLE, name: 'Redbubble Design', icon: '👕', color: 'bg-red-600' },
    { id: Platform.GUMROAD, name: 'Gumroad Products', icon: '💎', color: 'bg-black' },
  ];

  const currentPlatform = platforms.find(p => p.id === selectedPlatform) || platforms[0];

  const themeClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  }[theme];

  return (
    <div className="max-w-7xl mx-auto p-4 font-cairo">
      {/* Search Console */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 mb-10 transition-all">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <span>💰</span> تحليل التسويق بالعمولة
          </h2>
          <select 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-gray-100 border-none px-5 py-2 rounded-2xl text-xs font-black outline-none cursor-pointer"
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>
        </div>

        <div className="space-y-6">
          <div className="w-full">
            <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4 uppercase">اسم المنتج أو النيش التجاري</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منتجات رابحة في أمازون، إيتسي، أو أي منصة..."
              className="w-full px-10 py-6 rounded-[2.5rem] bg-white border-2 border-gray-200 text-black font-black text-2xl outline-none transition-all focus:border-orange-500 shadow-sm"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-[0.4] relative">
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4 uppercase">سوق الأفلييت</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                className="w-full px-10 py-5 rounded-[2rem] border-2 border-gray-100 bg-white outline-none font-black text-gray-700 shadow-sm appearance-none cursor-pointer text-lg"
              >
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-4 uppercase">بدء البحث عن أرباح</label>
              <button
                onClick={handleSearch}
                disabled={loading}
                className={`${themeClasses} text-white px-10 py-5 rounded-[2rem] transition-all font-black disabled:opacity-50 shadow-2xl flex items-center justify-center gap-4 text-xl group`}
              >
                {loading ? (
                  <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><span>🚀</span> استكشاف العروض المربحة</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {data.length > 0 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
           {/* Chart Section */}
           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-10 flex items-center gap-3">
                <span className="bg-orange-50 p-2 rounded-xl text-orange-600">💹</span> توقعات الطلب والربحية
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="keyword" tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="strength" name="قوة المنتج" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <span className="bg-gray-100 p-2 rounded-xl">🛒</span> المنتجات المقترحة لـ {currentPlatform.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b-2 border-gray-50">
                      <th className="py-6 px-4 text-xs text-gray-400 font-black uppercase">المنتج / النيش</th>
                      <th className="py-6 px-4 text-xs text-gray-400 font-black uppercase text-center">العمولة المتوقعة</th>
                      <th className="py-6 px-4 text-xs text-gray-400 font-black uppercase text-center">حجم البحث</th>
                      <th className="py-6 px-4 text-xs text-gray-400 font-black uppercase text-center">رابط المنتج</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50 transition-all border-b border-gray-50/50">
                        <td className="py-6 px-4">
                          <p className="font-black text-gray-900 text-lg">{item.keyword}</p>
                        </td>
                        <td className="py-6 px-4 text-center">
                          <span className="font-black text-green-600 text-lg">{item.commissionRate || '5-10%'}</span>
                        </td>
                        <td className="py-6 px-4 text-center">
                          <span className={`px-5 py-2 rounded-2xl text-xs font-black text-white ${
                            item.searchVolume?.toLowerCase() === 'high' ? 'bg-green-500' : 'bg-amber-500'
                          }`}>
                            {item.searchVolume || 'Medium'}
                          </span>
                        </td>
                        <td className="py-6 px-4 text-center">
                          <a 
                            href={item.productLink || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all inline-block"
                          >
                            عرض المنتج 🔗
                          </a>
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

export default AffiliateTab;
