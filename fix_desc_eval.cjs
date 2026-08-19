const fs = require('fs');

// Patch GeminiService
let geminiCode = fs.readFileSync('services/geminiService.ts', 'utf8');
geminiCode = geminiCode.replace(
  /\{ text: \`Describe the final printed design on this product\/t-shirt in Arabic[\s\S]*?\` \}/g,
  `{ text: \`You are an SEO E-commerce expert. Write an attractive, SEO-optimized product description for the item in this image (in Arabic). The description must include keywords that help this product rank in search results. Keep it to 1-2 strong sentences highlighting the print quality and the design subject.\` }`
);
fs.writeFileSync('services/geminiService.ts', geminiCode);

console.log("Patched description to be SEO optimized.");
