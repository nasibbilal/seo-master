
import React, { useState, useEffect } from 'react';
import { ThemeColor, APIUsageStats, ReportSettings } from '../types';
import { GeminiService } from '../services/geminiService';
import { jsPDF } from 'jspdf';

interface SettingsTabProps {
  theme: ThemeColor;
  activeChannelId: string;
}

const ConnectionStatus: React.FC<{ 
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}> = ({ status, errorMessage }) => {
  if (status === 'idle') return null;
  if (status === 'loading') return <div className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />;
  if (status === 'success') return <span className="text-green-500 font-black text-[10px] animate-bounce">✅ تم الاتصال</span>;
  
  return (
    <div className="flex flex-col items-end">
      <span className="text-red-500 font-black text-[10px]">❌ خطأ</span>
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
          {show ? '👁️' : '🔒'}
        </button>
      </div>
    </div>
  );
};

const SettingsTab: React.FC<SettingsTabProps> = ({ theme, activeChannelId }) => {
  const gemini = new GeminiService();
  const [saved, setSaved] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // API State
  const [googleToken, setGoogleToken] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [tiktokSecret, setTiktokSecret] = useState('');
  const [pinterestToken, setPinterestToken] = useState('');

  // Report State
  const [reportEnabled, setReportEnabled] = useState(false);
  const [reportEmail, setReportEmail] = useState('');
  const [reportDay, setReportDay] = useState('Thursday');

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
    
    const activeChannel = gemini.getChannels().find(c => c.id === activeChannelId);
    if (activeChannel?.reportSettings) {
      setReportEnabled(activeChannel.reportSettings.enabled);
      setReportEmail(activeChannel.reportSettings.email);
      setReportDay(activeChannel.reportSettings.scheduleDay);
    } else {
      setReportEnabled(false);
      setReportEmail('');
      setReportDay('Thursday');
    }

    setYoutubeKey(yt.youtube_key || '');
    setMetaToken(meta.meta_token || '');
    setGoogleToken(gsc.google_token || '');
    setTiktokSecret(tt.tiktok_secret || '');
    setPinterestToken(pin.pinterest_token || '');
  }, [activeChannelId]);

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

    const channels = gemini.getChannels();
    const idx = channels.findIndex(c => c.id === activeChannelId);
    if (idx > -1) {
      channels[idx].reportSettings = {
        enabled: reportEnabled,
        email: reportEmail,
        scheduleDay: reportDay
      };
      gemini.saveChannels(channels);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const generatePreviewReport = async () => {
    setReportLoading(true);
    try {
      const channel = gemini.getChannels().find(c => c.id === activeChannelId);
      const data = await gemini.generateWeeklyReportData(channel?.name || 'My Channel', 'Tech & Content Creation');
      
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text("SEOMaster Intelligence: Weekly Strategic Report", 20, 25);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139);
      doc.text(`Channel Account: ${channel?.name}`, 20, 35);
      doc.text(`Generation Date: ${new Date().toLocaleDateString()}`, 20, 42);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 50, 190, 50);
      
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text("1. Top Viral Trends Found", 20, 65);
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      data.topTrends.forEach((trend: string, i: number) => {
        doc.text(`- ${trend}`, 25, 75 + (i * 8));
      });
      
      doc.setFontSize(16);
      doc.setTextColor(220, 38, 38);
      doc.text("2. Market Content Gaps", 20, 110);
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      data.contentGaps.forEach((gap: any, i: number) => {
        doc.text(`Competitor Spike: ${gap.competitorSuccess}`, 25, 120 + (i * 15));
        doc.text(`Your Strategic Action: ${gap.userMissingAction}`, 25, 125 + (i * 15));
      });

      doc.setFontSize(16);
      doc.setTextColor(245, 158, 11);
      doc.text("3. Top 5 Recurring Audience Questions", 20, 170);
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      data.topRecurringQuestions.forEach((q: string, i: number) => {
        doc.text(`${i+1}. ${q}`, 25, 180 + (i * 8));
      });
      
      doc.setFontSize(16);
      doc.setTextColor(124, 58, 237);
      doc.text("4. Strategic Growth Roadmap (Gemini AI)", 20, 230);
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const splitAdvice = doc.splitTextToSize(data.geminiAdvice, 165);
      doc.text(splitAdvice, 20, 240);
      
      doc.save(`SEOMaster_Weekly_Report_${activeChannelId}.pdf`);
    } catch (error) {
      alert("فشل توليد التقرير.");
    } finally {
      setReportLoading(false);
    }
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl md:text-4xl font-black text-gray-900">إعدادات المنصة المتكاملة</h2>
            <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                القناة الحالية: {gemini.getChannels().find(c => c.id === activeChannelId)?.name}
            </span>
          </div>
          <p className="text-gray-400 font-bold text-sm">إدارة الربط، الأتمتة، والتقارير الأسبوعية لقناتك المختارة.</p>
        </header>

        {/* Section: API Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
            />
          </div>

          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📸</div>
              <h3 className="font-black text-lg">Meta (FB & IG) Graph API</h3>
            </div>
            <PasswordField 
              label="meta_token" 
              value={metaToken} 
              onChange={setMetaToken} 
              onTest={() => handleTest('meta', { meta_token: metaToken }, setMetaStatus, setMetaError)}
              testStatus={metaStatus}
              testError={metaError}
            />
          </div>

          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🎵</div>
              <h3 className="font-black text-lg">TikTok Business API</h3>
            </div>
            <PasswordField 
              label="tiktok_secret" 
              value={tiktokSecret} 
              onChange={setTiktokSecret} 
              onTest={() => handleTest('tiktok', { tiktok_secret: tiktokSecret }, setTiktokStatus, setTiktokError)}
              testStatus={tiktokStatus}
              testError={tiktokError}
            />
          </div>

          <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📌</div>
              <h3 className="font-black text-lg">Pinterest API Key</h3>
            </div>
            <PasswordField 
              label="pinterest_token" 
              value={pinterestToken} 
              onChange={setPinterestToken} 
              onTest={() => handleTest('pinterest', { pinterest_token: pinterestToken }, setPinStatus, setPinError)}
              testStatus={pinStatus}
              testError={pinError}
            />
          </div>
        </div>

        {/* Section: Automated Weekly Reports */}
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 mb-12 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
           <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                 <div>
                    <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                       <span className="bg-blue-600 p-2 rounded-xl text-lg">📄</span>
                       التقارير الأسبوعية الذكية
                    </h3>
                    <p className="text-gray-400 text-sm font-bold">نظام يراقب المنافسين ويرسل لك ملخص الفرص كل أسبوع.</p>
                 </div>
                 <div onClick={() => setReportEnabled(!reportEnabled)} className="flex items-center gap-3 cursor-pointer group">
                    <span className="text-[10px] font-black text-gray-400 uppercase">تفعيل؟</span>
                    <div className={`w-14 h-7 rounded-full relative transition-all border-2 ${reportEnabled ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-slate-700'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-lg ${reportEnabled ? 'right-8' : 'right-1'}`} />
                    </div>
                 </div>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all ${reportEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-2">بريد الاستلام</label>
                    <input 
                      type="email" 
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-2">يوم الإرسال</label>
                    <select 
                      value={reportDay}
                      onChange={(e) => setReportDay(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all appearance-none"
                    >
                       <option value="Thursday" className="bg-slate-900">الخميس</option>
                       <option value="Monday" className="bg-slate-900">الاثنين</option>
                    </select>
                 </div>
              </div>

              <div className="mt-8 flex gap-4">
                 <button 
                  onClick={generatePreviewReport}
                  disabled={reportLoading}
                  className="bg-white/10 hover:bg-white/20 text-white font-black px-8 py-4 rounded-2xl border border-white/10 transition-all flex items-center gap-2"
                 >
                    {reportLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '👁️ معاينة وتحميل تقرير الأسبوع'}
                 </button>
              </div>
           </div>
        </div>

        <button 
          onClick={handleSaveAll} 
          className={`w-full py-8 rounded-[2.5rem] text-white font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${themeClasses}`}
        >
          {saved ? (
            <><span>✅</span> تم حفظ الأتمتة</>
          ) : (
            <><span>💾</span> حفظ الإعدادات</>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
