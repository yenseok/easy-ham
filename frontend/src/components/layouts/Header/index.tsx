import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import PillNav from '@/components/common/PillNav';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileMenu } from './ProfileMenu';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: '홈', href: '/dashboard' },
    { label: '검색', href: '/search' },
    { label: '캘린더', href: '/calendar' }
  ];

  return (
    <header className="sticky top-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 relative z-50">
      {/* 좌측 로고 및 앱명 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center">
            <img src="/images/logo/logo.png" alt="logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg md:text-xl" style={{ fontWeight: 700 }}>편리햄!</span>
        </button>
      </div>

      {/* 중앙 네비게이션 (데스크톱) */}
      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <PillNav
          items={navItems}
          activeHref={location.pathname}
          baseColor="#FF8A3D"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#1a1a1a"
          initialLoadAnimation={false}
        />
      </div>

      {/* 우측 액션 */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* 모바일 햄버거 메뉴 */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* 알림 & 프로필 */}
        <NotificationDropdown />
        <ProfileMenu />
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href);
                  setMobileMenuOpen(false);
                }}
                className={`px-6 py-4 text-left transition-colors ${
                  location.pathname === item.href
                    ? 'bg-orange-50 text-(--brand-orange) font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
