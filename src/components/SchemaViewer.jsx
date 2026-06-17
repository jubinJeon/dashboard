import { useState } from "react";

export default function SchemaViewer({ types }) {
  const [open, setOpen] = useState({});
  const [search, setSearch] = useState("");

  const userTypes = types.filter(
    (t) => t.kind === "OBJECT" && !t.name.startsWith("__") && t.fields?.length
  );

  const filtered = search
    ? userTypes.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.fields.some((f) => f.name.toLowerCase().includes(search.toLowerCase()))
      )
    : userTypes;

  const toggle = (name) => setOpen((p) => ({ ...p, [name]: !p[name] }));
  const expandAll = () => setOpen(Object.fromEntries(filtered.map((t) => [t.name, true])));
  const collapseAll = () => setOpen({});

  return (
    <div className="fade-in">
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="타입 또는 필드 검색…"
          style={{
            flex: 1, minWidth: 200,
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: "8px 14px",
            color: "var(--text-primary)", fontSize: 13, outline: "none",
          }}
        />
        <button onClick={expandAll} style={btnStyle}>전체 펼치기</button>
        <button onClick={collapseAll} style={btnStyle}>전체 접기</button>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{filtered.length}개 타입</span>
      </div>

      {/* Type cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((t) => (
          <div key={t.name} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <button
              onClick={() => toggle(t.name)}
              style={{
                width: "100%", display: "flex", justifyContent: "space-between",
                alignItems: "center", background: "var(--bg-surface)", border: "none",
                padding: "12px 18px", cursor: "pointer", color: "var(--text-primary)",
                fontWeight: 700, fontSize: 13,
              }}
            >
              <span>
                <span className="mono" style={{ color: "var(--accent-sr)", marginRight: 8, fontSize: 12 }}>type</span>
                {t.name}
                {t.description && (
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400, marginLeft: 10 }}>
                    — {t.description}
                  </span>
                )}
              </span>
              <span style={{ color: "var(--text-faint)", fontSize: 11, fontWeight: 400 }}>
                {t.fields.length} 필드 {open[t.name] ? "▲" : "▼"}
              </span>
            </button>

            {open[t.name] && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "var(--bg-base)" }}>
                    {["필드명", "타입", "설명"].map((h) => (
                      <th key={h} style={{
                        padding: "6px 18px", textAlign: "left",
                        color: "var(--text-muted)", fontWeight: 600,
                        letterSpacing: ".06em", fontSize: 10,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.fields.map((f, i) => (
                    <tr key={f.name} style={{ background: i % 2 ? "var(--bg-base)" : "var(--bg-card)" }}>
                      <td className="mono" style={{ padding: "8px 18px", color: "var(--text-secondary)" }}>
                        {search && f.name.toLowerCase().includes(search.toLowerCase())
                          ? <mark style={{ background: "rgba(56,189,248,.2)", color: "var(--accent-sr)", borderRadius: 2 }}>{f.name}</mark>
                          : f.name}
                      </td>
                      <td className="mono" style={{ padding: "8px 18px", color: "var(--accent-sr)" }}>
                        {resolveTypeName(f.type)}
                      </td>
                      <td style={{ padding: "8px 18px", color: "var(--text-faint)", fontSize: 11 }}>
                        {f.description ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "7px 14px", borderRadius: 7,
  border: "1px solid var(--border)",
  background: "transparent", color: "var(--text-muted)",
  fontSize: 12, fontWeight: 600, cursor: "pointer",
};
