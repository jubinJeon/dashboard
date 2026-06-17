/**
 * 프론트엔드 GraphQL 클라이언트
 * → /api/graphql (백엔드 서버) 경유
 *   - dev: vite proxy 가 3001 로 전달 (vite.config.js)
 *   - prod: server.js 가 동일 오리진에서 정적+API 모두 서빙
 *   - VITE_API_URL 로 오버라이드 가능
 */

const API_URL = import.meta.env.VITE_API_URL || "/api/graphql";

export async function gqlRequest(query, variables = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`서버 오류 ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join("\n"));
  return json.data;
}

// ── SR 쿼리 — reg_date 기준, 날짜 범위 동적 주입 ─────────────────────────────
export function buildSRQuery(dateFrom, dateTo) {
  const fromStr = dateFrom ?? "2026-06-01";
  const toStr   = dateTo   ?? new Date().toISOString().slice(0, 10);

  return `
    query GetSRList($first: Int, $after: String) {
      srs(
        first: $first
        after: $after
        filter: {
          reg_date: { gte: "${fromStr}", lte: "${toStr}" }
          assignee_dept: { eq: "건설서비스팀" }
        }
        orderBy: { reg_date: DESC }
      ) {
        items {
          proc_id
          offering_id
          phase_name
          status_name
          requester_name
          requester_company
          requester_department
          reg_date
          accept_date
          assignee
          assignee_name
          assignee_company
          assignee_department
          title
          content
          resolve_content
          bnt_start_time
          accept_desc
          accept_todo_date
          progress_content
          emergency_type
          category
          wf_status
          wf_phase
        }
        endCursor
        hasNextPage
      }
    }
  `;
}

// 기본 쿼리 (하위호환)
export const SR_QUERY = buildSRQuery("2026-06-01", null);

// ── CO 쿼리 ──────────────────────────────────────────────────────────────────
export function buildCOQuery(dateFrom, dateTo) {
  const fromStr = dateFrom ?? "2026-06-01";
  const toStr   = dateTo   ?? new Date().toISOString().slice(0, 10);

  return `
    query GetCOList($first: Int, $after: String) {
      co_bases(
        first: $first
        after: $after
        filter: {
          reg_date: { gte: "${fromStr}", lte: "${toStr}" }
        }
        orderBy: { reg_date: DESC }
      ) {
        items {
          proc_id
          offering_id
          wf_key
          wf_status
          wf_phase
          phase_name
          status_name
          customer
          company
          assignee
          assignee_dept
          assigngroup
          title
          content
          register
          reg_date
          close_date
          mod_date
          resolve_date
        }
        endCursor
        hasNextPage
      }
    }
  `;
}

export const CO_QUERY = buildCOQuery("2026-06-01", null);

// ── 페이지네이션 전체 fetch ───────────────────────────────────────────────────
export async function fetchAllPages(query, dataKey, variables = {}, maxPages = 20) {
  const all = [];
  let after = null;
  let page  = 0;

  while (page < maxPages) {
    const data = await gqlRequest(query, { ...variables, first: 200, after });
    const conn = data[dataKey];
    all.push(...conn.items);
    if (!conn.hasNextPage) break;
    after = conn.endCursor;
    page++;
  }
  return all;
}

export function resolveTypeName(t) {
  if (!t) return "—";
  if (t.name) return t.name;
  if (t.ofType) return resolveTypeName(t.ofType);
  return "—";
}

// ── CO 연관 테이블 쿼리 (proc_id 기준 조인) ──────────────────────────────────
export function buildCOBaseQuery(dateFrom, dateTo) {
  const fromStr = dateFrom ?? "2026-06-01";
  const toStr   = dateTo   ?? new Date().toISOString().slice(0, 10);
  return `
    query GetCOList($first: Int, $after: String) {
      co_bases(
        first: $first
        after: $after
        filter: {
          reg_date: { gte: "${fromStr}", lte: "${toStr}" }
          assignee_dept: { eq: "건설서비스팀" }
        }
        orderBy: { reg_date: DESC }
      ) {
        items {
          proc_id
          offering_id
          offering_name
          phase_name
          status_name
          requester_name
          requester_company
          requester_department
          reg_date
          close_date
          resolve_date
          assignee
          assignee_name
          assignee_company
          assignee_department
          title
          content
          co_division_kor
          co_type_kor
          wf_status
          wf_phase
          register_name
        }
        endCursor
        hasNextPage
      }
    }
  `;
}

export const CO_PLAN_QUERY = (procId) => `
  query { co_plans(filter:{ proc_id:{ eq:"${procId}" } }) { items {
    proc_id co_plan_date rel_plan_date
    plan_est_dates plan_est_datee
    plan_desc plan_downtime_flag
    plan_downtime_dates plan_downtime_datee
    plan_tester plan_test_dates plan_test_datee
    plan_cust_test_flag plan_test_goal plan_test_scenario
    plan_impact plan_sys_impact_desc
    plan_rollback_user plan_rollback_desc
    plan_cab_flag plan_approve_opinion
  }}}
`;

export const CO_DEVOPS_QUERY = (procId) => `
  query { co_devops_list: co_devops(filter:{ proc_id:{ eq:"${procId}" } }) { items {
    proc_id git_repo git_branch_yn release_version
    jira_prj_key jira_prj_name jira_issue_key
    jira_prj_key_review jira_prj_name_review jira_issue_key_review
  }}}
`;

export const CO_IMPL_QUERY = (procId) => `
  query { co_impls(filter:{ proc_id:{ eq:"${procId}" } }) { items {
    proc_id imp_design_desc imp_develop_desc
    imp_conf_method imp_conf_desc imp_conf_harvest
    imp_cf_cnt imp_cm_cnt imp_cm_anl_cnt imp_cp_cnt
  }}}
`;

export const CO_TEST_QUERY = (procId) => `
  query { co_tests(filter:{ proc_id:{ eq:"${procId}" } }) { items {
    proc_id test_real_dates test_real_datee
    test_tester test_result_desc test_cust_test_flag
  }}}
`;

export const CO_QUALITY_QUERY = (procId) => `
  query { co_qualities(filter:{ proc_id:{ eq:"${procId}" } }) { items {
    proc_id qa_co_grade qa_co_type qa_co_class qa_co_class_sub
    qa_re_time qa_rel_success_flag qa_offering_id
    qa_impact qa_urgent_type qa_opinion
  }}}
`;
