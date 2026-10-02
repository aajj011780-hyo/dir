export type EmotionType = 'joy' | 'tired' | 'flutter' | 'anxious';

export interface EmotionMeta {
  type: EmotionType;
  label: string;
  emoji: string;
  subText: string;
  themeColor: string; // for card highlight
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  bgGrad: string;
}

export interface AICheerResponse {
  comfortMessage: string;
  actionSuggestion: string;
  cheerSummary: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "2026년 10월 1일 (목)"
  createdAt: number;
  emotion: EmotionType;
  content: string;
  aiResponse?: AICheerResponse;
  actionCompleted?: boolean;
}

export const EMOTION_CONFIGS: Record<EmotionType, EmotionMeta> = {
  joy: {
    type: 'joy',
    label: '기쁨',
    emoji: '☀️',
    subText: '반짝이고 감사한 하루',
    themeColor: 'amber',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-400',
    bgGrad: 'from-amber-50 to-orange-50/50',
  },
  tired: {
    type: 'tired',
    label: '지침',
    emoji: '🌧️',
    subText: '수고 많았어요, 푹 쉬어요',
    themeColor: 'blue',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-400',
    bgGrad: 'from-blue-50 to-sky-50/50',
  },
  flutter: {
    type: 'flutter',
    label: '설렘',
    emoji: '🌸',
    subText: '두근거리는 기대와 시작',
    themeColor: 'rose',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    badgeText: 'text-rose-700',
    borderColor: 'border-rose-400',
    bgGrad: 'from-rose-50 to-pink-50/50',
  },
  anxious: {
    type: 'anxious',
    label: '불안',
    emoji: '🍃',
    subText: '천천히 숨을 고르는 시간',
    themeColor: 'emerald',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-400',
    bgGrad: 'from-emerald-50 to-teal-50/50',
  },
};
