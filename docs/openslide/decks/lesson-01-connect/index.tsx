import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// Flutter 即時聊天室工作坊 · 第 1 堂：接通 + 收發（純字串 → JSON）
// 學員可見內容只放題目；參考答案與講稿放在 `notes`（講者備註）。
// ─────────────────────────────────────────────────────────────

export const design: DesignSystem = {
  palette: { bg: '#0d1117', text: '#e6edf3', accent: '#f5a524' },
  fonts: {
    display: '"PingFang TC", "Noto Sans TC", -apple-system, system-ui, sans-serif',
    body: '"PingFang TC", "Noto Sans TC", -apple-system, system-ui, sans-serif',
  },
  typeScale: { hero: 150, body: 36 },
  radius: 16,
};

const LESSON_NO = '01';
const LESSON_TITLE = '接通 + 收發';
const muted = '#8b949e';
const panel = '#161b22';
const line = '#30363d';
const green = '#3fb950';
const red = '#f85149';
const blue = '#58a6ff';
const mono = '"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace';

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  position: 'relative',
  boxSizing: 'border-box',
};

// ───────────── 共用元件 ─────────────

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 40,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 22,
        color: muted,
        letterSpacing: '0.04em',
      }}
    >
      <span>
        Flutter 即時聊天室工作坊 · 第 {LESSON_NO} 堂 · {LESSON_TITLE}
      </span>
      <span style={{ fontFamily: mono }}>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

const Frame = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) => (
  <div style={{ ...fill, padding: '100px 120px 110px' }}>
    <div style={{ fontSize: 26, color: 'var(--osd-accent)', letterSpacing: '0.16em', fontWeight: 600 }}>
      {eyebrow}
    </div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 800,
        margin: '14px 0 0',
        lineHeight: 1.2,
      }}
    >
      {title}
    </h2>
    <div style={{ marginTop: 48 }}>{children}</div>
    <Footer />
  </div>
);

const Code = ({ children, size = 28 }: { children: ReactNode; size?: number }) => (
  <pre
    style={{
      fontFamily: mono,
      fontSize: size,
      lineHeight: 1.5,
      background: panel,
      border: `1px solid ${line}`,
      borderRadius: 'var(--osd-radius)',
      padding: '28px 36px',
      margin: 0,
      whiteSpace: 'pre',
      color: 'var(--osd-text)',
    }}
  >
    {children}
  </pre>
);

const Tag = ({ children, color = 'var(--osd-accent)' }: { children: ReactNode; color?: string }) => (
  <span
    style={{
      display: 'inline-block',
      alignSelf: 'flex-start',
      fontSize: 22,
      fontWeight: 700,
      color,
      border: `2px solid ${color}`,
      borderRadius: 999,
      padding: '4px 18px',
      letterSpacing: '0.06em',
    }}
  >
    {children}
  </span>
);

const Kw = ({ children }: { children: ReactNode }) => (
  <code style={{ fontFamily: mono, color: 'var(--osd-accent)', fontSize: '0.92em' }}>{children}</code>
);

// ───────────── 1. 封面 ─────────────

const Cover: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 160px',
    }}
  >
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <Tag>LESSON {LESSON_NO}</Tag>
      <Tag color={muted}>階段一 · 純 WebSocket</Tag>
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        fontWeight: 900,
        margin: '40px 0 24px',
        lineHeight: 1.1,
      }}
    >
      接通 + 收發
    </h1>
    <p style={{ fontSize: 44, color: muted, margin: 0 }}>
      從純字串到 JSON：打通你的第一通「不掛斷的電話」
    </p>
    <Footer />
  </div>
);

// ───────────── 2. 開場情境 ─────────────

