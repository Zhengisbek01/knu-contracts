import { useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const C = {
  navy:"#1B2E6B", navyDk:"#0F1E4A", navyMd:"#243880",
  gold:"#F5A800", goldLt:"#FFD166", goldDm:"#FFF0C2",
  white:"#FFFFFF", off:"#F7F9FF", slate:"#8899BB",
  border:"#DDE3F0", red:"#E53935", green:"#2E7D32", teal:"#00796B",
};

// ─── ROLES CONFIG ─────────────────────────────────────────────────────────────
const ROLES = {
  admin: {
    label: "Администратор",
    icon: "🔐",
    color: "#7C3AED",
    bg: "#F5F3FF",
    canView: ["dashboard","income","expense","gph","reports","users"],
    canAdd: true, canDelete: true, canViewReports: true,
    canViewIncome: true, canViewExpense: true,
  },
  director: {
    label: "Руководитель",
    icon: "👔",
    color: C.navy,
    bg: "#EEF2FF",
    canView: ["dashboard","income","expense","gph","reports"],
    canAdd: false, canDelete: false, canViewReports: true,
    canViewIncome: true, canViewExpense: true,
  },
  head_corporate: {
    label: "НО Корпоративных программ",
    icon: "🏢",
    color: "#0369A1",
    bg: "#E0F2FE",
    canView: ["dashboard","income","expense","gph","reports"],
    canAdd: true, canDelete: false, canViewReports: true,
    canViewIncome: true, canViewExpense: true,
    // фильтр по категории — только корпоративные программы
    category: "corporate",
    categoryLabel: "Корпоративные программы",
  },
  head_mandatory: {
    label: "НО Обязательных программ",
    icon: "📜",
    color: "#B45309",
    bg: "#FEF3C7",
    canView: ["dashboard","income","expense","gph","reports"],
    canAdd: true, canDelete: false, canViewReports: true,
    canViewIncome: true, canViewExpense: true,
    // фильтр по категории — только обязательные программы
    category: "mandatory",
    categoryLabel: "Обязательные программы",
  },
  manager: {
    label: "Менеджер",
    icon: "📋",
    color: C.teal,
    bg: "#E0F2F1",
    canView: ["dashboard","income","expense","gph"],
    canAdd: true, canDelete: false, canViewReports: false,
    canViewIncome: true, canViewExpense: true,
  },
};

// ─── USERS ────────────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id:1,  name:"Администратор",     login:"admin",      password:"admin123",    role:"admin" },
  { id:2,  name:"Директор КЯУ",      login:"director",   password:"director123", role:"director" },
  { id:3,  name:"НО Корп. программ", login:"head_corp",  password:"headcorp123", role:"head_corporate" },
  { id:4,  name:"НО Обяз. программ", login:"head_mand",  password:"headmand123", role:"head_mandatory" },
  // Отдел обязательных программ — менеджеры 1–12
  { id:5,  name:"Менеджер 1",  login:"manager1",  password:"manager1",  role:"manager", department:"mandatory" },
  { id:6,  name:"Менеджер 2",  login:"manager2",  password:"manager2",  role:"manager", department:"mandatory" },
  { id:7,  name:"Менеджер 3",  login:"manager3",  password:"manager3",  role:"manager", department:"mandatory" },
  { id:8,  name:"Менеджер 4",  login:"manager4",  password:"manager4",  role:"manager", department:"mandatory" },
  { id:9,  name:"Менеджер 5",  login:"manager5",  password:"manager5",  role:"manager", department:"mandatory" },
  { id:10, name:"Менеджер 6",  login:"manager6",  password:"manager6",  role:"manager", department:"mandatory" },
  { id:11, name:"Менеджер 7",  login:"manager7",  password:"manager7",  role:"manager", department:"mandatory" },
  { id:12, name:"Менеджер 8",  login:"manager8",  password:"manager8",  role:"manager", department:"mandatory" },
  { id:13, name:"Менеджер 9",  login:"manager9",  password:"manager9",  role:"manager", department:"mandatory" },
  { id:14, name:"Менеджер 10", login:"manager10", password:"manager10", role:"manager", department:"mandatory" },
  { id:15, name:"Менеджер 11", login:"manager11", password:"manager11", role:"manager", department:"mandatory" },
  { id:16, name:"Менеджер 12", login:"manager12", password:"manager12", role:"manager", department:"mandatory" },
  // Отдел корпоративных программ — менеджеры 13–21
  { id:17, name:"Менеджер 13", login:"manager13", password:"manager13", role:"manager", department:"corporate" },
  { id:18, name:"Менеджер 14", login:"manager14", password:"manager14", role:"manager", department:"corporate" },
  { id:19, name:"Менеджер 15", login:"manager15", password:"manager15", role:"manager", department:"corporate" },
  { id:20, name:"Менеджер 16", login:"manager16", password:"manager16", role:"manager", department:"corporate" },
  { id:21, name:"Менеджер 17", login:"manager17", password:"manager17", role:"manager", department:"corporate" },
  { id:22, name:"Менеджер 18", login:"manager18", password:"manager18", role:"manager", department:"corporate" },
  { id:23, name:"Менеджер 19", login:"manager19", password:"manager19", role:"manager", department:"corporate" },
  { id:24, name:"Менеджер 20", login:"manager20", password:"manager20", role:"manager", department:"corporate" },
  { id:25, name:"Менеджер 21", login:"manager21", password:"manager21", role:"manager", department:"corporate" },
];

const VAT = 0.12;
const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const YEARS  = [2023,2024,2025,2026];

const fmt = n => new Intl.NumberFormat("ru-KZ",{style:"currency",currency:"KZT",maximumFractionDigits:0}).format(n);
const num = n => new Intl.NumberFormat("ru-KZ").format(Math.round(n));
const withVat = x => x*(1+VAT);
const withoutVat = x => x/(1+VAT);
const vatOnly = x => x-withoutVat(x);

