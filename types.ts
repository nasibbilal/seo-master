
export enum Platform {
  GOOGLE = 'GOOGLE',
  YOUTUBE = 'YOUTUBE',
  FACEBOOK = 'FACEBOOK',
  TIKTOK = 'TIKTOK',
  INSTAGRAM = 'INSTAGRAM',
  PINTEREST = 'PINTEREST',
  AMAZON = 'AMAZON',
  ETSY = 'ETSY',
  REDBUBBLE = 'REDBUBBLE',
  TEESPRING = 'TEESPRING',
  GUMROAD = 'GUMROAD'
}

export type ThemeColor = 'red' | 'blue' | 'purple';

export interface VideoBlueprint {
  magneticTitle: string;
  hook: string;
  algorithmImpact: string;
  targetQuestions: string[];
}

export interface CommentGapInsight {
  competitorId: string;
  platform: Platform;
  recurringQuestions: string[];
  unmetNeeds: string[];
  blueprint: VideoBlueprint;
}

export interface ReportSettings {
  enabled: boolean;
  email: string;
  scheduleDay: string;
  lastSent?: string;
}

export interface ChannelMetadata {
  id: string;
  name: string;
  youtubeId?: string;
  youtubeKey?: string;
  metaToken?: string;
  tiktokSecret?: string;
  reportSettings?: ReportSettings;
}

export interface KeywordMetric {
  keyword: string;
  searchVolume: string;
  competition: number;
  strength: number;
  trend: 'up' | 'down' | 'stable';
  googleScore?: number;
  youtubeScore?: number;
  sourcePlatform?: Platform;
  audienceSize?: string;
  commissionRate?: string;
  productLink?: string;
}

export interface RadarInsight {
  id: string;
  platform: Platform;
  title: string;
  growthPercentage: number;
  isCovered: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  thumbnail?: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorData {
  platform: Platform;
  competitorName: string;
  topKeywords: string[];
  topTitles: string[];
  engagementRate: number;
  recentViralCount: number;
  lastUpdated: string;
  swot?: SwotAnalysis;
  commentGaps?: CommentGapInsight;
}

export interface APIUsageStats {
  usedTokens: number;
  limit: number;
  percentage: number;
}

export interface ThumbnailEvaluation {
  score: number;
  readability: number;
  visualImpact: number;
  critique: string;
}

export interface AudienceInsight {
  demographics: {
    ageRange: string;
    interests: string[];
  };
  engagementTimes: string;
  contentFormats: {
    format: string;
    performanceScore: number;
    description: string;
  }[];
  currentMonthTopics: {
    topic: string;
    volume: string;
  }[];
  topSearchQueries: {
    topic: string;
    competition: number;
  }[];
}

export const CATEGORIES = [
  { id: 'education', name: 'تعليم', icon: '🎓' },
  { id: 'science', name: 'علوم', icon: '🧪' },
  { id: 'tech', name: 'تقنية', icon: '💻' },
  { id: 'comedy', name: 'كوميديا', icon: '😂' },
  { id: 'gaming', name: 'ألعاب', icon: '🎮' },
  { id: 'sports', name: 'رياضة', icon: '⚽' },
  { id: 'travel', name: 'سفر', icon: '✈️' },
  { id: 'animals', name: 'حيوانات', icon: '🐾' },
  { id: 'entertainment', name: 'ترفيه', icon: '🎭' },
  { id: 'blogs', name: 'مدونات', icon: '📝' },
  { id: 'politics', name: 'سياسة', icon: '⚖️' },
  { id: 'fashion', name: 'موضة', icon: '👗' },
  { id: 'movies', name: 'أفلام', icon: '🎬' },
  { id: 'music', name: 'موسيقى', icon: '🎵' },
  { id: 'community', name: 'أنشطة مجتمعية', icon: '🤝' },
];

export const COUNTRIES = [
  { code: 'GLOBAL', name: 'عالمي (جميع الدول)', flag: '🌍' },
  { code: 'SA', name: 'السعودية', flag: '🇸🇦' },
  { code: 'EG', name: 'مصر', flag: '🇪🇬' },
  { code: 'AE', name: 'الإمارات', flag: '🇦🇪' },
  { code: 'MA', name: 'المغرب', flag: '🇲🇦' },
  { code: 'DZ', name: 'الجزائر', flag: '🇩🇿' },
  { code: 'IQ', name: 'العراق', flag: '🇮🇶' },
  { code: 'JO', name: 'الأردن', flag: '🇯🇴' },
  { code: 'KW', name: 'الكويت', flag: '🇰🇼' },
  { code: 'QA', name: 'قطر', flag: '🇶🇦' },
  { code: 'OM', name: 'عمان', flag: '🇴🇲' },
  { code: 'BH', name: 'البحرين', flag: '🇧🇭' },
  { code: 'LY', name: 'ليبيا', flag: '🇱🇾' },
  { code: 'TN', name: 'تونس', flag: '🇹🇳' },
  { code: 'SD', name: 'السودان', flag: '🇸🇩' },
  { code: 'LB', name: 'لبنان', flag: '🇱🇧' },
  { code: 'PS', name: 'فلسطين', flag: '🇵🇸' },
  { code: 'SY', name: 'سوريا', flag: '🇸🇾' },
  { code: 'YE', name: 'اليمن', flag: '🇾🇪' },
  { code: 'US', name: 'الولايات المتحدة', flag: '🇺🇸' },
  { code: 'UK', name: 'المملكة المتحدة', flag: '🇬🇧' },
  { code: 'TR', name: 'تركيا', flag: '🇹🇷' },
  { code: 'DE', name: 'ألمانيا', flag: '🇩🇪' },
  { code: 'FR', name: 'فرنسا', flag: '🇫🇷' },
  { code: 'ES', name: 'إسبانيا', flag: '🇪🇸' },
  { code: 'CA', name: 'كندا', flag: '🇨🇦' },
  { code: 'AU', name: 'أستراليا', flag: '🇦🇺' },
];
