import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 第 2 堂：心跳 + 自動重連（等角圖解版）
// 學員看得到的頁面只放題目；參考答案和講稿都在 `notes`。
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
      <span>即時聊天室 · 第 2 堂</span>
      <span style={{ color: muted, fontWeight: 500 }}>/ {section}</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#d6ecd9">Lesson 02</Pill>
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

// ═════════════ 共用：等角場景 ═════════════

type Mode = 'short' | 'long' | 'sse' | 'ws' | 'zombie' | 'hero' | 'herd' | 'jitter';

const Cube = ({ cx, cy, s, hot, label }: { cx: number; cy: number; s: number; hot?: boolean; label: string }) => {
  const w = s * 0.866;
  const c = hot
    ? { top: '#f7d9d6', left: '#eebab5', right: '#e3a29c', stroke: '#c0645c' }
    : { top: '#dde9fb', left: '#bed2f3', right: '#a7c1ec', stroke: '#7d9dd5' };
  return (
    <g>
      {hot && <ellipse cx={cx} cy={cy + s * 0.55} rx={s * 1.25} ry={s * 0.7} fill="#e9877f" opacity="0.25" />}
      <polygon
        points={`${cx},${cy - s} ${cx + w},${cy - s / 2} ${cx},${cy} ${cx - w},${cy - s / 2}`}
        fill={c.top}
        stroke={c.stroke}
        strokeWidth="3"
      />
      <polygon
        points={`${cx - w},${cy - s / 2} ${cx},${cy} ${cx},${cy + s} ${cx - w},${cy + s / 2}`}
        fill={c.left}
        stroke={c.stroke}
        strokeWidth="3"
      />
      <polygon
        points={`${cx},${cy} ${cx + w},${cy - s / 2} ${cx + w},${cy + s / 2} ${cx},${cy + s}`}
        fill={c.right}
        stroke={c.stroke}
        strokeWidth="3"
      />
      <rect x={cx - 22} y={cy - s / 2 - 22} width="44" height="16" rx="3" fill="none" stroke={ink} strokeWidth="3" />
      <rect x={cx - 22} y={cy - s / 2} width="44" height="16" rx="3" fill="none" stroke={ink} strokeWidth="3" />
      <text x={cx} y={cy + s * 0.42} textAnchor="middle" fontSize="30" fontWeight="800" fill={ink} fontFamily={mono}>
        {label}
      </text>
    </g>
  );
};

const LoadBadge = ({ x, y, pct }: { x: number; y: number; pct: number }) => {
  const color = pct >= 70 ? red : pct >= 40 ? amber : grey;
  return (
    <g>
      <rect x={x} y={y} width="200" height="44" rx="22" fill={panel} stroke={ink} strokeWidth="2.5" />
      <circle cx={x + 24} cy={y + 22} r="8" fill={ink} />
      <rect x={x + 42} y={y + 17} width="90" height="10" rx="5" fill="#e6ded0" />
      <rect x={x + 42} y={y + 17} width={0.9 * pct} height="10" rx="5" fill={color} />
      <text x={x + 182} y={y + 30} textAnchor="end" fontSize="20" fontWeight="800" fill={ink} fontFamily={mono}>
        {pct}%
      </text>
    </g>
  );
};

const Person = ({ x, y, color }: { x: number; y: number; color: string }) => (
  <g>
    <rect x={x - 12} y={y - 8} width="24" height="36" rx="12" fill={color} stroke={ink} strokeWidth="2.5" />
    <circle cx={x} cy={y - 20} r="11" fill="#fff" stroke={ink} strokeWidth="2.5" />
  </g>
);

const Platform = ({ cx, cy }: { cx: number; cy: number }) => {
  const a = 250;
  const b = 125;
  const t = 22;
  return (
    <g>
      <polygon
        points={`${cx - a},${cy} ${cx},${cy + b} ${cx},${cy + b + t} ${cx - a},${cy + t}`}
        fill="#e7dfd1"
        stroke={ink}
        strokeWidth="2.5"
      />
      <polygon
        points={`${cx},${cy + b} ${cx + a},${cy} ${cx + a},${cy + t} ${cx},${cy + b + t}`}
        fill="#ddd3c3"
        stroke={ink}
        strokeWidth="2.5"
      />
      <polygon
        points={`${cx - a},${cy} ${cx},${cy - b} ${cx + a},${cy} ${cx},${cy + b}`}
        fill="#f8f4ec"
        stroke={ink}
        strokeWidth="2.5"
      />
      <Person x={cx - 70} y={cy + 10} color="#c9e3cf" />
      <Person x={cx - 10} y={cy - 18} color="#f2c9a0" />
      <Person x={cx + 50} y={cy - 40} color="#f2c9a0" />
      <Person x={cx + 90} y={cy + 4} color="#f5b98a" />
    </g>
  );
};

const UP = 'M 560 250 L 1150 150';
const DOWN = 'M 1150 200 L 560 300';
const PIPE_UP = 'M 560 275 L 1150 175';
const PIPE_DOWN = 'M 1150 175 L 560 275';

const Dot = ({
  path,
  dur,
  begin,
  color,
  hold,
}: {
  path: string;
  dur: number;
  begin: number;
  color: string;
  hold?: boolean;
}) => (
  <circle r="11" fill={color} stroke={ink} strokeWidth="2.5">
    {hold ? (
      <animateMotion
        path={path}
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        keyPoints="0;1;1"
        keyTimes="0;0.35;1"
        calcMode="linear"
      />
    ) : (
      <animateMotion path={path} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
    )}
  </circle>
);

const PathLabel = ({ x, y, children, color = muted }: { x: number; y: number; children: string; color?: string }) => (
  <text x={x} y={y} fontSize="22" fontWeight="700" fill={color} textAnchor="middle">
    {children}
  </text>
);

const Badge = ({ x, y, w, text, color }: { x: number; y: number; w: number; text: string; color: string }) => (
  <g>
    <rect x={x} y={y} width={w} height="44" rx="22" fill={panel} stroke={color} strokeWidth="2.5" />
    <text x={x + w / 2} y={y + 30} textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>
      {text}
    </text>
  </g>
);

