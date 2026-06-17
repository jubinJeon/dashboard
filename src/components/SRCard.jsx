import { useState, useEffect } from "react";
import CharacterAvatar from "./CharacterAvatar";
import Portal from "./Portal";

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<\/div>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ").replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n").trim();
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) + " " +
    d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}
function fmtShort(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}
function dday(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - new Date()) / 86400000);
}

const STATUS = {
  "해결":   { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", dot: "#10B981" },
  "처리중": { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
  "접수":   { color: "#5C7A90", bg: "#F0F6FA", border: "#C8DCE9", dot: "#90ABBE" },
  "반려":   { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444" },
};
const getSM = n => STATUS[n] ?? { color: "#5C7A90", bg: "#F0F6FA", border: "#C8DCE9", dot: "#90ABBE" };

function ddInfo(d) {
  if (d === null) return null;
  if (d < 0)   return { label: `D+${Math.abs(d)}`, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };
  if (d === 0) return { label: "D-Day",             color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" };
  if (d <= 2)  return { label: `D-${d}`,            color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
  return              { label: `D-${d}`,            color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" };
}

// ── 모달 ──────────────────────────────────────────────────────────────────────
function SRModal({ item, onClose }) {
  const [tab, setTab] = useState("content");
  if (!item) return null;
  const sm  = getSM(item.status_name);
  const dd  = dday(item.accept_todo_date);
  const ddi = ddInfo(dd);
  const tabs = [
    { key: "content",  label: "요청 내용",  text: stripHtml(item.content) },
    { key: "resolve",  label: "해결 내용",  text: stripHtml(item.resolve_content) },
    { key: "progress", label: "진행 메모",  text: stripHtml(item.progress_content) },
  ].filter(t => t.text);

  return (
    <Portal>
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(10,25,50,.45)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{
        background: "#fff", borderRadius: 24,
        width: "100%", maxWidth: 640, maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,20,60,.18)", border: "1px solid #D0DEE8",
      }}>
        {/* 헤더 */}
        <div style={{
          padding: "24px 28px 20px", borderBottom: "1px solid #EBF4FB",
          background: "linear-gradient(135deg, #F0F8FF, #FAFCFE)",
          borderRadius: "24px 24px 0 0", position: "sticky", top: 0, zIndex: 1,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                {item.proc_id && (
                  <span className="mono" style={{ fontSize: 12, color: "#0078C3", fontWeight: 700,
                    background: "#E8F4FC", padding: "2px 10px", borderRadius: 8 }}>{item.proc_id}</span>
                )}
                {item.status_name && (
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20,
                    background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`,
                    display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: sm.dot }} />
                    {item.status_name}
                  </span>
                )}
                {item.phase_name && (
                  <span style={{ fontSize: 11, color: "#5C7A90", background: "#F0F6FA",
                    border: "1px solid #D0DEE8", padding: "2px 10px", borderRadius: 12 }}>
                    {item.phase_name}
                  </span>
                )}
                {ddi && (
                  <span style={{ fontSize: 11, fontWeight: 800, color: ddi.color,
                    background: ddi.bg, border: `1px solid ${ddi.border}`,
                    padding: "2px 10px", borderRadius: 12 }}>{ddi.label}</span>
                )}
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#0A1929", lineHeight: 1.4 }}>
                {(item.title?.trim() || "제목 없음").replace(/[\r\n]+/g, " ")}
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: "#F0F6FA", border: "1px solid #D0DEE8",
              color: "#5C7A90", fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
        </div>

        <div style={{ padding: "22px 28px" }}>
          {/* 담당자 아바타 row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18,
            padding: "14px 16px", background: "#F8FBFD", borderRadius: 14,
            border: "1px solid #E4EDF4" }}>
            <CharacterAvatar assigneeId={item.assignee} assigneeName={item.assignee_name} size={60} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0A1929" }}>{item.assignee_name ?? "—"}</div>
              <div style={{ fontSize: 12, color: "#5C7A90" }}>{item.assignee_department ?? item.assignee_dept ?? ""}</div>
              <div className="mono" style={{ fontSize: 10, color: "#90ABBE", marginTop: 2 }}>ID: {item.assignee ?? "—"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#90ABBE", marginBottom: 4 }}>요청자</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2C4A63" }}>{item.requester_name}</div>
              <div style={{ fontSize: 11, color: "#5C7A90" }}>{item.requester_company}</div>
            </div>
          </div>

          {/* 메타 그리드 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              ["접수일",      fmtDate(item.accept_date)],
              ["처리 목표일", item.accept_todo_date ? fmtDate(item.accept_todo_date) : "—"],
              ["요청 부서",   item.requester_department],
              ["오퍼링 ID",   item.offering_id],
              ["오퍼링명",    item.offering_name],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "#F8FBFD", border: "1px solid #E4EDF4",
                borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: "#90ABBE", fontWeight: 700, letterSpacing: ".08em",
                  marginBottom: 4, textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontSize: 14, color: "#0A1929", fontWeight: 600 }}>{v || "—"}</div>
              </div>
            ))}
          </div>

          {/* 접수 안내 */}
          {item.accept_desc && (
            <div style={{ background: "#F0F8FF", border: "1px solid #B0D4EF",
              borderLeft: "4px solid #0078C3", borderRadius: 12, padding: "14px 18px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: "#0078C3", fontWeight: 700, letterSpacing: ".08em",
                marginBottom: 6, textTransform: "uppercase" }}>접수 안내</div>
              <div style={{ fontSize: 13, color: "#2C4A63", lineHeight: 1.75, whiteSpace: "pre-line" }}>{item.accept_desc}</div>
            </div>
          )}

          {/* 탭 */}
          {tabs.length > 0 && (
            <>
              <div style={{ display: "flex", marginBottom: 12, borderBottom: "2px solid #EBF4FB" }}>
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)} style={{
                    padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    background: "none", border: "none",
                    borderBottom: `2px solid ${tab === t.key ? "#0078C3" : "transparent"}`,
                    color: tab === t.key ? "#0078C3" : "#90ABBE", marginBottom: -2,
                  }}>{t.label}</button>
                ))}
              </div>
              <div style={{ background: "#F8FBFD", borderRadius: 14, padding: "16px 18px",
                border: "1px solid #E4EDF4", minHeight: 80 }}>
                <div style={{ fontSize: 14, color: "#2C4A63", lineHeight: 1.85,
                  whiteSpace: "pre-wrap", maxHeight: 300, overflowY: "auto" }}>
                  {tabs.find(t => t.key === tab)?.text}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
}

// ── SR 카드 ───────────────────────────────────────────────────────────────────
function SRCard({ item, onClick }) {
  const sm      = getSM(item.status_name);
  const dd      = dday(item.accept_todo_date);
  const ddi     = ddInfo(dd);
  const title   = (item.title?.trim() || "제목 없음").replace(/[\r\n]+/g, " ");
  const preview = stripHtml(item.content);

  return (
    <div onClick={() => onClick(item)} className="fade-in" style={{
      background: "#fff", border: "1px solid #D8E8F2", borderRadius: 20,
      padding: "20px 20px 16px", cursor: "pointer",
      transition: "all .2s ease", position: "relative", overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,80,160,.07)",
      display: "flex", flexDirection: "column",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="#0078C3"; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 36px rgba(0,80,160,.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="#D8E8F2"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 12px rgba(0,80,160,.07)"; }}
    >
      {/* 상단 컬러 바 */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${sm.dot}, ${sm.dot}44)`,
        borderRadius: "20px 20px 0 0" }} />

      {/* ID + 상태 + D-day */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {item.proc_id && (
            <span className="mono" style={{ fontSize: 10, color: "#0078C3", fontWeight: 700,
              background: "#E8F4FC", padding: "2px 8px", borderRadius: 6 }}>{item.proc_id}</span>
          )}
          {item.offering_name && (
            <span style={{
              fontSize: 10, color: "#0060A0", fontWeight: 600,
              background: "#F0F8FF", border: "1px solid #B0D4EF",
              padding: "2px 8px", borderRadius: 6,
              maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }} title={item.offering_name}>{item.offering_name}</span>
          )}
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
            background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`,
            display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: sm.dot }} />
            {item.status_name}
          </span>
        </div>
        {ddi && (
          <span style={{ fontSize: 11, fontWeight: 800, color: ddi.color,
            background: ddi.bg, border: `1px solid ${ddi.border}`,
            padding: "2px 9px", borderRadius: 20 }}>{ddi.label}</span>
        )}
      </div>

      {/* 제목 */}
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0A1929", lineHeight: 1.5,
        marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</div>

      {/* 내용 미리보기 */}
      {preview && (
        <div style={{ fontSize: 12, color: "#5C7A90", lineHeight: 1.6, marginBottom: 12,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden" }}>{preview}</div>
      )}

      {/* 담당자 SVG 아바타 + 요청자 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
        padding: "10px 12px", background: "#F5F9FC", borderRadius: 12,
        border: "1px solid #E4EDF4", marginTop: "auto" }}>
        <CharacterAvatar assigneeId={item.assignee} assigneeName={item.assignee_name} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0A1929",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.assignee_name ?? "담당자 미배정"}
          </div>
          <div style={{ fontSize: 11, color: "#5C7A90",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.assignee_department ?? item.assignee_dept ?? ""}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: "#90ABBE", marginBottom: 2 }}>요청자</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2C4A63",
            maxWidth: 90, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.requester_name}
          </div>
        </div>
      </div>

      {/* 날짜 + 단계 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#5C7A90" }}>
            <span style={{ color: "#90ABBE", marginRight: 3 }}>접수</span>{fmtShort(item.accept_date)}
          </span>
          {item.accept_todo_date && (
            <span style={{ fontSize: 11, color: "#5C7A90" }}>
              <span style={{ color: "#90ABBE", marginRight: 3 }}>목표</span>{fmtShort(item.accept_todo_date)}
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, color: "#5C7A90", padding: "2px 9px", borderRadius: 8,
          border: "1px solid #D0DEE8", background: "#F5F9FC" }}>{item.phase_name}</span>
      </div>

      {/* 진행 메모 */}
      {item.progress_content && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #EBF4FB",
          display: "flex", gap: 6, alignItems: "flex-start" }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: "#7C3AED",
            background: "#F5F3FF", border: "1px solid #DDD6FE",
            padding: "2px 6px", borderRadius: 5, flexShrink: 0, marginTop: 1 }}>MEMO</span>
          <span style={{ fontSize: 11, color: "#5C7A90", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {stripHtml(item.progress_content)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── 페이지네이션 ──────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

function Pagination({ total, page, setPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1,2,3,4,5,"…",totalPages];
    if (page >= totalPages - 3) return [1,"…",totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages];
    return [1,"…",page-1,page,page+1,"…",totalPages];
  };
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center",
      gap: 6, marginTop: 32, paddingTop: 20, borderTop: "1px solid #E4EDF4" }}>
      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{
        padding: "8px 14px", borderRadius: 10, border: "1px solid #D0DEE8",
        background: page===1 ? "#F5F9FC" : "#fff", color: page===1 ? "#B8CEDF" : "#2C4A63",
        fontWeight: 700, fontSize: 13, cursor: page===1 ? "not-allowed" : "pointer",
        boxShadow: page===1 ? "none" : "0 1px 4px rgba(0,0,0,.06)",
      }}>← 이전</button>
      {getPages().map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} style={{ color: "#90ABBE", padding: "0 4px", fontSize: 14 }}>…</span>
        ) : (
          <button key={p} onClick={() => setPage(p)} style={{
            width: 38, height: 38, borderRadius: 10, border: "1px solid",
            borderColor: p===page ? "#0078C3" : "#D0DEE8",
            background: p===page ? "#0078C3" : "#fff",
            color: p===page ? "#fff" : "#2C4A63",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            boxShadow: p===page ? "0 4px 12px rgba(0,120,195,.3)" : "0 1px 4px rgba(0,0,0,.06)",
            transition: "all .15s",
          }}>{p}</button>
        )
      )}
      <button onClick={() => setPage(p => Math.min(Math.ceil(total/PAGE_SIZE),p+1))}
        disabled={page===Math.ceil(total/PAGE_SIZE)} style={{
        padding: "8px 14px", borderRadius: 10, border: "1px solid #D0DEE8",
        background: page===Math.ceil(total/PAGE_SIZE) ? "#F5F9FC" : "#fff",
        color: page===Math.ceil(total/PAGE_SIZE) ? "#B8CEDF" : "#2C4A63",
        fontWeight: 700, fontSize: 13,
        cursor: page===Math.ceil(total/PAGE_SIZE) ? "not-allowed" : "pointer",
        boxShadow: page===Math.ceil(total/PAGE_SIZE) ? "none" : "0 1px 4px rgba(0,0,0,.06)",
      }}>다음 →</button>
      <span style={{ fontSize: 12, color: "#90ABBE", marginLeft: 8 }}>
        {page} / {Math.ceil(total/PAGE_SIZE)} 페이지 · 전체 {total}건
      </span>
    </div>
  );
}

// ── 필터 바 ───────────────────────────────────────────────────────────────────
function FilterBar({ data, filter, setFilter }) {
  const statuses = ["전체", ...new Set(data.map(d => d.status_name).filter(Boolean))];
  const SC = { "해결":{bg:"#ECFDF5",color:"#059669",border:"#A7F3D0"}, "처리중":{bg:"#FFFBEB",color:"#D97706",border:"#FDE68A"}, "반려":{bg:"#FEF2F2",color:"#DC2626",border:"#FECACA"}, "접수":{bg:"#F0F6FA",color:"#5C7A90",border:"#C8DCE9"} };
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {statuses.map(s => {
        const active = filter.status === s;
        const cnt    = s === "전체" ? data.length : data.filter(d => d.status_name === s).length;
        const c      = s === "전체"
          ? { bg: active?"#E8F4FC":"#fff", color: active?"#0078C3":"#5C7A90", border: active?"#B0D4EF":"#D0DEE8" }
          : (active ? SC[s]??{bg:"#F0F6FA",color:"#5C7A90",border:"#C8DCE9"} : {bg:"#fff",color:"#5C7A90",border:"#D0DEE8"});
        return (
          <button key={s} onClick={() => setFilter(f => ({ ...f, status: s }))} style={{
            padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13,
            cursor: "pointer", transition: "all .15s",
            border: `1px solid ${c.border}`, background: c.bg, color: c.color,
            boxShadow: active ? "0 2px 8px rgba(0,0,0,.06)" : "none",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {s}
            <span style={{ fontSize: 11, fontWeight: 800,
              background: active?`${c.color}18`:"#F0F6FA",
              color: active?c.color:"#90ABBE", borderRadius: 10, padding: "0 7px" }}>{cnt}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
export default function SRCardDashboard({ data = [] }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState({ status: "전체", search: "" });
  const [sort, setSort]         = useState("accept_date_desc");
  const [page, setPage]         = useState(1);

  useEffect(() => { setPage(1); }, [filter, sort]);

  let filtered = data.filter(d => {
    if (filter.status !== "전체" && d.status_name !== filter.status) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      return d.proc_id?.toLowerCase().includes(q) || d.title?.toLowerCase().includes(q) ||
        d.requester_name?.toLowerCase().includes(q) || d.assignee_name?.toLowerCase().includes(q);
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sort==="accept_date_desc") return new Date(b.accept_date)-new Date(a.accept_date);
    if (sort==="accept_date_asc")  return new Date(a.accept_date)-new Date(b.accept_date);
    if (sort==="dday_asc")         return new Date(a.accept_todo_date)-new Date(b.accept_todo_date);
    return 0;
  });

  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  return (
    <div>
      {selected && <SRModal item={selected} onClose={() => setSelected(null)} />}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          placeholder="🔍  SR ID, 제목, 요청자 검색…"
          style={{ flex:"1 1 220px", background:"#fff", border:"1.5px solid #D0DEE8",
            borderRadius:12, padding:"10px 16px", color:"#0A1929", fontSize:13, outline:"none",
            boxShadow:"0 1px 4px rgba(0,0,0,.05)" }} />
        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          background:"#fff", border:"1.5px solid #D0DEE8", borderRadius:12,
          padding:"10px 14px", color:"#2C4A63", fontSize:13, outline:"none" }}>
          <option value="accept_date_desc">접수일 최신순</option>
          <option value="accept_date_asc">접수일 오래된순</option>
          <option value="dday_asc">D-day 임박순</option>
        </select>
      </div>
      <div style={{ marginBottom: 20 }}>
        <FilterBar data={data} filter={filter} setFilter={setFilter} />
      </div>
      <div style={{ fontSize: 13, color: "#90ABBE", marginBottom: 16 }}>
        {filtered.length}건 · {page}/{Math.ceil(filtered.length/PAGE_SIZE)||1} 페이지
      </div>
      {paginated.length === 0 ? (
        <div style={{ textAlign:"center", color:"#90ABBE", padding:"60px 0", fontSize:15 }}>검색 결과 없음</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {paginated.map(item => <SRCard key={item.proc_id} item={item} onClick={setSelected} />)}
        </div>
      )}
      <Pagination total={filtered.length} page={page} setPage={setPage} />
    </div>
  );
}
