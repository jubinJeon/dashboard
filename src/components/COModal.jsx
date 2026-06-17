import { useState, useEffect } from "react";
import Portal from "./Portal";
import { getCOStatusMeta } from "../utils/coStatusMeta";
import CharacterAvatar from "./CharacterAvatar";
import { gqlRequest, CO_PLAN_QUERY, CO_DEVOPS_QUERY, CO_IMPL_QUERY, CO_TEST_QUERY, CO_QUALITY_QUERY } from "../api/graphqlClient";

// ── 유틸 ──────────────────────────────────────────────────────────────────────
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n").replace(/<\/div>/gi,"\n")
    .replace(/<li[^>]*>/gi,"• ").replace(/<[^>]+>/g,"")
    .replace(/&nbsp;/g," ").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&amp;/g,"&")
    .replace(/\n{3,}/g,"\n\n").trim();
}
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ko-KR",{year:"numeric",month:"2-digit",day:"2-digit"});
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR",{month:"2-digit",day:"2-digit"}) + " " +
    d.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"});
}

function getSC(s) {
  return getCOStatusMeta(s).dot;
}
function getSCFull(s) {
  return getCOStatusMeta(s);
}

// ── 공통 UI ───────────────────────────────────────────────────────────────────
function MetaGrid({ items }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
      {items.filter(([,v]) => v && v !== "null" && v !== "—").map(([k,v]) => (
        <div key={k} style={{ background:"#F8FBFD", border:"1px solid #E4EDF4",
          borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:9, color:"#90ABBE", fontWeight:700, letterSpacing:".08em",
            textTransform:"uppercase", marginBottom:3 }}>{k}</div>
          <div style={{ fontSize:13, color:"#0A1929", fontWeight:600, wordBreak:"break-word" }}>{v || "—"}</div>
        </div>
      ))}
    </div>
  );
}

function ContentBlock({ label, text, color="#0078C3" }) {
  if (!text) return null;
  return (
    <div style={{ marginBottom:14, background:"#F8FBFD",
      border:`1px solid #E4EDF4`, borderLeft:`4px solid ${color}`,
      borderRadius:10, padding:"12px 16px" }}>
      <div style={{ fontSize:9, fontWeight:800, letterSpacing:".08em", textTransform:"uppercase",
        marginBottom:7, color }}>{label}</div>
      <div style={{ fontSize:13, color:"#2C4A63", lineHeight:1.85,
        whiteSpace:"pre-wrap", wordBreak:"break-word", maxHeight:250, overflowY:"auto" }}>{text}</div>
    </div>
  );
}

function EmptyState({ msg="데이터 없음" }) {
  return (
    <div style={{ textAlign:"center", padding:"40px 0", color:"#90ABBE" }}>
      <div style={{ fontSize:28, marginBottom:8 }}>📭</div>
      <div style={{ fontSize:13 }}>{msg}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ textAlign:"center", padding:"40px 0" }}>
      <div style={{ width:28, height:28, borderRadius:"50%",
        border:"3px solid #C2DEF4", borderTopColor:"#0078C3",
        animation:"spin .7s linear infinite", margin:"0 auto 10px" }} />
      <div style={{ fontSize:12, color:"#90ABBE" }}>로딩 중…</div>
    </div>
  );
}

// ── 탭 콘텐츠들 ───────────────────────────────────────────────────────────────
function TabBase({ item }) {
  const sc = getSC(item.status_name);
  return (
    <div>
      {/* 담당자 */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16,
        padding:"14px 16px", background:"#F8FBFD", borderRadius:14,
        border:"1px solid #E4EDF4" }}>
        <CharacterAvatar assigneeId={item.assignee} assigneeName={item.assignee_name} size={52} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#0A1929" }}>{item.assignee_name ?? "—"}</div>
          <div style={{ fontSize:12, color:"#5C7A90" }}>{item.assignee_department ?? ""}</div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:10, color:"#90ABBE", marginBottom:3 }}>요청자</div>
          <div style={{ fontSize:14, fontWeight:700, color:"#2C4A63" }}>{item.requester_name}</div>
          <div style={{ fontSize:11, color:"#5C7A90" }}>{item.requester_company}</div>
        </div>
      </div>

      <MetaGrid items={[
        ["CO 유형",   item.co_type_kor],
        ["CO 구분",   item.co_division_kor],
        ["요청 부서", item.requester_department],
        ["등록자",    item.register_name],
        ["등록일",    fmtDateTime(item.reg_date)],
        ["완료일",    fmtDate(item.close_date)],
        ["해결일",    fmtDate(item.resolve_date)],
        ["WF 상태",   item.wf_status],
      ]} />

      <ContentBlock label="변경 내용" text={stripHtml(item.content)} color="#0078C3" />
    </div>
  );
}

