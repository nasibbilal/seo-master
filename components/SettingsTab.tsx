
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
  if (status === 'loading') return <div className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />;
  if (status === 'success') return <span className="text-green-500 font-black text-[10px] animate-bounce">✅ تم الاتصال بنجاح</span>;
  
  return (
    <div className="flex flex-col items-end">
      <span className="text-red-500 font-black text-[10px]">❌ خطأ في الكود</span>
      {errorMessage && <span className="text-[8px] text-red-400 font-bold max-w-[120px] text-left leading-tight mt-1">{errorMessage}</span>}
    </div>
  );
};

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onTest: () => Promise<void>;
  testStatus: 'idle' | 'loading' | 'success' | 'error';
  testError?: string;
}> = ({ label, value, onChange, placeholder, onTest, testStatus, testError }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-2">
          <ConnectionStatus status={testStatus} errorMessage={testError} />
          <button 
            onClick={onTest}
            className="text-[9px] font-black text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-md transition-all active:scale-95"
          >
            اختبار الربط
          </button>
        </div>
      </div>
      <div className="relative group">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none font-bold transition-all text-sm shadow-inner ${testStatus === 'success' ? 'border-green-100' : testStatus === 'error' ? 'border-red-100' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors text-lg"
        >
          {show ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
    </div>
  );
};

const SettingsTab: React.FC<SettingsTabProps> = ({ theme }) => {
  const gemini = new GeminiService();
  const [saved, setSaved] = useState(false);

  // Row 1
  const [googleToken, setGoogleToken] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  
  // Row 2
  const [metaToken, setMetaToken] = useState('');
  const [tiktokSecret, setTiktokSecret] = useState('');
  
  // Row 3
  const [pinterestToken, setPinterestToken] = useState('');

  // Statuses
  const [ytStatus, setYtStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [ytError, setYtError] = useState('');
  const [googleStatus, setGoogleStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [googleError, setGoogleError] = useState('');
  const [metaStatus, setMetaStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [metaError, setMetaError] = useState('');
  const [tiktokStatus, setTiktokStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tiktokError, setTiktokError] = useState('');
  const [pinStatus, setPinStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const yt = gemini.getPlatformConfig('youtube');
    const meta = gemini.getPlatformConfig('meta');
    const gsc = gemini.getPlatformConfig('google_search');
    const tt = gemini.getPlatformConfig('tiktok');
    const pin = gemini.getPlatformConfig('pinterest');

    if (yt.youtube_key) setYoutubeKey(yt.youtube_key);
    if (meta.meta_token) setMetaToken(meta.meta_token);
    if (gsc.google_token) setGoogleToken(gsc.google_token);
    if (tt.tiktok_secret) setTiktokSecret(tt.tiktok_secret);
    if (pin.pinterest_token) setPinterestToken(pin.pinterest_token);
  }, []);

  const handleTest = async (platform: string, config: any, setStatus: any, setError: any) => {
    setStatus('loading');
    setError('');
    const result = await gemini.testConnection(platform, config);
    if (result.success) setStatus('success');
    else { setStatus('error'); setError(result.message || 'خطأ مجهول'); }
    setTimeout(() => setStatus('idle'), 5000);
  };

  const handleSaveAll = () => {
    gemini.updatePlatformConfig('youtube', { youtube_key: youtubeKey });
    gemini.updatePlatformConfig('meta', { meta_token: metaToken });
    gemini.updatePlatformConfig('google_search', { google_token: googleToken });
    gemini.updatePlatformConfig('tiktok', { tiktok_secret: tiktokSecret });
    gemini.updatePlatformConfig('pinterest', { pinterest_token: pinterestToken });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const themeClasses = {
    red: 'bg-red-600 hover:bg-red-700 shadow-red-200',
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    purple: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200',
  }[theme];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 font-cairo text-right">
      <div className="bg-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 shadow-2xl border border-gray-100">
        <header className="mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">إعدادات الربط المباشر (API)</h2>
          <p className="text-gray-400 font-bold text-sm">قم بربط منصات البحث لجلب تحليلات واقعية من السيرفرات الرسمية.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Row 1: Google & YouTube */}
          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📉</div>
              <h3 className="font-black text-lg">Google Search Console</h3>
            </div>
            <PasswordField 
              label="google_token" 
              value={googleToken} 
              onChange={setGoogleToken} 
              onTest={() => handleTest('google_search', { google_token: googleToken }, setGoogleStatus, setGoogleError)}
              testStatus={googleStatus}
              testError={googleError}
              placeholder="GSC OAuth Access Token..."
            />
          </div>

          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-100 text-red-600 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🎥</div>
              <h3 className="font-black text-lg">YouTube Data API</h3>
            </div>
            <PasswordField 
              label="youtube_key" 
              value={youtubeKey} 
              onChange={setYoutubeKey} 
              onTest={() => handleTest('youtube', { youtube_key: youtubeKey }, setYtStatus, setYtError)}
              testStatus={ytStatus}
              testError={ytError}
              placeholder="YouTube API Key v3..."
            />
          </div>

          {/* Row 2: Meta & TikTok */}
          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-50 text-blue-800 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm">👥</div>
              <h3 className="font-black text-lg">Meta Business API</h3>
            </div>
            <PasswordField 
              label="meta_token" 
              value={metaToken} 
              onChange={setMetaToken} 
              onTest={() => handleTest('meta', { meta_token: metaToken }, setMetaStatus, setMetaError)}
              testStatus={metaStatus}
              testError={metaError}
              placeholder="Meta Graph Access Token..."
            />
          </div>

          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🎵</div>
              <h3 className="font-black text-lg">TikTok Research API</h3>
            </div>
            <PasswordField 
              label="tiktok_secret" 
              value={tiktokSecret} 
              onChange={setTiktokSecret} 
              onTest={() => handleTest('tiktok', { tiktok_secret: tiktokSecret }, setTiktokStatus, setTiktokError)}
              testStatus={tiktokStatus}
              testError={tiktokError}
              placeholder="TikTok Client Secret..."
            />
          </div>

          {/* Row 3: Pinterest & Soon */}
          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-50 text-red-500 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📌</div>
              <h3 className="font-black text-lg">Pinterest API</h3>
            </div>
            <PasswordField 
              label="pinterest_token" 
              value={pinterestToken} 
              onChange={setPinterestToken} 
              onTest={() => handleTest('pinterest', { pinterest_token: pinterestToken }, setPinStatus, setPinError)}
              testStatus={pinStatus}
              testError={pinError}
              placeholder="Pinterest Access Token..."
            />
          </div>

          <div className="bg-gray-100/30 p-6 md:p-8 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="text-4xl grayscale mb-2 opacity-30">🚀</div>
            <h3 className="font-black text-gray-300 text-lg">قريباً..</h3>
            <p className="text-[10px] text-gray-300 font-bold">المزيد من المنصات (X, LinkedIn) قادمة في التحديث القادم.</p>
          </div>
        </div>

        <button 
          onClick={handleSaveAll} 
          className={`w-full py-8 rounded-[2.5rem] text-white font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${themeClasses}`}
        >
          {saved ? (
            <><span>✅</span> تم الحفظ بنجاح</>
          ) : (
            <><span>💾</span> حفظ كافة الإعدادات</>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
