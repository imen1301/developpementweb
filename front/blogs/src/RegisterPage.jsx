import { useState } from "react";
import { C, font, GOOGLE_FONTS } from "./theme/theme.js";

const API = "http://localhost:8000/api";

export default function RegisterPage({ goToLogin }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", password_confirmation:"" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setError("Tous les champs obligatoires doivent être remplis."); return; }
    if (form.password !== form.password_confirmation) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/register`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs = data.errors ? Object.values(data.errors).flat().join(" ") : data.message;
        throw new Error(msgs || "Erreur lors de l'inscription");
      }
      setSuccess("Compte créé avec succès ! Redirection...");
      setTimeout(goToLogin, 2000);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fi = (k) => ({ ...s.inputBox, ...(focused === k ? s.inputFocus : {}) });

  const strengthScore = () => {
    const p = form.password;
    if (!p) return 0;
    if (p.length >= 12) return 3;
    if (p.length >= 8)  return 2;
    return 1;
  };
  const strengthColor = [C.border, C.terra, C.blushDark, C.teal][strengthScore()];
  const strengthLabel = ["", "Faible", "Moyen", "Fort"][strengthScore()];

  return (
    <div style={s.bg}>
      <style>{GOOGLE_FONTS}</style>

      <div style={s.shape1} />
      <div style={s.shape2} />
      <div style={s.shape3} />

      <div style={s.wrapper}>
        {/* ── Left panel ── */}
        <div style={s.left}>
          <div style={s.leftContent}>

            <div style={s.brand}>
              <div style={s.brandIcon}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="2" width="12" height="16" rx="2" fill={C.white} fillOpacity="0.9"/>
                  <rect x="6" y="0" width="12" height="16" rx="2" fill={C.white} fillOpacity="0.35"/>
                  <rect x="5" y="7"  width="5"  height="1.4" rx="0.7" fill={C.navy}/>
                  <rect x="5" y="10" width="7"  height="1.4" rx="0.7" fill={C.navy}/>
                  <rect x="5" y="13" width="4"  height="1.4" rx="0.7" fill={C.navy}/>
                </svg>
              </div>
              <span style={s.brandName}>NoteFlow</span>
            </div>

            <div>
              <p style={s.heroEyebrow}>Nouveau membre</p>
              <h1 style={s.heroH1}>Rejoignez<br/><em style={{color:C.sage}}>NoteFlow.</em></h1>
              <p style={s.heroSub}>Créez votre espace personnel et commencez à organiser vos idées dès aujourd'hui.</p>
            </div>

            {/* Steps */}
            <div style={s.steps}>
              {[
                { num:"01", title:"Créer un compte", desc:"Remplissez le formulaire en quelques secondes" },
                { num:"02", title:"Se connecter",    desc:"Accédez à votre tableau de bord sécurisé" },
                { num:"03", title:"Gérer vos notes", desc:"Ajoutez, modifiez, classez par priorité" },
              ].map((step, i) => (
                <div key={i} style={s.step}>
                  <div style={s.stepNum}>{step.num}</div>
                  <div>
                    <p style={s.stepTitle}>{step.title}</p>
                    <p style={s.stepDesc}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.accentBadge}>
              <span style={s.accentEmoji}>🎯</span>
              <div>
                <p style={s.accentTitle}>Gratuit & sans limite</p>
                <p style={s.accentDesc}>Créez autant de notes que vous voulez.</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div style={s.right}>
          <div style={s.formCard}>

            <div style={s.formTop}>
              <p style={s.formEyebrow}>Inscription</p>
              <h2 style={s.formTitle}>Créer un compte</h2>
              <p style={s.formSub}>Tous les champs marqués * sont obligatoires.</p>
            </div>

            {error   && <div style={s.errorBox}><span style={s.msgIcon}>⚠</span>{error}</div>}
            {success && <div style={s.successBox}><span style={s.msgIcon}>✓</span>{success}</div>}

            {/* Name */}
            <div style={s.field}>
              <label style={s.label}>Nom d'utilisateur <span style={s.req}>*</span></label>
              <div style={fi("name")}>
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="5.5" r="3" stroke={C.teal} strokeWidth="1.3"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke={C.teal} strokeWidth="1.3" strokeLinecap="round"/></svg>
                <input style={s.input} type="text" placeholder="Jean Dupont"
                  value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
              </div>
            </div>

            {/* Email */}
            <div style={s.field}>
              <label style={s.label}>Adresse email <span style={s.req}>*</span></label>
              <div style={fi("email")}>
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke={C.teal} strokeWidth="1.3"/><path d="M2 4l6 5 6-5" stroke={C.teal} strokeWidth="1.3"/></svg>
                <input style={s.input} type="email" placeholder="vous@example.com"
                  value={form.email} onChange={e => setForm({...form, email:e.target.value})}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
              </div>
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label}>Mot de passe <span style={s.req}>*</span> <span style={s.hint}>(min. 8 car.)</span></label>
              <div style={fi("pwd")}>
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke={C.teal} strokeWidth="1.3"/><path d="M5 7V5a3 3 0 016 0v2" stroke={C.teal} strokeWidth="1.3"/><circle cx="8" cy="10.5" r="1" fill={C.teal}/></svg>
                <input style={s.input} type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password:e.target.value})}
                  onFocus={() => setFocused("pwd")} onBlur={() => setFocused("")} />
              </div>
              {form.password.length > 0 && (
                <div style={s.strengthWrap}>
                  <div style={s.strengthBg}>
                    <div style={{ ...s.strengthFill, width:`${[0,33,66,100][strengthScore()]}%`, background:strengthColor }} />
                  </div>
                  <span style={{ ...s.strengthLabel, color:strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div style={s.field}>
              <label style={s.label}>Confirmer le mot de passe <span style={s.req}>*</span></label>
              <div style={fi("cpwd")}>
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke={C.teal} strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke={C.teal} strokeWidth="1.3"/>
                  {form.password_confirmation.length > 0 && form.password === form.password_confirmation
                    ? <path d="M5.5 10.5l1.5 1.5 3-3" stroke={C.teal} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    : <circle cx="8" cy="10.5" r="1" fill={C.teal}/>
                  }
                </svg>
                <input style={s.input} type="password" placeholder="••••••••"
                  value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation:e.target.value})}
                  onFocus={() => setFocused("cpwd")} onBlur={() => setFocused("")}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                {form.password_confirmation.length > 0 && (
                  <span style={{color: form.password === form.password_confirmation ? C.teal : C.terra, fontSize:16}}>
                    {form.password === form.password_confirmation ? "✓" : "✕"}
                  </span>
                )}
              </div>
            </div>

            <button style={loading ? s.btnDisabled : s.btn} onClick={handleSubmit} disabled={loading}>
              {loading && <span style={s.spinner}/>}
              {loading ? "Création..." : "Créer mon compte →"}
            </button>

            <p style={s.footNote}>
              Déjà un compte ?{" "}
              <span style={s.footLink} onClick={goToLogin}>Se connecter</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  bg: { minHeight:"100vh", background:C.offwhite, display:"flex", alignItems:"stretch", position:"relative", overflow:"hidden", fontFamily:font.body },

  shape1: { position:"absolute", width:500, height:500, borderRadius:"50%", background:`radial-gradient(circle, ${C.tealLight} 0%, transparent 65%)`, top:-150, right:-100, pointerEvents:"none", animation:"float 13s ease-in-out infinite" },
  shape2: { position:"absolute", width:350, height:350, borderRadius:"50%", background:`radial-gradient(circle, ${C.sageLight} 0%, transparent 65%)`, bottom:-80, left:"30%", pointerEvents:"none", animation:"float 10s ease-in-out infinite 2s" },
  shape3: { position:"absolute", width:250, height:250, borderRadius:"50%", background:`radial-gradient(circle, ${C.blushLight} 0%, transparent 70%)`, top:"35%", right:"42%", pointerEvents:"none" },

  wrapper: { display:"flex", width:"100%", position:"relative", zIndex:1 },

  left: { flex:"0 0 44%", background:`linear-gradient(155deg, ${C.navy} 0%, #1A2440 60%, #152038 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:52, overflow:"hidden" },
  leftContent: { display:"flex", flexDirection:"column", gap:36, maxWidth:360, animation:"fadeUp 0.7s ease" },

  brand: { display:"flex", alignItems:"center", gap:12 },
  brandIcon: { width:48, height:48, borderRadius:14, background:`${C.teal}30`, border:`1px solid rgba(255,255,255,0.14)`, display:"flex", alignItems:"center", justifyContent:"center" },
  brandName: { color:C.white, fontSize:22, fontWeight:600 },

  heroEyebrow: { fontSize:12, letterSpacing:"2px", textTransform:"uppercase", color:C.blush, fontWeight:500, marginBottom:12 },
  heroH1: { fontFamily:font.display, fontSize:46, color:C.white, lineHeight:1.2, marginBottom:14 },
  heroSub: { color:"rgba(255,255,255,0.62)", fontSize:14, lineHeight:1.8 },

  steps: { display:"flex", flexDirection:"column", gap:20 },
  step: { display:"flex", alignItems:"flex-start", gap:16 },
  stepNum: { minWidth:36, height:36, borderRadius:10, background:`${C.teal}30`, border:`1px solid ${C.teal}60`, display:"flex", alignItems:"center", justifyContent:"center", color:C.blush, fontSize:12, fontWeight:700, letterSpacing:"0.5px" },
  stepTitle: { color:C.white, fontSize:14, fontWeight:500, marginBottom:3 },
  stepDesc: { color:"rgba(255,255,255,0.5)", fontSize:12, lineHeight:1.6 },

  accentBadge: { display:"flex", alignItems:"center", gap:14, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:"14px 18px" },
  accentEmoji: { fontSize:24 },
  accentTitle: { color:C.white, fontSize:14, fontWeight:600, marginBottom:3 },
  accentDesc: { color:"rgba(255,255,255,0.55)", fontSize:12 },

  right: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 64px", overflowY:"auto" },
  formCard: { width:"100%", maxWidth:440, animation:"fadeUp 0.6s ease 0.1s both" },

  formTop: { marginBottom:28 },
  formEyebrow: { fontSize:12, letterSpacing:"2px", textTransform:"uppercase", color:C.teal, fontWeight:600, marginBottom:10 },
  formTitle: { fontFamily:font.display, fontSize:34, color:C.navy, lineHeight:1.2, marginBottom:8 },
  formSub: { fontSize:13, color:C.textMuted, lineHeight:1.5 },

  errorBox:   { display:"flex", alignItems:"center", gap:10, background:C.terraLight, border:`1px solid #F0C0C0`, borderRadius:10, padding:"12px 16px", marginBottom:16, color:C.terraDark, fontSize:14 },
  successBox: { display:"flex", alignItems:"center", gap:10, background:C.tealLight,  border:`1px solid ${C.sage}`,    borderRadius:10, padding:"12px 16px", marginBottom:16, color:C.tealDark,  fontSize:14 },
  msgIcon: { fontSize:16, flexShrink:0 },

  field: { marginBottom:18 },
  label: { display:"block", fontSize:13, color:C.navy, fontWeight:500, marginBottom:7 },
  req: { color:C.terra },
  hint: { color:C.textLight, fontSize:11, fontWeight:400 },
  inputBox: { display:"flex", alignItems:"center", gap:10, background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"0 16px", height:52, transition:"all 0.2s" },
  inputFocus: { borderColor:C.teal, boxShadow:`0 0 0 4px ${C.tealLight}80` },
  input: { flex:1, border:"none", outline:"none", fontSize:15, color:C.navy, background:"transparent" },

  strengthWrap: { display:"flex", alignItems:"center", gap:10, marginTop:6 },
  strengthBg: { flex:1, height:4, background:C.border, borderRadius:4, overflow:"hidden" },
  strengthFill: { height:"100%", borderRadius:4, transition:"width 0.4s, background 0.4s" },
  strengthLabel: { fontSize:12, fontWeight:500, minWidth:40 },

  btn: { width:"100%", height:52, background:`linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, color:C.white, border:"none", borderRadius:12, fontSize:16, fontWeight:600, cursor:"pointer", boxShadow:`0 8px 24px ${C.teal}40`, display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4 },
  btnDisabled: { width:"100%", height:52, background:C.sage, color:C.white, border:"none", borderRadius:12, fontSize:16, cursor:"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4 },
  spinner: { width:16, height:16, borderRadius:"50%", border:`2px solid rgba(255,255,255,0.3)`, borderTopColor:C.white, animation:"spin 0.8s linear infinite" },

  footNote: { textAlign:"center", fontSize:13, color:C.textLight, marginTop:20 },
  footLink: { color:C.teal, fontWeight:600, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3 },
};