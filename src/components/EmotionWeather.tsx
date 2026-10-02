import React from 'react';
import { CloudSun, Sparkles, TrendingUp } from 'lucide-react';
import type { DiaryEntry, EmotionType } from '../types/diary';
import { EMOTION_CONFIGS } from '../types/diary';

interface EmotionWeatherProps {
  diaries: DiaryEntry[];
}

export const EmotionWeather: React.FC<EmotionWeatherProps> = ({ diaries }) => {
  if (diaries.length === 0) return null;

  const counts: Record<EmotionType, number> = {
    joy: 0,
    tired: 0,
    flutter: 0,
    anxious: 0,
  };

  diaries.forEach((d) => {
    if (counts[d.emotion] !== undefined) {
      counts[d.emotion]++;
    }
  });

  const total = diaries.length;

  // Find dominant emotion
  let dominantEmotion: EmotionType = 'joy';
  let maxCount = -1;
  (Object.keys(counts) as EmotionType[]).forEach((emo) => {
    if (counts[emo] > maxCount) {
      maxCount = counts[emo];
      dominantEmotion = emo;
    }
  });

  const dominantMeta = EMOTION_CONFIGS[dominantEmotion];

  const getDominantEncouragement = (emo: EmotionType) => {
    switch (emo) {
      case 'joy':
        return '기쁨과 감사가 가득한 날들이 많았네요! 이 빛나는 순간들을 마음에 잘 간직해두세요.';
      case 'tired':
        return '최근 유난히 지치고 수고로운 날들이 많았군요. 스스로에게 충분한 휴식과 따뜻한 차 한 잔을 선물해주세요.';
      case 'flutter':
        return '새로운 설렘과 기대가 마음을 두드리는 시기입니다. 당신의 시작을 온 마음으로 응원해요!';
      case 'anxious':
        return '마음 한편에 걱정과 불안이 머물렀군요. 천천히 숨을 들이쉬고 내쉬어보세요. 당신은 이미 충분히 잘 해내고 있어요.';
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-100/60 via-orange-50/50 to-amber-50/70 rounded-3xl border border-amber-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Summary Title & Dominant Emotion */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
            <CloudSun className="w-4 h-4 text-amber-600" />
            <span>나의 감정 날씨 요약 (최근 {total}편)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dominantMeta.emoji}</span>
            <p className="text-sm font-semibold text-stone-800">
              최근 나의 마음에 가장 자주 머문 날씨는{' '}
              <span className="text-amber-800 underline decoration-amber-400 font-bold">
                '{dominantMeta.label}'
              </span>
              이에요.
            </p>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-serif pt-0.5">
            "{getDominantEncouragement(dominantEmotion)}"
          </p>
        </div>

        {/* Right: Emotion Bar distribution */}
        <div className="w-full md:w-72 space-y-1.5 bg-white/70 p-3 rounded-2xl border border-amber-200/60">
          <div className="text-[11px] font-semibold text-stone-600 flex items-center justify-between">
            <span>감정 분포</span>
            <span className="text-stone-400">총 {total}회 기록</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {(Object.keys(counts) as EmotionType[]).map((emoKey) => {
              const meta = EMOTION_CONFIGS[emoKey];
              const count = counts[emoKey];
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div
                  key={emoKey}
                  className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white border border-stone-100 text-center"
                >
                  <span className="text-sm">{meta.emoji}</span>
                  <span className="text-[10px] font-bold text-stone-700 mt-0.5">
                    {meta.label}
                  </span>
                  <span className="text-[9px] text-stone-400">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
