import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 第 10 堂：設計研討會（多裝置、正在輸入、編輯刪除、傳影片）
// 學員看得到的頁面只放題目；參考答案和講稿都在 `notes`。
// 共用元件從第 9 堂複製，第 10 堂專用元件在後半段。
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
      <span>即時聊天室 · 第 10 堂</span>
      <span style={{ color: muted, fontWeight: 500 }}>/ {section}</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#dde9fb">Lesson 10</Pill>
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


// ═════════════ 第 10 堂專用元件 ═════════════

// 題目頁：PM 需求 + 限制條件（直接顯示）+ 思考提示（按 → 一條一條出現）
const Brief = ({
  n,
  title,
  ask,
  limits,
  hints,
}: {
  n: string;
  title: string;
  ask: ReactNode;
  limits: ReactNode[];
  hints: ReactNode[];
}) => (
  <Shell section={`題 ${n}`} title={title}>
    <Bubble who="PM" role="PM">
      {ask}
    </Bubble>
    <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
      <Card style={{ flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: red, marginBottom: 12 }}>限制條件</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {limits.map((l, i) => (
            <div key={i} style={{ fontSize: 27, lineHeight: 1.5 }}>
              ・{l}
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: blue, marginBottom: 12 }}>思考提示</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Steps>
            {hints.map((h, i) => (
              <Step key={i}>
                <div style={{ fontSize: 27, lineHeight: 1.5 }}>？ {h}</div>
              </Step>
            ))}
          </Steps>
        </div>
      </Card>
    </div>
  </Shell>
);

// 追問頁：面試官的問題，一題一題出現
const Grill = ({ n, title, qs }: { n: string; title: string; qs: ReactNode[] }) => (
  <Shell section={`題 ${n} 追問`} title={title} sub="報告完，其他組和講師當面試官。先讓報告的那組回答。">
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Steps>
          {qs.map((q, i) => (
            <Step key={i}>
              <Goal n={`Q${i + 1}`}>{q}</Goal>
            </Step>
          ))}
        </Steps>
      </div>
    </Card>
  </Shell>
);

// 最後的架構圖：每一格是一堂做出來的能力
type ABox = { row: number; col: number; label: string; lesson: string };
const AROW = ['畫面', '邏輯', '本地資料', '連線'];
const ATINT = ['#dde9fb', '#fbe7b5', '#d6ecd9', '#fbd9b8'];
const ABOXES: ABox[] = [
  { row: 3, col: 0, label: 'WebSocket 收發', lesson: 'L1' },
  { row: 3, col: 1, label: '心跳 + 自動重連', lesson: 'L2' },
  { row: 0, col: 0, label: '反轉列表', lesson: 'L3' },
  { row: 1, col: 0, label: '樂觀更新 + ACK + 冪等', lesson: 'L4' },
  { row: 2, col: 0, label: '本地 DB（SSOT）', lesson: 'L5' },
  { row: 2, col: 1, label: '歷史分頁', lesson: 'L6' },
  { row: 1, col: 1, label: '補洞 + 補送', lesson: 'L7' },
  { row: 0, col: 1, label: '房間列表', lesson: 'L8' },
  { row: 1, col: 2, label: '一條 WS 載所有房間', lesson: 'L8' },
  { row: 2, col: 2, label: 'DB 升版', lesson: 'L8' },
  { row: 0, col: 2, label: '已讀 / 未讀', lesson: 'L9' },
];
const AW = 466;
const AH = 104;
const AGAP = 22;
const ax = (c: number) => 230 + c * (AW + AGAP);
const ay = (r: number) => r * (AH + AGAP);

const ArchBox = ({ b, lit }: { b: ABox; lit: boolean }) => (
  <div
    style={{
      position: 'absolute',
      left: ax(b.col),
      top: ay(b.row),
      width: AW,
      height: AH,
      boxSizing: 'border-box',
      borderRadius: 14,
      border: lit ? `3px solid ${ink}` : `2px dashed ${line}`,
      background: lit ? ATINT[b.row] : panel,
      boxShadow: lit ? `5px 5px 0 ${line}` : 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 24px',
      color: lit ? ink : grey,
    }}
  >
    <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 900, color: lit ? 'var(--osd-accent)' : grey }}>{b.lesson}</span>
    <span style={{ fontSize: 30, fontWeight: lit ? 900 : 500 }}>{b.label}</span>
  </div>
);

// ═════════════ 頁面 ═════════════

const Cover: Page = () => (
  <div style={fill}>
    <TopBar section="封面" />
    <div style={{ position: 'absolute', left: 120, top: 220, width: 1200 }}>
      <div style={{ display: 'flex', gap: 14 }}>
        <Pill tint="#fbe7b5">⏱ 60～90 min</Pill>
        <Pill tint="#d6ecd9">階段三 · 討論</Pill>
        <Pill tint={panel}>不寫程式</Pill>
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
        設計研討會
      </h1>
      <p style={{ fontSize: 36, color: muted, margin: 0, lineHeight: 1.5 }}>
        四個新需求，分組畫設計、上台報告，
        <br />
        其他組當面試官
      </p>
      <div style={{ display: 'flex', gap: 14, marginTop: 56 }}>
        <Pill tint={panel}>多裝置登入</Pill>
        <Pill tint={panel}>正在輸入</Pill>
        <Pill tint={panel}>編輯 / 收回</Pill>
        <Pill tint={panel}>10MB 影片</Pill>
      </div>
    </div>
  </div>
);

const Recap: Page = () => (
  <BigQuestion
    tag="上堂結尾：能力演進表全部打勾，PM 又帶來四個新需求"
    tagColor="#f7d9d6"
    foot="多裝置同時登入、對方正在輸入、訊息編輯和收回、傳一支 10MB 的影片。今天不寫程式，分組設計。"
    hint="提示：每一題先問三件事：這份資料要不要存？存在哪？誰需要知道？"
  >
    這套架構，
    <br />
    接得住這四題嗎？
  </BigQuestion>
);