const Scene = ({ mode, height = 470 }: { mode: Mode; height?: number }) => {
  const load = mode === 'herd' ? 100 : mode === 'short' ? 85 : mode === 'long' ? 50 : mode === 'jitter' ? 35 : 15;
  const pipe = mode === 'ws' || mode === 'hero' || mode === 'zombie';
  return (
    <svg width="1680" height={height} viewBox={`0 0 1680 ${height}`} style={{ display: 'block' }}>
      <defs>
        <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="#e2d9c9" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="1680" height={height} fill="url(#dots)" />

      {pipe && (
        <line
          x1="560"
          y1="275"
          x2="1150"
          y2="175"
          stroke={green}
          strokeWidth="34"
          strokeLinecap="round"
          opacity={mode === 'zombie' ? 0.08 : 0.18}
        />
      )}
      {!pipe && (
        <>
          <path d={UP} stroke={line} strokeWidth="3" strokeDasharray="8 10" fill="none" />
          <path d={DOWN} stroke={line} strokeWidth="3" strokeDasharray="8 10" fill="none" />
        </>
      )}

      <Platform cx={380} cy={300} />
      <Cube cx={1270} cy={190} s={130} hot={mode === 'short' || mode === 'herd'} label="Server" />
      {mode !== 'hero' && mode !== 'zombie' && <LoadBadge x={1170} y={14} pct={load} />}

      {mode === 'short' && (
        <>
          <PathLabel x={830} y={168}>GET /messages，200 人一起打</PathLabel>
          <PathLabel x={880} y={300}>幾乎都回「沒有」</PathLabel>
          <Dot path={UP} dur={1.2} begin={0} color="#fff" />
          <Dot path={UP} dur={1.2} begin={0.3} color="#fff" />
          <Dot path={UP} dur={1.2} begin={0.6} color="#fff" />
          <Dot path={UP} dur={1.2} begin={0.9} color="#fff" />
          <Dot path={DOWN} dur={1.2} begin={0.15} color={grey} />
          <Dot path={DOWN} dur={1.2} begin={0.45} color={grey} />
          <Dot path={DOWN} dur={1.2} begin={0.75} color={grey} />
          <Dot path={DOWN} dur={2.4} begin={1.05} color="var(--osd-accent)" />
        </>
      )}
      {mode === 'long' && (
        <>
          <PathLabel x={830} y={168}>GET /messages，Server 先不回</PathLabel>
          <PathLabel x={880} y={300}>有訊息才回，App 收到再打一次</PathLabel>
          <Dot path={UP} dur={3} begin={0} color="#fff" hold />
          <Dot path={UP} dur={3} begin={1.5} color="#fff" hold />
          <Dot path={DOWN} dur={1.5} begin={0.9} color="var(--osd-accent)" />
        </>
      )}
      {mode === 'sse' && (
        <>
          <PathLabel x={830} y={168}>GET /events，只打這一次</PathLabel>
          <PathLabel x={880} y={300}>之後 Server 一直往下推</PathLabel>
          <Dot path={DOWN} dur={1.6} begin={0} color="var(--osd-accent)" />
          <Dot path={DOWN} dur={1.6} begin={0.55} color="var(--osd-accent)" />
          <Dot path={DOWN} dur={1.6} begin={1.1} color="var(--osd-accent)" />
        </>
      )}
      {(mode === 'ws' || mode === 'hero') && (
        <>
          {mode === 'ws' && (
            <PathLabel x={830} y={168} color={green}>
              同一條連線，兩邊都能送
            </PathLabel>
          )}
          <Dot path={PIPE_UP} dur={1.4} begin={0} color="#fff" />
          <Dot path={PIPE_UP} dur={1.4} begin={0.9} color="#fff" />
          <Dot path={PIPE_DOWN} dur={1.4} begin={0.4} color="var(--osd-accent)" />
          <Dot path={PIPE_DOWN} dur={1.4} begin={1.1} color="var(--osd-accent)" />
        </>
      )}
      {mode === 'herd' && (
        <>
          <PathLabel x={830} y={168} color={red}>Server 重啟，200 人同一秒撥回來</PathLabel>
          <Dot path={UP} dur={0.9} begin={0} color="#fff" />
          <Dot path="M 540 240 L 1150 150" dur={0.9} begin={0} color="#fff" />
          <Dot path="M 580 262 L 1150 150" dur={0.9} begin={0} color="#fff" />
          <Dot path="M 520 228 L 1150 150" dur={0.9} begin={0} color="#fff" />
          <Dot path="M 600 275 L 1150 150" dur={0.9} begin={0} color="#fff" />
          <Dot path="M 560 290 L 1150 150" dur={0.9} begin={0} color="#fff" />
        </>
      )}
      {mode === 'jitter' && (
        <>
          <PathLabel x={830} y={168} color={green}>每個人多等一段隨機時間，錯開撥號</PathLabel>
          <Dot path={UP} dur={1.2} begin={0} color="#fff" />
          <Dot path={UP} dur={1.2} begin={0.45} color="#fff" />
          <Dot path={UP} dur={1.2} begin={0.8} color="#fff" />
          <Dot path={UP} dur={1.2} begin={1.25} color="#fff" />
        </>
      )}
      {mode === 'zombie' && (
        <>
          <Dot path="M 1150 175 L 870 223" dur={1.4} begin={0} color="var(--osd-accent)" />
          <Dot path="M 1150 175 L 870 223" dur={1.4} begin={0.7} color="var(--osd-accent)" />
          <g stroke={red} strokeWidth="8" strokeLinecap="round">
            <line x1="830" y1="200" x2="880" y2="250" />
            <line x1="880" y1="200" x2="830" y2="250" />
          </g>
          <Badge x={250} y={110} w={260} text="App：連線正常 ✓" color={green} />
        </>
      )}

      <rect x={270} y={418} width="220" height="44" rx="22" fill={panel} stroke={ink} strokeWidth="2.5" />
      <text x={380} y={448} textAnchor="middle" fontSize="22" fontWeight="800" fill={ink}>
        👥 200 位使用者
      </text>
    </svg>
  );
};

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

const LegendItem = ({ color, children }: { color: string; children: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 999,
        background: color,
        border: `2.5px solid ${ink}`,
        display: 'inline-block',
      }}
    />
    {children}
  </span>
);

type StepState = 'done' | 'current' | 'todo';

const StepDot = ({ n, label, state }: { n: number; label: string; state: StepState }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 999,
        border: `3px solid ${state === 'todo' ? line : ink}`,
        background: state === 'current' ? '#cfe8d3' : state === 'done' ? '#e9e2d5' : panel,
        boxShadow: state === 'current' ? '0 0 0 6px rgba(79,157,105,0.25)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: mono,
        fontSize: 22,
        fontWeight: 800,
        color: state === 'todo' ? muted : ink,
      }}
    >
      {n}
    </div>
    <span style={{ fontSize: 24, fontWeight: state === 'current' ? 800 : 500, color: state === 'todo' ? muted : ink }}>
      {label}
    </span>
  </div>
);

