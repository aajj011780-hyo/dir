import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import type { DiaryEntry, EmotionType } from '../types/diary';
import { EMOTION_CONFIGS } from '../types/diary';
import { DiaryDetailModal } from './DiaryDetailModal';

interface DiaryListProps {
  diaries: DiaryEntry[];
  onDeleteDiary: (id: string) => void;
  onToggleAction: (id: string, completed: boolean) => void;
}

export const DiaryList: React.FC<DiaryListProps> = ({
  diaries,
  onDeleteDiary,
  onToggleAction,
}) => {
  const [filterEmotion, setFilterEmotion] = useState<EmotionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  const filteredDiaries = useMemo(() => {
    return diaries.filter((entry) => {
      const matchEmotion =
        filterEmotion === 'all' || entry.emotion === filterEmotion;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        entry.content.toLowerCase().includes(q) ||
        entry.aiResponse?.comfortMessage.toLowerCase().includes(q) ||
        entry.aiResponse?.cheerSummary.toLowerCase().includes(q) ||
        entry.formattedDate.toLowerCase().includes(q);

      return matchEmotion && matchSearch;
    });
  }, [diaries, filterEmotion, searchQuery]);

  const emotionTabs: Array<{ id: EmotionType | 'all'; label: string; emoji: string }> = [
    { id: 'all', label: '전체', emoji: '📖' },
    { id: 'joy', label: '기쁨', emoji: '☀️' },
    { id: 'tired', label: '지침', emoji: '🌧️' },
    { id: 'flutter', label: '설렘', emoji: '🌸' },
    { id: 'anxious', label: '불안', emoji: '🍃' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100/80 text-amber-800">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              나의 마음 일기 서랍
            </h3>
            <p className="text-xs text-stone-500">
              차곡차곡 쌓인 그날의 감정과 AI 비서의 다정한 위로들 ({diaries.length}편)
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="일기 또는 위로 검색..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-400 focus:outline-hidden transition-all text-stone-800"
          />
        </div>
      </div>

      {/* Emotion Filter Tabs */}
      <div className="flex items-center gap-1.5 py-4 overflow-x-auto no-scrollbar">
        {emotionTabs.map((tab) => {
          const isSelected = filterEmotion === tab.id;
          const count =
            tab.id === 'all'
              ? diaries.length
              : diaries.filter((d) => d.emotion === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setFilterEmotion(tab.id)}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-amber-700/60 text-amber-100' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Diary Card Grid / List */}
      {filteredDiaries.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-3 border border-amber-200/60">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-stone-700">
            {diaries.length === 0
              ? '아직 기록된 일기가 없습니다.'
              : '해당 조건의 일기를 찾을 수 없습니다.'}
          </p>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            {diaries.length === 0
              ? '위의 일기장에 오늘 하루의 감정을 적고 AI 비서의 따뜻한 답장을 받아보세요.'
              : '다른 검색어를 입력하거나 필터를 변경해보세요.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {filteredDiaries.map((entry) => {
            const emo = EMOTION_CONFIGS[entry.emotion];
            const ai = entry.aiResponse;

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="group relative p-4 rounded-2xl border border-stone-200/90 bg-white hover:bg-amber-50/20 hover:border-amber-300 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top: Date & Emotion Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{entry.formattedDate}</span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${emo.badgeBg}`}
                    >
                      <span>{emo.emoji}</span>
                      <span>{emo.label}</span>
                    </span>
                  </div>

                  {/* Diary snippet */}
                  <p className="text-stone-800 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3">
                    {entry.content}
                  </p>

                  {/* AI Quote Snippet */}
                  {ai && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 mb-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>AI의 한 줄 위로</span>
                      </div>
                      <p className="text-xs text-amber-950 font-serif italic line-clamp-1">
                        "{ai.cheerSummary}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom: Action state & Open detail arrow */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-400 group-hover:text-stone-600">
                  <div className="flex items-center gap-1.5">
                    {entry.actionCompleted ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>행동 실천 완료</span>
                      </span>
                    ) : (
                      <span className="text-stone-400 text-[11px]">
                        내일의 제안 있음
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-700 font-medium group-hover:translate-x-0.5 transition-transform text-[11px]">
                    <span>자세히 읽기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <DiaryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDelete={onDeleteDiary}
        onToggleAction={onToggleAction}
      />
    </div>
  );
};
