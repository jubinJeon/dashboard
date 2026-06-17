export function StatCard({ label, value, color, sub }) {
  return (
    <div className="fade-in" style={{
      background: "#fff",
      border: "1px solid #D0DEE8",
      borderRadius: 16,
      padding: "20px 24px",
      position: "relative", overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,80,160,.07)",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: color, borderRadius: "16px 16px 0 0", opacity: .85,
      }} />
      <div style={{
        fontSize: 11, color: "#5C7A90", fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6,
      }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#90ABBE", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function Badge({ status }) {
  const STATUS = {
    "해결":   { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    "처리중": { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    "접수":   { color: "#5C7A90", bg: "#F0F6FA", border: "#C8DCE9" },
    "반려":   { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  };
  const m = STATUS[status] ?? { color: "#5C7A90", bg: "#F0F6FA", border: "#C8DCE9" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: m.bg, color: m.color,
      border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 700, letterSpacing: ".03em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.color }} />
      {status}
    </span>
  );
}

export function PriorityTag({ priority }) {
  const m = {
    high:   { label: "긴급", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    medium: { label: "보통", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    low:    { label: "낮음", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  };
  const s = m[priority?.toLowerCase()] ?? { label: priority ?? "—", color: "#5C7A90", bg: "#F0F6FA", border: "#C8DCE9" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
      border: `1px solid ${s.border}`, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export function Btn({ children, variant = "primary", onClick, disabled, style = {} }) {
  const styles = {
    primary: {
      background: disabled ? "#C8DCE9" : "linear-gradient(135deg, #0078C3, #0060A0)",
      color: disabled ? "#90ABBE" : "#fff",
      border: "none",
      boxShadow: disabled ? "none" : "0 4px 12px rgba(0,120,195,.3)",
    },
    ghost: {
      background: "#fff",
      color: "#5C7A90",
      border: "1px solid #D0DEE8",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "10px 22px", borderRadius: 10,
      fontWeight: 700, fontSize: 14,
      transition: "all .2s", cursor: disabled ? "not-allowed" : "pointer",
      ...styles[variant], ...style,
    }}>
      {children}
    </button>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: "#FEF2F2", border: "1px solid #FECACA",
      borderRadius: 12, padding: "12px 18px", color: "#DC2626", fontSize: 13,
    }}>⚠️ {message}</div>
  );
}

export function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid #C2DEF4", borderTopColor: "#0078C3",
        animation: "spin .7s linear infinite",
      }} />
      <div style={{ fontSize: 13, color: "#5C7A90", fontWeight: 500 }}>데이터 로딩 중…</div>
    </div>
  );
}