const HowToday: Page = () => (
  <Shell section="進行方式" title="今天怎麼進行" sub="一組認領一題。四題都有人做，其他三題你就是面試官。">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
      <Steps>
        <div style={{ display: 'flex', height: '100%' }}>
          <FlowBox title="認領一題" sub="看完四題需求，各組選一題" tint="#dde9fb" />
        </div>
        <Step>
          <div style={{ display: 'flex', height: '100%' }}>
            <FlowArrow />
            <FlowBox title="畫設計" sub="20 分鐘，畫在白板或紙上" tint="#fbe7b5" />
          </div>
        </Step>
        <Step>
          <div style={{ display: 'flex', height: '100%' }}>
            <FlowArrow />
            <FlowBox title="上台報告" sub="每組 5 分鐘" tint="#d6ecd9" />
          </div>
        </Step>
        <Step>
          <div style={{ display: 'flex', height: '100%' }}>
            <FlowArrow />
            <FlowBox title="面試官追問" sub="其他組 + 講師，約 3 分鐘" tint="#fbd9b8" />
          </div>
        </Step>
        <Step>
          <div style={{ display: 'flex', height: '100%' }}>
            <FlowArrow />
            <FlowBox title="講師補充" sub="業界常見做法與取捨" tint={panel} />
          </div>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ marginTop: 48 }}>
          <WhyBox q="面試官的任務不是挑錯，是找出「這個設計在什麼情況下會壞」。" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const Blocks: Page = () => (
  <Shell section="你手上的積木" title="這 9 堂做出來的東西，都可以拿來用" sub="設計時先想：能不能用現有的積木組出來？">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
      {[
        ['L1', 'WebSocket + JSON 協議', 'type / sender / text'],
        ['L2', '心跳 + 重連', 'ping / pong、Backoff + Jitter'],
        ['L3', '反轉列表', '新訊息貼底、center key'],
        ['L4', '樂觀更新 + ACK', 'client_msg_id 冪等去重'],
        ['L5', '本地 DB 當 SSOT', 'Upsert、畫面只看 DB'],
        ['L6', 'Cursor 分頁', 'before_seq、seq 房內連續'],
        ['L7', '補洞 + 補送', 'after_seq、Outbox'],
        ['L8', '多房間', 'room_id、room_added、DB 升版'],
        ['L9', '已讀 + 未讀', '水位線、Debounce、center 錨點'],
      ].map(([l, t, s]) => (
        <Card key={l} style={{ padding: '20px 28px' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
            <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 900, color: 'var(--osd-accent)' }}>{l}</span>
            <span style={{ fontSize: 30, fontWeight: 900 }}>{t}</span>
          </div>
          <div style={{ fontSize: 23, color: muted, marginTop: 8 }}>{s}</div>
        </Card>
      ))}
    </div>
  </Shell>
);

const Frame: Page = () => (
  <Shell section="報告框架" title="報告照這五步走" sub="系統設計面試也是這個順序。5 分鐘，每一步一分鐘。">
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Steps>
          <Step>
            <Goal n="01">釐清需求：範圍多大？幾個人？要多即時？離線多久要撐得住？</Goal>
          </Step>
          <Step>
            <Goal n="02">資料：存什麼、存在哪（Server／本地 DB／只在記憶體）、要不要 seq</Goal>
          </Step>
          <Step>
            <Goal n="03">流程：畫一張循序圖，誰傳了什麼給誰</Goal>
          </Step>
          <Step>
            <Goal n="04">壞掉的時候：斷線、重複、順序亂、App 被殺掉</Goal>
          </Step>
          <Step>
            <Goal n="05">取捨：你放棄了什麼？為什麼值得？</Goal>
          </Step>
        </Steps>
      </div>
    </Card>
  </Shell>
);

const T1: Page = () => (
  <Brief
    n="1"
    title="同一帳號，手機和平板同時登入"
    ask={
      <>
        「使用者想<b style={{ color: 'var(--osd-accent)' }}>手機和平板同時登入</b>。兩邊都要收得到訊息，
        <br />
        在手機看過的，平板也要算看過。」
      </>
    }
    limits={['Server 現在同名在線就拒絕（409）', '水位線現在是每人每房一個', 'Outbox 在每台裝置自己的本地 DB']}
    hints={['水位線，要記在「人」還是「裝置」？', '自己在手機傳的訊息，平板怎麼拿到？', '兩台各有一個 Outbox，會互相干擾嗎？']}
  />
);

const T2: Page = () => (
  <Brief
    n="2"
    title="對方正在輸入中……"
    ask={
      <>
        「聊天時對方在打字，要顯示<b style={{ color: 'var(--osd-accent)' }}>『對方正在輸入中…』</b>。
        <br />
        群組也要。」
      </>
    }
    limits={['不能讓 Server 和手機電量爆掉', '對方可能打到一半就進電梯', '群組可能有 50 人']}
    hints={['「正在輸入」要不要存進 DB？', '打字的時候，多久送一次？', '什麼時候該讓這行字消失？']}
  />
);

const T3: Page = () => (
  <Brief
    n="3"
    title="訊息可以編輯、可以收回"
    ask={
      <>
        「打錯字要能<b style={{ color: 'var(--osd-accent)' }}>改</b>；傳錯人要能<b style={{ color: 'var(--osd-accent)' }}>收回</b>，
        <br />
        對方畫面上也要跟著變。」
      </>
    }
    limits={['seq 在房間裡不能跳號', '對方可能離線三天才上線', '那一則可能已經被讀過、被回覆過']}
    hints={['收回之後，那個 seq 怎麼辦？', '離線的人，怎麼知道有一則被改了？', '編輯和收回，能不能用同一套做法？']}
  />
);

const T4: Page = () => (
  <Brief
    n="4"
    title="傳一支 10MB 的影片"
    ask={
      <>
        「要能傳<b style={{ color: 'var(--osd-accent)' }}>10MB 的影片</b>，對方點了就能播。
        <br />
        上傳到一半進電梯，出來要能<b style={{ color: 'var(--osd-accent)' }}>接著傳</b>。」
      </>
    }
    limits={['全 App 只有一條 WebSocket，載著所有房間', '心跳：10 秒 ping 一次，5 秒沒 pong 就判定假死', '使用者可能在上傳中殺掉 App']}
    hints={['影片要不要走 WebSocket？', '上傳完成之前，聊天室裡要顯示什麼？', '斷掉之後，從哪裡接著傳？']}
  />
);

