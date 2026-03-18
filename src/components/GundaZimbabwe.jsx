"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from "recharts";

// ─── ZIMBABWE PALETTE ──────────────────────────────────────────
const Z = {
  bg:        "#080c08",       // near-black with green tint
  surface:   "#0d140d",       // dark green surface
  panel:     "#111a0f",       // slightly lighter panel
  border:    "#1e3318",       // forest green border
  green:     "#2d7a2d",       // zimbabwe deep forest green
  greenBr:   "#4caf50",       // bright green accent
  greenLt:   "#81c784",       // light green
  gold:      "#d4a017",       // zimbabwe gold/yellow
  goldBr:    "#ffd54f",       // bright gold
  red:       "#c62828",       // zimbabwe red
  redBr:     "#ef5350",       // bright red
  black:     "#0a0a0a",
  white:     "#f5f5e8",       // warm white (ivory)
  stone:     "#8a9e7a",       // muted sage
  muted:     "#4a6440",       // muted green text
  chevron:   "#1a2b17",       // Great Zimbabwe chevron color
};

// ─── GREAT ZIMBABWE CHEVRON SVG PATTERN ─────────────────────
const CHEVRON_PATTERN = `
  <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'>
    <path d='M0 20 L10 10 L20 20 L30 10 L40 20' stroke='${Z.chevron}' stroke-width='1.5' fill='none'/>
    <path d='M0 30 L10 20 L20 30 L30 20 L40 30' stroke='${Z.chevron}' stroke-width='1.5' fill='none'/>
  </svg>
`;
const CHEVRON_BG = `url("data:image/svg+xml,${encodeURIComponent(CHEVRON_PATTERN)}")`;

// ─── ATHLETE MOCK DATA ─────────────────────────────────────────
const ATHLETES = [
  { id:"ZIM001", name:"Takudzwa Moyo",   sport:"Athletics", pos:"Sprinter",    stage:"Predictive",    readiness:87, fatigue:18, risk:11, acwr:1.18, acwrStatus:"normal",    trend:"improving",  trendDelta:3.2,  sessions7d:5, wellness:{ sleep:8, fatigue:2, soreness:3, stress:2, mood:9 }, history:45, flags:[] },
  { id:"ZIM002", name:"Tafadzwa Ncube",  sport:"Football",  pos:"Midfielder",  stage:"Personalised",  readiness:72, fatigue:44, risk:29, acwr:1.34, acwrStatus:"elevated",  trend:"stable",     trendDelta:-0.8, sessions7d:6, wellness:{ sleep:6, fatigue:6, soreness:5, stress:5, mood:6 }, history:28, flags:["match_soon"] },
  { id:"ZIM003", name:"Chiedza Mutasa",  sport:"Athletics", pos:"Mid Distance", stage:"Contextual",   readiness:51, fatigue:61, risk:48, acwr:1.52, acwrStatus:"high_risk", trend:"declining",  trendDelta:-8.4, sessions7d:7, wellness:{ sleep:5, fatigue:7, soreness:8, stress:6, mood:4 }, history:14, flags:["travel","stress"] },
  { id:"ZIM004", name:"Tatenda Mhare",   sport:"Football",  pos:"Centre-Back", stage:"Personalised",  readiness:39, fatigue:73, risk:67, acwr:1.68, acwrStatus:"high_risk", trend:"declining",  trendDelta:-12.1,sessions7d:8, wellness:{ sleep:4, fatigue:8, soreness:9, stress:7, mood:3 }, history:32, flags:["injury","travel"] },
  { id:"ZIM005", name:"Ruvimbo Dube",    sport:"Swimming",  pos:"200m Free",   stage:"Predictive",    readiness:94, fatigue:11, risk:6,  acwr:1.08, acwrStatus:"normal",    trend:"improving",  trendDelta:5.1,  sessions7d:5, wellness:{ sleep:9, fatigue:2, soreness:2, stress:1, mood:9 }, history:50, flags:[] },
  { id:"ZIM006", name:"Farai Chidziva",  sport:"Rugby",     pos:"Flanker",     stage:"Contextual",    readiness:68, fatigue:38, risk:22, acwr:1.22, acwrStatus:"normal",    trend:"stable",     trendDelta:1.1,  sessions7d:4, wellness:{ sleep:7, fatigue:4, soreness:4, stress:4, mood:7 }, history:18, flags:["match_soon"] },
];

// 12-week readiness history per athlete
const HISTORY = {
  ZIM001:[58,62,67,71,73,74,76,78,81,83,84,87],
  ZIM002:[78,76,74,73,72,71,70,70,71,72,72,72],
  ZIM003:[72,70,68,65,62,58,54,52,50,51,51,51],
  ZIM004:[68,65,61,57,52,48,44,42,40,39,39,39],
  ZIM005:[80,82,84,85,86,87,88,89,90,92,93,94],
  ZIM006:[60,62,64,66,67,68,68,68,67,68,68,68],
};

// 28-day load data
const LOAD_28D = Array.from({length:28}, (_,i) => ({
  day: i+1,
  acute: Math.round(350 + Math.sin(i*0.5)*120 + Math.random()*80),
  chronic: Math.round(380 + Math.sin(i*0.25)*60 + Math.random()*40),
}));

