import { useState } from "react";
import { Btn, ErrorBox } from "./ui";

export default function LoginPage({ onSubmit, loading, error }) {
  const [input, setInput] = useState("");

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-base)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 460 }} className="fade-in">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 10, color: "var(--accent-sr)", fontWeight: 700,
            letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 14,
            padding: "5px 14px", borderRadius: 20,
            border: "1px solid rgba(56,189,248,.25)",
            background: "rgba(56,189,248,.07)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-sr)" }} />
            Microsoft Fabric · GraphQL
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 900, color: "var(--text-primary)",
            letterSpacing: "-.02em", margin: "0 0 10px",
          }}>
            SR / CO 대시보드
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
            Azure AD Bearer 토큰을 입력하면<br />GraphQL 스키마를 자동으로 분석합니다
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: 32,
          boxShadow: "var(--shadow-card)",
        }}>
          <label style={{
            fontSize: 10, color: "var(--text-muted)", fontWeight: 700,
            letterSpacing: ".1em", textTransform: "uppercase",
            display: "block", marginBottom: 10,
          }}>
            Bearer Token
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="eyJ0eXAiOiJKV1QiLCJhbGci..."
            rows={6}
            style={{
              width: "100%", background: "var(--bg-base)",
              border: "1px solid var(--border-sub)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 14px", color: "var(--text-secondary)",
              fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
              resize: "vertical", outline: "none", lineHeight: 1.6,
            }}
          />

          {/* How to get token */}
          <div style={{
            marginTop: 12, padding: "12px 14px",
            background: "rgba(56,189,248,.05)",
            border: "1px solid rgba(56,189,248,.15)",
            borderRadius: "var(--radius-sm)",
          }}>
            <div style={{ fontSize: 10, color: "var(--accent-sr)", fontWeight: 700,
              letterSpacing: ".08em", marginBottom: 6 }}>💡 토큰 발급 방법</div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.8 }}>
              PowerShell / Azure CLI:
              <br />
              <code style={{ color: "var(--accent-sr)", fontSize: 10 }}>
                az account get-access-token --resource https://analysis.windows.net/powerbi/api
              </code>
              <br />
              → <code style={{ color: "var(--text-secondary)" }}>accessToken</code> 값을 복사
            </div>
          </div>

          {error && <div style={{ marginTop: 14 }}><ErrorBox message={error} /></div>}

          <Btn
            onClick={() => onSubmit(input.trim())}
            disabled={loading || !input.trim()}
            style={{ marginTop: 20, width: "100%", padding: "13px 0", fontSize: 14 }}
          >
            {loading ? "스키마 분석 중…" : "🔍 스키마 자동 분석 시작"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
