
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ThemeColor, Platform, COUNTRIES } from '../types';

const gemini = new GeminiService();

interface TagTabProps {
  theme: ThemeColor;
  daysCount: number;
}

const TagTab: React.FC<TagTabProps> = ({ theme, daysCount }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.YOUTUBE);
  const [country, setCountry] = useState('GLOBAL');
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setCopied(false);
    try {
      const result = await gemini.generateTags(topic, platform, country);
      // التأكد من أن النتيجة مصفوفة وليست كائناً يحتوي على حقول تحليلية
      if (Array.isArray(result)) {
        setTags(result);
      } else if (result && typeof result === 'object' && (result as any).viral_tags) {
        setTags((result as any).viral_tags);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء توليد العلامات.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (tags.length === 0) return;
    navigator.clipboard.writeText(tags.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const buttonClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  const platformOptions = [
    { id: Platform.YOUTUBE, label: '🎥 YouTube Studio Tags' },
    { id: Platform.GOOGLE, label: '🔍 Google SEO Keywords' },
    { id: Platform.TIKTOK, label: '🎵 TikTok Hashtags' },
    { id: Platform.INSTAGRAM, label: '📸 Instagram Tags' },
    { id: Platform.FACEBOOK, label: '👥 Facebook Topics' },
    { id: Platform.PINTEREST, label: '📌 Pinterest Keywords' },
  ];

  const currentPlatform = platformOptions.find(p => p.id === platform) || platformOptions[0];

  return (
    <div className="max-w-5xl mx-auto p-2 md:p-4 font-cairo">
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl border border-gray-100 mb-6 md:mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
              <span>🏷️</span> مولد العلامات الذكي
            </h2>
            <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">نظام (SEO Ready) - {daysCount} يوم</p>
          </div>
          <select 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-gray-100 border-none px-4 py-2 rounded-xl text-[10px] md:text-xs font-black outline-none w-full md:w-auto"
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>
        </div>
        
        <div className="space-y-6">
          <div className="w-full">
            <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase">الموضوع</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="عن ماذا يتحدث المحتوى الخاص بك؟"
              className="w-full px-6 md:px-10 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-white border-2 border-gray-200 text-black font-black text-lg md:text-2xl outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase">المنصة</label>
              <select
                value={platform}
                onChange={(e) => { setPlatform(e.target.value as Platform); setTags([]); }}
                className="w-full px-6 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] border-2 border-gray-100 bg-white font-black text-gray-700 outline-none text-sm md:text-lg appearance-none cursor-pointer"
              >
                {platformOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
            </div>

            <div className="flex-[2] flex flex-col">
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase">تأكيد</label>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`${buttonClasses[theme]} w-full text-white px-6 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] transition-all font-black disabled:opacity-50 shadow-lg flex items-center justify-center gap-4 text-sm md:text-xl active:scale-95`}
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>توليد العلامات</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {Array.isArray(tags) && tags.length > 0 && (
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-gray-100 animate-in slide-in-from-bottom-5">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-50 pb-6">
            <h3 className="text-lg md:text-xl font-black text-gray-900">🎯 العلامات المقترحة</h3>
            <button
              onClick={copyToClipboard}
              className={`w-full md:w-auto px-8 py-3 rounded-xl border-2 transition-all font-black text-xs md:text-sm ${copied ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-50 border-gray-100 text-blue-600'}`}
            >
              {copied ? "✅ تم النسخ!" : "📋 نسخ الكل"}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {tags.map((tag, idx) => (
              <div key={idx} className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black border border-gray-100 text-center truncate">
                {String(tag)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagTab;
