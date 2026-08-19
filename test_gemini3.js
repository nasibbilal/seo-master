import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: "Just text prompt"
    });
    console.log("Success text lite", !!response);
  } catch(e) {
    console.error("Text lite failed:", e.message);
  }
}
test();
