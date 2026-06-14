import { useState, useEffect } from "react";
import { getLodgings } from "../../shared/api/lodgingApi";
import LodgingCard from "./LodgingCard";
import LodgingModal from "./LodgingModal";

const AREAS = ["전체", "청주", "제천", "단양", "충주"];

export default function LodgingPage() {
  const [area, setArea] = useState("전체");
  const [lodgings, setLodgings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    getLodgings({ area })
      .then(setLodgings)
      .finally(() => setLoading(false));
  }, [area]);

  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      <div
        style={{ minHeight: "100vh", background: "#f5f8fb", paddingTop: 80 }}
      >
        <div style={{ padding: "32px 48px" }}>
          {/* 페이지 헤더 */}
          <div
            style={{
              background: "white",
              borderRadius: 36,
              padding: "36px 40px",
              marginBottom: 28,
            }}
          >
            <span
              style={{
                background: "#e0f2fe",
                color: "#0369a1",
                borderRadius: 999,
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              🛏️ 숙박 정보
            </span>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: "-0.08em",
                margin: "16px 0 0",
                color: "#0f172a",
                lineHeight: 1.2,
              }}
            >
              충북 숙소를 리뷰와 함께 비교해요
            </h1>
            <p
              style={{
                fontSize: 16,
                color: "#64748b",
                lineHeight: 1.8,
                margin: "12px 0 24px",
              }}
            >
              Tripadvisor 실제 리뷰를 AI가 분석해 요약을 제공합니다. 상세보기를
              눌러 확인하세요.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {AREAS.map((a) => (
                <button
                  key={a}
                  onClick={() => setArea(a)}
                  style={{
                    background: area === a ? "#059669" : "#f1f5f9",
                    color: area === a ? "white" : "#64748b",
                    border: "none",
                    borderRadius: 999,
                    padding: "8px 20px",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* 카드 그리드 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 24,
            }}
          >
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    borderRadius: 32,
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      height: 220,
                      background: "#f1f5f9",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                  <div style={{ padding: 20 }}>
                    {[70, 50, 100].map((w, j) => (
                      <div
                        key={j}
                        style={{
                          width: `${w}%`,
                          height: 14,
                          background: "#f1f5f9",
                          borderRadius: 6,
                          marginBottom: 10,
                          animation: "pulse 1.5s infinite",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : lodgings.length === 0 ? (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "80px 0",
                  color: "#94a3b8",
                }}
              >
                해당 지역의 숙소 정보가 없습니다.
              </div>
            ) : (
              lodgings.map((l) => (
                <LodgingCard
                  key={l.id}
                  lodging={l}
                  onDetailClick={setSelectedId}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {selectedId !== null && (
        <LodgingModal
          lodgingId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
