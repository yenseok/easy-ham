import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Check, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNotificationSettingsStore } from "@/stores/useNotificationSettingsStore";
import { toast } from "sonner";

interface SubscriptionKeywordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const availableKeywords = [
  "프로젝트",
  "취업",
  "특강",
  "공지",
  "행사",
  "MT",
  "스터디",
  "멘토링",
  "채용",
  "코딩테스트",
  "알고리즘",
  "면접",
  "포트폴리오",
  "제출",
  "발표",
];

export function SubscriptionKeywordModal({
  isOpen,
  onOpenChange,
}: SubscriptionKeywordModalProps) {
  const [customKeyword, setCustomKeyword] = useState("");
  const [localDeadlineHours, setLocalDeadlineHours] = useState(6);
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);

  const {
    deadlineAlertHours,
    jobAlertEnabled,
    keywordAlertEnabled,
    isLoading,
    error,
    subscribedKeywords,
    keywordLoading,
    keywordError,
    fetchSettings,
    fetchSubscribedKeywords,
    updateDeadlineAlertHours,
    updateJobAlertEnabled,
    updateKeywordAlertEnabled,
    addKeyword,
    removeKeyword,
    clearError,
    clearKeywordError,
  } = useNotificationSettingsStore();

  // 모달 열림 시 알림 설정 및 구독 키워드 조회
  useEffect(() => {
    if (isOpen) {
      fetchSettings().catch(() => {
        toast.error("알림 설정을 불러오지 못했습니다.");
      });
      fetchSubscribedKeywords().catch(() => {
        toast.error("구독 키워드를 불러오지 못했습니다.");
      });
    }
  }, [isOpen, fetchSettings, fetchSubscribedKeywords]);

  // 스토어 값 변경 감지
  useEffect(() => {
    setLocalDeadlineHours(deadlineAlertHours);
  }, [deadlineAlertHours]);

  // 에러 발생 시 토스트 표시
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // 키워드 에러 발생 시 토스트 표시
  useEffect(() => {
    if (keywordError) {
      toast.error(keywordError);
      clearKeywordError();
    }
  }, [keywordError, clearKeywordError]);

  const handleAddPresetKeyword = async (keyword: string) => {
    const isAlreadySubscribed = subscribedKeywords.some(
      (k) => k.keyword === keyword
    );

    if (isAlreadySubscribed) {
      toast.error("이미 구독 중인 키워드입니다.");
      return;
    }

    if (subscribedKeywords.length >= 5) {
      toast.error("최대 5개까지만 구독할 수 있습니다.");
      return;
    }

    try {
      await addKeyword(keyword);
      toast.success(`'${keyword}' 키워드를 구독했습니다.`);
    } catch {
      // 에러는 스토어에서 처리됨
    }
  };

  const handleAddCustomKeyword = async () => {
    const trimmedKeyword = customKeyword.trim();

    if (!trimmedKeyword) {
      toast.error("키워드를 입력해주세요.");
      return;
    }

    const isAlreadySubscribed = subscribedKeywords.some(
      (k) => k.keyword === trimmedKeyword
    );

    if (isAlreadySubscribed) {
      toast.error("이미 구독 중인 키워드입니다.");
      return;
    }

    if (subscribedKeywords.length >= 5) {
      toast.error("최대 5개까지만 구독할 수 있습니다.");
      return;
    }

    try {
      await addKeyword(trimmedKeyword);
      setCustomKeyword("");
      toast.success(`'${trimmedKeyword}' 키워드를 구독했습니다.`);
    } catch {
      // 에러는 스토어에서 처리됨
    }
  };

  const handleRemoveKeyword = async (keywordId: number) => {
    try {
      await removeKeyword(keywordId);
      toast.success("키워드가 삭제되었습니다.");
    } catch {
      // 에러는 스토어에서 처리됨
    }
  };

  const handleSaveDeadlineHours = async () => {
    setIsSavingDeadline(true);
    try {
      await updateDeadlineAlertHours(localDeadlineHours);
      toast.success("마감 시간 알림이 저장되었습니다.");
    } catch {
      // 에러는 스토어에서 처리됨
    } finally {
      setIsSavingDeadline(false);
    }
  };

  const handleJobAlertToggle = async (enabled: boolean) => {
    try {
      await updateJobAlertEnabled(enabled);
      toast.success(
        enabled
          ? "채용정보 알림을 활성화했습니다."
          : "채용정보 알림을 비활성화했습니다."
      );
    } catch {
      // 에러는 스토어에서 처리됨
    }
  };

  const handleKeywordAlertToggle = async (enabled: boolean) => {
    try {
      await updateKeywordAlertEnabled(enabled);
      toast.success(
        enabled
          ? "키워드 알림을 활성화했습니다."
          : "키워드 알림을 비활성화했습니다."
      );
    } catch {
      // 에러는 스토어에서 처리됨
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>알림 설정</DialogTitle>
          <DialogDescription>
            알림 수신 방식과 구독 키워드를 설정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 알림 설정 섹션 */}
          <div className="space-y-3 pb-4 border-b">
            {/* 마감 기한 알림 시간 */}
            <div className="flex items-center justify-between">
              <Label htmlFor="deadline-hours" className="text-sm">
                마감기한 전 몇시간에 알려드릴까요?
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="deadline-hours"
                  type="number"
                  min="1"
                  max="168"
                  value={localDeadlineHours}
                  onChange={(e) =>
                    setLocalDeadlineHours(parseInt(e.target.value) || 6)
                  }
                  className="w-16 text-center"
                  disabled={isSavingDeadline}
                />
                <span className="text-sm text-gray-500">시간</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveDeadlineHours}
                  disabled={
                    isSavingDeadline ||
                    localDeadlineHours === deadlineAlertHours
                  }
                  className="h-8 w-8 p-0"
                >
                  {isSavingDeadline ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* 채용정보 알림 토글 */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">채용정보 알림을 받으시겠습니까?</Label>
              <Switch
                checked={jobAlertEnabled}
                onCheckedChange={handleJobAlertToggle}
                disabled={isLoading}
              />
            </div>

            {/* 키워드 알림 토글 */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">키워드 알림을 받으시겠습니까?</Label>
              <Switch
                checked={keywordAlertEnabled}
                onCheckedChange={handleKeywordAlertToggle}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 키워드 구독 섹션 */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              구독 키워드
            </Label>
            <p className="text-xs text-gray-500 mb-3">
              관심 있는 키워드를 선택하면 관련 공지사항을 우선적으로
              알려드립니다.
            </p>
          </div>

          {/* 카운터 */}
          <div className="text-sm text-gray-500 text-right">
            {subscribedKeywords.length} / 5
          </div>

          {/* 선택된 키워드 */}
          {subscribedKeywords.length > 0 && (
            <div>
              <Label className="mb-2 block text-xs">선택된 키워드</Label>
              <div className="flex flex-wrap gap-2">
                {subscribedKeywords.map((item) => (
                  <Badge
                    key={item.keywordId}
                    className="bg-[var(--brand-orange)] text-white px-3 py-1.5 flex items-center gap-2"
                  >
                    {item.keyword}
                    <button
                      onClick={() => handleRemoveKeyword(item.keywordId)}
                      className="hover:opacity-70"
                      disabled={keywordLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* 사용 가능한 키워드 */}
          <div>
            <Label className="mb-2 block text-xs">사용 가능한 키워드</Label>
            <div className="flex flex-wrap gap-2">
              {availableKeywords
                .filter((k) => !subscribedKeywords.some((sub) => sub.keyword === k))
                .map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="outline"
                    className={`px-3 py-1.5 cursor-pointer transition-colors ${
                      subscribedKeywords.length >= 5 || keywordLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[var(--brand-orange-light)] hover:border-[var(--brand-orange)]"
                    }`}
                    onClick={() => handleAddPresetKeyword(keyword)}
                  >
                    {keyword}
                  </Badge>
                ))}
            </div>
          </div>

          <Separator />

          {/* 직접 입력 */}
          <div>
            <Label className="mb-2 block text-xs">직접 입력</Label>
            <div className="flex gap-2">
              <Input
                placeholder="키워드를 입력하세요"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomKeyword();
                  }
                }}
                disabled={subscribedKeywords.length >= 5 || keywordLoading}
              />
              <Button
                onClick={handleAddCustomKeyword}
                variant="outline"
                disabled={subscribedKeywords.length >= 5 || keywordLoading}
                className="border-[var(--brand-orange)] text-[var(--brand-orange)] hover:bg-[var(--brand-orange-light)]"
              >
                {keywordLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "추가"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
