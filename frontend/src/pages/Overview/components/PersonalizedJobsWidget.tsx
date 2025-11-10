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

  return (
    <Card className="shadow-md">
      <div className="h-12 px-6 flex items-center border-b">
        <h2 className="text-base" style={{ fontWeight: 700 }}>
          💼 맞춤 채용
        </h2>
      </div>
      <div className="p-4">
        {jobs.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-8">
            추천 채용공고가 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-white"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm line-clamp-1 mb-1"
                      style={{ fontWeight: 600 }}
                    >
                      {job.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px] px-1.5 py-0 border bg-blue-100 text-blue-700 border-blue-300">
                        취업
                      </Badge>
                      {job.dday !== null && (
                        <span
                          className={`text-white text-[10px] px-1.5 py-0.5 rounded ${getDdayColor(
                            job.dday
                          )}`}
                          style={{ fontWeight: 600 }}
                        >
                          D-{job.dday}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