function TabPlan({ procId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gqlRequest(CO_PLAN_QUERY(procId))
      .then(d => setData(d?.co_plans?.items?.[0] ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [procId]);

  if (loading) return <LoadingState />;
  if (!data)   return <EmptyState msg="계획 정보가 없습니다" />;

  return (
    <div>
      <MetaGrid items={[
        ["계획일",         fmtDate(data.co_plan_date)],
        ["릴리스 계획일",   fmtDate(data.rel_plan_date)],
        ["작업 시작",       fmtDate(data.plan_est_dates)],
        ["작업 종료",       fmtDate(data.plan_est_datee)],
        ["다운타임 여부",   data.plan_downtime_flag === "Y" ? "있음" : "없음"],
        ["다운타임 시작",   fmtDate(data.plan_downtime_dates)],
        ["다운타임 종료",   fmtDate(data.plan_downtime_datee)],
        ["테스터",          data.plan_tester],
        ["테스트 시작",     fmtDate(data.plan_test_dates)],
        ["테스트 종료",     fmtDate(data.plan_test_datee)],
        ["고객 테스트",     data.plan_cust_test_flag === "Y" ? "필요" : "불필요"],
        ["CAB 필요",        data.plan_cab_flag === "Y" ? "필요" : "불필요"],
        ["롤백 담당자",     data.plan_rollback_user],
      ]} />
      <ContentBlock label="변경 계획" text={stripHtml(data.plan_desc)} color="#0078C3" />
      <ContentBlock label="테스트 목표" text={stripHtml(data.plan_test_goal)} color="#10B981" />
      <ContentBlock label="테스트 시나리오" text={stripHtml(data.plan_test_scenario)} color="#F59E0B" />
      <ContentBlock label="영향도" text={stripHtml(data.plan_impact)} color="#7C3AED" />
      <ContentBlock label="시스템 영향" text={stripHtml(data.plan_sys_impact_desc)} color="#EF4444" />
      <ContentBlock label="롤백 방법" text={stripHtml(data.plan_rollback_desc)} color="#6B7280" />
      <ContentBlock label="승인 의견" text={stripHtml(data.plan_approve_opinion)} color="#0891B2" />
    </div>
  );
}

function TabDevops({ procId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gqlRequest(CO_DEVOPS_QUERY(procId))
      .then(d => setData(d?.co_devops_list?.items?.[0] ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [procId]);

  if (loading) return <LoadingState />;
  if (!data)   return <EmptyState msg="DevOps 정보가 없습니다" />;

  return (
    <div>
      <MetaGrid items={[
        ["Git 저장소",      data.git_repo],
        ["브랜치 사용",     data.git_branch_yn === "Y" ? "사용" : "미사용"],
        ["릴리스 버전",     data.release_version],
        ["Jira 프로젝트",   data.jira_prj_key],
        ["Jira 프로젝트명", data.jira_prj_name],
        ["Jira 이슈",       data.jira_issue_key],
        ["리뷰 프로젝트",   data.jira_prj_key_review],
        ["리뷰 프로젝트명", data.jira_prj_name_review],
        ["리뷰 이슈",       data.jira_issue_key_review],
      ]} />
    </div>
  );
}

function TabImpl({ procId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gqlRequest(CO_IMPL_QUERY(procId))
      .then(d => setData(d?.co_impls?.items?.[0] ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [procId]);

  if (loading) return <LoadingState />;
  if (!data)   return <EmptyState msg="구현 정보가 없습니다" />;

  return (
    <div>
      <MetaGrid items={[
        ["변경파일 수(CF)",    data.imp_cf_cnt],
        ["변경모듈 수(CM)",    data.imp_cm_cnt],
        ["CM 분석 수",         data.imp_cm_anl_cnt],
        ["변경점 수(CP)",      data.imp_cp_cnt],
        ["형상관리 방법",      data.imp_conf_method],
        ["수확물 여부",        data.imp_conf_harvest],
      ]} />
      <ContentBlock label="설계 내용" text={stripHtml(data.imp_design_desc)} color="#0078C3" />
      <ContentBlock label="개발 내용" text={stripHtml(data.imp_develop_desc)} color="#10B981" />
      <ContentBlock label="형상관리 설명" text={stripHtml(data.imp_conf_desc)} color="#F59E0B" />
    </div>
  );
}

function TabTest({ procId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gqlRequest(CO_TEST_QUERY(procId))
      .then(d => setData(d?.co_tests?.items?.[0] ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [procId]);

  if (loading) return <LoadingState />;
  if (!data)   return <EmptyState msg="테스트 정보가 없습니다" />;

  return (
    <div>
      <MetaGrid items={[
        ["테스트 시작일",   fmtDateTime(data.test_real_dates)],
        ["테스트 종료일",   fmtDateTime(data.test_real_datee)],
        ["테스터",          data.test_tester],
        ["고객 테스트",     data.test_cust_test_flag === "Y" ? "완료" : "미완료"],
      ]} />
      <ContentBlock label="테스트 결과" text={stripHtml(data.test_result_desc)} color="#10B981" />
    </div>
  );
}

function TabQuality({ procId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gqlRequest(CO_QUALITY_QUERY(procId))
      .then(d => setData(d?.co_qualities?.items?.[0] ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [procId]);

  if (loading) return <LoadingState />;
  if (!data)   return <EmptyState msg="품질 정보가 없습니다" />;

  return (
    <div>
      <MetaGrid items={[
        ["CO 등급",         data.qa_co_grade],
        ["CO 유형",         data.qa_co_type],
        ["CO 분류",         data.qa_co_class],
        ["CO 분류(하위)",   data.qa_co_class_sub],
        ["릴리스 성공",     data.qa_rel_success_flag === "Y" ? "성공" : "실패/미완료"],
        ["릴리스 시간",     fmtDateTime(data.qa_re_time)],
        ["오퍼링 ID",       data.qa_offering_id],
        ["영향도",          data.qa_impact],
        ["긴급 유형",       data.qa_urgent_type],
      ]} />
      <ContentBlock label="품질 의견" text={stripHtml(data.qa_opinion)} color="#7C3AED" />
    </div>
  );
}

// ── 탭 정의 ───────────────────────────────────────────────────────────────────
const TABS = [
  { key:"base",    label:"기본",   icon:"📋", color:"#0078C3" },
  { key:"plan",    label:"계획",   icon:"📅", color:"#F59E0B" },
  { key:"devops",  label:"DevOps", icon:"⚙️",  color:"#10B981" },
  { key:"impl",    label:"구현",   icon:"💻", color:"#3B82F6" },
  { key:"test",    label:"테스트", icon:"🧪", color:"#EF4444" },
  { key:"quality", label:"품질",   icon:"✅", color:"#7C3AED" },
];

// ── 메인 모달 ─────────────────────────────────────────────────────────────────
export default function COModal({ item, onClose }) {
  const [tab, setTab] = useState("base");
  const sc = getSC(item?.status_name);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!item) return null;

  return (
    <Portal>
      <div onClick={onClose} style={{
        position:"fixed", inset:0, zIndex:9999,
        background:"rgba(10,25,50,.45)", backdropFilter:"blur(6px)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:20,
      }}>
        <div onClick={e => e.stopPropagation()} className="fade-in" style={{
          background:"#fff", borderRadius:24,
          width:"100%", maxWidth:680,
          maxHeight:"90vh", display:"flex", flexDirection:"column",
          boxShadow:"0 24px 80px rgba(0,20,60,.18)", border:"1px solid #D0DEE8",
          overflow:"hidden",
        }}>
          {/* ── 헤더 ── */}
          <div style={{
            padding:"20px 26px 16px",
            borderBottom:"1px solid #EBF4FB",
            background:"linear-gradient(135deg,#F0F8FF,#FAFCFE)",
            flexShrink:0,
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1, minWidth:0, paddingRight:14 }}>
                {/* 배지 행 */}
                <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:10, flexWrap:"wrap" }}>
                  <span className="mono" style={{ fontSize:11, color:"#0078C3", fontWeight:700,
                    background:"#E8F4FC", padding:"2px 10px", borderRadius:8 }}>
                    {item.proc_id}
                  </span>
                  {item.offering_name && (
                    <span style={{ fontSize:10, color:"#0060A0", fontWeight:600,
                      background:"#F0F8FF", border:"1px solid #B0D4EF",
                      padding:"2px 9px", borderRadius:7,
                      maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                      title={item.offering_name}>{item.offering_name}</span>
                  )}
                  <span style={{
                    fontSize:11, fontWeight:700, padding:"3px 11px", borderRadius:20,
                    background:getSCFull(item?.status_name).bg, color:getSCFull(item?.status_name).color, border:`1px solid ${getSCFull(item?.status_name).border}`,
                    display:"flex", alignItems:"center", gap:5,
                  }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:getSCFull(item?.status_name).dot }} />
                    {item.status_name}
                  </span>
                  {item.phase_name && (
                    <span style={{ fontSize:10, color:"#5C7A90", background:"#F0F6FA",
                      border:"1px solid #D0DEE8", padding:"2px 9px", borderRadius:12 }}>
                      {item.phase_name}
                    </span>
                  )}
                  {item.co_type_kor && (
                    <span style={{ fontSize:10, color:"#7C3AED", background:"#F5F3FF",
                      border:"1px solid #DDD6FE", padding:"2px 9px", borderRadius:12 }}>
                      {item.co_type_kor}
                    </span>
                  )}
                </div>
                <div style={{ fontSize:18, fontWeight:800, color:"#0A1929", lineHeight:1.4 }}>
                  {(item.title?.trim() || "제목 없음").replace(/[\r\n]+/g," ")}
                </div>
              </div>
              <button onClick={onClose} style={{
                width:34, height:34, borderRadius:"50%", flexShrink:0,
                background:"#F0F6FA", border:"1px solid #D0DEE8",
                color:"#5C7A90", fontSize:18, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>×</button>
            </div>

            {/* ── 탭 ── */}
            <div style={{ display:"flex", gap:0, marginTop:14,
              borderBottom:"2px solid #EBF4FB", marginLeft:-2 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  padding:"7px 16px", fontSize:12, fontWeight:700,
                  cursor:"pointer", background:"none", border:"none",
                  borderBottom:`2px solid ${tab===t.key ? t.color : "transparent"}`,
                  color: tab===t.key ? t.color : "#90ABBE",
                  marginBottom:-2, transition:"all .15s",
                  display:"flex", alignItems:"center", gap:5,
                }}>
                  <span style={{ fontSize:13 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 탭 콘텐츠 ── */}
          <div style={{ flex:1, overflowY:"auto", padding:"18px 26px" }}>
            {tab === "base"    && <TabBase    item={item} />}
            {tab === "plan"    && <TabPlan    procId={item.proc_id} />}
            {tab === "devops"  && <TabDevops  procId={item.proc_id} />}
            {tab === "impl"    && <TabImpl    procId={item.proc_id} />}
            {tab === "test"    && <TabTest    procId={item.proc_id} />}
            {tab === "quality" && <TabQuality procId={item.proc_id} />}
          </div>
        </div>
      </div>
    </Portal>
  );
}
