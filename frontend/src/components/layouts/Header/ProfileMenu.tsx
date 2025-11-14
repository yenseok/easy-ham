import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/useAuthStore';

export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleMyPageClick = () => {
    setIsOpen(false);
    navigate('/mypage');
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="w-8 h-8 rounded-full bg-[var(--brand-orange)] flex items-center justify-center hover:bg-[var(--brand-orange-dark)] transition-colors">
            <User className="w-5 h-5 text-white" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* 사용자 정보 표시 (선택사항) */}
        {user && (
          <div className="px-2 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">{user.nickname}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        )}

        {/* 마이페이지 */}
        <DropdownMenuItem onClick={handleMyPageClick} className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          마이페이지
        </DropdownMenuItem>

        {/* 로그아웃 */}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
