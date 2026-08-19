const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// 1. Add productMode state and update result type
code = code.replace(
  /const \[referenceImage, setReferenceImage\] = useState<string \| null>\(null\);/,
  `const [referenceImage, setReferenceImage] = useState<string | null>(null);\n  const [productMode, setProductMode] = useState<boolean>(false);`
);

code = code.replace(
  /const \[results, setResults\] = useState<any\[\]>\(\[\]\);/,
  `const [results, setResults] = useState<{url: string, evaluation: any, overlayImage?: string}[]>([]);`
);

// 2. Update handleGenerate to support product mode
const generateBlockRegex = /const enhancedPrompt = \`\$\{prompt\} \(High-impact commercial YouTube thumbnail style, vibrant and cinematic\)\`;[\s\S]*?const evalData = await gemini\.evaluateThumbnail\(imgUrl, prompt\);\s*const generatedResults = \[\{ url: imgUrl, evaluation: evalData \}\];/;

const newGenerateBlock = `const isProductMode = productMode && referenceImage;
      const actualPrompt = isProductMode 
        ? \`Generate ONLY a clean, professional background for a product photoshoot. Empty space in the center for product placement. \${prompt} (High-impact commercial style)\`
        : \`\${prompt} (High-impact commercial YouTube thumbnail style, vibrant and cinematic)\`;

      const imgUrl = await gemini.generateThumbnail(
        actualPrompt, 
        finalText, 
        psychology, 
        selectedFont, 
        selectedSize, 
        selectedType, 
        includeText, 
        isProductMode ? null : referenceImage
      );
      
      setStatusMessage(lang === 'ar' ? 'جاري تقييم التصميم لرفع نسبة النقر (CTR)...' : 'Evaluating design for CTR impact...');
      const evalData = await gemini.evaluateThumbnail(imgUrl, prompt);
      
      const generatedResults = [{ 
        url: imgUrl, 
        evaluation: evalData,
        overlayImage: isProductMode ? referenceImage : undefined
      }];`;

code = code.replace(generateBlockRegex, newGenerateBlock);

// 3. Update downloadImage function
const downloadRegex = /const downloadImage = \(url: string, index: number\) => \{[\s\S]*?\}\s*\};/;
const newDownloadFn = `const downloadImage = async (url: string, index: number, overlayImage?: string) => {
    if (!overlayImage) {
      const a = document.createElement('a');
      a.href = url;
      a.download = \`thumbnail-\${index + 1}.png\`;
      a.click();
      return;
    }

    // Composite download for product mode
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

      const bg = await loadImg(url);
      canvas.width = bg.width;
      canvas.height = bg.height;
      ctx.drawImage(bg, 0, 0);

      const fg = await loadImg(overlayImage);
      // Scale product to fit ~70% of the canvas height
      const scale = (canvas.height * 0.7) / fg.height;
      const fgW = fg.width * scale;
      const fgH = fg.height * scale;
      const fgX = (canvas.width - fgW) / 2;
      const fgY = (canvas.height - fgH) / 2;

      ctx.drawImage(fg, fgX, fgY, fgW, fgH);

      const finalUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = finalUrl;
      a.download = \`product-ad-\${index + 1}.png\`;
      a.click();
    } catch (e) {
      console.error("Failed to composite image", e);
    }
  };`;
code = code.replace(downloadRegex, newDownloadFn);

// 4. Update the "Download" button to pass overlayImage
code = code.replace(/onClick=\{\(\) => downloadImage\(res\.url, idx\)\}/g, `onClick={() => downloadImage(res.url, idx, res.overlayImage)}`);

// 5. Update the UI to render the overlayImage
const previewRegex = /<img src=\{res\.url\} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt=\{\`Option \$\{idx \+ 1\}\`\} \/>/;
const newPreview = `<img src={res.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={\`Option \${idx + 1}\`} />
                   {res.overlayImage && (
                     <img src={res.overlayImage} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[70%] object-contain drop-shadow-2xl z-10" alt="Product overlay" />
                   )}`;
code = code.replace(previewRegex, newPreview);

// 6. Update the reference image input UI to add the product mode toggle
const uploadContainerRegex = /<label className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 cursor-pointer transition-all active:scale-95">[\s\S]*?<\/label>/;
const newUploadContainer = `<div className="flex flex-col gap-1 items-end">
                  <label className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 cursor-pointer transition-all active:scale-95" title={lang === 'ar' ? 'إرفاق صورة مرجعية أو منتج' : 'Upload reference or product image'}>
                    <span className="text-xl md:text-2xl font-light leading-none">+</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>`;
code = code.replace(uploadContainerRegex, newUploadContainer);

// Also add a checkbox right below the textarea if reference image is selected
const textareaContainerRegex = /<\/div>\s*<\/div>\s*\{!includeText/g; // We have <div className="relative"> ... </div></div>
// Let's replace just after the closing of the relative div that holds textarea
const textareaFullRegex = /<\/div>\s*<\/div>\s*\{\/\* Row 2: Text & Psychology \*\/\}/;
const textareaFullReplacement = `</div>
            </div>
            {referenceImage && (
              <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 w-max mt-2">
                <input 
                  type="checkbox" 
                  id="productModeToggle" 
                  checked={productMode} 
                  onChange={(e) => setProductMode(e.target.checked)} 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                />
                <label htmlFor="productModeToggle" className="text-xs font-bold text-blue-900 cursor-pointer select-none">
                  {lang === 'ar' ? 'وضع إعلان المنتج (الاحتفاظ بالصورة الشفافة ودمجها مع الخلفية المولدة)' : 'Product Ad Mode (Keep transparent image & overlay on generated background)'}
                </label>
              </div>
            )}
          </div>
          {/* Row 2: Text & Psychology */}`;
code = code.replace(textareaFullRegex, textareaFullReplacement);

fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log("Product Ad Mode added successfully!");
