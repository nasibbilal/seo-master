const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// The error thrown by geminiService is "QUOTA_EXHAUSTED", but ThumbnailTab checks for "QUOTA_EXCEEDED"
code = code.replace(
  `if (error.message === 'QUOTA_EXCEEDED') {`,
  `if (error.message === 'QUOTA_EXHAUSTED' || error.message === 'QUOTA_EXCEEDED' || (error.message || '').includes('QUOTA')) {`
);

fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log("Fixed quota error catching.");
