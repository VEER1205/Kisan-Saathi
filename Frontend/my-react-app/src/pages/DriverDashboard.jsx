import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, useAuth } from '../context/AppContext'
import s from './DriverDashboard.module.css'

/* ─── Static Data ─────────────────────────────────────────── */
const JOBS = [
  { id:'#KS-JOB-0341', type:'new',    from:'Sinnar',   to:'Nashik APMC',   crop:'🌾 Wheat · 8Q',   date:'10 Mar, 7 AM',  pay:'₹850',  km:'28 km' },
  { id:'#KS-JOB-0338', type:'urgent', from:'Niphad',   to:'Lasalgaon',     crop:'🧅 Onion · 15Q',  date:'Today, 4 PM',   pay:'₹1,400',km:'42 km' },
  { id:'#KS-JOB-0335', type:'new',    from:'Igatpuri', to:'Pune APMC',     crop:'🍅 Tomato · 12Q', date:'11 Mar, 6 AM',  pay:'₹2,200',km:'115 km'},
]
const WEEK_BARS = [
  { day:'Mon',  val:'₹850',   h:'55%',  today:false },
  { day:'Tue',  val:'₹0',     h:'4%',   today:false, empty:true },
  { day:'Wed',  val:'₹2,200', h:'100%', today:false, best:true },
  { day:'Thu',  val:'₹1,400', h:'64%',  today:false },
  { day:'Fri',  val:'₹700',   h:'32%',  today:false },
  { day:'Sat',  val:'₹1,850', h:'84%',  today:true },
]
const ROUTES = [
  { from:'Sinnar',  to:'Nashik APMC',   dist:'28 km · 35 min',  trips:'12 trips', avg:'₹820/trip' },
  { from:'Niphad',  to:'Lasalgaon Mandi',dist:'42 km · 50 min', trips:'7 trips',  avg:'₹1,350/trip' },
  { from:'Nashik',  to:'Pune APMC',      dist:'210 km · 3.5 hr',trips:'3 trips',  avg:'₹2,100/trip' },
]
const DOCS = [
  { id:'dl',  icon:'🪪', name:'Driving License',        hint:'DL card front & back · PDF or JPG · Max 5 MB', status:'verified', file:'DL_Dilip_More.pdf' },
  { id:'aad', icon:'🪪', name:'Aadhaar Card',            hint:'Front & back · PDF or JPG · Max 5 MB',         status:'verified', file:'Aadhaar_DilipMore.pdf' },
  { id:'rc',  icon:'📋', name:'Vehicle RC Book',         hint:'Registration Certificate · PDF or JPG · Max 5 MB', status:'pending', file:'RC_MH15CD5678.pdf' },
  { id:'ins', icon:'🛡️', name:'Vehicle Insurance',       hint:'Current policy · Expiry: 15 Apr 2026',         status:'required', file:null },
  { id:'fit', icon:'🔧', name:'Vehicle Fitness Certificate', hint:'Issued by RTO · PDF or JPG · Max 5 MB',    status:'required', file:null },
]

