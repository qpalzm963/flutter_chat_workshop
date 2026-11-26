import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 第 6 堂：Cursor 歷史分頁 + 進房載入最新一頁
// 學員看得到的頁面只放題目；參考答案和講稿都在 `notes`。
// 共用元件從第 5 堂複製，第 6 堂專用元件在後半段。
// ─────────────────────────────────────────────────────────────

export const design: DesignSystem = {
  palette: { bg: '#f5efe4', text: '#2d2a26', accent: '#e07a3f' },
  fonts: {
    display: '"SF Mono", "JetBrains Mono", Menlo, "PingFang TC", monospace',
    body: '"PingFang TC", "Noto Sans TC", -apple-system, system-ui, sans-serif',
  },
  typeScale: { hero: 120, body: 34 },
  radius: 14,
};

// 換頁轉場：RISE（照 open-slide transitions.md 的數值）
const EASE_OUT = 'cubic-bezier(0, 0, 0.2, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const HOLD: Keyframe[] = [{ opacity: 1 }, { opacity: 1 }];

export const transition: SlideTransition = {
  duration: 260,
  exit: { duration: 260, easing: EASE_IN, keyframes: HOLD },
  enter: {
    duration: 260,
    easing: EASE_OUT,
    keyframes: [
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};

const ink = '#2d2a26';
const muted = '#8a8173';
const panel = '#fbf8f2';
const line = '#d9cfbf';
const green = '#4f9d69';
const red = '#d0574f';
const blue = '#5b84c9';
const amber = '#d79a2b';
const grey = '#a79f92';
const mono = '"SF Mono", "JetBrains Mono", Menlo, "PingFang TC", monospace';

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  position: 'relative',
  boxSizing: 'border-box',
  overflow: 'hidden',
};

// ═════════════ 共用：外框 ═════════════

const Pill = ({ children, tint }: { children: ReactNode; tint: string }) => (
  <span
    style={{
      fontFamily: mono,
      fontSize: 22,
      fontWeight: 700,
      padding: '6px 18px',
      borderRadius: 999,
      background: tint,
      border: `2px solid ${ink}`,
    }}
  >
    {children}
  </span>
);

const PageNo = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <Pill tint={panel}>
      {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </Pill>
  );
};

const TopBar = ({ section }: { section: string }) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      right: 120,
      top: 40,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `2px solid ${line}`,
    }}
  >
    <div style={{ fontSize: 26, fontWeight: 800, display: 'flex', gap: 16, alignItems: 'center' }}>
      <span style={{ fontFamily: mono }}>☰</span>
      <span>即時聊天室 · 第 6 堂</span>
      <span style={{ color: muted, fontWeight: 500 }}>/ {section}</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#dde9fb">Lesson 06</Pill>
      <PageNo />
    </div>
  </div>
);

const Shell = ({
  section,
  title,
  sub,
  children,
}: {
  section: string;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
}) => (
  <div style={fill}>
    <TopBar section={section} />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 136 }}>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 64, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
        {title}
      </h2>
      {sub && <p style={{ fontSize: 30, color: muted, margin: '12px 0 0' }}>{sub}</p>}
      <div style={{ marginTop: 44 }}>{children}</div>
    </div>
  </div>
);

const Card = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      background: panel,
      border: `2px solid ${line}`,
      borderRadius: 'var(--osd-radius)',
      padding: '28px 36px',
      ...style,
    }}
  >
    {children}
  </div>
);

const Code = ({ children, size = 28 }: { children: ReactNode; size?: number }) => (
  <pre
    style={{
      fontFamily: mono,
      fontSize: size,
      lineHeight: 1.55,
      background: '#2d2a26',
      color: '#f5efe4',
      borderRadius: 'var(--osd-radius)',
      padding: '26px 34px',
      margin: 0,
      whiteSpace: 'pre',
    }}
  >
    {children}
  </pre>
);

const Kw = ({ children }: { children: ReactNode }) => (
  <code
    style={{
      fontFamily: mono,
      fontSize: '0.88em',
      background: '#efe6d6',
      border: `1.5px solid ${line}`,
      borderRadius: 8,
      padding: '1px 10px',
    }}
  >
    {children}
  </code>
);

const Metric = ({ label, value, bar }: { label: string; value: string; bar: string }) => (
  <div
    style={{
      background: panel,
      border: `2px solid ${line}`,
      borderLeft: `6px solid ${bar}`,
      borderRadius: 12,
      padding: '12px 22px',
      minWidth: 220,
    }}
  >
    <div style={{ fontSize: 20, color: muted }}>{label}</div>
    <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 800, marginTop: 4 }}>{value}</div>
  </div>
);

// ═════════════ 共用：頁面元件 ═════════════

const Avatar = ({ who }: { who: string }) => (
  <div
    style={{
      width: 100,
      height: 100,
      borderRadius: 999,
      background: '#fbe7b5',
      border: `3px solid ${ink}`,
      fontFamily: mono,
      fontSize: 34,
      fontWeight: 900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {who}
  </div>
);

const Bubble = ({ who, role, children }: { who: string; role: string; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
    <Avatar who={who} />
    <div>
      <div style={{ fontSize: 24, color: muted, marginBottom: 10 }}>{role}</div>
      <div
        style={{
          background: panel,
          border: `2.5px solid ${ink}`,
          borderRadius: '0 28px 28px 28px',
          padding: '24px 38px',
          fontSize: 40,
          lineHeight: 1.5,
          maxWidth: 1400,
          boxShadow: `6px 6px 0 ${line}`,
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const Goal = ({ n, children }: { n: string; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', fontSize: 34, lineHeight: 1.5 }}>
    <span style={{ fontFamily: mono, color: 'var(--osd-accent)', fontWeight: 800 }}>{n}</span>
    <span>{children}</span>
  </div>
);

type CellState = 'no' | 'yes' | 'partial';

const Cell = ({ state, children, focus }: { state: CellState; children?: ReactNode; focus?: boolean }) => {
  const color = state === 'yes' ? green : state === 'no' ? red : grey;
  return (
    <div
      style={{
        fontSize: 23,
        lineHeight: 1.4,
        padding: '14px 16px',
        borderTop: `2px solid ${line}`,
        background: focus ? '#fdf0e3' : 'transparent',
        borderLeft: focus ? '3px solid var(--osd-accent)' : `2px solid ${line}`,
        borderRight: focus ? '3px solid var(--osd-accent)' : 'none',
        color: focus ? ink : muted,
      }}
    >
      <span style={{ color, fontWeight: 800, marginRight: 6, fontFamily: mono }}>
        {state === 'yes' ? '✓' : state === 'no' ? '✗' : '◐'}
      </span>
      {children}
    </div>
  );
};

const RowHead = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 25, fontWeight: 800, padding: '14px 16px', borderTop: `2px solid ${line}` }}>{children}</div>
);

const ColHead = ({ children, focus }: { children: ReactNode; focus?: boolean }) => (
  <div
    style={{
      fontSize: 23,
      fontWeight: 800,
      padding: '12px 16px',
      color: focus ? ink : muted,
      background: focus ? '#fbd9b8' : 'transparent',
    }}
  >
    {children}
  </div>
);

const BigQuestion = ({ tag, tagColor, children, foot }: { tag: string; tagColor: string; children: ReactNode; foot: ReactNode }) => (
  <div style={fill}>
    <TopBar section="提問" />
    <div style={{ position: 'absolute', left: 160, right: 160, top: 260 }}>
      <Pill tint={tagColor}>{tag}</Pill>
      <h2
        style={{
          fontFamily: 'var(--osd-font-body)',
          fontSize: 92,
          fontWeight: 900,
          lineHeight: 1.3,
          margin: '40px 0 0',
        }}
      >
        {children}
      </h2>
      <Steps>
        <Step>
          <p style={{ fontSize: 34, color: muted, marginTop: 44 }}>{foot}</p>
        </Step>
      </Steps>
    </div>
  </div>
);

const Todo = ({ n, title, children, done }: { n: string; title: ReactNode; children?: ReactNode; done?: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 24, alignItems: 'start', opacity: done ? 0.45 : 1 }}>
    <div
      style={{
        width: 68,
        height: 68,
        borderRadius: 999,
        border: `3px solid ${ink}`,
        background: done ? '#e9e2d5' : '#fbd9b8',
        fontFamily: mono,
        fontSize: 32,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {n}
    </div>
    <div>
      <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.4, paddingTop: 8 }}>{title}</div>
      {children && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  </div>
);

const Hint = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 28, color: muted, lineHeight: 1.6 }}>{children}</div>
);

const Check = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 34, lineHeight: 1.5 }}>
    <span
      style={{
        width: 36,
        height: 36,
        border: `3px solid ${ink}`,
        background: '#e6f2e8',
        borderRadius: 8,
        flexShrink: 0,
      }}
    />
    <span>{children}</span>
  </div>
);

