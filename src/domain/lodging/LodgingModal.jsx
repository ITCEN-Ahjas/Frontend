import { useState, useEffect } from "react";
import { getLodgingById } from "../../shared/api/lodgingApi";

function Skeleton() {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 20, padding: 20 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      {[100, 85, 70].map((w, i) => (
        <div
          key={i}
          style={{
            width: `${w}%`,
            height: 14,
            borderRadius: 6,
            background: "#e2e8f0",
            marginBottom: 8,
            animation: "pulse 1.5s infinite",
          }}
        />
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {[80, 70, 90].map((w, i) => (
          <div
            key={i}
            style={{
              width: w,
              height: 26,
              borderRadius: 999,
              background: "#e2e8f0",
              animation: "pulse 1.5s infinite",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function LodgingModal({ lodgingId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLodgingById(lodgingId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [lodgingId]);

  return (
    <>
      <style>{`@keyframes modalIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      <div
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 150,
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 860,
            maxHeight: "88vh",
            borderRadius: 36,
            background: "white",
            boxShadow: "0 32px 64px rgba(0,0,0,0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            animation: "modalIn 0.25s ease",
          }}
        >
          {/* 히어로 */}
          <div
            style={{
              position: "relative",
              height: 220,
              background: "#0f172a",
              flexShrink: 0,
            }}
          >
            {detail && (
              <img
                src={detail.imageUrl}
                alt={detail.name}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.45,
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, #0f172a, rgba(15,23,42,0.6), transparent)",
              }}
            />
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                right: 20,
                top: 20,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
              }}
            >
              ✕
            </button>
            {detail && (
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 28,
                  color: "white",
                }}
              >
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  {detail.tags?.map((t) => (
                    <span
                      key={t}
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: 999,
                        padding: "3px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    letterSpacing: "-0.07em",
                    margin: "0 0 4px",
                  }}
                >
                  {detail.name}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                    margin: 0,
                  }}
                >
                  {detail.address}
                </p>
              </div>
            )}
          </div>

          {/* 바디 */}
          <div
            style={{
              overflowY: "auto",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {loading ? (
              <Skeleton />
            ) : detail ? (
              <>
                {/* AI 요약 */}
                <div
                  style={{
                    background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
                    borderRadius: 20,
                    padding: 20,
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "#059669",
                        display: "grid",
                        placeItems: "center",
                        color: "white",
                        fontSize: 14,
                      }}
                    >
                      ✨
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#059669",
                        margin: 0,
                      }}
                    >
                      AI 리뷰 요약
                    </p>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 11,
                        color: "#94a3b8",
                      }}
                    >
                      리뷰 {detail.reviewCount?.toLocaleString()}개 기반 · 출처:
                      Tripadvisor
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#1e293b",
                      lineHeight: 1.8,
                      margin: "0 0 14px",
                    }}
                  >
                    {detail.aiSummary}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: detail.cautionTags?.length ? 10 : 0,
                    }}
                  >
                    {detail.positiveTags?.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "#d1fae5",
                          color: "#065f46",
                          borderRadius: 999,
                          padding: "4px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        👍 {tag}
                      </span>
                    ))}
                  </div>
                  {detail.cautionTags?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {detail.cautionTags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: "#fef9c3",
                            color: "#854d0e",
                            borderRadius: 999,
                            padding: "4px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          ⚠️ {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 기본 정보 */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                  }}
                >
                  {[
                    ["평점", `⭐ ${detail.rating}`],
                    ["리뷰 수", `${detail.reviewCount?.toLocaleString()}개`],
                    ["1박 요금", `${detail.priceFrom?.toLocaleString()}원~`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        background: "#f8fafc",
                        borderRadius: 16,
                        padding: "14px 16px",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          fontWeight: 700,
                          margin: "0 0 4px",
                        }}
                      >
                        {label}
                      </p>
                      <strong style={{ fontSize: 15 }}>{value}</strong>
                    </div>
                  ))}
                </div>

                {/* 리뷰 목록 */}
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      margin: "0 0 14px",
                    }}
                  >
                    실제 리뷰{" "}
                    <span
                      style={{
                        color: "#94a3b8",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Tripadvisor 제공
                    </span>
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {detail.reviews?.map((review, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#f8fafc",
                          borderRadius: 16,
                          padding: "14px 16px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#475569",
                            }}
                          >
                            {review.author}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: "#f59e0b",
                              fontWeight: 700,
                            }}
                          >
                            {"⭐".repeat(review.rating)}{" "}
                            <span style={{ color: "#94a3b8" }}>
                              {review.writtenAt}
                            </span>
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 13,
                            color: "#475569",
                            lineHeight: 1.7,
                            margin: 0,
                          }}
                        >
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    style={{
                      flex: 1,
                      background: "#0f172a",
                      color: "white",
                      border: "none",
                      borderRadius: 16,
                      padding: 16,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Tripadvisor에서 예약하기
                  </button>
                  <button
                    style={{
                      flex: 1,
                      background: "white",
                      color: "#334155",
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: 16,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    AI 여행 코스에 추가하기
                  </button>
                </div>
              </>
            ) : (
              <p style={{ textAlign: "center", color: "#94a3b8" }}>
                숙소 정보를 불러올 수 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
