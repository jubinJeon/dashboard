/**
 * CO 상태 색상 — 코오롱 브랜드 컬러 기반
 *
 * Kolon Blue  #0078C3  (Primary)
 * Deep Blue   #005A9E
 * Light Blue  #E8F4FC
 *
 * 상태별 역할:
 *  종료           → 회색 계열 (종결)
 *  구성변경대기    → 코오롱 블루 (대기/준비)
 *  배포테스트중   → 청록 (진행 중)
 *  작업계획승인완료→ 네이비 그린 (승인)
 *  처리중          → 코오롱 라이트 블루
 *  해결/완료       → 에메랄드 그린
 *  접수/등록       → 앰버 (주목)
 *  반려            → 레드
 */

export const CO_STATUS = {
  // ── 완결 상태 ────────────────────────────────────────────
  "종료": {
    color: "#475569", bg: "#F1F5F9", border: "#CBD5E1", dot: "#64748B",
  },
  "해결": {
    color: "#047857", bg: "#ECFDF5", border: "#6EE7B7", dot: "#10B981",
  },
  "완료": {
    color: "#047857", bg: "#ECFDF5", border: "#6EE7B7", dot: "#10B981",
  },

  // ── 코오롱 블루 계열 (진행·대기·승인) ──────────────────
  "구성변경대기": {
    color: "#0078C3", bg: "#E8F4FC", border: "#93C5E8", dot: "#0078C3",
  },
  "작업계획승인완료": {
    color: "#005A9E", bg: "#DBEAFE", border: "#93C5FD", dot: "#1D4ED8",
  },
  "승인": {
    color: "#005A9E", bg: "#DBEAFE", border: "#93C5FD", dot: "#1D4ED8",
  },
  "처리중": {
    color: "#0369A1", bg: "#E0F2FE", border: "#7DD3FC", dot: "#0284C7",
  },
  "진행중": {
    color: "#0369A1", bg: "#E0F2FE", border: "#7DD3FC", dot: "#0284C7",
  },

  // ── 청록 (테스트·배포 중) ──────────────────────────────
  "배포테스트중": {
    color: "#0E7490", bg: "#ECFEFF", border: "#67E8F9", dot: "#06B6D4",
  },
  "테스트중": {
    color: "#0E7490", bg: "#ECFEFF", border: "#67E8F9", dot: "#06B6D4",
  },

  // ── 접수/등록 (앰버) ───────────────────────────────────
  "접수": {
    color: "#B45309", bg: "#FFFBEB", border: "#FCD34D", dot: "#F59E0B",
  },
  "등록": {
    color: "#B45309", bg: "#FFFBEB", border: "#FCD34D", dot: "#F59E0B",
  },
  "대기": {
    color: "#B45309", bg: "#FFFBEB", border: "#FCD34D", dot: "#F59E0B",
  },

  // ── 반려/취소 ─────────────────────────────────────────
  "반려": {
    color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444",
  },
  "취소": {
    color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444",
  },
};

const FALLBACK = { color: "#5C7A90", bg: "#F0F6FA", border: "#C8DCE9", dot: "#90ABBE" };

export function getCOStatusMeta(status) {
  if (!status) return FALLBACK;
  return CO_STATUS[status] ?? FALLBACK;
}

// 차트용 단색
export const CO_STATUS_COLOR = {
  "종료":           "#64748B",
  "해결":           "#10B981",
  "완료":           "#10B981",
  "구성변경대기":    "#0078C3",
  "작업계획승인완료":"#1D4ED8",
  "승인":           "#1D4ED8",
  "처리중":          "#0284C7",
  "진행중":          "#0284C7",
  "배포테스트중":    "#06B6D4",
  "테스트중":        "#06B6D4",
  "접수":           "#F59E0B",
  "등록":           "#F59E0B",
  "대기":           "#F59E0B",
  "반려":           "#EF4444",
  "취소":           "#EF4444",
};

export const CO_STATUS_ORDER = [
  "접수","등록","대기","구성변경대기",
  "처리중","진행중","배포테스트중","테스트중",
  "작업계획승인완료","승인",
  "완료","해결","종료","반려","취소",
];

export function getCOStatusColor(s) {
  return CO_STATUS_COLOR[s] ?? "#90ABBE";
}
