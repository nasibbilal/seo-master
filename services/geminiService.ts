
import { GoogleGenAI, Type } from "@google/genai";
import { Platform, KeywordMetric, APIUsageStats, CompetitorData, RadarInsight, ThumbnailEvaluation, AudienceInsight, ChannelMetadata, CommentGapInsight, VideoAuditResult, EnhancedCompetitorData, GapAnalysis } from "../types";

export class GeminiService {
  private usageLimit = 1500;
  private currentChannelId = localStorage.getItem('active_channel') || '';
  private lastRequestTime = 0;
  private minInterval = 2000; 

  private getAI(manualKey?: string): GoogleGenAI {
    // محاولة جلب المفتاح من إعدادات القناة النشطة أولاً
    const savedConfig = this.getPlatformConfig('gemini');
    const apiKey = manualKey || savedConfig.apiKey || process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  }

  private getCache<T>(key: string): T | null {
    try {
      const cachedStr = localStorage.getItem(key);
      if (!cachedStr) return null;
      const parsed = JSON.parse(cachedStr);
      if (parsed.timestamp && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000) {
        return parsed.data as T;
      }
      localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
    return null;
  }

  private setCache(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (e) {
      this.clearOldCaches();
      try {
        localStorage.setItem(key, JSON.stringify({
          timestamp: Date.now(),
          data
        }));
      } catch (e2) {
        // ignore
      }
    }
  }

  private clearOldCaches() {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      // ignore
    }
  }

  private async throttle() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  private async callWithRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
    await this.throttle();
    try {
      const result = await fn();
      const used = parseInt(localStorage.getItem('gemini_api_used_count') || '0') + 1;
      localStorage.setItem('gemini_api_used_count', used.toString());
      window.dispatchEvent(new CustomEvent('gemini_usage_updated', { 
        detail: { usedTokens: used, limit: this.usageLimit, percentage: (used / this.usageLimit) * 100 } 
      }));
      return result;
    } catch (error: any) {
      const errorData = JSON.stringify(error).toUpperCase();
      const errorMessage = (error?.message || "").toUpperCase();
      
      const isQuotaError = 
        errorMessage.includes("429") || 
        errorMessage.includes("RESOURCE_EXHAUSTED") || 
        errorMessage.includes("QUOTA") ||
        errorData.includes("429") || 
        errorData.includes("RESOURCE_EXHAUSTED") || 
        errorData.includes("QUOTA_EXCEEDED");

      if (retries > 0 && isQuotaError) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.callWithRetry(fn, retries - 1);
      }
      
