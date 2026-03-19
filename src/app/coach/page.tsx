"use client";
import { useState } from "react";

const Z = {
  bg:      "#080c08",
  surface: "#0d140d",
  panel:   "#111a0f",
  border:  "#1e3318",
  green:   "#2d7a2d",
  greenBr: "#4caf50",
  gold:    "#d4a017",
  goldBr:  "#ffd54f",
  red:     "#c62828",
  redBr:   "#ef5350",
  white:   "#f5f5e8",
  muted:   "#4a6440",
  stone:   "#8a9e7a",
};

const ATHLETES = [
  { id:"ZIM001", name:"Takudzwa Moyo",   pos:"Sprinter",    readiness:87, fatigue:18, risk:11, acwr:1.18, acwrStatus:"normal",    trend:"↑", trendColor:"#4caf50", sessions:5, sleep:8, fatigue_raw:2, soreness:3, stress:2, mood:9, stage:"Predictive",   history:45, flags:[], ai:"Increase intensity 10-15%", confidence:91 },
  { id:"ZIM002", name:"Tafadzwa Ncube",  pos:"Midfielder",  readiness:72, fatigue:44, risk:29, acwr:1.34, acwrStatus:"elevated",  trend:"→", trendColor:"#ffd54f", sessions:6, sleep:6, fatigue_raw:6, soreness:5, stress:5, mood:6, stage:"Personalised",  history:28, flags:["match_soon"], ai:"Reduce volume 25%", confidence:84 },
  { id:"ZIM003", name:"Chiedza Mutasa",  pos:"Mid Distance", readiness:51, fatigue:61, risk:48, acwr:1.52, acwrStatus:"high_risk", trend:"↓", trendColor:"#ef5350", sessions:7, sleep:5, fatigue_raw:7, soreness:8, stress:6, mood:4, stage:"Contextual",    history:14, flags:["travel","stress"], ai:"Mandatory rest day", confidence:88 },
  { id:"ZIM004", name:"Tatenda Mhare",   pos:"Centre-Back", readiness:39, fatigue:73, risk:67, acwr:1.68, acwrStatus:"high_risk", trend:"↓", trendColor:"#ef5350", sessions:8, sleep:4, fatigue_raw:8, soreness:9, stress:7, mood:3, stage:"Personalised",  history:32, flags:["injury","travel"], ai:"Remove from training", confidence:96 },
  { id:"ZIM005", name:"Ruvimbo Dube",    pos:"200m Free",   readiness:94, fatigue:11, risk:6,  acwr:1.08, acwrStatus:"normal",    trend:"↑", trendColor:"#4caf50", sessions:5, sleep:9, fatigue_raw:2, soreness:2, stress:1, mood:9, stage:"Predictive",   history:50, flags:[], ai:"Competition ready", confidence:93 },
  { id:"ZIM006", name:"Farai Chidziva",  pos:"Flanker",     readiness:68, fatigue:38, risk:22, acwr:1.22, acwrStatus:"normal",    trend:"→", trendColor:"#ffd54f", sessions:4, sleep:7, fatigue_raw:4, soreness:4, stress:4, mood:7, stage:"Contextual",    history:18, flags:["match_soon"], ai:"Maintain + sharpen", confidence:79 },
];

const ALERTS = [
  { id:1, sev:"critical", athlete:"Tatenda Mhare",  cat:"ACWR Critical",  msg:"ACWR 1.68 — Immediate load reduction.", ts:"8m" },
  { id:2, sev:"critical", athlete:"Chiedza Mutasa", cat:"High Risk",      msg:"ACWR 1.52 + travel + stress flags.", ts:"22m" },
  { id:3, sev:"warning",  athlete:"Tafadzwa Ncube", cat:"Match Load",     msg:"6 sessions in 7 days pre-match.", ts:"1h" },
  { id:4, sev:"info",     athlete:"Ruvimbo Dube",   cat:"Peak Readiness", msg:"94% — optimal performance window.", ts:"2h" },
];

const readColor  = (r: number) => r >= 80 ? "#4caf50" : r >= 60 ? "#ffd54f" : r >= 40 ? "#ff9800" : "#ef5350";
const acwrColor  = (s: string) => ({ normal:"#4caf50", elevated:"#ffd54f", high_risk:"#ef5350" }[s] || "#8a9e7a");
const sevColor   = (s: string) => ({ critical:"#ef5350", warning:"#ffd54f", info:"#4caf50" }[s] || "#8a9e7a");
const stageColor = (s: string) => ({ Reactive:"#8a9e7a", Contextual:"#ff9800", Personalised:"#ffd54f", Predictive:"#4caf50" }[s] || "#8a9e7a");
const flagEmoji  = (f: string) => ({ travel:"✈", match_soon:"⚽", illness:"🤒", injury:"🩺", stress:"⚠" }[f] || "●");

