const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

const oldPromptLogic = /const actualPrompt = isProductMode[\s\S]*?\: \`\$\{prompt\} \(High-impact commercial YouTube thumbnail style, vibrant and cinematic\)\`;/;

const newPromptLogic = `const actualPrompt = \`\${prompt} (High-impact commercial YouTube thumbnail style, vibrant and cinematic)\`;`;

code = code.replace(oldPromptLogic, newPromptLogic);
fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log('Fixed actualPrompt logic');
