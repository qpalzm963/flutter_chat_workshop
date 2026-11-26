import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// 第 3 堂：反轉列表 UI（Bottom-anchored）
// 學員看得到的頁面只放題目；參考答案和講稿都在 `notes`。
// 共用元件從第 2 堂複製，第 3 堂專用元件在後半段。
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

// 換頁轉場：transitions.md 的 RISE（260ms、上移 6px 淡入、exit 用 HOLD），全份共用
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
      <span>即時聊天室 · 第 3 堂</span>
      <span style={{ color: muted, fontWeight: 500 }}>/ {section}</span>
    </div>
    <div style={{ display: 'flex', gap: 14 }}>
      <Pill tint="#dde9fb">Lesson 03</Pill>
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

// ═════════════ 第 3 堂專用元件 ═════════════

type Msg = { t: string; mine?: boolean; tag?: string; hot?: boolean };

// 手機示意：list 從上長（top）或從下長（bottom），shift 是往外推出去的像素
const Phone = ({
  msgs,
  anchor,
  shift = 0,
  keyboard,
  chip,
  w = 340,
  h = 600,
}: {
  msgs: Msg[];
  anchor: 'top' | 'bottom';
  shift?: number;
  keyboard?: boolean;
  chip?: boolean;
  w?: number;
  h?: number;
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
        聊天室（Amy）
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            [anchor]: 10 - shift,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                justifyContent: m.mine ? 'flex-end' : 'flex-start',
              }}
            >
              {m.tag && !m.mine && (
                <span style={{ fontFamily: mono, fontSize: 14, color: blue, fontWeight: 800 }}>{m.tag}</span>
              )}
              <span
                style={{
                  fontSize: 17,
                  lineHeight: 1.3,
                  padding: '6px 12px',
                  borderRadius: 14,
                  border: `2px solid ${m.hot ? 'var(--osd-accent)' : ink}`,
                  background: m.hot ? '#fdf0e3' : m.mine ? '#d6ecd9' : panel,
                  fontWeight: m.hot ? 800 : 500,
                  maxWidth: 220,
                }}
              >
                {m.t}
              </span>
              {m.tag && m.mine && (
                <span style={{ fontFamily: mono, fontSize: 14, color: blue, fontWeight: 800 }}>{m.tag}</span>
              )}
            </div>
          ))}
        </div>
        {chip && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                padding: '6px 16px',
                borderRadius: 999,
                background: '#fbd9b8',
                border: `2px solid ${ink}`,
              }}
            >
              有新訊息 ↓
            </span>
          </div>
        )}
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
      {keyboard && (
        <div
          style={{
            height: 190,
            background: '#e2dbcf',
            borderTop: `2px solid ${line}`,
            padding: 10,
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 6,
            flexShrink: 0,
          }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 5, height: 36 }} />
          ))}
          <div style={{ gridColumn: '3 / 9', background: '#fff', borderRadius: 5, height: 36 }} />
        </div>
      )}
    </div>
  </div>
);

const PhoneCap = ({ n, title, children, tone = ink }: { n: string; title: string; children?: ReactNode; tone?: string }) => (
  <div style={{ marginTop: 22, width: 340 }}>
    <div style={{ fontSize: 26, fontWeight: 900, color: tone }}>
      <span style={{ fontFamily: mono, color: 'var(--osd-accent)', marginRight: 10 }}>{n}</span>
      {title}
    </div>
    {children && <div style={{ fontSize: 21, color: muted, marginTop: 6, lineHeight: 1.45 }}>{children}</div>}
  </div>
);

// 一段對話（最舊在前），畫成手機時依 anchor 擺放
const chat = (n: number, from = 1): Msg[] =>
  Array.from({ length: n }, (_, i) => {
    const k = from + i;
    return { t: `第 ${k} 則訊息`, mine: k % 3 === 0 };
  });

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

const SituationRow = ({ when, ask }: { when: ReactNode; ask?: boolean }) => (
  <>
    <div style={{ fontSize: 27, padding: '16px 22px', borderTop: `2px solid ${line}`, lineHeight: 1.4 }}>{when}</div>
    <div
      style={{
        fontSize: 30,
        fontWeight: 900,
        padding: '16px 22px',
        borderTop: `2px solid ${line}`,
        borderLeft: `2px solid ${line}`,
        color: ask ? 'var(--osd-accent)' : muted,
        fontFamily: mono,
      }}
    >
      ？
    </div>
  </>
);

const BuildCard = ({
  code,
  count,
  unit,
  note,
  tone,
}: {
  code: ReactNode;
  count: string;
  unit: string;
  note: string;
  tone: string;
}) => (
  <div
    style={{
      flex: 1,
      background: panel,
      border: `2.5px solid ${ink}`,
      boxShadow: `8px 8px 0 ${line}`,
      borderTop: `10px solid ${tone}`,
      borderRadius: 'var(--osd-radius)',
      padding: '28px 32px 32px',
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 800, lineHeight: 1.4, minHeight: 68 }}>{code}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 18 }}>
      <span style={{ fontFamily: mono, fontSize: 72, fontWeight: 900, color: tone }}>{count}</span>
      <span style={{ fontSize: 26, fontWeight: 800 }}>{unit}</span>
    </div>
    <div style={{ fontSize: 25, color: muted, marginTop: 12, lineHeight: 1.5 }}>{note}</div>
  </div>
);

// 疊圖層：後一格整個蓋在前一格上（手機背景不透明），用來做「一格一格」的畫面變化
const Layer = ({ children }: { children: ReactNode }) => (
  <div style={{ position: 'absolute', left: 0, top: 0 }}>{children}</div>
);

