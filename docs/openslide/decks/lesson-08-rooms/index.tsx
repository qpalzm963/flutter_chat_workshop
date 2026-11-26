import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 第 8 堂：房間列表 + 多工（一條 WS 承載所有房間）
// 學員看得到的頁面只放題目；參考答案和講稿都在 `notes`。
// 共用元件從第 7 堂複製，第 8 堂專用元件在後半段。
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
      <span>即時聊天室 · 第 8 堂</span>
      <span style={{ color: muted, fontWeight: 500 }}>/ {section}</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#dde9fb">Lesson 08</Pill>
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

type RRow = { name: string; icon: string; last?: string; time?: string; hot?: boolean };

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
        </div>
      ))}
    </div>
  </div>
);

// 第 5 頁：手機 ↔ Server 之間的連線示意
const WsPanel = ({ title, tone, lines, thick }: { title: string; tone: string; lines: string[]; thick?: boolean }) => {
  const w = 780;
  const h = 380;
  const box = (x: number, label: string, sub: string) => (
    <g>
      <rect x={x} y={40} width={170} height={300} rx={22} fill={panel} stroke={ink} strokeWidth="3" />
      <text x={x + 85} y={180} textAnchor="middle" fontSize="28" fontWeight="900" fill={ink}>
        {label}
      </text>
      <text x={x + 85} y={216} textAnchor="middle" fontSize="20" fill={muted}>
        {sub}
      </text>
    </g>
  );
  const n = lines.length;
  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 900, color: tone, marginBottom: 10 }}>{title}</div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        {box(20, 'Amy', '的 App')}
        {box(w - 190, 'Server', '')}
        {lines.map((l, i) => {
          const y = thick ? 190 : 70 + (i * 240) / Math.max(1, n - 1);
          return (
            <g key={l}>
              <line x1={190} y1={y} x2={w - 190} y2={y} stroke={tone} strokeWidth={thick ? 12 : 4} />
              <text x={w / 2} y={y - (thick ? 22 : 10)} textAnchor="middle" fontSize={thick ? 24 : 20} fontWeight="800" fill={ink} style={halo}>
                {l}
              </text>
            </g>
          );
        })}
        {thick && (
          <text x={w / 2} y={236} textAnchor="middle" fontSize="22" fill={muted} style={halo}>
            每一則都帶 room_id
          </text>
        )}
      </svg>
    </div>
  );
};

// 升版時間軸的一列：左邊是誰在動，右邊是發生什麼
const MigRow = ({ who, tint, children }: { who: string; tint: string; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'center', marginBottom: 14 }}>
    <div style={{ textAlign: 'right' }}>
      <Pill tint={tint}>{who}</Pill>
    </div>
    <div
      style={{
        fontSize: 29,
        lineHeight: 1.45,
        background: panel,
        border: `2px solid ${line}`,
        borderRadius: 12,
        padding: '12px 26px',
      }}
    >
      {children}
    </div>
  </div>
);

// 一張資料表的欄位示意
const TableCard = ({ name, cols, tone = ink, note }: { name: string; cols: { c: string; hot?: boolean; miss?: boolean }[]; tone?: string; note?: ReactNode }) => (
  <div style={{ flex: 1, background: panel, border: `2.5px solid ${ink}`, borderRadius: 'var(--osd-radius)', padding: '20px 28px' }}>
    <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 900, color: tone }}>{name}</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
      {cols.map((k) => (
        <span
          key={k.c}
          style={{
            fontFamily: mono,
            fontSize: 22,
            padding: '4px 12px',
            borderRadius: 8,
            border: `2px ${k.miss ? 'dashed' : 'solid'} ${k.hot ? green : k.miss ? red : line}`,
            background: k.hot ? '#d6ecd9' : k.miss ? '#f7d9d6' : '#fff',
            fontWeight: k.hot || k.miss ? 800 : 500,
          }}
        >
          {k.c}
        </span>
      ))}
    </div>
    {note && <div style={{ fontSize: 22, color: muted, marginTop: 14, lineHeight: 1.45 }}>{note}</div>}
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
        <Pill tint={panel}>今天起自由分房</Pill>
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
        房間列表
      </h1>
      <p style={{ fontSize: 36, color: muted, margin: 0, lineHeight: 1.5 }}>
        一條 WebSocket 載著所有房間：
        <br />
        私訊、群組、活動拉群，列表即時出現
      </p>
      <div style={{ display: 'flex', gap: 14, marginTop: 56 }}>
        <Pill tint={panel}>room_id</Pill>
        <Pill tint={panel}>GET /rooms</Pill>
        <Pill tint={panel}>room_added</Pill>
        <Pill tint={panel}>dm:A:B</Pill>
      </div>
    </div>
    <div style={{ position: 'absolute', right: 200, top: 160 }}>
      <RoomPhone
        w={400}
        h={600}
        rooms={[
          { name: '活動群', icon: '群', last: 'Cat：明天 9 點集合', time: '10:05', hot: true },
          { name: 'Bob', icon: 'B', last: '嗨，在嗎？', time: '10:02' },
          { name: 'Amy & Bob', icon: '組', last: '你：好，週五見', time: '09:58' },
          { name: '大廳', icon: '廳', last: 'Dan：大家好', time: '09:40' },
        ]}
      />
      <PhoneCap n="↑" title="群組有人說話，那一間跳到最上面" w={400}>
        講師一鍵拉群的那一秒，列表就多一間
      </PhoneCap>
    </div>
  </div>
);

