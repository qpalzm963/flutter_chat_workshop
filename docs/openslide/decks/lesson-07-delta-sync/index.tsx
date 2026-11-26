import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 第 7 堂：斷線補洞（Delta Sync）+ 補送（Outbox）
// 學員看得到的頁面只放題目；參考答案和講稿都在 `notes`。
// 共用元件從第 6 堂複製，第 7 堂專用元件在後半段。
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
      <span>即時聊天室 · 第 7 堂</span>
      <span style={{ color: muted, fontWeight: 500 }}>/ {section}</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#dde9fb">Lesson 07</Pill>
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
// 第 7 堂改成分層：泳道一層，每個 item 各一層。index < stepFrom 的一開始就顯示，其餘每按一次 → 出現一個。
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

// ═════════════ 第 7 堂專用元件 ═════════════

type SegKind = 'have' | 'hole' | 'fetched';
type Seg = { label: string; flex: number; kind: SegKind };

const segColors: Record<SegKind, { bg: string; bd: string }> = {
  have: { bg: '#d6ecd9', bd: green },
  hole: { bg: '#fdf0e3', bd: amber },
  fetched: { bg: '#dde9fb', bd: blue },
};

// 示意用的 seq 區段條（不照比例）
const RangeStrip = ({ title, sub, segs, tone = ink }: { title: ReactNode; sub?: ReactNode; segs: Seg[]; tone?: string }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
      <span style={{ fontSize: 28, fontWeight: 900, color: tone }}>{title}</span>
      {sub && <span style={{ fontSize: 23, color: muted }}>{sub}</span>}
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 12, height: 68 }}>
      {segs.map((s, i) => (
        <div
          key={i}
          style={{
            flex: s.flex,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            border: `3px ${s.kind === 'hole' ? 'dashed' : 'solid'} ${segColors[s.kind].bd}`,
            background: segColors[s.kind].bg,
            fontSize: 23,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {s.label}
        </div>
      ))}
    </div>
  </div>
);

type ORow = { seq: string; who: string; t: string; st: St; ts: string };

const OutboxTable = ({ rows }: { rows: ORow[] }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '110px 110px 1fr 150px 120px',
      border: `2.5px solid ${ink}`,
      borderRadius: 'var(--osd-radius)',
      overflow: 'hidden',
      background: panel,
      fontSize: 24,
    }}
  >
    {['seq', 'sender', 'text', 'status', 'ts'].map((h) => (
      <div key={h} style={{ padding: '12px 18px', fontWeight: 900, fontFamily: mono, background: '#efe6d6' }}>
        {h}
      </div>
    ))}
    {rows.map((r, i) => {
      const hot = r.st !== 'sent';
      const cell: CSSProperties = {
        padding: '14px 18px',
        borderTop: `2px solid ${line}`,
        background: hot ? '#fdf0e3' : 'transparent',
        color: hot ? ink : muted,
        whiteSpace: 'nowrap',
      };
      return [
        <div key={`${i}a`} style={{ ...cell, fontFamily: mono, fontWeight: 800 }}>{r.seq}</div>,
        <div key={`${i}b`} style={cell}>{r.who}</div>,
        <div key={`${i}c`} style={{ ...cell, fontWeight: hot ? 800 : 500 }}>{r.t}</div>,
        <div key={`${i}d`} style={{ ...cell, fontFamily: mono, display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusIcon st={r.st} size={20} />
          {r.st}
        </div>,
        <div key={`${i}e`} style={{ ...cell, fontFamily: mono }}>{r.ts}</div>,
      ];
    })}
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

// 一次請求 + 回應：請求先出現，回應下一步才出現
const RoundTrip = ({ req, res, reqShown }: { req: string; res: string; reqShown?: boolean }) => (
  <div style={{ display: 'flex' }}>
    <Steps>
      {reqShown ? (
        <span>{req}</span>
      ) : (
        <Step>
          <span>{req}</span>
        </Step>
      )}
      <Step>
        <span style={{ color: '#fbbf7a' }}>{res}</span>
      </Step>
    </Steps>
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
        <Pill tint={panel}>固定兩兩一組</Pill>
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
        斷線補洞
      </h1>
      <p style={{ fontSize: 36, color: muted, margin: 0, lineHeight: 1.5 }}>
        出電梯、下捷運：漏掉的補回來，
        <br />
        沒送出去的自動補送
      </p>
      <div style={{ display: 'flex', gap: 14, marginTop: 56 }}>
        <Pill tint={panel}>Delta Sync</Pill>
        <Pill tint={panel}>after_seq</Pill>
        <Pill tint={panel}>Outbox</Pill>
      </div>
    </div>
    <div style={{ position: 'absolute', right: 200, top: 160 }}>
      <ChatPhone
        w={380}
        h={640}
        title="聊天室（Amy）"
        msgs={[
          { t: '好，週五見', mine: true, st: 'sent', seq: 300 },
          { t: '你到了嗎', who: 'Bob', seq: 301 },
          { t: '我們先點餐', who: 'Bob', seq: 302 },
          { t: '幫你點拉麵', who: 'Bob', seq: 303 },
          { t: '剛出捷運！', mine: true, st: 'sending' },
        ]}
      />
      <PhoneCap n="↻" title="連回來那一刻" w={380}>
        #301～#303 補收進來，「剛出捷運！」自動補送
      </PhoneCap>
    </div>
  </div>
);

const Scenario: Page = () => (
  <Shell section="開場" title="PM 帶著客服的回報來了">
    <Bubble who="PM" role="PM（轉述客服單）">
      「使用者說<b style={{ color: 'var(--osd-accent)' }}>出電梯之後</b>，群組裡中間那段對話<b style={{ color: 'var(--osd-accent)' }}>不見了</b>。」
    </Bubble>
    <Card style={{ marginTop: 56 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>今天下課前要做到</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Steps>
          <Step>
            <Goal n="01">斷線期間別人說的話，連回來自動出現，不用往上滑</Goal>
          </Step>
          <Step>
            <Goal n="02">斷線再久，也一路補到最新，不漏、不重複</Goal>
          </Step>
          <Step>
            <Goal n="03">
              <span style={{ color: muted }}>（PM 說客服那邊還有第二張單……）</span>
            </Goal>
          </Step>
        </Steps>
      </div>
    </Card>
  </Shell>
);

const Evolution: Page = () => (
  <Shell section="能力演進表" title="打掉「斷線」那一列的最後一個 ✗" sub="加上補洞：斷線期間別人說的話，重連後自動補齊。">
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
      <ColHead focus>第 7 堂 +補洞</ColHead>
      <ColHead>第 8～9 堂</ColHead>

      <RowHead>剛進聊天室</RowHead>
      <Cell state="no">空的，只看得到連上之後的</Cell>
      <Cell state="partial">看得到自己收過的</Cell>
      <Cell state="yes">先載最新一頁，往上滑再載</Cell>
      <Cell state="yes" focus />
      <Cell state="yes">未讀多就跳到第一則未讀</Cell>

      <RowHead>殺掉 App 重開</RowHead>
      <Cell state="no">全部不見</Cell>
      <Cell state="yes">秒開，不白屏</Cell>
      <Cell state="yes" />
      <Cell state="yes" focus />
      <Cell state="yes" />

      <RowHead>斷線時別人說的話</RowHead>
      <Cell state="no">收不到</Cell>
      <Cell state="no">收不到</Cell>
      <Cell state="no">收不到；本地留下斷層</Cell>
      <Cell state="yes" focus>
        <b>重連後自動補齊</b>　← 今天
      </Cell>
      <Cell state="yes" />

      <RowHead>新加入的人看舊對話</RowHead>
      <Cell state="no">看不到</Cell>
      <Cell state="no">看不到</Cell>
      <Cell state="yes">看得到</Cell>
      <Cell state="yes" focus />
      <Cell state="yes" />

      <RowHead>有好幾個聊天室</RowHead>
      <Cell state="no">只能等講師分房</Cell>
      <Cell state="no" />
      <Cell state="no" />
      <Cell state="no" focus />
      <Cell state="yes">房間列表 + 未讀數</Cell>
    </div>
  </Shell>
);

const Recap: Page = () => (
  <BigQuestion
    tag="上堂結尾：講師拒絕一位同學連線 30 秒，夥伴趁機傳了 3 句"
    tagColor="#f7d9d6"
    foot="解除之後他連回來，畫面上沒有那 3 句。"
    hint="提示：那 3 句 Server 有存嗎？有 seq 嗎？"
  >
    那 3 句，
    <br />
    到底去哪了？
  </BigQuestion>
);

const WhereGone: Page = () => (
  <Shell section="觀念" title="WebSocket 只推「現在」" sub="斷線那段時間，Server 推給 Amy 的訊息沒人收。連回來之後，它不會重推。">
    <SeqDiagram
      lanes={['Amy 的 App', 'Server', 'Bob 的 App']}
      pad={260}
      rowH={60}
      stepFrom={1}
      items={[
        { kind: 'note', at: 0, label: '本地最新 #300' },
        { kind: 'note', at: 1, label: '拒絕 Amy 連線 30 秒', tint: '#f7d9d6' },
        { kind: 'msg', from: 2, to: 1, label: '傳了 3 句 → 存成 #301～#303' },
        { kind: 'msg', from: 1, to: 0, label: '推給 Amy', lost: true, color: red },
        { kind: 'note', at: 0, label: '重連成功', tint: '#d6ecd9' },
        { kind: 'msg', from: 2, to: 1, label: '「人呢？」→ #304' },
        { kind: 'msg', from: 1, to: 0, label: '#304 人呢？' },
        { kind: 'note', at: 0, label: '畫面：#300 下面接 #304', tint: '#fdf0e3' },
      ]}
    />
    <Steps>
      <Step>
        <div style={{ marginTop: 18 }}>
          <WhyBox q="Amy 的 App 要怎麼知道自己漏了？又該跟 Server 要哪幾則？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const DeltaSync: Page = () => (
  <Shell section="觀念" title="從「我有的最後一則」往後要" sub="Delta Sync：只要我還沒有的那一段。第 6 堂往上翻用 before_seq，今天往下補用 after_seq。">
    <CodeBox>
      <div>{`# Amy 本地最新 #300，斷線期間 Server 多了 3 則`}</div>
      <RoundTrip req="GET /messages?user=Amy&after_seq=300&limit=100" res="   → #301～#303    3 則 < 100，補完" reqShown />
    </CodeBox>
    <CodeBox style={{ marginTop: 20 }}>
      <div>{`# 離線久一點：本地最新 #300，Server 已經到 #560`}</div>
      <RoundTrip req="after_seq=300" res=" → #301～#400    滿 100 則，可能還有" />
      <RoundTrip req="after_seq=400" res=" → #401～#500    滿 100 則，可能還有" />
      <RoundTrip req="after_seq=500" res=" → #501～#560    60 則 < 100，追到最新了，停" />
    </CodeBox>
    <Steps>
      <Step>
        <div style={{ display: 'flex', gap: 32, marginTop: 30 }}>
          <Point title="拿到的直接寫進 DB" tag="Upsert">
            補洞期間 WebSocket 也可能推來同一則。兩邊寫的是同一列，不會變兩則。
          </Point>
          <Point title="不足一頁才停" tag="迴圈">
            下一頁的 cursor，就是這一頁最後一則的 seq。
          </Point>
        </div>
      </Step>
    </Steps>
  </Shell>
);

const SyncFlow: Page = () => (
  <Shell section="觀念" title="補收一輪：從連上到畫面出現" sub="ChatController 只寫 DB，畫面只看 DB。補進來的訊息，走的是同一條路。">
    <SeqDiagram
      lanes={['畫面', '本地 DB', 'ChatController', 'Server']}
      pad={150}
      rowH={64}
      stepFrom={1}
      items={[
        { kind: 'note', at: 2, label: '狀態變成 connected', tint: '#d6ecd9' },
        { kind: 'msg', from: 1, to: 2, label: 'cursor = 別人的最新 #300' },
        { kind: 'msg', from: 2, to: 3, label: 'GET after_seq=300', color: blue },
        { kind: 'msg', from: 3, to: 2, label: '#301～#303（3 則）', color: blue },
        { kind: 'msg', from: 2, to: 1, label: 'upsert 3 則' },
        { kind: 'msg', from: 1, to: 0, label: 'Stream 通知：資料變了', color: green },
        { kind: 'note', at: 0, label: '#301～#303 出現', tint: '#d6ecd9' },
        { kind: 'note', at: 2, label: '3 則 < 100 → 停', tint: '#fdf0e3' },
      ]}
    />
  </Shell>
);

const TwoWays: Page = () => (
  <Shell section="回收伏筆" title="第 6 堂的問題：本地不空，為什麼不抓最新一頁？" sub="本地有 #1～#120，Server 已經到 #300。兩種補法，寫進 DB 之後長這樣：">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <Steps>
        <RangeStrip
          title="A. 抓最新一頁"
          sub="GET /messages（不帶 cursor）→ #251～#300"
          tone={red}
          segs={[
            { label: '本地 #1～#120', flex: 4, kind: 'have' },
            { label: '#121～#250　App 不知道它存在', flex: 4.4, kind: 'hole' },
            { label: '#251～#300', flex: 2, kind: 'fetched' },
          ]}
        />
        <Step>
          <WhyBox q="A 的畫面上，#120 下面直接接 #251。使用者看得出來少了 130 則嗎？往上滑補得回來嗎？" />
        </Step>
        <Step>
          <RangeStrip
            title="B. 從本地最新往後補"
            sub="after_seq=120 → 一頁一頁補到 #300"
            tone={green}
            segs={[
              { label: '本地 #1～#120', flex: 4, kind: 'have' },
              { label: '補進來 #121～#300', flex: 6.4, kind: 'fetched' },
            ]}
          />
        </Step>
      </Steps>
    </div>
  </Shell>
);

const Trigger: Page = () => (
  <Shell section="觀念" title="什麼時候補？每次連上" sub="不用開 Timer 定時補。盯著連線狀態，變成 connected 的那一刻就出發。">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: 12 }}>
      <Steps>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FlowBox title="斷線後自動重連" sub="第 2 堂的 Backoff + Jitter" tint="#dde9fb" />
          <FlowBox title="App 剛啟動" sub="第一次連上，也算" tint="#dde9fb" />
        </div>
        <Step>
          <div style={{ display: 'flex', height: '100%' }}>
            <FlowArrow />
            <FlowBox title="狀態變成 connected" sub="ChatController 監聽 socket.status" tint="#fbe7b5" />
          </div>
        </Step>
        <Step>
          <div style={{ display: 'flex', height: '100%' }}>
            <FlowArrow />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FlowBox title="補收" sub="after_seq 一頁一頁補進 DB" tint="#d6ecd9" />
              <FlowBox title="補送" sub="還沒送達的，重新送出" tint="#d6ecd9" />
            </div>
          </div>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ marginTop: 48 }}>
          <WhyBox q="Amy 只是把 App 關掉、隔天再打開，沒有進電梯。為什麼也要補？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const ScenarioB: Page = () => (
  <Shell section="PM 追加" title="PM：客服還有第二張單">
    <Bubble who="PM" role="PM（轉述客服單）">
      「使用者在<b style={{ color: 'var(--osd-accent)' }}>捷運上傳的訊息</b>，出站後還是<b style={{ color: 'var(--osd-accent)' }}>沒送出去</b>，
      <br />
      要自己一則一則點紅點。」
    </Bubble>
    <div style={{ display: 'flex', gap: 60, marginTop: 40, alignItems: 'flex-start' }}>
      <div>
        <ChatPhone
          w={340}
          h={420}
          title="捷運上的 Amy"
          msgs={[
            { t: '我出站了', mine: true, st: 'failed' },
            { t: '等我五分鐘', mine: true, st: 'failed' },
            { t: '到了', mine: true, st: 'failed' },
          ]}
        />
      </div>
      <Card style={{ flex: 1 }}>
        <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>第 4 堂做到這裡：5 秒沒收到 ACK → 紅點，等使用者自己點。今天再加：</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Steps>
            <Step>
              <Goal n="03">連回來自動送出，不用點</Goal>
            </Step>
            <Step>
              <Goal n="04">照打字的順序送，夥伴不會收到兩則一樣的</Goal>
            </Step>
            <Step>
              <Goal n="05">還沒送出就殺掉 App，重開照樣補送</Goal>
            </Step>
          </Steps>
        </div>
      </Card>
    </div>
  </Shell>
);