const Connector = () => <div style={{ flex: 1, height: 3, background: line, margin: '0 18px' }} />;

const Stepper = ({ current }: { current: number }) => {
  const st = (n: number): StepState => (n < current ? 'done' : n === current ? 'current' : 'todo');
  return (
    <div style={{ position: 'absolute', left: 120, right: 120, bottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: muted }}>
        <span style={{ fontWeight: 800, color: ink }}>四種做法</span>
        <span style={{ fontFamily: mono }}>Step {current} of 4</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 14 }}>
        <StepDot n={1} label="短輪詢" state={st(1)} />
        <Connector />
        <StepDot n={2} label="長輪詢" state={st(2)} />
        <Connector />
        <StepDot n={3} label="SSE" state={st(3)} />
        <Connector />
        <StepDot n={4} label="WebSocket" state={st(4)} />
      </div>
    </div>
  );
};

const MethodLayout = ({
  title,
  sub,
  metrics,
  mode,
  step,
}: {
  title: string;
  sub: string;
  metrics: ReactNode;
  mode: Mode;
  step: number;
}) => (
  <div style={fill}>
    <TopBar section="App 怎麼知道有新訊息" />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 118 }}>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 64, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
        {title}
      </h2>
      <p style={{ fontSize: 28, color: muted, margin: '8px 0 0' }}>{sub}</p>
      <div style={{ display: 'flex', gap: 18, marginTop: 18 }}>{metrics}</div>
      <div
        style={{
          marginTop: 16,
          background: '#faf6ee',
          border: `2px solid ${line}`,
          borderRadius: 'var(--osd-radius)',
          overflow: 'hidden',
        }}
      >
        <Scene mode={mode} />
      </div>
      <div style={{ display: 'flex', gap: 36, fontSize: 20, color: muted, marginTop: 14 }}>
        <LegendItem color="#fff">請求</LegendItem>
        <LegendItem color={grey}>空回應</LegendItem>
        <LegendItem color="#e07a3f">新訊息</LegendItem>
        <LegendItem color="#b7dcc0">長連線</LegendItem>
        <span style={{ marginLeft: 'auto' }}>＊數字是示意</span>
      </div>
    </div>
    <Stepper current={step} />
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

// ═════════════ 第 2 堂專用元件 ═════════════

const IsoLayout = ({
  section,
  title,
  sub,
  metrics,
  mode,
  bottom,
}: {
  section: string;
  title: string;
  sub: string;
  metrics: ReactNode;
  mode: Mode;
  bottom: ReactNode;
}) => (
  <div style={fill}>
    <TopBar section={section} />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 118 }}>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 64, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
        {title}
      </h2>
      <p style={{ fontSize: 28, color: muted, margin: '8px 0 0' }}>{sub}</p>
      <div style={{ display: 'flex', gap: 18, marginTop: 18 }}>{metrics}</div>
      <div
        style={{
          marginTop: 16,
          background: '#faf6ee',
          border: `2px solid ${line}`,
          borderRadius: 'var(--osd-radius)',
          overflow: 'hidden',
        }}
      >
        <Scene mode={mode} />
      </div>
    </div>
    <div style={{ position: 'absolute', left: 120, right: 120, bottom: 40 }}>{bottom}</div>
  </div>
);

// 重連時間軸（講師儀表板同款）：0～4 秒，30 位學員
const TL_X0 = 140;
const TL_W = 1500;
const tx = (sec: number) => TL_X0 + (sec / 4) * TL_W;
// 固定的「隨機」毫秒，讓畫面每次都一樣
const JITTER_MS = [
  12, 840, 377, 563, 91, 702, 248, 955, 430, 618, 160, 789, 334, 509, 47, 891, 276, 652, 118, 735, 401, 584, 213, 967,
  355, 690, 74, 822, 480, 299,
];

const ReconnectTimeline = ({ jitter }: { jitter: boolean }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: muted }}>
      <span style={{ fontWeight: 800, color: ink }}>重連時間軸（30 位學員）</span>
      <span>Server 在 0 秒重啟</span>
    </div>
    <svg width="1680" height="96" viewBox="0 0 1680 96" style={{ display: 'block', marginTop: 6 }}>
      <line x1={TL_X0} y1="70" x2={TL_X0 + TL_W} y2="70" stroke={ink} strokeWidth="2.5" />
      <text x={tx(0)} y="92" fontSize="18" fill={muted} textAnchor="middle" fontFamily={mono}>0s</text>
      <text x={tx(1)} y="92" fontSize="18" fill={muted} textAnchor="middle" fontFamily={mono}>1s</text>
      <text x={tx(2)} y="92" fontSize="18" fill={muted} textAnchor="middle" fontFamily={mono}>2s</text>
      <text x={tx(3)} y="92" fontSize="18" fill={muted} textAnchor="middle" fontFamily={mono}>3s</text>
      <text x={tx(4)} y="92" fontSize="18" fill={muted} textAnchor="middle" fontFamily={mono}>4s</text>
      <text x="0" y="56" fontSize="20" fontWeight="800" fill={jitter ? green : red}>
        {jitter ? '有 Jitter' : '沒 Jitter'}
      </text>
      {jitter ? (
        JITTER_MS.map((ms, i) => (
          <circle key={i} cx={tx(1 + ms / 1000)} cy={50 - (i % 3) * 14} r="8" fill={green} stroke={ink} strokeWidth="1.5" />
        ))
      ) : (
        <g>
          <rect x={tx(1) - 10} y="4" width="20" height="58" rx="10" fill={red} stroke={ink} strokeWidth="2" />
          <text x={tx(1) + 22} y="38" fontSize="22" fontWeight="800" fill={red}>30 人全擠在 1.000s</text>
        </g>
      )}
    </svg>
  </div>
);

// 心跳時間軸：0～40 秒
const hx = (t: number) => 150 + t * 30;

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

const Ping = ({ t }: { t: number }) => (
  <g>
    <line x1={hx(t)} y1="90" x2={hx(t + 1)} y2="250" stroke={ink} strokeWidth="3" markerEnd="url(#hbA)" />
    <text x={hx(t) - 6} y="74" fontSize="22" fontWeight="800" fill={ink} fontFamily={mono}>ping</text>
  </g>
);

const Pong = ({ t }: { t: number }) => (
  <g>
    <line x1={hx(t + 1.6)} y1="250" x2={hx(t + 2.6)} y2="90" stroke={green} strokeWidth="3" markerEnd="url(#hbG)" />
    <text x={hx(t + 2.4)} y="290" fontSize="22" fontWeight="800" fill={green} fontFamily={mono}>pong</text>
  </g>
);

