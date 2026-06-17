import { useState } from "react";
import { StatCard, Spinner } from "./ui";
import KanbanBoard from "./KanbanBoard";
import DetailModal from "./DetailModal";
import Portal from "./Portal";
import SRCardDashboard from "./SRCard";
import COCardDashboard from "./COCard";
import SRCharts from "./SRCharts";
import { detectStatusKey, getStatusMeta, STATUS_DISPLAY_ORDER } from "../utils/statusMeta";

const PRESETS = [
  { label: "1주",   days: 7   },
  { label: "1개월", days: 30  },
  { label: "3개월", days: 90  },
  { label: "6개월", days: 180 },
];
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }
function today()    { return new Date().toISOString().slice(0,10); }

export default function DashboardPage({
  srData, coData, loading, error,
  onRefresh, lastFetched,
  dateFrom, dateTo, setDateFrom, setDateTo, onSearch,
}) {
  const [tab, setTab]           = useState("SR");
  const [viewMode, setViewMode] = useState("cards");
  const [selected, setSelected] = useState(null);

  const activeData  = tab === "SR" ? srData : coData;
  const statusKey   = detectStatusKey(activeData[0]);
  const allStatuses = [...new Set(activeData.map(d => d[statusKey]).filter(Boolean))];
  const ordered     = [
    ...STATUS_DISPLAY_ORDER.filter(s => allStatuses.includes(s)),
    ...allStatuses.filter(s => !STATUS_DISPLAY_ORDER.includes(s)),
  ];

  return (
    <div style={{ minHeight:"100vh", position:"relative" }}>
      {/* 배경 — 고정 */}
      <div className="kolon-bg" />

      {/* ── STICKY 헤더 영역 ─────────────────────────────────────────────── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(239,243,246,0.92)",   /* 배경색과 동일한 반투명 */
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(208,222,232,0.7)",
        boxShadow: "0 2px 12px rgba(0,80,160,.06)",
        padding: "14px 28px 12px",
      }}>
        <div style={{ maxWidth:1440, margin:"0 auto" }}>

          {/* 헤더 타이틀 행 */}
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:12 }}>
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:7, marginBottom:6,
                background:"#E8F4FC", border:"1px solid #B0D4EF",
                borderRadius:20, padding:"4px 12px" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#0078C3" }} />
                <span style={{ fontSize:10, color:"#0060A0", fontWeight:700,
                  letterSpacing:".1em", textTransform:"uppercase" }}>
                  Kolon Benit · 건설서비스팀
                </span>
              </div>
              <h1 style={{ fontSize:26, fontWeight:900, color:"#0A1929",
                letterSpacing:"-.02em", lineHeight:1.2, margin:0 }}>
                SR / CO 대시보드
              </h1>
              {lastFetched && (
                <div style={{ fontSize:11, color:"#90ABBE", marginTop:3 }}>
                  {lastFetched.toLocaleTimeString("ko-KR")} 업데이트
                  &nbsp;·&nbsp;
                  <span style={{ color:"#0078C3", fontWeight:600 }}>SR {srData.length}건</span>
                  &nbsp;·&nbsp;
                  <span style={{ color:"#7C3AED", fontWeight:600 }}>CO {coData.length}건</span>
                </div>
              )}
            </div>

            {/* 탭 + 뷰 전환 */}
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ display:"flex", gap:5, background:"#fff",
                borderRadius:12, padding:5, border:"1px solid #D0DEE8" }}>
                {[["SR","서비스 요청","#0078C3","#E8F4FC"],
                  ["CO","변경 오더","#7C3AED","#F5F3FF"]].map(([t,label,color,bg]) => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding:"6px 16px", borderRadius:8, fontWeight:700, fontSize:13,
                    cursor:"pointer", transition:"all .15s", border:"none",
                    background: tab===t ? color : "transparent",
                    color: tab===t ? "#fff" : "#90ABBE",
                    boxShadow: tab===t ? `0 2px 8px ${color}40` : "none",
                  }}>
                    <span style={{ fontWeight:900 }}>{t}</span>
                    <span style={{ fontSize:11, marginLeft:6, opacity:.8 }}>{label}</span>
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", gap:3, background:"#fff",
                borderRadius:10, padding:3, border:"1px solid #D0DEE8" }}>
                {[["cards","카드"],["kanban","칸반"],["table","테이블"]].map(([v,l]) => (
                  <button key={v} onClick={() => setViewMode(v)} style={{
                    padding:"5px 12px", borderRadius:7, fontSize:12, fontWeight:600,
                    cursor:"pointer", border:"none", transition:"all .15s",
                    background: viewMode===v ? "#0078C3" : "transparent",
                    color: viewMode===v ? "#fff" : "#90ABBE",
                  }}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 날짜 조건 바 */}
          <div style={{
            display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
            background:"#fff", borderRadius:12, padding:"10px 14px",
            border:"1px solid #D0DEE8",
          }}>
            <span style={{
              fontSize:10, fontWeight:700, color:"#0078C3",
              background:"#E8F4FC", border:"1px solid #B0D4EF",
              borderRadius:6, padding:"2px 8px", whiteSpace:"nowrap",
            }}>reg_date</span>

            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:11, color:"#5C7A90", fontWeight:600 }}>시작</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                onKeyDown={e => e.key==="Enter" && onSearch()}
                style={{ background:"#F8FBFD", border:"1.5px solid #D0DEE8", borderRadius:8,
                  padding:"5px 10px", fontSize:12, color:"#0A1929", outline:"none",
                  cursor:"pointer", fontFamily:"inherit" }} />
            </div>
            <span style={{ color:"#90ABBE", fontWeight:600 }}>~</span>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:11, color:"#5C7A90", fontWeight:600 }}>종료</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                onKeyDown={e => e.key==="Enter" && onSearch()}
                style={{ background:"#F8FBFD", border:"1.5px solid #D0DEE8", borderRadius:8,
                  padding:"5px 10px", fontSize:12, color:"#0A1929", outline:"none",
                  cursor:"pointer", fontFamily:"inherit" }} />
            </div>

            <div style={{ display:"flex", gap:4 }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => { setDateFrom(daysAgo(p.days)); setDateTo(today()); }} style={{
                  padding:"4px 10px", borderRadius:7, fontSize:11, fontWeight:700,
                  cursor:"pointer", border:"1px solid #D0DEE8",
                  background:"#F5F9FC", color:"#5C7A90", transition:"all .15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background="#E8F4FC"; e.currentTarget.style.color="#0078C3"; e.currentTarget.style.borderColor="#B0D4EF"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#F5F9FC"; e.currentTarget.style.color="#5C7A90"; e.currentTarget.style.borderColor="#D0DEE8"; }}
                >{p.label}</button>
              ))}
            </div>

            <div style={{ width:1, height:24, background:"#E4EDF4" }} />

            <button onClick={onSearch} disabled={loading} style={{
              padding:"6px 18px", borderRadius:8, border:"none",
              background: loading ? "#C2DEF4" : "linear-gradient(135deg,#0078C3,#0060A0)",
              color:"#fff", fontWeight:700, fontSize:12,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 3px 10px rgba(0,120,195,.3)",
              display:"flex", alignItems:"center", gap:5, transition:"all .2s",
            }}>
              {loading
                ? <><span style={{ width:12, height:12, borderRadius:"50%",
                    border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff",
                    animation:"spin .7s linear infinite" }} />로딩</>
                : "🔍 조회"}
            </button>

            {lastFetched && !loading && (
              <span style={{ fontSize:10, color:"#90ABBE", marginLeft:"auto" }}>
                {dateFrom} ~ {dateTo} · {activeData.length}건
              </span>
            )}
          </div>

          {/* 통계 카드 */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",
            gap:10, marginTop:10 }}>
            <StatCard label="전체" value={activeData.length} color="#0078C3"
              sub={tab==="SR" ? "sr" : "co_base"} />
            {ordered.slice(0,5).map(s => {
              const m   = getStatusMeta(s);
              const cnt = activeData.filter(d => d[statusKey]===s).length;
              return <StatCard key={s} label={m.label} value={cnt} color={m.color} />;
            })}
          </div>

        </div>
      </div>

      {/* ── 스크롤 영역 — 차트 + 카드/칸반/테이블 ───────────────────────── */}
      <div style={{ position:"relative", zIndex:1, padding:"16px 28px 40px" }}>
        {selected && <Portal><DetailModal item={selected} onClose={() => setSelected(null)} /></Portal>}
        <div style={{ maxWidth:1440, margin:"0 auto" }}>

          {/* 차트 패널 */}
          {!loading && !error && <SRCharts data={activeData} />}

          {/* 메인 콘텐츠 */}
          {loading ? <Spinner /> : error ? (
            <div style={{ padding:"18px 22px", background:"#FEF2F2",
              border:"1px solid #FECACA", borderRadius:16, color:"#DC2626", fontSize:14 }}>
              ⚠️ {error}
            </div>
          ) : viewMode==="cards" ? (
            tab === "SR"
              ? <SRCardDashboard data={activeData} />
              : <COCardDashboard data={activeData} />
          ) : viewMode==="kanban" ? (
            <KanbanBoard data={activeData} onCardClick={setSelected} />
          ) : (
            <TableView data={activeData} onRowClick={setSelected} />
          )}
        </div>
      </div>
    </div>
  );
}

