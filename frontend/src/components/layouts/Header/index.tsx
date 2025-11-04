import { useNavigate } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileMenu } from './ProfileMenu';

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Header = ({ showBackButton, onBack }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      {/* 로고 및 앱명 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-orange)] flex items-center justify-center">
            <span className="text-xl">🐹</span>
          </div>
          <span className="text-xl font-bold">편리햄!</span>
        </button>
      </div>

      {/* 우측 액션 (알림, 프로필) */}
      <div className="flex items-center gap-4">
        <NotificationDropdown />
        <ProfileMenu />
      </div>
    </header>
  );
};
