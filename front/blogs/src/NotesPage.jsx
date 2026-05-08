import { useState, useEffect } from "react";
import { C, font, GOOGLE_FONTS, PRIORITY } from "./theme/theme.js";

const API = "http://localhost:8000/api";

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

  const hdrs = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API}/notes`, { headers:hdrs });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setNotes(data.notes || data);
    } catch { showToast("Impossible de charger les notes.", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSave = async () => {
    if (!form.title.trim())      { showToast("Le titre est obligatoire.", "error"); return; }
    if (form.title.length > 100) { showToast("Titre trop long (max 100 car.).", "error"); return; }
    try {
      const url    = editingId ? `${API}/notes/${editingId}` : `${API}/notes`;
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers:hdrs, body:JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erreur"); }
      showToast(editingId ? "Note modifiée ✓" : "Note créée ✓");
      resetForm();
      fetchNotes();
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
    setEditingId(note.id);
    setShowForm(true);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const resetForm = () => {
    setForm({ title:"", content:"", priority:"moyenne" });
    setEditingId(null);
    setShowForm(false);
  };

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

      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type==="error" ? C.terra : C.teal }}>
          {toast.type==="error" ? "⚠ " : "✓ "}{toast.msg}
        </div>
      )}

      {/* Delete modal */}
      {confirmDel && (
        <div style={s.overlay}>
          <div style={s.modal}>
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

      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.hLeft}>
          <div style={s.hLogo}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="12" height="16" rx="2" fill={C.teal} fillOpacity="0.9"/>
              <rect x="6" y="0" width="12" height="16" rx="2" fill={C.blush} fillOpacity="0.5"/>
              <rect x="5" y="7"  width="5" height="1.4" rx="0.7" fill={C.white}/>
              <rect x="5" y="10" width="7" height="1.4" rx="0.7" fill={C.white}/>
              <rect x="5" y="13" width="4" height="1.4" rx="0.7" fill={C.white}/>
            </svg>
          </div>
          <div>
            <h1 style={s.hBrand}>NoteFlow</h1>
            <p style={s.hWelcome}>Bonjour</p>
          </div>
        </div>
        <div style={s.hRight}>
          <button style={s.btnNew} onClick={() => { resetForm(); setShowForm(true); }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            Nouvelle note
          </button>
          <button style={s.btnLogout} onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <main style={s.main}>

        {/* ── Stats ── */}
        <div style={s.statsGrid}>
          {[
            { label:"Total notes", value:counts.total,   color:C.navy,      bg:"#EEF0F5",    icon:"📋" },
            { label:"Haute",       value:counts.haute,   color:C.terra,     bg:C.terraLight, icon:"▲" },
            { label:"Moyenne",     value:counts.moyenne, color:C.blushDark, bg:C.blushLight, icon:"●" },
            { label:"Basse",       value:counts.basse,   color:C.teal,      bg:C.tealLight,  icon:"▼" },
          ].map((st,i) => (
            <div key={i} style={{ ...s.statCard, background:st.bg }}>
              <div style={{ ...s.statIconWrap, color:st.color }}>{st.icon}</div>
              <div>
                <p style={{ ...s.statNum, color:st.color }}>{st.value}</p>
                <p style={s.statLabel}>{st.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Form ── */}
        {showForm && (
          <div style={s.formCard}>
            <div style={s.formHdr}>
              <div style={s.formHdrLeft}>
                <div style={s.formHdrIcon}>
                  {editingId
                    ? <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 14l3-1L13 5l-2-2-8 8-1 3z" stroke={C.teal} strokeWidth="1.3" strokeLinejoin="round"/></svg>
                    : <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 1v14M1 8h14" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  }
                </div>
                <h2 style={s.formHdrTitle}>{editingId ? "Modifier la note" : "Nouvelle note"}</h2>
              </div>
              <button style={s.formClose} onClick={resetForm}>✕</button>
            </div>

            <div style={s.formBody}>
              <div style={s.formCol1}>
                <div style={s.fField}>
                  <div style={s.fLabelRow}>
                    <label style={s.flabel}>Titre <span style={{color:C.terra}}>*</span></label>
                    <span style={s.charCount}>{form.title.length}/100</span>
                  </div>
                  <input style={fi("title")} maxLength={100}
                    placeholder="Donnez un titre clair à votre note..."
                    value={form.title} onChange={e => setForm({...form, title:e.target.value})}
                    onFocus={() => setFocused("title")} onBlur={() => setFocused("")} />
                </div>
                <div style={s.fField}>
                  <label style={s.flabel}>Contenu <span style={s.optional}>(optionnel)</span></label>
                  <textarea style={{ ...fi("content"), minHeight:110, resize:"vertical", padding:"12px 14px", lineHeight:1.7 }}
                    placeholder="Décrivez votre note en détail..."
                    value={form.content} onChange={e => setForm({...form, content:e.target.value})}
                    onFocus={() => setFocused("content")} onBlur={() => setFocused("")} />
                </div>
              </div>

              <div style={s.formCol2}>
                <label style={s.flabel}>Niveau de priorité</label>
                <div style={s.priorityGroup}>
                  {["haute","moyenne","basse"].map(p => {
                    const pc = PRIORITY[p];
                    const active = form.priority === p;
                    return (
                      <button key={p} onClick={() => setForm({...form, priority:p})}
                        style={{ ...s.priorityBtn, ...(active ? { background:pc.bg, border:`2px solid ${pc.color}`, color:pc.text } : {}) }}>
                        <span style={{ ...s.priorityDot, background:pc.color }}/>
                        <span style={{fontWeight:active?600:400}}>{pc.label}</span>
                        {active && <span style={s.checkMark}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                <div style={s.formActions}>
                  <button style={s.btnSave} onClick={handleSave}>
                    {editingId ? "Enregistrer" : "Ajouter →"}
                  </button>
                  <button style={s.btnCancelForm} onClick={resetForm}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Section header + filtres par priorité (BONUS) ── */}
        <div style={s.secHdr}>
          <div>
            <h3 style={s.secTitle}>Mes notes</h3>
          </div>
          <div style={s.filterRow}>
            <span style={s.filterLabel}>Filtrer :</span>
            {[
              { k:"all",     label:"Toutes" },
              { k:"haute",   label:"▲ Haute" },
              { k:"moyenne", label:"● Moyenne" },
              { k:"basse",   label:"▼ Basse" },
            ].map(f => (
              <button key={f.k}
                style={{ ...s.fBtn, ...(filter===f.k ? s.fBtnActive : {}) }}
                onClick={() => setFilter(f.k)}>
                {f.label}
              </button>
            ))}
            <span style={s.countBadge}>{sorted.length} note{sorted.length!==1?"s":""}</span>
          </div>
        </div>

        {/* ── Notes grid ── */}
        {loading ? (
          <div style={s.emptyState}>
            <div style={s.loadSpinner}/>
            <p style={{color:C.textMuted}}>Chargement des notes...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>📋</div>
            <h3 style={s.emptyTitle}>Aucune note trouvée</h3>
            <p style={s.emptySub}>Créez votre première note en cliquant sur "+ Nouvelle note".</p>
            <button style={s.emptyBtn} onClick={() => { resetForm(); setShowForm(true); }}>
              Créer une note
            </button>
          </div>
        ) : (
          <div style={s.grid}>
            {sorted.map(note => {
              const pc = PRIORITY[note.priority] || PRIORITY.basse;
              return (
                <div key={note.id} style={{ ...s.noteCard, borderTopColor:pc.color }}>
                  {/* Bande colorée selon la priorité */}
                  <div style={{ ...s.noteStripe, background:pc.color }}/>

                  <div style={s.noteInner}>
                    <div style={s.noteHead}>
                      <div style={{ ...s.noteBadge, background:pc.bg, color:pc.text, borderColor:pc.border }}>
                        <span style={{ ...s.badgeDot, background:pc.color }}/>
                        {pc.label}
                      </div>
                      <span style={s.noteDate}>{fmtDate(note.created_at)}</span>
                    </div>

                    <h3 style={s.noteTitle}>{note.title}</h3>
                    {note.content && <p style={s.noteContent}>{note.content}</p>}

                    <div style={s.noteFoot}>
                      <button style={s.btnEdit} onClick={() => startEdit(note)}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M1 11l2-1 7-7-1-1-7 7-1 2z" stroke={C.teal} strokeWidth="1.2" strokeLinejoin="round"/></svg>
                        Modifier
                      </button>
                      <button style={s.btnDel} onClick={() => setConfirmDel(note.id)}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M2 4h8M5 4V3a1 1 0 012 0v1m2 0l-.5 6H3.5L3 4" stroke={C.terra} strokeWidth="1.2" strokeLinecap="round"/></svg>
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

  toast: { position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", padding:"12px 26px", borderRadius:30, color:C.white, fontWeight:600, fontSize:14, zIndex:9999, boxShadow:"0 8px 30px rgba(0,0,0,0.12)", animation:"slideIn 0.3s ease", whiteSpace:"nowrap" },

  overlay: { position:"fixed", inset:0, background:"rgba(33,46,83,0.45)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9000 },
  modal: { background:C.white, borderRadius:20, padding:"36px 32px", textAlign:"center", maxWidth:380, width:"90%", boxShadow:"0 20px 60px rgba(33,46,83,0.18)", animation:"fadeUp 0.3s ease" },
  modalIconWrap: { width:60, height:60, borderRadius:"50%", background:C.terraLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" },
  modalTitle: { fontFamily:font.display, fontSize:22, color:C.navy, marginBottom:8 },
  modalDesc: { fontSize:14, color:C.textMuted, lineHeight:1.6, marginBottom:24 },
  modalBtns: { display:"flex", gap:12, justifyContent:"center" },
  mBtnCancel: { padding:"10px 24px", background:"#EEF0F5", color:C.navy, border:"none", borderRadius:10, cursor:"pointer", fontSize:14, fontWeight:500 },
  mBtnDel:    { padding:"10px 24px", background:`linear-gradient(135deg,${C.terra},${C.terraDark})`, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontSize:14, fontWeight:600 },

  header: { background:C.navy, padding:"0 40px", display:"flex", justifyContent:"space-between", alignItems:"center", height:68, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(33,46,83,0.2)" },
  hLeft: { display:"flex", alignItems:"center", gap:14 },
  hLogo: { width:42, height:42, background:"rgba(255,255,255,0.1)", borderRadius:12, border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" },
  hBrand: { fontSize:18, fontWeight:700, color:C.white, letterSpacing:"-0.3px" },
  hWelcome: { fontSize:12, color:"rgba(255,255,255,0.6)" },
  hRight: { display:"flex", gap:10 },
  btnNew: { display:"flex", alignItems:"center", gap:7, padding:"10px 20px", background:`linear-gradient(135deg,${C.teal},${C.tealDark})`, color:C.white, border:"none", borderRadius:10, cursor:"pointer", fontSize:14, fontWeight:600, boxShadow:`0 4px 14px ${C.teal}50` },
  btnLogout: { padding:"10px 18px", background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, cursor:"pointer", fontSize:14 },

  main: { maxWidth:1160, margin:"0 auto", padding:"36px 40px" },

  statsGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 },
  statCard:  { borderRadius:14, padding:"18px 20px", display:"flex", alignItems:"center", gap:14, border:"1px solid rgba(0,0,0,0.05)" },
  statIconWrap: { fontSize:20, minWidth:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", justifyContent:"center" },
  statNum:   { fontSize:26, fontFamily:font.display, lineHeight:1 },
  statLabel: { fontSize:12, color:C.textMuted, marginTop:3 },

  formCard: { background:C.white, border:`1px solid ${C.border}`, borderRadius:18, padding:"24px 28px", marginBottom:32, boxShadow:"0 4px 20px rgba(33,46,83,0.06)", animation:"fadeUp 0.3s ease" },
  formHdr:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${C.border}` },
  formHdrLeft: { display:"flex", alignItems:"center", gap:10 },
  formHdrIcon: { width:32, height:32, borderRadius:8, background:C.tealLight, display:"flex", alignItems:"center", justifyContent:"center" },
  formHdrTitle: { fontSize:16, fontWeight:600, color:C.navy },
  formClose: { width:30, height:30, borderRadius:"50%", background:"#EEF0F5", border:"none", cursor:"pointer", color:C.textMuted, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" },

  formBody: { display:"grid", gridTemplateColumns:"1fr 240px", gap:24 },
  formCol1: {},
  formCol2: { display:"flex", flexDirection:"column", gap:14 },

  fField: { marginBottom:14 },
  fLabelRow: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 },
  flabel: { fontSize:13, color:C.navy, fontWeight:500 },
  optional: { color:C.textLight, fontSize:11, fontWeight:400 },
  charCount: { fontSize:11, color:C.textLight },
  finput: { width:"100%", padding:"11px 14px", background:C.offwhite, border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:14, color:C.navy, outline:"none", transition:"all 0.2s", fontFamily:font.body },
  finputFocus: { borderColor:C.teal, boxShadow:`0 0 0 3px ${C.tealLight}90`, background:C.white },

  priorityGroup: { display:"flex", flexDirection:"column", gap:8 },
  priorityBtn: { display:"flex", alignItems:"center", gap:10, padding:"11px 14px", background:C.offwhite, border:`1.5px solid ${C.border}`, borderRadius:10, cursor:"pointer", fontSize:14, color:C.textMuted, transition:"all 0.2s", textAlign:"left" },
  priorityDot: { width:9, height:9, borderRadius:"50%", flexShrink:0 },
  checkMark: { marginLeft:"auto", color:C.teal, fontWeight:700 },

  formActions: { marginTop:"auto", display:"flex", flexDirection:"column", gap:8, paddingTop:8 },
  btnSave:       { padding:"12px", background:`linear-gradient(135deg,${C.teal},${C.tealDark})`, color:C.white, border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", boxShadow:`0 4px 14px ${C.teal}40` },
  btnCancelForm: { padding:"10px", background:"#EEF0F5", color:C.textMuted, border:"none", borderRadius:10, fontSize:14, cursor:"pointer" },

  secHdr:   { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 },
  secTitle: { fontFamily:font.display, fontSize:26, color:C.navy, marginBottom:2 },
  secSub:   { fontSize:12, color:C.textLight, fontStyle:"italic" },
  filterLabel: { fontSize:13, color:C.textMuted, fontWeight:500, marginRight:4 },
  filterRow:{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" },
  fBtn:     { padding:"7px 16px", background:C.white, color:C.textMuted, border:`1px solid ${C.border}`, borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:500, transition:"all 0.2s" },
  fBtnActive: { background:C.navy, color:C.white, borderColor:C.navy },
  countBadge: { marginLeft:8, fontSize:13, color:C.textLight, fontStyle:"italic" },

  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:18 },

  noteCard: { background:C.white, border:`1px solid ${C.border}`, borderTop:"3px solid", borderRadius:14, overflow:"hidden", display:"flex", transition:"transform 0.15s, box-shadow 0.15s", position:"relative", boxShadow:"0 2px 10px rgba(33,46,83,0.05)", animation:"fadeUp 0.3s ease" },
  noteStripe: { width:4, flexShrink:0 },
  noteInner: { flex:1, padding:"18px 18px 14px", display:"flex", flexDirection:"column", gap:8 },
  noteHead:  { display:"flex", justifyContent:"space-between", alignItems:"center" },
  noteBadge: { display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, padding:"4px 10px", borderRadius:20, border:"1px solid" },
  badgeDot:  { width:7, height:7, borderRadius:"50%" },
  noteDate:  { fontSize:11, color:C.textLight },
  noteTitle: { fontSize:15, fontWeight:600, color:C.navy, lineHeight:1.45 },
  noteContent: { fontSize:13, color:C.textMuted, lineHeight:1.7, flex:1 },
  noteFoot:  { display:"flex", gap:8, paddingTop:10, borderTop:`1px solid ${C.border}`, marginTop:4 },
  btnEdit: { display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:C.tealLight, color:C.tealDark, border:`1px solid ${C.sage}`, borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:500 },
  btnDel:  { display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:C.terraLight, color:C.terraDark, border:"1px solid #F0C0C0", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:500 },

  emptyState: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 20px", textAlign:"center" },
  loadSpinner: { width:34, height:34, border:`3px solid ${C.border}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin 0.9s linear infinite", marginBottom:16 },
  emptyIcon:  { fontSize:60, marginBottom:14 },
  emptyTitle: { fontFamily:font.display, fontSize:22, color:C.navy, marginBottom:8 },
  emptySub:   { fontSize:14, color:C.textMuted, marginBottom:24, lineHeight:1.6 },
  emptyBtn:   { padding:"12px 28px", background:`linear-gradient(135deg,${C.teal},${C.tealDark})`, color:C.white, border:"none", borderRadius:12, fontSize:15, fontWeight:600, cursor:"pointer" },
};