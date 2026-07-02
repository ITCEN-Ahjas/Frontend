import { useEffect, useRef, useState, useCallback } from 'react';
import { FiMessageCircle, FiSend, FiX, FiMaximize2, FiHelpCircle } from 'react-icons/fi';
import { sendChatMessage, fetchSuggestedQuestions } from '../../../api/chatApi';

const SAMPLES = [
  '단양 당일치기 여행지 추천해줘',
  '제천 가볼 만한 곳 알려줘',
  '청주에서 아이랑 가기 좋은 곳은?',
];

const FAB_HEIGHT = 52;
const FAB_HALF_HEIGHT = FAB_HEIGHT / 2;
const PANEL_BOTTOM_GAP = 80;
const PANEL_CHROME_HEIGHT = 140;
const VIEWPORT_MARGIN = 12;
const MOBILE_BREAKPOINT = 900;
const MOBILE_HEADER_HEIGHT = 64;

function clamp(value, min, max) {
  if (min > max) {
    return (min + max) / 2;
  }

  return Math.min(Math.max(value, min), max);
}

function rem(value) {
  return `${value / 10}rem`;
}

function getMaxPanelSize() {
  return {
    width: Math.max(300, Math.min(600, window.innerWidth - VIEWPORT_MARGIN * 2)),
    height: Math.max(
      180,
      Math.min(
        600,
        window.innerHeight - PANEL_BOTTOM_GAP - PANEL_CHROME_HEIGHT - FAB_HEIGHT - VIEWPORT_MARGIN * 2,
      ),
    ),
  };
}

function clampPanelSize(size) {
  const maxSize = getMaxPanelSize();
  const minWidth = Math.min(300, maxSize.width);
  const minHeight = Math.min(280, maxSize.height);

  return {
    width: clamp(size.width, minWidth, maxSize.width),
    height: clamp(size.height, minHeight, maxSize.height),
  };
}

function isSameBox(first, second) {
  return first.width === second.width && first.height === second.height;
}

function isSamePosition(first, second) {
  return first.x === second.x && first.y === second.y;
}

function clampPosition(nextPos, size, isOpen) {
  const minFabY = window.innerWidth <= MOBILE_BREAKPOINT
    ? MOBILE_HEADER_HEIGHT + FAB_HALF_HEIGHT + VIEWPORT_MARGIN
    : FAB_HALF_HEIGHT + VIEWPORT_MARGIN;

  if (!isOpen) {
    return {
      x: clamp(nextPos.x, 80, window.innerWidth - 80),
      y: clamp(nextPos.y, minFabY, window.innerHeight - FAB_HALF_HEIGHT - VIEWPORT_MARGIN),
    };
  }

  const panelSize = clampPanelSize(size);
  const visiblePanelWidth = Math.min(panelSize.width, window.innerWidth * 0.9);
  const panelFullHeight = panelSize.height + PANEL_CHROME_HEIGHT;

  return {
    x: clamp(nextPos.x, visiblePanelWidth - 80 + VIEWPORT_MARGIN, window.innerWidth - VIEWPORT_MARGIN),
    y: clamp(
      nextPos.y,
      panelFullHeight + PANEL_BOTTOM_GAP + FAB_HALF_HEIGHT + VIEWPORT_MARGIN,
      window.innerHeight - FAB_HALF_HEIGHT - VIEWPORT_MARGIN,
    ),
  };
}

