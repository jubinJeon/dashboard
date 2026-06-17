export const STATUS_META = {
  "해결":      { label: "해결",   color: "#059669", bg: "#ECFDF5" },
  "처리중":    { label: "처리중", color: "#D97706", bg: "#FFFBEB" },
  "접수":      { label: "접수",   color: "#5C7A90", bg: "#F0F6FA" },
  "반려":      { label: "반려",   color: "#DC2626", bg: "#FEF2F2" },
  pending:     { label: "대기",   color: "#5C7A90", bg: "#F0F6FA" },
  review:      { label: "검토",   color: "#D97706", bg: "#FFFBEB" },
  approved:    { label: "승인",   color: "#0078C3", bg: "#E8F4FC" },
  inprogress:  { label: "진행",   color: "#7C3AED", bg: "#F5F3FF" },
  in_progress: { label: "진행",   color: "#7C3AED", bg: "#F5F3FF" },
  completed:   { label: "완료",   color: "#059669", bg: "#ECFDF5" },
  done:        { label: "완료",   color: "#059669", bg: "#ECFDF5" },
  closed:      { label: "종료",   color: "#5C7A90", bg: "#F0F6FA" },
  rejected:    { label: "반려",   color: "#DC2626", bg: "#FEF2F2" },
  cancelled:   { label: "취소",   color: "#DC2626", bg: "#FEF2F2" },
};

export const STATUS_DISPLAY_ORDER = [
  "접수","처리중","해결","반려",
  "pending","review","approved","inprogress","in_progress","completed","done","closed","rejected","cancelled",
];

export function getStatusMeta(val) {
  if (!val) return { label: "—", color: "#90ABBE", bg: "#F0F6FA" };
  return STATUS_META[val] ?? STATUS_META[val?.toLowerCase()] ?? { label: val, color: "#5C7A90", bg: "#F0F6FA" };
}

export function detectStatusKey(item) {
  if (!item) return "status_name";
  if (item.status_name !== undefined) return "status_name";
  if (item.wf_status   !== undefined) return "wf_status";
  return Object.keys(item).find(k => k.toLowerCase().includes("status")) ?? "status_name";
}

export function detectPriorityKey(item) {
  if (!item) return null;
  if (item.emergency_type !== undefined) return "emergency_type";
  return Object.keys(item).find(k => k.toLowerCase().includes("emergency") || k.toLowerCase().includes("priority")) ?? null;
}

export function getItemTitle(item) {
  return item?.title ?? item?.name ?? item?.subject ?? "—";
}

export function getEmergencyMeta(val) {
  const m = { "긴급": { label: "긴급", color: "#DC2626" }, "일반": { label: "일반", color: "#5C7A90" } };
  return m[val] ?? m[val?.toLowerCase()] ?? { label: val ?? "—", color: "#5C7A90" };
}