// ─── LOGO B64 ─────────────────────────────────────────────────────────────────
const LOGO_B64 = "data:image/png;base64,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";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = { "Исполнен":[C.green,"#E8F5E9"], "Оплачен":[C.green,"#E8F5E9"], "В процессе":[C.gold,"#FFF8E1"], "Отменён":[C.red,"#FFEBEE"] };
  const [color,bg] = map[status]||[C.slate,"#F7F9FF"];
  return <span style={{ background:bg, color, fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap", border:`1px solid ${color}33` }}>{status}</span>;
}
function RoleBadge({ role }) {
  const r = ROLES[role];
  return <span style={{ background:r.bg, color:r.color, fontSize:10, fontWeight:800, padding:"3px 12px", borderRadius:20, border:`1px solid ${r.color}33`, letterSpacing:"0.04em" }}>{r.icon} {r.label}</span>;
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,30,74,0.65)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div style={{ background:C.white, borderRadius:18, padding:"28px 26px", width:500, maxWidth:"100%", boxShadow:"0 32px 80px rgba(15,30,74,0.35)", maxHeight:"92vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:4, height:22, background:C.gold, borderRadius:2 }}/>
            <h3 style={{ margin:0, color:C.navy, fontSize:16, fontWeight:800 }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ background:C.off, border:"none", width:30, height:30, borderRadius:8, fontSize:18, cursor:"pointer", color:C.slate }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Input({ label, hint, ...props }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        {label && <label style={{ fontSize:11, fontWeight:700, color:C.navy }}>{label}</label>}
        {hint  && <span style={{ fontSize:10, color:C.slate }}>{hint}</span>}
      </div>
      <input {...props} style={{ border:`1.5px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, color:C.navy, outline:"none", background:C.off, ...props.style }}
        onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
    </div>
  );
}
function Sel({ label, children, ...props }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label && <label style={{ fontSize:11, fontWeight:700, color:C.navy }}>{label}</label>}
      <select {...props} style={{ border:`1.5px solid ${C.border}`, borderRadius:9, padding:"9px 12px", fontSize:13, color:C.navy, outline:"none", background:C.off, ...props.style }}>{children}</select>
    </div>
  );
}
function Btn({ children, variant="primary", ...props }) {
  const s = {
    primary: { background:C.gold, color:C.navyDk, border:"none", boxShadow:"0 4px 14px rgba(245,168,0,0.35)", fontWeight:800 },
    secondary: { background:C.white, color:C.navy, border:`1.5px solid ${C.border}`, fontWeight:700 },
    navy: { background:C.navy, color:C.white, border:"none", fontWeight:700 },
    danger: { background:C.red, color:C.white, border:"none", fontWeight:700 },
  };
  return <button {...props} style={{ ...s[variant], padding:"10px 20px", borderRadius:9, fontSize:13, cursor:"pointer", transition:"all .15s", ...props.style }}
    onMouseOver={e=>e.currentTarget.style.opacity="0.87"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>{children}</button>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    const user = INITIAL_USERS.find(u => u.login === login && u.password === password);
    if (user) { setError(""); onLogin(user); }
    else setError("Неверный логин или пароль");
  };

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, ${C.navyDk} 0%, ${C.navyMd} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:420, maxWidth:"100%" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:100, height:100, background:C.white, borderRadius:20, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", border:`3px solid ${C.gold}`, boxShadow:`0 8px 32px rgba(0,0,0,0.4)` }}>
            <img src={LOGO_B64} alt="KNU" style={{ width:"85%", height:"85%", objectFit:"contain" }}/>
          </div>
          <div style={{ color:C.white, fontFamily:"Georgia,serif", fontWeight:700, fontSize:14, letterSpacing:"0.1em", textTransform:"uppercase" }}>Kazakhstan Nuclear University</div>
          <div style={{ color:C.gold, fontSize:11, marginTop:4, letterSpacing:"0.08em" }}>ФИНАНСОВЫЙ МОНИТОРИНГ</div>
        </div>

        {/* Card */}
        <div style={{ background:C.white, borderRadius:20, padding:"32px 28px", boxShadow:"0 24px 60px rgba(0,0,0,0.35)" }}>
          <h2 style={{ color:C.navy, margin:"0 0 6px", fontSize:20, fontWeight:900, fontFamily:"Georgia,serif" }}>Вход в систему</h2>
          <p style={{ color:C.slate, fontSize:12, margin:"0 0 24px" }}>Введите ваши учётные данные</p>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Input label="Логин" value={login} onChange={e=>setLogin(e.target.value)} placeholder="Введите логин"
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            <div style={{ position:"relative" }}>
              <Input label="Пароль" type={showPass?"text":"password"} value={password}
                onChange={e=>setPassword(e.target.value)} placeholder="Введите пароль"
                onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{ paddingRight:40 }}/>
              <button onClick={()=>setShowPass(p=>!p)} style={{ position:"absolute", right:10, bottom:9, background:"none", border:"none", cursor:"pointer", color:C.slate, fontSize:14 }}>
                {showPass?"🙈":"👁️"}
              </button>
            </div>

            {error && <div style={{ background:"#FFEBEE", border:"1px solid #EF9A9A", borderRadius:8, padding:"9px 14px", color:C.red, fontSize:12, fontWeight:600 }}>⚠️ {error}</div>}

            <Btn onClick={handleLogin} style={{ marginTop:4, padding:"13px 20px", fontSize:14 }}>Войти</Btn>
          </div>

          {/* Hints */}
          <div style={{ marginTop:24, padding:"14px 16px", background:C.off, borderRadius:10, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10, fontWeight:800, color:C.slate, letterSpacing:"0.08em", marginBottom:8 }}>ТЕСТОВЫЕ АККАУНТЫ</div>
            {[
              {role:"admin",         name:"Администратор",       login:"admin",      password:"admin123"},
              {role:"director",      name:"Директор КЯУ",        login:"director",   password:"director123"},
              {role:"head_corporate",name:"НО Корп. программ",   login:"head_corp",  password:"headcorp123"},
              {role:"head_mandatory",name:"НО Обяз. программ",   login:"head_mand",  password:"headmand123"},
              {role:"manager",       name:"Менеджер 1 (Обяз.)",  login:"manager1",   password:"manager1"},
              {role:"manager",       name:"Менеджер 13 (Корп.)", login:"manager13",  password:"manager13"},
            ].map(u=>(
              <div key={u.login} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:`1px solid ${C.border}` }}>
                <div>
                  <span style={{ fontSize:11, fontWeight:700, color:C.navy }}>{u.name}</span>
                  <span style={{ fontSize:10, color:C.slate, marginLeft:8 }}>{u.login} / {u.password}</span>
                </div>
                <RoleBadge role={u.role}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS_ALL = [
  { id:"dashboard", label:"Дашборд",           icon:"📊" },
  { id:"income",    label:"Доходные договора",  icon:"📈" },
  { id:"expense",   label:"Расходные (тендер)", icon:"📋" },
  { id:"gph",       label:"Договоры ГПХ",       icon:"👤" },
  { id:"reports",   label:"Отчётность",         icon:"📑" },
  { id:"users",     label:"Пользователи",       icon:"👥" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab]                 = useState("dashboard");
  const [sidebarOpen, setSidebar]     = useState(true);
  const [incomeData,  setIncomeData]  = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [gphData,     setGphData]     = useState([]);
  const [users,       setUsers]       = useState(INITIAL_USERS);
  const [modal,       setModal]       = useState(null);
  const [filterYear,  setFilterYear]  = useState("all");
  const [reportYear,  setReportYear]  = useState(2026);

  if (!currentUser) return <LoginScreen onLogin={u=>{ setCurrentUser(u); setTab("dashboard"); }}/>;

  const role     = ROLES[currentUser.role];
  const canAdd   = role.canAdd;
  const canDel   = role.canDelete;
  const tabs     = TABS_ALL.filter(t => role.canView.includes(t.id));

  // категорийный фильтр
  const userDept = currentUser.department || role.category || null;
  const cf = r => userDept ? r.category === userDept : true;

  const allIncF     = incomeData.filter(cf);
  const allExpF     = [...expenseData,...gphData].filter(cf);
  const totalIncVat = allIncF.reduce((s,r)=>s+r.amountWithVat,0);
  const totalIncNet = allIncF.reduce((s,r)=>s+r.amountNet,0);
  const totalExpVat = allExpF.reduce((s,r)=>s+r.amountWithVat,0);
  const profit      = totalIncVat - totalExpVat;

  const fIncome  = allIncF.filter(r=>filterYear==="all"||r.year===+filterYear);
  const fExpense = expenseData.filter(cf).filter(r=>filterYear==="all"||r.year===+filterYear);
  const fGph     = gphData.filter(cf).filter(r=>filterYear==="all"||r.year===+filterYear);

  const chartMonthly = MONTHS.map(m=>({
    month:m.slice(0,3),
    "Доходы":  allIncF.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0),
    "Расходы": allExpF.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0),
  }));

  const chartPie = (()=>{
    const t=expenseData.filter(cf).filter(r=>r.year===reportYear).reduce((s,r)=>s+r.amountWithVat,0);
    const g=gphData.filter(cf).filter(r=>r.year===reportYear).reduce((s,r)=>s+r.amountWithVat,0);
    return [{name:"Тендерные",value:t},{name:"ГПХ",value:g}];
  })();

  const chartProfit = MONTHS.map(m=>{
    const i=allIncF.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0);
    const e=allExpF.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0);
    return {month:m.slice(0,3),"Прибыль":i-e};
  });

  const saveRecord=(type,item)=>{
    const cat = currentUser.department || role.category || "general";
    const n={...item,id:Date.now(),year:+item.year,amountWithVat:+item.amountWithVat,amountNet:+item.amountNet,vatAmount:+item.vatAmount,addedBy:currentUser.name,category:cat};
    if(type==="income")setIncomeData(p=>[...p,n]);
    else if(type==="expense")setExpenseData(p=>[...p,n]);
    else setGphData(p=>[...p,n]);
    setModal(null);
  };
  const del=(type,id)=>{
    if(!canDel)return;
    if(type==="income")setIncomeData(p=>p.filter(r=>r.id!==id));
    else if(type==="expense")setExpenseData(p=>p.filter(r=>r.id!==id));
    else setGphData(p=>p.filter(r=>r.id!==id));
  };

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#EDF1FB", minHeight:"100vh", display:"flex" }}>

      {/* SIDEBAR */}
      <aside style={{ width:sidebarOpen?240:0, minWidth:sidebarOpen?240:0, overflow:"hidden",
        background:`linear-gradient(180deg,${C.navyDk} 0%,${C.navy} 60%,${C.navyMd} 100%)`,
        display:"flex", flexDirection:"column",
        transition:"width .3s cubic-bezier(.4,0,.2,1),min-width .3s cubic-bezier(.4,0,.2,1)",
        flexShrink:0, position:"sticky", top:0, height:"100vh", borderRight:`3px solid ${C.gold}` }}>
        <div style={{ minWidth:240, display:"flex", flexDirection:"column", height:"100%" }}>

          {/* Logo */}
          <div style={{ padding:"22px 20px 18px", borderBottom:`1px solid rgba(245,168,0,0.25)`, display:"flex", flexDirection:"column", alignItems:"center", gap:12, background:"rgba(0,0,0,0.18)" }}>
            <div style={{ width:90, height:90, background:C.white, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${C.gold}`, boxShadow:`0 4px 20px rgba(0,0,0,0.35)`, padding:8 }}>
              <img src={LOGO_B64} alt="KNU" style={{ width:"100%", height:"100%", objectFit:"contain" }}/>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ color:C.white, fontFamily:"Georgia,serif", fontWeight:700, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", lineHeight:1.5 }}>Kazakhstan</div>
              <div style={{ color:C.gold, fontFamily:"Georgia,serif", fontWeight:800, fontSize:12, letterSpacing:"0.06em", textTransform:"uppercase" }}>Nuclear</div>
              <div style={{ color:C.white, fontFamily:"Georgia,serif", fontWeight:700, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", lineHeight:1.5 }}>University</div>
            </div>
            <div style={{ width:36, height:2, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"11px 13px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:3,
                background:tab===t.id?"rgba(245,168,0,0.18)":"transparent",
                color:tab===t.id?C.gold:"#8899BB",
                fontWeight:tab===t.id?700:500, fontSize:13, textAlign:"left", whiteSpace:"nowrap",
                borderLeft:tab===t.id?`3px solid ${C.gold}`:"3px solid transparent" }}>
                <span style={{ fontSize:15, flexShrink:0 }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          {/* User block */}
          <div style={{ padding:"10px 14px 16px" }}>
            <div style={{ background:"rgba(245,168,0,0.12)", border:`1px solid rgba(245,168,0,0.25)`, borderRadius:10, padding:"10px 13px", marginBottom:10 }}>
              <RoleBadge role={currentUser.role}/>
              <div style={{ color:C.white, fontSize:13, fontWeight:700, marginTop:6 }}>{currentUser.name}</div>
            </div>
            <button onClick={()=>setCurrentUser(null)} style={{ width:"100%", background:"rgba(229,57,53,0.15)", border:"1px solid rgba(229,57,53,0.3)", borderRadius:9, padding:"8px", color:"#EF9A9A", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              🚪 Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* TOGGLE */}
      <button onClick={()=>setSidebar(p=>!p)} style={{ position:"fixed", bottom:24, left:sidebarOpen?198:12, zIndex:200, width:32, height:32, background:C.navy, border:`2px solid ${C.gold}`, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(15,30,74,0.4)", transition:"left .3s cubic-bezier(.4,0,.2,1)", color:C.gold, fontSize:12, fontWeight:800 }}>
        {sidebarOpen?"◀":"▶"}
      </button>

      {/* MAIN */}
      <main style={{ flex:1, overflow:"auto", minWidth:0 }}>
        {/* Topbar */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"11px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10, boxShadow:"0 2px 8px rgba(27,46,107,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:3, height:18, background:C.gold, borderRadius:2 }}/>
            <span style={{ color:C.navy, fontWeight:800, fontSize:15, fontFamily:"Georgia,serif" }}>{tabs.find(t=>t.id===tab)?.label}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <RoleBadge role={currentUser.role}/>
            <span style={{ color:C.slate, fontSize:12 }}>{currentUser.name}</span>
          </div>
        </div>

        <div style={{ padding:"22px 24px 60px" }}>

          {/* DASHBOARD */}
          {tab==="dashboard" && (
            <section>
              <h1 style={{ color:C.navy, margin:"0 0 3px", fontSize:20, fontWeight:900, fontFamily:"Georgia,serif" }}>Общий дашборд</h1>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <p style={{ color:C.slate, margin:0, fontSize:12 }}>Финансовый обзор по всем договорам</p>
                {role.category && (
                  <span style={{ background:ROLES[currentUser.role].bg, color:ROLES[currentUser.role].color, fontSize:10, fontWeight:800, padding:"3px 12px", borderRadius:20, border:`1px solid ${ROLES[currentUser.role].color}33` }}>
                    {ROLES[currentUser.role].icon} {ROLES[currentUser.role].categoryLabel}
                  </span>
                )}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:13, marginBottom:22 }}>
                <KpiCard accent icon="📈" label="Доход с НДС" value={totalIncVat>0?fmt(totalIncVat):"—"} sub={totalIncNet>0?`Без НДС: ${fmt(totalIncNet)}`:`${incomeData.length} договоров`} sub2={totalIncVat>0?`НДС: ${fmt(totalIncVat-totalIncNet)}`:undefined}/>
                <KpiCard icon="📉" label="Расход с НДС" value={totalExpVat>0?fmt(totalExpVat):"—"} sub={`${allExpF.length} записей`}/>
                <KpiCard icon="💰" label="Прибыль" value={totalIncVat>0||totalExpVat>0?fmt(profit):"—"} sub={profit>=0?"Положительный баланс":"Дефицит"}/>
                <KpiCard icon="👥" label="Пользователей" value={users.length} sub={`${users.filter(u=>u.role==="manager").length} менеджеров`}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <InfoCard title="Последние доходные">
                  {incomeData.length===0?<Empty text="Нет данных"/>:incomeData.slice(-4).reverse().map(r=>(
                    <DRow key={r.id} top={r.company} bot={`${r.month} ${r.year} · ${r.addedBy||""}`} vat={r.amountWithVat} net={r.amountNet} status={r.status}/>
                  ))}
                </InfoCard>
                <InfoCard title="Последние расходы">
                  {allExpF.length===0?<Empty text="Нет данных"/>:allExpF.slice(-4).reverse().map(r=>(
                    <DRow key={r.id} top={r.person||r.company} bot={`${r.month} ${r.year} · ${r.addedBy||""}`} vat={r.amountWithVat} net={r.amountNet} status={r.status} red/>
                  ))}
                </InfoCard>
              </div>
            </section>
          )}

          {/* INCOME */}
          {tab==="income" && <TableSec title="Доходные договора" subtitle="Договоры с постоянными партнёрами" rows={fIncome} filterYear={filterYear} setFilterYear={setFilterYear} onAdd={canAdd?()=>setModal({type:"income"}):null} onDelete={canDel?(id=>del("income",id)):null} nameCol="company" nameLabel="Компания"/>}

          {/* EXPENSE */}
          {tab==="expense" && <TableSec title="Расходные (тендер)" subtitle="Открытые тендеры" rows={fExpense} filterYear={filterYear} setFilterYear={setFilterYear} onAdd={canAdd?()=>setModal({type:"expense"}):null} onDelete={canDel?(id=>del("expense",id)):null} nameCol="company" nameLabel="Поставщик"/>}

          {/* GPH */}
          {tab==="gph" && <TableSec title="Договоры ГПХ" subtitle="Физические лица" rows={fGph} filterYear={filterYear} setFilterYear={setFilterYear} onAdd={canAdd?()=>setModal({type:"gph"}):null} onDelete={canDel?(id=>del("gph",id)):null} nameCol="person" nameLabel="Физ. лицо"/>}

          {/* REPORTS */}
          {tab==="reports" && (
            <section>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                <div>
                  <h1 style={{ color:C.navy, margin:"0 0 3px", fontSize:20, fontWeight:900, fontFamily:"Georgia,serif" }}>Отчётность</h1>
                  <p style={{ color:C.slate, margin:0, fontSize:12 }}>Аналитика по договорам, расходам и доле услуг</p>
                </div>
                <Sel value={reportYear} onChange={e=>setReportYear(+e.target.value)} style={{ width:114 }}>
                  {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                </Sel>
              </div>
              {incomeData.length===0&&expenseData.length===0&&gphData.length===0?(
                <div style={{ background:C.white, border:`2px dashed ${C.border}`, borderRadius:16, padding:"50px 24px", textAlign:"center" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
                  <div style={{ color:C.navy, fontWeight:800, fontSize:16, fontFamily:"Georgia,serif" }}>Нет данных для отчёта</div>
                  <div style={{ color:C.slate, fontSize:12, marginTop:6 }}>Менеджеры должны добавить договора</div>
                </div>
              ):(<ReportCharts
                  incomeData={allIncF} expenseData={expenseData.filter(cf)}
                  gphData={gphData.filter(cf)}
                  chartMonthly={chartMonthly} chartPie={chartPie} chartProfit={chartProfit}
                  reportYear={reportYear}
                />
              )}
            </section>
          )}

          {/* USERS — only admin */}
          {tab==="users" && (
            <section>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                <div>
                  <h1 style={{ color:C.navy, margin:"0 0 3px", fontSize:20, fontWeight:900, fontFamily:"Georgia,serif" }}>Пользователи</h1>
                  <p style={{ color:C.slate, margin:0, fontSize:12 }}>Управление доступом и ролями</p>
                </div>
                <Btn onClick={()=>setModal({type:"newUser"})}>+ Добавить</Btn>
              </div>
              <div style={{ display:"grid", gap:12 }}>
                {users.map(u=>(
                  <div key={u.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(27,46,107,0.06)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:44, height:44, background:ROLES[u.role].bg, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{ROLES[u.role].icon}</div>
                      <div>
                        <div style={{ color:C.navy, fontWeight:700, fontSize:14 }}>{u.name}</div>
                        <div style={{ color:C.slate, fontSize:11, marginTop:2 }}>
                          Логин: <b>{u.login}</b>
                          {u.department && <span style={{ marginLeft:8, background:u.department==="mandatory"?"#FEF3C7":"#E0F2FE", color:u.department==="mandatory"?"#B45309":"#0369A1", fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:8 }}>
                            {u.department==="mandatory"?"📜 Обяз.":"🏢 Корп."}
                          </span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <RoleBadge role={u.role}/>
                      {u.id!==currentUser.id && (
                        <button onClick={()=>setUsers(p=>p.filter(x=>x.id!==u.id))} style={{ background:"#FFEBEE", color:C.red, border:"none", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {modal?.type==="newUser" && <NewUserModal onClose={()=>setModal(null)} onSave={u=>{ setUsers(p=>[...p,{...u,id:Date.now()}]); setModal(null); }}/>}
      {modal && modal.type!=="newUser" && <AddModal type={modal.type} onClose={()=>setModal(null)} onSave={saveRecord} incomeData={incomeData} expenseData={expenseData} gphData={gphData}/>}
    </div>
  );
}

// ─── Small components ─────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, sub2, accent, icon }) {
  return (
    <div style={{ background:accent?`linear-gradient(135deg,${C.navyDk},${C.navyMd})`:C.white, border:accent?"none":`1px solid ${C.border}`, borderRadius:14, padding:"16px 18px", display:"flex", flexDirection:"column", gap:6, boxShadow:accent?"0 8px 24px rgba(27,46,107,0.3)":"0 2px 8px rgba(27,46,107,0.06)" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:accent?C.goldLt:C.slate }}>{label}</span>
        {icon && <span style={{ fontSize:17, opacity:0.8 }}>{icon}</span>}
      </div>
      <span style={{ fontSize:20, fontWeight:900, color:accent?C.white:C.navy, fontFamily:"Georgia,serif" }}>{value}</span>
      {sub  && <span style={{ fontSize:11, color:accent?"rgba(255,255,255,0.6)":C.slate }}>{sub}</span>}
      {sub2 && <span style={{ fontSize:11, color:accent?C.goldLt:C.teal, fontWeight:600 }}>{sub2}</span>}
    </div>
  );
}
function InfoCard({ title, children }) {
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 16px 6px", boxShadow:"0 2px 8px rgba(27,46,107,0.06)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
        <div style={{ width:3, height:13, background:C.gold, borderRadius:2 }}/>
        <div style={{ fontWeight:800, color:C.navy, fontSize:12 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}
function DRow({ top, bot, vat, net, status, red }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
      <div style={{ flex:1, minWidth:0, marginRight:8 }}>
        <div style={{ fontSize:12, fontWeight:600, color:C.navy, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{top}</div>
        <div style={{ fontSize:10, color:C.slate, marginTop:1 }}>{bot}</div>
      </div>
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <div style={{ fontSize:12, fontWeight:800, color:red?C.red:C.navy }}>{red?"−":""}{num(vat)} ₸</div>
        <div style={{ fontSize:10, color:C.teal }}>б/НДС: {num(net)} ₸</div>
        <Badge status={status}/>
      </div>
    </div>
  );
}
function Empty({ text }) {
  return <div style={{ padding:"20px 12px", textAlign:"center", color:C.slate, fontSize:12 }}><div style={{ fontSize:24, marginBottom:5 }}>📭</div>{text}</div>;
}
function ChCard({ title, children }) {
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 16px 12px", boxShadow:"0 2px 8px rgba(27,46,107,0.06)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}>
        <div style={{ width:3, height:12, background:C.gold, borderRadius:2 }}/>
        <div style={{ fontWeight:800, color:C.navy, fontSize:12 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

function TableSec({ title, subtitle, rows, filterYear, setFilterYear, onAdd, onDelete, nameCol, nameLabel }) {
  const totVat=rows.reduce((s,r)=>s+r.amountWithVat,0);
  const totNet=rows.reduce((s,r)=>s+r.amountNet,0);
  return (
    <section>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <h1 style={{ color:C.navy, margin:"0 0 3px", fontSize:20, fontWeight:900, fontFamily:"Georgia,serif" }}>{title}</h1>
          <p style={{ color:C.slate, margin:0, fontSize:12 }}>{subtitle}</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Sel value={filterYear} onChange={e=>setFilterYear(e.target.value)} style={{ width:104 }}>
            <option value="all">Все годы</option>
            {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
          </Sel>
          {onAdd && <Btn onClick={onAdd}>+ Добавить</Btn>}
        </div>
      </div>
      <div style={{ background:`linear-gradient(135deg,${C.navyDk},${C.navyMd})`, borderRadius:11, padding:"12px 18px", marginBottom:14, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:12, borderLeft:`4px solid ${C.gold}` }}>
        {[["Записей",rows.length,"#8FAAD4"],["С НДС",rows.length>0?fmt(totVat):"—",C.gold],["Без НДС",rows.length>0?fmt(totNet):"—",C.goldLt],["НДС 12%",rows.length>0?fmt(totVat-totNet):"—","#A78BFA"]].map(([l,v,col])=>(
          <div key={l}><div style={{ color:"#5570A0", fontSize:9, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:2 }}>{l}</div><div style={{ fontSize:14, fontWeight:900, color:col }}>{v}</div></div>
        ))}
      </div>
      {rows.length===0?(
        <div style={{ background:C.white, border:`2px dashed ${C.border}`, borderRadius:14, padding:"40px 24px", textAlign:"center" }}>
          <div style={{ fontSize:30, marginBottom:8 }}>📝</div>
          <div style={{ color:C.navy, fontWeight:700, fontSize:14, marginBottom:5 }}>Нет записей</div>
          {onAdd && <Btn onClick={onAdd} style={{ marginTop:10 }}>+ Добавить первую запись</Btn>}
        </div>
      ):(
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:660 }}>
              <thead>
                <tr style={{ background:"#EEF2FF" }}>
                  {[nameLabel,"Год","Месяц","С НДС","Без НДС","НДС 12%","Категория","Описание","Добавил","Статус"].map(h=>(
                    <th key={h} style={{ padding:"9px 13px", textAlign:"left", fontSize:9, fontWeight:800, color:C.slate, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1.5px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                  {onDelete && <th style={{ padding:"9px 13px", borderBottom:`1.5px solid ${C.border}` }}/>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.white:C.off }}>
                    <td style={{ padding:"9px 13px", fontSize:12, color:C.navy, fontWeight:600, whiteSpace:"nowrap" }}>{r[nameCol]}</td>
                    <td style={{ padding:"9px 13px", fontSize:12, color:C.navy }}>{r.year}</td>
                    <td style={{ padding:"9px 13px", fontSize:12, color:C.navy, whiteSpace:"nowrap" }}>{r.month}</td>
                    <td style={{ padding:"9px 13px", fontSize:12, fontWeight:800, color:C.navy, whiteSpace:"nowrap" }}>{num(r.amountWithVat)} ₸</td>
                    <td style={{ padding:"9px 13px", fontSize:12, fontWeight:700, color:C.teal, whiteSpace:"nowrap" }}>{num(r.amountNet)} ₸</td>
                    <td style={{ padding:"9px 13px", fontSize:12, color:"#7C3AED", whiteSpace:"nowrap" }}>{num(r.vatAmount)} ₸</td>
                    <td style={{ padding:"9px 13px", fontSize:11, whiteSpace:"nowrap" }}>
                      {r.category==="corporate" ? <span style={{ background:"#E0F2FE", color:"#0369A1", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>🏢 Корп.</span>
                      :r.category==="mandatory" ? <span style={{ background:"#FEF3C7", color:"#B45309", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>📜 Обяз.</span>
                      :<span style={{ background:C.off, color:C.slate, fontSize:10, padding:"2px 8px", borderRadius:10 }}>—</span>}
                    </td>
                    <td style={{ padding:"9px 13px", fontSize:12, color:C.slate, minWidth:100 }}>{r.description}</td>
                    <td style={{ padding:"9px 13px", fontSize:11, color:C.slate, whiteSpace:"nowrap" }}>{r.addedBy||"—"}</td>
                    <td style={{ padding:"9px 13px" }}><Badge status={r.status}/></td>
                    {onDelete && <td style={{ padding:"9px 13px" }}>
                      <button onClick={()=>onDelete(r.id)} style={{ background:"#FFEBEE", color:C.red, border:"none", borderRadius:7, padding:"4px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>✕</button>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function AddModal({ type, onClose, onSave, incomeData, expenseData, gphData }) {
  const isGph=type==="gph", isIncome=type==="income";
  const nextLabel=()=>{ if(isGph)return `Физ. лицо #${gphData.length+1}`; if(isIncome)return `Компания #${incomeData.length+1}`; return `Поставщик #${expenseData.length+1}`; };
  const [form,setForm]=useState({ year:2026,month:"Январь",description:"",status:"В процессе",company:nextLabel(),person:nextLabel(),amountWithVat:"",amountNet:"",vatAmount:"" });
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleAmt=(field,val)=>{
    const n=parseFloat(val)||0;
    if(field==="amountWithVat")setForm(p=>({...p,amountWithVat:val,amountNet:withoutVat(n).toFixed(2),vatAmount:vatOnly(n).toFixed(2)}));
    else setForm(p=>({...p,amountNet:val,amountWithVat:withVat(n).toFixed(2),vatAmount:(withVat(n)-n).toFixed(2)}));
  };
  return (
    <Modal title={isGph?"Добавить ГПХ":isIncome?"Добавить доходный":"Добавить расходный"} onClose={onClose}>
      <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
        {isGph?<Input label="ФИО физ. лица" value={form.person} onChange={e=>set("person",e.target.value)}/>
              :<Input label={isIncome?"Компания":"Поставщик"} value={form.company} onChange={e=>set("company",e.target.value)}/>}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <Sel label="Год" value={form.year} onChange={e=>set("year",e.target.value)}>{YEARS.map(y=><option key={y} value={y}>{y}</option>)}</Sel>
          <Sel label="Месяц" value={form.month} onChange={e=>set("month",e.target.value)}>{MONTHS.map(m=><option key={m} value={m}>{m}</option>)}</Sel>
        </div>
        <div style={{ background:C.off,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"12px 12px 9px" }}>
          <div style={{ fontSize:10,fontWeight:800,color:C.navy,marginBottom:9,display:"flex",alignItems:"center",gap:6 }}>
            <div style={{ width:3,height:11,background:C.gold,borderRadius:2 }}/>СУММА ДОГОВОРА
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8 }}>
            <Input label="С НДС (₸)" hint="авто" type="number" value={form.amountWithVat} placeholder="0" onChange={e=>handleAmt("amountWithVat",e.target.value)}/>
            <Input label="Без НДС (₸)" hint="или здесь" type="number" value={form.amountNet} placeholder="0" onChange={e=>handleAmt("amountNet",e.target.value)}/>
          </div>
          <div style={{ background:"rgba(124,58,237,0.08)",borderRadius:7,padding:"6px 11px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontSize:11,color:"#7C3AED",fontWeight:700 }}>НДС 12%</span>
            <span style={{ fontSize:13,fontWeight:800,color:"#7C3AED" }}>{form.vatAmount?num(+form.vatAmount)+" ₸":"—"}</span>
          </div>
        </div>
        <Input label="Описание" value={form.description} onChange={e=>set("description",e.target.value)}/>
        <Sel label="Статус" value={form.status} onChange={e=>set("status",e.target.value)}>
          <option>В процессе</option><option>Исполнен</option><option>Оплачен</option><option>Отменён</option>
        </Sel>
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:4 }}>
          <Btn variant="secondary" onClick={onClose}>Отмена</Btn>
          <Btn onClick={()=>{ if(!form.amountWithVat&&!form.amountNet)return; onSave(type,{...form,type:isIncome?"income":"expense",subtype:isGph?"gph":"tender",amountWithVat:+form.amountWithVat||0,amountNet:+form.amountNet||0,vatAmount:+form.vatAmount||0}); }}>Сохранить</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── ReportCharts ─────────────────────────────────────────────────────────────
function ReportCharts({ incomeData, expenseData, gphData, chartMonthly, chartPie, chartProfit, reportYear }) {

  // Доля услуг: сторонние (тендер) vs ГПХ vs внутренние (доходы)
  const expVat = expenseData.filter(r=>r.year===reportYear).reduce((s,r)=>s+r.amountWithVat,0);
  const gphVat = gphData.filter(r=>r.year===reportYear).reduce((s,r)=>s+r.amountWithVat,0);
  const incVat = incomeData.filter(r=>r.year===reportYear).reduce((s,r)=>s+r.amountWithVat,0);
  const totalExp = expVat + gphVat;

  const shareData = [
    { name:"Сторонние организации", value: expVat,  color:"#1E3A8A" },
    { name:"Договоры ГПХ",          value: gphVat,  color:"#F5A800" },
  ].filter(d=>d.value>0);

  // Доля расходов от доходов
  const expSharePct  = incVat>0 ? ((expVat/incVat)*100).toFixed(1) : 0;
  const gphSharePct  = incVat>0 ? ((gphVat/incVat)*100).toFixed(1) : 0;
  const totalExpPct  = incVat>0 ? (((expVat+gphVat)/incVat)*100).toFixed(1) : 0;

  // Помесячная разбивка — сторонние vs ГПХ
  const MONTHS_SHORT = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
  const MONTHS_FULL  = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
  const monthlyShare = MONTHS_FULL.map((m,i)=>({
    month: MONTHS_SHORT[i],
    "Сторонние": expenseData.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0),
    "ГПХ":       gphData.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0),
    "Доходы":    incomeData.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0),
  }));

  // Топ контрагенты — сторонние
  const topExp = Object.entries(
    expenseData.filter(r=>r.year===reportYear).reduce((acc,r)=>{ acc[r.company]=(acc[r.company]||0)+r.amountWithVat; return acc; },{})
  ).map(([name,value])=>({name:name.slice(0,16),value})).sort((a,b)=>b.value-a.value).slice(0,6);

  // Топ по ГПХ
  const topGph = Object.entries(
    gphData.filter(r=>r.year===reportYear).reduce((acc,r)=>{ acc[r.person]=(acc[r.person]||0)+r.amountWithVat; return acc; },{})
  ).map(([name,value])=>({name:name.slice(0,16),value})).sort((a,b)=>b.value-a.value).slice(0,6);

  const TICK = {fontSize:10, fill:C.slate};
  const tickFmt = v => v>=1e6?(v/1e6).toFixed(1)+"M":v>=1000?(v/1000)+"K":v;

  return (
    <>
      {/* ── ROW 1: доходы/расходы + доля услуг (пай) ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <ChCard title={`Доходы и расходы (с НДС) — ${reportYear}`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartMonthly} margin={{top:4,right:8,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="month" tick={TICK}/>
              <YAxis tick={TICK} tickFormatter={tickFmt}/>
              <Tooltip formatter={v=>fmt(v)}/><Legend/>
              <Bar dataKey="Доходы"  fill={C.navy} radius={[4,4,0,0]}/>
              <Bar dataKey="Расходы" fill={C.gold} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChCard>

        <ChCard title="Доля услуг в общих расходах">
          {shareData.length===0 ? <Empty text="Нет данных о расходах"/> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={shareData} cx="50%" cy="50%" outerRadius={68} innerRadius={36} dataKey="value"
                    label={({name,percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {shareData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Pie>
                  <Tooltip formatter={v=>fmt(v)}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
              {/* KPI плашки */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:6 }}>
                {[
                  { label:"Сторонние орг.", value:fmt(expVat), pct:expSharePct+"%", color:"#1E3A8A", bg:"#EEF2FF" },
                  { label:"Договоры ГПХ",  value:fmt(gphVat), pct:gphSharePct+"%", color:C.gold,    bg:"#FFF8E1" },
                  { label:"Итого расходов",value:fmt(totalExp),pct:totalExpPct+"% от дохода", color:C.red, bg:"#FFEBEE" },
                ].map(k=>(
                  <div key={k.label} style={{ background:k.bg, borderRadius:10, padding:"8px 10px", border:`1px solid ${k.color}22` }}>
                    <div style={{ fontSize:9, fontWeight:700, color:k.color, letterSpacing:"0.06em", marginBottom:3 }}>{k.label}</div>
                    <div style={{ fontSize:13, fontWeight:900, color:k.color, lineHeight:1 }}>{k.pct}</div>
                    <div style={{ fontSize:9, color:k.color, opacity:0.7, marginTop:2 }}>{k.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChCard>
      </div>

      {/* ── ROW 2: помесячная разбивка сторонние vs ГПХ ── */}
      <ChCard title={`Помесячное соотношение: Сторонние организации vs Договоры ГПХ — ${reportYear}`}>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={monthlyShare} margin={{top:4,right:8,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="month" tick={TICK}/>
            <YAxis tick={TICK} tickFormatter={tickFmt}/>
            <Tooltip formatter={v=>fmt(v)}/><Legend/>
            <Bar dataKey="Сторонние" fill="#1E3A8A" radius={[3,3,0,0]}/>
            <Bar dataKey="ГПХ"       fill={C.gold}  radius={[3,3,0,0]}/>
            <Bar dataKey="Доходы"    fill="#22C55E"  radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </ChCard>

      {/* ── ROW 3: топ контрагенты + прибыль ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>
        <ChCard title="Топ сторонние организации (расходы)">
          {topExp.length===0 ? <Empty text="Нет данных"/> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={topExp} layout="vertical" margin={{top:0,right:8,left:8,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
                <XAxis type="number" tick={TICK} tickFormatter={tickFmt}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:C.navy}} width={100}/>
                <Tooltip formatter={v=>fmt(v)}/>
                <Bar dataKey="value" name="Сумма" fill="#1E3A8A" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChCard>

        <ChCard title="Топ по договорам ГПХ">
          {topGph.length===0 ? <Empty text="Нет данных"/> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={topGph} layout="vertical" margin={{top:0,right:8,left:8,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
                <XAxis type="number" tick={TICK} tickFormatter={tickFmt}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:C.navy}} width={100}/>
                <Tooltip formatter={v=>fmt(v)}/>
                <Bar dataKey="value" name="Сумма" fill={C.gold} radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChCard>
      </div>

      {/* ── ROW 4: прибыль по месяцам ── */}
      <div style={{ marginTop:16 }}>
        <ChCard title="Прибыль по месяцам (с НДС)">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartProfit} margin={{top:4,right:8,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="month" tick={TICK}/>
              <YAxis tick={TICK} tickFormatter={tickFmt}/>
              <Tooltip formatter={v=>fmt(v)}/>
              <Line type="monotone" dataKey="Прибыль" stroke={C.gold} strokeWidth={2.5} dot={{fill:C.gold,r:3}}/>
            </LineChart>
          </ResponsiveContainer>
        </ChCard>
      </div>

      {/* ── СВОДНАЯ ТАБЛИЦА ── */}
      <div style={{ marginTop:16 }}>
        <ChCard title={`Сводная таблица: доля услуг за ${reportYear}`}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:560 }}>
              <thead>
                <tr style={{ background:"#EEF2FF" }}>
                  {["Показатель","Сумма с НДС","Без НДС","% от дохода","% от расходов"].map(h=>(
                    <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, fontWeight:800, color:C.slate, letterSpacing:"0.07em", textTransform:"uppercase", borderBottom:`1.5px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label:"Доходы (всего)",         vat:incVat, net:incVat/1.12, pctInc:"100%", pctExp:"—",   color:C.navy, bold:true },
                  { label:"Расходы — сторонние орг.",vat:expVat, net:expVat/1.12, pctInc:incVat>0?(expVat/incVat*100).toFixed(1)+"%":"—", pctExp:totalExp>0?(expVat/totalExp*100).toFixed(1)+"%":"—", color:"#1E3A8A" },
                  { label:"Расходы — договоры ГПХ", vat:gphVat, net:gphVat/1.12, pctInc:incVat>0?(gphVat/incVat*100).toFixed(1)+"%":"—", pctExp:totalExp>0?(gphVat/totalExp*100).toFixed(1)+"%":"—", color:C.gold },
                  { label:"Итого расходов",          vat:totalExp, net:totalExp/1.12, pctInc:incVat>0?(totalExp/incVat*100).toFixed(1)+"%":"—", pctExp:"100%", color:C.red, bold:true },
                ].map((r,i)=>(
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.white:C.off }}>
                    <td style={{ padding:"10px 14px", fontSize:12, color:r.color, fontWeight:r.bold?800:600 }}>{r.label}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, fontWeight:700, color:r.color }}>{fmt(r.vat)}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:C.teal }}>{fmt(r.net)}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, fontWeight:700, color:r.color }}>{r.pctInc}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:C.slate }}>{r.pctExp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChCard>
      </div>
    </>
  );
}

// ─── NewUserModal ─────────────────────────────────────────────────────────────
function NewUserModal({ onClose, onSave }) {
  const [form,setForm]=useState({name:"",login:"",password:"",role:"manager",department:"mandatory"});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  return (
    <Modal title="Добавить пользователя" onClose={onClose}>
      <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
        <Input label="Имя" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Полное имя"/>
        <Input label="Логин" value={form.login} onChange={e=>set("login",e.target.value)} placeholder="login"/>
        <Input label="Пароль" type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="password"/>
        <Sel label="Роль" value={form.role} onChange={e=>set("role",e.target.value)}>
          <option value="admin">🔐 Администратор</option>
          <option value="director">👔 Руководитель</option>
          <option value="head_corporate">🏢 НО Корпоративных программ</option>
          <option value="head_mandatory">📜 НО Обязательных программ</option>
          <option value="manager">📋 Менеджер</option>
        </Sel>
        {form.role==="manager" && (
          <Sel label="Отдел менеджера" value={form.department} onChange={e=>set("department",e.target.value)}>
            <option value="mandatory">📜 Отдел обязательных программ</option>
            <option value="corporate">🏢 Отдел корпоративных программ</option>
          </Sel>
        )}
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:4 }}>
          <Btn variant="secondary" onClick={onClose}>Отмена</Btn>
          <Btn onClick={()=>{ if(!form.name||!form.login||!form.password)return; onSave(form); }}>Сохранить</Btn>
        </div>
      </div>
    </Modal>
  );
}
