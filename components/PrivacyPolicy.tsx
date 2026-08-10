
import React from 'react';
import { ThemeColor } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface PrivacyPolicyProps {
  theme: ThemeColor;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ theme }) => {
  const { lang, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const themeClasses = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  }[theme];

  return (
    <div className={`max-w-4xl mx-auto p-6 font-cairo leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
        <h2 className={`text-3xl font-black mb-8 flex items-center gap-3 ${themeClasses}`}>
          <span>📜</span> {lang === 'ar' ? 'سياسة الخصوصية (Privacy Policy)' : 'Privacy Policy'}
        </h2>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{lang === 'ar' ? '1. مقدمة' : '1. Introduction'}</h3>
            <p>
              {lang === 'ar' 
                ? 'نحن في SEO Master نولي أهمية قصوى لخصوصية بياناتك. توضح هذه السياسة كيفية تعامل البرنامج مع البيانات والمعلومات عند استخدامك لخدماتنا التحليلية.'
                : 'At SEO Master, we prioritize your data privacy. This policy explains how our application handles data and information when you use our analytics services.'
              }
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{lang === 'ar' ? '2. جمع البيانات وتخزينها' : '2. Data Collection & Storage'}</h3>
            <p>
              {lang === 'ar'
                ? 'يعمل هذا البرنامج كأداة واجهة أمامية (Frontend Tool). نحن لا نقوم بتخزين أي مفاتيح سرية (API Keys) أو بيانات دخول على خوادمنا الخاصة. يتم تخزين جميع إعدادات الربط (مثل Facebook Token أو TikTok Keys) محلياً في متصفحك الخاص (Local Storage) ولا يمكننا الوصول إليها.'
                : 'This app operates as a client-side frontend tool. We do not store any API keys or credentials on private servers. All connection settings (such as Facebook tokens or TikTok keys) are stored locally in your browser (Local Storage) and are inaccessible to us.'
              }
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{lang === 'ar' ? '3. استخدام خدمات الطرف الثالث' : '3. Third-Party Services Usage'}</h3>
            <p>
              {lang === 'ar' ? 'يتواصل البرنامج مباشرة مع خدمات الطرف الثالث التالية لتحليل البيانات:' : 'The app connects directly with the following third-party services to analyze data:'}
            </p>
            <ul className={`list-disc list-inside space-y-2 mt-2 ${isRtl ? 'mr-4' : 'ml-4'}`}>
              <li><strong>Google Gemini API:</strong> {lang === 'ar' ? 'لتوليد التحليلات الذكية وتقييم الصور.' : 'For generating smart analytics and evaluating images.'}</li>
              <li><strong>Meta Graph API:</strong> {lang === 'ar' ? 'لجلب إحصائيات فيسبوك وإنستغرام.' : 'For fetching Facebook and Instagram statistics.'}</li>
              <li><strong>TikTok Business API:</strong> {lang === 'ar' ? 'لتحليل توجهات تيك توك.' : 'For analyzing TikTok trends.'}</li>
            </ul>
            <p className="mt-2">
              {lang === 'ar' ? 'تخضع هذه العمليات لسياسات الخصوصية الخاصة بتلك الشركات.' : 'These operations are governed by the respective privacy policies of those companies.'}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{lang === 'ar' ? '4. أمان المعلومات' : '4. Information Security'}</h3>
            <p>
              {lang === 'ar'
                ? 'بما أن البرنامج لا يمتلك قاعدة بيانات سحابية للمستخدمين، فإن أمان بياناتك يعتمد بشكل أساسي على أمان متصفحك وجهازك الشخصي. ننصح دائماً بعدم مشاركة لقطات شاشة تحتوي على مفاتيح الربط الخاصة بك.'
                : 'Since the app does not maintain a cloud user database, your data security depends primarily on your browser and personal device security. We advise never sharing screenshots containing your API keys.'
              }
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{lang === 'ar' ? '5. ملفات تعريف الارتباط (Cookies)' : '5. Cookies & Local Storage'}</h3>
            <p>
              {lang === 'ar'
                ? 'قد يستخدم المتصفح تقنيات التخزين المحلي لضمان بقاء إعداداتك (مثل لون السمات والمفاتيح السريعة) محفوظة عند إعادة تحميل الصفحة.'
                : 'Your browser uses local storage technologies to ensure your settings (such as theme color and shortcut keys) remain saved when reloading the page.'
              }
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{lang === 'ar' ? '6. التغييرات على السياسة' : '6. Policy Changes'}</h3>
            <p>
              {lang === 'ar' ? 'نحتفظ بالحق في تحديث هذه السياسة لتتوافق مع التغييرات التقنية في خدمات الربط.' : 'We reserve the right to update this policy to align with technical changes in integrated services.'}
            </p>
          </section>

          <div className="mt-10 pt-10 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">{lang === 'ar' ? 'آخر تحديث: فبراير 2025' : 'Last updated: February 2025'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;