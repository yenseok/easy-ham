import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Notice } from "@/types/notice";
import { AlertCircle } from "lucide-react";

interface UrgentDeadlinesWidgetProps {
  notices: Notice[];
}

export default function UrgentDeadlinesWidget({
  notices,
}: UrgentDeadlinesWidgetProps) {
  const getDdayColor = (dday: number) => {
    if (dday <= 3) return "bg-red-500";
    if (dday <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="shadow-md">
      <div className="h-12 px-6 flex items-center border-b">
        <h2 className="text-base" style={{ fontWeight: 700 }}>
          ⏰ 마감 임박
        </h2>
      </div>
      <div className="p-4">
        {notices.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-8">
            마감 임박 할일이 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle
                    className={`w-3.5 h-3.5 ${
                      notice.dday && notice.dday <= 3
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  />
                  <Badge className="text-[10px] px-1.5 py-0 border bg-red-100 text-red-700 border-red-300">
                    할일
                  </Badge>
                  {notice.dday !== null && (
                    <span
                      className={`text-white text-[10px] px-1.5 py-0.5 rounded ${getDdayColor(
                        notice.dday
                      )}`}
                      style={{ fontWeight: 600 }}
                    >
                      D-{notice.dday}
                    </span>
                  )}
                </div>
                <div
                  className="text-sm line-clamp-1"
                  style={{ fontWeight: 500 }}
                >
                  {notice.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
