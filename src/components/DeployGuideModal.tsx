import React, { useState } from 'react';
import { X, ShieldCheck, Key, Server, Copy, Check, ExternalLink } from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const envSample = `# Google Gemini API Key
GEMINI_API_KEY="AIzaSyYourSecretKey..."

# (선택) 클라이언트 단독 빌드 시
VITE_GEMINI_API_KEY="AIzaSyYourSecretKey..."

# 앱 호스팅 주소
APP_URL="http://localhost:3000"`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 font-serif text-base">
                보안 및 Vercel 배포 가이드
              </h3>
              <p className="text-xs text-stone-500">
                API 키를 안전하게 관리하고 배포하는 방법
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-stone-700 leading-relaxed">
          {/* 1. Security Architecture */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs uppercase tracking-wider">
              <Key className="w-4 h-4 text-emerald-700" />
              <span>안전한 API 키 관리 방식</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              본 웹앱은 API 키를 프론트엔드 소스코드에 하드코딩하지 않습니다.
              서버 사이드 프록시(<code>/api/diary/cheer</code>)를 통해 <code>process.env.GEMINI_API_KEY</code>를 안전하게 읽어와 Google Gemini API에 요청합니다.
            </p>
          </div>

          {/* 2. Deployment Instructions (Tabs or Sections) */}
          <div className="space-y-4">
            {/* Method A: GitHub + Vercel */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-600" />
                <span>방법 1: GitHub 저장소를 Vercel에 연동 (가장 추천)</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <li>
                  깃허브(GitHub)에 이 저장소를 Push합니다.
                </li>
                <li>
                  <strong className="text-stone-800">Vercel.com</strong>에 로그인 후 <strong>Add New &gt; Project</strong>에서 깃허브 저장소를 Import합니다.
                </li>
                <li>
                  <strong>Environment Variables</strong>에 Key: <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code>, Value: 구글 API 키를 등록하고 <strong>Deploy</strong>를 누릅니다.
                </li>
                <li>
                  서버리스 함수(<code>/api/diary/cheer</code>)를 통해 API 키가 클라이언트에 일절 노출되지 않고 완벽하게 보호됩니다.
                </li>
              </ol>
            </div>

            {/* Method B: GitHub Pages */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>방법 2: GitHub Pages로 정적 배포</span>
              </h4>
              <div className="text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                <p>
                  프로젝트에 GitHub Actions 배포 워크플로우(<code>.github/workflows/deploy.yml</code>)가 준비되어 있습니다.
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    GitHub 저장소 <strong>Settings &gt; Pages</strong>에서 <strong>Source</strong>를 <strong className="text-stone-800">GitHub Actions</strong>로 선택합니다.
                  </li>
                  <li>
                    <strong>Settings &gt; Secrets and variables &gt; Actions</strong>에서 New repository secret으로 <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono">VITE_GEMINI_API_KEY</code>를 등록합니다.
                  </li>
                  <li>
                    GitHub에 Push하면 자동으로 빌드되어 <code>https://&lt;username&gt;.github.io/&lt;repo&gt;/</code> 주소로 배포됩니다.
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* 3. Local Test .env Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-700">
                로컬 테스트용 .env 예시
              </span>
              <button
                onClick={handleCopyEnv}
                className="flex items-center gap-1 text-xs text-amber-800 hover:text-amber-950 font-medium cursor-pointer"
              >
                {copiedEnv ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>복사 완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>복사하기</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-stone-900 text-amber-200 text-xs font-mono overflow-x-auto">
              {envSample}
            </pre>
          </div>

          {/* 4. Firebase Note */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-stone-600">
            <p className="font-semibold text-stone-800 mb-1">
              🔥 Firebase 데이터 저장 안내
            </p>
            <p>
              제공해주신 Firebase 설정(<code>guestbook-cec41</code>)의 Firestore에 작성된 일기와 AI의 응원 편지가 실시간으로 영구 저장됩니다. 네트워크 오류나 보안 규칙 미설정 시에도 브라우저 로컬 저장소로 안전하게 자동 백업됩니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-amber-800 hover:underline font-medium"
          >
            <span>Google AI Studio 키 발급받기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