const Point = ({ title, children, tag }: { title: ReactNode; children: ReactNode; tag?: string }) => (
  <div
    style={{
      background: panel,
      border: `2px solid ${line}`,
      borderLeft: `8px solid var(--osd-accent)`,
      borderRadius: 12,
      padding: '22px 32px',
    }}
  >
    <div style={{ fontSize: 32, fontWeight: 800, display: 'flex', gap: 16, alignItems: 'center' }}>
      {tag && <Pill tint="#d6ecd9">{tag}</Pill>}
      <span>{title}</span>
    </div>
    <div style={{ fontSize: 27, color: muted, marginTop: 10, lineHeight: 1.5 }}>{children}</div>
  </div>
);

const FlowBox = ({ title, sub, tint }: { title: string; sub: string; tint: string }) => (
  <div
    style={{
      flex: 1,
      background: tint,
      border: `2.5px solid ${ink}`,
      borderRadius: 14,
      padding: '22px 22px',
      boxShadow: `5px 5px 0 ${line}`,
    }}
  >
    <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.3 }}>{title}</div>
    <div style={{ fontSize: 22, color: muted, marginTop: 8, lineHeight: 1.4 }}>{sub}</div>
  </div>
);

const FlowArrow = () => (
  <div style={{ fontSize: 40, fontWeight: 900, color: muted, alignSelf: 'center', padding: '0 10px' }}>→</div>
);

// ═════════════ 第 4 堂起的共用元件 ═════════════

const WhyBox = ({ q }: { q: ReactNode }) => (
  <div
    style={{
      fontSize: 26,
      fontWeight: 800,
      padding: '12px 22px',
      borderRadius: 12,
      background: '#fdf0e3',
      border: `2px dashed var(--osd-accent)`,
      color: ink,
    }}
  >
    {q}
  </div>
);


type St = 'sending' | 'sent' | 'failed';
type PMsg = { t: string; mine?: boolean; st?: St; seq?: number; hot?: boolean; who?: string };

const Spinner = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="7" fill="none" stroke={line} strokeWidth="3" />
    <path d="M 10 3 A 7 7 0 0 1 17 10" fill="none" stroke={amber} strokeWidth="3" strokeLinecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 10 10" to="360 10 10" dur="1s" repeatCount="indefinite" />
    </path>
  </svg>
);

const StatusIcon = ({ st, size = 18 }: { st: St; size?: number }) => {
  if (st === 'sending') return <Spinner size={size} />;
  if (st === 'sent') return <span style={{ color: green, fontWeight: 900, fontSize: size }}>✓</span>;
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: red,
        color: '#fff',
        fontSize: size * 0.72,
        fontWeight: 900,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      !
    </span>
  );
};

// 手機示意（底部對齊，跟第 3 堂的反轉列表一樣）；自己的訊息帶狀態圖示和 seq
const ChatPhone = ({
  msgs,
  title = '聊天室（Amy）',
  w = 340,
  h = 600,
  empty,
}: {
  msgs: PMsg[];
  title?: string;
  w?: number;
  h?: number;
  empty?: ReactNode;
}) => (
  <div
    style={{
      width: w,
      height: h,
      border: `3px solid ${ink}`,
      borderRadius: 40,
      background: '#fff',
      padding: 10,
      boxSizing: 'border-box',
      boxShadow: `8px 8px 0 ${line}`,
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 30,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#faf6ee',
      }}
    >
      <div
        style={{
          height: 46,
          borderBottom: `2px solid ${line}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 800,
          background: panel,
          flexShrink: 0,
        }}
      >
        {title}
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {empty && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: muted,
              textAlign: 'center',
              lineHeight: 1.5,
              padding: 20,
            }}
          >
            {empty}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.mine ? 'flex-end' : 'flex-start' }}>
              {!m.mine && m.who && <span style={{ fontSize: 13, color: muted, marginBottom: 2 }}>{m.who}</span>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {m.mine && m.st && <StatusIcon st={m.st} />}
                <span
                  style={{
                    fontSize: 18,
                    lineHeight: 1.3,
                    padding: '7px 13px',
                    borderRadius: 14,
                    border: `2px solid ${m.hot ? red : ink}`,
                    background: m.hot ? '#f7d9d6' : m.mine ? '#d6ecd9' : panel,
                    opacity: m.st === 'sending' ? 0.75 : 1,
                    maxWidth: 220,
                  }}
                >
                  {m.t}
                </span>
              </div>
              <span style={{ fontFamily: mono, fontSize: 12, color: muted, marginTop: 2 }}>
                {m.seq != null ? `#${m.seq} · ` : ''}10:02
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          height: 50,
          borderTop: `2px solid ${line}`,
          background: panel,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, height: 30, borderRadius: 999, border: `2px solid ${line}`, background: '#fff' }} />
        <div style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--osd-accent)' }} />
      </div>
    </div>
  </div>
);

const PhoneCap = ({ n, title, children, tone = ink, w = 340 }: { n: string; title: string; children?: ReactNode; tone?: string; w?: number }) => (
  <div style={{ marginTop: 22, width: w }}>
    <div style={{ fontSize: 26, fontWeight: 900, color: tone }}>
      <span style={{ fontFamily: mono, color: 'var(--osd-accent)', marginRight: 10 }}>{n}</span>
      {title}
    </div>
    {children && <div style={{ fontSize: 21, color: muted, marginTop: 6, lineHeight: 1.45 }}>{children}</div>}
  </div>
);

// 箭頭頭：尖端在 (x, y)，朝 angle（弧度）方向
const head = (x: number, y: number, angle: number, color: string, s = 14) => {
  const a1 = angle + Math.PI * 0.85;
  const a2 = angle - Math.PI * 0.85;
  const p = [
    [x, y],
    [x + s * Math.cos(a1), y + s * Math.sin(a1)],
    [x + s * Math.cos(a2), y + s * Math.sin(a2)],
  ]
    .map((q) => q.join(','))
    .join(' ');
  return <polygon points={p} fill={color} />;
};

type SeqItem =
  | { kind: 'msg'; from: number; to: number; label: string; color?: string; lost?: boolean }
  | { kind: 'note'; at: number; label: string; tint?: string }
  | { kind: 'gap'; label: string };

const halo: CSSProperties = { paintOrder: 'stroke', stroke: '#f5efe4', strokeWidth: 8, strokeLinejoin: 'round' };