function TableView({ data, onRowClick }) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? data.filter(d => Object.values(d).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
    : data;
  if (!data.length) return <div style={{ textAlign:"center", color:"#90ABBE", padding:"60px 0" }}>데이터 없음</div>;
  const keys = Object.keys(data[0]).filter(k =>
    ["proc_id","offering_name","title","status_name","phase_name","assignee_name","reg_date","requester_name"].includes(k)
  );
  return (
    <div className="fade-in">
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 검색…"
        style={{ marginBottom:14, width:"100%", maxWidth:360,
          background:"#fff", border:"1.5px solid #D0DEE8",
          borderRadius:12, padding:"10px 16px", color:"#0A1929", fontSize:13, outline:"none" }} />
      <div style={{ overflowX:"auto", borderRadius:16, border:"1px solid #D0DEE8",
        background:"#fff", boxShadow:"0 2px 12px rgba(0,80,160,.07)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#F0F8FF" }}>
              {keys.map(k => (
                <th key={k} style={{ padding:"12px 16px", textAlign:"left",
                  color:"#5C7A90", fontWeight:700, fontSize:11,
                  letterSpacing:".06em", textTransform:"uppercase",
                  borderBottom:"1px solid #D0DEE8", whiteSpace:"nowrap" }}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row,i) => (
              <tr key={row.proc_id??i} onClick={() => onRowClick(row)}
                style={{ background:i%2?"#FAFCFE":"#fff", cursor:"pointer", transition:"background .1s" }}
                onMouseEnter={e => e.currentTarget.style.background="#EBF4FB"}
                onMouseLeave={e => e.currentTarget.style.background=i%2?"#FAFCFE":"#fff"}>
                {keys.map(k => (
                  <td key={k} style={{ padding:"12px 16px", color:"#2C4A63",
                    maxWidth:200, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    borderBottom:"1px solid #EBF4FB" }}>{String(row[k]??"—")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize:12, color:"#90ABBE", padding:"10px 16px" }}>
          {filtered.length}건 / 전체 {data.length}건
        </div>
      </div>
    </div>
  );
}
