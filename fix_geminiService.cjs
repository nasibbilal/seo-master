const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

// We will remove the isMockupMode parameter and its logic, 
// since image model cannot accept inlineData.
const regex = /async generateThumbnail\([\s\S]*?if \(response\.candidates\?\./;

const replacement = `async generateThumbnail(prompt: string, text: string, psychology: string, font: string, size: string, type: string, includeText: boolean, referenceImage?: string | null): Promise<string> {
    return this.callWithRetry(async () => {
      const ai = this.getAI();
      let finalPrompt = \`Thumbnail: \${prompt}. Text elements: "\${text}". Color Psychology: \${psychology}. Style: Ultra HD, 4k, trending on YouTube.\`;

      if (referenceImage) {
        try {
          const visionRes = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: { parts: [
              { inlineData: { mimeType: referenceImage.split(';')[0].split(':')[1], data: referenceImage.split(',')[1] } },
              { text: "Describe this image in precise detail (subject, pose, clothing, colors, background). I will use this to generate a matching YouTube thumbnail." }
            ]}
          });
          const imgDesc = visionRes.text;
          finalPrompt = \`Create a YouTube thumbnail based on this scene description: \${imgDesc}. Modify the scene by adding: \${prompt}. Text elements to include: "\${text}". Color Psychology: \${psychology}. Style: Ultra HD, 4k, trending on YouTube.\`;
        } catch (e) {
          console.warn("Vision model failed", e);
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: finalPrompt,
        config: { imageConfig: { aspectRatio: (size as any) || "16:9" } }
      });

      if (response.candidates?.`;

code = code.replace(regex, replacement);
fs.writeFileSync('services/geminiService.ts', code);
console.log('Reverted geminiService.ts to use text-only for image model');