function getTouchPoint(event) {
  const touch = event.touches?.[0] || event.changedTouches?.[0];

  return touch ? { clientX: touch.clientX, clientY: touch.clientY } : null;
}

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

  const onTouchStart = useCallback(e => {
    const point = getTouchPoint(e);

    if (!point) {
      return;
    }

    dragging.current = true;
    hasDragged.current = false;
    offset.current = { x: point.clientX - pos.x, y: point.clientY - pos.y };
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
        setPos(clampPosition(
          { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y },
          panelSize,
          open,
        ));
      }
      if (resizing.current) {
        const dx = resizeStart.current.x - e.clientX;
        const dy = resizeStart.current.y - e.clientY;
        const nextSize = clampPanelSize({
          width: resizeStart.current.w + dx,
          height: resizeStart.current.h + dy,
        });

        setPanelSize(nextSize);
        setPos(previous => clampPosition(previous, nextSize, open));
      }
    };
    const onMouseUp = () => {
      dragging.current = false;
      resizing.current = false;
    };
    const onTouchMove = e => {
      if (!dragging.current) {
        return;
      }

      const point = getTouchPoint(e);

      if (!point) {
        return;
      }

      hasDragged.current = true;
      setPos(clampPosition(
        { x: point.clientX - offset.current.x, y: point.clientY - offset.current.y },
        panelSize,
        open,
      ));
      e.preventDefault();
    };
    const onTouchEnd = () => {
      dragging.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('resize', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', onMouseUp);
    };
  }, [open, panelSize]);

  useEffect(() => {
    const onResize = () => {
      const nextSize = clampPanelSize(panelSize);

      setPanelSize(previous => (isSameBox(previous, nextSize) ? previous : nextSize));
      setPos(previous => {
        const nextPos = clampPosition(previous, nextSize, open);

        return isSamePosition(previous, nextPos) ? previous : nextPos;
      });
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [open, panelSize]);

  const handleToggle = () => {
    if (hasDragged.current) {
      return;
    }

    const nextOpen = !open;

    if (nextOpen) {
      const nextSize = clampPanelSize(panelSize);

      setPanelSize(previous => (isSameBox(previous, nextSize) ? previous : nextSize));
      setPos(previous => {
        const nextPos = clampPosition(previous, nextSize, true);

        return isSamePosition(previous, nextPos) ? previous : nextPos;
      });
    }

    setOpen(nextOpen);
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
          40% { transform: translateY(-0.5rem); opacity: 1; }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(1.6rem) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(0.6rem); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cb-sample:hover  { background: var(--color-slate-100) !important; transform: translateX(0.2rem); }
        .cb-suggest:hover { background: var(--color-brand-primary-bg) !important; transform: translateX(0.2rem); }
        .cb-send:hover:not(:disabled) { background: var(--color-brand-primary-dark) !important; transform: scale(1.06); }
        .cb-close:hover { background: var(--color-chat-inverse-bg-hover) !important; }
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--color-shadow-purple-strong), 0 0.8rem 2.8rem var(--color-shadow-purple-strong); }
          55% { box-shadow: 0 0 0 1rem transparent, 0 0.8rem 2.8rem var(--color-shadow-purple-strong); }
        }
        .cb-fab { animation: fabPulse 2.6s ease-in-out infinite; }
        .cb-fab:hover { filter: brightness(1.08) !important; transform: scale(1.04) !important; animation: none !important; }
        .cb-fab svg {
          width: 2.2rem;
          height: 2.2rem;
          color: var(--color-white);
          stroke-width: 2.2;
        }
        .cb-close svg {
          width: 1.8rem;
          height: 1.8rem;
          color: var(--color-chat-inverse-muted);
          stroke-width: 2.4;
        }
        .cb-send svg {
          width: 1.9rem;
          height: 1.9rem;
          color: var(--color-white);
          stroke-width: 2.4;
        }
        .cb-bot-icon svg {
          width: 2.2rem;
          height: 2.2rem;
          color: var(--color-white);
          stroke-width: 2.2;
        }
        .cb-message-icon svg {
          width: 1.7rem;
          height: 1.7rem;
          color: var(--color-white);
          stroke-width: 2.2;
        }
        .cb-resize-icon svg {
          width: 1.2rem;
          height: 1.2rem;
          color: var(--color-slate-300);
          stroke-width: 2;
        }
        .cb-msg { animation: msgIn 0.2s ease; }
        .cb-scroll::-webkit-scrollbar { width: 0.4rem; }
        .cb-scroll::-webkit-scrollbar-track { background: transparent; }
        .cb-scroll::-webkit-scrollbar-thumb { background: var(--color-slate-200); border-radius: 0.4rem; }
        @media (max-width: 56.25rem) {
          body.mobile-menu-open .cb-floating-root {
            opacity: 0;
            pointer-events: none;
          }

          .cb-fab {
            width: 5.2rem !important;
            padding: 0 !important;
            justify-content: center !important;
          }

          .cb-fab-label,
          .cb-fab-close-label {
            display: none !important;
          }

          .cb-fab-icon {
            width: 3.2rem !important;
            height: 3.2rem !important;
          }
        }
      `}</style>

      <div className="cb-floating-root" style={{ position: 'fixed', left: rem(pos.x), top: rem(pos.y), zIndex: 9999, transform: 'translate(-50%,-50%)' }}>

        {/* ── 패널 ── */}
        {open && (
          <div style={{
            position: 'absolute',
            bottom: '8rem',
            right: 0,
            width: `min(${rem(panelSize.width)}, 90vw)`,
            borderRadius: '2.4rem',
            background: 'var(--color-white)',
            boxShadow: '0 3.2rem 8rem var(--color-shadow-black-medium), 0 0.2rem 0.8rem var(--color-shadow-black-faint)',
            border: '0.1rem solid var(--color-border-muted)',
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
                width: '2rem',
                height: '2rem',
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
              padding: '1.6rem 1.8rem',
              background: 'var(--color-slate-900)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.2rem',
            }}>
              <div className="cb-bot-icon" style={{
                width: '4rem', height: '4rem', borderRadius: '1.2rem', flexShrink: 0,
                background: 'linear-gradient(135deg,var(--color-gradient-purple-start),var(--color-gradient-purple-end))',
                display: 'grid', placeItems: 'center',
                boxShadow: '0 0.4rem 1.4rem var(--color-shadow-purple-strong)',
              }}>
                <FiMessageCircle aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-white)', letterSpacing: '-0.02rem' }}>
                  충북 여행 AI
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                  <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: 'var(--color-chungbuk-purple)', boxShadow: '0 0 0.5rem var(--color-chungbuk-purple)' }} />
                  <span style={{ fontSize: '1.1rem', color: 'var(--color-chat-inverse-faint)' }}>지금 바로 답변 가능</span>
                </div>
              </div>
              <button
                className="cb-close"
                type="button"
                aria-label="챗봇 닫기"
                onClick={() => setOpen(false)}
                style={{
                background: 'var(--color-chat-inverse-bg)',
                border: '0.1rem solid var(--color-chat-inverse-border)',
                borderRadius: '1rem', width: '3.2rem', height: '3.2rem',
                display: 'grid', placeItems: 'center',
                cursor: 'pointer', color: 'var(--color-chat-inverse-weak)',
                fontSize: '1.3rem', flexShrink: 0,
                transition: 'background 0.15s',
              }}>
                <FiX aria-hidden="true" />
              </button>
            </div>

            {/* 메시지 */}
            <div className="cb-scroll" style={{
              height: rem(panelSize.height),
              overflowY: 'auto',
              background: 'var(--color-slate-50)',
              padding: '1.8rem 1.4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.4rem',
            }}>
              {messages.map((msg, i) => (
                <div key={i} className="cb-msg" style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: '0.8rem',
                }}>
                  {msg.role === 'ai' && (
                    <div className="cb-message-icon" style={{
                      width: '3rem', height: '3rem', borderRadius: '1rem', flexShrink: 0,
                      background: 'linear-gradient(135deg,var(--color-gradient-purple-start),var(--color-gradient-purple-end))',
                      display: 'grid', placeItems: 'center',
                      boxShadow: '0 0.2rem 0.8rem var(--color-shadow-purple-soft)',
                    }}>
                      <FiMessageCircle aria-hidden="true" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '72%',
                    padding: '1.1rem 1.4rem',
                    borderRadius: msg.role === 'user' ? '1.8rem 0.4rem 1.8rem 1.8rem' : '0.4rem 1.8rem 1.8rem 1.8rem',
                    background: msg.role === 'user' ? 'var(--color-slate-900)' : 'var(--color-white)',
                    color: msg.role === 'user' ? 'var(--color-slate-50)' : 'var(--color-slate-800)',
                    fontSize: '1.35rem',
                    lineHeight: 1.7,
                    fontWeight: 400,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxShadow: msg.role === 'ai'
                      ? '0 0.2rem 1rem var(--color-shadow-black-soft)'
                      : '0 0.2rem 1rem var(--color-shadow-slate-strong)',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* 로딩 */}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.8rem' }}>
                  <div className="cb-message-icon" style={{
                    width: '3rem', height: '3rem', borderRadius: '1rem', flexShrink: 0,
                    background: 'linear-gradient(135deg,var(--color-gradient-purple-start),var(--color-gradient-purple-end))',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <FiMessageCircle aria-hidden="true" />
                  </div>
                  <div style={{
                    background: 'var(--color-white)', borderRadius: '0.4rem 1.8rem 1.8rem 1.8rem',
                    padding: '1.4rem 1.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center',
                    boxShadow: '0 0.2rem 1rem var(--color-shadow-black-soft)',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '0.7rem', height: '0.7rem', borderRadius: '50%', background: 'var(--color-chungbuk-purple)',
                        animation: `dotBounce 1.1s ease-in-out ${i * 0.16}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* 샘플 질문 */}
              {messages.length <= 1 && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-slate-400)', paddingLeft: '0.2rem', letterSpacing: '0.02rem' }}>
                    이런 질문은 어떠세요?
                  </span>
                  {SAMPLES.map(q => (
                    <button key={q} className="cb-sample" onClick={() => handleSend(q)} style={{
                      background: 'var(--color-white)',
                      border: '0.15rem solid var(--color-slate-200)',
                      borderRadius: '1.3rem',
                      padding: '1.1rem 1.5rem',
                      fontSize: '1.3rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--color-slate-700)',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 0.1rem 0.4rem var(--color-shadow-black-subtle)',
                    }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* 추천 질문 */}
              {suggested.length > 0 && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-chungbuk-purple)', paddingLeft: '0.2rem', letterSpacing: '0.02rem' }}>
                    <FiHelpCircle aria-hidden="true" />
                    이런 것도 궁금하지 않으세요?
                  </span>
                  {suggested.map(q => (
                    <button key={q} className="cb-suggest" onClick={() => handleSend(q)} style={{
                      background: 'var(--color-brand-primary-bg-soft)',
                      border: '0.15rem solid var(--color-brand-primary-border)',
                      borderRadius: '1.3rem',
                      padding: '1.1rem 1.5rem',
                      fontSize: '1.3rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--color-chungbuk-purple)',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 0.1rem 0.4rem var(--color-shadow-purple-soft)',
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
              padding: '1.2rem 1.4rem',
              background: 'var(--color-white)',
              borderTop: '0.1rem solid var(--color-slate-100)',
              display: 'flex',
              gap: '0.8rem',
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
                  border: '0.15rem solid transparent',
                  borderRadius: '1.4rem',
                  padding: '1.1rem 1.6rem',
                  fontSize: '1.35rem',
                  color: 'var(--color-slate-800)',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.5,
                  transition: 'border 0.2s, background 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--color-chungbuk-purple)';
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
                  width: '4.4rem', height: '4.4rem', borderRadius: '1.4rem', flexShrink: 0,
                  background: loading || !input.trim() ? 'var(--color-slate-200)' : 'var(--color-chungbuk-purple)',
                  border: 'none',
                  display: 'grid', placeItems: 'center',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: !loading && input.trim() ? '0 0.4rem 1.4rem var(--color-shadow-purple)' : 'none',
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
          onTouchStart={onTouchStart}
          onClick={handleToggle}
          style={{
            height: '5.2rem',
            borderRadius: 999,
            padding: open ? '0 2rem' : '0 1.8rem',
            background: open
              ? 'var(--color-chat-fab-open-bg)'
              : 'linear-gradient(135deg, var(--color-gradient-purple-start) 0%, var(--color-gradient-purple-end) 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
            transition: 'background 0.2s ease, filter 0.2s ease, transform 0.2s ease',
            backdropFilter: open ? 'blur(0.8rem)' : 'none',
            border: open ? '0.15rem solid var(--color-chat-fab-open-border)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {open ? (
            <>
              <FiX aria-hidden="true" style={{ width: '1.8rem', height: '1.8rem', color: 'var(--color-chat-inverse-muted)', flexShrink: 0 }} />
              <span className="cb-fab-close-label" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-chat-fab-label)' }}>닫기</span>
            </>
          ) : (
            <>
              <div className="cb-fab-icon" style={{
                width: '3rem', height: '3rem', borderRadius: '1rem', flexShrink: 0,
                background: 'var(--color-chat-fab-icon-bg)',
                display: 'grid', placeItems: 'center',
              }}>
                <FiMessageCircle aria-hidden="true" />
              </div>
              <div className="cb-fab-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-white)', letterSpacing: '-0.02rem', lineHeight: 1 }}>
                  AI 여행 도우미
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--color-chat-inverse-muted)', lineHeight: 1 }}>
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
