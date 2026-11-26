import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 第 5 堂：本地 DB（SSOT）
// 學員看得到的頁面只放題目；參考答案和講稿都在 `notes`。
// 共用元件從第 4 堂複製，第 5 堂專用元件在後半段。
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
      <span>即時聊天室 · 第 5 堂</span>
      <span style={{ color: muted, fontWeight: 500 }}>/ {section}</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#dde9fb">Lesson 05</Pill>
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


// ═════════════ 第 5 堂專用元件 ═════════════

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

// 一張圖拆成多個圖層：底圖一直在，其餘每層是一個 Step，照順序出現
const Layers = ({ w, h, base, layers }: { w: number; h: number; base: ReactNode; layers: ReactNode[] }) => (
  <div style={{ position: 'relative', width: w, height: h }}>
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {base}
    </svg>
    <Steps>
      {layers.map((l, i) => (
        <Step key={i}>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: 0, top: 0 }}>
            {l}
          </svg>
        </Step>
      ))}
    </Steps>
  </div>
);

// 單向資料流：照一則訊息的時間順序，一條箭頭一個 Step
const FlowLoop = () => (
  <Layers
    w={1680}
    h={500}
    base={
      <>
        <SvgBox x={20} y={130} w={300} h={180} title="畫面" sub="StreamBuilder" tint="#dde9fb" />
        <Cylinder x={760} y={110} label="本地 DB" sub="唯一的筆記本" />
        <SvgBox x={1340} y={130} w={320} h={180} title="WebSocket" sub="ack / message" tint="#e3dcf5" />
      </>
    }
    layers={[
      <Arrow x1={326} y1={270} x2={754} y2={270} label="① send()：先寫一筆 sending" color="#c2622a" ly={38} />,
      <>
        <path d="M 170 316 L 170 440 L 1500 440 L 1500 322" fill="none" stroke="#c2622a" strokeWidth="4" strokeDasharray="12 8" />
        {head(1500, 318, -Math.PI / 2, '#c2622a', 18)}
        <text x={840} y={428} textAnchor="middle" fontSize="25" fontWeight="800" fill="#c2622a" style={halo}>
          ② 再把 JSON 送出去
        </text>
      </>,
      <Arrow x1={1334} y1={180} x2={1066} y2={180} label="③ ack 寫進 DB" color={blue} />,
      <Arrow x1={754} y1={180} x2={326} y2={180} label="④ 資料變了 → 重查 → 重畫" color={green} />,
    ]}
  />
);

// 同一個 id 寫兩次，表裡還是一列
const upsertCols = '360px 1fr 1fr';

const UpsertRow = ({ cells, headRow }: { cells: string[]; headRow?: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: upsertCols, borderTop: headRow ? 'none' : `2px solid ${line}` }}>
    {cells.map((c, i) => (
      <div
        key={i}
        style={{
          padding: '14px 22px',
          fontWeight: headRow ? 900 : i === 2 ? 800 : 500,
          background: headRow ? '#efe6d6' : 'transparent',
        }}
      >
        {c}
      </div>
    ))}
  </div>
);

// 同一個 id 寫兩次，表裡還是一列；三種寫入情況一列一個 Step
const UpsertDemo = () => (
  <div
    style={{
      border: `2.5px solid ${ink}`,
      borderRadius: 'var(--osd-radius)',
      overflow: 'hidden',
      background: panel,
      fontSize: 26,
    }}
  >
    <UpsertRow headRow cells={['什麼時候', '表裡已經有這個 id 嗎', '結果']} />
    <Steps>
      <Step>
        <UpsertRow cells={['夥伴的訊息第一次進來', '沒有', '新增一列']} />
      </Step>
      <Step>
        <UpsertRow cells={['同一則又收到一次', '有', '更新那一列，不會多一列']} />
      </Step>
      <Step>
        <UpsertRow cells={['自己送的訊息收到 ack', '有（sending 那筆）', '走 markSent（UPDATE）：補上 seq，改成 sent']} />
      </Step>
    </Steps>
  </div>
);

const VsRow = ({ k, a, b }: { k: string; a: ReactNode; b: ReactNode }) => (
  <>
    <div style={{ padding: '16px 22px', borderTop: `2px solid ${line}`, fontWeight: 800 }}>{k}</div>
    <div style={{ padding: '16px 22px', borderTop: `2px solid ${line}`, borderLeft: `2px solid ${line}`, background: '#fdf0e3' }}>{a}</div>
    <div style={{ padding: '16px 22px', borderTop: `2px solid ${line}`, borderLeft: `2px solid ${line}` }}>{b}</div>
  </>
);

// ═════════════ 頁面 ═════════════

