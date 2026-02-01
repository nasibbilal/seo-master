
import React, { useState, useEffect } from 'react';
import { ThemeColor, APIUsageStats } from '../types';
import { GeminiService } from '../services/geminiService';

interface SettingsTabProps {
  theme: ThemeColor;
}

const ConnectionStatus: React.FC<{ 
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}> = ({ status, errorMessage }) => {
  if (status === 'idle') return null;
  if (status === 'loading') return <div className="w-3 h-3 md:w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />;
  if (status === 'success') return <span className="text-green-500 font-black text-[8px] md:text-[10px] animate-bounce whitespace-nowrap">✅ متصل بنجاح</span>;
  
  return (
    <div className="flex flex-col items-end">
      <span className="text-red-500 font-black text-[8px] md:text-[10px] whitespace-nowrap">❌ فشل الاتصال</span>
      {errorMessage && <span className="text-[7px] md:text-[8px] text-red-400 font-bold max-w-[120px] md:max-w-[150px] text-left leading-tight mt-1">{errorMessage}</span>}
    </div>
  );
};

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  helper?: string;
  onTest?: () => Promise<void>;
  testStatus?: 'idle' | 'loading' | 'success' | 'error';
  testError?: string;
}> = ({ label, value, onChange, placeholder, helper, onTest, testStatus = 'idle', testError }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4 md:mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-2">
          <ConnectionStatus status={testStatus} errorMessage={testError} />
          {onTest && testStatus === 'idle' && (
            <button 
              onClick={onTest}
              className="text-[8px] md:text-[9px] font-black text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-md"
            >
              اختبار الربط
            </button>
          )}
        </div>
      </div>
      <div className="relative group mb-2">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none font-bold transition-all text-xs md:text-sm shadow-inner ${testStatus === 'success' ? 'border-green-100' : testStatus === 'error' ? 'border-red-100' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors text-base md:text-lg"
        >
          {show ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
      {helper && <p className="mt-1 text-[8px] md:text-[9px] text-gray-400 font-bold leading-relaxed">{helper}</p>}
    </div>
  );
};

const SettingsTab: React.FC<SettingsTabProps> = ({ theme }) => {
  const [usage, setUsage] = useState<APIUsageStats>({ usedTokens: 0, limit: 100, percentage: 0 });
  const [saved, setSaved] = useState(false);
  const [restored, setRestored] = useState(false);
  
  const [ytKey, setYtKey] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [igToken, setIgToken] = useState('');
  const [tiktokKey, setTiktokKey] = useState('');
  const [tiktokSecret, setTiktokSecret] = useState('');
  const [pinterestToken, setPinterestToken] = useState('');

  const [ytStatus, setYtStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [ytError, setYtError] = useState('');
  const [metaStatus, setMetaStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [metaError, setMetaError] = useState('');
  const [pinStatus, setPinStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pinError, setPinError] = useState('');
  const [tiktokStatus, setTiktokStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tiktokError, setTiktokError] = useState('');

  const gemini = new GeminiService();

  useEffect(() => {
    setUsage(gemini.getUsageStats());
    const yt = gemini.getPlatformConfig('youtube');
    const meta = gemini.getPlatformConfig('meta');
    const ig = gemini.getPlatformConfig('instagram');
    const tt = gemini.getPlatformConfig('tiktok');
    const pin = gemini.getPlatformConfig('pinterest');

    let hasData = false;
    if (yt.ytKey) { setYtKey(yt.ytKey); hasData = true; }
    if (meta.metaToken) { setMetaToken(meta.metaToken); hasData = true; }
    if (ig.igToken) { setIgToken(ig.igToken); hasData = true; }
    if (tt.tiktokKey) { setTiktokKey(tt.tiktokKey); setTiktokSecret(tt.tiktokSecret || ''); hasData = true; }
    if (pin.pinToken) { setPinterestToken(pin.pinToken); hasData = true; }

    if (hasData) {
      setRestored(true);
      setTimeout(() => setRestored(false), 4000);
    }

    const handleUpdate = (e: any) => setUsage(e.detail);
    window.addEventListener('gemini_usage_updated', handleUpdate);
    return () => window.removeEventListener('gemini_usage_updated', handleUpdate);
  }, []);

  const handleTest = async (platform: string, config: any, setStatus: any, setError: any) => {
    gemini.updatePlatformConfig(platform, config);
    setStatus('loading');
    setError('');
    const result = await gemini.testConnection(platform, config);
    if (result.success) setStatus('success');
    else { setStatus('error'); setError(result.message || 'خطأ مجهول'); }
    setTimeout(() => setStatus('idle'), 5000);
  };

  const handleSave = () => {
    gemini.updatePlatformConfig('youtube', { ytKey });
    gemini.updatePlatformConfig('meta', { metaToken });
    gemini.updatePlatformConfig('instagram', { igToken });
    gemini.updatePlatformConfig('tiktok', { tiktokKey, tiktokSecret });
    gemini.updatePlatformConfig('pinterest', { pinToken: pinterestToken });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const themeClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  }[theme];

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-10 font-cairo text-right">
      {restored && (
        <div className="mb-4 p-3 bg-green-50 border-2 border-green-100 rounded-2xl text-green-700 font-black text-center shadow-sm text-[10px] md:text-sm animate-in fade-in slide-in-from-top-2">
          ✅ تم استعادة مفاتيح الربط الحقيقية بنجاح
        </div>
      )}

      <div className="bg-white rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 shadow-2xl border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-16 gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">إعدادات الربط المباشر</h2>
            <p className="text-gray-400 font-bold text-[10px] md:text-sm">أدخل مفاتيح الـ API للمنصات لتفعيل جلب البيانات الحقيقية.</p>
          </div>
          <button onClick={() => gemini.resetUsage()} className="text-[10px] font-black text-red-500 bg-red-50 px-4 py-2 rounded-xl">تصفير العداد</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-10 md:mb-16">
          {/* YouTube */}
          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 group transition-all">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="bg-red-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl">🎥</div>
              <h3 className="font-black text-base md:text-xl">YouTube API</h3>
            </div>
            <PasswordField label="API Key" value={ytKey} onChange={setYtKey} onTest={() => handleTest('youtube', { ytKey }, setYtStatus, setYtError)} testStatus={ytStatus} testError={ytError} />
          </div>

          {/* Meta */}
          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 group transition-all">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="bg-blue-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl">👥</div>
              <h3 className="font-black text-base md:text-xl">Meta API</h3>
            </div>
            <PasswordField label="Access Token" value={metaToken} onChange={setMetaToken} onTest={() => handleTest('meta', { metaToken }, setMetaStatus, setMetaError)} testStatus={metaStatus} testError={metaError} />
          </div>

          {/* Pinterest */}
          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 group transition-all">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="bg-red-500 text-white w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl">📌</div>
              <h3 className="font-black text-base md:text-xl">Pinterest API</h3>
            </div>
            <PasswordField label="Access Token" value={pinterestToken} onChange={setPinterestToken} onTest={() => handleTest('pinterest', { pinToken: pinterestToken }, setPinStatus, setPinError)} testStatus={pinStatus} testError={pinError} />
          </div>

          {/* TikTok */}
          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 group transition-all">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="bg-black text-white w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl">🎵</div>
              <h3 className="font-black text-base md:text-xl">TikTok API</h3>
            </div>
            <div className="space-y-4">
              <PasswordField label="Client Key" value={tiktokKey} onChange={setTiktokKey} />
              <PasswordField label="Client Secret" value={tiktokSecret} onChange={setTiktokSecret} onTest={() => handleTest('tiktok', { tiktokKey, tiktokSecret }, setTiktokStatus, setTiktokError)} testStatus={tiktokStatus} testError={tiktokError} />
            </div>
          </div>
        </div>

        <button onClick={handleSave} className={`w-full py-6 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white font-black text-lg md:text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4 md:gap-5 ${themeClasses}`}>
          {saved ? "✅ تم الحفظ بنجاح" : "💾 حفظ كافة الإعدادات"}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
