const fs = require('fs');
const content = fs.readFileSync('services/geminiService.ts', 'utf8');

const regex = /async getAudienceInsights\(category: string, platform: Platform, country: string, days: number\): Promise<AudienceInsight> \{[\s\S]*?this\.setCache\(cacheKey, result\);\s*return result;\s*\}\);\s*\}/;

const replacement = `async getAudienceInsights(category: string, platform: Platform, country: string, days: number): Promise<AudienceInsight> {
    const cacheKey = \`cache_audience_v2_\${platform}_\${country}_\${category}_\${days}\`;
    const cached = this.getCache<AudienceInsight>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ytConfig = this.getPlatformConfig('youtube');

      if (platform === Platform.YOUTUBE && ytConfig) {
        try {
          // 1. Search for top videos in the niche and region
          const searchRes = await fetch(
            \`https://www.googleapis.com/youtube/v3/search?part=snippet&q=\${encodeURIComponent(category)}&regionCode=\${country !== 'Global' ? country : 'US'}&type=video&maxResults=25&order=viewCount&key=\${ytConfig}\`
          );
          const searchData = await searchRes.json();

          if (searchData.items && searchData.items.length > 0) {
            const videoIds = searchData.items.map((item: any) => item.id?.videoId).filter(Boolean).join(',');
            
            // 2. Fetch details including contentDetails (duration) and statistics
            const videoRes = await fetch(
              \`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=\${videoIds}&key=\${ytConfig}\`
            );
            const videoData = await videoRes.json();

            // Calculate total views for audience size estimation
            let totalViews = 0;
            const videoAnalysis: any[] = [];
            const topVideoIdsForComments: string[] = [];

            if (videoData.items) {
              videoData.items.forEach((v: any, index: number) => {
                const views = parseInt(v.statistics?.viewCount || '0', 10);
                totalViews += views;
                
                // Keep top 3 for comments
                if (index < 3) topVideoIdsForComments.push(v.id);

                videoAnalysis.push({
                  title: v.snippet?.title,
                  duration: v.contentDetails?.duration,
                  publishedAt: v.snippet?.publishedAt,
                  views,
                });
              });
            }

            // 3. Fetch comments from top videos to understand audience interests
            let allComments: string[] = [];
            for (const vid of topVideoIdsForComments) {
              try {
                const commentRes = await fetch(
                  \`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=\${vid}&maxResults=15&order=relevance&key=\${ytConfig}\`
                );
                const commentData = await commentRes.json();
                if (commentData.items) {
                  commentData.items.forEach((c: any) => {
                    const text = c.snippet?.topLevelComment?.snippet?.textOriginal;
                    if (text) allComments.push(text);
                  });
                }
              } catch (e) {
                // Ignore comment fetch errors for specific videos
              }
            }

            const formatNumber = (num: number) => {
              if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
              if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
              return num.toString();
            };

            const estimatedAudienceSize = formatNumber(totalViews);

            // 4. Pass data to Gemini for synthesis
            const prompt = \`You are an elite YouTube Audience Analyst. Analyze this raw YouTube API data for the topic "\${category}" in region "\${country}".
            
            Video Data (Duration PT..S is usually Short, PT..M is Long. publishedAt shows when they post):
            \${JSON.stringify(videoAnalysis)}
            
            Audience Comments (Analyze their tone, pain points, and interests):
            \${JSON.stringify(allComments.slice(0, 40))}
            
            Total Active Niche Audience Size: ~\${estimatedAudienceSize} views across top 25 videos.
            
            Task:
            1. Find the most common posting hours for Shorts vs Long videos based on 'publishedAt' fields.
            2. Infer the audience's age range, interests, and dominant countries based on the language/context of the comments and the region "\${country}".
            3. Return ONLY a valid JSON matching this schema:
            {
              "demographics": {
                "ageRange": "e.g. 18-24 سنوات",
                "interests": ["interest 1", "interest 2"],
                "audienceSize": "\${estimatedAudienceSize} مشاهد نشط",
                "topCountries": ["Country 1", "Country 2"]
              },
              "engagementTimes": "General best time",
              "engagementTimesShorts": "e.g. 6:00 م - 8:00 م",
              "engagementTimesLong": "e.g. 2:00 م - 4:00 م",
              "contentFormats": [
                { "format": "Shorts", "performanceScore": 95, "description": "Highly engaging" }
              ],
              "currentMonthTopics": [ { "topic": "topic name", "volume": "High" } ],
              "topSearchQueries": [ { "topic": "query", "competition": 80 } ]
            }\`;

            const ai = this.getAI();
            const response = await ai.models.generateContent({
              model: "gemini-3.6-flash",
              config: { responseMimeType: "application/json" },
              contents: prompt
            });

            const parsed = this.cleanAndParseJSON(response.text);
            
            // Ensure fields exist
            const result: AudienceInsight = {
              demographics: {
                ageRange: parsed.demographics?.ageRange || "18-35",
                interests: parsed.demographics?.interests || [category],
                audienceSize: parsed.demographics?.audienceSize || \`\${estimatedAudienceSize} مهتم\`,
                topCountries: parsed.demographics?.topCountries || [country],
              },
              engagementTimes: parsed.engagementTimes || "6 PM - 9 PM",
              engagementTimesShorts: parsed.engagementTimesShorts,
              engagementTimesLong: parsed.engagementTimesLong,
              contentFormats: parsed.contentFormats || [
                { format: "Shorts (Vertical)", performanceScore: 90, description: "Fast growth" },
                { format: "Long Form", performanceScore: 75, description: "Deep value" }
              ],
              currentMonthTopics: parsed.currentMonthTopics || [{ topic: category, volume: "High" }],
              topSearchQueries: parsed.topSearchQueries || [{ topic: category, competition: 50 }]
            };

            this.setCache(cacheKey, result);
            return result;
          }
        } catch (e) {
          console.error("YouTube API Audience Strategy failed, falling back to Gemini:", e);
        }
      }

      // Fallback or Non-YouTube platforms (Gemini Estimation)
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: import('@google/genai').Type.OBJECT,
            properties: {
              demographics: {
                type: import('@google/genai').Type.OBJECT,
                properties: {
                  ageRange: { type: import('@google/genai').Type.STRING },
                  interests: {
                    type: import('@google/genai').Type.ARRAY,
                    items: { type: import('@google/genai').Type.STRING }
                  },
                  audienceSize: { type: import('@google/genai').Type.STRING },
                  topCountries: {
                    type: import('@google/genai').Type.ARRAY,
                    items: { type: import('@google/genai').Type.STRING }
                  }
                },
                required: ["ageRange", "interests"]
              },
              engagementTimes: { type: import('@google/genai').Type.STRING },
              engagementTimesShorts: { type: import('@google/genai').Type.STRING },
              engagementTimesLong: { type: import('@google/genai').Type.STRING },
              contentFormats: {
                type: import('@google/genai').Type.ARRAY,
                items: {
                  type: import('@google/genai').Type.OBJECT,
                  properties: {
                    format: { type: import('@google/genai').Type.STRING },
                    performanceScore: { type: import('@google/genai').Type.NUMBER },
                    description: { type: import('@google/genai').Type.STRING }
                  },
                  required: ["format", "performanceScore", "description"]
                }
              },
              currentMonthTopics: {
                type: import('@google/genai').Type.ARRAY,
                items: {
                  type: import('@google/genai').Type.OBJECT,
                  properties: {
                    topic: { type: import('@google/genai').Type.STRING },
                    volume: { type: import('@google/genai').Type.STRING }
                  },
                  required: ["topic", "volume"]
                }
              },
              topSearchQueries: {
                type: import('@google/genai').Type.ARRAY,
                items: {
                  type: import('@google/genai').Type.OBJECT,
                  properties: {
                    topic: { type: import('@google/genai').Type.STRING },
                    competition: { type: import('@google/genai').Type.NUMBER }
                  },
                  required: ["topic", "competition"]
                }
              }
            },
            required: ["demographics", "engagementTimes", "contentFormats", "currentMonthTopics", "topSearchQueries"]
          }
        },
        contents: \`Real-time audience insight analysis for \${category} on \${platform} in \${country} over \${days} days. Include best posting times for Shorts/Reels vs Long videos, estimated audience size and top countries. Return in Arabic.\`
      });

      const parsed = this.cleanAndParseJSON(response.text);
      this.setCache(cacheKey, parsed);
      return parsed as AudienceInsight;
    });
  }`;

const newContent = content.replace(regex, replacement);
fs.writeFileSync('services/geminiService.ts', newContent);
console.log('Replaced');
