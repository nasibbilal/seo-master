const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

// Find generateThumbnail function and add referenceImage parameter
const generateThumbnailRegex = /async generateThumbnail\(prompt: string, text: string, psychology: string, font: string, size: string, type: string, includeText: boolean\): Promise<string> \{/;
const generateThumbnailReplacement = `async generateThumbnail(prompt: string, text: string, psychology: string, font: string, size: string, type: string, includeText: boolean, referenceImage?: string | null): Promise<string> {`;
code = code.replace(generateThumbnailRegex, generateThumbnailReplacement);

// Find the parts array creation and inject inlineData if referenceImage exists
const contentsRegex = /contents: \{ parts: \[\{ text: \`Thumbnail: \$\{prompt\}\. Text elements: "\$\{text\}"\. Color Psychology: \$\{psychology\}\. Style: Ultra HD, 4k, trending on YouTube\.\` \}\] \},/;
const contentsReplacement = `contents: { parts: referenceImage ? [
          { inlineData: { mimeType: 'image/jpeg', data: referenceImage.split(',')[1] } },
          { text: \`Create a thumbnail based on this reference image. Thumbnail: \${prompt}. Text elements: "\${text}". Color Psychology: \${psychology}. Style: Ultra HD, 4k, trending on YouTube.\` }
        ] : [{ text: \`Thumbnail: \${prompt}. Text elements: "\${text}". Color Psychology: \${psychology}. Style: Ultra HD, 4k, trending on YouTube.\` }] },`;
code = code.replace(contentsRegex, contentsReplacement);

fs.writeFileSync('services/geminiService.ts', code);
console.log('Patched geminiService.ts');
