import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './PillNav.css';

export interface PillNavItem {
  label: string;
  href: string;
  ariaLabel?: string;
}

interface PillNavProps {
  logo?: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#060010',
  hoveredPillTextColor = '#060010',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}: PillNavProps) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const logoImgRef = useRef<HTMLImageElement>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const prevActiveHrefRef = useRef<string | undefined>(activeHref);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        // Active 상태 확인
        const isActive = pill.classList.contains('is-active');

        if (isActive) {
          // Active 항목은 즉시 filled 상태로 설정 (애니메이션 없음)
          gsap.set(circle, {
            xPercent: -50,
            scale: 1.2,
            transformOrigin: `50% ${originY}px`
          });
          if (label) {
            gsap.set(label, { y: -(h + 8), opacity: 0, visibility: 'hidden' });
          }
          if (white) {
            // active 상태일 때는 GSAP을 완전히 무시하고 CSS만 사용
            const whiteEl = white as HTMLElement;
            // 모든 GSAP 애니메이션 정리
            gsap.killTweensOf(white);
            // 인라인 스타일 완전히 제거 후 재설정
            whiteEl.removeAttribute('style');
            // CSS 클래스로만 처리하도록
            whiteEl.classList.add('force-black-text');
          }
        } else {
          // 비활성 항목은 empty 상태로 설정
          gsap.set(circle, {
            xPercent: -50,
            scale: 0,
            transformOrigin: `50% ${originY}px`
          });
          if (label) gsap.set(label, { y: 0, opacity: 1, visibility: 'visible' });
          if (white) gsap.set(white, { y: h + 12, opacity: 0, visibility: 'hidden' });
        }

        // 타임라인 생성 (hover용)
        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), opacity: 0, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, visibility: 'visible', duration: 2, ease, overwrite: 'auto' }, 0);
          // hover 상태에서도 색상 설정
          tl.call(() => {
            (white as HTMLElement).style.setProperty('color', '#000000', 'important');
          }, [], 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, {
          scale: 1,
          duration: 0.6,
          ease
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, {
          width: 'auto',
          duration: 0.6,
          ease
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation, activeHref]);

  // activeHref 변경 시 페이지 전환 애니메이션
  useEffect(() => {
    if (prevActiveHrefRef.current === activeHref) return;

    const prevIndex = items.findIndex(item => item.href === prevActiveHrefRef.current);
    const newIndex = items.findIndex(item => item.href === activeHref);

    // 이전 active 항목을 empty 상태로 애니메이션
    if (prevIndex !== -1) {
      const circle = circleRefs.current[prevIndex];
      const pill = circle?.parentElement;

      if (circle && pill) {
        const rect = pill.getBoundingClientRect();
        const { height: h } = rect;
        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        activeTweenRefs.current[prevIndex]?.kill();

        gsap.to(circle, { scale: 0, duration: 0.4, ease, overwrite: 'auto' });
        if (label) gsap.to(label, { y: 0, opacity: 1, visibility: 'visible', duration: 0.4, ease, overwrite: 'auto' });
        if (white) gsap.to(white, { y: h + 12, opacity: 0, visibility: 'hidden', duration: 0.4, ease, overwrite: 'auto' });
      }
    }

    // 새 active 항목을 filled 상태로 애니메이션
    if (newIndex !== -1) {
      const circle = circleRefs.current[newIndex];
      const pill = circle?.parentElement;

      if (circle && pill) {
        const rect = pill.getBoundingClientRect();
        const { height: h } = rect;
        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        activeTweenRefs.current[newIndex]?.kill();

        gsap.to(circle, { scale: 1.2, duration: 0.4, ease, overwrite: 'auto' });
        if (label) {
          gsap.to(label, { y: -(h + 8), opacity: 0, visibility: 'hidden', duration: 0.4, ease, overwrite: 'auto' });
        }
        if (white) {
          const whiteEl = white as HTMLElement;
          // 모든 GSAP 애니메이션 정리
          gsap.killTweensOf(white);
          // 인라인 스타일 완전히 제거
          whiteEl.removeAttribute('style');
          // CSS 클래스로만 처리
          whiteEl.classList.add('force-black-text');
          // CSS transition으로 부드럽게
          whiteEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          whiteEl.style.opacity = '1';
          whiteEl.style.visibility = 'visible';
          whiteEl.style.transform = 'translateY(0)';
        }
      }
    }

    prevActiveHrefRef.current = activeHref;
  }, [activeHref, items, ease]);

  const handleEnter = (i: number) => {
    // Active 항목은 hover 애니메이션 실행 안 함
    if (items[i]?.href === activeHref) return;

    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    
    const pill = circleRefs.current[i]?.parentElement;
    const white = pill?.querySelector('.pill-label-hover');
    if (white) {
      (white as HTMLElement).style.setProperty('color', '#000000', 'important');
    }
    
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    // Active 항목은 hover 애니메이션 역재생 안 함
    if (items[i]?.href === activeHref) return;

    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const isExternalLink = (href: string) =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const isRouterLink = (href?: string) => href && !isExternalLink(href);

  const cssVars = {
    ['--base' as string]: baseColor,
    ['--pill-bg' as string]: pillColor,
    ['--hover-text' as string]: hoveredPillTextColor,
    ['--pill-text' as string]: resolvedPillTextColor
  };

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
        {logo && (
          <>
            {isRouterLink(items?.[0]?.href) ? (
              <Link
                className="pill-logo"
                to={items[0].href}
                aria-label="Home"
                onMouseEnter={handleLogoEnter}
                role="menuitem"
                ref={logoRef}
              >
                <img src={logo} alt={logoAlt} ref={logoImgRef} />
              </Link>
            ) : (
              <a
                className="pill-logo"
                href={items?.[0]?.href || '#'}
                aria-label="Home"
                onMouseEnter={handleLogoEnter}
                ref={logoRef}
              >
                <img src={logo} alt={logoAlt} ref={logoImgRef} />
              </a>
            )}
          </>
        )}

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => (
              <li key={item.href || `item-${i}`} role="none">
                {isRouterLink(item.href) ? (
                  <Link
                    role="menuitem"
                    to={item.href}
                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={el => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <a
                    role="menuitem"
                    href={item.href}
                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={el => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {item.label}
                      </span>
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          {items.map((item, i) => (
            <li key={item.href || `mobile-item-${i}`}>
              {isRouterLink(item.href) ? (
                <Link
                  to={item.href}
                  className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
