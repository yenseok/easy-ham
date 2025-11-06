import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Bell, Search, Zap } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

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

export default function App() {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const featuresRef = useRef<HTMLElement>(null);

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

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const feature = features[currentFeature];
  const Icon = feature.icon;

  return (
    <div className="min-h-screen">
      {/* 상단 뷰포트 - Hero Section */}
      <section className="h-screen flex flex-col bg-gradient-to-br from-white via-[#FFF5EE] to-[#FFE8D6]">
        {/* Header */}
        <header className="flex items-center px-8 py-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src="/images/logo/logo.png" alt="logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl" style={{ fontWeight: 700 }}>편리햄!</span>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-20">
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
                onClick={handleLoginClick}
                className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white px-8 py-6 text-lg"
                style={{ fontWeight: 600 }}
              >
                지금 시작하기
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={scrollToFeatures}
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
            onClick={scrollToFeatures}
            className="animate-bounce cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="Scroll to features"
          >
            <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center p-2">
              <div className="w-1.5 h-3 bg-gray-400 rounded-full"></div>
            </div>
          </button>
        </div>
      </section>

      {/* 하단 뷰포트 - Features Section */}
      <section 
        ref={featuresRef}
        className="h-screen flex items-center justify-center bg-white px-8"
      >
        <div className="max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-orange-light)] rounded-full">
                <Icon className="w-5 h-5 text-[var(--brand-orange)]" />
                <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
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
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                <ImageWithFallback
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[var(--brand-orange-light)] rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[var(--brand-orange)] rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
