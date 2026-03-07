import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, useAuth } from '../context/AppContext'
import s from './FarmerDashboard.module.css'

/* ─── Static Data ─────────────────────────────────────────── */
const CROPS = [
  { id:'wheat', emoji:'🌾', name:'Wheat', season:'Rabi',
    timeline:[{label:'Sowing',days:'Day 0',icon:'🌱',done:true},{label:'Germination',days:'Day 7–10',icon:'🌿',done:true},{label:'Tillering',days:'Day 25–45',icon:'🌾',done:true},{label:'Jointing',days:'Day 50–65',icon:'🌿',done:false},{label:'Flowering',days:'Day 70–85',icon:'🌸',done:false},{label:'Grain Fill',days:'Day 90–110',icon:'🌾',done:false},{label:'Harvest',days:'Day 120',icon:'🚜',done:false}],
    fertilizer:[{stage:'Basal (Sowing)',fert:'DAP + MOP',dose:'25+10',method:'Soil mix'},{stage:'Tillering (Day 25)',fert:'Urea',dose:'20',method:'Top dress'},{stage:'Jointing (Day 55)',fert:'Urea',dose:'20',method:'Top dress'},{stage:'Flowering',fert:'Potassium Nitrate',dose:'5 foliar',method:'Spray'}],
    pests:[{icon:'🦟',name:'Aphids (Mahu)',symptom:'Yellowing leaves, sticky honeydew on shoots',remedy:'Spray Imidacloprid 17.8% SL @ 0.5 ml/L. Neem oil as organic option.'},{icon:'🍄',name:'Yellow Rust',symptom:'Yellow stripe pustules on leaves, severe yield loss',remedy:'Spray Propiconazole 25% EC @ 1 ml/L at first sign. Variety: HD-2781.'},{icon:'🐌',name:'Termites (Deemak)',symptom:'Wilting, hollow stems, roots eaten at soil level',remedy:'Chlorpyrifos 20 EC @ 5 ml/kg seed treatment before sowing.'}] },
  { id:'rice', emoji:'🍚', name:'Rice', season:'Kharif',
    timeline:[{label:'Nursery',days:'Day 0–25',icon:'🌱',done:false},{label:'Transplant',days:'Day 25–30',icon:'🌿',done:false},{label:'Tillering',days:'Day 30–60',icon:'🌿',done:false},{label:'Flowering',days:'Day 90–110',icon:'🌸',done:false},{label:'Harvest',days:'Day 140',icon:'🚜',done:false}],
    fertilizer:[{stage:'Basal',fert:'DAP',dose:'20 kg/acre',method:'Broadcast'},{stage:'Tillering',fert:'Urea',dose:'25 kg/acre',method:'Top dress'}],
    pests:[{icon:'🐛',name:'Stem Borer',symptom:'Dead heart, white ear, entry hole on stem',remedy:'Chlorpyrifos 20 EC @ 2.5 ml/L or Carbofuran 3G @ 6 kg/acre.'}] },
  { id:'onion', emoji:'🧅', name:'Onion', season:'Rabi/Kharif',
    timeline:[{label:'Nursery',days:'Day 0–35',icon:'🌱',done:false},{label:'Transplant',days:'Day 35–40',icon:'🌿',done:false},{label:'Vegetative',days:'Day 40–80',icon:'🌿',done:false},{label:'Bulbing',days:'Day 80–110',icon:'🧅',done:false},{label:'Harvest',days:'Day 120',icon:'🚜',done:false}],
    fertilizer:[{stage:'Basal',fert:'FYM + DAP',dose:'4T + 20 kg',method:'Soil mix'},{stage:'Vegetative',fert:'Urea',dose:'15 kg/acre',method:'Top dress'}],
    pests:[{icon:'🦟',name:'Thrips',symptom:'Silver streaks on leaves, curling',remedy:'Spinosad 45 SC @ 0.3 ml/L. Avoid overhead irrigation.'}] },
  { id:'tomato', emoji:'🍅', name:'Tomato', season:'All Season',
    timeline:[{label:'Seedling',days:'Day 0–30',icon:'🌱',done:false},{label:'Vegetative',days:'Day 30–50',icon:'🌿',done:false},{label:'Flowering',days:'Day 50–60',icon:'🌸',done:false},{label:'Fruit Set',days:'Day 60–75',icon:'🍅',done:false},{label:'Harvest',days:'Day 75–90',icon:'🚜',done:false}],
    fertilizer:[{stage:'Transplanting',fert:'DAP',dose:'25 kg/acre',method:'Basal'},{stage:'Fruit Set',fert:'Potassium Sulfate',dose:'10 kg/acre',method:'Drip'}],
    pests:[{icon:'🟤',name:'Blossom End Rot',symptom:'Dark sunken spot at fruit bottom',remedy:'Calcium foliar spray @ 0.5%. Maintain consistent irrigation.'}] },
  { id:'soybean', emoji:'🫘', name:'Soybean', season:'Kharif',
    timeline:[{label:'Germination',days:'Day 0–7',icon:'🌱',done:false},{label:'Vegetative',days:'Day 7–35',icon:'🌿',done:false},{label:'Flowering',days:'Day 35–55',icon:'🌸',done:false},{label:'Pod Fill',days:'Day 55–80',icon:'🫘',done:false},{label:'Maturity',days:'Day 85–95',icon:'🚜',done:false}],
    fertilizer:[{stage:'Basal',fert:'Rhizobium + PSB',dose:'Seed treatment',method:'Inoculation'},{stage:'Vegetative',fert:'DAP',dose:'20 kg/acre',method:'Broadcast'}],
    pests:[{icon:'🐛',name:'Girdle Beetle',symptom:'Two girdling rings on stem, plants snap off',remedy:'Quinalphos 25 EC @ 2 ml/L spray at early vegetative stage.'}] },
]

