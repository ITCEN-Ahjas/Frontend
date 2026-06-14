import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/lodgingApi";

const SAMPLES = [
  "청주에서 당일치기 숙소 추천해줘",
  "제천 호수뷰 숙소 어때?",
  "단양 액티비티랑 숙소 같이 알려줘",
];

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "안녕하세요! 충북 여행에 대해 궁금한 점을 물어보세요.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async (question) => {
    const text = (question ?? input).trim();
    if (!text || loading) return;
    setMessages((p) => [...p, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChatMessage(text);
      setMessages((p) => [
        ...p,
        { role: "ai", text: res.answer, sources: res.sources ?? [] },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "ai",
          text: "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 200 }}>
      {open && (
        <div
          style={{
            marginBottom: 16,
            width: 400,
            borderRadius: 28,
            background: "white",
            boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              background: "#0f172a",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: "#059669",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                🤖
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>
                  충북 AI 챗봇
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    margin: 0,
                  }}
                >
                  여행 정보 도우미
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color: "white",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>

          {/* 메시지 영역 */}
          <div
            style={{
              height: 360,
              overflowY: "auto",
              background: "#f8fafc",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  maxWidth: "88%",
                  marginLeft: msg.role === "user" ? "auto" : 0,
                }}
              >
                <div
                  style={{
                    background: msg.role === "user" ? "#d1fae5" : "white",
                    borderRadius:
                      msg.role === "user"
                        ? "20px 20px 4px 20px"
                        : "20px 20px 20px 4px",
                    padding: "10px 14px",
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: msg.role === "user" ? "#064e3b" : "#334155",
                    boxShadow:
                      msg.role === "ai" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                    fontWeight: msg.role === "user" ? 700 : 400,
                  }}
                >
                  {msg.text}
                </div>
                {msg.sources?.map((src) => (
                  <div
                    key={src}
                    style={{
                      display: "inline-block",
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      marginTop: 4,
                      marginRight: 4,
                    }}
                  >
                    출처: {src}
                  </div>
                ))}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#94a3b8",
                  maxWidth: "88%",
                }}
              >
                충북 여행 정보를 찾고 있어요...
              </div>
            )}
            {messages.length <= 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {SAMPLES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 14,
                      padding: "8px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#475569",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "10px 14px",
              borderTop: "1px solid #f1f5f9",
              background: "white",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
              placeholder="충북 여행에 대해 질문하기"
              style={{
                flex: 1,
                background: "#f1f5f9",
                border: "none",
                borderRadius: 999,
                padding: "8px 16px",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: loading || !input.trim() ? "#e2e8f0" : "#059669",
                color: "white",
                border: "none",
                display: "grid",
                placeItems: "center",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: 16,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#0f172a",
          color: "white",
          border: "none",
          borderRadius: 999,
          padding: "14px 24px",
          fontSize: 15,
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          outline: "4px solid white",
        }}
      >
        💬 AI 챗봇
      </button>
    </div>
  );
}
