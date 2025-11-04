import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  CalendarIcon,
  User,
  Clock,
  Edit3,
  ExternalLink,
  Download,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import ReactMarkdown from "react-markdown";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf" | "excel" | "file";
  mimeType?: string;
}

export interface MessageDetail {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  subcategory: string;
  created_at: string;
  updated_at: string;
  channel: string;
  dday?: number | null;
  mattermostUrl?: string;
  attachments?: MessageAttachment[];
}

interface MessageDetailModalProps {
  message: MessageDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MessageDetailModal({
  message,
  isOpen,
  onClose,
}: MessageDetailModalProps) {
  if (!message) return null;

  // D-day 배지 색상
  const getDdayBadgeColor = (dday: number | null): string => {
    if (dday === null) return "bg-gray-400 text-white";
    if (dday >= 1 && dday <= 3) return "bg-red-500 text-white";
    if (dday >= 4 && dday <= 7) return "bg-yellow-500 text-white";
    return "bg-green-500 text-white";
  };

  // 카테고리 색상
  const getCategoryColor = (subcategory: string): string => {
    const colors: Record<string, string> = {
      할일: "bg-red-100 text-red-700 border-red-300",
      특강: "bg-blue-100 text-blue-700 border-blue-300",
      정보: "bg-green-100 text-green-700 border-green-300",
      행사: "bg-purple-100 text-purple-700 border-purple-300",
    };
    return colors[subcategory] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  // 첨부파일 아이콘
  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "pdf":
      case "excel":
      case "file":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl !max-w-6xl max-h-[85vh] overflow-y-auto p-8">
        {/* 헤더 */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start gap-3 mb-3">
            {/* D-day 배지 */}
            {message.dday !== null && message.dday !== undefined && (
              <Badge
                className={`${getDdayBadgeColor(
                  message.dday
                )} px-2.5 py-1 shrink-0`}
              >
                D-{message.dday}
              </Badge>
            )}

            {/* 카테고리 라벨 */}
            <Badge
              className={`${getCategoryColor(
                message.subcategory
              )} px-2.5 py-1 shrink-0 border`}
            >
              {message.category}-{message.subcategory}
            </Badge>
          </div>

          <DialogTitle
            className="text-2xl pr-8"
            style={{ fontWeight: 700, lineHeight: 1.4 }}
          >
            {message.title}
          </DialogTitle>

          <DialogDescription className="sr-only">
            {message.category} {message.subcategory} 메시지 상세 정보
          </DialogDescription>
        </DialogHeader>

        {/* 메타 정보 섹션 */}
        <div className="py-4 space-y-3">
          {/* 채널 정보 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 rounded-full bg-[var(--brand-orange-light)] flex items-center justify-center">
              <span className="text-xs">📢</span>
            </div>
            <span style={{ fontWeight: 500 }}>{message.channel}</span>
          </div>

          {/* 작성자 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-500" />
            <span style={{ fontWeight: 500 }}>작성자:</span>
            <span>{message.author}</span>
          </div>

          {/* 날짜 정보 */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <span style={{ fontWeight: 500 }}>작성일:</span>
              <span>{message.created_at}</span>
            </div>

            {message.created_at !== message.updated_at && (
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-gray-500" />
                <span style={{ fontWeight: 500 }}>수정일:</span>
                <span>{message.updated_at}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* 메시지 본문 */}
        <div className="py-6">
          <h3
            className="text-sm mb-4 text-gray-500"
            style={{ fontWeight: 700 }}
          >
            메시지 내용
          </h3>
          <div
            className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-2xl mb-4 mt-6"
                    style={{ fontWeight: 700 }}
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-xl mb-3 mt-5"
                    style={{ fontWeight: 700 }}
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-lg mb-2 mt-4"
                    style={{ fontWeight: 700 }}
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-3 leading-relaxed" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-[var(--brand-orange)] hover:underline"
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
                  <strong style={{ fontWeight: 700 }} {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic" {...props} />
                ),
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
            <div className="py-6">
              <h3
                className="text-sm mb-4 text-gray-500"
                style={{ fontWeight: 700 }}
              >
                첨부파일 ({message.attachments.length})
              </h3>
              <div className="space-y-4">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id}>
                    {attachment.type === "image" ? (
                      <div className="rounded-lg border overflow-hidden">
                        <ImageWithFallback
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-full h-auto max-h-96 object-contain"
                        />
                        <div className="bg-gray-50 px-3 py-2 border-t flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            {attachment.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() =>
                              window.open(attachment.url, "_blank")
                            }
                          >
                            <Download className="w-3 h-3 mr-1" />
                            다운로드
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 rounded bg-white border flex items-center justify-center text-gray-600">
                          {getAttachmentIcon(attachment.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm truncate"
                            style={{ fontWeight: 500 }}
                          >
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attachment.mimeType || "파일"}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 shrink-0"
                          onClick={() => window.open(attachment.url, "_blank")}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          다운로드
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 푸터 액션 */}
        <Separator />
        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>메시지 ID: {message.id}</span>
          </div>

          <div className="flex gap-2">
            {message.mattermostUrl && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => window.open(message.mattermostUrl, "_blank")}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Mattermost에서 보기
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