// AI pipeline logs
const PIPELINE_LOGS = [
  { id:"RUN-441", athlete:"Tatenda Mhare",   status:"completed", ms:2841, stage:"Personalised",  ts:"18:34:01" },
  { id:"RUN-440", athlete:"Chiedza Mutasa",  status:"completed", ms:2214, stage:"Contextual",    ts:"17:58:22" },
  { id:"RUN-439", athlete:"Tafadzwa Ncube",  status:"completed", ms:1987, stage:"Personalised",  ts:"16:12:44" },
  { id:"RUN-438", athlete:"Ruvimbo Dube",    status:"completed", ms:2103, stage:"Predictive",    ts:"14:05:18" },
];

const ALERTS = [
  { id:1, sev:"critical", athlete:"Tatenda Mhare",  cat:"ACWR Critical",    msg:"ACWR 1.68 — Immediate load reduction required. Injury probability elevated.", ts:"8m" },
  { id:2, sev:"critical", athlete:"Chiedza Mutasa", cat:"ACWR High Risk",   msg:"ACWR 1.52 crossed threshold. Travel + stress flags compound risk.", ts:"22m" },
  { id:3, sev:"warning",  athlete:"Tafadzwa Ncube", cat:"Match Load Spike", msg:"6 sessions in 7 days. Pre-match load management needed.", ts:"1h" },
  { id:4, sev:"info",     athlete:"Ruvimbo Dube",   cat:"Peak Readiness",   msg:"94% readiness — optimal window for high-intensity stimulus.", ts:"2h" },
];

const SUPERVISOR_INSIGHTS = {
  ZIM001: { summary:"Excellent adaptation response. RSA improving. Green-light for progressive overload.", action:"Increase intensity 10-15%", confidence:0.91 },
  ZIM002: { summary:"Elevated ACWR with match approaching. Recommend technical session only, cap duration at 45 min.", action:"Reduce volume 25%", confidence:0.84 },
  ZIM003: { summary:"Travel compounding fatigue spike. Critical recovery intervention needed. Flag physio.", action:"Mandatory rest day", confidence:0.88 },
  ZIM004: { summary:"CRITICAL. Injury flag + ACWR 1.68. Remove from training. Physio and medical assessment required.", action:"Remove from training", confidence:0.96 },
  ZIM005: { summary:"Peak performance window detected. 3-week adaptation trend positive. Ready for competition.", action:"Competition ready", confidence:0.93 },
  ZIM006: { summary:"Stable load with pre-match context. Maintain current volume, increase match-specific intensity.", action:"Maintain + sharpen", confidence:0.79 },
};

// ─── HELPERS ──────────────────────────────────────────────────
const readColor = (r) => r >= 80 ? Z.greenBr : r >= 60 ? Z.goldBr : r >= 40 ? "#ff9800" : Z.redBr;
const riskColor  = (r) => r <= 20 ? Z.greenBr : r <= 40 ? Z.goldBr : r <= 65 ? "#ff9800" : Z.redBr;
const acwrColor  = (s) => ({ normal: Z.greenBr, elevated: Z.goldBr, high_risk: Z.redBr }[s] || Z.stone);
const trendIcon  = (t) => ({ improving:"↑", stable:"→", declining:"↓", spike:"⚡" }[t] || "·");
const sevColor   = (s) => ({ critical: Z.redBr, warning: Z.goldBr, info: Z.greenBr }[s] || Z.stone);
const stageColor = (s) => ({ Reactive: Z.stone, Contextual: "#ff9800", Personalised: Z.goldBr, Predictive: Z.greenBr }[s] || Z.stone);
const flagEmoji  = (f) => ({ travel:"✈", match_soon:"⚽", illness:"🤒", injury:"🩺", stress:"⚠" }[f] || "●");

// ─── COMPONENTS ───────────────────────────────────────────────
function ChevronBorder({ style={} }) {
  return (
    <div style={{
      position:"absolute", inset:0, pointerEvents:"none", borderRadius:"inherit",
      background: CHEVRON_BG,
      opacity: 0.4,
      maskImage: "radial-gradient(ellipse at center, transparent 60%, black 100%)",
      WebkitMaskImage: "radial-gradient(ellipse at center, transparent 60%, black 100%)",
      ...style
    }}/>
  );
}

function Panel({ children, style={}, glow, title, badge, accent=Z.greenBr }) {
  return (
    <div style={{
      background: Z.panel,
      border: `1px solid ${Z.border}`,
      borderRadius: 8,
      padding: "16px 18px",
      position: "relative",
      overflow: "hidden",
      boxShadow: glow ? `0 0 30px ${glow}22, inset 0 0 40px ${glow}06` : `0 4px 20px #00000060`,
      transition: "box-shadow 0.5s ease",
      ...style
    }}>
      <ChevronBorder/>
      {/* Left accent bar */}
      <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%",
        background: `linear-gradient(to bottom, ${accent}, ${accent}44, transparent)`,
        borderRadius:"8px 0 0 8px" }}/>
      {(title || badge) && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, position:"relative", zIndex:1 }}>
          {title && <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:3, textTransform:"uppercase", color:Z.muted }}>{title}</span>}
          {badge && <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:accent, background:`${accent}18`, border:`1px solid ${accent}44`, borderRadius:3, padding:"2px 8px", letterSpacing:1 }}>{badge}</span>}
        </div>
      )}
      <div style={{ position:"relative", zIndex:1 }}>
        {children}
      </div>
    </div>
  );
}

