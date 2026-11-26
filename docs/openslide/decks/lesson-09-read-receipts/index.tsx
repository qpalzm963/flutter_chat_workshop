import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 第 9 堂：已讀 + 未讀（水位線、已讀 N、未讀數、未讀定位）
// 學員看得到的頁面只放題目；參考答案和講稿都在 `notes`。
// 共用元件從第 8 堂複製，第 9 堂專用元件在後半段。
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
      <span>即時聊天室 · 第 9 堂</span>
      <span style={{ color: muted, fontWeight: 500 }}>/ {section}</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#dde9fb">Lesson 09</Pill>
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

const BigQuestion = ({
  tag,
  tagColor,
  children,
  foot,
  hint,
}: {
  tag: string;
  tagColor: string;
  children: ReactNode;
  foot: ReactNode;
  hint?: ReactNode;
}) => (
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
      <p style={{ fontSize: 34, color: muted, marginTop: 44, lineHeight: 1.5 }}>{foot}</p>
      {hint && (
        <Steps>
          <Step>
            <p style={{ fontSize: 34, color: ink, fontWeight: 700, marginTop: 20, lineHeight: 1.5 }}>{hint}</p>
          </Step>
        </Steps>
      )}
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
type PMsg = { t: string; mine?: boolean; st?: St; seq?: number; hot?: boolean; who?: string; read?: string; divider?: boolean };

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
          {msgs.map((m, i) => m.divider ? (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: 'var(--osd-accent)' }}>
              <span style={{ flex: 1, height: 2, background: 'var(--osd-accent)' }} />
              {m.t}
              <span style={{ flex: 1, height: 2, background: 'var(--osd-accent)' }} />
            </div>
          ) : (
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
                {m.read ? <b style={{ color: blue }}>{m.read} · </b> : null}
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

// 循序圖：每個 item 一列。
// 第 7 堂起分層：泳道一層，每個 item 各一層。index < stepFrom 的一開始就顯示，其餘每按一次 → 出現一個。
const SeqDiagram = ({
  lanes,
  items,
  w = 1680,
  rowH = 58,
  pad = 150,
  stepFrom,
}: {
  lanes: string[];
  items: SeqItem[];
  w?: number;
  rowH?: number;
  pad?: number;
  stepFrom?: number;
}) => {
  const top = 92;
  const h = top + items.length * rowH + 20;
  const xs = lanes.map((_, i) => pad + (i * (w - pad * 2)) / (lanes.length - 1));
  const layer: CSSProperties = { position: 'absolute', left: 0, top: 0 };
  const svg = (key: string | number, children: ReactNode) => (
    <svg key={key} width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ ...layer, display: 'block' }}>
      {children}
    </svg>
  );
  const renderItem = (it: SeqItem, i: number) => {
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
  const base = svg(
    'lanes',
    lanes.map((l, i) => (
      <g key={l}>
        <line x1={xs[i]} y1={70} x2={xs[i]} y2={h - 6} stroke={line} strokeWidth="3" strokeDasharray="8 8" />
        <rect x={xs[i] - 110} y={8} width={220} height={60} rx={12} fill={panel} stroke={ink} strokeWidth="2.5" />
        <text x={xs[i]} y={47} textAnchor="middle" fontSize="26" fontWeight="800" fill={ink}>
          {l}
        </text>
      </g>
    )),
  );
  if (stepFrom == null) {
    return (
      <div style={{ position: 'relative', width: w, height: h }}>
        {base}
        {svg('all', items.map((it, i) => <g key={i}>{renderItem(it, i)}</g>))}
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      {base}
      {svg('fixed', items.slice(0, stepFrom).map((it, i) => <g key={i}>{renderItem(it, i)}</g>))}
      <Steps>
        {items.slice(stepFrom).map((it, j) => (
          <Step key={j}>{svg(j, renderItem(it, j + stepFrom))}</Step>
        ))}
      </Steps>
    </div>
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


// ═════════════ 第 6 堂起的共用元件 ═════════════

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


// 深色程式框，裡面一行一行排
const CodeBox = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      background: '#2d2a26',
      color: '#f5efe4',
      borderRadius: 'var(--osd-radius)',
      padding: '26px 34px',
      fontFamily: mono,
      fontSize: 25,
      lineHeight: 1.55,
      whiteSpace: 'pre',
      ...style,
    }}
  >
    {children}
  </div>
);

// ═════════════ 第 8 堂專用元件 ═════════════

type RRow = { name: string; icon: string; last?: string; time?: string; hot?: boolean; unread?: number };

// 房間列表手機示意：一列一間，依最後一則時間排（hot = 剛被更新、剛置頂）
const RoomPhone = ({ rooms, title = '聊天室（Amy）', w = 380, h = 560 }: { rooms: RRow[]; title?: string; w?: number; h?: number }) => (
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
    <div style={{ width: '100%', height: '100%', borderRadius: 30, overflow: 'hidden', background: '#faf6ee' }}>
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
        }}
      >
        {title}
      </div>
      {rooms.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            borderBottom: `2px solid ${line}`,
            background: r.hot ? '#fdf0e3' : 'transparent',
            borderLeft: r.hot ? '5px solid var(--osd-accent)' : '5px solid transparent',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: `2px solid ${ink}`,
              background: '#fbe7b5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            {r.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 19, fontWeight: 800, whiteSpace: 'nowrap' }}>{r.name}</span>
              <span style={{ fontFamily: mono, fontSize: 13, color: muted }}>{r.time ?? ''}</span>
            </div>
            <div
              style={{
                fontSize: 16,
                color: r.hot ? ink : muted,
                fontWeight: r.hot ? 700 : 400,
                marginTop: 3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {r.last ?? '（還沒有訊息）'}
            </div>
          </div>
          {r.unread ? (
            <span style={{ minWidth: 30, padding: '2px 9px', borderRadius: 999, background: red, color: '#fff', fontSize: 15, fontWeight: 900, textAlign: 'center' }}>
              {r.unread}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  </div>
);

// 第 5 頁：手機 ↔ Server 之間的連線示意

// ═════════════ 第 9 堂專用元件 ═════════════

// 絕對定位的一層（Step 外層沒有定位，absolute 會對齊到最近的 relative 容器）
const Abs = ({ x, y, w, h, children, style }: { x: number; y: number; w?: number; h?: number; children?: ReactNode; style?: CSSProperties }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);

const CELL = 104;
const cellX = (seq: number) => (seq - 1) * CELL;

const SeqCell = ({ seq, kind = 'plain' }: { seq: number; kind?: 'plain' | 'new' }) => (
  <Abs
    x={cellX(seq)}
    y={60}
    w={CELL - 12}
    h={76}
    style={{
      borderRadius: 10,
      border: `2.5px ${kind === 'new' ? 'dashed' : 'solid'} ${kind === 'new' ? amber : ink}`,
      background: kind === 'new' ? '#fdf0e3' : panel,
      fontFamily: mono,
      fontSize: 26,
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    #{seq}
  </Abs>
);

// 水位線：從 #1 蓋到 #upto 的綠色帶，上方標示
const Band = ({ upto, label }: { upto: number; label: string }) => (
  <>
    <Abs x={-8} y={0} w={cellX(upto) + CELL + 4} h={48} style={{ background: 'var(--osd-bg)' }} />
    <Abs
      x={-8}
      y={50}
      w={cellX(upto) + CELL + 4}
      h={96}
      style={{ borderRadius: 14, border: `4px solid ${green}`, background: 'rgba(79,157,105,0.16)' }}
    />
    <Abs x={cellX(upto) - 260} y={6} w={CELL + 240} style={{ textAlign: 'right', fontSize: 26, fontWeight: 900, color: green }}>
      {label} ▼
    </Abs>
  </>
);

const LogLine = ({ i, children }: { i: number; children: ReactNode }) => (
  <Abs x={0} y={200 + i * 66} w={1680} style={{ fontSize: 32, lineHeight: 1.45 }}>
    {children}
  </Abs>
);

// Debounce 時間軸：x = 時間（ms）
const tx = (ms: number) => 80 + ms * 1.25;

const TLayer = ({ children }: { children: ReactNode }) => (
  <svg width={1680} height={330} viewBox="0 0 1680 330" style={{ position: 'absolute', left: 0, top: 0, display: 'block' }}>
    {children}
  </svg>
);

const TEvent = ({ ms, seq }: { ms: number; seq: number }) => (
  <TLayer>
    <circle cx={tx(ms)} cy={160} r={12} fill={blue} stroke={ink} strokeWidth="2.5" />
    <line x1={tx(ms)} y1={148} x2={tx(ms)} y2={70} stroke={blue} strokeWidth="2" strokeDasharray="5 5" />
    <text x={tx(ms)} y={56} textAnchor="middle" fontSize="23" fontWeight="800" fill={ink} style={halo}>
      看到 #{seq}
    </text>
    <text x={tx(ms)} y={210} textAnchor="middle" fontSize="20" fill={muted} style={halo}>
      計時重來
    </text>
  </TLayer>
);

// 一則別人的訊息 + 判斷（群組已讀 N）
const ReadRow = ({ who, seq }: { who: string; seq: number }) => (
  <>
    <div style={{ padding: '14px 22px', borderTop: `2px solid ${line}`, fontWeight: 800 }}>{who}</div>
    <div style={{ padding: '14px 22px', borderTop: `2px solid ${line}`, fontFamily: mono, fontWeight: 800 }}>{seq}</div>
  </>
);

const Verdict = ({ ok, children }: { ok: boolean | null; children: ReactNode }) => (
  <div
    style={{
      padding: '14px 22px',
      borderTop: `2px solid ${line}`,
      fontWeight: 800,
      color: ok === null ? muted : ok ? green : red,
    }}
  >
    {children}
  </div>
);

const Callout = ({ n, children }: { n: string; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', fontSize: 30, lineHeight: 1.45, marginBottom: 22 }}>
    <span style={{ fontFamily: mono, fontWeight: 900, color: 'var(--osd-accent)' }}>{n}</span>
    <span>{children}</span>
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
        <Pill tint={panel}>能力演進表最後一格</Pill>
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
        已讀 + 未讀
      </h1>
      <p style={{ fontSize: 36, color: muted, margin: 0, lineHeight: 1.5 }}>
        對方看了沒、群組幾人看了、
        <br />
        未讀 300 則從哪一則開始看
      </p>
      <div style={{ display: 'flex', gap: 14, marginTop: 56 }}>
        <Pill tint={panel}>last_read_seq</Pill>
        <Pill tint={panel}>已讀 N</Pill>
        <Pill tint={panel}>未讀數</Pill>
        <Pill tint={panel}>center key</Pill>
      </div>
    </div>
    <div style={{ position: 'absolute', right: 200, top: 160 }}>
      <ChatPhone
        w={380}
        h={640}
        title="活動群"
        msgs={[
          { t: '明天幾點集合？', mine: true, st: 'sent', seq: 48, read: '已讀 3' },
          { t: '9 點，車站', who: 'Cat', seq: 49 },
          { t: '以下為未讀訊息', divider: true },
          { t: '我會晚 10 分鐘', who: 'Bob', seq: 50 },
          { t: '那我們先買票', who: 'Cat', seq: 51 },
          { t: 'OK 收到', mine: true, st: 'sent', seq: 52, read: '已讀 1' },
        ]}
      />
      <PhoneCap n="✓" title="誰看了、看到哪，一目了然" w={380}>
        每個人每間房，只記一個數字
      </PhoneCap>
    </div>
  </div>
);

const Scenario: Page = () => (
  <Shell section="開場" title="PM：要有已讀">
    <Bubble who="PM" role="PM">
      「使用者一直問：我傳的訊息，<b style={{ color: 'var(--osd-accent)' }}>對方到底看了沒</b>？
      <br />
      LINE 都有，我們也要。」
    </Bubble>
    <Card style={{ marginTop: 44 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>PM 一條一條加的需求</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Steps>
          <Step>
            <Goal n="01">對方看了，我的訊息旁邊顯示「已讀」</Goal>
          </Step>
          <Step>
            <Goal n="02">訊息真的出現在對方畫面上才算，不是一進房就全部算</Goal>
          </Step>
          <Step>
            <Goal n="03">
              <span style={{ color: muted }}>（PM 說群組和未讀那邊還有需求……）</span>
            </Goal>
          </Step>
        </Steps>
      </div>
    </Card>
  </Shell>
);

const EvoTable = ({ allDone }: { allDone?: boolean }) => (
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
    <ColHead>第 6 堂 +歷史 API</ColHead>
    <ColHead>第 7 堂 +補洞</ColHead>
    <ColHead focus>第 8～9 堂</ColHead>

    <RowHead>剛進聊天室</RowHead>
    <Cell state="no">空的，只看得到連上之後的</Cell>
    <Cell state="partial">看得到自己收過的</Cell>
    <Cell state="yes">先載最新一頁，往上滑再載</Cell>
    <Cell state="yes" />
    <Cell state={allDone ? 'yes' : 'no'} focus>
      <b>未讀多就跳到第一則未讀</b>
      {allDone ? '' : '　← 今天'}
    </Cell>

    <RowHead>殺掉 App 重開</RowHead>
    <Cell state="no">全部不見</Cell>
    <Cell state="yes">秒開，不白屏</Cell>
    <Cell state="yes" />
    <Cell state="yes" />
    <Cell state="yes" focus />

    <RowHead>斷線時別人說的話</RowHead>
    <Cell state="no">收不到</Cell>
    <Cell state="no">收不到</Cell>
    <Cell state="no">收不到；本地留下斷層</Cell>
    <Cell state="yes">重連後自動補齊</Cell>
    <Cell state="yes" focus />

    <RowHead>新加入的人看舊對話</RowHead>
    <Cell state="no">看不到</Cell>
    <Cell state="no">看不到</Cell>
    <Cell state="yes">看得到</Cell>
    <Cell state="yes" />
    <Cell state="yes" focus />

    <RowHead>有好幾個聊天室</RowHead>
    <Cell state="no">只能等講師分房</Cell>
    <Cell state="no" />
    <Cell state="no" />
    <Cell state="no" />
    <Cell state={allDone ? 'yes' : 'partial'} focus>
      房間列表（第 8 堂）＋<b>未讀數</b>
      {allDone ? '' : '　← 今天'}
    </Cell>
  </div>
);

const Evolution: Page = () => (
  <Shell section="能力演進表" title="最後兩格" sub="第 8 堂有了房間列表，今天補上未讀數，以及進房跳到第一則未讀。">
    <EvoTable />
  </Shell>
);

const Recap: Page = () => (
  <BigQuestion
    tag="上堂結尾：你私聊夥伴，自己傳出去的那一句旁邊出現 ✓"
    tagColor="#f7d9d6"
    foot="✓ 是第 4 堂做的：收到 Server 的 ACK，訊息拿到 seq。"
    hint="提示：這個 ✓ 是誰回給你的？回給你的那一刻，夥伴的手機在做什麼？"
  >
    ✓ 出現了，
    <br />
    夥伴到底看了沒？
  </BigQuestion>
);

const WhatToStore: Page = () => (
  <Shell section="觀念" title="已讀要記什麼？" sub="活動群 50 人，今天聊了 1000 則。">
    <div style={{ display: 'flex', gap: 40 }}>
      <Card style={{ flex: 1 }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: red }}>A. 每則訊息、每個人，記一個勾</div>
        <div style={{ marginTop: 18 }}>
          <Code size={24}>{`(訊息 #1,  Bob, 已讀)
(訊息 #1,  Cat, 已讀)
(訊息 #2,  Bob, 已讀)
……`}</Code>
        </div>
      </Card>
      <Steps>
        <Step>
          <Card style={{ flex: 1, minWidth: 760 }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: green }}>B. 每個人、每間房，只記一個數字</div>
            <div style={{ marginTop: 18 }}>
              <Code size={24}>{`(活動群, Bob, last_read_seq = 812)
(活動群, Cat, last_read_seq = 640)
……`}</Code>
            </div>
            <div style={{ fontSize: 24, color: muted, marginTop: 14 }}>Bob 讀到 #812 = #812 以前的，他都看過了</div>
          </Card>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ marginTop: 36 }}>
          <WhyBox q="A 和 B 各要存幾列？B 為什麼可以只記一個數字？靠的是 seq 的哪個特性？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const Watermark: Page = () => (
  <Shell section="觀念" title="水位線：只會往上漲" sub="Bob 在私聊裡往下捲。綠色帶 = Bob 讀過的範圍。">
    <div style={{ position: 'relative', height: 480 }}>
      <Steps>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
          <SeqCell key={s} seq={s} />
        ))}
        <Step>
          <div>
            <Band upto={9} label="水位線 9" />
            <LogLine i={0}>① Bob 的畫面看到 #9 → 回報 9，水位線 = 9</LogLine>
          </div>
        </Step>
        <Step>
          <div>
            <Abs x={cellX(3)} y={146} w={CELL - 12} style={{ textAlign: 'center', fontSize: 30, fontWeight: 900, color: blue }}>
              ▲
            </Abs>
            <LogLine i={1}>② Bob 往上滑，看到 #3 → 3 比 9 小，不回報，水位線不動</LogLine>
          </div>
        </Step>
        <Step>
          <div>
            <Band upto={12} label="水位線 12" />
            <LogLine i={2}>③ Bob 捲回最底，看到 #12 → 回報 12，水位線 = 12</LogLine>
          </div>
        </Step>
        <Step>
          <div>
            {[13, 14, 15].map((s) => (
              <SeqCell key={s} seq={s} kind="new" />
            ))}
            <LogLine i={3}>④ Amy 又傳了 #13～#15 → Bob 的未讀 = 15 − 12 = 3</LogLine>
          </div>
        </Step>
      </Steps>
    </div>
  </Shell>
);

const DebouncePage: Page = () => (
  <Shell section="觀念" title="捲得很快：停 500ms 再報一次" sub="Bob 一口氣往下滑，可見的最大 seq 一直變。每變一次就回報嗎？">
    <div style={{ position: 'relative', width: 1680, height: 330 }}>
      <TLayer>
        <line x1={60} y1={160} x2={1640} y2={160} stroke={line} strokeWidth="4" />
        {[0, 200, 400, 600, 800, 1000, 1200].map((ms) => (
          <g key={ms}>
            <line x1={tx(ms)} y1={152} x2={tx(ms)} y2={168} stroke={muted} strokeWidth="2" />
            <text x={tx(ms)} y={300} textAnchor="middle" fontSize="20" fill={muted} fontFamily={mono}>
              {ms}ms
            </text>
          </g>
        ))}
      </TLayer>
      <Steps>
        <Step>
          <TEvent ms={0} seq={41} />
        </Step>
        <Step>
          <TEvent ms={130} seq={43} />
        </Step>
        <Step>
          <TEvent ms={260} seq={45} />
        </Step>
        <Step>
          <TEvent ms={380} seq={48} />
        </Step>
        <Step>
          <TLayer>
            <rect x={tx(380)} y={232} width={tx(880) - tx(380)} height={36} rx={8} fill="#fdf0e3" stroke={amber} strokeWidth="2.5" />
            <text x={(tx(380) + tx(880)) / 2} y={257} textAnchor="middle" fontSize="21" fontWeight="800" fill={ink}>
              500ms 都沒變
            </text>
            <circle cx={tx(880)} cy={160} r={16} fill={green} stroke={ink} strokeWidth="2.5" />
            <text x={tx(880) + 30} y={120} fontSize="26" fontWeight="900" fill={green} style={halo}>
              送出 read · seq = 48
            </text>
          </TLayer>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ marginTop: 30 }}>
          <WhyBox q="不等 500ms、每變一次就報，這一秒 Bob 要送幾則 read？Server 又要轉給幾個人？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const ReadFlow: Page = () => (
  <Shell section="觀念" title="已讀一輪：Bob 看到 → Amy 看到「已讀」" sub="Amy 傳了 #41、#42 給 Bob。Bob 打開私聊，往下捲。">
    <SeqDiagram
      lanes={['Bob 的畫面', 'Bob 的 App', 'Server', 'Amy 的 App']}
      pad={230}
      rowH={60}
      stepFrom={1}
      items={[
        { kind: 'note', at: 0, label: '#42 出現在畫面上' },
        { kind: 'msg', from: 0, to: 1, label: '可見最大 seq = 42' },
        { kind: 'note', at: 1, label: '等 500ms，沒再變' },
        { kind: 'msg', from: 1, to: 2, label: 'read · dm:Amy:Bob · seq=42' },
        { kind: 'note', at: 2, label: 'Bob 的水位線 40 → 42' },
        { kind: 'msg', from: 2, to: 3, label: 'read · user=Bob · seq=42', color: blue },
        { kind: 'msg', from: 2, to: 1, label: 'read · user=Bob · seq=42', color: blue },
        { kind: 'note', at: 3, label: 'reads 表：Bob = 42' },
        { kind: 'note', at: 3, label: '#41、#42 旁顯示「已讀」', tint: '#d6ecd9' },
      ]}
    />
  </Shell>
);

