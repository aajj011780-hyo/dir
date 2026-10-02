import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: Request, res: Response) {
  // Enable CORS for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is supported.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY가 Vercel 환경 변수에 설정되어 있지 않습니다. Vercel 프로젝트 설정의 Environment Variables에서 GEMINI_API_KEY를 추가해주세요.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { emotion, content, date } = body;

    if (!content || !emotion) {
      return res.status(400).json({
        error: '일기 내용과 감정을 입력해주세요.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const emotionMap: Record<string, string> = {
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
다음 세 가지 요소를 포함하여 반드시 지정된 JSON 형식으로 한국어로 정성껏 답변을 생성해주세요:

1. comfortMessage (다정한 위로와 깊은 공감)
2. actionSuggestion (내일을 위한 구체적이고 부담 없는 긍정적인 행동 1가지 제안)
3. cheerSummary (마음을 밝혀주는 따뜻한 한 줄 응원)`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;
    let data = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction:
              '당신은 사용자의 일기를 읽고 따뜻한 온기와 격려, 내일을 향한 작은 긍정 행동을 제안하는 힐링 AI 비서입니다.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                comfortMessage: {
                  type: Type.STRING,
                },
                actionSuggestion: {
                  type: Type.STRING,
                },
                cheerSummary: {
                  type: Type.STRING,
                },
              },
              required: ['comfortMessage', 'actionSuggestion', 'cheerSummary'],
            },
          },
        });

        const text = response.text;
        if (text) {
          data = JSON.parse(text);
          break;
        }
      } catch (err: any) {
        lastError = err;
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!data) {
      throw lastError || new Error('Gemini API로부터 응답을 받지 못했습니다.');
    }
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Vercel serverless error:', error);
    return res.status(500).json({
      error: error?.message || 'AI 응답을 생성하지 못했습니다.',
    });
  }
}