const Bubble = ({ who, role, children }: { who: string; role: string; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
    <div
      style={{
        width: 104,
        height: 104,
        borderRadius: 999,
        background: 'var(--osd-accent)',
        color: '#0d1117',
        fontSize: 40,
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {who}
    </div>
    <div>
      <div style={{ fontSize: 26, color: muted, marginBottom: 12 }}>{role}</div>
      <div
        style={{
          background: panel,
          border: `1px solid ${line}`,
          borderRadius: '0 28px 28px 28px',
          padding: '28px 40px',
          fontSize: 42,
          lineHeight: 1.5,
          maxWidth: 1400,
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const Goal = ({ n, children }: { n: string; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', fontSize: 36, lineHeight: 1.5 }}>
    <span style={{ fontFamily: mono, color: 'var(--osd-accent)', fontWeight: 700 }}>{n}</span>
    <span>{children}</span>
  </div>
);

const Scenario: Page = () => (
  <Frame eyebrow="開場情境" title="PM 走過來說……">
    <Bubble who="PM" role="產品經理">
      「我們要做聊天功能。先做一個能<b style={{ color: 'var(--osd-accent)' }}>即時互傳</b>的
      MVP：我打字，對方馬上看到。」
    </Bubble>
    <div style={{ marginTop: 64, fontSize: 28, color: muted, letterSpacing: '0.12em' }}>本堂目標</div>
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Goal n="01">說得出輪詢、SSE、WebSocket 差在哪，以及為什麼聊天選 WebSocket</Goal>
      <Goal n="02">親手接通 WebSocket，完成收發，並從純字串升級成 JSON</Goal>
      <Goal n="03">離開頁面時正確關閉連線（Resource Disposal）</Goal>
    </div>
  </Frame>
);

// ───────────── 3. 能力演進表 ─────────────

type CellState = 'no' | 'yes' | 'partial';

const Cell = ({
  state,
  children,
  focus,
}: {
  state: CellState;
  children: ReactNode;
  focus?: boolean;
}) => {
  const color = state === 'yes' ? green : state === 'no' ? red : muted;
  return (
    <div
      style={{
        fontSize: 23,
        lineHeight: 1.4,
        padding: '14px 16px',
        color: focus ? 'var(--osd-text)' : color === muted ? muted : 'var(--osd-text)',
        background: focus ? 'rgba(245,165,36,0.12)' : 'transparent',
        borderTop: `1px solid ${line}`,
        borderLeft: focus ? '3px solid var(--osd-accent)' : `1px solid ${line}`,
        borderRight: focus ? '3px solid var(--osd-accent)' : 'none',
        opacity: focus ? 1 : 0.55,
      }}
    >
      <span style={{ color, fontWeight: 700, marginRight: 6 }}>
        {state === 'yes' ? '✅' : state === 'no' ? '❌' : '◐'}
      </span>
      {children}
    </div>
  );
};

const RowHead = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 26, fontWeight: 700, padding: '14px 16px', borderTop: `1px solid ${line}` }}>
    {children}
  </div>
);

const ColHead = ({ children, focus }: { children: ReactNode; focus?: boolean }) => (
  <div
    style={{
      fontSize: 24,
      fontWeight: 700,
      padding: '12px 16px',
      color: focus ? '#0d1117' : muted,
      background: focus ? 'var(--osd-accent)' : 'transparent',
      borderRadius: focus ? '12px 12px 0 0' : 0,
    }}
  >
    {children}
  </div>
);

const Evolution: Page = () => (
  <Frame eyebrow="能力演進表" title="我們從這裡出發：第 1～4 堂只有 WebSocket">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px repeat(5, 1fr)',
        border: `1px solid ${line}`,
        borderRadius: 'var(--osd-radius)',
        overflow: 'hidden',
      }}
    >
      <ColHead>情境</ColHead>
      <ColHead focus>第 1～4 堂 純 WS</ColHead>
      <ColHead>第 5 堂 +本地 DB</ColHead>
      <ColHead>第 6 堂 +歷史 API</ColHead>
      <ColHead>第 7 堂 +補洞</ColHead>
      <ColHead>第 8～9 堂</ColHead>

      <RowHead>剛進聊天室</RowHead>
      <Cell state="no" focus>空的，只看得到連上後的訊息</Cell>
      <Cell state="partial">看得到自己收過的</Cell>
      <Cell state="yes">載入最新一頁，往上滑載更早</Cell>
      <Cell state="yes">　</Cell>
      <Cell state="yes">未讀多時定位到第一則未讀</Cell>

      <RowHead>殺掉 App 重開</RowHead>
      <Cell state="no" focus>全部不見</Cell>
      <Cell state="yes">秒開不白屏</Cell>
      <Cell state="yes">　</Cell>
      <Cell state="yes">　</Cell>
      <Cell state="yes">　</Cell>

      <RowHead>斷線期間別人講的話</RowHead>
      <Cell state="no" focus>收不到</Cell>
      <Cell state="no">收不到</Cell>
      <Cell state="no">只能碰運氣往上滑撈到</Cell>
      <Cell state="yes">重連自動補齊</Cell>
      <Cell state="yes">　</Cell>

      <RowHead>新加入的人看舊對話</RowHead>
      <Cell state="no" focus>看不到</Cell>
      <Cell state="no">看不到</Cell>
      <Cell state="yes">看得到</Cell>
      <Cell state="yes">　</Cell>
      <Cell state="yes">　</Cell>

      <RowHead>有多個聊天室</RowHead>
      <Cell state="no" focus>只能被講師分配</Cell>
      <Cell state="no">　</Cell>
      <Cell state="no">　</Cell>
      <Cell state="no">　</Cell>
      <Cell state="yes">房間列表 + 未讀數</Cell>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 32 }}>
      今天先讓訊息「動起來」。這張表會跟著我們十堂課，每堂打掉一個 ❌。
    </p>
  </Frame>
);

// ───────────── 4. 開場提問 ─────────────

const OpeningQuestion: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 160px',
    }}
  >
    <Tag>先想一下</Tag>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 96,
        fontWeight: 900,
        lineHeight: 1.25,
        margin: '40px 0 0',
      }}
    >
      要做即時聊天，
      <br />
      你們以前會怎麼做？
    </h2>
    <p style={{ fontSize: 36, color: muted, marginTop: 40 }}>
      提示：你最熟的工具是 REST API。只用它，做得出「對方馬上看到」嗎？
    </p>
    <Footer />
  </div>
);

// ───────────── 5. 四種方式：打電話比喻 ─────────────

