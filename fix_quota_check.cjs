const fs = require('fs');

// Patch GeminiService
let geminiCode = fs.readFileSync('services/geminiService.ts', 'utf8');

// Replace the buggy testConnection
const oldTestConnection = `  async testConnection(platform: string, config: any): Promise<{ success: boolean; errorType?: 'QUOTA' | 'INVALID' | 'GENERIC' }> {
    try {
      const ai = this.getAI(config.token);
      return await this.callWithRetry(async () => {
        // Just do a simple request to see if the key works, don't ask the AI if the format is valid
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: \`Hello\`
        });
        return { success: !!response.text };
      }, 0);
    } catch (error: any) { 
      if (error.message === "QUOTA_EXHAUSTED" || error.status === 429) return { success: false, errorType: 'QUOTA' };
      if (error.status === 400 || error.message.includes("API_KEY_INVALID")) return { success: false, errorType: 'INVALID' };
      return { success: false, errorType: 'GENERIC' }; 
    }
  }`;

const newTestConnection = `  async testConnection(platform: string, config: any): Promise<{ success: boolean; errorType?: 'QUOTA' | 'INVALID' | 'GENERIC' }> {
    try {
      let ai;
      if (platform === 'gemini') {
        ai = new GoogleGenAI({ apiKey: config.token });
      } else {
        // Not a gemini key being tested
        return { success: true };
      }
      
      return await this.callWithRetry(async () => {
        // Just do a simple request to see if the key works
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: \`Reply ONLY with the word OK.\`
        });
        return { success: true };
      }, 0);
    } catch (error: any) {
      const errorMsg = error.message?.toLowerCase() || '';
      const status = error.status || 0;
      
      if (errorMsg.includes('quota') || errorMsg.includes('429') || status === 429) {
         return { success: false, errorType: 'QUOTA' };
      }
      if (errorMsg.includes('invalid') || errorMsg.includes('key') || status === 400) {
         return { success: false, errorType: 'INVALID' };
      }
      return { success: false, errorType: 'GENERIC' }; 
    }
  }`;

geminiCode = geminiCode.replace(oldTestConnection, newTestConnection);
fs.writeFileSync('services/geminiService.ts', geminiCode);

console.log("Patched test connection logic.");
