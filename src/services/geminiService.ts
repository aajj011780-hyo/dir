import type { EmotionType, AICheerResponse } from '../types/diary';

export interface GenerateCheerParams {
  emotion: EmotionType;
  content: string;
  date?: string;
}

export async function requestAICheer(params: GenerateCheerParams): Promise<AICheerResponse> {
  const { emotion, content, date } = params;

  // 1. Try our server endpoint (/api/diary/cheer) which uses server-side GEMINI_API_KEY
  try {
    const res = await fetch('/api/diary/cheer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emotion, content, date }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.comfortMessage) {
        return json.data as AICheerResponse;
      }
    } else {
      const errJson = await res.json().catch(() => null);
      if (res.status !== 404 && errJson?.error) {
        // If server explicitly returned an error (e.g. key missing or quota)
        console.warn('Server endpoint error:', errJson.error);
        // If it's a 404 or backend unavailable, we will try the client-side fallback below
        if (res.status === 500 && !errJson.error.includes('Cannot find')) {
          // If the backend threw an error, check if client fallback is available
          if (!import.meta.env.VITE_GEMINI_API_KEY) {
            throw new Error(errJson.error);
          }
        }
      }
    }
  } catch (serverErr: any) {
    console.warn('Backend proxy fetch error, attempting fallback if available:', serverErr.message);
  }

  // 2. Client-side fallback if VITE_GEMINI_API_KEY is configured (e.g., purely static Vercel deploy)
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (clientKey) {
    const emotionMap: Record<EmotionType, string> = {
      joy: '기쁨 (행복하고 감사한 감정)',
      tired: '지침 (피곤하고 에너지가 소진된 감정)',
      flutter: '설렘 (기대감과 두근거림이 가득한 감정)',
      anxious: '불안 (걱정과 초조함, 긴장되는 감정)',
    };

    const prompt = `사용자가 오늘 하루 일기와 감정을 기록했습니다.
- 작성 날짜: ${date || '오늘'}
- 사용자의 감정 상태: ${emotionMap[emotion] || emotion}
- 일기 내용:
"${content}"

당신은 사용자의 지친 마음을 따뜻하게 안아주고 내일을 향한 작은 용기를 선물하는 '마음 쉼터 AI 비서'입니다.
다음 세 가지 요소를 포함하여 반드시 순수한 JSON 형식으로만 답변을 생성해주세요:

{
  "comfortMessage": "사용자의 감정과 일기에 대한 다정한 위로와 공감의 편지글 (3~5문장, 다정한 존댓말)",
  "actionSuggestion": "내일을 위한 구체적이고 부담 없는 긍정적인 실천 행동 1가지 제안",
  "cheerSummary": "마음을 밝혀주는 따뜻한 한 줄 응원"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${clientKey}`;
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      // Try fallback to gemini-flash-latest
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${clientKey}`;
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || `Gemini API 호출 실패 (HTTP ${response.status})`
      );
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      try {
        const parsed = JSON.parse(candidateText);
        return {
          comfortMessage: parsed.comfortMessage || '오늘 하루 정말 수고 많으셨어요.',
          actionSuggestion: parsed.actionSuggestion || '내일 아침 따뜻한 차 한 잔으로 하루를 시작해보세요.',
          cheerSummary: parsed.cheerSummary || '당신의 오늘과 내일을 언제나 응원합니다.',
        };
      } catch (pe) {
        console.error('Failed to parse fallback JSON:', pe);
      }
    }
  }

  // 3. Fallback error message
  throw new Error(
    'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY 또는 VITE_GEMINI_API_KEY를 등록해주세요.'
  );
}
