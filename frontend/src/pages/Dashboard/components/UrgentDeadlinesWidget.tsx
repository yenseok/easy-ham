import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Notice } from "@/types/notice";
import { Clock } from "lucide-react";

interface UrgentDeadlinesWidgetProps {
  notices: Notice[];
  onNoticeClick?: (notice: Notice) => void;
}

export default function UrgentDeadlinesWidget({
  notices,
  onNoticeClick,
}: UrgentDeadlinesWidgetProps) {
  const getDdayColor = (daysLeft: number) => {
    if (daysLeft <= 3) return "bg-red-500";
    if (daysLeft <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const calculateDday = (deadline: string | Date | undefined): number | null => {
    if (!deadline) return null;
    const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  return (
    <Card className="shadow-md">
      <div className="h-16 px-6 flex items-center gap-2 border-b">
        <Clock className="w-5 h-5 text-(--brand-orange)" />
        <h2 className="text-lg" style={{ fontWeight: 700 }}>
          마감 임박
        </h2>
      </div>
      <div className="px-4 py-4">
        {notices.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">
            마감 임박 할일이 없습니다
          </div>
        ) : (
          <div className="space-y-2.5">
            {notices.map((notice) => {
              const dday = calculateDday(notice.deadline);
              return (
                <div
                  key={notice.id}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                  onClick={() => onNoticeClick?.(notice)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-xs px-2 py-0.5 border bg-red-50 text-red-700 border-red-200">
                      {notice.subcategory}
                    </Badge>
                    {dday !== null && (
                      <span
                        className={`text-white text-xs ${dday === 0 ? 'px-1.5' : 'px-2'} py-0.5 rounded ${getDdayColor(
                          dday
                        )}`}
                        style={{ fontWeight: 600 }}
                      >
                        {dday === 0 ? 'D-Day' : `D-${dday}`}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-sm line-clamp-2 text-gray-800"
                    style={{ fontWeight: 500 }}
                  >
                    {notice.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
