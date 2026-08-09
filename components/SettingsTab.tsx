
import React, { useState, useEffect } from 'react';
import { ThemeColor } from '../types';
import { GeminiService } from '../services/geminiService';

const gemini = new GeminiService();

interface TestStatus {
  loading: boolean;
  result: 'success' | 'error' | 'quota' | null;
}

const KeyCard: React.FC<{
  label: string;
  value: string;
  onChange?: (val: string) => void;
  onTest: () => void;
  testStatus: TestStatus;
  icon?: string;
}> = ({ label, value, onChange, onTest, testStatus, icon }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-blue-200 transition-all relative overflow-hidden group">
      <div className="flex justify-between items-center mb-4">
        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
           {label} {icon && <span className="text-xl">{icon}</span>}
        </label>
        {testStatus.result === 'quota' && (
          <span className="bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-lg animate-pulse flex items-center gap-1">
            ⚠️ حصة مستنفدة
          </span>
        )}
        {testStatus.result === 'error' && (
          <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-lg animate-pulse flex items-center gap-1">
            ✕ خطأ في الربط
          </span>
        )}
        {testStatus.result === 'success' && (
          <span className="bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-lg flex items-center gap-1">
            ✓ متصل
          </span>
        )}
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="relative">
          <input 
            type={show ? 'text' : 'password'} 
            value={value} 
            onChange={(e) => onChange?.(e.target.value)} 
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 transition-all h-[56px] text-center" 
            placeholder="••••••••••••••••"
          />
          <button onClick={() => setShow(!show)} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-600 transition-colors text-xl">
             {show ? '🔓' : '🔒'}
          </button>
        </div>
        
        <button 
          onClick={onTest}
          disabled={testStatus.loading || !value}
          className="w-full bg-blue-50 text-blue-600 rounded-2xl py-3 font-black text-xs hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-all h-[48px] border border-blue-100 shadow-sm"
        >
          {testStatus.loading ? 'جاري الفحص...' : 'اختبار الاتصال'}
        </button>
      </div>
    </div>
  );
};