const LANE_L = 60;
const LANE_R = 300;

const Lanes = ({ children }: { children: ReactNode }) => (
  <svg width="360" height="300" viewBox="0 0 360 300" style={{ display: 'block' }}>
    <text x={LANE_L} y="22" fill={muted} fontSize="20" textAnchor="middle">App</text>
    <text x={LANE_R} y="22" fill={muted} fontSize="20" textAnchor="middle">Server</text>
    <line x1={LANE_L} y1="36" x2={LANE_L} y2="292" stroke={line} strokeWidth="3" />
    <line x1={LANE_R} y1="36" x2={LANE_R} y2="292" stroke={line} strokeWidth="3" />
    <defs>
      <marker id="hA" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#e6edf3" />
      </marker>
      <marker id="hB" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#f5a524" />
      </marker>
    </defs>
    {children}
  </svg>
);

const Req = ({ y, dashed, label }: { y: number; dashed?: boolean; label?: string }) => (
  <g>
    <line
      x1={LANE_L}
      y1={y}
      x2={LANE_R - 6}
      y2={y + 14}
      stroke="#e6edf3"
      strokeWidth="3"
      strokeDasharray={dashed ? '6 6' : undefined}
      markerEnd="url(#hA)"
    />
    {label && (
      <text x={(LANE_L + LANE_R) / 2} y={y - 2} fill="#e6edf3" fontSize="17" textAnchor="middle" fontFamily={mono}>
        {label}
      </text>
    )}
  </g>
);

const Res = ({ y, hot, label }: { y: number; hot?: boolean; label?: string }) => (
  <g>
    <line
      x1={LANE_R}
      y1={y}
      x2={LANE_L + 6}
      y2={y + 14}
      stroke={hot ? '#f5a524' : '#6e7681'}
      strokeWidth="3"
      markerEnd={hot ? 'url(#hB)' : 'url(#hA)'}
    />
    {label && (
      <text
        x={(LANE_L + LANE_R) / 2}
        y={y + 34}
        fill={hot ? '#f5a524' : muted}
        fontSize="17"
        textAnchor="middle"
      >
        {label}
      </text>
    )}
  </g>
);

const MethodCard = ({
  name,
  via,
  phone,
  verdict,
  verdictColor,
  diagram,
}: {
  name: string;
  via: string;
  phone: string;
  verdict: string;
  verdictColor: string;
  diagram: ReactNode;
}) => (
  <div
    style={{
      width: 396,
      height: 690,
      boxSizing: 'border-box',
      background: panel,
      border: `1px solid ${line}`,
      borderRadius: 'var(--osd-radius)',
      padding: '28px 18px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <div style={{ fontSize: 34, fontWeight: 800 }}>{name}</div>
    <div
      style={{
        marginTop: 10,
        fontSize: 22,
        fontFamily: mono,
        color: 'var(--osd-accent)',
        background: 'rgba(245,165,36,0.12)',
        borderRadius: 999,
        padding: '4px 16px',
      }}
    >
      {via}
    </div>
    <div style={{ fontSize: 26, color: muted, marginTop: 12, textAlign: 'center', lineHeight: 1.4, height: 74 }}>
      {phone}
    </div>
    <div style={{ marginTop: 12 }}>{diagram}</div>
    <div style={{ marginTop: 'auto', fontSize: 24, fontWeight: 700, color: verdictColor }}>{verdict}</div>
  </div>
);

const Methods: Page = () => (
  <Frame eyebrow="觀念 · 打電話比喻" title="「對方有新訊息」要怎麼讓 App 知道？">
    <div style={{ display: 'flex', gap: 32 }}>
      <Steps>
        <Step>
          <MethodCard
            name="短輪詢"
            via="HTTP API（REST）"
            phone="每 3 秒打一次電話：「到了沒？」「沒。」"
            verdict="浪費流量、有延遲"
            verdictColor={red}
            diagram={
              <Lanes>
                <Req y={62} label="GET /messages" />
                <Res y={76} label="沒有" />
                <Req y={150} label="GET /messages" />
                <Res y={164} label="沒有" />
                <Req y={238} label="GET /messages" />
                <Res y={252} hot label="有 1 則！" />
              </Lanes>
            }
          />
        </Step>
        <Step>
          <MethodCard
            name="長輪詢"
            via="HTTP API（REST）"
            phone="打過去，對方有消息才開口；講完掛斷再打"
            verdict="好一點，但一直重撥"
            verdictColor={muted}
            diagram={
              <Lanes>
                <Req y={62} label="GET /messages" />
                <rect x={LANE_R - 8} y={82} width="16" height="88" fill="#6e7681" rx="4" />
                <text x={LANE_R - 18} y={132} fill={muted} fontSize="17" textAnchor="end">先不回…</text>
                <Res y={170} hot label="有 1 則！" />
                <Req y={236} label="GET /messages" />
                <rect x={LANE_R - 8} y={256} width="16" height="34" fill="#6e7681" rx="4" />
              </Lanes>
            }
          />
        </Step>
        <Step>
          <MethodCard
            name="SSE"
            via="HTTP（一條不結束的回應）"
            phone="收聽廣播電台：一直有聲音，但你不能回話"
            verdict="單向：Server → App"
            verdictColor={muted}
            diagram={
              <Lanes>
                <Req y={62} label="GET /events" />
                <Res y={100} hot />
                <Res y={150} hot />
                <Res y={200} hot />
                <Res y={250} hot />
              </Lanes>
            }
          />
        </Step>
        <Step>
          <MethodCard
            name="WebSocket"
            via="ws://（接通後不是 HTTP）"
            phone="接通一通不掛斷的電話，雙方隨時都能說"
            verdict="全雙工 ✅ 聊天選它"
            verdictColor={green}
            diagram={
              <Lanes>
                <Req y={62} label="接通一次" />
                <Res y={80} />
                <Req y={150} />
                <Res y={178} hot />
                <Res y={222} hot />
                <Req y={252} />
              </Lanes>
            }
          />
        </Step>
      </Steps>
    </div>
  </Frame>
);

// ───────────── 6a. 先複習：HTTP 狀態碼 ─────────────

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
      background: highlight ? 'rgba(245,165,36,0.10)' : panel,
      border: highlight ? '3px solid var(--osd-accent)' : `1px solid ${line}`,
      borderRadius: 'var(--osd-radius)',
      padding: '40px 40px 44px',
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 96, fontWeight: 800, color, lineHeight: 1 }}>{code}</div>
    <div style={{ fontFamily: mono, fontSize: 26, color: muted, marginTop: 16 }}>{name}</div>
    <div style={{ fontSize: 36, marginTop: 24, lineHeight: 1.4 }}>{meaning}</div>
  </div>
);

