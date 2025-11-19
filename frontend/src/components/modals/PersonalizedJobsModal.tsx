/**
 * 맞춤 채용 목록 모달
 * - 사용자에게 맞춤화된 채용공고 리스트
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Briefcase, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { jobsApi } from '@/services/api/jobs';
import type { JobPostItem } from '@/types/api';

interface PersonalizedJobsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonalizedJobsModal({ open, onOpenChange }: PersonalizedJobsModalProps) {
  const [jobs, setJobs] = useState<JobPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 맞춤 채용 목록 조회
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const jobPosts = await jobsApi.getPersonalizedJobs();
      setJobs(jobPosts);
    } catch (error) {
      console.error('[맞춤 채용 모달] 로드 실패:', error);
      toast.error('맞춤 채용 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 열림 시 데이터 로드
  useEffect(() => {
    if (open) {
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // D-day 계산
  const calculateDday = (deadline: string | null): number | null => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  // D-day 색상
  const getDdayColor = (dday: number) => {
    if (dday <= 3) return 'bg-red-500';
    if (dday <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // 채용공고 클릭 (외부 링크)
  const handleJobClick = (url: string | null) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0" hideCloseButton>
        {/* 접근성을 위한 숨겨진 제목 및 설명 */}
        <DialogTitle className="sr-only">맞춤 채용 목록</DialogTitle>
        <DialogDescription className="sr-only">
          사용자에게 맞춤화된 채용공고 목록을 확인할 수 있습니다.
        </DialogDescription>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-(--brand-orange)" />
            맞춤 채용
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="ml-auto"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 목록 뷰 */}
        <div className="overflow-y-auto px-6 py-4 space-y-3 flex-1">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              추천 채용공고가 없습니다.
            </div>
          ) : (
            jobs.map((job) => {
              const dday = calculateDday(job.deadline);
              return (
                <div
                  key={job.id}
                  onClick={() => handleJobClick(job.url)}
                  className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    job.url ? 'cursor-pointer hover:border-(--brand-orange)' : 'cursor-default'
                  }`}
                >
                  {/* 배지 & D-day */}
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

                  {/* 회사명 */}
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {job.company}
                  </div>

                  {/* 포지션 */}
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {job.position}
                  </div>

                  {/* 채널 & 작성일 */}
                  <div className="text-xs text-gray-500 mt-2">
                    {job.channelName} · {new Date(job.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