const VisibleNow: Page = () => {
  const seqs = [40, 41, 42, 43, 44, 45, 46, 47, 48];
  const top0 = 10;
  const rowH = 62;
  const frameTop = top0 + rowH * 2 + 20;
  const frameH = rowH * 4 - 10;
  return (
    <Shell section="觀念" title="怎樣才算「看到」？" sub="氣泡的中心點落在列表的可見範圍裡，才算。">
      <div style={{ display: 'flex', gap: 80 }}>
        <div style={{ position: 'relative', width: 600, height: 600 }}>
          {seqs.map((s, i) => (
            <Abs
              key={s}
              x={i % 2 ? 40 : 200}
              y={top0 + i * rowH}
              w={320}
              h={48}
              style={{
                border: `2px solid ${ink}`,
                borderRadius: 14,
                background: i % 2 ? panel : '#d6ecd9',
                fontSize: 22,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 16px',
                boxSizing: 'border-box',
              }}
            >
              <b style={{ fontFamily: mono }}>#{s}</b>
              <span style={{ color: muted }}>{i % 2 ? 'Amy' : 'Bob'} 的訊息</span>
            </Abs>
          ))}
          <Abs
            x={0}
            y={frameTop}
            w={540}
            h={frameH}
            style={{ border: `5px solid ${blue}`, borderRadius: 18, background: 'rgba(91,132,201,0.08)', boxSizing: 'border-box' }}
          />
          <Abs x={6} y={frameTop + frameH + 6} style={{ fontSize: 24, fontWeight: 900, color: blue }}>
            ▲ 畫面
          </Abs>
          <Steps>
            <Step>
              <div>
                {[42, 43, 44, 45].map((s) => (
                  <Abs key={s} x={552} y={top0 + (s - 40) * rowH + 6} style={{ fontSize: 30, fontWeight: 900, color: green }}>
                    ✓
                  </Abs>
                ))}
              </div>
            </Step>
          </Steps>
        </div>
        <div style={{ flex: 1, paddingTop: 30 }}>
          <Steps>
            <Step>
              <Callout n="①">
                可見最大 seq = <b>45</b>，交給 ChatController
              </Callout>
            </Step>
            <Step>
              <Callout n="②">#46 只露出一角，中心點不在框裡，不算</Callout>
            </Step>
            <Step>
              <div style={{ marginTop: 30 }}>
                <WhyBox q="一進房就把整間標成已讀，不是簡單很多？為什麼 PM 要「真的出現在畫面上」？" />
              </div>
            </Step>
          </Steps>
        </div>
      </div>
    </Shell>
  );
};

