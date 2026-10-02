import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Calendar, PenLine, Lightbulb } from 'lucide-react';
import { EmotionSelector } from './EmotionSelector';
import type { EmotionType } from '../types/diary';

interface DiaryFormProps {
  onSubmit: (data: { emotion: EmotionType; content: string; date: string }) => Promise<void>;
  isLoading: boolean;
}

const INSPIRATION_QUESTIONS = [
  '오늘 나를 미소 짓게 만든 사소한 순간은 무엇이었나요?',
  '오늘 나를 지치게 하거나 마음을 무겁게 했던 일은?',
  '내일 나에게 가장 해주고 싶은 다정한 말 한마디는?',
  '오늘 하루 가장 감사하거나 고마웠던 일은?',
];

const LOADING_STEPS = [
  '당신의 소중한 하루 일기를 가만히 읽어보고 있어요...',
  '마음속 감정에 귀 기울이며 따뜻한 온기를 모으고 있어요...',
  '내일을 가볍게 시작할 수 있는 작은 긍정 행동을 생각하고 있어요...',
  '마음을 담은 다정한 응원 편지를 봉투에 담는 중입니다...',
];

export const DiaryForm: React.FC<DiaryFormProps> = ({ onSubmit, isLoading }) => {
  const [emotion, setEmotion] = useState<EmotionType>('tired');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  // Rotate loading step messages for warm emotional UX
  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;
    await onSubmit({ emotion, content: content.trim(), date });
  };

  const handleApplyQuestion = (q: string) => {
    if (content.trim()) {
      setContent((prev) => `${prev}\n\n[질문: ${q}]\n`);
    } else {
      setContent(`[오늘의 생각: ${q}]\n`);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-amber-200/90 p-5 sm:p-7 shadow-lg shadow-amber-900/5 relative overflow-hidden">
      {/* Decorative Warm Accent Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <PenLine className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-serif">
              오늘의 이야기 적기
            </h2>
            <p className="text-xs text-stone-500">
              어떤 작은 감정도 괜찮아요. 솔직한 마음을 편하게 남겨보세요.
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-xs text-stone-700">
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent focus:outline-hidden font-medium text-stone-700 cursor-pointer"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {/* 1. Emotion Selector */}
        <EmotionSelector
          selectedEmotion={emotion}
          onSelectEmotion={(emo) => setEmotion(emo)}
        />

        {/* 2. Diary Content Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-stone-800">
              오늘 하루는 어땠나요?
            </label>
            <span className="text-xs text-stone-400">
              {content.length} 자
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 있었던 일이나 마음에 맴도는 생각들을 자유롭게 적어보세요. (예: 오늘 회사에서 긴 회의가 있어 유난히 지쳤어요. 집 오는 길에 본 노을은 예뻤지만 피로가 풀리지 않네요...)"
              disabled={isLoading}
              className="w-full p-4 rounded-2xl bg-amber-50/20 border border-stone-200 focus:border-amber-400 focus:bg-white focus:ring-3 focus:ring-amber-200/50 outline-hidden transition-all text-stone-800 placeholder:text-stone-400 text-sm leading-relaxed resize-y disabled:opacity-50"
            />
          </div>

          {/* Diary Question Hints */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>무슨 말을 적을지 고민된다면 눌러보세요:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyQuestion(q)}
                  disabled={isLoading}
                  className="text-xs bg-stone-100 hover:bg-amber-100/70 text-stone-600 hover:text-amber-900 border border-stone-200/60 px-2.5 py-1 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  + {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Submit Button [AI 비서에게 일기 보여주기] */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!content.trim() || isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
                <span className="animate-pulse font-medium text-sm sm:text-base">
                  {LOADING_STEPS[loadingStepIdx]}
                </span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-amber-200 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span>AI 비서에게 일기 보여주기</span>
                <Sparkles className="w-4 h-4 text-amber-200" />
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-stone-400 mt-2">
            * Google Gemini AI가 일기를 다정하게 읽고 맞춤 위로와 내일의 행동을 선물합니다.
          </p>
        </div>
      </form>
    </div>
  );
};
