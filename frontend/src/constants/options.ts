/**
 * 옵션 관련 상수 (캠퍼스, 직무, 기술 스택 등)
 */

export const CAMPUS_OPTIONS = ['서울', '대전', '광주', '구미', '부울경'] as const;

export const JOB_OPTIONS = [
  '프론트엔드',
  '백엔드',
  'DevOps',
  '풀스택',
  '모바일',
  'AI/ML',
  '데이터',
  '임베디드',
  '보안',
  '기타',
] as const;

export const TECH_STACK_OPTIONS = [
  'React',
  'Vue',
  'Angular',
  'Next.js',
  'Svelte',
  'Node.js',
  'Spring',
  'Django',
  'FastAPI',
  'Express',
  'Java',
  'Python',
  'JavaScript',
  'TypeScript',
  'Go',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'Git',
  'Jenkins',
  'GitHub Actions',
  'React Native',
  'Flutter',
  'Swift',
  'Kotlin',
  'TensorFlow',
  'PyTorch',
  'Scikit-learn',
] as const;

export const PERIOD_OPTIONS = ['전체', '오늘', '이번주', '이번달'] as const;

export const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'deadline', label: '마감일순' },
  { value: 'title', label: '제목순' },
] as const;
