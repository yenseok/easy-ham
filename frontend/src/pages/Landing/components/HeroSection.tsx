import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onLoginClick: () => void;
  onScrollToFeatures: () => void;
}

export function HeroSection({ onLoginClick, onScrollToFeatures }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#FFF5EE] to-[#FFE8D6] py-4">
      {/* Header */}
      <header className="flex items-center px-4 sm:px-6 md:px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-orange)] flex items-center justify-center">
            <span className="text-xl">🐹</span>
          </div>
          <span className="text-2xl" style={{ fontWeight: 700 }}>편리햄!</span>
        </div>
      </header>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1
            className="text-6xl tracking-tight"
            style={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            흩어진 공지사항,
            <br />
            <span className="text-[var(--brand-orange)]">AI가 정리해드려요</span>
          </h1>
          <p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            style={{ fontWeight: 400 }}
          >
            Mattermost의 산발적인 공지를 AI가 자동으로 분석하고 분류합니다.
            <br />
            중요한 공지를 놓치지 않도록 스마트하게 관리하세요.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={onLoginClick}
              className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white px-8 py-6 text-lg"
              style={{ fontWeight: 600 }}
            >
              지금 시작하기
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onScrollToFeatures}
              className="border-2 px-8 py-6 text-lg"
              style={{ fontWeight: 600 }}
            >
              더 알아보기
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="pb-12 flex justify-center">
        <button
          onClick={onScrollToFeatures}
          className="animate-bounce cursor-pointer hover:opacity-70 transition-opacity"
          aria-label="Scroll to features"
        >
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center p-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </button>
      </div>
    </section>
  );
}
