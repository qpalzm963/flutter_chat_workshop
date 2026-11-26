import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 第 1 堂：接通 + 收發（等角圖解版）
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
      <span>即時聊天室 · 第 1 堂</span>
      <span style={{ color: muted, fontWeight: 500 }}>/ {section}</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#d6ecd9">Lesson 01</Pill>
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

type Mode = 'short' | 'long' | 'sse' | 'ws' | 'zombie' | 'hero';

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
  const load = mode === 'short' ? 85 : mode === 'long' ? 50 : 15;
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
      <Cube cx={1270} cy={190} s={130} hot={mode === 'short'} label="Server" />
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

// ═════════════ 1. 封面 ═════════════

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
        接通 + 收發
      </h1>
      <p style={{ fontSize: 36, color: muted, margin: 0 }}>先讓兩支手機能即時互傳，從純字串做到 JSON</p>
    </div>
    <div style={{ position: 'absolute', left: 120, right: 120, bottom: 60, opacity: 0.95 }}>
      <Scene mode="hero" />
    </div>
  </div>
);

// ═════════════ 2. 開場情境 ═════════════

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

const Scenario: Page = () => (
  <Shell section="開場" title="PM 走過來說">
    <Bubble who="PM" role="產品經理">
      「先做個能<b style={{ color: 'var(--osd-accent)' }}>即時互傳</b>的版本就好，我這邊打字，對方馬上看到。」
    </Bubble>
    <Card style={{ marginTop: 56 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 16 }}>今天下課前要做到</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Goal n="01">知道輪詢、SSE、WebSocket 各自怎麼運作，聊天為什麼選 WebSocket</Goal>
        <Goal n="02">自己接通 WebSocket，能收能發，再把純字串改成 JSON</Goal>
        <Goal n="03">離開聊天頁時把連線關掉</Goal>
      </div>
    </Card>
  </Shell>
);

// ═════════════ 3. 能力演進表 ═════════════

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

const Evolution: Page = () => (
  <Shell section="能力演進表" title="我們現在在最左邊這一欄" sub="前四堂只有 WebSocket，所以表上一堆 ✗ 是正常的。">
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

// ═════════════ 4. 開場提問 ═════════════

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
      <p style={{ fontSize: 34, color: muted, marginTop: 44 }}>{foot}</p>
    </div>
  </div>
);

const OpeningQuestion: Page = () => (
  <BigQuestion tag="先想一下" tagColor="#fbe7b5" foot="你最熟的是打 REST API。只靠它，做得到「對方馬上看到」嗎？">
    要做即時聊天，
    <br />
    你以前會怎麼做？
  </BigQuestion>
);

// ═════════════ 5–8. 四種做法 ═════════════

const ShortPolling: Page = () => (
  <MethodLayout
    title="短輪詢：每幾秒就問一次"
    sub="像每 3 秒打一通電話問「到了沒」，對方幾乎都說還沒。"
    mode="short"
    step={1}
    metrics={
      <>
        <Metric label="在線人數" value="200" bar={ink} />
        <Metric label="每秒請求" value="67 次" bar={red} />
        <Metric label="訊息延遲" value="最多 3s" bar={red} />
        <Metric label="白跑的請求" value="~99%" bar={red} />
        <Metric label="走什麼" value="HTTP API" bar={blue} />
      </>
    }
  />
);

const LongPolling: Page = () => (
  <MethodLayout
    title="長輪詢：打過去先別掛"
    sub="Server 有訊息才回話。回完電話就斷了，App 要馬上再打一次。"
    mode="long"
    step={2}
    metrics={
      <>
        <Metric label="在線人數" value="200" bar={ink} />
        <Metric label="掛著等的請求" value="200 條" bar={amber} />
        <Metric label="訊息延遲" value="很短" bar={green} />
        <Metric label="每收一則" value="重打一次" bar={amber} />
        <Metric label="走什麼" value="HTTP API" bar={blue} />
      </>
    }
  />
);

const Sse: Page = () => (
  <MethodLayout
    title="SSE：開著收音機"
    sub="打一次就一直收得到。可是你想回話，得另外再打一通。"
    mode="sse"
    step={3}
    metrics={
      <>
        <Metric label="在線人數" value="200" bar={ink} />
        <Metric label="每秒請求" value="≈ 0" bar={green} />
        <Metric label="訊息延遲" value="即時" bar={green} />
        <Metric label="方向" value="只有 ↓" bar={amber} />
        <Metric label="走什麼" value="HTTP" bar={blue} />
      </>
    }
  />
);

const WebSocketPage: Page = () => (
  <MethodLayout
    title="WebSocket：電話接通就不掛"
    sub="接通一次之後，兩邊想講就講。聊天室用的就是這個。"
    mode="ws"
    step={4}
    metrics={
      <>
        <Metric label="在線人數" value="200" bar={ink} />
        <Metric label="長連線" value="200 條" bar={green} />
        <Metric label="訊息延遲" value="即時" bar={green} />
        <Metric label="方向" value="↑↓ 都行" bar={green} />
        <Metric label="走什麼" value="ws://" bar={blue} />
      </>
    }
  />
);

// ═════════════ 9. HTTP 狀態碼 ═════════════

const StatusCard = ({
  code,
  name,
  meaning,
  color,
  highlight,
}: {
  code: string;
  name: string;
  meaning: string;
  color: string;
  highlight?: boolean;
}) => (
  <div
    style={{
      flex: 1,
      background: highlight ? '#fdf0e3' : panel,
      border: `${highlight ? 3 : 2}px solid ${highlight ? ink : line}`,
      boxShadow: highlight ? `8px 8px 0 ${line}` : 'none',
      borderRadius: 'var(--osd-radius)',
      padding: '40px 40px 44px',
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 96, fontWeight: 800, color, lineHeight: 1 }}>{code}</div>
    <div style={{ fontFamily: mono, fontSize: 24, color: muted, marginTop: 16 }}>{name}</div>
    <div style={{ fontSize: 34, marginTop: 24, lineHeight: 1.4 }}>{meaning}</div>
  </div>
);

