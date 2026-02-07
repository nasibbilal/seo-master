
import React, { useState } from 'react';

interface AuthGateProps {
  onLogin: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    // محاكاة تسجيل دخول آمن
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // محاكاة استدعاء Google Identity Service
    setTimeout(() => {
      setGoogleLoading(false);
      onLogin();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center z-[500] font-cairo overflow-hidden">
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-red-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative w-full max-w-md px-6 py-8 md:p-8 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-blue-600 to-red-600 rounded-[2rem] md:rounded-[2.5rem] text-4xl md:text-5xl mb-6 shadow-[0_20px_50px_rgba(37,99,235,0.3)] transform hover:rotate-12 transition-transform duration-500 cursor-default select-none">🚀</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">SEOMaster Intelligence</h1>
          <p className="text-gray-500 font-bold text-xs md:text-sm">نظام الذكاء الاصطناعي الأقوى لتصدر النتائج</p>
        </div>

        <div className="bg-white/5 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">البريد الإلكتروني</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  placeholder="name@company.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500 focus:bg-white/[0.07] transition-all shadow-inner text-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">✉️</span>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mr-2">كلمة المرور</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500 focus:bg-white/[0.07] transition-all shadow-inner text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-2 z-10"
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-black px-2">
              <button type="button" className="text-blue-500 hover:text-blue-400 transition-colors">نسيت كلمة المرور؟</button>
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-gray-400 hover:text-white transition-colors">
                {isLogin ? 'إنشاء حساب جديد' : 'لديك حساب بالفعل؟'}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black py-4 md:py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 relative overflow-hidden group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                <span className="relative z-10 text-sm md:text-base">{isLogin ? 'دخول للمنصة' : 'سجل الآن مجاناً'}</span>
              )}
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          {/* Divider with Text */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">أو تسجيل الدخول عبر</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {/* Professional Google Login Button */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full bg-white text-gray-800 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all shadow-lg disabled:opacity-50 border border-transparent"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm">التسجيل بواسطة Google</span>
              </>
            )}
          </button>
        </div>

        <p className="text-center mt-8 text-[9px] md:text-[10px] text-gray-600 font-bold uppercase tracking-widest select-none">جميع الحقوق محفوظة © SEOMaster Intelligence 2025</p>
      </div>
    </div>
  );
};

export default AuthGate;