const DesignTime: Page = () => (
  <Shell section="設計時間" title="20 分鐘，畫出來" sub="講師巡場，卡住可以舉手。最後 2 分鐘決定誰上台講。">
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 200,
          fontWeight: 900,
          lineHeight: 1,
          color: 'var(--osd-accent)',
          padding: '20px 40px',
          border: `4px solid ${ink}`,
          borderRadius: 24,
          background: panel,
          boxShadow: `10px 10px 0 ${line}`,
        }}
      >
        20:00
      </div>
      <Card style={{ flex: 1 }}>
        <div style={{ fontSize: 26, color: muted, marginBottom: 16 }}>上台時，白板上至少要有</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Check>一張資料表或資料格式</Check>
          <Check>一張循序圖：誰傳什麼給誰</Check>
          <Check>一個「壞掉的情況」和你的處理</Check>
          <Check>一句話講你的取捨</Check>
        </div>
      </Card>
    </div>
  </Shell>
);

const T1Case: Page = () => (
  <Shell section="題 1 追問" title="面試官：照現在的系統跑一次" sub="Amy 的手機已經連著。她打開平板。">
    <SeqDiagram
      lanes={['Amy 的手機', 'Server', 'Amy 的平板']}
      pad={260}
      rowH={52}
      stepFrom={1}
      items={[
        { kind: 'note', at: 0, label: '已連線（user=Amy）', tint: '#d6ecd9' },
        { kind: 'msg', from: 2, to: 1, label: '連線 ws?user=Amy' },
        { kind: 'msg', from: 1, to: 2, label: '409：同名已在線', color: red },
        { kind: 'note', at: 2, label: '平板連不上', tint: '#f7d9d6' },
        { kind: 'gap', label: '假設 Server 改成放行兩條連線……' },
        { kind: 'msg', from: 0, to: 1, label: 'send「我到了」' },
        { kind: 'msg', from: 1, to: 0, label: 'ack #12', color: green },
        { kind: 'note', at: 2, label: '平板收得到「我到了」嗎？', tint: '#fdf0e3' },
        { kind: 'note', at: 0, label: '手機上讀到 #12' },
        { kind: 'note', at: 2, label: '平板的未讀數是多少？', tint: '#fdf0e3' },
      ]}
    />
  </Shell>
);

const T1Grill: Page = () => (
  <Grill
    n="1"
    title="多裝置：面試官的問題"
    qs={[
      '水位線記在「人」還是「裝置」？Amy 在手機讀了，平板的未讀要不要歸零？',
      'Amy 在平板傳的訊息，手機怎麼拿到？只靠即時推送夠嗎？',
      '兩台各自有 Outbox，同時補送，會不會重複？',
      'Amy 在一台全新的平板第一次登入，畫面要先出現什麼？',
    ]}
  />
);

const T2Case: Page = () => (
  <Shell section="題 2 追問" title="面試官：打字的時候，線上跑什麼" sub="最直覺的做法：Amy 一打字就通知 Bob。">
    <SeqDiagram
      lanes={['Amy 的 App', 'Server', 'Bob 的 App']}
      pad={260}
      rowH={62}
      stepFrom={0}
      items={[
        { kind: 'note', at: 0, label: 'Amy 開始打字' },
        { kind: 'msg', from: 0, to: 1, label: 'typing' },
        { kind: 'msg', from: 1, to: 2, label: 'typing' },
        { kind: 'note', at: 2, label: '顯示「Amy 正在輸入中…」', tint: '#d6ecd9' },
        { kind: 'note', at: 0, label: '每打一個字就送一次？', tint: '#fdf0e3' },
        { kind: 'gap', label: 'Amy 打到一半，進了電梯，斷線' },
        { kind: 'note', at: 2, label: '這行字要顯示到什麼時候？', tint: '#fdf0e3' },
      ]}
    />
  </Shell>
);

const T2Grill: Page = () => (
  <Grill
    n="2"
    title="正在輸入：面試官的問題"
    qs={[
      '「正在輸入」要不要寫進 DB？要不要給它 seq？',
      '打字時多久送一次？停下來、刪光、按送出時，各送什麼？',
      'Bob 收到之後顯示多久？Amy 斷線了，Bob 怎麼知道？',
      '50 人的群組，10 個人同時在打字呢？',
    ]}
  />
);

const T3Case: Page = () => (
  <Shell section="題 3 追問" title="面試官：收回的時候，Bob 不在線" sub="Bob 本地有 #55～#60，他已經離線。Amy 收回了 #57。">
    <SeqDiagram
      lanes={['Amy 的 App', 'Server', 'Bob 的 App']}
      pad={260}
      rowH={60}
      stepFrom={1}
      items={[
        { kind: 'note', at: 2, label: '本地 #55～#60，離線中', tint: '#efe6d6' },
        { kind: 'note', at: 0, label: 'Amy 按下「收回 #57」' },
        { kind: 'msg', from: 0, to: 1, label: '收回 #57' },
        { kind: 'note', at: 1, label: '#57 要怎麼處理？', tint: '#fdf0e3' },
        { kind: 'gap', label: '三天後，Bob 上線' },
        { kind: 'msg', from: 2, to: 1, label: '補洞 after_seq=60', color: blue },
        { kind: 'msg', from: 1, to: 2, label: '#61～#80', color: blue },
        { kind: 'note', at: 2, label: '#57 還在 Bob 的畫面上嗎？', tint: '#fdf0e3' },
      ]}
    />
  </Shell>
);

const T3Grill: Page = () => (
  <Grill
    n="3"
    title="編輯與收回：面試官的問題"
    qs={[
      '收回的訊息，seq 留不留？為什麼第 7 堂說 seq 不能跳號？',
      'Bob 離線三天，怎麼知道 #57 被收回了？補洞的 after_seq 為什麼看不到？',
      '房間列表的預覽剛好是那一則？有人回覆過那一則呢？',
      '編輯和收回，可以共用同一套做法嗎？',
    ]}
  />
);