const StatusCodes: Page = () => (
  <Shell section="握手" title="200 跟 404 你一定看過" sub="101 比較少見，今天它是主角。">
    <div style={{ display: 'flex', gap: 36 }}>
      <StatusCard code="200" name="OK" meaning="成功，資料給你" color={green} />
      <StatusCard code="404" name="Not Found" meaning="找不到你要的東西" color={red} />
      <StatusCard code="101" name="Switching Protocols" meaning="可以，我們換個方式講" color="var(--osd-accent)" highlight />
    </div>
    <Card style={{ marginTop: 48 }}>
      <div style={{ fontSize: 32, lineHeight: 1.6 }}>
        App 先用 HTTP 問：「改用 WebSocket 好嗎？」
        <br />
        Server 回 <Kw>101</Kw>，意思就是「好」。
      </div>
    </Card>
  </Shell>
);

// ═════════════ 10. 握手流程 ═════════════

const Arrow = ({
  dir,
  label,
  sub,
  color,
}: {
  dir: 'right' | 'left' | 'both';
  label: ReactNode;
  sub?: ReactNode;
  color: string;
}) => {
  const head = (side: 'l' | 'r') => (
    <div
      style={{
        position: 'absolute',
        top: -9,
        [side === 'r' ? 'right' : 'left']: -2,
        width: 0,
        height: 0,
        borderTop: '11px solid transparent',
        borderBottom: '11px solid transparent',
        [side === 'r' ? 'borderLeft' : 'borderRight']: `20px solid ${color}`,
      }}
    />
  );
  return (
    <div>
      <div style={{ fontSize: 32, fontWeight: 800, color, textAlign: 'center', marginBottom: 12 }}>{label}</div>
      <div style={{ position: 'relative', height: 4, background: color, margin: '0 4px' }}>
        {(dir === 'right' || dir === 'both') && head('r')}
        {(dir === 'left' || dir === 'both') && head('l')}
      </div>
      {sub && (
        <div style={{ fontSize: 23, color: muted, textAlign: 'center', marginTop: 12, fontFamily: mono }}>{sub}</div>
      )}
    </div>
  );
};

const HsRow = ({ phone, children }: { phone: string; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', alignItems: 'center', height: 148 }}>
    <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--osd-accent)' }}>{phone}</div>
    <div style={{ padding: '0 120px' }}>{children}</div>
  </div>
);

const Actor = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      width: 240,
      textAlign: 'center',
      fontFamily: mono,
      fontSize: 26,
      fontWeight: 800,
      padding: '12px 0',
      border: `2.5px solid ${ink}`,
      borderRadius: 12,
      background: '#dde9fb',
    }}
  >
    {children}
  </div>
);

const Handshake: Page = () => (
  <Shell section="握手" title="先用 HTTP 撥號，接通後換成 WebSocket">
    <div style={{ position: 'relative', marginTop: -8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', marginBottom: 6 }}>
        <div />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Actor>Flutter App</Actor>
          <Actor>Server</Actor>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 360, top: 62, bottom: 0, width: 3, background: line }} />
      <div style={{ position: 'absolute', right: 120, top: 62, bottom: 0, width: 3, background: line }} />
      <Steps>
        <Step>
          <HsRow phone="① 撥號">
            <Arrow dir="right" color={ink} label="「我想改用 WebSocket」" sub="普通的 HTTP GET，多帶 Upgrade: websocket" />
          </HsRow>
        </Step>
        <Step>
          <HsRow phone="② 對方接起">
            <Arrow dir="left" color="var(--osd-accent)" label="「好，換過去」" sub="101 Switching Protocols" />
          </HsRow>
        </Step>
        <Step>
          <HsRow phone="③ 通話中">
            <Arrow dir="both" color={green} label="想送就送" sub="同一條連線，不用每次重發 HTTP" />
          </HsRow>
        </Step>
        <Step>
          <HsRow phone="④ 掛斷">
            <Arrow dir="right" color={grey} label="哪一邊先掛都可以" sub="Close" />
          </HsRow>
        </Step>
      </Steps>
    </div>
  </Shell>
);

// ═════════════ 11. curl 示範 ═════════════

const CurlDemo: Page = () => (
  <Shell section="握手" title={<>用 curl 看一次 <span style={{ color: 'var(--osd-accent)' }}>101</span></>} sub="講師現場打，大家看終端機。">
    <Steps>
      <Code size={28}>
        {`curl -i -N \\
  -H "Connection: Upgrade" \\
  -H "Upgrade: websocket" \\
  -H "Sec-WebSocket-Version: 13" \\
  -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \\
  "http://localhost:8080/ws?user=curl"`}
      </Code>
      <Step>
        <div style={{ marginTop: 28 }}>
          <Code size={28}>
            <span style={{ color: '#fbbf7a' }}>HTTP/1.1 101 Switching Protocols</span>
            {`
upgrade: websocket
connection: Upgrade
sec-websocket-accept: …`}
          </Code>
          <p style={{ fontSize: 28, color: muted, marginTop: 20 }}>指令停在這裡不會結束，因為電話還沒掛。</p>
        </div>
      </Step>
    </Steps>
  </Shell>
);

// ═════════════ 12. ws vs wss ═════════════

const SchemeCard = ({ scheme, like, phone, color, tint }: { scheme: string; like: string; phone: string; color: string; tint: string }) => (
  <div
    style={{
      flex: 1,
      background: tint,
      border: `2.5px solid ${ink}`,
      boxShadow: `8px 8px 0 ${line}`,
      borderRadius: 'var(--osd-radius)',
      padding: '44px 52px',
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 72, fontWeight: 800, color }}>{scheme}</div>
    <div style={{ fontSize: 34, marginTop: 20 }}>
      對應 <span style={{ fontFamily: mono }}>{like}</span>
    </div>
    <div style={{ fontSize: 30, color: muted, marginTop: 16 }}>{phone}</div>
  </div>
);

