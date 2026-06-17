import { useState, useCallback, useEffect } from "react";
import "./styles/global.css";
import DashboardPage from "./components/DashboardPage";
import { fetchAllPages, buildSRQuery, buildCOBaseQuery } from "./api/graphqlClient";

// 기본 날짜: 3개월 전 ~ 오늘
function defaultFrom() {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}
function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [srItems, setSrItems]         = useState([]);
  const [coItems, setCoItems]         = useState([]);
  const [lastFetched, setLastFetched] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [phase, setPhase]             = useState("loading");

  // 날짜 범위 상태
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo,   setDateTo]   = useState(defaultTo);

  const fetchData = useCallback(async (from, to) => {
    setLoading(true);
    setError("");
    try {
      const srQuery = buildSRQuery(from, to);
      const coQuery = buildCOBaseQuery(from, to);
      const [sr, co] = await Promise.all([
        fetchAllPages(srQuery, "srs"),
        fetchAllPages(coQuery, "co_bases"),
      ]);
      setSrItems(sr);
      setCoItems(co);
      setLastFetched(new Date());
      setPhase("dashboard");
    } catch (e) {
      setError(e.message);
      setPhase("error");
    } finally {
      setLoading(false);
    }
  }, []);

  // 최초 로드
  useEffect(() => { fetchData(dateFrom, dateTo); }, []);

  // 날짜 변경 후 재조회 핸들러
  const handleSearch = useCallback(() => {
    fetchData(dateFrom, dateTo);
  }, [dateFrom, dateTo, fetchData]);

  const LoadingScreen = ({ isError }) => (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="kolon-bg" />
      <div style={{ position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", padding: 24 }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "44px 56px", textAlign: "center",
          boxShadow: "0 24px 80px rgba(0,20,60,.14)",
          border: `1px solid ${isError ? "#FECACA" : "#D0DEE8"}`, minWidth: 340,
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 24,
            background: "#E8F4FC", borderRadius: 20, padding: "5px 16px",
            border: "1px solid #B0D4EF" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0078C3" }} />
            <span style={{ fontSize: 11, color: "#0060A0", fontWeight: 700,
              letterSpacing: ".1em", textTransform: "uppercase" }}>Kolon Benit</span>
          </div>
          {isError ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 14 }}>⚠️</div>
              <div style={{ fontSize: 15, color: "#DC2626", marginBottom: 20, lineHeight: 1.6 }}>{error}</div>
              <button onClick={() => fetchData(dateFrom, dateTo)} style={{
                padding: "12px 28px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #0078C3, #0060A0)",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>다시 시도</button>
              <div style={{ marginTop: 14, fontSize: 12, color: "#90ABBE" }}>
                백엔드 서버 확인: <code style={{ color: "#0078C3", background: "#E8F4FC",
                  padding: "1px 6px", borderRadius: 4 }}>node server.js</code>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: 42, height: 42, borderRadius: "50%", margin: "0 auto 20px",
                border: "3px solid #C2DEF4", borderTopColor: "#0078C3",
                animation: "spin .8s linear infinite",
              }} />
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0A1929", marginBottom: 8 }}>
                SR / CO 대시보드
              </div>
              <div style={{ fontSize: 14, color: "#90ABBE" }}>데이터 로딩 중…</div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (phase === "loading") return <LoadingScreen />;
  if (phase === "error")   return <LoadingScreen isError />;

  return (
    <DashboardPage
      srData={srItems}
      coData={coItems}
      loading={loading}
      error={error}
      onRefresh={handleSearch}
      lastFetched={lastFetched}
      dateFrom={dateFrom}
      dateTo={dateTo}
      setDateFrom={setDateFrom}
      setDateTo={setDateTo}
      onSearch={handleSearch}
    />
  );
}
