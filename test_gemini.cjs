require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image', // Try high-quality
      contents: {
        parts: [
          { text: "Test prompt" }
        ]
      }
    });
    console.log("Success text only", !!response);
  } catch(e) {
    console.error("Text only failed:", e.message);
  }
}
test();
