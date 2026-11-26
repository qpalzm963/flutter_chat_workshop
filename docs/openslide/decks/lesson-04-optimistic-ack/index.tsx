import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 第 4 堂：樂觀更新 + ACK + 冪等
// 學員看得到的頁面只放題目；參考答案和講稿都在 `notes`。
// 共用元件從第 3 堂複製，第 4 堂專用元件在後半段。
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
      <span>即時聊天室 · 第 4 堂</span>
      <span style={{ color: muted, fontWeight: 500 }}>/ {section}</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#dde9fb">Lesson 04</Pill>
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

// ═════════════ 第 4 堂專用元件 ═════════════

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

// 循序圖：每個 item 一列，每一列是一個 Step（按一下 → 出現下一個收發）
const SeqDiagram = ({ lanes, items, w = 1680, rowH = 58, pad = 150 }: { lanes: string[]; items: SeqItem[]; w?: number; rowH?: number; pad?: number }) => {
  const top = 92;
  const h = top + items.length * rowH + 20;
  const xs = lanes.map((_, i) => pad + (i * (w - pad * 2)) / (lanes.length - 1));
  const draw = (it: SeqItem, i: number) => {
    const y = top + i * rowH + rowH / 2 + 6;
    if (it.kind === 'gap') {
      return (
        <text x={w / 2} y={y + 6} textAnchor="middle" fontSize="22" fill={muted} fontStyle="italic" style={halo}>
          {it.label}
        </text>
      );
    }
    if (it.kind === 'note') {
      const bw = Math.max(180, it.label.length * 22 + 36);
      return (
        <g>
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
      <g>
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={c} strokeWidth="3" strokeDasharray={it.lost ? '8 6' : undefined} />
        {it.lost ? (
          <text x={x2} y={y + 10} textAnchor="middle" fontSize="32" fontWeight="900" fill={red}>
            ✕
          </text>
        ) : (
          head(x2, y, dir > 0 ? 0 : Math.PI, c)
        )}
        <text x={(x1 + (it.lost ? x2 : full)) / 2} y={y - 12} textAnchor="middle" fontSize="21" fontWeight="700" fill={c} style={halo}>
          {it.label}
        </text>
      </g>
    );
  };
  return (
    <Layers
      w={w}
      h={h}
      base={lanes.map((l, i) => (
        <g key={l}>
          <line x1={xs[i]} y1={70} x2={xs[i]} y2={h - 6} stroke={line} strokeWidth="3" strokeDasharray="8 8" />
          <rect x={xs[i] - 110} y={8} width={220} height={60} rx={12} fill={panel} stroke={ink} strokeWidth="2.5" />
          <text x={xs[i]} y={47} textAnchor="middle" fontSize="26" fontWeight="800" fill={ink}>
            {l}
          </text>
        </g>
      ))}
      layers={items.map(draw)}
    />
  );
};

const SNode = ({ x, y, title, sub, tint }: { x: number; y: number; title: string; sub: string; tint: string }) => (
  <g>
    <rect x={x} y={y} width={360} height={140} rx={18} fill={tint} stroke={ink} strokeWidth="3" />
    <text x={x + 180} y={y + 62} textAnchor="middle" fontSize="38" fontWeight="900" fill={ink} fontFamily={mono}>
      {title}
    </text>
    <text x={x + 180} y={y + 106} textAnchor="middle" fontSize="24" fill={muted}>
      {sub}
    </text>
  </g>
);

const StateChart = () => (
  <Layers
    w={1680}
    h={640}
    base={
      <>
        <SNode x={160} y={230} title="sending" sub="轉圈：已上螢幕，等回條" tint="#fbe7b5" />
        <SNode x={1100} y={40} title="sent" sub="勾勾：Server 收到了" tint="#d6ecd9" />
        <SNode x={1100} y={420} title="failed" sub="紅點：可以點重試" tint="#f7d9d6" />
      </>
    }
    layers={[
      <>
        <line x1={520} y1={280} x2={1094} y2={112} stroke={green} strokeWidth="4" />
        {head(1098, 110, Math.atan2(110 - 280, 1098 - 520), green, 18)}
        <text x={800} y={168} textAnchor="middle" fontSize="27" fontWeight="800" fill={green} style={halo}>
          收到 ack，填上 seq
        </text>
      </>,
      <>
        <line x1={520} y1={320} x2={1094} y2={488} stroke={red} strokeWidth="4" />
        {head(1098, 490, Math.atan2(490 - 320, 1098 - 520), red, 18)}
        <text x={800} y={448} textAnchor="middle" fontSize="27" fontWeight="800" fill={red} style={halo}>
          5 秒沒收到 ack
        </text>
      </>,
      <>
        <path d="M 1280 560 C 1280 640, 340 650, 340 378" fill="none" stroke={amber} strokeWidth="4" />
        {head(340, 374, -Math.PI / 2, amber, 18)}
        <text x={800} y={622} textAnchor="middle" fontSize="27" fontWeight="800" fill={amber} style={halo}>
          點紅點重試，回到 sending
        </text>
      </>,
      <>
        <line x1={1280} y1={420} x2={1280} y2={186} stroke={muted} strokeWidth="3" strokeDasharray="10 8" />
        {head(1280, 182, -Math.PI / 2, muted, 16)}
        <text x={1300} y={310} fontSize="24" fontWeight="700" fill={muted}>
          ack 晚到了，也算數
        </text>
      </>,
    ]}
  />
);

// 逐步出現的流程：箭頭和方塊包在同一格
const FlowStep = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', height: '100%' }}>
    <FlowArrow />
    {children}
  </div>
);

// ═════════════ 頁面 ═════════════

