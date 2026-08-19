const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

const newMethods = `
  async analyzeMockupPlacement(imageUrl: string): Promise<{ymin: number, xmin: number, ymax: number, xmax: number} | null> {
    try {
      return await this.callWithRetry(async () => {
        const ai = this.getAI();
        const base64Data = imageUrl.split(',')[1];
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: { parts: [
              { inlineData: { mimeType: 'image/png', data: base64Data } }, 
              { text: \`Find the chest area of the main person (where a t-shirt logo goes). Return ONLY a valid JSON object with normalized bounding box coordinates (values between 0.0 and 1.0). Format exactly like this: {"ymin": 0.3, "xmin": 0.4, "ymax": 0.5, "xmax": 0.6}. Do not include markdown blocks or any other text.\` }
          ] }
        });
        const text = response.text || "";
        const match = text.match(/\\{[\\s\\S]*\\}/);
        if (match) return JSON.parse(match[0]);
        return null;
      });
    } catch (e) {
      console.warn("Placement AI failed, falling back to math", e);
      return null;
    }
  }

  async generateMockupDescription(imageUrl: string): Promise<string> {
    try {
      return await this.callWithRetry(async () => {
        const ai = this.getAI();
        const base64Data = imageUrl.split(',')[1];
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: { parts: [
              { inlineData: { mimeType: 'image/png', data: base64Data } }, 
              { text: \`Describe the final printed design on this product/t-shirt in Arabic. Be highly descriptive but concise (1-2 sentences). Example: 'تصميم جذاب يظهر شخصية كرتونية، مطبوع بدقة وتناسق في منتصف صدر التيشيرت مع تفاصيل قماش واضحة'.\` }
          ] }
        });
        return response.text || "تم تطبيق التصميم بنجاح على المنتج.";
      });
    } catch (e) {
      return "تم دمج التصميم بنجاح (الوصف التلقائي غير متاح حالياً بسبب ضغط الشبكة).";
    }
  }
`;

// Insert before the last closing brace of GeminiService class
const lastBraceIndex = code.lastIndexOf('}');
code = code.substring(0, lastBraceIndex) + newMethods + code.substring(lastBraceIndex);
fs.writeFileSync('services/geminiService.ts', code);
console.log('Added placement and description methods to GeminiService');
