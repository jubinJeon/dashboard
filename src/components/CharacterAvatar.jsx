/**
 * CharacterAvatar — 담당자 ID별 실제 사진 (원형 크롭)
 * public/avatars/{id}.jpg 또는 public/avatars/{id}.png
 */

const ID_EXT = {
  "508534": "jpg",
  "10442420": "jpg",
  "1402128": "jpg",
  "10444212": "jpg",
  "77700199": "jpg",
  "15419650": "jpg",
  "59499062": "jpg",
  "73428075": "jpg",
  "59495868": "jpg",
  "77700773": "jpg",
  "509243":   "jpg",
  "511080":   "jpg",
  "1005190":  "png",
  "10238580": "jpg",
  "10630227": "png",
  "48828120": "jpg",
  "57179369": "jpg",
  "59049048": "jpg",
  "60276366": "jpg",
  "68484570": "png",
  "68487795": "png",
  "76478067": "jpg",
};

const ACCENT_COLORS = [
  "#0078C3","#7C3AED","#0891B2","#059669",
  "#D97706","#DC2626","#DB2777","#0369A1",
  "#7E22CE","#065F46","#92400E","#9F1239",
];
function accentOf(name) {
  return ACCENT_COLORS[(name?.charCodeAt(0) ?? 0) % ACCENT_COLORS.length];
}

export default function CharacterAvatar({ assigneeId, assigneeName, size = 44 }) {
  const id  = String(assigneeId ?? "").trim();
  const ext = ID_EXT[id];
  const ac  = accentOf(assigneeName);

  // 사진 없는 담당자 → 이니셜
  if (!ext) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg, ${ac}dd, ${ac}99)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.round(size * 0.38), fontWeight: 800, color: "#fff",
        boxShadow: `0 0 0 2.5px #fff, 0 0 0 4px ${ac}66`,
        userSelect: "none",
      }}>
        {assigneeName?.[0] ?? "?"}
      </div>
    );
  }

  const src = `/avatars/${id}.${ext}`;

  return (
    <img
      src={src}
      alt={assigneeName ?? id}
      width={size}
      height={size}
      style={{
        width: size, height: size,
        borderRadius: "50%",
        objectFit: "cover",
        objectPosition: "center top",   // 얼굴 위쪽 기준
        flexShrink: 0,
        display: "block",
        boxShadow: `0 0 0 2.5px #fff, 0 0 0 4px ${ac}66`,
      }}
      onError={e => {
        // 로드 실패 시 이니셜로 대체
        e.currentTarget.style.display = "none";
        const fb = document.createElement("div");
        fb.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${ac};display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.38)}px;font-weight:800;color:#fff;flex-shrink:0;`;
        fb.textContent = assigneeName?.[0] ?? "?";
        e.currentTarget.parentNode?.insertBefore(fb, e.currentTarget);
      }}
    />
  );
}
