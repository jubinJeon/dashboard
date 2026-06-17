# SR / CO 대시보드

Microsoft Fabric GraphQL API와 연동하는 프로젝트 관리 대시보드입니다.

## 기술 스택
- React 18 + Vite
- Microsoft Fabric GraphQL (Bearer Token 인증)
- 외부 UI 라이브러리 없음 (순수 CSS-in-JS)

## 시작하기
```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # dist/ 폴더에 빌드
```

## 폴더 구조
```
src/
├── api/            graphqlClient.js  — fetch, Introspection, 쿼리 빌더
├── components/     LoginPage, TypeSelectPage, DashboardPage,
│                   KanbanBoard, DetailModal, SchemaViewer, ui
├── styles/         global.css
└── utils/          statusMeta.js
```

## 토큰 발급 (PowerShell)
```powershell
az account get-access-token --resource https://analysis.windows.net/powerbi/api
```
→ accessToken 값을 복사해서 로그인 화면에 붙여넣기

## 엔드포인트 변경
src/App.jsx 상단 ENDPOINT 상수를 수정하세요.
