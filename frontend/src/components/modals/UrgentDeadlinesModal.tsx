/**
 * 마감 임박 목록 모달
 * - 목록 뷰: 마감 임박 공지사항 리스트
 * - 상세 뷰: 선택한 공지사항 상세 정보 (북마크, 완료 기능 포함)
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Star, Check, ArrowLeft, ExternalLink, FileText, Users, Hash, User, Calendar, Edit3, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { searchApi } from '@/services/api/search';
import { bookmarksApi } from '@/services/api/bookmarks';
import { completionsApi } from '@/services/api/completions';
import { getCategoryColor } from '@/utils/colorUtils';
import type { Notice } from '@/types/notice';

interface UrgentDeadlinesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalView = 'list' | 'detail';

export function UrgentDeadlinesModal({ open, onOpenChange }: UrgentDeadlinesModalProps) {
  const [view, setView] = useState<ModalView>('list');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 마감 임박 목록 조회
  const fetchUrgentDeadlines = async () => {
    try {
      setIsLoading(true);
      const { notices: allNotices } = await searchApi.searchPosts({
        page: 0,
        size: 100,
      });

      const urgentNotices = allNotices
        .filter((notice) => notice.dday !== null && notice.dday >= 0 && notice.dday <= 7)
        .sort((a, b) => (a.dday ?? 999) - (b.dday ?? 999));

      setNotices(urgentNotices);
    } catch (error) {
      console.error('[마감 임박 모달] 로드 실패:', error);
      toast.error('마감 임박 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUrgentDeadlines();
      setView('list');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedNotice(null);
  };

  // 북마크 토글
  const handleBookmarkToggle = async (id: number) => {
    if (!selectedNotice || selectedNotice.id !== id) return;

    const currentBookmarked = selectedNotice.bookmarked;
    try {
      setSelectedNotice({
        ...selectedNotice,
        bookmarked: !currentBookmarked,
      });

      await bookmarksApi.toggle(id, currentBookmarked);
      toast.success(currentBookmarked ? '북마크가 해제되었습니다.' : '북마크에 추가되었습니다.');
    } catch (error) {
      console.error('[북마크 토글] 실패:', error);
      setSelectedNotice({
        ...selectedNotice,
        bookmarked: currentBookmarked,
      });
      toast.error('북마크 처리에 실패했습니다.');
    }
  };

  // 완료 토글
  const handleCompleteToggle = async (id: number) => {
    if (!selectedNotice || selectedNotice.id !== id) return;

    const currentCompleted = selectedNotice.completed;
    try {
      setSelectedNotice({
        ...selectedNotice,
        completed: !currentCompleted,
      });

      await completionsApi.toggle(id);
      toast.success(currentCompleted ? '완료가 취소되었습니다.' : '완료 처리되었습니다.');
    } catch (error) {
      console.error('[완료 토글] 실패:', error);
      setSelectedNotice({
        ...selectedNotice,
        completed: currentCompleted,
      });
      toast.error('완료 처리에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getDdayColor = (dday: number) => {
    if (dday < 0) return 'bg-gray-400';
    if (dday <= 3) return 'bg-red-500';
    if (dday <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0" hideCloseButton>
        <DialogTitle className="sr-only">
          {view === 'list' ? '마감 임박 목록' : selectedNotice?.title || '공지사항 상세'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {view === 'list'
            ? '마감 임박 공지사항 목록을 확인할 수 있습니다.'
            : '공지사항의 상세 정보를 확인할 수 있습니다.'}
        </DialogDescription>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          {view === 'detail' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로가기
            </Button>
          )}
          {view === 'list' && (
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-(--brand-orange)" />
              마감 임박
            </h2>
          )}
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
        {view === 'list' && (
          <div className="overflow-y-auto px-6 py-4 space-y-3 flex-1">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : notices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                마감 임박 할일이 없습니다.
              </div>
            ) : (
              notices.map((notice) => {
                const categoryColor = getCategoryColor(notice.subcategory);
                return (
                  <div
                    key={notice.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleNoticeClick(notice)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded font-semibold"
                        style={{
                          backgroundColor: categoryColor.bg,
                          color: categoryColor.text,
                        }}
                      >
                        {notice.category}/{notice.subcategory}
                      </span>
                      {notice.dday !== null && notice.dday !== undefined && (
                        <span
                          className={`text-white text-xs px-2 py-0.5 rounded ${getDdayColor(
                            notice.dday
                          )}`}
                          style={{ fontWeight: 600 }}
                        >
                          {notice.dday === 0 ? 'D-Day' : notice.dday > 0 ? `D-${notice.dday}` : `D+${Math.abs(notice.dday)}`}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {notice.title}
                    </h3>
                    <div className="text-xs text-gray-500">
                      {notice.channel} · {formatDate(notice.createdAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 상세 뷰 */}
        {view === 'detail' && selectedNotice && (
          <div className="overflow-y-auto px-6 py-4 flex-1">
            {/* 제목 & 카테고리 */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{
                    backgroundColor: getCategoryColor(selectedNotice.subcategory).bg,
                    color: getCategoryColor(selectedNotice.subcategory).text,
                  }}
                >
                  {selectedNotice.category}/{selectedNotice.subcategory}
                </span>
                {selectedNotice.dday !== null && selectedNotice.dday !== undefined && (
                  <span
                    className={`text-white text-xs px-2 py-0.5 rounded ${getDdayColor(
                      selectedNotice.dday
                    )}`}
                    style={{ fontWeight: 600 }}
                  >
                    {selectedNotice.dday === 0 ? 'D-Day' : selectedNotice.dday > 0 ? `D-${selectedNotice.dday}` : `D+${Math.abs(selectedNotice.dday)}`}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{selectedNotice.title}</h2>
            </div>

            {/* 메타 정보 */}
            <div className="py-4 space-y-3">
              {selectedNotice.teamName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">팀:</span>
                  <span>{selectedNotice.teamName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="font-medium">채널:</span>
                <span>{selectedNotice.channel}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">작성자:</span>
                <span>{selectedNotice.author}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">작성일:</span>
                  <span>{formatDate(selectedNotice.createdAt)}</span>
                </div>
                {selectedNotice.updatedAt && selectedNotice.createdAt !== selectedNotice.updatedAt && (
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">수정일:</span>
                    <span>{formatDate(selectedNotice.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* 본문 */}
            <div className="py-6">
              <h3 className="text-sm mb-4 text-gray-500 font-bold">메시지 내용</h3>
              <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed wrap-break-word">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl mb-4 mt-6 font-bold" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl mb-3 mt-5 font-bold" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg mb-2 mt-4 font-bold" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-3 leading-relaxed" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-(--brand-orange) hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />
                    ),
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold" {...props} />
                    ),
                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-3"
                        {...props}
                      />
                    ),
                    code: ({ node, inline, ...props }: any) =>
                      inline ? (
                        <code
                          className="bg-gray-100 px-1.5 py-0.5 rounded text-sm"
                          {...props}
                        />
                      ) : (
                        <code
                          className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-3"
                          {...props}
                        />
                      ),
                    hr: ({ node, ...props }) => (
                      <hr className="my-4 border-gray-300" {...props} />
                    ),
                  }}
                >
                  {selectedNotice.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* 첨부파일 */}
            {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
              <>
                <Separator />
                <div className="py-6">
                  <h3 className="text-sm mb-4 text-gray-500 font-bold">첨부파일</h3>
                  <div className="space-y-2">
                    {selectedNotice.attachments.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-gray-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {file.name}
                          </div>
                          {file.size && (
                            <div className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 북마크 및 완료 체크 버튼 */}
            <div className="flex gap-2 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBookmarkToggle(selectedNotice.id)}
                className={`h-9 px-3 rounded-md text-sm transition-colors ${
                  selectedNotice.bookmarked
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Star className={`w-4 h-4 mr-1.5 ${selectedNotice.bookmarked ? 'fill-current' : ''}`} />
                {selectedNotice.bookmarked ? '북마크 해제' : '북마크'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCompleteToggle(selectedNotice.id)}
                className={`h-9 px-3 rounded-md text-sm transition-colors ${
                  selectedNotice.completed
                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Check className={`w-4 h-4 mr-1.5 ${selectedNotice.completed ? 'stroke-2' : ''}`} />
                {selectedNotice.completed ? '완료됨' : '완료 체크'}
              </Button>
            </div>

            {/* 푸터 액션 */}
            <Separator />
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="break-all">메시지 ID: {selectedNotice.id}</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {selectedNotice.mattermostUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full sm:w-auto"
                    onClick={() => window.open(selectedNotice.mattermostUrl, '_blank')}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    <span className="truncate">Mattermost에서 보기</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
