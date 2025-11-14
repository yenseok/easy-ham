import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Bell, Search, Zap } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

const features = [
  {
    id: 1,
    title: 'AI 기반 공지사항 자동 분류',
    description: '흩어진 공지사항을 AI가 자동으로 분석하고 카테고리별로 분류합니다. 중요도에 따라 우선순위를 정렬하여 놓치기 쉬운 공지를 한눈에 확인하세요.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1745674684468-b9fc392fda3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMGFydGlmaWNpYWwlMjBpbnRlbGxpZ2VuY2V8ZW58MXx8fHwxNzYxNTMyOTg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 2,
    title: '데드라인 중심 알림',
    description: '마감일을 놓치지 마세요. 달력 뷰를 통해 데드라인을 한눈에 파악하고, 맞춤형 알림으로 중요한 일정을 사전에 관리할 수 있습니다.',
    icon: Bell,
    image: 'https://images.unsplash.com/photo-1703300450387-047da16a89c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxlbmRhciUyMGRlYWRsaW5lJTIwc2NoZWR1bGV8ZW58MXx8fHwxNzYxNTM4MDI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 3,
    title: '통합 검색',
    description: '기존 메신저보다 훨씬 빠르고 정확한 검색 기능을 제공합니다. 필요한 공지사항을 즉시 찾아 업무 효율을 극대화하세요.',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1686061594183-8c864f508b00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWFyY2glMjBpbnRlcmZhY2UlMjBhbmFseXRpY3N8ZW58MXx8fHwxNzYxNTM4MDI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 4,
    title: '실시간 모니터링',
    description: '새로운 공지사항이 등록되는 즉시 실시간으로 알림을 받습니다. SSE 기반 실시간 알림으로 중요한 공지를 절대 놓치지 마세요.',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1731846584223-81977e156b2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBub3RpZmljYXRpb24lMjBzeXN0ZW18ZW58MXx8fHwxNzYxNTM4MDI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

interface FeatureCarouselProps {
  featuresRef: React.RefObject<HTMLElement | null>;
}

export function FeatureCarousel({ featuresRef }: FeatureCarouselProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrevious = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleNext = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const feature = features[currentFeature];
  const Icon = feature.icon;

  return (
    <section
      ref={featuresRef}
      className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 md:px-8 py-16 md:py-20"
    >
      <div className="max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left - Text Content */}
          <div className="space-y-4 md:space-y-6 pt-4 sm:pt-6 md:pt-0">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--brand-orange-light)] rounded-full">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--brand-orange)]" />
              <span className="text-xs sm:text-sm text-gray-800" style={{ fontWeight: 600 }}>
                주요 기능 {currentFeature + 1} / {features.length}
              </span>
            </div>

            <h2
              className="text-5xl"
              style={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {feature.title}
            </h2>

            <p
              className="text-xl text-gray-600"
              style={{ fontWeight: 400, lineHeight: 1.8 }}
            >
              {feature.description}
            </p>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="rounded-full border-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentFeature
                        ? 'w-8 bg-[var(--brand-orange)]'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to feature ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="rounded-full border-2"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative mt-8 lg:mt-0 max-w-md mx-auto lg:max-w-none">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 mb-6">
              <ImageWithFallback
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