const Cover: Page = () => (
  <div style={fill}>
    <TopBar section="封面" />
    <div style={{ position: 'absolute', left: 120, top: 220, width: 1060 }}>
      <div style={{ display: 'flex', gap: 14 }}>
        <Pill tint="#fbe7b5">⏱ 60 min</Pill>
        <Pill tint="#d6ecd9">階段二 · DB + REST</Pill>
        <Pill tint={panel}>兩兩一組，固定房</Pill>
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
        本地 DB
      </h1>
      <p style={{ fontSize: 36, color: muted, margin: 0 }}>App 重開，訊息還在；畫面只看一個地方</p>
      <div style={{ display: 'flex', gap: 14, marginTop: 56 }}>
        <Pill tint={panel}>SSOT</Pill>
        <Pill tint={panel}>Unidirectional Data Flow</Pill>
        <Pill tint={panel}>Upsert</Pill>
      </div>
    </div>
    <div style={{ position: 'absolute', right: 160, top: 160 }}>
      <ChatPhone
        w={380}
        h={820}
        msgs={[
          { t: '昨天那家拉麵不錯', who: 'Bob', seq: 51 },
          { t: '下次再去', mine: true, st: 'sent', seq: 52 },
          { t: '週五？', who: 'Bob', seq: 53 },
          { t: '可以', mine: true, st: 'sent', seq: 54 },
          { t: '剛剛那句沒送出', mine: true, st: 'failed' },
        ]}
      />
    </div>
  </div>
);

const Scenario: Page = () => (
  <Shell section="開場" title="客服又來了">
    <Bubble who="客服" role="客服">
      「使用者說<b style={{ color: 'var(--osd-accent)' }}>關掉 App 再打開</b>，剛剛的聊天紀錄<b style={{ color: 'var(--osd-accent)' }}>全不見了</b>。」
    </Bubble>
    <Steps>
      <Step>
    <Card style={{ marginTop: 56 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>今天下課前要做到</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Goal n="01">殺掉 App 重開，訊息馬上出現，不白屏</Goal>
        <Goal n="02">連不上 Server 也看得到之前的訊息</Goal>
        <Goal n="03">送到一半被殺掉，重開後那則變紅點</Goal>
        <Goal n="04">同一則訊息不會因為重複寫入而出現兩次</Goal>
      </div>
    </Card>
      </Step>
    </Steps>
  </Shell>
);

const Evolution: Page = () => (
  <Shell section="能力演進表" title="終於要打掉第一個 ✗" sub="加上本地 DB 之後，「殺掉 App 重開」從全部不見變成秒開。">
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
      <ColHead focus>第 5 堂 +本地 DB</ColHead>
      <ColHead>第 6 堂 +歷史 API</ColHead>
      <ColHead>第 7 堂 +補洞</ColHead>
      <ColHead>第 8～9 堂</ColHead>

      <RowHead>剛進聊天室</RowHead>
      <Cell state="no">空的，只看得到連上之後的</Cell>
      <Cell state="partial" focus>看得到自己收過的</Cell>
      <Cell state="yes">先載最新一頁，往上滑再載</Cell>
      <Cell state="yes" />
      <Cell state="yes">未讀多就跳到第一則未讀</Cell>

      <RowHead>殺掉 App 重開</RowHead>
      <Cell state="no">全部不見</Cell>
      <Cell state="yes" focus>
        <b>秒開，不白屏</b>　← 今天
      </Cell>
      <Cell state="yes" />
      <Cell state="yes" />
      <Cell state="yes" />

      <RowHead>斷線時別人說的話</RowHead>
      <Cell state="no">收不到</Cell>
      <Cell state="no" focus>收不到</Cell>
      <Cell state="no">收不到；本地留下斷層</Cell>
      <Cell state="yes">重連後自動補齊</Cell>
      <Cell state="yes" />

      <RowHead>新加入的人看舊對話</RowHead>
      <Cell state="no">看不到</Cell>
      <Cell state="no" focus>看不到</Cell>
      <Cell state="yes">看得到</Cell>
      <Cell state="yes" />
      <Cell state="yes" />

      <RowHead>有好幾個聊天室</RowHead>
      <Cell state="no">只能等講師分房</Cell>
      <Cell state="no" focus />
      <Cell state="no" />
      <Cell state="no" />
      <Cell state="yes">房間列表 + 未讀數</Cell>
    </div>
  </Shell>
);

const Recap: Page = () => (
  <BigQuestion tag="上堂的問題" tagColor="#f7d9d6" foot="提示：第 1～4 堂，訊息是存在哪一個變數裡？App 被殺掉時它會怎樣？">
    把 App 滑掉再打開，
    <br />
    剛剛的訊息去哪了？
  </BigQuestion>
);

const Ssot: Page = () => (
  <Shell section="觀念" title="只有一本筆記本" sub="講電話時邊聽邊記。之後要回想，只翻筆記本，不靠腦袋記。">
    <FlowLoop />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 10 }}>
      <Steps>
        <Step>
          <Point title="畫面只讀 DB" tag="規則 1">
            StreamBuilder 訂閱的是 DB 的查詢結果，不是某個 List。
          </Point>
        </Step>
        <Step>
          <Point title="WebSocket 只寫 DB" tag="規則 2">
            收到 ack、收到訊息，都是寫進 DB 就結束，不直接碰畫面。
          </Point>
        </Step>
      </Steps>
    </div>
  </Shell>
);

