const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

const regex = /const thumbnailPromises = styles\.map\(async \(\styleModifier\) => \{[\s\S]*?\}\);\s*const generatedResults = await Promise\.all\(thumbnailPromises\);/;

const replacement = `const generatedResults = [];
      for (const styleModifier of styles) {
        setStatusMessage(lang === 'ar' ? \`جاري توليد الخيار \${generatedResults.length + 1} من 3...\` : \`Generating option \${generatedResults.length + 1} of 3...\`);
        const enhancedPrompt = \`\${prompt} (\${styleModifier})\`;
        const imgUrl = await gemini.generateThumbnail(enhancedPrompt, finalText, psychology, selectedFont, selectedSize, selectedType, includeText, referenceImage);
        setStatusMessage(lang === 'ar' ? \`جاري تقييم الخيار \${generatedResults.length + 1}...\` : \`Evaluating option \${generatedResults.length + 1}...\`);
        const evalData = await gemini.evaluateThumbnail(imgUrl, prompt);
        generatedResults.push({ url: imgUrl, evaluation: evalData });
        
        // Add a 2 second delay to avoid rate limits
        if (generatedResults.length < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log('Patched ThumbnailTab.tsx to use sequential generation');