const MANDI = [
  {emoji:'🧅',name:'Onion (Kanda)',market:'Nashik APMC · Grade A',price:'₹2,750',unit:'/quintal',delta:'▲ +₹180',up:true},
  {emoji:'🌾',name:'Wheat (Gehun)',market:'Nashik APMC · Grade A',price:'₹2,275',unit:'/quintal',delta:'▲ +₹25',up:true},
  {emoji:'🍅',name:'Tomato (Tamatar)',market:'Nashik APMC · Mixed',price:'₹1,200',unit:'/quintal',delta:'▼ -₹320',up:false,down:true},
  {emoji:'🫘',name:'Soybean (Soya)',market:'Nashik APMC · Grade B',price:'₹4,100',unit:'/quintal',delta:'→ Stable',up:false},
  {emoji:'🌽',name:'Maize (Makka)',market:'Nashik APMC · Grade A',price:'₹1,890',unit:'/quintal',delta:'▲ +₹90',up:true},
]

const TRANSPORTERS = [
  {name:'Ganesh Transport Co.',meta:'Mini Truck · 2.5 Ton · Available Now',rating:'★★★★★ 4.8',trips:132,price:'₹850',route:'Nashik–APMC'},
  {name:'Shri Sai Vehicles',meta:'Medium Truck · 5 Ton · Available Tomorrow',rating:'★★★★☆ 4.3',trips:89,price:'₹1,400',route:'Nashik–APMC'},
  {name:'Patel Freight Lines',meta:'Mini Truck · 1.5 Ton · Available Today',rating:'★★★★★ 4.9',trips:208,price:'₹650',route:'Nashik–APMC'},
  {name:'Maharashtra Agri Carriers',meta:'Large Truck · 10 Ton · Available 12 Mar',rating:'★★★★☆ 4.5',trips:64,price:'₹2,800',route:'Nashik–Pune'},
]

