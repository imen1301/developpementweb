// ─── Palette NoteFlow ───────────────────────────────────────────────
// #212E53  Deep Navy    → backgrounds sombres, textes forts
// #4A919E  Steel Teal   → accents primaires, boutons, focus
// #BED3C3  Sage Green   → surfaces douces, highlights
// #EBACA2  Blush Rose   → accents secondaires, badges
// #CE6A6B  Terracotta   → urgence, haute priorité, erreurs
// ────────────────────────────────────────────────────────────────────

export const C = {
  navy:       "#212E53",
  teal:       "#4A919E",
  tealDark:   "#36717C",
  tealLight:  "#D4EDF0",
  sage:       "#BED3C3",
  sageDark:   "#8AAF94",
  sageLight:  "#EBF3ED",
  blush:      "#EBACA2",
  blushDark:  "#C07A72",
  blushLight: "#FAF0EE",
  terra:      "#CE6A6B",
  terraDark:  "#A04A4B",
  terraLight: "#F9E8E8",
  white:      "#FFFFFF",
  offwhite:   "#F7F9F8",
  text:       "#212E53",
  textMuted:  "#5A6B80",
  textLight:  "#8A9BB0",
  border:     "#DDE6E2",
  borderHard: "#BED3C3",
};

export const font = {
  display: "'Cormorant Garamond', serif",
  body:    "'DM Sans', sans-serif",
};

export const GOOGLE_FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #F7F9F8; }
  input, textarea, select, button { font-family: 'DM Sans', sans-serif; }
  input::placeholder, textarea::placeholder { color: #A0B0B8; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes spin     { to   { transform: rotate(360deg); } }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes slideIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
`;

export const PRIORITY = {
  haute:   { label:"Haute",   icon:"▲", color:C.terra,    bg:C.terraLight, border:"#F0C0C0", text:C.terraDark },
  moyenne: { label:"Moyenne", icon:"●", color:C.blushDark, bg:C.blushLight, border:"#F0D0CC", text:C.blushDark },
  basse:   { label:"Basse",   icon:"▼", color:C.teal,     bg:C.tealLight,  border:"#B0D8E0", text:C.tealDark  },
};