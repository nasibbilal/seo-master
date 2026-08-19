const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// Add referenceImage state
code = code.replace(
  /const \[prompt, setPrompt\] = useState\(''\);/,
  `const [prompt, setPrompt] = useState('');\n  const [referenceImage, setReferenceImage] = useState<string | null>(null);`
);

// Add file upload handler
code = code.replace(
  /const handleGenerate = async \(\) => \{/,
  `const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {`
);

// Pass referenceImage to generateThumbnail
code = code.replace(
  /const img = await gemini.generateThumbnail\(prompt, includeText \? text : "", psychology, selectedFont, selectedSize, selectedType, includeText\);/g,
  `const img = await gemini.generateThumbnail(prompt, includeText ? text : "", psychology, selectedFont, selectedSize, selectedType, includeText, referenceImage);`
);

// Modify Textarea UI to include the + button and image preview
const textareaRegex = /<textarea[\s\S]*?onChange=\{\(e\) => setPrompt\(e\.target\.value\)\}[\s\S]*?\/>/;

const newTextareaUI = `<div className="relative">
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={lang === 'ar' ? "مثلاً: رائد فضاء عربي يمسك بعملة بيتكوين في الفضاء، بأسلوب سايبيربانك..." : "e.g. Arab astronaut holding bitcoin in space, cyberpunk style..."}
                className="w-full px-6 md:px-10 py-5 md:py-6 pl-16 rounded-[1.5rem] md:rounded-[2rem] bg-gray-50 border-2 border-transparent text-black font-black text-base md:text-xl outline-none focus:bg-white focus:border-blue-500 shadow-inner transition-all resize-none"
                style={{ paddingLeft: isRtl ? 'auto' : '5rem', paddingRight: isRtl ? '5rem' : 'auto' }}
              />
              <div className={\`absolute top-1/2 -translate-y-1/2 \${isRtl ? 'left-4 md:left-6' : 'right-4 md:right-6'} flex items-center gap-2\`}>
                {referenceImage && (
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-sm border-2 border-white group">
                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setReferenceImage(null)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                )}
                <label className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 cursor-pointer transition-all active:scale-95">
                  <span className="text-xl md:text-2xl font-light leading-none">+</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>`;

code = code.replace(textareaRegex, newTextareaUI);

fs.writeFileSync('components/ThumbnailTab.tsx', code);
console.log('Patched ThumbnailTab.tsx');
