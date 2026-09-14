const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf-8');

const targetStr = `1. LONG-TAIL TITLE STRATEGY (CRITICAL):
   - You MUST extract a High-Volume General Keyword AND a Highly-Specific Niche Keyword/Angle from the analysis to build a magnetic title.
   - FORMULA: [High Volume General Keyword] | [Highly Specific Niche Hook/Angle outranking competitors] (\${currentYear})
   - Rule 1: DO NOT simply repeat the exact user input twice. Avoid redundancy (e.g. NEVER write "Make Money : Make Money").
   - Rule 2: The title MUST sound natural, compelling, and use a powerful curiosity hook designed to outrank competitor videos.
   - Rule 3: Incorporate the low-competition/high-volume keywords intelligently to capture search intent.
   - Example (Arabic): "التجارة الإلكترونية | الدليل الشامل للبدء بصفر دولار وتصدر المنافسين 2026"
   - Example (English): "Dropshipping for Beginners | How to Build a $10k/Month Store with Zero Budget (2026)"`;

const replaceStr = `1. LONG-TAIL TITLE STRATEGY (CRITICAL):
   - You MUST generate exactly ONE single, highly-optimized magnetic title.
   - DO NOT repeat the exact user input. DO NOT duplicate words. DO NOT use formulas like "Keyword : Keyword".
   - Your goal is to integrate a High-Volume/Low-Competition Keyword with a powerful "Curiosity Hook" (Gap analysis) so the video ranks in search AND appears in suggested videos of competitors.
   - Rule: The title MUST sound 100% natural and conversational, yet packed with SEO power.
   - Example (Arabic): "كيف بدأت التجارة الإلكترونية من الصفر وحققت أول 1000 دولار (خطوة بخطوة 2026)"
   - Example (English): "How I Started Dropshipping with $0 and Made My First $10k (2026)"`;

content = content.replace(targetStr, replaceStr);

const targetStr2 = `      LONG-TAIL TITLE STRATEGY (CRITICAL):
      Formulate the title strictly using the high-converting Long-Tail formula:
      [High Volume General Keyword] | [Highly Specific Niche Hook/Angle outranking competitors] (\${currentYear})
      Rule 1: DO NOT simply repeat the exact user input twice. Extract a general keyword and a specific keyword from the analysis.
      Rule 2: Ensure the title reads naturally without sounding robotic or repetitive.
      Example (Arabic): "التجارة الإلكترونية | الدليل الشامل للبدء بصفر دولار وتصدر المنافسين 2026"
      Example (English): "Dropshipping for Beginners | How to Build a $10k/Month Store with Zero Budget (2026)"`;

const replaceStr2 = `      LONG-TAIL TITLE STRATEGY (CRITICAL):
      Generate ONE single, natural-sounding, highly-optimized magnetic title.
      Rule 1: NEVER repeat the topic twice. Integrate the best keywords naturally.
      Rule 2: Use a strong competitive hook to rank in suggested videos.
      Example (Arabic): "الدليل الشامل لاحتراف التجارة الإلكترونية من الصفر في 2026"
      Example (English): "The Ultimate Zero-Budget Dropshipping Guide for 2026"`;

content = content.replace(targetStr2, replaceStr2);

fs.writeFileSync('services/geminiService.ts', content);
