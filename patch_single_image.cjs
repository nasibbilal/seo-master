const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// Change the button text
code = code.replace(/\{lang === 'ar' \? 'توليد 3 خيارات احترافية' : 'Generate 3 Pro Options'\}/, `{lang === 'ar' ? 'توليد تصميم احترافي' : 'Generate Pro Design'}`);

// Remove the generation of 3 options
const oldLoopRegex = /setStatusMessage\(lang === 'ar' \? 'جاري توليد 3 خيارات متنوعة للتصميم\.\.\.' : 'Generating 3 diverse design options\.\.\.'\);[\s\S]*?const styles = \[[\s\S]*?\];\[\s\S\]*?const generatedResults = \[\];[\s\S]*?for \(const styleModifier of styles\) \{[\s\S]*?await new Promise\(resolve => setTimeout\(resolve, 3000\)\);\s*\}\s*\}/;

const newGenLogic = `setStatusMessage(lang === 'ar' ? 'جاري بناء وتحليل التصميم الفني...' : 'Generating and analyzing art design...');
      
      const enhancedPrompt = \`\${prompt} (High-impact commercial YouTube thumbnail style, vibrant and cinematic)\`;
      const imgUrl = await gemini.generateThumbnail(enhancedPrompt, finalText, psychology, selectedFont, selectedSize, selectedType, includeText, referenceImage);
      
      setStatusMessage(lang === 'ar' ? 'جاري تقييم التصميم لرفع نسبة النقر (CTR)...' : 'Evaluating design for CTR impact...');
      const evalData = await gemini.evaluateThumbnail(imgUrl, prompt);
      
      const generatedResults = [{ url: imgUrl, evaluation: evalData }];`;

// Wait, the regex might be tricky. Let's do string replacement instead.
