import { useEffect, useRef, useState, useCallback } from 'react';
import { FiMessageCircle, FiSend, FiX, FiMaximize2, FiHelpCircle } from 'react-icons/fi';
import { sendChatMessage, fetchSuggestedQuestions } from '../../../api/chatApi';

const SAMPLES = [
  '단양 당일치기 여행지 추천해줘',
  '제천 가볼 만한 곳 알려줘',
  '청주에서 아이랑 가기 좋은 곳은?',
];

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: '안녕하세요! 충북 여행 AI입니다.\n궁금한 여행 정보를 편하게 물어보세요.' },
  ]);
  const [suggested, setSuggested] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [pos, setPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [panelSize, setPanelSize] = useState({ width: 380, height: 360 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const resizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 380, h: 360 });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open]);

  const onMouseDown = useCallback(e => {
    dragging.current = true;
    hasDragged.current = false;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  const onResizeMouseDown = useCallback(e => {
    e.stopPropagation();
    resizing.current = true;
    resizeStart.current = {
      x: e.clientX, y: e.clientY,
      w: panelSize.width, h: panelSize.height,
    };
    e.preventDefault();
  }, [panelSize]);

  useEffect(() => {
    const onMouseMove = e => {
      if (dragging.current) {
        hasDragged.current = true;
        setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
      }
      if (resizing.current) {
        const dx = resizeStart.current.x - e.clientX;
        const dy = resizeStart.current.y - e.clientY;
        setPanelSize({
          width: Math.max(300, Math.min(600, resizeStart.current.w + dx)),
          height: Math.max(280, Math.min(600, resizeStart.current.h + dy)),
        });
      }
    };
    const onMouseUp = () => {
      dragging.current = false;
      resizing.current = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleToggle = () => {
    if (!hasDragged.current) setOpen(p => !p);
  };

  const buildHistory = msgs =>
    msgs
      .filter((m, i) => !(m.role === 'ai' && i === 0))
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

  const handleSend = async question => {
    const text = (question ?? input).trim();
    if (!text || loading) return;
    setMessages(p => [...p, { role: 'user', text }]);
    setInput('');
    setSuggested([]);
    setLoading(true);
    try {
      const history = buildHistory(messages);
      const res = await sendChatMessage(text, history);
      const aiText = res.reply;
      setMessages(p => [...p, { role: 'ai', text: aiText }]);
      const questions = await fetchSuggestedQuestions(text, aiText);
      setSuggested(questions);
    } catch {
      setMessages(p => [
        ...p,
        { role: 'ai', text: '일시적인 오류가 발생했어요.\n잠시 후 다시 시도해 주세요.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cb-sample:hover  { background: var(--color-slate-100) !important; transform: translateX(2px); }
        .cb-suggest:hover { background: var(--color-success-hover) !important; transform: translateX(2px); }
        .cb-send:hover:not(:disabled) { background: var(--color-success-dark) !important; transform: scale(1.06); }
        .cb-close:hover { background: var(--color-chat-inverse-bg-hover) !important; }
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.45), 0 8px 28px rgba(16,185,129,0.35); }
          55% { box-shadow: 0 0 0 10px rgba(16,185,129,0), 0 8px 28px rgba(16,185,129,0.35); }
        }
        .cb-fab { animation: fabPulse 2.6s ease-in-out infinite; }
        .cb-fab:hover { filter: brightness(1.08) !important; transform: scale(1.04) !important; animation: none !important; }
        .cb-fab svg {
          width: 22px;
          height: 22px;
          color: var(--color-white);
          stroke-width: 2.2;
        }
        .cb-close svg {
          width: 18px;
          height: 18px;
          color: var(--color-chat-inverse-muted);
          stroke-width: 2.4;
        }
        .cb-send svg {
          width: 19px;
          height: 19px;
          color: var(--color-white);
          stroke-width: 2.4;
        }
        .cb-bot-icon svg {
          width: 22px;
          height: 22px;
          color: var(--color-white);
          stroke-width: 2.2;
        }
        .cb-message-icon svg {
          width: 17px;
          height: 17px;
          color: var(--color-white);
          stroke-width: 2.2;
        }
        .cb-resize-icon svg {
          width: 12px;
          height: 12px;
          color: var(--color-slate-300);
          stroke-width: 2;
        }
        .cb-msg { animation: msgIn 0.2s ease; }
        .cb-scroll::-webkit-scrollbar { width: 4px; }
        .cb-scroll::-webkit-scrollbar-track { background: transparent; }
        .cb-scroll::-webkit-scrollbar-thumb { background: var(--color-slate-200); border-radius: 4px; }
      `}</style>

      <div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999, transform: 'translate(-50%,-50%)' }}>

        {/* ── 패널 ── */}
        {open && (
          <div style={{
            position: 'absolute',
            bottom: 80,
            right: 0,
            width: `min(${panelSize.width}px, 90vw)`,
            borderRadius: 24,
            background: 'var(--color-white)',
            boxShadow: '0 32px 80px var(--color-shadow-black-medium), 0 2px 8px var(--color-shadow-black-faint)',
            border: '1px solid var(--color-border-muted)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'panelIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {/* 리사이즈 핸들 */}
            <div
              className="cb-resize-icon"
              onMouseDown={onResizeMouseDown}
              title="드래그해서 크기 조절"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 20,
                height: 20,
                cursor: 'nw-resize',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiMaximize2 aria-hidden="true" />
            </div>

            {/* 헤더 */}
            <div style={{
              padding: '16px 18px',
              background: 'var(--color-slate-900)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div className="cb-bot-icon" style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg,var(--color-success),var(--color-success-dark))',
                display: 'grid', placeItems: 'center',
                boxShadow: '0 4px 14px var(--color-shadow-success-strong)',
              }}>
                <FiMessageCircle aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-white)', letterSpacing: '-0.2px' }}>
                  충북 여행 AI
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 5px var(--color-success)' }} />
                  <span style={{ fontSize: 11, color: 'var(--color-chat-inverse-faint)' }}>지금 바로 답변 가능</span>
                </div>
              </div>
              <button
                className="cb-close"
                type="button"
                aria-label="챗봇 닫기"
                onClick={() => setOpen(false)}
                style={{
                background: 'var(--color-chat-inverse-bg)',
                border: '1px solid var(--color-chat-inverse-border)',
                borderRadius: 10, width: 32, height: 32,
                display: 'grid', placeItems: 'center',
                cursor: 'pointer', color: 'var(--color-chat-inverse-weak)',
                fontSize: 13, flexShrink: 0,
                transition: 'background 0.15s',
              }}>
                <FiX aria-hidden="true" />
              </button>
            </div>

            {/* 메시지 */}
            <div className="cb-scroll" style={{
              height: panelSize.height,
              overflowY: 'auto',
              background: 'var(--color-slate-50)',
              padding: '18px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              {messages.map((msg, i) => (
                <div key={i} className="cb-msg" style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 8,
                }}>
                  {msg.role === 'ai' && (
                    <div className="cb-message-icon" style={{
                      width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                      background: 'linear-gradient(135deg,var(--color-success),var(--color-success-dark))',
                      display: 'grid', placeItems: 'center',
                      boxShadow: '0 2px 8px var(--color-shadow-success-light)',
                    }}>
                      <FiMessageCircle aria-hidden="true" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '72%',
                    padding: '11px 14px',
                    borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    background: msg.role === 'user' ? 'var(--color-slate-900)' : 'var(--color-white)',
                    color: msg.role === 'user' ? 'var(--color-slate-50)' : 'var(--color-slate-800)',
                    fontSize: 13.5,
                    lineHeight: 1.7,
                    fontWeight: 400,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxShadow: msg.role === 'ai'
                      ? '0 2px 10px var(--color-shadow-black-soft)'
                      : '0 2px 10px var(--color-shadow-slate-strong)',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* 로딩 */}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div className="cb-message-icon" style={{
                    width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg,var(--color-success),var(--color-success-dark))',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <FiMessageCircle aria-hidden="true" />
                  </div>
                  <div style={{
                    background: 'var(--color-white)', borderRadius: '4px 18px 18px 18px',
                    padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center',
                    boxShadow: '0 2px 10px var(--color-shadow-black-soft)',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)',
                        animation: `dotBounce 1.1s ease-in-out ${i * 0.16}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* 샘플 질문 */}
              {messages.length <= 1 && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-slate-400)', paddingLeft: 2, letterSpacing: '0.2px' }}>
                    이런 질문은 어떠세요?
                  </span>
                  {SAMPLES.map(q => (
                    <button key={q} className="cb-sample" onClick={() => handleSend(q)} style={{
                      background: 'var(--color-white)',
                      border: '1.5px solid var(--color-slate-200)',
                      borderRadius: 13,
                      padding: '11px 15px',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--color-slate-700)',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 4px var(--color-shadow-black-subtle)',
                    }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* 추천 질문 */}
              {suggested.length > 0 && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-success)', paddingLeft: 2, letterSpacing: '0.2px' }}>
                    <FiHelpCircle aria-hidden="true" />
                    이런 것도 궁금하지 않으세요?
                  </span>
                  {suggested.map(q => (
                    <button key={q} className="cb-suggest" onClick={() => handleSend(q)} style={{
                      background: 'var(--color-success-soft)',
                      border: '1.5px solid var(--color-success-border)',
                      borderRadius: 13,
                      padding: '11px 15px',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--color-success-deep)',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 4px var(--color-shadow-success-soft)',
                    }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* 입력 영역 */}
            <div style={{
              padding: '12px 14px',
              background: 'var(--color-white)',
              borderTop: '1px solid var(--color-slate-100)',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={loading}
                placeholder="궁금한 점을 입력하세요..."
                style={{
                  flex: 1,
                  background: 'var(--color-slate-100)',
                  border: '1.5px solid transparent',
                  borderRadius: 14,
                  padding: '11px 16px',
                  fontSize: 13.5,
                  color: 'var(--color-slate-800)',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.5,
                  transition: 'border 0.2s, background 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--color-success)';
                  e.target.style.background = 'var(--color-white)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'transparent';
                  e.target.style.background = 'var(--color-slate-100)';
                }}
              />
              <button
                className="cb-send"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: loading || !input.trim() ? 'var(--color-slate-200)' : 'var(--color-success)',
                  border: 'none',
                  display: 'grid', placeItems: 'center',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: !loading && input.trim() ? '0 4px 14px var(--color-shadow-success)' : 'none',
                }}
              >
                <FiSend aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ── FAB 버튼 ── */}
        <div
          className="cb-fab"
          onMouseDown={onMouseDown}
          onClick={handleToggle}
          style={{
            height: 52,
            borderRadius: 999,
            padding: open ? '0 20px' : '0 18px',
            background: open
              ? 'rgba(15,23,42,0.9)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'grab',
            userSelect: 'none',
            transition: 'background 0.2s ease, filter 0.2s ease, transform 0.2s ease',
            backdropFilter: open ? 'blur(8px)' : 'none',
            border: open ? '1.5px solid rgba(255,255,255,0.12)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {open ? (
            <>
              <FiX aria-hidden="true" style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.75)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>닫기</span>
            </>
          ) : (
            <>
              <div style={{
                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,255,255,0.2)',
                display: 'grid', placeItems: 'center',
              }}>
                <FiMessageCircle aria-hidden="true" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px', lineHeight: 1 }}>
                  AI 여행 도우미
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', lineHeight: 1 }}>
                  충북 여행 질문하기
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
