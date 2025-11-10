import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Notice } from "@/types/notice";
import { Briefcase } from "lucide-react";

interface PersonalizedJobsWidgetProps {
  jobs: Notice[];
}

export default function PersonalizedJobsWidget({
  jobs,
}: PersonalizedJobsWidgetProps) {
  const getDdayColor = (dday: number) => {
    if (dday <= 3) return "bg-red-500";
    if (dday <= 7) return "bg-yellow-500";
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
        <Briefcase className="w-5 h-5 text-[var(--brand-orange)]" />
        <h2 className="text-lg" style={{ fontWeight: 700 }}>
          맞춤 채용
        </h2>
      </div>
      <div className="px-4 py-4">
        {jobs.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">
            추천 채용공고가 없습니다
          </div>
        ) : (
          <div className="space-y-2.5">
            {jobs.map((job) => {
              const dday = calculateDday(job.deadline);
              return (
                <div
                  key={job.id}
                  className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-[var(--brand-orange)]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-xs px-2 py-0.5 border bg-blue-50 text-blue-700 border-blue-200">
                      {job.subcategory}
                    </Badge>
                    {dday !== null && dday >= 0 && (
                      <span
                        className={`text-white text-xs px-2 py-0.5 rounded ${getDdayColor(
                          dday
                        )}`}
                        style={{ fontWeight: 600 }}
                      >
                        D-{dday}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-sm line-clamp-2 text-gray-800"
                    style={{ fontWeight: 500 }}
                  >
                    {job.title}
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