const Scheme: Page = () => (
  <Shell section="握手" title="ws:// 和 wss://">
    <div style={{ display: 'flex', gap: 48 }}>
      <SchemeCard scheme="ws://" like="http://" phone="沒加密，線路上的人都聽得到" color={muted} tint={panel} />
      <SchemeCard scheme="wss://" like="https://" phone="TLS 加密，只有兩邊聽得懂" color={green} tint="#e6f2e8" />
    </div>
    <p style={{ fontSize: 32, color: muted, marginTop: 52, lineHeight: 1.6 }}>
      上課用 <Kw>ws://localhost:8080</Kw>，比較好觀察。
      <br />
      正式上線為什麼一定要 <Kw>wss://</Kw>？下課前講。
    </p>
  </Shell>
);

// ═════════════ 13. 名字規則 ═════════════

const NameRow = ({ who, verdict, room, ok }: { who: ReactNode; verdict: string; room: ReactNode; ok: boolean }) => (
  <Card style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 36, alignItems: 'center', background: ok ? '#e6f2e8' : panel }}>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>{who}</div>
    <div>
      <div style={{ fontSize: 38, fontWeight: 800, color: ok ? green : red }}>{verdict}</div>
      <div style={{ fontSize: 30, color: muted, marginTop: 8 }}>{room}</div>
    </div>
  </Card>
);

const NameRule: Page = () => (
  <Shell section="實作" title="名字規則：Amy / Amy-2 = 同一人兩台裝置" sub="App 一打開會問「你的暱稱」，你輸入的名字會放進連線網址，Server 只看「-」前面那段，決定你是誰。">
    <p style={{ fontSize: 32, marginBottom: 32, lineHeight: 1.6 }}>
      連線網址：<Kw>ws://localhost:8080/ws?user=</Kw>
      <span style={{ color: 'var(--osd-accent)', fontFamily: mono, fontWeight: 800 }}>你輸入的名字</span>
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <NameRow
        ok
        who={
          <>
            <Pill tint="#fbe7b5">Amy</Pill>
            <Pill tint="#fbe7b5">Amy-2</Pill>
          </>
        }
        verdict="同一個人的兩台裝置"
        room={
          <>
            一起進私人房 <Kw>private:Amy</Kw>，互傳看得到；之後「兩兩一組」也會分在同一組
          </>
        }
      />
      <NameRow
        ok={false}
        who={
          <>
            <Pill tint="#fbe7b5">Amy</Pill>
            <Pill tint="#dfe8f7">Bob</Pill>
          </>
        }
        verdict="兩個不同的人"
        room={
          <>
            各進各的私人房 <Kw>private:Amy</Kw>、<Kw>private:Bob</Kw>，互傳看不到
          </>
        }
      />
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 40, lineHeight: 1.6 }}>
      為什麼要「-2」？你要開兩台模擬器自己跟自己聊，兩台不能同名，所以第二台在暱稱後面加「-2」。
      <br />
      只有分房這樣算。連線、手機上存的資料，Amy 和 Amy-2 還是各算各的。
    </p>
  </Shell>
);

// ═════════════ 14 / 16. 實作 ═════════════

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

const ImplA: Page = () => (
  <Shell section="實作" title="TODO ①② 先接通，送一句話試試" sub="私人房，開兩台模擬器：第一台 Amy，第二台 Amy-2（用你自己的名字）。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Todo n="1" title={<>在 <Kw>ChatController</Kw> 裡建立連線</>}>
        <Code size={25}>{`WebSocketChannel.connect(wsUrl(me))   // config.dart 已提供`}</Code>
      </Todo>
      <Todo n="2" title={<>用 <Kw>sink.add</Kw> 送純字串，<Kw>stream.listen</Kw> 收到就顯示</>}>
        <Hint>
          收到的訊息先放記憶體 List，再從 <Kw>Stream&lt;List&lt;Message&gt;&gt;</Kw> 推給畫面。<Kw>StreamBuilder</Kw> 已經接好了。
        </Hint>
      </Todo>
    </div>
    <Card style={{ marginTop: 44, background: '#fdf0e3' }}>
      <div style={{ fontSize: 30 }}>✋ 互傳成功的舉手。看一下兩邊的畫面，有沒有哪裡怪怪的？</div>
    </Card>
  </Shell>
);

const Midway: Page = () => (
  <Shell section="實作" title="PM 又來了">
    <Bubble who="PM" role="產品經理">
      「訊息旁邊要寫<b style={{ color: 'var(--osd-accent)' }}>是誰傳的</b>喔。」
    </Bubble>
    <div style={{ display: 'flex', gap: 40, marginTop: 52 }}>
      <div style={{ flex: 0.9 }}>
        <div style={{ fontSize: 26, color: red, fontWeight: 800, marginBottom: 14 }}>現在送出去的</div>
        <Code size={28}>{`"嗨"`}</Code>
        <ul style={{ fontSize: 28, color: muted, lineHeight: 1.7, marginTop: 20, paddingLeft: 36 }}>
          <li>看不出是誰講的</li>
          <li>看不出是聊天訊息，還是別種通知</li>
        </ul>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 26, color: green, fontWeight: 800, marginBottom: 14 }}>改成 JSON：送出</div>
        <Code size={26}>{`{
  "type": "send",
  "sender": "Amy",
  "text": "嗨"
}`}</Code>
      </div>
      <div style={{ flex: 1.1 }}>
        <div style={{ fontSize: 26, color: green, fontWeight: 800, marginBottom: 14 }}>收到（Server 轉來的）</div>
        <Code size={26}>{`{
  "type": "message",
  "sender": "Amy",
  "text": "嗨",
  "ts": 1764032400000,
  …
}`}</Code>
      </div>
    </div>
  </Shell>
);

const ImplB: Page = () => (
  <Shell section="實作" title="TODO ③④ 改成 JSON，最後記得掛電話">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Todo n="✓" title="①② 接通、送純字串" done />
      <Todo n="3" title={<>送出前 <Kw>jsonEncode</Kw>，收到先 <Kw>jsonDecode</Kw>，看 <Kw>type</Kw> 決定怎麼處理</>}>
        <Hint>
          <Kw>type</Kw> 是 <Kw>message</Kw> 才轉成 <Kw>Message</Kw>（sender / text / ts）放進列表
        </Hint>
      </Todo>
      <Todo n="4" title={<>在 <Kw>dispose</Kw> 取消訂閱、關掉連線</>}>
        <Hint>想想看：講完電話不掛，會發生什麼事？</Hint>
      </Todo>
    </div>
  </Shell>
);

