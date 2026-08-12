const fs = require('fs');
const content = fs.readFileSync('services/geminiService.ts', 'utf8');
const lines = content.split('\n');
let inMethod = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('async fetchRadarTrends(')) { inMethod = true; console.log("Found fetchRadarTrends at line", i); }
  if (inMethod) { console.log(lines[i]); }
  if (inMethod && lines[i].includes('async checkContentGap(')) { break; }
}
