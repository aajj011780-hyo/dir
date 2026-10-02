import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  CheckCircle2,
  CalendarCheck2,
  Share2,
} from 'lucide-react';
import type { DiaryEntry } from '../types/diary';
import { EMOTION_CONFIGS } from '../types/diary';

interface AiCheerLetterProps {
  entry: DiaryEntry;
  onToggleAction: (id: string, completed: boolean) => void;
  onReset: () => void;
}

export const AiCheerLetter: React.FC<AiCheerLetterProps> = ({
  entry,
  onToggleAction,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [actionDone, setActionDone] = useState(Boolean(entry.actionCompleted));

  const emotionMeta = EMOTION_CONFIGS[entry.emotion];
  const ai = entry.aiResponse;

  useEffect(() => {
    setActionDone(Boolean(entry.actionCompleted));
  }, [entry.actionCompleted]);

  // Clean up speech synthesis if component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!ai) return null;

  const handleCopy = () => {
    const textToCopy = `[따뜻한 하루 일기 - AI 마음 편지]
기록 날짜: ${entry.formattedDate}
오늘의 감정: ${emotionMeta.label} ${emotionMeta.emoji}

💌 다정한 위로:
${ai.comfortMessage}

🌱 내일을 위한 긍정 행동:
${ai.actionSuggestion}

✨ 한 줄 응원:
${ai.cheerSummary}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('브라우저에서 음성 읽기(TTS) 기능을 지원하지 않습니다.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const fullSpeech = `오늘 하루 수고 많으셨어요. 다정한 위로를 전해드릴게요. ${ai.comfortMessage}. 내일을 위한 작은 행동입니다. ${ai.actionSuggestion}. ${ai.cheerSummary}`;
    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.92; // warm, gentle pacing
    utterance.pitch = 1.05;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleToggleActionState = () => {
    const next = !actionDone;
    setActionDone(next);
    onToggleAction(entry.id, next);
  };

  return (
    <div className="bg-gradient-to-b from-amber-50/90 via-orange-50/60 to-white rounded-3xl border-2 border-amber-300/80 p-6 sm:p-8 shadow-xl shadow-amber-900/10 relative overflow-hidden animate-fade-in">
      {/* Decorative Stamp & Ribbon */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
        <button
          onClick={handleToggleSpeech}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
              : 'bg-white/80 hover:bg-amber-100 text-stone-700 border-amber-200'
          }`}
          title="AI의 따뜻한 위로 편지를 음성으로 듣기"
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>듣기 멈춤</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              <span>음성으로 듣기</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/80 hover:bg-amber-100 text-stone-700 border border-amber-200 transition-colors cursor-pointer"
          title="편지 복사하기"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">복사완료</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-stone-600" />
              <span>복사</span>
            </>
          )}
        </button>
      </div>

      {/* Header Info */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Heart className="w-4 h-4 fill-white" />
          </span>
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-serif">
              AI 비서가 건네는 따뜻한 마음 편지
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
              <span>{entry.formattedDate}</span>
              <span>•</span>
              <span className="font-semibold text-stone-700">
                {emotionMeta.emoji} {emotionMeta.label}의 날
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. 다정한 위로와 공감 (comfortMessage) */}
      <div className="mb-6 p-5 rounded-2xl bg-white/90 border border-amber-200/70 shadow-xs relative">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
            다정한 위로와 공감
          </h4>
        </div>
        <p className="text-stone-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif">
          {ai.comfortMessage}
        </p>
      </div>

      {/* 2. 내일을 위한 긍정 행동 1가지 (actionSuggestion) */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/70 border border-emerald-200/80 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              내일을 위한 긍정적인 행동 1가지
            </h4>
          </div>
          <button
            onClick={handleToggleActionState}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
              actionDone
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{actionDone ? '실천 완료!' : '내일 실천해볼게요'}</span>
          </button>
        </div>

        <p className="text-stone-800 text-sm sm:text-base font-medium leading-relaxed mt-2 pl-1">
          🌱 {ai.actionSuggestion}
        </p>
      </div>

      {/* 3. 오늘의 한 줄 응원 (cheerSummary) */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-center relative">
        <span className="text-xs font-bold text-amber-900 block mb-1">
          오늘의 한 줄 응원
        </span>
        <blockquote className="text-base sm:text-lg font-bold text-amber-950 font-serif italic">
          "{ai.cheerSummary}"
        </blockquote>
      </div>

      {/* Footer controls: Write new diary */}
      <div className="mt-6 pt-4 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-stone-500 flex items-center gap-1">
          <span>✨ 당신의 일기와 위로 편지가 소중히 보관되었습니다.</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs sm:text-sm font-semibold text-amber-800 hover:text-amber-950 bg-white hover:bg-amber-100/80 border border-amber-300 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          새로운 일기 적기
        </button>
      </div>
    </div>
  );
};
