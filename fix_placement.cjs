const fs = require('fs');

// Patch geminiService.ts
let geminiCode = fs.readFileSync('services/geminiService.ts', 'utf8');
geminiCode = geminiCode.replace(
  /analyzeMockupPlacement\(imageUrl: string\): Promise/g,
  `analyzeMockupPlacement(imageUrl: string, prompt: string): Promise`
);
geminiCode = geminiCode.replace(
  /\{ text: \`Find the chest area of the main person[\s\S]*?or any other text\.\` \}/g,
  `{ text: \`The user wants to place a logo/design based on this scene prompt: "\${prompt}". Identify the exact bounding box in the image where this design should be printed (e.g., the chest of the specific character's shirt, a mug, a billboard, etc. as described). Return ONLY a valid JSON object with normalized bounding box coordinates (values between 0.0 and 1.0). Format exactly like this: {"ymin": 0.3, "xmin": 0.4, "ymax": 0.5, "xmax": 0.6}. Do not include markdown blocks, backticks, or any other text.\` }`
);
fs.writeFileSync('services/geminiService.ts', geminiCode);

// Patch ThumbnailTab.tsx
let tabCode = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');
tabCode = tabCode.replace(
  /const placement = await gemini\.analyzeMockupPlacement\(imgUrl\);/g,
  `const placement = await gemini.analyzeMockupPlacement(imgUrl, prompt);`
);
fs.writeFileSync('components/ThumbnailTab.tsx', tabCode);

console.log("Patched placement logic successfully.");
