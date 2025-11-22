<!-- Language Switch -->
<p align="right">
  <a href="#english">🇺🇸 English</a> | <a href="#korean">🇰🇷 한국어</a>
</p>

---

# <a id="english"></a>🇺🇸 English

# KeyVault – License Management Desktop App

**KeyVault** is a streamlined desktop application designed to store, organize, and manage software licenses.  
Built with **Electron** and **Next.js**, it features a unified dark-mode interface.

## Why This App?

- **Automatic license metadata extraction**  
  Dragging an application file into KeyVault automatically detects and fills in the app name, version, icon, and category.

- **Consistent spacing**  
  Layout maintains balanced spacing even when the detail panel is empty.

- **Rich license details**  
  Includes owner, website, license key, attachment, purchase/expiry dates, price, and Brew cask command.

- **Tag autocomplete & keyboard navigation**  
  Fast tag search with ↑/↓/Enter/Escape.

- **Import / Export** (JSON)  
  Easy migration and backup.

- **Excel Export (.xlsx)**  
  Export all license data into a spreadsheet.

- **Dark theme** unified across Electron and React UI.

## Features

- Automatic extraction of name, version, icon, and category
- Dark-mode UI with custom title bar
- Search, tag filtering, and category navigation
- Detail panel with full metadata and quick actions
- Keyboard-based tag autocomplete
- JSON import/export
- Excel export
- Responsive layout for dense information

## Screenshot

![keyvaul_scrrenshot](https://github.com/user-attachments/assets/63a7df48-b5f0-41bd-a6c7-72451e49f92f)


## Getting Started
```bash
# Clone the repository
git clone https://github.com/hjm79/keyvault.git
cd keyvault

# Install dependencies
npm install

# Run the UI in development mode
npm run dev   # Next.js dev server
npm start      # Launch Electron (macOS)
```

## Build for Production
```bash
npm run dist   # Generates a DMG and zip in the ./dist folder
```




# <a id="korean"></a>🇰🇷 한국어
KeyVault – 라이선스 관리 데스크톱 앱

**KeyVault**는 소프트웨어 라이선스를 저장하고 정리하는 데 최적화된 데스크톱 애플리케이션입니다.
**Electron**과 Next.js로 개발되었으며, 전체 UI는 다크 모드를 기반으로 설계되었습니다.

## 왜 이 앱인가?

- **앱 드래그 시 자동 정보 추출**
앱 파일을 KeyVault로 드래그하면 앱 이름, 버전, 아이콘, 카테고리가 자동으로 채워집니다.

- **균형 잡힌 UI 간격**
상세 패널이 비어 있어도 UI가 답답하지 않도록 설계되었습니다.

- **풍부한 라이선스 정보 관리**
소유자, 웹사이트, 라이선스 키, 첨부파일, 구매/만료일, 가격, Brew cask 명령어까지 정돈된 패널 제공.

- **태그 자동완성 + 키보드 네비게이션**
↑/↓/Enter/Escape를 이용한 빠른 태그 탐색.

- **JSON 기반 Import / Export**
백업 및 복원 간편.

- **Excel Export(.xlsx)**
라이선스 데이터를 엑셀로 내보내기 지원.

- **일관된 다크 테마**
Electron 윈도우와 React UI를 통일된 스타일로 구성.

## 주요 기능

- 드래그 기반 자동 메타데이터 추출
- 다크 모드 UI + 커스텀 타이틀 바
- 검색, 태그 필터, 카테고리 탐색
- 상세 패널(편집, 삭제, Brew 명령 실행 포함)
- 키보드 기반 태그 자동완성
- JSON Import/Export
- Excel 내보내기

밀도 높은 정보 표시를 위한 최적화된 레이아웃

## 시작하기

```bash
# Clone the repository
git clone https://github.com/hjm79/keyvault.git
cd keyvault

# Install dependencies
npm install

# Run the UI in development mode
npm run dev   # Next.js dev server
npm start      # Launch Electron (macOS)
```
## 프로덕션 빌드

```bash
npm run dist
```



