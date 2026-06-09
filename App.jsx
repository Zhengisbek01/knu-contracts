import { useState, useMemo } from "react";
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
const LOGO_B64 = "data:image/png;base64,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...";

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

  // категорийный фильтр: начальник отдела видит свой отдел, менеджер видит свой отдел
  const userDept = currentUser.department || role.category || null;
  const catFilter = r => userDept ? r.category === userDept : true;
  const allIncF   = incomeData.filter(catFilter);
  const allExp    = [...expenseData,...gphData].filter(catFilter);
  const totalIncVat = allIncF.reduce((s,r)=>s+r.amountWithVat,0);
  const totalIncNet = allIncF.reduce((s,r)=>s+r.amountNet,0);
  const totalExpVat = allExp.reduce((s,r)=>s+r.amountWithVat,0);
  const profit      = totalIncVat - totalExpVat;

  const fIncome  = allIncF.filter(r=>filterYear==="all"||r.year===+filterYear);
  const fExpense = expenseData.filter(catFilter).filter(r=>filterYear==="all"||r.year===+filterYear);
  const fGph     = gphData.filter(catFilter).filter(r=>filterYear==="all"||r.year===+filterYear);

  const chartMonthly = useMemo(()=>MONTHS.map(m=>({
    month:m.slice(0,3),
    "Доходы": allIncF.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0),
    "Расходы":allExp.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0),
  })),[allIncF,allExp,reportYear]);

  const chartPie = useMemo(()=>{
    const t=expenseData.filter(catFilter).filter(r=>r.year===reportYear).reduce((s,r)=>s+r.amountWithVat,0);
    const g=gphData.filter(catFilter).filter(r=>r.year===reportYear).reduce((s,r)=>s+r.amountWithVat,0);
    return [{name:"Тендерные",value:t},{name:"ГПХ",value:g}];
  },[expenseData,gphData,reportYear,currentUser]);

  const chartProfit = useMemo(()=>MONTHS.map(m=>{
    const i=allIncF.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0);
    const e=allExp.filter(r=>r.year===reportYear&&r.month===m).reduce((s,r)=>s+r.amountWithVat,0);
    return {month:m.slice(0,3),"Прибыль":i-e};
  }),[allIncF,allExp,reportYear]);

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
                <KpiCard icon="📉" label="Расход с НДС" value={totalExpVat>0?fmt(totalExpVat):"—"} sub={`${allExp.length} записей`}/>
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
                  {allExp.length===0?<Empty text="Нет данных"/>:allExp.slice(-4).reverse().map(r=>(
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
                  incomeData={allIncF} expenseData={expenseData.filter(catFilter)}
                  gphData={gphData.filter(catFilter)}
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
