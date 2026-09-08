import { GoogleGenAI } from "@google/genai";

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyFakeKeyJustForTestToSeeErrorFormat" });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Reply ONLY with the word OK.`
    });
    console.log("Success:", response);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
test();