const TwoCopies: Page = () => (
  <Shell section="觀念" title="為什麼不能兩邊都存？" sub="有人會想：記憶體 List 照舊，另外再存一份到 DB 就好。">
    <div style={{ display: 'flex', gap: 40, alignItems: 'stretch' }}>
      <Card style={{ flex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 900 }}>記憶體 List</div>
        <div style={{ fontFamily: mono, fontSize: 26, marginTop: 16, lineHeight: 1.7 }}>
          #52 下次再去 <span style={{ color: green }}>✓</span>
          <br />
          ? &nbsp;剛剛那句 <span style={{ color: amber }}>sending</span>
        </div>
      </Card>
      <Card style={{ flex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 900 }}>DB</div>
        <div style={{ fontFamily: mono, fontSize: 26, marginTop: 16, lineHeight: 1.7 }}>
          #52 下次再去 <span style={{ color: green }}>✓</span>
          <br />
          #55 剛剛那句 <span style={{ color: green }}>sent</span>
        </div>
      </Card>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26, marginTop: 44 }}>
      <Steps>
        <Step>
          <Card>
            <Goal n="Q">兩邊寫的不一樣了。畫面該相信哪一邊？</Goal>
          </Card>
        </Step>
        <Step>
          <Card>
            <Goal n="Q">要讓兩邊永遠一樣，你得在幾個地方記得「兩邊都改」？</Goal>
          </Card>
        </Step>
      </Steps>
    </div>
  </Shell>
);

const Schema: Page = () => (
  <Shell section="觀念" title="資料表已經建好了" sub="檔案：data/local_message_store.dart。每個名字一個 DB 檔：chat_Amy.db。">
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
      <div style={{ width: 820 }}>
        <Code size={25}>{`CREATE TABLE messages(
  client_msg_id TEXT PRIMARY KEY,
  seq     INTEGER,
  sender  TEXT NOT NULL,
  text    TEXT NOT NULL,
  ts      INTEGER NOT NULL,
  status  TEXT NOT NULL)

CREATE INDEX idx_messages_seq
  ON messages(seq)`}</Code>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Point title={<><Kw>client_msg_id</Kw> 當主鍵</>} tag="去重">
          同一個 id 只能有一列。上一堂靠它讓 Server 去重，這堂靠它讓 DB 去重。
        </Point>
        <Point title={<><Kw>ORDER BY seq</Kw></>} tag="排序">
          查詢照 seq 由大到小，還沒有 seq 的放最前面。跟上一堂記憶體裡的排法一樣。
        </Point>
        <Point title={<><Kw>seq</Kw> 可以是 null</>} tag="sending">
          自己剛送出、還沒收到 ack 的訊息，還沒有號碼。
        </Point>
      </div>
    </div>
  </Shell>
);

const Upsert: Page = () => (
  <Shell section="觀念" title="有就更新，沒有就新增" sub="同一則訊息可能進來好幾次：廣播一次、之後的歷史分頁一次、斷線補洞又一次。">
    <Code size={26}>{`INSERT INTO messages(client_msg_id, seq, sender, text, ts, status)
VALUES(?, ?, ?, ?, ?, ?)
ON CONFLICT(client_msg_id) DO UPDATE SET
  seq = excluded.seq, ts = excluded.ts, status = excluded.status`}</Code>
    <div style={{ marginTop: 36 }}>
      <UpsertDemo />
    </div>
  </Shell>
);

const WhySqflite: Page = () => (
  <Shell section="觀念" title="為什麼用 sqflite，不用 Drift？" sub="兩個都是 Flutter 常見的 SQLite 套件。正式專案兩個都有人用。">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr 1fr',
        border: `2.5px solid ${ink}`,
        borderRadius: 'var(--osd-radius)',
        overflow: 'hidden',
        background: panel,
        fontSize: 27,
        lineHeight: 1.45,
      }}
    >
      <div style={{ padding: '14px 22px', fontWeight: 900, background: '#efe6d6' }} />
      <div style={{ padding: '14px 22px', fontWeight: 900, background: '#fbd9b8', borderLeft: `2px solid ${line}` }}>sqflite（這門課）</div>
      <div style={{ padding: '14px 22px', fontWeight: 900, background: '#efe6d6', borderLeft: `2px solid ${line}` }}>Drift</div>
      <VsRow k="怎麼寫" a="直接寫 SQL 字串" b="用 Dart 寫，自動產生 SQL" />
      <VsRow k="資料變了通知畫面" a="自己做：寫完發一個通知，Stream 重查" b="內建 watch()，查詢會自己更新" />
      <VsRow k="型別檢查" a="欄位打錯，執行時才知道" b="編譯時就會抓到" />
      <VsRow k="要多裝什麼" a="不用" b="build_runner 產生程式碼" />
    </div>
    <div style={{ fontSize: 28, color: muted, marginTop: 36 }}>
      今天想讓大家親手寫一次 upsert 和「資料變了」的通知。之後換 Drift，就知道它幫你做了哪些事。
    </div>
  </Shell>
);

