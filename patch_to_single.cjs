const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// Change the button text
code = code.replace(/\{lang === 'ar' \? 'توليد 3 خيارات احترافية' : 'Generate 3 Pro Options'\}/, `{lang === 'ar' ? 'توليد تصميم احترافي' : 'Generate Pro Design'}`);

// Replace the generation block
const startStr = "setStatusMessage(lang === 'ar' ? 'جاري توليد 3 خيارات متنوعة للتصميم...' : 'Generating 3 diverse design options...');";
const endStr = "setResults(generatedResults);";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newLogic = `setStatusMessage(lang === 'ar' ? 'جاري بناء وتحليل التصميم الفني...' : 'Generating and analyzing art design...');
      
      const enhancedPrompt = \`\${prompt} (High-impact commercial YouTube thumbnail style, vibrant and cinematic)\`;
      
      const imgUrl = await gemini.generateThumbnail(enhancedPrompt, finalText, psychology, selectedFont, selectedSize, selectedType, includeText, referenceImage);
      
      setStatusMessage(lang === 'ar' ? 'جاري تقييم التصميم لرفع نسبة النقر (CTR)...' : 'Evaluating design for CTR impact...');
      const evalData = await gemini.evaluateThumbnail(imgUrl, prompt);
      
      const generatedResults = [{ url: imgUrl, evaluation: evalData }];
      setResults(generatedResults);`;
      
  code = code.substring(0, startIndex) + newLogic + code.substring(endIndex);
  fs.writeFileSync('components/ThumbnailTab.tsx', code);
  console.log("Successfully patched to single generation!");
} else {
  console.log("Could not find start or end strings");
}
