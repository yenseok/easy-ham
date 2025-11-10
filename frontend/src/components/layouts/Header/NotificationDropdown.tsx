import { useState } from 'react';
import { Bell, AlertCircle, CheckCircle, Info, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { SubscriptionKeywordModal } from '@/components/modals/SubscriptionKeywordModal';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'danger':
        return 'border-l-red-500';
      case 'success':
        return 'border-l-green-500';
      case 'info':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const handleNotificationClick = (notificationId: number) => {
    markAsRead(notificationId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] max-h-[400px] overflow-y-auto p-0">
        {/* 헤더 */}
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">알림</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  모두 읽음
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsKeywordModalOpen(true);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="구독 키워드 관리"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* 알림 목록 */}
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">알림이 없습니다</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id)}
                className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-l-4 cursor-pointer ${getBorderColor(notif.type)} ${
                  !notif.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>

      {/* 구독 키워드 관리 모달 */}
      <SubscriptionKeywordModal
        isOpen={isKeywordModalOpen}
        onOpenChange={setIsKeywordModalOpen}
      />
    </DropdownMenu>
  );
};