const ImplA: Page = () => (
  <Shell section="實作" title="TODO ① ②" sub="資料表、查詢、Message 和資料列的轉換，starter 都寫好了。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <Todo n="①" title={<>ChatController 的記憶體 <Kw>_list</Kw> 拿掉，改用 <Kw>LocalMessageStore</Kw></>}>
        <Hint>_list、_emit、_update 都可以刪。ack 計時器留著。</Hint>
      </Todo>
      <Todo n="②" title={<>寫 store 的四個寫入方法，每個寫完都發 <Kw>_changes.add(null)</Kw></>}>
        <Hint>
          <Kw>insertPending</Kw>、<Kw>upsertFromServer</Kw>（用上一頁的 SQL）、<Kw>markSent</Kw>、<Kw>updatePendingStatus</Kw>
          <br />
          最後一個要注意：已經 sent 的，不能被改回 sending 或 failed。
        </Hint>
      </Todo>
    </div>
  </Shell>
);

const KilledMidway: Page = () => (
  <BigQuestion tag="寫 ⑤ 之前先想" tagColor="#fbe7b5" foot="想想看：等 ack 的那個 Timer 在哪裡？App 被殺掉之後它還在嗎？">
    送到一半 App 被殺掉，
    <br />
    重開後那則一直轉圈，
    <br />
    它還會變勾勾嗎？
  </BigQuestion>
);

const ImplB: Page = () => (
  <Shell section="實作" title="TODO ③ ④ ⑤" sub="做完 ④ 之後，UI 一行都不用改。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <Todo n="①" title="記憶體 List 換成 store" done />
      <Todo n="②" title="四個寫入方法 + 通知" done />
      <Todo n="③" title="送出寫 sending、收到 ack 呼叫 markSent、收到 message 呼叫 upsertFromServer">
        <Hint>逾時和重試改呼叫 updatePendingStatus。</Hint>
      </Todo>
      <Todo n="④" title={<><Kw>messages</Kw> 改成 <Kw>store.watchMessages()</Kw></>} />
      <Todo n="⑤" title="打開 DB 時，把殘留的 sending 改成 failed" />
    </div>
  </Shell>
);

const Acceptance: Page = () => (
  <Shell section="驗收" title="殺掉 App，再打開" sub="跟夥伴一起測，你們這幾堂固定同一間房。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <Check>殺掉 App 重開，訊息馬上出現，不會先白屏再跳出來</Check>
      <Check>講師暫時拒絕你的連線，重開 App：舊訊息都在，上方顯示斷線橫幅</Check>
      <Check>
        輸入 <Kw>/delay</Kw> 後馬上殺掉 App，重開後那則是紅點
      </Check>
      <Check>
        用 <Kw>/fail</Kw> 再連點重試：自己和夥伴那邊都只有一則
      </Check>
    </div>
  </Shell>
);

const Feynman: Page = () => (
  <Shell section="費曼檢核" title="不看螢幕，講給隔壁聽" sub="兩人一組，一人一分鐘。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Card>
        <Goal n="Q1">「畫面只讀 DB、WebSocket 只寫 DB」，好處是什麼？</Goal>
      </Card>
      <Card>
        <Goal n="Q2">同一則訊息寫進 DB 兩次，為什麼不會多一列？</Goal>
      </Card>
      <Card>
        <Goal n="Q3">為什麼打開 DB 時要把 sending 改成 failed？</Goal>
      </Card>
    </div>
  </Shell>
);

const Think: Page = () => (
  <Shell section="思考分享" title="兩人一組，想 3 分鐘" sub="想完抽兩三組，各講一分鐘。">
    <Card>
      <Goal n="Q4">千人群組，每秒湧進 30 則訊息，畫面卡到滑不動。你會怎麼查？怎麼改？</Goal>
    </Card>
    <div style={{ fontSize: 28, color: muted, marginTop: 36, lineHeight: 1.6 }}>
      提示：現在每收到一則，會發生幾次寫入、幾次「資料變了」、幾次整張表重查？
    </div>
  </Shell>
);