// 列表虛擬化的長條：1000 則壓成 60 格，綠色 = 目前建好的 widget
type StripMode = 'none' | 'a' | 'b';
const CELLS = 60;
const cx0 = (i: number) => 20 + i * 27.5;
const VirtualStrip = ({ mode }: { mode: StripMode }) => {
  const built = (i: number) => (mode === 'a' ? i < 10 : mode === 'b' ? i >= 6 && i < 16 : false);
  const recycled = (i: number) => mode === 'b' && i < 6;
  const label =
    mode === 'none'
      ? '1000 則資料都在 List 裡，但 widget 一個都還沒建'
      : mode === 'a'
        ? '進房：畫面上看得到的 + 緩衝區，只建這十幾個'
        : '往上捲：前面一路建新的，捲出緩衝區的回收';
  return (
    <svg width="1680" height="140" viewBox="0 0 1680 140" style={{ display: 'block', background: 'var(--osd-bg)' }}>
      <text x="20" y="30" fontSize="20" fontWeight="800" fill={muted} fontFamily={mono}>
        index 0（最新）
      </text>
      <text x="1660" y="30" fontSize="20" fontWeight="800" fill={muted} fontFamily={mono} textAnchor="end">
        index 999
      </text>
      {Array.from({ length: CELLS }, (_, i) => (
        <rect
          key={i}
          x={cx0(i)}
          y="46"
          width="22"
          height="44"
          rx="5"
          fill={built(i) ? '#d6ecd9' : recycled(i) ? '#ece6da' : panel}
          stroke={built(i) ? green : recycled(i) ? grey : line}
          strokeWidth={built(i) ? 2.5 : 2}
          strokeDasharray={recycled(i) ? '4 4' : undefined}
        />
      ))}
      <text x="20" y="128" fontSize="24" fontWeight="800" fill={mode === 'none' ? muted : ink}>
        {label}
      </text>
      {mode === 'b' && (
        <text x={cx0(0)} y="128" dx="640" fontSize="22" fontWeight="700" fill={grey}>
          虛線 = 已回收
        </text>
      )}
    </svg>
  );
};

// ═════════════ 頁面 ═════════════

const Cover: Page = () => (
  <div style={fill}>
    <TopBar section="封面" />
    <div style={{ position: 'absolute', left: 120, top: 220, width: 1000 }}>
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
        反轉列表 UI
      </h1>
      <p style={{ fontSize: 36, color: muted, margin: 0 }}>讓聊天室從底部長出來，像 LINE 一樣</p>
      <div style={{ display: 'flex', gap: 14, marginTop: 56 }}>
        <Pill tint={panel}>Bottom-anchored</Pill>
        <Pill tint={panel}>reverse: true</Pill>
        <Pill tint={panel}>List Virtualization</Pill>
      </div>
    </div>
    <div style={{ position: 'absolute', right: 160, top: 160, display: 'flex', gap: 40 }}>
      <Phone anchor="bottom" msgs={chat(12)} h={820} w={380} keyboard />
    </div>
  </div>
);

const Scenario: Page = () => (
  <Shell section="開場" title="設計師來找你">
    <Bubble who="設計" role="設計師">
      「進聊天室的時候畫面會<b style={{ color: 'var(--osd-accent)' }}>閃一下</b>，打字時最新的訊息還
      <b style={{ color: 'var(--osd-accent)' }}>被鍵盤擋住</b>。我要像 LINE 一樣。」
    </Bubble>
    <Card style={{ marginTop: 56 }}>
      <div style={{ fontSize: 24, color: muted, marginBottom: 14 }}>今天下課前要做到</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Steps>
          <Step>
            <Goal n="01">進聊天室直接停在最底部，不閃</Goal>
          </Step>
          <Step>
            <Goal n="02">鍵盤彈起時，最新的訊息跟著往上推</Goal>
          </Step>
          <Step>
            <Goal n="03">講師灌 1000 則訊息，還是滑得很順</Goal>
          </Step>
          <Step>
            <Goal n="04">
              <span style={{ color: muted }}>（設計師說等一下還有一個需求……）</span>
            </Goal>
          </Step>
        </Steps>
      </div>
    </Card>
  </Shell>
);

const Evolution: Page = () => (
  <Shell section="能力演進表" title="表還是一樣，今天整理畫面" sub="這堂不會打掉 ✗。表上的事情要靠資料，今天先把「看起來的樣子」做對。">
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
  <BigQuestion tag="上堂的問題" tagColor="#f7d9d6" foot="提示：打開 LINE，看看新訊息是從畫面哪一邊長出來的。">
    狂傳 20 句之後，
    <br />
    最新那一句跑去哪了？
  </BigQuestion>
);

const Pain: Page = () => (
  <Shell
    section="痛點"
    title="現在的聊天頁：先畫在頂端，再跳到底"
    sub={
      <>
        starter 用一般 <Kw>ListView</Kw>，每次有新資料就在下一幀 <Kw>jumpTo(maxScrollExtent)</Kw>。
      </>
    }
  >
    <div style={{ display: 'flex', gap: 90, justifyContent: 'center' }}>
      <div>
        <Phone anchor="top" msgs={chat(14)} h={540} />
        <PhoneCap n="①" title="第一幀：停在最上面">看到的是最舊的訊息</PhoneCap>
      </div>
      <Steps>
        <Step>
          <div>
            <Phone anchor="bottom" msgs={chat(14)} h={540} />
            <PhoneCap n="②" title="下一幀：跳到底" tone={red}>
              ① → ② 這一下，就是「閃」
            </PhoneCap>
          </div>
        </Step>
        <Step>
          <div>
            <Phone anchor="bottom" msgs={chat(14)} shift={94} h={540} keyboard />
            <PhoneCap n="③" title="鍵盤彈起" tone={red}>
              最新的幾則被擠到看不到的地方
            </PhoneCap>
          </div>
        </Step>
      </Steps>
    </div>
  </Shell>
);

