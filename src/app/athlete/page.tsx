"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react" ;
const Z = {
  bg:       "#080c08",
  surface:  "#0d140d",
  panel:    "#111a0f",
  border:   "#1e3318",
  green:    "#2d7a2d",
  greenBr:  "#4caf50",
  gold:     "#d4a017",
  goldBr:   "#ffd54f",
  red:      "#c62828",
  redBr:    "#ef5350",
  white:    "#f5f5e8",
  muted:    "#4a6440",
  stone:    "#8a9e7a",
};

const METRICS = [
  { key:"sleep_quality",   label:"Sleep Quality",   low:"Poor sleep",    high:"Perfect sleep",  emoji:"💤", invert:false },
  { key:"fatigue_level",   label:"Fatigue Level",   low:"Fully fresh",   high:"Exhausted",      emoji:"⚡", invert:true  },
  { key:"muscle_soreness", label:"Muscle Soreness", low:"No soreness",   high:"Very sore",      emoji:"💪", invert:true  },
  { key:"stress_level",    label:"Stress Level",    low:"No stress",     high:"Very stressed",  emoji:"🧠", invert:true  },
  { key:"mood",            label:"Mood",            low:"Low mood",      high:"Great mood",     emoji:"😊", invert:false },
];

const sliderColor = (val: number, invert: boolean) => {
  const v = invert ? 11 - val : val;
  if (v >= 8) return Z.greenBr;
  if (v >= 5) return Z.goldBr;
  return Z.redBr;
};

 function AthletePage() {
    const searchParams = useSearchParams();
    const athleteId = searchParams.get('id') || 'unknown';

  const [step, setStep]       = useState<"checkin"|"rpe"|"context"|"done">("checkin");
  const [values, setValues]   = useState({ sleep_quality:5, fatigue_level:5, muscle_soreness:5, stress_level:5, mood:5 });
  const [rpe, setRpe]         = useState(5);
  const [duration, setDuration] = useState(60);
  const [flags, setFlags]     = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const toggleFlag = (f: string) =>
    setFlags(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleCheckinSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setStep("rpe");
  };

  const handleRpeSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setStep("context");
  };

  const handleContextSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setFeedback("Mangwanani! 🌅 Your wellness looks good today. Sleep and mood are strong. Keep your training load moderate — you are building well. Tatenda! 💪🇿🇼");
    setSubmitting(false);
    setStep("done");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Courier+Prime:wght@400;700&family=Black+Han+Sans&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:${Z.bg}; color:${Z.white}; font-family:'Courier Prime',monospace; }
        input[type=range] { -webkit-appearance:none; width:100%; height:6px; border-radius:3px; outline:none; cursor:pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:24px; height:24px; border-radius:50%; cursor:pointer; border:2px solid ${Z.bg}; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .slide-up { animation: slide-up 0.4s ease forwards; }
      `}</style>

      <div style={{ minHeight:"100vh", background:Z.bg, paddingBottom:40 }}>

        {/* Header */}
        <div style={{ background:Z.surface, borderBottom:`2px solid ${Z.border}`,
          padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
          position:"sticky", top:0, zIndex:50 }}>
          <div>
            <div style={{ fontFamily:"'Black Han Sans',sans-serif", fontSize:24,
              color:Z.gold, letterSpacing:4, textShadow:`0 0 20px ${Z.gold}44` }}>GUNDA</div>
            <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
              color:Z.muted, letterSpacing:2 }}>ATHLETE PORTAL</div>
          </div>
          {/* Zimbabwe flag strip */}
          <div style={{ display:"flex", height:28, borderRadius:4, overflow:"hidden" }}>
            {["#1B5E20","#F9A825","#C62828","#1A1A1A"].map((c,i) => (
              <div key={i} style={{ width:8, background:c }}/>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display:"flex", gap:4, padding:"12px 20px", background:Z.surface }}>
          {(["checkin","rpe","context","done"] as const).map((s, i) => {
            const current = ["checkin","rpe","context","done"].indexOf(step);
            const isActive = i <= current;
            return (
              <div key={s} style={{ flex:1, height:3, borderRadius:2,
                background: isActive ? Z.goldBr : Z.border,
                boxShadow: isActive ? `0 0 6px ${Z.goldBr}88` : "none",
                transition:"all 0.4s ease" }}/>
            );
          })}
        </div>

        <div style={{ padding:"20px 20px 0", maxWidth:480, margin:"0 auto" }}>

          {/* ── STEP 1: DAILY CHECK-IN ── */}
          {step === "checkin" && (
            <div className="slide-up">
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, fontWeight:700,
                  color:Z.gold, letterSpacing:2, marginBottom:4 }}>DAILY CHECK-IN</div>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, color:Z.stone }}>
                  Rate how you feel this morning. Be honest — this protects your body.
                </div>
              </div>

              {METRICS.map(m => {
                const val = values[m.key as keyof typeof values];
                const color = sliderColor(val, m.invert);
                return (
                  <div key={m.key} style={{ marginBottom:24,
                    background:Z.panel, borderRadius:10, padding:"16px",
                    border:`1px solid ${Z.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:18 }}>{m.emoji}</span>
                        <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:14,
                          fontWeight:600, color:Z.white, letterSpacing:1 }}>{m.label}</span>
                      </div>
                      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:26,
                        fontWeight:700, color, textShadow:`0 0 12px ${color}66`,
                        transition:"color 0.3s ease" }}>{val}</div>
                    </div>
                    <input type="range" min={1} max={10} value={val}
                      onChange={e => setValues(prev => ({ ...prev, [m.key]: parseInt(e.target.value) }))}
                      style={{ background:`linear-gradient(to right, ${color} ${(val-1)/9*100}%, ${Z.border} ${(val-1)/9*100}%)` }}/>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                      <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>{m.low}</span>
                      <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>{m.high}</span>
                    </div>
                  </div>
                );
              })}

              <button onClick={handleCheckinSubmit} disabled={submitting}
                style={{ width:"100%", padding:"16px", borderRadius:10, border:"none",
                  background: submitting ? Z.border : `linear-gradient(135deg, ${Z.green}, ${Z.greenBr})`,
                  color:Z.white, fontFamily:"'Oswald',sans-serif", fontSize:16, fontWeight:700,
                  letterSpacing:3, cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: submitting ? "none" : `0 4px 20px ${Z.green}66`,
                  transition:"all 0.3s ease" }}>
                {submitting ? "SUBMITTING..." : "SUBMIT CHECK-IN →"}
              </button>
            </div>
          )}

          {/* ── STEP 2: RPE LOG ── */}
          {step === "rpe" && (
            <div className="slide-up">
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, fontWeight:700,
                  color:Z.gold, letterSpacing:2, marginBottom:4 }}>SESSION LOG</div>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, color:Z.stone }}>
                  Log your most recent training session.
                </div>
              </div>

              {/* RPE Slider */}
              <div style={{ background:Z.panel, borderRadius:10, padding:16,
                border:`1px solid ${Z.border}`, marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:14,
                    fontWeight:600, color:Z.white }}>💥 Session Effort (RPE)</span>
                  <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:26,
                    fontWeight:700, color: sliderColor(rpe, false),
                    textShadow:`0 0 12px ${sliderColor(rpe,false)}66` }}>{rpe}</span>
                </div>
                <input type="range" min={1} max={10} value={rpe}
                  onChange={e => setRpe(parseInt(e.target.value))}
                  style={{ background:`linear-gradient(to right, ${sliderColor(rpe,false)} ${(rpe-1)/9*100}%, ${Z.border} ${(rpe-1)/9*100}%)` }}/>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                  <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>Very easy</span>
                  <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>Maximum effort</span>
                </div>
              </div>

              {/* Duration */}
              <div style={{ background:Z.panel, borderRadius:10, padding:16,
                border:`1px solid ${Z.border}`, marginBottom:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:14,
                    fontWeight:600, color:Z.white }}>⏱ Duration (minutes)</span>
                  <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:26,
                    fontWeight:700, color:Z.goldBr }}>{duration}</span>
                </div>
                <input type="range" min={10} max={180} step={5} value={duration}
                  onChange={e => setDuration(parseInt(e.target.value))}
                  style={{ background:`linear-gradient(to right, ${Z.goldBr} ${(duration-10)/170*100}%, ${Z.border} ${(duration-10)/170*100}%)` }}/>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                  <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>10 min</span>
                  <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, color:Z.muted }}>180 min</span>
                </div>
              </div>

              {/* Session Load */}
              <div style={{ background:`${Z.gold}12`, border:`1px solid ${Z.gold}44`,
                borderRadius:10, padding:14, marginBottom:24, textAlign:"center" }}>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10,
                  color:Z.muted, letterSpacing:2, marginBottom:4 }}>SESSION LOAD</div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:36,
                  fontWeight:700, color:Z.goldBr,
                  textShadow:`0 0 20px ${Z.goldBr}66` }}>{rpe * duration}</div>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                  color:Z.muted, marginTop:2 }}>RPE {rpe} × {duration} minutes</div>
              </div>

              <button onClick={handleRpeSubmit} disabled={submitting}
                style={{ width:"100%", padding:"16px", borderRadius:10, border:"none",
                  background: submitting ? Z.border : `linear-gradient(135deg, ${Z.green}, ${Z.greenBr})`,
                  color:Z.white, fontFamily:"'Oswald',sans-serif", fontSize:16, fontWeight:700,
                  letterSpacing:3, cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: submitting ? "none" : `0 4px 20px ${Z.green}66`,
                  transition:"all 0.3s ease" }}>
                {submitting ? "SUBMITTING..." : "LOG SESSION →"}
              </button>

              <button onClick={() => setStep("context")}
                style={{ width:"100%", padding:"12px", borderRadius:10, border:`1px solid ${Z.border}`,
                  background:"transparent", color:Z.muted, fontFamily:"'Courier Prime',monospace",
                  fontSize:11, cursor:"pointer", marginTop:10 }}>
                Skip — no session today
              </button>
            </div>
          )}

          {/* ── STEP 3: CONTEXT ── */}
          {step === "context" && (
            <div className="slide-up">
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, fontWeight:700,
                  color:Z.gold, letterSpacing:2, marginBottom:4 }}>CONTEXT FLAGS</div>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, color:Z.stone }}>
                  Is anything happening that might affect your training? Tap all that apply.
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
                {[
                  { key:"travel",     label:"Travelling",      emoji:"✈️",  desc:"Away from home" },
                  { key:"match_soon", label:"Match Soon",       emoji:"⚽",  desc:"Competition in 1–3 days" },
                  { key:"illness",    label:"Feeling Sick",     emoji:"🤒",  desc:"Cold, flu or illness" },
                  { key:"injury",     label:"New Injury",       emoji:"🩺",  desc:"Pain or injury" },
                  { key:"stress",     label:"High Stress",      emoji:"⚠️",  desc:"Personal or life stress" },
                  { key:"tired",      label:"Very Tired",       emoji:"😴",  desc:"Beyond normal fatigue" },
                ].map(f => {
                  const active = flags.includes(f.key);
                  return (
                    <button key={f.key} onClick={() => toggleFlag(f.key)}
                      style={{ background: active ? `${Z.gold}20` : Z.panel,
                        border: `2px solid ${active ? Z.goldBr : Z.border}`,
                        borderRadius:10, padding:"14px 12px", cursor:"pointer",
                        textAlign:"left", transition:"all 0.2s ease",
                        boxShadow: active ? `0 0 16px ${Z.gold}33` : "none" }}>
                      <div style={{ fontSize:24, marginBottom:6 }}>{f.emoji}</div>
                      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13,
                        fontWeight:600, color: active ? Z.goldBr : Z.white,
                        letterSpacing:1, marginBottom:2 }}>{f.label}</div>
                      <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                        color:Z.muted }}>{f.desc}</div>
                    </button>
                  );
                })}
              </div>

              <button onClick={handleContextSubmit} disabled={submitting}
                style={{ width:"100%", padding:"16px", borderRadius:10, border:"none",
                  background: submitting ? Z.border : `linear-gradient(135deg, ${Z.green}, ${Z.greenBr})`,
                  color:Z.white, fontFamily:"'Oswald',sans-serif", fontSize:16, fontWeight:700,
                  letterSpacing:3, cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: submitting ? "none" : `0 4px 20px ${Z.green}66`,
                  transition:"all 0.3s ease" }}>
                {submitting ? "ANALYSING..." : flags.length > 0 ? "SUBMIT FLAGS →" : "ALL GOOD →"}
              </button>
            </div>
          )}

          {/* ── STEP 4: DONE + AI FEEDBACK ── */}
          {step === "done" && (
            <div className="slide-up">
              <div style={{ textAlign:"center", marginBottom:28 }}>
                <div style={{ fontSize:56, marginBottom:12 }}>✅</div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:24,
                  fontWeight:700, color:Z.goldBr, letterSpacing:3, marginBottom:6 }}>
                  CHECK-IN COMPLETE
                </div>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:11,
                  color:Z.stone }}>Your data has been sent to the AI pipeline.</div>
              </div>

              {/* AI Feedback */}
              <div style={{ background:`${Z.green}15`, border:`2px solid ${Z.green}55`,
                borderRadius:12, padding:20, marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <span style={{ fontSize:24 }}>🧠</span>
                  <div>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                      color:Z.greenBr, letterSpacing:2 }}>HEAD SUPERVISOR AI</div>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:8,
                      color:Z.muted }}>Personalised feedback</div>
                  </div>
                </div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15,
                  color:Z.white, lineHeight:1.6, fontWeight:400 }}>
                  "{feedback}"
                </div>
              </div>

              {/* Today's summary */}
              <div style={{ background:Z.panel, border:`1px solid ${Z.border}`,
                borderRadius:12, padding:16, marginBottom:24 }}>
                <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9,
                  color:Z.muted, letterSpacing:2, marginBottom:12 }}>TODAY'S SUMMARY</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                  {METRICS.map(m => {
                    const val = values[m.key as keyof typeof values];
                    const color = sliderColor(val, m.invert);
                    return (
                      <div key={m.key} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:16, marginBottom:4 }}>{m.emoji}</div>
                        <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18,
                          fontWeight:700, color, textShadow:`0 0 8px ${color}66` }}>{val}</div>
                        <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:7,
                          color:Z.muted, marginTop:2 }}>{m.label.split(" ")[0].toUpperCase()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button onClick={() => { setStep("checkin"); setValues({ sleep_quality:5, fatigue_level:5, muscle_soreness:5, stress_level:5, mood:5 }); setFlags([]); setRpe(5); setDuration(60); setFeedback(""); }}
                style={{ width:"100%", padding:"14px", borderRadius:10,
                  border:`1px solid ${Z.border}`, background:"transparent",
                  color:Z.muted, fontFamily:"'Courier Prime',monospace",
                  fontSize:11, cursor:"pointer", letterSpacing:1 }}>
                Start New Check-In
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AthletePageWrapper() {
  return (
    <Suspense fallback={<div style={{background:"#080c08",minHeight:"100vh"}}/>}>
      <AthletePage/>
    </Suspense>
  );
}