const Outbox: Page = () => (
  <Shell section="觀念" title="寄件匣就在 DB 裡" sub="不用另外開佇列：status 不是 sent 的那幾列，就是 Outbox。starter 給了 store.unsent()。">
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
      <div style={{ flex: 1.15 }}>
        <OutboxTable
          rows={[
            { seq: '#303', who: 'Bob', t: '幫你點拉麵', st: 'sent', ts: '09:58' },
            { seq: '#304', who: 'Amy', t: '好喔', st: 'sent', ts: '09:59' },
            { seq: '—', who: 'Amy', t: '我出站了', st: 'failed', ts: '10:01' },
            { seq: '—', who: 'Amy', t: '等我五分鐘', st: 'failed', ts: '10:02' },
            { seq: '—', who: 'Amy', t: '到了', st: 'sending', ts: '10:03' },
          ]}
        />
        <div style={{ fontSize: 23, color: muted, marginTop: 14 }}>橘色三列 = store.unsent() 撈出來的，依 ts（建立時間）排好</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Point title="sending 也要補送" tag="①">
          斷線那一刻還在轉圈的，ACK 已經不會來了。
        </Point>
        <Point title="照建立時間排，不照 seq" tag="②">
          還沒送達的根本沒有 seq。seq 是 Server 收到時才發的。
        </Point>
        <Point title="紅點的意思變了" tag="③">
          從「失敗了，你自己處理」變成「目前還沒送達」。
        </Point>
      </div>
    </div>
  </Shell>
);