const Anchored: Page = () => (
  <Shell section="觀念" title="從哪一邊長出來？" sub="內容貼著哪一邊、新東西從哪一邊出現，決定了這個列表該怎麼寫。">
    <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
        <Phone anchor="top" msgs={chat(4)} h={560} />
        <div style={{ width: 330, paddingTop: 20 }}>
          <Pill tint="#dde9fb">Top-anchored</Pill>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 22 }}>貼著上面</div>
          <div style={{ fontSize: 26, color: muted, marginTop: 12, lineHeight: 1.55 }}>
            文章、設定頁、商品列表。
            <br />
            打開時從第一筆開始看。
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
        <Phone anchor="bottom" msgs={chat(4)} h={560} />
        <div style={{ width: 330, paddingTop: 20 }}>
          <Pill tint="#fbd9b8">Bottom-anchored</Pill>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 22 }}>貼著下面</div>
          <div style={{ fontSize: 26, color: muted, marginTop: 12, lineHeight: 1.55 }}>
            聊天室、終端機、留言串。
            <br />
            最新的貼著輸入框，舊的往上推。
          </div>
        </div>
      </div>
    </div>
  </Shell>
);

const reversedMsgs: Msg[] = [
  { t: '第 8 則', tag: 'index 6' },
  { t: '第 9 則', mine: true, tag: 'index 5' },
  { t: '第 10 則', tag: 'index 4' },
  { t: '第 11 則', tag: 'index 3' },
  { t: '第 12 則', mine: true, tag: 'index 2' },
  { t: '第 13 則', tag: 'index 1' },
  { t: '第 14 則（最新）', tag: 'index 0', hot: true },
];

const beforeNew: Msg[] = [
  { t: '第 7 則', tag: 'index 6' },
  { t: '第 8 則', tag: 'index 5' },
  { t: '第 9 則', mine: true, tag: 'index 4' },
  { t: '第 10 則', tag: 'index 3' },
  { t: '第 11 則', tag: 'index 2' },
  { t: '第 12 則', mine: true, tag: 'index 1' },
  { t: '第 13 則', tag: 'index 0' },
];

const Reverse: Page = () => (
  <Shell
    section="觀念"
    title={
      <>
        <Kw>reverse: true</Kw> 把整個列表倒過來
      </>
    }
    sub="不是把資料倒過來，是把「從哪裡開始畫」倒過來。"
  >
    <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', width: 380 }}>
          <Phone anchor="bottom" msgs={beforeNew} h={560} w={380} />
          <Steps>
            <Step>
              <Layer>
                <Phone anchor="bottom" msgs={reversedMsgs} h={560} w={380} />
              </Layer>
              <div style={{ fontSize: 22, color: muted, marginTop: 18, lineHeight: 1.45 }}>
                <b style={{ color: ink }}>第 14 則進來</b> → 變成 index 0 → 畫在最底下，其他每則往上推一格
              </div>
            </Step>
          </Steps>
        </div>
        <Steps>
          <Step>
            <svg width="120" height="560" viewBox="0 0 120 560" style={{ display: 'block' }}>
              <defs>
                <marker id="rvA" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
                  <path d="M0,0 L12,6 L0,12 z" fill={ink} />
                </marker>
              </defs>
              <line x1="30" y1="480" x2="30" y2="110" stroke={ink} strokeWidth="3" markerEnd="url(#rvA)" />
              <circle cx="30" cy="488" r="9" fill="var(--osd-accent)" stroke={ink} strokeWidth="2.5" />
              <text x="48" y="495" fontSize="22" fontWeight="800" fill={ink} fontFamily={mono}>
                0
              </text>
              <text x="4" y="40" fontSize="20" fontWeight="800" fill={muted}>
                offset
              </text>
              <text x="10" y="70" fontSize="20" fontWeight="800" fill={muted}>
                變大
              </text>
            </svg>
          </Step>
        </Steps>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Steps>
          <Step>
            <Card>
              <div style={{ fontSize: 32, fontWeight: 900 }}>index 0 畫在最底下</div>
              <div style={{ fontSize: 26, color: muted, marginTop: 10, lineHeight: 1.5 }}>
                <Kw>ChatController</Kw> 給的本來就是「最新在前」，第 0 筆就是最新的那則。
              </div>
            </Card>
          </Step>
          <Step>
            <Card>
              <div style={{ fontSize: 32, fontWeight: 900 }}>捲動的起點也在最底下</div>
              <div style={{ fontSize: 26, color: muted, marginTop: 10, lineHeight: 1.5 }}>
                一打開就是 offset 0，也就是最底部。往上翻舊訊息，offset 才變大。
              </div>
            </Card>
          </Step>
          <Step>
            <WhyBox q="想一想：那 starter 裡的 .reversed 和 jumpTo，還需要嗎？" />
          </Step>
        </Steps>
      </div>
    </div>
  </Shell>
);

const Keyboard: Page = () => (
  <Shell section="觀念" title="鍵盤彈起：可以看的高度變矮了" sub="Scaffold 會把 body 縮短，讓出鍵盤的位置。列表的 offset 不變，差別在 offset 從哪一邊算。">
    <div style={{ display: 'flex', gap: 120, justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 30 }}>
        <div>
          <Phone anchor="top" msgs={chat(14)} shift={146} h={520} />
          <PhoneCap n="①" title="一般 ListView">鍵盤收起</PhoneCap>
        </div>
        <Steps>
          <Step>
            <div>
              <Phone anchor="top" msgs={chat(14)} shift={146} h={520} keyboard />
              <PhoneCap n="②" title="鍵盤彈起" tone={red}>
                viewport 變矮，上緣不動，最新的被切掉
              </PhoneCap>
            </div>
          </Step>
        </Steps>
      </div>
      <div style={{ display: 'flex', gap: 30 }}>
        <Steps>
          <Step>
            <div>
              <Phone anchor="bottom" msgs={reversedMsgs.map((m) => ({ ...m, tag: undefined }))} h={520} />
              <PhoneCap n="③" title="reverse: true">鍵盤收起</PhoneCap>
            </div>
          </Step>
          <Step>
            <div>
              <Phone anchor="bottom" msgs={reversedMsgs.map((m) => ({ ...m, tag: undefined }))} h={520} keyboard />
              <PhoneCap n="④" title="鍵盤彈起" tone={green}>
                viewport 變矮，下緣不動，最新的被推上去
              </PhoneCap>
            </div>
          </Step>
        </Steps>
      </div>
    </div>
  </Shell>
);