const Scenario: Page = () => (
  <Shell section="開場" title="PM：只能聊一間，不夠用了">
    <Bubble who="PM" role="PM">
      「使用者想<b style={{ color: 'var(--osd-accent)' }}>私訊</b>特定的人，也想開<b style={{ color: 'var(--osd-accent)' }}>群組</b>。
      <br />
      現在 App 一打開就只有一間，還是我們分配的。」
    </Bubble>
    <Card style={{ marginTop: 44 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>PM 一條一條加的需求</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Steps>
          <Step>
            <Goal n="01">一打開 App，先看到「我在哪幾個房間」</Goal>
          </Step>
          <Step>
            <Goal n="02">哪一間有人說話，那一間就跳到最上面，看得到最後一句</Goal>
          </Step>
          <Step>
            <Goal n="03">點一位在線的人，就能直接私聊</Goal>
          </Step>
          <Step>
            <Goal n="04">
              <span style={{ color: muted }}>（PM 說營運那邊也有需求……）</span>
            </Goal>
          </Step>
        </Steps>
      </div>
    </Card>
  </Shell>
);

const Evolution: Page = () => (
  <Shell section="能力演進表" title="打掉最後一列的 ✗" sub="有好幾個聊天室：今天做房間列表，未讀數留給第 9 堂。">
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
      <Cell state="yes" focus>未讀多就跳到第一則未讀（第 9 堂）</Cell>

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
      <Cell state="yes" focus>
        <b>房間列表</b>　← 今天
      </Cell>
    </div>
  </Shell>
);

const Recap: Page = () => (
  <BigQuestion
    tag="上堂結尾：講師在儀表板勾了 3 位同學，建了一個新群組"
    tagColor="#f7d9d6"
    foot="被勾到的同學打開 App，畫面跟平常一樣，找不到那個群組。"
    hint="提示：App 一打開，連到的是哪一間？它有沒有辦法知道「我在哪幾間」？"
  >
    群組明明建好了，
    <br />
    為什麼 App 裡看不到？
  </BigQuestion>
);

const OneWs: Page = () => (
  <Shell section="觀念" title="一個房間開一條 WebSocket，可以嗎？" sub="Amy 在 6 個房間：兩人組、大廳、活動群，還有 3 個私聊。">
    <div style={{ display: 'flex', gap: 40 }}>
      <div>
        <WsPanel
          title="A. 一房一條：6 條連線"
          tone={red}
          lines={['pair:Amy:Bob', 'lobby', 'group:1', 'dm:Amy:Bob', 'dm:Amy:Cat', 'dm:Amy:Dan']}
        />
        <Steps>
          <Step>
            <div style={{ marginTop: 16, width: 780 }}>
              <WhyBox q="第 2 堂幫一條連線做的事，哪些要乘以 6？Server 那邊呢？" />
            </div>
          </Step>
        </Steps>
      </div>
      <div>
        <Steps>
          <Step>
            <WsPanel title="B. 全 App 一條：所有房間共用" tone={green} lines={['message · ack · room_added']} thick />
          </Step>
        </Steps>
      </div>
    </div>
  </Shell>
);

const RecvRoute: Page = () => (
  <Shell section="觀念" title="一條線進來，依 room_id 分給各房" sub="ChatService 握著唯一的連線；每個開著的房間，只挑 room_id 是自己的那幾則。">
    <SeqDiagram
      lanes={['房間列表', '開著的房間', 'ChatService', 'Server']}
      pad={150}
      rowH={60}
      stepFrom={1}
      items={[
        { kind: 'note', at: 1, label: 'Amy 正開著 pair:Amy:Bob' },
        { kind: 'msg', from: 3, to: 2, label: 'message · pair:Amy:Bob · #42' },
        { kind: 'msg', from: 2, to: 1, label: '開著的房間自己挑 room_id → 寫進 DB', color: green },
        { kind: 'msg', from: 2, to: 0, label: '更新這間的預覽' },
        { kind: 'msg', from: 3, to: 2, label: 'message · group:1 · #7' },
        { kind: 'note', at: 1, label: '不是我的房間：略過', tint: '#efe6d6' },
        { kind: 'msg', from: 2, to: 0, label: '更新活動群的預覽' },
        { kind: 'note', at: 0, label: '活動群跳到最上面', tint: '#d6ecd9' },
      ]}
    />
  </Shell>
);

const SendAck: Page = () => (
  <Shell section="觀念" title="送出帶 room_id，ACK 只認 clientMsgId" sub="ACK、逾時、補送，從 ChatController 搬到 App 層級的 ChatService。">
    <SeqDiagram
      lanes={['開著的房間', 'ChatService', 'Server', 'Bob 的 App']}
      pad={210}
      rowH={56}
      stepFrom={1}
      items={[
        { kind: 'note', at: 0, label: 'Amy 在活動群按送出' },
        { kind: 'msg', from: 0, to: 1, label: 'send「我到了」· group:1' },
        { kind: 'note', at: 1, label: 'DB 寫一筆 sending，開 5 秒計時' },
        { kind: 'msg', from: 1, to: 2, label: 'send · group:1 · id=c9e' },
        { kind: 'msg', from: 2, to: 3, label: 'message · group:1 · #8' },
        { kind: 'note', at: 0, label: 'Amy 按返回，離開活動群', tint: '#fdf0e3' },
        { kind: 'msg', from: 2, to: 1, label: 'ack · id=c9e · #8', color: green },
        { kind: 'note', at: 1, label: '用 id=c9e 找到那筆 → ✓', tint: '#d6ecd9' },
      ]}
    />
    <Steps>
      <Step>
        <div style={{ marginTop: 14 }}>
          <WhyBox q="如果 ACK 計時器還留在 ChatController，Amy 離開活動群之後，這個 ACK 誰來接？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const Protocol: Page = () => (
  <Shell section="協議" title="協議：每一則都帶 room_id" sub="第 1 堂純字串 → JSON → 第 4 堂加 client_msg_id → 今天加 room_id。">
    <CodeBox>
      <div style={{ color: muted }}>{'# App → Server'}</div>
      <div>{'{"type":"send", "client_msg_id":"c9e", '}<span style={{ color: '#fbbf7a' }}>{'"room_id":"group:1"'}</span>{', "text":"我到了"}'}</div>
    </CodeBox>
    <Steps>
      <Step>
        <CodeBox style={{ marginTop: 20 }}>
          <div style={{ color: muted }}>{'# Server → App'}</div>
          <div>{'{"type":"message", '}<span style={{ color: '#fbbf7a' }}>{'"room_id":"group:1"'}</span>{', "seq":8, "sender":"Amy", ...}'}</div>
          <div>{'{"type":"ack", '}<span style={{ color: '#fbbf7a' }}>{'"room_id":"group:1"'}</span>{', "client_msg_id":"c9e", "seq":8, ...}'}</div>
          <div>{'{"type":"room_added", "room":{"id":"group:1", "name":"活動群", "members":[...], ...}}'}</div>
        </CodeBox>
      </Step>
      <Step>
        <div style={{ display: 'flex', gap: 28, marginTop: 28 }}>
          <Point title="room_id 長什麼樣" tag="格式">
            private:Amy · pair:Amy:Bob · lobby · group:1 · dm:Amy:Bob
          </Point>
          <Point title="seq 以房間為單位" tag="注意">
            每間都從 1 開始數。兩人組的 #8 和活動群的 #8，是兩則不同的訊息。
          </Point>
        </div>
      </Step>
    </Steps>
  </Shell>
);

const RoomsFetch: Page = () => (
  <Shell section="觀念" title="房間列表：連上就問「我在哪幾間」" sub="GET /rooms 寫進 DB，畫面只訂閱 DB。跟訊息走同一套：SSOT。">
    <SeqDiagram
      lanes={['列表畫面', '本地 DB', 'ChatService', 'Server']}
      pad={150}
      rowH={68}
      stepFrom={1}
      items={[
        { kind: 'note', at: 2, label: '連上了（含 App 剛啟動）', tint: '#d6ecd9' },
        { kind: 'msg', from: 2, to: 3, label: 'GET /rooms?user=Amy', color: blue },
        { kind: 'msg', from: 3, to: 2, label: '4 間 + 各房最新 seq、最後一則', color: blue },
        { kind: 'msg', from: 2, to: 1, label: 'upsertRooms 寫進 rooms 表' },
        { kind: 'msg', from: 1, to: 0, label: 'Stream 通知：rooms 變了', color: green },
        { kind: 'note', at: 0, label: '列表出現 4 間', tint: '#d6ecd9' },
      ]}
    />
  </Shell>
);

const ScenarioB: Page = () => (
  <Shell section="營運追加" title="營運：活動要能一鍵拉群">
    <Bubble who="營" role="營運">
      「活動當天，我要在後台一鍵把報名的人<b style={{ color: 'var(--osd-accent)' }}>拉進同一群</b>，
      <br />
      他們手機上要<b style={{ color: 'var(--osd-accent)' }}>馬上</b>看到。」
    </Bubble>
    <Card style={{ marginTop: 56 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>接著開場的 01～03，再加：</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Steps>
          <Step>
            <Goal n="04">被拉進群，不用重開 App，列表立刻多一間</Goal>
          </Step>
          <Step>
            <Goal n="05">拉群那一刻剛好斷線，連回來也要看得到這一群</Goal>
          </Step>
        </Steps>
      </div>
    </Card>
  </Shell>
);

const RoomAdded: Page = () => (
  <Shell section="觀念" title="Server 主動推 room_added" sub="App 不用一直問。房間有變化，Server 就從那條 WebSocket 推下來。">
    <SeqDiagram
      lanes={['講師儀表板', 'Server', 'ChatService', 'Amy 的列表']}
      pad={150}
      rowH={64}
      stepFrom={0}
      items={[
        { kind: 'msg', from: 0, to: 1, label: '建立群組：勾 Amy、Bob、Cat' },
        { kind: 'note', at: 1, label: '建 group:1，3 人都加完' },
        { kind: 'msg', from: 1, to: 2, label: 'room_added · group:1', color: amber },
        { kind: 'note', at: 2, label: 'upsertRooms 寫進 rooms 表' },
        { kind: 'msg', from: 2, to: 3, label: 'Stream 通知', color: green },
        { kind: 'note', at: 3, label: '多一間「活動群」', tint: '#d6ecd9' },
      ]}
    />
    <Steps>
      <Step>
        <div style={{ marginTop: 22 }}>
          <WhyBox q="Amy 剛好在電梯裡，room_added 推過去沒人收。她連回來之後，看得到這個群嗎？靠的是哪一步？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const Preview: Page = () => (
  <Shell section="觀念" title="沒開的房間：只更新預覽" sub="Amy 正開著兩人組。這時 Cat 在活動群說了一句。">
    <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
      <RoomPhone
        h={420}
        rooms={[
          { name: 'Amy & Bob', icon: '組', last: '你：好，週五見', time: '10:01' },
          { name: 'Bob', icon: 'B', last: '嗨，在嗎？', time: '09:59' },
          { name: '活動群', icon: '群', last: '（還沒有訊息）', time: '' },
          { name: '大廳', icon: '廳', last: 'Dan：大家好', time: '09:40' },
        ]}
      />
      <Steps>
        <Step>
          <div style={{ width: 380, textAlign: 'center' }}>
            <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 800, lineHeight: 1.5 }}>
              message · group:1 · #9
              <br />
              「明天 9 點集合」
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, color: muted }}>→</div>
            <div style={{ fontSize: 22, color: muted }}>ChatService 更新 rooms 表</div>
          </div>
        </Step>
        <Step>
          <RoomPhone
            h={420}
            rooms={[
              { name: '活動群', icon: '群', last: 'Cat：明天 9 點集合', time: '10:05', hot: true },
              { name: 'Amy & Bob', icon: '組', last: '你：好，週五見', time: '10:01' },
              { name: 'Bob', icon: 'B', last: '嗨，在嗎？', time: '09:59' },
              { name: '大廳', icon: '廳', last: 'Dan：大家好', time: '09:40' },
            ]}
          />
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ marginTop: 30 }}>
          <WhyBox q="活動群沒開著，那一則「明天 9 點集合」有寫進 messages 表嗎？Amy 點進活動群時，它從哪來？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const Reconnect: Page = () => (
  <Shell section="觀念" title="重連之後：先補眼前，其他的等點進去" sub="第 7 堂的補洞，今天只對「開著的房間」做。">
    <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.3fr 1.3fr', gap: 12 }}>
      <Steps>
        <div style={{ display: 'flex', height: '100%' }}>
          <FlowBox title="連上了" sub="斷線重連，或 App 剛啟動" tint="#dde9fb" />
        </div>
        <Step>
          <div style={{ display: 'flex', height: '100%' }}>
            <FlowArrow />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FlowBox title="ChatService：重拉 GET /rooms" sub="每間的最新 seq、最後一則、新被拉進的房間" tint="#fbe7b5" />
              <FlowBox title="ChatService：補送 Outbox" sub="所有房間的紅點，照建立時間" tint="#fbe7b5" />
            </div>
          </div>
        </Step>
        <Step>
          <div style={{ display: 'flex', height: '100%' }}>
            <FlowArrow />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FlowBox title="開著的房間：補洞" sub="after_seq 一頁一頁補到最新（第 7 堂）" tint="#d6ecd9" />
              <FlowBox title="其他房間：先不補" sub="使用者點進去，open() 時才補" tint={panel} />
            </div>
          </div>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ marginTop: 48 }}>
          <WhyBox q="Amy 在 30 個房間。為什麼不一連上就把 30 間都補到最新？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const DmQuestion: Page = () => (
  <BigQuestion
    tag="做私聊之前先想"
    tagColor="#fbe7b5"
    foot="情境：Amy 和 Bob 剛好同時點了對方的名字開私聊，各自送出第一句。"
    hint="提示：如果私聊房的 ID 不是 Server 發的，而是兩邊自己算出來的呢？"
  >
    會不會變成兩個
    <br />
    「Amy 和 Bob」的私聊房？
  </BigQuestion>
);

