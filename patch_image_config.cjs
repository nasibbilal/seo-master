const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

const regex = /config: \{ imageConfig: \{ aspectRatio: \(size as any\) \|\| "16:9" \} \}/;
const replacement = `config: referenceImage ? undefined : { imageConfig: { aspectRatio: (size as any) || "16:9" } }`;
code = code.replace(regex, replacement);
fs.writeFileSync('services/geminiService.ts', code);
console.log('Fixed imageConfig');
