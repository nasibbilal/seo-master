const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf-8');

const targetStr = `      LONG-TAIL TITLE STRATEGY (CRITICAL):
      Formulate the title strictly using the high-converting Long-Tail formula:
      [High Search / Low-Competition Keyword] : [Specific Detailed Topic of the Video]
      Example (Arabic): تجارة إلكترونية للمبتدئين : الدليل الشامل لإنشاء متجر مربح في 2026
      Example (English): Ecommerce for Beginners : Complete Step-by-Step Guide to Build a Profitable Store in 2026`;

const replaceStr = `      LONG-TAIL TITLE STRATEGY (CRITICAL):
      Formulate the title strictly using the high-converting Long-Tail formula:
      [High Volume General Keyword] | [Highly Specific Niche Hook/Angle outranking competitors] (\${currentYear})
      Rule 1: DO NOT simply repeat the exact user input twice. Extract a general keyword and a specific keyword from the analysis.
      Rule 2: Ensure the title reads naturally without sounding robotic or repetitive.
      Example (Arabic): "التجارة الإلكترونية | الدليل الشامل للبدء بصفر دولار وتصدر المنافسين 2026"
      Example (English): "Dropshipping for Beginners | How to Build a $10k/Month Store with Zero Budget (2026)"`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('services/geminiService.ts', content);