const Virtualize: Page = () => (
  <Shell section="觀念" title="1000 則訊息，要建幾個氣泡？" sub="列表虛擬化：只為畫面上看得到的（再多一點緩衝）建 widget，捲走的回收。">
    <div style={{ display: 'flex', gap: 40 }}>
      <BuildCard
        code={
          <>
            SingleChildScrollView
            <br />+ Column
          </>
        }
        count="1000"
        unit="個全部建好、排版"
        note="一進房就把 1000 個氣泡量一遍，越多越卡。"
        tone={red}
      />
      <Steps>
        <Step>
          <BuildCard
            code={<>ListView(children: [...])</>}
            count="1000"
            unit="個 widget 先 new 好"
            note="排版只做看得到的，但清單裡每一個都要先建出來。"
            tone={amber}
          />
        </Step>
        <Step>
          <BuildCard
            code={<>ListView.builder</>}
            count="十幾"
            unit="個，捲到哪建到哪"
            note="用 itemBuilder 現做現用。數量看螢幕高度，跟總則數無關。"
            tone={green}
          />
        </Step>
      </Steps>
    </div>
    <div style={{ position: 'relative', marginTop: 30 }}>
      <VirtualStrip mode="none" />
      <Steps>
        <Step>
          <Layer>
            <VirtualStrip mode="a" />
          </Layer>
        </Step>
        <Step>
          <Layer>
            <VirtualStrip mode="b" />
          </Layer>
        </Step>
      </Steps>
    </div>
    <Card style={{ marginTop: 24 }}>
      <div style={{ fontSize: 28, lineHeight: 1.6 }}>
        驗收時講師會灌 1000 則，請打開效能圖層（<Kw>showPerformanceOverlay</Kw> 或 DevTools）看看捲動時有沒有紅色的長條。
      </div>
    </Card>
  </Shell>
);

const ImplA: Page = () => (
  <Shell
    section="實作"
    title="TODO ①② 把列表倒過來"
    sub={
      <>
        只改 <Kw>ui/chat_page.dart</Kw>。<Kw>ChatController</Kw> 一行都不用動。
      </>
    }
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
      <Todo n="1" title={<>改用 <Kw>ListView.builder(reverse: true)</Kw></>}>
        <Hint>資料本來就是最新在前。改完之後，哪幾行程式可以刪掉？</Hint>
      </Todo>
      <Todo n="2" title={<>用 <Kw>_scroll</Kw> 判斷「現在是不是在最底部」</>}>
        <Hint>
          reverse 之後，最底部的 offset 是多少？
          <br />
          一定要剛好等於那個數字才算在底部嗎？用手指滑一下，想想看。
        </Hint>
      </Todo>
    </div>
  </Shell>
);

