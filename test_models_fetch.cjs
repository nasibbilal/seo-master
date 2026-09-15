const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: 'mock' });
console.log(ai.models.generateContent.toString());
