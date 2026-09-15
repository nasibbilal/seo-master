const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf-8');

const importGenAI = 'import { GoogleGenAI, Type } from "@google/genai";';
const newImports = `import { GoogleGenAI, Type } from "@google/genai";

const isAIStudio = typeof window !== 'undefined' && window.location.hostname.includes("run.app");
const TEXT_MODEL = isAIStudio ? "gemini-3.8-flash" : "gemini-1.5-flash";
`;
content = content.replace(importGenAI, newImports);
fs.writeFileSync('services/geminiService.ts', content);
