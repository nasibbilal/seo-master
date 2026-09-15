const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: 'foo' });
console.log(typeof ai.models.generateImages);
