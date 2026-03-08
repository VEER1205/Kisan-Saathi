import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, useAuth } from '../context/AppContext'
import { apiLogin, apiRegister } from '../api/auth'
import s from './LoginPage.module.css'

/* ── Helpers ── */
function pwScore(v) {
  let n = 0
  if (v.length >= 6) n++; if (v.length >= 10) n++
  if (/[A-Z]/.test(v)) n++; if (/\d/.test(v)) n++; if (/[^A-Za-z0-9]/.test(v)) n++
  return {
    n, color: ['', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60'][n] || '',
    label: v.length ? ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][n] : ''
  }
}

/* ── OTP Input ── */
function OtpInputs({ onDone }) {
  const [d, setD] = useState(['', '', '', '', '', ''])
  const refs = useRef([])
  const change = (i, v) => {
    if (!/^\d?$/.test(v)) return
    const n = [...d]; n[i] = v; setD(n)
    if (v && i < 5) refs.current[i + 1]?.focus()
    if (n.every(x => x) && v) onDone(n.join(''))
  }
  return (
    <div className={s.otpRow}>
      {d.map((x, i) => (
        <input key={i} ref={el => refs.current[i] = el} className={s.otpBox}
          type="text" inputMode="numeric" maxLength={1} value={x}
          onChange={e => change(i, e.target.value)}
          onKeyDown={e => e.key === 'Backspace' && !x && i > 0 && refs.current[i - 1]?.focus()} />
      ))}
    </div>
  )
}

/* ── Resend Timer ── */
function ResendTimer({ t }) {
  const [sec, setSec] = useState(30); const [done, setDone] = useState(false)
  useEffect(() => {
    if (done) return
    const id = setInterval(() => setSec(s => { if (s <= 1) { clearInterval(id); setDone(true); return 0 } return s - 1 }), 1000)
    return () => clearInterval(id)
  }, [done])
  return done
    ? <button className={s.resendBtn} onClick={() => { setSec(30); setDone(false) }}>{t('resend_otp')}</button>
    : <span className={s.resendTimer}>{t('resend_in')} {sec}s</span>
}

/* ── Desktop Hero ── */
function Hero({ t }) {
  return (
    <div className={s.hero}>
      <div className={s.heroTop}>
        <div className={s.heroIcon}>🌱</div>
        <div><div className={s.heroBrand}>{t('brand_name')}</div><div className={s.heroTag}>{t('brand_tagline')}</div></div>
      </div>
      <div className={s.heroDivider} />
      <p className={s.heroEyebrow}>India's Farmer Platform</p>
      <h2 className={s.heroTitle}>Connect. Grow.<br />Prosper Together.</h2>
      <p className={s.heroSub}>A single platform for farmers and transporters — crop advisory, live mandi prices, and transport booking for rural India.</p>
      {[['🌾', 'Crop Advisory', 'Pest alerts, fertilizer schedules in your language.'],
      ['📊', 'Live Mandi Prices', 'Real-time rates from Agmarknet APMCs.'],
      ['🚛', 'Transport Booking', 'Find verified transporters, split costs.']].map(([ic, ti, de]) => (
        <div key={ti} className={s.heroFeat}>
          <div className={s.heroFeatIcon}>{ic}</div>
          <div><div className={s.heroFeatTitle}>{ti}</div><div className={s.heroFeatDesc}>{de}</div></div>
        </div>
      ))}
    </div>
  )
}