const StatusCodes: Page = () => (
  <Frame eyebrow="觀念 · 先複習" title="HTTP 狀態碼：你一定看過 200 和 404">
    <div style={{ display: 'flex', gap: 36 }}>
      <StatusCard code="200" name="OK" meaning="成功，資料給你" color={green} />
      <StatusCard code="404" name="Not Found" meaning="找不到這個東西" color={red} />
      <StatusCard
        code="101"
        name="Switching Protocols"
        meaning="好，我們換一種方式講話"
        color="var(--osd-accent)"
        highlight
      />
    </div>
    <p style={{ fontSize: 34, color: muted, marginTop: 56, lineHeight: 1.6 }}>
      平常打 API 很少看到 1xx。今天的主角就是 <Kw>101</Kw>：
      <br />
      App 用 HTTP 問「可以改用 WebSocket 嗎？」，Server 回 101 就是「可以」。
    </p>
  </Frame>
);

// ───────────── 6b. 握手流程 ─────────────

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
      <div style={{ fontSize: 32, fontWeight: 700, color, textAlign: 'center', marginBottom: 12 }}>{label}</div>
      <div style={{ position: 'relative', height: 4, background: color, margin: '0 4px' }}>
        {(dir === 'right' || dir === 'both') && head('r')}
        {(dir === 'left' || dir === 'both') && head('l')}
      </div>
      {sub && (
        <div style={{ fontSize: 24, color: muted, textAlign: 'center', marginTop: 12, fontFamily: mono }}>
          {sub}
        </div>
      )}
    </div>
  );
};

const HsRow = ({ phone, children }: { phone: string; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', alignItems: 'center', height: 150 }}>
    <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--osd-accent)' }}>{phone}</div>
    <div style={{ padding: '0 120px' }}>{children}</div>
  </div>
);

const Actor = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      width: 240,
      textAlign: 'center',
      fontSize: 28,
      fontWeight: 700,
      padding: '14px 0',
      border: `2px solid ${line}`,
      borderRadius: 12,
      background: panel,
    }}
  >
    {children}
  </div>
);

const Handshake: Page = () => (
  <Frame eyebrow="觀念 · 握手流程" title="先用 HTTP 打過去，接通後換成 WebSocket">
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', marginBottom: 8 }}>
        <div />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Actor>Flutter App</Actor>
          <Actor>Server</Actor>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 360, top: 66, bottom: 0, width: 3, background: line }} />
      <div style={{ position: 'absolute', right: 120, top: 66, bottom: 0, width: 3, background: line }} />
      <Steps>
        <Step>
          <HsRow phone="① 撥號">
            <Arrow
              dir="right"
              color="#e6edf3"
              label="「我想改用 WebSocket 講話」"
              sub="一個普通的 HTTP GET，多帶 Upgrade: websocket"
            />
          </HsRow>
        </Step>
        <Step>
          <HsRow phone="② 對方接起">
            <Arrow dir="left" color="var(--osd-accent)" label="「好，換頻道」" sub="101 Switching Protocols" />
          </HsRow>
        </Step>
        <Step>
          <HsRow phone="③ 通話中">
            <Arrow dir="both" color={green} label="雙方隨時都能送訊息" sub="同一條連線，不用再發 HTTP 請求" />
          </HsRow>
        </Step>
        <Step>
          <HsRow phone="④ 掛斷">
            <Arrow dir="right" color={muted} label="任一方說「掛了」" sub="Close" />
          </HsRow>
        </Step>
      </Steps>
    </div>
  </Frame>
);