const ScenarioB: Page = () => (
  <Shell section="PM 追加" title="PM：群組和未讀也要">
    <Bubble who="PM" role="PM">
      「群組裡，我想知道<b style={{ color: 'var(--osd-accent)' }}>幾個人</b>看了。
      <br />
      還有，未讀 300 則時，要從<b style={{ color: 'var(--osd-accent)' }}>第一則未讀</b>開始看。」
    </Bubble>
    <Card style={{ marginTop: 56 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>接著開場的 01、02，再加：</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Steps>
          <Step>
            <Goal n="03">群組裡，我的訊息顯示「已讀 N」</Goal>
          </Step>
          <Step>
            <Goal n="04">房間列表每一間顯示未讀幾則</Goal>
          </Step>
          <Step>
            <Goal n="05">未讀很多時，進房停在第一則未讀，不是最底</Goal>
          </Step>
        </Steps>
      </div>
    </Card>
  </Shell>
);

const ReadN: Page = () => (
  <Shell section="觀念" title="已讀 N：誰的水位線已經過了這一則" sub="活動群 4 人。Amy 的訊息是 #50。本地 reads 表記著每個人讀到哪。">
    <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
      <div style={{ width: 520 }}>
        <ChatPhone
          w={420}
          h={300}
          title="活動群（Amy）"
          msgs={[
            { t: '9 點，車站', who: 'Cat', seq: 49 },
            { t: '明天記得帶筆電', mine: true, st: 'sent', seq: 50 },
          ]}
        />
        <Steps>
          <Step>
            <div style={{ marginTop: 26 }}>
              <WhyBox q="#50 旁邊要寫「已讀」幾？先自己算。" />
            </div>
          </Step>
        </Steps>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1.6fr',
            border: `2.5px solid ${ink}`,
            borderRadius: 'var(--osd-radius)',
            overflow: 'hidden',
            background: panel,
            fontSize: 28,
          }}
        >
          {['誰', '讀到', '#50 算他讀了嗎？'].map((h) => (
            <div key={h} style={{ padding: '12px 22px', fontWeight: 900, background: '#efe6d6' }}>
              {h}
            </div>
          ))}
          <Steps>
            <ReadRow who="Bob" seq={52} />
            <Step>
              <Verdict ok>52 ≥ 50 ✓</Verdict>
            </Step>
            <ReadRow who="Cat" seq={48} />
            <Step>
              <Verdict ok={false}>48 &lt; 50 ✗</Verdict>
            </Step>
            <ReadRow who="Dan" seq={50} />
            <Step>
              <Verdict ok>50 ≥ 50 ✓</Verdict>
            </Step>
            <ReadRow who="Amy（自己）" seq={50} />
            <Step>
              <Verdict ok={null}>自己不算</Verdict>
            </Step>
          </Steps>
        </div>
        <Steps>
          <Step>
            <div style={{ marginTop: 26, fontSize: 34, fontWeight: 900 }}>
              → #50 顯示 <span style={{ color: blue }}>已讀 2</span>
              <span style={{ fontSize: 26, color: muted, fontWeight: 500 }}>　私聊（dm）只有對方一人：顯示「已讀」；兩人組、群組都顯示「已讀 N」</span>
            </div>
          </Step>
        </Steps>
      </div>
    </div>
  </Shell>
);