/* ── Main ── */
export default function LoginPage() {
  const { t, lang, setLang } = useLang()
  const { login } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState('login')
  const [role, setRole] = useState('farmer')
  const [otp, setOtp] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  // login fields
  const [lEmail, setLEmail] = useState('')
  const [lPhone, setLPhone] = useState('')
  const [lPw, setLPw] = useState('')
  const [showLPw, setShowLPw] = useState(false)

  // register fields
  const [rFirst, setRFirst] = useState(''); const [rLast, setRLast] = useState('')
  const [rEmail, setREmail] = useState(''); const [rPhone, setRPhone] = useState('')
  const [rDist, setRDist] = useState(''); const [rState, setRState] = useState('')
  const [rPw, setRPw] = useState(''); const [showRPw, setShowRPw] = useState(false)
  const [vNum, setVNum] = useState(''); const [vType, setVType] = useState(''); const [vCap, setVCap] = useState('')
  const [terms, setTerms] = useState(false)

  const pw = tab === 'login' ? lPw : rPw
  const str = pwScore(pw)

  // Registered user name for success screen
  const [loggedInUser, setLoggedInUser] = useState(null)

  const doLogin = async () => {
    setErr('')
    if (!lEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lEmail)) { setErr('Please enter a valid email address.'); return }
    if (!lPw) { setErr('Please enter your password.'); return }
    setLoading(true)
    try {
      const data = await apiLogin(lEmail, lPw)
      const u = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
        token: data.access_token,
      }
      login(u)
      setLoggedInUser(u)
      setSuccess(true)
    } catch (e) {
      setErr(e.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const doReg = async () => {
    setErr('')
    if (!rFirst || !rLast) { setErr('Please enter your full name.'); return }
    if (!rEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rEmail)) { setErr('Please enter a valid email address.'); return }
    if (!rPhone || rPhone.length < 10) { setErr('Please enter a valid 10-digit mobile number.'); return }
    if (rPw.length < 6) { setErr('Password must be at least 6 characters.'); return }
    if (!terms) { setErr('Please accept the Terms & Conditions.'); return }
    setLoading(true)
    try {
      const payload = {
        name: `${rFirst} ${rLast}`,
        email: rEmail,
        phone: `+91${rPhone}`,
        password: rPw,
        role,
        vehicle_info: role === 'driver' ? `${vType} | ${vNum} | ${vCap}T` : null,
      }
      await apiRegister(payload)
      // Auto-login after register
      const data = await apiLogin(rEmail, rPw)
      const u = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
        vehicle: vNum || undefined,
        vehType: vType || undefined,
        token: data.access_token,
      }
      login(u)
      setLoggedInUser(u)
      setSuccess(true)
    } catch (e) {
      const detail = e.response?.data?.detail
      setErr(typeof detail === 'string' ? detail : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const activeUser = loggedInUser || {}
  const activeRole = activeUser.role || role
  const activeName = activeUser.name?.split(' ')[0] || (tab === 'register' ? rFirst : 'User')

  if (success) return (
    <div className={s.root}>
      <div className={s.card} style={{ maxWidth: 420, margin: 'auto' }}>
        <div className={s.successWrap}>
          <span className={s.successIcon}>{activeRole === 'driver' ? '🚛' : '👨‍🌾'}</span>
          <h2 className={s.successTitle}>{tab === 'login' ? t('login_success') : t('account_created')}</h2>
          <p className={s.successSub}>{t('welcome_back')}, {activeName}! {t('redirecting')}</p>
          <div className={s.rolePill}>{activeRole === 'driver' ? t('driver_account') : t('farmer_account')}</div>
          <button className={s.btnPrimary} onClick={() => nav(activeRole === 'driver' ? '/driver' : '/farmer')}>{t('go_dashboard')}</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={s.root}>
      <div className={s.bgBlob1} /><div className={s.bgBlob2} />
      <div className={s.desktopBg} />
      <Hero t={t} />

      <div className={s.formSide}>
        {/* Mobile brand */}
        <div className={s.mobileBrand}>
          <div className={s.brandLogo}>🌱</div>
          <div className={s.brandName}>{t('brand_name')}</div>
          <div className={s.brandTag}>{t('brand_tagline')}</div>
        </div>
        {/* Lang pills */}
        <div className={s.langRow}>
          {[['EN', 'EN'], ['HI', 'हिं'], ['MR', 'मर']].map(([c, l]) => (
            <button key={c} className={`${s.langPill} ${lang === c ? s.langActive : ''}`} onClick={() => setLang(c)}>{l}</button>
          ))}
        </div>

        <div className={s.card}>
          {/* Tabs */}
          <div className={s.tabs}>
            {['login', 'register'].map(tb => (
              <button key={tb} className={`${s.tabBtn} ${tab === tb ? s.tabActive : ''}`}
                onClick={() => { setTab(tb); setErr(''); setOtp(false) }}>
                {t(tb === 'login' ? 'login_tab' : 'register_tab')}
              </button>
            ))}
          </div>

          <div className={s.body}>
            {otp ? (
              /* ── OTP Flow ── */
              <div>
                <button className={s.backBtn} onClick={() => setOtp(false)}>{t('otp_back')}</button>
                <h3 className={s.otpTitle}>{t('otp_title')}</h3>
                <p className={s.otpSub}>{t('otp_sub')}<br /><strong>+91 {lPhone || 'XXXXXXXXXX'}</strong></p>
                <OtpInputs onDone={() => { }} />
                <div className={s.resendWrap}><ResendTimer t={t} /></div>
                <button className={s.btnPrimary} style={{ marginTop: 20 }} onClick={() => { }}>{t('verify_login')}</button>
              </div>
            ) : (
              <>
                {/* Role cards */}
                <p className={s.roleLabel}>{t(tab === 'login' ? 'iam_a' : 'reg_as')}</p>
                <div className={s.roleGrid}>
                  {[['farmer', '👨‍🌾', 'farmer_role', 'farmer_role_desc'], ['driver', '🚛', 'driver_role', 'driver_role_desc']].map(([rk, ic, nt, nd]) => (
                    <div key={rk} className={`${s.roleCard} ${role === rk ? s.roleActive : ''}`} onClick={() => setRole(rk)}>
                      {role === rk && <span className={s.roleCheck}>✓</span>}
                      <span className={s.roleIcon}>{ic}</span>
                      <div className={s.roleTitle}>{t(nt)}</div>
                      <div className={s.roleDesc}>{t(nd)}</div>
                    </div>
                  ))}
                </div>

                {err && <div className={s.errBox}>⚠️ {err}</div>}

                {tab === 'login' ? (
                  /* ── Login form ── */
                  <>
                    <label className={s.label}>📧 Email Address</label>
                    <input className={s.input} type="email" inputMode="email"
                      placeholder="you@example.com" value={lEmail} onChange={e => setLEmail(e.target.value)} />
                    <label className={s.label}>📱 {t('mobile_label')} <span style={{ fontSize: '.75rem', opacity: .6 }}>(optional)</span></label>
                    <div className={s.phoneRow}>
                      <input className={`${s.input} ${s.code}`} value="+91" readOnly />
                      <input className={s.input} type="tel" inputMode="numeric" maxLength={10}
                        placeholder="10-digit number" value={lPhone} onChange={e => setLPhone(e.target.value.replace(/\D/, ''))} />
                    </div>
                    <label className={s.label}>🔒 {t('password_label')}</label>
                    <div className={s.pwWrap}>
                      <input className={s.input} type={showLPw ? 'text' : 'password'} placeholder="Enter your password"
                        value={lPw} onChange={e => setLPw(e.target.value)} />
                      <button className={s.eye} type="button" onClick={() => setShowLPw(p => !p)}>{showLPw ? '🙈' : '👁️'}</button>
                    </div>
                    <div className={s.forgotRow}>
                      <button className={s.forgotBtn}>{t('forgot_pw')}</button>
                    </div>
                    <button className={s.btnPrimary} onClick={doLogin} disabled={loading}>
                      {loading ? <span className={s.spinner} /> : t('login_btn')}
                    </button>
                  </>
                ) : (
                  /* ── Register form ── */
                  <>
                    <div className={s.row2}>
                      <div><label className={s.label}>👤 {t('first_name')}</label><input className={s.input} type="text" placeholder="Ramesh" value={rFirst} onChange={e => setRFirst(e.target.value)} /></div>
                      <div><label className={s.label}>👤 {t('last_name')}</label><input className={s.input} type="text" placeholder="Patil" value={rLast} onChange={e => setRLast(e.target.value)} /></div>
                    </div>
                    <label className={s.label}>📧 Email Address</label>
                    <input className={s.input} type="email" inputMode="email"
                      placeholder="you@example.com" value={rEmail} onChange={e => setREmail(e.target.value)} />
                    <label className={s.label}>📱 {t('mobile_label')}</label>
                    <div className={s.phoneRow}>
                      <input className={`${s.input} ${s.code}`} value="+91" readOnly />
                      <input className={s.input} type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit number" value={rPhone} onChange={e => setRPhone(e.target.value.replace(/\D/, ''))} />
                    </div>
                    <div className={s.row2}>
                      <div><label className={s.label}>📍 {t('district')}</label><input className={s.input} type="text" placeholder="e.g. Nashik" value={rDist} onChange={e => setRDist(e.target.value)} /></div>
                      <div><label className={s.label}>🗺️ {t('state')}</label><input className={s.input} type="text" placeholder="Maharashtra" value={rState} onChange={e => setRState(e.target.value)} /></div>
                    </div>
                    {role === 'driver' && (
                      <div className={s.vehBox}>
                        <p className={s.vehLabel}>{t('vehicle_details')}</p>
                        <label className={s.label}>{t('vehicle_number')}</label>
                        <input className={s.input} type="text" placeholder="MH 15 AB 1234" style={{ textTransform: 'uppercase' }} value={vNum} onChange={e => setVNum(e.target.value)} />
                        <div className={s.row2} style={{ marginTop: 10 }}>
                          <div>
                            <label className={s.label}>{t('vehicle_type')}</label>
                            <select className={s.input} value={vType} onChange={e => setVType(e.target.value)}>
                              <option value="">Select</option>
                              <option>Mini Truck (1–3 Ton)</option>
                              <option>Medium Truck (3–7 Ton)</option>
                              <option>Large Truck (7–15 Ton)</option>
                              <option>Tractor-Trolley</option>
                            </select>
                          </div>
                          <div>
                            <label className={s.label}>{t('vehicle_capacity')}</label>
                            <input className={s.input} type="number" placeholder="e.g. 5" value={vCap} onChange={e => setVCap(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}
                    <label className={s.label}>🔒 {t('password_label')}</label>
                    <div className={s.pwWrap}>
                      <input className={s.input} type={showRPw ? 'text' : 'password'} placeholder="Create a strong password" value={rPw} onChange={e => setRPw(e.target.value)} />
                      <button className={s.eye} type="button" onClick={() => setShowRPw(p => !p)}>{showRPw ? '🙈' : '👁️'}</button>
                    </div>
                    <div className={s.strBar}><div className={s.strFill} style={{ width: rPw.length ? `${str.n / 5 * 100}%` : '0%', background: str.color }} /></div>
                    <div className={s.strLabel} style={{ color: str.color }}>{str.label}</div>
                    <label className={s.checkRow}><input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} /><span>{t('terms_text')}</span></label>
                    <button className={s.btnPrimary} onClick={doReg} disabled={loading}>
                      {loading ? <span className={s.spinner} /> : t('create_account')}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className={s.chips}>
          {['secure', 'works_offline', 'free', 'made_india'].map(k => <div key={k} className={s.chip}>{t(k)}</div>)}
        </div>
        <div className={s.foot}><span>Kisan Saathi</span> · Data: Agmarknet, IMD, KVK · © 2026</div>
      </div>
    </div>
  )
}