const DupQuestion: Page = () => (
  <BigQuestion
    tag="寫補送之前先想"
    tagColor="#fbe7b5"
    foot="情境：Amy 按送出時，訊息其實已經到了 Server，只是回給 Amy 的 ACK 在路上斷了，所以 Amy 看到紅點。"
    hint="提示：第 4 堂 /fail 之後重試，夥伴收到兩則，最後是怎麼修好的？"
  >
    補送的那則，Server 可能早就收過了，
    <br />
    夥伴會看到兩則嗎？
  </BigQuestion>
);

const ResendFlow: Page = () => (
  <Shell section="觀念" title="補送一輪：紅點 → 轉圈 → ✓" sub="Amy 有兩則紅點。第一則其實 Server 收過了，只是 ACK 掉了；第二則真的沒送到。">
    <SeqDiagram
      lanes={['Amy 的 App', 'Server', 'Bob 的 App']}
      pad={260}
      rowH={52}
      stepFrom={1}
      items={[
        { kind: 'note', at: 0, label: '兩則紅點（unsent）', tint: '#f7d9d6' },
        { kind: 'note', at: 0, label: '①「我出站了」→ 轉圈' },
        { kind: 'msg', from: 0, to: 1, label: '重送 id=a1f「我出站了」' },
        { kind: 'note', at: 1, label: 'a1f 存過了：不存、不推', tint: '#fdf0e3' },
        { kind: 'note', at: 0, label: '②「等我五分鐘」→ 轉圈' },
        { kind: 'msg', from: 0, to: 1, label: '重送 id=b7c「等我五分鐘」' },
        { kind: 'msg', from: 1, to: 0, label: 'ACK a1f → 原本的 #305', color: green },
        { kind: 'note', at: 0, label: '①「我出站了」✓', tint: '#d6ecd9' },
        { kind: 'msg', from: 1, to: 2, label: '#306 等我五分鐘' },
        { kind: 'msg', from: 1, to: 0, label: 'ACK b7c → #306', color: green },
        { kind: 'note', at: 0, label: '②「等我五分鐘」✓', tint: '#d6ecd9' },
      ]}
    />
  </Shell>
);

const Trap: Page = () => (
  <Shell section="觀念" title="補收和補送同時出發，會怎樣？" sub="連上的那一刻兩件事一起跑。補送的 ACK，可能比補收先回來。">
    <SeqDiagram
      lanes={['Amy 的 App', 'Server']}
      pad={300}
      rowH={60}
      stepFrom={2}
      items={[
        { kind: 'note', at: 0, label: '本地最新 #300' },
        { kind: 'gap', label: '斷線期間 Bob 傳了 #301～#304，Amy 都沒收到' },
        { kind: 'note', at: 0, label: '重連成功', tint: '#d6ecd9' },
        { kind: 'msg', from: 0, to: 1, label: '補送「我出站了」' },
        { kind: 'msg', from: 1, to: 0, label: 'ACK：seq = #305', color: green },
        { kind: 'note', at: 0, label: 'MAX(seq) = #305', tint: '#fdf0e3' },
        { kind: 'msg', from: 0, to: 1, label: '補收 after_seq=305', color: blue },
        { kind: 'msg', from: 1, to: 0, label: '（空的，沒有比 #305 新的）', color: blue },
      ]}
    />
    <Steps>
      <Step>
        <div style={{ marginTop: 18 }}>
          <WhyBox q="#301～#304 補得回來嗎？補收的 cursor，應該用哪一則的 seq？" />
        </div>
      </Step>
    </Steps>
  </Shell>
);

