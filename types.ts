
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

export interface KeywordMetric {
  keyword: string;
  searchVolume: string; // High, Medium, Low
  competition: number; // 0-100
  strength: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  googleScore?: number; // 0-100
  youtubeScore?: number; // 0-100
  sourcePlatform?: Platform;
  audienceSize?: string;
  commissionRate?: string;
  productLink?: string;
}

export interface TagSuggestion {
  tag: string;
  relevance: number;
}

export interface APIUsageStats {
  usedTokens: number;
  limit: number;
  percentage: number;
}

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
