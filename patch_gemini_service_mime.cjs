const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

const oldLine = `{ inlineData: { mimeType: 'image/jpeg', data: referenceImage.split(',')[1] } },`;
const newLine = `{ inlineData: { mimeType: referenceImage.split(';')[0].split(':')[1], data: referenceImage.split(',')[1] } },`;

code = code.replace(oldLine, newLine);
fs.writeFileSync('services/geminiService.ts', code);
console.log('Fixed mimeType');
