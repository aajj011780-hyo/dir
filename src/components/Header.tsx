import React from 'react';
import { BookHeart, Sparkles, CloudCheck, CloudOff, HelpCircle } from 'lucide-react';

interface HeaderProps {
  isCloudSynced: boolean;
  onOpenGuide: () => void;
  entryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isCloudSynced,
  onOpenGuide,
  entryCount,
}) => {
  // Format current Korean date
  const today = new Date();
  const dateString = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <header className="border-b border-amber-200/70 bg-gradient-to-b from-amber-100/60 to-amber-50/80 backdrop-blur-sm sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 ring-4 ring-amber-100">
            <BookHeart className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif">
                따뜻한 하루 일기
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                <Sparkles className="w-3 h-3 text-amber-600" />
                AI 마음 쉼터
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              오늘의 감정을 털어놓으면, AI가 다정한 위로와 내일의 온기를 건넵니다
            </p>
          </div>
        </div>

        {/* Right Info: Date, Firebase status, Deploy Guide */}
        <div className="flex items-center flex-wrap justify-center gap-2">
          {/* Date Badge */}
          <div className="text-xs font-medium text-stone-600 bg-white/80 px-3 py-1.5 rounded-full border border-amber-200 shadow-2xs">
            📅 {dateString}
          </div>

          {/* Cloud Sync Status */}
          <div
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors ${
              isCloudSynced
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={
              isCloudSynced
                ? 'Firebase Firestore에 실시간 동기화 중입니다.'
                : '로컬 안전 저장소에 보관 중입니다.'
            }
          >
            {isCloudSynced ? (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Firebase 동기화됨</span>
                <span className="md:hidden">동기화됨</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                <span>로컬 저장 ({entryCount}편)</span>
              </>
            )}
          </div>

          {/* Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-amber-900 bg-white hover:bg-amber-100/70 border border-stone-200 hover:border-amber-300 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
            title="API 키 및 배포 가이드"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>환경변수 안내</span>
          </button>
        </div>
      </div>
    </header>
  );
};
