import { useState } from "react";
import { Btn, ErrorBox } from "./ui";

export default function TypeSelectPage({ userTypes, initialMapping, onConfirm, onBack, loading, error }) {
  const [srType, setSrType] = useState(initialMapping?.srType ?? "");
  const [coType, setCoType] = useState(initialMapping?.coType ?? "");

  const typeOptions = userTypes.map((t) => ({
    value: t.name,
    label: `${t.name}  (${t.fields.length} 필드)`,
  }));

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-base)",
      padding: "48px 24px", fontFamily: "inherit",
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }} className="fade-in">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 10, color: "#34d399", fontWeight: 700,
            letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8,
          }}>
            ✓ 스키마 분석 완료 — {userTypes.length}개 타입 발견
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)", margin: "0 0 8px" }}>
            SR / CO 타입 매핑
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            각 대시보드에 해당하는 GraphQL 타입을 선택하세요. 자동 추천된 값을 확인하고 필요 시 수정하세요.
          </p>
        </div>

        {/* Mapping cards */}
        {[
          {
            label: "SR — Service Request",
            accent: "var(--accent-sr)",
            value: srType,
            setter: setSrType,
            hint: "서비스 요청 관련 타입 (ServiceRequest, SR, Request 등)",
          },
          {
            label: "CO — Change Order",
            accent: "var(--accent-co)",
            value: coType,
            setter: setCoType,
            hint: "변경 오더 관련 타입 (ChangeOrder, CO, Change 등)",
          },
        ].map(({ label, accent, value, setter, hint }) => (
          <div key={label} style={{
            background: "var(--bg-surface)",
            border: `1px solid var(--border)`,
            borderLeft: `3px solid ${accent}`,
            borderRadius: "var(--radius-lg)",
            padding: "22px 24px",
            marginBottom: 16,
          }}>
            <label style={{
              fontSize: 12, fontWeight: 700, color: accent,
              display: "block", marginBottom: 4,
            }}>{label}</label>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 12 }}>{hint}</div>
            <select
              value={value}
              onChange={(e) => setter(e.target.value)}
              style={{
                width: "100%", background: "var(--bg-base)",
                border: "1px solid var(--border-sub)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px", color: "var(--text-primary)",
                fontSize: 13, outline: "none", fontFamily: "inherit",
              }}
            >
              <option value="">-- 해당 없음 / 건너뛰기 --</option>
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ))}

        {error && <div style={{ marginBottom: 16 }}><ErrorBox message={error} /></div>}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Btn variant="ghost" onClick={onBack} style={{ flex: 1 }}>← 돌아가기</Btn>
          <Btn
            onClick={() => onConfirm({ srType, coType })}
            disabled={loading || (!srType && !coType)}
            style={{ flex: 2, padding: "12px 0" }}
          >
            {loading ? "데이터 로딩 중…" : "📊 대시보드 열기"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