// 循序圖：每個 item 一列
const SeqDiagram = ({ lanes, items, w = 1680, rowH = 58, pad = 150 }: { lanes: string[]; items: SeqItem[]; w?: number; rowH?: number; pad?: number }) => {
  const top = 92;
  const h = top + items.length * rowH + 20;
  const xs = lanes.map((_, i) => pad + (i * (w - pad * 2)) / (lanes.length - 1));
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {lanes.map((l, i) => (
        <g key={l}>
          <line x1={xs[i]} y1={70} x2={xs[i]} y2={h - 6} stroke={line} strokeWidth="3" strokeDasharray="8 8" />
          <rect x={xs[i] - 110} y={8} width={220} height={60} rx={12} fill={panel} stroke={ink} strokeWidth="2.5" />
          <text x={xs[i]} y={47} textAnchor="middle" fontSize="26" fontWeight="800" fill={ink}>
            {l}
          </text>
        </g>
      ))}
      {items.map((it, i) => {
        const y = top + i * rowH + rowH / 2 + 6;
        if (it.kind === 'gap') {
          return (
            <text key={i} x={w / 2} y={y + 6} textAnchor="middle" fontSize="22" fill={muted} fontStyle="italic" style={halo}>
              {it.label}
            </text>
          );
        }
        if (it.kind === 'note') {
          const bw = Math.max(180, it.label.length * 22 + 36);
          return (
            <g key={i}>
              <rect x={xs[it.at] - bw / 2} y={y - 21} width={bw} height={42} rx={10} fill={it.tint ?? '#fbe7b5'} stroke={ink} strokeWidth="2" />
              <text x={xs[it.at]} y={y + 7} textAnchor="middle" fontSize="21" fontWeight="700" fill={ink}>
                {it.label}
              </text>
            </g>
          );
        }
        const c = it.color ?? ink;
        const x1 = xs[it.from];
        const full = xs[it.to];
        const dir = full > x1 ? 1 : -1;
        const x2 = it.lost ? (x1 + full) / 2 : full - dir * 4;
        return (
          <g key={i}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={c} strokeWidth="3" strokeDasharray={it.lost ? '8 6' : undefined} />
            {it.lost ? (
              <text x={x2} y={y + 10} textAnchor="middle" fontSize="32" fontWeight="900" fill={red}>
                ✕
              </text>
            ) : (
              head(x2, y, dir > 0 ? 0 : Math.PI, c)
            )}
            <text
              x={(x1 + (it.lost ? x2 : full)) / 2}
              y={y - 12}
              textAnchor="middle"
              fontSize="21"
              fontWeight="700"
              fill={c}
              style={halo}
            >
              {it.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};


// ═════════════ 第 5 堂起的共用元件 ═════════════

// 資料庫圓柱
const Cylinder = ({ x, y, w = 300, h = 220, label, sub }: { x: number; y: number; w?: number; h?: number; label: string; sub?: string }) => {
  const ry = 30;
  return (
    <g>
      <path
        d={`M ${x} ${y + ry} L ${x} ${y + h - ry} A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + h - ry} L ${x + w} ${y + ry}`}
        fill="#fbe7b5"
        stroke={ink}
        strokeWidth="3"
      />
      <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} fill="#fdf0d0" stroke={ink} strokeWidth="3" />
      <text x={x + w / 2} y={y + h / 2 + 22} textAnchor="middle" fontSize="36" fontWeight="900" fill={ink}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 64} textAnchor="middle" fontSize="22" fill={muted}>
          {sub}
        </text>
      )}
    </g>
  );
};

const SvgBox = ({ x, y, w, h, title, sub, tint }: { x: number; y: number; w: number; h: number; title: string; sub: string; tint: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={18} fill={tint} stroke={ink} strokeWidth="3" />
    <text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle" fontSize="34" fontWeight="900" fill={ink}>
      {title}
    </text>
    <text x={x + w / 2} y={y + h / 2 + 36} textAnchor="middle" fontSize="22" fill={muted}>
      {sub}
    </text>
  </g>
);

const Arrow = ({ x1, y1, x2, y2, label, color = ink, dashed, ly = -16 }: { x1: number; y1: number; x2: number; y2: number; label: string; color?: string; dashed?: boolean; ly?: number }) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="4" strokeDasharray={dashed ? '12 8' : undefined} />
    {head(x2, y2, Math.atan2(y2 - y1, x2 - x1), color, 18)}
    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + ly} textAnchor="middle" fontSize="25" fontWeight="800" fill={color} style={halo}>
      {label}
    </text>
  </g>
);


// ═════════════ 第 6 堂專用元件 ═════════════

type RowMark = 'dup' | 'new' | 'dim' | 'gap';
type SRow = { seq: string; t: string; mark?: RowMark; n?: string };

const markStyle = (m?: RowMark): CSSProperties => {
  if (m === 'dup') return { background: '#f7d9d6', borderColor: red, fontWeight: 800 };
  if (m === 'new') return { background: '#d6ecd9', borderColor: green, fontWeight: 800 };
  if (m === 'dim') return { opacity: 0.4 };
  if (m === 'gap') return { background: '#fdf0e3', borderColor: amber, borderStyle: 'dashed' };
  return {};
};

const SeqList = ({ title, sub, rows, tone = ink }: { title: ReactNode; sub?: ReactNode; rows: SRow[]; tone?: string }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontSize: 28, fontWeight: 900, color: tone }}>{title}</div>
    {sub && <div style={{ fontSize: 22, color: muted, marginTop: 4, minHeight: 32 }}>{sub}</div>}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 24,
            padding: '9px 18px',
            borderRadius: 10,
            border: `2px solid ${line}`,
            background: panel,
            ...markStyle(r.mark),
          }}
        >
          {r.n && <span style={{ fontFamily: mono, fontSize: 18, color: muted, width: 36 }}>{r.n}</span>}
          <span style={{ fontFamily: mono, fontWeight: 800, width: 80 }}>{r.seq}</span>
          <span>{r.t}</span>
        </div>
      ))}
    </div>
  </div>
);

const ColArrow = ({ label }: { label?: string }) => (
  <div style={{ alignSelf: 'center', textAlign: 'center', color: muted, width: 90 }}>
    <div style={{ fontSize: 48, fontWeight: 900 }}>→</div>
    {label && <div style={{ fontSize: 20, marginTop: 4 }}>{label}</div>}
  </div>
);

const page1: SRow[] = [
  { seq: '#300', t: '那就這樣' },
  { seq: '#299', t: '好' },
  { seq: '#298', t: '7 點？' },
  { seq: '#297', t: '週五吃拉麵' },
  { seq: '#296', t: '在嗎' },
];

// 本地 DB 長條：count 則，視窗 limit 則，fetched 是剛從 Server 拿的那一段（畫在最上面）
const DbBar = ({ count, limit, fetched = 0, title, sub }: { count: number; limit: number; fetched?: number; title: string; sub: ReactNode }) => {
  const k = 2.2;
  const win = Math.min(limit, count);
  return (
    <div style={{ width: 380 }}>
      <div style={{ height: 470, position: 'relative', borderBottom: `3px solid ${ink}` }}>
        <div
          style={{
            position: 'absolute',
            left: 100,
            width: 160,
            bottom: 0,
            height: count * k,
            background: '#efe6d6',
            border: `2.5px solid ${ink}`,
            borderBottom: 'none',
            borderRadius: '10px 10px 0 0',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {fetched > 0 && <div style={{ height: fetched * k, background: '#dde9fb', borderBottom: `2px dashed ${blue}` }} />}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 88,
            width: 184,
            bottom: 0,
            height: win * k,
            border: '4px solid var(--osd-accent)',
            borderRadius: 12,
            boxSizing: 'border-box',
            background: 'rgba(224,122,63,0.12)',
          }}
        />
        <div style={{ position: 'absolute', left: 280, bottom: win * k - 30, fontSize: 21, fontWeight: 800, color: 'var(--osd-accent)', whiteSpace: 'nowrap' }}>
          視窗 {limit}
        </div>
        <div style={{ position: 'absolute', left: 0, bottom: count * k - 28, width: 92, textAlign: 'right', fontSize: 21, color: muted, whiteSpace: 'nowrap' }}>
          本地 {count}
        </div>
        {fetched > 0 && (
          <div style={{ position: 'absolute', left: 0, width: 92, textAlign: 'right', bottom: count * k - (fetched * k) / 2 - 14, fontSize: 21, fontWeight: 800, color: blue, whiteSpace: 'nowrap' }}>
            +{fetched} 從 API
          </div>
        )}
      </div>
      <div style={{ fontSize: 27, fontWeight: 900, marginTop: 16 }}>{title}</div>
      <div style={{ fontSize: 22, color: muted, marginTop: 6, lineHeight: 1.45 }}>{sub}</div>
    </div>
  );
};

