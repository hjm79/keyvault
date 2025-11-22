export type Category = string;

export interface License {
  id: string;
  name: string; // 프로그램명
  version?: string; // 버전
  category: Category; // 카테고리
  url?: string; // URL
  icon?: string; // 아이콘 (URL or base64 or path)
  licenseKey?: string; // 라이센스 키/파일 내용 (optional)
  licenseFile?: string; // 라이센스 파일 경로 (optional)
  tags?: string[]; // 태그
  owner?: string; // 소유자
  purchaseDate?: string; // 구매일
  expiryDate?: string; // 만료일
  memo?: string; // 메모
  price?: string; // 가격
  brewCaskCommand?: string; // Brew cask 설치 명령어
}


