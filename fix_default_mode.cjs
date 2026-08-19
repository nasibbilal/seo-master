const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// 1. Default productMode to true
code = code.replace(
  `const [productMode, setProductMode] = useState<boolean>(false);`,
  `const [productMode, setProductMode] = useState<boolean>(true);`
);

// 2. Add prompt instruction for blank surface
code = code.replace(
  'const actualPrompt = `${prompt} (High-impact commercial YouTube thumbnail style, vibrant and cinematic)`;',
  'const actualPrompt = isProductMode ? `${prompt}. VERY IMPORTANT: The main subject (e.g., the t-shirt, mug, or billboard) MUST BE COMPLETELY BLANK AND SOLID COLORED. DO NOT generate ANY text, logos, or designs on it, as a real logo will be added later. (High-impact commercial YouTube thumbnail style, vibrant and cinematic)` : `${prompt} (High-impact commercial YouTube thumbnail style, vibrant and cinematic)`;'
);

fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log('Fixed default productMode and actualPrompt');
