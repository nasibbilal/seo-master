
import { GoogleGenAI, Type } from "@google/genai";
import { Platform, KeywordMetric, APIUsageStats, CompetitorData, RadarInsight, ThumbnailEvaluation, AudienceInsight, ChannelMetadata, CommentGapInsight } from "../types";

// استخدام المفتاح الرئيسي الموحد من بيئة التشغيل لضمان عمل كافة الوظائف
const GEMINI_API_KEY = process.env.API_KEY;

export class GeminiService {
  private usageLimit = 1500;
  private currentChannelId = localStorage.getItem('active_channel') || 'channel1';

  private getAI(): GoogleGenAI {
    return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  private getSystemPersona(): string {
    return `بصفتك خبير SEO ومحلل خوارزميات محترف لست منصات (YouTube, TikTok, Instagram, Facebook, Pinterest, Google). 
    مهمتك هي تحليل البيانات بعمق، كشف فجوات المحتوى، وصياغة استراتيجيات تصدر نتائج البحث. 
    يجب أن تكون نبرتك احترافية، تحفيزية، ومباشرة. ركز على زيادة المشاهدات وتخطي حاجز الـ 1000 مشترك/متابع فوراً.
    تعتمد في تحليلاتك على البيانات اللحظية والحقيقية المتوفرة عبر أدوات البحث المتصلة.`;
  }

  setChannel(channelId: string) {
    this.currentChannelId = channelId;
    localStorage.setItem('active_channel', channelId);
  }

  getActiveChannelId(): string {
    return this.currentChannelId;
  }

  getChannels(): ChannelMetadata[] {
    try {
      const channels = localStorage.getItem('seomaster_channels');
      if (!channels || channels === "undefined") {
        return [
          { id: 'channel1', name: 'المشروع الأول' },
          { id: 'channel2', name: 'المشروع الثاني' },
          { id: 'channel3', name: 'المشروع الثالث' }
        ];
      }
      return JSON.parse(channels);
    } catch (e) {
      console.error("Error parsing channels from localStorage", e);
      return [{ id: 'channel1', name: 'المشروع الأول' }];
    }
  }

  saveChannels(channels: ChannelMetadata[]) {
    localStorage.setItem('seomaster_channels', JSON.stringify(channels));
  }

  private trackUsage() {
    const used = parseInt(localStorage.getItem('gemini_api_used_count') || '0') + 1;
    localStorage.setItem('gemini_api_used_count', used.toString());
    const stats = this.getUsageStats();
    window.dispatchEvent(new CustomEvent('gemini_usage_updated', { detail: stats }));
  }

  getUsageStats(): APIUsageStats {
    try {
      const used = parseInt(localStorage.getItem('gemini_api_used_count') || '0');
      return {
        usedTokens: used,
        limit: this.usageLimit,
        percentage: Math.min(100, (used / this.usageLimit) * 100)
      };
    } catch (e) {
      return { usedTokens: 0, limit: 1500, percentage: 0 };
    }
  }

  async huntCommentGaps(competitorId: string, platform: Platform): Promise<CommentGapInsight> {
    this.trackUsage();
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: this.getSystemPersona(),
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            competitorId: { type: Type.STRING },
            platform: { type: Type.STRING },
            recurringQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            unmetNeeds: { type: Type.ARRAY, items: { type: Type.STRING } },
            blueprint: {
              type: Type.OBJECT,
              properties: {
                magneticTitle: { type: Type.STRING },
                hook: { type: Type.STRING },
                algorithmImpact: { type: Type.STRING },
                targetQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["magneticTitle", "hook", "algorithmImpact", "targetQuestions"]
            }
          },
          required: ["recurringQuestions", "unmetNeeds", "blueprint"]
        }
      },
      contents: `باستخدام البحث المباشر، حلل آخر التفاعلات والتعليقات للمنافس "${competitorId}" على ${platform}. استخرج الأسئلة المكررة التي يتجاهلها، وصغ خطة فيديو قوية تتفوق عليهم.`
    });
    return JSON.parse(response.text || '{}');
  }

  async generateWeeklyReportData(channelName: string, category: string): Promise<any> {
    this.trackUsage();
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: this.getSystemPersona(),
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
            contentGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  competitorSuccess: { type: Type.STRING },
                  userMissingAction: { type: Type.STRING }
                }
              }
            },
            topRecurringQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            geminiAdvice: { type: Type.STRING }
          },
          required: ["topTrends", "contentGaps", "topRecurringQuestions", "geminiAdvice"]
        }
      },
      contents: `ولد تقريراً أسبوعياً حقيقياً لـ "${channelName}" في مجال "${category}". استخرج أهم 3 تريندات، فجوات المحتوى الحالية، وأكثر أسئلة الجمهور تكراراً هذا الأسبوع.`
    });
    return JSON.parse(response.text || '{}');
  }

  getPlatformConfig(platform: string) {
    try {
      const config = localStorage.getItem(`config_${platform.toLowerCase()}_${this.currentChannelId}`);
      return config ? JSON.parse(config) : {};
    } catch (e) {
      return {};
    }
  }

  updatePlatformConfig(platform: string, config: any) {
    localStorage.setItem(`config_${platform.toLowerCase()}_${this.currentChannelId}`, JSON.stringify(config));
  }

  async fetchRadarTrends(category: string, country: string): Promise<RadarInsight[]> {
    this.trackUsage();
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: this.getSystemPersona(),
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
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
              priority: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["id", "platform", "title", "growthPercentage", "priority"]
          }
        }
      },
      contents: `باستخدام محرك البحث، رصد أحدث التريندات والهاشتاقات الفيروسية لـ "${category}" في "${country}". ركز على المواضيع الصاعدة بقوة في آخر 24 ساعة.`
    });
    return JSON.parse(response.text || '[]');
  }

  async analyzeCompetitor(competitorId: string, platforms: Platform[]): Promise<CompetitorData[]> {
    this.trackUsage();
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: this.getSystemPersona(),
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING },
              competitorName: { type: Type.STRING },
              topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              topTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
              engagementRate: { type: Type.NUMBER },
              recentViralCount: { type: Type.NUMBER },
              lastUpdated: { type: Type.STRING },
              swot: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            required: ["platform", "competitorName", "topKeywords", "topTitles", "engagementRate", "swot"]
          }
        }
      },
      contents: `قم بإجراء مسح حقيقي للمنافس "${competitorId}" عبر المنصات: ${platforms.join(', ')}. استخرج أرقام المشاهدات والكلمات المفتاحية والعناوين الأكثر نجاحاً لديهم حالياً.`
    });
    return JSON.parse(response.text || '[]');
  }

  async generatePlatformContent(keywords: string[], platform: Platform, topic: string): Promise<{ title: string, description: string }> {
    this.trackUsage();
    const ai = this.getAI();
    
    let algoInstructions = "";
    switch(platform) {
      case Platform.YOUTUBE: algoInstructions = `يوتيوب: Hook أولاً، كلمات مفتاحية في أول 200 حرف، Chapters، 3 هاشتاقات.`; break;
      case Platform.TIKTOK: algoInstructions = `تيك توك: وصف قصير جداً، Emojis، 5 هاشتاقات فيروسية.`; break;
      case Platform.GOOGLE: algoInstructions = `جوجل: 160 حرفاً، حل مباشر للمشكلة، CTA قوي.`; break;
      case Platform.INSTAGRAM: algoInstructions = `إنستقرام: سطر أول صاعق، مسافات، سؤال تفاعلي، هاشتاقات في الأسفل.`; break;
      case Platform.PINTEREST: algoInstructions = `بينتريست: كلمات مدمجة في جمل ملهمة، نبرة تعليمية.`; break;
      default: algoInstructions = `وصف جذاب مهيأ للسيو.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: { 
        systemInstruction: this.getSystemPersona(),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
          required: ["title", "description"]
        }
      },
      contents: `الموضوع: ${topic}. الكلمات: ${keywords.join(', ')}. المنصة: ${platform}. الترتيب المطلوب: ${algoInstructions}`
    });
    return JSON.parse(response.text || '{"title": "", "description": ""}');
  }

  async analyzeKeywords(query: string, platform: Platform, country: string = 'GLOBAL'): Promise<KeywordMetric[]> {
    this.trackUsage();
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: { 
        systemInstruction: this.getSystemPersona(),
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              searchVolume: { type: Type.STRING },
              audienceSize: { type: Type.STRING },
              competition: { type: Type.NUMBER },
              strength: { type: Type.NUMBER },
              trend: { type: Type.STRING },
              googleScore: { type: Type.NUMBER },
              youtubeScore: { type: Type.NUMBER }
            },
            required: ["keyword", "searchVolume", "audienceSize", "competition", "strength", "trend"]
          }
        }
      },
      contents: `حلل الكلمات المفتاحية الحقيقية لـ "${query}" في "${country}" على منصة ${platform}. تأكد من جلب بيانات دقيقة لحجم البحث وقوة التصدر.`
    });
    return JSON.parse(response.text || '[]');
  }

  async generateTags(topic: string, platform: Platform, country: string): Promise<string[]> {
    this.trackUsage();
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: { 
        systemInstruction: this.getSystemPersona(),
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      },
      contents: `ولد قائمة وسوم (Tags) فيروسية حقيقية لموضوع "${topic}" على منصة ${platform} في "${country}".`
    });
    try {
      const parsed = JSON.parse(response.text || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  async correctAndEnhanceText(text: string, prompt: string, addCatchyTitle: boolean): Promise<string> {
    this.trackUsage();
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: { systemInstruction: this.getSystemPersona() },
      contents: `حسن هذا النص العربي لزيادة الجذب (CTR): "${text}" المتعلق بـ "${prompt}".`
    });
    return response.text?.trim() || text;
  }

  async generateThumbnail(prompt: string, text: string, psychology: string, font: string, size: string, type: string, includeText: boolean): Promise<string> {
    this.trackUsage();
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Create a high-impact ${type} for prompt: ${prompt}. Psychology: ${psychology}. Font: ${font}.` }]
      },
      config: { imageConfig: { aspectRatio: size as any } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    throw new Error("فشل توليد الصورة");
  }

  async evaluateThumbnail(imageUrl: string, prompt: string): Promise<ThumbnailEvaluation> {
    this.trackUsage();
    const ai = this.getAI();
    const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error("صورة غير صالحة");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: matches[2], mimeType: matches[1] } },
          { text: `كخبير سيو، قيم هذه الصورة المصغرة لموضوع "${prompt}".` }
        ]
      },
      config: {
        systemInstruction: this.getSystemPersona(),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { score: { type: Type.NUMBER }, readability: { type: Type.NUMBER }, visualImpact: { type: Type.NUMBER }, critique: { type: Type.STRING } },
          required: ["score", "readability", "visualImpact", "critique"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async testConnection(platform: string, config: any): Promise<{ success: boolean; message?: string }> {
    return { success: true };
  }

  async checkContentGap(trendTitle: string): Promise<{ isGap: boolean; message: string; urgency: string }> {
    this.trackUsage();
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: this.getSystemPersona(),
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: { isGap: { type: Type.BOOLEAN }, message: { type: Type.STRING }, urgency: { type: Type.STRING } },
          required: ["isGap", "message", "urgency"]
        }
      },
      contents: `هل توجد فجوة محتوى حقيقية في موضوع "${trendTitle}" حالياً؟`
    });
    return JSON.parse(response.text || '{"isGap": false, "message": "", "urgency": "low"}');
  }

  async getAudienceInsights(category: string, platform: Platform, country: string, daysCount: number): Promise<AudienceInsight> {
    this.trackUsage();
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: { 
        systemInstruction: this.getSystemPersona(),
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            demographics: {
              type: Type.OBJECT,
              properties: { ageRange: { type: Type.STRING }, interests: { type: Type.ARRAY, items: { type: Type.STRING } } },
              required: ["ageRange", "interests"]
            },
            engagementTimes: { type: Type.STRING },
            contentFormats: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { format: { type: Type.STRING }, performanceScore: { type: Type.NUMBER }, description: { type: Type.STRING } },
                required: ["format", "performanceScore", "description"]
              }
            },
            currentMonthTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { topic: { type: Type.STRING }, volume: { type: Type.STRING } },
                required: ["topic", "volume"]
              }
            },
            topSearchQueries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { topic: { type: Type.STRING }, competition: { type: Type.NUMBER } },
                required: ["topic", "competition"]
              }
            }
          },
          required: ["demographics", "engagementTimes", "contentFormats", "currentMonthTopics", "topSearchQueries"]
        }
      },
      contents: `حلل الجمهور الحقيقي المهتم بـ "${category}" على ${platform} في "${country}".`
    });
    return JSON.parse(response.text || '{}');
  }
}