// 一條 seq 軸上的區段：本地有的、斷層
const RangeBar = ({ parts }: { parts: { from: number; to: number; kind: 'have' | 'hole' }[] }) => {
  const total = 300;
  const W = 1500;
  const x = (s: number) => ((s - 1) / total) * W;
  return (
    <svg width={1680} height={150} viewBox="0 0 1680 150" style={{ display: 'block' }}>
      <g transform="translate(90 20)">
        {parts.map((p, i) => (
          <g key={i}>
            <rect
              x={x(p.from)}
              y={20}
              width={x(p.to + 1) - x(p.from)}
              height={60}
              rx={8}
              fill={p.kind === 'have' ? '#d6ecd9' : '#fdf0e3'}
              stroke={p.kind === 'have' ? green : amber}
              strokeWidth="3"
              strokeDasharray={p.kind === 'hole' ? '10 6' : undefined}
            />
            <text x={(x(p.from) + x(p.to + 1)) / 2} y={58} textAnchor="middle" fontSize="24" fontWeight="800" fill={ink}>
              {p.kind === 'have' ? `本地有 #${p.from}～#${p.to}` : `斷層 #${p.from}～#${p.to}`}
            </text>
          </g>
        ))}
        {[1, 100, 200, 300].map((s) => (
          <text key={s} x={x(s)} y={112} textAnchor="middle" fontSize="20" fill={muted} fontFamily={mono}>
            #{s}
          </text>
        ))}
      </g>
    </svg>
  );
};

// 逐步出現的欄：箭頭和內容包在同一格
const ColStep = ({ label, children }: { label?: string; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', height: '100%' }}>
    <ColArrow label={label} />
    {children}
  </div>
);

// ═════════════ 頁面 ═════════════

const Cover: Page = () => (
  <div style={fill}>
    <TopBar section="封面" />
    <div style={{ position: 'absolute', left: 120, top: 220, width: 1100 }}>
      <div style={{ display: 'flex', gap: 14 }}>
        <Pill tint="#fbe7b5">⏱ 60 min</Pill>
        <Pill tint="#d6ecd9">階段二 · DB + REST</Pill>
        <Pill tint={panel}>每房先灌 300 則</Pill>
      </div>
      <h1
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 'var(--osd-size-hero)',
          fontWeight: 900,
          margin: '32px 0 12px',
          lineHeight: 1.1,
        }}
      >
        歷史分頁
      </h1>
      <p style={{ fontSize: 36, color: muted, margin: 0 }}>換新手機也看得到以前的對話，往上滑一頁一頁載</p>
      <div style={{ display: 'flex', gap: 14, marginTop: 56 }}>
        <Pill tint={panel}>Cursor Pagination</Pill>
        <Pill tint={panel}>before_seq</Pill>
        <Pill tint={panel}>兩段式分頁</Pill>
      </div>
    </div>
    <div style={{ position: 'absolute', right: 180, top: 170, display: 'flex', gap: 36 }}>
      <DbBar count={170} limit={150} fetched={50} title="往上滑，本地不夠了" sub="才去跟 Server 要下一頁" />
    </div>
  </div>
);

const Scenario: Page = () => (
  <Shell section="開場" title="PM 來了，還帶著追加需求">
    <Bubble who="PM" role="PM">
      「使用者<b style={{ color: 'var(--osd-accent)' }}>換新手機</b>，以前的對話<b style={{ color: 'var(--osd-accent)' }}>全部看不到</b>。」
    </Bubble>
    <Steps>
      <Step>
    <Card style={{ marginTop: 56 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>今天下課前要做到</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Goal n="01">重裝 App 進房，看到最新的 50 則</Goal>
        <Goal n="02">往上滑，舊訊息一頁一頁接上，不重複、畫面不跳</Goal>
        <Goal n="03">滑到最舊的那則，就不再打 API</Goal>
        <Goal n="04">
          <span style={{ color: muted }}>（PM 說等一下還有一個需求……）</span>
        </Goal>
      </div>
    </Card>
      </Step>
    </Steps>
  </Shell>
);

const Evolution: Page = () => (
  <Shell section="能力演進表" title="今天打掉兩個 ✗" sub="加上歷史 API：第一次進房、新加入的人，都看得到以前的對話。">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '270px repeat(5, 1fr)',
        border: `2.5px solid ${ink}`,
        borderRadius: 'var(--osd-radius)',
        overflow: 'hidden',
        background: panel,
      }}
    >
      <ColHead>情境</ColHead>
      <ColHead>第 1～4 堂 純 WS</ColHead>
      <ColHead>第 5 堂 +本地 DB</ColHead>
      <ColHead focus>第 6 堂 +歷史 API</ColHead>
      <ColHead>第 7 堂 +補洞</ColHead>
      <ColHead>第 8～9 堂</ColHead>

      <RowHead>剛進聊天室</RowHead>
      <Cell state="no">空的，只看得到連上之後的</Cell>
      <Cell state="partial">看得到自己收過的</Cell>
      <Cell state="yes" focus>
        <b>先載最新一頁，往上滑再載</b>　← 今天
      </Cell>
      <Cell state="yes" />
      <Cell state="yes">未讀多就跳到第一則未讀</Cell>

      <RowHead>殺掉 App 重開</RowHead>
      <Cell state="no">全部不見</Cell>
      <Cell state="yes">秒開，不白屏</Cell>
      <Cell state="yes" focus />
      <Cell state="yes" />
      <Cell state="yes" />

      <RowHead>斷線時別人說的話</RowHead>
      <Cell state="no">收不到</Cell>
      <Cell state="no">收不到</Cell>
      <Cell state="no" focus>收不到；本地留下斷層</Cell>
      <Cell state="yes">重連後自動補齊</Cell>
      <Cell state="yes" />

      <RowHead>新加入的人看舊對話</RowHead>
      <Cell state="no">看不到</Cell>
      <Cell state="no">看不到</Cell>
      <Cell state="yes" focus>
        <b>看得到</b>　← 今天
      </Cell>
      <Cell state="yes" />
      <Cell state="yes" />

      <RowHead>有好幾個聊天室</RowHead>
      <Cell state="no">只能等講師分房</Cell>
      <Cell state="no" />
      <Cell state="no" focus />
      <Cell state="no" />
      <Cell state="yes">房間列表 + 未讀數</Cell>
    </div>
  </Shell>
);

const Recap: Page = () => (
  <BigQuestion tag="上堂的問題" tagColor="#f7d9d6" foot="提示：本地 DB 裡的訊息，是從哪裡來的？只有一個來源嗎？">
    刪掉重裝又是空的。
    <br />
    Server 明明有存，為什麼拿不到？
  </BigQuestion>
);

const WsVsRest: Page = () => (
  <Shell section="觀念" title="電話講現在，客服查紀錄" sub="WebSocket 只推「接通之後」發生的事。以前的對話要另外問。">
    <div style={{ display: 'flex', gap: 40 }}>
      <Card style={{ flex: 1, borderTop: `10px solid ${blue}` }}>
        <div style={{ fontSize: 34, fontWeight: 900 }}>WebSocket</div>
        <div style={{ fontSize: 24, color: muted, marginTop: 6 }}>電話：接通後即時講</div>
        <div style={{ fontSize: 28, lineHeight: 1.75, marginTop: 20 }}>
          新訊息，一則一則推過來
          <br />
          ack、心跳、之後的已讀
          <br />
          <span style={{ color: muted }}>沒接通時講的話，聽不到</span>
        </div>
      </Card>
      <Card style={{ flex: 1, borderTop: `10px solid ${green}` }}>
        <div style={{ fontSize: 34, fontWeight: 900 }}>REST API</div>
        <div style={{ fontSize: 24, color: muted, marginTop: 6 }}>打去客服：查以前的紀錄</div>
        <div style={{ fontSize: 28, lineHeight: 1.75, marginTop: 20 }}>
          歷史訊息，一次要一頁
          <br />
          <Kw>GET /messages?before_seq=…</Kw>
          <br />
          <span style={{ color: muted }}>好快取、好重試、好用 curl 測</span>
        </div>
      </Card>
    </div>
    <div style={{ fontSize: 28, color: muted, marginTop: 40 }}>不管從哪條路進來，都寫進本地 DB。畫面還是只看 DB。</div>
  </Shell>
);