const ImplA: Page = () => (
  <Shell section="實作" title="TODO ① ②" sub="starter 給了 HistoryApi.fetch(afterSeq:) 和 store.unsent()。主要寫在 chat_controller.dart；cursor 的查詢加在 local_message_store.dart。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      <Todo n="①" title={<><Kw>_onStatusChanged</Kw>：每次變成 connected，補收 + 補送都要跑</>}>
        <Hint>原本這裡只做第 6 堂的「本地是空的才抓最新一頁」。App 剛啟動的第一次連上，也會走到這裡。</Hint>
      </Todo>
      <Todo n="②" title={<>補收：本地不是空的 → 從 cursor 用 <Kw>after_seq</Kw> 一頁一頁寫進 DB，不足一頁就停</>}>
        <Hint>
          cursor 用哪一則的 seq？先想上一頁的坑。如果本地只有自己的訊息呢？
          <br />
          整段包 try/catch：補失敗不影響聊天，下次連上再補。
        </Hint>
      </Todo>
      <Todo n="②a" title={<>在 <Kw>LocalMessageStore</Kw> 加 <Kw>syncCursor</Kw>：補收的 cursor 從 DB 查</>}>
        <Hint>controller 碰不到 store 的 _db，查詢要寫在 store 裡。</Hint>
      </Todo>
    </div>
  </Shell>
);

const ImplB: Page = () => (
  <Shell section="實作" title="TODO ③ ④" sub="補送寫完，記得從頭到尾跑一次：斷線 → 送出 → 連回。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <Todo n="①" title="每次連上：補收 + 補送" done />
      <Todo n="②" title="after_seq 一頁一頁補到底" done />
      <Todo n="③" title={<>補送：<Kw>store.unsent()</Kw> 依建立時間、帶原本的 <Kw>clientMsgId</Kw> 重送，並重設 ACK 逾時</>}>
        <Hint>第 4 堂已經有一個方法做了其中兩件事，找找看。一則送完再送下一則。</Hint>
      </Todo>
      <Todo n="④" title="紅點的意思改成「目前還沒送達」，點了就立刻重送">
        <Hint>③ 做完之後，點紅點時還需要多做什麼嗎？畫面上的提示文字要怎麼說？</Hint>
      </Todo>
    </div>
  </Shell>
);

const Acceptance: Page = () => (
  <Shell section="驗收" title="斷線、送出、連回來" sub="兩人一組，一人當斷線的那個，做完交換。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <Check>
        輸入 <Kw>/drop</Kw>：斷線期間機器人說的 3 句，連回來自動出現
      </Check>
      <Check>講師拒絕你連線 30 秒，期間送 3 則：解除後自動送出，夥伴依序收到、不重複</Check>
      <Check>離線時送出，殺掉 App；解除封鎖後再打開，訊息還是送得出去</Check>
      <Check>夥伴在你斷線期間傳的訊息，連回來全部出現</Check>
    </div>
  </Shell>
);

const Feynman: Page = () => (
  <Shell section="費曼檢核" title="不看螢幕，講給隔壁聽" sub="兩人一組，一人一分鐘。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Card>
        <Goal n="Q1">斷線補洞的 cursor 是哪一則的 seq？為什麼要一頁一頁補？</Goal>
      </Card>
      <Card>
        <Goal n="Q2">補送同一則訊息好幾次，為什麼夥伴只會看到一則？</Goal>
      </Card>
      <Card>
        <Goal n="Q3">為什麼 App 剛啟動，也要補收、補送？</Goal>
      </Card>
    </div>
  </Shell>
);

const Think: Page = () => (
  <Shell section="思考分享" title="兩人一組，想 3 分鐘" sub="想完抽兩三組，各講一分鐘。講完講師補充業界做法。">
    <Card>
      <Goal n="Q4">
        Amy 出國三天沒開 App，這段時間群組聊了 5000 則。她一打開 App，今天寫的補洞會怎麼跑？使用者會感覺到什麼？有更好的做法嗎？
      </Goal>
    </Card>
    <div style={{ marginTop: 32 }}>
      <Hint>
        可以從這幾個角度想：今天的寫法要打幾次 API？畫面什麼時候才看得到最新的訊息？
        <br />
        她打開 App 的那一刻，最想先看到的是哪幾則？
      </Hint>
    </div>
  </Shell>
);

const ExtraStrategies: Page = () => (
  <Shell section="講師補充" title="離線太久：三種補法" sub="落差小就全補；落差大，換策略。">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '210px 1fr 1fr 1fr',
        border: `2.5px solid ${ink}`,
        borderRadius: 'var(--osd-radius)',
        overflow: 'hidden',
        background: panel,
        fontSize: 25,
        lineHeight: 1.45,
      }}
    >
      {['做法', '怎麼做', '好處', '代價'].map((h) => (
        <div key={h} style={{ padding: '14px 22px', fontWeight: 900, background: '#efe6d6' }}>
          {h}
        </div>
      ))}
      {[
        ['全補（今天）', 'after_seq 一頁一頁補到最新', '不漏、寫法最簡單', '5000 則要打 50 次 API，最新的最後才出現', false],
        ['清掉重抓', '落差太大就清空這房，只抓最新一頁', '一次就看到最新', '本地舊訊息白丟，往上滑要重下載；Outbox 不能清', false],
        ['範圍表', '只抓最新一頁，中間記成一個洞；滑到洞才補', '一次就看到最新，舊的也留著', '多一張表，要處理區段合併', true],
      ].map(([a, b, c, d, hot]) =>
        [a, b, c, d].map((v, i) => (
          <div
            key={String(a) + i}
            style={{
              padding: '18px 22px',
              borderTop: `2px solid ${line}`,
              background: hot ? '#fdf0e3' : 'transparent',
              fontWeight: i === 0 ? 800 : 500,
            }}
          >
            {v as string}
          </div>
        )),
      )}
    </div>
  </Shell>
);

const ExtraRanges: Page = () => (
  <Shell section="講師補充" title="範圍表：記下本地有哪幾段" sub="另開一張表 loaded_ranges(start_seq, end_seq)，每列是一段本地連續擁有的訊息。">
    <RangeStrip
      title="Amy 出國三天，打開 App"
      sub="只抓最新一頁，中間記成一個洞"
      segs={[
        { label: '#1～#300', flex: 3, kind: 'have' },
        { label: '洞 #301～#5250　滑到這裡才用 before_seq 補', flex: 6.5, kind: 'hole' },
        { label: '#5251～#5300', flex: 2.4, kind: 'fetched' },
      ]}
    />
    <div style={{ display: 'flex', gap: 28, marginTop: 40 }}>
      <Point title="第 6 堂：跳到回覆" tag="同一招">
        跳到 #57，就是範圍表多一段。
      </Point>
      <Point title="第 9 堂：未讀定位" tag="同一招">
        先抓第一則未讀附近那段，其他的之後再補。
      </Point>
      <Point title="未讀數不用下載訊息" tag="順便">
        最新 seq 減掉讀到的位置。
      </Point>
    </div>
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 36 }}>
      <Pill tint="#d6ecd9">課後挑戰</Pill>
      <span style={{ fontSize: 28, fontWeight: 800 }}>
        分支 <Kw>step-7-challenge-ranges</Kw>：重連只抓最新一頁、滑到洞才補、區段要合併
      </span>
    </div>
  </Shell>
);