const T4Case: Page = () => (
  <Shell section="題 4 追問" title="面試官：直接用 WebSocket 傳，會怎樣" sub="假設把 10MB 影片包成一則訊息，從那條唯一的 WebSocket 送出去。網路很慢。">
    <SeqDiagram
      lanes={['Amy 的 App', 'Server', 'Bob 的 App']}
      pad={260}
      rowH={62}
      stepFrom={0}
      items={[
        { kind: 'msg', from: 0, to: 1, label: 'send：影片 10MB（WebSocket 一則）' },
        { kind: 'note', at: 0, label: '慢網路：要傳 40 秒' },
        { kind: 'msg', from: 0, to: 1, label: 'ping（排在影片後面）', color: grey },
        { kind: 'note', at: 0, label: '5 秒沒等到 pong → 判定假死', tint: '#f7d9d6' },
        { kind: 'note', at: 0, label: '斷線重連 → 影片從頭再傳？', tint: '#fdf0e3' },
        { kind: 'msg', from: 1, to: 2, label: 'message：影片 10MB' },
        { kind: 'note', at: 2, label: '其他房間的訊息排在後面？', tint: '#fdf0e3' },
      ]}
    />
  </Shell>
);

const T4Grill: Page = () => (
  <Grill
    n="4"
    title="傳影片：面試官的問題"
    qs={[
      '影片走哪一條路？最後 WebSocket 上傳的是什麼？',
      '上傳完成之前，Amy 的聊天室顯示什麼？Bob 那邊呢？',
      '進電梯斷線，出來之後從哪裡接著傳？中途殺掉 App 呢？',
      'Bob 什麼時候才下載影片？房間列表和聊天室先看到什麼？',
    ]}
  />
);

const E2EE: Page = () => (
  <BigQuestion
    tag="延伸閱讀：端對端加密（今天不討論）"
    tagColor="#dde9fb"
    foot="端對端加密：只有聊天雙方的裝置解得開內容。Server 只負責轉送，自己看不懂。"
    hint="提示：一題一題回頭看，哪些功能需要 Server「看得懂」訊息內容？"
  >
    如果 Server 看不懂內容，
    <br />
    這 10 堂哪些要重想？
  </BigQuestion>
);

const Arch: Page = () => (
  <Shell section="收尾" title="從一條 WebSocket，到一個聊天室" sub="每一格，是一堂課做出來的能力。">
    <div style={{ position: 'relative', width: 1680, height: 4 * (AH + AGAP) + 90 }}>
      {AROW.map((r, i) => (
        <div
          key={r}
          style={{
            position: 'absolute',
            left: 0,
            top: ay(i),
            width: 200,
            height: AH,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            fontSize: 28,
            fontWeight: 900,
            color: muted,
          }}
        >
          {r}
        </div>
      ))}
      {ABOXES.map((b, i) => (
        <ArchBox key={i} b={b} lit={false} />
      ))}
      <Steps>
        {['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'].map((l) => (
          <Step key={l}>
            <div>
              {ABOXES.filter((b) => b.lesson === l).map((b, i) => (
                <ArchBox key={i} b={b} lit />
              ))}
            </div>
          </Step>
        ))}
        <Step>
          <div
            style={{
              position: 'absolute',
              left: 230,
              top: 4 * (AH + AGAP) + 6,
              width: 3 * AW + 2 * AGAP,
              height: 70,
              boxSizing: 'border-box',
              borderRadius: 14,
              border: `3px solid ${ink}`,
              background: '#fdf0e3',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '0 24px',
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            <span style={{ fontFamily: mono, color: 'var(--osd-accent)' }}>L10</span>
            在這個架構上設計：多裝置、正在輸入、編輯收回、影片
          </div>
        </Step>
      </Steps>
    </div>
  </Shell>
);

const FeynmanAll: Page = () => (
  <Shell section="費曼收尾" title="兩人一組，講完整個系統" sub="一人講、一人追問，5 分鐘後交換。不看螢幕、不看程式碼。">
    <Card>
      <Goal n="主題">Amy 在活動群按下送出，到 Bob 的畫面出現、Amy 看到「已讀 1」，中間經過哪些元件？</Goal>
    </Card>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 36 }}>
      <Steps>
        <Step>
          <Goal n="追問 1">Amy 按送出的那一刻剛好斷線呢？</Goal>
        </Step>
        <Step>
          <Goal n="追問 2">Bob 那時候開著另一個房間呢？Bob 的 App 被殺掉了呢？</Goal>
        </Step>
        <Step>
          <Goal n="追問 3">Bob 換了新手機，第一次打開活動群呢？</Goal>
        </Step>
      </Steps>
    </div>
  </Shell>
);

const Finale: Page = () => (
  <div style={fill}>
    <TopBar section="結業" />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 200 }}>
      <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 100, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>
        10 堂，
        <br />
        一個聊天室
      </h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 56, maxWidth: 1500 }}>
        {[
          'L1 接通 + 收發',
          'L2 心跳 + 重連',
          'L3 反轉列表',
          'L4 樂觀更新 + ACK',
          'L5 本地 DB',
          'L6 歷史分頁',
          'L7 補洞 + 補送',
          'L8 房間列表',
          'L9 已讀 + 未讀',
          'L10 設計研討會',
        ].map((t) => (
          <Pill key={t} tint={panel}>
            {t}
          </Pill>
        ))}
      </div>
      <p style={{ fontSize: 34, color: muted, marginTop: 56 }}>每一格，都是你在面試時說得出「為什麼」的設計。</p>
    </div>
  </div>
);

// ═════════════ 講稿 ═════════════