const Offset: Page = () => (
  <Shell section="觀念" title="用「第幾則開始」分頁會怎樣？" sub="Offset 分頁：第 1 頁拿最新的 1～5 則，第 2 頁拿第 6～10 則。">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1.25fr', gap: 20, alignItems: 'start' }}>
      <SeqList title="① 第 1 頁" sub="offset=0, limit=5" rows={page1} />
      <Steps>
      <Step>
      <ColStep label="夥伴又傳一則">
      <SeqList
        title="② Server 上現在的順序"
        sub="全部往後擠了一格"
        rows={[
          { n: '1', seq: '#301', t: '我到了', mark: 'new' },
          { n: '2', seq: '#300', t: '那就這樣', mark: 'dim' },
          { n: '3', seq: '#299', t: '好', mark: 'dim' },
          { n: '4', seq: '#298', t: '7 點？', mark: 'dim' },
          { n: '5', seq: '#297', t: '週五吃拉麵', mark: 'dim' },
          { n: '6', seq: '#296', t: '在嗎' },
          { n: '7', seq: '#295', t: '嗨' },
        ]}
      />
      </ColStep>
      </Step>
      <Step>
      <ColStep label="往上滑">
      <SeqList
        title="③ 第 2 頁"
        sub="offset=5, limit=5"
        tone={red}
        rows={[
          { seq: '#296', t: '在嗎', mark: 'dup' },
          { seq: '#295', t: '嗨' },
          { seq: '#294', t: '……' },
          { seq: '#293', t: '……' },
          { seq: '#292', t: '……' },
        ]}
      />
      </ColStep>
      </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ marginTop: 26 }}>
          <WhyBox q="#296 第 1 頁已經拿過了，又出現一次。反過來，如果有人刪掉一則，會發生什麼事？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const Cursor: Page = () => (
  <Shell section="觀念" title="改成「比這則更舊的」" sub="Cursor 分頁：用上一頁最舊那則的 seq 當書籤，問 Server 比它更舊的。">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1.1fr', gap: 20, alignItems: 'start' }}>
      <SeqList title="① 第 1 頁" sub="不帶 cursor，拿最新的" rows={page1} />
      <Steps>
      <Step>
      <ColStep label="夥伴又傳一則">
      <SeqList
        title="② 第 2 頁"
        sub={<>before_seq=296（第 1 頁最舊那則）</>}
        tone={green}
        rows={[
          { seq: '#295', t: '嗨' },
          { seq: '#294', t: '……' },
          { seq: '#293', t: '……' },
          { seq: '#292', t: '……' },
          { seq: '#291', t: '……' },
        ]}
      />
      </ColStep>
      </Step>
      <Step>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginLeft: 30 }}>
        <Point title="新訊息擠進來也沒差" tag="不重複">
          #301 在 #296 的「更新」那一邊，不會影響「比 296 更舊」是哪幾則。
        </Point>
        <Point title="只要 seq 有索引" tag="很快">
          WHERE seq &lt; 296 ORDER BY seq DESC LIMIT 50，資料庫直接跳到那個位置，不用數前面幾則。
        </Point>
      </div>
      </Step>
      </Steps>
    </div>
  </Shell>
);

