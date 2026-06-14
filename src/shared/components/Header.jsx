import { useNavigate, useLocation } from "react-router-dom";

const ko = {
  logo: ["충북", "자연과 함께하는 여행", "AI Tourism Guide"],
  nav: [
    ["guide", "사용설명서"],
    ["map", "지도"],
    ["festival", "체험·축제"],
    ["lodging", "숙박"],
    ["course", "AI 추천"],
  ],
  aiTabs: [
    ["course", "AI 맞춤 여행코스"],
    ["clothing", "날씨 의류 추천"],
  ],
};
const en = {
  logo: ["CB", "Chungbuk Travel", "AI Tourism Guide"],
  nav: [
    ["guide", "How to Use"],
    ["map", "Map"],
    ["festival", "Experiences"],
    ["lodging", "Hotels"],
    ["course", "AI Trip"],
  ],
  aiTabs: [
    ["course", "AI Custom Trip Route"],
    ["clothing", "Weather Outfit Guide"],
  ],
};

export default function Header({ lang = "ko" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = lang === "ko" ? ko : en;
  const currentId = location.pathname.replace("/", "") || "main";
  const isAiPage = currentId === "course" || currentId === "clothing";

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          height: 80,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1540,
            width: "100%",
            margin: "0 auto",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* 로고 */}
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 0,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "-0.08em",
                color: "#059669",
              }}
            >
              {t.logo[0]}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#64748b",
                lineHeight: 1.4,
                textAlign: "left",
              }}
            >
              {t.logo[1]}
              <br />
              <span
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t.logo[2]}
              </span>
            </span>
          </button>

          {/* 네비게이션 */}
          <nav style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {t.nav.map(([id, label]) => {
              const active = currentId === id || (id === "course" && isAiPage);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(`/${id}`)}
                  style={{
                    background: "none",
                    border: "none",
                    borderBottom: active
                      ? "2px solid #059669"
                      : "2px solid transparent",
                    paddingBottom: 4,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    color: active ? "#059669" : "#475569",
                    transition: "color 0.2s",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* AI 서브탭 */}
      {isAiPage && (
        <div
          style={{
            position: "fixed",
            top: 80,
            left: 0,
            right: 0,
            zIndex: 20,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #e2e8f0",
            height: 56,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              maxWidth: 1540,
              width: "100%",
              margin: "0 auto",
              padding: "0 32px",
              display: "flex",
              gap: 10,
            }}
          >
            {t.aiTabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate(`/${id}`)}
                style={{
                  background: currentId === id ? "#059669" : "#f1f5f9",
                  color: currentId === id ? "white" : "#64748b",
                  border: "none",
                  borderRadius: 999,
                  padding: "8px 20px",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