const DmFlow: Page = () => (
  <Shell
    section="觀念"
    title="私聊 = ID 固定的 2 人房"
    sub={
      <>
        <Kw>dm:</Kw> 加上兩人名字照字母排序。誰先開都一樣，不需要「建立私聊」的 API。
      </>
    }
  >
    <SeqDiagram
      lanes={['Amy 的 App', 'Server', 'Bob 的 App']}
      pad={260}
      rowH={60}
      stepFrom={1}
      items={[
        { kind: 'note', at: 0, label: '算出 dm:Amy:Bob，本地先建一筆' },
        { kind: 'msg', from: 0, to: 1, label: 'send · dm:Amy:Bob ·「嗨」' },
        { kind: 'note', at: 1, label: '房間不存在 → 自動建立', tint: '#fdf0e3' },
        { kind: 'msg', from: 1, to: 0, label: 'room_added · dm:Amy:Bob', color: amber },
        { kind: 'msg', from: 1, to: 2, label: 'room_added · dm:Amy:Bob', color: amber },
        { kind: 'msg', from: 1, to: 2, label: 'message · #1 嗨' },
        { kind: 'msg', from: 1, to: 0, label: 'ack · #1', color: green },
        { kind: 'note', at: 2, label: '列表多一間「Amy」', tint: '#d6ecd9' },
      ]}
    />
  </Shell>
);

const MigQuestion: Page = () => (
  <Shell section="PM 追加" title="PM：更新 App 之後，舊對話不能不見">
    <Bubble who="PM" role="PM">
      「使用者更新到新版之後，之前跟夥伴的<b style={{ color: 'var(--osd-accent)' }}>聊天紀錄要還在</b>。」
    </Bubble>
    <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
      <TableCard
        name="手機上：第 1 版 messages"
        tone={muted}
        cols={[{ c: 'client_msg_id' }, { c: 'seq' }, { c: 'sender' }, { c: 'text' }, { c: 'ts' }, { c: 'status' }, { c: 'room_id', miss: true }]}
        note="第 5 堂建的。裡面是兩人組的舊訊息，每一則都不知道自己屬於哪一間。"
      />
      <TableCard
        name="新版程式要的"
        tone={green}
        cols={[{ c: 'messages + room_id', hot: true }, { c: 'rooms 表', hot: true }, { c: 'index (room_id, seq)', hot: true }]}
        note="每個查詢都變成「某一間的訊息」。"
      />
    </div>
    <Steps>
      <Step>
        <div style={{ marginTop: 36 }}>
          <WhyBox q="直接把第 1 版的 CREATE TABLE 改成有 room_id，舊使用者的手機會怎樣？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const MigFlow: Page = () => (
  <Shell section="觀念" title="升版：從第 1 版走到第 2 版" sub="已經上線的版本內容永遠不改，只往後加一版。">
    <Steps>
      <MigRow who="手機上" tint="#efe6d6">
        DB 檔是第 1 版：messages 沒有 room_id，裡面有兩人組的舊訊息
      </MigRow>
      <Step>
        <MigRow who="sqflite" tint="#dde9fb">
          打開 DB：檔案是 1 版、程式要 2 版 → 呼叫 <Kw>onUpgrade(1, 2)</Kw>
        </MigRow>
      </Step>
      <Step>
        <MigRow who="本地 DB" tint="#fbe7b5">
          ① messages 加一欄 room_id，舊資料先給預設值 <Kw>''</Kw>
        </MigRow>
      </Step>
      <Step>
        <MigRow who="本地 DB" tint="#fbe7b5">
          ② 加索引 <Kw>(room_id, seq)</Kw>：之後每個查詢都是「某一間、照 seq」
        </MigRow>
      </Step>
      <Step>
        <MigRow who="本地 DB" tint="#fbe7b5">
          ③ 新增 rooms 表，版本號寫成 2
        </MigRow>
      </Step>
      <Step>
        <MigRow who="Server" tint="#d6ecd9">
          連上後 GET /rooms，回傳 <Kw>assigned_room_id = pair:Amy:Bob</Kw>
        </MigRow>
      </Step>
      <Step>
        <MigRow who="本地 DB" tint="#fbe7b5">
          ④ room_id 還是 <Kw>''</Kw> 的舊訊息，全部歸到 pair:Amy:Bob
        </MigRow>
      </Step>
    </Steps>
  </Shell>
);

