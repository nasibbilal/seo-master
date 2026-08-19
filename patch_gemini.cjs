const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

const regex = /async generateThumbnail\([\s\S]*?if \(response\.candidates\?\./;

const replacement = `async generateThumbnail(prompt: string, text: string, psychology: string, font: string, size: string, type: string, includeText: boolean, referenceImage?: string | null, isMockupMode: boolean = false): Promise<string> {
    return this.callWithRetry(async () => {
      const ai = this.getAI();
      let finalPrompt = \`Thumbnail: \${prompt}. Text elements: "\${text}". Color Psychology: \${psychology}. Style: Ultra HD, 4k, trending on YouTube.\`;
      let reqContents: any = finalPrompt;
      let targetModel = 'gemini-3.1-flash-lite-image';

      if (referenceImage && !isMockupMode) {
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
          reqContents = finalPrompt;
        } catch (e) {
          console.warn("Vision model failed", e);
        }
      } else if (referenceImage && isMockupMode) {
        targetModel = 'gemini-3.1-flash-image'; // Use higher quality for exact mockup mapping
        reqContents = {
          parts: [
            { inlineData: { mimeType: referenceImage.split(';')[0].split(':')[1], data: referenceImage.split(',')[1] } },
            { text: \`Create a realistic mockup photo. PROMPT: \${prompt}. VERY IMPORTANT INSTRUCTION: The provided reference image is a graphic design/logo (PNG). You MUST realistically apply, print, and blend this EXACT graphic onto the main subject's clothing (like a t-shirt) or the primary object in the scene. The logo must follow the fabric folds, body contours, lighting, and shadows naturally to look like a real printed mockup.\` }
          ]
        };
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: reqContents,
        config: { imageConfig: { aspectRatio: (size as any) || "16:9" } }
      });

      if (response.candidates?.`;

code = code.replace(regex, replacement);
fs.writeFileSync('services/geminiService.ts', code);
console.log('Patched geminiService.ts for Mockup Mode');
