import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { MessageHeader } from './components/MessageHeader';
import { MessageMeta } from './components/MessageMeta';
import { AttachmentList } from './components/AttachmentList';
import type { Subcategory, Attachment } from '@/types/notice';

export interface MessageDetailModalProps {
  message: MessageDetail | null;
  isOpen: boolean;
  onClose: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export interface MessageDetail {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  subcategory: Subcategory;
  created_at: string;
  updated_at: string;
  channel: string;
  teamName?: string;
  dday?: number | null;
  mattermostUrl?: string;
  attachments?: Attachment[];
}

/**
 * 메시지 상세 정보를 모달로 표시하는 컴포넌트
 *
 * @example
 * <MessageDetailModal message={message} isOpen={isOpen} onClose={handleClose} />
 */
export const MessageDetailModal = ({
  message,
  isOpen,
  onClose,
  showBackButton = false,
  onBack,
}: MessageDetailModalProps) => {
  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 w-[64vw] sm:w-[62vw] md:w-[57vw] lg:w-[53vw] xl:w-[50vw] sm:max-w-[62vw] md:max-w-[57vw] lg:max-w-[53vw] xl:max-w-[50vw] max-w-4xl">
        {/* 뒤로가기 버튼 (옵션) */}
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute top-4 left-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
        )}

        {/* 메시지 헤더 */}
        <MessageHeader
          title={message.title}
          category={message.category}
          subcategory={message.subcategory}
          dday={message.dday}
        />

        {/* 메시지 메타정보 (팀, 채널, 작성자, 날짜) */}
        <MessageMeta
          teamName={message.teamName}
          channel={message.channel}
          author={message.author}
          createdAt={message.created_at}
          updatedAt={message.updated_at}
        />

        <Separator />

        {/* 메시지 본문 */}
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
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* 첨부파일 섹션 */}
        {message.attachments && message.attachments.length > 0 && (
          <>
            <Separator />
            <AttachmentList attachments={message.attachments} />
          </>
        )}

        {/* 푸터 액션 */}
        <Separator />
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="break-all">메시지 ID: {message.id}</span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {message.mattermostUrl && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-auto"
                onClick={() => window.open(message.mattermostUrl, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                <span className="truncate">Mattermost에서 보기</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