export const notes: (string | undefined)[] = [
  // 1 Cover
  `開場前儀表板狀態（課前對一次）
□ 行為等級：不需操作（研討會）；若要現場示範：ACK
□ 全域延遲：不需操作；若要現場示範：0 ms
□ 分房：不需操作
□ 其他：今天不寫程式，儀表板只在現場示範時才用

【0:00】
最後一堂不寫程式。前 9 堂把一個聊天室從一條 WebSocket 一路寫到已讀未讀；今天把它當成一個現成的系統，拿四個新需求去考它。
今天的形式就是 System Design Interview，系統設計面試：面試官給一個需求，你在白板上畫出資料怎麼存、訊息怎麼走、壞掉怎麼辦，再被追問。Mobile 的資深職缺幾乎都會考，今天就是一次模擬。
時間抓 60～90 分鐘：開場 10 分鐘、認領 5 分鐘、設計 20 分鐘、四組報告加追問加補充各約 11 分鐘，最後收尾。

術語
・System Design Interview（系統設計面試）`,

  // 2 Recap
  `【0–3 分】回顧
先把上一堂結尾講一次給沒印象的人：上一堂做完已讀未讀，能力演進表全部打勾。PM 接著帶來四個新需求：同一帳號手機和平板同時登入、對方正在輸入中、訊息編輯和收回、傳一支 10MB 的影片。
問全班：這套架構接得住嗎？哪一題你覺得最難？先聽幾個直覺。
（→）出現提示：每一題先問三件事，這份資料要不要存？存在哪？誰需要知道？這三個問題今天會一直用。
不要在這裡給任何一題的方向，讓各組自己發現。`,

  // 3 HowToday
  `【3–5 分】進行方式
先指左邊第一格：認領一題。等一下會快速翻過四題的需求，每組選一題，四題都要有人做。
（→）第二格：畫設計，20 分鐘，畫在白板或紙上。
（→）第三格：上台報告，每組 5 分鐘。
（→）第四格：面試官追問。其他組加上講師當面試官，大約 3 分鐘。
（→）最後一格：講師補充業界常見做法和取捨。
（→）出現一句話：面試官的任務不是挑錯，是找出「這個設計在什麼情況下會壞」。報告的人被問倒很正常，真正的面試也是這樣，重點是能不能說出取捨。`,

  // 4 Blocks
  `【5–7 分】你手上的積木
快速帶過這 9 格，每格一句話就好。重點是讓大家知道：四題裡大部分的答案，都可以用這些積木組出來，不需要發明新東西。
例如 client_msg_id 的冪等、seq 在房間內連續、after_seq 補洞、Outbox、room_added 推播、水位線。設計卡住時，回來看這一頁。
不要點名哪一格對應哪一題。`,

  // 5 Frame
  `【7–9 分】報告框架
報告照五步走，系統設計面試也幾乎是這個順序。
（→）01 釐清需求：先問範圍，再動手。面試時直接開始畫，是最常見的扣分。
（→）02 資料：存什麼、存在哪、要不要 seq。這一步通常決定一半的設計。
（→）03 流程：畫循序圖，就是這 9 堂一直在畫的那種，誰傳什麼給誰。
（→）04 壞掉的時候：斷線、重複、順序亂、App 被殺。這幾種狀況叫 Edge Case，邊界情況：不是平常會走的路，但真的會發生，而且最容易出 bug 的地方。這 9 堂每一堂都在處理邊界情況。
（→）05 取捨：沒有完美的設計。說出你放棄了什麼、為什麼值得，這叫 Trade-off，取捨。面試官最想聽的就是這一句。

術語
・Edge Case（邊界情況）
・Trade-off（取捨）`,

  // 6 T1
  `【9–10 分】題 1：多裝置
唸 PM 的需求。先指左邊的限制：Server 現在同名在線就回 409；水位線每人每房一個；Outbox 在每台裝置自己的 DB。
（→）提示一：水位線記在人還是裝置？
（→）提示二：自己在手機傳的訊息，平板怎麼拿到？
（→）提示三：兩台各有一個 Outbox，會互相干擾嗎？
提醒：工作坊裡第二台模擬器用 Amy-2 登入。第 1 堂的名字規則：Amy / Amy-2 是同一人的兩台裝置，但那只是分房的約定：Server 只在分房時用 _base 把它們放在一起；連線（409）、水位線、本地 DB 都還是兩個名字。對系統來說它們是兩個帳號，不是同一帳號的第二台裝置。所以學員看到 Amy-2 讀了、Amy 顯示已讀，不是多裝置已經做好了。這題要想的是真正的同一個帳號。
如果有人查 Server 的 code：同名在線回 409 有一個例外，舊連線已經被講師用 /zombie 標成死線時，新連線會直接取代舊的，不回 409。這是工作坊示範用的，不影響今天的討論。`,

  // 7 T2
  `【10–11 分】題 2：正在輸入
唸 PM 的需求。限制：不能讓 Server 和電量爆掉、對方可能打到一半進電梯、群組可能 50 人。
（→）提示一：要不要存進 DB？
（→）提示二：打字的時候，多久送一次？
（→）提示三：什麼時候該讓這行字消失？`,

  // 8 T3
  `【11–12 分】題 3：編輯與收回
唸 PM 的需求。限制：seq 在房間裡不能跳號，這是第 6、7、9 堂一路的前提；對方可能離線三天；那一則可能已經被讀過、被回覆過。
（→）提示一：收回之後，那個 seq 怎麼辦？
（→）提示二：離線的人，怎麼知道有一則被改了？
（→）提示三：編輯和收回，能不能用同一套做法？`,

  // 9 T4
  `【12–14 分】題 4：10MB 影片
唸 PM 的需求。限制：全 App 一條 WebSocket（第 8 堂）；心跳 10 秒 ping 一次、5 秒沒 pong 就判定假死（第 2 堂的 ChatSocket 設定）；使用者可能在上傳中殺掉 App。
（→）提示一：影片要不要走 WebSocket？
（→）提示二：上傳完成之前，聊天室裡要顯示什麼？
（→）提示三：斷掉之後，從哪裡接著傳？
四題翻完，各組認領。如果有兩組搶同一題，猜拳；人數不夠四組時，題 2 最適合併給同一組加做。`,

  // 10 DesignTime
  `【14–34 分】設計時間
計時 20 分鐘。講師巡場，看到卡住的組，用問題推，不給答案：例如「這份資料，App 被殺掉之後還需要嗎？」「Bob 離線的話，這一步會怎樣？」
最後 2 分鐘提醒各組決定誰上台，並確認白板上有右邊四樣：資料、循序圖、一個壞掉的情況、一句取捨。`,

  // 11 T1Case
  `【34–39 分】題 1 報告 + 追問
先讓題 1 的組報告 5 分鐘，報告完再翻這頁當追問。
三條線：Amy 的手機、Server、Amy 的平板。一開始一格：手機已經用 user=Amy 連著。
（→）平板傳給 Server：連線 ws?user=Amy。
（→）Server 回給平板：409，同名已在線。這是第 1 堂就定下的規則。
（→）平板連不上。所以第一個要改的是「身分」：連線要能區分是哪一台裝置。
（→）假設 Server 改成放行兩條連線。
（→）手機傳給 Server：send「我到了」。
（→）Server 回給手機：ack #12。
（→）問：平板收得到「我到了」嗎？讓報告的組回答。（講師參考：第 4 堂起 Server 不回送發送者。現在的 Server 跳過的是「送出的那一條連線」，不是那個名字，所以放行之後平板收得到；實作時如果改用名字判斷，平板就會漏掉。）
（→）手機上讀到 #12，回報水位線。
（→）問：平板的未讀數是多少？讓報告的組回答。`,

  // 12 T1Grill
  `【39–45 分】題 1 追問 + 講師補充
（→）Q1：水位線記在人還是裝置？
（→）Q2：平板傳的訊息，手機怎麼拿到？
（→）Q3：兩個 Outbox 會不會重複？
（→）Q4：全新平板第一次登入，先出現什麼？

參考答案與業界做法（講師補充，約 3 分鐘）
・身分：每台裝置一個 Device ID，裝置識別碼：安裝時產生、存在本地的一組 ID。Server 的連線表從「名字 → 一條連線」改成「名字 → 多條連線，每條標上 Device ID」。409 只擋同一台裝置重複連。
・Q1 水位線記在人：使用者的期待是「我看過了」，跟用哪台看無關。哪台回報都取最大值（第 9 堂的只能前進照用），Server 把 read 事件推給這個人的所有裝置。第 9 堂 Server 已經會把 read 回音給本人，多裝置時這個回音剛好派上用場。取捨：如果記在裝置，就能做到「平板上還是未讀」，但幾乎沒有使用者要這個。
・Q2 自己的訊息：Server 推 message 時，只跳過「送出的那一條連線」，不跳過同一個人的其他裝置。平板收到的是一則 sender 是自己、但本地沒有 client_msg_id 的訊息，照第 5 堂 Upsert 寫進去就好。就算推送漏了，第 7 堂的補洞也會補到，因為訊息在 Server 上有 seq。第 7 堂的 cursor 用「別人的最新 seq」，多裝置之後還是安全的：另一台送出的自己的訊息被排除在外，只會讓 cursor 偏小、補洞多抓幾則，Upsert 會去重，不會漏。
・Q3 Outbox：各台只補送自己本地的 unsent。client_msg_id 是 UUID，兩台不會撞號；就算同一台補送多次，Server 冪等。所以兩個 Outbox 互不干擾。
・Q4 新裝置：本地 DB 是空的，照第 6 堂抓每間最新一頁，第 9 堂新裝置的未讀提示也剛好派上用場。
這種讓同一個帳號在多台裝置上看到一致狀態的需求叫 Multi-device Sync，多裝置同步。
業界還會處理：登出某台裝置、每台裝置各自的推播 token、帳號被盜時踢掉所有裝置。點到就好。

術語
・Device ID（裝置識別碼）
・Multi-device Sync（多裝置同步）

可能被問到
問：兩台同時在讀，水位線會不會互相蓋掉？
答：不會。Server 只接受比較大的值，晚到的小值直接丟掉，兩台的回報順序怎麼亂都沒關係。`,

  // 13 T2Case
  `【45–50 分】題 2 報告 + 追問
先讓題 2 的組報告 5 分鐘，再翻這頁。這頁畫的是最直覺的做法，不是答案。三條線：Amy 的 App、Server、Bob 的 App。
（→）Amy 開始打字。
（→）Amy 的 App 傳給 Server：typing。
（→）Server 推給 Bob 的 App：typing。
（→）Bob 的畫面顯示「Amy 正在輸入中…」。
（→）問：每打一個字就送一次嗎？一秒打五個字就是五則，群組再乘以人數。
（→）Amy 打到一半，進了電梯，斷線。
（→）問：Bob 那行字要顯示到什麼時候？如果要等 Amy 送「停止輸入」，那一則永遠不會來。`,

  // 14 T2Grill
  `【50–56 分】題 2 追問 + 講師補充
（→）Q1：要不要寫進 DB？要不要 seq？
（→）Q2：多久送一次？停下來、刪光、按送出各送什麼？
（→）Q3：顯示多久？Amy 斷線，Bob 怎麼知道？
（→）Q4：50 人群組，10 個人同時打字？

參考答案與業界做法
・Q1 不存、不給 seq。「正在輸入」只有當下有意義，過了幾秒就沒用了，這種事件叫 Ephemeral Event，短暫事件：只轉送給現在在線的人，不寫 DB、不補洞、斷線就丟。給它 seq 的話，第 6～9 堂的分頁、補洞、未讀數全部會被它污染。
・Q2 用第 9 堂講過的 Throttle，節流：打字期間最多每幾秒送一次 typing（例如 3 秒），不是每個字送。刪光或按送出時，送一次 stop；送出的訊息本身到了，對方也可以直接把提示收掉。
・Q3 接收端設 TTL，存活時間：每次收到 typing 就把倒數重設成幾秒（例如 5 秒，要比送出間隔長），倒數到了沒再收到就自動消失。這樣斷線、App 被殺、stop 那一則掉了，都不用特別處理。TTL 是這題的核心：不要依賴「停止」那一則一定會到。
・Q4 群組：Server 只轉給在線的人；顯示合併成「Amy、Bob 等 3 人正在輸入」；大群直接不顯示或不轉送，省 Fan-out（第 9 堂的扇出）。
取捨：送得越頻繁越即時、越耗流量；TTL 越短越準、越容易閃爍。

術語
・Ephemeral Event（短暫事件）
・Throttle（節流）
・TTL（存活時間）

可能被問到
問：typing 要不要走 ACK？
答：不用。漏一則只是提示晚一點出現，不值得做重送；ACK 和 Outbox 留給真的不能掉的訊息。`,

  // 15 T3Case
  `【56–61 分】題 3 報告 + 追問
先讓題 3 的組報告，再翻這頁。三條線：Amy 的 App、Server、Bob 的 App。一開始一格：Bob 本地有 #55～#60，他已經離線。
（→）Amy 按下「收回 #57」。
（→）Amy 的 App 傳給 Server：收回 #57。
（→）問：Server 要怎麼處理 #57？直接刪掉嗎？
（→）三天後，Bob 上線。
（→）Bob 的 App 照第 7 堂補洞：after_seq=60。
（→）Server 回給 Bob：#61～#80。
（→）問：#57 還在 Bob 的畫面上嗎？讓大家發現：after_seq 只問「60 以後的新訊息」，舊訊息被改了，它永遠不會知道。`,

  // 16 T3Grill
  `【61–67 分】題 3 追問 + 講師補充
（→）Q1：seq 留不留？
（→）Q2：Bob 怎麼知道 #57 被收回？
（→）Q3：預覽剛好是那一則？被回覆過呢？
（→）Q4：編輯和收回能共用嗎？

參考答案與業界做法
・Q1 seq 留著。真的刪掉，#57 就變空號：第 7 堂範圍表會以為那是洞一直去補、第 6 堂分頁的「seq 連續」判斷會錯、第 9 堂未讀數會算錯。所以用第 7 堂提過的 Soft Delete，標記刪除：資料列留著、內容清掉、加一個「已收回」的標記。這個留下來的空殼叫 Tombstone，墓碑：東西沒了，但留一塊碑告訴大家這裡曾經有東西。
・Q2 兩種常見做法。
  做法 A：把收回當成一則新訊息。Server 存一則 type 是 recall、指向 #57 的系統訊息，它有自己的 seq，例如 #81。Bob 補洞拿到 #81，就去把本地 #57 改成墓碑。好處是整套補洞、ACK、冪等完全照用；代價是歷史裡多了看不見的事件訊息，分頁、未讀數要把它們排除。
  做法 B：另開一份 Change Log，變更紀錄：每間房再維護一個獨立遞增的版本號，每次編輯或收回就加一，App 記住自己同步到哪一版，連上時問「這版之後改了什麼」。好處是訊息 seq 乾淨；代價是多一套同步。
  在線的人兩種都一樣：Server 直接推一則事件。
・Q3 預覽：如果收回的是房間最後一則，rooms 表的預覽要改成「訊息已收回」，第 8 堂的 updatePreview 要能處理這種事件。回覆：回覆裡存的是被回覆那一則的快照，收回時快照也要顯示「已收回」，這也是為什麼快照要能被更新。
・Q4 可以共用。編輯就是「把 #57 的內容改成新的」，收回就是「改成墓碑」，都走同一條事件路線，差別只在內容。另外要決定權限和時限，例如只有發送者能改、幾分鐘內才能收回，這是產品決定。

術語
・Soft Delete（標記刪除）
・Tombstone（墓碑）
・Change Log（變更紀錄）

可能被問到
問：已經讀過的人，收回之後算不算未讀？
答：一般不算。水位線不倒退，收回只是改內容；未讀數照「最新 seq − 水位線」算。如果用做法 A，系統事件訊息要排除在未讀數之外。`,

  // 17 T4Case
  `【67–72 分】題 4 報告 + 追問
先讓題 4 的組報告，再翻這頁。這頁是「直接用 WebSocket 傳」會發生什麼事，不是答案。
（→）Amy 的 App 把 10MB 影片包成一則，從唯一那條 WebSocket 送給 Server。
（→）網路很慢，大約要傳 40 秒。（10MB 約 80Mb，2Mbps 的上傳速度大約 40 秒，示意用。）
（→）10 秒到了，Amy 的 App 送出 ping。但同一條連線上，它排在影片後面，影片沒傳完，ping 根本還沒出去。
（→）5 秒沒等到 pong，第 2 堂的心跳判定連線假死，斷線重連。
（→）問：重連之後，影片從頭再傳嗎？慢網路下，可能永遠傳不完。
（→）就算傳上去了，Server 推給 Bob 時也是一則 10MB。
（→）問：Bob 其他房間的訊息呢？全部排在這 10MB 後面。這就是第 8 堂講師補充講過的隊頭阻塞。`,

  // 18 T4Grill
  `【72–78 分】題 4 追問 + 講師補充
（→）Q1：影片走哪條路？WebSocket 上傳的是什麼？
（→）Q2：上傳完成前，兩邊顯示什麼？
（→）Q3：斷線從哪接著傳？殺掉 App 呢？
（→）Q4：Bob 什麼時候下載？

參考答案與業界做法
・Q1 影片不走 WebSocket，否則就是剛剛那張圖：Head-of-line Blocking，隊頭阻塞，一則大的卡住後面全部，連心跳都被卡住。做法是先用 HTTP 把檔案上傳到 Object Storage，物件儲存：專門放大檔案的服務，例如雲端的檔案儲存桶，便宜、可以直接給 CDN 用。常見流程是先跟自己的 Server 要一個 Pre-signed URL，預簽網址：一個有時效、只能上傳這一個檔案的網址，App 拿著它直接上傳到物件儲存，不經過聊天 Server。上傳完成，才從 WebSocket 送一則小訊息，內容是影片網址、大小、長度、縮圖網址。
・Q2 Amy 這邊：第 4 堂的樂觀更新照用，先在本地放一則「上傳中」的訊息，顯示本地縮圖和進度條；client_msg_id 照樣先產生。這時還沒送進 WebSocket，Bob 什麼都看不到。上傳完成才走正常的 send → ack，Bob 這時才收到。
・Q3 Resumable Upload，續傳：把檔案切成一段一段上傳，例如每段 1MB，Server 記得收到第幾段；斷線後先問「你收到哪了」，從下一段接著傳。業界有現成做法，例如雲端儲存的分段上傳，或開放的 tus 續傳協定。殺掉 App：本地檔案路徑和上傳進度存在 DB，就像第 7 堂的 Outbox，重開後接著傳；也可以交給系統的背景上傳機制，App 被關掉也能繼續傳。
・Q4 Bob：訊息先到，畫面先顯示縮圖和長度；使用者點了才下載或串流播放。這就是第 7 堂講師補充講過的多媒體分流：訊息走補洞，大檔案另外走下載和快取。上傳前也常先在手機上壓縮，10MB 可能變 3MB。
取捨：多一套上傳服務和兩段式送出，換來聊天通道永遠只走小訊息。

術語
・Head-of-line Blocking（隊頭阻塞）
・Object Storage（物件儲存）
・Pre-signed URL（預簽網址）
・Resumable Upload（續傳）

可能被問到
問：圖片也要這樣嗎？
答：要。幾百 KB 的圖片塞進 WebSocket 也會卡住心跳和其他房間，只是沒那麼明顯。原則是 WebSocket 只傳小訊息。`,

  // 19 E2EE
  `【78–80 分】延伸閱讀
今天不討論，只點題。端對端加密 E2EE（End-to-End Encryption）：內容只在聊天雙方的裝置上加密、解密，Server 只轉送看不懂的密文。
先問全班一句：如果 Server 看不懂內容，這 10 堂哪些要重想？
（→）出現提示：回頭看，哪些功能需要 Server「看得懂」訊息內容？
讓大家想 30 秒，講師帶過幾個方向就好，不要展開：
參考方向：房間列表的預覽（Server 給不了最後一則的明文，要在手機上解密）、Server 端搜尋、多裝置（每台裝置都要有金鑰，題 1 會變難很多）、檢舉與內容審查。不受影響的是 seq、水位線、room_id 這些「中繼資料」，Server 照樣看得到。
延伸閱讀關鍵字：Signal Protocol。

術語
・E2EE（端對端加密）`,

  // 20 Arch
  `【80–84 分】從一條 WebSocket 到一個聊天室
四層：畫面、邏輯、本地資料、連線。一開始全部是灰的。每按一次，點亮一堂做出來的能力。這種一層一層各管各的結構叫 Layered Architecture，分層架構：上層只依賴下層，換掉一層不用改其他層，例如第 5 堂把儲存換成 DB，畫面一行都沒改。
（→）L1：連線層的 WebSocket 收發。從純字串到 JSON。
（→）L2：心跳加自動重連，Backoff 加 Jitter。
（→）L3：畫面層的反轉列表，新訊息貼底。
（→）L4：邏輯層的樂觀更新、ACK、冪等。client_msg_id 從這裡開始。
（→）L5：本地資料層的 DB，當作唯一資料來源，畫面只看 DB。
（→）L6：歷史分頁，cursor 用 seq。
（→）L7：邏輯層的補洞和補送，第 2 堂的伏筆在這裡收回。
（→）L8：一次亮三格。房間列表、一條 WS 載所有房間、DB 升版。
（→）L9：已讀和未讀，水位線。
（→）最後一列：L10，今天在這個架構上做設計。四題的答案幾乎都是在既有的格子裡加東西，不是推倒重來，這就是分層架構的好處。

術語
・Layered Architecture（分層架構）`,

  // 21 FeynmanAll
  `【84–89 分】費曼收尾
兩人一組，一人講、一人追問，5 分鐘後交換。主題：Amy 在活動群按下送出，到 Bob 的畫面出現、Amy 看到「已讀 1」，中間經過哪些元件。
提醒講的人：照剛剛那張架構圖，從上到下、再從 Server 回來。
（→）追問 1：按送出那一刻剛好斷線呢？（參考：樂觀更新先上畫面 → ACK 逾時變紅點 → 連上後 Outbox 依建立時間補送，client_msg_id 冪等。）
（→）追問 2：Bob 開著另一個房間、或 App 被殺掉呢？（參考：開著別的房 → 只更新預覽與未讀數，點進來補洞；被殺掉 → 下次啟動連上就補洞，正式產品還會有推播。）
（→）追問 3：Bob 換新手機第一次打開活動群呢？（參考：本地空的抓最新一頁；第一則未讀不在本地 → 停在最底並提示上方未讀。）
講師巡場，聽到卡住的就用「下一步誰收到？存在哪？」推一下。`,

  // 22 Finale
  `【89–90 分】結業
10 堂從一條 WebSocket 開始，做到一個有房間、離線、已讀的聊天室，今天又在上面設計了四個新功能。
最後一句話留給大家：面試時被問「怎麼設計一個聊天室」，不要背答案，用這 10 堂的順序講：先接通、再處理斷線、再處理順序和重複、再存下來、再多房間、再已讀。每一步都說得出為什麼。
謝謝大家。

講師自己複習（面試關鍵字，不用講給學員）
・多裝置：Device ID；水位線記在人、取最大值、推給本人所有裝置；推播只跳過送出的那條連線；第 7 堂 cursor 偏保守仍安全。
・正在輸入：Ephemeral Event 不存不給 seq；送出端 Throttle；接收端 TTL 自動消失。
・編輯收回：seq 不跳號，Soft Delete / Tombstone；離線同步用「事件訊息帶 seq」或「Change Log 版本號」。
・影片：不走 WS（Head-of-line Blocking）；Pre-signed URL 上傳 Object Storage；Resumable Upload；先樂觀顯示上傳中；接收端多媒體分流。
・E2EE：Server 只看得到中繼資料；預覽、搜尋、多裝置金鑰要重想。`,
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
  title: '第 10 堂｜設計研討會（多裝置、正在輸入、編輯收回、影片）',
  createdAt: '2026-11-25T02:14:04.000Z',
};

export default [
  Cover,
  Recap,
  HowToday,
  Blocks,
  Frame,
  T1,
  T2,
  T3,
  T4,
  DesignTime,
  T1Case,
  T1Grill,
  T2Case,
  T2Grill,
  T3Case,
  T3Grill,
  T4Case,
  T4Grill,
  E2EE,
  Arch,
  FeynmanAll,
  Finale,
] satisfies Page[];
