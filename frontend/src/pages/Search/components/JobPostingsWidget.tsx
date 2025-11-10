import { Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface JobPosting {
  id: number;
  company: string;
  position: string;
  dday: number;
  logo?: string;
}

interface JobPostingsWidgetProps {
  postings: JobPosting[];
  onViewAll?: () => void;
}

const getDdayColor = (dday: number): string => {
  if (dday <= 3) return 'text-red-500 bg-red-50';
  if (dday <= 7) return 'text-yellow-500 bg-yellow-50';
  return 'text-green-500 bg-green-50';
};

export function JobPostingsWidget({
  postings,
  onViewAll,
}: JobPostingsWidgetProps) {
  const recentPostings = postings.slice(0, 3);

  return (
    <Card className="p-5 border border-gray-200">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">채용 정보</h3>
        </div>
        {postings.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="h-8 text-xs"
          >
            전체보기
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      {/* 채용공고 목록 */}
      {recentPostings.length > 0 ? (
        <div className="space-y-3">
          {recentPostings.map((posting) => (
            <div
              key={posting.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {posting.company}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {posting.position}
                </p>
              </div>

              <div
                className={`ml-2 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getDdayColor(
                  posting.dday
                )}`}
              >
                D-{posting.dday}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">채용 정보가 없습니다</p>
        </div>
      )}
    </Card>
  );
}
