# ── build stage ───────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── runtime stage ─────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# 런타임 의존성만 설치 (express, node-fetch, cors 등)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 빌드 산출물과 서버 코드 복사
COPY --from=build /app/dist ./dist
COPY server.js ./

EXPOSE 3001
CMD ["node", "server.js"]