function ZimbabweCrest() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink:0 }}>
      {/* Outer ring */}
      <circle cx="18" cy="18" r="16" stroke={Z.gold} strokeWidth="1.5" fill="none"/>
      {/* Chevron rings */}
      <circle cx="18" cy="18" r="11" stroke={Z.gold} strokeWidth="0.8" fill="none" strokeDasharray="3 2"/>
      {/* Star / Zimbabwe bird abstracted */}
      {[0,72,144,216,288].map((angle, i) => {
        const rad = (angle - 90) * Math.PI / 180;
        const x = 18 + 7 * Math.cos(rad);
        const y = 18 + 7 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="1.5" fill={Z.gold}/>;
      })}
      <circle cx="18" cy="18" r="3" fill={Z.gold} style={{ filter:`drop-shadow(0 0 4px ${Z.gold})` }}/>
      {/* Chevron pattern lines */}
      <path d="M8 24 L13 19 L18 24 L23 19 L28 24" stroke={Z.green} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function RadialScore({ value, max=100, size=90, color, label }) {
  const pct = Math.min(value / max, 1);
  const R = (size - 18) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * R;
  const dash = circumference * pct;
  const gap  = circumference - dash;

  // Dynamic glow based on value
  const glowColor = color || readColor(value);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", overflow:"visible" }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={R} stroke={Z.border} strokeWidth="8" fill="none"/>
        {/* Progress */}
        <circle cx={cx} cy={cy} r={R} stroke={glowColor} strokeWidth="8" fill="none"
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 8px ${glowColor}99)`, transition:"all 1s cubic-bezier(0.4,0,0.2,1)" }}/>
      </svg>
      <div style={{ marginTop: -size * 0.55, textAlign:"center" }}>
        <div style={{ fontFamily:"'Oswald',sans-serif", fontSize: size * 0.23, color:glowColor, lineHeight:1, fontWeight:700,
          textShadow:`0 0 16px ${glowColor}88`, transition:"color 0.8s ease" }}>
          {value}
        </div>
        <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted, letterSpacing:1, textTransform:"uppercase", lineHeight:1, marginTop:2 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function LoadBar({ label, value, max, color, unit="" }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color:Z.stone, letterSpacing:1, textTransform:"uppercase" }}>{label}</span>
        <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, color, fontWeight:600 }}>{typeof value === "number" ? value.toFixed(1) : value}{unit}</span>
      </div>
      <div style={{ height:5, background:Z.border, borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${Math.min((value/max)*100, 100)}%`, background:color, borderRadius:3,
          boxShadow:`0 0 10px ${color}66`, transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)" }}/>
      </div>
    </div>
  );
}

function WellnessPip({ label, value, invert=false }) {
  const displayVal = invert ? (10 - value + 1) : value;
  const color = displayVal >= 7 ? Z.greenBr : displayVal >= 5 ? Z.goldBr : Z.redBr;
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:16, color, fontWeight:700, lineHeight:1,
        textShadow:`0 0 10px ${color}66` }}>{value}</div>
      <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.muted, letterSpacing:1, textTransform:"uppercase", marginTop:2 }}>{label}</div>
    </div>
  );
}

function LivePulse({ color=Z.greenBr, size=8 }) {
  return (
    <span style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ width:size, height:size, borderRadius:"50%", background:color,
        boxShadow:`0 0 8px ${color}`, animation:"zim-pulse 2s ease infinite" }}/>
    </span>
  );
}

function ACWRPill({ status, value }) {
  const color = acwrColor(status);
  const label = { normal:"NORMAL", elevated:"ELEVATED", high_risk:"HIGH RISK" }[status] || "—";
  return (
    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color, background:`${color}15`,
      border:`1px solid ${color}55`, borderRadius:4, padding:"2px 8px", letterSpacing:1,
      boxShadow: status === "high_risk" ? `0 0 12px ${color}44` : "none",
      animation: status === "high_risk" ? "zim-pulse-border 1.5s ease infinite" : "none" }}>
      {value?.toFixed(2)} · {label}
    </span>
  );
}

function StageBadge({ stage }) {
  const color = stageColor(stage);
  const pct = { Reactive:10, Contextual:35, Personalised:65, Predictive:100 }[stage] || 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ width:50, height:3, background:Z.border, borderRadius:2 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:2,
          boxShadow:`0 0 6px ${color}88` }}/>
      </div>
      <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color, letterSpacing:1 }}>{stage.toUpperCase()}</span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:Z.surface, border:`1px solid ${Z.border}`, borderRadius:6,
      padding:"8px 12px", fontFamily:"'Courier Prime',monospace", fontSize:11 }}>
      <div style={{ color:Z.stone, marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color:p.color }}>{p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</strong></div>
      ))}
    </div>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────
