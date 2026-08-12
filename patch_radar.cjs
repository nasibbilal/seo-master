const fs = require('fs');
const content = fs.readFileSync('services/geminiService.ts', 'utf8');

let newContent = content;

// Replace fetchRadarTrends
const radarRegex = /async fetchRadarTrends\(category: string, country: string, days: number, platform: Platform\): Promise<RadarInsight\[\]> \{[\s\S]*?return result;\s*\}\);\s*\}/;

const radarReplacement = `async fetchRadarTrends(category: string, country: string, days: number, platform: Platform): Promise<RadarInsight[]> {
    const cacheKey = \`cache_radar_v2_\${platform}_\${country}_\${category}_\${days}\`;
    const cached = this.getCache<RadarInsight[]>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      let liveData = "";
      const ytConfig = this.getPlatformConfig('youtube');
      
      if ((platform === Platform.YOUTUBE || platform === Platform.GOOGLE) && ytConfig) {
        try {
          const region = country !== 'GLOBAL' ? country : 'US';
          const searchRes = await fetch(
            \`https://www.googleapis.com/youtube/v3/search?part=snippet&q=\${encodeURIComponent(category)}&regionCode=\${region}&type=video&maxResults=10&order=viewCount&publishedAfter=\${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()}&key=\${ytConfig}\`
          );
          const searchData = await searchRes.json();
          if (searchData.items && searchData.items.length > 0) {
            const items = searchData.items.map((i: any) => i.snippet.title);
            liveData = \`Live YouTube Data top videos in \${country} past \${days} days: \${items.join(', ')}.\`;
          }
        } catch (e) {
          console.error("YouTube Radar fetch error", e);
        }
      }

      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: import('@google/genai').Type.ARRAY,
            items: {
              type: import('@google/genai').Type.OBJECT,
              properties: {
                id: { type: import('@google/genai').Type.STRING },
                platform: { type: import('@google/genai').Type.STRING },
                title: { type: import('@google/genai').Type.STRING },
                growthPercentage: { type: import('@google/genai').Type.NUMBER },
                isCovered: { type: import('@google/genai').Type.BOOLEAN },
                priority: { type: import('@google/genai').Type.STRING, description: "high, medium, low" },
                category: { type: import('@google/genai').Type.STRING },
                searchVolume: { type: import('@google/genai').Type.STRING },
                audienceSize: { type: import('@google/genai').Type.STRING }
              },
              required: ["id", "platform", "title", "growthPercentage", "isCovered", "priority", "category", "searchVolume"]
            }
          }
        },
        contents: \`\${liveData} Real-time trend analysis for \${category} on \${platform} in \${country} over the last \${days} days. Identify trending topics and potential content gaps. MUST RETURN CONTENT IN ARABIC (except id/platform codes).\`
      });

      const result = this.cleanAndParseJSON(response.text) as RadarInsight[];
      this.setCache(cacheKey, result);
      return result;
    });
  }`;

newContent = newContent.replace(radarRegex, radarReplacement);

// Replace checkContentGap
const gapRegex = /async checkContentGap\(trendTitle: string\): Promise<GapAnalysis> \{[\s\S]*?return result;\s*\}\);\s*\}/;

const gapReplacement = `async checkContentGap(trendTitle: string): Promise<GapAnalysis> {
    const cacheKey = \`cache_gap_v2_\${trendTitle}\`;
    const cached = this.getCache<GapAnalysis>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: import('@google/genai').Type.OBJECT,
            properties: {
              isGap: { type: import('@google/genai').Type.BOOLEAN },
              message: { type: import('@google/genai').Type.STRING },
              urgency: { type: import('@google/genai').Type.STRING },
              exploitKeywords: { 
                type: import('@google/genai').Type.ARRAY,
                items: { type: import('@google/genai').Type.STRING }
              },
              suggestedTitle: { type: import('@google/genai').Type.STRING },
              suggestedDesc: { type: import('@google/genai').Type.STRING }
            },
            required: ["isGap", "message", "urgency", "exploitKeywords", "suggestedTitle", "suggestedDesc"]
          }
        },
        contents: \`Is there a content gap for "\${trendTitle}"? You are an elite SEO marketer. Provide a catchy ranking title, strategic SEO description, and exploit keywords. MUST RETURN ALL TEXT FIELDS IN ARABIC.\`
      });

      const parsed = this.cleanAndParseJSON(response.text);
      const result = {
        isGap: !!parsed.isGap,
        message: parsed.message || "",
        urgency: parsed.urgency || "",
        exploitKeywords: parsed.exploitKeywords || [],
        suggestedTitle: parsed.suggestedTitle || "",
        suggestedDesc: parsed.suggestedDesc || ""
      };
      
      this.setCache(cacheKey, result);
      return result;
    });
  }`;

newContent = newContent.replace(gapRegex, gapReplacement);
fs.writeFileSync('services/geminiService.ts', newContent);
console.log('Radar and Gap analysis patched successfully.');
