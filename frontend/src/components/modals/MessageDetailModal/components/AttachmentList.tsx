import { Download, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'excel' | 'file';
  mimeType?: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
}

/**
 * 첨부파일 목록을 렌더링하는 컴포넌트
 * 이미지는 미리보기, 파일은 다운로드 링크로 표시
 */
export const AttachmentList = ({ attachments }: AttachmentListProps) => {
  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'pdf':
      case 'excel':
      case 'file':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="py-6">
      <h3 className="text-sm mb-4 text-gray-500 font-bold">
        첨부파일 ({attachments.length})
      </h3>
      <div className="space-y-4">
        {attachments.map((attachment) => (
          <div key={attachment.id}>
            {attachment.type === 'image' ? (
              /* 이미지 첨부파일 */
              <div className="rounded-lg border overflow-hidden">
                <ImageWithFallback
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-full h-auto max-h-96 object-contain"
                />
                <div className="bg-gray-50 px-3 py-2 border-t flex items-center justify-between">
                  <span className="text-xs text-gray-600">{attachment.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => window.open(attachment.url, '_blank')}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    다운로드
                  </Button>
                </div>
              </div>
            ) : (
              /* 파일 첨부파일 */
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded bg-white border flex items-center justify-center text-gray-600">
                  {getAttachmentIcon(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate font-medium">{attachment.name}</p>
                  <p className="text-xs text-gray-500">{attachment.mimeType || '파일'}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shrink-0"
                  onClick={() => window.open(attachment.url, '_blank')}
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
  );
};
