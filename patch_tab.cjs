const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// Update UI text for the toggle
code = code.replace(
  /\{lang === 'ar' \? 'وضع إعلان المنتج \(الاحتفاظ بالصورة الشفافة ودمجها مع الخلفية المولدة\)' : 'Product Ad Mode \(Keep transparent image & overlay on generated background\)'\}/g,
  `{lang === 'ar' ? 'وضع الموك أب (دمج الشعار/التصميم كطباعة واقعية على الملابس أو المنتجات)' : 'Mockup Mode (Realistically print logo/design onto clothing or product)'}`
);

// Update handleGenerate call
const genBlockRegex = /const imgUrl = await gemini\.generateThumbnail\([\s\S]*?isProductMode \? null : referenceImage\s*\);/;
const newGenBlock = `const imgUrl = await gemini.generateThumbnail(
        actualPrompt, 
        finalText, 
        psychology, 
        selectedFont, 
        selectedSize, 
        selectedType, 
        includeText, 
        referenceImage,
        isProductMode // isMockupMode
      );`;
code = code.replace(genBlockRegex, newGenBlock);

// Remove the overlayImage from results
const pushResultRegex = /const generatedResults = \[\{\s*url: imgUrl,\s*evaluation: evalData,\s*overlayImage: isProductMode \? referenceImage : undefined\s*\}\];/;
const newPushResult = `const generatedResults = [{ 
        url: imgUrl, 
        evaluation: evalData 
      }];`;
code = code.replace(pushResultRegex, newPushResult);

// Remove the composite logic in downloadImage (fallback to simple download)
const downloadFnRegex = /const downloadImage = async \(url: string, index: number, overlayImage\?: string\) => \{[\s\S]*?catch \(e\) \{[\s\S]*?\}\s*\};/;
const newDownloadFn = `const downloadImage = async (url: string, index: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = \`design-\${index + 1}.png\`;
    a.click();
  };`;
code = code.replace(downloadFnRegex, newDownloadFn);

// Remove overlayImage param from onClick download
code = code.replace(/onClick=\{\(\) => downloadImage\(res\.url, idx, res\.overlayImage\)\}/g, `onClick={() => downloadImage(res.url, idx)}`);

// Remove overlay img element from preview
const previewRegex = /\{res\.overlayImage && \(\s*<img src=\{res\.overlayImage\} className="absolute[^>]+>\s*\)\}/g;
code = code.replace(previewRegex, ``);

fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log('Patched ThumbnailTab.tsx for Mockup Mode integration');
