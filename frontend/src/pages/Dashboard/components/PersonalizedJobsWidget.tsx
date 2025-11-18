import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobPostItem } from "@/types/api";
import { Briefcase, ExternalLink } from "lucide-react";

interface PersonalizedJobsWidgetProps {
  jobs: JobPostItem[];
}

export default function PersonalizedJobsWidget({
  jobs,
}: PersonalizedJobsWidgetProps) {
  const getDdayColor = (dday: number) => {
    if (dday <= 3) return "bg-red-500";
    if (dday <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const calculateDday = (deadline: string | null): number | null => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const handleJobClick = (url: string | null) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="shadow-md">
      <div className="h-16 px-6 flex items-center gap-2 border-b">
        <Briefcase className="w-5 h-5 text-(--brand-orange)" />
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
                  onClick={() => handleJobClick(job.url)}
                  className={`p-3 border rounded-lg hover:shadow-md transition-shadow hover:border-(--brand-orange) ${
                    job.url ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs px-2 py-0.5 border bg-blue-50 text-blue-700 border-blue-200">
                        {job.positionName}
                      </Badge>
                      {dday !== null && dday >= 0 && (
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
                    {job.url && <ExternalLink className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div
                    className="text-sm font-semibold text-gray-900 mb-1"
                  >
                    {job.company}
                  </div>
                  <div
                    className="text-xs text-gray-600 line-clamp-1"
                  >
                    {job.position}
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
