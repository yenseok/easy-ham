import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from './components/HeroSection';
import { FeatureCarousel } from './components/FeatureCarousel';

export default function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLElement>(null);

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

  return (
    <div className="min-h-screen">
      <HeroSection
        onLoginClick={handleLoginClick}
        onScrollToFeatures={scrollToFeatures}
      />
      <FeatureCarousel featuresRef={featuresRef} />
    </div>
  );
}
