
import React from 'react';
import { ThemeColor } from '../types';

interface PrivacyPolicyProps {
  theme: ThemeColor;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ theme }) => {
  const themeClasses = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  }[theme];

  return (
    <div className="max-w-4xl mx-auto p-6 font-cairo leading-relaxed">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
        <h2 className={`text-3xl font-black mb-8 flex items-center gap-3 ${themeClasses}`}>
          <span>📜</span> سياسة الخصوصية (Privacy Policy)
        </h2>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">1. مقدمة</h3>
            <p>
              نحن في SEO Master نولي أهمية قصوى لخصوصية بياناتك. توضح هذه السياسة كيفية تعامل البرنامج مع البيانات والمعلومات عند استخدامك لخدماتنا التحليلية.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">2. جمع البيانات وتخزينها</h3>
            <p>
              يعمل هذا البرنامج كأداة واجهة أمامية (Frontend Tool). نحن لا نقوم بتخزين أي مفاتيح سرية (API Keys) أو بيانات دخول على خوادمنا الخاصة. يتم تخزين جميع إعدادات الربط (مثل Facebook Token أو TikTok Keys) محلياً في متصفحك الخاص (Local Storage) ولا يمكننا الوصول إليها.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">3. استخدام خدمات الطرف الثالث</h3>
            <p>
              يتواصل البرنامج مباشرة مع خدمات الطرف الثالث التالية لتحليل البيانات:
            </p>
            <ul className="list-disc list-inside mr-4 space-y-2 mt-2">
              <li><strong>Google Gemini API:</strong> لتوليد التحليلات الذكية وتقييم الصور.</li>
              <li><strong>Meta Graph API:</strong> لجلب إحصائيات فيسبوك وإنستغرام.</li>
              <li><strong>TikTok Business API:</strong> لتحليل توجهات تيك توك.</li>
            </ul>
            <p className="mt-2">
              تخضع هذه العمليات لسياسات الخصوصية الخاصة بتلك الشركات.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">4. أمان المعلومات</h3>
            <p>
              بما أن البرنامج لا يمتلك قاعدة بيانات سحابية للمستخدمين، فإن أمان بياناتك يعتمد بشكل أساسي على أمان متصفحك وجهازك الشخصي. ننصح دائماً بعدم مشاركة لقطات شاشة تحتوي على مفاتيح الربط الخاصة بك.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">5. ملفات تعريف الارتباط (Cookies)</h3>
            <p>
              قد يستخدم المتصفح تقنيات التخزين المحلي لضمان بقاء إعداداتك (مثل لون السمات والمفاتيح السريعة) محفوظة عند إعادة تحميل الصفحة.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3 text-gray-900">6. التغييرات على السياسة</h3>
            <p>
              نحتفظ بالحق في تحديث هذه السياسة لتتوافق مع التغييرات التقنية في خدمات الربط.
            </p>
          </section>

          <div className="mt-10 pt-10 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">آخر تحديث: فبراير 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;