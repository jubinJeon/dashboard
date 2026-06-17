import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const STATUS_COLOR = {
  // SR 공통
  "해결":            "#10B981",
  "처리중":           "#0284C7",   // 코오롱 블루 계열
  "접수":            "#F59E0B",
  "반려":            "#EF4444",
  "취소":            "#EF4444",
  // CO 전용
  "종료":            "#64748B",
  "완료":            "#10B981",
  "승인":            "#1D4ED8",
  "구성변경대기":     "#0078C3",   // 코오롱 블루 (Primary)
  "작업계획승인완료":  "#005A9E",   // 코오롱 딥 블루
  "배포테스트중":     "#06B6D4",
  "테스트중":         "#06B6D4",
  "진행중":           "#0284C7",
  "대기":            "#F59E0B",
  "등록":            "#F59E0B",
  "검토":            "#8B5CF6",
};
const STATUS_ORDER = [
  "접수","등록","대기","구성변경대기",
  "처리중","진행중","배포테스트중","테스트중",
  "작업계획승인완료","승인",
  "완료","해결","종료","반려","취소","검토",
];
const FB = ["#6366F1","#EC4899","#14B8A6","#F97316","#84CC16"];
let _fbMap = {}, _fbIdx = 0;
function getColor(s) {
  if (STATUS_COLOR[s]) return STATUS_COLOR[s];
  if (!_fbMap[s]) _fbMap[s] = FB[_fbIdx++ % FB.length];
  return _fbMap[s];
}

