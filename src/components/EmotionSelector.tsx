import React from 'react';
import { EMOTION_CONFIGS, type EmotionType } from '../types/diary';

interface EmotionSelectorProps {
  selectedEmotion: EmotionType;
  onSelectEmotion: (emotion: EmotionType) => void;
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  selectedEmotion,
  onSelectEmotion,
}) => {
  const emotions = Object.values(EMOTION_CONFIGS);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-stone-800">
        오늘 마음에 가장 머물렀던 감정을 골라주세요
        <span className="text-amber-600 font-normal text-xs ml-2">
          (AI가 감정에 맞춤 위로를 준비합니다)
        </span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {emotions.map((item) => {
          const isSelected = selectedEmotion === item.type;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelectEmotion(item.type)}
              className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left ${
                isSelected
                  ? `bg-white shadow-md ring-2 ring-amber-400 ring-offset-2 ${item.borderColor}`
                  : 'bg-white/70 hover:bg-white border-stone-200 hover:border-amber-300'
              }`}
            >
              <div className="text-3xl mb-1.5 transform transition-transform hover:scale-110">
                {item.emoji}
              </div>
              <div className="font-bold text-stone-800 text-sm flex items-center gap-1">
                {item.label}
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </div>
              <div className="text-[11px] text-stone-500 text-center leading-tight mt-0.5">
                {item.subText}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