const Cover: Page = () => (
  <div style={fill}>
    <TopBar section="封面" />
    <div style={{ position: 'absolute', left: 120, top: 220, width: 1060 }}>
      <div style={{ display: 'flex', gap: 14 }}>
        <Pill tint="#fbe7b5">⏱ 60 min</Pill>
        <Pill tint="#e3dcf5">階段一 · 純 WebSocket</Pill>
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
        樂觀更新 + ACK
      </h1>
      <p style={{ fontSize: 36, color: muted, margin: 0 }}>按下送出就上螢幕，送失敗也不會重複</p>
      <div style={{ display: 'flex', gap: 14, marginTop: 56 }}>
        <Pill tint={panel}>Optimistic UI</Pill>
        <Pill tint={panel}>ACK + seq</Pill>
        <Pill tint={panel}>client_msg_id</Pill>
      </div>
    </div>
    <div style={{ position: 'absolute', right: 160, top: 160 }}>
      <ChatPhone
        w={380}
        h={820}
        msgs={[
          { t: '晚上要吃什麼？', who: 'Bob', seq: 40 },
          { t: '拉麵？', mine: true, st: 'sent', seq: 41 },
          { t: '好啊', who: 'Bob', seq: 42 },
          { t: '那 7 點門口見', mine: true, st: 'sent', seq: 43 },
          { t: '我先去排隊', mine: true, st: 'failed' },
          { t: '到了跟我說', mine: true, st: 'sending' },
        ]}
      />
    </div>
  </div>
);