// ───────────── 7. curl 現場示範 ─────────────

const CurlDemo: Page = () => (
  <Frame eyebrow="講師示範 · 1 分鐘" title={<>用 curl 親眼看到 <Kw>101</Kw></>}>
    <Steps>
      <Code size={30}>
        {`curl -i -N \\
  -H "Connection: Upgrade" \\
  -H "Upgrade: websocket" \\
  -H "Sec-WebSocket-Version: 13" \\
  -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \\
  "http://localhost:8080/ws?user=curl"`}
      </Code>
      <Step>
        <div style={{ marginTop: 36 }}>
          <Code size={30}>
            <span style={{ color: 'var(--osd-accent)' }}>HTTP/1.1 101 Switching Protocols</span>
            {`
upgrade: websocket
connection: Upgrade
sec-websocket-accept: …`}
          </Code>
          <p style={{ fontSize: 30, color: muted, marginTop: 28 }}>
            看到 101 就是「接通了」；指令停住不結束，代表這通電話一直沒掛。
          </p>
        </div>
      </Step>
    </Steps>
  </Frame>
);

// ───────────── 8. ws:// vs wss:// ─────────────

const SchemeCard = ({
  scheme,
  like,
  phone,
  color,
}: {
  scheme: string;
  like: string;
  phone: string;
  color: string;
}) => (
  <div
    style={{
      flex: 1,
      background: panel,
      border: `2px solid ${color}`,
      borderRadius: 'var(--osd-radius)',
      padding: '48px 56px',
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 72, fontWeight: 800, color }}>{scheme}</div>
    <div style={{ fontSize: 36, marginTop: 24 }}>
      ≈ <span style={{ fontFamily: mono }}>{like}</span>
    </div>
    <div style={{ fontSize: 32, color: muted, marginTop: 20 }}>{phone}</div>
  </div>
);

const Scheme: Page = () => (
  <Frame eyebrow="觀念" title="ws:// 與 wss://">
    <div style={{ display: 'flex', gap: 48 }}>
      <SchemeCard scheme="ws://" like="http://（明文）" phone="一般電話：線路上的人都聽得到" color={muted} />
      <SchemeCard scheme="wss://" like="https://（TLS 加密）" phone="加密電話：只有通話雙方聽得懂" color={green} />
    </div>
    <p style={{ fontSize: 34, color: muted, marginTop: 56, lineHeight: 1.6 }}>
      課堂用 <Kw>ws://localhost:8080</Kw> 方便觀察。正式環境為什麼一定要 <Kw>wss://</Kw>？
      <br />
      先記著，下課前講師補充。
    </p>
  </Frame>
);

// ───────────── 9. 實作 ①② ─────────────

const Todo = ({
  n,
  title,
  children,
  done,
}: {
  n: string;
  title: ReactNode;
  children?: ReactNode;
  done?: boolean;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '84px 1fr',
      gap: 24,
      alignItems: 'start',
      opacity: done ? 0.45 : 1,
    }}
  >
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: 999,
        border: '3px solid var(--osd-accent)',
        color: 'var(--osd-accent)',
        fontSize: 36,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {n}
    </div>
    <div>
      <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.4, paddingTop: 8 }}>{title}</div>
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  </div>
);

const ImplA: Page = () => (
  <Frame eyebrow="實作 · 私人房 · 兩台模擬器" title="TODO ①②：先接通，再送純字串">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
      <Todo n="1" title={<>在 <Kw>ChatController</Kw> 建立連線</>}>
        <Code size={26}>{`WebSocketChannel.connect(Uri.parse('ws://<host>:8080/ws?user=$me'))`}</Code>
      </Todo>
      <Todo n="2" title={<>用 <Kw>sink.add</Kw> 送出純字串；<Kw>stream.listen</Kw> 收到就顯示</>}>
        <div style={{ fontSize: 30, color: muted, lineHeight: 1.6 }}>
          收到的東西塞進記憶體 List，經 <Kw>Stream&lt;List&lt;Message&gt;&gt;</Kw> 推給 UI（最新在前，
          <Kw>StreamBuilder</Kw> 已接好）
        </div>
      </Todo>
    </div>
    <p style={{ fontSize: 30, color: muted, marginTop: 56 }}>
      ✋ 兩台模擬器互傳成功的人舉手，然後看看畫面——你發現什麼問題？
    </p>
  </Frame>
);

// ───────────── 10. 中途追加：純字串 → JSON ─────────────

const Midway: Page = () => (
  <Frame eyebrow="中途追加" title="PM 又走過來了">
    <Bubble who="PM" role="產品經理">
      「訊息要顯示<b style={{ color: 'var(--osd-accent)' }}>是誰傳的</b>。」
    </Bubble>
    <div style={{ display: 'flex', gap: 48, marginTop: 56 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 28, color: red, fontWeight: 700, marginBottom: 16 }}>現在：純字串</div>
        <Code size={30}>{`"嗨"`}</Code>
        <ul style={{ fontSize: 30, color: muted, lineHeight: 1.7, marginTop: 24, paddingLeft: 36 }}>
          <li>分不出是誰講的</li>
          <li>分不出這是訊息，還是別種事件</li>
        </ul>
      </div>
      <div style={{ flex: 1.3 }}>
        <div style={{ fontSize: 28, color: green, fontWeight: 700, marginBottom: 16 }}>升級：JSON</div>
        <Code size={30}>{`{
  "type": "message",
  "sender": "Amy",
  "text": "嗨"
}`}</Code>
      </div>
    </div>
  </Frame>
);

