# Coolify 배포 가이드 — srco-dashboard

프론트(Vite/React) + 백엔드 프록시(server.js)를 **단일 컨테이너**로 배포합니다.
`server.js` 가 빌드된 `dist/` 를 서빙하면서 `/api/graphql` 프록시도 함께 처리합니다.

## ⚠️ 배포 전 필수 확인

1. **Azure Client Secret 재발급**
   기존 secret 이 코드에 평문으로 노출되어 있었습니다. Azure Portal 에서 **반드시 재발급**하고,
   새 값을 Coolify 환경변수(`AZURE_CLIENT_SECRET`)에만 넣으세요. 코드/깃에 다시 넣지 마세요.

2. **네트워크(폐쇄망 여부) 확인 — 가장 중요**
   `server.js` 는 실행 중 다음 두 곳으로 **아웃바운드 HTTPS** 가 필요합니다.
   - `login.microsoftonline.com` (Azure 토큰 발급)
   - `*.fabric.microsoft.com` (GraphQL 데이터)

   Coolify 서버가 **사내 폐쇄망**이면 이 연결이 막혀 `/api/graphql` 가 동작하지 않습니다.
   배포 후 아래로 확인:
   ```bash
   # Coolify 서버(또는 컨테이너) 내부에서
   curl -sv https://login.microsoftonline.com/ -o /dev/null
   ```
   막혀 있다면: 방화벽 허용(아웃바운드 443) 또는 사내 프록시 경유 설정이 필요합니다.

## 배포 절차 (Git 기반 — 권장)

1. 이 프로젝트를 사내 Git(GitLab/GitHub 등)에 푸시합니다. (`dist`, `node_modules`, `.env` 는 커밋 제외)
2. Coolify → **New Resource → Application** → 해당 Git 저장소 연결
3. **Build Pack: `Dockerfile`** 선택 (저장소 루트의 `Dockerfile` 자동 인식)
4. **Port: `3001`** 지정 (`EXPOSE 3001`)
5. **Environment Variables** 등록 (`.env.example` 참고):
   ```
   AZURE_TENANT_ID=...
   AZURE_CLIENT_ID=...
   AZURE_CLIENT_SECRET=<재발급한 값>
   AZURE_SCOPE=https://analysis.windows.net/powerbi/api/.default
   GRAPHQL_URL=https://...fabric.microsoft.com/.../graphql
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```
6. **Health Check Path: `/api/health`** 설정 (선택이지만 권장)
7. 도메인 연결 후 **Deploy**

## 로컬에서 Docker 로 먼저 검증 (선택)

```bash
docker build -t srco-dashboard .
docker run --rm -p 3001:3001 --env-file .env srco-dashboard
# http://localhost:3001 접속
```

## 로컬 개발 (변경 없음)

```bash
node server.js     # 백엔드 3001 (환경변수 .env 필요)
npm run dev        # 프론트 5173, /api 는 vite proxy 로 3001 전달
```

## 변경 요약 (배포용 정비 내역)

- `server.js`: 시크릿을 환경변수로 분리, Express 로 전환, `dist/` 정적 서빙 + SPA fallback 추가
- `src/api/graphqlClient.js`: API_URL 을 상대경로 `/api/graphql` 로 변경 (`VITE_API_URL` 오버라이드 가능)
- `vite.config.js`: dev 용 `/api` → `localhost:3001` 프록시 추가
- `Dockerfile`, `.dockerignore`, `.env.example` 추가/갱신