const AI_TIPS = [
  'Based on current weather (28°C, low humidity) and your Wheat crop at Day 32, watch out for Yellow Rust in the next 7 days. Consider prophylactic Propiconazole spray this week.',
  'IMD forecast: Light rain expected in 3 days. Avoid fertilizer application today — wait until post-rain for better uptake.',
  'Market insight: Onion prices trending up. If you have stored stock, next 7–10 days may offer better rates at Nashik APMC.',
  'Soil temperature is ideal for wheat tillering. Apply second dose of Urea (20 kg/acre) this week for best results.',
]

const BOT_REPLIES = {
  '🌧️ Rain forecast?': 'IMD forecast for Nashik: Light to moderate rain on March 10–11. Avoid pesticide spraying 24 hrs before rain.',
  '💰 MSP rates?': 'MSP 2025–26: Wheat ₹2,275/q | Paddy ₹2,300/q | Soybean ₹4,892/q | Maize ₹2,225/q | Cotton ₹7,121/q.',
  '🌱 Sowing tips': 'Best Rabi sowing time: Wheat (Oct 15–Nov 15), Onion (Oct–Nov). Ensure soil moisture >50%. Use certified seeds from KVK.',
  '🏛️ Govt schemes': 'PM Kisan (₹6,000/yr) · PM Fasal Bima Yojana · Kisan Credit Card · PMKSY drip irrigation 55% subsidy. Apply at nearest CSC.',
  '📊 Today\'s prices': 'Nashik APMC today: Onion ₹2,750 ▲ | Wheat ₹2,275 ▲ | Tomato ₹1,200 ▼ | Soybean ₹4,100 → | Maize ₹1,890 ▲.',
  '💧 Water saving': 'Drip irrigation saves 40% water. Water wheat 6–8 AM. Soil moisture sensor for precision. Mulching reduces evaporation 30%.',
}

/* ── Accordion ── */
function Accordion({ title, children, openDefault=true }) {
  const [open, setOpen] = useState(openDefault)
  return (
    <div className={s.acc}>
      <button className={s.accHead} onClick={()=>setOpen(o=>!o)}>
        {title}<span className={s.accArrow}>{open?'▼':'▶'}</span>
      </button>
      {open&&<div className={s.accBody}>{children}</div>}
    </div>
  )
}