// ───────────── 11. 實作 ③④ ─────────────

const ImplB: Page = () => (
  <Frame eyebrow="實作" title="TODO ③④：升級 JSON，並收好連線">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
      <Todo n="✓" title="①② 接通、純字串收發（剛剛完成）" done />
      <Todo n="3" title={<>送出改 <Kw>jsonEncode</Kw>；收到先 <Kw>jsonDecode</Kw>，依 <Kw>type</Kw> 分派</>}>
        <div style={{ fontSize: 30, color: muted, lineHeight: 1.6 }}>
          <Kw>type == "message"</Kw> 才轉成 <Kw>Message</Kw>（sender / text / ts）放進列表
        </div>
      </Todo>
      <Todo n="4" title={<><Kw>dispose</Kw> 收尾：取消訂閱、關閉連線</>}>
        <div style={{ fontSize: 30, color: muted, lineHeight: 1.6 }}>
          離開聊天頁卻沒關？想想打完電話不掛斷會怎樣。
        </div>
      </Todo>
    </div>
  </Frame>
);

// ───────────── 12. 驗收 ─────────────

const Check = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', fontSize: 36, lineHeight: 1.5 }}>
    <span
      style={{
        width: 36,
        height: 36,
        border: `3px solid ${green}`,
        borderRadius: 8,
        flexShrink: 0,
        transform: 'translateY(6px)',
      }}
    />
    <span>{children}</span>
  </div>
);

const Acceptance: Page = () => (
  <Frame eyebrow="驗收" title="做到這些就過關">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <Check>私人房兩台模擬器互傳，對方「馬上」看到</Check>
      <Check>每則訊息都顯示傳送者名字</Check>
      <Check>
        收到的 JSON 依 <Kw>type</Kw> 處理，不是 <Kw>message</Kw> 的事件不會被當成訊息顯示
      </Check>
      <Check>離開聊天頁後，講師儀表板上你的連線會消失</Check>
      <Check>大廳時刻：全班切到大廳，互傳成功</Check>
    </div>
  </Frame>
);

// ───────────── 13. 費曼檢核 ─────────────

const Feynman: Page = () => (
  <Frame eyebrow="費曼檢核 · 兩人一組" title="不看螢幕，講給鄰座聽">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, marginTop: 16 }}>
      <Goal n="Q1">用「打電話」比喻，30 秒說完短輪詢、長輪詢、SSE、WebSocket 的差別</Goal>
      <Goal n="Q2">WebSocket 連線是怎麼「接通」的？101 代表什麼？</Goal>
      <Goal n="Q3">為什麼一開始的純字串不夠用？</Goal>
    </div>
  </Frame>
);

// ───────────── 14–15. 講師補充 ─────────────

const Point = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  <div
    style={{
      background: panel,
      border: `1px solid ${line}`,
      borderLeft: '6px solid var(--osd-accent)',
      borderRadius: 12,
      padding: '24px 32px',
    }}
  >
    <div style={{ fontSize: 34, fontWeight: 700 }}>{title}</div>
    <div style={{ fontSize: 28, color: muted, marginTop: 10, lineHeight: 1.5 }}>{children}</div>
  </div>
);

const ExtraAuth: Page = () => (
  <Frame eyebrow="講師補充 · 1 / 2" title="WebSocket 怎麼帶登入身分？">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Point title={<>App 首選：握手時放在 header（跟打 API 一樣）</>}>
        <span style={{ fontFamily: mono, fontSize: 26 }}>
          IOWebSocketChannel.connect(uri, headers: {'{'}'Authorization': 'Bearer $token'{'}'})
        </span>
      </Point>
      <Point title={<>或：連上後第一則先送 <Kw>{'{"type":"auth"}'}</Kw></>}>
        Server 驗證通過前不處理其他訊息，逾時就斷線
      </Point>
      <Point title={<>不能設 header 時才放網址：<Kw>/ws?token=…</Kw></>}>
        瀏覽器（含 Flutter Web）的 WebSocket 不能自訂 header；網址會被寫進 log → 用短效 token
      </Point>
    </div>
    <p style={{ fontSize: 28, color: muted, marginTop: 32 }}>
      課堂的 <Kw>?user=名字</Kw> 只是「報上名字」，沒有驗證——正式環境不能這樣做。
    </p>
  </Frame>
);

const ExtraWss: Page = () => (
  <Frame eyebrow="講師補充 · 2 / 2" title="為什麼正式環境一定要 wss://？">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Point title="內容與 token 不再裸奔">
        公共 Wi-Fi 上，ws:// 的每則訊息、握手帶的 token 都能被旁人看到甚至竄改
      </Point>
      <Point title="比較不會被中間設備弄斷">
        Proxy、防火牆看不懂明文 Upgrade 時可能擋掉；走 443 + TLS 它們看不到內容，只能放行
      </Point>
      <Point title="平台預設就不准明文">
        iOS ATS、Android 9+ 預設封鎖明文流量；用 ws:// 上架前還得特別開例外
      </Point>
    </div>
  </Frame>
);