const CurlDemo: Page = () => (
  <Shell section="現場示範" title="用 curl 證明一次" sub="Server 沒有做 offset，用 limit 模擬：第 2 頁 = 最新 10 則的前 5 則（最舊的 5 則）。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Code size={25}>{`# ① 第 1 頁：最新 5 則
curl "http://localhost:8080/messages?user=Amy&limit=5"`}</Code>
      <Steps>
        <Step>
          <Code size={25}>{`# ……請夥伴傳一句……
# ② offset 第 2 頁：拿最新 10 則，看前面 5 則（最舊的 5 則）
#    → 最後一則就是第 1 頁拿過的那則
curl "http://localhost:8080/messages?user=Amy&limit=10"`}</Code>
        </Step>
        <Step>
          <Code size={25}>{`# ③ cursor 第 2 頁：比第 1 頁最舊的 seq 更舊的 5 則
curl "http://localhost:8080/messages?user=Amy&limit=5&before_seq=<第 1 頁最舊的 seq>"`}</Code>
        </Step>
      </Steps>
    </div>
    <div style={{ fontSize: 26, color: muted, marginTop: 26 }}>回傳的 messages 一律照 seq 由小到大。</div>
  </Shell>
);

const FourLayers: Page = () => (
  <Shell section="觀念" title="「訊息太多」要分四層處理" sub="每一層擋住不同的東西。今天做前兩層。">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 340px 1fr 240px',
        border: `2.5px solid ${ink}`,
        borderRadius: 'var(--osd-radius)',
        overflow: 'hidden',
        background: panel,
        fontSize: 27,
        lineHeight: 1.45,
      }}
    >
      {['層', '做什麼', '擋住什麼', '哪一堂'].map((h) => (
        <div key={h} style={{ padding: '14px 22px', fontWeight: 900, background: '#efe6d6' }}>
          {h}
        </div>
      ))}
      {[
        ['1', '網路分頁', '一次只跟 Server 要 50 則，不把 300 則全下載', '今天', true],
        ['2', '本地查詢視窗', 'DB 有 1000 則，也只查最新的 limit 則給畫面', '今天', true],
        ['3', '畫面虛擬化', 'List 有 200 則，只建畫面上看得到的那幾個氣泡', '第 3 堂', false],
        ['4', '本地容量上限', '每房只留最新 N 則，DB 不會無限長大', '最後講師補充', false],
      ].map(([n, a, b, c, hot]) =>
        [n, a, b, c].map((v, i) => (
          <div
            key={String(n) + i}
            style={{
              padding: '16px 22px',
              borderTop: `2px solid ${line}`,
              background: hot ? '#fdf0e3' : 'transparent',
              fontWeight: i === 1 ? 800 : 500,
              fontFamily: i === 0 ? mono : undefined,
            }}
          >
            {v as string}
          </div>
        )),
      )}
    </div>
  </Shell>
);

const LatestRule: Page = () => (
  <BigQuestion tag="寫 ① 之前先想" tagColor="#fbe7b5" foot="想想看：本地最新是 #120，Server 最新一頁是 #251～#300。寫進 DB 之後會長怎樣？">
    進房時本地 DB 不是空的，
    <br />
    為什麼不能也抓最新一頁？
  </BigQuestion>
);

const TwoPhase: Page = () => (
  <Shell section="觀念" title="兩段式分頁：先翻本地，不夠才打 API" sub="橘框是畫面看得到的範圍（本地查詢視窗）。快捲到頂，就把它開大一點。">
    <div style={{ display: 'flex', gap: 30, alignItems: 'flex-end' }}>
      <DbBar count={120} limit={50} title="① 進房" sub="本地有 120 則，只查最新 50 則" />
      <Steps>
        <Step>
          <div style={{ display: 'flex', gap: 30, alignItems: 'flex-end' }}>
            <ColArrow label="快捲到頂" />
            <DbBar count={120} limit={100} title="② 第一段：開大視窗" sub="本地還有，視窗 +50，不打 API" />
          </div>
        </Step>
        <Step>
          <div style={{ display: 'flex', gap: 30, alignItems: 'flex-end' }}>
            <ColArrow label="……一路滑到本地最舊" />
            <DbBar count={170} limit={170} fetched={50} title="③ 第二段：打 API" sub="before_seq = 本地最舊的 seq，拿到的寫進 DB，視窗跟著變大" />
          </div>
        </Step>
      </Steps>
    </div>
  </Shell>
);

const ImplA: Page = () => (
  <Shell section="實作" title="TODO ① ②" sub="starter 給了 HistoryApi（data/history_api.dart）和頂端的載入轉圈元件。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <Todo n="①" title="連上時，本地 DB 是空的 → 抓最新一頁，寫進 DB">
        <Hint>
          用 <Kw>store.latestSeq()</Kw> 判斷空不空。不是空的，就什麼都不做。
        </Hint>
      </Todo>
      <Todo n="②" title={<><Kw>watchMessages</Kw> 加上 <Kw>limit</Kw>：只查本地最新的 N 則</>}>
        <Hint>
          limit 用 <Kw>ValueNotifier</Kw>，預設 50。DB 變了要重查，limit 變大也要重查。
          <br />
          全表查詢 <Kw>SELECT * FROM messages</Kw> 後面要加 <Kw>LIMIT ?</Kw>。
        </Hint>
      </Todo>
    </div>
  </Shell>
);

const ImplB: Page = () => (
  <Shell section="實作" title="TODO ③ ④" sub="chat_page.dart 也要改兩個地方：偵測快到頂、在最上面放載入轉圈。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <Todo n="①" title="DB 空的才抓最新一頁" done />
      <Todo n="②" title="本地查詢視窗 limit" done />
      <Todo n="③" title={<>快捲到頂呼叫 <Kw>loadOlder()</Kw>：本地還有就開大視窗；不夠才用最舊 seq 打 <Kw>before_seq</Kw></>}>
        <Hint>reverse 列表的「頂端」是 maxScrollExtent，不是 0。</Hint>
      </Todo>
      <Todo n="④" title="載入中不要重複打；判斷「沒有更早的訊息了」">
        <Hint>捲動事件一秒會觸發很多次。拿到的不足一頁，或最舊的已經是 #1，就停。</Hint>
      </Todo>
    </div>
  </Shell>
);

const Acceptance: Page = () => (
  <Shell section="驗收" title="刪掉 App，重裝，往上滑" sub="講師課前已經幫你們房間灌了 300 則。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <Check>刪掉 App 重裝，進房看到最新一頁</Check>
      <Check>一路往上滑：一頁一頁接上，不重複，畫面不會跳</Check>
      <Check>滑到 #1 之後，再往上滑也不會再打 API（在 HistoryApi 呼叫處加 debugPrint，或用 DevTools Network 看）</Check>
      <Check>本地 DB 不是空的時候重開 App，不會去抓最新一頁</Check>
    </div>
  </Shell>
);

const Feynman: Page = () => (
  <Shell section="費曼檢核" title="不看螢幕，講給隔壁聽" sub="兩人一組，一人一分鐘。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Card>
        <Goal n="Q1">為什麼聊天室用 before_seq 分頁，不用「第幾頁」？</Goal>
      </Card>
      <Card>
        <Goal n="Q2">兩段式分頁的兩段各是什麼？為什麼不每次都打 API？</Goal>
      </Card>
      <Card>
        <Goal n="Q3">本地不是空的時候，為什麼進房不抓最新一頁？</Goal>
      </Card>
    </div>
  </Shell>
);

const Think: Page = () => (
  <Shell section="思考分享" title="兩人一組，想 3 分鐘" sub="想完抽兩三組，各講一分鐘。講完講師補充業界做法。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Card>
        <Goal n="Q4">點一則回覆，要跳到它引用的、三天前的那則原訊息。那則本地可能沒有，怎麼做？</Goal>
      </Card>
      <Card>
        <Goal n="Q5">大家每天聊，本地 DB 會一直長大。怎麼辦？</Goal>
      </Card>
    </div>
  </Shell>
);

const ExtraReply: Page = () => (
  <Shell section="講師補充" title="點回覆，跳到原訊息" sub="四個步驟。第 9 堂「進房跳到第一則未讀」會用同一套。">
    <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
      <ChatPhone
        w={360}
        h={640}
        msgs={[
          { t: '週五那家拉麵叫什麼？', who: 'Bob', seq: 412 },
          { t: '↩ 回覆 #57「巷口那家」', mine: true, st: 'sent', seq: 413 },
          { t: '好，我來訂位', mine: true, st: 'sent', seq: 414 },
        ]}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Todo n="1" title="本地有 #57 嗎？有就直接捲過去" />
        <Steps>
          <Step>
            <Todo n="2" title={<>沒有：<Kw>GET ?around_seq=57</Kw>，拿它前後一段（前 25、後 24，共 50 則）寫進 DB</>} />
          </Step>
          <Step>
            <Todo n="3" title={<>用 <Kw>CustomScrollView</Kw> 的 <Kw>center</Kw> 把 #57 當錨點，放在畫面中間</>}>
              <Hint>往上滑用 before_seq，往下滑用 after_seq，兩邊各自載。</Hint>
            </Todo>
          </Step>
          <Step>
            <Todo n="4" title="回覆本身存一份快照">
              <Hint>被引用的那句文字跟著回覆一起存。原訊息還沒載入、甚至被刪掉，引用框都顯示得出來。</Hint>
            </Todo>
          </Step>
        </Steps>
      </div>
    </div>
  </Shell>
);

const ExtraLimit: Page = () => (
  <Shell section="講師補充" title="本地有斷層、本地太大" sub="跳到 #57 之後，本地 DB 就不再是連續的一段了。">
    <RangeBar
      parts={[
        { from: 32, to: 81, kind: 'have' },
        { from: 82, to: 250, kind: 'hole' },
        { from: 251, to: 300, kind: 'have' },
      ]}
    />
    <div style={{ display: 'flex', gap: 32, marginTop: 20 }}>
      <Point title="記下哪幾段是連續的" tag="斷層追蹤">
        另外存一張表，記錄「#32～#81」「#251～#300」這種已載入的範圍。往上滑到一段的邊界，才知道要打 API，而不是以為已經到頂。
      </Point>
      <Point title="每房只留最新 N 則" tag="容量上限">
        例如每房留 2000 則，更舊的刪掉。之後真的滑到那裡，再用 before_seq 跟 Server 要回來。被刪掉的那段，也記成斷層。
      </Point>
    </div>
    <div style={{ fontSize: 26, color: muted, marginTop: 30 }}>
      斷層的另一個來源是斷線：斷線期間別人講的話。這就是下一堂。
    </div>
  </Shell>
);

const Hook: Page = () => (
  <div style={fill}>
    <TopBar section="下集預告" />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 180 }}>
      <Pill tint="#f7d9d6">講師暫時拒絕一位同學連線，夥伴趁機傳 3 句</Pill>
      <h2 style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.3, margin: '32px 0 0' }}>
        連回來之後，
        <br />
        那 3 句去哪了？
      </h2>
      <Steps>
        <Step>
      <div style={{ display: 'flex', gap: 32, marginTop: 56 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 22, color: muted }}>第 2 堂留下的問題</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>斷線時別人說的話，收不到</div>
        </Card>
        <Card style={{ flex: 1, background: '#fdf0e3' }}>
          <div style={{ fontSize: 22, color: muted }}>下一堂</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>重連後自動補齊，離線送的也補送</div>
        </Card>
      </div>
        </Step>
      </Steps>
    </div>
  </div>
);


// ═════════════ 講稿 ═════════════

export const notes: (string | undefined)[] = [
  // 1 Cover
  `開場前儀表板狀態（課前對一次）
□ 行為等級：ACK（儀表板上方「行為等級」按鈕）
□ 全域延遲：0 ms
□ 分房：維持「兩兩一組」（第 5～7 堂不換房）
□ 其他：每個兩人房灌 300 則。已 commit 版儀表板要在「房間」區一間一間選房 → 灌訊息（預設 300）；新版儀表板才有「兩人房各灌 300 則」一鍵

【0:00】
課前講師已經用儀表板幫每個兩人組的房間灌了 300 則訊息。
今天讓 App 去跟 Server 要以前的訊息，而且一次只要一頁，往上滑再要下一頁。這叫 Pagination，分頁。
我們用的方式叫 Cursor Pagination，游標分頁：拿一則訊息的 seq 當書籤，問「比它更舊的給我 50 則」。

術語
・Pagination（分頁）
・Cursor Pagination（游標分頁）`,

  // 2 Scenario
  `【0–2 分】
用 PM 的口氣唸。換新手機是很真實的情境，備份還原、重裝 App、在平板上登入，都是一樣的問題：本地 DB 是空的。
（→）今天的目標出來。第四個目標先賣關子，PM 等一下會再來。`,

  // 3 Evolution
  `【2–3 分】
今天一次打掉兩個 ✗：剛進聊天室會先載最新一頁；新加入的人也看得到以前的對話，因為對他來說本地一樣是空的。
注意第三列：斷線時別人說的話，今天還是收不到，而且本地會留下斷層。往上滑用的 before_seq 是往「比本地最舊更舊」的方向抓，斷線那段在本地最新之後，往上滑永遠補不到。今天結尾會現場看到：連回來看不到那幾句。這個留到下一堂。`,

  // 4 Recap
  `【3–5 分】回顧提問
接上一堂結尾：刪掉 App 重裝，又是空的。問：Server 明明有存，為什麼拿不到？
（→）提示出來：本地 DB 裡的訊息是從哪裡來的？只有一個來源嗎？

參考答案：到目前為止，本地 DB 只有一個來源，就是 WebSocket 推過來的訊息。WebSocket 只推「連上之後」發生的事，App 從來沒有主動跟 Server 要過以前的訊息。要拿以前的，得另外開一條路：REST API。`,

  // 5 WsVsRest
  `【5–8 分】WebSocket 和 REST 的分工
電話比喻：電話接通後，你聽得到對方現在講的話，這是 WebSocket。但你想知道上禮拜講了什麼，得打去客服查通話紀錄，這是 REST API。
WebSocket 適合即時、量小、一則一則來的東西。REST 適合大量、要分頁、可以重試的東西。HTTP 請求是 Stateless，無狀態的：每次請求都自己帶齊參數，Server 不用記得你上次問到哪，所以好快取、好重試，也好用 curl 測。
兩條路進來的資料，最後都寫進本地 DB。上一堂的 SSOT 不變，畫面還是只看 DB。

術語
・REST API
・Stateless（無狀態）

可能被問到
問：歷史訊息為什麼不也用 WebSocket 要？
答：可以，有些產品就是這樣做，送一個 get_history 事件。但要自己處理請求和回應的配對、逾時、重試。HTTP 這些都有現成的，還能走 CDN 快取。即時用 WebSocket、歷史用 REST，是很常見的分工。`,

  // 6 Offset
  `【8–11 分】Offset 分頁的問題
很多人第一個想到的分頁方式是「第幾頁、每頁幾則」，SQL 就是 LIMIT 5 OFFSET 5。這叫 Offset Pagination，偏移分頁。
照著三欄講，一欄一欄出來：第 1 頁拿最新 5 則，#300 到 #296。（→）這時候夥伴又傳了一則 #301，Server 上的順序全部往後擠一格。（→）往上滑要第 2 頁，offset=5，拿到的是第 6 到第 10 則，第一個就是 #296，剛剛拿過了。
（→）問全班下面那題：如果是有人刪掉一則呢？

參考答案：反過來，會有一則被跳過，永遠看不到。新增會重複，刪除會漏掉。聊天室新訊息隨時在進來，所以 Offset 分頁一定會出事。這叫 Page Drift，頁面漂移：資料在分頁的過程中變動，頁跟頁之間就對不齊。

術語
・Offset Pagination（偏移分頁）
・Page Drift（頁面漂移）

可能被問到
問：那 App 端用 client_msg_id 去重，重複的不就擋掉了？
答：重複的可以靠 upsert 擋掉，但漏掉的那則救不回來。而且資料量大時，OFFSET 10000 資料庫要先數過前面一萬列，越後面越慢。`,

  // 7 Cursor
  `【11–14 分】Cursor 分頁
改成拿上一頁最舊那則的 seq 當書籤。（→）第 2 頁：before_seq=296，意思是「比 #296 更舊的給我 5 則」。這個書籤就叫 Cursor，游標。
（→）右邊兩個重點出來。新訊息 #301 再怎麼進來，都在 #296 更新的那一邊，不影響「比 296 更舊」是哪幾則。刪掉一則也一樣，只會少一則，不會跳過別的。
效能上，seq 有索引，WHERE seq < 296 ORDER BY seq DESC LIMIT 50，資料庫直接跳到那個位置往下拿，不用數前面有幾則。
這也是為什麼第 4 堂要 Server 發 seq：它在房間裡是連續、唯一、只會往上加的，剛好拿來當 Cursor。

術語
・Cursor（游標）
・before_seq / after_seq

可能被問到
問：業界 API 都用 cursor 嗎？
答：資料會一直變的列表大多是。Slack 的 Web API 回傳 next_cursor，GraphQL 的 Relay 規格也是用 cursor 分頁。後台報表那種要跳到第 37 頁的，才比較常用 offset。

問：cursor 一定要是 seq 嗎？
答：不一定。可以是時間加 id 的組合，也可以是 Server 加密過的一串字，讓 Client 看不出內容。重點是它要能唯一標出「上次停在哪」。`,

  // 8 CurlDemo
  `【14–15 分】現場示範，1 分鐘
Server 沒有實作 offset，所以用 limit 模擬：最新 10 則的前 5 則（最舊的 5 則），就等於 offset=5。
① 先打第 1 頁：curl 向 Server 要最新 5 則，Server 回 5 則。記下最舊那則的 seq。
（→）② 請一位學員傳一句，他的 App 透過 WebSocket 送給 Server。接著 curl 向 Server 要 limit=10，看前面 5 則（最舊的 5 則）：最後一則就是第 1 頁拿過的那則。回傳是由小到大，所以重複的那則在前 5 則的最後一個，不要看成後面 5 則。
（→）③ curl 帶 before_seq=剛剛記下的 seq 向 Server 要（例如記下的是 #296，就打 before_seq=296；頁面上寫的是 <第 1 頁最舊的 seq>，要換成現場的數字），Server 回的是乾淨的下一頁。
名字換成你房間裡的學員。回傳一律照 seq 由小到大，App 寫進 DB 後再由查詢決定順序。`,

  // 9 FourLayers
  `【15–16 分】
「訊息太多」不是一件事，是四件事，分四層擋。
第一層網路分頁：一次只下載 50 則。第二層本地查詢視窗：DB 裡就算有一千則，也只查最新的 limit 則給畫面。第三層畫面虛擬化，就是第 3 堂講的 List Virtualization，列表虛擬化：ListView.builder 只建看得到的氣泡。第四層本地容量上限，最後講師補充。
今天做前兩層。每一層都在解不同的瓶頸：網路、資料庫查詢、畫面建構、儲存空間。

術語
・List Virtualization（列表虛擬化）`,

  // 10 LatestRule
  `【16–18 分】先想再寫 ①
問全班：本地 DB 不是空的，為什麼不能也抓最新一頁？
（→）提示出來：本地最新是 #120，Server 最新一頁是 #251～#300，寫進 DB 會長怎樣？給半分鐘。

參考答案：本地最新是 #120，最新一頁是 #251～#300。兩段都寫進 DB 之後，#121～#250 這一段 App 根本不知道它存在。畫面上 #120 下面直接接 #251，看起來很正常，其實中間少了 130 則。這種中間缺一段叫 Gap，斷層。
所以規則是：本地是空的才抓最新一頁。本地不是空的，從本地最新那則往後補，那是下一堂的 after_seq。

術語
・Gap（斷層）`,

  // 11 TwoPhase
  `【18–20 分】兩段式分頁
PM 這時候追加：「我想往上滑看昨天的訊息。」
橘框是畫面看得到的範圍，也就是 Local Window，本地查詢視窗，SQL 裡就是 LIMIT。
① 進房，本地有 120 則，只查最新 50 則。
（→）② 快捲到頂：本地還有比畫面更舊的，第一段就是把視窗開大到 100，不打 API。
（→）③ 一路滑到本地最舊的那則，本地不夠了，第二段才打 API：before_seq 等於本地最舊的 seq，拿到的寫進 DB，視窗跟著變大。
為什麼要兩段？本地有的東西還去網路要，是浪費流量也浪費時間；而且沒網路的時候，第一段照樣能用。這就是 Two-phase Pagination，兩段式分頁。

術語
・Local Window（本地查詢視窗）
・Two-phase Pagination（兩段式分頁）`,

  // 12 ImplA
  `【20–32 分】實作開始
① 監聽連線狀態，連上時呼叫一個方法：用 store.latestSeq() 看本地有沒有 Server 的訊息，null 才抓最新一頁，結果呼叫 upsertFromServer 寫進 DB。要包 try/catch，網路失敗就先看本地，下次連上再試。
② limit 用一個 ValueNotifier 存，預設 50，值一變就會通知聽它的人。watchMessages 改成吃這個 ValueListenable<int> limit。DB 變了要重查，limit 變大也要重查。SQL 加上 LIMIT ?。
有個細節：limit 變大和 DB 變動可能同時發生，兩個查詢誰先回來不一定。完成版用一個 generation 計數器，只送出最新那次查詢的結果，舊的直接丟掉。這叫 Stale Response，過期的回應，要丟。

術語
・ValueNotifier
・Stale Response（過期的回應）

可能被問到
問：為什麼用連線狀態觸發，不在 initState 抓？
答：initState 時可能還沒網路。等 WebSocket 連上，代表 Server 是通的，這時候抓比較不會白打。而且之後斷線重連，也會再檢查一次。`,

  // 13 ImplB
  `【32–45 分】
③ chat_page.dart 的 _onScroll：reverse 列表的頂端是 maxScrollExtent，不是 0。距離頂端剩 300 像素就呼叫 loadOlder，這種提前載入叫 Prefetch，預先載入，使用者滑到頂之前資料就到了，感覺不到在等。
列表最上面放 LoadingOlderIndicator，itemCount 加 1，最後一個 index 就是它。
loadOlder 裡：本地總數大於 limit，就 limit += 50；否則用 oldestSeq 打 before_seq，寫進 DB，limit 加上拿到的筆數。
④ 捲動事件一秒會觸發幾十次，沒擋的話會同時打十幾次 API。用一個 loadingOlder 旗標，載入中直接 return。這種擋重複觸發的做法叫 Guard，防護條件。
沒有更早的訊息：拿到的不足 50 則，或本地最舊已經是 #1（seq 從 1 開始連續），就設 _noMoreHistory，之後不再打。

術語
・Prefetch（預先載入）
・Guard（防護條件）
・maxScrollExtent

可能被問到
問：載入舊訊息時畫面會不會跳？
答：reverse 列表不會。offset 是從底部量的，舊訊息加在頂端那一邊，你正在看的那則位置不變。這是第 3 堂選 reverse 的好處之一。

問：網路失敗怎麼辦？
答：catch 起來，旗標放掉，下次滑到頂再試。正式產品會在頂端顯示「載入失敗，點此重試」。`,

  // 14 Acceptance
  `【45–50 分】驗收
第一項：刪掉 App 重裝。不要用換名字代替：第 1 堂的名字規則：Amy / Amy-2 是同一人的兩台裝置。換名字（如 Amy-3）會被分進 private:Amy，不是灌了 300 則的兩人房，看不到預期的最新一頁。
第三、四項在 App 端觀察：Server 不記 /messages 的請求，而且上課用的是講師的 Server，學員也看不到它的 log。在 HistoryApi 呼叫處加一行 debugPrint，或打開 DevTools 的 Network 分頁看有沒有再打 API。
第三項：滑到 #1 之後，不應該再出現 before_seq 的請求。
第四項：殺掉 App 重開，不應該出現沒帶 cursor 的 /messages 請求。`,

  // 15 Feynman
  `【50–52 分】費曼檢核

參考答案
Q1：「第幾頁」是用位置算的，新訊息一進來位置全部位移，會重複或漏掉。before_seq 是用訊息本身的 seq 當書籤，不受新增、刪除影響；有索引也比較快。
Q2：第一段是把本地查詢視窗開大，不打 API；本地不夠了，第二段才用最舊的 seq 打 before_seq，結果寫進 DB。本地有的不用再下載，沒網路時第一段也能用。
Q3：本地最新和 Server 最新一頁之間可能有一段 App 不知道的訊息，抓了會變成看不出來的斷層。`,

  // 16 Think
  `【52–55 分】思考分享
兩人一組想 3 分鐘，抽兩三組講。講完再翻下兩頁講師補充，答案在那兩頁。

參考答案
Q4：先查本地；沒有就用 around_seq 抓那則前後一段寫進 DB，再用錨點把它捲到畫面中間。引用框本身存快照。詳見下一頁。
Q5：設容量上限，每房只留最新 N 則，舊的刪掉，需要時再跟 Server 要。要記錄刪掉的範圍，才不會以為已經滑到頂。詳見下下頁。`,

  // 17 ExtraReply
  `【55–57 分】講師補充：跳到原訊息
① 使用者點引用框，App 先查本地 DB 有沒有 #57，有就直接捲過去。
（→）② 沒有，App 向 Server 打 around_seq=57，Server 回它前 25 則、後 24 則，加上 #57 本身共 50 則（預設 limit），App 寫進 DB。
（→）③ 畫面要以 #57 為中心，上下都能滑。第 3 堂講過的 CustomScrollView 加 center，指定一個錨點，往上載用 before_seq，往下載用 after_seq。這種從中間往兩邊載的方式叫 Bidirectional Pagination，雙向分頁。
（→）④ 回覆訊息本身存一份 Snapshot，快照：被引用那句的文字和作者，跟著回覆一起存。這樣原訊息還沒載入、甚至被收回，引用框都顯示得出來。LINE、Telegram 的引用框都是這樣，原訊息收回後引用框還在，只是點不過去。
第 9 堂「未讀 300 則，從第一則未讀開始看」用的是同一套：around 一個 seq，加上錨點。

術語
・around_seq
・Bidirectional Pagination（雙向分頁）
・Snapshot（快照）

可能被問到
問：跳過去之後，下面到最新那則之間不就有斷層了？
答：對，這就是下一頁的斷層追蹤。跳到 #57 之後，本地有兩段不連續的資料，要記下來。`,

  // 18 ExtraLimit
  `【57–59 分】講師補充：斷層追蹤和容量上限
跳到 #57 之後，本地有 #32～#81 和 #251～#300 兩段，中間是斷層。
今天的 loadOlder 是看「本地最舊的 seq」，它只適用於本地是連續一段的情況。有斷層時，要另外存一張表，記錄哪幾段是連續載入過的，叫 Gap Tracking，斷層追蹤。滑到一段的邊界，就知道要打 API。
本地 DB 會一直長大，可以設 Retention Policy，保留策略：例如每房只留最新 2000 則，更舊的刪掉。刪掉的範圍也記成斷層，之後滑到那裡再跟 Server 要。
最後一句帶到下一堂：斷層的另一個來源，就是斷線期間別人講的話。

術語
・Gap Tracking（斷層追蹤）
・Retention Policy（保留策略）

可能被問到
問：刪舊訊息時，自己還沒送出的 sending、failed 要不要刪？
答：不能刪。那些 Server 還沒有，刪了就真的不見了。只刪已經有 seq、Server 一定有存的。

問：圖片、檔案也這樣處理嗎？
答：檔案通常另外有快取上限，用 LRU（最近最少使用）淘汰，跟訊息文字分開管理。`,

  // 19 Hook
  `【59–60 分】結尾鉤子
講師在儀表板暫時拒絕一位學員連線，例如 30 秒。請他的夥伴趁這段時間傳 3 句。解除後，那位學員連回來，看不到那 3 句。
問：「訊息去哪了？」
（→）下面兩張卡出來：這是第 2 堂結尾留下的問題，下一堂終於要回收。

講師自己複習（面試關鍵字，不用講給學員）
・Cursor vs Offset Pagination：offset 依位置，資料變動會重複或漏；cursor 依 seq 書籤，穩定且可走索引。
・Two-phase Pagination：先擴大本地查詢視窗，本地不夠才以最舊 seq 打 before_seq。
・Gap：DB 不為空時不抓最新一頁，否則中間出現看不見的斷層；有跳轉或容量上限時要做斷層追蹤。
・四層「訊息太多」：網路分頁、本地查詢視窗、畫面虛擬化、本地容量上限。`,
];

export const meta: SlideMeta = {
  title: '第 06 堂｜Cursor 歷史分頁 + 進房載入最新一頁',
  createdAt: '2026-11-24T04:00:00.000Z',
};

export default [
  Cover,
  Scenario,
  Evolution,
  Recap,
  WsVsRest,
  Offset,
  Cursor,
  CurlDemo,
  FourLayers,
  LatestRule,
  TwoPhase,
  ImplA,
  ImplB,
  Acceptance,
  Feynman,
  Think,
  ExtraReply,
  ExtraLimit,
  Hook,
] satisfies Page[];
