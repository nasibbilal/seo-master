const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

const regex = /const imgUrl = await gemini\.generateThumbnail\([\s\S]*?const evalData = await gemini\.evaluateThumbnail\(imgUrl, prompt\);\s*const generatedResults = \[\{\s*url: imgUrl,\s*evaluation: evalData\s*\}\];/m;

const replacement = `const imgUrl = await gemini.generateThumbnail(
        actualPrompt, 
        finalText, 
        psychology, 
        selectedFont, 
        selectedSize, 
        selectedType, 
        includeText, 
        isProductMode ? null : referenceImage
      );
      
      let finalImgUrl = imgUrl;

      // Realistically composite the logo using Canvas (Mockup Mode)
      if (isProductMode && referenceImage) {
        setStatusMessage(lang === 'ar' ? 'جاري تطبيق الموك أب الاحترافي...' : 'Applying professional mockup...');
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
              // Calculate logo size (max 40% of canvas width or height)
              const maxOverlayWidth = canvas.width * 0.4;
              const maxOverlayHeight = canvas.height * 0.4;
              let overlayWidth = overlayImg.width;
              let overlayHeight = overlayImg.height;
              
              if (overlayWidth > maxOverlayWidth || overlayHeight > maxOverlayHeight) {
                const ratio = Math.min(maxOverlayWidth / overlayWidth, maxOverlayHeight / overlayHeight);
                overlayWidth *= ratio;
                overlayHeight *= ratio;
              }
              
              // Position in the center
              const x = (canvas.width - overlayWidth) / 2;
              const y = (canvas.height - overlayHeight) / 2;
              
              // Apply blending to simulate real fabric print
              ctx.globalCompositeOperation = 'multiply';
              ctx.globalAlpha = 0.85;
              ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);
              
              // Add a slight highlight layer over it
              ctx.globalCompositeOperation = 'overlay';
              ctx.globalAlpha = 0.3;
              ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);
              
              resolve(canvas.toDataURL('image/png'));
            };
            overlayImg.src = referenceImage;
          };
          bgImg.src = imgUrl;
        });
      }

      setStatusMessage(lang === 'ar' ? 'جاري تقييم التصميم لرفع نسبة النقر (CTR)...' : 'Evaluating design for CTR impact...');
      const evalData = await gemini.evaluateThumbnail(finalImgUrl, prompt);
      
      const generatedResults = [{ 
        url: finalImgUrl, 
        evaluation: evalData 
      }];`;

code = code.replace(regex, replacement);
fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log('Fixed ThumbnailTab.tsx Mockup Mode via Canvas');
