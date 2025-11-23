export type Category = string;

export type SortOption = 'default' | 'name-asc' | 'name-desc' | 'added-desc' | 'added-asc' | 'modified-desc' | 'modified-asc';

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
  createdAt?: string; // 생성일
  updatedAt?: string; // 수정일
}

export interface ElectronAPI {
  loadLicenses: () => Promise<License[]>;
  saveLicenses: (licenses: License[]) => Promise<{ success: boolean; error?: string }>;
  loadCategories: () => Promise<string[]>;
  saveCategories: (categories: string[]) => Promise<{ success: boolean; error?: string }>;
  openPath: (path: string) => Promise<{ success: boolean; error?: string }>;
  showItemInFolder: (path: string) => Promise<{ success: boolean; error?: string }>;
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  copyFile: (sourcePath: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  getFilePath: (file: File) => string;
  getAppInfo: (appPath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getStorageLocation: () => Promise<{ currentPath: string; useICloud: boolean; iCloudAvailable: boolean }>;
  setStorageLocation: (useICloud: boolean) => Promise<{ success: boolean; path?: string; error?: string }>;
  exportLicensesJSON: () => Promise<{ success: boolean; path?: string; count?: number; error?: string; canceled?: boolean }>;
  exportLicensesZIP: () => Promise<{ success: boolean; path?: string; count?: number; error?: string; canceled?: boolean }>;
  exportLicensesExcel: () => Promise<{ success: boolean; path?: string; count?: number; error?: string; canceled?: boolean }>;
  importLicenses: () => Promise<{ success: boolean; imported?: number; skipped?: number; total?: number; error?: string; canceled?: boolean }>;
  executeTerminalCommand: (command: string) => Promise<{ success: boolean; error?: string }>;
  checkForUpdates: () => Promise<{ success: boolean; data?: { tagName: string; htmlUrl: string; name: string }; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