const ImplA: Page = () => (
  <Shell section="實作" title="TODO ① ②" sub="starter 給了房間列表 UI、Room、ChatService 骨架、升版骨架，HistoryApi 也加好新方法。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <Todo n="①" title={<>DB 升版：在 <Kw>_migrations</Kw> 加上第 2 版</>}>
        <Hint>
          版本號就是 _migrations 的長度，加了 2 就會自動跑 onUpgrade。
          <br />
          舊訊息的 room_id 先給什麼？什麼時候才知道它屬於哪一間？
        </Hint>
      </Todo>
      <Todo n="②" title={<>連線搬到 App 層級：<Kw>ChatService</Kw> 管 ACK / 逾時 / 補送，<Kw>ChatController</Kw> 每房一個</>}>
        <Hint>
          main 開好 DB 之後建立 ChatService 並 start()，再進 RoomListPage。
          <br />
          ChatController 改吃 (service, roomId)，只收 room_id 是自己的 message。ACK 為什麼不用看 room_id？
        </Hint>
      </Todo>
    </div>
  </Shell>
);

const ImplB: Page = () => (
  <Shell section="實作" title="TODO ③ ④ ⑤" sub="每做完一項，就用兩台模擬器實際點一次。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <Todo n="③" title={<>Message 加 <Kw>roomId</Kw>，送出帶 room_id；查詢、分頁、補洞都加房間條件</>}>
        <Hint>syncCursor、oldestSeq、count……一個一個檢查。有沒有哪一個查詢，不應該加房間條件？</Hint>
      </Todo>
      <Todo n="④" title={<>房間列表：連上就 <Kw>GET /rooms</Kw> 寫進 DB；收到 <Kw>room_added</Kw> 就新增；新訊息更新預覽</>}>
        <Hint>預覽只能往前走：晚到的舊訊息，不能蓋掉比較新的那一句。</Hint>
      </Todo>
      <Todo n="⑤" title={<>私聊：讓列表的 <Kw>_open</Kw> 打開 ChatPage(service, room)</>}>
        <Hint>starter 已經算好 dm:A:B，也在本地先建了房。送出第一句時，Server 那邊會發生什麼事？</Hint>
      </Todo>
    </div>
  </Shell>
);

const Acceptance: Page = () => (
  <Shell section="驗收" title="開群、私聊、升版" sub="講師現場拉群；你和夥伴互相私聊。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Check>講師一鍵把 3 人拉進群組：不用重開 App，列表立刻多一間</Check>
      <Check>群組裡有人發言：那一間跳到最上面，顯示最後一句</Check>
      <Check>開著兩人組時，群組的訊息不會跑進兩人組的畫面</Check>
      <Check>和夥伴私聊：雙方的列表都出現對方，第一句送得到</Check>
      <Check>直接從第 7 堂的 App 升上來：兩人組的舊訊息還在</Check>
    </div>
  </Shell>
);

const Feynman: Page = () => (
  <Shell section="費曼檢核" title="不看螢幕，講給隔壁聽" sub="兩人一組，一人一分鐘。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Card>
        <Goal n="Q1">全 App 只有一條 WebSocket，每個房間怎麼拿到自己的訊息？</Goal>
      </Card>
      <Card>
        <Goal n="Q2">為什麼 ACK 要放在 App 層級，不放在每個房間的 ChatController？</Goal>
      </Card>
      <Card>
        <Goal n="Q3">Amy 和 Bob 同時開私聊，為什麼不會變成兩間？</Goal>
      </Card>
    </div>
  </Shell>
);

const ExtraMigration: Page = () => (
  <Shell section="講師補充" title="DB 升版實務" sub="App 一上架，每支手機上的 DB 都停在不同版本。">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '360px 1fr',
        border: `2.5px solid ${ink}`,
        borderRadius: 'var(--osd-radius)',
        overflow: 'hidden',
        background: panel,
        fontSize: 27,
        lineHeight: 1.45,
      }}
    >
      {['原則', '為什麼'].map((h) => (
        <div key={h} style={{ padding: '14px 24px', fontWeight: 900, background: '#efe6d6' }}>
          {h}
        </div>
      ))}
      {[
        ['版本號只往上加', '有人從第 1 版直接跳到第 5 版：依序跑 2、3、4、5，每一版只寫「從上一版怎麼變過來」'],
        ['上線過的版本不改', '改了第 2 版的內容，已經升過第 2 版的手機不會再跑一次，兩群人的 DB 從此長得不一樣'],
        ['不刪欄位、不改名', '舊版 App 可能還在讀它；SQLite 刪欄位也比加欄位麻煩'],
        ['升版要能失敗', '整段包在同一個 transaction：一步失敗就整個回到原狀，下次開啟再試'],
        ['每一個舊版本都要測', '裝舊版、塞資料、升到新版，確認資料還在、查得到'],
      ].map(([a, b]) =>
        [a, b].map((v, i) => (
          <div key={a + i} style={{ padding: '16px 24px', borderTop: `2px solid ${line}`, fontWeight: i === 0 ? 800 : 500 }}>
            {v}
          </div>
        )),
      )}
    </div>
  </Shell>
);

const ExtraOneWs: Page = () => (
  <Shell section="講師補充" title="為什麼不要一房一條 WebSocket" sub="回到開頭那張圖：6 個房間，6 條線。">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 1fr',
        border: `2.5px solid ${ink}`,
        borderRadius: 'var(--osd-radius)',
        overflow: 'hidden',
        background: panel,
        fontSize: 26,
        lineHeight: 1.45,
      }}
    >
      {['', '一房一條', '全 App 一條'].map((h, i) => (
        <div key={i} style={{ padding: '14px 22px', fontWeight: 900, background: '#efe6d6' }}>
          {h}
        </div>
      ))}
      {[
        ['心跳', '每條各自 ping，手機一直被叫醒，耗電', '一組心跳'],
        ['斷線重連', '6 條各自 Backoff，網路一恢復 6 條一起撞 Server', '重連一次，補一次'],
        ['Server', '連線數 = 人數 × 房間數，每條都要握手、驗身分', '連線數 = 在線人數'],
        ['沒開的房間', '要嘛一直開著（更多條），要嘛收不到預覽', '照收，只更新預覽'],
        ['代價', '—', '一則很大的訊息會卡住後面所有房間'],
      ].map(([a, b, c]) =>
        [a, b, c].map((v, i) => (
          <div
            key={a + i}
            style={{
              padding: '16px 22px',
              borderTop: `2px solid ${line}`,
              fontWeight: i === 0 ? 800 : 500,
              background: a === '代價' ? '#fdf0e3' : 'transparent',
            }}
          >
            {v}
          </div>
        )),
      )}
    </div>
  </Shell>
);

const Hook: Page = () => (
  <div style={fill}>
    <TopBar section="下集預告" />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 180 }}>
      <Pill tint="#f7d9d6">剛才驗收私聊：你傳給夥伴的那一句，旁邊出現了 ✓</Pill>
      <h2 style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.3, margin: '32px 0 0' }}>
        ✓ 出現了，
        <br />
        夥伴到底看了沒？
      </h2>
      <div style={{ display: 'flex', gap: 32, marginTop: 56 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 22, color: muted }}>這個 ✓ 是第 4 堂做的</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, lineHeight: 1.4 }}>收到 Server 的 ACK，訊息拿到了 seq</div>
        </Card>
        <Card style={{ flex: 1, background: '#fdf0e3' }}>
          <div style={{ fontSize: 22, color: muted }}>PM 的下一個需求</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, lineHeight: 1.4 }}>「我怎麼知道對方看了沒？群組裡又有幾個人看了？」</div>
        </Card>
      </div>
    </div>
  </div>
);

// ═════════════ 講稿 ═════════════

