const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf-8');

const targetStr = `1. LONG-TAIL TITLE STRATEGY (CRITICAL):
   - You MUST combine the high-search general keyword with the user's specific detailed topic into a single magnetic title.
   - FORMULA: [High Search / Low-Competition Broad Keyword] : [Specific User Video Topic / Idea as provided by user] (\${currentYear})
   - Rule: NEVER omit the specific video topic "\${topic}". The broad keyword gives search volume, while the user's specific topic captures the exact buyer/viewer intent.
   - Example (Arabic): إذا كان الموضوع "طريقة عمل قهوة إسبريسو بالمنزل بدون ماكينة" والكلمة "صنع القهوة" -> العنوان: صنع القهوة : طريقة عمل قهوة إسبريسو بالمنزل بدون ماكينة خطوة بخطوة 2026
   - Example (English): If topic is "Build an ecommerce store with zero budget" and keyword is "Dropshipping for Beginners" -> Title: Dropshipping for Beginners : How to Build an Ecommerce Store with Zero Budget in 2026`;

const replaceStr = `1. LONG-TAIL TITLE STRATEGY (CRITICAL):
   - You MUST extract a High-Volume General Keyword AND a Highly-Specific Niche Keyword/Angle from the analysis to build a magnetic title.
   - FORMULA: [High Volume General Keyword] | [Highly Specific Niche Hook/Angle outranking competitors] (\${currentYear})
   - Rule 1: DO NOT simply repeat the exact user input twice. Avoid redundancy (e.g. NEVER write "Make Money : Make Money").
   - Rule 2: The title MUST sound natural, compelling, and use a powerful curiosity hook designed to outrank competitor videos.
   - Rule 3: Incorporate the low-competition/high-volume keywords intelligently to capture search intent.
   - Example (Arabic): "التجارة الإلكترونية | الدليل الشامل للبدء بصفر دولار وتصدر المنافسين 2026"
   - Example (English): "Dropshipping for Beginners | How to Build a $10k/Month Store with Zero Budget (2026)"`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('services/geminiService.ts', content);