const Scenario: Page = () => (
  <Shell section="開場" title="PM 又來了">
    <Bubble who="PM" role="PM">
      「網路慢的時候，按了送出要<b style={{ color: 'var(--osd-accent)' }}>等很久</b>才看得到自己的訊息。使用者以為沒送出去，就一直按。」
    </Bubble>
    <Steps>
      <Step>
    <Card style={{ marginTop: 56 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>今天下課前要做到</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Goal n="01">按下送出，訊息馬上出現，旁邊轉圈</Goal>
        <Goal n="02">Server 收到後變勾勾；送不出去變紅點，可以點重試</Goal>
        <Goal n="03">列表順序照 Server 給的號碼排</Goal>
        <Goal n="04">
          <span style={{ color: muted }}>（QA 說他等一下有 bug 要回報……）</span>
        </Goal>
      </div>
    </Card>
      </Step>
    </Steps>
  </Shell>
);

const Recap: Page = () => (
  <BigQuestion tag="上堂的問題" tagColor="#f7d9d6" foot="提示：打開 chat_controller.dart，找找看自己的訊息是在哪一行被加進列表的。">
    自己按了送出，
    <br />
    為什麼要等 2 秒才看到？
  </BigQuestion>
);

const EchoVsAck: Page = () => (
  <Shell section="觀念" title="講師把 Server 切到「ACK 模式」" sub="同一則訊息，兩種 Server 行為。差在 App 什麼時候把訊息畫上去。">
    <div style={{ display: 'flex', gap: 80 }}>
      <div>
        <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>
          第 1～3 堂：回音模式 <span style={{ color: muted, fontWeight: 500, fontSize: 24 }}>Server 把訊息傳回給你</span>
        </div>
        <SeqDiagram
          w={800}
          pad={120}
          lanes={['我的 App', 'Server', '夥伴']}
          items={[
            { kind: 'msg', from: 0, to: 1, label: 'send 晚點見' },
            { kind: 'gap', label: '網路很慢，過了 2 秒……' },
            { kind: 'msg', from: 1, to: 2, label: 'message' },
            { kind: 'msg', from: 1, to: 0, label: 'message（回音）', color: blue },
            { kind: 'note', at: 0, label: '這時候才畫出來', tint: '#f7d9d6' },
          ]}
        />
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>
          第 4 堂起：ACK 模式 <span style={{ color: muted, fontWeight: 500, fontSize: 24 }}>只回一張回條</span>
        </div>
        <SeqDiagram
          w={800}
          pad={120}
          lanes={['我的 App', 'Server', '夥伴']}
          items={[
            { kind: 'note', at: 0, label: '先畫上螢幕，轉圈', tint: '#d6ecd9' },
            { kind: 'msg', from: 0, to: 1, label: 'send 晚點見' },
            { kind: 'gap', label: '網路很慢，過了 2 秒……' },
            { kind: 'msg', from: 1, to: 2, label: 'message' },
            { kind: 'msg', from: 1, to: 0, label: 'ack（帶 seq）', color: green },
            { kind: 'note', at: 0, label: '轉圈變勾勾', tint: '#d6ecd9' },
          ]}
        />
      </div>
    </div>
    <Steps>
      <Step>
    <div style={{ fontSize: 28, color: muted, marginTop: 30 }}>ACK 模式下 Server 不再把你的訊息傳回給你，所以今天不改 App 的話，自己送的訊息會直接消失。</div>
      </Step>
    </Steps>
  </Shell>
);

const Optimistic: Page = () => (
  <Shell section="觀念" title="先畫上去，再等回條" sub="寄 email 也是這樣：按下寄出，寄件備份馬上有，真的寄不出去才跳警告。">
    <div style={{ display: 'flex', gap: 46, alignItems: 'flex-start' }}>
      <div>
        <ChatPhone w={320} h={520} msgs={[{ t: '晚上要吃什麼？', who: 'Bob', seq: 40 }]} empty={<span>（按了送出）<br />畫面沒動靜……</span>} />
        <PhoneCap n="現在" title="等 2 秒才出現" tone={red} w={320}>
          使用者以為沒送出，又按一次
        </PhoneCap>
      </div>
      <div style={{ width: 4, alignSelf: 'stretch', background: line, borderRadius: 4 }} />
      <Steps>
      <Step>
      <div>
        <ChatPhone w={320} h={520} msgs={[{ t: '晚上要吃什麼？', who: 'Bob', seq: 40 }, { t: '拉麵？', mine: true, st: 'sending' }]} />
        <PhoneCap n="0 秒" title="按下就出現，轉圈" w={320}>
          還沒有號碼
        </PhoneCap>
      </div>
      </Step>
      <Step>
      <div>
        <ChatPhone w={320} h={520} msgs={[{ t: '晚上要吃什麼？', who: 'Bob', seq: 40 }, { t: '拉麵？', mine: true, st: 'sent', seq: 41 }]} />
        <PhoneCap n="收到回條" title="變勾勾" tone={green} w={320}>
          拿到 Server 給的 #41
        </PhoneCap>
      </div>
      </Step>
      <Step>
      <div>
        <ChatPhone w={320} h={520} msgs={[{ t: '晚上要吃什麼？', who: 'Bob', seq: 40 }, { t: '拉麵？', mine: true, st: 'failed' }]} />
        <PhoneCap n="5 秒沒回條" title="變紅點" tone={red} w={320}>
          點一下重試
        </PhoneCap>
      </div>
      </Step>
      </Steps>
    </div>
  </Shell>
);

const States: Page = () => (
  <Shell section="觀念" title="一則訊息的三種狀態" sub="自己的訊息才有狀態。別人的訊息是從 Server 來的，一定已經存好了。">
    <StateChart />
  </Shell>
);

const AckSeq: Page = () => (
  <Shell section="觀念" title="回條上寫什麼" sub="兩個號碼：一個 App 自己取，一個 Server 發。">
    <div style={{ display: 'flex', gap: 40 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>App 送出</div>
        <Code size={26}>{`{
  "type": "send",
  "client_msg_id": "7f3a…c21",
  "sender": "Amy", // Server 以連線身分為準
  "text": "拉麵？"
}`}</Code>
      </div>
      <div style={{ flex: 1 }}>
        <Steps>
          <Step>
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Server 回給發送者</div>
        <Code size={26}>{`{
  "type": "ack",
  "client_msg_id": "7f3a…c21",
  "room_id": …,
  "seq": 41,
  "ts": 1763870520000
}`}</Code>
          </Step>
        </Steps>
      </div>
    </div>
    <Steps>
      <Step>
    <div style={{ display: 'flex', gap: 32, marginTop: 36 }}>
      <Point title={<Kw>client_msg_id</Kw>} tag="App 取">
        送出前用 uuid 產生。回條回來時，靠它找到是哪一則。
      </Point>
      <Point title={<Kw>seq</Kw>} tag="Server 發">
        同一個房間裡一路往上加的號碼。列表照它排，不看手機時間。
      </Point>
    </div>
      </Step>
    </Steps>
  </Shell>
);

const Mail: Page = () => (
  <Shell section="觀念" title="寄掛號信的故事" sub="先聽故事，等一下實作會用到。">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 1.2fr' }}>
      <FlowBox title="① 寄出掛號信" sub="郵局給你一個掛號號碼" tint="#fbe7b5" />
      <Steps>
        <Step>
          <FlowStep>
            <FlowBox title="② 對方收到了" sub="但回執在路上弄丟" tint="#d6ecd9" />
          </FlowStep>
        </Step>
        <Step>
          <FlowStep>
            <FlowBox title="③ 你沒收到回執" sub="以為沒寄到" tint="#f7d9d6" />
          </FlowStep>
        </Step>
        <Step>
          <FlowStep>
            <FlowBox title="④ 再寄一次" sub="同樣的內容" tint="#dde9fb" />
          </FlowStep>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26, marginTop: 60 }}>
      <Card>
        <Goal n="Q">對方會收到兩封嗎？</Goal>
      </Card>
      <Card>
        <Goal n="Q">如果郵局想幫對方擋掉重複的那封，要靠什麼認出「這是同一封」？</Goal>
      </Card>
    </div>
      </Step>
    </Steps>
  </Shell>
);

const ImplA: Page = () => (
  <Shell section="實作" title="TODO ① ② ③" sub="檔案：models/message.dart、data/chat_controller.dart">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <Todo n="①" title={<>Message 加三個欄位：<Kw>clientMsgId</Kw>、<Kw>status</Kw>、<Kw>seq</Kw></>}>
        <Hint>seq 在拿到回條之前是 null。狀態列舉已經在 message_status.dart。</Hint>
      </Todo>
      <Todo n="②" title="送出：先插入一筆 sending，再送 JSON">
        <Hint>
          用 <Kw>uuid</Kw> 套件產生 client_msg_id，跟著 JSON 一起送。氣泡已經有三種圖示，把 status 傳進去就好。
        </Hint>
      </Todo>
      <Todo n="③" title={<>收到 <Kw>ack</Kw>：用 client_msg_id 找到那一筆，改成 sent、填上 seq</>}>
        <Hint>列表改成照 seq 排；還沒有 seq 的（剛送出的）放最前面。</Hint>
      </Todo>
    </div>
  </Shell>
);

const ImplB: Page = () => (
  <Shell section="實作" title="TODO ④ ⑤" sub="做完先自己按按看，等一下講師要來搞破壞。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <Todo n="①" title="三個欄位" done />
      <Todo n="②" title="先插入 sending 再送出" done />
      <Todo n="③" title="收到 ack 變 sent" done />
      <Todo n="④" title="送出後 5 秒沒收到 ack，改成 failed">
        <Hint>每一則開一個 Timer，收到 ack 就取消。dispose 時記得全部取消。</Hint>
      </Todo>
      <Todo n="⑤" title={<>點紅點重試：把它改回 sending，再送一次</>}>
        <Hint>
          氣泡的 <Kw>onRetry</Kw> 已經接好，會呼叫 <Kw>retry(m)</Kw>。
        </Hint>
      </Todo>
    </div>
  </Shell>
);

const Broken: Page = () => (
  <Shell section="翻車現場" title="QA：「對方收到兩則一模一樣的訊息。」" sub="講師示範：在聊天室輸入 /fail，Server 照樣存、照樣轉給夥伴，但回條故意弄丟。">
    <SeqDiagram
      lanes={['我的 App', 'Server', '夥伴']}
      items={[
        { kind: 'msg', from: 0, to: 1, label: 'send「/fail 晚點見」' },
        { kind: 'msg', from: 1, to: 2, label: 'message #43' },
        { kind: 'msg', from: 1, to: 0, label: 'ack', lost: true, color: red },
        { kind: 'gap', label: '5 秒過去，App 顯示紅點' },
        { kind: 'note', at: 0, label: '使用者點重試' },
        { kind: 'msg', from: 0, to: 1, label: 'send「/fail 晚點見」（重試）' },
        { kind: 'msg', from: 1, to: 2, label: 'message #44', color: red },
        { kind: 'note', at: 2, label: '同一句出現兩次', tint: '#f7d9d6' },
      ]}
    />
    <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
      <Steps>
        <Step>
          <WhyBox q="Server 為什麼分不出來這是同一則？" />
        </Step>
        <Step>
          <WhyBox q="打開你的 retry() 看看，第二次送出的 JSON 跟第一次差在哪？" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

const Fix: Page = () => (
  <Shell section="修正" title="重試要帶同一個 client_msg_id" sub="Server 有一張去重表：看過的 id 就不再存、不再轉，只把原本那張回條再寄一次。">
    <div style={{ display: 'flex', gap: 50, alignItems: 'flex-start' }}>
      <div style={{ width: 700 }}>
        <Code size={25}>{`// _update：找到這則、改狀態
// _transmit：送 JSON + 開 Timer
void retry(Message msg) {
  // 不要 send(msg.text)
  // 那會產生新的 UUID
  _update(msg.clientMsgId,
    (m) => m.copyWith(
      status: MessageStatus.sending));
  _transmit(msg); // 同一個 id
}`}</Code>
        <div style={{ fontSize: 26, color: muted, marginTop: 20, lineHeight: 1.5 }}>
          同一個請求送幾次，結果都跟送一次一樣。
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <SeqDiagram
          w={930}
          pad={130}
          lanes={['我的 App', 'Server', '夥伴']}
          items={[
            { kind: 'msg', from: 0, to: 1, label: '重試 send（同一個 id）' },
            { kind: 'note', at: 1, label: '這個 id 看過了' },
            { kind: 'msg', from: 1, to: 0, label: 'ack #43（原本那張）', color: green },
            { kind: 'note', at: 0, label: '紅點變勾勾', tint: '#d6ecd9' },
            { kind: 'note', at: 2, label: '還是只有一則', tint: '#d6ecd9' },
          ]}
        />
      </div>
    </div>
  </Shell>
);

const Acceptance: Page = () => (
  <Shell section="驗收" title="自己檢查，再給夥伴看" sub="兩支手機都要開。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <Check>
        輸入 <Kw>/delay</Kw>：訊息馬上出現在畫面上（轉圈），大約 3 秒後變勾勾
      </Check>
      <Check>
        輸入 <Kw>/fail</Kw>：5 秒後變紅點
      </Check>
      <Check>紅點連點好幾次重試，夥伴那邊只出現一則</Check>
      <Check>
        每則自己的訊息都顯示 Server 給的號碼（<Kw>#43</Kw> 這種），列表照號碼排
      </Check>
      <Check>按 AppBar 的離開鈕回到名字頁，再進來：沒有殘留的 Timer 把舊訊息改成紅點</Check>
    </div>
  </Shell>
);

const Feynman: Page = () => (
  <Shell section="費曼檢核" title="不看螢幕，講給隔壁聽" sub="兩人一組，一人一分鐘。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Card>
        <Goal n="Q1">訊息還沒送到 Server 就先畫上去，萬一沒送成功怎麼辦？</Goal>
      </Card>
      <Card>
        <Goal n="Q2">client_msg_id 跟 seq 各是誰給的？各拿來做什麼？</Goal>
      </Card>
      <Card>
        <Goal n="Q3">重試為什麼一定要沿用同一個 client_msg_id？</Goal>
      </Card>
    </div>
  </Shell>
);

const Think: Page = () => (
  <Shell section="思考分享" title="兩人一組，想 3 分鐘" sub="想完抽兩三組，各講一分鐘。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Card>
        <Goal n="Q4">使用者把手機時間調快一小時，聊天室的訊息順序會亂掉嗎？</Goal>
      </Card>
      <Card>
        <Goal n="Q5">列表裡有一萬則訊息，收到一張回條，怎麼很快找到是哪一則？</Goal>
      </Card>
    </div>
  </Shell>
);

const Hook: Page = () => (
  <div style={fill}>
    <TopBar section="下集預告" />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 180 }}>
      <Pill tint="#f7d9d6">把 App 滑掉，再打開</Pill>
      <h2 style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.3, margin: '32px 0 0' }}>
        剛剛聊的，
        <br />
        怎麼全部不見了？
      </h2>
      <Steps>
        <Step>
      <div style={{ display: 'flex', gap: 32, marginTop: 56 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 22, color: muted }}>能力演進表第二列</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>
            殺掉 App 重開 <span style={{ color: red }}>✗ 全部不見</span>
          </div>
        </Card>
        <Card style={{ flex: 1, background: '#fdf0e3' }}>
          <div style={{ fontSize: 22, color: muted }}>終於要打掉第一個 ✗</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>下一堂：本地資料庫</div>
        </Card>
      </div>
        </Step>
      </Steps>
    </div>
  </div>
);

