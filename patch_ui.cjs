const fs = require('fs');
let content = fs.readFileSync('components/MasterWorkflowTab.tsx', 'utf-8');

const oldHeader = `                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📌</span>
                      <span>{isRtl ? '1. العنوان الاستهدافي المزدوج (Long-Tail Master Title)' : '1. Dual-Targeted Long-Tail Title'}</span>
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-200/60">
                      {isRtl ? 'كلمة عامة + موضوع خاص' : 'Broad Keyword + Specific Topic'}
                    </span>
                  </div>`;

const newHeader = `                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>{isRtl ? '1. العنوان الاستهدافي الأقوى (Optimized Master Title)' : '1. Optimized Master Title'}</span>
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-200/60">
                      {isRtl ? 'كلمات عالية البحث + خطاف منافسين' : 'High Volume + Competitor Hook'}
                    </span>
                  </div>`;

content = content.replace(oldHeader, newHeader);

// Add styling as requested by CSS selector (increasing visual emphasis)
const oldContainer = `              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-md border border-gray-200 space-y-4 relative group">`;
const newContainer = `              <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-lg border-2 border-blue-100 space-y-4 relative group">`;
content = content.replace(oldContainer, newContainer);

// Emphasize the text box
const oldTextContainer = `<div className="bg-gray-50 p-4 md:p-5 rounded-2xl border border-gray-100 text-gray-900 font-black text-base md:text-lg leading-snug">`;
const newTextContainer = `<div className="bg-white p-4 md:p-5 rounded-2xl border-2 border-blue-100 text-blue-950 font-black text-lg md:text-xl leading-snug shadow-sm">`;
content = content.replace(oldTextContainer, newTextContainer);


fs.writeFileSync('components/MasterWorkflowTab.tsx', content);
