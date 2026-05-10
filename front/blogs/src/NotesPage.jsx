import { useState, useEffect } from "react";
import { C, font, GOOGLE_FONTS, PRIORITY } from "./theme/theme.js";

const API = "http://localhost:8000/api";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useState(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  });
  return isMobile;
};

const exportNotePDF = (note) => {
  const pc   = PRIORITY[note.priority] || PRIORITY.basse;
  const date = new Date(note.created_at).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" });
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>${note.title}</title>
  <style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#fff;color:#212e53;padding:60px}
  .header{border-bottom:3px solid ${pc.color};padding-bottom:20px;margin-bottom:32px}.brand{font-size:13px;font-weight:600;letter-spacing:2px;color:#888;text-transform:uppercase;margin-bottom:12px}
  h1{font-family:'Playfair Display',serif;font-size:32px;color:#212e53;line-height:1.3}.meta{display:flex;align-items:center;gap:16px;margin-top:14px}
  .badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:${pc.bg};color:${pc.text}}
  .dot{width:7px;height:7px;border-radius:50%;background:${pc.color}}.date{font-size:13px;color:#999}
  .content{font-size:16px;line-height:1.9;color:#444;white-space:pre-wrap}.footer{margin-top:60px;font-size:11px;color:#ccc;text-align:center}
  @media print{body{padding:40px}}</style></head><body>
  <div class="header"><div class="brand">NoteFlow</div><h1>${note.title}</h1>
  <div class="meta"><span class="badge"><span class="dot"></span>${pc.label}</span><span class="date">${date}</span></div></div>
  ${note.content ? `<div class="content">${note.content}</div>` : "<p style='color:#bbb;font-style:italic'>Aucun contenu.</p>"}
  <div class="footer">Exporté depuis NoteFlow</div>
  <script>window.onload=()=>{window.print()}<\/script></body></html>`;
  const blob = new Blob([html], { type:"text/html" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank");
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export default function NotesPage({ token, user, onLogout }) {
  const [notes, setNotes]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState({ title:"", content:"", priority:"moyenne" });
  const [editingId, setEditingId]   = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [toast, setToast]           = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [filter, setFilter]         = useState("all");
  const [focused, setFocused]       = useState("");
  const isMobile                    = useIsMobile();

  const hdrs = { "Content-Type":"application/json", "Accept":"application/json", Authorization:`Bearer ${token}` };

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  const fetchNotes = async () => {
    try {
      const res  = await fetch(`${API}/notes`, { headers:hdrs });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setNotes(data.notes || data);
    } catch { showToast("Impossible de charger les notes.", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const isTitleEmpty = !form.title.trim();

  const handleSave = async () => {
    if (isTitleEmpty)            { showToast("Le titre est obligatoire.", "error"); return; }
    if (form.title.length > 100) { showToast("Titre trop long (max 100 car.).", "error"); return; }
    try {
      const url    = editingId ? `${API}/notes/${editingId}` : `${API}/notes`;
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers:hdrs, body:JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erreur"); }
      showToast(editingId ? "Note modifiée ✓" : "Note créée ✓");
      resetForm(); fetchNotes();
    } catch(e) { showToast(e.message, "error"); }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/notes/${id}`, { method:"DELETE", headers:hdrs });
      showToast("Note supprimée.");
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch { showToast("Erreur suppression.", "error"); }
    finally { setConfirmDel(null); }
  };

  const startEdit = (note) => {
    setForm({ title:note.title, content:note.content||"", priority:note.priority });
    setEditingId(note.id); setShowForm(true);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const resetForm = () => { setForm({ title:"", content:"", priority:"moyenne" }); setEditingId(null); setShowForm(false); };

  const handleLogout = async () => {
    try { await fetch(`${API}/logout`, { method:"POST", headers:hdrs }); } catch {}
    onLogout();
  };

  const sorted = [...notes]
    .filter(n => filter === "all" || n.priority === filter)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const fmtDate = (str) => new Date(str).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" });

  const counts = {
    total:   notes.length,
    haute:   notes.filter(n => n.priority==="haute").length,
    moyenne: notes.filter(n => n.priority==="moyenne").length,
    basse:   notes.filter(n => n.priority==="basse").length,
  };

  const fi = (k) => ({ ...s.finput, ...(focused===k ? s.finputFocus:{}) });

  return (
    <div style={s.bg}>
      <style>{GOOGLE_FONTS}</style>

      {toast && (
        <div style={{ ...s.toast, background: toast.type==="error" ? C.terra : C.teal }}>
          {toast.type==="error" ? "⚠ " : "✓ "}{toast.msg}
        </div>
      )}

      {confirmDel && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, margin: isMobile ? "0 16px" : 0 }}>
            <div style={s.modalIconWrap}>
              <svg width="28" height="28" fill="none" viewBox="0 0 28 28"><path d="M5 8h18M10 8V6a2 2 0 014 0v2m3 0l-1 14H8L7 8" stroke={C.terra} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 style={s.modalTitle}>Supprimer cette note ?</h3>
            <p style={s.modalDesc}>Cette action est définitive et ne peut pas être annulée.</p>
            <div style={s.modalBtns}>
              <button style={s.mBtnCancel} onClick={() => setConfirmDel(null)}>Annuler</button>
              <button style={s.mBtnDel} onClick={() => handleDelete(confirmDel)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ ...s.header, padding: isMobile ? "10px 16px" : "0 40px", height: isMobile ? "auto" : 68 }}>
        <div style={s.hLeft}>
          <div style={s.hLogo}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="12" height="16" rx="2" fill={C.teal} fillOpacity="0.9"/>
              <rect x="6" y="0" width="12" height="16" rx="2" fill={C.blush} fillOpacity="0.5"/>
              <rect x="5" y="7" width="5" height="1.4" rx="0.7" fill={C.white}/>
              <rect x="5" y="10" width="7" height="1.4" rx="0.7" fill={C.white}/>
              <rect x="5" y="13" width="4" height="1.4" rx="0.7" fill={C.white}/>
            </svg>
          </div>
          <div>
            <h1 style={{ ...s.hBrand, fontSize: isMobile ? 16 : 18 }}>NoteFlow</h1>
            <p style={s.hWelcome}>Bonjour</p>
          </div>
        </div>
        <div style={s.hRight}>
          <button style={{ ...s.btnNew, padding: isMobile ? "8px 12px" : "10px 20px", fontSize: isMobile ? 12 : 14 }}
            onClick={() => { resetForm(); setShowForm(true); }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            {isMobile ? "Nouveau" : "Nouvelle note"}
          </button>
          <button style={{ ...s.btnLogout, padding: isMobile ? "8px 10px" : "10px 18px", fontSize: isMobile ? 12 : 14 }}
            onClick={handleLogout}>
            {isMobile ? "←" : "Déconnexion"}
          </button>
        </div>
      </header>

      <main style={{ ...s.main, padding: isMobile ? "16px 14px" : "36px 40px" }}>

        {/* Stats */}
        <div style={{ ...s.statsGrid, gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 10 : 16, marginBottom: isMobile ? 18 : 32 }}>
          {[
            { label:"Total",   value:counts.total,   color:C.navy,      bg:"#EEF0F5",    icon:"📋" },
            { label:"Haute",   value:counts.haute,   color:C.terra,     bg:C.terraLight, icon:"▲" },
            { label:"Moyenne", value:counts.moyenne, color:C.blushDark, bg:C.blushLight, icon:"●" },
            { label:"Basse",   value:counts.basse,   color:C.teal,      bg:C.tealLight,  icon:"▼" },
          ].map((st,i) => (
            <div key={i} style={{ ...s.statCard, background:st.bg, padding: isMobile ? "10px 12px" : "18px 20px" }}>
              <div style={{ ...s.statIconWrap, color:st.color }}>{st.icon}</div>
              <div>
                <p style={{ ...s.statNum, color:st.color, fontSize: isMobile ? 20 : 26 }}>{st.value}</p>
                <p style={s.statLabel}>{st.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ ...s.formCard, marginBottom: isMobile ? 16 : 32 }}>
            <div style={s.formHdr}>
              <div style={s.formHdrLeft}>
                <div style={s.formHdrIcon}>
                  {editingId
                    ? <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 14l3-1L13 5l-2-2-8 8-1 3z" stroke={C.teal} strokeWidth="1.3" strokeLinejoin="round"/></svg>
                    : <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 1v14M1 8h14" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  }
                </div>
                <h2 style={s.formHdrTitle}>{editingId ? "Modifier" : "Nouvelle note"}</h2>
              </div>
              <button style={s.formClose} onClick={resetForm}>✕</button>
            </div>

            <div style={{ ...s.formBody, gridTemplateColumns: isMobile ? "1fr" : "1fr 240px" }}>
              <div>
                <div style={s.fField}>
                  <div style={s.fLabelRow}>
                    <label style={s.flabel}>Titre <span style={{color:C.terra}}>*</span></label>
                    <span style={s.charCount}>{form.title.length}/100</span>
                  </div>
                  <input style={fi("title")} maxLength={100} placeholder="Donnez un titre clair..."
                    value={form.title} onChange={e => setForm({...form, title:e.target.value})}
                    onFocus={() => setFocused("title")} onBlur={() => setFocused("")} />
                </div>
                <div style={s.fField}>
                  <label style={s.flabel}>Contenu <span style={s.optional}>(optionnel)</span></label>
                  <textarea style={{ ...fi("content"), minHeight:80, resize:"vertical", padding:"10px 14px", lineHeight:1.7 }}
                    placeholder="Décrivez votre note..."
                    value={form.content} onChange={e => setForm({...form, content:e.target.value})}
                    onFocus={() => setFocused("content")} onBlur={() => setFocused("")} />
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <label style={s.flabel}>Priorité</label>
                <div style={{ display:"flex", flexDirection: isMobile ? "row" : "column", gap:8 }}>
                  {["haute","moyenne","basse"].map(p => {
                    const pc = PRIORITY[p];
                    const active = form.priority === p;
                    return (
                      <button key={p} onClick={() => setForm({...form, priority:p})}
                        style={{ ...s.priorityBtn, flex: isMobile ? 1 : "none",
                          ...(active ? { background:pc.bg, border:`2px solid ${pc.color}`, color:pc.text } : {}) }}>
                        <span style={{ ...s.priorityDot, background:pc.color }}/>
                        <span style={{fontWeight:active?600:400}}>
                          {isMobile ? p.charAt(0).toUpperCase()+p.slice(1,3) : pc.label}
                        </span>
                        {active && !isMobile && <span style={s.checkMark}>✓</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display:"flex", flexDirection: isMobile ? "row" : "column", gap:8, marginTop:"auto" }}>
                  <button style={{ ...s.btnSave, flex:1, ...(isTitleEmpty ? s.btnSaveDisabled : {}) }}
                    onClick={handleSave} disabled={isTitleEmpty}>
                    {editingId ? "Enregistrer" : "Ajouter →"}
                  </button>
                  <button style={s.btnCancelForm} onClick={resetForm}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section header */}
        <div style={{ ...s.secHdr, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap:10 }}>
          <h3 style={{ ...s.secTitle, fontSize: isMobile ? 20 : 26 }}>Mes notes</h3>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={s.filterLabel}>Filtrer :</span>
            {[
              { k:"all",     label: isMobile ? "Tt" : "Toutes" },
              { k:"haute",   label:"▲" },
              { k:"moyenne", label:"●" },
              { k:"basse",   label:"▼" },
            ].map(f => (
              <button key={f.k}
                style={{ ...s.fBtn, ...(filter===f.k ? s.fBtnActive : {}), padding: isMobile ? "5px 10px" : "7px 16px" }}
                onClick={() => setFilter(f.k)}>{f.label}</button>
            ))}
            <span style={s.countBadge}>{sorted.length} note{sorted.length!==1?"s":""}</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={s.emptyState}>
            <div style={s.loadSpinner}/>
            <p style={{color:C.textMuted}}>Chargement...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>📋</div>
            <h3 style={s.emptyTitle}>Aucune note trouvée</h3>
            <p style={s.emptySub}>Créez votre première note.</p>
            <button style={s.emptyBtn} onClick={() => { resetForm(); setShowForm(true); }}>Créer une note</button>
          </div>
        ) : (
          <div style={{ ...s.grid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))" }}>
            {sorted.map(note => {
              const pc = PRIORITY[note.priority] || PRIORITY.basse;
              return (
                <div key={note.id} style={{ ...s.noteCard, borderTopColor:pc.color }}>
                  <div style={{ ...s.noteStripe, background:pc.color }}/>
                  <div style={s.noteInner}>
                    <div style={s.noteHead}>
                      <div style={{ ...s.noteBadge, background:pc.bg, color:pc.text, borderColor:pc.border }}>
                        <span style={{ ...s.badgeDot, background:pc.color }}/>{pc.label}
                      </div>
                      <span style={s.noteDate}>{fmtDate(note.created_at)}</span>
                    </div>
                    <h3 style={s.noteTitle}>{note.title}</h3>
                    {note.content && <p style={s.noteContent}>{note.content}</p>}
                    <div style={s.noteFoot}>
                      <button style={s.btnEdit} onClick={() => startEdit(note)}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 12 12"><path d="M1 11l2-1 7-7-1-1-7 7-1 2z" stroke={C.teal} strokeWidth="1.2" strokeLinejoin="round"/></svg>
                        Modifier
                      </button>
                      <button style={s.btnPdf} onClick={() => exportNotePDF(note)}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 12 12">
                          <path d="M2 1h6l2 2v8H2V1z" stroke={C.blushDark} strokeWidth="1.2" strokeLinejoin="round"/>
                          <path d="M7 1v3h3" stroke={C.blushDark} strokeWidth="1.2" strokeLinejoin="round"/>
                          <path d="M4 6h4M4 8h2" stroke={C.blushDark} strokeWidth="1" strokeLinecap="round"/>
                        </svg>
                        PDF
                      </button>
                      <button style={s.btnDel} onClick={() => setConfirmDel(note.id)}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 12 12"><path d="M2 4h8M5 4V3a1 1 0 012 0v1m2 0l-.5 6H3.5L3 4" stroke={C.terra} strokeWidth="1.2" strokeLinecap="round"/></svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  bg: { minHeight:"100vh", background:C.offwhite, fontFamily:font.body, position:"relative" },
  toast: { position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", padding:"10px 22px", borderRadius:30, color:C.white, fontWeight:600, fontSize:13, zIndex:9999, boxShadow:"0 8px 30px rgba(0,0,0,0.12)", whiteSpace:"nowrap" },
  overlay: { position:"fixed", inset:0, background:"rgba(33,46,83,0.45)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9000 },
  modal: { background:C.white, borderRadius:20, padding:"30px 24px", textAlign:"center", maxWidth:360, width:"90%", boxShadow:"0 20px 60px rgba(33,46,83,0.18)" },
  modalIconWrap: { width:52, height:52, borderRadius:"50%", background:C.terraLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" },
  modalTitle: { fontFamily:font.display, fontSize:20, color:C.navy, marginBottom:8 },
  modalDesc: { fontSize:13, color:C.textMuted, lineHeight:1.6, marginBottom:22 },
  modalBtns: { display:"flex", gap:10, justifyContent:"center" },
  mBtnCancel: { padding:"9px 20px", background:"#EEF0F5", color:C.navy, border:"none", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:500 },
  mBtnDel:    { padding:"9px 20px", background:`linear-gradient(135deg,${C.terra},${C.terraDark})`, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600 },
  header: { background:C.navy, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(33,46,83,0.2)" },
  hLeft: { display:"flex", alignItems:"center", gap:12 },
  hLogo: { width:36, height:36, background:"rgba(255,255,255,0.1)", borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" },
  hBrand: { fontWeight:700, color:C.white, letterSpacing:"-0.3px" },
  hWelcome: { fontSize:11, color:"rgba(255,255,255,0.6)" },
  hRight: { display:"flex", gap:8 },
  btnNew: { display:"flex", alignItems:"center", gap:6, background:`linear-gradient(135deg,${C.teal},${C.tealDark})`, color:C.white, border:"none", borderRadius:8, cursor:"pointer", fontWeight:600 },
  btnLogout: { background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, cursor:"pointer" },
  main: { maxWidth:1160, margin:"0 auto" },
  statsGrid: { display:"grid" },
  statCard:  { borderRadius:12, display:"flex", alignItems:"center", gap:12, border:"1px solid rgba(0,0,0,0.05)" },
  statIconWrap: { fontSize:16, minWidth:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", justifyContent:"center" },
  statNum:   { fontFamily:font.display, lineHeight:1 },
  statLabel: { fontSize:11, color:C.textMuted, marginTop:2 },
  formCard: { background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px", boxShadow:"0 4px 20px rgba(33,46,83,0.06)" },
  formHdr:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${C.border}` },
  formHdrLeft: { display:"flex", alignItems:"center", gap:10 },
  formHdrIcon: { width:28, height:28, borderRadius:7, background:C.tealLight, display:"flex", alignItems:"center", justifyContent:"center" },
  formHdrTitle: { fontSize:14, fontWeight:600, color:C.navy },
  formClose: { width:26, height:26, borderRadius:"50%", background:"#EEF0F5", border:"none", cursor:"pointer", color:C.textMuted, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" },
  formBody: { display:"grid", gap:14 },
  fField: { marginBottom:10 },
  fLabelRow: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 },
  flabel: { fontSize:13, color:C.navy, fontWeight:500 },
  optional: { color:C.textLight, fontSize:11, fontWeight:400 },
  charCount: { fontSize:11, color:C.textLight },
  finput: { width:"100%", padding:"10px 13px", background:C.offwhite, border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:14, color:C.navy, outline:"none", transition:"all 0.2s", fontFamily:font.body },
  finputFocus: { borderColor:C.teal, boxShadow:`0 0 0 3px ${C.tealLight}90`, background:C.white },
  priorityBtn: { display:"flex", alignItems:"center", gap:7, padding:"9px 10px", background:C.offwhite, border:`1.5px solid ${C.border}`, borderRadius:9, cursor:"pointer", fontSize:13, color:C.textMuted, transition:"all 0.2s" },
  priorityDot: { width:8, height:8, borderRadius:"50%", flexShrink:0 },
  checkMark: { marginLeft:"auto", color:C.teal, fontWeight:700 },
  btnSave: { flex:1, padding:"11px", background:`linear-gradient(135deg,${C.teal},${C.tealDark})`, color:C.white, border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", transition:"all 0.2s" },
  btnSaveDisabled: { background:"#D0D4E0", boxShadow:"none", cursor:"not-allowed", opacity:0.7 },
  btnCancelForm: { padding:"10px 14px", background:"#EEF0F5", color:C.textMuted, border:"none", borderRadius:10, fontSize:13, cursor:"pointer" },
  secHdr:   { display:"flex", justifyContent:"space-between", marginBottom:14 },
  secTitle: { fontFamily:font.display, color:C.navy },
  filterLabel: { fontSize:12, color:C.textMuted, fontWeight:500 },
  fBtn:     { background:C.white, color:C.textMuted, border:`1px solid ${C.border}`, borderRadius:20, cursor:"pointer", fontSize:12, fontWeight:500, transition:"all 0.2s" },
  fBtnActive: { background:C.navy, color:C.white, borderColor:C.navy },
  countBadge: { marginLeft:4, fontSize:12, color:C.textLight, fontStyle:"italic" },
  grid: { display:"grid", gap:12 },
  noteCard: { background:C.white, border:`1px solid ${C.border}`, borderTop:"3px solid", borderRadius:12, overflow:"hidden", display:"flex", boxShadow:"0 2px 10px rgba(33,46,83,0.05)" },
  noteStripe: { width:4, flexShrink:0 },
  noteInner: { flex:1, padding:"13px 13px 11px", display:"flex", flexDirection:"column", gap:7 },
  noteHead:  { display:"flex", justifyContent:"space-between", alignItems:"center" },
  noteBadge: { display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20, border:"1px solid" },
  badgeDot:  { width:6, height:6, borderRadius:"50%" },
  noteDate:  { fontSize:11, color:C.textLight },
  noteTitle: { fontSize:14, fontWeight:600, color:C.navy, lineHeight:1.45 },
  noteContent: { fontSize:13, color:C.textMuted, lineHeight:1.7, flex:1 },
  noteFoot:  { display:"flex", gap:6, paddingTop:9, borderTop:`1px solid ${C.border}`, marginTop:4, flexWrap:"wrap" },
  btnEdit: { display:"flex", alignItems:"center", gap:4, padding:"5px 10px", background:C.tealLight, color:C.tealDark, border:`1px solid ${C.sage}`, borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:500 },
  btnPdf:  { display:"flex", alignItems:"center", gap:4, padding:"5px 10px", background:C.blushLight, color:C.blushDark, border:"1px solid #E8C0D0", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:500 },
  btnDel:  { display:"flex", alignItems:"center", gap:4, padding:"5px 10px", background:C.terraLight, color:C.terraDark, border:"1px solid #F0C0C0", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:500 },
  emptyState: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"50px 20px", textAlign:"center" },
  loadSpinner: { width:30, height:30, border:`3px solid ${C.border}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin 0.9s linear infinite", marginBottom:12 },
  emptyIcon:  { fontSize:46, marginBottom:12 },
  emptyTitle: { fontFamily:font.display, fontSize:20, color:C.navy, marginBottom:8 },
  emptySub:   { fontSize:13, color:C.textMuted, marginBottom:18, lineHeight:1.6 },
  emptyBtn:   { padding:"10px 22px", background:`linear-gradient(135deg,${C.teal},${C.tealDark})`, color:C.white, border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer" },
};