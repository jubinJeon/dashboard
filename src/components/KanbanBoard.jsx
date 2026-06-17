import { Badge, PriorityTag } from "./ui";
import {
  getStatusMeta, STATUS_DISPLAY_ORDER,
  detectStatusKey, getItemTitle, getEmergencyMeta,
} from "../utils/statusMeta";

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ").replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&")
    .replace(/\s{2,}/g, " ").trim();
}

function KanbanCard({ item, statusKey, onClick }) {
  const title = getItemTitle(item);
  return (
    <div
      onClick={() => onClick(item)}
      style={{
        background: "#fff",
        border: "1px solid #E4EDF4",
        borderRadius: 12,
        padding: "12px 14px",
        cursor: "pointer",
        marginBottom: 10,
        transition: "border-color .15s, box-shadow .15s, transform .15s",
        boxShadow: "0 1px 4px rgba(0,80,160,.06)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor  = "#0078C3";
        e.currentTarget.style.boxShadow    = "0 4px 16px rgba(0,80,160,.12)";
        e.currentTarget.style.transform    = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor  = "#E4EDF4";
        e.currentTarget.style.boxShadow    = "0 1px 4px rgba(0,80,160,.06)";
        e.currentTarget.style.transform    = "translateY(0)";
      }}
    >
      {/* proc_id + offering_name */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7, flexWrap: "wrap" }}>
        {item.proc_id && (
          <div className="mono" style={{
            fontSize: 10, color: "#0078C3", fontWeight: 700, letterSpacing: ".05em",
            background: "#E8F4FC", padding: "2px 8px", borderRadius: 6,
            flexShrink: 0,
          }}>{item.proc_id}</div>
        )}
        {item.offering_name && (
          <div style={{
            fontSize: 10, color: "#0060A0", fontWeight: 600,
            background: "#F0F8FF", border: "1px solid #B0D4EF",
            padding: "2px 7px", borderRadius: 6,
            maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }} title={item.offering_name}>{item.offering_name}</div>
        )}
      </div>

      {/* 제목 */}
      <div style={{
        fontSize: 13, fontWeight: 700, color: "#0A1929", lineHeight: 1.45,
        marginBottom: 6,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {(title || "—").replace(/[\r\n]+/g, " ")}
      </div>

      {/* 요청자 */}
      {(item.requester_name || item.assignee_name) && (
        <div style={{ fontSize: 11, color: "#5C7A90", marginBottom: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{item.requester_name ?? ""}</span>
          {item.assignee_name && (
            <span style={{ color: "#7C3AED", fontWeight: 600, fontSize: 11 }}>
              → {item.assignee_name}
            </span>
          )}
        </div>
      )}

      {/* 날짜 */}
      {item.accept_date && (
        <div style={{ fontSize: 10, color: "#90ABBE" }}>
          {new Date(item.accept_date).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })}
        </div>
      )}
    </div>
  );
}

// ── 칸반 컬럼 — 정확히 1/N 너비 ──────────────────────────────────────────────
function KanbanColumn({ status, items, statusKey, onCardClick }) {
  const m = getStatusMeta(status);
  return (
    <div style={{
      /* 부모가 flex이므로 flex: 1로 동일 너비 분배 */
      flex: "1 1 0",
      minWidth: 0,           /* flex 축소 허용 */
      background: "#F8FBFD",
      border: "1px solid #D0DEE8",
      borderTop: `3px solid ${m.color}`,
      borderRadius: 14,
      padding: "14px 12px",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* 컬럼 헤더 */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
      }}>
        <span style={{
          fontSize: 13, fontWeight: 800, color: m.color,
          textTransform: "uppercase", letterSpacing: ".04em",
        }}>{m.label}</span>
        <span style={{
          fontSize: 12, fontWeight: 800,
          padding: "2px 10px", borderRadius: 12,
          background: `${m.color}15`, color: m.color,
          border: `1px solid ${m.color}30`,
        }}>{items.length}</span>
      </div>

      {/* 카드 목록 */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", color: "#B8CEDF", fontSize: 12,
            paddingTop: 24, paddingBottom: 8 }}>항목 없음</div>
        ) : (
          items.map((item, i) => (
            <KanbanCard
              key={item.proc_id ?? i}
              item={item}
              statusKey={statusKey}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ data, onCardClick }) {
  if (!data?.length) return (
    <div style={{ textAlign: "center", color: "#90ABBE", padding: "60px 0", fontSize: 14 }}>
      데이터가 없습니다
    </div>
  );

  const statusKey   = detectStatusKey(data[0]);
  const allStatuses = [...new Set(data.map(d => d[statusKey]).filter(Boolean))];
  const ordered     = [
    ...STATUS_DISPLAY_ORDER.filter(s => allStatuses.includes(s)),
    ...allStatuses.filter(s => !STATUS_DISPLAY_ORDER.includes(s)),
  ];
  const noStatus = data.filter(d => !d[statusKey]);

  return (
    /* gap으로 컬럼 간격, 각 컬럼은 flex:1로 동일 너비 */
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      {ordered.map(s => (
        <KanbanColumn
          key={s}
          status={s}
          items={data.filter(d => d[statusKey] === s)}
          statusKey={statusKey}
          onCardClick={onCardClick}
        />
      ))}
      {noStatus.length > 0 && (
        <KanbanColumn
          status="pending"
          items={noStatus}
          statusKey={statusKey}
          onCardClick={onCardClick}
        />
      )}
    </div>
  );
}
