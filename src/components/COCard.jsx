import { useState, useEffect } from "react";
import CharacterAvatar from "./CharacterAvatar";
import COModal from "./COModal";
import { getCOStatusMeta } from "../utils/coStatusMeta";

function fmtShort(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ko-KR",{month:"2-digit",day:"2-digit"});
}
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/\n{3,}/g,"\n\n").trim();
}

const getSM = n => getCOStatusMeta(n);

const PAGE_SIZE = 12;

// ── CO 카드 ───────────────────────────────────────────────────────────────────
function COCard({ item, onClick }) {
  const sm      = getSM(item.status_name);
  const title   = (item.title?.trim() || "제목 없음").replace(/[\r\n]+/g," ");
  const preview = stripHtml(item.content);

  return (
    <div onClick={() => onClick(item)} className="fade-in" style={{
      background:"#fff", border:"1px solid #D8E8F2", borderRadius:20,
      padding:"20px 20px 16px", cursor:"pointer",
      transition:"all .2s ease", position:"relative", overflow:"hidden",
      boxShadow:"0 2px 12px rgba(0,80,160,.07)",
      display:"flex", flexDirection:"column",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="#0078C3"; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 36px rgba(0,120,195,.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="#D8E8F2"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 12px rgba(0,80,160,.07)"; }}
    >
      {/* 상단 컬러바 — CO는 보라 */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4,
        background:"linear-gradient(90deg,#0078C3,#0078C344)",
        borderRadius:"20px 20px 0 0" }} />

      {/* ID + 오퍼링 + 상태 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", flex:1, minWidth:0, paddingRight:6 }}>
          {item.proc_id && (
            <span className="mono" style={{ fontSize:10, color:"#0078C3", fontWeight:700,
              background:"#E8F4FC", padding:"2px 8px", borderRadius:6, flexShrink:0 }}>
              {item.proc_id}
            </span>
          )}
          {item.offering_name && (
            <span style={{ fontSize:10, color:"#5B21B6", fontWeight:600,
              background:"#EDE9FE", border:"1px solid #DDD6FE",
              padding:"2px 8px", borderRadius:6,
              maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
              title={item.offering_name}>{item.offering_name}</span>
          )}
        </div>
        <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20,
          background:sm.bg, color:sm.color, border:`1px solid ${sm.border}`,
          display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:sm.dot }} />
          {item.status_name}
        </span>
      </div>

      {/* CO 유형/구분 뱃지 */}
      <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
        {item.co_type_kor && (
          <span style={{ fontSize:10, color:"#0060A0", background:"#E8F4FC",
            border:"1px solid #B0D4EF", padding:"1px 8px", borderRadius:6, fontWeight:600 }}>
            {item.co_type_kor}
          </span>
        )}
        {item.co_division_kor && (
          <span style={{ fontSize:10, color:"#5C7A90", background:"#F0F6FA",
            border:"1px solid #D0DEE8", padding:"1px 8px", borderRadius:6, fontWeight:600 }}>
            {item.co_division_kor}
          </span>
        )}
        {item.phase_name && (
          <span style={{ fontSize:10, color:"#5C7A90", background:"#F5F9FC",
            border:"1px solid #D0DEE8", padding:"1px 8px", borderRadius:6 }}>
            {item.phase_name}
          </span>
        )}
      </div>

      {/* 제목 */}
      <div style={{ fontSize:15, fontWeight:700, color:"#0A1929", lineHeight:1.5,
        marginBottom:8, display:"-webkit-box", WebkitLineClamp:2,
        WebkitBoxOrient:"vertical", overflow:"hidden" }}>{title}</div>

      {/* 내용 미리보기 */}
      {preview && (
        <div style={{ fontSize:12, color:"#5C7A90", lineHeight:1.6, marginBottom:12,
          display:"-webkit-box", WebkitLineClamp:2,
          WebkitBoxOrient:"vertical", overflow:"hidden" }}>{preview}</div>
      )}

      {/* 담당자 + 요청자 */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12,
        padding:"10px 12px", background:"#F5F9FC", borderRadius:12,
        border:"1px solid #E4EDF4", marginTop:"auto" }}>
        <CharacterAvatar assigneeId={item.assignee} assigneeName={item.assignee_name} size={40} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#0A1929",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {item.assignee_name ?? "담당자 미배정"}
          </div>
          <div style={{ fontSize:11, color:"#5C7A90",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {item.assignee_department ?? ""}
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:10, color:"#90ABBE", marginBottom:2 }}>요청자</div>
          <div style={{ fontSize:12, fontWeight:700, color:"#2C4A63",
            maxWidth:90, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {item.requester_name}
          </div>
        </div>
      </div>

      {/* 날짜 */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:12 }}>
          <span style={{ fontSize:11, color:"#5C7A90" }}>
            <span style={{ color:"#90ABBE", marginRight:3 }}>등록</span>{fmtShort(item.reg_date)}
          </span>
          {item.close_date && (
            <span style={{ fontSize:11, color:"#5C7A90" }}>
              <span style={{ color:"#90ABBE", marginRight:3 }}>완료</span>{fmtShort(item.close_date)}
            </span>
          )}
        </div>
        {/* 탭 힌트 */}
        <div style={{ display:"flex", gap:3 }}>
          {["계획","DevOps","구현","테스트","품질"].map(l => (
            <span key={l} style={{ fontSize:9, color:"#B8CEDF", background:"#F5F9FC",
              border:"1px solid #E4EDF4", borderRadius:4, padding:"1px 5px" }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 페이지네이션 ──────────────────────────────────────────────────────────────
function Pagination({ total, page, setPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  const getPages = () => {
    if (totalPages <= 7) return Array.from({length:totalPages},(_,i)=>i+1);
    if (page <= 4) return [1,2,3,4,5,"…",totalPages];
    if (page >= totalPages-3) return [1,"…",totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages];
    return [1,"…",page-1,page,page+1,"…",totalPages];
  };
  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center",
      gap:6, marginTop:32, paddingTop:20, borderTop:"1px solid #E4EDF4" }}>
      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{
        padding:"8px 14px", borderRadius:10, border:"1px solid #D0DEE8",
        background:page===1?"#F5F9FC":"#fff", color:page===1?"#B8CEDF":"#2C4A63",
        fontWeight:700, fontSize:13, cursor:page===1?"not-allowed":"pointer",
      }}>← 이전</button>
      {getPages().map((p,i) =>
        p === "…" ? <span key={`e${i}`} style={{ color:"#90ABBE", fontSize:14 }}>…</span> : (
          <button key={p} onClick={() => setPage(p)} style={{
            width:38, height:38, borderRadius:10, border:"1px solid",
            borderColor:p===page?"#0078C3":"#D0DEE8",
            background:p===page?"#0078C3":"#fff",
            color:p===page?"#fff":"#2C4A63",
            fontWeight:700, fontSize:13, cursor:"pointer",
            boxShadow:p===page?"0 4px 12px rgba(0,120,195,.3)":"none",
            transition:"all .15s",
          }}>{p}</button>
        )
      )}
      <button onClick={() => setPage(p => Math.min(Math.ceil(total/PAGE_SIZE),p+1))}
        disabled={page===Math.ceil(total/PAGE_SIZE)} style={{
        padding:"8px 14px", borderRadius:10, border:"1px solid #D0DEE8",
        background:page===Math.ceil(total/PAGE_SIZE)?"#F5F9FC":"#fff",
        color:page===Math.ceil(total/PAGE_SIZE)?"#B8CEDF":"#2C4A63",
        fontWeight:700, fontSize:13, cursor:page===Math.ceil(total/PAGE_SIZE)?"not-allowed":"pointer",
      }}>다음 →</button>
      <span style={{ fontSize:12, color:"#90ABBE", marginLeft:6 }}>
        {page}/{Math.ceil(total/PAGE_SIZE)} · {total}건
      </span>
    </div>
  );
}

// ── 필터 바 ───────────────────────────────────────────────────────────────────
function FilterBar({ data, filter, setFilter }) {
  const statuses = ["전체", ...new Set(data.map(d => d.status_name).filter(Boolean))];
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
      {statuses.map(s => {
        const active = filter.status === s;
        const cnt    = s==="전체" ? data.length : data.filter(d=>d.status_name===s).length;
        const sm     = getSM(s);
        const c = s==="전체"
          ? { bg:active?"#E8F4FC":"#fff", color:active?"#0078C3":"#5C7A90", border:active?"#B0D4EF":"#D0DEE8" }
          : (active ? {bg:sm.bg, color:sm.color, border:sm.border} : {bg:"#fff",color:"#5C7A90",border:"#D0DEE8"});
        return (
          <button key={s} onClick={() => setFilter(f => ({...f, status:s}))} style={{
            padding:"7px 14px", borderRadius:20, fontWeight:700, fontSize:13,
            cursor:"pointer", transition:"all .15s",
            border:`1px solid ${c.border}`, background:c.bg, color:c.color,
            display:"flex", alignItems:"center", gap:6,
          }}>
            {s}
            <span style={{ fontSize:11, fontWeight:800,
              background:active?`${c.color}18`:"#F0F6FA",
              color:active?c.color:"#90ABBE",
              borderRadius:10, padding:"0 7px" }}>{cnt}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
export default function COCardDashboard({ data = [] }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState({ status:"전체", search:"" });
  const [sort, setSort]         = useState("reg_date_desc");
  const [page, setPage]         = useState(1);

  useEffect(() => { setPage(1); }, [filter, sort]);

  let filtered = data.filter(d => {
    if (filter.status !== "전체" && d.status_name !== filter.status) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      return d.proc_id?.toLowerCase().includes(q) || d.title?.toLowerCase().includes(q) ||
        d.requester_name?.toLowerCase().includes(q) || d.assignee_name?.toLowerCase().includes(q) ||
        d.offering_name?.toLowerCase().includes(q) || d.co_type_kor?.toLowerCase().includes(q);
    }
    return true;
  });

  filtered = [...filtered].sort((a,b) => {
    if (sort==="reg_date_desc") return new Date(b.reg_date)-new Date(a.reg_date);
    if (sort==="reg_date_asc")  return new Date(a.reg_date)-new Date(b.reg_date);
    return 0;
  });

  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  return (
    <div>
      {selected && <COModal item={selected} onClose={() => setSelected(null)} />}

      {/* 툴바 */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <input value={filter.search} onChange={e => setFilter(f=>({...f,search:e.target.value}))}
          placeholder="🔍  CO ID, 제목, 요청자, 오퍼링 검색…"
          style={{ flex:"1 1 220px", background:"#fff", border:"1.5px solid #D0DEE8",
            borderRadius:12, padding:"10px 16px", color:"#0A1929", fontSize:13, outline:"none" }} />
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{
          background:"#fff", border:"1.5px solid #D0DEE8", borderRadius:12,
          padding:"10px 14px", color:"#2C4A63", fontSize:13, outline:"none" }}>
          <option value="reg_date_desc">등록일 최신순</option>
          <option value="reg_date_asc">등록일 오래된순</option>
        </select>
      </div>

      <div style={{ marginBottom:18 }}>
        <FilterBar data={data} filter={filter} setFilter={setFilter} />
      </div>

      <div style={{ fontSize:13, color:"#90ABBE", marginBottom:14 }}>
        {filtered.length}건 · {page}/{Math.ceil(filtered.length/PAGE_SIZE)||1} 페이지
      </div>

      {paginated.length === 0 ? (
        <div style={{ textAlign:"center", color:"#90ABBE", padding:"60px 0", fontSize:15 }}>
          검색 결과가 없습니다
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {paginated.map(item => (
            <COCard key={item.proc_id} item={item} onClick={setSelected} />
          ))}
        </div>
      )}

      <Pagination total={filtered.length} page={page} setPage={setPage} />
    </div>
  );
}
