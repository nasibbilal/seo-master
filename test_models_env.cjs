const { GoogleGenAI } = require('@google/genai');

async function testModel(modelName) {
  try {
    const ai = new GoogleGenAI({});
    await ai.models.generateContent({ model: modelName, contents: "Hello" });
    console.log(modelName + " SUCCESS");
  } catch(e) {
    console.log(modelName + " FAILED: " + e.message);
  }
}

async function run() {
  await testModel("gemini-1.5-flash");
  await testModel("gemini-2.0-flash");
  await testModel("gemini-3.8-flash");
  await testModel("gemini-1.5-pro");
}
run();
