import { useLocation, useNavigate } from 'react-router-dom';
import PillNav from '@/components/common/PillNav';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileMenu } from './ProfileMenu';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: '홈', href: '/dashboard' },
    { label: '검색', href: '/search' },
    { label: '캘린더', href: '/calendar' }
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 relative">
      {/* 좌측 로고 및 앱명 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            <img src="/images/logo/logo.png" alt="logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl" style={{ fontWeight: 700 }}>편리햄!</span>
        </button>
      </div>

      {/* 중앙 네비게이션 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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

      {/* 우측 액션 (알림, 프로필) */}
      <div className="flex items-center gap-4">
        <NotificationDropdown />
        <ProfileMenu />
      </div>
    </header>
  );
};