function fmtDay(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getMonth()+1}/${d.getDate()}`;
}
function fmtWeek(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((d.getDay()+6)%7));
  return `${mon.getMonth()+1}/${mon.getDate()}주`;
}
function weekKey(iso) {
  const d = new Date(iso);
  const m = new Date(d);
  m.setDate(d.getDate() - ((d.getDay()+6)%7));
  return m.toISOString().slice(0,10);
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s,p) => s+(p.value||0), 0);
  return (
    <div style={{
      background:"#fff", border:"1px solid #D0DEE8", borderRadius:10,
      padding:"10px 14px", boxShadow:"0 4px 20px rgba(0,80,160,.12)",
      fontSize:12, minWidth:130,
    }}>
      <div style={{ fontWeight:700, color:"#0A1929", marginBottom:6,
        paddingBottom:5, borderBottom:"1px solid #EBF4FB" }}>{label}</div>
      {[...payload].reverse().map(p => (
        <div key={p.name} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:p.fill??p.color, flexShrink:0 }} />
          <span style={{ color:"#5C7A90", flex:1 }}>{p.name}</span>
          <span style={{ fontWeight:700, color:"#0A1929" }}>{p.value}</span>
        </div>
      ))}
      {payload.length > 1 && (
        <div style={{ borderTop:"1px solid #EBF4FB", marginTop:5, paddingTop:5,
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#90ABBE" }}>합계</span>
          <span style={{ fontWeight:800, color:"#0078C3" }}>{total}건</span>
        </div>
      )}
    </div>
  );
};

function Card({ title, sub, action, children, style = {} }) {
  return (
    <div style={{
      background:"#fff", borderRadius:16, padding:"16px 18px",
      border:"1px solid #D0DEE8", boxShadow:"0 2px 8px rgba(0,80,160,.05)",
      display:"flex", flexDirection:"column",
      ...style,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:10, gap:8, flexShrink:0 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:"#0A1929", lineHeight:1.3 }}>{title}</div>
          {sub && <div style={{ fontSize:10, color:"#90ABBE", marginTop:2 }}>{sub}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Seg({ label, value, current, onChange }) {
  const on = current === value;
  return (
    <button onClick={() => onChange(value)} style={{
      padding:"3px 9px", borderRadius:6, fontSize:10, fontWeight:700, cursor:"pointer",
      border:"1px solid", transition:"all .12s",
      borderColor: on ? "#0078C3" : "#D0DEE8",
      background: on ? "#0078C3" : "#fff",
      color: on ? "#fff" : "#90ABBE",
    }}>{label}</button>
  );
}

function Legend({ statuses }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 10px", marginTop:8 }}>
      {statuses.map(s => (
        <span key={s} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
          <span style={{ width:9, height:9, borderRadius:2, background:getColor(s), flexShrink:0 }} />
          <span style={{ color:"#5C7A90", fontWeight:600 }}>{s}</span>
        </span>
      ))}
    </div>
  );
}

export default function SRCharts({ data = [] }) {
  const [unit, setUnit]   = useState("day");
  const [type, setType]   = useState("bar");

  const statuses = useMemo(() => {
    const s = new Set(data.map(d => d.status_name).filter(Boolean));
    return [...STATUS_ORDER.filter(x => s.has(x)), ...[...s].filter(x => !STATUS_ORDER.includes(x))];
  }, [data]);

  const dateData = useMemo(() => {
    const map = {};
    data.forEach(d => {
      const raw = d.reg_date ?? d.accept_date;
      if (!raw) return;
      const key   = unit === "week" ? weekKey(raw) : raw.slice(0,10);
      const label = unit === "week" ? fmtWeek(raw) : fmtDay(raw);
      if (!map[key]) map[key] = { date:key, label };
      const s = d.status_name ?? "접수";
      map[key][s] = (map[key][s] ?? 0) + 1;
    });
    return Object.values(map).sort((a,b) => a.date.localeCompare(b.date));
  }, [data, unit]);

  const assigneeData = useMemo(() => {
    const map = {};
    data.forEach(d => {
      const n = d.assignee_name ?? "미배정";
      if (!map[n]) map[n] = { name:n, _t:0 };
      const s = d.status_name ?? "접수";
      map[n][s] = (map[n][s] ?? 0) + 1;
      map[n]._t++;
    });
    return Object.values(map).sort((a,b) => b._t - a._t).slice(0,10);
  }, [data]);

  const pieData = useMemo(() => {
    const map = {};
    data.forEach(d => { const s = d.status_name ?? "기타"; map[s] = (map[s]??0)+1; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));
  }, [data]);

  if (!data.length) return null;

  const RADIAN = Math.PI / 180;
  const pieLabel = ({ cx,cy,midAngle,innerRadius,outerRadius,percent }) => {
    if (percent < 0.07) return null;
    const r = innerRadius + (outerRadius-innerRadius)*0.58;
    return (
      <text x={cx+r*Math.cos(-midAngle*RADIAN)} y={cy+r*Math.sin(-midAngle*RADIAN)}
        fill="#fff" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize:11, fontWeight:700, pointerEvents:"none" }}>
        {`${(percent*100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={{ marginBottom:24 }}>
      {/* ── 1행: 날짜 추이(넓게) + 파이(좁게) ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:12, marginBottom:12, alignItems:"stretch" }}>

        {/* 날짜별 추이 */}
        <Card
          title="날짜별 SR 현황"
          sub={`reg_date 기준 · ${data.length}건`}
          style={{ height:"100%" }}
          action={
            <div style={{ display:"flex", gap:3 }}>
              <Seg label="일" value="day"  current={unit} onChange={setUnit} />
              <Seg label="주" value="week" current={unit} onChange={setUnit} />
              <span style={{ width:1, height:16, background:"#E4EDF4", alignSelf:"center", margin:"0 2px" }}/>
              <Seg label="바" value="bar"  current={type} onChange={setType} />
              <Seg label="선" value="line" current={type} onChange={setType} />
            </div>
          }
        >
          <div style={{ flex:1, minHeight:0 }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={dateData} barCategoryGap="30%" margin={{top:2,right:4,left:-26,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F6FA" vertical={false}/>
                <XAxis dataKey="label" tick={{fontSize:10,fill:"#90ABBE"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#90ABBE"}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<Tip/>}/>
                {statuses.map((s,i) => (
                  <Bar key={s} dataKey={s} stackId="a" fill={getColor(s)}
                    radius={i===statuses.length-1?[4,4,0,0]:[0,0,0,0]}/>
                ))}
              </BarChart>
            ) : (
              <LineChart data={dateData} margin={{top:2,right:4,left:-26,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F6FA" vertical={false}/>
                <XAxis dataKey="label" tick={{fontSize:10,fill:"#90ABBE"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#90ABBE"}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<Tip/>}/>
                {statuses.map(s => (
                  <Line key={s} type="monotone" dataKey={s} stroke={getColor(s)}
                    strokeWidth={2} dot={{r:3,fill:getColor(s),strokeWidth:0}} activeDot={{r:4}}/>
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
          </div>
          <div style={{ flexShrink:0, marginTop:8 }}>
            <Legend statuses={statuses}/>
          </div>
        </Card>

        {/* 상태 파이 */}
        <Card title="상태 비율" sub={`전체 ${data.length}건`}>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%"
                innerRadius={42} outerRadius={70}
                paddingAngle={2} dataKey="value"
                labelLine={false} label={pieLabel}>
                {pieData.map(e => <Cell key={e.name} fill={getColor(e.name)}/>)}
              </Pie>
              <Tooltip content={<Tip/>}/>
            </PieChart>
          </ResponsiveContainer>
          {/* 오른쪽 범례 */}
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:4 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:9, height:9, borderRadius:2,
                  background:getColor(d.name), flexShrink:0 }}/>
                <span style={{ fontSize:12, color:"#2C4A63", fontWeight:600, flex:1 }}>{d.name}</span>
                <span style={{ fontSize:12, fontWeight:800, color:"#0A1929" }}>{d.value}</span>
                <span style={{ fontSize:10, color:"#90ABBE", width:30, textAlign:"right" }}>
                  {Math.round(d.value/data.length*100)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 2행: 담당자별 (전체 너비) ── */}
      <Card title="담당자별 처리 현황" sub="담당자 배정 SR · 건수 많은 순">
        <ResponsiveContainer width="100%" height={Math.max(140, assigneeData.length * 30 + 16)}>
          <BarChart data={assigneeData} layout="vertical"
            barCategoryGap="22%" margin={{top:0,right:44,left:4,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F6FA" horizontal={false}/>
            <XAxis type="number" tick={{fontSize:10,fill:"#90ABBE"}} axisLine={false} tickLine={false} allowDecimals={false}/>
            <YAxis type="category" dataKey="name"
              tick={{fontSize:12,fill:"#2C4A63",fontWeight:600}}
              axisLine={false} tickLine={false} width={82}/>
            <Tooltip content={<Tip/>}/>
            {statuses.map((s,i) => (
              <Bar key={s} dataKey={s} stackId="a" fill={getColor(s)}
                radius={i===statuses.length-1?[0,4,4,0]:[0,0,0,0]}/>
            ))}
          </BarChart>
        </ResponsiveContainer>
        <Legend statuses={statuses}/>
      </Card>
    </div>
  );
}
