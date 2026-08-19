const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

const oldCanvasLogic = `              // Apply blending to simulate real fabric print
              ctx.globalCompositeOperation = 'multiply';
              ctx.globalAlpha = 0.85;
              ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);
              
              // Add a slight highlight layer over it
              ctx.globalCompositeOperation = 'overlay';
              ctx.globalAlpha = 0.3;
              ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);`;

// We need a more subtle blend that keeps the colors vibrant but adapts to the shirt.
// Source-over for the main image with high opacity, then multiply for shadows.
const newCanvasLogic = `              // 1. Draw base logo normally but slightly transparent
              ctx.globalCompositeOperation = 'source-over';
              ctx.globalAlpha = 0.90;
              ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);
              
              // 2. Blend the shadows of the shirt over the logo to make it look embedded
              ctx.globalCompositeOperation = 'multiply';
              ctx.globalAlpha = 0.6;
              ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);`;

code = code.replace(oldCanvasLogic, newCanvasLogic);
fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log('Fixed mockup blending for T-Shirts');