const UnreadCount: Page = () => (
  <Shell section="觀念" title="未讀數：一個減法" sub="Amy 一天沒開活動群。講師把她的已讀設在 #50，再灌了 300 則。">
    <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
      <RoomPhone
        h={420}
        rooms={[
          { name: '活動群', icon: '群', last: '🤖 Bot：灌水訊息 #300', time: '10:30', unread: 300 },
          { name: 'Bob', icon: 'B', last: '你：OK 收到', time: '10:02' },
          { name: 'Amy & Bob', icon: '組', last: '你：好，週五見', time: '09:58' },
          { name: '大廳', icon: '廳', last: 'Dan：大家好', time: '09:40', unread: 2 },
        ]}
      />
      <div style={{ flex: 1 }}>
        <Steps>
          <Step>
            <Card>
              <div style={{ fontSize: 24, color: muted }}>活動群</div>
              <div style={{ fontFamily: mono, fontSize: 40, fontWeight: 900, marginTop: 8 }}>
                最新 #350 − 水位線 50 = <span style={{ color: red }}>300</span>
              </div>
              <div style={{ fontSize: 24, color: muted, marginTop: 10 }}>兩個數字都在 rooms 表：last_seq、my_read_seq</div>
            </Card>
          </Step>
          <Step>
            <div style={{ marginTop: 30 }}>
              <WhyBox q="要知道未讀 300，需要先把這 300 則下載下來嗎？Amy 根本還沒點進去。" />
            </div>
          </Step>
          <Step>
            <div style={{ marginTop: 20 }}>
              <WhyBox q="如果水位線先更新到 #352，列表記的最新 seq 還停在 #350，減出來會怎樣？" />
            </div>
          </Step>
        </Steps>
      </div>
    </div>
  </Shell>
);

const AnchorQuestion: Page = () => (
  <BigQuestion
    tag="做未讀定位之前先想"
    tagColor="#fbe7b5"
    foot="情境：Amy 讀到 #50，之後又來了 300 則。現在的 App 一進房，就停在最底的 #350。"
    hint="提示：第一則未讀是第幾號 seq？Amy 打開房間的那一刻，它在本地嗎？"
  >
    未讀 300 則，
    <br />
    進房要停在哪？
  </BigQuestion>
);

const AnchorFlow: Page = () => (
  <Shell section="觀念" title="進房：先補、再決定從哪開始" sub="open() 多做一件事：算出第一則未讀，本地有就定位。">
    <SeqDiagram
      lanes={['畫面', 'ChatController', '本地 DB', 'Server']}
      pad={170}
      rowH={64}
      stepFrom={1}
      items={[
        { kind: 'note', at: 1, label: 'open()：我的水位線 = 50' },
        { kind: 'msg', from: 1, to: 3, label: '補洞 after_seq（第 7 堂）', color: blue },
        { kind: 'msg', from: 3, to: 1, label: '#51～#350（一頁一頁回來）', color: blue },
        { kind: 'msg', from: 1, to: 2, label: 'upsert 寫進 DB' },
        { kind: 'msg', from: 1, to: 2, label: '第一則未讀 #51 在本地嗎？' },
        { kind: 'msg', from: 2, to: 1, label: '在 → firstUnreadSeq = 51', color: green },
        { kind: 'msg', from: 1, to: 0, label: '從 #51 開始排' },
        { kind: 'note', at: 0, label: '分隔線停在畫面上方', tint: '#d6ecd9' },
      ]}
    />
  </Shell>
);

const AnchorView: Page = () => (
  <Shell section="觀念" title="畫面怎麼排：center key 當錨點" sub="CustomScrollView 有兩段：center 那段往上長，它前面那段往下長。">
    <div style={{ display: 'flex', gap: 70, alignItems: 'flex-start' }}>
      <ChatPhone
        w={400}
        h={600}
        title="活動群（Amy）"
        msgs={[
          { t: '9 點，車站', who: 'Cat', seq: 49 },
          { t: '明天記得帶筆電', mine: true, st: 'sent', seq: 50, read: '已讀 2' },
          { t: '以下為未讀訊息', divider: true },
          { t: '灌水訊息 #1', who: '🤖 Bot', seq: 51 },
          { t: '灌水訊息 #2', who: '🤖 Bot', seq: 52 },
          { t: '灌水訊息 #3', who: '🤖 Bot', seq: 53 },
        ]}
      />
      <div style={{ flex: 1, paddingTop: 20 }}>
        <Steps>
          <Step>
            <Callout n="①">分隔線「以下為未讀訊息」停在畫面上方約 1/4</Callout>
          </Step>
          <Step>
            <Callout n="②">往下：#51 起的未讀，由舊到新排</Callout>
          </Step>
          <Step>
            <Callout n="③">往上：已讀的舊訊息，照常往上滑、照常載更早的</Callout>
          </Step>
          <Step>
            <Callout n="④">右下角「跳到最新 ↓」：不想一則一則看，一鍵到底</Callout>
          </Step>
        </Steps>
        <div style={{ marginTop: 20 }}>
          <Hint>第 3 堂講師補充提過 center key：插入東西時，錨點那一則不會跳。</Hint>
        </div>
      </div>
    </div>
  </Shell>
);