function ReadinessRing({ value, size=56 }: { value:number, size?:number }) {
  const color = readColor(value);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (value / 100);
  return (
    <svg width={size} height={size} style={{ flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} stroke={Z.border} strokeWidth="5" fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="5" fill="none"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter:`drop-shadow(0 0 6px ${color}88)`, transition:"all 1s ease" }}/>
      <text x={size/2} y={size/2+5} textAnchor="middle"
        style={{ fontFamily:"'Oswald',sans-serif", fontSize:size*0.22, fontWeight:700, fill:color }}>
        {value}
      </text>
    </svg>
  );
}

function WellnessDot({ value, invert=false }: { value:number, invert?:boolean }) {
  const v = invert ? 11 - value : value;
  const c = v >= 7 ? "#4caf50" : v >= 5 ? "#ffd54f" : "#ef5350";
  return (
    <div style={{ width:18, height:18, borderRadius:4, background:`${c}33`,
      border:`1px solid ${c}88`, display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Oswald',sans-serif", fontSize:10, color:c, fontWeight:700 }}>{value}</div>
  );
}

export default function CoachDashboard() {
  const [selected, setSelected] = useState(ATHLETES[0]);
  const [tab, setTab]           = useState<"squad"|"alerts"|"load">("squad");

  const rColor = readColor(selected.readiness);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Courier+Prime:wght@400;700&family=Black+Han+Sans&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${Z.bg};color:${Z.white};font-family:'Courier Prime',monospace;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${Z.border};border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes slide-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .slide-up{animation:slide-up 0.3s ease forwards;}
        .athlete-row{transition:all 0.2s ease;cursor:pointer;}
        .athlete-row:hover{background:${Z.green}18 !important;}
      `}</style>

      <div style={{ minHeight:"100vh", background:Z.bg, paddingBottom:80 }}>

        {/* ── HEADER ── */}
        <div style={{ background:Z.surface, borderBottom:`2px solid ${Z.border}`,
          padding:"12px 16px", position:"sticky", top:0, zIndex:50 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div>
                <div style={{ fontFamily:"'Black Han Sans',sans-serif", fontSize:22,
                  color:Z.gold, letterSpacing:4, lineHeight:1,
                  textShadow:`0 0 20px ${Z.gold}44` }}>GUNDA</div>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                  color:Z.muted, letterSpacing:2 }}>COACH DASHBOARD</div>
              </div>
              <div style={{ display:"flex", height:24, borderRadius:3, overflow:"hidden", marginLeft:6 }}>
                {["#1B5E20","#F9A825","#C62828","#1A1A1A"].map((c,i) => (
                  <div key={i} style={{ width:6, background:c }}/>
                ))}
              </div>
            </div>
            {/* Live dot */}
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:Z.greenBr,
                animation:"pulse 2s infinite", boxShadow:`0 0 8px ${Z.greenBr}` }}/>
              <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                color:Z.greenBr }}>LIVE</span>
            </div>
          </div>

          {/* KPI Strip */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {[
              { l:"Squad Ready", v:"71.8%", c:Z.greenBr },
              { l:"High Risk",   v:"2 ATH", c:Z.redBr },
              { l:"Alerts",      v:"4 ACTIVE", c:Z.goldBr },
              { l:"Pipeline",    v:"LIVE", c:Z.greenBr },
            ].map(k => (
              <div key={k.l} style={{ background:Z.panel, borderRadius:6,
                padding:"8px 8px", border:`1px solid ${Z.border}` }}>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:7,
                  color:Z.muted, letterSpacing:1, textTransform:"uppercase" }}>{k.l}</div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15,
                  fontWeight:700, color:k.c, textShadow:`0 0 10px ${k.c}44` }}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TAB NAV ── */}
        <div style={{ display:"flex", background:Z.surface,
          borderBottom:`1px solid ${Z.border}`, padding:"0 16px" }}>
          {(["squad","alerts","load"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:2,
                textTransform:"uppercase", padding:"10px 16px", background:"transparent",
                border:"none", cursor:"pointer",
                color: tab === t ? Z.goldBr : Z.muted,
                borderBottom: tab === t ? `2px solid ${Z.goldBr}` : "2px solid transparent" }}>
              {t === "squad" ? "Squad" : t === "alerts" ? `Alerts (${ALERTS.length})` : "Load"}
            </button>
          ))}
        </div>

        <div style={{ padding:"12px 16px" }}>

          {/* ── SQUAD TAB ── */}
          {tab === "squad" && (
            <div className="slide-up">
              {/* Athlete List */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                  color:Z.muted, letterSpacing:2, marginBottom:8 }}>SQUAD ROSTER</div>
                {ATHLETES.map(a => (
                  <div key={a.id} className="athlete-row"
                    onClick={() => setSelected(a)}
                    style={{ display:"flex", alignItems:"center", gap:12,
                      padding:"10px 12px", borderRadius:8, marginBottom:6,
                      background: selected.id === a.id ? `${Z.green}20` : Z.panel,
                      border: `1px solid ${selected.id === a.id ? readColor(a.readiness)+"66" : Z.border}`,
                      borderLeft: `3px solid ${readColor(a.readiness)}` }}>

                    {/* Readiness Ring */}
                    <ReadinessRing value={a.readiness} size={48}/>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:14,
                          fontWeight:600, color:Z.white }}>{a.name}</span>
                        <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                          color:a.trendColor }}>{a.trend} {a.acwr.toFixed(2)}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                        <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                          color:Z.muted }}>{a.pos}</span>
                        <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                          color:acwrColor(a.acwrStatus), background:`${acwrColor(a.acwrStatus)}15`,
                          border:`1px solid ${acwrColor(a.acwrStatus)}44`,
                          borderRadius:3, padding:"1px 5px" }}>{a.acwrStatus.replace("_"," ").toUpperCase()}</span>
                        {a.flags.map(f => (
                          <span key={f} style={{ fontSize:10 }}>{flagEmoji(f)}</span>
                        ))}
                      </div>
                      <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                        color:readColor(a.readiness), marginTop:3 }}>→ {a.ai}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Athlete Detail */}
              <div style={{ background:Z.panel, borderRadius:10,
                border:`1px solid ${rColor}44`, padding:16 }} key={selected.id}>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                  color:Z.muted, letterSpacing:2, marginBottom:10 }}>ATHLETE DETAIL</div>

                {/* Name + Stage */}
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", marginBottom:14 }}>
                  <div>
                    <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20,
                      fontWeight:700, color:rColor, letterSpacing:2, lineHeight:1,
                      textShadow:`0 0 16px ${rColor}44` }}>{selected.name.toUpperCase()}</div>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                      color:Z.muted, marginTop:2 }}>{selected.id} · {selected.pos}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                      color:stageColor(selected.stage), background:`${stageColor(selected.stage)}15`,
                      border:`1px solid ${stageColor(selected.stage)}44`,
                      borderRadius:4, padding:"2px 8px", marginBottom:4 }}>{selected.stage.toUpperCase()}</div>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                      color:Z.muted }}>{selected.history}d data</div>
                  </div>
                </div>

                {/* Score Cards */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
                  {[
                    { l:"Readiness", v:selected.readiness, c:readColor(selected.readiness), unit:"%" },
                    { l:"Fatigue",   v:selected.fatigue,   c: selected.fatigue > 60 ? Z.redBr : selected.fatigue > 40 ? Z.goldBr : Z.greenBr, unit:"%" },
                    { l:"Inj Risk",  v:selected.risk,      c: selected.risk > 50 ? Z.redBr : selected.risk > 30 ? Z.goldBr : Z.greenBr, unit:"%" },
                  ].map(s => (
                    <div key={s.l} style={{ background:Z.surface, borderRadius:8,
                      padding:"10px 8px", border:`1px solid ${s.c}33`, textAlign:"center" }}>
                      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:24,
                        fontWeight:700, color:s.c, textShadow:`0 0 12px ${s.c}44` }}>{s.v}{s.unit}</div>
                      <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                        color:Z.muted, letterSpacing:1 }}>{s.l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>

                {/* Wellness Row */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                    color:Z.muted, letterSpacing:2, marginBottom:6 }}>WELLNESS TODAY</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <WellnessDot value={selected.sleep} />
                    <WellnessDot value={selected.fatigue_raw} invert/>
                    <WellnessDot value={selected.soreness} invert/>
                    <WellnessDot value={selected.stress} invert/>
                    <WellnessDot value={selected.mood} />
                    <div style={{ marginLeft:4, fontFamily:"'Courier Prime',monospace",
                      fontSize:8, color:Z.muted, alignSelf:"center" }}>
                      💤⚡💪🧠😊
                    </div>
                  </div>
                </div>

                {/* ACWR Bar */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                      color:Z.muted, letterSpacing:2 }}>ACWR</span>
                    <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:14,
                      color:acwrColor(selected.acwrStatus), fontWeight:700 }}>{selected.acwr.toFixed(2)}</span>
                  </div>
                  <div style={{ height:6, background:Z.border, borderRadius:3 }}>
                    <div style={{ height:"100%", width:`${Math.min((selected.acwr/2)*100,100)}%`,
                      background:acwrColor(selected.acwrStatus), borderRadius:3,
                      boxShadow:`0 0 8px ${acwrColor(selected.acwrStatus)}66`,
                      transition:"width 1s ease" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:7, color:Z.muted }}>0</span>
                    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:7, color:Z.greenBr }}>0.8–1.3 optimal</span>
                    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:7, color:Z.redBr }}>1.5+ risk</span>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div style={{ background:`${rColor}10`, border:`1px solid ${rColor}33`,
                  borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                    color:Z.muted, letterSpacing:2, marginBottom:4 }}>🧠 AI RECOMMENDATION</div>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14,
                    color:rColor, fontWeight:600 }}>→ {selected.ai.toUpperCase()}</div>
                  <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                    color:Z.muted, marginTop:3 }}>Confidence: {selected.confidence}%</div>
                </div>

                {/* Flags */}
                {selected.flags.length > 0 && (
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                    {selected.flags.map(f => (
                      <span key={f} style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                        color:Z.goldBr, background:`${Z.goldBr}15`,
                        border:`1px solid ${Z.goldBr}44`, borderRadius:4, padding:"2px 8px" }}>
                        {flagEmoji(f)} {f.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ALERTS TAB ── */}
          {tab === "alerts" && (
            <div className="slide-up">
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                color:Z.muted, letterSpacing:2, marginBottom:12 }}>ACTIVE ALERTS</div>
              {ALERTS.map(al => (
                <div key={al.id} style={{ borderLeft:`3px solid ${sevColor(al.sev)}`,
                  background:`${sevColor(al.sev)}08`, borderRadius:"0 8px 8px 0",
                  padding:"12px 14px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                      color:sevColor(al.sev), letterSpacing:2,
                      textTransform:"uppercase" }}>{al.sev} · {al.cat}</span>
                    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                      color:Z.muted }}>{al.ts}</span>
                  </div>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13,
                    color:Z.stone, marginBottom:4 }}>{al.athlete}</div>
                  <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:11,
                    color:Z.white, lineHeight:1.5 }}>{al.msg}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── LOAD TAB ── */}
          {tab === "load" && (
            <div className="slide-up">
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                color:Z.muted, letterSpacing:2, marginBottom:12 }}>SQUAD ACWR STATUS</div>
              {ATHLETES.map(a => (
                <div key={a.id} style={{ background:Z.panel, borderRadius:8,
                  padding:"12px", marginBottom:8, border:`1px solid ${Z.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:8 }}>
                    <div>
                      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13,
                        fontWeight:600, color:Z.white }}>{a.name}</div>
                      <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                        color:Z.muted }}>{a.sessions} sessions this week</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20,
                        fontWeight:700, color:acwrColor(a.acwrStatus),
                        textShadow:`0 0 10px ${acwrColor(a.acwrStatus)}44` }}>{a.acwr.toFixed(2)}</div>
                      <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                        color:acwrColor(a.acwrStatus) }}>{a.acwrStatus.replace("_"," ").toUpperCase()}</div>
                    </div>
                  </div>
                  <div style={{ height:5, background:Z.border, borderRadius:3 }}>
                    <div style={{ height:"100%", borderRadius:3,
                      width:`${Math.min((a.acwr/2)*100,100)}%`,
                      background:acwrColor(a.acwrStatus),
                      boxShadow:`0 0 8px ${acwrColor(a.acwrStatus)}66`,
                      transition:"width 1s ease" }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0,
          background:`${Z.surface}f0`, borderTop:`1px solid ${Z.border}`,
          backdropFilter:"blur(12px)", padding:"8px 0",
          display:"flex", justifyContent:"space-around" }}>
          {[
            { t:"squad",  icon:"👥", label:"Squad" },
            { t:"alerts", icon:"🚨", label:"Alerts" },
            { t:"load",   icon:"📊", label:"Load" },
          ].map(n => (
            <button key={n.t} onClick={() => setTab(n.t as any)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center",
                gap:3, background:"transparent", border:"none", cursor:"pointer",
                padding:"4px 20px" }}>
              <span style={{ fontSize:20 }}>{n.icon}</span>
              <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                color: tab === n.t ? Z.goldBr : Z.muted,
                letterSpacing:1 }}>{n.label.toUpperCase()}</span>
              {tab === n.t && <div style={{ width:20, height:2, background:Z.goldBr,
                borderRadius:1, boxShadow:`0 0 6px ${Z.goldBr}` }}/>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