const HeartbeatChart = () => (
  <Layers
    w={1680}
    h={380}
    base={
      <>
        <defs>
          <marker id="hbA" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={ink} />
          </marker>
          <marker id="hbG" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={green} />
          </marker>
        </defs>
        <text x="20" y="96" fontSize="26" fontWeight="800" fill={ink} fontFamily={mono}>App</text>
        <text x="20" y="258" fontSize="26" fontWeight="800" fill={ink} fontFamily={mono}>Server</text>
        <line x1="150" y1="90" x2="1640" y2="90" stroke={line} strokeWidth="4" />
        <line x1="150" y1="250" x2="1640" y2="250" stroke={line} strokeWidth="4" />
        <line x1="150" y1="340" x2="1640" y2="340" stroke={ink} strokeWidth="2" />
        <text x={hx(0)} y="368" fontSize="18" fill={muted} fontFamily={mono} textAnchor="middle">0s</text>
        <text x={hx(10)} y="368" fontSize="18" fill={muted} fontFamily={mono} textAnchor="middle">10s</text>
        <text x={hx(20)} y="368" fontSize="18" fill={muted} fontFamily={mono} textAnchor="middle">20s</text>
        <text x={hx(30)} y="368" fontSize="18" fill={muted} fontFamily={mono} textAnchor="middle">30s</text>
      </>
    }
    layers={[
      <Ping t={0} />,
      <Pong t={0} />,
      <Ping t={10} />,
      <Pong t={10} />,
      <Ping t={20} />,
      <Pong t={20} />,
      <Ping t={30} />,
      <>
        <rect x={hx(30)} y="100" width={hx(35) - hx(30)} height="140" fill={red} opacity="0.1" />
        <text x={(hx(30) + hx(35)) / 2} y="180" fontSize="20" fontWeight="800" fill={red} textAnchor="middle">
          等 5 秒
        </text>
        <g stroke={red} strokeWidth="7" strokeLinecap="round">
          <line x1={hx(35) - 16} y1="74" x2={hx(35) + 16} y2="106" />
          <line x1={hx(35) + 16} y1="74" x2={hx(35) - 16} y2="106" />
        </g>
        <text x={hx(35) + 30} y="60" fontSize="22" fontWeight="800" fill={red}>沒等到 pong，自己掛斷，排程重連</text>
        <text x={hx(35)} y="368" fontSize="18" fill={red} fontFamily={mono} textAnchor="middle">35s</text>
      </>,
    ]}
  />
);

// Backoff 長條圖
const BAR_W = 120;
const bx = (i: number) => 130 + i * 190;
const by = (sec: number) => 380 - sec * 11;

const Bar = ({ i, sec, label }: { i: number; sec: number; label: string }) => (
  <g>
    <rect x={bx(i)} y={by(sec)} width={BAR_W} height={380 - by(sec)} rx="6" fill="#bed2f3" stroke={ink} strokeWidth="2.5" />
    <rect x={bx(i)} y={by(sec) - 14} width={BAR_W} height="14" rx="4" fill="#f5c79a" stroke={ink} strokeWidth="2" />
    <text x={bx(i) + BAR_W / 2} y={by(sec) - 24} fontSize="24" fontWeight="800" fill={ink} textAnchor="middle" fontFamily={mono}>
      {label}
    </text>
    <text x={bx(i) + BAR_W / 2} y="412" fontSize="20" fill={muted} textAnchor="middle" fontFamily={mono}>
      第 {i + 1} 次
    </text>
  </g>
);

const BackoffChart = () => (
  <Layers
    w={1680}
    h={430}
    base={
      <>
        <line x1="110" y1="380" x2="1640" y2="380" stroke={ink} strokeWidth="2.5" />
        <line x1="110" y1={by(30)} x2="1640" y2={by(30)} stroke={red} strokeWidth="2.5" strokeDasharray="10 8" />
        <text x="120" y={by(30) - 12} fontSize="22" fontWeight="800" fill={red}>上限 30s</text>
      </>
    }
    layers={[
      <Bar i={0} sec={1} label="1s" />,
      <Bar i={1} sec={2} label="2s" />,
      <Bar i={2} sec={4} label="4s" />,
      <Bar i={3} sec={8} label="8s" />,
      <Bar i={4} sec={16} label="16s" />,
      <Bar i={5} sec={30} label="30s" />,
      <Bar i={6} sec={30} label="30s" />,
      <Bar i={7} sec={30} label="30s" />,
    ]}
  />
);

// 連線狀態機
const SNode = ({ x, y, title, en, tint }: { x: number; y: number; title: string; en: string; tint: string }) => (
  <g>
    <rect x={x - 150} y={y - 56} width="300" height="112" rx="18" fill={tint} stroke={ink} strokeWidth="3" />
    <text x={x} y={y - 6} fontSize="32" fontWeight="900" fill={ink} textAnchor="middle">{title}</text>
    <text x={x} y={y + 30} fontSize="20" fill={muted} textAnchor="middle" fontFamily={mono}>{en}</text>
  </g>
);

const SEdge = ({ d, label, lx, ly, color = ink }: { d: string; label: string; lx: number; ly: number; color?: string }) => (
  <g>
    <path d={d} stroke={color} strokeWidth="3" fill="none" markerEnd="url(#smA)" />
    <text x={lx} y={ly} fontSize="22" fontWeight="700" fill={color} textAnchor="middle">{label}</text>
  </g>
);