const SettingsTab: React.FC<{ theme: ThemeColor; activeChannelId: string }> = ({ activeChannelId }) => {
  const [keys, setKeys] = useState({ gemini: '', google: '', youtube: '', youtube2: '', tiktok: '', meta: '', pin: '' });
  const [testStates, setTestStates] = useState<Record<string, TestStatus>>({
    gemini: { loading: false, result: null },
    google: { loading: false, result: null },
    youtube: { loading: false, result: null },
    youtube2: { loading: false, result: null },
    tiktok: { loading: false, result: null },
    meta: { loading: false, result: null },
    pinterest: { loading: false, result: null },
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const config = (p: string) => gemini.getPlatformConfig(p);
    setKeys({
      gemini: config('gemini').apiKey || '',
      google: config('google_search').google_token || '',
      youtube: config('youtube').youtube_key || '',
      youtube2: config('youtube').youtube_key_2 || '',
      tiktok: config('tiktok').tiktok_secret || '',
      meta: config('meta').meta_token || '',
      pin: config('pinterest').pinterest_token || '',
    });
  }, [activeChannelId]);

  const handleTest = async (platform: string, keyValue: string) => {
    const testKey = platform === 'pinterest_token' ? 'pinterest' : 
                   platform === 'youtube_key_2' ? 'youtube2' :
                   platform.replace('_search', '').replace('_token', '');
    
    setTestStates(prev => ({ ...prev, [testKey]: { loading: true, result: null } }));
    
    try {
      const res = await gemini.testConnection(platform, { token: keyValue });
      
      let finalResult: 'success' | 'error' | 'quota' = 'error';
      if (res.success) finalResult = 'success';
      else if (res.errorType === 'QUOTA') finalResult = 'quota';
      else finalResult = 'error';
      
      setTestStates(prev => ({ 
        ...prev, 
        [testKey]: { loading: false, result: finalResult } 
      }));
    } catch (e) {
      setTestStates(prev => ({ 
        ...prev, 
        [testKey]: { loading: false, result: 'error' } 
      }));
    }
  };

  const handleSave = () => {
    gemini.updatePlatformConfig('gemini', { apiKey: keys.gemini });
    gemini.updatePlatformConfig('google_search', { google_token: keys.google });
    gemini.updatePlatformConfig('youtube', { 
      youtube_key: keys.youtube, 
      youtube_key_2: keys.youtube2 
    });
    gemini.updatePlatformConfig('tiktok', { tiktok_secret: keys.tiktok });
    gemini.updatePlatformConfig('meta', { meta_token: keys.meta });
    gemini.updatePlatformConfig('pinterest', { pinterest_token: keys.pin });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-cairo">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <KeyCard 
          label="GEMINI AI KEY (العقل المدبر)" 
          icon="🧠" 
          value={keys.gemini} 
          onChange={v => setKeys({...keys, gemini: v})}
          onTest={() => handleTest('gemini', keys.gemini)} 
          testStatus={testStates.gemini} 
        />

        <KeyCard 
          label="YOUTUBE DATA KEY 1" 
          icon="🎥" 
          value={keys.youtube} 
          onChange={v => setKeys({...keys, youtube: v})} 
          onTest={() => handleTest('youtube', keys.youtube)} 
          testStatus={testStates.youtube} 
        />

        <KeyCard 
          label="YOUTUBE DATA KEY 2 (الاحتياطي)" 
          icon="🛡️" 
          value={keys.youtube2} 
          onChange={v => setKeys({...keys, youtube2: v})} 
          onTest={() => handleTest('youtube_key_2', keys.youtube2)} 
          testStatus={testStates.youtube2} 
        />
        
        <KeyCard 
          label="GOOGLE SEARCH API" 
          icon="🔍" 
          value={keys.google} 
          onChange={v => setKeys({...keys, google: v})} 
          onTest={() => handleTest('google_search', keys.google)} 
          testStatus={testStates.google} 
        />
        
        <KeyCard 
          label="META (FB/INSTA) TOKEN" 
          icon="👥" 
          value={keys.meta} 
          onChange={v => setKeys({...keys, meta: v})} 
          onTest={() => handleTest('meta', keys.meta)} 
          testStatus={testStates.meta} 
        />
        
        <KeyCard 
          label="TIKTOK BUSINESS SECRET" 
          icon="🎵" 
          value={keys.tiktok} 
          onChange={v => setKeys({...keys, tiktok: v})} 
          onTest={() => handleTest('tiktok', keys.tiktok)} 
          testStatus={testStates.tiktok} 
        />
        
        <KeyCard 
          label="PINTEREST API TOKEN" 
          icon="📌" 
          value={keys.pin} 
          onChange={v => setKeys({...keys, pin: v})} 
          onTest={() => handleTest('pinterest_token', keys.pin)} 
          testStatus={testStates.pinterest} 
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <button 
          onClick={handleSave} 
          className="flex-1 bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-4"
        >
          {saved ? '✅ تم الحفظ والتفعيل' : '💾 حفظ جميع الإعدادات'}
        </button>
        <button 
          onClick={() => { gemini.clearKeyCache(); window.location.reload(); }} 
          className="bg-gray-100 text-gray-500 px-10 py-6 rounded-[2.5rem] font-black text-sm hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200"
        >
          تصفير الجلسة (Reset)
        </button>
      </div>
      
      <div className="mt-10 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex flex-col md:flex-row items-center gap-6">
         <div className="text-3xl">🛡️</div>
         <p className="text-blue-800 text-xs font-bold leading-relaxed text-right">
           <strong>نظام الحماية من نفاذ الحصة:</strong> عند إضافة "YOUTUBE DATA KEY 2"، سيقوم البرنامج تلقائياً باستخدامه كبديل في حال وصول المفتاح الأول للحد الأقصى للاستخدام اليومي، مما يضمن استمرارية خدمات "تحليل الجمهور" و"جلب الشعارات" دون توقف.
         </p>
      </div>
    </div>
  );
};

export default SettingsTab;