const MoreReq: Page = () => (
  <Shell section="追加需求" title="設計師又來了">
    <div style={{ display: 'flex', gap: 70, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Bubble who="設計" role="設計師">
          「我往上翻在看舊訊息，有人傳訊息進來，<b style={{ color: 'var(--osd-accent)' }}>不要把我拉走</b>。給我一個提示就好。」
        </Bubble>
        <Steps>
          <Step>
            <div
              style={{
                marginTop: 40,
                display: 'grid',
                gridTemplateColumns: '1fr 300px',
                border: `2.5px solid ${ink}`,
                borderRadius: 'var(--osd-radius)',
                overflow: 'hidden',
                background: panel,
              }}
            >
              <ColHead>新訊息進來的時候……</ColHead>
              <ColHead focus>畫面該怎麼做？</ColHead>
              <SituationRow when="我停在最底部，夥伴傳來一則" />
              <SituationRow when="我往上翻在看舊的，夥伴傳來一則" ask />
              <SituationRow when="是我自己按了送出" ask />
              <SituationRow when="剛進房，第一批訊息到了" />
              <SituationRow when="提示出現後，我自己滑回最底部" ask />
            </div>
          </Step>
        </Steps>
      </div>
      <div style={{ position: 'relative', width: 340 }}>
        <Steps>
          <Step>
            <Phone anchor="bottom" shift={260} msgs={chat(24)} h={560} />
            <PhoneCap n="①" title="我往上翻在看舊的" />
          </Step>
          <Step>
            <Layer>
              <Phone anchor="bottom" shift={260} msgs={chat(25)} h={560} chip />
            </Layer>
            <PhoneCap n="②" title="夥伴傳來一則" tone={red}>
              不會被拉回最底部，只出現提示（長怎樣、放哪裡由你決定）
            </PhoneCap>
          </Step>
        </Steps>
      </div>
    </div>
  </Shell>
);

const ImplB: Page = () => (
  <Shell section="實作" title="TODO ③④ 不要把人拉走">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Todo n="✓" title="①② 反轉列表、判斷在不在底部" done />
      <Todo n="3" title="往上翻時有新訊息：不拉回去，顯示「有新訊息 ↓」">
        <Hint>
          提示元件和顯示 / 隱藏邏輯都自己寫。它要疊在列表的哪裡？
          <br />
          怎麼知道「這次的資料裡有新訊息」，而不只是畫面重畫了一次？
        </Hint>
      </Todo>
      <Todo n="4" title="點提示，或自己送出訊息 → 捲回最底部">
        <Hint>
          <Kw>jumpTo</Kw> 和 <Kw>animateTo</Kw> 都可以，使用者的感覺有什麼不一樣？
        </Hint>
      </Todo>
    </div>
  </Shell>
);

const Acceptance: Page = () => (
  <Shell section="驗收" title="這幾項都過了，就可以收工">
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Check>進房直接停在最底部，不會閃</Check>
        <Check>鍵盤彈起時，列表跟著往上推，最新訊息沒有被擋住</Check>
        <Check>往上翻時夥伴傳訊息，不會被拉回最底部，只出現提示</Check>
        <Check>點提示或自己送出訊息後，回到最底部</Check>
        <Check>講師灌 1000 則，打開效能圖層，捲動仍然順暢</Check>
      </div>
    </Card>
  </Shell>
);

const Feynman: Page = () => (
  <Shell section="費曼檢核" title="不看螢幕，講給隔壁聽" sub="兩人一組，一人一分鐘。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Card>
        <Goal n="Q1">一般 ListView 進聊天室，為什麼會閃一下？</Goal>
      </Card>
      <Card>
        <Goal n="Q2">改成 reverse 之後，為什麼鍵盤彈起不用另外處理？</Goal>
      </Card>
      <Card>
        <Goal n="Q3">灌了 1000 則訊息，ListView.builder 大概建了幾個氣泡？為什麼？</Goal>
      </Card>
    </div>
  </Shell>
);

const Think: Page = () => (
  <Shell section="講師補充" title="先想想，再聽講師說" sub="這兩題要一點 Flutter 的底層知識，想不出來很正常。">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Card>
        <Goal n="Q4">往上翻的時候有新訊息插進來，眼前的訊息會不會跟著動？怎麼讓它不動？</Goal>
      </Card>
      <Card>
        <Goal n="Q5">聊天室裡有很多手機拍的大圖，記憶體怎麼省？</Goal>
      </Card>
    </div>
  </Shell>
);

const ExtraShift: Page = () => (
  <Shell section="講師補充" title="插入訊息時，畫面不要跳" sub="Layout Shift：你正在看的那一則，被新加進來的東西擠走。">
    <div style={{ display: 'flex', gap: 70, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 30 }}>
        <div>
          <Phone anchor="bottom" shift={200} msgs={chat(20).map((m, i) => (i === 9 ? { ...m, hot: true } : m))} h={520} />
          <PhoneCap n="前" title="正在看第 10 則" />
        </div>
        <Steps>
          <Step>
            <div>
              <Phone
                anchor="bottom"
                shift={200}
                msgs={chat(21).map((m, i) => (i === 9 ? { ...m, hot: true } : m))}
                h={520}
              />
              <PhoneCap n="後" title="進來一則，第 10 則被推走" tone={red} />
            </div>
          </Step>
        </Steps>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Steps>
          <Step>
            <Card>
              <div style={{ fontSize: 30, fontWeight: 900 }}>
                <Kw>CustomScrollView</Kw> + <Kw>center</Kw>
              </div>
              <div style={{ fontSize: 26, color: muted, marginTop: 12, lineHeight: 1.55 }}>
                指定一個 sliver 當錨點（offset 0 的位置）。錨點前面的 sliver 往上長，後面的往下長。
              </div>
            </Card>
          </Step>
          <Step>
            <Card>
              <div style={{ fontSize: 26, lineHeight: 1.7 }}>
                舊訊息放一個 <Kw>SliverList</Kw>，往上長
                <br />
                新訊息放另一個 <Kw>SliverList</Kw>，往下長
                <br />
                兩邊各自變長，錨點不動，眼前那則就不會跳
              </div>
            </Card>
            <div style={{ fontSize: 24, color: muted, marginTop: 26 }}>第 9 堂「進房定位到第一則未讀」會用到同一招。</div>
          </Step>
        </Steps>
      </div>
    </div>
  </Shell>
);

const ExtraImage: Page = () => (
  <Shell section="講師補充" title="大圖：照畫面大小解碼就好" sub="圖片在記憶體裡是「寬 × 高 × 4 bytes」，跟檔案大小（JPEG 壓縮過）是兩回事。">
    <div style={{ display: 'flex', gap: 24 }}>
      <Metric label="手機拍的照片" value="4000 × 3000" bar={ink} />
      <Steps>
        <Step>
          <Metric label="原尺寸解碼" value="約 48 MB" bar={red} />
        </Step>
        <Step>
          <Metric label="氣泡裡只顯示" value="寬 240" bar={blue} />
        </Step>
        <Step>
          <Metric label="3 倍螢幕解成 720 寬" value="約 1.6 MB" bar={green} />
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ display: 'flex', gap: 40, marginTop: 44, alignItems: 'stretch' }}>
          <div style={{ flex: 1.2 }}>
            <Code size={28}>{`Image.network(
  url,
  width: 240,
  // 照實際要顯示的像素解碼
  cacheWidth: (240 *
      MediaQuery.devicePixelRatioOf(context))
      .round(),
)`}</Code>
          </div>
          <Card style={{ flex: 1 }}>
            <div style={{ fontSize: 28, lineHeight: 1.65 }}>
              只給 <Kw>cacheWidth</Kw>，高度會照比例算。
              <br />
              列表裡幾十張大圖，差距就是幾十倍的記憶體。
              <br />
              <span style={{ color: muted }}>捲出畫面的圖，還會被 Flutter 的圖片快取留著一陣子。</span>
            </div>
          </Card>
        </div>
      </Step>
    </Steps>
  </Shell>
);

const Hook: Page = () => (
  <div style={fill}>
    <TopBar section="下集預告" />
    <div style={{ position: 'absolute', left: 120, right: 120, top: 180 }}>
      <Pill tint="#f7d9d6">講師打開「全域延遲 2 秒」</Pill>
      <h2 style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.3, margin: '32px 0 0' }}>
        自己按了送出，
        <br />
        為什麼要等 2 秒才看到？
      </h2>
      <div style={{ display: 'flex', gap: 32, marginTop: 56 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 22, color: muted }}>LINE 在網路很慢的時候</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>按下去，訊息就秒出現</div>
        </Card>
        <Card style={{ flex: 1, background: '#fdf0e3' }}>
          <div style={{ fontSize: 22, color: muted }}>它是怎麼做到的？</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>下一堂：樂觀更新 + ACK</div>
        </Card>
      </div>
    </div>
  </div>
);

// ═════════════ 講稿 ═════════════