const NewDevice: Page = () => (
  <Shell section="觀念" title="例外：第一則未讀不在本地" sub="Amy 換了新手機，第一次進活動群。補洞只抓了最新一頁 #301～#350。">
    <div style={{ display: 'flex', gap: 36 }}>
      <Steps>
        <Step>
          <Card style={{ flex: 1 }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: green }}>本地有 #51</div>
            <div style={{ fontSize: 28, marginTop: 12, lineHeight: 1.5 }}>平常的情況：第 7 堂補洞已經補到最新 → 定位到 #51，顯示分隔線</div>
          </Card>
        </Step>
        <Step>
          <Card style={{ flex: 1, background: '#fdf0e3' }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: amber }}>本地沒有 #51</div>
            <div style={{ fontSize: 28, marginTop: 12, lineHeight: 1.5 }}>
              新裝置第一次進房 → 停在最底，上方浮一顆
              <br />
              <b>「上方還有 300 則未讀 ↑」</b>
            </div>
          </Card>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ marginTop: 40 }}>
          <WhyBox q="Server 有 around_seq，可以把 #51 附近那一頁抓下來定位。為什麼完成版不這樣做？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const ImplA: Page = () => (
  <Shell section="實作" title="TODO ① ②" sub="starter 給了 reads 表（DB v3）、氣泡的已讀標籤位置、SeqTracker、未讀分隔線元件，以及查詢 countFrom / hasSeq。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <Todo n="①" title={<>回報已讀：可見最大 seq → Debounce 500ms → <Kw>{'{"type":"read","room_id","seq"}'}</Kw></>}>
        <Hint>
          SeqTracker 包住每個氣泡，捲動時算出中心點在畫面內的最大 seq。
          <br />
          水位線只能往前推：在哪幾個地方擋？送不出去（斷線）的話，本地水位線要不要先前進？
        </Hint>
      </Todo>
      <Todo n="②" title={<>收到 <Kw>read</Kw> 寫進 reads 表；自己的訊息顯示「已讀」/「已讀 N」</>}>
        <Hint>
          GET /rooms 回來的 reads（每個人讀到哪）也要寫進去。
          <br />
          收到的 read 是自己的呢？講師把你的水位線設回去的時候，要不要照收？
        </Hint>
      </Todo>
    </div>
  </Shell>
);

const ImplB: Page = () => (
  <Shell section="實作" title="TODO ③ ④" sub="④ 最難，先把 ①～③ 跑通再開始。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <Todo n="①" title="可見最大 seq，Debounce 回報" done />
      <Todo n="②" title="收 read、顯示已讀 / 已讀 N" done />
      <Todo n="③" title={<>房間列表的未讀數：<Kw>Room.unread</Kw> + Badge</>}>
        <Hint>減出來可能是負的嗎？超過 999 要怎麼顯示？</Hint>
      </Todo>
      <Todo n="④" title={<>進房定位第一則未讀：<Kw>center</Kw> key + 分隔線 +「跳到最新 ↓」</>}>
        <Hint>
          open() 先補洞，再判斷第一則未讀在不在本地。本地查詢視窗（limit）要夠大，才裝得下從 #51 到最新。
          <br />
          不在本地：停在最底，提示上方還有幾則未讀。
        </Hint>
      </Todo>
    </div>
  </Shell>
);

const Acceptance: Page = () => (
  <Shell section="驗收" title="看了才算、算得對、停得準" sub="兩人一組；群組的部分講師拉 3 人群。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Check>你往下捲，儀表板上你的已讀位置跟著往前走；往上滑不會倒退</Check>
      <Check>私聊的對方讀了，你的訊息顯示「已讀」；兩人組顯示「已讀 1」；3 人群組顯示「已讀 2」</Check>
      <Check>講師把你的已讀設到第 50 則、再灌 300 則：列表顯示未讀 300，進房停在分隔線</Check>
      <Check>沒滑到的訊息不算已讀：只看了上半，儀表板的位置停在看到的那一則</Check>
      <Check>新裝置第一次進房、第一則未讀不在本地：停在最底，提示上方還有幾則未讀</Check>
    </div>
  </Shell>
);

const Feynman: Page = () => (
  <Shell section="費曼檢核" title="不看螢幕，講給隔壁聽" sub="兩人一組，一人一分鐘。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Card>
        <Goal n="Q1">為什麼已讀只要記一個數字？這個數字為什麼只能往前？</Goal>
      </Card>
      <Card>
        <Goal n="Q2">群組的「已讀 N」怎麼算？需要 Server 幫忙算嗎？</Goal>
      </Card>
      <Card>
        <Goal n="Q3">未讀數怎麼算？進房時，第一則未讀不在本地怎麼辦？</Goal>
      </Card>
    </div>
  </Shell>
);

const Think: Page = () => (
  <Shell section="思考分享" title="兩人一組，想 3 分鐘" sub="想完抽兩三組，各講一分鐘。講完講師補充業界做法。">
    <Card>
      <Goal n="Q4">活動群有 1000 人。每個人捲動時都會回報 read，Server 照今天的寫法轉給房間裡每一個人。這樣會怎樣？要推給幾個人才夠？</Goal>
    </Card>
    <div style={{ marginTop: 32 }}>
      <Hint>
        可以從這幾個角度想：一則 read 進來，Server 要送出幾則？1000 人都在線、都在捲動呢？
        <br />
        「已讀 N」這個數字，真正需要看的是誰？
      </Hint>
    </div>
  </Shell>
);

const ExtraFanout: Page = () => (
  <Shell section="講師補充" title="千人群組的已讀：四種收斂法" sub="一則 read 轉給 1000 人，1000 人都在捲動，就是每秒上百萬則。">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr 1fr',
        border: `2.5px solid ${ink}`,
        borderRadius: 'var(--osd-radius)',
        overflow: 'hidden',
        background: panel,
        fontSize: 26,
        lineHeight: 1.45,
      }}
    >
      {['做法', '怎麼做', '代價'].map((h) => (
        <div key={h} style={{ padding: '14px 22px', fontWeight: 900, background: '#efe6d6' }}>
          {h}
        </div>
      ))}
      {[
        ['只推給發送者', '只有「這則是你發的」的人需要知道已讀 N', 'Server 要查這段範圍內，每則是誰發的'],
        ['Server 節流', '同一間房的已讀變化，每幾秒合併推一次', '已讀 N 晚幾秒才更新'],
        ['改成主動拉', '發送者打開「誰讀了」時，才問 Server', '看不到即時跳動的數字'],
        ['大群關閉已讀', '超過一定人數就不顯示已讀 N', '產品功能少一塊'],
      ].map(([a, b, c]) =>
        [a, b, c].map((v, i) => (
          <div key={a + i} style={{ padding: '18px 22px', borderTop: `2px solid ${line}`, fontWeight: i === 0 ? 800 : 500 }}>
            {v}
          </div>
        )),
      )}
    </div>
  </Shell>
);

const AllDone: Page = () => (
  <Shell section="能力演進表" title="全部打勾" sub="從第 1 堂的一條 WebSocket，到今天的已讀未讀。">
    <EvoTable allDone />
  </Shell>
);

const Hook: Page = () => (
  <div style={fill}>
    <TopBar section="下集預告" />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 170 }}>
      <Pill tint="#f7d9d6">能力演進表全部打勾了。PM 又帶來一批新需求：</Pill>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 30 }}>
        {[
          '同一個帳號，手機和平板同時登入',
          '對方正在輸入中……',
          '訊息可以編輯、可以收回',
          '傳一支 10MB 的影片',
        ].map((t, i) => (
          <Card key={t}>
            <div style={{ fontSize: 34, fontWeight: 800 }}>
              <span style={{ fontFamily: mono, color: 'var(--osd-accent)', marginRight: 16 }}>{i + 1}</span>
              {t}
            </div>
          </Card>
        ))}
      </div>
      <h2 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.3, margin: '44px 0 0' }}>今天這套架構，接得住嗎？</h2>
      <p style={{ fontSize: 30, color: muted, marginTop: 20 }}>下一堂不寫程式：分組認領一題，畫設計、上台報告，其他組當面試官追問。</p>
    </div>
  </div>
);

// ═════════════ 講稿 ═════════════

