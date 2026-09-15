const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf-8');

const targetStr = `      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: finalPrompt,
        config: { imageConfig: { aspectRatio: (size as any) || "16:9" } }
      });

      if (response.candidates?.[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) return \`data:image/png;base64,\${part.inlineData.data}\`;
        }
      }`;

const replaceStr = `      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: finalPrompt,
        config: { aspectRatio: (size as any) || "16:9", outputMimeType: "image/png" }
      });

      if (response.generatedImages?.[0]?.image?.imageBytes) {
        return \`data:image/png;base64,\${response.generatedImages[0].image.imageBytes}\`;
      }`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('services/geminiService.ts', content);