// ───────────── 16. 面試關鍵字 ─────────────

const KeywordChip = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: 40,
      fontWeight: 700,
      padding: '28px 40px',
      background: panel,
      border: `1px solid ${line}`,
      borderRadius: 'var(--osd-radius)',
    }}
  >
    {children}
  </div>
);

const Keywords: Page = () => (
  <Frame eyebrow="面試關鍵字" title="今天你應該能講清楚的四個詞">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
      <KeywordChip>Full-duplex</KeywordChip>
      <KeywordChip>HTTP Upgrade (101)</KeywordChip>
      <KeywordChip>Polling vs SSE vs WebSocket</KeywordChip>
      <KeywordChip>Resource Disposal</KeywordChip>
    </div>
  </Frame>
);

// ───────────── 17. 結尾鉤子 ─────────────

const Hook: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 160px',
    }}
  >
    <Tag color={red}>/zombie</Tag>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 92,
        fontWeight: 900,
        lineHeight: 1.25,
        margin: '40px 0 0',
      }}
    >
      畫面一切正常，
      <br />
      為什麼就是收不到訊息？
    </h2>
    <p style={{ fontSize: 36, color: muted, marginTop: 48 }}>
      下一堂：<span style={{ color: blue }}>心跳 + 自動重連</span>——打電話時，你怎麼知道對方還在線上？
    </p>
    <Footer />
  </div>
);

// ───────────── 講者備註（講師版：含參考答案） ─────────────