// ═════════════ 16. 驗收 ═════════════

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

const Acceptance: Page = () => (
  <Shell section="驗收" title="這幾項都過了，就可以收工">
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Check>私人房兩台模擬器互傳，對方馬上看到</Check>
        <Check>每則訊息都有寫是誰傳的</Check>
        <Check>
          收到的 JSON 會看 <Kw>type</Kw>，不是 <Kw>message</Kw> 的不會被當成聊天訊息
        </Check>
        <Check>按 AppBar 的離開鈕回到名字頁後，講師儀表板上你變成離線</Check>
        <Check>最後全班切到大廳，大家互傳</Check>
      </div>
    </Card>
  </Shell>
);

// ═════════════ 17. 費曼檢核 ═════════════

const Feynman: Page = () => (
  <Shell section="費曼檢核" title="不看螢幕，講給隔壁聽" sub="兩人一組，一人一分鐘。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Card>
        <Goal n="Q1">用打電話來比喻，講出短輪詢、長輪詢、SSE、WebSocket 差在哪</Goal>
      </Card>
      <Card>
        <Goal n="Q2">WebSocket 是怎麼接通的？101 是什麼意思？</Goal>
      </Card>
      <Card>
        <Goal n="Q3">一開始送純字串，哪裡不夠用？</Goal>
      </Card>
    </div>
  </Shell>
);

// ═════════════ 18–19. 講師補充 ═════════════

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

const ExtraAuth: Page = () => (
  <Shell section="講師補充" title="WebSocket 要怎麼帶登入身分？">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Point tag="App 首選" title="握手時放在 header，跟打 API 一樣">
        <span style={{ fontFamily: mono, fontSize: 25, color: ink }}>
          IOWebSocketChannel.connect(uri, headers: {'{'}'Authorization': 'Bearer $token'{'}'})
        </span>
      </Point>
      <Point title={<>連上後，第一則先送 <Kw>{'{"type":"auth"}'}</Kw></>}>Server 驗證過之前不處理其他訊息，太久沒驗證就斷線。</Point>
      <Point title={<>不能設 header 才放網址：<Kw>/ws?token=…</Kw></>}>
        瀏覽器（包括 Flutter Web）不能自訂 header。網址會被記進 log，token 要短效。
      </Point>
    </div>
    <p style={{ fontSize: 27, color: muted, marginTop: 26 }}>
      上課用的 <Kw>?user=名字</Kw> 只是報上名字，沒有驗證，正式環境不能這樣做。
    </p>
  </Shell>
);

const ExtraWss: Page = () => (
  <Shell section="講師補充" title="正式上線為什麼一定要 wss://？">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Point title="訊息和 token 不會被偷看">在公共 Wi-Fi 上，ws:// 的內容、握手帶的 token 別人都看得到，也改得了。</Point>
      <Point title="比較不會被中間的設備擋掉">Proxy 和防火牆看不懂明文的 Upgrade 時可能直接擋。走 443 加 TLS，它們看不到內容，通常會放行。</Point>
      <Point title="手機平台預設就不讓你用明文">iOS 的 ATS、Android 9 以後都預設擋明文連線，用 ws:// 上架還得特別開例外。</Point>
    </div>
  </Shell>
);

// ═════════════ 21. 結尾鉤子 ═════════════

const Hook: Page = () => (
  <div style={fill}>
    <TopBar section="下集預告" />
    <div style={{ position: 'absolute', left: 120, top: 150 }}>
      <Pill tint="#f7d9d6">/zombie</Pill>
      <h2 style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.3, margin: '28px 0 0' }}>
        畫面一切正常，為什麼收不到訊息？
      </h2>
      <p style={{ fontSize: 32, color: muted, marginTop: 20 }}>下一堂：心跳和自動重連。打電話的時候，你怎麼確定對方還在？</p>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 70,
        background: '#faf6ee',
        border: `2px solid ${line}`,
        borderRadius: 'var(--osd-radius)',
        overflow: 'hidden',
      }}
    >
      <Scene mode="zombie" />
    </div>
  </div>
);

// ═════════════ 講稿（講師版：含參考答案、術語練習） ═════════════
// 格式：【時間】→ 要說的話 → 「術語」列給自己練發音和定義 → 參考答案（如果有）

