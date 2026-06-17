/**
 * server.js — Node.js 백엔드 프록시 + 정적 파일 서빙 (Express, ES Module)
 * 실행: node server.js
 * 포트: process.env.PORT (기본 3001)
 *
 * - POST /api/graphql : Azure AD 토큰 발급 후 Microsoft Fabric GraphQL 프록시
 * - GET  /api/health  : 헬스체크
 * - 그 외             : 빌드된 dist/ 정적 파일(SPA) 서빙
 */

import https from "https";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { URL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 회사 SSL 인터셉션 우회 (필요 시 .env 에서 NODE_TLS_REJECT_UNAUTHORIZED=0)
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// ── Azure AD 설정 (환경변수 우선) ───────────────────────────────────────────────
const AZURE = {
  tenantId:     process.env.AZURE_TENANT_ID,
  clientId:     process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  scope:        process.env.AZURE_SCOPE || "https://analysis.windows.net/powerbi/api/.default",
};

const GRAPHQL_URL = process.env.GRAPHQL_URL;

const PORT = Number(process.env.PORT) || 3001;

// 필수 환경변수 점검
for (const [key, val] of Object.entries({
  AZURE_TENANT_ID:     AZURE.tenantId,
  AZURE_CLIENT_ID:     AZURE.clientId,
  AZURE_CLIENT_SECRET: AZURE.clientSecret,
  GRAPHQL_URL,
})) {
  if (!val) {
    console.error(`❌ 환경변수 ${key} 가 설정되지 않았습니다. .env 또는 Coolify 환경변수를 확인하세요.`);
    process.exit(1);
  }
}

// ── 토큰 캐시 ─────────────────────────────────────────────────────────────────
let tokenCache = null;

function getAccessToken() {
  return new Promise((resolve, reject) => {
    if (tokenCache && tokenCache.expiresAt - Date.now() > 5 * 60 * 1000) {
      return resolve(tokenCache.token);
    }

    const params = new URLSearchParams({
      grant_type:    "client_credentials",
      client_id:     AZURE.clientId,
      client_secret: AZURE.clientSecret,
      scope:         AZURE.scope,
    });
    const body = params.toString();

    const req = https.request({
      hostname: "login.microsoftonline.com",
      path:     `/${AZURE.tenantId}/oauth2/v2.0/token`,
      method:   "POST",
      headers: {
        "Content-Type":   "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
      },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error_description ?? json.error));
          tokenCache = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
          resolve(tokenCache.token);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── GraphQL 프록시 요청 ───────────────────────────────────────────────────────
function proxyGraphQL(token, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(GRAPHQL_URL);
    const req = https.request({
      hostname: parsed.hostname,
      path:     parsed.pathname,
      method:   "POST",
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(body),
        Authorization:    `Bearer ${token}`,
      },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── Express 앱 ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/graphql", async (req, res) => {
  try {
    const token  = await getAccessToken();
    const result = await proxyGraphQL(token, JSON.stringify(req.body));
    res.status(result.status).type("application/json").send(result.body);
  } catch (e) {
    console.error("[Error]", e.message);
    res.status(500).json({ errors: [{ message: e.message }] });
  }
});

// ── 정적 파일(SPA) 서빙 ───────────────────────────────────────────────────────
const distDir = path.join(__dirname, "dist");
app.use(express.static(distDir));

// SPA fallback — API 가 아닌 모든 경로는 index.html 로
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n✅ 서버 실행 중 → http://localhost:${PORT}`);
  console.log(`   POST /api/graphql · GET /api/health · 정적: dist/\n`);
});
