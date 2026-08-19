const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// I need to adjust the position to be slightly lower (to target a t-shirt on a person)
// and reduce the max size to look more like a chest print.
const oldCanvasLogic = `              // Calculate logo size (max 40% of canvas width or height)
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
              const y = (canvas.height - overlayHeight) / 2;`;

const newCanvasLogic = `              // Calculate logo size (max 30% of canvas width to look like a realistic t-shirt print)
              const maxOverlayWidth = canvas.width * 0.3;
              const maxOverlayHeight = canvas.height * 0.3;
              let overlayWidth = overlayImg.width;
              let overlayHeight = overlayImg.height;
              
              const ratio = Math.min(maxOverlayWidth / overlayWidth, maxOverlayHeight / overlayHeight);
              overlayWidth *= ratio;
              overlayHeight *= ratio;
              
              // Position in the center horizontally, but slightly lower than true center vertically (chest area)
              const x = (canvas.width - overlayWidth) / 2;
              const y = (canvas.height - overlayHeight) / 2 + (canvas.height * 0.1);`;

code = code.replace(oldCanvasLogic, newCanvasLogic);
fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log('Fixed mockup positioning for T-Shirts');