const Evolution: Page = () => (
  <Shell section="能力演進表" title="純 WebSocket 的最後一堂" sub="這堂還是不打掉 ✗。今天把「送出」做紮實，下一堂才開始加資料庫。">
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
      <ColHead focus>第 1～4 堂 純 WS</ColHead>
      <ColHead>第 5 堂 +本地 DB</ColHead>
      <ColHead>第 6 堂 +歷史 API</ColHead>
      <ColHead>第 7 堂 +補洞</ColHead>
      <ColHead>第 8～9 堂</ColHead>

      <RowHead>剛進聊天室</RowHead>
      <Cell state="no" focus>空的，只看得到連上之後的</Cell>
      <Cell state="partial">看得到自己收過的</Cell>
      <Cell state="yes">先載最新一頁，往上滑再載</Cell>
      <Cell state="yes" />
      <Cell state="yes">未讀多就跳到第一則未讀</Cell>

      <RowHead>殺掉 App 重開</RowHead>
      <Cell state="no" focus>全部不見</Cell>
      <Cell state="yes">秒開，不白屏</Cell>
      <Cell state="yes" />
      <Cell state="yes" />
      <Cell state="yes" />

      <RowHead>斷線時別人說的話</RowHead>
      <Cell state="no" focus>收不到</Cell>
      <Cell state="no">收不到</Cell>
      <Cell state="no">收不到；本地留下斷層</Cell>
      <Cell state="yes">重連後自動補齊</Cell>
      <Cell state="yes" />

      <RowHead>新加入的人看舊對話</RowHead>
      <Cell state="no" focus>看不到</Cell>
      <Cell state="no">看不到</Cell>
      <Cell state="yes">看得到</Cell>
      <Cell state="yes" />
      <Cell state="yes" />

      <RowHead>有好幾個聊天室</RowHead>
      <Cell state="no" focus>只能等講師分房</Cell>
      <Cell state="no" />
      <Cell state="no" />
      <Cell state="no" />
      <Cell state="yes">房間列表 + 未讀數</Cell>
    </div>
  </Shell>
);

