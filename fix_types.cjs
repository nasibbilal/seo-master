const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

// Replace all instances of import('@google/genai').Type with Type
content = content.replace(/import\('@google\/genai'\)\.Type/g, 'Type');

fs.writeFileSync('services/geminiService.ts', content);
console.log('Fixed types in geminiService.ts');