const StateChart = () => (
  <svg width="1680" height="560" viewBox="0 0 1680 560" style={{ display: 'block' }}>
    <defs>
      <marker id="smA" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <path d="M0,0 L12,6 L0,12 z" fill={ink} />
      </marker>
    </defs>
    <SNode x={300} y={110} title="連線中" en="connecting" tint="#fbe7b5" />
    <SNode x={1000} y={110} title="已連線" en="connected" tint="#d6ecd9" />
    <SNode x={650} y={440} title="等待重連" en="disconnected" tint="#f7d9d6" />
    <SEdge d="M 452 110 L 846 110" label="握手成功，次數歸零" lx={650} ly={92} />
    <SEdge d="M 1000 168 C 1000 300 900 420 802 432" label="斷線 / pong 逾時" lx={1040} ly={320} />
    <SEdge d="M 300 168 C 300 330 400 420 498 432" label="連不上" lx={270} ly={320} />
    <SEdge d="M 600 382 C 560 280 440 210 380 170" label="計時到了，再撥一次" lx={620} ly={270} />
    <text x={1450} y={430} fontSize="22" fill={muted} textAnchor="middle">呼叫 dispose 之後：不再改狀態</text>
    <text x={1450} y={466} fontSize="22" fill={muted} textAnchor="middle">（這不是第四格）</text>
  </svg>
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

const CauseCard = ({ icon, title, children }: { icon: string; title: string; children: ReactNode }) => (
  <div
    style={{
      height: '100%',
      boxSizing: 'border-box',
      background: panel,
      border: `2.5px solid ${ink}`,
      boxShadow: `8px 8px 0 ${line}`,
      borderRadius: 'var(--osd-radius)',
      padding: '36px 36px 40px',
    }}
  >
    <div style={{ fontSize: 64 }}>{icon}</div>
    <div style={{ fontSize: 36, fontWeight: 900, marginTop: 16 }}>{title}</div>
    <div style={{ fontSize: 28, color: muted, marginTop: 14, lineHeight: 1.55 }}>{children}</div>
  </div>
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
    <div style={{ position: 'absolute', left: 120, top: 170 }}>
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
        心跳 + 自動重連
      </h1>
      <p style={{ fontSize: 36, color: muted, margin: 0 }}>連線斷了要自己發現，還要自己接回來</p>
    </div>
    <div style={{ position: 'absolute', left: 120, right: 120, bottom: 60 }}>
      <Scene mode="zombie" />
    </div>
  </div>
);

const Scenario: Page = () => (
  <Shell section="開場" title="今天有兩個人來找你">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <Bubble who="客服" role="客服">
        「使用者說，App 切到背景再回來，就<b style={{ color: 'var(--osd-accent)' }}>收不到訊息</b>了，畫面看起來又很正常。」
      </Bubble>
      <Steps>
        <Step>
          <Bubble who="後端" role="後端工程師">
            「昨晚 Server 重啟，一開起來就被<b style={{ color: 'var(--osd-accent)' }}>重連的請求打爆</b>，又掛了一次。」
          </Bubble>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
    <Card style={{ marginTop: 44 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>今天下課前要做到</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Goal n="01">App 能自己發現連線已經死了</Goal>
        <Goal n="02">斷線後自己重連，而且不會跟大家擠同一秒</Goal>
        <Goal n="03">畫面上看得到現在的連線狀態</Goal>
      </div>
    </Card>
      </Step>
    </Steps>
  </Shell>
);

const Evolution: Page = () => (
  <Shell section="能力演進表" title="表還是一樣，先把連線顧好" sub="這堂不會打掉 ✗，但第 7 堂的補洞要靠今天的重連。">
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

const Recap: Page = () => (
  <BigQuestion tag="上堂的問題" tagColor="#f7d9d6" foot="提示：打電話時，對方很久沒出聲，你會怎麼做？">
    Amy 的畫面很正常，
    <br />
    為什麼收不到訊息？
  </BigQuestion>
);

const WhyUnaware: Page = () => (
  <Shell section="觀念" title="線斷了，App 為什麼不知道？" sub="TCP 沒有在送資料的時候，不會主動發現對方不見了。">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
      <Steps>
        <Step>
          <CauseCard icon="📱" title="切到背景">
            系統把 App 暫停了，連線在背後被切掉，回到前景時沒人通知你。
          </CauseCard>
        </Step>
        <Step>
          <CauseCard icon="🛗" title="進電梯、隧道">
            訊號直接沒了，雙方都來不及說再見，連線就卡在半空中。
          </CauseCard>
        </Step>
        <Step>
          <CauseCard icon="🗄️" title="閒置太久">
            電信商和路由器的 NAT 會清掉太久沒動靜的連線，兩端都不知道。
          </CauseCard>
        </Step>
      </Steps>
    </div>
  </Shell>
);

const Heartbeat: Page = () => (
  <Shell section="觀念" title="心跳：每隔一段時間問一聲「還在嗎」" sub="課堂用 10 秒 ping、5 秒等 pong。正式環境通常 25～30 秒 ping 一次。">
    <Card style={{ padding: '20px 0 10px' }}>
      <HeartbeatChart />
    </Card>
  </Shell>
);

const Backoff: Page = () => (
  <Shell section="觀念" title="重連：失敗就等久一點再試" sub="1s → 2s → 4s → 8s…，最多等 30 秒。橘色那一截是隨機多等的毫秒。">
    <Card style={{ padding: '24px 0 8px' }}>
      <BackoffChart />
    </Card>
  </Shell>
);

const Herd: Page = () => (
  <IsoLayout
    section="觀念"
    title="沒加隨機：全班同一秒撥回來"
    sub="每個人都是 1 秒後重試，Server 一開機就被打趴，然後再一起等 2 秒……"
    mode="herd"
    metrics={
      <>
        <Metric label="在線人數" value="200" bar={ink} />
        <Metric label="同一秒重連" value="200 人" bar={red} />
        <Metric label="Server 負載" value="爆了" bar={red} />
        <Metric label="這叫做" value="Thundering Herd" bar={blue} />
      </>
    }
    bottom={
      <Steps>
        <Step>
          <ReconnectTimeline jitter={false} />
        </Step>
      </Steps>
    }
  />
);

const Jitter: Page = () => (
  <IsoLayout
    section="觀念"
    title="加上隨機：大家錯開撥號"
    sub="等待時間 = Backoff + 隨機 0～1000 毫秒。重連的人被攤平在一整秒裡。"
    mode="jitter"
    metrics={
      <>
        <Metric label="在線人數" value="200" bar={ink} />
        <Metric label="每 0.1 秒" value="約 20 人" bar={green} />
        <Metric label="Server 負載" value="撐得住" bar={green} />
        <Metric label="這叫做" value="Jitter" bar={blue} />
      </>
    }
    bottom={
      <Steps>
        <Step>
          <ReconnectTimeline jitter />
        </Step>
      </Steps>
    }
  />
);

const States: Page = () => (
  <Shell section="觀念" title="把連線想成三種狀態" sub="橫幅要顯示的，就是現在在哪一格。">
    <Card style={{ padding: '18px 0' }}>
      <StateChart />
    </Card>
  </Shell>
);

const ImplA: Page = () => (
  <Shell section="實作" title="TODO ①② 心跳和重連" sub={<>連線程式已經搬進 <Kw>ChatSocket</Kw>，你只要補 TODO。</>}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Todo n="1" title={<>每 10 秒送 <Kw>{'{"type":"ping"}'}</Kw>，5 秒內沒收到 pong 就自己斷線</>}>
        <Hint>用兩個 <Kw>Timer</Kw>：一個定時送 ping，一個等 pong。收到 pong 就把等待的那個取消。</Hint>
      </Todo>
      <Todo n="2" title={<>在 <Kw>onDone</Kw> / <Kw>onError</Kw> 裡排程重連</>}>
        <Hint>等待時間 1s、2s、4s… 翻倍，最多 30s，再加 0～1000 毫秒的隨機數。</Hint>
      </Todo>
    </div>
  </Shell>
);

const ImplB: Page = () => (
  <Shell section="實作" title="TODO ③④⑤ 收尾的三件事">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Todo n="✓" title="①② 心跳、重連排程" done />
      <Todo n="3" title="連上之後，把重試次數歸零">
        <Hint>不歸零會怎樣？斷第二次的時候想想看。</Hint>
      </Todo>
      <Todo n="4" title="把連線狀態推出去，讓橫幅顯示">
        <Hint>三種狀態：<Kw>connecting</Kw>、<Kw>connected</Kw>、<Kw>disconnected</Kw>（等待重連）。橫幅元件已經接好，你只要送狀態。</Hint>
      </Todo>
      <Todo n="5" title={<>在 <Kw>dispose</Kw> 把所有 Timer 取消</>}>
        <Hint>離開頁面後還在背景偷偷重連，是很常見的 bug。</Hint>
      </Todo>
    </div>
  </Shell>
);

const Acceptance: Page = () => (
  <Shell section="驗收" title="這幾項都過了，就可以收工">
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Check>
          對自己下 <Kw>/zombie</Kw>，約 20 秒內自動連回來
        </Check>
        <Check>斷線時橫幅會顯示，連回來後橫幅消失</Check>
        <Check>
          講師下 <Kw>/drop @all</Kw>，儀表板的重連時間軸上，大家是錯開的
        </Check>
        <Check>按 AppBar 的離開鈕回到名字頁後，不會再重連</Check>
      </div>
    </Card>
  </Shell>
);

const Feynman: Page = () => (
  <Shell section="費曼檢核" title="不看螢幕，講給隔壁聽" sub="兩人一組，一人一分鐘。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Card>
        <Goal n="Q1">為什麼連線斷了，App 自己不知道？</Goal>
      </Card>
      <Card>
        <Goal n="Q2">重連為什麼要越等越久？為什麼還要加一段隨機時間？</Goal>
      </Card>
      <Card>
        <Goal n="Q3">連上之後，為什麼要把重試次數歸零？</Goal>
      </Card>
    </div>
  </Shell>
);

const ExtraPush: Page = () => (
  <Shell section="講師補充" title="App 在背景或被殺掉時，訊息怎麼收？" sub="前景靠 WebSocket，背景交給系統推播。">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 1.2fr 1.2fr' }}>
      <FlowBox title="Server 發現你不在線" sub="WebSocket 沒連著" tint={panel} />
      <Steps>
        <Step>
          <FlowStep>
            <FlowBox title="送到 FCM / APNs" sub="Google、Apple 的推播服務" tint="#dde9fb" />
          </FlowStep>
        </Step>
        <Step>
          <FlowStep>
            <FlowBox title="系統跳通知" sub="App 不用醒著" tint="#d6ecd9" />
          </FlowStep>
        </Step>
        <Step>
          <FlowStep>
            <FlowBox title="點通知，App 冷啟動" sub="初始化還沒跑完" tint="#fbe7b5" />
          </FlowStep>
        </Step>
        <Step>
          <FlowStep>
            <FlowBox title="準備好才跳到聊天室" sub="先排隊，等好了再導航" tint="#fbd9b8" />
          </FlowStep>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
    <Card style={{ marginTop: 44 }}>
      <div style={{ fontSize: 30, lineHeight: 1.6 }}>
        最後一步常被忽略：App 還沒登入、路由還沒建好，就硬跳到聊天室，結果白屏或閃退。
        <br />
        做法是先把「要去哪」存起來，等 App 準備好再執行，叫 <Kw>Deferred Navigation Queue</Kw>。
      </div>
    </Card>
      </Step>
    </Steps>
  </Shell>
);

const Hook: Page = () => (
  <div style={fill}>
    <TopBar section="下集預告" />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 180 }}>
      <Pill tint="#f7d9d6">連回來了，然後呢</Pill>
      <h2 style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.3, margin: '32px 0 0' }}>
        斷線的那幾秒，
        <br />
        別人說的話去哪了？
      </h2>
      <Steps>
        <Step>
      <div style={{ display: 'flex', gap: 32, marginTop: 56 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 22, color: muted }}>這個問題先放著</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>第 7 堂回來解</div>
        </Card>
        <Card style={{ flex: 1, background: '#fdf0e3' }}>
          <div style={{ fontSize: 22, color: muted }}>還有一個：狂傳 20 句，訊息被鍵盤擋住了</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>下一堂：反轉列表</div>
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
□ 行為等級：回音（儀表板上方「行為等級」按鈕）
□ 全域延遲：0 ms
□ 分房：私人房（「分房」區；第 1 堂結尾在大廳，開場前切回私人房；只搬在線學員）
□ 其他：無。驗收的 /drop @all 之後機器人會發在各自的私人房，結尾鉤子要用。

【0:00】
上一堂結尾，Amy 的 App 看起來很正常，可是收不到訊息。今天就來處理這件事：連線死了要自己發現，靠的是 Heartbeat，心跳；發現了要自己接回來，也就是 Reconnect，重連。

術語
・Heartbeat（心跳）
・Reconnect（重連）`,

  // 2 Scenario
  `【0–3 分】
兩個人同一天來找你。先唸客服的：切背景回來就收不到。
（→）再唸後端的：Server 一重啟就被重連打爆。
這兩件事其實是同一個主題的兩面：前端要會重連，但重連的方式不能把後端打掛。
（→）今天的三個目標唸過去，下課前回來對。

術語
・Background / Foreground（背景 / 前景）
・Server Restart / Deploy（重啟 / 部署）`,

  // 3 Evolution
  `【3–4 分】
表上的 ✗ 今天一個都不會少。但第 7 堂的「重連後自動補齊」，前提是你得先能重連。今天是在幫第 7 堂鋪路。`,

  // 4 Recap
  `【4–5 分】回顧提問
問：「Amy 為什麼收不到？」先讓學員想一下。
（→）提示出來：「打電話時對方很久沒出聲，你會怎麼做？」
學員會說「喂？還在嗎？」。對，這就是心跳。

參考答案：連線已經死了，可是兩端都還以為它活著，這叫 Zombie Connection，殭屍連線，比較正式的說法是 Half-open Connection。App 沒有送任何東西，所以 TCP 不會發現。要主動問一聲，沒回應就當它死了。

術語
・Zombie Connection / Half-open Connection（殭屍連線 / 半開連線）`,

  // 5 WhyUnaware
  `【5–9 分】
三個常見原因，一張一張出來。
（→）切背景：iOS 和 Android 都會在 App 進背景後沒多久暫停它，連線被系統或 Server 切掉，App 醒來時不會收到任何通知。
（→）電梯、隧道：訊號直接沒了。正常關連線會送 FIN，但這種情況兩邊都來不及送。
（→）NAT 逾時：手機在電信商的 NAT 後面。NAT 是 Network Address Translation，網路位址轉換，很多支手機共用一個對外 IP。它會記錄每條連線的對應關係，太久沒資料就清掉，這段時間叫 Idle Timeout，閒置逾時。之後 Server 送來的封包找不到路，兩端都不知道。
重點句：TCP 只有在你送資料、送不到的時候才會發現出事。不送，就永遠不知道。

術語
・FIN：TCP 正常結束連線時送的封包。
・NAT, Network Address Translation（網路位址轉換）
・Idle Timeout（閒置逾時）

可能被問到
問：為什麼不靠 web_socket_channel 內建的 pingInterval？
答：dart:io 的 WebSocket 有 pingInterval，會送協議層的 ping frame。它可以用，但課堂上自己寫應用層的 ping/pong，才看得到整個流程，也才能自己決定逾時要做什麼。很多正式產品兩種都會用。`,

  // 6 Heartbeat
  `【9–12 分】
每 10 秒 App 送一個 Ping，Server 回 Pong。一則一則按出來：
（→）第 0 秒，App 送 ping 給 Server。（→）Server 回 pong 給 App。
（→）第 10 秒，App 再送一個 ping。（→）Server 回 pong。
（→）第 20 秒，App 送 ping。（→）Server 回 pong。
（→）第 30 秒，App 送出 ping，這次 Server 沒有回音。
（→）App 等了 5 秒還是沒有 pong，第 35 秒自己把連線關掉，進入重連。
注意是「主動」斷線。不要等 TCP 自己發現，那可能要很久。這種在我們自己的訊息格式裡做的叫 Application-level Heartbeat，應用層心跳，跟 TCP 本身的 keepalive 是兩回事。
正式環境通常 25 到 30 秒一次，太頻繁會耗電、耗流量，太久則發現得慢。另一個考量是要比 NAT 和負載平衡器的閒置逾時短，順便讓連線保持「有在用」。

術語
・Ping / Pong
・Application-level Heartbeat（應用層心跳）
・Timeout（逾時）

可能被問到
問：ping 應該由 App 發還是 Server 發？
答：兩種都有。App 發的好處是 App 自己最快知道斷線；Server 發的好處是 Server 能清掉死連線、省資源。常見做法是 Server 也有自己的逾時，太久沒收到任何東西就把連線關掉。

問：心跳會不會很耗電？
答：會有一點。手機的網路晶片每次醒來都要耗電，所以間隔不要太短。這也是為什麼背景時不靠 WebSocket，改用系統推播。`,

  // 7 Backoff
  `【12–15 分】
重連失敗就等久一點再試。每一根長條是 App 向 Server 發出的一次重連，前面要先等多久，一根一根按出來：
（→）第 1 次，等 1 秒。（→）第 2 次，等 2 秒。（→）第 3 次，4 秒。（→）第 4 次，8 秒。（→）第 5 次，16 秒。
（→）第 6 次本來要 32 秒，但碰到上限，只等 30 秒。（→）（→）之後每一次都是 30 秒。
1、2、4、8、16 秒，到 30 秒封頂，這個上限叫 Cap，也有人叫 Max Delay。整個做法叫 exponential backoff，指數退避。
為什麼要越等越久？如果 Server 真的掛了，每秒重試只是在幫倒忙；如果是使用者在電梯裡，一直重試也只是浪費電。
為什麼要封頂？不然等到第十次要等十幾分鐘，使用者出電梯了 App 還在睡。
橘色那一截是 jitter，下一頁講。

術語
・Exponential Backoff（指數退避）
・Cap / Max Delay（上限）
・Retry（重試）`,

  // 8 Herd
  `【15–17 分】
後端說的爆掉就是這個。Server 重啟，全部人同時斷線，大家都是 1 秒後重試，這種步調一致的重試叫 Synchronized Retry，同步重試，所以 200 人同一秒撞進來。Server 剛開機還沒暖好，被打趴，大家又同時失敗，再同時等 2 秒……一波一波。
這叫 thundering herd，驚群效應。
（→）下面的時間軸出來：30 個人全擠在 1.000 秒。這是沒加 Jitter 的樣子。驗收時大家的程式都有 Jitter，會拿儀表板上的實際時間軸回來跟這張圖對比。

術語
・Thundering Herd（驚群效應）
・Synchronized Retry（同步重試）`,

  // 9 Jitter
  `【17–19 分】
解法很簡單：每個人等待的時間再加一段隨機數。原本 200 人擠在同一秒，現在攤平在一整秒裡，每 0.1 秒大約 20 人，Server 撐得住。
（→）同一條時間軸出來，跟上一頁對照：點點攤平在 1～2 秒之間。
這個隨機數就叫 Jitter，原意是抖動，這裡指隨機延遲。AWS 的架構部落格整理過幾種加法，像 Full Jitter、Equal Jitter，有人問再講。

術語
・Jitter（抖動 / 隨機延遲）
・Full Jitter / Equal Jitter：AWS 架構部落格整理過的幾種加隨機的方式。

可能被問到
問：隨機要加多少？
答：課堂用 0 到 1000 毫秒。另一種常見做法叫 full jitter，等待時間直接在 0 到 backoff 之間取隨機，攤得更開。
問：Server 端能做什麼？
答：可以限流，或在回應裡告訴 Client 多久後再來（HTTP 的 Retry-After 就是這個概念）。部署時也可以分批重啟，不要一次斷光全部連線。`,

  // 10 States
  `【19–20 分】
寫程式前先把狀態畫清楚，這張圖叫 State Machine，狀態機。三格，對應程式裡的 enum ConnectionStatus：connecting 連線中、connected 已連線、disconnected 等待重連。橫幅顯示「已斷線，自動重連中…」就是 disconnected。格子之間的箭頭叫 Transition，狀態轉換。
注意兩個細節：握手成功才算已連線，這時候把重試次數歸零；dispose 之後不再改狀態，也不能再自己跳回連線中。「已關閉」不是一格，enum 裡沒有它，不要自己加。

術語
・State Machine（狀態機）
・Transition（狀態轉換）`,

  // 11 ImplA
  `【20–35 分】實作
連線程式已經搬進 ChatSocket，你只要補 TODO。connect、send、收資料、斷線處理、dispose 的骨架都寫好了，不用把第 1 堂的 ChatController 搬過來或蓋回去。這樣拆叫關注點分離，Controller 管訊息，Socket 管連線。
① 兩個 Timer：pingTimer 用 Timer.periodic 每 10 秒送一次；pongTimer 在送出後開始倒數 5 秒，收到 pong 就取消。倒數到了就自己關連線。
② onDone 和 onError 都要排程重連，等待時間用 min(30, 2^n) 秒加隨機毫秒。

術語
・Separation of Concerns（關注點分離）
・Timer.periodic`,

  // 12 ImplB
  `【35–50 分】
③ 連上後次數歸零。
問學員：「不歸零會怎樣？」
參考答案：下次斷線會直接從很長的等待開始，例如直接等 30 秒，使用者會覺得 App 壞了。
④ 狀態推出去，橫幅已經接好。用 enum 裡的三個值：connecting、connected、disconnected（等待重連）。
⑤ dispose 取消所有 Timer，也要確保 dispose 之後不會再排程新的重連。
參考答案：不清 Timer，離開頁面後還會在背景一直重連，甚至同時開出兩條連線，同一則訊息收兩次。

可能被問到
問：網路從斷到恢復，可以馬上重連嗎？
答：可以加上網路狀態監聽（例如 connectivity_plus），網路一恢復就立刻重試，不用等 backoff。但不能只靠它，因為「有網路」不代表 Server 連得上。`,

  // 13 Acceptance
  `【50–57 分】驗收
學員各自 /zombie，看約 20 秒內有沒有連回來。最壞情況：下一次 ping 最多要等 10 秒，加 5 秒等 pong 逾時，再加第一次重連的 1～2 秒，大約 17 秒。所以十幾秒才連回來是正常的。
接著講師下 /drop @all，打開儀表板的重連時間軸。大家的程式都有加 Jitter，所以時間軸上只會有「有 Jitter」這一種，沒有開關可以切。拿它跟前面 Herd 頁那張「沒 Jitter、全擠在同一點」的靜態圖對比：儀表板上的點是錯開的。
儀表板的實際畫面跟簡報的示意圖不一樣：簡報是簡化過的。儀表板是 0～40 秒、每人一列，t=0 是講師下 /drop 的那一刻（不是 Server 重啟），/drop 後前 5 秒會拒絕連線，這段時間的嘗試是紅點，之後連上的是綠點。
最後一項：按 AppBar 的離開鈕回到名字頁後，不會再重連。驗法：離開後，儀表板和 Server log 不再出現你的連線嘗試。還在出現，就是 ⑤ dispose 沒把 Timer 取消乾淨。`,

  // 14 Feynman
  `【57–58 分】費曼檢核

參考答案
Q1：TCP 只有在送資料、送不到時才會發現斷線。切背景、進電梯、NAT 逾時都可能讓連線死掉，但 App 沒在送東西，就不知道。所以要心跳。
Q2：越等越久，是為了不在 Server 掛掉或沒訊號時白白狂試；加隨機，是為了避免大家同一秒一起重連，造成 thundering herd。
Q3：不歸零的話，下次斷線會直接從很長的等待開始。`,

  // 15 ExtraPush
  `【58–60 分】講師補充
App 在前景時用 WebSocket。進背景後系統很快會暫停 App，這時候改用推播。流程一格一格出來。Server 發現使用者不在線，（→）就把訊息交給 FCM，Firebase Cloud Messaging，給 Android；或 APNs，Apple Push Notification service，給 iOS。（→）由系統顯示通知，App 不用醒著。
（→）使用者點通知時，通知裡通常帶一個 Deep Link，深層連結，指到某個聊天室。這時 App 可能是冷啟動，登入狀態、路由都還沒準備好。這時候直接導航會白屏或閃退。（→）做法是把目的地先存進一個佇列，等初始化完成再執行，這叫 Deferred Navigation Queue，延遲導航佇列。
（→）下面那段文字出來，把最後一步再強調一次。

術語
・FCM（Firebase Cloud Messaging）
・APNs（Apple Push Notification service）
・Cold Start / Warm Start（冷啟動 / 熱啟動）
・Deep Link（深層連結）
・Deferred Navigation Queue（延遲導航佇列）

可能被問到
問：推播一定送得到嗎？
答：不保證。系統可能合併、延遲或丟掉推播，所以推播只是「叫醒你」的提示，真正的訊息還是要等 App 連上後自己去拿，這就接到第 7 堂的補洞。
問：推播可以直接帶訊息內容嗎？
答：可以帶一部分，但有大小限制，而且內容會經過 Google、Apple 的伺服器。重視隱私的 App 只送「你有新訊息」，或送加密過的內容讓 App 自己解。`,

  // 16 Hook
  `【結尾鉤子】
先確認學員在看得到機器人訊息的房間：機器人會發在每個被踢的人所在的房間，大家預設在自己的私人房，就看自己私人房的聊天畫面（儀表板「分房」區確認是私人房）。
驗收的 /drop @all 之後，問大家有沒有看到機器人那 3 句。斷線期間別人說的話，連回來後看得到嗎？問：「訊息去哪了？」不給答案。
機器人第 3 句會提到 Delta Sync，那是第 7 堂的術語，這裡只說「第 7 堂會講」，不展開。
（→）下面兩張卡出來：這題留到第 7 堂。另外請大家狂傳 20 句，訊息會被鍵盤擋住、畫面跳來跳去，帶出下一堂的反轉列表。

講師自己複習（面試關鍵字，不用講給學員）
・Zombie Connection：連線實際上死了，但兩端都還以為它活著。
・Heartbeat (Ping-Pong)：應用層定時互相確認，逾時就主動斷線重連。
・Exponential Backoff + Jitter：重試間隔指數成長、有上限，再加隨機數錯開。
・Thundering Herd：大量 Client 同時重試，把剛恢復的 Server 再次打垮。`,
];

export const meta: SlideMeta = {
  title: '第 02 堂｜心跳 + 自動重連',
  createdAt: '2026-11-23T03:58:58.873Z',
};

export default [
  Cover,
  Scenario,
  Evolution,
  Recap,
  WhyUnaware,
  Heartbeat,
  Backoff,
  Herd,
  Jitter,
  States,
  ImplA,
  ImplB,
  Acceptance,
  Feynman,
  ExtraPush,
  Hook,
] satisfies Page[];
