const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// 1. Update interface
code = code.replace(
  'interface ThumbnailResult {\n  url: string;\n  evaluation: ThumbnailEvaluation | null;\n}',
  'interface ThumbnailResult {\n  url: string;\n  evaluation: ThumbnailEvaluation | null;\n  mockupDescription?: string;\n}'
);

// 2. Update compositing logic
const oldCanvasRegex = /if \(isProductMode && referenceImage\) \{[\s\S]*?finalImgUrl = await new Promise\(\(resolve\) => \{[\s\S]*?bgImg\.src = imgUrl;\s*\}\);\s*\}/;

const newCanvasLogic = `if (isProductMode && referenceImage) {
        setStatusMessage(lang === 'ar' ? 'جاري تحليل هيكل الجسم وتحديد موقع الطباعة (Pose Estimation)...' : 'Analyzing body structure for placement...');
        const placement = await gemini.analyzeMockupPlacement(imgUrl);
        
        setStatusMessage(lang === 'ar' ? 'جاري تطبيق النسيج ودمج الألوان بدقة...' : 'Applying fabric texture and blending...');
        finalImgUrl = await new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const bgImg = new Image();
          const overlayImg = new Image();
          
          bgImg.crossOrigin = "anonymous";
          bgImg.onload = () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
            ctx.drawImage(bgImg, 0, 0);
            
            overlayImg.crossOrigin = "anonymous";
            overlayImg.onload = () => {
              let overlayWidth, overlayHeight, x, y;

              if (placement) {
                // AI placement
                const boxW = (placement.xmax - placement.xmin) * canvas.width;
                const boxH = (placement.ymax - placement.ymin) * canvas.height;
                // Fit logo into box preserving aspect ratio
                const ratio = Math.min(boxW / overlayImg.width, boxH / overlayImg.height);
                overlayWidth = overlayImg.width * ratio;
                overlayHeight = overlayImg.height * ratio;
                // Center in box
                x = (placement.xmin * canvas.width) + (boxW - overlayWidth) / 2;
                y = (placement.ymin * canvas.height) + (boxH - overlayHeight) / 2;
              } else {
                // Math fallback
                const maxOverlayWidth = canvas.width * 0.3;
                const maxOverlayHeight = canvas.height * 0.3;
                overlayWidth = overlayImg.width;
                overlayHeight = overlayImg.height;
                const ratio = Math.min(maxOverlayWidth / overlayWidth, maxOverlayHeight / overlayHeight);
                overlayWidth *= ratio;
                overlayHeight *= ratio;
                x = (canvas.width - overlayWidth) / 2;
                y = (canvas.height - overlayHeight) / 2 + (canvas.height * 0.1);
              }
              
              // 1. Draw base logo normally
              ctx.globalCompositeOperation = 'source-over';
              ctx.globalAlpha = 0.90;
              ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);
              
              // 2. Blend the shadows of the shirt over the logo to make it look embedded
              ctx.globalCompositeOperation = 'multiply';
              ctx.globalAlpha = 0.6;
              ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);

              // 3. Add textile noise/texture overlay
              ctx.globalCompositeOperation = 'overlay';
              ctx.globalAlpha = 0.15;
              ctx.fillStyle = '#ffffff';
              // Draw a simple noise grid pattern over the logo area
              for(let i = 0; i < overlayWidth; i+=4) {
                for(let j = 0; j < overlayHeight; j+=4) {
                  if (Math.random() > 0.5) {
                    ctx.fillRect(x + i, y + j, 2, 2);
                  }
                }
              }
              
              resolve(canvas.toDataURL('image/png'));
            };
            overlayImg.src = referenceImage;
          };
          bgImg.src = imgUrl;
        });
      }`;

code = code.replace(oldCanvasRegex, newCanvasLogic);

// 3. Add AI Description Call
const oldResultsRegex = /const generatedResults = \[\{ \s*url: finalImgUrl, \s*evaluation: evalData \s*\}\];/;
const newResultsLogic = `
      let mockupDesc = undefined;
      if (isProductMode && referenceImage) {
        setStatusMessage(lang === 'ar' ? 'جاري كتابة وصف التصميم النهائي...' : 'Generating final mockup description...');
        mockupDesc = await gemini.generateMockupDescription(finalImgUrl);
      }

      const generatedResults = [{ 
        url: finalImgUrl, 
        evaluation: evalData,
        mockupDescription: mockupDesc
      }];`;

code = code.replace(oldResultsRegex, newResultsLogic);

// 4. Update UI to display the description
const uiRegex = /\{res\.evaluation && \([\s\S]*?{res\.evaluation\.ctrPredict}/;
const newUI = `{res.mockupDescription && (
                  <div className="bg-slate-800/50 p-4 md:p-6 rounded-2xl mb-6 border border-slate-700">
                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                      {lang === 'ar' ? 'وصف التصميم على المنتج' : 'Product Design Description'}
                    </label>
                    <textarea 
                      readOnly 
                      value={res.mockupDescription} 
                      className="w-full bg-slate-900/50 text-white rounded-xl border-none outline-none resize-none p-4 text-xs md:text-sm font-medium leading-relaxed"
                      rows={2}
                    />
                  </div>
                )}
                {res.evaluation && (
                  <div className="bg-slate-800/50 p-4 md:p-6 rounded-2xl mb-6 border border-slate-700 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        <span className="text-xs md:text-sm font-black text-white">{lang === 'ar' ? 'تحليل قوة الجذب' : 'Attraction Analysis'}</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-black text-xs border border-green-500/30">
                        {res.evaluation.ctrPredict}`;

code = code.replace(uiRegex, newUI);

fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log('Patched ThumbnailTab.tsx for smart placement and description');