export const notes: (string | undefined)[] = [
  // 1 Cover
  `開場前儀表板狀態（課前對一次）
□ 行為等級：「純字串」。Server 用 --data 啟動時會從 state.json 讀回上次的等級，一定要親手按一次。
□ 全域延遲：0 ms。
□ 分房：「私人房」（只搬在線學員，學員連上後再按一次）。
□ 實作中途：TODO ③ 改 JSON 之前切「第 1～3 堂：回音」；驗收最後切「大廳」。

【0:00】
大家好，接下來十堂我們從一條最陽春的 WebSocket 開始，一步一步做到接近 LINE 的聊天室架構。
今天只做一件事：讓訊息動起來。兩支手機，這邊打字，那邊馬上看到。

術語
・WebSocket：建立在 TCP 上、可以雙向即時傳輸的協議。`,

  // 2 Scenario
  `【0–2 分】
用 PM 的口氣唸：「先做個能即時互傳的版本就好。」
重點在「即時」。我們平常打 API 是 Request-Response，請求-回應：App 不問，Server 就不會講話。今天要解決的是 Server 怎麼主動把訊息推給 App，這叫 Server Push，伺服器推送。
三個目標唸過去就好，下課前回來對一次。

術語
・Request-Response（請求-回應）：Client 問一次，Server 答一次。
・Server Push（伺服器推送）：Server 主動把資料送給 Client。

可能被問到
問：為什麼不直接用 Firebase 或現成的聊天 SDK？
答：上線快的話當然可以用。但出問題時要能除錯，面試也會問底層。這門課會碰到的 ACK、seq、補洞，這些 SDK 裡面其實都有做，只是被包起來了。`,

  // 3 Evolution
  `【2–4 分】
這張叫能力演進表，之後每堂開場都會放。
我們現在在最左邊這欄，前四堂只有 WebSocket，沒有本地資料庫、沒有歷史 API。所以剛進房是空的、App 重開什麼都沒有。這些是故意先不做的。
今天不會打掉任何一個 ✗，今天是打地基。第 5 堂開始，每堂打掉一個。第 5 堂會加本地資料庫，讓它當 SSOT, Single Source of Truth，單一資料來源，畫面只看 DB。今天先記住這個名字。

術語
・SSOT, Single Source of Truth（單一資料來源）：第 5 堂的主角，先提一下名字就好。

可能被問到
問：為什麼不一開始就把 DB 加進來？
答：先讓大家親身遇到「重開全不見」，第 5 堂加 DB 時才知道它在解什麼。一次全上，很難分清楚哪段程式在處理哪個問題。`,

  // 4 Opening question
  `【4–5 分】開場提問
問全班：「要做即時聊天，你以前會怎麼做？」給一分鐘。
通常會有人說「一直打 API 問有沒有新訊息」。接著說：「對，這個做法叫短輪詢。我們就從它開始，看它卡在哪。」

參考答案：短輪詢 Short Polling，每隔幾秒打一次 GET。`,

  // 5 Short polling
  `【5–8 分】短輪詢
右邊的點點是請求。白色是 App 發出去的 GET，灰色是 Server 回的「沒有」，橘色才是真的有新訊息。
算一下：200 個人，每 3 秒打一次，就是每秒 67 個請求。大部分都白跑，所以 Server 變紅了。
而且訊息最慢要等 3 秒才看得到，這就是 latency。
把間隔縮短？延遲會變小，但請求量會再翻倍。這個取捨沒有好答案。
還有一筆隱藏成本：每次請求都要帶一整包 header，可能還要重建連線，內容明明只有一句「沒有」。這種跟內容無關的成本叫 Overhead，額外開銷。

實際用在哪（講完缺點，補一句「它不是不好，是看場景」）
・付款結果：使用者跳到第三方付款頁，回到 App 後，每隔幾秒問一次「這張訂單付成功了沒」。
・非同步任務進度：匯出報表、影片轉檔、檔案上傳後處理，App 每幾秒問一次 job 狀態，完成就停。
・物流、訂單狀態頁：更新慢，晚幾秒沒人在意。
・後台儀表板、CI 建置頁：固定間隔刷新。
共同點：更新不頻繁、可以晚幾秒、一個請求就能問完。

術語
・Short Polling（短輪詢）
・Latency（延遲）：訊息從送出到被看到的時間。
・Overhead（額外開銷）：每次 HTTP 請求都要帶 header、建連線，這些成本跟內容無關。

可能被問到
問：什麼情況下短輪詢反而是對的選擇？
答：更新不頻繁、晚幾秒也沒關係的場景，例如訂單狀態、每分鐘刷新的報表。它最簡單，Server 不用記狀態，好快取也好擴充。

問：輪詢間隔怎麼決定？
答：看能接受多少延遲、願意付多少成本。常見做法是前景短、背景長，或沒有新資料時逐漸拉長間隔。`,

  // 6 Long polling
  `【8–10 分】長輪詢
App 打過去，Server 不馬上回，先掛著。有新訊息才回應，App 收到後立刻再發一個新的請求。一直沒訊息的話，Server 掛到時間上限也要回一個空的，這叫 Timeout，逾時，App 收到就再打一次。
延遲變很短，白跑也少了。但兩個問題：Server 同時要掛著 200 條請求；每收一則訊息，就要重新建一次 HTTP 請求。
早期的 Facebook 網頁聊天、很多 Comet 架構都是這樣做的。

實際用在哪
・Telegram Bot API 的 getUpdates：帶 timeout 參數，Server 有新訊息才回，bot 收到後馬上再打一次。很多聊天機器人到現在都這樣收訊息。
・Socket.IO 的預設起手式：先走長輪詢連上，環境允許再升級成 WebSocket；公司 proxy 擋 WebSocket 時，就留在長輪詢當備案。
・AWS SQS 的 long polling：接收訊息時等到有訊息才回，省掉一直問空佇列的費用。
・Consul 的 blocking query：設定值有變動才回，用來讓服務即時拿到新設定。
共同點：要接近即時，但環境只能走一般 HTTP（proxy 擋 WebSocket、或對方只開 REST API）。

術語
・Long Polling（長輪詢）
・Comet：早期用 HTTP 長連線模擬推送的一系列技術的統稱。
・Timeout（逾時）：Server 掛太久沒訊息，也要回一個空回應，不然 proxy 會先把它斷掉。

可能被問到
問：Server 為什麼要在一段時間後回空回應？
答：負載平衡器和 proxy 通常有閒置逾時，連線太久沒資料會被切掉。與其被中間設備莫名斷線，不如 Server 自己先回，App 再重打。

問：長輪詢現在還有人用嗎？
答：有，多半當備案。像 Socket.IO 預設先用 HTTP 長輪詢連上，確認環境允許後再升級成 WebSocket。`,

  // 7 SSE
  `【10–12 分】SSE
SSE，全名 Server-Sent Events，伺服器推送事件。App 發一次 GET，Server 回一個 Content-Type 是 text/event-stream 的回應，而且一直不結束，有東西就往下寫。
它還是 HTTP，瀏覽器原生就支援，還會自動重連。適合股價、比分、通知這種只需要 Server 往下推的場景。這種只有一個方向的傳輸叫 Unidirectional，單向。
但聊天要雙向。App 想送訊息，得另外打一個 POST，等於一條收音機加一支電話。

實際用在哪
・ChatGPT、各家 LLM API 的串流回應：一個字一個字跑出來，是 Server 一直往下推。使用者送出問題是另一個 POST，正好符合「單向推送 + 另外打一通」。
・即時比分、股價、匯率看板：只需要 Server 往下推，使用者不用回話。
・部署或 CI 的即時 log：build 輸出一行行推到網頁上。
・通知、站內信、進度條：Server 有事才推。
共同點：資料只往一個方向流，而且想要瀏覽器原生支援、自動重連。

術語
・SSE, Server-Sent Events（伺服器推送事件）
・Unidirectional（單向）
・text/event-stream：SSE 回應的 Content-Type。

可能被問到
問：SSE 有什麼限制？
答：只能傳文字；瀏覽器原生的 EventSource 不能自訂 header；在 HTTP/1.1 下，瀏覽器對同一個網域的連線數有上限，開太多分頁會卡住，HTTP/2 就沒這個問題。

問：SSE 斷線會怎樣？
答：EventSource 會自動重連，還會帶 Last-Event-ID header，讓 Server 從上次斷掉的地方接著送。

問：生活中哪裡看得到 SSE？
答：ChatGPT 那種一個字一個字跑出來的回應，OpenAI 的 API 就是用 SSE 串流。`,

  // 8 WebSocket
  `【12–14 分】WebSocket
接通一次之後，同一條連線兩邊都可以隨時送。這叫 full-duplex，全雙工。
這種接通後一直不掛的連線叫 Persistent Connection，長連線。Server 負載最低，因為沒有一直重建連線；延遲也最低。
面試常問的一句話：SSE 適合單向推送，WebSocket 適合雙向互動。聊天室兩邊都會講話，所以選 WebSocket。

實際用在哪
・即時通訊：Slack、Discord 的即時事件都走 WebSocket（Discord 的 Gateway 就是一條 WebSocket）。
・多人協作編輯：同一份文件、設計稿，多人的游標和修改要雙向即時同步。
・行情與交易：加密貨幣交易所、券商的報價推送，也常讓使用者下單走同一條連線。
・多人線上遊戲、直播互動（彈幕、送禮）：高頻、雙向、延遲要低。
・客服系統、線上客服視窗：客人和客服來回講話。
共同點：雙向、高頻、延遲敏感；兩邊都可能隨時開口。

一頁收尾（5–8 頁串起來）：怎麼選？
更新慢、問一次就夠 → 短輪詢；要接近即時但只能走一般 HTTP → 長輪詢；只需要 Server 往下推 → SSE；雙向又高頻 → WebSocket。
同一個產品常常混用：ChatGPT 的回答串流用 SSE，Slack 的聊天用 WebSocket，付款結果用輪詢。

術語
・Full-duplex（全雙工）：兩邊可以同時送和收。對比 half-duplex 半雙工，像對講機一次只能一個人講。
・Persistent Connection（長連線）

可能被問到
問：WebSocket 跟一般的 TCP socket 差在哪？
答：WebSocket 跑在 TCP 上面，多了握手、訊框格式和遮罩規則。好處是走 80/443，能穿過一般的 HTTP 基礎設施；裸 TCP 常被防火牆擋。

問：WebSocket 是有狀態的，擴充 Server 時難在哪？
答：使用者連在不同機器上，要廣播就得靠中間的訊息管道，例如 Redis Pub/Sub 或 Kafka，讓每台機器都收到再轉給自己身上的連線。另外部署重啟會一次斷掉一大批連線，這接到第 2 堂的重連和 Jitter。

問：一台 Server 能撐多少條連線？
答：沒有固定數字，看記憶體、檔案描述元上限和訊息量。閒置連線主要吃記憶體。實務上是壓測決定，再水平擴充。`,

  // 9 Status codes
  `【14–15 分】
先問：「打 API 最常看到哪些狀態碼？」大家會說 200、404、500。
1 開頭的叫 Informational Response，資訊性回應，平常幾乎看不到。101 是 Switching Protocols，意思是 Server 同意換協議。
比喻：你打客服總機（HTTP）說「幫我轉專線」，總機說「好，幫你轉」，這句就是 101。轉過去之後你講話就不經過總機了。

術語
・Status Code（狀態碼）
・Informational Response（1xx 資訊性回應）
・Switching Protocols（101 切換協議）

可能被問到
問：還有哪些 1xx 狀態碼？
答：100 Continue，上傳大檔前先確認 Server 願意收；103 Early Hints，讓瀏覽器先開始抓 CSS、JS。`,

  // 10 Handshake
  `【15–18 分】握手，一步一步按出來
① App 發一個普通的 HTTP GET，多帶兩個 header：Connection: Upgrade 跟 Upgrade: websocket，這組叫 Upgrade Header，升級標頭。意思是「我想升級成 WebSocket」。另外還會帶一個隨機的 Sec-WebSocket-Key。
② Server 同意就回 101，順便回 Sec-WebSocket-Accept，這是拿 Key 算出來的，用來證明 Server 真的懂 WebSocket。學員有問再講。
③ 之後同一條 TCP 連線上傳的是 WebSocket 的 Frame，訊框，就是一小包一小包的資料，沒有 HTTP header，所以很輕。
④ 任一邊送 Close frame 就結束。
一句話收尾：WebSocket 用 HTTP 撥號，接通後就不是 HTTP 了。

術語
・Handshake（握手）
・Upgrade Header（升級標頭）
・Frame（訊框）：WebSocket 傳資料的單位。
・TCP Connection（TCP 連線）：WebSocket 底下真正的那條線。

可能被問到
問：Sec-WebSocket-Key 是拿來做安全驗證的嗎？
答：不是。它不加密也不驗證身分，只是確認對方真的是 WebSocket Server，避免一般 HTTP Server 或快取誤回。Accept 的算法是把 Key 接上一個固定的 GUID，做 SHA-1 再 base64。

問：為什麼 Client 送出的 frame 一定要 mask？
答：規格要求 Client 到 Server 的 frame 要遮罩，用來防止惡意網頁利用不懂 WebSocket 的中間代理做快取污染。Server 送給 Client 的不用遮罩。

問：HTTP/2 可以跑 WebSocket 嗎？
答：可以，RFC 8441 定義了用 Extended CONNECT 在 HTTP/2 上開 WebSocket，但大部分情況還是 HTTP/1.1 的 Upgrade。`,

  // 11 Curl
  `【18–19 分】現場示範
Server 已經在 8080 跑。先只秀指令，在終端機貼上執行，再按 → 對照結果。
-i 是把回應的狀態列和 header 印出來，-N 是不要緩衝。看到 101 之後指令會停住，這就是連線沒斷。Ctrl+C 結束。
名字用 curl，避免跟學員撞名，同名在線 Server 會拒絕。

術語
・curl：命令列的 HTTP 工具。

可能被問到
問：網址為什麼寫 http:// 不是 ws://？
答：握手本來就是一個 HTTP 請求。curl 要比較新的版本才有實驗性的 ws:// 支援，所以這裡用 http:// 手動帶 header 最穩。

問：還有什麼工具可以測 WebSocket？
答：websocat、wscat、Postman，或瀏覽器 DevTools 的 Network 裡選 WS，可以看到每一個 frame。`,

  // 12 Scheme
  `【19–20 分】
ws 對 http，wss 對 https，差在有沒有 TLS 加密。TLS 是 Transport Layer Security，傳輸層安全協定。沒加密的 ws 傳的是 Plaintext，明文，路上誰都看得到。
正式環境為什麼一定要 wss，先不講，留到下課前。

術語
・TLS, Transport Layer Security（傳輸層安全協定）
・Plaintext / Cleartext（明文）

可能被問到
問：本機開發也要用 wss 嗎？
答：通常不用。真的要測，可以用 mkcert 做本機信任的憑證，或用 ngrok 這類通道服務拿一個 https 網址。`,

  // 13 NameRule
  `【20 分】名字規則（實作前一分鐘）
Server 用名字「-」前面那段決定你是誰：Amy 和 Amy-2 是同一人的兩台裝置，會進同一間私人房 private:Amy；之後第 5 堂「兩兩一組」也會被分在同一組。
Amy 和 Bob 是兩個人，各進各的私人房，互傳看不到。今天要開兩台模擬器互傳，所以第二台一定要用「名字-2」。
只有分房這樣算。同名不能同時在線（Server 回 409）、手機上存的資料，Amy 和 Amy-2 還是各算各的。第 6、9、10 堂都會回來引用這一頁。

可能被問到
問：為什麼不讓 Amy 和 Bob 直接互傳？
答：第 1～4 堂故意讓每個人只跟自己的另一台裝置聊，畫面乾淨、好除錯。第 5 堂才兩兩分組，第 8 堂有房間列表後就能自由開房。`,

  // 13 ImplA
  `【20–32 分】實作開始
先確認儀表板行為等級是「純字串」，再把每個人分到私人房。開兩台模擬器，照上一頁的名字規則：第一台用自己的名字，第二台用「名字-2」，例如 Amy、Amy-2。
① 用 web_socket_channel 連線：WebSocketChannel.connect(wsUrl(me))。wsUrl 在 config.dart，會幫你帶 ?user=名字、處理中文名字的編碼，Android 模擬器的 host 也已經換成 10.0.2.2，不要自己手刻網址。
② 先送純字串，寫進 channel.sink。Sink 是輸入端，往連線裡寫資料的那一頭。listen 收到就加進 List，再推到 Stream。
等多數人成功，問「兩邊畫面有沒有哪裡怪怪的？」

參考答案：兩邊都顯示「嗨」，看不出是誰講的。

術語
・Sink（輸入端）：往連線裡寫資料的那一頭。
・Stream / Subscription（串流 / 訂閱）

可能被問到
問：Android 模擬器為什麼要用 10.0.2.2？
答：模擬器裡的 localhost 指的是模擬器自己。10.0.2.2 是 Android 模擬器提供的別名，指向電腦本機。iOS 模擬器跟電腦共用網路，所以 localhost 就可以。

問：怎麼知道連線成功或失敗？
答：web_socket_channel 有 channel.ready 這個 Future，連不上會拋錯；之後斷線會從 stream 的 onError 或 onDone 收到。

問：為什麼用 Stream 推給畫面，不直接 setState？
答：讓 Controller 跟 UI 分開。第 5 堂把資料來源換成 DB 時，畫面一行都不用改。`,

  // 14 Midway
  `【32–35 分】中途追加
用 PM 的語氣唸需求。讓學員自己講純字串的問題：分不出是誰、分不出是什麼事件。之後還會有 ack、ping、read 這些事件。
業界做法：每一則 WebSocket 訊息都是有 type 的 JSON，有人叫它 Envelope，訊息信封。收到先看 type 再分派。送出前要把 Dart 物件轉成 JSON 字串，這叫 Serialization，序列化，jsonEncode 就是在做這件事。
欄位以當天 Server 為準。送出用 type 是 send；Server 轉給大家時 type 是 message，還多帶一個 ts（時間），Message 需要它。其他欄位今天先不管。

術語
・Envelope（訊息信封）：外層固定格式，裡面再放各種內容。
・Message Type / Dispatch（訊息類型 / 分派）
・Serialization（序列化）：物件轉成字串，jsonEncode 就是在做這件事。

可能被問到
問：為什麼用 JSON，不用 protobuf 這類二進位格式？
答：JSON 好讀好除錯，起步最快。量大以後可以換二進位省頻寬，有 schema 也比較不怕欄位打錯。像 Telegram 就用自家的二進位協議 MTProto。

問：type 用字串還是數字？
答：字串好讀，數字省空間。教學和一般 App 用字串就夠了。`,

  // 15 ImplB
  `【35–50 分】
開始做 ③ 之前，講師在儀表板把行為等級切到「第 1～3 堂：回音」。還停在純字串的話，學員改成 JSON 後收到的仍是純文字，jsonDecode 會拋例外，畫面沒訊息。
③ 送出前 jsonEncode；收到先 jsonDecode，把字串轉回物件，這叫 Deserialization，反序列化，再用 switch 看 type。
④ dispose 裡先 cancel subscription，再 sink.close()。用完主動關掉，叫 Resource Disposal，資源釋放。
問：「講完電話不掛會怎樣？」

參考答案：Server 以為你還在線，socket 跟 timer 一直佔資源；反覆進出頁面會越開越多條連線，同一則訊息會收到好幾次。這就是 Resource Leak，資源洩漏；佔住的記憶體一直回收不了，也叫 Memory Leak。

術語
・Deserialization（反序列化）
・Resource Disposal（資源釋放）
・Memory Leak / Resource Leak（記憶體洩漏 / 資源洩漏）

可能被問到
問：dispose 裡先取消訂閱，還是先關連線？
答：先取消訂閱。不然 close 之後還可能收到 onDone 或 onError 回呼，回頭去碰已經被釋放的東西。

問：App 切到背景要不要主動關連線？
答：第 2 堂會講。手機切到背景後，系統很快就會暫停 App，連線實際上會斷，所以重點是回到前景時能自己接回來。`,

  // 16 Acceptance
  `【50–55 分】驗收和大廳時刻
前四項自己檢查。第四項請大家按 AppBar 的離開鈕回到名字頁，講師看儀表板確認你的名字變成離線。
連線斷掉時橫幅會寫「自動重連中…」，但第 1 堂其實還不會重連，第 2 堂才做，先口頭提醒一下。
最後講師把全班切到大廳，大家一起互傳。`,

  // 17 Feynman
  `【55–57 分】費曼檢核
兩兩互講，一人一分鐘，抽一兩組講給全班聽。

參考答案
Q1：短輪詢是一直打電話問；長輪詢是打過去等對方開口，講完掛掉再打；SSE 像收音機，只能聽不能回；WebSocket 是電話接通不掛，兩邊隨時講。
Q2：先發 HTTP GET 帶 Upgrade: websocket，Server 回 101 Switching Protocols 表示同意，之後在同一條 TCP 連線上傳 frame。
Q3：分不出傳送者，也分不出事件種類，所以要有 type 的結構化格式。`,

  // 18 ExtraAuth
  `【57–58 分】講師補充
握手本身就是一個 HTTP 請求，所以 App 最自然的做法是把 token 放在 Authorization Header，授權標頭，用 Bearer Token 的格式。Bearer 是持有者，誰拿著這個 token 誰就能用，跟打 REST API 一模一樣。web_socket_channel 用 IOWebSocketChannel.connect，帶 headers 參數。
第二種是連上後第一則送 auth 訊息，Server 沒驗證過就不轉任何東西給你，而且要設逾時。
第三種是放 Query String，查詢字串，就是網址問號後面那段，只有瀏覽器不能設 header 時才用。Nginx、CDN 的 Access Log，存取紀錄，會記下完整網址，所以 token 要短效。
token 過期，英文叫 Token Expiry：Server 可以送一個事件要求重新驗證，或直接斷線，讓 App 先 Refresh 拿新 token 再重連，這會接到下一堂的重連。

術語
・Bearer Token（持有者權杖）
・Authorization Header（授權標頭）
・Query String（查詢字串）
・Access Log（存取紀錄）
・Token Expiry / Refresh（權杖過期 / 更新）

可能被問到
問：token 放 header 跟放 cookie 差在哪？
答：瀏覽器會自動帶 cookie，方便但有風險：別的網站也能讓你的瀏覽器帶著 cookie 發起 WebSocket，這叫 Cross-Site WebSocket Hijacking。用 cookie 的話，Server 握手時一定要檢查 Origin。App 沒有這個問題，用 header 最直接。

問：使用者中途登出或換帳號怎麼辦？
答：直接關掉舊連線，用新的 token 重新連。不要在同一條連線上切換身分。`,

  // 19 ExtraWss
  `【58–59 分】講師補充
三個理由：
一、安全。明文會被看、被改，這叫中間人攻擊。
二、穿透率。很多企業 proxy、電信設備只認得 HTTP，看到 Upgrade 可能擋掉或亂改。包在 TLS 裡走 Port 443，也就是 https 用的那個埠，它們看不到內容，通常會放行。
三、平台政策。iOS 有 ATS（App Transport Security），預設擋掉不加密的連線；Android 9 起 cleartextTrafficPermitted 預設是 false，也就是預設不准 Cleartext Traffic，明文流量。
上課用 ws:// 是為了能用 curl 和抓包看清楚內容。

術語
・MITM, Man-in-the-Middle（中間人攻擊）
・ATS（App Transport Security）
・Cleartext Traffic（明文流量）
・Port 443

可能被問到
問：wss 會不會比較慢？
答：只有連線時多一次 TLS 握手，TLS 1.3 只多一個來回。連上之後加解密的成本很小，而且長連線只付一次，幾乎感覺不到。`,

  // 21 Hook
  `【60 分】結尾鉤子
講師在儀表板對一位學員下 /zombie，例如 /zombie Amy。請其他人傳訊息。
Amy 的畫面看起來完全正常，沒有斷線提示，可是什麼都收不到。
問全班：「為什麼？App 怎麼不知道自己斷了？」不給答案，下堂課講。

講師自己知道的答案：TCP 連線可能變成 Zombie Connection，殭屍連線，半死不活。App 不主動確認就不會發現，所以要做 Heartbeat，心跳，定時 ping/pong。

術語
・Zombie Connection（殭屍連線）
・Heartbeat / Ping-Pong（心跳）

講師自己複習（面試關鍵字，不用講給學員）
・Full-duplex：連線兩端可以同時收發。
・HTTP Upgrade (101)：用 HTTP 請求要求換協議，Server 回 101 表示同意。
・Polling vs SSE vs WebSocket：輪詢靠 Client 一直問；SSE 是 Server 單向推；WebSocket 是雙向長連線。
・Resource Disposal：不用的連線、訂閱、計時器要主動關掉，避免洩漏。

可能被問到
問：TCP 不是有 keepalive 嗎，為什麼還要自己做心跳？
答：TCP keepalive 預設間隔很長，Linux 預設閒置兩小時才開始探測，而且 App 這層感知不到。所以聊天 App 都在應用層自己做 ping/pong。`,
];

export const meta: SlideMeta = {
  title: '第 01 堂｜接通 + 收發（等角圖解版）',
  createdAt: '2026-11-23T03:28:44.812Z',
};

export default [
  Cover,
  Scenario,
  Evolution,
  OpeningQuestion,
  ShortPolling,
  LongPolling,
  Sse,
  WebSocketPage,
  StatusCodes,
  Handshake,
  CurlDemo,
  Scheme,
  NameRule,
  ImplA,
  Midway,
  ImplB,
  Acceptance,
  Feynman,
  ExtraAuth,
  ExtraWss,
  Hook,
] satisfies Page[];
