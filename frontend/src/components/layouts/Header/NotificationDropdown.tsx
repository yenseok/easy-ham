import { useState, useEffect } from "react";
import { Bell, AlertCircle, CheckCircle, Info, Settings } from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/utils/timeUtils";
import { calculateRemainingTime } from "@/utils/deadlineUtils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useSSEStore } from "@/stores/useSSEStore";
import { SubscriptionKeywordModal } from "@/components/modals/SubscriptionKeywordModal";
import {
  MessageDetailModal,
  type MessageDetail,
} from "@/components/modals/MessageDetailModal";
import { getPostDetail } from "@/services/api/posts";
import { convertSearchItemToNotice } from "@/utils/searchMapper";

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(
    null
  );
  const [, setRefreshTrigger] = useState(0);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();
  const { notificationStreamStatus } = useSSEStore();

  // 드롭다운이 열려있을 때 30초마다 시간 재계산 (deadline 배지 갱신용)
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 30000); // 30초마다 갱신

    return () => clearInterval(interval);
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "danger":
        return "border-l-red-500";
      case "success":
        return "border-l-green-500";
      case "info":
        return "border-l-blue-500";
      default:
        return "border-l-gray-500";
    }
  };

  const handleNotificationClick = async (
    notificationId: string,
    notice_id?: number
  ) => {
    // 알림 읽음 처리 (비동기이지만 await하지 않음 - 즉시 UI 업데이트)
    markAsRead(notificationId);

    // notice_id가 없으면 반환
    if (!notice_id) {
      console.warn("[NotificationDropdown] notice_id is missing");
      return;
    }

    // 상세 공지 정보를 가져와서 모달 열기
    try {
      const response = await getPostDetail(notice_id);

      if (response.data) {
        // SearchResultItem → Notice 변환
        const notice = convertSearchItemToNotice(response.data);

        // Notice → MessageDetail 변환 (Search 페이지와 동일한 로직)
        const mattermostUrl =
          notice.mattermostUrl ||
          `https://mattermost.ssafy.com/ssafy/pl/message${notice.id}`;
        const messageDetail: MessageDetail = {
          id: notice.id,
          title: notice.title,
          content: notice.content,
          author: notice.author,
          category: notice.category,
          subcategory: notice.subcategory,
          created_at: notice.createdAt,
          updated_at: notice.updatedAt,
          channel: notice.channel,
          teamName: notice.teamName,
          dday: notice.dday,
          mattermostUrl,
          attachments: notice.attachments,
        };

        setSelectedMessage(messageDetail);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error(
        "[NotificationDropdown] Failed to fetch post detail:",
        error
      );
      toast.error("공지사항 상세 정보를 불러올 수 없습니다.");
    }
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
      <DropdownMenuContent
        align="end"
        className="w-[360px] max-h-[400px] overflow-y-auto p-0"
      >
        {/* 헤더 */}
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">알림</h3>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  notificationStreamStatus === "connected"
                    ? "bg-green-100 text-green-700"
                    : notificationStreamStatus === "connecting"
                    ? "bg-yellow-100 text-yellow-700"
                    : notificationStreamStatus === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    notificationStreamStatus === "connected"
                      ? "bg-green-600"
                      : notificationStreamStatus === "connecting"
                      ? "bg-yellow-600"
                      : notificationStreamStatus === "error"
                      ? "bg-red-600"
                      : "bg-gray-600"
                  }`}
                />
                {notificationStreamStatus === "connected"
                  ? "연결됨"
                  : notificationStreamStatus === "connecting"
                  ? "연결 중"
                  : notificationStreamStatus === "error"
                  ? "에러"
                  : "끊김"}
              </span>
            </div>
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
                onClick={() =>
                  handleNotificationClick(notif.id, notif.notice_id)
                }
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-l-4 cursor-pointer ${getBorderColor(
                  notif.type
                )} ${!notif.read ? "bg-blue-50" : ""}`}
              >
                <div className="shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  {/* 제목 */}
                  <p className="text-sm font-medium text-gray-900">
                    {notif.title}
                  </p>
                  {/* 상대 시간 + 배지 */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">
                      {notif.relativeTime || formatRelativeTime(notif.time)}
                    </p>
                    {notif.badge && (
                      <span className="shrink-0 text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {notif.deadline
                          ? calculateRemainingTime(notif.deadline)
                          : notif.badge}
                      </span>
                    )}
                  </div>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
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

      {/* 공지사항 상세 모달 */}
      <MessageDetailModal
        message={selectedMessage}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </DropdownMenu>
  );
};
