/**
 * 북마크 목록 모달
 * - 목록 뷰: 북마크된 공지사항 리스트
 * - 상세 뷰: 선택한 공지사항 상세 정보
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Star, ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { bookmarksApi } from '@/services/api/bookmarks';
import { getCategoryColor } from '@/utils/colorUtils';
import { convertBookmarkItemToNotice } from '@/utils/bookmarkMapper';
import { Bookmark } from "lucide-react";
import type { Notice } from '@/types/notice';

interface BookmarksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalView = 'list' | 'detail';

export function BookmarksModal({ open, onOpenChange }: BookmarksModalProps) {
  const [view, setView] = useState<ModalView>('list');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 북마크 목록 조회 (북마크 전용 API 사용)
  // 검색 API의 size 제한 문제를 해결: 북마크된 것만 정확하게 가져옴
  const fetchBookmarks = async () => {
    try {
      setIsLoading(true);
      const { notices: bookmarkItems } = await bookmarksApi.getList({
        sort: 'recent', // 최신순 정렬
      });
      const notices = bookmarkItems.map(convertBookmarkItemToNotice);
      // console.log('[북마크 모달] 조회된 북마크 개수:', notices.length);
      // console.log('[북마크 모달] 북마크 ID 목록:', notices.map(n => n.id));
      setNotices(notices);
    } catch (error) {
      console.error('[북마크 모달] 로드 실패:', error);
      // toast.error('북마크 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 열림 시 데이터 로드
  useEffect(() => {
    if (open) {
      fetchBookmarks();
      setView('list'); // 모달 열 때 목록 뷰로 초기화
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 공지사항 클릭 → 상세 뷰
  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setView('detail');
  };

  // 뒤로가기
  const handleBack = () => {
    setView('list');
    setSelectedNotice(null);
  };

  // 북마크 해제 (항상 해제만 하므로 toggle의 두 번째 인자는 항상 true)
  const handleBookmarkRemove = async (id: number) => {
    try {
      // 먼저 UI에서 제거 (낙관적 업데이트)
      setNotices((prev) => prev.filter((n) => n.id !== id));

      // API 호출 - 북마크 해제 (currentBookmarked = true)
      await bookmarksApi.toggle(id, true);
      toast.success('북마크가 해제되었습니다.');
    } catch (error) {
      console.error('[북마크 해제] 실패:', error);
      // 실패 시 데이터 다시 로드
      fetchBookmarks();
      toast.error('북마크 해제에 실패했습니다.');
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // D-day 색상 (Dashboard와 동일)
  const getDdayColor = (dday: number) => {
    if (dday <= 3) return 'bg-red-500';
    if (dday <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0" hideCloseButton>
        {/* 접근성을 위한 숨겨진 제목 및 설명 */}
        <DialogTitle className="sr-only">
          {view === 'list' ? '북마크 목록' : selectedNotice?.title || '공지사항 상세'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {view === 'list' 
            ? '북마크한 공지사항 목록을 확인하고 관리할 수 있습니다.'
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
              <Bookmark className="w-5 h-5 text-(--brand-orange)" />
              북마크 목록
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
                북마크한 공지사항이 없습니다.
              </div>
            ) : (
              notices.map((notice) => {
                const categoryColor = getCategoryColor(notice.subcategory);
                return (
                  <div
                    key={notice.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {/* 왼쪽: 정보 (클릭 가능) */}
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => handleNoticeClick(notice)}
                    >
                      {/* 카테고리 배지 */}
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
                        {/* D-day */}
                        {notice.dday !== null && notice.dday !== undefined && (
                          <span
                            className={`text-white text-xs px-2 py-0.5 rounded ${getDdayColor(
                              notice.dday
                            )}`}
                            style={{ fontWeight: 600 }}
                          >
                            D-{notice.dday}
                          </span>
                        )}
                      </div>

                      {/* 제목 */}
                      <h3 className="font-semibold text-sm mb-1 truncate">
                        {notice.title}
                      </h3>

                      {/* 작성자 & 날짜 */}
                      <div className="text-xs text-gray-500">
                        {notice.author} · {formatDate(notice.createdAt)}
                      </div>
                    </div>

                    {/* 오른쪽: 북마크 해제 버튼 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmarkRemove(notice.id);
                      }}
                    >
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    </Button>
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
                    backgroundColor: getCategoryColor(selectedNotice.subcategory)
                      .bg,
                    color: getCategoryColor(selectedNotice.subcategory).text,
                  }}
                >
                  {selectedNotice.category}/{selectedNotice.subcategory}
                </span>
                {/* D-day */}
                {selectedNotice.dday !== null &&
                  selectedNotice.dday !== undefined && (
                    <span
                      className={`text-white text-xs px-2 py-0.5 rounded ${getDdayColor(
                        selectedNotice.dday
                      )}`}
                      style={{ fontWeight: 600 }}
                    >
                      D-{selectedNotice.dday}
                    </span>
                  )}
              </div>
              <h2 className="text-2xl font-bold">{selectedNotice.title}</h2>
            </div>

            {/* 메타 정보 */}
            <div className="text-sm text-gray-600 mb-4 space-y-1">
              <div>채널: {selectedNotice.channel}</div>
              <div>작성자: {selectedNotice.author}</div>
              <div>작성일: {formatDate(selectedNotice.createdAt)}</div>
              {selectedNotice.updatedAt && (
                <div>수정일: {formatDate(selectedNotice.updatedAt)}</div>
              )}
            </div>

            <Separator className="my-4" />

            {/* 본문 */}
            <div className="py-4">
              <h3 className="text-sm mb-4 text-gray-500 font-bold">
                메시지 내용
              </h3>
              <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
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
                      <ul
                        className="list-disc pl-6 mb-3 space-y-1"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal pl-6 mb-3 space-y-1"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-1" {...props} />
                    ),
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
                  {selectedNotice.content || '내용이 없습니다.'}
                </ReactMarkdown>
              </div>
            </div>

            {/* 첨부파일 */}
            {selectedNotice.attachments &&
              selectedNotice.attachments.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="py-4">
                    <h3 className="text-sm mb-4 text-gray-500 font-bold">
                      첨부파일
                    </h3>
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

            {/* 푸터 액션 */}
            <Separator className="my-4" />
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs text-gray-500">
                메시지 ID: {selectedNotice.id}
              </div>
              {selectedNotice.mattermostUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(selectedNotice.mattermostUrl, '_blank')
                  }
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Mattermost에서 보기
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
