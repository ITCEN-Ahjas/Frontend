export default function LodgingCard({ lodging, onDetailClick }) {
  return (
    <article
      style={{
        background: "white",
        borderRadius: 32,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* 이미지 */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <img
          src={lodging.imageUrl}
          alt={lodging.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <span
          style={{
            position: "absolute",
            left: 14,
            top: 14,
            background: "white",
            color: "#059669",
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 800,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {lodging.area}
        </span>
        <span
          style={{
            position: "absolute",
            right: 14,
            top: 14,
            background: "white",
            borderRadius: 12,
            padding: "6px 10px",
            fontSize: 13,
            fontWeight: 800,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          ⭐ {lodging.rating}
        </span>
      </div>

      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          {lodging.tags?.map((tag) => (
            <span
              key={tag}
              style={{
                background: "#f1f5f9",
                color: "#475569",
                borderRadius: 8,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            margin: "0 0 4px",
            color: "#0f172a",
          }}
        >
          {lodging.name}
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "#94a3b8",
            margin: "0 0 4px",
            fontWeight: 600,
          }}
        >
          {lodging.address}
        </p>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px" }}>
          리뷰 {lodging.reviewCount?.toLocaleString()}개
        </p>

        {/* AI 요약 안내 */}
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>✨</span>
          <p
            style={{
              fontSize: 12,
              color: "#059669",
              fontWeight: 700,
              margin: 0,
            }}
          >
            상세보기에서 AI 리뷰 요약을 확인하세요
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #f1f5f9",
            paddingTop: 14,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 600,
                margin: "0 0 2px",
              }}
            >
              1박 요금
            </p>
            <strong style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>
              {lodging.priceFrom?.toLocaleString()}원~
            </strong>
          </div>
          <button
            onClick={() => onDetailClick(lodging.id)}
            style={{
              background: "#0f172a",
              color: "white",
              border: "none",
              borderRadius: 999,
              padding: "10px 22px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#059669")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0f172a")}
          >
            상세보기
          </button>
        </div>
      </div>
    </article>
  );
}
