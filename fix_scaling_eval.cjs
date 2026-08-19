const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// 1. Better scaling: Ensure we don't stretch the logo too much, scale it to max 60% of the bounding box width/height 
// so it has breathing room on the shirt and looks proportionate.
const oldPlacementLogic = `              if (placement) {
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
              }`;

const newPlacementLogic = `              if (placement) {
                // AI placement
                const boxW = (placement.xmax - placement.xmin) * canvas.width;
                const boxH = (placement.ymax - placement.ymin) * canvas.height;
                // Add breathing room (margin) inside the detected chest box (max 70% of the box)
                const targetW = boxW * 0.7;
                const targetH = boxH * 0.7;
                
                // Fit logo into target box preserving aspect ratio
                const ratio = Math.min(targetW / overlayImg.width, targetH / overlayImg.height);
                overlayWidth = overlayImg.width * ratio;
                overlayHeight = overlayImg.height * ratio;
                
                // Center precisely inside the detected bounding box
                x = (placement.xmin * canvas.width) + (boxW - overlayWidth) / 2;
                y = (placement.ymin * canvas.height) + (boxH - overlayHeight) / 2;
              }`;

code = code.replace(oldPlacementLogic, newPlacementLogic);

// 2. Ensure Evaluation shows up. Let's make sure evalData is properly attached even in mockup mode.
// Actually evalData is already attached. Let's check how the mockup description is displayed to ensure it doesn't break CTR rating.
// It was added right above the CTR evaluation. Let's check the geminiService for generateMockupDescription.

fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log('Fixed scaling logic to add breathing room inside bounding box.');
