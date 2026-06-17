import { useEffect } from "react";
import { getStatusMeta } from "../utils/statusMeta";
import Portal from "./Portal";

/* HTML 태그 완전 제거 + 읽기 좋게 정리 */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")         // 나머지 태그 모두 제거
    .replace(/&nbsp;/g, " ")
    .replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")       // 연속 줄바꿈 정리
    .trim();
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }) +
    " " + d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

const FIELD_LABELS = {
  proc_id: "프로세스 ID", offering_id: "오퍼링 ID",
  wf_status: "WF 상태코드", wf_phase: "WF 단계",
  status_name: "상태", phase_name: "단계",
  customer: "고객", company: "회사",
  assignee: "담당자 ID", assignee_name: "담당자",
  assignee_dept: "담당 부서", assigngroup: "담당 그룹",
  register: "등록자 ID", register_name: "등록자",
  reg_date: "등록일", mod_date: "수정일",
  resolve_date: "해결일", accept_date: "접수일",
  close_date: "종료일", accept_todo_date: "처리 목표일",
  bnt_start_time: "BNT 시작",
  category: "카테고리", category_detail: "카테고리 상세",
  emergency_type: "긴급 유형", accept_route: "접수 경로",
  solution_type_l: "해결유형(대)", solution_type_m: "해결유형(중)",
  year: "연도", rel_co: "관련 CO",
  c_cancel_yn: "취소 여부", qa_end_flag: "QA 완료",
  requester_name: "요청자", requester_company: "요청자 회사",
  requester_department: "요청자 부서",
  assignee_company: "담당자 회사", assignee_department: "담당자 부서",
};

function isDateKey(k) {
  return k.includes("date") || k.includes("time");
}

function fmtValue(k, v) {
  if (!v || v === "null") return "—";
  if (isDateKey(k)) {
    const d = new Date(v);
    return isNaN(d) ? String(v) : d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
  }
  return String(v);
}

/* 내용 블록 컴포넌트 */
function ContentBlock({ label, text, accent }) {
  if (!text) return null;
  return (
    <div style={{
      marginBottom: 16,
      background: accent ? "#F0F8FF" : "#F8FBFD",
      border: `1px solid ${accent ? "#B0D4EF" : "#E4EDF4"}`,
      borderLeft: `4px solid ${accent ?? "#D0DEE8"}`,
      borderRadius: 12, padding: "14px 16px",
    }}>
      <div style={{
        fontSize: 10, fontWeight: 800, letterSpacing: ".08em",
        textTransform: "uppercase", marginBottom: 8,
        color: accent ?? "#90ABBE",
      }}>{label}</div>
      <div style={{
        fontSize: 14, color: "#2C4A63", lineHeight: 1.85,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        maxHeight: 300, overflowY: "auto",
      }}>{text}</div>
    </div>
  );
}

export default function DetailModal({ item, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!item) return null;

  const titleVal = item.title ?? item.name ?? item.subject ?? "상세 정보";
  const sm = getStatusMeta(item.status_name ?? item.wf_status);

  /* 표시할 메타 필드 — 긴 텍스트 필드 제외 */
  const LONG_TEXT = new Set(["title", "name", "subject", "content", "resolve_content",
    "progress_content", "accept_desc", "description", "comments"]);

  const gridEntries = Object.entries(item).filter(([k, v]) =>
    !LONG_TEXT.has(k) &&
    v !== null && v !== undefined &&
    String(v) !== "null" && String(v) !== "" &&
    typeof v !== "object"
  );

  return (
    <Portal>
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(10,25,50,.4)", backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="fade-in"
        style={{
          background: "#fff",
          borderRadius: 24, width: "100%", maxWidth: 640,
          maxHeight: "88vh", overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,20,60,.18), 0 4px 16px rgba(0,20,60,.1)",
          border: "1px solid #D0DEE8",
        }}
      >
        {/* 헤더 */}
        <div style={{
          padding: "22px 26px 18px",
          borderBottom: "1px solid #EBF4FB",
          background: "linear-gradient(135deg, #F0F8FF 0%, #FAFCFE 100%)",
          borderRadius: "24px 24px 0 0",
          position: "sticky", top: 0, zIndex: 1,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                {item.proc_id && (
                  <span className="mono" style={{
                    fontSize: 11, color: "#0078C3", fontWeight: 700,
                    background: "#E8F4FC", padding: "2px 10px", borderRadius: 8,
                  }}>{item.proc_id}</span>
                )}
                {item.status_name && (
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20,
                    background: sm.bg, color: sm.color,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: sm.color }} />
                    {item.status_name}
                  </span>
                )}
                {item.phase_name && (
                  <span style={{ fontSize: 11, color: "#5C7A90", background: "#F0F6FA",
                    border: "1px solid #D0DEE8", padding: "2px 10px", borderRadius: 12 }}>
                    {item.phase_name}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0A1929", lineHeight: 1.4 }}>
                {(titleVal || "—").replace(/[\r\n]+/g, " ")}
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

        <div style={{ padding: "20px 26px" }}>

          {/* ── 요청 내용 (HTML → 텍스트) */}
          <ContentBlock label="요청 내용" text={stripHtml(item.content)} accent="#0078C3" />

          {/* ── 해결 내용 (HTML → 텍스트) */}
          <ContentBlock label="해결 내용" text={stripHtml(item.resolve_content)} accent="#059669" />

          {/* ── 진행 메모 */}
          <ContentBlock label="진행 메모" text={stripHtml(item.progress_content)} accent="#7C3AED" />

          {/* ── 접수 안내 */}
          {item.accept_desc && (
            <ContentBlock label="접수 안내" text={item.accept_desc} accent="#D97706" />
          )}

          {/* ── 메타 필드 그리드 */}
          {gridEntries.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: "#90ABBE", fontWeight: 700, letterSpacing: ".08em",
                textTransform: "uppercase", marginBottom: 10 }}>상세 정보</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {gridEntries.map(([k, v]) => (
                  <div key={k} style={{
                    background: "#F8FBFD", border: "1px solid #E4EDF4",
                    borderRadius: 10, padding: "10px 14px",
                  }}>
                    <div style={{ fontSize: 9, color: "#90ABBE", fontWeight: 700,
                      letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 3 }}>
                      {FIELD_LABELS[k] ?? k}
                    </div>
                    <div style={{ fontSize: 13, color: "#0A1929", fontWeight: 600, wordBreak: "break-word" }}>
                      {fmtValue(k, v)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
}