      if (isQuotaError) throw new Error("QUOTA_EXHAUSTED");
      throw error;
    }
  }

  getPlatformConfig(platform: string) {
    const config = localStorage.getItem(`config_${platform.toLowerCase()}_${this.currentChannelId}`);
    return config ? JSON.parse(config) : {};
  }

  updatePlatformConfig(platform: string, config: any) {
    localStorage.setItem(`config_${platform.toLowerCase()}_${this.currentChannelId}`, JSON.stringify(config));
  }

  checkPlatformApiKey(platform: Platform, isRtl: boolean = true): { hasKey: boolean; message?: string } {
    const geminiConfig = this.getPlatformConfig('gemini');
    const geminiKey = geminiConfig.apiKey || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return {
        hasKey: false,
        message: isRtl
          ? 'يرجى إدخال مفتاح API الخاص بـ Gemini في قسم الإعدادات لتفعيل خوارزميات الذكاء الاصطناعي.'
          : 'Please enter the Gemini API Key in Settings to enable AI features.'
      };
    }

    let requiredKey = '';
    let platformNameAr = '';
    let platformNameEn = '';

    switch (platform) {
      case Platform.YOUTUBE: {
        const cfg = this.getPlatformConfig('youtube');
        requiredKey = cfg.youtube_key || cfg.youtube_key_2 || '';
        platformNameAr = 'يوتيوب (YouTube)';
        platformNameEn = 'YouTube';
        break;
      }
      case Platform.TIKTOK: {
        const cfg = this.getPlatformConfig('tiktok');
        requiredKey = cfg.tiktok_secret || '';
        platformNameAr = 'تيك توك (TikTok)';
        platformNameEn = 'TikTok';
        break;
      }
      case Platform.INSTAGRAM: {
        const cfg = this.getPlatformConfig('meta');
        requiredKey = cfg.meta_token || '';
        platformNameAr = 'إنستغرام (Instagram)';
        platformNameEn = 'Instagram';
        break;
      }
      case Platform.FACEBOOK: {
        const cfg = this.getPlatformConfig('meta');
        requiredKey = cfg.meta_token || '';
        platformNameAr = 'فيسبوك (Facebook)';
        platformNameEn = 'Facebook';
        break;
      }
      case Platform.GOOGLE: {
        const cfg = this.getPlatformConfig('google_search');
        requiredKey = cfg.google_token || '';
        platformNameAr = 'بحث جوجل (Google Search)';
        platformNameEn = 'Google Search';
        break;
      }
      case Platform.PINTEREST: {
        const cfg = this.getPlatformConfig('pinterest');
        requiredKey = cfg.pinterest_token || '';
        platformNameAr = 'بينتريست (Pinterest)';
        platformNameEn = 'Pinterest';
        break;
      }
      default: {
        const gCfg = this.getPlatformConfig('google_search');
        const mCfg = this.getPlatformConfig('meta');
        requiredKey = gCfg.google_token || mCfg.meta_token || geminiKey;
        platformNameAr = platform;
        platformNameEn = platform;
        break;
      }
    }

    if (!requiredKey || requiredKey.trim() === '') {
      return {
        hasKey: false,
        message: isRtl
          ? `يرجى إدخال مفتاح API الخاص بـ ${platformNameAr} في قسم الإعدادات لجلب البيانات الحقيقية.`
          : `Please enter the API key for ${platformNameEn} in settings to fetch real data.`
      };
    }

    return { hasKey: true };
  }

  setChannel(channelId: string) {
    this.currentChannelId = channelId;
    localStorage.setItem('active_channel', channelId);
  }

  getActiveChannelId(): string { return this.currentChannelId; }

  getChannels(): ChannelMetadata[] {
    try {
      const channels = localStorage.getItem('seomaster_channels');
      return (channels ? JSON.parse(channels) : []) ?? [];
    } catch (e) { return []; }
  }

  addChannel(channel: ChannelMetadata) {
    const channels = this.getChannels();
    channels.push(channel);
    localStorage.setItem('seomaster_channels', JSON.stringify(channels));
  }

  async fetchChannelRealLogo(platform: Platform, identifier: string, apiKey?: string): Promise<string> {
    try {
      const ytConfig = this.getPlatformConfig('youtube');
      const keys = apiKey ? [apiKey] : [ytConfig.youtube_key, ytConfig.youtube_key_2].filter(Boolean);

      if (platform === Platform.YOUTUBE && keys.length > 0 && (identifier.startsWith('UC') || identifier.startsWith('@'))) {
        const param = identifier.startsWith('UC') ? `id=${identifier}` : `forHandle=${identifier.replace('@', '')}`;
        
        for (const key of keys) {
          try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&${param}&key=${key}`);
            const data = await response.json();
            
            if (data.error) {
               if (data.error.errors?.some((e: any) => e.reason === 'quotaExceeded' || e.reason === 'rateLimitExceeded')) {
                 continue; 
               }
               throw new Error(data.error.message);
            }

            if (data.items && data.items.length > 0) {
              return data.items[0].snippet.thumbnails.medium?.url || data.items[0].snippet.thumbnails.default.url;
            }
          } catch (err) {
            console.error(`Error with key ${key}:`, err);
          }
        }
      }
      
      const ai = this.getAI();
      const prompt = `Find the high-resolution official avatar image URL for the ${platform} channel: "${identifier}". Return ONLY the raw URL link. No quotes, no markdown.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      
      const foundUrl = response.text?.trim() || "";
      if (foundUrl.startsWith('http')) return foundUrl;
      
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=random&color=fff&size=256&bold=true`;
    } catch (e) {
      console.error("Logo Fetch Error:", e);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=random&color=fff&size=256&bold=true`;
    }
  }

  async testConnection(platform: string, config: any): Promise<{ success: boolean; errorType?: 'QUOTA' | 'INVALID' | 'GENERIC' }> {
    try {
      let ai;
      if (platform === 'gemini') {
        ai = new GoogleGenAI({ apiKey: config.token.trim() });
      } else {
        // Not a gemini key being tested
        return { success: true };
      }
      
      return await this.callWithRetry(async () => {
        // Just do a simple request to see if the key works
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Reply ONLY with the word OK.`
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
  }

  private detectLanguage(input: string): string {
    if (!input) return 'Arabic';
    // Check Arabic unicode characters
    if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(input)) {
      return 'Arabic';
    }
    // Check French accented characters or common French words
    if (/[éèêëàâäôöûüçîïÉÈÊËÀÂÄÔÖÛÜÇÎÏ]/.test(input) || /\b(le|la|les|un|une|des|du|dans|pour|avec|comment|quoi|qui|est|sont|ce|cette)\b/i.test(input)) {
      return 'French';
    }
    // Check Spanish
    if (/[ñáéíóúÁÉÍÓÚ¿¡]/.test(input) || /\b(el|la|los|las|un|una|unos|unas|como|para|con|que|por|del)\b/i.test(input)) {
      return 'Spanish';
    }
    // Default to English for other Latin script inputs
    if (/[a-zA-Z]/.test(input)) {
      return 'English';
    }
    return 'Arabic';
  }

  async analyzeKeywords(query: string, platform: Platform, country: string): Promise<any> {
    const detectedLang = this.detectLanguage(query);
    const cacheKey = `cache_keywords_outlier_v4_${platform}_${country}_${detectedLang}_${query}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ytConfig = this.getPlatformConfig('youtube');
      const ytKey = ytConfig.youtube_key || ytConfig.youtube_key_2;

      if (platform === Platform.YOUTUBE && ytKey) {
        try {
          // Determine language-appropriate search parameters
          let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${ytKey}`;
          if (detectedLang === 'Arabic') {
            searchUrl += `&relevanceLanguage=ar`;
          } else if (detectedLang === 'French') {
            searchUrl += `&relevanceLanguage=fr`;
          } else if (detectedLang === 'Spanish') {
            searchUrl += `&relevanceLanguage=es`;
          } else if (detectedLang === 'English') {
            searchUrl += `&relevanceLanguage=en`;
          }

          // 1. Search top 10 videos
          const searchRes = await fetch(searchUrl);
          const searchData = await searchRes.json();
          if (searchData.items && searchData.items.length > 0) {
            const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
            
            // 2. Get video details (tags, stats)
            const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${ytKey}`);
            const videoData = await videoRes.json();
            
            const channelIds = [...new Set(videoData.items.map((v: any) => v.snippet.channelId))].join(',');
            
            // 3. Get channel details (subs)
            const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${ytKey}`);
            const channelData = await channelRes.json();
            
            const channelMap: Record<string, number> = {};
            channelData.items?.forEach((c: any) => {
              channelMap[c.id] = parseInt(c.statistics.subscriberCount || '0', 10);
            });

            // 4. Outlier Analysis
            const now = Date.now();
            const tagScores: Record<string, { score: number, views: number, count: number }> = {};
            let outlierContext = "Top Competitors Analysis (Outlier Strategy):\n";

            videoData.items?.forEach((vid: any) => {
              const views = parseInt(vid.statistics.viewCount || '0', 10);
              const subs = channelMap[vid.snippet.channelId] || 1;
              const publishedAt = new Date(vid.snippet.publishedAt).getTime();
              const daysOld = Math.max((now - publishedAt) / (1000 * 3600 * 24), 1);
              
              const viewSubRatio = views / Math.max(subs, 1);
              const outlierScore = viewSubRatio / daysOld;

              outlierContext += `- Title: "${vid.snippet.title}", Views: ${views}, Subs: ${subs}, Age: ${Math.round(daysOld)} days, OutlierScore: ${outlierScore.toFixed(2)}, Tags: ${(vid.snippet.tags || []).slice(0, 5).join(', ')}\n`;

              const tags = vid.snippet.tags || [];
              tags.forEach((tag: string) => {
                const t = tag.toLowerCase().trim();
                if (!t) return;
                if (!tagScores[t]) tagScores[t] = { score: 0, views: 0, count: 0 };
                tagScores[t].score += outlierScore;
                tagScores[t].views += views;
                tagScores[t].count += 1;
              });
            });

            // 5. Format Tags
            const sortedTags = Object.keys(tagScores)
              .map(t => ({ tag: t, ...tagScores[t] }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 15);

            const maxScore = Math.max(...sortedTags.map(t => t.score), 1);

            let keywords: KeywordMetric[] = sortedTags.map(t => {
              const strength = Math.min(Math.round((t.score / maxScore) * 100), 100);
              const competition = Math.max(100 - strength, 10);
              const formatNumber = (num: number) => {
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                return num.toString();
              };
              return {
                keyword: t.tag,
                searchVolume: formatNumber(t.views),
                competition,
                strength,
                trend: 'up'
              };
            });

            if (keywords.length === 0) {
              keywords = await this.getGeminiKeywordsFallback(query, platform, country);
            }

            // 6. Generate Title & Desc using Gemini based strictly on detected input language
            let suggestedTitle = "";
            let suggestedDesc = "";
            try {
              const ai = this.getAI();
              const currentYear = new Date().getFullYear();
              const prompt = `You are an elite YouTube SEO expert. I extracted the top ranking videos for "${query}" (Language: ${detectedLang}).
Outlier competitor data:\n${outlierContext}

STRICT CONTEXT LOCK (MANDATORY):
1. ALL generated data MUST explicitly and directly relate exclusively to the exact input topic "${query}".
2. Do NOT generate generic, unrelated, or foreign seed keywords under any circumstances. You must extract actual specific long-tail keywords.

STRICT LANGUAGE OUTPUT MATCHING (MANDATORY):
1. Detect the exact language of "${query}" (${detectedLang}).
2. Generate suggestedTitle and suggestedDesc strictly 100% in ${detectedLang}. No foreign keywords or mixed languages.

FORMATTING RULES:
1. Title format MUST be exactly: [General Keyword related to topic] + [Specific Keyword about the topic].
2. Description format MUST follow the exact YouTube algorithm preference:
   - First 2 lines: A strong hook utilizing the extracted high-volume keywords.
   - Video Chapters (Timestamps): E.g., 0:00 Intro, etc.
   - Links Section: Placeholder for social media and product links.
   - Hashtags: 3-5 highly relevant hashtags at the bottom.
Return ONLY a valid JSON: {"title": "...", "description": "..."}`;
              
              const aiRes = await ai.models.generateContent({
                model: "gemini-3.8-flash",
                config: { responseMimeType: "application/json" },
                contents: prompt
              });
              const parsedAI = JSON.parse(aiRes.text || "{}");
              suggestedTitle = parsedAI.title || "";
              suggestedDesc = parsedAI.description || "";
            } catch(e) {
              console.error("AI Generation failed during outlier strategy", e);
            }

            const result = {
              keywords,
              suggestedTitle,
              suggestedDesc
            };

            this.setCache(cacheKey, result);
            return result;
          }
        } catch (e) {
          console.error("YouTube API Outlier Strategy failed:", e);
        }
      }

      // Live Google Search API
      const googleCfg = this.getPlatformConfig('google_search');
      if (platform === Platform.GOOGLE && googleCfg.google_token) {
        try {
          const res = await fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${googleCfg.google_token}`);
          const gData = await res.json();
          if (gData.items && gData.items.length > 0) {
            const liveSnippets = gData.items.map((i: any) => i.title).join(', ');
            const ai = this.getAI();
            const aiRes = await ai.models.generateContent({
              model: "gemini-3.8-flash",
              config: { responseMimeType: "application/json" },
              contents: `Live Google Search results for "${query}": ${liveSnippets}.
STRICT LANGUAGE LOCK: Input language is "${detectedLang}". Extract 10 high-intent search keywords strictly in ${detectedLang}. Return array of KeywordMetric.`
            });
            const keywords = JSON.parse(aiRes.text || "[]");
            if (keywords.length > 0) {
              const result = { keywords, suggestedTitle: gData.items[0].title, suggestedDesc: gData.items[0].snippet };
              this.setCache(cacheKey, result);
              return result;
            }
          }
        } catch (e) {
          console.error("Google Search API fetch error:", e);
        }
      }

      // Fallback AI processing with live data context
      const result = await this.getGeminiKeywordsFallback(query, platform, country);
      this.setCache(cacheKey, result);
      return result;
    });
  }

  private async getGeminiKeywordsFallback(query: string, platform: Platform, country: string): Promise<KeywordMetric[]> {
    const detectedLang = this.detectLanguage(query);
    const ai = this.getAI();
    const currentYear = new Date().getFullYear();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      config: { 
        responseMimeType: "application/json", 
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              searchVolume: { type: Type.STRING },
              competition: { type: Type.NUMBER },
              strength: { type: Type.NUMBER },
              trend: { type: Type.STRING, description: "up, down, stable" }
            },
            required: ["keyword", "searchVolume", "competition", "strength", "trend"]
          }
        }
      },
      contents: `Perform high-precision search keyword analysis for "${query}" on ${platform} in country "${country}" for year ${currentYear}.

STRICT CONTEXT LOCK (MANDATORY):
1. Generated keywords MUST explicitly and directly relate exclusively to the core concept of "${query}".
2. Do NOT hallucinate generic search queries or unrelated terms. You must extract actual specific long-tail keywords that a user would type to find "${query}".
3. Your goal is to provide keywords that are highly relevant, have high search volume, and low competition to help the user rank easily.

STRICT INPUT-DRIVEN LANGUAGE MATCHING (MANDATORY):
1. Input query: "${query}". Detected language: ${detectedLang}.
2. ALL generated keywords and terms MUST be extracted strictly in ${detectedLang}. NEVER use foreign seed keywords (e.g. English seeds for Arabic inputs).
3. If input is Arabic -> All 10-15 keywords MUST be 100% in Arabic.
4. If input is English -> All 10-15 keywords MUST be 100% in English.`
    });
    return (JSON.parse(response.text || "[]") ?? []) as KeywordMetric[];
  }

  // Fixing missing fetchRadarTrends method for RadarTab.tsx
  async fetchRadarTrends(category: string, country: string, days: number, platform: Platform, lang: string = 'ar'): Promise<RadarInsight[]> {
    const cacheKey = `cache_radar_v4_${platform}_${country}_${category}_${days}_${lang}`;
    const cached = this.getCache<RadarInsight[]>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      let liveData = "";
      const ytConfig = this.getPlatformConfig('youtube');
      const ytKey = ytConfig.youtube_key || ytConfig.youtube_key_2;

      // Translate category ID to actual search query based on app language
      const categoryMapAr: Record<string, string> = {
        'education': 'الربح من الانترنت', 'science': 'علوم', 'tech': 'تقنية', 'comedy': 'كوميديا',
        'gaming': 'ألعاب', 'sports': 'رياضة', 'travel': 'سفر', 'animals': 'حيوانات',
        'entertainment': 'ترفيه', 'blogs': 'مدونات', 'politics': 'سياسة',
        'fashion': 'موضة', 'movies': 'أفلام', 'music': 'موسيقى', 'community': 'مجتمع'
      };
      const categoryMapEn: Record<string, string> = {
        'education': 'Make money online', 'science': 'science', 'tech': 'technology', 'comedy': 'comedy',
        'gaming': 'gaming', 'sports': 'sports', 'travel': 'travel', 'animals': 'animals',
        'entertainment': 'entertainment', 'blogs': 'vlogs', 'politics': 'politics',
        'fashion': 'fashion', 'movies': 'movies', 'music': 'music', 'community': 'community'
      };
      
      const searchQuery = lang === 'ar' ? (categoryMapAr[category] || category) : (categoryMapEn[category] || category);
      const relevanceLang = lang === 'ar' ? 'ar' : 'en';
      
      const searchVolumeText = lang === 'ar' ? 'عالي جداً (تم التحقق)' : 'Very High (Verified)';
      const audienceSizeText = lang === 'ar' ? 'بيانات يوتيوب الحية' : 'Live YouTube Data';

      if (platform === Platform.YOUTUBE && ytKey) {
        try {
          const region = country !== 'GLOBAL' ? country : 'US';
          const searchRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&regionCode=${region}&relevanceLanguage=${relevanceLang}&type=video&maxResults=50&order=viewCount&publishedAfter=${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()}&key=${ytKey}`
          );
          const searchData = await searchRes.json();
          if (searchData.items && searchData.items.length > 0) {
            const videoIds = searchData.items.map((item: any) => item.id.videoId).filter(Boolean).join(',');
            
            if (videoIds) {
              const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${ytKey}`);
              const videoData = await videoRes.json();
              
              const channelIds = [...new Set(videoData.items.map((v: any) => v.snippet.channelId))].join(',');
              const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${ytKey}`);
              const channelData = await channelRes.json();
              
              const channelMap: Record<string, number> = {};
              channelData.items?.forEach((c: any) => {
                channelMap[c.id] = parseInt(c.statistics.subscriberCount || '0', 10);
              });

              const now = Date.now();
              const realTrends: RadarInsight[] = [];
              
              videoData.items?.forEach((vid: any) => {
                const title = vid.snippet.title || "";
                const hasArabic = /[\u0600-\u06FF]/.test(title);
                
                if (lang === 'ar' && !hasArabic) return; // Strict Arabic filter
                if (lang === 'en' && hasArabic) return; // Strict English filter

                const views = parseInt(vid.statistics.viewCount || '0', 10);
                const subs = channelMap[vid.snippet.channelId] || 1;
                const publishedAt = new Date(vid.snippet.publishedAt).getTime();
                const daysOld = Math.max((now - publishedAt) / (1000 * 3600 * 24), 1);
                
                const viewSubRatio = views / Math.max(subs, 1);
                const outlierScore = viewSubRatio / daysOld;

                realTrends.push({
                  id: vid.id,
                  platform: Platform.YOUTUBE,
                  title: vid.snippet.title,
                  growthPercentage: Math.round(outlierScore * 100),
                  isCovered: false,
                  priority: outlierScore > 2 ? 'high' : (outlierScore > 1 ? 'medium' : 'low'),
                  category: category,
                  searchVolume: searchVolumeText,
                  audienceSize: audienceSizeText,
                  videoUrl: `https://youtube.com/watch?v=${vid.id}`,
                  views: views,
                  subs: subs,
                  outlierScore: parseFloat(outlierScore.toFixed(2))
                });
              });

              // Sort by outlier score
              realTrends.sort((a, b) => (b.outlierScore || 0) - (a.outlierScore || 0));
              const topRealTrends = realTrends.slice(0, 10);

              this.setCache(cacheKey, topRealTrends);
              return topRealTrends;
            }
          }
        } catch (e) {
          console.error("YouTube Radar fetch error", e);
        }
      }

      // Fallback for other platforms or if YouTube fetch failed
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                platform: { type: Type.STRING },
                title: { type: Type.STRING },
                growthPercentage: { type: Type.NUMBER },
                isCovered: { type: Type.BOOLEAN },
                priority: { type: Type.STRING, description: "high, medium, low" },
                category: { type: Type.STRING },
                searchVolume: { type: Type.STRING },
                audienceSize: { type: Type.STRING }
              },
              required: ["id", "platform", "title", "growthPercentage", "isCovered", "priority", "category", "searchVolume"]
            }
          }
        },
        contents: `${liveData} Real-time trend analysis for topic "${searchQuery}" on ${platform} in ${country} over the last ${days} days. Identify trending topics and potential content gaps. CRITICAL: The application language is currently set to ${lang === 'ar' ? 'Arabic' : 'English'}. YOU MUST return all text fields (title, category, searchVolume, audienceSize) strictly 100% in ${lang === 'ar' ? 'Arabic' : 'English'}. Do NOT mix languages.`
      });

      const result = this.cleanAndParseJSON(response.text) as RadarInsight[];
      this.setCache(cacheKey, result);
      return result;
    });
  }

  async generateHarmonizedYouTubeMetadata(
    topic: string,
    primaryKeyword: string,
    exploitKeywords: string[],
    platform: Platform,
    country: string
  ): Promise<{ title: string, description: string, tags: string[] }> {
    const detectedLang = this.detectLanguage(topic || primaryKeyword);
    const currentYear = new Date().getFullYear();
    const cacheKey = `cache_harmonized_metadata_v1_${platform}_${country}_${detectedLang}_${topic}_${primaryKeyword}`;
    const cached = this.getCache<{ title: string, description: string, tags: string[] }>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ai = this.getAI();

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Long-tail SEO title combining broad keyword and specific user video topic" },
              description: { type: Type.STRING, description: "4-part algorithm optimized description with hook, body, timestamps, and hashtags" },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "20 tags ordered strictly by YouTube algorithm metadata hierarchy"
              }
            },
            required: ["title", "description", "tags"]
          }
        },
        contents: `You are an elite YouTube Algorithm & SEO Architect for year ${currentYear}.

USER INPUT DATA:
- Specific Video Topic / Idea entered by user: "${topic}"
- High Search Volume / Low-Competition Broad Keyword: "${primaryKeyword}"
- Exploit / Gap Keywords: ${exploitKeywords.join(', ')}
- Target Platform: ${platform}
- Target Region: ${country}

STRICT CONTEXT LOCK (MANDATORY):
- The Title, Description, and Tags MUST be exclusively about "${topic}". Do NOT add unrelated broad concepts.

STRICT LANGUAGE OUTPUT MATCHING (MANDATORY):
- Detected Input Language: "${detectedLang}"
- YOU MUST GENERATE ALL FIELDS (title, description, timestamps, tags) 100% IN THAT EXACT SAME LANGUAGE ("${detectedLang}").
- NEVER mix languages, use foreign seed keywords, or translate to a different language. If the topic is Arabic, the output MUST be strictly Arabic.

CORE TASK: GENERATE PERFECTLY HARMONIZED METADATA (Title, Description, Tags) SO THE YOUTUBE ALGORITHM ACCURATELY INDEXES THE EXACT TARGET AUDIENCE.

1. LONG-TAIL TITLE STRATEGY (CRITICAL):
   - You MUST combine the high-search general keyword with the user's specific detailed topic into a single magnetic title.
   - FORMULA: [High Search / Low-Competition Broad Keyword] : [Specific User Video Topic / Idea as provided by user] (${currentYear})
   - Rule: NEVER omit the specific video topic "${topic}". The broad keyword gives search volume, while the user's specific topic captures the exact buyer/viewer intent.
   - Example (Arabic): إذا كان الموضوع "طريقة عمل قهوة إسبريسو بالمنزل بدون ماكينة" والكلمة "صنع القهوة" -> العنوان: صنع القهوة : طريقة عمل قهوة إسبريسو بالمنزل بدون ماكينة خطوة بخطوة 2026
   - Example (English): If topic is "Build an ecommerce store with zero budget" and keyword is "Dropshipping for Beginners" -> Title: Dropshipping for Beginners : How to Build an Ecommerce Store with Zero Budget in 2026

2. ALGORITHM-FRIENDLY DESCRIPTION STRUCTURE:
   You MUST format the output description with the following precise 4-part structure, and you MUST USE this exact visual layout template:

   [Strong opening hook in 2 lines incorporating primary keyword and specific topic]

   ${detectedLang === 'Arabic' ? '⏱️ فصول الفيديو:' : '⏱️ Video Chapters:'}
   00:00 - ${detectedLang === 'Arabic' ? 'المقدمة' : 'Introduction'}
   [add 3-4 more timestamps covering the topic]

   ${detectedLang === 'Arabic' ? '🔗 روابط هامة:' : '🔗 Important Links:'}
   [${detectedLang === 'Arabic' ? 'رابط 1' : 'Link 1'}]
   [${detectedLang === 'Arabic' ? 'رابط 2' : 'Link 2'}]

   #hashtag1 #hashtag2 #hashtag3

3. TAGS (العلامات / الوسوم) - YOUTUBE ALGORITHM HIERARCHY (20 TAGS):
   The tags MUST be ordered strictly according to the YouTube algorithm's indexing priority so that Title, Description, and Tags create a 100% coherent metadata triangle:
   - Rank 1-2: Exact match of the Full Video Title & Exact User Specific Topic Phrase (العنوان الحرفي والموضوع الدقيق).
   - Rank 3-5: The Core High-Volume Primary Keyword & Main Niche Term ("${primaryKeyword}").
   - Rank 6-12: Sub-topics, chapter titles, and key phrases explicitly mentioned in the description body.
   - Rank 13-17: High-intent viewer search questions & competitor gap keywords (${exploitKeywords.slice(0, 4).join(', ') || 'user search intent phrases'}).
   - Rank 18-20: Universal technical and niche terms (e.g. SEO, ${currentYear}, 4K, Tutorial) if applicable.

Return ONLY a valid JSON object matching the schema.`
      });

      const parsed = this.cleanAndParseJSON(response.text);
      const result = {
        title: parsed.title || `${primaryKeyword} : ${topic} (${currentYear})`,
        description: parsed.description || `${topic} - ${primaryKeyword}`,
        tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags.slice(0, 20) : [topic, primaryKeyword, ...exploitKeywords].slice(0, 20)
      };

      this.setCache(cacheKey, result);
      return result;
    });
  }

  async generatePlatformContent(keywords: string[], platform: Platform, topic: string): Promise<{ title: string, description: string }> {
    const cacheKey = `cache_content_v4_${platform}_${topic}_${keywords.join(',')}`;
    const cached = this.getCache<{ title: string, description: string }>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ai = this.getAI();
      const currentYear = new Date().getFullYear();
      
      const systemInstruction = `You are an elite SEO and YouTube algorithm strategist for ${platform}. 
      Your goal is to dominate search results for year ${currentYear} using the provided keywords: ${keywords.join(', ')}.
      
      STRICT CONTEXT LOCK:
      Output MUST exclusively focus on the specific topic: "${topic}". Do not add unrelated generic ideas.

      STRICT LANGUAGE OUTPUT MATCHING (MANDATORY):
      Automatically detect the EXACT language of the topic/keywords ("${topic}", "${keywords.join(', ')}") (e.g., English, French, Arabic, Spanish, German, etc.).
      YOU MUST GENERATE BOTH 'title' AND 'description' 100% IN THAT EXACT SAME DETECTED LANGUAGE.
      - If input topic/keywords are Arabic -> Output 100% Arabic. No English seed keywords.
      - If input topic/keywords are English -> Output 100% English.
      - If input topic/keywords are French -> Output 100% French.
      NEVER mix languages under any circumstances.

      LONG-TAIL TITLE STRATEGY (CRITICAL):
      Formulate the title strictly using the high-converting Long-Tail formula:
      [High Search / Low-Competition Keyword] : [Specific Detailed Topic of the Video]
      Example (Arabic): تجارة إلكترونية للمبتدئين : الدليل الشامل لإنشاء متجر مربح في 2026
      Example (English): Ecommerce for Beginners : Complete Step-by-Step Guide to Build a Profitable Store in 2026

      ALGORITHM-FRIENDLY DESCRIPTION STRATEGY:
      The 'description' field MUST follow this exact visual layout format:

      [Strong hook in 2 lines utilizing the keywords]

      ⏱️ \${topic.match(/[\\u0600-\\u06FF]/) ? 'فصول الفيديو:' : 'Video Chapters:'}
      00:00 - \${topic.match(/[\\u0600-\\u06FF]/) ? 'المقدمة' : 'Introduction'}
      [add 3-5 more timestamps]

      🔗 \${topic.match(/[\\u0600-\\u06FF]/) ? 'روابط هامة:' : 'Important Links:'}
      [\${topic.match(/[\\u0600-\\u06FF]/) ? 'رابط 1' : 'Link 1'}]
      [\${topic.match(/[\\u0600-\\u06FF]/) ? 'رابط 2' : 'Link 2'}]

      #hashtag1 #hashtag2 #hashtag3
      
      Return JSON object with 'title' and 'description' keys.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        config: { 
          responseMimeType: "application/json",
          systemInstruction: systemInstruction 
        },
        contents: `Topic: "${topic}". Primary Keywords: ${keywords[0]}. Secondary: ${keywords.slice(1).join(', ')}. Generate the best Long-Tail SEO title and description for ${currentYear} strictly 100% in the detected input language.`
      });
      
      const parsed = JSON.parse(response.text || '{"title":"","description":""}');
      const result = {
        title: parsed.title || "",
        description: parsed.description || ""
      };
      this.setCache(cacheKey, result);
      return result;
    });
  }

  async generateExpandedSeoDescription(
    topic: string,
    primaryKeyword: string,
    exploitKeywords: string[],
    currentYear: number = new Date().getFullYear()
  ): Promise<string> {
    const cacheKey = `cache_expanded_desc_v4_${topic}_${primaryKeyword}_${currentYear}`;
    const cached = this.getCache<string>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are an elite YouTube and multi-platform SEO copywriter for ${currentYear}.

STRICT CONTEXT LOCK (MANDATORY):
Output MUST strictly align with the core concept of "${topic}". Do not include off-topic filler.

STRICT LANGUAGE OUTPUT MATCHING (MANDATORY):
Automatically detect the language of the input topic ("${topic}") and primary keyword ("${primaryKeyword}") (e.g., English, French, Arabic, Spanish, German, etc.).
YOU MUST WRITE THE ENTIRE DESCRIPTION, CHAPTERS, AND HASHTAGS 100% IN THAT EXACT SAME DETECTED LANGUAGE.
- If input topic/keyword is Arabic -> 100% Arabic. No foreign keywords.
- If input topic/keyword is English -> 100% English.
- If input topic/keyword is French -> 100% French.
- Do NOT mix or translate into other languages under any circumstances.

Topic: "${topic}"
Primary Keyword: "${primaryKeyword}"
Exploit Keywords / Gap: ${exploitKeywords.join(', ')}

ALGORITHM-FRIENDLY DESCRIPTION STRUCTURE REQUIREMENTS:
You MUST format the output description with the following precise structure, and you MUST USE this exact visual layout template:

[Compelling, high-converting opening hook in 2 paragraphs integrating the primary keyword ("${primaryKeyword}") and secondary terms smoothly.]

\${detectedLang === 'Arabic' ? '⏱️ فصول الفيديو:' : '⏱️ Video Chapters:'}
00:00 - \${detectedLang === 'Arabic' ? 'المقدمة' : 'Introduction'}
[add 3-5 more logical timestamps matching the video topic breakdown]

\${detectedLang === 'Arabic' ? '🔗 روابط هامة:' : '🔗 Important Links:'}
[\${detectedLang === 'Arabic' ? 'رابط 1' : 'Link 1'}]
[\${detectedLang === 'Arabic' ? 'رابط 2' : 'Link 2'}]

#\${primaryKeyword.replace(/\\s+/g, '_')} #hashtag2 #hashtag3

Return ONLY the complete, beautifully structured SEO description 100% in the detected input language.`
      });

      const desc = response.text?.trim() || "";
      if (desc) this.setCache(cacheKey, desc);
      return desc;
    });
  }

  async generateCuriosityHook(topic: string, primaryKeyword: string): Promise<string> {
    const cacheKey = `cache_curiosity_hook_v3_${topic}_${primaryKeyword}`;
    const cached = this.getCache<string>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are a High-CTR thumbnail copywriter.

STRICT LANGUAGE LOCKING RULE (MANDATORY):
Automatically detect the language of topic: "${topic}" and primary keyword: "${primaryKeyword}" (e.g., English, French, Arabic, Spanish, German, etc.).
YOU MUST WRITE THE PUNCHY HOOK TEXT 100% IN THAT EXACT SAME DETECTED LANGUAGE.

Task: Generate a single short, extremely curiosity-inducing 3 to 5 word punchline to place on a video thumbnail.
Examples (English): "What Nobody Tells You! 🔥", "Secret Revealed Now! 🚀", "Watch Before Buying! ⚡"
Examples (French): "Ce Que Personne Ne Dit! 🔥", "Révélation Incroyable! 🚀"
Examples (Arabic): "سر لا يخبرك به أحد! 🔥", "الحقيقة الكاملة بوضوح! ✨"

Return ONLY the 3-5 word hook text in the detected input language without quotes or extra explanation.`
      });

      const hook = response.text?.trim().replace(/^["'«]+|["'»]+$/g, '') || "";
      if (hook) this.setCache(cacheKey, hook);
      return hook;
    });
  }

  async generateContextualImagePrompt(topic: string, primaryKeyword: string, hookText: string): Promise<string> {
    const cacheKey = `cache_img_prompt_v3_${topic}_${primaryKeyword}_${hookText}`;
    const cached = this.getCache<string>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are an expert YouTube thumbnail visual art director.
Topic: "${topic}" (Primary Keyword: "${primaryKeyword}").
Text Overlay Hook: "${hookText}".

TASK: Write a precise, hyper-focused image generation prompt (in English) describing a YouTube thumbnail scene for this exact topic.

CRITICAL VISUAL RELEVANCE & CONTEXT RULES:
1. The primary visual subject MUST directly and accurately represent the core subject matter of "${topic}".
   - Example: If topic is "كرة القدم" / "football" / "soccer" -> feature a professional soccer player kicking a glowing football in a packed stadium under bright floodlights.
   - Example: If topic is "برمجة" / "coding" -> feature a software developer at a glowing desk setup with code on monitors.
   - Example: If topic is "طبخ" / "cooking" -> feature a chef preparing a delicious steaming dish in a restaurant kitchen.
2. STRICTLY PROHIBITED: Do NOT include random, hallucinated, or off-topic imagery (such as churches, cathedrals, mosques, religious monuments, or unrelated landscapes) UNLESS explicitly requested in the topic itself.
3. Text Overlay: Include bold 3D high-contrast visual text overlay displaying "${hookText}".
4. Visual Style: High contrast, 4K resolution, vibrant cinematic lighting, professional YouTube thumbnail style.

Return ONLY the raw prompt string, with no quotes or extra preamble.`
      });

      const promptText = response.text?.trim() || `Professional high-CTR YouTube thumbnail for topic "${topic}". Main focal subject directly showing ${primaryKeyword}. Bold high contrast text overlay reading "${hookText}". Vibrant lighting, 4k resolution.`;
      this.setCache(cacheKey, promptText);
      return promptText;
    });
  }

  async generateTags(topic: string, platform: Platform, country: string): Promise<string[]> {
    const cacheKey = `cache_tags_outlier_v2_${platform}_${country}_${topic}`;
    const cached = this.getCache<string[]>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ytConfig = this.getPlatformConfig('youtube');
      const ytKey = ytConfig.youtube_key || ytConfig.youtube_key_2;

      if (platform === Platform.YOUTUBE && ytKey) {
        try {
          // 1. Search top 15 videos to get a broad range of tags
          const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&type=video&maxResults=15&key=${ytKey}`);
          const searchData = await searchRes.json();
          
          if (searchData.items && searchData.items.length > 0) {
            const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
            
            // 2. Get video details (tags, stats)
            const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${ytKey}`);
            const videoData = await videoRes.json();
            
            const channelIds = [...new Set(videoData.items.map((v: any) => v.snippet.channelId))].join(',');
            
            // 3. Get channel details (subs)
            const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${ytKey}`);
            const channelData = await channelRes.json();
            
            const channelMap: Record<string, number> = {};
            channelData.items?.forEach((c: any) => {
              channelMap[c.id] = parseInt(c.statistics.subscriberCount || '0', 10);
            });

            // 4. Outlier Analysis for Tags
            const now = Date.now();
            const tagScores: Record<string, { score: number, count: number }> = {};

            videoData.items?.forEach((vid: any) => {
              const views = parseInt(vid.statistics.viewCount || '0', 10);
              const subs = channelMap[vid.snippet.channelId] || 1;
              const publishedAt = new Date(vid.snippet.publishedAt).getTime();
              const daysOld = Math.max((now - publishedAt) / (1000 * 3600 * 24), 1);
              
              const viewSubRatio = views / Math.max(subs, 1);
              const outlierScore = viewSubRatio / daysOld;

              const tags = vid.snippet.tags || [];
              tags.forEach((tag: string) => {
                const t = tag.toLowerCase().trim();
                if (!t) return;
                if (!tagScores[t]) tagScores[t] = { score: 0, count: 0 };
                // Add outlier score to the tag
                tagScores[t].score += outlierScore;
                tagScores[t].count += 1;
              });
            });

            // 5. Sort Tags by Score and get top 20
            const sortedTags = Object.keys(tagScores)
              .map(t => ({ tag: t, score: tagScores[t].score, count: tagScores[t].count }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 20)
              .map(t => t.tag);

            if (sortedTags.length > 0) {
              this.setCache(cacheKey, sortedTags);
              return sortedTags;
            }
          }
        } catch (e) {
          console.error("YouTube API Tags Outlier Strategy failed, falling back to Gemini:", e);
        }
      }

      // Fallback or Non-YouTube platforms (Gemini Estimation)
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        config: { responseMimeType: "application/json" },
        contents: `Provide 20 high-converting, highly accurate viral tags for topic "${topic}" on ${platform} in ${country} as a JSON string array.

STRICT CONTEXT LOCK (MANDATORY):
1. All tags MUST strictly and exclusively relate to the exact topic: "${topic}".
2. Do NOT generate unrelated or broad generic tags.

STRICT LANGUAGE OUTPUT MATCHING (MANDATORY):
1. Detect the exact language of "${topic}".
2. Generate ALL tags 100% in THAT EXACT SAME DETECTED LANGUAGE.
3. NEVER mix languages or use foreign seed keywords (e.g. no English tags if the topic is Arabic).
4. Return ONLY a valid JSON string array of 20 tags.`
      });
      const result = (JSON.parse(response.text || "[]") ?? []) as string[];
      this.setCache(cacheKey, result);
      return result;
    });
  }

  async correctAndEnhanceText(text: string, context: string, catchy: boolean): Promise<string> {
    return this.callWithRetry(async () => {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Rewrite and enhance this thumbnail text for maximum impact: "${text}". Context topic: "${context}". Catchy style: ${catchy}.
STRICT LANGUAGE LOCKING RULE: Automatically detect the language of "${text}" / "${context}". The enhanced text MUST be 100% in THAT SAME DETECTED LANGUAGE. Return ONLY the enhanced text.`
      });
      return response.text?.trim() || text;
    });
  }

  async generateThumbnail(prompt: string, text: string, psychology: string, font: string, size: string, type: string, includeText: boolean, referenceImage?: string | null): Promise<string> {
    return this.callWithRetry(async () => {
      const ai = this.getAI();
      let finalPrompt = `YouTube Thumbnail Scene: ${prompt}. Text overlay elements to display clearly: "${text}". Color Psychology & Mood: ${psychology}. Style: 4K, high contrast, vibrant cinematic lighting, trending YouTube thumbnail.`;

      if (referenceImage) {
        try {
          const visionRes = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: { parts: [
              { inlineData: { mimeType: referenceImage.split(';')[0].split(':')[1], data: referenceImage.split(',')[1] } },
              { text: "Describe this image in precise detail (subject, pose, clothing, colors, background). I will use this to generate a matching YouTube thumbnail." }
            ]}
          });
          const imgDesc = visionRes.text;
          finalPrompt = `Create a YouTube thumbnail based on this scene description: ${imgDesc}. Modify the scene by adding: ${prompt}. Text elements to include: "${text}". Color Psychology: ${psychology}. Style: Ultra HD, 4k, trending on YouTube.`;
        } catch (e) {
          console.warn("Vision model failed", e);
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: finalPrompt,
        config: { imageConfig: { aspectRatio: (size as any) || "16:9" } }
      });

      if (response.candidates?.[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return "";
    });
  }

  async evaluateThumbnail(imageUrl: string, prompt: string): Promise<ThumbnailEvaluation> {
    return this.callWithRetry(async () => {
      const ai = this.getAI();
      const base64Data = imageUrl.split(',')[1];
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: { parts: [{ inlineData: { mimeType: 'image/png', data: base64Data } }, { text: `Evaluate this thumbnail CTR potential. Prompt: ${prompt}. Return JSON.` }] },
        config: { responseMimeType: "application/json" }
      });
      const parsed = JSON.parse(response.text || "{}");
      return {
        score: parsed.score || 0,
        readability: parsed.readability || 0,
        visualImpact: parsed.visualImpact || 0,
        critique: parsed.critique || ""
      };
    });
  }

  private cleanAndParseJSON(text?: string): any {
    if (!text) return {};
    let str = text.trim();
    str = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    
    const firstBrace = str.indexOf('{');
    const firstBracket = str.indexOf('[');
    
    let startIdx = -1;
    let endIdx = -1;
    
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = str.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = str.lastIndexOf(']');
    }
    
    if (startIdx !== -1 && endIdx > startIdx) {
      str = str.substring(startIdx, endIdx + 1);
    }
    
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("JSON parse error:", e);
      return {};
    }
  }

  async getAudienceInsights(category: string, platform: Platform, country: string, days: number): Promise<AudienceInsight> {
    const cacheKey = `cache_audience_v2_${platform}_${country}_${category}_${days}`;
    const cached = this.getCache<AudienceInsight>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ytConfig = this.getPlatformConfig('youtube');
      const ytKey = ytConfig.youtube_key || ytConfig.youtube_key_2;

      if (platform === Platform.YOUTUBE && ytKey) {
        try {
          // 1. Search for top videos in the niche and region
          const searchRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(category)}&regionCode=${country !== 'Global' ? country : 'US'}&type=video&maxResults=25&order=viewCount&key=${ytKey}`
          );
          const searchData = await searchRes.json();

          if (searchData.items && searchData.items.length > 0) {
            const videoIds = searchData.items.map((item: any) => item.id?.videoId).filter(Boolean).join(',');
            
            // 2. Fetch details including contentDetails (duration) and statistics
            const videoRes = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${ytKey}`
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
                  `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${vid}&maxResults=15&order=relevance&key=${ytKey}`
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
            const prompt = `You are an elite YouTube Audience Analyst. Analyze this raw YouTube API data for topic "${category}" in region "${country}".
            
            CRITICAL DYNAMIC LANGUAGE MATCHING RULE:
            Automatically detect the language of category "${category}" (e.g. English, French, Arabic, Spanish, German, etc.).
            YOU MUST RETURN ALL TEXT FIELDS (ageRange, interests, audienceSize, engagementTimes, engagementTimesShorts, engagementTimesLong, contentFormats descriptions, topics, etc.) 100% IN THAT EXACT SAME DETECTED LANGUAGE.
            - If category is English -> Output 100% English (e.g. "Thu & Fri 6:00 PM - 9:00 PM", "18-35 years old", "1.2M active viewers").
            - If category is French -> Output 100% French.
            - If category is Arabic -> Output 100% Arabic.

            Video Data (Duration PT..S is usually Short, PT..M is Long. publishedAt shows when they post):
            ${JSON.stringify(videoAnalysis)}
            
            Audience Comments (Analyze their tone, pain points, and interests):
            ${JSON.stringify(allComments.slice(0, 40))}
            
            Total Active Niche Audience Size: ~${estimatedAudienceSize} views across top 25 videos.
            
            Task:
            1. Find the most common posting hours for Shorts vs Long videos based on 'publishedAt' fields.
            2. Infer the audience's age range, interests, and dominant countries based on the language/context of comments and region "${country}".
            3. Return ONLY a valid JSON matching this schema:
            {
              "demographics": {
                "ageRange": "age range string in detected language",
                "interests": ["interest 1", "interest 2"],
                "audienceSize": "audience size in detected language",
                "topCountries": ["Country 1", "Country 2"]
              },
              "engagementTimes": "General best posting time in detected language",
              "engagementTimesShorts": "e.g. 6:00 PM - 8:00 PM in detected language",
              "engagementTimesLong": "e.g. 2:00 PM - 4:00 PM in detected language",
              "contentFormats": [
                { "format": "Shorts", "performanceScore": 95, "description": "description in detected language" }
              ],
              "currentMonthTopics": [ { "topic": "topic name", "volume": "High" } ],
              "topSearchQueries": [ { "topic": "query", "competition": 80 } ]
            }`;

            const ai = this.getAI();
            const response = await ai.models.generateContent({
              model: "gemini-3.8-flash",
              config: { responseMimeType: "application/json" },
              contents: prompt
            });

            const parsed = this.cleanAndParseJSON(response.text);
            
            // Ensure fields exist
            const result: AudienceInsight = {
              demographics: {
                ageRange: parsed.demographics?.ageRange || "18-35",
                interests: parsed.demographics?.interests || [category],
                audienceSize: parsed.demographics?.audienceSize || `${estimatedAudienceSize}`,
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
        model: "gemini-3.8-flash",
        config: { 
          responseMimeType: "application/json"
        },
        contents: `Real-time audience insight analysis for topic "${category}" on ${platform} in ${country} over ${days} days. Include best posting times for Shorts/Reels vs Long videos, estimated audience size and top countries.
CRITICAL DYNAMIC LANGUAGE MATCHING RULE:
Automatically detect the language of category "${category}" (e.g. English, French, Arabic, Spanish). Output ALL text fields (demographics, engagementTimes, engagementTimesShorts, engagementTimesLong, contentFormats, topics, queries) strictly 100% in THAT SAME DETECTED LANGUAGE.
Schema: {"demographics": {"ageRange": "...", "interests": ["..."], "audienceSize": "...", "topCountries": ["..."]}, "engagementTimes": "...", "engagementTimesShorts": "...", "engagementTimesLong": "...", "contentFormats": [{"format": "...", "performanceScore": 90, "description": "..."}], "currentMonthTopics": [{"topic": "...", "volume": "..."}], "topSearchQueries": [{"topic": "...", "competition": 90}]}`
      });

      const parsed = this.cleanAndParseJSON(response.text);
      this.setCache(cacheKey, parsed);
      return parsed as AudienceInsight;
    });
  }

  async auditVideoContent(videoInput: string, platforms: Platform[]): Promise<VideoAuditResult> {
    const targetPlatform = platforms && platforms.length > 0 ? platforms[0] : Platform.YOUTUBE;
    const cacheKey = `cache_audit_${targetPlatform}_${videoInput}`;
    const cached = this.getCache<VideoAuditResult>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        config: { responseMimeType: "application/json" },
        contents: `SEO Audit for video: ${videoInput}. Return JSON.`
      });
      const parsed = JSON.parse(response.text || "{}");
      const result = {
        optimizationPlan: parsed.optimizationPlan || [],
        criticalFlaws: parsed.criticalFlaws || [],
        seoScore: parsed.seoScore || 0,
        engagementPotential: parsed.engagementPotential || 0,
        retentionEstimate: parsed.retentionEstimate || "",
        platformStandardsMatch: parsed.platformStandardsMatch || []
      };
      this.setCache(cacheKey, result);
      return result;
    });
  }

  async analyzeCompetitor(url: string, platforms: Platform[]): Promise<EnhancedCompetitorData[]> {
    const targetPlatform = platforms && platforms.length > 0 ? platforms[0] : Platform.YOUTUBE;
    const cacheKey = `cache_competitor_${targetPlatform}_${url}`;
    const cached = this.getCache<EnhancedCompetitorData[]>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {

      // Fetch saved platform keys from settings
      const ytConfig = this.getPlatformConfig('youtube');
      const googleConfig = this.getPlatformConfig('google_search');
      const tiktokConfig = this.getPlatformConfig('tiktok');
      const metaConfig = this.getPlatformConfig('meta');
      const pinConfig = this.getPlatformConfig('pinterest');

      const ytKey = ytConfig.youtube_key || ytConfig.youtube_key_2;
      const googleToken = googleConfig.google_token;
      const tiktokSecret = tiktokConfig.tiktok_secret;
      const metaToken = metaConfig.meta_token;
      const pinToken = pinConfig.pinterest_token;

      let liveContext = "";
      let fetchedVideoTitle = "";
      let fetchedChannelName = "";

      // Helper function to extract YouTube video ID
      const extractVideoId = (inputUrl: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = inputUrl.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };

      const videoId = extractVideoId(url);

      // Perform live YouTube Data API call if video ID or channel URL and key exists
      if (ytKey && (targetPlatform === Platform.YOUTUBE || targetPlatform === Platform.GOOGLE || videoId)) {
        if (videoId) {
          try {
            // 1. Fetch Video Snippet & Statistics
            const vidRes = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${ytKey}`
            );
            const vidData = await vidRes.json();

            if (vidData.items && vidData.items.length > 0) {
              const item = vidData.items[0];
              fetchedVideoTitle = item.snippet?.title || "";
              fetchedChannelName = item.snippet?.channelTitle || "";

              const videoDetails = {
                title: item.snippet?.title,
                channelTitle: item.snippet?.channelTitle,
                description: item.snippet?.description,
                publishedAt: item.snippet?.publishedAt,
                tags: item.snippet?.tags || [],
                views: item.statistics?.viewCount,
                likes: item.statistics?.likeCount,
                commentCount: item.statistics?.commentCount
              };

              liveContext += `\n[LIVE YOUTUBE VIDEO DATA V3]:\n` + JSON.stringify(videoDetails);

              // 2. Fetch Top Comments & Questions
              try {
                const commentRes = await fetch(
                  `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=30&order=relevance&key=${ytKey}`
                );
                const commentData = await commentRes.json();

                if (commentData.items && commentData.items.length > 0) {
                  const commentsList = commentData.items.map((c: any) => {
                    const top = c.snippet?.topLevelComment?.snippet;
                    return {
                      author: top?.authorDisplayName,
                      text: top?.textDisplay,
                      likeCount: top?.likeCount
                    };
                  });
                  liveContext += `\n[LIVE USER COMMENTS FROM VIDEO]:\n` + JSON.stringify(commentsList);
                }
              } catch (cmtErr) {
                console.warn("YouTube comments API fetch error:", cmtErr);
              }
            }
          } catch (err) {
            console.warn("YouTube Video API fetch error:", err);
          }
        } else {
          // Attempt search on YouTube for URL/keyword if it's a channel or keyword
          try {
            const searchRes = await fetch(
              `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(url)}&type=video&maxResults=5&order=relevance&key=${ytKey}`
            );
            const searchData = await searchRes.json();
            if (searchData.items && searchData.items.length > 0) {
              liveContext += `\n[YOUTUBE SEARCH RESULTS FOR "${url}"]:\n` + JSON.stringify(searchData.items);
            }
          } catch (srchErr) {
            console.warn("YouTube Search API fetch error:", srchErr);
          }
        }
      }

      // Add connected keys info to context
      const activeKeysList = [];
      if (ytKey) activeKeysList.push(`YouTube API Key Connected (${ytKey.substring(0, 6)}...)`);
      if (googleToken) activeKeysList.push(`Google Search Token Connected (${googleToken.substring(0, 6)}...)`);
      if (tiktokSecret) activeKeysList.push(`TikTok Secret Connected`);
      if (metaToken) activeKeysList.push(`Meta Access Token Connected`);
      if (pinToken) activeKeysList.push(`Pinterest Token Connected`);

      if (activeKeysList.length > 0) {
        liveContext += `\n[CONNECTED SETTINGS API KEYS]: ${activeKeysList.join(', ')}`;
      }

      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                competitorName: { type: Type.STRING },
                topKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                topTitles: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                engagementRate: { type: Type.NUMBER },
                recentViralCount: { type: Type.NUMBER },
                lastUpdated: { type: Type.STRING },
                whatWasSaid: { type: Type.STRING },
                hashtags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                algoReason: { type: Type.STRING },
                audienceQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                counterAttack: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                },
                competitorScript: { type: Type.STRING }
              },
              required: [
                "platform",
                "competitorName",
                "topKeywords",
                "topTitles",
                "engagementRate",
                "recentViralCount",
                "lastUpdated",
                "whatWasSaid",
                "hashtags",
                "algoReason",
                "audienceQuestions",
                "counterAttack",
                "competitorScript"
              ]
            }
          }
        },
        contents: `Analyze competitor video/channel URL: "${url}" on platform "${targetPlatform}".
Use the live API video data, video description, and actual user comments provided below to extract exact competitor insights.

STRICT INPUT-DRIVEN LANGUAGE MATCHING RULE:
Automatically detect the language of the video title/content/URL.
YOU MUST RETURN ALL TEXT FIELDS (competitorName, audienceQuestions, hashtags, whatWasSaid, algoReason, counterAttack) 100% IN THAT EXACT SAME DETECTED LANGUAGE.
- If competitor content is English -> All fields 100% English.
- If competitor content is French -> All fields 100% French.
- If competitor content is Arabic -> All fields 100% Arabic.
Do NOT mix languages under any circumstances.

Specifically:
1. "competitorName": The name of the channel or creator.
2. "audienceQuestions": Extract 3-5 real recurring questions or unanswered doubts asked by viewers in the comments.
3. "hashtags": Extract or generate top relevant hashtags (e.g. ["#tag1", "#tag2"]).
4. "whatWasSaid": A rich 3-4 sentence summary of what the competitor covered/said in this video.
5. "algoReason": Why YouTube/platform algorithms favored this video (e.g. high retention hook, curiosity-driven title).
6. "counterAttack": First, analyze the competitor's title strengths/weaknesses. Then, generate a superior title and detailed SEO description that answers the audience's unanswered questions.
   CRITICAL TITLE RULES:
   - NEVER start with generic/repetitive words like "دليل" (Guide), "شرح شامل" (Comprehensive explanation), or "كورس" (Course).
   - Focus directly on the core benefit, solution, or smart curiosity.
   - Max length: 50-60 characters (must fit entirely on mobile screens).
   - Language: Must perfectly match the detected language.
7. "competitorScript": A highly engaging video script (hook, intro, body, outro) designed to compete directly with this video. It must naturally use the same keywords that made the competitor viral and exploit their content gaps.

${liveContext}

Return JSON array with 1 item containing exact EnhancedCompetitorData.`
      });

      const parsedArray = this.cleanAndParseJSON(response.text);

      let item: any = Array.isArray(parsedArray) && parsedArray.length > 0 ? parsedArray[0] : parsedArray;

      if (!item || typeof item !== 'object') {
        item = {};
      }

      const detectedLang = this.detectLanguage(fetchedVideoTitle || url);
      const isAr = detectedLang === 'Arabic';
      const isFr = detectedLang === 'French';

      const defaultCompetitorName = isAr
        ? (url.includes('youtube') ? 'قناة منافسة على يوتيوب' : 'منافس استراتيجي')
        : isFr
        ? (url.includes('youtube') ? 'Chaîne YouTube concurrente' : 'Concurrent stratégique')
        : (url.includes('youtube') ? 'Competitor YouTube Channel' : 'Strategic Competitor');

      const competitorName = item.competitorName || fetchedChannelName || defaultCompetitorName;

      const defaultAudienceQuestions = isAr ? [
        `كيف يمكن تطبيق الخطوات المذكورة في الفيديو بشكل عملي ومجاني؟`,
        `ما هي أفضل البدائل المتاحة إذا لم أستطع الاستفادة من هذه الأداة؟`,
        `هل هذه الطريقة مضمونة وتعمل في جميع الدول العربية بدون مشكلات؟`,
        `ما هي الرسوم الإضافية المتوقعة أو الشروط الخفية؟`
      ] : isFr ? [
        `Comment appliquer les étapes mentionnées dans la vidéo gratuitement ?`,
        `Quelles sont les meilleures alternatives à cet outil ?`,
        `Cette méthode fonctionne-t-elle sans frais cachés ?`,
        `Comment obtenir des résultats rapidement sans expérience préalable ?`
      ] : [
        `How can I apply the steps shown in this video for free?`,
        `What are the best alternative tools if this is not available?`,
        `Does this strategy work worldwide without hidden fees?`,
        `How to scale this step-by-step for beginners?`
      ];

      const audienceQuestions = (Array.isArray(item.audienceQuestions) && item.audienceQuestions.length > 0)
        ? item.audienceQuestions
        : defaultAudienceQuestions;

      const defaultHashtags = isAr
        ? [`#${competitorName.replace(/\s+/g, '_')}`, `#سيو`, `#تسويق_رقمي`, `#زيادة_المشاهدات`, `#تريند`]
        : isFr
        ? [`#${competitorName.replace(/\s+/g, '_')}`, `#SEO`, `#MarketingDigital`, `#YouTubeFrance`, `#Tendance`]
        : [`#${competitorName.replace(/\s+/g, '_')}`, `#SEO`, `#DigitalMarketing`, `#YouTubeGrowth`, `#Trending`];

      const hashtags = (Array.isArray(item.hashtags) && item.hashtags.length > 0)
        ? item.hashtags
        : defaultHashtags;

      const defaultKeywords = isAr
        ? [`استراتيجية المنافس`, `تحليل الفيديو`, `ثغرات التعليقات`, `سيو YOUTUBE`]
        : isFr
        ? [`Stratégie concurrent`, `Analyse vidéo`, `Mots-clés SEO`, `YouTube SEO`]
        : [`Competitor Strategy`, `Video Analysis`, `Comment Gaps`, `YouTube SEO`];

      const topKeywords = (Array.isArray(item.topKeywords) && item.topKeywords.length > 0)
        ? item.topKeywords
        : defaultKeywords;

      const defaultTitles = isAr
        ? [fetchedVideoTitle || `أسرار نجاح فيديو المنافس`, `كيف تصدر المنافس محركات البحث`]
        : isFr
        ? [fetchedVideoTitle || `Les secrets de la vidéo concurrente`, `Comment dominer les résultats de recherche`]
        : [fetchedVideoTitle || `Secrets Behind Competitor Success`, `How Competitor Ranked on Top`];

      const topTitles = (Array.isArray(item.topTitles) && item.topTitles.length > 0)
        ? item.topTitles
        : defaultTitles;

      const whatWasSaid = item.whatWasSaid || (isAr
        ? (fetchedVideoTitle ? `قدم المنافس في فيديو "${fetchedVideoTitle}" شرحاً مفصلاً يركز على استراتيجيات النمو والانتشار، مع تقديم أمثلة تطبيقية وحلول للمشكلات الشائعة التي تواجه المتابعين.` : `قام المنافس بتقديم محتوى مكثف يغطي أبرز استراتيجيات النجاح والتفاعل، ركز خلاله على جذب انتباه المشاهد من الثواني الأولى وإعطاء نصائح مباشرة.`)
        : isFr
        ? (fetchedVideoTitle ? `Dans la vidéo "${fetchedVideoTitle}", le concurrent explique des stratégies de croissance pratiques et répond aux besoins de son audience.` : `Le concurrent a présenté une vidéo engageante avec des conseils concrets et des astuces d'optimisation.`)
        : (fetchedVideoTitle ? `In the video "${fetchedVideoTitle}", the competitor highlighted key growth strategies, practical examples, and actionable advice.` : `The competitor shared actionable tactics and high-retention frameworks to engage viewers.`));

      const algoReason = item.algoReason || (isAr
        ? `معدل احتفاظ مرتفع بالمشاهدين بسبب بداية مشوقة (Hook) وتفاعل نشط في قسم التعليقات.`
        : isFr
        ? `Taux de rétention élevé grâce à une accroche puissante et un engagement fort dans les commentaires.`
        : `High viewer retention driven by a curiosity hook and active community engagement in the comments.`);

      const counterAttack = {
        title: item.counterAttack?.title || (isAr
          ? `السر المخفي: ما لم يخبرك به المنافس (خطوة بخطوة)`
          : isFr
          ? `Le Secret Caché: Ce Qu'ils Ne Vous Disent Pas`
          : `Hidden Secret: What the Competitor Left Out`),
        description: item.counterAttack?.description || (isAr
          ? `في هذا الفيديو نجيب حصرياً على جميع الأسئلة والتساؤلات التي غفل عنها المنافس في فيديو ${fetchedVideoTitle || 'المنافس'}، ونقدم لك خطوات عمل بديلة ومجانية 100% تناسب المبتدئين بالكامل.`
          : isFr
          ? `Dans cette vidéo, nous répondons à toutes les questions sans réponse de la vidéo ${fetchedVideoTitle || 'du concurrent'} avec un guide 100% gratuit et pratique.`
          : `In this video, we answer all the unanswered questions from ${fetchedVideoTitle || 'the competitor video'} with a step-by-step free action plan.`)
      };

      const defaultScript = isAr
        ? `[الخطاف]: هل شاهدت فيديو "${fetchedVideoTitle}" ولا زلت تبحث عن الطريقة المجانية الكاملة؟ \n[المقدمة]: في هذا الفيديو سأكشف لك الثغرات التي لم يتحدث عنها أحد وكيف تتجنب الخسارة.\n[المحتوى]: (استخدم كلمات المنافس هنا) بدلاً من الدفع، سنقوم بـ...\n[الخاتمة]: لا تنس الاشتراك وتفعيل الجرس للمزيد من الأسرار!`
        : isFr
        ? `[Accroche]: Avez-vous vu la vidéo "${fetchedVideoTitle}" mais vous cherchez toujours la méthode gratuite ?\n[Intro]: Aujourd'hui, je révèle les secrets qu'ils ont cachés.\n[Corps]: (Utilisez les mots-clés du concurrent) Au lieu de payer, nous allons...\n[Outro]: Abonnez-vous pour plus d'astuces !`
        : `[Hook]: Did you watch "${fetchedVideoTitle}" but still couldn't figure out the free method?\n[Intro]: Today I'm exposing the gaps they missed.\n[Body]: (Use competitor keywords here) Instead of paying, we will...\n[Outro]: Subscribe for more hidden secrets!`;

      const competitorScript = item.competitorScript || defaultScript;

      const resultObj: EnhancedCompetitorData = {
        platform: targetPlatform,
        competitorName,
        topKeywords,
        topTitles,
        engagementRate: typeof item.engagementRate === 'number' ? item.engagementRate : 8.7,
        recentViralCount: typeof item.recentViralCount === 'number' ? item.recentViralCount : 5,
        lastUpdated: new Date().toLocaleDateString('ar-EG'),
        whatWasSaid,
        hashtags,
        algoReason,
        audienceQuestions,
        counterAttack,
        competitorScript
      };

      const result = [resultObj];
      this.setCache(cacheKey, result);
      return result;
    });
  }

  async checkContentGap(trendTitle: string, lang: string = 'ar'): Promise<GapAnalysis> {
    const cacheKey = `cache_gap_v3_${trendTitle}_${lang}`;
    const cached = this.getCache<GapAnalysis>(cacheKey);
    if (cached) return cached;

    return this.callWithRetry(async () => {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isGap: { type: Type.BOOLEAN },
              message: { type: Type.STRING },
              urgency: { type: Type.STRING },
              exploitKeywords: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedTitle: { type: Type.STRING },
              suggestedDesc: { type: Type.STRING }
            },
            required: ["isGap", "message", "urgency", "exploitKeywords", "suggestedTitle", "suggestedDesc"]
          }
        },
        contents: `Is there a content gap for "${trendTitle}"? You are an elite SEO marketer.
Provide highly relevant exploit keywords with high search volume and low competition related exclusively to this topic.

FORMATTING RULES:
1. suggestedTitle MUST be formatted exactly as: [General Keyword related to topic] + [Specific Keyword about the topic]. It must be highly optimized for click-through rate.
2. suggestedDesc MUST be formatted exactly in the structure favored by the YouTube algorithm. You MUST USE this exact visual layout template:

[Strong hook in 2 lines utilizing the extracted exploit keywords directly]

${lang === 'ar' ? '⏱️ فصول الفيديو:' : '⏱️ Video Chapters:'}
00:00 - ${lang === 'ar' ? 'المقدمة' : 'Introduction'}
[add 3-4 more timestamps]

${lang === 'ar' ? '🔗 روابط هامة:' : '🔗 Important Links:'}
[${lang === 'ar' ? 'رابط 1' : 'Link 1'}]
[${lang === 'ar' ? 'رابط 2' : 'Link 2'}]

#hashtag1 #hashtag2 #hashtag3

CRITICAL DYNAMIC LANGUAGE MATCHING RULE: The application language is set to ${lang === 'ar' ? 'Arabic' : 'English'}. YOU MUST RETURN ALL TEXT FIELDS (message, urgency, exploitKeywords, suggestedTitle, suggestedDesc) strictly 100% in ${lang === 'ar' ? 'Arabic' : 'English'}. Do NOT mix languages.`
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
  }

  getUsageStats(): APIUsageStats {
    const used = parseInt(localStorage.getItem('gemini_api_used_count') || '0');
    return { usedTokens: used, limit: this.usageLimit, percentage: (used / this.usageLimit) * 100 };
  }

  clearKeyCache() {
    localStorage.clear();
    window.location.reload();
  }

  async analyzeMockupPlacement(imageUrl: string, prompt: string): Promise<{ymin: number, xmin: number, ymax: number, xmax: number} | null> {
    try {
      return await this.callWithRetry(async () => {
        const ai = this.getAI();
        const base64Data = imageUrl.split(',')[1];
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: { parts: [
              { inlineData: { mimeType: 'image/png', data: base64Data } }, 
              { text: `The user wants to place a logo/design based on this scene prompt: "${prompt}". Identify the exact bounding box in the image where this design should be printed (e.g., the chest of the specific character's shirt, a mug, a billboard, etc. as described). Return ONLY a valid JSON object with normalized bounding box coordinates (values between 0.0 and 1.0). Format exactly like this: {"ymin": 0.3, "xmin": 0.4, "ymax": 0.5, "xmax": 0.6}. Do not include markdown blocks, backticks, or any other text.` }
          ] }
        });
        const text = response.text || "";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        return null;
      });
    } catch (e) {
      console.warn("Placement AI failed, falling back to math", e);
      return null;
    }
  }

  async generateMockupDescription(imageUrl: string): Promise<string> {
    try {
      return await this.callWithRetry(async () => {
        const ai = this.getAI();
        const base64Data = imageUrl.split(',')[1];
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: { parts: [
              { inlineData: { mimeType: 'image/png', data: base64Data } }, 
              { text: `You are an SEO E-commerce expert. Write an attractive, SEO-optimized product description for the item in this image (in Arabic). The description must include keywords that help this product rank in search results. Keep it to 1-2 strong sentences highlighting the print quality and the design subject.` }
          ] }
        });
        return response.text || "تم تطبيق التصميم بنجاح على المنتج.";
      });
    } catch (e) {
      return "تم دمج التصميم بنجاح (الوصف التلقائي غير متاح حالياً بسبب ضغط الشبكة).";
    }
  }
}
