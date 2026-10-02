import React, { useState } from 'react';
import {
  X,
  Heart,
  Volume2,
  VolumeX,
  Copy,
  Check,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import type { DiaryEntry } from '../types/diary';
import { EMOTION_CONFIGS } from '../types/diary';

interface DiaryDetailModalProps {
  entry: DiaryEntry | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggleAction: (id: string, completed: boolean) => void;
}

export const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({
  entry,
  onClose,
  onDelete,
  onToggleAction,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!entry) return null;

  const emotion = EMOTION_CONFIGS[entry.emotion];
  const ai = entry.aiResponse;

  const handleCopy = () => {
    const fullText = `[따뜻한 하루 일기]
날짜: ${entry.formattedDate}
감정: ${emotion.label} ${emotion.emoji}

내가 쓴 일기:
${entry.content}

${
  ai
    ? `\n💌 AI 비서의 다정한 위로:\n${ai.comfortMessage}\n\n🌱 내일을 위한 행동:\n${ai.actionSuggestion}\n\n✨ 오늘의 응원:\n"${ai.cheerSummary}"`
    : ''
}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!ai || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const text = `${ai.comfortMessage}. 내일을 위한 행동입니다. ${ai.actionSuggestion}. ${ai.cheerSummary}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.92;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{emotion.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 font-serif">
                  {entry.formattedDate}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${emotion.badgeBg}`}>
                  {emotion.label}
                </span>
              </div>
              <p className="text-xs text-stone-500">{emotion.subText}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              title="복사하기"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User's original diary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              내가 쓴 이야기
            </h4>
            <div className="p-4 rounded-2xl bg-amber-50/30 border border-stone-100 text-stone-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
              {entry.content}
            </div>
          </div>

          {/* AI Comfort Response */}
          {ai && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>AI 비서의 위로 답장</span>
                </div>

                <button
                  onClick={handleToggleSpeech}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-white hover:bg-amber-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3 h-3" />
                      <span>멈춤</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-amber-700" />
                      <span>낭독</span>
                    </>
                  )}
                </button>
              </div>

              {/* Comfort message */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-stone-800 text-sm leading-relaxed whitespace-pre-line font-serif">
                {ai.comfortMessage}
              </div>

              {/* Action suggestion */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-800">
                    내일을 위한 긍정 행동
                  </span>
                  <button
                    onClick={() => onToggleAction(entry.id, !entry.actionCompleted)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      entry.actionCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{entry.actionCompleted ? '실천 완료' : '미완료'}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-stone-800 font-medium">
                  🌱 {ai.actionSuggestion}
                </p>
              </div>

              {/* Cheer Summary */}
              <div className="p-3.5 rounded-xl bg-amber-100/50 border border-amber-200 text-center">
                <blockquote className="text-sm font-bold text-amber-950 font-serif italic">
                  "{ai.cheerSummary}"
                </blockquote>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('이 일기를 정말 삭제하시겠습니까?')) {
                onDelete(entry.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>일기 삭제</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