// ═════════════ 講稿 ═════════════

export const notes: (string | undefined)[] = [
  // 1 Cover
  `開場前儀表板狀態（課前對一次）
□ 行為等級：回音（開場示範用，沿用第 3 堂）；講到 EchoVsAck 頁（第 5 頁）才切「ACK」
□ 全域延遲：2000 ms（第 3 堂結尾設的；若下課關掉了，開場前設回 2000）；ImplA 頁實作開始前歸零
□ 分房：兩兩一組（沿用第 3 堂；翻車示範和驗收第三項要夥伴在同一間）
□ 其他：無

【0:00】
上一堂結尾，全域延遲一開，自己的訊息要等 2 秒才出現。今天就來解決這件事。講師這時候還保持全域延遲 2000 ms，開場示範要用它。
做法的名字叫 Optimistic UI，樂觀更新：先假設會成功，馬上畫上去，之後再根據 Server 的回條修正。
右邊這支手機就是今天的成品：勾勾是 Server 收到了，轉圈是還在等，紅點是送失敗、可以點重試。

術語
・Optimistic UI（樂觀更新）`,

  // 2 Scenario
  `【0–2 分】
用 PM 的口氣唸。重點是後半句：「使用者以為沒送出去，就一直按。」
畫面沒回應，使用者就會重複操作。這不只是體驗差，等一下會看到它還會製造重複訊息。
今天的做法改善的是 Perceived Latency，體感延遲：網路一樣慢，但使用者覺得快了。
（→）今天的目標出來。第四個目標先賣關子，QA 會在中途出現。

術語
・Perceived Latency（體感延遲）：實際上網路一樣慢，但使用者「感覺」快不快。樂觀更新改善的就是 Perceived Latency，不是真的把網路變快。

可能被問到
問：樂觀更新是不是在騙使用者？
答：算是先講好聽的，但有條件：成功率要高，而且失敗時一定要讓使用者看得到、能處理。聊天訊息成功率很高，失敗了有紅點，所以適合。轉帳、下單這種失敗代價高的操作，就不該先顯示成功。`,

  // 3 Evolution
  `【2–3 分】
這是純 WebSocket 的最後一堂。表上的 ✗ 今天還是一個都不會少。
今天做的是「送出」這件事的可靠度：送出去有沒有到、到了幾次。下一堂開始才加資料庫，打掉第一個 ✗。`,

  // 4 Recap
  `【3–5 分】回顧提問
問全班：「自己按了送出，為什麼要等 2 秒才看到？」
（→）想不出來就給提示：打開 chat_controller.dart，找自己的訊息是在哪一行加進列表的。
讓學員回想第 1～3 堂的寫法：send 只是送出 JSON，畫面上的訊息全部來自 Server 傳回來的 message，包括自己的。Server 慢 2 秒，自己的訊息就慢 2 秒。

參考答案：App 是等 Server 的回音（echo）才把自己的訊息加進列表。中間只要慢，畫面就卡著。`,

  // 5 EchoVsAck
  `【5–8 分】
全域延遲還保持 2000 ms（第 3 堂結尾設的；若下課關掉了，開場前就要設回 2000），圖上「過了 2 秒」就是它。
左邊是我們一直以來的回音模式，一步一步按：
（→）我的 App 把「晚點見」送給 Server。
（→）網路很慢，過了 2 秒。
（→）Server 把 message 轉給夥伴。
（→）Server 也把同一則傳回給我，這就是回音。
（→）我的 App 收到回音，這時候才把訊息畫出來。
現在講師在儀表板把 Server 切到 ACK 模式。ACK 是 Acknowledgement，確認回條的意思。Server 不再把訊息傳回給發送者，只回一張小小的 ack。看右邊：
（→）我的 App 按下去，先把訊息畫上螢幕，旁邊轉圈。
（→）App 再把 send 送給 Server。
（→）一樣慢了 2 秒。
（→）Server 把 message 轉給夥伴。
（→）Server 回一張 ack 給我，上面帶著 seq，意思是「我收到了，這是你的號碼」。
（→）我的 App 收到 ack，轉圈換成勾勾。
（→）提醒學員：切到 ACK 模式後，還沒改的 App 會發現自己送的訊息直接不見，因為回音沒了。這是故意的，逼大家今天一定要改。

術語
・Echo（回音）
・ACK, Acknowledgement（確認回條）

可能被問到
問：為什麼不繼續用回音就好，收到回音再把轉圈換掉？
答：也可以，有些系統就是這樣。但回音要把整則訊息再傳一次，訊息大（例如帶圖片資訊）就浪費流量；ack 只帶 id 和號碼。而且 ack 是「回給你一個人的」，語意比較清楚，Server 也可以在 ack 裡放錯誤原因。

問：WhatsApp 的一個勾、兩個勾是同一件事嗎？
答：一個勾就是我們今天的 ack，代表 Server 收到。兩個勾是送到對方手機，藍勾是對方已讀，這兩個要再多一種回條，第 9 堂做已讀時會碰到。`,

  // 6 Optimistic
  `【8–11 分】
四支手機從左看。最左是現在：按了送出，畫面兩秒沒動靜，使用者以為沒送出，又按一次。
右邊三支是今天的版本，一支一支出來。（→）0 秒就出現，旁邊轉圈，還沒有號碼；（→）收到回條，變勾勾，拿到 #41；（→）如果 5 秒都沒回條，變紅點，點一下重試。
這就是 Optimistic UI：先假設會成功，馬上給使用者回饋，Server 的結果回來再修正畫面。寄 email 的寄件備份就是同一招。
失敗時要不要把畫面改回去？那叫 Rollback，回滾。按讚可以退回去，聊天訊息不刪，改成紅點讓使用者決定。
5 秒這個數字叫 Timeout，逾時。太短的話網路稍微慢一點就誤判失敗，太長的話使用者等很久才知道要重試。

術語
・Optimistic UI（樂觀更新）
・Timeout（逾時）
・Rollback（回滾）：樂觀更新失敗時把畫面改回去。聊天不刪訊息，改成紅點讓使用者決定。

可能被問到
問：失敗時為什麼不直接把訊息從畫面上刪掉？
答：那種做法叫 Rollback，適合按讚這種小操作，讚數退回去就好。聊天訊息是使用者打的字，直接消失會很困惑，也可能要重打。留著紅點讓他自己重試，是比較常見的做法。

問：Flutter 有沒有現成的樂觀更新工具？
答：沒有內建的。Riverpod、Bloc 這些狀態管理都可以做，原理一樣：先更新本地狀態，再根據結果修正。React 生態系有 useOptimistic 這種 hook，概念相同。`,

  // 7 States
  `【11–13 分】
把剛剛的三種樣子畫成 State Machine，狀態機。這個詞第 2 堂畫連線狀態時講過。
sending：已經畫上去，等回條。箭頭一條一條按：
（→）Server 的 ack 送到 App，就 Transition 到 sent，同時填上 seq。
（→）5 秒都沒收到 Server 的 ack，就到 failed。
（→）使用者點紅點，回到 sending，App 再送一次給 Server。
（→）注意虛線那條：ack 晚到了怎麼辦？例如第 6 秒才回來，這時候已經是紅點了。完成版的做法是照樣改成 sent，因為 Server 確實收到了。反過來，如果 Timer 晚觸發時訊息已經是 sent，不能把它改回 failed。ack 和 Timer 誰先到不一定，這種情況叫 Race Condition，競態條件，寫的時候兩種順序都要想過。
別人的訊息沒有狀態，因為是從 Server 來的，一定已經存好了。

術語
・State Machine（狀態機）
・Transition（狀態轉換）
・Race Condition（競態條件）：兩件事誰先發生不一定，結果就跟著不一樣。ack 和 Timer 搶先後，就是一個小小的 Race Condition。

可能被問到
問：為什麼不用一個 bool isSent 就好？
答：因為有三種狀態，兩個 bool（isSent、isFailed）會出現「又成功又失敗」這種不合理的組合。用 enum 讓不可能的狀態寫不出來。

問：要不要再加一個「已送到對方」的狀態？
答：可以，那是 delivered。要 Server 在對方收到後再推一個事件給你。這門課不做，但狀態機多一格、多一條轉換而已。`,

  // 8 AckSeq
  `【13–16 分】
回條上有兩個號碼，誰給的要分清楚。左邊是 App 送給 Server 的 JSON。
client_msg_id 是 App 送出前自己產生的 UUID。UUID 是 Universally Unique Identifier，通用唯一識別碼，一串隨機產生、幾乎不可能撞號的 ID。回條回來的時候，App 就靠這個 id 找到是哪一則。
（→）右邊出來：Server 回給發送者的 ack，帶著同一個 client_msg_id 和新的 seq。
（→）下面兩張卡總結。seq 是 Server 發的，房間裡每存一則就加一，一路往上，不會倒退。這種一路往上加的號碼叫 Monotonic Sequence，單調遞增序號。列表順序只看它。
為什麼 seq 要 Server 發？因為只有 Server 看得到所有人的訊息，只有它能決定誰先誰後。每支手機自己取號一定會撞。
ts 是時間，只拿來顯示幾點幾分，不拿來排序。原因留到最後的思考題。
ack 裡的 room_id 今天用不到，印 log 會看到，略過就好。送出 JSON 裡的 sender 只是參考，Server 一律以這條連線登入的名字為準，改 sender 冒充不了別人。

術語
・UUID, Universally Unique Identifier（通用唯一識別碼）
・client_msg_id
・seq / Monotonic Sequence（單調遞增序號）

可能被問到
問：UUID 真的不會撞嗎？
答：常用的 v4 有 122 個隨機位元，一般 App 的量撞號機率可以當成零。真的在意，Server 存的時候可以把 client_msg_id 加唯一索引，撞了就拒絕。

問：為什麼不用自增 ID 當 client_msg_id，比如 1、2、3？
答：App 重開會從 1 開始，兩支手機也會各自從 1 開始，Server 就分不出來。UUID 不用協調就能保證唯一。

問：seq 跟資料庫的自增主鍵一樣嗎？
答：概念像，但這裡的 seq 是「每個房間各自」從 1 開始，不是全域的。第 6、7 堂的分頁和補洞都會用 seq 當游標，所以它要連續、在房間內唯一。`,

  // 9 Mail
  `【16–20 分】掛號信的故事
照著四格講，一格一格出來：寄出掛號信、（→）對方收到但回執弄丟、（→）你以為沒寄到、（→）再寄一次。
（→）問全班兩題，給半分鐘。

參考答案
Q：一般情況會收到兩封，因為郵局只當它是另一封新的信。
Q：靠掛號號碼。如果你補寄時寫上「這是剛剛那封，號碼 A123」，郵局一查發現 A123 已經送到了，就不用再送，只要把回執補給你。
這個「做一次跟做好幾次結果都一樣」的性質，叫 Idempotency，冪等。那個用來認出同一件事的號碼叫 Idempotency Key，冪等鍵。
先不要點破跟程式的關係，等一下翻車時讓學員自己連起來。

術語
・Idempotency（冪等）
・Idempotency Key（冪等鍵）

可能被問到
問：HTTP 方法哪些是冪等的？
答：GET、PUT、DELETE 照規格是冪等的，POST 不是。所以付款這種 POST，Stripe 這類金流 API 會要你在 header 帶一個 Idempotency-Key，重送時 Server 認得出來。

問：冪等跟「不會出錯」一樣嗎？
答：不一樣。冪等只保證「重複做不會多出副作用」，第一次本身還是可能失敗。它讓「失敗就重試」這件事變得安全。`,

  // 10 ImplA
  `【20–28 分】實作開始
講師先在儀表板把全域延遲歸零。不歸零的話，學員等一下用 /delay（Server 再晚 3 秒回 ack）會變成 2 + 3 ≈ 5 秒，剛好碰到 5 秒逾時，轉圈可能先變紅點。
① Message 加三個欄位。seq 用 int?，送出前是 null。Message 是 Immutable，不可變的，欄位都是 final，所以要加一個 copyWith，改狀態時產生新的一份。
② send 裡先用 uuid 產生 client_msg_id，建立一筆 status 是 sending 的 Message，插到列表最前面，再送 JSON。這就是 Optimistic UI 那一步：不等 Server，先上螢幕。
③ 收到 type 是 ack 的事件，用 client_msg_id 找到那一筆，改成 sent，填上 seq。
排序：照 seq 由大到小，seq 是 null 的放最前面，因為那是自己剛送出、還沒拿到號碼的。
另外提醒：收到別人的 message 時也要檢查一下 client_msg_id 是不是已經在列表裡，避免同一則加兩次。

術語
・copyWith：Dart 常見的寫法，複製一份物件、只改其中幾個欄位。Message 是不可變的，要改狀態就用 copyWith 產生新的一份。
・Immutable（不可變）

可能被問到
問：為什麼 Message 要做成不可變，直接改 status 不是比較簡單？
答：Immutable 的物件比較好除錯，也比較好比對新舊。Flutter 重建畫面時，舊的那份不會被偷偷改掉。第 5 堂換成資料庫後，資料也是一筆一筆換掉，不是原地改。

問：找那一筆用 indexWhere 可以嗎？
答：今天可以。訊息很多時它要從頭找到尾，最後的思考題會講怎麼加速。`,

  // 11 ImplB
  `【28–35 分】
④ 每送出一則就開一個 Timer，5 秒後還沒收到 ack，就改成 failed。用一個 Map，key 是 client_msg_id，收到 ack 時取消對應的 Timer。dispose 時把 Map 裡的 Timer 全部取消，不然離開頁面後 Timer 還會去改已經不存在的列表。
⑤ 點紅點重試：把它改回 sending，再送一次。這裡故意不給更多提示，大部分人會很自然地寫成「拿 text 再呼叫一次 send」。讓他們這樣寫，下一頁就要用到這個錯。
做完的人先自己用 /delay 測一下。

術語
・Timer（計時器）
・Retry（重試）

可能被問到
問：一則訊息一個 Timer，一次送很多則會不會太多？
答：Timer 很便宜，幾十個沒問題。真的很多，可以只開一個定時器，每秒掃一次「送出超過 5 秒還是 sending 的」。

問：斷線的時候按送出會怎樣？
答：今天的版本會在 5 秒後變紅點，使用者手動重試。網路恢復後自動幫你補送，叫 outbox，放在第 7 堂。`,

  // 12 Broken
  `【35–42 分】翻車現場
用 QA 的口氣唸標題。然後講師示範：兩人一組，一人在聊天室輸入「/fail 晚點見」。
/fail 是 Server 的搞破壞指令：照樣存、照樣轉給夥伴，但回條故意弄丟。對應掛號信故事的「回執在路上弄丟」。
圖上一步一步按：
（→）我的 App 把「/fail 晚點見」送給 Server。
（→）Server 存起來，把 message #43 轉給夥伴。
（→）Server 回給我的 ack 在路上弄丟了。
（→）5 秒過去，我的 App 顯示紅點。
（→）使用者點重試。
（→）我的 App 再把同一句送給 Server。
（→）Server 當成新的一則，存成 #44，又轉給夥伴。
（→）夥伴那邊同一句出現兩次，這叫 Duplicate Message，重複訊息。多點幾次，就多幾則。
我們的策略是沒收到回條就重送，這叫 At-least-once Delivery，至少送達一次：保證送得到，代價是可能送不只一次。
（→）先問：Server 為什麼分不出來？讓學員自己找原因。
（→）卡住就給第二個提示：打開 retry 看看，第二次送出的 JSON 跟第一次差在哪。
注意：因為文字開頭還是 /fail，每次重試的回條也都會被弄丟，所以紅點會一直在。這反而讓重複更明顯。

參考答案：retry 呼叫了 send(text)，每次都產生新的 UUID。對 Server 來說，這是一則全新的訊息，所以又存一次、又轉一次。Server 有去重的能力，但它只認 client_msg_id。id 不一樣，它就分不出來。
回到掛號信：你補寄時沒寫原本的掛號號碼，郵局只能當成新的信。

術語
・Duplicate Message（重複訊息）
・At-least-once Delivery（至少送達一次）：只要沒收到回條就重送，保證送得到，但可能送不只一次。我們的重試就是 At-least-once Delivery。

可能被問到
問：那 Server 能不能用「同一個人、同一句話、時間很近」來判斷重複？
答：不可靠。使用者可能真的連傳兩次「好」。只有 App 給的 id 能分清楚「這是重送」還是「這是新的一則」。

問：有沒有 exactly-once，剛好送一次？
答：網路上很難真的保證剛好送一次。業界的做法就是今天這套：At-least-once Delivery 加上接收端去重，效果上等於剛好一次。這常被叫做 effectively-once。`,

  // 13 Fix
  `【42–48 分】修正
修法只有一行的觀念：重試沿用原本那則的 client_msg_id，不要產生新的。
完成版把送 JSON 和開 Timer 抽成 _transmit，send 和 retry 都呼叫它；retry 傳進去的是原本那個 Message，所以 id 不變。_update 是用 client_msg_id 找到那一則、用 copyWith 改狀態再刷新列表。學員多半把送 JSON 和開 Timer 直接寫在 send 裡，照抄會編譯失敗，提醒他們先把那段抽成方法，或照註解自己展開。
Server 端有一張 Deduplication Table，去重表：記著看過的 client_msg_id。同一個 id 再來，就不存、不轉，只把原本那張 ack 再回一次，號碼還是 #43。
右邊的圖一步一步按：
（→）我的 App 重試，送出同一個 id 給 Server。
（→）Server 查去重表：這個 id 看過了。
（→）Server 把原本那張 ack #43 再回給我。
（→）我的 App 收到，紅點變勾勾。
（→）夥伴那邊始終只有一則。這就是 Idempotency，冪等：同一個請求送幾次，結果都跟送一次一樣。

術語
・Idempotency（冪等）
・Deduplication（去重）

可能被問到
問：Server 的去重表要存多久？
答：至少要比 Client 可能重試的時間長。我們的 Server 跟訊息一起存著，所以一直有效。訊息量很大的系統會設保存期限，例如幾天。

問：去重表放記憶體可以嗎？
答：單台 Server 可以，但重啟就沒了，多台 Server 也不共用。正式環境常用資料庫的唯一索引，或 Redis 這類共用的快取。

問：Telegram 也是這樣做的嗎？
答：概念一樣。Telegram 送訊息的 API 有一個 random_id 參數，由 Client 產生，用來避免重複送出。`,

  // 14 Acceptance
  `【48–52 分】驗收
/delay 讓 Server 晚 3 秒才回 ack，看得到轉圈變勾勾。/fail 測紅點和重試。
第三項要夥伴一起看，連點好幾次重試，夥伴那邊只能有一則。
最後一項是看 dispose：輸入 /fail 後 5 秒內按 AppBar 的離開鈕回到名字頁，再進來。dispose 有把 Timer 全部取消，就不應該有舊的 Timer 跳出來改東西；沒取消的話，5 秒後舊的 Timer 還會去改已經關掉的列表，debug console 可能會跳錯。`,

  // 15 Feynman
  `【52–54 分】費曼檢核
兩兩互講，一人一分鐘。

參考答案
Q1：先畫上去是 Optimistic UI。沒收到 ack 就計時，5 秒後改成紅點，讓使用者點重試。失敗是看得到、可以處理的。
Q2：client_msg_id 是 App 送出前自己產生的 UUID，用來對上回條，也用來讓 Server 去重。seq 是 Server 存訊息時發的號碼，房間內一路遞增，用來排序。
Q3：Server 靠 client_msg_id 認出重送。換一個新的 id，Server 會當成新訊息，夥伴就會看到兩則。`,

  // 16 Think
  `【54–59 分】思考分享
先出題，兩人一組想 3 分鐘，抽兩三組各講一分鐘，最後講師補充。

參考答案
Q4：如果用手機時間（ts）排序就會亂。調快一小時，他之後送的每一則都會排在最下面，甚至排在別人「之後才講」的話後面。所以排序只信 Server 發的 seq。ts 只拿來顯示，而且最好也用 Server 回的時間。這就是 Clock Skew，時鐘偏差：每台裝置的時間都不一樣準，不能拿來決定順序。
Q5：indexWhere 是從頭找到尾，一萬則最壞要比對一萬次，這是 O(n)。可以另外維護一個 Map，key 是 client_msg_id，value 是那則訊息，查找就是 O(1)。要注意 Map 裡不要存 index，因為列表最前面一插入新訊息，所有 index 都會變。
補充一個實務觀察：等回條的通常是自己剛送出的幾則，都在列表最前面，所以從前面找其實很快就找到。但最壞情況還是 O(n)，面試要講得出 Map 的做法。

術語
・Clock Skew（時鐘偏差）
・O(n) / O(1)（時間複雜度）

可能被問到
問：有沒有不靠 Server 也能排出順序的方法？
答：分散式系統有 Lamport Clock、Vector Clock 這類邏輯時鐘，可以排出「誰先發生」。但聊天室有中央 Server，直接讓它發號碼最簡單也最可靠。

問：第 5 堂換成資料庫後，還需要 Map 嗎？
答：資料庫可以在 client_msg_id 上建索引，查詢本身就很快。Map 是在記憶體裡做同一件事。`,

  // 17 Hook
  `【59–60 分】結尾鉤子
請大家把 App 從背景滑掉，再打開。剛剛聊的全部不見了。
（→）兩張卡出來，指著能力演進表第二列：殺掉 App 重開，全部不見。問：「LINE 重開為什麼都還在？」不給答案，下一堂開始加資料庫。

講師自己複習（面試關鍵字，不用講給學員）
・Optimistic UI：先假設成功、馬上更新畫面，再依 Server 結果修正；失敗要看得到、能處理。
・ACK：Server 給發送者的確認回條，帶 client_msg_id 和 seq。
・State Machine：sending → sent / failed，failed 可重試回到 sending；晚到的 ack 仍算數。
・Idempotency (client_msg_id)：Client 產生唯一 id，重試沿用；Server 用去重表擋重複，At-least-once 加去重等於 effectively-once。`,
];

export const meta: SlideMeta = {
  title: '第 04 堂｜樂觀更新 + ACK + 冪等',
  createdAt: '2026-11-23T08:00:00.000Z',
};

export default [
  Cover,
  Scenario,
  Evolution,
  Recap,
  EchoVsAck,
  Optimistic,
  States,
  AckSeq,
  Mail,
  ImplA,
  ImplB,
  Broken,
  Fix,
  Acceptance,
  Feynman,
  Think,
  Hook,
] satisfies Page[];