/* ── Crops Tab ── */
function CropsTab({ t }) {
  const [sel, setSel] = useState('wheat')
  const crop = CROPS.find(c=>c.id===sel)
  return (
    <div>
      <h2 className={s.secTitle}>🌿 {t('tab_crops')}</h2>
      <p className={s.secSub}>Select a crop to view growth timeline, fertilizer schedule & pest management</p>
      <div className={s.cropGrid}>
        {CROPS.map(c=>(
          <div key={c.id} className={`${s.cropCard} ${sel===c.id?s.cropSel:''}`} onClick={()=>setSel(c.id)}>
            <span className={s.cropEmoji}>{c.emoji}</span>
            <div className={s.cropName}>{c.name}</div>
            <div className={s.cropSeason}>{c.season}</div>
          </div>
        ))}
      </div>
      {crop&&(
        <div>
          <Accordion title={`📅 Growth Timeline — ${crop.name}`}>
            <div className={s.timeline}>
              {crop.timeline.map((step,i)=>(
                <div key={i} className={s.tStep}>
                  <div className={`${s.tDot} ${step.done?s.tDone:''}`}>{step.icon}</div>
                  <div className={s.tLabel}>{step.label}</div>
                  <div className={s.tDays}>{step.days}</div>
                </div>
              ))}
            </div>
            {sel==='wheat'&&<p className={s.tipText}>Current: <strong style={{color:'var(--green-mid)'}}>Day 32 — Tillering Stage</strong></p>}
          </Accordion>
          <Accordion title="🧪 Fertilizer Schedule" openDefault={sel==='wheat'}>
            <div className={s.fertWrap}>
              <table className={s.fertTable}>
                <thead><tr><th>Stage</th><th>Fertilizer</th><th>Dose</th><th>Method</th></tr></thead>
                <tbody>{crop.fertilizer.map((r,i)=><tr key={i}><td>{r.stage}</td><td>{r.fert}</td><td>{r.dose}</td><td>{r.method}</td></tr>)}</tbody>
              </table>
            </div>
            <p className={s.tipText}>⚠️ Apply fertilizer after irrigation for best absorption.</p>
          </Accordion>
          <Accordion title="🐛 Pests & Remedies" openDefault={sel==='wheat'}>
            {crop.pests.map((p,i)=>(
              <div key={i} className={s.pestCard}>
                <div className={s.pestIcon}>{p.icon}</div>
                <div>
                  <div className={s.pestName}>{p.name}</div>
                  <div className={s.pestSym}><strong>Symptom:</strong> {p.symptom}</div>
                  <div className={s.pestRem}>✅ <strong>Remedy:</strong> {p.remedy}</div>
                </div>
              </div>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  )
}

/* ── Community Tab ── */
function CommunityTab({ t }) {
  const [votes, setVotes] = useState({0:false,1:false,2:false})
  const [aiIdx, setAiIdx] = useState(0)
  const [question, setQuestion] = useState('')
  const posts = [
    {avatar:'S',color:'green',author:'Suresh Wagh',meta:'Pune · 2 hours ago',tags:['Wheat','Pest'],body:'Mazi wheat crop mhanje yellow rust cha problem zala aahe. Nashik bhagaat konala he problem aahe ka? Propiconazole spray kelya nantar improvement zale mala. Tumhala kay experience aahe?',likes:42,comments:13},
    {avatar:'M',color:'brown',author:'Meena Devi',meta:'Solapur · 5 hours ago',tags:['Onion','Market'],body:'Onion prices at Lasalgaon touched ₹2,800/quintal today! Nashik region farmers — hold your stock for 2 more weeks if you have storage. Export demand rising.',likes:87,comments:24},
    {avatar:'R',color:'gold',author:'Rajesh Kulkarni',meta:'Nashik · Yesterday',tags:['Water','Irrigation'],body:'Installed drip irrigation for 3 acres of tomatoes. Investment ₹45,000 but water usage dropped 40% and yield up 25%. Government subsidy covered 50% of cost. Apply at your nearest KVK!',likes:156,comments:38},
  ]
  return (
    <div>
      <h2 className={s.secTitle}>👨‍👩‍👧 {t('tab_community')}</h2>
      <p className={s.secSub}>Ask questions, share experiences, and connect with farmers near you</p>
      <div className={s.commLayout}>
        <div>
          <div className={s.flexBetween} style={{marginBottom:16}}>
            <strong style={{fontSize:'.92rem',color:'var(--text-mid)'}}>Recent Posts</strong>
            <button className={s.btnPrimary} style={{padding:'7px 14px',fontSize:'.8rem'}}>+ {t('new_post')}</button>
          </div>
          {posts.map((p,i)=>(
            <div key={i} className={s.postCard}>
              <div className={s.postHeader}>
                <div className={`${s.avatar} ${s['av'+p.color]}`}>{p.avatar}</div>
                <div><div className={s.postAuthor}>{p.author}</div><div className={s.postMeta}>{p.meta}</div></div>
              </div>
              <div style={{marginBottom:8}}>{p.tags.map(tg=><span key={tg} className={s.tag}>{tg}</span>)}</div>
              <div className={s.postBody}>{p.body}</div>
              <div className={s.postActions}>
                <button className={`${s.actBtn} ${votes[i]?s.voted:''}`}
                  onClick={()=>setVotes(v=>({...v,[i]:!v[i]}))}>
                  👍 {p.likes+(votes[i]?1:0)}
                </button>
                <button className={s.actBtn}>💬 {p.comments} Comments</button>
                <button className={s.actBtn}>🔗 Share</button>
              </div>
            </div>
          ))}
          <div className={s.card} style={{marginTop:16}}>
            <div className={s.cardTitle}>🙋 Ask a Question</div>
            <textarea className={s.askArea} placeholder="Type your farming question here..." value={question} onChange={e=>setQuestion(e.target.value)}/>
            <div style={{display:'flex',gap:10,marginTop:8}}>
              <button className={s.btnPrimary}>Post Question</button>
              <button className={s.btnSec}>Add Photo 📷</button>
            </div>
          </div>
        </div>
        <div>
          <div className={s.aiBox}>
            <div className={s.aiTitle}>🤖 AI Advisory</div>
            <div className={s.aiText}>{AI_TIPS[aiIdx]}</div>
            <button className={s.aiRefresh} onClick={()=>setAiIdx(i=>(i+1)%AI_TIPS.length)}>↻ Refresh</button>
          </div>
          <div className={s.card}>
            <div className={s.cardTitle}>🔥 Trending Topics</div>
            <div className={s.divider}/>
            {[['🧅','Onion Prices Surge','342 farmers discussing'],['🌧️','IMD Rain Forecast','218 farmers discussing'],['💰','PM Kisan 19th Installment','891 farmers discussing'],['🌾','MSP for Wheat 2026','456 farmers discussing']].map(([ic,ti,me])=>(
              <div key={ti} className={s.trendItem}><span className={s.trendIcon}>{ic}</span><div><div className={s.trendTitle}>{ti}</div><div className={s.trendMeta}>{me}</div></div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Mandi Tab ── */
function MandiTab({ t }) {
  return (
    <div>
      <h2 className={s.secTitle}>📊 {t('tab_mandi')}</h2>
      <p className={s.secSub}>Live market rates from Agmarknet · Updated: Today 9:00 AM</p>
      <div className={s.mandiLayout}>
        <div>
          <div className={s.flexBetween} style={{marginBottom:16}}>
            <span style={{fontSize:'.84rem',color:'var(--text-soft)'}}>Showing: <strong>Nashik APMC</strong></span>
            <select className={s.selectSm}>
              <option>Nashik APMC</option><option>Lasalgaon Mandi</option><option>Pune APMC</option>
            </select>
          </div>
          {MANDI.map((m,i)=>(
            <div key={i} className={s.priceCard}>
              <div className={s.priceIcon}>{m.emoji}</div>
              <div className={s.priceInfo}><div className={s.priceName}>{m.name}</div><div className={s.priceMarket}>{m.market}</div></div>
              <div className={s.priceVal}><div className={s.priceNum}>{m.price}</div><div className={s.priceUnit}>{m.unit}</div></div>
              <span className={`${s.priceDelta} ${m.up?s.deltaUp:m.down?s.deltaDown:s.deltaFlat}`}>{m.delta}</span>
            </div>
          ))}
        </div>
        <div>
          <div className={s.chartWrap}>
            <div className={s.chartTitle}>📈 Onion Price Trend</div>
            <div className={s.chartSub}>Last 7 days · Nashik APMC</div>
            <svg viewBox="0 0 280 120" className={s.chartSvg}>
              <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7ab648" stopOpacity=".3"/><stop offset="100%" stopColor="#7ab648" stopOpacity="0"/></linearGradient></defs>
              <line x1="0" y1="100" x2="280" y2="100" stroke="#e8d5b7" strokeWidth="1"/>
              <line x1="0" y1="70" x2="280" y2="70" stroke="#e8d5b7" strokeWidth="0.5" strokeDasharray="4,3"/>
              <line x1="0" y1="40" x2="280" y2="40" stroke="#e8d5b7" strokeWidth="0.5" strokeDasharray="4,3"/>
              <polygon points="20,80 60,75 100,85 140,65 180,55 220,50 260,45 260,100 20,100" fill="url(#ag)"/>
              <polyline points="20,80 60,75 100,85 140,65 180,55 220,50 260,45" fill="none" stroke="#4a7c2f" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
              {[[20,80],[60,75],[100,85],[140,65],[180,55],[220,50]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke="#4a7c2f" strokeWidth="2"/>)}
              <circle cx="260" cy="45" r="5" fill="#4a7c2f" stroke="#2d5016" strokeWidth="2"/>
              {[['M',20],['T',60],['W',100],['T',140],['F',180],['S',220]].map(([l,x])=><text key={x} x={x} y="115" textAnchor="middle" fontSize="8" fill="#a89880">{l}</text>)}
              <text x="260" y="115" textAnchor="middle" fontSize="8" fill="#7ab648" fontWeight="bold">Today</text>
              <text x="265" y="48" fontSize="8" fill="#4a7c2f" fontWeight="bold">2,750</text>
            </svg>
          </div>
          <div className={s.card}>
            <div className={s.cardTitle}>💡 AI Market Insights</div>
            <div className={s.divider}/>
            {[['📈','Onion prices expected to rise 8–12% next week due to lower arrivals from Rajasthan and increased export orders.'],['⚠️','Tomato glut expected for 10 days. Consider cold storage or sell within 3 days at current price.'],['✅','Wheat MSP is ₹2,275/q. Current mandi matches MSP — sell now or wait for private buyers offering ₹50 premium.']].map(([ic,tx])=>(
              <div key={ic} className={s.insightItem}><span className={s.insightIcon}>{ic}</span><span className={s.insightText}>{tx}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Transport Tab ── */
function TransportTab({ t }) {
  const [booked, setBooked] = useState(null)
  return (
    <div>
      <h2 className={s.secTitle}>🚛 {t('tab_transport')}</h2>
      <p className={s.secSub}>Book vehicles for crop transport · Track your bookings</p>
      <div className={s.tpLayout}>
        <div>
          <div className={s.bookingStatus}>
            <div className={s.flexBetween} style={{marginBottom:12}}>
              <div className={s.cardTitle}>📦 Active Booking</div>
              <span className={s.statusBadge}><span className={s.statusDot}/>Confirmed</span>
            </div>
            <div className={s.bookingGrid}>
              {[['Booking ID','#KS-2024-0312'],['Crop','🌾 Wheat · 8 Quintal'],['From','Sinnar, Nashik'],['To','Nashik APMC'],['Pickup','10 Mar, 7:00 AM'],['Driver','Dilip More 📞']].map(([l,v])=>(
                <div key={l} className={s.bookField}><div className={s.bookLabel}>{l}</div><div className={s.bookVal}>{v}</div></div>
              ))}
            </div>
          </div>
          <div className={s.card} style={{marginTop:16}}>
            <div className={s.cardTitle}>📝 New Transport Request</div>
            <p style={{fontSize:'.8rem',color:'var(--text-muted)',marginBottom:14}}>Fill details to find available transporters</p>
            <div className={s.formGrid}>
              {[['Crop Type','select',['Wheat','Onion','Tomato','Soybean']],['Quantity (Quintal)','number'],['Pickup Location','text'],['Destination Mandi','select',['Nashik APMC','Lasalgaon Mandi','Pune APMC']],['Pickup Date','date'],['Vehicle Type','select',['Mini Truck (1–3 Ton)','Medium Truck (3–7 Ton)','Large Truck (7–15 Ton)']]].map(([lbl,type,opts])=>(
                <div key={lbl} className={s.formGroup}>
                  <label className={s.formLabel}>{lbl}</label>
                  {type==='select'
                    ? <select className={s.formInput}>{opts.map(o=><option key={o}>{o}</option>)}</select>
                    : <input className={s.formInput} type={type} placeholder={type==='number'?'e.g. 10':type==='text'?'Village/Taluka':''}/>
                  }
                </div>
              ))}
            </div>
            <button className={s.btnPrimary} style={{marginTop:4}}>🔍 Find Transporters</button>
          </div>
        </div>
        <div>
          <div className={s.cardTitle} style={{marginBottom:16}}>🚛 Available Transporters</div>
          {TRANSPORTERS.map((tr,i)=>(
            <div key={i} className={s.trCard}>
              <div className={s.trTruck}>🚛</div>
              <div className={s.trInfo}><div className={s.trName}>{tr.name}</div><div className={s.trMeta}>{tr.meta}</div><div className={s.trRating}>{tr.rating} ({tr.trips} trips)</div></div>
              <div className={s.trPrice}><div className={s.trRate}>{tr.price}</div><div style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{tr.route}</div></div>
              <button className={`${s.bookBtn} ${booked===i?s.bookDone:''}`}
                onClick={()=>setBooked(i)}>{booked===i?'✓ Booked':'Book'}</button>
            </div>
          ))}
          <div className={s.card} style={{marginTop:16,background:'var(--gold-pale)',borderColor:'var(--gold)'}}>
            <div style={{fontSize:'.85rem',fontWeight:600,color:'var(--brown-dark)',marginBottom:5}}>💡 Tip: Save on Transport</div>
            <div style={{fontSize:'.8rem',color:'var(--text-mid)'}}>3 farmers near Sinnar are going to Nashik APMC on 10 Mar. <a href="#" style={{color:'var(--green-dark)',fontWeight:600}}>Join their booking</a> and split costs!</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Chatbot Tab ── */
function ChatbotTab({ t, userName }) {
  const [msgs, setMsgs] = useState([
    {type:'bot',text:`Namaste ${userName} ji! 🙏 Main aapka Kisan Saathi AI hoon. Aap kuch bhi pooch sakte hain — crops, mandi prices, weather, government schemes, ya koi bhi farming sawaal!`},
    {type:'user',text:'Mazhya wheat crop la yellow rust aahe. Kay karava?'},
    {type:'bot',text:'Yellow rust (Puccinia striiformis) sathi:\n\n🧪 Propiconazole 25% EC @ 1 ml/L spray kara\n🌿 Organic: Neem oil + copper sulphate\n⏰ Subah lavakar spray kara\n\nNashik region madhe Rabi season madhye he common aahe. 2–3 treatments lagel 10 din aantarala.'},
    {type:'user',text:'PM Kisan next installment kab aayegi?'},
    {type:'bot',text:'PM Kisan Samman Nidhi 19th Installment:\n\n💰 Amount: ₹2,000 per installment\n📅 Expected: February–March 2026\n✅ Status check: pmkisan.gov.in par "Beneficiary Status" check karo'},
  ])
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  const now = () => { const d=new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')} ${d.getHours()>=12?'PM':'AM'}` }

  const addMsg = (text, type) => {
    setMsgs(m=>[...m,{type,text,time:now()}])
    setTimeout(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),50)
  }

  const send = (text) => {
    if (!text.trim()) return
    addMsg(text,'user')
    setInput('')
    setTimeout(()=>addMsg(BOT_REPLIES[text]||'Main aapki baat samajh raha hoon. Nashik region ke liye specific advice ke liye apne local KVK center se bhi contact kar sakte hain. Koi aur sawaal?','bot'),700)
  }

  return (
    <div>
      <h2 className={s.secTitle}>🤖 {t('tab_chatbot')}</h2>
      <p className={s.secSub}>Ask anything about farming — in Hindi, Marathi, or English</p>
      <div className={s.chatContainer}>
        <div className={s.chatTopbar}>
          <div className={s.chatAvatar}>🌱</div>
          <div><div className={s.chatName}>Kisan Saathi AI</div><div className={s.chatStatus}><span className={s.onlineDot}/>Online · Powered by KVK Data</div></div>
        </div>
        <div className={s.chatMsgs}>
          {msgs.map((m,i)=>(
            <div key={i} className={`${s.msg} ${m.type==='bot'?s.msgBot:s.msgUser}`}>
              <div className={`${s.msgAv} ${m.type==='bot'?s.botAv:s.userAv}`}>{m.type==='bot'?'🌱':userName[0]||'R'}</div>
              <div>
                <div className={s.bubble}>{m.text.split('\n').map((l,j)=>l?<span key={j}>{l}<br/></span>:<br key={j}/>)}</div>
                <div className={s.msgTime}>{m.time||'9:00 AM'}</div>
              </div>
            </div>
          ))}
          <div ref={endRef}/>
        </div>
        <div className={s.prompts}>
          {Object.keys(BOT_REPLIES).map(p=><button key={p} className={s.promptChip} onClick={()=>send(p)}>{p}</button>)}
        </div>
        <div className={s.chatInputRow}>
          <input className={s.chatInput} type="text" placeholder={t('type_question')||'Type your question...'} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send(input)}/>
          <button className={s.sendBtn} onClick={()=>send(input)}>➤</button>
        </div>
      </div>
    </div>
  )
}

/* ── Dashboard ── */
export default function FarmerDashboard() {
  const { t, lang, setLang } = useLang()
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState('crops')

  const doLogout = () => { logout(); nav('/login') }
  const firstName = user?.name?.split(' ')[0] || 'Ramesh'

  const tabs = [
    { id:'crops',  icon:'🌾', key:'tab_crops' },
    { id:'community', icon:'👨‍👩‍👧', key:'tab_community' },
    { id:'mandi',  icon:'📊', key:'tab_mandi' },
    { id:'transport',icon:'🚛', key:'tab_transport' },
    { id:'chatbot',icon:'🤖', key:'tab_chatbot' },
  ]

  return (
    <div className={s.root}>
      {/* Header */}
      <header className={s.header}>
        <div className={s.headerBrand}>
          <div className={s.headerIcon}>🌱</div>
          <div>
            <div className={s.headerName}>{t('brand_name')}</div>
            <div className={s.headerSub}>किसान का साथी</div>
          </div>
        </div>
        <div className={s.headerRight}>
          {[['EN','EN'],['HI','हिं'],['MR','मर']].map(([c,l])=>(
            <button key={c} className={`${s.langBtn} ${lang===c?s.langActive:''}`} onClick={()=>setLang(c)}>{l}</button>
          ))}
          <div className={s.avatar}>👨‍🌾</div>
          <button className={s.logoutBtn} onClick={doLogout}>{t('logout')}</button>
        </div>
      </header>

      {/* Info bar */}
      <div className={s.infoBar}>
        <div className={s.infoItem}>{t('greeting')}, <strong>{firstName}</strong> 🙏</div>
        <div className={s.infoDivider}/>
        <div className={s.infoItem}>📍 <strong>Nashik, Maharashtra</strong></div>
        <div className={s.infoDivider}/>
        <div className={s.infoItem}><span className={s.seasonBadge}>{t('rabi_season')}</span></div>
        <div className={s.infoDivider}/>
        <div className={s.infoItem}>📐 <strong>3.5 acres</strong></div>
        <div className={s.weatherPill}>🌤 28°C · Low Humidity</div>
      </div>

      {/* Nav tabs */}
      <nav className={s.navTabs}>
        {tabs.map(tb=>(
          <button key={tb.id} className={`${s.tabBtn} ${tab===tb.id?s.tabActive:''}`} onClick={()=>setTab(tb.id)}>
            <span className={s.tabIcon}>{tb.icon}</span>
            <span className={s.tabLabel}>{t(tb.key)}</span>
          </button>
        ))}
      </nav>

      {/* Main */}
      <main className={s.main}>
        {tab==='crops'     && <CropsTab t={t}/>}
        {tab==='community' && <CommunityTab t={t}/>}
        {tab==='mandi'     && <MandiTab t={t}/>}
        {tab==='transport' && <TransportTab t={t}/>}
        {tab==='chatbot'   && <ChatbotTab t={t} userName={firstName}/>}
      </main>

      <footer className={s.footer}><span>Kisan Saathi</span> · {t('footer_text')} · © 2026</footer>
    </div>
  )
}