export const notes: (string | undefined)[] = [
  // 1 Cover
  `開場前儀表板狀態（課前對一次）
□ 行為等級：ACK
□ 全域延遲：0 ms
□ 分房：不用動，房間沿用第 8 堂
□ 其他：用「建立並拉人」準備一個 3 人群組；驗收第三項要先請學員退回房間列表，再設已讀、再灌訊息

【0:00】
今天是寫程式的最後一堂：已讀和未讀。對方看了沒、群組幾個人看了、未讀幾則、進房從哪一則開始看。
這種「告訴發送者對方看過了」的功能叫 Read Receipt，已讀回條：像掛號信的回執，對方簽收了，回執才寄回給你。
今天整堂的核心只有一個數字：每個人在每間房，讀到第幾號 seq。
課前確認：Server 是 ACK 等級；講師準備一個 3 人群組，等一下驗收「已讀 2」要用。

術語
・Read Receipt（已讀回條）`,

  // 2 Scenario
  `【0–2 分】
用 PM 的口氣唸：使用者一直問，我傳的訊息對方到底看了沒？LINE 都有，我們也要。
（→）需求 01：對方看了，我的訊息旁邊顯示「已讀」。
（→）需求 02：訊息真的出現在對方畫面上才算，不是一進房就全部算已讀。這條等一下會解釋 PM 為什麼堅持。
（→）需求 03 故意蓋住：PM 說群組和未讀那邊還有需求，等一下再帶回來。`,

  // 3 Evolution
  `【2–3 分】
能力演進表剩最後兩格，都在第 8～9 堂這一欄。
第一列「剛進聊天室」：今天要做到未讀很多時，直接跳到第一則未讀。
最後一列「有好幾個聊天室」：第 8 堂做了房間列表，今天補上未讀數，這一格才算完整。
今天做完，整張表就全部打勾。`,

  // 4 Recap
  `【3–5 分】回顧提問
先把上一堂結尾講一次給沒印象的人：上一堂驗收私聊時，你傳給夥伴的那一句旁邊出現了 ✓。這個 ✓ 是第 4 堂做的：Server 回了 ACK，訊息拿到 seq。
先問全班：✓ 出現了，夥伴到底看了沒？
（→）出現提示：這個 ✓ 是誰回給你的？回給你的那一刻，夥伴的手機在做什麼？

參考答案：✓ 是 Server 回的，只代表 Server 收到、存好、發了 seq。那一刻夥伴可能根本沒打開 App、手機在口袋裡、甚至沒連線。到目前為止，App 完全不知道對方看到哪裡，因為沒有任何人回報「我看到哪了」。今天就是要補這條回報的路。`,

  // 5 WhatToStore
  `【5–7 分】已讀要記什麼
左邊 A：最直覺的記法，每則訊息、每個人，記一個勾。
（→）右邊 B：每個人、每間房，只記一個數字 last_read_seq，Bob 讀到 #812，就代表 #812 以前的他都看過了。
（→）出現問題：A 和 B 各要存幾列？B 為什麼可以只記一個數字？

參考答案：A 是 1000 則乘以 49 個人，大約五萬列，而且每天一直長；B 是 50 列，永遠就這麼多，只是數字在變。
B 能成立靠兩件事：第一，seq 在房間裡從 1 連續遞增，第 6、7 堂一直在用的特性；第二，聊天是從舊往新看的，看到 #812，前面的就當作看過了。
這個數字叫 Read Watermark，已讀水位線，也叫 High-water Mark，高水位線：像水庫的水位，只記「水漲到哪」，不用記每一滴水。

術語
・Read Watermark（已讀水位線）
・High-water Mark（高水位線）

可能被問到
問：Bob 跳著看，看了 #900 但沒看 #850 呢？
答：水位線會算他看過 #850。聊天產品普遍接受這個近似；真的要逐則精確的，通常是「重要公告要每個人確認」這種另外的功能。`,

  // 6 Watermark
  `【7–9 分】水位線只會往上漲
畫面是 Bob 和 Amy 的私聊，#1 到 #12。綠色帶代表 Bob 讀過的範圍。
（→）Bob 的畫面看到 #9，Bob 的 App 回報 9，水位線變成 9。
（→）Bob 往上滑，看到 #3。3 比 9 小，App 不回報，水位線不動。
（→）Bob 捲回最底，看到 #12，回報 12，水位線變成 12。
（→）Amy 又傳了 #13～#15。Bob 的未讀數就是 15 減 12，3 則。
重點：水位線只會往前，不會倒退。只會變大、不會變小的值叫 Monotonic，單調遞增，第 8 堂的預覽也是這個規則。App 擋一次（比本地的小就不報），Server 再擋一次（比 Server 記的小就不收），兩邊都擋，才不會因為網路順序亂掉而倒退。
例外只有一個：講師在儀表板強制把水位線設回去，那是故意的，App 要照收。

術語
・Monotonic（單調遞增）`,

  // 7 Debounce
  `【9–11 分】Debounce
Bob 一口氣往下滑，可見的最大 seq 一直在變。
（→）0ms：Bob 的畫面看到 #41，ChatController 開一個 500ms 計時器。
（→）130ms：看到 #43，計時器取消、重來。
（→）260ms：看到 #45，再重來。
（→）380ms：看到 #48，再重來。
（→）之後 500ms 都沒有再變，計時器到點，Bob 的 App 傳給 Server 一則 read，seq = 48。四次變化，只送一次。
這叫 Debounce，防抖：事件連續觸發時先等一等，安靜一段時間才真的做一次，像電梯門有人一直進來就一直不關，最後一個人進來後等幾秒才關。
（→）出現問題：不等的話，這一秒要送幾則？

參考答案：每變一次就送，滑一秒可能送十幾則；而且 Server 每收到一則，都要轉給房間裡的每一個人。私聊還好，群組就是乘以人數，這是今天最後思考題的伏筆。

術語
・Debounce（防抖）

可能被問到
問：Debounce 和 Throttle 差在哪？
答：Throttle，節流，是「不管你多忙，每 500ms 最多做一次」，捲動中途也會定期送；Debounce 是「停下來 500ms 才做一次」，捲動中完全不送。已讀用 Debounce 比較省；如果想讓對方看到已讀即時跳動，可以改 Throttle。

問：計時器還沒到就離開房間呢？
答：完成版在 dispose 時取消計時器，並把最後看到的那則立刻報出去，不會漏。`,

  // 8 ReadFlow
  `【11–13 分】已讀一輪
四條線：Bob 的畫面、Bob 的 App、Server、Amy 的 App。Amy 傳了 #41、#42，Bob 本來讀到 #40。一開始一格：#42 出現在 Bob 的畫面上。
（→）Bob 的畫面告訴 Bob 的 App：可見最大 seq 是 42。
（→）Bob 的 App 等 500ms，沒有再變。
（→）Bob 的 App 傳給 Server：read，room_id 是 dm:Amy:Bob，seq 42。
（→）Server 檢查只能前進：Bob 原本是 40，42 比較大，更新成 42。
（→）Server 推給 Amy 的 App：read，user 是 Bob，seq 42。
（→）Server 也推回給 Bob 自己的 App。Server 把事件送回發起者，這叫 Echo，回音：Bob 如果同時開著手機和平板，另一台就靠這則知道自己讀到哪。
（→）Amy 的 App 把「Bob = 42」寫進本地 reads 表。
（→）Amy 的畫面訂閱 reads 表，#41、#42 旁邊出現「已讀」。跟訊息、房間一樣：先寫 DB，畫面只看 DB。

術語
・Echo（回音）

可能被問到
問：已讀為什麼走 WebSocket，不走 REST？
答：已讀很頻繁、量又小，WebSocket 已經開著，送一則很便宜；Server 也要透過 WebSocket 推給其他人。GET /rooms 只負責重連時把每個人的位置一次補齊。`,

  // 9 VisibleNow
  `【13–15 分】怎樣才算看到
左邊是一長串訊息，藍框是畫面，也就是列表的 Viewport，可視範圍：現在真的顯示在螢幕上的那一塊。
（→）中心點落在藍框裡的 #42～#45 打勾，這四則算看到。
（→）可見的最大 seq 是 45，交給 ChatController，走剛剛的 Debounce。
（→）#46 只露出一角，中心點不在框裡，不算。用中心點而不是「有露出一點點」，是怕使用者其實沒看到。
怎麼知道每則氣泡在哪：starter 給的 SeqTracker 把畫面上每個氣泡登記成 seq 對應它的 context，捲動時一個一個算位置。
（→）出現問題：一進房就整間標成已讀，不是簡單很多？

參考答案：簡單，但不誠實。未讀 300 則，使用者只看了最後兩則就離開，對方卻看到「已讀」，以為他全部看過了，重要訊息可能就這樣被忽略。而且水位線一次跳到最新，等一下的「進房跳到第一則未讀」也就沒有意義了。這就是 PM 那條需求 02 的原因。

術語
・Viewport（可視範圍）`,

  // 10 ScenarioB
  `【15–16 分】PM 追加
PM 又來了：群組裡想知道幾個人看了；未讀 300 則時，要從第一則未讀開始看。
（→）需求 03：群組裡，我的訊息顯示「已讀 N」。
（→）需求 04：房間列表每一間顯示未讀幾則。
（→）需求 05：未讀很多時，進房停在第一則未讀，不是最底。`,

  // 11 ReadN
  `【16–18 分】已讀 N
活動群 4 個人，Amy 的訊息是 #50。右邊是 Amy 本地的 reads 表，每個人讀到哪。
（→）出現問題：#50 旁邊要寫已讀幾？先讓大家自己算。
（→）Bob 讀到 52，52 ≥ 50，算讀了。
（→）Cat 讀到 48，48 < 50，還沒讀到。
（→）Dan 讀到 50，剛好讀到，算。
（→）Amy 自己：自己的訊息不算自己。
（→）所以 #50 顯示「已讀 2」。私聊只有對方一個人，N 只會是 0 或 1，顯示成「已讀」就好。
注意：程式判斷的是房間種類 kind == 'dm'，不是人數。講師用「兩兩一組」分的兩人組 kind 是 pair，雖然也是兩個人，還是顯示「已讀 1」。另外，第 1 堂的名字規則：Amy / Amy-2 是同一人的兩台裝置，兩兩一組時 Amy-2 會跟 Amy 分在同一組；但 Amy-2 有自己的水位線，算已讀時不會被當成「自己」排除，所以兩人組裡的 N 可能比夥伴人數多 1。
重點：已讀 N 不用存。它是從 reads 表算出來的，水位線一變，畫面重算一次就對了。這種不存、每次從原始資料算出來的值叫 Derived Data，衍生資料：存了反而要煩惱兩份不一致。

術語
・Derived Data（衍生資料）

可能被問到
問：群組 500 人，每則訊息都要掃 500 個水位線？
答：畫面上同時只有十幾則訊息，500 人乘十幾則，手機算得很快。真正的問題在 Server 要把 read 轉給 500 人，那是最後的思考題。`,

  // 12 UnreadCount
  `【18–20 分】未讀數
左邊是 Amy 的房間列表，活動群右邊顯示未讀 300。預覽是儀表板灌水的實際樣子：「🤖 Bot：灌水訊息 #300」。文字裡的 #i 不是 seq，是這次灌的第幾則，從 1 開始；這一則的 seq 是 #350。
（→）怎麼算：活動群最新 #350，減掉 Amy 的水位線 50，等於 300。兩個數字都在本地 rooms 表：last_seq 是第 8 堂 GET /rooms 和預覽一直在更新的那個，my_read_seq 是今天加的。
（→）出現問題：要知道未讀 300，需要先把 300 則下載下來嗎？

參考答案：不需要。這就是第 8 堂「沒開的房間只更新預覽」能成立的原因：列表只需要最新 seq 和水位線，一個減法就有未讀數，訊息本身等點進去再補。第 7 堂講師補充說過的「未讀數不用下載訊息」，就是這個。
（→）出現問題：如果水位線先更新到 #352，列表記的最新 seq 還停在 #350，減出來會怎樣？

參考答案：減出來是 −2，列表會出現奇怪的負數。兩個數字來自不同的事件，更新的先後順序不保證。所以要把結果限制在 0 以上，max(0, 相減)。這種把值限制在某個範圍內的動作叫 Clamp，夾住：超過上下限就壓回邊界。Server 收到 read 時也做了一樣的事，把 seq 夾在 0 到房間最新 seq 之間。

術語
・Clamp（夾住）`,

  // 13 AnchorQuestion
  `【20–21 分】先想再做定位
唸情境：Amy 讀到 #50，之後又來了 300 則。現在的 App 一進房就停在最底的 #350，Amy 得自己往上滑 300 則找起點。
先問：進房要停在哪？
卡住的話（→）出現提示：第一則未讀是第幾號？Amy 打開房間的那一刻，它在本地嗎？

參考答案：停在第一則未讀，也就是水位線加 1，#51。至於它在不在本地：平常會在，因為 open() 會先跑第 7 堂的補洞，把 #51～#350 補進本地；例外是新裝置第一次進房，補洞只抓最新一頁，#51 不在本地。兩種情況下一頁之後分開處理。`,

  // 14 AnchorFlow
  `【21–23 分】進房時序
四條線：畫面、ChatController、本地 DB、Server。一開始一格：open() 先讀出我的水位線 50。
（→）ChatController 傳給 Server：補洞，after_seq，就是第 7 堂那一段，最多等 4 秒。
（→）Server 一頁一頁回給 ChatController：#51～#350。
（→）ChatController 把它們 upsert 寫進本地 DB。
（→）ChatController 問本地 DB：第一則未讀 #51 在不在？
（→）本地 DB 回答：在。ChatController 記下 firstUnreadSeq = 51，並把本地查詢視窗加大到裝得下 #51 到最新。
（→）ChatController 告訴畫面：從 #51 開始排。
（→）畫面上，分隔線「以下為未讀訊息」停在畫面上方。
這個「進房時畫面要對準的那一則」叫 Unread Anchor，未讀錨點：像船下錨，畫面以它為基準停住，之後怎麼插入訊息，它都不會跑掉。

術語
・Unread Anchor（未讀錨點）

可能被問到
問：補洞要補 300 則，進房不就要等很久？
答：完成版設 4 秒上限，補不完就先用本地有的。離線很久的情況，第 7 堂講過的範圍表會更好。`,

  // 15 AnchorView
  `【23–25 分】畫面怎麼排
第 3 堂的反轉列表是一整段由新到舊往上長。今天把 CustomScrollView 切成兩段 Sliver，Sliver 就是 Flutter 可捲動區域裡的一段，可以各自決定怎麼排。center 參數指定哪一段是錨點：center 那一段往上長，排在它前面的那一段往下長。
（→）分隔線「以下為未讀訊息」停在畫面上方大約 1/4，用的是 anchor: 0.75（反轉列表，從底部算）。
（→）往下：#51 起的未讀，由舊到新排，使用者一路往下讀，就是正常的閱讀方向。
（→）往上：已讀的舊訊息照常往上滑，第 6 堂的分頁照常載更早的。
（→）右下角「跳到最新 ↓」：不想一則一則看，一鍵到最底。
再提醒一次：氣泡文字「灌水訊息 #1」的 #1 不是 seq，seq 看氣泡下方的 #51。
第 3 堂講師補充提過 center key：插入新東西時，錨點那一則不會跳。今天就是把這個用在定位上。

術語
・Sliver（可捲動區域的一段）
・center key`,

  // 16 NewDevice
  `【25–26 分】例外：不在本地
Amy 換了新手機，第一次進活動群。本地是空的，第 6 堂的規則是抓最新一頁，所以只有 #301～#350。
（→）先看平常的情況：本地有 #51，補洞已經補到最新，就定位到 #51，顯示分隔線。
（→）再看例外：本地沒有 #51，就停在最底，上方浮一顆「上方還有 300 則未讀 ↑」。功能沒有完全做到，但使用者知道狀況、可以自己往上滑。拿不到最好的結果時，退一步給一個還能用的結果，這叫 Graceful Degradation，優雅降級。
這裡的 N 是總未讀，不是上方的則數：最新 − 水位線 = 300，裡面也包含畫面下方已經在本地的 #301～#350。嚴格說上方只剩 250 則，完成版刻意用總未讀，算法跟列表一致。
（→）出現問題：Server 有 around_seq，為什麼完成版不用？

參考答案：用 around_seq 抓 #51 附近那一頁，本地就會變成兩段：#26～#76 和 #301～#350，中間 #77～#300 是一個斷層。第 6、7 堂的分頁和補洞都假設本地是連續的一段，cursor 會算錯、往上滑也補不回中間，這正是第 7 堂說的斷層問題。要安全地這樣做，得先有範圍表，也就是第 7 堂的課後挑戰。所以 around_seq 只用在範圍表挑戰裡，主線不用。

術語
・Graceful Degradation（優雅降級）`,

  // 17 ImplA
  `【26–40 分】實作開始
① 回報已讀：chat_page 用 SeqTracker 包住每個有 seq 的氣泡；捲動時（還有新訊息進來、畫面重排後）算出中心點在 viewport 裡的最大 seq，呼叫 ChatController.onVisibleMaxSeq。ChatController 比上次小就 return，否則重設 500ms 計時器。到點呼叫 ChatService.reportRead。
水位線在三個地方擋：ChatController（比自己看過的小不報）、ChatService（比 rooms.my_read_seq 小不報）、Server（比它記的小不收）。完成版的 reportRead 是送得出去才更新本地 my_read_seq；斷線送不出去，本地水位線就先不前進；之後補報的時機有三個：重連時自動補報、出現更大的 seq 時、離開房間時。捲回同一個最大 seq 不會重報，因為 ChatController 遇到不比上次大的 seq 就 return。
② 收 read：ChatService 收到 type 是 read 的事件，呼叫 store.setRead，寫進 reads 表；如果 user 是自己，同時更新 rooms.my_read_seq。setRead 照單全收、不檢查只能前進，因為講師把你的水位線設回去，就是要你重測。
GET /rooms 回來的每一間房也帶 reads，upsertRooms 時一起寫進 reads 表。
氣泡的已讀標籤：reads 裡排除自己、水位線 ≥ 這則 seq 的人數；dm 顯示「已讀」，其他顯示「已讀 N」。`,

  // 18 ImplB
  `【40–50 分】
③ Room.unread = max(0, lastSeq − myReadSeq)，列表右邊用 Badge 顯示，超過 999 顯示 999+。
④ 定位：open() 先補洞（4 秒上限），再算第一則未讀 = myReadSeq + 1。本地有這一則（hasSeq），就設 firstUnreadSeq，並把 limit 加大到 countFrom(那一則) + 20，查詢視窗才裝得下；本地沒有，就記 unreadAbove = 最新 − 水位線。
chat_page 依 firstUnreadSeq 把訊息切成未讀、已讀兩段：未讀那段放在 center 之前、由舊到新；分隔線加已讀放在 center 那段。anchor 設 0.75，分隔線就在畫面上方 1/4。「跳到最新 ↓」捲到 offset 0。
提醒：定位之後，畫面上看到的未讀會照 ① 的規則慢慢把水位線往前推，不會一進房就清零。`,

  // 19 Acceptance
  `【50–54 分】驗收
第一項：講師點你的房間，儀表板右側會即時顯示每個人的水位線。你往下捲，數字跟著走；往上滑，不會倒退。
第二項：私聊（dm）互看顯示「已讀」；講師分的兩人組（pair）顯示「已讀 1」，這是對的，不是寫錯。第 1 堂的名字規則：Amy / Amy-2 是同一人的兩台裝置，兩人組裡有 Amy-2 時 N 會多 1。講師拉 3 人群，一人發言，另外兩人都看過後顯示「已讀 2」。
第三項：請學員先退回房間列表，講師再設已讀、再灌訊息。如果學員還停在房間底部，新訊息一出現在畫面上，500ms 後水位線就被報到最新，講師剛設的 50 會被蓋掉。講師在儀表板把你在某間房的已讀設成 50，再對那間灌 300 則。你的列表顯示未讀 300，點進去停在分隔線。那間房不到 50 則的話，Server 會把設定值夾在房間最新 seq，看不到未讀 300，請挑訊息夠多的房間。
第四項：只看上半就停，儀表板上的位置停在你看到的那一則。
第五項：換一個新名字登入（等於新裝置、本地是空的），講師先把這個名字拉進有很多訊息的房間，水位線設很前面。進房應該停在最底，出現「上方還有 N 則未讀」。`,

  // 20 Feynman
  `【54–55 分】費曼檢核

參考答案
Q1：seq 在房間內連續遞增，聊天又是從舊往新看，所以「讀到第幾號」就涵蓋了前面全部。只能往前，是因為網路順序可能亂掉、使用者也會往上滑，倒退會讓別人看到的「已讀」消失。
Q2：reads 表裡，排除自己，水位線 ≥ 這則 seq 的人數。在手機上算，不用 Server 算；Server 只負責轉送每個人的水位線。
Q3：房間最新 seq 減我的水位線，最小是 0。第一則未讀不在本地（新裝置），就停在最底，提示上方還有幾則未讀。`,

  // 21 Think
  `【55–57 分】思考分享
兩人一組想 3 分鐘，抽兩三組講。講完翻下一頁講師補充。

參考答案：照今天的寫法，一則 read 進來，Server 要送 1000 則出去；1000 人都在捲動，每人每秒就算只送一兩則，Server 每秒要送出上百萬則，手機也被一直叫醒處理別人的已讀。
真正需要「已讀 N」的，只有那則訊息的發送者，而且他不需要每一毫秒都準。所以方向是：只推給需要的人、合併後再推、或改成要看時才拉。`,

  // 22 ExtraFanout
  `【57–58 分】講師補充：千人群組的已讀
一則事件要複製給很多人，叫 Fan-out，扇出：像扇子從一點展開成很多支。1000 人的群組，每則 read 的扇出就是 1000。
只推給發送者：只有發過訊息的人需要已讀 N。代價是 Server 要知道這段範圍內每則是誰發的。
Server 節流：這就是 Throttle，節流，同一間房的已讀變化先累積，每幾秒合併推一次。已讀 N 會晚幾秒，但沒人在意。
改成主動拉：Pull，主動拉，發送者點開「誰讀了」才去問 Server。省最多，但看不到數字即時跳動。
大群關閉已讀：很多產品的做法，群組超過一定人數就只顯示「已讀 N」的大概，或乾脆不顯示。
業界常見的組合是：私聊和小群即時推、大群節流或改拉；這裡講方向即可，不要講特定 App 的實作細節。

術語
・Fan-out（扇出）
・Throttle（節流）
・Pull（主動拉）`,

  // 23 AllDone
  `【58–59 分】全部打勾
回到能力演進表。從第 1 堂的一條 WebSocket，到心跳重連、反轉列表、樂觀更新與 ACK、本地 DB、歷史分頁、斷線補洞、多房間，到今天的已讀未讀，整張表全部打勾。
可以請一兩位同學，指著表上任一格，用一句話講出它是靠哪一堂的什麼做到的。`,

  // 24 Hook
  `【59–60 分】結尾鉤子
先把現狀講清楚：能力演進表全部打勾，App 該有的基本功能都有了。PM 又帶來四個新需求：同一帳號手機和平板同時登入、對方正在輸入中、訊息編輯和收回、傳一支 10MB 的影片。
問全班：今天這套架構接得住嗎？哪一個你覺得最難？
說明下一堂的形式：不寫程式。各組認領一題，20 分鐘畫設計，每組上台 5 分鐘，其他組和講師扮演面試官追問。
（不要直接講答案。各題的關鍵問題留到下一堂：水位線記在人還是裝置、正在輸入要不要存 DB、seq 不可跳號所以刪除要標記、大檔案不塞進 WebSocket。）

講師自己複習（面試關鍵字，不用講給學員）
・Read Watermark：每人每房一個 last_read_seq，只能前進（App 和 Server 兩邊擋），講師強制設定例外。
・Debounce：可見最大 seq 停 500ms 再經 WS 回報；離開房間時立刻報出最後一則。
・已讀 N：reads 中排除自己、水位線 ≥ seq 的人數，是衍生資料不存；未讀 = max(0, last_seq − my_read_seq)。
・Unread Anchor：open() 先補洞，第一則未讀在本地就用 center key 定位；不在本地停底部提示，不用 around_seq 以免斷層。
・Fan-out：大群已讀改只推發送者、節流、主動拉或關閉。`,
];

// 換頁轉場：RISE（照 open-slide transitions.md，全 deck 一種）
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

export const meta: SlideMeta = {
  title: '第 09 堂｜已讀 + 未讀（水位線、已讀 N、未讀定位）',
  createdAt: '2026-11-24T09:51:07.000Z',
};

export default [
  Cover,
  Scenario,
  Evolution,
  Recap,
  WhatToStore,
  Watermark,
  DebouncePage,
  ReadFlow,
  VisibleNow,
  ScenarioB,
  ReadN,
  UnreadCount,
  AnchorQuestion,
  AnchorFlow,
  AnchorView,
  NewDevice,
  ImplA,
  ImplB,
  Acceptance,
  Feynman,
  Think,
  ExtraFanout,
  AllDone,
  Hook,
] satisfies Page[];