const Hook: Page = () => (
  <div style={fill}>
    <TopBar section="下集預告" />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 180 }}>
      <Pill tint="#f7d9d6">講師在儀表板勾了 3 位同學，建了一個新群組</Pill>
      <h2 style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.3, margin: '32px 0 0' }}>
        群組建好了，
        <br />
        被拉進去的人，App 裡看得到嗎？
      </h2>
      <div style={{ display: 'flex', gap: 32, marginTop: 56 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 22, color: muted }}>到今天為止的 App</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, lineHeight: 1.4 }}>一打開，就直接進講師分給你的那一間</div>
        </Card>
        <Card style={{ flex: 1, background: '#fdf0e3' }}>
          <div style={{ fontSize: 22, color: muted }}>PM 和營運的下一個需求</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, lineHeight: 1.4 }}>要能私訊、要有群組，活動時把大家拉進同一群</div>
        </Card>
      </div>
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
□ 其他：示範時用「拒絕連線」（秒數欄預設 30）；結尾鉤子才用「建立並拉人」建群組，建好先不要在群組裡發言

【0:00】
今天處理斷線。上一堂最後大家看到了：斷線那 30 秒夥伴講的話，連回來就不見了。
今天要把它補回來，做法叫 Delta Sync，差異同步：不重抓全部，只跟 Server 要「我還沒有的那一段」。
另一半是反方向：自己斷線時按的送出，連回來要自動送出去。這些還沒送達的訊息集中放的地方叫 Outbox，寄件匣。就像 email 沒網路時，信會先躺在寄件匣，有網路再寄出去。
課前確認：Server 是 ACK 等級；第 5～7 堂固定兩兩一組，今天不換房。

術語
・Delta Sync（差異同步）
・Outbox（寄件匣）`,

  // 2 Scenario
  `【0–2 分】
用 PM 的口氣唸。PM 是把客服單轉過來的：使用者搭電梯、過隧道，出來之後群組裡中間那段對話不見了。運氣好往上滑撈得到，運氣不好根本撈不到。
（→）目標 01：斷線期間別人說的話，連回來要自己出現，不用往上滑。
（→）目標 02：不管斷多久，都要一路補到最新，不漏也不重複。
（→）目標 03 故意蓋住：PM 說客服那邊還有第二張單，等一下再帶回來。
可以問一句：大家搭電梯出來，LINE 有漏過訊息嗎？為什麼沒有？讓他們帶著這個問題往下聽。`,

  // 3 Evolution
  `【2–3 分】
指著第三列：斷線時別人說的話。第 1～6 堂全是 ✗。上一堂也收不到，而且往上滑補不回來，本地會留下斷層，因為第 6 堂的 loadOlder 是從本地最舊那則往前找，洞在本地最新那邊。
今天打掉這一列最後一個 ✗。最後一列「好幾個聊天室」留給第 8 堂。`,

  // 4 Recap
  `【3–5 分】回顧提問
先把上一堂結尾講一次給沒印象的人：講師在儀表板對一位同學按「拒絕連線」30 秒，他的夥伴趁這段時間傳了 3 句。解除之後他連回來，畫面上沒有那 3 句。
先問全班：那 3 句到底去哪了？給大家十秒鐘猜。
（→）出現提示：那 3 句 Server 有沒有存？有沒有 seq？順著提示問：既然 Server 有，為什麼 App 沒拿到？

參考答案：Server 有存，也有 seq，例如 #301～#303。夥伴送出時，Server 照樣存、照樣推，只是推給斷線那位時沒有人收。WebSocket 的推送是當下送、送完就沒了，Server 不會記「這則誰還沒收到」，重連後也不會重推。
App 這邊，第 2 堂的自動重連只是把線接回來，沒有人去問「我不在的時候發生了什麼事」。這就是第 2 堂結尾留下、一直沒處理的問題。`,

  // 5 WhereGone
  `【5–8 分】WebSocket 只推「現在」
一開始只有一格：Amy 本地最新是 #300。
（→）Server 這邊：講師拒絕 Amy 連線 30 秒。
（→）Bob 的 App 傳給 Server 3 句，Server 存成 #301～#303。
（→）Server 照常推給 Amy，但 Amy 沒連線，這一下掉了。WebSocket 的推送是 Fire-and-forget，送了就不管：Server 把訊息寫出去就算完成，對方有沒有收到它不追蹤。
（→）Amy 的 App：30 秒到了，重連成功。Server 不會因為她回來就重推剛剛那 3 句。
（→）Bob 的 App 再傳給 Server 一句「人呢？」，存成 #304。
（→）Server 推給 Amy，#304 正常收到。
（→）Amy 的畫面：#300 下面直接接 #304，看起來很正常，其實中間少了三則。
（→）出現問題：App 怎麼知道自己漏了？

參考答案：兩個時機。第一，每次重連都主動問，不管有沒有漏，這是今天要做的。第二，收到 #304 時，發現本地最新是 #300，seq 跳號了，就知道中間少了，這叫 Gap Detection，斷層偵測：利用 seq 在房間裡連續遞增的特性，看到跳號就觸發補洞。第二種今天不做，當延伸。
要哪幾則？比本地最新那則更新的，這就是下一頁。

術語
・Fire-and-forget（送了就不管）
・Gap Detection（斷層偵測）

可能被問到
問：為什麼 Server 不幫每個人記「還沒收到哪些」，重連時重推？
答：可以做，有些系統會替每個人維護一個待送佇列。但每個人、每個房間都要記狀態，人一多 Server 很重；手機可能離線好幾天，佇列會很長。讓 Client 自己帶 cursor 來問，Server 就不用記任何人的進度，是聊天系統很常見的分工。

問：Gap Detection 為什麼不當主力？
答：它只能在「又收到下一則」時才發現。如果斷線後沒人再說話，就永遠發現不了。所以重連時主動補是基本盤，跳號偵測是加強。`,

  // 6 DeltaSync
  `【8–10 分】Delta Sync
連回來時，拿本地最新那則的 seq 當 cursor，問 Server「比它新的給我」，參數就是 after_seq，意思是「這個 seq 之後的」。第 6 堂往上翻用 before_seq，今天往下補用 after_seq，同一支 API 的兩個方向。
先看第一個例子：Amy 的 App 傳給 Server 一個請求，after_seq=300。
（→）Server 回給 App #301～#303，3 則，不足 100 則，一次就補完。只要我沒有的那段，不重抓全部，這就是開頭說的 Delta Sync，差異同步。
第二個例子：離線久一點，Server 已經到 #560，一次要 100 則。
（→）App 傳給 Server：after_seq=300。
（→）Server 回 #301～#400，滿 100 則，代表可能還有。
（→）App 用這頁最後一則 #400 當新的 cursor，再傳給 Server：after_seq=400。
（→）Server 回 #401～#500，又是滿的。
（→）App 再傳 after_seq=500。
（→）Server 回 #501～#560，只有 60 則，不足 100，代表追到最新了，停。
（→）兩個重點。拿到的直接寫進 DB。用的是第 5 堂的 Upsert，有就更新、沒有就新增：補洞期間 WebSocket 也可能推來同一則，兩邊寫進去的是同一列，不會變兩則。另一個重點就是剛剛的迴圈：不足一頁才停。

