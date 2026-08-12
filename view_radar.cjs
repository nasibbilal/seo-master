const fs = require('fs');
const content = fs.readFileSync('services/geminiService.ts', 'utf8');
const lines = content.split('\n');
let inMethod = false;
let printed = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('async fetchRadarTrends(')) { inMethod = true; console.log("Found fetchRadarTrends at line", i); }
  if (inMethod) { console.log(lines[i]); printed++; }
  if (inMethod && printed > 150) { break; }
}
let inGap = false;
printed = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('async checkContentGap(')) { inGap = true; console.log("Found checkContentGap at line", i); }
  if (inGap) { console.log(lines[i]); printed++; }
  if (inGap && printed > 100) { break; }
}