export const notes: (string | undefined)[] = [
  // 1 Cover
  `開場前儀表板狀態（課前對一次）
□ 行為等級：回音（儀表板上方「行為等級」按鈕）
□ 全域延遲：0 ms（結尾鉤子才設 2000）
□ 分房：兩兩一組（「分房」區；驗收要跟夥伴互傳，私人房看不到彼此，最晚驗收前切好；只搬在線學員）
□ 其他：驗收灌訊息用「房間」區選房 → 數量改 1000 → 灌訊息（新版儀表板才有「+1000」一鍵）。

【0:00】
上一堂結尾大家狂傳 20 句，最新的訊息被鍵盤擋住、畫面跳來跳去。今天不碰連線，只處理畫面：讓聊天室像 LINE 一樣從底部長出來。這種從底部長出來的列表，業界叫 Bottom-anchored（底部錨定）。
Server 維持「回音」等級，跟第 1、2 堂一樣。

術語
・Bottom-anchored（底部錨定）`,

  // 2 Scenario
  `【0–2 分】
今天來找你的是設計師。兩個抱怨：進房會閃、打字時最新訊息被鍵盤擋住。畫面跳一下、不順的感覺，工程師統稱 Jank（卡頓）。
接著一條一條講今天的目標：
（→）01 進房直接停在最底部，不閃。
（→）02 鍵盤彈起時，最新訊息跟著往上推。
（→）03 講師會灌 1000 則，還是要滑得順。
（→）04 先賣關子：設計師中途還會追加一個需求，到實作中段再揭曉（第 11 頁）。

術語
・Jank（卡頓）：畫面掉幀、跳動的統稱。`,

  // 3 Evolution
  `【2–3 分】
表上的 ✗ 今天一個都不會少，因為表上講的都是「資料從哪來」，今天處理的是「資料怎麼畫」。
但第 6 堂往上滑載入舊訊息、第 9 堂跳到第一則未讀，都建立在今天的反轉列表上。`,

  // 4 Recap
  `【3–4 分】回顧提問
問：「狂傳 20 句之後，最新那句跑去哪了？」先讓學員想 10 秒。
（→）出現提示：「打開 LINE 看看，新訊息從哪一邊長出來？」讓學員實際打開手機上的聊天 App 看。

參考答案：從底部長出來，最新的永遠貼著輸入框。輸入框就是這個列表的 Anchor（錨點）：內容貼著它，從它往上長。我們的 App 卻是從頂端開始畫，再硬跳到底，所以會閃，鍵盤一彈起最新的就被擋住。

術語
・Anchor（錨點）`,

  // 5 Pain
  `【4–5 分】痛點演示
現場用兩台模擬器示範 starter：進房那一下會先看到最上面再跳到底；點輸入框，鍵盤彈起，最新幾則被擋住。
① 第一幀：ListView 預設 offset 0 在最上面，看到的是最舊的。
（→）② addPostFrameCallback 裡 jumpTo(maxScrollExtent)，下一幀才跳到底。中間那一幀就是閃。
（→）③ 鍵盤彈起，可視高度變矮，但 offset 沒變，所以底部的訊息被切掉。

可能被問到
問：那進房時不要用 jumpTo，改用 animateTo 呢？
答：只是從「閃」變成「滑」，第一幀還是在頂端。而且 ListView.builder 的 maxScrollExtent 是用已經排版過的項目估出來的，訊息高度不一時，一次 jumpTo 不一定真的到底。根本解是讓「底部」成為起點。`,

  // 6 Anchored
  `【5–8 分】觀念
兩種列表：Top-anchored 貼著上面長，像文章、設定頁；Bottom-anchored 貼著下面長，像聊天室、終端機。
重點句：聊天室的「起點」在底部。只要起點對了，進房不用跳、鍵盤不用處理。

術語
・Top-anchored / Bottom-anchored（頂部錨定 / 底部錨定）`,

  // 7 Reverse
  `【8–12 分】
reverse: true 不是把資料倒過來，是把捲動方向倒過來。先看手機：現在最新的是第 13 則，它是 index 0，畫在最底下。
（→）Server 透過 WebSocket 推來第 14 則，ChatController 把它放到 List 最前面，Stream 送出新的 List。第 14 則變成 index 0，reverse 列表把它畫在最底下，其他每則的 index 加一、往上推一格。
（→）右邊這根軸是捲動位置：offset 0 就是最底部，往上翻 offset 才變大。這個數字叫 Scroll Offset（捲動位置），意思是「從起點捲了多遠」。
（→）重點一：ChatController 的 Stream 本來就是「最新在前」，所以直接畫，第 0 筆就是最新的那則。第 5 堂換成 DB 的 ORDER BY seq DESC，順序也一樣，UI 不用改。
（→）重點二：一打開就是 offset 0，也就是最底部。訊息少於一個畫面時，也會貼著底部，不會飄在頂端。

（→）學員提問「.reversed 和 jumpTo 還需要嗎？」
參考答案：都不需要。資料不用反轉；一打開就是 offset 0，本來就在底部，不用跳。

術語
・Scroll Offset（捲動位置）
・Scroll Direction / AxisDirection（捲動方向）

可能被問到
問：reverse 之後，往上滑到「頂」是什麼？
答：是 maxScrollExtent，也就是最舊的訊息。第 6 堂「快滑到頂就載入更舊的」，判斷的就是這一邊。`,

  // 8 Keyboard
  `【12–15 分】
鍵盤佔掉的那塊，Flutter 叫 View Insets（被系統 UI 蓋住的區域）。鍵盤彈起時，Scaffold（resizeToAvoidBottomInset 預設 true）把 body 變矮，列表的 Viewport（可視區域，也就是看得到內容的那個框）跟著變小。列表的 offset 數字不變，差別在 offset 從哪一邊量。
先看左邊第一支：一般 ListView，鍵盤還沒彈起，停在最底部。
（→）使用者點輸入框，鍵盤彈起：viewport 變矮。一般 ListView 的 offset 從上面量，上緣不動，底下被切掉，最新的看不到。
（→）換成 reverse 列表，一樣先是鍵盤收起的樣子。
（→）鍵盤彈起，viewport 一樣變矮。reverse 的 offset 從下面量，下緣不動，等於整個列表被推上去，最新的還在輸入框上面。
這就是為什麼改成 reverse 之後，鍵盤完全不用另外寫程式。

術語
・Viewport（可視區域）
・View Insets（系統 UI 佔掉的區域，例如鍵盤）

可能被問到
問：鍵盤彈起時，如果我正在往上翻舊訊息呢？
答：offset 不變，你看的那幾則一樣會被往上推，但相對位置不變，不會被拉回底部。`,

  // 9 Virtualize
  `【15–20 分】
先講名詞：只為看得到的項目建 widget，捲走的回收，叫 List Virtualization（列表虛擬化），也叫 windowing。
三種寫法：
・SingleChildScrollView + Column：1000 個氣泡全部建立、全部排版，一進房就卡。
（→）・ListView(children: [...])：排版是捲到才做，但 children 這個 List 已經把 1000 個 widget 先建好了。
（→）・ListView.builder：用 itemBuilder 捲到哪建到哪，這叫 Lazy Building（延遲建立），要用到才建。數量看螢幕高度和 cacheExtent（預設前後各多建 250 邏輯像素的緩衝），跟總數無關。
所以聊天室一定用 builder。
下面這條是 1000 則訊息壓成 60 格，左邊是 index 0。一開始資料全在 List 裡，但 widget 一個都還沒建。
（→）進房：builder 只替畫面上看得到的、加上緩衝區的那十幾則呼叫 itemBuilder，綠色的就是建好的 widget。
（→）往上捲：前面要出現的一路建起來，捲出緩衝區的被回收（虛線）。任何時候活著的 widget 都只有十幾個。
效能圖層：MaterialApp 的 showPerformanceOverlay: true，或 DevTools 的 Performance。上面一條是 raster（GPU）執行緒、下面一條是 UI 執行緒，出現紅色長條代表那一幀超過 16ms。60Hz 螢幕每秒 60 幀，每幀時間預算（Frame Budget）只有約 16ms，超過就會掉幀。

術語
・List Virtualization / Windowing（列表虛擬化）
・Lazy Building（延遲建立）
・cacheExtent（預先建立的緩衝區）
・Frame Budget（每幀時間預算，60Hz 約 16ms）

可能被問到
問：ListView.builder 捲走的 widget 會被回收嗎？
答：捲出 cacheExtent 外的項目會被移除，State 也跟著消失。所以氣泡裡如果有輸入中的狀態，要放在外面，或用 AutomaticKeepAliveClientMixin。
問：要不要給 itemExtent / prototypeItem？
答：高度固定時給它，可以省掉量高度的成本。聊天氣泡高度不一，通常不給。`,

  // 10 ImplA
  `【20–32 分】實作
只改 ui/chat_page.dart。
① ListView.builder(reverse: true)。
提問：「改完之後哪幾行可以刪？」
參考答案：.reversed.toList() 和 addPostFrameCallback(_jumpToBottom) 都刪掉。starter 那個 _jumpToBottom 本身也可以刪。
② 判斷在不在底部。starter 裡的 _scroll 是一個 ScrollController，它知道列表現在捲到哪、也能叫列表捲過去。
提問：「最底部的 offset 是多少？一定要剛好等於嗎？」
參考答案：最底部是 offset 0。不要用 == 0，手指輕輕一碰、或回彈都會有幾個像素的誤差，要給一個門檻，例如 offset < 60 就當作在底部。也要先檢查 _scroll.hasClients，列表還沒建好時 offset 會丟例外。

術語
・ScrollController
・Threshold（門檻）`,

  // 11 MoreReq
  `【32–35 分】追加需求
設計師追加：往上翻時有人傳訊息，不要把我拉走，給提示就好。
（→）出現表格：五種情況，畫面各該怎麼做？讓學員先兩人一組填表 2 分鐘，再對答案。
（→）對完答案後看設計稿第一格：我往上翻在看舊訊息，畫面停在中間。
（→）夥伴傳來一則：Server 推給我的 App，Stream 多了一則，但不會被拉回最底部，只在底部亮「有新訊息 ↓」。眼前的訊息會往上移一則的高度，這是 reverse 列表的正常現象，不是寫錯，講師補充頁會講怎麼讓它完全不動。提示長怎樣、放哪裡由學員自己決定，這是 TODO ③ 要寫的元件。

參考答案
・我在最底部，夥伴傳來一則 → 什麼都不用做，reverse 列表會讓它自然出現在底部。
・我往上翻，夥伴傳來一則 → 不會被拉回最底部，只出現提示「有新訊息 ↓」（眼前的訊息會往上移一格，正常）。
・是我自己按了送出 → 捲回最底部，不顯示提示（自己傳的不算「新訊息」）。
・剛進房，第一批訊息到了 → 停在底部，不顯示提示。
・提示出現後自己滑回最底部 → 提示消失。

可能被問到
問：要不要顯示「有 3 則新訊息」的數量？
答：可以，算法是記住提示出現時最新那則，之後每多一則加一。課堂上先做到有提示就好。`,

  // 12 ImplB
  `【35–50 分】
③ 參考做法（不要投影給學員看）：
・記住上一次看到的最新那則訊息 _newest。Stream 每次給新 List 時，比較 list.first 是不是同一則。StreamBuilder 的 builder 在任何 setState 時都會重跑，不能每次重畫都當成有新訊息。
・第一次載入、自己送的、或在底部時，都不亮提示；其餘才把 _hasUnseen 設成 true。
・在 builder 裡不能直接 setState，要放到 addPostFrameCallback（或改用 stream.listen）。
・提示用 Stack + Positioned 疊在列表底部中間，例如 ActionChip。
・_scroll.addListener 裡，回到底部就把提示關掉。
④ 點提示或送出時 animateTo(0)。
參考答案（jumpTo vs animateTo）：jumpTo 是瞬間移動，距離遠時使用者會失去方向感；animateTo 有過程，看得出是「回到底部」。但離底部幾千則時，animateTo 要經過大量項目，可以先 jumpTo 到接近底部再 animateTo 一小段。

可能被問到
問：為什麼不在 ChatController 裡判斷要不要顯示提示？
答：「在不在底部」是畫面狀態，跟訊息資料無關。Controller 只管資料，提示屬於 UI 的狀態，放在 State 裡。`,

  // 13 Acceptance
  `【50–55 分】驗收
兩兩一組互傳。往上翻時讓夥伴傳，看提示有沒有出來、有沒有被拉回最底部。眼前的訊息往上移一則是正常的，驗收只看「不會被拉回最底部，只出現提示」。
講師在儀表板灌 1000 則：房間區選房 → 數量改 1000 → 灌訊息（預設是 300，要手改；新版儀表板有「+1000」一鍵）。學員打開效能圖層快速捲動。
提醒：灌 1000 則時，所有在房間裡的人都會收到，記憶體 List 會變很大，這也是第 5、6 堂要處理的事。`,

  // 14 Feynman
  `【55–56 分】費曼檢核

參考答案
Q1：一般 ListView 的起點在頂端，第一幀先畫出最舊的訊息，下一幀才 jumpTo 到底，中間那一幀就是閃。
Q2：reverse 之後 offset 從底部量。鍵盤讓可視區域變矮時，下緣不動，最新的訊息被往上推，不用自己算。
Q3：十幾個，看螢幕高度加上 cacheExtent 的緩衝。builder 只建看得到的，跟總共 1000 則無關。`,

  // 15 Think
  `【56–57 分】講師補充前先想想
讓學員想 30 秒就好，這兩題要知道 Flutter 的 sliver 和圖片解碼才答得出來，接下來兩頁講師直接講。`,

  // 16 ExtraShift
  `【57–58 分】講師補充：Layout Shift
今天做完的 reverse 列表有一個小問題。左邊是正在看第 10 則的畫面。
（→）往上翻時新訊息進來，offset 從底部算、數字不變，所以底下多了一則，眼前所有訊息都會往上跳一格。訊息越長跳越多。
（→）解法是 CustomScrollView center key：給某個 sliver 一個 Key，再把這個 key 傳給 CustomScrollView 的 center 參數，這個 sliver 就是 offset 0 的錨點，錨點前面的 sliver 往反方向長，後面的往正方向長。（→）把舊訊息和新訊息分成兩個 SliverList，新訊息加在一邊、舊訊息加在另一邊，錨點不動，眼前那則就不動。
這個概念叫 Scroll Anchoring（捲動錨定）：內容變動時，讓使用者正在看的地方固定不動。瀏覽器的 CSS 也有 overflow-anchor 在做同一件事。
第 9 堂「進房停在第一則未讀」也是同一招：把錨點放在第一則未讀。

術語
・Layout Shift（版面位移）
・Sliver / SliverList
・CustomScrollView center key
・Scroll Anchoring（捲動錨定，瀏覽器 CSS 也有 overflow-anchor）

可能被問到
問：那為什麼今天不直接用 center？
答：寫法比較複雜，要自己維護兩個 List 和錨點。先把 reverse 的觀念弄懂，第 9 堂需要定位時再換。
問：往上載入舊訊息會不會也跳？
答：reverse 列表裡，舊訊息加在「頂端」（offset 比較大的那邊），offset 從底部量，所以眼前的不會動。這也是聊天室常用 reverse 的原因之一。`,

  // 17 ExtraImage
  `【58–59 分】講師補充：圖片降採樣
手機拍的照片是 4000×3000。
（→）原尺寸解碼，記憶體裡是 4000 × 3000 × 4 bytes（RGBA）= 48,000,000 bytes，約 48 MB，跟 JPEG 檔案大小無關。
（→）但氣泡裡只顯示寬 240 邏輯像素。
（→）devicePixelRatio（裝置像素比）是一個邏輯像素對應幾個實體像素，3 倍螢幕就是 720 實體像素，解成 720×540 只要約 1.6 MB。
（→）程式怎麼寫：Image 的 cacheWidth / cacheHeight 會讓引擎在解碼時就縮小（底層是 ResizeImage）。只給一邊，另一邊照比例。
解碼好的圖會放進 ImageCache（Flutter 的圖片記憶體快取），捲出畫面也不會馬上釋放，所以解碼尺寸小，快取佔的記憶體也跟著小。

術語
・Decode（解碼）
・Downsampling（降採樣）
・devicePixelRatio（裝置像素比）
・ImageCache（Flutter 的圖片記憶體快取）

可能被問到
問：伺服器直接給縮圖不是更好？
答：對，正式產品會兩個都做：Server 或 CDN 給不同尺寸的縮圖省流量，App 端 cacheWidth 省記憶體。點開看大圖時才載原圖。
問：ImageCache 要不要調？
答：PaintingBinding.instance.imageCache 可以設 maximumSize / maximumSizeBytes。先用 cacheWidth，通常就夠了。`,

  // 18 Hook
  `【結尾鉤子】
講師在儀表板打開「全域延遲」，設成 2 秒（2000 ms）。請學員送一則訊息：自己的訊息要等 2 秒才出現，因為現在是「回音」等級，要等 Server 回送才畫出來。
問：「LINE 網路慢的時候，為什麼按下去就秒出現？」不給答案，帶出下一堂的樂觀更新。
結尾鉤子設 2 秒延遲；下課時可以先關回 0，但第 4 堂開場要再打開 2 秒，第 4 堂的開場示範要靠這 2 秒延遲。

講師自己複習（面試關鍵字，不用講給學員）
・Bottom-anchored vs Top-anchored：列表的起點在底部還是頂部；聊天室用 reverse: true 讓 offset 0 = 最底部。
・Layout Shift：插入內容讓使用者正在看的東西被推走；用 CustomScrollView center 錨點避免。
・List Virtualization：只建立可視範圍（加緩衝）的項目，成本跟總數無關。`,
];

export const meta: SlideMeta = {
  title: '第 03 堂｜反轉列表 UI',
  createdAt: '2026-11-23T06:00:00.000Z',
};

export default [
  Cover,
  Scenario,
  Evolution,
  Recap,
  Pain,
  Anchored,
  Reverse,
  Keyboard,
  Virtualize,
  ImplA,
  MoreReq,
  ImplB,
  Acceptance,
  Feynman,
  Think,
  ExtraShift,
  ExtraImage,
  Hook,
] satisfies Page[];