術語
・after_seq
・Upsert（有就更新、沒有就新增）

可能被問到
問：為什麼補洞一頁 100 則，第 6 堂分頁是 50 則？
答：用途不同。分頁是使用者在等畫面，一頁小一點回得快；補洞是背景追進度，一頁大一點可以少打幾次請求。Server 的 limit 上限是 200。

問：補到一半網路又斷了？
答：已經寫進 DB 的不會丟。下次連上重新算 cursor，會從已經補到的地方接著補。`,

  // 7 SyncFlow
  `【10–12 分】補收一輪的完整時序
四條線：畫面、本地 DB、ChatController、Server。一開始只有一格：ChatController 發現連線狀態變成 connected。
（→）本地 DB 回給 ChatController 一個 cursor：別人的最新 seq 是 #300。為什麼是「別人的」，等一下會講。
（→）ChatController 傳給 Server：GET after_seq=300。
（→）Server 回給 ChatController：#301～#303 三則。
（→）ChatController 把這三則 upsert 進本地 DB。注意它沒有直接去改畫面。
（→）本地 DB 通知畫面：資料變了。這是第 5 堂的 Stream，畫面訂閱的就是它。
（→）畫面重新查詢，#301～#303 出現。
（→）回到 ChatController：拿到 3 則，不足 100，迴圈停。
重點：補收進來的訊息，和 WebSocket 即時推來的訊息，走同一條路：都寫 DB，畫面只看 DB。這就是第 5 堂的 SSOT，Single Source of Truth，唯一資料來源：資料只有一份正本，其他人都從它讀。所以補洞不用改任何 UI 程式。

術語
・SSOT（Single Source of Truth，唯一資料來源）`,

  // 8 TwoWays
  `【12–14 分】回收第 6 堂的伏筆
第 6 堂寫「進房載入最新一頁」時，規定只有本地是空的才抓。當時留了一個問題：本地不是空的，為什麼不能也抓最新一頁？今天回答。
A：本地有 #1～#120，抓最新一頁拿到 #251～#300，寫進 DB 之後中間 #121～#250 這段 App 完全不知道它存在。這種中間缺一段的狀況叫 Gap，斷層。
（→）出現問題：使用者看得出來嗎？往上滑補得回來嗎？先讓大家回答。

參考答案：看不出來，#120 下面直接接 #251，每則都正常顯示。往上滑也補不回來：第 6 堂的 loadOlder 是看本地最舊的 seq，最舊是 #1，它以為已經到頂了。
（→）B：從本地最新往後補，補完是連續的一段，沒有斷層。
所以第 6 堂那條規則就是今天的前半：本地空的，抓最新一頁；本地不空，從本地最新往後補。

術語
・Gap（斷層）

可能被問到
問：離線很久，從 #120 一路補到 #5000 不就很久？
答：對，這就是今天最後的思考題，先記著。`,

  // 9 Trigger
  `【14–15 分】什麼時候補
不用開一個 Timer 定時補，而是每次連線狀態變成 connected 就補。
先指左邊：有兩種情況會走到 connected，斷線後的自動重連，還有 App 剛啟動的第一次連線。
（→）中間：第 2 堂的 ChatSocket 已經對外發連線狀態，ChatController 監聽它就好，狀態變成 connected 的那一刻就出發。
（→）右邊：出發做兩件事，補收和補送，兩件事同時跑。
（→）出現問題：只是把 App 關掉，隔天再打開，為什麼也要補？

參考答案：App 被殺掉、或在背景被系統凍結的那段時間，也是不在線。對 Server 來說你不在就是不在，不管是進電梯還是 App 被關。App 從完全關閉的狀態被打開，叫 Cold Start，冷啟動：冷啟動之前那段時間發生的事，本地一定沒有，所以要補。上次沒送出去的訊息也還在 DB 裡等著。

術語
・Cold Start（冷啟動）

可能被問到
問：App 從背景切回前景要不要補？
答：如果在背景時 WebSocket 被斷了，切回來會重連，自然觸發。如果連線一直沒斷，WebSocket 本來就收得到，不用補。所以綁在連線狀態上，比綁在 App 生命週期上準。`,

  // 10 ScenarioB
  `【15–16 分】PM 追加
PM 帶著第二張單回來：在捷運上傳的訊息，出站之後還是沒送出去。
現在的行為是第 4 堂做的：5 秒沒收到 ACK 就變紅點，要使用者自己一則一則點重試。捷運上連傳三則，出站就要點三次，而且點的順序可能跟打字的順序不一樣。
今天再加三個目標。
（→）目標 03：連回來自動送出，不用點。
（→）目標 04：照打字的順序送，夥伴也不會收到兩則一樣的。
（→）目標 05：還沒送出就殺掉 App，重開照樣補送。`,

  // 11 Outbox
  `【16–18 分】Outbox
要自動補送，先要知道哪些還沒送。不用另外開佇列：第 5 堂起每則訊息都在 DB，status 不是 sent 的那幾列就是 Outbox，寄件匣。starter 給的 store.unsent() 就是查這幾列，依 ts 排好。
這種先存在本地、等有網路再送出去的模式叫 Store-and-forward，存後轉送。因為存在 DB，App 被殺掉也不會丟。
三個重點。
① sending 也要補送。斷線那一刻送出、還在轉圈的，ACK 已經不會來了。順帶一提，App 重開時第 5 堂會把殘留的 sending 改成 failed，所以冷啟動之後撈到的都是 failed。
② 照建立時間排，不照 seq。還沒送達的訊息根本還沒有 seq；seq 是 Server 收到時才發的，誰先到誰先拿號。所以 App 要照使用者打字的順序送，夥伴看到的順序才會對。
③ 紅點的意思變了。以前紅點是「失敗了，你自己處理」；現在是「目前還沒送達」，連上就會自動送，點它只是「現在立刻再試一次」。

術語
・Outbox（寄件匣）
・Store-and-forward（存後轉送）

可能被問到
問：用 ts 排序，手機時間被調過怎麼辦？
答：這裡的 ts 是同一支手機自己寫的建立時間，只用來排自己這幾則的先後。同一支手機的時鐘在幾分鐘內前後一致就夠用。真正的全域順序還是靠 Server 發的 seq。要更保險，可以另外存一個本地遞增的編號。`,

  // 12 DupQuestion
  `【18–19 分】先想再寫補送
唸情境：Amy 按送出時，訊息其實已經到了 Server，Server 存好、也推給 Bob 了，只是回給 Amy 的 ACK 在路上斷了，所以 Amy 看到紅點。連回來自動補送，Bob 會不會看到兩則？
先讓大家講。卡住的話（→）出現提示：第 4 堂的 /fail，當時重試會產生新的 UUID，夥伴收到兩則；後來改成重試沿用同一個 clientMsgId。

