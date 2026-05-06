import { useState } from "react";
import { C, font, GOOGLE_FONTS } from "./theme/theme.js";

const API = "http://localhost:8000/api";

export default function LoginPage({ onLogin, goToRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Identifiants incorrects");
      onLogin(data.token, data.user);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fi = (k) => ({ ...s.inputBox, ...(focused === k ? s.inputFocus : {}) });

  return (
    <div style={s.bg}>
      <style>{GOOGLE_FONTS}</style>

      {/* Decorative shapes */}
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

            <div style={s.heroBlock}>
              <p style={s.heroEyebrow}>Bienvenue</p>
              <h1 style={s.heroH1}>Capturez.<br/><em>Organisez.</em><br/>Réussissez.</h1>
              <p style={s.heroSub}>Votre espace de notes personnel, sécurisé et toujours disponible.</p>
            </div>

            <div style={s.pillsRow}>
              {["Priorités visuelles", "Accès sécurisé", "Interface rapide"].map((t, i) => (
                <div key={i} style={s.pill}>{t}</div>
              ))}
            </div>

            <div style={s.quoteCard}>
              <p style={s.quoteText}>« Une bonne note vaut mieux qu'une mauvaise mémoire. »</p>
            </div>
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div style={s.right}>
          <div style={s.formCard}>
            <div style={s.formTop}>
              <p style={s.formEyebrow}>Connexion</p>
              <h2 style={s.formTitle}>Bon retour 👋</h2>
              <p style={s.formSub}>Entrez vos identifiants pour accéder à vos notes.</p>
            </div>

            {error && (
              <div style={s.errorBox}>
                <span style={s.errorDot}>!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div style={s.field}>
              <label style={s.label}>Adresse email</label>
              <div style={fi("email")}>
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke={C.teal} strokeWidth="1.3"/><path d="M2 4l6 5 6-5" stroke={C.teal} strokeWidth="1.3"/></svg>
                <input style={s.input} type="email" placeholder="vous@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label}>Mot de passe</label>
              <div style={fi("pwd")}>
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke={C.teal} strokeWidth="1.3"/><path d="M5 7V5a3 3 0 016 0v2" stroke={C.teal} strokeWidth="1.3"/><circle cx="8" cy="10.5" r="1" fill={C.teal}/></svg>
                <input style={s.input} type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused("pwd")} onBlur={() => setFocused("")}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
            </div>

            <button style={loading ? s.btnDisabled : s.btn} onClick={handleSubmit} disabled={loading}>
              {loading && <span style={s.spinner} />}
              {loading ? "Connexion..." : "Se connecter →"}
            </button>

            <div style={s.divRow}>
              <div style={s.divLine} /><span style={s.divText}>ou</span><div style={s.divLine} />
            </div>

            <button style={s.btnGhost} onClick={goToRegister}>
              Créer un nouveau compte
            </button>

            <p style={s.footNote}>
              Pas encore de compte ?{" "}
              <span style={s.footLink} onClick={goToRegister}>S'inscrire gratuitement</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  bg: { minHeight:"100vh", background:C.offwhite, display:"flex", alignItems:"stretch", position:"relative", overflow:"hidden", fontFamily:font.body },

  shape1: { position:"absolute", width:500, height:500, borderRadius:"50%", background:`radial-gradient(circle, ${C.sage}55 0%, transparent 65%)`, top:-180, left:-120, pointerEvents:"none" },
  shape2: { position:"absolute", width:400, height:400, borderRadius:"50%", background:`radial-gradient(circle, ${C.blush}44 0%, transparent 65%)`, bottom:-100, right:-80, pointerEvents:"none", animation:"float 14s ease-in-out infinite" },
  shape3: { position:"absolute", width:250, height:250, borderRadius:"50%", background:`radial-gradient(circle, ${C.tealLight} 0%, transparent 70%)`, top:"40%", right:"38%", pointerEvents:"none", animation:"float 10s ease-in-out infinite 3s" },

  wrapper: { display:"flex", width:"100%", position:"relative", zIndex:1 },

  left: { flex:"0 0 46%", background:`linear-gradient(155deg, ${C.navy} 0%, #1A2440 60%, #152038 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:56, position:"relative", overflow:"hidden" },
  leftContent: { display:"flex", flexDirection:"column", gap:44, maxWidth:380, animation:"fadeUp 0.7s ease" },

  brand: { display:"flex", alignItems:"center", gap:12 },
  brandIcon: { width:48, height:48, borderRadius:14, background:`rgba(${parseInt(C.teal.slice(1,3),16)},${parseInt(C.teal.slice(3,5),16)},${parseInt(C.teal.slice(5,7),16)},0.2)`, border:`1px solid rgba(255,255,255,0.15)`, display:"flex", alignItems:"center", justifyContent:"center" },
  brandName: { color:C.white, fontSize:22, fontWeight:600, letterSpacing:"-0.3px" },

  heroBlock: {},
  heroEyebrow: { fontSize:12, letterSpacing:"2px", textTransform:"uppercase", color:C.blush, fontWeight:500, marginBottom:14 },
  heroH1: { fontFamily:font.display, fontSize:52, color:C.white, lineHeight:1.18, marginBottom:18, fontStyle:"normal" },
  heroSub: { color:"rgba(255,255,255,0.62)", fontSize:15, lineHeight:1.8, maxWidth:320 },

  pillsRow: { display:"flex", flexWrap:"wrap", gap:8 },
  pill: { padding:"6px 14px", borderRadius:20, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)", color:"rgba(255,255,255,0.8)", fontSize:13 },

  quoteCard: { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderLeft:`3px solid ${C.blush}`, borderRadius:"0 12px 12px 0", padding:"16px 20px", backdropFilter:"blur(10px)" },
  quoteText: { color:"rgba(255,255,255,0.7)", fontSize:14, lineHeight:1.7, fontStyle:"italic" },

  right: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 64px" },
  formCard: { width:"100%", maxWidth:420, animation:"fadeUp 0.6s ease 0.1s both" },

  formTop: { marginBottom:32 },
  formEyebrow: { fontSize:12, letterSpacing:"2px", textTransform:"uppercase", color:C.teal, fontWeight:600, marginBottom:10 },
  formTitle: { fontFamily:font.display, fontSize:36, color:C.navy, lineHeight:1.2, marginBottom:8 },
  formSub: { fontSize:14, color:C.textMuted, lineHeight:1.6 },

  errorBox: { display:"flex", alignItems:"center", gap:10, background:C.terraLight, border:`1px solid #F0C0C0`, borderRadius:10, padding:"12px 16px", marginBottom:20, color:C.terraDark, fontSize:14 },
  errorDot: { minWidth:22, height:22, borderRadius:"50%", background:C.terra, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 },

  field: { marginBottom:20 },
  label: { display:"block", fontSize:13, color:C.navy, fontWeight:500, marginBottom:8 },
  inputBox: { display:"flex", alignItems:"center", gap:10, background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"0 16px", height:52, transition:"border-color 0.2s, box-shadow 0.2s" },
  inputFocus: { borderColor:C.teal, boxShadow:`0 0 0 4px ${C.tealLight}80` },
  input: { flex:1, border:"none", outline:"none", fontSize:15, color:C.navy, background:"transparent" },

  btn: { width:"100%", height:52, background:`linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, color:C.white, border:"none", borderRadius:12, fontSize:16, fontWeight:600, cursor:"pointer", letterSpacing:"0.2px", boxShadow:`0 8px 24px ${C.teal}40`, transition:"opacity 0.2s" },
  btnDisabled: { width:"100%", height:52, background:C.sage, color:C.white, border:"none", borderRadius:12, fontSize:16, cursor:"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  spinner: { width:16, height:16, borderRadius:"50%", border:`2px solid rgba(255,255,255,0.3)`, borderTopColor:C.white, animation:"spin 0.8s linear infinite", display:"inline-block" },

  divRow: { display:"flex", alignItems:"center", gap:12, margin:"20px 0" },
  divLine: { flex:1, height:1, background:C.border },
  divText: { color:C.textLight, fontSize:13 },

  btnGhost: { width:"100%", height:48, background:"transparent", color:C.teal, border:`1.5px solid ${C.teal}`, borderRadius:12, fontSize:15, fontWeight:500, cursor:"pointer" },

  footNote: { textAlign:"center", fontSize:13, color:C.textLight, marginTop:18 },
  footLink: { color:C.teal, fontWeight:600, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3 },
};