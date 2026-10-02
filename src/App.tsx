/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DiaryForm } from './components/DiaryForm';
import { AiCheerLetter } from './components/AiCheerLetter';
import { DiaryList } from './components/DiaryList';
import { EmotionWeather } from './components/EmotionWeather';
import { DeployGuideModal } from './components/DeployGuideModal';
import { requestAICheer } from './services/geminiService';
import {
  subscribeToDiaries,
  saveDiary,
  deleteDiary,
  toggleDiaryAction,
} from './firebase';
import type { DiaryEntry, EmotionType } from './types/diary';
import { AlertCircle, HeartHandshake, Sparkles } from 'lucide-react';

export default function App() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Subscribe to Firebase Firestore with LocalStorage fallback
  useEffect(() => {
    const unsubscribe = subscribeToDiaries((items, isSynced) => {
      setDiaries(items);
      setIsCloudSynced(isSynced);
    });

    return () => unsubscribe();
  }, []);

  // Format date helper: "2026년 10월 1일 (목)"
  const formatKoreanDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        });
      }
    } catch (e) {
      // fallback
    }
    return dateStr;
  };

  const handleDiarySubmit = async ({
    emotion,
    content,
    date,
  }: {
    emotion: EmotionType;
    content: string;
    date: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Call Gemini AI API
      const aiResponse = await requestAICheer({
        emotion,
        content,
        date,
      });

      // 2. Build complete diary entry
      const newEntry: DiaryEntry = {
        id: `diary_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        date,
        formattedDate: formatKoreanDate(date),
        createdAt: Date.now(),
        emotion,
        content,
        aiResponse,
        actionCompleted: false,
      };

      // 3. Save to Firebase Firestore / LocalStorage
      await saveDiary(newEntry);

      // 4. Show the cheer letter
      setCurrentEntry(newEntry);

      // Smooth scroll to letter
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to submit diary:', err);
      setErrorMessage(
        err.message ||
          'AI 응원 편지를 받아오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (currentEntry?.id === id) {
      setCurrentEntry(null);
    }
    await deleteDiary(id);
  };

  const handleToggleAction = async (id: string, completed: boolean) => {
    if (currentEntry?.id === id) {
      setCurrentEntry((prev) => (prev ? { ...prev, actionCompleted: completed } : null));
    }
    await toggleDiaryAction(id, completed);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col text-stone-800">
      {/* Top Header */}
      <Header
        isCloudSynced={isCloudSynced}
        onOpenGuide={() => setShowGuideModal(true)}
        entryCount={diaries.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:px-6 space-y-7">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">응답 생성 오류</p>
              <p className="mt-0.5 text-rose-700">{errorMessage}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="font-semibold underline text-rose-900 hover:text-rose-950 cursor-pointer"
                >
                  환경변수(GEMINI_API_KEY) 설정 가이드 보기
                </button>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-600 hover:text-rose-800 cursor-pointer ml-3"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emotion Weather Summary Banner */}
        <EmotionWeather diaries={diaries} />

        {/* AI Cheer Letter Card (Displayed when newly generated or clicked) */}
        {currentEntry && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                방금 도착한 AI 응원 편지
              </span>
              <button
                onClick={() => setCurrentEntry(null)}
                className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
              >
                닫고 새 일기 쓰기
              </button>
            </div>
            <AiCheerLetter
              entry={currentEntry}
              onToggleAction={handleToggleAction}
              onReset={() => setCurrentEntry(null)}
            />
          </div>
        )}

        {/* Diary Form: Write today's story */}
        {!currentEntry && (
          <DiaryForm onSubmit={handleDiarySubmit} isLoading={isLoading} />
        )}

        {/* Past Diaries Timeline / Drawer */}
        <DiaryList
          diaries={diaries}
          onDeleteDiary={handleDelete}
          onToggleAction={handleToggleAction}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/50 bg-amber-50/40 py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1.5">
          <p className="flex items-center justify-center gap-1 font-medium text-stone-600">
            <span>따뜻한 하루 일기</span>
            <span>•</span>
            <span>Google Gemini AI & Firebase Firestore 연동</span>
          </p>
          <p className="text-stone-400">
            오늘 당신이 느낀 모든 감정은 소중합니다. 편안하고 따뜻한 밤 되세요.
          </p>
        </div>
      </footer>

      {/* Guide Modal */}
      <DeployGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