參考答案：不會。補送帶的是原本的 clientMsgId，Server 看到這個 ID 已經存過，就不再存、不再推給別人，只把原本那筆的 seq 再回一次 ACK。這就是第 4 堂的 Idempotency，冪等：同一個請求做一次和做十次，結果一樣。
補送的策略是「沒確定送到就再送」，所以同一則可能送好幾次，這叫 At-least-once Delivery，至少送達一次：保證不會漏，但可能重複。重複交給冪等去擋，兩個加起來，使用者看到的效果就是剛好一次。

術語
・Idempotency（冪等）
・At-least-once Delivery（至少送達一次）

可能被問到
問：那為什麼不直接做到「剛好送一次」？
答：網路會斷的情況下，送出的一方分不出「對方沒收到」和「對方收到了但回條丟了」。分不出來，就只能選「可能漏」或「可能重複」。聊天選可能重複，再用冪等擋掉，這是業界標準做法。`,

  // 13 ResendFlow
  `【19–21 分】補送一輪的完整時序
用一張圖把剛剛的答案走一次。三條線：Amy 的 App、Server、Bob 的 App。一開始 Amy 有兩則紅點，就是 store.unsent() 撈出來的。
（→）Amy 的 App：第一則「我出站了」紅點變成轉圈，狀態改回 sending。
（→）Amy 的 App 傳給 Server：重送 id=a1f，帶的是原本的 clientMsgId。
（→）Server 發現 a1f 已經存過，是 #305，就是上一頁寄件匣 #304 之後那則。不再存、也不再推給 Bob。這一步就是 Deduplication，去重：用唯一 ID 認出重複的請求，丟掉重複的那份。
（→）Amy 的 App：第二則「等我五分鐘」紅點變轉圈。注意第一則送出後就輪到它，不用等 ACK，照建立時間排。順序靠的是同一條 WebSocket 先送先到（In-order Delivery，等一下實作會再講），不是靠等 ACK。
（→）Amy 的 App 傳給 Server：重送 id=b7c。兩則是接連送出去的，ACK 之後才陸續回來。
（→）Server 回給 Amy：ACK a1f，seq 是原本的 #305，不會發新號。
（→）Amy 的 App：「我出站了」轉圈變成 ✓。
（→）b7c 這則 Server 沒看過，存成 #306，推給 Bob。
（→）Server 回給 Amy：ACK b7c，#306。
（→）Amy 的 App：「等我五分鐘」變成 ✓。Bob 那邊只收到一則「等我五分鐘」，「我出站了」也只有一則。

術語
・Deduplication（去重）

可能被問到
問：要不要等第一則的 ACK 回來，再送第二則？
答：不用。等 ACK 再送叫停等式，斷線剛連回來、寄件匣有很多則時會很慢。完成版的補送迴圈只 await 寫 DB，送出去就換下一則。`,

  // 14 Trap
  `【21–23 分】補收和補送的坑
寫補收之前再看一個坑。連上的那一刻，補收和補送是同時出發的，誰先回來不一定。結果取決於誰先完成的狀況，叫 Race Condition，競態條件。
一開始兩格：本地最新 #300；斷線期間 Bob 傳了 #301～#304，Amy 都沒收到。
（→）Amy 的 App：重連成功，補收和補送同時出發。
（→）Amy 的 App 傳給 Server：補送「我出站了」。
（→）Server 回給 Amy：ACK，seq 是 #305。App 把 #305 寫進 DB。
（→）這時補收才去算 cursor。如果直接用 MAX(seq)，拿到的是 #305。
（→）Amy 的 App 傳給 Server：補收 after_seq=305。
（→）Server 回給 Amy：空的，沒有比 #305 新的。#301～#304 就永遠漏了。
（→）出現問題，讓大家回答。

參考答案：補不回來。cursor 要用「別人的」最新 seq。自己的訊息是自己送出去的，它的 seq 什麼時候回來由 ACK 決定，跟「我收到哪裡了」無關。只有別人的訊息是透過接收寫進來的，它的最新 seq 才代表「我收到哪了」。
完成版就是 SELECT MAX(seq) FROM messages WHERE sender != 我。

術語
・Race Condition（競態條件）

可能被問到
問：先補收、補完再補送，不就沒有競態了？
答：可以，順序寫死就沒有這個坑。代價是補收要補很多頁時，補送得一直等，使用者的訊息很晚才送出。完成版選擇兩件事同時跑、cursor 改用別人的 seq。兩種都對，重點是知道為什麼。

