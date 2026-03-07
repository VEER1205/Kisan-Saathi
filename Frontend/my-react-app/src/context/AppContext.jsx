import React, { createContext, useContext, useState } from 'react'

/* ─── Translation data ────────────────────────────────────── */
export const T = {
  EN: {
    brand_name:'Kisan Saathi', brand_tagline:"Your Farming Companion · किसान का साथी",
    login_tab:'🔑 Login', register_tab:'📝 Register', iam_a:'I am a —', reg_as:'Register as —',
    farmer_role:'Farmer', farmer_role_desc:'Crop tips, mandi prices & community',
    driver_role:'Driver / Transporter', driver_role_desc:'Manage transport requests & routes',
    mobile_label:'Mobile Number', password_label:'Password', forgot_pw:'Forgot password?',
    login_btn:'Login to Dashboard →', login_otp:'📲 Login with OTP', or_with:'or continue with',
    first_name:'First Name', last_name:'Last Name', district:'District', state:'State',
    vehicle_details:'🚛 Vehicle Details', vehicle_number:'Vehicle Number',
    vehicle_type:'Vehicle Type', vehicle_capacity:'Capacity (Ton)',
    terms_text:'I agree to the Terms & Conditions and Privacy Policy',
    create_account:'Create Account 🌱', otp_title:'Enter OTP',
    otp_sub:'A 6-digit code has been sent to', otp_back:'← Back',
    resend_otp:'Resend OTP', resend_in:'Resend in',
    verify_login:'✓ Verify & Login', login_success:'Login Successful!',
    account_created:'Account Created!', welcome_back:'Welcome back',
    redirecting:'Redirecting you to your dashboard…', account_ready:'Your account is ready.',
    go_dashboard:'Go to Dashboard →', farmer_account:'👨‍🌾 Farmer Account',
    driver_account:'🚛 Driver / Transporter Account',
    secure:'🔒 Secure Login', works_offline:'🌐 Works Offline', free:'🆓 Free to Use', made_india:'🇮🇳 Made for India',
    // Farmer nav
    tab_crops:'Crops', tab_community:'Community', tab_mandi:'Mandi', tab_transport:'Transport', tab_chatbot:'Chatbot',
    // Driver nav
    tab_bookings:'Bookings', tab_earnings:'Earnings', tab_routes:'Routes', tab_docs:'Documents', tab_profile:'Profile',
    logout:'↩ Logout', greeting:'Namaste', rabi_season:'Rabi 2025–26',
    footer_text:'Kisan Saathi · Built for Indian Farmers · Data: Agmarknet, IMD, KVK',
    driver_tagline:'Driver Dashboard', driver_dash_sub:'Manage your bookings, routes & documents',
    available_jobs:'🗂️ Available Jobs', my_bookings:'📦 My Bookings',
    earnings_title:'💰 Earnings', routes_title:'🗺️ Routes', docs_title:'📄 Documents', profile_title:'👤 My Profile',
    upload_license:'Driving License', upload_rc:'Vehicle RC Book', upload_insurance:'Vehicle Insurance',
    doc_verified:'✅ Verified', doc_pending:'⏳ Pending Review', doc_required:'📤 Upload Required',
    accept_btn:'Accept Job', complete_btn:'Mark Complete', call_btn:'📞 Call Farmer',
  },
  HI: {
    brand_name:'किसान साथी', brand_tagline:'आपका खेती साथी · Your Farming Companion',
    login_tab:'🔑 लॉगिन', register_tab:'📝 रजिस्टर', iam_a:'मैं हूँ —', reg_as:'रजिस्टर करें —',
    farmer_role:'किसान', farmer_role_desc:'फसल सुझाव, मंडी भाव और समुदाय',
    driver_role:'चालक / ट्रांसपोर्टर', driver_role_desc:'परिवहन अनुरोध और रूट प्रबंधित करें',
    mobile_label:'मोबाइल नंबर', password_label:'पासवर्ड', forgot_pw:'पासवर्ड भूल गए?',
    login_btn:'डैशबोर्ड में लॉगिन →', login_otp:'📲 OTP से लॉगिन', or_with:'या जारी रखें',
    first_name:'पहला नाम', last_name:'अंतिम नाम', district:'जिला', state:'राज्य',
    vehicle_details:'🚛 वाहन विवरण', vehicle_number:'वाहन नंबर', vehicle_type:'वाहन प्रकार', vehicle_capacity:'क्षमता (टन)',
    terms_text:'मैं नियम और शर्तें एवं गोपनीयता नीति से सहमत हूँ',
    create_account:'खाता बनाएं 🌱', otp_title:'OTP दर्ज करें',
    otp_sub:'6 अंकों का कोड भेजा गया है', otp_back:'← वापस',
    resend_otp:'OTP दोबारा भेजें', resend_in:'दोबारा भेजें',
    verify_login:'✓ जाँचें और लॉगिन करें', login_success:'लॉगिन सफल!',
    account_created:'खाता बनाया गया!', welcome_back:'आपका स्वागत है',
    redirecting:'आपके डैशबोर्ड पर जा रहे हैं…', account_ready:'आपका खाता तैयार है।',
    go_dashboard:'डैशबोर्ड पर जाएं →', farmer_account:'👨‍🌾 किसान खाता',
    driver_account:'🚛 चालक / ट्रांसपोर्टर खाता',
    secure:'🔒 सुरक्षित लॉगिन', works_offline:'🌐 ऑफलाइन काम करता है', free:'🆓 मुफ़्त उपयोग', made_india:'🇮🇳 भारत के लिए बना',
    tab_crops:'फसलें', tab_community:'समुदाय', tab_mandi:'मंडी', tab_transport:'परिवहन', tab_chatbot:'चैटबॉट',
    tab_bookings:'बुकिंग', tab_earnings:'कमाई', tab_routes:'रूट', tab_docs:'दस्तावेज़', tab_profile:'प्रोफ़ाइल',
    logout:'↩ लॉगआउट', greeting:'नमस्ते', rabi_season:'रबी 2025–26',
    footer_text:'किसान साथी · भारतीय किसानों के लिए · डेटा: Agmarknet, IMD, KVK',
    driver_tagline:'चालक डैशबोर्ड', driver_dash_sub:'बुकिंग, रूट और दस्तावेज़ प्रबंधित करें',
    available_jobs:'🗂️ उपलब्ध काम', my_bookings:'📦 मेरी बुकिंग',
    earnings_title:'💰 कमाई', routes_title:'🗺️ रूट', docs_title:'📄 दस्तावेज़', profile_title:'👤 मेरी प्रोफ़ाइल',
    upload_license:'ड्राइविंग लाइसेंस', upload_rc:'RC बुक', upload_insurance:'बीमा',
    doc_verified:'✅ सत्यापित', doc_pending:'⏳ समीक्षा में', doc_required:'📤 अपलोड आवश्यक',
    accept_btn:'काम स्वीकार करें', complete_btn:'पूर्ण चिह्नित करें', call_btn:'📞 किसान को कॉल करें',
  },
  MR: {
    brand_name:'किसान साथी', brand_tagline:'तुमचा शेती सोबती · Your Farming Companion',
    login_tab:'🔑 लॉगिन', register_tab:'📝 नोंदणी', iam_a:'मी आहे —', reg_as:'नोंदणी करा —',
    farmer_role:'शेतकरी', farmer_role_desc:'पीक सल्ला, मंडी भाव आणि समाज',
    driver_role:'चालक / वाहतूकदार', driver_role_desc:'वाहतूक विनंत्या आणि मार्ग व्यवस्थापित करा',
    mobile_label:'मोबाईल नंबर', password_label:'पासवर्ड', forgot_pw:'पासवर्ड विसरलात?',
    login_btn:'डॅशबोर्डमध्ये लॉगिन →', login_otp:'📲 OTP ने लॉगिन करा', or_with:'किंवा पुढे जा',
    first_name:'पहिले नाव', last_name:'आडनाव', district:'जिल्हा', state:'राज्य',
    vehicle_details:'🚛 वाहन तपशील', vehicle_number:'वाहन नंबर', vehicle_type:'वाहन प्रकार', vehicle_capacity:'क्षमता (टन)',
    terms_text:'मी अटी व शर्ती आणि गोपनीयता धोरणाशी सहमत आहे',
    create_account:'खाते तयार करा 🌱', otp_title:'OTP टाका',
    otp_sub:'6 अंकी कोड पाठवला गेला आहे', otp_back:'← मागे',
    resend_otp:'OTP पुन्हा पाठवा', resend_in:'पुन्हा पाठवा',
    verify_login:'✓ तपासा आणि लॉगिन करा', login_success:'लॉगिन यशस्वी!',
    account_created:'खाते तयार झाले!', welcome_back:'स्वागत आहे',
    redirecting:'तुमच्या डॅशबोर्डवर जात आहोत…', account_ready:'तुमचे खाते तयार आहे.',
    go_dashboard:'डॅशबोर्डवर जा →', farmer_account:'👨‍🌾 शेतकरी खाते',
    driver_account:'🚛 चालक / वाहतूकदार खाते',
    secure:'🔒 सुरक्षित लॉगिन', works_offline:'🌐 ऑफलाइन काम करते', free:'🆓 मोफत वापर', made_india:'🇮🇳 भारतासाठी बनवले',
    tab_crops:'पिके', tab_community:'समाज', tab_mandi:'मंडी', tab_transport:'वाहतूक', tab_chatbot:'चॅटबॉट',
    tab_bookings:'बुकिंग', tab_earnings:'कमाई', tab_routes:'मार्ग', tab_docs:'कागदपत्रे', tab_profile:'प्रोफाइल',
    logout:'↩ लॉगआउट', greeting:'नमस्कार', rabi_season:'रब्बी 2025–26',
    footer_text:'किसान साथी · भारतीय शेतकऱ्यांसाठी · डेटा: Agmarknet, IMD, KVK',
    driver_tagline:'चालक डॅशबोर्ड', driver_dash_sub:'बुकिंग, मार्ग आणि कागदपत्रे व्यवस्थापित करा',
    available_jobs:'🗂️ उपलब्ध काम', my_bookings:'📦 माझ्या बुकिंग',
    earnings_title:'💰 कमाई', routes_title:'🗺️ मार्ग', docs_title:'📄 कागदपत्रे', profile_title:'👤 माझे प्रोफाइल',
    upload_license:'परवाना', upload_rc:'RC पुस्तक', upload_insurance:'विमा',
    doc_verified:'✅ सत्यापित', doc_pending:'⏳ पुनरावलोकन प्रतीक्षेत', doc_required:'📤 अपलोड आवश्यक',
    accept_btn:'काम स्वीकारा', complete_btn:'पूर्ण म्हणून चिन्हांकित करा', call_btn:'📞 शेतकऱ्याला कॉल करा',
  },
}

/* ─── Language Context ──────────────────────────────────────── */
const LangCtx = createContext(null)
export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('ks_lang') || 'EN')
  const setLang = (l) => { setLangState(l); localStorage.setItem('ks_lang', l) }
  const t = (k) => T[lang]?.[k] ?? T.EN?.[k] ?? k
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
}
export const useLang = () => useContext(LangCtx)

/* ─── Auth Context ──────────────────────────────────────────── */
const AuthCtx = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const name = localStorage.getItem('ks_name')
    const role = localStorage.getItem('ks_role')
    return name && role
      ? { name, role, vehicle: localStorage.getItem('ks_vehicle'), vehType: localStorage.getItem('ks_veh_type') }
      : null
  })
  const login = (u) => {
    localStorage.setItem('ks_name', u.name)
    localStorage.setItem('ks_role', u.role)
    if (u.vehicle) localStorage.setItem('ks_vehicle', u.vehicle)
    if (u.vehType) localStorage.setItem('ks_veh_type', u.vehType)
    setUser(u)
  }
  const logout = () => {
    ['ks_name','ks_role','ks_vehicle','ks_veh_type'].forEach(k => localStorage.removeItem(k))
    setUser(null)
  }
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}
export const useAuth = () => useContext(AuthCtx)
