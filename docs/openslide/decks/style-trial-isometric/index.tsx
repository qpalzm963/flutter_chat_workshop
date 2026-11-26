import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 版型試作：等角圖解（isometric）風格
// 題材：第 1 堂「App 怎麼知道有新訊息？」四種做法，一頁一步。
// 指標數字為示意（200 人、每 3 秒輪詢 → 67 次/秒）。
// ─────────────────────────────────────────────────────────────

export const design: DesignSystem = {
  palette: { bg: '#f5efe4', text: '#2d2a26', accent: '#e07a3f' },
  fonts: {
    display: '"SF Mono", "JetBrains Mono", Menlo, "PingFang TC", monospace',
    body: '"SF Mono", "JetBrains Mono", Menlo, "PingFang TC", monospace',
  },
  typeScale: { hero: 72, body: 28 },
  radius: 14,
};

const ink = '#2d2a26';
const muted = '#8a8173';
const panel = '#fbf8f2';
const line = '#d9cfbf';
const green = '#4f9d69';
const red = '#d0574f';
const blue = '#5b84c9';
const grey = '#a79f92';

type Mode = 'short' | 'long' | 'sse' | 'ws';

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

// ───────────── 頂列 ─────────────

const Pill = ({ children, tint }: { children: ReactNode; tint: string }) => (
  <span
    style={{
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

const TopBar = () => (
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
    <div style={{ fontSize: 28, fontWeight: 800, display: 'flex', gap: 16, alignItems: 'center' }}>
      <span style={{ fontSize: 30 }}>☰</span>
      <span>即時聊天室 · 系統圖解</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#fbe7b5">⏱ 15 min</Pill>
      <Pill tint="#d6ecd9">Lesson 01</Pill>
      <Pill tint="#e3dcf5">4 steps</Pill>
    </div>
  </div>
);

// ───────────── 指標卡 ─────────────

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
    <div style={{ fontSize: 20, color: muted, letterSpacing: '0.04em' }}>{label}</div>
    <div style={{ fontSize: 34, fontWeight: 800, marginTop: 4 }}>{value}</div>
  </div>
);

// ───────────── 等角場景 ─────────────

const Cube = ({
  cx,
  cy,
  s,
  hot,
  label,
}: {
  cx: number;
  cy: number;
  s: number;
  hot?: boolean;
  label: string;
}) => {
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
      {/* 機櫃圖示 */}
      <rect x={cx - 22} y={cy - s / 2 - 22} width="44" height="16" rx="3" fill="none" stroke={ink} strokeWidth="3" />
      <rect x={cx - 22} y={cy - s / 2} width="44" height="16" rx="3" fill="none" stroke={ink} strokeWidth="3" />
      <text x={cx} y={cy + s * 0.42} textAnchor="middle" fontSize="30" fontWeight="800" fill={ink}>
        {label}
      </text>
    </g>
  );
};

const LoadBadge = ({ x, y, pct }: { x: number; y: number; pct: number }) => {
  const color = pct >= 70 ? red : pct >= 40 ? '#d79a2b' : grey;
  return (
    <g>
      <rect x={x} y={y} width="200" height="44" rx="22" fill={panel} stroke={ink} strokeWidth="2.5" />
      <circle cx={x + 24} cy={y + 22} r="8" fill={ink} />
      <rect x={x + 42} y={y + 17} width="90" height="10" rx="5" fill="#e6ded0" />
      <rect x={x + 42} y={y + 17} width={0.9 * pct} height="10" rx="5" fill={color} />
      <text x={x + 182} y={y + 30} textAnchor="end" fontSize="20" fontWeight="800" fill={ink}>
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

// 連線路徑（場景座標，viewBox 1680×470）
const UP = 'M 560 250 L 1150 150';
const DOWN = 'M 1150 200 L 560 300';

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

const Scene = ({ mode }: { mode: Mode }) => {
  const load = mode === 'short' ? 85 : mode === 'long' ? 50 : 15;
  return (
    <svg width="1680" height="470" viewBox="0 0 1680 470" style={{ display: 'block' }}>
      <defs>
        <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="#e2d9c9" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="1680" height="470" fill="url(#dots)" />

      {mode === 'ws' && (
        <line x1="560" y1="275" x2="1150" y2="175" stroke={green} strokeWidth="34" strokeLinecap="round" opacity="0.18" />
      )}
      {mode !== 'ws' && (
        <>
          <path d={UP} stroke={line} strokeWidth="3" strokeDasharray="8 10" fill="none" />
          <path d={DOWN} stroke={line} strokeWidth="3" strokeDasharray="8 10" fill="none" />
        </>
      )}

      <Platform cx={380} cy={300} />
      <Cube cx={1270} cy={190} s={130} hot={mode === 'short'} label="Server" />
      <LoadBadge x={1170} y={14} pct={load} />

      <rect x={262} y={440} width="236" height="0" fill="none" />

      {mode === 'short' && (
        <>
          <PathLabel x={830} y={168}>GET /messages ×200 人</PathLabel>
          <PathLabel x={880} y={300}>「沒有」×199</PathLabel>
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
          <PathLabel x={830} y={168}>GET /messages（掛著等）</PathLabel>
          <PathLabel x={880} y={300}>有訊息才回，回完再打一次</PathLabel>
          <Dot path={UP} dur={3} begin={0} color="#fff" hold />
          <Dot path={UP} dur={3} begin={1.5} color="#fff" hold />
          <Dot path={DOWN} dur={1.5} begin={0.9} color="var(--osd-accent)" />
        </>
      )}
      {mode === 'sse' && (
        <>
          <PathLabel x={830} y={168}>GET /events（只打一次）</PathLabel>
          <PathLabel x={880} y={300}>Server 一直推 → 只能聽</PathLabel>
          <Dot path={DOWN} dur={1.6} begin={0} color="var(--osd-accent)" />
          <Dot path={DOWN} dur={1.6} begin={0.55} color="var(--osd-accent)" />
          <Dot path={DOWN} dur={1.6} begin={1.1} color="var(--osd-accent)" />
        </>
      )}
      {mode === 'ws' && (
        <>
          <PathLabel x={830} y={168} color={green}>
            一條不掛斷的連線（全雙工）
          </PathLabel>
          <Dot path="M 560 275 L 1150 175" dur={1.4} begin={0} color="#fff" />
          <Dot path="M 560 275 L 1150 175" dur={1.4} begin={0.9} color="#fff" />
          <Dot path="M 1150 175 L 560 275" dur={1.4} begin={0.4} color="var(--osd-accent)" />
          <Dot path="M 1150 175 L 560 275" dur={1.4} begin={1.1} color="var(--osd-accent)" />
        </>
      )}

      {/* 使用者標籤 */}
      <rect x={270} y={418} width="220" height="44" rx="22" fill={panel} stroke={ink} strokeWidth="2.5" />
      <text x={380} y={448} textAnchor="middle" fontSize="22" fontWeight="800" fill={ink}>
        👥 200 位使用者
      </text>
    </svg>
  );
};

// ───────────── 圖例 + 步驟列 ─────────────

const LegendItem = ({ color, children }: { color: string; children: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
    <span
      style={{ width: 18, height: 18, borderRadius: 999, background: color, border: `2.5px solid ${ink}`, display: 'inline-block' }}
    />
    {children}
  </span>
);

const StepDot = ({ n, label, state }: { n: number; label: string; state: 'done' | 'current' | 'todo' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 999,
        border: `3px solid ${state === 'todo' ? line : ink}`,
        background: state === 'current' ? '#cfe8d3' : state === 'done' ? '#e9e2d5' : panel,
        boxShadow: state === 'current' ? `0 0 0 6px rgba(79,157,105,0.25)` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
  const st = (n: number) => (n < current ? 'done' : n === current ? 'current' : 'todo') as 'done' | 'current' | 'todo';
  return (
    <div style={{ position: 'absolute', left: 120, right: 120, bottom: 44 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: muted, letterSpacing: '0.12em' }}>
        <span style={{ fontWeight: 800, color: ink }}>本堂步驟</span>
        <span>Step {current} of 4</span>
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

// ───────────── 版型 ─────────────

const Layout = ({
  title,
  subtitle,
  metrics,
  mode,
  step,
}: {
  title: string;
  subtitle: string;
  metrics: ReactNode;
  mode: Mode;
  step: number;
}) => (
  <div style={fill}>
    <TopBar />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 118 }}>
      <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 'var(--osd-size-hero)', fontWeight: 900, margin: 0, lineHeight: 1.15 }}>
        {title}
      </h1>
      <p style={{ fontSize: 'var(--osd-size-body)', color: muted, margin: '10px 0 0' }}>{subtitle}</p>
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
        <span style={{ marginLeft: 'auto' }}>＊數字為示意</span>
      </div>
    </div>
    <Stepper current={step} />
  </div>
);

// ───────────── 四頁 ─────────────

const ShortPolling: Page = () => (
  <Layout
    title="短輪詢：一直打電話問「到了沒」"
    subtitle="每 3 秒打一次 REST API，絕大多數都是白跑。"
    mode="short"
    step={1}
    metrics={
      <>
        <Metric label="在線人數" value="200" bar={ink} />
        <Metric label="每秒請求" value="67 次" bar={red} />
        <Metric label="訊息延遲" value="最多 3 s" bar={red} />
        <Metric label="白跑比例" value="~99%" bar={red} />
        <Metric label="使用技術" value="HTTP API" bar={blue} />
      </>
    }
  />
);

const LongPolling: Page = () => (
  <Layout
    title="長輪詢：打過去，等對方開口"
    subtitle="Server 有訊息才回；回完 App 馬上再打一次。"
    mode="long"
    step={2}
    metrics={
      <>
        <Metric label="在線人數" value="200" bar={ink} />
        <Metric label="掛著的請求" value="200 條" bar="#d79a2b" />
        <Metric label="訊息延遲" value="幾乎即時" bar={green} />
        <Metric label="每則訊息" value="重打一次" bar="#d79a2b" />
        <Metric label="使用技術" value="HTTP API" bar={blue} />
      </>
    }
  />
);

const Sse: Page = () => (
  <Layout
    title="SSE：收聽廣播電台"
    subtitle="打一次就一直收，但 App 要說話得另外發請求。"
    mode="sse"
    step={3}
    metrics={
      <>
        <Metric label="在線人數" value="200" bar={ink} />
        <Metric label="每秒請求" value="≈ 0" bar={green} />
        <Metric label="訊息延遲" value="即時" bar={green} />
        <Metric label="方向" value="單向 ↓" bar="#d79a2b" />
        <Metric label="使用技術" value="HTTP" bar={blue} />
      </>
    }
  />
);

const WebSocketPage: Page = () => (
  <Layout
    title="WebSocket：一通不掛斷的電話"
    subtitle="接通一次，雙方隨時都能說。聊天室選它。"
    mode="ws"
    step={4}
    metrics={
      <>
        <Metric label="在線人數" value="200" bar={ink} />
        <Metric label="長連線" value="200 條" bar={green} />
        <Metric label="訊息延遲" value="即時" bar={green} />
        <Metric label="方向" value="雙向 ⇅" bar={green} />
        <Metric label="使用技術" value="ws://" bar={blue} />
      </>
    }
  />
);

export const notes: (string | undefined)[] = [
  `版型試作。67 次/秒 = 200 人 ÷ 每 3 秒一次。99% 白跑是示意：大部分時間沒有新訊息。
Server 變紅代表負載被白跑的請求吃掉。`,
  `長輪詢：Server 先不回（點停在 Server 旁），有訊息才回，App 收到後立刻再打一次。
問題：每則訊息都要重建一次 HTTP 請求；Server 要同時掛著 200 條請求。`,
  `SSE：一次 GET 之後 Server 持續推送，適合股價、通知。App 要送訊息得另外 POST，所以不適合聊天。`,
  `WebSocket：握手一次後同一條連線雙向傳，Server 負載最低、延遲最低。下一頁接握手流程（101）。`,
];

export const meta: SlideMeta = {
  title: '版型試作｜等角圖解',
  createdAt: '2026-11-23T03:24:12.071Z',
};

export default [ShortPolling, LongPolling, Sse, WebSocketPage] satisfies Page[];