export const notes: (string | undefined)[] = [
  // 1 Cover
  `開場前儀表板狀態（課前對一次）
□ 行為等級：ACK
□ 全域延遲：0 ms
□ 分房：先不要按（私人房／兩兩一組／大廳）；全班第一次用第 8 堂 App 連上之前按了，舊訊息會歸錯房
□ 其他：「建立並拉人」可以，它不會改講師分配的房間

【0:00】
到上一堂為止，App 一打開就直接進講師分給你的那一間，全 App 只有一個聊天畫面。今天要變成真正的聊天 App：先看到房間列表，私訊、群組都在裡面。
關鍵的架構轉折：連線從聊天頁提升到 App 層級，全 App 只有一條 WebSocket，所有房間的訊息都走這一條。很多路訊息共用一條線，這叫 Multiplexing，多工：像一條高速公路上跑著往不同城市的車，車上貼著目的地，到了交流道各自下去。今天每則訊息貼的目的地，就是 room_id。
課前確認：Server 是 ACK 等級；今天起解除換房限制，講師可以自由分房、拉群。但有一個例外：全班都跑過今天的 App、連上一次之前，不要按分房（私人房／兩兩一組／大廳）；建立並拉人可以。原因在升版那一頁：舊訊息會歸到第一次連上時講師分配的那一間。

術語
・Multiplexing（多工）`,

  // 2 Scenario
  `【0–2 分】
用 PM 的口氣唸：使用者想私訊特定的人，也想開群組；現在 App 一打開就只有一間，還是我們分配的。
PM 不會一次把需求講完，是一條一條加上來的。
（→）需求 01：一打開 App，先看到「我在哪幾個房間」。這就是房間列表。
（→）需求 02：哪一間有人說話，那一間跳到最上面，看得到最後一句。這是列表的預覽和置頂。
（→）需求 03：點一位在線的人，就能直接私聊。
（→）需求 04 故意蓋住：PM 說營運那邊也有需求，等一下營運自己來講。
可以問一句：LINE 的聊天列表，你是怎麼知道哪一間有新訊息的？讓大家帶著這個問題往下聽。`,

  // 3 Evolution
  `【2–3 分】
指著最後一列：有好幾個聊天室。第 1～7 堂全是 ✗，只能等講師分房，而且一次只在一間。
今天打掉這一列：房間列表。未讀數也屬於這一格，留給第 9 堂；表上第一列的「跳到第一則未讀」也是第 9 堂。
上面四列已經全部打勾，今天加房間時要注意：這四列的能力在每一間都要繼續成立，不能因為多房就壞掉。`,

  // 4 Recap
  `【3–5 分】回顧提問
先把上一堂結尾講一次給沒印象的人：上一堂最後，講師在儀表板勾了 3 位同學，建了一個新群組。被勾到的同學打開 App，畫面跟平常一樣，找不到那個群組。
先問全班：群組明明建好了，為什麼 App 裡看不到？給大家十秒鐘。
（→）出現提示：App 一打開連到哪一間？它有沒有辦法知道「我在哪幾間」？

參考答案：三個原因疊在一起。第一，App 送訊息不帶 room_id，Server 一律送到講師分配的那一間，App 根本沒有「指定房間」的能力。第二，App 沒有任何地方問過 Server「我在哪幾間」，也就是沒有呼叫房間列表 API。第三，Server 建群時其實有推一個 room_added 通知，但 App 不認得這種訊息，直接忽略了。
所以今天要補三件事：訊息帶 room_id、App 會拉房間列表、App 會處理 room_added。`,

  // 5 OneWs
  `【5–7 分】為什麼不能一房一條
最直覺的做法：每個房間開一條 WebSocket，每條各管各的，第 1～7 堂的程式碼幾乎不用改。左邊就是這樣：Amy 在 6 個房間，6 條線。
（→）出現問題：第 2 堂幫一條連線做的事，哪些要乘以 6？Server 那邊呢？讓大家講。

參考答案：心跳要乘以 6，6 條各自 ping，手機一直被叫醒；斷線重連也乘以 6，網路一恢復 6 條一起去撞 Server；Server 的連線數變成人數乘以房間數，每條都要握手、驗身分。還有一個更麻煩的：沒開的房間要不要連？不連，就收不到預覽；連，就是更多條。
（→）右邊：全 App 一條，所有房間共用。message、ack、room_added 都走這一條，每一則都帶 room_id，收到再分給各房。這就是開頭說的 Multiplexing，多工：一條線同時載很多路的資料，每一筆貼上標籤，到了再依標籤分開。
這張圖最後的講師補充還會再回來，講一房一條真正的代價和一條線的代價。

術語
・Multiplexing（多工）

可能被問到
問：HTTP/2 不就是一條連線多個請求？跟這個一樣嗎？
答：概念一樣，都是 Multiplexing。HTTP/2 在協定層幫你切好；我們是在應用層自己貼 room_id、自己分。`,

  // 6 RecvRoute
  `【7–9 分】收：依 room_id 分給各房
四條線：房間列表、開著的房間（也就是那一間的 ChatController）、ChatService、Server。ChatService 是 App 層級的服務，全 App 一個，握著唯一的那條連線。
一開始一格：Amy 正開著兩人組 pair:Amy:Bob。
（→）Server 傳給 ChatService 一則 message，room_id 是 pair:Amy:Bob，seq #42。
（→）開著的房間自己也聽著同一條連線，收到同一則（不是 ChatService 轉交的，下面會講）。房間的 ChatController 一看，room_id 跟自己一樣，寫進 DB，畫面照第 5 堂的路自動更新。
（→）ChatService 同時把房間列表裡這一間的預覽更新成這一句。
（→）Server 又傳給 ChatService 一則 message，這次 room_id 是活動群 group:1，#7。
（→）開著的房間也看到了這則，但 room_id 不是自己的，略過。
（→）ChatService 照樣更新房間列表：活動群的預覽變成這一句。
（→）房間列表：活動群跳到最上面。
實作上，ChatService 手上那條 ChatSocket 的 events 是 Broadcast Stream，廣播串流：一條資料流可以同時被好幾個人訂閱，每個人都收到每一則。ChatService 自己（更新預覽）和每個開著的 ChatController 都訂閱它，各自用 room_id 挑自己要的。

術語
・Broadcast Stream（廣播串流）

可能被問到
問：為什麼不是 ChatService 用 switch 把訊息直接塞給對應的 controller？
答：也可以，那是集中派發。用廣播 + 各自過濾，ChatService 不需要知道現在開著哪幾個房間，房間開關時也不用去註冊、取消註冊，程式比較單純。`,

  // 7 SendAck
  `【9–11 分】送：ACK 搬到 App 層級
四條線：開著的房間、ChatService、Server、Bob 的 App。一開始一格：Amy 在活動群按送出。
（→）開著的房間把「我到了」交給 ChatService，帶著 room_id = group:1。
（→）ChatService 先在 DB 寫一筆 sending，畫面馬上看到（第 4 堂的樂觀更新），同時開一個 5 秒的 ACK 計時器。
（→）ChatService 傳給 Server：send，room_id 是 group:1，client_msg_id 是 c9e。
（→）Server 存成活動群的 #8，推給 Bob 的 App。
（→）這時 Amy 按了返回，離開活動群。這間的 ChatController 被 dispose 掉了。
（→）Server 回給 ChatService：ack，id=c9e，seq #8。
（→）ChatService 拿 c9e 去 DB 找到那一筆，補上 seq、改成 ✓。完全不用知道它是哪個房間的。
（→）出現問題：如果 ACK 計時器還留在 ChatController，Amy 離開之後這個 ACK 誰接？

參考答案：沒人接。ChatController 已經 dispose，監聽也取消了，ACK 回來沒人處理，那一筆會一直卡在 sending；計時器也跟著被取消，連變紅點都不會。所以 ACK、逾時、補送都要放在全 App 只有一個、不會因為離開房間就消失的 ChatService。
ACK 能這樣處理，是因為 clientMsgId 本身就是全域唯一的 UUID。這種「我送出時帶一個 ID，回應帶同一個 ID 回來，讓我把兩邊對起來」的做法叫 Correlation ID，關聯 ID。第 4 堂就在用了，只是今天才看出它的價值：ACK 不用看 room_id，用 clientMsgId 一對就準。

術語
・Correlation ID（關聯 ID）

可能被問到
問：補送也要搬嗎？
答：要。Amy 可能在三個房間各留了一則紅點，現在只開著其中一間。補送如果放在 ChatController，沒開的房間的紅點就永遠不會補。所以 Outbox 是全 App 一個。`,

  // 8 Protocol
  `【11–12 分】協議
第 1 堂從純字串開始，後來升級成 JSON，第 4 堂加了 client_msg_id，今天再加 room_id。
先看 App 傳給 Server：send 多了 room_id。前幾堂沒帶時，Server 會送到講師分配的那一間；今天起以 room_id 為準。
（→）再看 Server 傳給 App 的三種：message 帶 room_id；ack 也帶 room_id；新的 room_added，裡面是一整筆房間資料，格式跟 GET /rooms 的一筆一樣。
（→）兩個重點。room_id 的格式：private:Amy 是私人房，pair:Amy:Bob 是兩人組，lobby 是大廳，group:1 是講師建的群，dm:Amy:Bob 是私聊。
第二個重點：seq 以房間為單位，每間都從 1 開始數。兩人組的 #8 和活動群的 #8 是兩則不同的訊息。所以從今天起，要指到一則訊息，要用 room_id 和 seq 兩個欄位一起，這叫 Composite Key，複合鍵：一個欄位不夠唯一，兩個合起來才唯一。DB 的索引也要照這兩個欄位建，等一下升版會用到。

術語
・Composite Key（複合鍵）

可能被問到
問：為什麼 seq 不做成全 Server 共用一個？
答：可以，但每一間的 seq 就不再連續，第 7 堂補洞「不足一頁就停」、第 9 堂「未讀數 = 最新 seq − 讀到的位置」這些算法都靠房間內連續。以房間為單位，每間各自單純。`,

  // 9 RoomsFetch
  `【12–13 分】房間列表從哪來
四條線：列表畫面、本地 DB、ChatService、Server。一開始一格：ChatService 發現連上了，App 剛啟動的第一次連上也算。
（→）ChatService 傳給 Server：GET /rooms?user=Amy。
（→）Server 回給 ChatService：Amy 所在的 4 間，每間帶最新 seq 和最後一則訊息。所以列表的預覽不用把每間的訊息都下載下來。
（→）ChatService 把這 4 間 upsert 寫進本地的 rooms 表。房間有哪些、叫什麼、成員是誰，一律以 Server 回來的為準，這叫 Server-authoritative，Server 說了算：本地只是副本，有衝突就用 Server 的蓋掉。
（→）本地 DB 通知列表畫面：rooms 變了。跟訊息一樣，畫面只訂閱 DB。
（→）列表出現 4 間，依最後一則的時間排，最新的在最上面。
重點：列表跟訊息走同一套 SSOT。列表畫面不直接拿 API 的結果，只看 DB，所以殺掉 App 重開，沒網路也能秒開列表。

術語
・Server-authoritative（Server 說了算）

可能被問到
問：被踢出某個群，本地那一間要刪嗎？
答：完成版沒有處理移除，只會新增、更新。要做就是比對 GET /rooms 回來的清單，本地多出來的標成已離開。這可以當課後延伸。`,

  // 10 ScenarioB
  `【13–14 分】營運追加
營運來了：活動當天，要在後台一鍵把報名的人拉進同一群，而且他們手機上要馬上看到。
（→）需求 04：被拉進群，不用重開 App，列表立刻多一間。光靠剛剛的 GET /rooms 做不到，它只在連上時跑一次。
（→）需求 05：拉群那一刻剛好斷線，連回來也要看得到。
這兩條要一起想，等一下的圖會同時回答。`,

  // 11 RoomAdded
  `【14–16 分】Server 主動推
四條線：講師儀表板、Server、Amy 的 ChatService、Amy 的列表。一開始是空的。
（→）講師儀表板傳給 Server：建立群組，勾了 Amy、Bob、Cat。
（→）Server 建好 group:1，先把 3 個人都加進去，才開始通知，這樣每個人收到的成員名單才完整。
（→）Server 透過 Amy 那條 WebSocket，推給 Amy 的 ChatService：room_added，內容是 group:1 這一整筆房間資料。這叫 Server Push，Server 推送：不是 App 來問才回答，是 Server 有事就主動講。
（→）ChatService 把這筆 upsert 寫進 rooms 表，跟 GET /rooms 走的是同一個方法。
（→）本地 DB 通知列表畫面：rooms 變了。
（→）Amy 的列表多一間「活動群」。需求 04 完成。
（→）出現問題：Amy 剛好在電梯裡，room_added 推過去沒人收。她連回來看得到這個群嗎？靠的是哪一步？

參考答案：看得到，靠的是上上一頁：每次連上都重拉 GET /rooms。room_added 跟第 7 堂的訊息推送一樣是 Fire-and-forget，送了就不管；Server 不會為了 Amy 回來就重推。推送負責「快」，連上重拉負責「不漏」，兩個一起才完整。需求 05 完成。

術語
・Server Push（Server 推送）
・Fire-and-forget（送了就不管）

可能被問到
問：那乾脆不要 room_added，App 每 10 秒問一次 GET /rooms？
答：這叫輪詢。拉群後最慢要等 10 秒才看到，而且大家沒事也一直在問，Server 白做工。我們已經有一條 WebSocket 開著，推一則很便宜。`,

  // 12 Preview
  `【16–17 分】沒開的房間
左邊是 Amy 的列表，她現在正開著兩人組。活動群還沒有訊息。
（→）Server 傳來一則 message，room_id 是 group:1，#9，Cat 說「明天 9 點集合」。ChatService 收到，把活動群這一筆的最後一則、最新 seq、時間更新掉。
（→）右邊：活動群跳到最上面，預覽是「Cat：明天 9 點集合」。
rooms 表裡存了一份「最後一則」，其實跟 messages 表重複了。故意存兩份、讓讀的時候不用再去查另一張表，這叫 Denormalization，反正規化：用多存一點資料，換列表讀得快。代價是要記得同步更新，而且只能往前：晚到的舊訊息不能蓋掉新的預覽，所以更新條件是 last_seq 比較小才更新。
（→）出現問題：那一則有寫進 messages 表嗎？Amy 點進活動群時，它從哪來？

參考答案：沒有寫進 messages 表。活動群沒開著，沒有 ChatController 在收它，ChatService 只更新預覽。Amy 點進活動群時，open() 觸發第 7 堂的補洞：本地這間是空的，就抓最新一頁；不是空的，就從 cursor 用 after_seq 補到最新。那一則就是這時候從 Server 補進來的。
（下一頁接著講為什麼要這樣設計。）

術語
・Denormalization（反正規化）

可能被問到
問：不寫進 messages，那第 7 堂補洞的 cursor 會不會錯？
答：不會，反而是對的。如果沒開的房間收到什麼就寫什麼，本地會出現「#9 有、#1～#8 沒有」的斷層；補洞的 cursor 用本地最新的別人 seq，會直接從 #9 往後補，#1～#8 就漏了。只更新預覽，messages 表裡每間都是連續的一段。`,

  // 13 Reconnect
  `【17–18 分】重連之後補什麼
先指左邊：連上了，不管是斷線重連還是 App 剛啟動。
（→）中間是 ChatService 做的兩件事：重拉 GET /rooms，更新每間的最新 seq、最後一則，也順便撿回斷線時錯過的 room_added；然後補送 Outbox，所有房間的紅點照建立時間送。
（→）右邊是房間的事：開著的那一間照第 7 堂補洞；其他房間先不補，使用者點進去、open() 的時候才補。
（→）出現問題：Amy 在 30 個房間，為什麼不一連上就把 30 間都補到最新？

參考答案：大部分房間她這次根本不會點進去。全部補，就是一連上打幾十次 API、下載一堆沒人看的訊息，耗流量、耗電，還會跟她正在看的那一間搶網路。這種「先只拿眼前用得到的，其他等真的要用再拿」的策略叫 Lazy Sync，延遲同步。列表上要的資訊（最後一則、最新 seq）GET /rooms 已經一次給了，不需要下載訊息本身。

術語
・Lazy Sync（延遲同步）

可能被問到
問：那 Amy 搭飛機時想看離線的群組訊息呢？
答：沒點進去過的房間，本地就只有上次看過的部分。有些 App 會在 Wi-Fi、充電時背景預先抓常用的房間，那是產品取捨，不是今天的範圍。`,

  // 14 DmQuestion
  `【18–19 分】私聊之前先想
唸情境：Amy 和 Bob 剛好同時點了對方的名字開私聊，各自送出第一句。會不會變成兩個私聊房？
先讓大家講。直覺做法通常是「呼叫一個建立私聊的 API，Server 回一個新的房間 ID」，兩個人同時呼叫，就會建出兩間。
卡住的話（→）出現提示：如果房間 ID 不是 Server 發的，而是兩邊自己算出來的呢？

參考答案：不會。私聊的 ID 由兩個人的名字算出來：dm: 加上兩人名字照字母排序，Amy 和 Bob 不管誰算，都是 dm:Amy:Bob。兩邊送出時帶的是同一個 room_id，Server 第一次看到就建房，第二次看到房間已經在了，直接用。同一個輸入永遠算出同一個 ID，所以不需要「建立私聊」的 API，也不會有兩個人搶著建的問題。`,

  // 15 DmFlow
  `【19–20 分】私聊一輪
三條線：Amy 的 App、Server、Bob 的 App。一開始一格：Amy 點了 Bob，App 用 Room.dmId 算出 dm:Amy:Bob，先在本地 rooms 表建一筆，才能打開聊天頁。
這種「同樣的輸入一定得到同樣的 ID」叫 Deterministic ID，確定性 ID：ID 不是隨機發的，是算出來的，誰算都一樣。
（→）Amy 的 App 傳給 Server：send，room_id 是 dm:Amy:Bob，內容「嗨」。
（→）Server 發現這間不存在，檢查格式（名字有排序、有包含自己）之後自動建立，把兩個人加進去。
（→）Server 推給 Amy：room_added。Amy 本地那一筆被 Server 的版本蓋掉，Server 說了算。
（→）Server 推給 Bob：room_added。Bob 什麼都沒做，列表就多一間。
（→）Server 存成這間的 #1，推給 Bob：message「嗨」。
（→）Server 回給 Amy：ack，#1。Amy 那則轉圈變 ✓。
（→）Bob 的列表多一間「Amy」，預覽是「嗨」。

術語
・Deterministic ID（確定性 ID）

可能被問到
問：名字可以改的話怎麼辦？
答：正式產品不會用名字，會用不會變的 user ID 來算，例如 dm:1024:2048。今天用名字只是因為工作坊的身分就是名字。

問：Amy 開了私聊但沒送出就離開？
答：只有 Amy 本地有這一筆，Server 上不存在，Bob 也看不到。等第一句送出才算真的建立。`,

  // 16 MigQuestion
  `【20–21 分】PM 追加：舊對話
PM 又來了：使用者更新到新版之後，之前跟夥伴的聊天紀錄要還在。
看兩張卡。左邊是大家手機上現在的 DB，第 5 堂建的第 1 版：messages 沒有 room_id，裡面是兩人組的舊訊息。右邊是新版程式要的：messages 多 room_id、一張 rooms 表、一個 (room_id, seq) 的索引。
（→）出現問題：直接把第 1 版的 CREATE TABLE 改成有 room_id，舊使用者的手機會怎樣？

參考答案：舊使用者的 DB 檔已經存在，而且記著自己是第 1 版。sqflite 只在「檔案不存在」時跑建表，檔案存在、版本又一樣，就什麼都不做。結果新程式一查 room_id，就噴 no such column，App 一開就壞。只有新安裝的人沒事，這種 bug 在開發機上還很難發現，因為開發者常常刪掉重裝。
所以要用升版：把資料表結構從一個版本改到下一個版本，這叫 Schema Migration，資料表結構升版。下一頁走一次。`,

  // 17 MigFlow
  `【21–23 分】升版走一次
把上一頁說的 Schema Migration，資料表結構升版，實際走一次：舊結構怎麼一步一步變成新結構，而且舊資料不能丟。
一開始一格：手機上的 DB 檔是第 1 版，有兩人組的舊訊息。
（→）sqflite 打開 DB，發現檔案是 1 版、程式要 2 版，就呼叫 onUpgrade(1, 2)。新安裝的人走 onCreate，從 0 一路跑到 2，所以兩種人最後長得一樣。
（→）本地 DB 執行第一步：messages 加一欄 room_id。舊資料沒有值，先給預設值空字串，因為現在還不知道它們屬於哪一間。
（→）第二步：加一個 (room_id, seq) 的索引。Index，索引，就像書後面的索引頁：照某個欄位先排好，查的時候直接翻到那頁，不用整本翻。今天每個查詢都是「某一間、照 seq」，所以索引就照這兩個欄位建。
（→）第三步：新增 rooms 表，DB 的版本號寫成 2。這三步在同一個交易裡，一步失敗就全部回到原狀。
（→）接著要等 Server：連上之後 GET /rooms，回傳裡有 assigned_room_id，也就是「講師目前分配給你的那一間」，pair:Amy:Bob。
（→）本地 DB 執行第四步：room_id 還是空字串的舊訊息，全部歸到 pair:Amy:Bob。PM 的需求完成，舊對話還在。
為什麼第四步不能寫在升版裡？升版時還沒連網路，不知道舊訊息屬於哪一間；只有 Server 知道。這也是為什麼第 5～7 堂要固定兩兩一組不換房：那三堂的訊息都沒有 room_id，一換房，舊訊息就歸錯間。
同樣的道理，今天全班都跑過今天的 App、連上一次之前，不要按分房（私人房／兩兩一組／大廳）；建立並拉人可以，它不會改分配的房間。

術語
・Schema Migration（資料表結構升版）
・Index（索引）

可能被問到
問：如果使用者還沒連上就把 App 關了？
答：舊訊息的 room_id 就先維持空字串，查任何一間都查不到，但資料沒丟。下次連上拿到 assigned_room_id 再歸位。`,

  // 18 ImplA
  `【23–35 分】實作開始
① DB 升版：在 _migrations 加上第 2 版。版本號直接用 _migrations 的長度，加了 2 就變成 2 版，已經是 1 版的 DB 會跑 onUpgrade。
完成版的 SQL：ALTER TABLE messages ADD COLUMN room_id TEXT NOT NULL DEFAULT ''；CREATE INDEX idx_messages_room_seq ON messages(room_id, seq)；CREATE TABLE rooms，欄位照 Room.toRow：id 是主鍵，name、kind、members、last_seq、last_sender、last_text、last_ts。
NOT NULL 一定要配 DEFAULT，不然 SQLite 不讓你對已經有資料的表加 NOT NULL 欄位。舊訊息歸位寫成 adoptLegacyMessages：UPDATE messages SET room_id = ? WHERE room_id = ''，在 ChatService 第一次拿到 GET /rooms 之後呼叫。
② 連線搬家：main.dart 開好 DB 之後建 ChatService 並 start()，再進 RoomListPage。第 4 堂的 send、retry、_transmit、ACK 計時器，第 7 堂的補送，全部從 ChatController 搬到 ChatService。ChatController 改成 (service, roomId)：open() 時訂閱 service.socket.events，只收 type 是 message 而且 room_id 等於自己的；離開時 dispose。
ACK 不用看 room_id，用 clientMsgId 對就好，前面講過的 Correlation ID。`,

  // 19 ImplB
  `【35–47 分】
③ Message 加 roomId，fromServer、fromRow、toRow 都要帶。送出時 room_id 放進 JSON。LocalMessageStore 的 watchMessages、count、oldestSeq、latestSeq、syncCursor 都加 WHERE room_id = ?。
提示裡那個「不應該加房間條件」的是 unsent()：Outbox 是全 App 一個，連上時所有房間的紅點都要補送，所以 unsent() 不分房間。
④ 房間列表：ChatService 每次連上呼叫 GET /rooms，upsertRooms 寫進 rooms 表（Server 說了算，用 replace）；收到 room_added 也呼叫 upsertRooms；收到任何 message、或自己的 ack 回來時呼叫 updatePreview。
updatePreview 的條件是 last_seq < 這則的 seq 才更新。這種只會變大、不會倒退的值叫 Monotonic，單調遞增：晚到的舊訊息，seq 比較小，不會把預覽蓋回去。
⑤ 私聊：starter 的 _newDm 已經抓在線名單、算出 dm:A:B、在本地建房。你要補的是 _open：push 一個 ChatPage(service, room)。送出第一句時帶著 dm:A:B，Server 自動建房，推 room_added 給兩個人。
另外，chat_controller.dart 還有一個沒編號的 TODO：重連只對開著的房間補洞。open() 時監聽連線狀態就自然成立了，因為只有開著的房間有 ChatController。

術語
・Monotonic（單調遞增）

可能被問到
問：ChatPage 要自己建 ChatController 嗎？
答：對，每次進房建一個，離開時 dispose。完成版的 ChatPage 在 initState 建 ChatController(service, roomId) 並呼叫 open()。`,

  // 20 Acceptance
  `【47–51 分】驗收
第一項：講師在儀表板勾 3 位同學按「建立並拉人」，被勾到的人列表立刻多一間，不用重開。
第二項：群組裡有人發言，那一間跳到最上面，顯示最後一句。
第三項：你開著兩人組時，講師或其他人在群組說話，兩人組的畫面不能出現那一句。這一項專門抓 ChatController 忘了過濾 room_id。
第四項：私聊夥伴，雙方列表都出現對方。
第五項：用第 7 堂的 App 先跑一次（DB 是第 1 版、有兩人組的訊息），再切到今天的分支跑起來，兩人組的舊訊息還在。如果之前刪過 App，就先切回第 7 堂分支跑一次、傳幾句，再切回來。`,

  // 21 Feynman
  `【51–53 分】費曼檢核

參考答案
Q1：每則訊息都帶 room_id。ChatService 握著唯一的連線，收到的事件放進廣播串流，每個開著的 ChatController 只挑 room_id 是自己的寫進 DB；沒開的房間只更新列表預覽，點進去再補洞。
Q2：使用者可能送出後就離開房間，ChatController 被 dispose，ACK 回來沒人接、計時器也沒了。ACK 用 clientMsgId 對應，本來就不需要知道房間；補送也要涵蓋沒開的房間。所以放在全 App 一個的 ChatService。
Q3：私聊 ID 是兩人名字排序算出來的 dm:Amy:Bob，誰算都一樣；Server 第一次看到才建房，第二次就直接用。`,

  // 22 ExtraMigration
  `【53–56 分】講師補充：DB 升版實務
App 一上架，就收不回來了：有人每版都更新，有人一年沒更新。每支手機上的 DB 都停在不同版本。
版本號只往上加：有人從第 1 版直接跳到第 5 版，onUpgrade(1, 5) 要依序跑 2、3、4、5。這就是為什麼我們的 _migrations 每一版只寫「從上一版怎麼變過來」。這種只往前升、不往回降的做法叫 Forward-only Migration，只進不退的升版。
上線過的版本不改：改了第 2 版的內容，已經升過第 2 版的手機不會再跑一次，兩群人的 DB 從此長得不一樣，之後的 bug 會非常難查。要改就再加一版。
不刪欄位、不改名：舊版 App 可能還在讀它；SQLite 刪欄位比加欄位麻煩很多，舊版 SQLite 甚至要重建整張表。
升版要能失敗：sqflite 的 onUpgrade 跑在同一個 Transaction，交易：一包動作要嘛全部成功、要嘛全部當作沒發生。失敗就 Rollback，回滾：回到升版前的樣子，下次開 App 再試，不會留下改到一半的 DB。
每一個舊版本都要測：裝舊版、塞資料、升到新版，確認資料還在、查得到。

術語
・Forward-only Migration（只進不退的升版）
・Transaction（交易）
・Rollback（回滾）

可能被問到
問：升版一直失敗怎麼辦？
答：最後的手段是刪掉本地 DB、從 Server 重抓。因為我們的 DB 只是 Server 的副本，可以這樣做；但 Outbox 裡沒送出的訊息會跟著不見，所以要先想辦法把它們撈出來。`,

  // 23 ExtraOneWs
  `【56–59 分】講師補充：一房一條 vs 一條
回到開頭那張 6 條線的圖。
心跳：每條各自 ping，手機的無線電一直被叫醒，最耗電的就是這個。
斷線重連：網路一恢復，6 條各自跑 Backoff，第 2 堂講的「大家同一秒撞進來」在一支手機裡就發生了。
Server：連線數變成人數乘以房間數，每條都要握手、驗身分，記憶體跟著乘。
沒開的房間：要嘛一直開著，要嘛收不到預覽，兩個都不好。
一條線也有代價，看最後一列：所有房間排在同一條 TCP 上，一則很大的訊息還沒傳完，後面所有房間的訊息都要等。這叫 Head-of-line Blocking，隊頭阻塞：排在最前面的卡住，後面全部跟著卡。這也是為什麼圖片、影片不塞進 WebSocket，而是先上傳拿網址，WebSocket 只傳網址。第 10 堂設計研討會有一題就是傳 10MB 影片。

術語
・Head-of-line Blocking（隊頭阻塞）

可能被問到
問：那真的需要分好幾條的時候呢？
答：常見是依「性質」分，不是依房間分：聊天一條，大檔案上傳另外走 HTTP，語音通話另外一條。`,

  // 24 Hook
  `【59–60 分】結尾鉤子
先把現象講清楚：剛才驗收第四項，大家私聊了夥伴，自己傳出去的那一句旁邊出現 ✓。這個 ✓ 是第 4 堂做的：Server 回了 ACK，訊息拿到 seq。
問全班：✓ 出現了，夥伴到底看了沒？你的 App 能告訴你嗎？
再接 PM：「我怎麼知道對方看了沒？群組裡又有幾個人看了？」
（不要直接講答案。現象是：✓ 只代表 Server 收到並存好了，夥伴可能根本沒打開 App，甚至還沒連線。App 完全不知道對方看到哪裡。下一堂：已讀水位線、一對一「已讀」和群組「已讀 N」、未讀數、進房跳到第一則未讀。）

講師自己複習（面試關鍵字，不用講給學員）
・Multiplexing：全 App 一條 WS，訊息帶 room_id，ChatController 每房一個從廣播串流過濾；ACK / 逾時 / Outbox 在 App 層級，以 clientMsgId 對應。
・Schema Migration：版本號只增、上線版本不改、不刪欄位、在 transaction 裡跑；舊訊息先給預設 room_id，拿到 assigned_room_id 再歸位。
・Server Push：room_added 負責即時；每次連上重拉 GET /rooms 負責不漏。
・Lazy Sync：連上只重拉列表、只補開著的房間；沒開的房間只更新預覽（反正規化 + 只往前），點進去再補洞。
・私聊：Deterministic ID dm:A:B，第一則送出時 Server 自動建房，不需要建房 API。`,
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
  title: '第 08 堂｜房間列表 + 多工（一條 WS 承載所有房間）',
  createdAt: '2026-11-24T05:11:03.000Z',
};

export default [
  Cover,
  Scenario,
  Evolution,
  Recap,
  OneWs,
  RecvRoute,
  SendAck,
  Protocol,
  RoomsFetch,
  ScenarioB,
  RoomAdded,
  Preview,
  Reconnect,
  DmQuestion,
  DmFlow,
  MigQuestion,
  MigFlow,
  ImplA,
  ImplB,
  Acceptance,
  Feynman,
  ExtraMigration,
  ExtraOneWs,
  Hook,
] satisfies Page[];
