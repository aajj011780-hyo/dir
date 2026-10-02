import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API Key can come from GEMINI_API_KEY (AI Studio / Vercel Server) or VITE_GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// AI Encourage & Advice Endpoint
app.post('/api/diary/cheer', async (req, res) => {
  try {
    const { emotion, content, date } = req.body;

    if (!content || !emotion) {
      return res.status(400).json({
        error: '일기 내용과 오늘의 감정을 함께 전달해주세요.',
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY 환경 변수가 등록되지 않았습니다. .env 파일 또는 Vercel 환경 변수에 API 키를 설정해주세요.',
      });
    }

    const emotionKoreanMap: Record<string, string> = {
      joy: '기쁨 (행복하고 감사한 감정)',
      tired: '지침 (피곤하고 에너지가 소진된 감정)',
      flutter: '설렘 (기대감과 두근거림이 가득한 감정)',
      anxious: '불안 (걱정과 초조함, 긴장되는 감정)',
    };

    const emotionDesc = emotionKoreanMap[emotion] || emotion;

    const prompt = `사용자가 오늘 하루 일기와 감정을 기록했습니다.
- 작성 날짜: ${date || '오늘'}
- 사용자의 감정 상태: ${emotionDesc}
- 일기 내용:
"${content}"

당신은 사용자의 지친 마음을 따뜻하게 안아주고 내일을 향한 작은 용기를 선물하는 '마음 쉼터 AI 비서'입니다.
다음 세 가지 요소를 포함하여 반드시 지정된 JSON 형식으로 한국어로 정성껏 답변을 생성해주세요:

1. comfortMessage (다정한 위로와 깊은 공감):
   - 사용자가 기록한 일기 내용과 선택한 감정에 깊이 공감해주세요.
   - 오늘 하루를 견디고 살아낸 사용자를 진심으로 칭찬하고 따뜻하게 토닥여주세요.
   - 친절하고 다정한 존댓말('~하셨군요', '~해드릴게요', '~해도 괜찮아요')로 3~5문장 내외로 서술해주세요.

2. actionSuggestion (내일을 위한 긍정적인 행동 1가지 제안):
   - 내일 사용자가 가벼운 마음으로 실천할 수 있는 현실적이고 부담 없는 긍정 행동 1가지를 명확하게 제시해주세요.
   - 예시: "내일 아침 따뜻한 물 한 잔 마시며 창밖 구름 1분간 바라보기", "점심 식사 후 좋아하는 노래 한 곡 들으며 심호흡 3번 하기" 등.
   - 문장 끝은 부드러운 권유형으로 작성해주세요.

3. cheerSummary (마음을 밝혀주는 한 줄 응원):
   - 마음속에 오래 간직할 수 있는 짧고 울림 있는 한 줄 응원 문구 (예: "오늘의 수고로움은 내일의 더 큰 평온이 될 거예요.")`;

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
              '당신은 사용자의 일기를 읽고 따뜻한 온기와 격려, 내일을 향한 작은 긍정 행동을 제안하는 힐링 AI 비서입니다. 기계적이거나 형식적인 어조를 피하고, 마치 오랜 친구나 따뜻한 상담사처럼 다정하고 온화한 어조로 작성합니다.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                comfortMessage: {
                  type: Type.STRING,
                  description: '사용자의 감정과 일기에 대한 다정한 위로와 공감의 편지글',
                },
                actionSuggestion: {
                  type: Type.STRING,
                  description: '내일을 위한 구체적이고 긍정적인 행동 1가지 제안',
                },
                cheerSummary: {
                  type: Type.STRING,
                  description: '한 줄 요약 응원 문구',
                },
              },
              required: ['comfortMessage', 'actionSuggestion', 'cheerSummary'],
            },
          },
        });

        const responseText = response.text;
        if (responseText) {
          data = JSON.parse(responseText);
          break; // successfully generated
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, attempting next model in pool:`, err?.message);
        // Wait a short moment before trying the next model
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!data) {
      throw lastError || new Error('Gemini API로부터 응답을 수신하지 못했습니다.');
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Gemini API error in /api/diary/cheer:', error);
    return res.status(500).json({
      error: error?.message || 'AI 응원 메시지를 생성하는 중 문제가 발생했습니다.',
    });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