/* ── Bookings Tab ── */
function BookingsTab({ t }) {
  const [jobs, setJobs] = useState(JOBS)
  const [accepted, setAccepted] = useState({})
  const [tripDone, setTripDone] = useState(false)

  const accept = (id) => setAccepted(a => ({ ...a, [id]: true }))
  const decline = (id) => setJobs(js => js.filter(j => j.id !== id))

  return (
    <div>
      <h2 className={s.secTitle}>📦 {t('tab_bookings')}</h2>
      <p className={s.secSub}>{t('driver_dash_sub')}</p>

      <div className={s.statGrid}>
        {[['🗂️','3','Available Jobs',''],['🚛','1','Active Trip',''],['✅','47','Completed','+3 this week'],['⭐','4.8','Avg Rating','▲ 0.1']].map(([ic,v,l,d])=>(
          <div key={l} className={s.statCard}>
            <span className={s.statIcon}>{ic}</span>
            <div className={s.statVal}>{v}</div>
            <div className={s.statLbl}>{l}</div>
            {d&&<div className={s.statDelta}>{d}</div>}
          </div>
        ))}
      </div>

      <div className={s.grid2}>
        {/* Available Jobs */}
        <div>
          <div className={s.flexBetween} style={{marginBottom:14}}>
            <strong style={{fontSize:'.9rem',color:'var(--text-mid)'}}>{t('available_jobs')}</strong>
            <span style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{jobs.length} near you</span>
          </div>
          {jobs.map(j => (
            <div key={j.id} className={`${s.jobCard} ${j.type==='urgent'?s.jobUrgent:s.jobNew}`}>
              <div className={s.jobHeader}>
                <div className={s.jobId}>{j.id}</div>
                <span className={`${s.badge} ${j.type==='urgent'?s.badgeUrgent:s.badgeNew}`}>
                  {j.type==='urgent'?'⚡ Urgent':'🆕 New'}
                </span>
              </div>
              <div className={s.jobRoute}>
                <span>📍 {j.from}</span>
                <span className={s.routeArrow}>→</span>
                <span>🏪 {j.to}</span>
              </div>
              <div className={s.jobDetails}>
                {[j.crop, j.date, j.pay, j.km].map(d=>(
                  <span key={d} className={s.jobDetail}>{d}</span>
                ))}
              </div>
              <div className={s.jobActions}>
                {accepted[j.id] ? (
                  <button className={s.btnAccepted} disabled>✅ Accepted</button>
                ) : (
                  <>
                    <button className={s.btnAccept} onClick={()=>accept(j.id)}>{t('accept_btn')}</button>
                    <button className={s.btnCall}>{t('call_btn')}</button>
                    <button className={s.btnDecline} onClick={()=>decline(j.id)}>Decline</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* My Bookings */}
        <div>
          <div style={{marginBottom:14}}>
            <strong style={{fontSize:'.9rem',color:'var(--text-mid)'}}>{t('my_bookings')}</strong>
          </div>
          {/* Active trip */}
          <div className={s.activeTripCard}>
            <div className={s.flexBetween} style={{marginBottom:10}}>
              <span className={s.inProgressLabel}>🔄 In Progress</span>
              <span className={`${s.badge} ${s.badgeAssigned}`}>Assigned</span>
            </div>
            <div className={s.jobRoute} style={{marginBottom:8}}>
              <span>📍 Deolali Camp</span><span className={s.routeArrow}>→</span><span>🏪 Nashik APMC</span>
            </div>
            <div className={s.jobDetails} style={{marginBottom:10}}>
              <span className={s.jobDetail}>🌽 Maize · 6Q</span>
              <span className={s.jobDetail}>💰 ₹700</span>
              <span className={s.jobDetail}>📱 Ramesh Patil</span>
            </div>
            <div style={{display:'flex',gap:8}}>
              {tripDone
                ? <button className={s.btnCompleted} disabled>✅ Completed!</button>
                : <button className={s.btnComplete} onClick={()=>setTripDone(true)}>{t('complete_btn')} ✓</button>
              }
              <button className={s.btnCall}>{t('call_btn')}</button>
            </div>
          </div>

          {/* Completed */}
          <div className={s.card}>
            <div className={s.cardTitle}>✅ Recent Completed</div>
            <div className={s.divider}/>
            {[['Sinnar → Nashik APMC','8 Mar · Wheat · Meena Devi','₹850'],
              ['Niphad → Lasalgaon','7 Mar · Onion · Suresh Wagh','₹1,400'],
              ['Nashik → Pune APMC','5 Mar · Tomato · Rajesh K.','₹2,200']].map(([r,m,e])=>(
              <div key={r} className={s.tripRow}>
                <div><div className={s.tripInfo}>{r}</div><div className={s.tripMeta}>{m}</div></div>
                <div className={s.tripEarn}>{e}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Earnings Tab ── */
function EarningsTab({ t }) {
  return (
    <div>
      <h2 className={s.secTitle}>💰 {t('tab_earnings')}</h2>
      <p className={s.secSub}>Your income summary and transaction history</p>
      <div className={s.grid2}>
        <div>
          <div className={s.payoutCard}>
            <div className={s.payoutLabel}>This Month's Earnings</div>
            <div className={s.payoutAmount}>₹18,450</div>
            <div className={s.payoutSub}>March 2026 · 22 trips completed</div>
          </div>
          <div className={s.chartCard}>
            <div className={s.chartTitle}>📈 Daily Earnings — This Week</div>
            <div className={s.chartSub}>Weekly performance overview</div>
            <div className={s.barChart}>
              {WEEK_BARS.map(b => (
                <div key={b.day} className={s.barWrap}>
                  <div className={s.barVal}>{b.val}</div>
                  <div className={s.bar} style={{
                    height: b.h,
                    background: b.empty ? 'var(--cream-dark)' : b.best
                      ? 'linear-gradient(180deg,var(--gold-light),var(--gold))'
                      : b.today
                      ? 'linear-gradient(180deg,var(--green-light),var(--green-mid))'
                      : 'linear-gradient(180deg,var(--orange),#c4600e)',
                    outline: b.today ? '2px solid var(--green-dark)' : 'none',
                    outlineOffset: b.today ? '2px' : '0'
                  }}/>
                  <div className={s.barDay} style={b.today?{color:'var(--green-mid)',fontWeight:700}:{}}>{b.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className={s.statGrid2}>
            {[['📅','₹2,200','Best Day'],['🗓️','₹62,800','This Year'],['🚛','47','Total Trips'],['📏','2,840','km Covered']].map(([ic,v,l])=>(
              <div key={l} className={s.statCard}><span className={s.statIcon}>{ic}</span><div className={s.statVal}>{v}</div><div className={s.statLbl}>{l}</div></div>
            ))}
          </div>
          <div className={s.card}>
            <div className={s.cardTitle}>🧾 Recent Transactions</div>
            <div className={s.divider}/>
            {[['Deolali → Nashik APMC','Today · Maize 6Q','₹700'],
              ['Niphad → Lasalgaon','Yesterday · Onion 15Q','₹1,400'],
              ['Nashik → Pune APMC','5 Mar · Tomato 12Q','₹2,200'],
              ['Sinnar → Nashik','4 Mar · Wheat 8Q','₹850'],
              ['Ozar → Pune APMC','2 Mar · Grapes 6Q','₹1,900']].map(([r,m,e])=>(
              <div key={r} className={s.tripRow}>
                <div><div className={s.tripInfo}>{r}</div><div className={s.tripMeta}>{m}</div></div>
                <div className={s.tripEarn}>{e}</div>
              </div>
            ))}
          </div>
          <div className={s.tipBox} style={{marginTop:14}}>
            💡 <strong>Tip:</strong> Completing 5+ trips per week increases your Priority Driver status and you get job alerts first.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Routes Tab ── */
function RoutesTab({ t }) {
  const [saved, setSaved] = useState(false)
  return (
    <div>
      <h2 className={s.secTitle}>🗺️ {t('tab_routes')}</h2>
      <p className={s.secSub}>Your frequent routes and mileage tracker</p>
      <div className={s.grid2}>
        <div>
          <div className={s.cardTitle} style={{marginBottom:14}}>📌 Frequent Routes</div>
          {ROUTES.map((r,i) => (
            <div key={i} className={s.routeCard}>
              <div className={s.routeVisual}>
                <div className={s.routeNode}><div className={`${s.rnDot} ${s.rnStart}`}/><div className={s.rnLabel}>{r.from}</div></div>
                <div className={s.routeLine}/>
                <div className={s.routeNode}><div className={`${s.rnDot} ${s.rnEnd}`}/><div className={s.rnLabel}>{r.to}</div></div>
              </div>
              <div className={s.routeStats}>
                <div className={s.rsItem}><strong>{r.dist}</strong></div>
                <div className={s.rsItem}><strong>{r.trips}</strong> this month</div>
                <div className={s.rsItem}>Avg: <strong>{r.avg}</strong></div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className={s.card} style={{marginBottom:16}}>
            <div className={s.cardTitle}>📍 Set My Available Zone</div>
            <p className={s.cardSub}>Farmers will see jobs only in your preferred radius</p>
            <label className={s.formLabel}>Base Location</label>
            <input className={s.formInput} type="text" defaultValue="Nashik, Maharashtra"/>
            <label className={s.formLabel} style={{marginTop:10}}>Max Travel Radius</label>
            <select className={s.formInput}>
              <option>50 km</option><option defaultValue>100 km</option>
              <option>150 km</option><option>200 km</option><option>Any distance</option>
            </select>
            <button className={s.btnPrimary} style={{width:'100%',marginTop:12,justifyContent:'center'}}
              onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),1500)}}>
              {saved ? '✅ Saved!' : '💾 Save Zone'}
            </button>
          </div>
          <div className={s.card}>
            <div className={s.cardTitle}>📊 Route Stats — March</div>
            <div className={s.divider}/>
            {[['Total Distance','840 km'],['Total Trips','22 trips'],['Avg Distance/Trip','38 km'],['Longest Trip','Nashik–Pune']].map(([l,v])=>(
              <div key={l} className={s.tripRow}>
                <div className={s.tripInfo}>{l}</div>
                <div className={s.tripEarn}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Documents Tab ── */
function DocsTab({ t }) {
  const [docs, setDocs] = useState(DOCS)
  const fileRefs = useRef({})

  const handleUpload = (id, file) => {
    if (!file) return
    setDocs(ds => ds.map(d => d.id === id ? { ...d, status:'pending', file:file.name } : d))
    setTimeout(() => {
      setDocs(ds => ds.map(d => d.id === id ? { ...d, status:'verified' } : d))
    }, 2000)
  }

  const statusLabel = (status) => {
    if (status === 'verified') return <span className={`${s.docStatus} ${s.docVerified}`}>{t('doc_verified')}</span>
    if (status === 'pending')  return <span className={`${s.docStatus} ${s.docPending}`}>{t('doc_pending')}</span>
    return <span className={`${s.docStatus} ${s.docRequired}`}>{t('doc_required')}</span>
  }

  const driverDocs = docs.filter(d => ['dl','aad'].includes(d.id))
  const vehicleDocs = docs.filter(d => !['dl','aad'].includes(d.id))

  const verified = docs.filter(d => d.status === 'verified').length
  const pending  = docs.filter(d => d.status === 'pending').length
  const required = docs.filter(d => d.status === 'required').length

  return (
    <div>
      <h2 className={s.secTitle}>📄 {t('tab_docs')}</h2>
      <p className={s.secSub}>Upload and manage your vehicle & driver documents. Verified docs build farmer trust.</p>

      <div className={s.expiryWarn}>
        ⚠️ Your Vehicle Insurance expires on <strong>15 April 2026</strong> — please renew soon to keep bookings active.
      </div>

      <div className={s.grid2}>
        {[['🪪 Driver Documents', driverDocs], ['🚛 Vehicle Documents', vehicleDocs]].map(([title, group]) => (
          <div key={title}>
            <div className={s.docSectionTitle}>{title}</div>
            {group.map(doc => (
              <div key={doc.id} className={`${s.docCard} ${doc.status !== 'required' ? s.docUploaded : ''}`}>
                <span className={s.docIcon}>{doc.icon}</span>
                <div className={s.docName}>{doc.name}</div>
                <div className={s.docHint}>{doc.hint}</div>
                {statusLabel(doc.status)}
                {doc.file && <div className={s.docPreview}>📄 {doc.file}</div>}
                <input ref={el => fileRefs.current[doc.id] = el} type="file" accept=".pdf,.jpg,.jpeg,.png"
                  style={{display:'none'}} onChange={e => handleUpload(doc.id, e.target.files?.[0])}/>
                <button className={s.uploadBtn} style={{marginTop:10}}
                  onClick={() => fileRefs.current[doc.id]?.click()}>
                  {doc.file ? '🔄 Re-upload' : '📤 Upload'}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={s.card} style={{marginTop:20}}>
        <div className={s.cardTitle}>📊 Document Verification Status</div>
        <div className={s.divider}/>
        <div className={s.docStatusRow}>
          <div className={s.docStatusItem}><span className={s.dotGreen}/>Verified: {verified} docs</div>
          <div className={s.docStatusItem}><span className={s.dotOrange}/>Pending: {pending} doc{pending!==1?'s':''}</div>
          <div className={s.docStatusItem}><span className={s.dotGray}/>Required: {required} docs</div>
        </div>
        <div className={s.docTip}>Complete all documents to unlock <strong style={{color:'var(--orange)'}}>Priority Driver</strong> status and receive 3× more job requests.</div>
      </div>
    </div>
  )
}

/* ── Profile Tab ── */
function ProfileTab({ t, user, onNameSave }) {
  const [name, setName]           = useState(user?.name || 'Dilip More')
  const [location, setLocation]   = useState('Nashik, Maharashtra')
  const [langs, setLangs]         = useState('Marathi, Hindi, English')
  const [vehNum, setVehNum]       = useState(user?.vehicle || 'MH 15 CD 5678')
  const [vehType, setVehType]     = useState(user?.vehType || 'Mini Truck (1–3 Ton)')
  const [vehCap, setVehCap]       = useState('2.5')
  const [crops, setCrops]         = useState('Wheat, Onion, Tomato')
  const [available, setAvailable] = useState(true)
  const [saved, setSaved]         = useState(false)

  const save = () => {
    onNameSave(name)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div>
      <h2 className={s.secTitle}>👤 {t('tab_profile')}</h2>
      <p className={s.secSub}>Manage your personal info, vehicle details and availability</p>

      <div className={s.profileHeader}>
        <div className={s.profileAvatarLg}>🚛</div>
        <div>
          <div className={s.profileName}>{name}</div>
          <div className={s.profileVehicle}>🚛 {vehNum} · {vehType}</div>
          <div className={s.profileRating}>★★★★★ 4.8 · (47 trips)</div>
          <div className={s.kycBadge}>✅ KYC Verified</div>
        </div>
      </div>

      <div className={s.availToggle} onClick={() => setAvailable(a => !a)}>
        <div className={`${s.toggleSwitch} ${available ? s.toggleOn : ''}`}><div className={s.toggleKnob}/></div>
        <div>
          <div className={s.toggleLabel}>{available ? 'Available for Jobs' : 'Not Available'}</div>
          <div className={s.toggleSub}>{available ? 'You are currently visible to farmers in your area' : 'You are hidden from new job requests'}</div>
        </div>
      </div>

      <div className={s.grid2}>
        <div className={s.card}>
          <div className={s.cardTitle}>👤 Personal Details</div>
          <div className={s.divider}/>
          {[['Full Name','text',name,setName],['Base Location','text',location,setLocation],['Languages','text',langs,setLangs]].map(([l,t,v,sv])=>(
            <div key={l} className={s.fGroup}>
              <label className={s.formLabel}>{l}</label>
              <input className={s.formInput} type={t} value={v} onChange={e=>sv(e.target.value)}/>
            </div>
          ))}
          <div className={s.fGroup}>
            <label className={s.formLabel}>📱 Mobile Number</label>
            <input className={s.formInput} type="tel" value="+91 98765 43210" readOnly/>
          </div>
          <button className={s.btnPrimary} style={{width:'100%',justifyContent:'center',marginTop:4}} onClick={save}>
            {saved ? '✅ Saved!' : '💾 Save Changes'}
          </button>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>🚛 Vehicle Details</div>
          <div className={s.divider}/>
          <div className={s.fGroup}>
            <label className={s.formLabel}>Vehicle Number</label>
            <input className={s.formInput} type="text" value={vehNum} style={{textTransform:'uppercase'}} onChange={e=>setVehNum(e.target.value)}/>
          </div>
          <div className={s.fGroup}>
            <label className={s.formLabel}>Vehicle Type</label>
            <select className={s.formInput} value={vehType} onChange={e=>setVehType(e.target.value)}>
              <option>Mini Truck (1–3 Ton)</option>
              <option>Medium Truck (3–7 Ton)</option>
              <option>Large Truck (7–15 Ton)</option>
              <option>Tractor-Trolley</option>
            </select>
          </div>
          <div className={s.fGroup}>
            <label className={s.formLabel}>Load Capacity (Ton)</label>
            <input className={s.formInput} type="number" value={vehCap} onChange={e=>setVehCap(e.target.value)}/>
          </div>
          <div className={s.fGroup}>
            <label className={s.formLabel}>Preferred Crops</label>
            <input className={s.formInput} type="text" value={crops} onChange={e=>setCrops(e.target.value)}/>
          </div>
          <button className={s.btnPrimary} style={{width:'100%',justifyContent:'center',marginTop:4,background:'linear-gradient(135deg,var(--green-light),var(--green-mid))'}}>
            💾 Save Vehicle Info
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Dashboard ── */
export default function DriverDashboard() {
  const { t, lang, setLang } = useLang()
  const { user, login, logout } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState('bookings')
  const [driverName, setDriverName] = useState(user?.name?.split(' ')[0] || 'Dilip')

  const doLogout = () => { logout(); nav('/login') }

  const saveName = (name) => {
    login({ ...user, name })
    setDriverName(name.split(' ')[0])
  }

  const tabs = [
    { id:'bookings', icon:'📦', key:'tab_bookings' },
    { id:'earnings', icon:'💰', key:'tab_earnings' },
    { id:'routes',   icon:'🗺️', key:'tab_routes'   },
    { id:'docs',     icon:'📄', key:'tab_docs'      },
    { id:'profile',  icon:'👤', key:'tab_profile'   },
  ]

  return (
    <div className={s.root}>
      {/* Header */}
      <header className={s.header}>
        <div className={s.hBrand}>
          <div className={s.hIcon}>🚛</div>
          <div>
            <div className={s.hName}>{t('brand_name')}</div>
            <div className={s.hSub}>{t('driver_tagline')}</div>
          </div>
        </div>
        <div className={s.hRight}>
          {[['EN','EN'],['HI','हिं'],['MR','मर']].map(([c,l])=>(
            <button key={c} className={`${s.langBtn} ${lang===c?s.langActive:''}`} onClick={()=>setLang(c)}>{l}</button>
          ))}
          <div className={s.hAvatar}>🚛</div>
          <button className={s.logoutBtn} onClick={doLogout}>{t('logout')}</button>
        </div>
      </header>

      {/* Orange info bar */}
      <div className={s.infoBar}>
        <div className={s.infoItem}>👤 {t('greeting')}, <strong>{driverName}</strong> 🙏</div>
        <div className={s.infoDivider}/>
        <div className={s.infoItem}>🚛 <strong>{user?.vehicle || 'MH 15 CD 5678'}</strong></div>
        <div className={s.infoDivider}/>
        <div className={s.infoItem}>
          <span className={s.onlineBadge}><span className={s.onlineDot}/>Online</span>
        </div>
        <div className={s.infoDivider}/>
        <div className={s.infoItem}>📍 <strong>Nashik, Maharashtra</strong></div>
        <div className={s.earningsPill}>💰 Today: <strong>₹1,850</strong></div>
      </div>

      {/* Nav */}
      <nav className={s.navTabs}>
        {tabs.map(tb => (
          <button key={tb.id} className={`${s.tabBtn} ${tab===tb.id?s.tabActive:''}`} onClick={()=>setTab(tb.id)}>
            <span className={s.tabIcon}>{tb.icon}</span>
            <span className={s.tabLabel}>{t(tb.key)}</span>
          </button>
        ))}
      </nav>

      {/* Main */}
      <main className={s.main}>
        {tab==='bookings' && <BookingsTab t={t}/>}
        {tab==='earnings' && <EarningsTab t={t}/>}
        {tab==='routes'   && <RoutesTab   t={t}/>}
        {tab==='docs'     && <DocsTab     t={t}/>}
        {tab==='profile'  && <ProfileTab  t={t} user={user} onNameSave={saveName}/>}
      </main>

      <footer className={s.footer}><span>Kisan Saathi</span> · {t('footer_text')} · © 2026</footer>
    </div>
  )
}