export const notes: (string | undefined)[] = [
  // 1 Cover
  `【時間 0:00】歡迎。這 10 堂從一條純 WebSocket 開始，一路做到 LINE 等級的聊天室架構。
今天只有一件事：讓訊息「動起來」。`,
  // 2 Scenario
  `【0–5 分】念出 PM 的需求，強調「即時」兩個字。
三個目標唸過即可，下課前回來對照。`,
  // 3 Evolution
  `這張表會在每堂開場出現。指著第一欄：第 1～4 堂我們只有 WebSocket，所以剛進房是空的、重開 App 全不見——這些都是「刻意」先不做的。
今天不會打掉表上的 ❌，今天是把地基打好：讓訊息能即時送到。`,
  // 4 Opening question
  `【開場提問】讓學員講 1 分鐘。
預期答案：「一直打 API 問有沒有新訊息」（短輪詢）。
接話：「很好，那我們就從『一直打電話問』這個方法開始，看看它的問題在哪。」`,
  // 5 Methods
  `【5–20 分】按 → 一張一張揭開。先指每張卡片標題下的橘色標籤：前兩種就是學員熟悉的「打 REST API」，只是打的方式不同；SSE 也還是 HTTP；只有 WebSocket 接通後不再是 HTTP。
每張都用打電話比喻講：
・短輪詢：每 3 秒打電話問「到了沒」，99% 的電話都是「沒」→ 浪費流量、電量，而且最多晚 3 秒才知道。
・長輪詢：打過去對方先不回，有消息才開口；講完就掛，要再撥一次 → 延遲低了，但每則訊息都要重建一次 HTTP 請求。
・SSE：像收聽廣播，Server 可以一直推，但 App 要回話得另外打電話（另一個 HTTP 請求）→ 單向。
・WebSocket：接通一次不掛斷，雙方隨時都能說 → 全雙工（Full-duplex），聊天的標準解。
面試加分：SSE 適合股價、通知這種單向推送；WebSocket 適合雙向互動。`,
  // 6a StatusCodes
  `先問：「打 API 最常看到哪些狀態碼？」學員會答 200、404、500。
接著指 101：1xx 是「資訊性」回應，平常幾乎不會遇到。101 Switching Protocols 的意思是「Server 同意換一種協議繼續講」。
比喻：打客服總機（HTTP）說「請幫我轉接專線」，總機回「好，幫你轉接」（101），之後你就直接跟專線講話（WebSocket）。`,
  // 6b Handshake
  `逐步揭開四行，主標是白話，下面小字才是技術名詞：
① App 發一個普通的 HTTP GET，只是多帶 Upgrade: websocket（還有 Connection: Upgrade、Sec-WebSocket-Key），意思是「我想改用 WebSocket」。
② Server 回 101 Switching Protocols：「好，換頻道」。（進階：回應裡的 Sec-WebSocket-Accept 是用 Key 算出來的，證明對方真的懂 WebSocket。學員問到再講。）
③ 之後在同一條連線上直接送訊息，不用每次重新發 HTTP 請求，所以快又省。
④ 任一方送 Close 就掛斷。
重點句：「WebSocket 是用 HTTP 撥號，接通後就不是 HTTP 了。」`,
  // 7 Curl
  `【現場示範】在終端機貼上指令（Server 已在 8080 跑）。先按 → 只顯示指令，跑完再揭開結果對照。
-i 顯示回應 header，-N 不緩衝，連線會停住不結束 → 這就是「電話沒掛」。Ctrl+C 結束。
user=curl 避免跟學員撞名（同名已在線會被拒絕）。`,
  // 8 Scheme
  `只講對照：ws 對 http、wss 對 https。
「為什麼正式環境一定要 wss」先賣關子，留到結尾講師補充。`,
  // 9 ImplA
  `【20–50 分 實作開始】講師在儀表板把每人分到私人房，各自開兩台模擬器（兩個名字）。
①：用 web_socket_channel 連線，網址帶 ?user=名字。Android 模擬器 host 要用 10.0.2.2（config.dart 已處理）。
②：先送純字串，listen 收到就加到 List 並推 Stream。
等多數人互傳成功，問「你發現什麼問題？」→ 帶出下一頁。
預期學員發現：兩邊都顯示「嗨」，看不出是誰講的。`,
  // 10 Midway
  `【中途追加】用 PM 的口吻唸出需求。
讓學員自己說出純字串的兩個問題：分不出誰講的、分不出事件種類（之後還會有 ack、ping/pong、read…）。
業界做法：所有 WS 訊息都是有 type 的 JSON envelope，收到後先看 type 再分派。
欄位以當天 Server 協議為準，這堂只用 type / sender / text。`,
  // 11 ImplB
  `③：jsonEncode 送出、jsonDecode 解析，switch type。
④：dispose 時 cancel StreamSubscription，再 sink.close()。
參考答案：不關閉 → Server 以為你還在線、Socket 與 Timer 持續佔用資源；重複進出頁面會累積多條連線，同一則訊息收到好幾次。`,
  // 12 Acceptance
  `【50–60 分 大廳時刻】驗收前四項後，講師在儀表板把全班切到大廳，大家互傳。
用儀表板確認每個人離開聊天頁後連線有消失。`,
  // 13 Feynman
  `兩兩互講，每人 1 分鐘。抽 1～2 組講給全班聽。
參考答案：
Q1：短輪詢 = 一直打電話問；長輪詢 = 打過去等對方開口，講完掛斷再打；SSE = 聽廣播，只能聽不能回；WebSocket = 不掛斷的電話，雙向隨時說。
Q2：先發 HTTP GET 帶 Upgrade: websocket，Server 回 101 Switching Protocols 同意換協議，之後在同一條 TCP 連線上傳 Frame。
Q3：分不出傳送者、分不出事件種類 → 需要有 type 的結構化格式。`,
  // 14 ExtraAuth
  `【講師補充，約 1 分鐘】
・App 首選 header：握手就是一個 HTTP 請求，所以跟打 REST API 一樣把 token 放在 Authorization header。web_socket_channel 用 IOWebSocketChannel.connect(uri, headers: {...})（package:web_socket_channel/io.dart）。
・第一則 auth 訊息：可以順便帶裝置資訊；Server 端要設逾時，未驗證的連線不能收到任何廣播。
・Query token：只有瀏覽器（含 Flutter Web）不能自訂 header 時才用。注意 Nginx / CDN access log 會記錄完整網址，所以 token 要短效（例如 60 秒內有效、用過即失效）。
・Token 過期：連線中途過期時，Server 可以送事件要求重新驗證，或直接斷線讓 App 拿新 token 重連（第 2 堂的重連會用到）。
・課堂為了簡單，全程用 ?user=名字，沒有驗證，這部分不會實作。`,
  // 15 ExtraWss
  `【講師補充，約 1 分鐘】三點：
1. 安全：明文會被看到、被竄改（中間人攻擊）。
2. 穿透率：很多企業 proxy、電信設備只認得 HTTP，看到 Upgrade 會擋或亂改；TLS 包起來後它們看不到內容，走 443 埠也最不容易被封。
3. 平台政策：iOS App Transport Security、Android 9 起的 cleartextTrafficPermitted=false 預設禁止明文連線。
課堂用 ws:// 是為了能用 curl / 抓包看清楚內容。`,
  // 16 Keywords
  `每個詞請一位學員用一句話解釋，講不出來的就是今晚要複習的。`,
  // 17 Hook
  `【結尾鉤子】講師在儀表板對一位學員下 /zombie（例如 /zombie Amy）。
請其他人傳訊息：Amy 的畫面看起來完全正常、沒有斷線提示，但就是收不到。
問全班「為什麼？App 怎麼不知道自己斷了？」不給答案，留到第 2 堂。
（講師心裡的答案：TCP 連線可能假死，App 不主動確認就不會知道 → 心跳 ping/pong。）`,
];

export const meta: SlideMeta = {
  title: '第 01 堂｜接通 + 收發',
  createdAt: '2026-11-23T03:09:29.193Z',
};

export default [
  Cover,
  Scenario,
  Evolution,
  OpeningQuestion,
  Methods,
  StatusCodes,
  Handshake,
  CurlDemo,
  Scheme,
  ImplA,
  Midway,
  ImplB,
  Acceptance,
  Feynman,
  ExtraAuth,
  ExtraWss,
  Keywords,
  Hook,
] satisfies Page[];