const Hook: Page = () => (
  <div style={fill}>
    <TopBar section="下集預告" />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 180 }}>
      <Pill tint="#f7d9d6">現場實驗：把 App 刪掉重裝，就像換了一支新手機</Pill>
      <h2 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.3, margin: '32px 0 0' }}>
        打開聊天室，一則舊訊息都沒有。
        <br />
        這些訊息 Server 上都有，為什麼 App 看不到？
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 56 }}>
        <Steps>
          <Step>
            <Card style={{ flex: 1 }}>
              <div style={{ fontSize: 22, color: muted }}>新手機上的本地 DB</div>
              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>空的，重裝時一起被刪了</div>
            </Card>
          </Step>
          <Step>
            <Card style={{ flex: 1, background: '#fdf0e3' }}>
              <div style={{ fontSize: 22, color: muted }}>Server（講師儀表板看得到）</div>
              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>這個房間從 #1 開始的每一則</div>
            </Card>
          </Step>
        </Steps>
      </div>
    </div>
  </div>
);


// ═════════════ 講稿 ═════════════

export const notes: (string | undefined)[] = [
  // 1 Cover
  `開場前儀表板狀態（課前對一次）
□ 行為等級：ACK（第 4 堂起）
□ 全域延遲：0 ms
□ 分房：兩兩一組（課前分好；第 5～7 堂不換房）
□ 其他：驗收第二項要用儀表板的「拒絕連線」（預設 30 秒），先確認找得到

【0:00】
今天開始進入第二階段：DB + REST。第一件事是讓訊息存下來，App 重開還在。
主角是 SSOT，Single Source of Truth，單一資料來源：整個 App 只有一個地方存訊息，畫面只看它。今天這個地方就是本地資料庫。
提醒一下，第 5～7 堂固定兩兩一組，不換房，因為今天的資料表還沒有 room_id。

術語
・SSOT, Single Source of Truth（單一資料來源）`,

  // 2 Scenario
  `【0–2 分】
用客服的口氣唸。這是使用者最直接感受得到的問題：重開就空了。
（→）四個目標出來。第二個很多人會忽略：連不上 Server 也要看得到舊訊息。這種「沒網路也能用」的設計叫 Offline-first，離線優先。今天只做到看得到，離線送出要到第 7 堂。

術語
・Offline-first（離線優先）

可能被問到
問：為什麼不每次打開都跟 Server 拿就好？
答：要等網路，進房會白屏；沒網路就什麼都看不到。本地先顯示、再跟 Server 同步，是聊天 App 的標準做法。第 6、7 堂就是在補「跟 Server 同步」這一半。`,

  // 3 Evolution
  `【2–3 分】
前四堂這張表一個 ✗ 都沒少，今天終於打掉第一個：殺掉 App 重開，從全部不見變成秒開。
順便看第一列：剛進聊天室，今天變成「看得到自己收過的」，只有半個勾。換手機或第一次進房還是空的，那是下一堂的事。`,

  // 4 Recap
  `【3–5 分】回顧提問
上一堂結尾大家把 App 滑掉再打開，訊息全不見。問全班：為什麼？
（→）想不出來就給提示：第 1～4 堂的訊息存在哪個變數裡？App 被殺掉時它會怎樣？

參考答案：訊息存在 ChatController 的 _list 裡，只放在記憶體，英文叫 In-memory。App 被殺掉，整個行程的記憶體都被系統收回，_list 就沒了。要活過 App 重開，得寫進手機的儲存空間，也就是 Persistence，持久化。

術語
・Persistence（持久化）
・In-memory（記憶體內）：只存在 RAM 裡，App 一結束就沒了。上一堂的 _list 就是 In-memory 的。`,

  // 5 Ssot
  `【5–10 分】SSOT
用電話比喻：講電話時邊聽邊記筆記。之後有人問「剛剛他說什麼」，你翻筆記本，不是靠腦袋想。筆記本只有一本，大家都看同一本。這就是 SSOT，單一資料來源。
圖上三個方塊。跟著一則訊息走一遍，一條箭頭按一下：
（→）① 使用者按送出，畫面呼叫 send()，先寫一筆 sending 進 DB。
（→）② App 再把 JSON 透過 WebSocket 送給 Server。
（→）③ Server 的 ack 從 WebSocket 回來，WebSocket 只負責把它寫進 DB，不碰畫面。
（→）④ DB 的資料變了，通知畫面重新查一次、重新畫，轉圈變勾勾。
（→）下面兩條規則一條一條出來。畫面只讀 DB；（→）WebSocket 只寫 DB。
資料永遠朝同一個方向流：寫進 DB → 通知 → 畫面。這叫 Unidirectional Data Flow，單向資料流。畫面不會自己偷偷改資料，WebSocket 也不會直接去碰畫面。
好處是：要知道畫面為什麼長這樣，只要看 DB 裡有什麼。

術語
・SSOT, Single Source of Truth（單一資料來源）
・Unidirectional Data Flow（單向資料流）

可能被問到
問：這跟 Redux、Bloc 的單向資料流是同一個概念嗎？
答：同一個概念，只是那邊的「唯一來源」是記憶體裡的 store 或 state，這邊是資料庫。原則都是：狀態只有一份，改狀態只有固定的入口，畫面只負責根據狀態畫出來。

問：每次資料變就整張表重查，不會很慢嗎？
答：幾百、幾千則都很快。真的很多，就只查最新一頁（第 6 堂），或像最後的思考題說的，把寫入集中起來批次做。`,

  // 6 TwoCopies
  `【10–12 分】
先讓學員想：「記憶體 List 照舊，另外存一份到 DB 不就好了？」這是很多人第一個直覺。
左右兩邊已經不一樣了：記憶體那邊還在 sending，DB 那邊已經拿到 #55。
（→）第一題：畫面該相信哪一邊？（→）第二題：要在幾個地方記得兩邊都改？給半分鐘。

參考答案
Q：沒有標準答案，這就是問題所在。兩份資料不一致時，你一定得選一邊相信，選錯就是 bug。
Q：每一個寫入的地方都要記得改兩邊：送出、ack、逾時、重試、收到訊息，之後還有分頁和補洞。少改一個地方就不一致。只有一份資料，就沒有「同步兩份」這件事。
這種兩邊對不上的狀況叫 Data Inconsistency，資料不一致。

術語
・Data Inconsistency（資料不一致）

可能被問到
問：那記憶體快取就完全不能用嗎？
答：可以，但要有主從：DB 是主，記憶體只是 DB 的快取，資料只從 DB 流進記憶體，不能反過來各自改。Drift、Room 這類套件內部其實也有快取，只是它們保證跟 DB 一致。`,

  // 7 Schema
  `【12–15 分】
資料表 starter 已經建好。兩個重點。
第一，client_msg_id 是 Primary Key，主鍵。主鍵的意思是同一個值只能有一列。上一堂它讓 Server 認出重送，這堂它讓本地 DB 認出重複寫入，一個 id 用兩次。
第二，查詢用 ORDER BY seq，由大到小，seq 是 null 的放最前面。seq 上有一個 Index，索引，就像書後面的索引頁，排序和查詢不用從頭翻到尾。
每個名字一個 DB 檔，是因為同一台模擬器可能換名字登入，不要混在一起。

術語
・Primary Key（主鍵）
・Index（索引）
・client_msg_id / seq：一個是 App 產生、用來認同一則；一個是 Server 發、用來排序。

可能被問到
問：主鍵為什麼不用 seq？
答：自己剛送出的訊息還沒有 seq，是 null，不能當主鍵。client_msg_id 從送出那一刻就有，而且不會變。

問：sender 為什麼不另外開一張使用者表？
答：教學先簡化。正式產品會有使用者表，訊息只存 sender_id，顯示名稱和頭像另外查。`,

  // 8 Upsert
  `【15–18 分】
同一則訊息可能進來好幾次：廣播一次，下一堂的歷史分頁可能又載到，第 7 堂斷線補洞還會再來一次。
所以寫入要用 Upsert，就是 update 加 insert：表裡沒有這個 id 就新增，有了就更新那一列。SQLite 的寫法是在 INSERT 後面加 ON CONFLICT … DO UPDATE，完整寫出來就是 INSERT … ON CONFLICT(client_msg_id) DO UPDATE。
excluded 指的是「這次想插入、但撞到的那一筆新資料」。我們拿它的 seq、ts、status 去更新舊的那列。
下面的表格，三種寫入情況一列一列按：
（→）夥伴的訊息第一次從 WebSocket 進來：表裡沒有這個 id，新增一列。
（→）同一則又從 WebSocket 或之後的 API 進來一次：表裡已經有，只更新那一列，不會多一列。
（→）自己送的訊息，Server 回 ack 給我：表裡有 sending 那筆，補上 seq、改成 sent。第三種要注意：自己送的訊息收到 ack，走的是 markSent，直接 UPDATE 那筆 sending。
同一件事做幾次結果都一樣，就是上一堂的 Idempotency，冪等。這次是 DB 層的冪等。

術語
・Upsert（更新或新增）
・ON CONFLICT … DO UPDATE
・Idempotency（冪等）

可能被問到
問：為什麼不用 INSERT OR REPLACE？
答：REPLACE 的做法是先把舊的那列刪掉、再插入新的。沒帶到的欄位會被清掉，如果有外鍵或觸發器還會連帶觸發刪除。UPSERT 是原地更新，只改你指定的欄位，比較安全。

問：所有手機都能用 ON CONFLICT DO UPDATE 嗎？
答：這個語法要 SQLite 3.24 以上。sqflite 在 Android 上用的是系統內建的 SQLite，很舊的 Android 版本可能不夠新。要支援舊機，可以讓 App 自帶 SQLite（例如 sqlite3_flutter_libs），或拆成「INSERT OR IGNORE 再 UPDATE」兩步。`,

  // 9 WhySqflite
  `【18–20 分】
sqflite 和 Drift 都是 Flutter 很常見的 SQLite 套件。
Drift 用 Dart 寫查詢，靠 build_runner 做 Code Generation，程式碼產生，產生出型別安全的 SQL；它還內建 watch()，資料一變，查詢自己會更新。這種會自己更新的查詢叫 Reactive Query，響應式查詢。
sqflite 就是直接寫 SQL 字串。資料變了要通知畫面，得自己做：每次寫完發一個通知，Stream 收到就重查。
這門課選 sqflite，就是要大家親手做一次 Reactive Query 背後的事。之後換 Drift，就知道它幫你省了哪些工。

術語
・sqflite / Drift
・Code Generation（程式碼產生）
・Reactive Query（響應式查詢）

可能被問到
問：那正式專案要選哪個？
答：表多、查詢複雜、團隊多人維護，Drift 的型別檢查很值得。表很少、想要依賴少，sqflite 夠用。也有人用 Isar、ObjectBox 這類非 SQL 的資料庫，但聊天需要排序、分頁、範圍查詢，SQL 比較順手。

問：sqflite 可以在桌面或網頁跑嗎？
答：sqflite 本身只支援 iOS、Android、macOS。桌面要搭配 sqflite_common_ffi；網頁要另外的方案。`,

  // 10 ImplA
  `【20–32 分】實作開始
① ChatController 裡的 _list、_emit、_update 都可以刪掉，改成呼叫 store。ack 的 Timer 留著，逾時判斷還在 Controller。
② LocalMessageStore 的四個寫入方法：insertPending 直接 insert；upsertFromServer 用上一頁的 SQL；markSent 補上 seq、改成 sent；updatePendingStatus 改狀態。
每個寫完都要 _changes.add(null)，這就是我們自己做的 Change Notification，變動通知。忘了發，DB 改了但畫面不會動，這是今天最常見的 bug。
updatePendingStatus 的 WHERE 要加 status != 'sent'，已經成功的不能被逾時或重試改回去。這是上一堂 ack 和 Timer 的 Race Condition，競態條件，這次用 SQL 條件擋掉。

術語
・Change Notification（變動通知）
・Race Condition（競態條件）

可能被問到
問：upsertFromServer 為什麼收一個 List？
答：今天每次只有一則，但下一堂的歷史分頁和第 7 堂的補洞一次會進來幾十則。用 batch 一次寫完、只發一次通知，比一則一則寫快很多。

問：寫入失敗怎麼辦？
答：教學版先不處理。正式產品要 try/catch 記錄錯誤；如果是 DB 損毀，常見做法是刪掉重建，再跟 Server 重新同步。`,

  // 11 KilledMidway
  `【32–35 分】先想再寫 ⑤
問全班：送到一半 App 被殺掉，重開後那則還在轉圈。它還會變勾勾嗎？
（→）提示出來：等 ack 的那個 Timer 在哪裡？App 被殺掉之後它還在嗎？

參考答案：不會。等 ack 的 Timer 在記憶體裡，App 被殺掉就沒了；Server 就算回了 ack，也是回給那條已經斷掉的舊連線，新連線收不到。所以這筆會永遠卡在 sending。打開 DB 時把所有 sending 改成 failed，使用者看到紅點，點一下就重試。
重試是安全的：上一堂做了 client_msg_id 去重，就算 Server 其實收到過，也只會回同一張回條。
這種「上次沒做完的工作，重開後要收拾」的情況叫 Crash Recovery，當機復原。

術語
・Crash Recovery（當機復原）

可能被問到
問：為什麼不重開後自動幫他重送？
答：可以，那就是第 7 堂的 outbox。今天先做最保守的：讓使用者看到、自己決定。`,

  // 12 ImplB
  `【35–50 分】
③ send 改成 await store.insertPending，再送出；收到 ack 呼叫 markSent；收到 message 呼叫 upsertFromServer；逾時和重試改呼叫 updatePendingStatus。
④ messages 改成回傳 store.watchMessages()。這裡請大家注意：chat_page.dart 一行都沒改，畫面就換成從 DB 來了。因為從第 1 堂開始，畫面就只認一個 Stream<List<Message>>，這是當初刻意的設計。這種「換掉底層、上層不用改」的能力，靠的是 Abstraction，抽象介面。
⑤ 在 open() 裡，DB 打開後執行一次 UPDATE，把 status 是 sending 的改成 failed。

術語
・Stream
・Abstraction（抽象介面）

可能被問到
問：watchMessages 用 async* 寫，每次訂閱都會開一個新的查詢嗎？
答：對，每個訂閱者各自跑一份。今天只有一個畫面訂閱，沒問題。多個地方要訂閱時，可以改成共用一個 broadcast Stream。`,

  // 13 Acceptance
  `【50–55 分】驗收
第二項需要講師配合：在儀表板暫時拒絕某位學員的連線，例如 30 秒。學員重開 App，舊訊息照樣秒出現，上方是斷線橫幅。這證明畫面完全不依賴網路。
第三項：輸入 /delay，Server 會晚 3 秒才回 ack，趁這 3 秒殺掉 App。重開後那則是紅點。點重試會變勾勾，夥伴那邊也只有一則，因為 Server 認得同一個 id。
第四項自己和夥伴兩邊都要看。這項驗的是 Server 冪等 + markSent：重試帶同一個 id，Server 只把原本那張 ack 再回一次、不再轉給夥伴，自己這邊收到 ack 走 markSent（UPDATE）。整個流程不會有同一個 id 寫進 DB 兩次，所以 upsert 寫成普通 INSERT 這項也會過。DB 層 upsert 到第 6 堂歷史頁和 WS 重疊時才會真的用到。`,

  // 14 Feynman
  `【55–56 分】費曼檢核

參考答案
Q1：資料只有一份，不會有兩邊不一致。畫面為什麼長這樣，看 DB 就知道。WebSocket、之後的歷史 API、補洞，都只要寫進 DB，畫面自動更新，不用每個地方都去通知畫面。
Q2：client_msg_id 是主鍵，寫入用 upsert：已經有這個 id 就更新那一列，不會新增。
Q3：等 ack 的 Timer 和連線都隨著 App 被殺掉而消失，那筆不可能再收到 ack，會一直轉圈。改成 failed，使用者才能重試。`,

  // 15 Think
  `【56–59 分】思考分享
兩人一組想 3 分鐘，抽兩三組講，最後講師補充。

參考答案
先查：用 Flutter DevTools 看是哪裡慢。現在的寫法是每收到一則就寫一次 DB、發一次通知、整張表重查一次、整個列表重建一次。每秒 30 則就是每秒 30 次全表查詢。
改法：收到的訊息先放進記憶體裡的 Buffer，緩衝佇列，每 200 毫秒一次把累積的訊息用一個 batch 寫進 DB，只發一次通知。這叫 Batching，批次處理。畫面從每秒更新 30 次變成最多 5 次，人眼其實看不出差別。
再進一步：查詢只查最新一頁，不要整張表（下一堂會做）；通知可以 Debounce，防抖，短時間內多次變動只處理最後一次。
這裡用的不是新的資料來源，Buffer 只是寫進 DB 前的暫存，SSOT 還是 DB。

術語
・Buffer（緩衝）
・Batching（批次處理）
・Debounce（防抖）

可能被問到
問：Buffer 裡的訊息還沒寫進 DB，App 就被殺掉怎麼辦？
答：會掉最多 200 毫秒的訊息。但它們在 Server 上都有，第 7 堂的補洞會用 seq 找出缺的那段再拿回來。所以本地丟一點點是可以接受的。`,

  // 16 Hook
  `【59–60 分】結尾鉤子
請一位學員把 App 刪掉重裝，就像換了新手機。打開聊天室，一則舊訊息都沒有。同時打開講師儀表板，讓大家看到這個房間的訊息 Server 上都還在。
（→）左邊的卡：新手機上的本地 DB 是空的。（→）右邊的卡：Server 上從 #1 開始每一則都在。
問：「這些訊息 Server 上都有，為什麼 App 看不到？」不給答案。
引導：本地 DB 只有這支手機「自己收過」的訊息。要拿到以前的，得主動跟 Server 要，下一堂做歷史分頁。

講師自己複習（面試關鍵字，不用講給學員）
・SSOT：App 裡訊息只有一份，存在本地 DB；畫面只讀它，WS / API 只寫它。
・Unidirectional Data Flow：寫入 → DB → 通知 → 畫面，資料只往一個方向流。
・Upsert：INSERT … ON CONFLICT DO UPDATE，同一筆重複寫入只更新，搭配主鍵達成 DB 層冪等。
・client_msg_id vs server_seq_id：前者 Client 產生、送出就有、用來去重與對 ACK；後者 Server 核發、房間內遞增、用來排序與當分頁游標。`,
];

export const meta: SlideMeta = {
  title: '第 05 堂｜本地 DB（SSOT）',
  createdAt: '2026-11-24T02:00:00.000Z',
};

export default [
  Cover,
  Scenario,
  Evolution,
  Recap,
  Ssot,
  TwoCopies,
  Schema,
  Upsert,
  WhySqflite,
  ImplA,
  KilledMidway,
  ImplB,
  Acceptance,
  Feynman,
  Think,
  Hook,
] satisfies Page[];