問：重連那一瞬間 Bob 剛好又傳一則 #306，WebSocket 先推到，cursor 不就變成 #306？
答：理論上會，窗口很小，只有算 cursor 前那兩個本地查詢的時間，完成版沒有處理。要完全擋住，可以搭配 Gap Detection：收到 #306 時發現本地別人的最新是 #300，跳號就再補一次。`,

  // 15 ImplA
  `【23–35 分】實作開始
① _onStatusChanged：原本 connected 時只做第 6 堂的「本地空的抓最新一頁」。改成每次 connected 都跑補收和補送；不是 connected 就直接 return。
② 補收：本地是空的，維持第 6 堂的抓最新一頁就 return。不是空的就算 cursor，然後迴圈：after_seq=cursor、limit=100，寫進 DB；不足 100 則就停，否則 cursor 換成這頁最後一則的 seq，繼續。
cursor 用上一頁的結論：別人的最新 seq。還有一個邊界：本地只有自己的訊息、沒有別人的，那個 MAX 會是 null。這時要準備 Fallback，退路：主要的值拿不到時改用的備案。完成版退回「本地最舊那則的 seq 減 1」，從自己第一則之前開始補。SQL 裡用 COALESCE 寫，它會回傳參數裡第一個不是 null 的值。
這個查詢要寫在 local_message_store.dart：在 LocalMessageStore 加 syncCursor（頁面上的 ②a）。controller 碰不到 store 的 _db，starter 的 latestSeq 是全部的 MAX(seq)，拿來當 cursor 剛好踩進上一頁的坑。
整段包 try/catch：補洞失敗不影響聊天，下次連上再補。

術語
・Fallback（退路）
・COALESCE

可能被問到
問：迴圈會不會停不下來？
答：每一頁 cursor 都往後推，Server 的最新 seq 是有限的，總會拿到不足一頁的那頁。要更保險可以加「最多補幾頁」的上限，這也是思考題的線索。`,

  // 16 ImplB
  `【35–47 分】
③ 補送：store.unsent() 已經照建立時間排好。每一則呼叫第 4 堂的 retry：它會把狀態改回 sending、帶原本的 clientMsgId 送出、重新開一個 ACK 計時器。所以補送就是一個 for 迴圈，重點是 await，一則一則照順序送進同一條 WebSocket。
ACK Timeout，ACK 逾時，就是第 4 堂那個 5 秒計時器：時間到還沒收到回條就標成 failed。補送時一定要重設，舊的計時器才不會把剛重送的那則又打回紅點；如果這次又沒回，它照樣會變紅點，等下次連上再補。
同一條 WebSocket 底下是 TCP，先送的一定先到，Server 照收到的順序發 seq。所以夥伴看到的順序就是打字的順序，這叫 In-order Delivery，依序送達。
④ 紅點：點擊本來就呼叫 retry，程式不用改，要改的是語意。有提示文字的話，從「傳送失敗」改成類似「尚未送出，連上後會自動重送」。

術語
・ACK Timeout（ACK 逾時）
・In-order Delivery（依序送達）

可能被問到
問：補送時又斷線了？
答：沒送到的會因為 ACK 逾時變紅點，下次連上又被 unsent() 撈到。一直到收到 ACK 變 sent，才離開 Outbox。

問：自動補送時，使用者剛好也點了紅點，會不會送兩次？
答：會送兩次，但是同一個 clientMsgId，Server 冪等，夥伴只看到一則。`,

  // 17 Acceptance
  `【47–51 分】驗收
第一項：/drop 會踢斷自己、5 秒內拒絕重連，2 秒後機器人在你的房間發 3 句。連回來那 3 句要自己出現，不用往上滑。
第二項：講師在儀表板對你按「拒絕連線」30 秒。期間送 3 則，看到轉圈再變紅點。解除後自動依序送出，夥伴那邊順序正確、不重複。
第三項：離線時送出，殺掉 App，等解除封鎖再打開。啟動時殘留的 sending 會先變 failed，連上後被 unsent() 撈到補送。
第四項：換夥伴斷線，你傳話，對方連回來全部出現。
看 Server log：出現 duplicate … re-ack，代表重複的補送被冪等擋下了。`,

  // 18 Feynman
  `【51–52 分】費曼檢核

參考答案
Q1：本地「別人的」最新 seq，不是全部的 MAX(seq)，因為自己補送的 ACK 可能先回來把 MAX 推高。一頁一頁補，是因為斷線可能很久，一次要全部可能幾千則；分頁每次回應小，失敗也只重來一頁。
Q2：補送帶原本的 clientMsgId，Server 認得，重複的不存、不推，只回原本那筆的 ACK。至少送達一次加冪等，效果就是剛好一次。
Q3：App 被殺掉的那段時間也是不在線，期間的訊息本地沒有；上次沒送出的訊息也還在 Outbox 等著。`,

  // 19 Think
  `【52–55 分】思考分享
兩人一組想 3 分鐘，抽兩三組講。講完翻下兩頁講師補充。

參考答案：今天的寫法要打 50 次 API、下載 5000 則，全部補完畫面才接到最新；使用者打開 App 最想看的偏偏是最新的那幾則。而且大部分舊訊息她可能根本不會往上滑去看。
業界做法：落差小就全補；落差大就換策略，清掉重抓，或用範圍表：先抓最新一頁，中間記成一個洞，滑到洞的邊緣才補。詳見下兩頁。`,

  // 20 ExtraStrategies
  `【55–57 分】講師補充：三種補法
全補就是今天寫的：簡單、不漏，但離線越久越慢，最新的最後才看到。
清掉重抓，也叫 Full Resync，全量重抓：落差超過門檻，就把這房本地的訊息清掉，只抓最新一頁，等於當成換了新手機。快，但本地舊資料白白丟掉，往上滑要重下載；清的時候還要小心，Outbox 裡沒送出的不能清。
範圍表：只抓最新一頁，把中間記成一個洞，滑到洞才補。這是 Lazy Loading，延遲載入：用得到才載，用不到就不載。

術語
・Full Resync（全量重抓）
・Lazy Loading（延遲載入）

可能被問到
問：門檻怎麼定？
答：常見用則數或時間，例如落差超過幾頁、離線超過幾天。也可以先問 Server 現在最新的 seq，算出落差再決定。

問：圖片、影片也這樣補嗎？
答：補的只是訊息本身，也就是文字、檔案網址、縮圖資訊。檔案本體等使用者滑到、真的要看時才下載。這叫多媒體分流：訊息走補洞，大檔案另外走下載和快取。`,

  // 21 ExtraRanges
  `【57–59 分】講師補充：範圍表
範圍表，Loaded Ranges，已載入範圍表：一張表記錄本地「連續擁有」的區段，每列一個 start_seq、end_seq。
Amy 出國三天，連上只抓最新一頁 #5251～#5300，範圍表多一段；它跟本地 #1～#300 接不上，中間就是一個洞。往上滑到 #5251 的邊緣，就用 before_seq=5251 往前補一頁。補進來的區段碰到相鄰的區段，就做 Range Merge，區段合併：兩段併成一段，表才不會越切越碎。
它順便解決三件事：第 6 堂跳到回覆，跳過去就是多一段；第 9 堂進房跳到第一則未讀，也是多一段；未讀數不用下載訊息，房間最新 seq 減掉自己讀到的位置就是未讀數。
有一個前提：seq 不能跳號。如果刪除訊息就真的刪掉，seq 留下一個空號，App 會以為那是沒補到的洞，一直去補。所以刪除要用 Soft Delete，標記刪除：資料留著，只加一個「已刪除」的標記。
業界常拿 Telegram 當範圍表的例子；講的時候說「類似的思路」即可，不要講它的實作細節。
課後挑戰分支 step-7-challenge-ranges，參考解在 step-7-challenge-ranges-done。

術語
・Loaded Ranges（已載入範圍表）
・Range Merge（區段合併）
・Soft Delete（標記刪除）`,

  // 22 Hook
  `【59–60 分】結尾鉤子
講師在儀表板勾 3 位同學，建立一個自訂群組。問被勾到的那三位：你的 App 裡看得到這個群組嗎？大家打開看。
（不要直接講答案。現象是：看不到。App 從第 1 堂到現在都只有一個聊天畫面，連的是講師分配的那一間，沒有房間列表，也不知道有新房間。下一堂：房間列表、訊息帶 room_id、Server 推送 room_added、私聊。）
注意：建好群組先不要在裡面發言（包括講師用「說話」或「灌訊息」測試），第 8 堂再用。第 7 堂的 App 收到 message 不看 room_id，群組裡的話會混進單房的 DB，第 8 堂升版時又被歸到兩人組。

講師自己複習（面試關鍵字，不用講給學員）
・Delta Sync：重連時以本地 cursor 用 after_seq 分頁補到不足一頁；cursor 用別人的最新 seq，避免補送 ACK 先回來造成跳過。
・Outbox + At-least-once + Idempotency：未送達（sending + failed）依建立時間帶原 client_msg_id 重送，Server 去重。
・Gap：本地不空時不抓最新一頁；離線太久改用範圍表（Loaded Ranges）+ Lazy Loading。
・seq 不可跳號：刪除用 Soft Delete。`,
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
  title: '第 07 堂｜斷線補洞（Delta Sync）+ 補送（Outbox）',
  createdAt: '2026-11-24T08:00:00.000Z',
};

export default [
  Cover,
  Scenario,
  Evolution,
  Recap,
  WhereGone,
  DeltaSync,
  SyncFlow,
  TwoWays,
  Trigger,
  ScenarioB,
  Outbox,
  DupQuestion,
  ResendFlow,
  Trap,
  ImplA,
  ImplB,
  Acceptance,
  Feynman,
  Think,
  ExtraStrategies,
  ExtraRanges,
  Hook,
] satisfies Page[];
