const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf-8');

const target1 = `1. Title format MUST be exactly: [General Keyword related to topic] + [Specific Keyword about the topic].`;
const replace1 = `1. Title format MUST be exactly: [High Volume General Keyword] | [Highly Specific Niche Hook/Angle outranking competitors]. Do NOT simply repeat the exact user input twice. Avoid redundancy.`;

const target2 = `1. suggestedTitle MUST be formatted exactly as: [General Keyword related to topic] + [Specific Keyword about the topic]. It must be highly optimized for click-through rate.`;
const replace2 = `1. suggestedTitle MUST be formatted exactly as: [High Volume General Keyword] | [Highly Specific Niche Hook/Angle outranking competitors]. Do NOT simply repeat the exact input. It must be highly optimized for click-through rate.`;

content = content.replace(target1, replace1);
content = content.replace(target2, replace2);
fs.writeFileSync('services/geminiService.ts', content);