export default function GundaDashboard() {
  const [selected, setSelected]     = useState(ATHLETES[0]);
  const [tick, setTick]             = useState(0);
  const [activeTab, setActiveTab]   = useState("squad");
  const [showInsight, setShowInsight] = useState(false);

  // Simulated live data updates
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setShowInsight(false);
    const t = setTimeout(() => setShowInsight(true), 200);
    return () => clearTimeout(t);
  }, [selected.id]);

  const histData = HISTORY[selected.id].map((v, i) => ({ wk:`W${i+1}`, readiness:v }));
  const insight = SUPERVISOR_INSIGHTS[selected.id];
  const selColor = readColor(selected.readiness);

  // Wellness radar for selected athlete
  const wellnessRadar = [
    { metric:"Sleep",    value: selected.wellness.sleep * 10 },
    { metric:"Energy",   value: (10 - selected.wellness.fatigue) * 10 },
    { metric:"Body",     value: (10 - selected.wellness.soreness) * 10 },
    { metric:"Mind",     value: (10 - selected.wellness.stress) * 10 },
    { metric:"Mood",     value: selected.wellness.mood * 10 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Courier+Prime:wght@400;700&family=Black+Han+Sans&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { color-scheme:dark; }
        html, body { background:${Z.bg}; color:${Z.white}; font-family:'Courier Prime',monospace; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-track { background:${Z.bg}; }
        ::-webkit-scrollbar-thumb { background:${Z.border}; border-radius:2px; }

        @keyframes zim-pulse {
          0%,100% { opacity:1; box-shadow:0 0 8px currentColor; }
          50%      { opacity:0.4; box-shadow:0 0 2px currentColor; }
        }
        @keyframes zim-pulse-border {
          0%,100% { box-shadow:0 0 12px ${Z.redBr}44; }
          50%      { box-shadow:0 0 4px ${Z.redBr}22; }
        }
        @keyframes zim-slide-up {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes zim-critical-flash {
          0%,100% { background:${Z.redBr}12; }
          50%      { background:${Z.redBr}22; }
        }
        @keyframes zim-scan {
          0%   { transform:translateY(-100%); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { transform:translateY(100vh); opacity:0; }
        }
        .athlete-row { transition:background 0.25s ease, transform 0.2s ease; cursor:pointer; }
        .athlete-row:hover { background:${Z.green}18 !important; transform:translateX(2px); }
        .insight-appear { animation: zim-slide-up 0.35s ease forwards; }
        .critical-row   { animation: zim-critical-flash 2s ease infinite; }
        .tab-btn { background:transparent; border:none; cursor:pointer; transition:all 0.2s; }
      `}</style>

      <div style={{ minHeight:"100vh", background:Z.bg, paddingBottom:32, position:"relative" }}>

        {/* Scanline */}
        <div style={{ position:"fixed", top:0, left:0, right:0, height:"3px", pointerEvents:"none", zIndex:1000,
          background:`linear-gradient(to bottom, transparent, ${Z.gold}18, transparent)`,
          animation:"zim-scan 10s linear infinite" }}/>

        {/* ── NAVIGATION ─────────────────────────────────────── */}
        <nav style={{
          background:`${Z.surface}f0`, borderBottom:`2px solid ${Z.border}`,
          backdropFilter:"blur(16px)", height:64,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 28px", position:"sticky", top:0, zIndex:100
        }}>
          {/* Left: Logo + Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <ZimbabweCrest/>
            <div>
              <div style={{ fontFamily:"'Black Han Sans',sans-serif", fontSize:28, letterSpacing:5,
                color:Z.gold, lineHeight:1,
                textShadow:`0 0 30px ${Z.gold}44, 0 2px 0 ${Z.black}` }}>GUNDA</div>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.muted, letterSpacing:3, lineHeight:1 }}>
                GLOBAL NEUROMUSCULAR INTELLIGENCE · ZIM
              </div>
            </div>

            {/* Zimbabwe flag strip */}
            <div style={{ display:"flex", marginLeft:8, borderRadius:2, overflow:"hidden", height:20, width:6 }}>
              {[Z.green, Z.goldBr, Z.red, Z.black, Z.red, Z.goldBr, Z.green].map((c,i) => (
                <div key={i} style={{ flex:1, background:c }}/>
              ))}
            </div>
          </div>

          {/* Center: Nav tabs */}
          <div style={{ display:"flex", gap:2 }}>
            {[
              { id:"squad",    label:"Squad" },
              { id:"load",     label:"Load" },
              { id:"athlete",  label:"Athlete" },
              { id:"pipeline", label:"AI Pipeline" },
            ].map(tab => (
              <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)}
                style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:3, textTransform:"uppercase",
                  padding:"6px 16px", borderRadius:4,
                  color: activeTab === tab.id ? Z.gold : Z.muted,
                  background: activeTab === tab.id ? `${Z.gold}15` : "transparent",
                  borderBottom: activeTab === tab.id ? `2px solid ${Z.gold}` : "2px solid transparent" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right: Status bar */}
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            {[
              { label:"Supabase", ok:true },
              { label:"n8n",      ok:true },
              { label:"AI Node",  ok:true },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <LivePulse color={s.ok ? Z.greenBr : Z.redBr} size={6}/>
                <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>{s.label}</span>
              </div>
            ))}
            <div style={{ fontFamily:"'Oswald',monospace", fontSize:14, color:Z.gold, letterSpacing:2,
              background:`${Z.gold}10`, padding:"4px 12px", borderRadius:4, border:`1px solid ${Z.gold}33` }}>
              {new Date().toLocaleTimeString("en-ZW", { hour12:false })} ZW
            </div>
          </div>
        </nav>

        {/* ── MAIN GRID ─────────────────────────────────────────── */}
        <div style={{ padding:"20px 24px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr 300px", gap:16 }}>

          {/* ── KPI ROW ─────────────────────────────── */}
          {[
            { label:"Squad Readiness",      val:"71.8%",  delta:"+1.4", sub:"avg 6 athletes",    glow:Z.greenBr },
            { label:"High Risk Athletes",   val:"2",      delta:"0",    sub:"ACWR > 1.5",         glow:Z.redBr },
            { label:"AI Stage: Predictive", val:"2",      delta:"+1",   sub:"of 6 athletes",      glow:Z.goldBr },
            { label:"Active Context Flags", val:"5",      delta:"+2",   sub:"past 7 days",        glow:"#ff9800" },
            { label:"Reminder Sent Today",  val:"5 / 6",  delta:"",     sub:"1 already checked-in", glow:Z.greenBr },
            { label:"Pipeline Runs (24h)",  val:"4",      delta:"",     sub:"all completed",      glow:Z.stone },
          ].map((k, i) => (
            <Panel key={k.label} accent={k.glow} glow={k.glow} style={{ padding:"14px 16px" }}>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>{k.label}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:32, fontWeight:700, color:k.glow, lineHeight:1,
                  textShadow:`0 0 20px ${k.glow}44` }}>{k.val}</span>
                {k.delta && <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:10,
                  color: k.delta.startsWith("+") ? Z.greenBr : k.delta.startsWith("-") ? Z.redBr : Z.muted }}>{k.delta}</span>}
              </div>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted, marginTop:3 }}>{k.sub}</div>
            </Panel>
          ))}

          {/* ── SQUAD ROSTER ──────────────────────── (col 1-3, row 2) */}
          <Panel title="Squad Neuromuscular Status" badge="LIVE · 6 ATHLETES" accent={Z.gold}
            style={{ gridColumn:"1 / span 3", gridRow:"2" }}>

            {/* Table header */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 90px 80px 90px 90px 100px 100px",
              gap:8, padding:"0 6px 8px", borderBottom:`1px solid ${Z.border}` }}>
              {["Athlete","Sport","Readiness","ACWR","Wellness","Sessions","Stage","AI Status"].map(h => (
                <span key={h} style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted, letterSpacing:2, textTransform:"uppercase" }}>{h}</span>
              ))}
            </div>

            {ATHLETES.map(a => {
              const isCritical = a.acwrStatus === "high_risk";
              const rColor = readColor(a.readiness);
              const ins = SUPERVISOR_INSIGHTS[a.id];
              return (
                <div key={a.id} className={`athlete-row${isCritical ? " critical-row" : ""}`}
                  onClick={() => setSelected(a)}
                  style={{ display:"grid", gridTemplateColumns:"1fr 80px 90px 80px 90px 90px 100px 100px",
                    gap:8, padding:"11px 6px", borderBottom:`1px solid ${Z.border}22`,
                    borderRadius:5, background: selected.id === a.id ? `${Z.green}20` : "transparent",
                    borderLeft: selected.id === a.id ? `3px solid ${rColor}` : "3px solid transparent" }}>

                  {/* Name + flags */}
                  <div>
                    <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, fontWeight:600, color:Z.white, lineHeight:1 }}>{a.name}</div>
                    <div style={{ display:"flex", gap:4, marginTop:2 }}>
                      {a.flags.map(f => (
                        <span key={f} style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.goldBr, background:`${Z.goldBr}15`, border:`1px solid ${Z.goldBr}33`, borderRadius:3, padding:"0 4px" }}>{flagEmoji(f)} {f}</span>
                      ))}
                    </div>
                  </div>

                  {/* Sport */}
                  <div style={{ alignSelf:"center" }}>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>{a.sport}</div>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.border, marginTop:1 }}>{a.pos}</div>
                  </div>

                  {/* Readiness */}
                  <div style={{ alignSelf:"center" }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
                      <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, fontWeight:700, color:rColor,
                        textShadow:`0 0 12px ${rColor}66` }}>{a.readiness}</span>
                      <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>%</span>
                      <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color: a.trendDelta >= 0 ? Z.greenBr : Z.redBr }}>{trendIcon(a.trend)}</span>
                    </div>
                    <div style={{ height:3, background:Z.border, borderRadius:2, marginTop:3 }}>
                      <div style={{ height:"100%", width:`${a.readiness}%`, background:rColor, borderRadius:2,
                        boxShadow:`0 0 8px ${rColor}66`, transition:"width 1.2s ease" }}/>
                    </div>
                  </div>

                  {/* ACWR */}
                  <div style={{ alignSelf:"center" }}>
                    <ACWRPill status={a.acwrStatus} value={a.acwr}/>
                  </div>

                  {/* Wellness composite */}
                  <div style={{ alignSelf:"center", display:"flex", gap:4, flexWrap:"wrap" }}>
                    {[
                      { v:a.wellness.sleep, sym:"💤" },
                      { v:10-a.wellness.fatigue, sym:"⚡" },
                      { v:10-a.wellness.soreness, sym:"💪" },
                    ].map((w, i) => {
                      const c = w.v >= 7 ? Z.greenBr : w.v >= 5 ? Z.goldBr : Z.redBr;
                      return <div key={i} style={{ width:16, height:16, borderRadius:3, background:`${c}44`, border:`1px solid ${c}88`,
                        display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Oswald',sans-serif", fontSize:9, color:c, fontWeight:700 }}>{w.v}</div>;
                    })}
                  </div>

                  {/* Sessions */}
                  <div style={{ alignSelf:"center", fontFamily:"'Oswald',sans-serif", fontSize:16, color:Z.white }}>
                    {a.sessions7d}<span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>/wk</span>
                  </div>

                  {/* Stage */}
                  <div style={{ alignSelf:"center" }}>
                    <StageBadge stage={a.stage}/>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.muted, marginTop:2 }}>{a.history}d data</div>
                  </div>

                  {/* AI Status */}
                  <div style={{ alignSelf:"center" }}>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:rColor, lineHeight:1.3 }}>
                      {ins.action}
                    </div>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.muted, marginTop:2 }}>
                      conf: {(ins.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </Panel>

          {/* ── ALERTS PANEL ──────────────── (col 4, row 2) */}
          <Panel title="AI Alerts" badge={`${ALERTS.length} ACTIVE`} accent={Z.redBr}
            style={{ gridColumn:"4", gridRow:"2" }}>
            {ALERTS.map(al => (
              <div key={al.id} style={{
                borderLeft:`3px solid ${sevColor(al.sev)}`,
                background:`${sevColor(al.sev)}08`,
                borderRadius:"0 5px 5px 0",
                padding:"10px 10px",
                marginBottom:8
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:sevColor(al.sev), letterSpacing:2, textTransform:"uppercase" }}>
                    {al.sev} · {al.cat}
                  </span>
                  <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.muted }}>{al.ts}</span>
                </div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:11, fontWeight:500, color:Z.stone, marginBottom:3 }}>{al.athlete}</div>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, color:Z.white, lineHeight:1.45 }}>{al.msg}</div>
              </div>
            ))}
          </Panel>

          {/* ── SELECTED ATHLETE DEEP-DIVE ──── (col 1) */}
          <Panel title={`Athlete Focus`} badge="SELECTED" accent={selColor}
            glow={selColor} style={{ gridColumn:"1", gridRow:"3" }} key={`profile-${selected.id}`}>
            <div className="insight-appear">
              {/* Name + hero */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontFamily:"'Black Han Sans',sans-serif", fontSize:26, color:selColor, letterSpacing:3, lineHeight:1,
                  textShadow:`0 0 20px ${selColor}55` }}>{selected.name.toUpperCase()}</div>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color:Z.muted, marginTop:2 }}>
                  {selected.sport} · {selected.pos} · {selected.id}
                </div>
                <div style={{ marginTop:6 }}>
                  <StageBadge stage={selected.stage}/>
                </div>
              </div>

              {/* Gauges row */}
              <div style={{ display:"flex", justifyContent:"space-around", marginBottom:16 }}>
                <RadialScore value={selected.readiness} color={selColor} label="Readiness" size={82}/>
                <RadialScore value={Math.round(100 - selected.fatigue)} color={readColor(100-selected.fatigue)} label="Energy" size={82}/>
                <RadialScore value={Math.round(100 - selected.risk)} color={riskColor(selected.risk)} label="Safety" size={82}/>
              </div>

              {/* Wellness breakdown */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:4, marginBottom:14,
                background:Z.surface, padding:"10px 8px", borderRadius:6, border:`1px solid ${Z.border}` }}>
                <WellnessPip label="Sleep"   value={selected.wellness.sleep}/>
                <WellnessPip label="Fatigue" value={selected.wellness.fatigue} invert/>
                <WellnessPip label="Soreness" value={selected.wellness.soreness} invert/>
                <WellnessPip label="Stress"  value={selected.wellness.stress} invert/>
                <WellnessPip label="Mood"    value={selected.wellness.mood}/>
              </div>

              {/* ACWR */}
              <LoadBar label="ACWR" value={selected.acwr} max={2} color={acwrColor(selected.acwrStatus)}/>
              <LoadBar label="Injury Risk" value={selected.risk} max={100} color={riskColor(selected.risk)} unit="%"/>
              <LoadBar label="7d Sessions" value={selected.sessions7d} max={10} color={Z.goldBr}/>

              {/* Flags */}
              {selected.flags.length > 0 && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                  {selected.flags.map(f => (
                    <span key={f} style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.goldBr,
                      background:`${Z.goldBr}15`, border:`1px solid ${Z.goldBr}44`, borderRadius:4, padding:"3px 8px" }}>
                      {flagEmoji(f)} {f.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          {/* ── READINESS TREND ─────────────────── (col 2) */}
          <Panel title={`${selected.name.split(" ")[0]} — 12-Week Readiness`} badge="AI TRACKED"
            accent={selColor} style={{ gridColumn:"2", gridRow:"3" }}>
            <ResponsiveContainer width="100%" height={195}>
              <AreaChart data={histData} margin={{ top:8, right:8, left:-24, bottom:0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor={selColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={selColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={Z.border} strokeDasharray="2 4" vertical={false}/>
                <XAxis dataKey="wk" tick={{ fontFamily:"'Courier Prime',monospace", fontSize:9, fill:Z.muted }} axisLine={false} tickLine={false}/>
                <YAxis domain={[25,100]} tick={{ fontFamily:"'Courier Prime',monospace", fontSize:9, fill:Z.muted }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <ReferenceLine y={80} stroke={Z.greenBr} strokeDasharray="4 3"
                  label={{ value:"TARGET", fill:Z.greenBr, fontSize:8, fontFamily:"'Courier Prime',monospace", position:"right" }}/>
                <ReferenceLine y={60} stroke={Z.goldBr} strokeDasharray="4 3"
                  label={{ value:"CAUTION", fill:Z.goldBr, fontSize:8, fontFamily:"'Courier Prime',monospace", position:"right" }}/>
                <Area type="monotone" dataKey="readiness" name="Readiness" stroke={selColor} strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={{ fill:selColor, r:2.5, strokeWidth:0 }}
                  activeDot={{ r:5, fill:selColor, style:{ filter:`drop-shadow(0 0 8px ${selColor})` } }}/>
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          {/* ── AI SUPERVISOR INSIGHT ──── (col 3) */}
          <Panel title="Head Supervisor AI Insight" badge={`${(SUPERVISOR_INSIGHTS[selected.id].confidence * 100).toFixed(0)}% CONFIDENCE`}
            accent={Z.gold} glow={Z.gold}
            style={{ gridColumn:"3", gridRow:"3" }}>
            {showInsight && (
              <div className="insight-appear">
                {/* AI header */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12,
                  background:`${Z.gold}0a`, borderRadius:5, padding:"8px 10px", border:`1px solid ${Z.gold}22` }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:`${Z.gold}22`, border:`2px solid ${Z.gold}55`,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:14 }}>🧠</span>
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.gold, letterSpacing:2 }}>SUPERVISOR SYNTHESIS</div>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.muted, marginTop:1 }}>
                      physiologist + psychologist + performance analyst
                    </div>
                  </div>
                </div>

                {/* Insight text */}
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, color:Z.white, lineHeight:1.6,
                  marginBottom:14, fontWeight:400 }}>
                  "{insight.summary}"
                </div>

                {/* Action pill */}
                <div style={{ background:`${selColor}15`, border:`1px solid ${selColor}55`, borderRadius:6,
                  padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted, letterSpacing:2 }}>RECOMMENDED ACTION</span>
                  <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, fontWeight:600, color:selColor,
                    textShadow:`0 0 12px ${selColor}44` }}>→ {insight.action.toUpperCase()}</span>
                </div>

                {/* Wellness radar */}
                <div>
                  <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted, letterSpacing:2, marginBottom:6 }}>WELLNESS RADAR</div>
                  <ResponsiveContainer width="100%" height={130}>
                    <RadarChart data={wellnessRadar} margin={{ top:0, right:20, bottom:0, left:20 }}>
                      <PolarGrid stroke={Z.border} radialLines={false}/>
                      <PolarAngleAxis dataKey="metric" tick={{ fontFamily:"'Courier Prime',monospace", fontSize:9, fill:Z.muted }}/>
                      <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                      <Radar name="Wellness" dataKey="value" stroke={selColor} fill={selColor} fillOpacity={0.2} strokeWidth={1.5}/>
                      <Tooltip content={<CustomTooltip/>}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Panel>

          {/* ── PIPELINE MONITOR ────────────────── (col 4, row 3) */}
          <Panel title="n8n Pipeline · AI Nodes" badge="SUPERVISOR OUTPUT" accent={Z.goldBr}
            style={{ gridColumn:"4", gridRow:"3" }}>

            {/* Specialist nodes */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted, letterSpacing:2, marginBottom:8 }}>SPECIALIST AGENTS</div>
              {[
                { name:"ai physiologist",        icon:"🫀", status:"ready", color:Z.greenBr },
                { name:"ai psychologist",         icon:"🧠", status:"ready", color:Z.goldBr },
                { name:"ai performance analyst",  icon:"📊", status:"ready", color:Z.greenBr },
                { name:"head supervisor",         icon:"⚡", status:"active", color:Z.gold },
              ].map(n => (
                <div key={n.name} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 8px", marginBottom:3,
                  background: n.status === "active" ? `${n.color}12` : `${Z.surface}`,
                  border: `1px solid ${n.status === "active" ? n.color+"44" : Z.border}`,
                  borderRadius:5 }}>
                  <span>{n.icon}</span>
                  <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color: n.status === "active" ? n.color : Z.stone, flex:1 }}>{n.name}</span>
                  <LivePulse color={n.color} size={6}/>
                </div>
              ))}
            </div>

            {/* Recent pipeline runs */}
            <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted, letterSpacing:2, marginBottom:8 }}>RECENT RUNS</div>
            {PIPELINE_LOGS.map(r => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0",
                borderBottom:`1px solid ${Z.border}22` }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:Z.greenBr, flexShrink:0,
                  boxShadow:`0 0 6px ${Z.greenBr}` }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, color:Z.white }}>{r.id}</span>
                    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.muted }}>{r.ts}</span>
                  </div>
                  <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted, marginTop:1 }}>
                    {r.athlete} · {r.ms}ms · <span style={{ color:stageColor(r.stage) }}>{r.stage}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* WhatsApp Reminder Status */}
            <div style={{ marginTop:12, background:`${Z.green}12`, border:`1px solid ${Z.green}44`,
              borderRadius:6, padding:"8px 10px" }}>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.greenBr, letterSpacing:2, marginBottom:4 }}>
                📱 DAILY REMINDERS · 8PM ZW
              </div>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, color:Z.white }}>5/6 sent · 1 skipped</div>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.muted, marginTop:2 }}>
                Chiedza Mutasa · already checked-in
              </div>
            </div>
          </Panel>

          {/* ── 28-DAY LOAD CHART ─── full width */}
          <Panel title="28-Day Squad Load — Acute vs Chronic" badge="ACWR MONITORING"
            accent={Z.gold} style={{ gridColumn:"1 / span 4", gridRow:"4" }}>
            <div style={{ display:"flex", gap:20, marginBottom:12, alignItems:"center" }}>
              {/* ACWR indicators */}
              {ATHLETES.slice(0,6).map(a => (
                <div key={a.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:16, fontWeight:700, color:acwrColor(a.acwrStatus),
                    textShadow:`0 0 10px ${acwrColor(a.acwrStatus)}55` }}>{a.acwr.toFixed(2)}</div>
                  <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8, color:Z.muted, maxWidth:70, textAlign:"center", lineHeight:1.2 }}>
                    {a.name.split(" ")[0]}
                  </div>
                  <div style={{ width:40, height:3, borderRadius:2, background:acwrColor(a.acwrStatus),
                    boxShadow:`0 0 8px ${acwrColor(a.acwrStatus)}66` }}/>
                </div>
              ))}
              <div style={{ marginLeft:"auto", display:"flex", gap:16 }}>
                {[{ c:Z.goldBr, l:"Acute Load" },{ c:`${Z.stone}88`, l:"Chronic Load" },{ c:Z.redBr, l:"Risk Zone (>1.5 ACWR)" }].map(lg=>(
                  <div key={lg.l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:12, height:3, background:lg.c, borderRadius:2 }}/>
                    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>{lg.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={LOAD_28D} margin={{ top:4, right:8, left:-24, bottom:0 }} barGap={1}>
                <CartesianGrid stroke={Z.border} strokeDasharray="2 4" vertical={false}/>
                <XAxis dataKey="day" tick={{ fontFamily:"'Courier Prime',monospace", fontSize:8, fill:Z.muted }} axisLine={false} tickLine={false}
                  tickFormatter={v => v % 7 === 0 ? `D${v}` : ""}/>
                <YAxis domain={[200, 600]} tick={{ fontFamily:"'Courier Prime',monospace", fontSize:8, fill:Z.muted }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <ReferenceLine y={500} stroke={Z.redBr} strokeDasharray="4 3" strokeWidth={1.5}/>
                <Bar dataKey="chronic" fill={`${Z.stone}55`} radius={[1,1,0,0]} name="Chronic"/>
                <Bar dataKey="acute"   fill={Z.goldBr}       radius={[1,1,0,0]} name="Acute"
                  style={{ filter:`drop-shadow(0 1px 4px ${Z.goldBr}44)` }}>
                  {LOAD_28D.map((entry, index) => (
                    <Cell key={index} fill={entry.acute > 500 ? Z.redBr : entry.acute > 440 ? "#ff9800" : Z.goldBr}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>

        </div>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0,
          background:`${Z.surface}f0`, borderTop:`1px solid ${Z.border}`,
          backdropFilter:"blur(12px)", padding:"6px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", gap:24 }}>
            {[
              { l:"Supabase Realtime", v:"CONNECTED" },
              { l:"n8n Webhook",       v:"ACTIVE" },
              { l:"AI Supervisor",     v:"ONLINE" },
              { l:"WhatsApp API",      v:"READY" },
            ].map(s => (
              <div key={s.l} style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>
                {s.l} <span style={{ color:Z.greenBr }}>●</span> <span style={{ color:Z.greenBr }}>{s.v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {/* Zimbabwe flag colors strip */}
            <div style={{ display:"flex", height:12, width:4, borderRadius:1, overflow:"hidden", flexDirection:"column" }}>
              {[Z.green, Z.goldBr, Z.red, Z.black].map((c,i) => <div key={i} style={{ flex:1, background:c }}/>)}
            </div>
            <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>
              GUNDA v2.0 · Zimbabwe Athletic Load Monitoring System · Powered by n8n + Supabase AI
            </span>
          </div>
        </div>

      </div>
    </>
  );
}