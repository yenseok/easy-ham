/**
 * 검색 API 응답 데이터를 프론트엔드 Notice 타입으로 변환하는 유틸리티
 */

import type { Notice, Subcategory, Attachment } from '@/types/notice';
import type { SearchResultItem, SearchFileItem } from '@/types/api';


/**
 * subCategory 코드를 통해 mainCategory 추론
 *
 * subCodeId 1-4: 학사 (EDU)
 * subCodeId 5-8: 취업 (JOB)
 *
 * @param subCategoryCode - 서브카테고리 코드
 * @returns "학사" | "취업"
 */
function mapMainCategory(mainCategoryCode: number | null, subCategoryCode: number | null): "학사" | "취업" {
  // subCategory로 추론 (더 신뢰할 수 있음)
  if (subCategoryCode !== null) {
    // subCodeId 1-4는 학사, 5-8은 취업
    return subCategoryCode <= 4 ? "학사" : "취업";
  }

  // subCategory가 없으면 mainCategory 사용
  if (mainCategoryCode !== null) {
    return mainCategoryCode === 1 ? "학사" : "취업";
  }

  // 둘 다 없으면 기본값
  return "학사";
}

/**
 * subCategory 숫자 코드 → 한글 서브카테고리 변환
 *
 * 1-4: 학사 서브카테고리 (할일, 특강, 정보, 행사)
 * 5-8: 취업 서브카테고리 (할일, 특강, 정보, 행사)
 *
 * @param code - 서브카테고리 코드
 * @returns "할일" | "특강" | "정보" | "행사"
 */
function mapSubCategory(code: number | null): Subcategory {
  if (code === null) return "정보";  // 기본값

  const mapping: Record<number, Subcategory> = {
    1: "할일",    // 학사-할일
    2: "특강",    // 학사-특강
    3: "정보",    // 학사-정보
    4: "행사",    // 학사-행사
    5: "할일",    // 취업-할일
    6: "특강",    // 취업-특강
    7: "정보",    // 취업-정보
    8: "행사",    // 취업-행사
  };

  return mapping[code] || "정보";
}

/**
 * deadline 문자열에서 D-day 계산
 *
 * @param deadline - ISO 8601 형식의 마감일 문자열 (예: "2023-11-04T23:59:59")
 * @returns D-day 숫자 (null이면 null, 오늘이면 0, 내일이면 1, 어제면 -1)
 */
function calculateDday(deadline: string | null): number | null {
  if (!deadline) return null;

  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();

    // 시간을 무시하고 날짜만 비교 (자정 기준)
    deadlineDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // 밀리초 차이를 일수로 변환
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch {
    // 날짜 파싱 실패 시 null 반환
    return null;
  }
}

/**
 * 파일 정보 변환
 *
 * SearchFileItem[] → Attachment[]
 * 모달에서 첨부파일을 표시하기 위한 형식으로 변환
 *
 * @param files - 백엔드 파일 정보 배열
 * @returns 모달용 Attachment 배열 (없으면 undefined)
 */
function convertFiles(files: SearchFileItem[] | null): Attachment[] | undefined {
  if (!files || files.length === 0) return undefined;

  return files.map(file => ({
    id: file.id,
    name: file.name,
    type: file.hasPreviewImage ? 'image' : 'file',
    mimeType: file.mimeType,
    // Mattermost 파일 다운로드 URL
    url: `https://k13a105.p.ssafy.io/chat/api/v4/files/${file.id}`,
  }));
}

/**
 * 검색 결과 아이템 → Notice 타입 변환
 *
 * 이 함수는 백엔드 검색 API 응답을 프론트엔드에서 사용하는
 * Notice 타입으로 변환합니다.
 *
 * @param item - 검색 결과 아이템
 * @returns Notice 객체
 */
export function convertSearchItemToNotice(item: SearchResultItem): Notice {
  // 디버깅: 첫 3개 아이템만 로그
  if (item.id <= 3) {
    console.log('[searchMapper] API 데이터:', {
      id: item.id,
      title: item.title,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      변환된_category: mapMainCategory(item.mainCategory, item.subCategory),
      변환된_subcategory: mapSubCategory(item.subCategory)
    });
  }

  return {
    // ID: API가 항상 실제 ID 제공
    id: item.id,

    // Title: API에서 제공하는 실제 title 사용
    title: item.title,

    // 본문 및 저자
    content: item.content,
    author: item.userName,

    // 채널: channelName 사용 (API에서 제공)
    channel: item.channelName,

    // 카테고리 변환
    category: mapMainCategory(item.mainCategory, item.subCategory),
    subcategory: mapSubCategory(item.subCategory),

    // 북마크 상태 (nullish coalescing: isLiked가 없으면 false)
    bookmarked: item.isLiked ?? false,

    // 완료 상태 (API에서 제공하는 isCompleted 사용, 없으면 false)
    completed: item.isCompleted ?? false,

    // 첨부파일 변환
    attachments: convertFiles(item.files),

    // 날짜 (타임스탬프 밀리초 → ISO 문자열)
    createdAt: new Date(item.mmCreatedAt).toISOString(),
    updatedAt: new Date(item.mmCreatedAt).toISOString(),

    // D-day와 deadline (API에서 제공)
    dday: calculateDday(item.deadline),
    deadline: item.deadline || undefined,

    // Mattermost 원문 링크 (백엔드에서 제공)
    mattermostUrl: item.originalLink || `https://mattermost.ssafy.com/message/${item.mmMessageId}`,
  };
}
