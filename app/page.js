"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Head from "next/head"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { content } from "./lib/i18n"

export default function Home() {
  const [lang, setLang] = useState("en")
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", message: "" })
  const [formState, setFormState] = useState("idle")
  const router = useRouter()
  const supabase = createClient()
  const t = content[lang]

  // SEO Schema Data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "JJ Studio Lagree",
    "description": "Premium Lagree fitness studio in Querétaro. Transform your body and mind with our high-intensity, low-impact classes. Trust the Process.",
    "image": "https://jjstudio.mx/logo.png",
    "url": "https://jjstudio.mx",
    "telephone": "+5213318373447",
    "email": "administracion@jjstudio.mx",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Xentric Lomas Norte, El Campanario, Lcl 211",
      "addressLocality": "Querétaro",
      "addressRegion": "Querétaro",
      "postalCode": "76000",
      "addressCountry": "MX"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "20.5888",
      "longitude": "-100.3898"
    },
    "priceRange": "$$$",
    "sameAs": [
      "https://www.instagram.com/jj_lagree_experience"
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "06:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday"],
        "opens": "07:00",
        "closes": "18:00"
      }
    ]
  }

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        setUser(data?.user || null)
      } catch (err) {
        console.error('Auth error:', err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkUser()
  }, [supabase])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toggleLang = () => setLang(l => l === "en" ? "es" : "en")

  // NAVIGATION HANDLERS
  const handleHomeClick = (e) => {
    e?.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMenuOpen(false)
  }

  const handleScheduleClick = (e) => {
    e?.preventDefault()
    setMenuOpen(false)
    if (user) {
      router.push('/dashboard/client#book-class', { scroll: false })
      setTimeout(() => {
        const el = document.getElementById('book-class')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else {
      router.push('/login')
    }
  }

  const handlePackageClick = (e) => {
    e?.preventDefault()
    setMenuOpen(false)
    if (user) {
      router.push('/dashboard/client#packages', { scroll: false })
      setTimeout(() => {
        const el = document.getElementById('packages')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else {
      router.push('/login')
    }
  }

  const handleBeveragesClick = (e) => {
    e?.preventDefault()
    setMenuOpen(false)
    const el = document.getElementById('beverages')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAboutClick = (e) => {
    e?.preventDefault()
    setMenuOpen(false)
    const el = document.getElementById('about')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleContactClick = (e) => {
    e?.preventDefault()
    setMenuOpen(false)
    const el = document.getElementById('contact')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleProfileClick = () => {
    if (user) {
      router.push('/dashboard/client')
    } else {
      router.push('/login')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
    setUser(null)
    router.push('/')
  }

  return (
    <>
      <Head>
        {/* PRIMARY SEO */}
        <title>JJ Studio Lagree Querétaro | Premium Fitness Classes | Trust the Process</title>
        <meta name="description" content="Transform your body and mind at JJ Studio - premium Lagree fitness studio in Querétaro. High-intensity, low-impact classes for women and men 25-45. Located in Xentric Lomas, Campanario Norte. Book your first class today." />
        <meta name="keywords" content="Lagree Querétaro, fitness studio Querétaro, Lagree classes, core strengthening, pilates Querétaro, luxury fitness, Campanario Norte, women fitness, premium fitness studio" />
        
        {/* OG TAGS */}
        <meta property="og:title" content="JJ Studio Lagree Querétaro | Premium Fitness Classes" />
        <meta property="og:description" content="Transform with JJ Studio. Premium Lagree fitness classes in Querétaro. Trust the Process." />
        <meta property="og:image" content="https://jjstudio.mx/og-image.jpg" />
        <meta property="og:url" content="https://jjstudio.mx" />
        <meta property="og:type" content="website" />
        
        {/* TWITTER TAGS */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JJ Studio Lagree Querétaro | Premium Fitness" />
        <meta name="twitter:description" content="High-intensity Lagree classes in Querétaro. Trust the Process. Book now." />
        <meta name="twitter:image" content="https://jjstudio.mx/og-image.jpg" />
        
        {/* LOCAL SEO - QUERÉTARO */}
        <meta name="geo.position" content="20.5888;-100.3898" />
        <meta name="ICBM" content="20.5888, -100.3898" />
        <meta name="geo.region" content="MX-QRO" />
        <meta name="geo.placename" content="Querétaro" />
        
        {/* GENERAL */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="language" content="English, Spanish" />
        <meta name="author" content="JJ Studio" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="theme-color" content="#1A1A1A" />
        <link rel="canonical" href="https://jjstudio.mx" />
        
        {/* STRUCTURED DATA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>

      <main className="text-gray-900 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#1A1A1A" }}>

        {/* ── NAVBAR ── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-gray-900/95 shadow-lg" : "bg-gray-900/90"}`} role="navigation" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* LOGO */}
              <span className="text-xl font-black tracking-widest uppercase cursor-default select-none text-white">
                JJ<span className="text-amber-600">Studio</span>
              </span>

              <div className="h-6 w-px bg-amber-600/40 hidden sm:block" />

              {/* INSTAGRAM */}
              <a
                href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-amber-600/20 transition text-gray-400 hover:text-amber-500"
                title="Follow JJ Studio on Instagram"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
              </a>

              {/* WHATSAPP */}
              <a
                href="https://wa.me/5213318373447?text=Hola%20JJ%20Studio"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-amber-600/20 transition text-gray-400 hover:text-green-500"
                title="Contact JJ Studio on WhatsApp"
                aria-label="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {[
                { label: t.nav.home, handler: handleHomeClick },
                { label: t.nav.schedule, handler: handleScheduleClick },
                { label: t.nav.packages, handler: handlePackageClick },
                { label: t.nav.beverages, handler: handleBeveragesClick },
                { label: t.nav.about, handler: handleAboutClick },
                { label: t.nav.contact, handler: handleContactClick },
              ].map(({ label, handler }) => (
                <button
                  key={label}
                  onClick={handler}
                  className="text-xs font-medium tracking-widest uppercase text-gray-300 hover:text-amber-500 transition-colors relative group"
                >
                  {label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-amber-600 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </div>

            {/* Language + Auth */}
            <div className="hidden lg:flex items-center gap-5">
              <button onClick={toggleLang} className="flex items-center gap-2 cursor-pointer select-none">
                <span className={`text-xs font-bold tracking-widest transition-colors ${lang === "es" ? "text-white" : "text-gray-400"}`}>ES</span>
                <div className={`relative w-12 h-6 rounded-full border transition-all duration-300 ${lang === "en" ? "bg-gray-700 border-gray-600" : "bg-amber-600/40 border-amber-600"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-amber-600 transition-all duration-300 ${lang === "en" ? "left-1" : "left-6"}`} />
                </div>
                <span className={`text-xs font-bold tracking-widest transition-colors ${lang === "en" ? "text-white" : "text-gray-400"}`}>EN</span>
              </button>

              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleProfileClick}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-lg transition-all duration-200"
                      >
                        PROFILE
                      </button>
                      <button
                        onClick={handleLogout}
                        className="text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-amber-500 transition-colors"
                      >
                        LOGOUT
                      </button>
                    </div>
                  ) : (
                    <>
                      <a href="/login" className="text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-amber-500 transition-colors">
                        LOGIN
                      </a>
                      <a href="/signup" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-lg transition-all">
                        {t.nav.register}
                      </a>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Hamburger */}
            <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
              <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`w-4 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2 w-6" : ""}`} />
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden bg-gray-900 border-t border-amber-600/20 overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-screen py-6" : "max-h-0"}`}>
            <div className="flex flex-col px-6 gap-5">
              <button onClick={(e) => { handleHomeClick(e); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-gray-300 hover:text-amber-500">
                {t.nav.home}
              </button>
              <button onClick={(e) => { handleScheduleClick(e); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-gray-300 hover:text-amber-500">
                {t.nav.schedule}
              </button>
              <button onClick={(e) => { handlePackageClick(e); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-gray-300 hover:text-amber-500">
                {t.nav.packages}
              </button>
              <button onClick={(e) => { handleBeveragesClick(e); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-gray-300 hover:text-amber-500">
                {t.nav.beverages}
              </button>
              <button onClick={(e) => { handleAboutClick(e); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-gray-300 hover:text-amber-500">
                {t.nav.about}
              </button>
              <button onClick={(e) => { handleContactClick(e); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-gray-300 hover:text-amber-500">
                {t.nav.contact}
              </button>
              
              <div className="border-t border-amber-600/20 pt-5">
                <button onClick={toggleLang} className="flex items-center gap-2 self-start mb-4">
                  <span className={`text-xs font-bold tracking-widest ${lang === "es" ? "text-white" : "text-gray-400"}`}>ES</span>
                  <div className={`relative w-12 h-6 rounded-full border transition-all duration-300 ${lang === "en" ? "bg-gray-700 border-gray-600" : "bg-amber-600/40 border-amber-600"}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-amber-600 transition-all duration-300 ${lang === "en" ? "left-1" : "left-6"}`} />
                  </div>
                  <span className={`text-xs font-bold tracking-widest ${lang === "en" ? "text-white" : "text-gray-400"}`}>EN</span>
                </button>

                {!isLoading && (
                  <>
                    {user ? (
                      <>
                        <button onClick={() => { handleProfileClick(); setMenuOpen(false) }} className="w-full bg-amber-600 text-white text-xs font-bold tracking-widest uppercase px-5 py-3 rounded-lg mb-2">
                          PROFILE
                        </button>
                        <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="w-full text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-amber-500 py-2">
                          LOGOUT
                        </button>
                      </>
                    ) : (
                      <>
                        <a href="/login" className="block bg-gray-800 border border-gray-700 text-white text-xs font-bold tracking-widest uppercase px-5 py-3 text-center rounded-lg mb-2">
                          LOGIN
                        </a>
                        <a href="/signup" className="block bg-amber-600 text-white text-xs font-bold tracking-widest uppercase px-5 py-3 text-center rounded-lg">
                          {t.nav.register}
                        </a>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* ── HERO SECTION ── */}
        <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20" id="home" style={{ background: "linear-gradient(135deg, #1A1A1A 0%, #2D2A2A 40%, #1A1A1A 100%)" }}>
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(212,175,106,0.15) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold tracking-[0.3em] mb-6 uppercase text-amber-500">Premium Fitness Studio in Querétaro</p>
              
              <h1 className="font-black uppercase leading-tight mb-8" style={{ fontSize: "clamp(3rem,9vw,7rem)", letterSpacing: "-0.02em", color: "#FFFFFF" }}>
                <span className="text-amber-600">Trust the</span><br />
                <span className="text-gray-300">Process</span><br />
                <span className="text-amber-600">Transform</span>
              </h1>

              <p className="text-lg font-light max-w-2xl mb-12 leading-relaxed text-gray-300">High-intensity, low-impact Lagree classes designed for serious results. Build strength, improve posture, and develop stability from your core.</p>

              <div className="flex flex-wrap gap-4">
                <a href="/signup" className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl">
                  Start Free Trial
                </a>
                <button onClick={handleAboutClick} className="border-2 border-amber-600 text-amber-600 text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-lg hover:bg-amber-600 hover:text-white transition-all">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs tracking-widest uppercase text-gray-500">Scroll to explore</span>
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
              <path d="M8 0v20M1 13l7 7 7-7" stroke="rgba(212,175,106,0.6)" strokeWidth="1.5" />
            </svg>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="py-6 overflow-hidden border-y border-amber-600/30" style={{ background: "linear-gradient(90deg, #2D2A2A 0%, #1A1A1A 50%, #2D2A2A 100%)" }}>
          <div className="flex whitespace-nowrap" style={{ animation: "marquee 25s linear infinite" }}>
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex items-center gap-0 shrink-0">
                <span className="flex items-center">
                  <span className="text-xs font-bold tracking-[0.3em] uppercase mx-12 text-gray-300">Trust the Process</span>
                  <span className="text-xs text-amber-600 mx-2">✦</span>
                  <span className="text-xs font-bold tracking-[0.3em] uppercase mx-12 text-gray-300">High-Intensity Training</span>
                  <span className="text-xs text-amber-600 mx-2">✦</span>
                  <span className="text-xs font-bold tracking-[0.3em] uppercase mx-12 text-gray-300">Low-Impact Results</span>
                  <span className="text-xs text-amber-600 mx-2">✦</span>
                  <span className="text-xs font-bold tracking-[0.3em] uppercase mx-12 text-gray-300">Premium Experience</span>
                  <span className="text-xs text-amber-600 mx-2">✦</span>
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ── CLASSES SECTION ── */}
        <section className="py-24 bg-gray-900" id="schedule">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
              <div>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-amber-500 mb-6 rounded-full" />
                <h2 className="font-black uppercase leading-tight text-4xl lg:text-6xl text-white" style={{ letterSpacing: "-0.02em" }}>
                  Our Classes<br /><span className="text-amber-600">Transform Your Body</span>
                </h2>
              </div>
              <button onClick={handleScheduleClick} className="border-2 border-amber-600 text-amber-600 text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-lg hover:bg-amber-600 hover:text-white transition-all">
                Book a Class
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.classes.items.map((cls, i) => (
                <div key={i} className="bg-gray-800 p-8 rounded-xl group hover:shadow-xl hover:shadow-amber-600/20 hover:-translate-y-2 transition-all duration-300 border border-gray-700 hover:border-amber-600/50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-black text-amber-600">{cls.num}</span>
                    {cls.badge && <span className="text-xs tracking-widest uppercase px-3 py-1 border border-amber-600/50 text-amber-500 rounded-lg">{cls.badge}</span>}
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-wide mb-3 text-white">{cls.name}</h3>
                  <p className="text-sm leading-relaxed mb-6 text-gray-400">{cls.desc}</p>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                    <span>{cls.duration}</span><span>•</span><span>{cls.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PACKAGES SECTION ── */}
        <section className="py-24 bg-gray-950" id="packages">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-amber-500 mx-auto mb-6 rounded-full" />
              <h2 className="font-black uppercase leading-tight text-4xl lg:text-6xl text-white" style={{ letterSpacing: "-0.02em" }}>
                Membership <span className="text-amber-600">Plans</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-sm text-gray-400">Choose the perfect plan for your fitness journey. All memberships include unlimited class access and beverage options.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.packages.plans.map((plan, i) => (
                <div key={i} className={`p-8 rounded-xl flex flex-col transition-all duration-300 relative border-2 ${plan.popular ? "border-amber-600 bg-amber-600/5 hover:shadow-lg hover:shadow-amber-600/30" : "border-gray-700 bg-gray-800 hover:border-amber-600/50"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs px-4 py-1 tracking-widest uppercase rounded-lg">
                      Most Popular
                    </div>
                  )}
                  <p className={`text-xs tracking-widest uppercase mb-4 font-semibold ${plan.popular ? "text-amber-500" : "text-gray-500"}`}>{plan.label}</p>
                  <div className="font-black leading-none mb-2 text-white" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>{plan.price}</div>
                  <p className="text-xs mb-6 text-gray-400">{plan.sub}</p>
                  <div className="w-8 h-1 bg-amber-600 rounded-full mb-6" />
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="text-sm flex items-center gap-3 text-gray-300"><span className="text-amber-500 text-lg">✓</span>{plan.classes}</li>
                    <li className="text-sm flex items-center gap-3 text-gray-300"><span className="text-amber-500 text-lg">✓</span>All class types</li>
                    <li className="text-sm flex items-center gap-3 text-gray-300"><span className="text-amber-500 text-lg">✓</span>{plan.expire}</li>
                    <li className={`text-sm flex items-center gap-3 ${plan.beverage ? "text-gray-300" : "text-gray-600"}`}>
                      <span className={plan.beverage ? "text-amber-500 text-lg" : "text-gray-600"}>{plan.beverage ? "✓" : "–"}</span>
                      {plan.beverage ? t.packages.bev : t.packages.noBev}
                    </li>
                  </ul>
                  <button onClick={handlePackageClick} className={`text-center text-xs font-bold tracking-widest uppercase px-4 py-3 rounded-lg transition-all ${plan.popular ? "bg-amber-600 hover:bg-amber-700 text-white" : "border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"}`}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BEVERAGES ── */}
        <section className="py-24 bg-gray-900" id="beverages">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-amber-500 mb-6 rounded-full" />
                <h2 className="font-black uppercase leading-tight text-4xl lg:text-6xl mb-8 text-white" style={{ letterSpacing: "-0.02em" }}>
                  Premium <span className="text-amber-600">Beverages</span>
                </h2>
                <p className="text-base leading-relaxed mb-4 text-gray-300">Fuel your recovery and wellness with our carefully curated beverage selection. Perfect for before, during, and after your workout.</p>
                <p className="text-sm leading-relaxed mb-8 text-gray-400">Included with premium memberships. Enhance your JJ Studio experience with nutritional support that complements your fitness journey.</p>
                <button onClick={handleBeveragesClick} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-lg inline-block transition-all">
                  View All Options
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {t.beverages.items.map((item, i) => (
                  <div key={i} className="p-6 border border-amber-600/30 bg-gray-800 rounded-xl hover:border-amber-600/60 hover:bg-gray-750 transition-all duration-300">
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h4 className="font-bold uppercase text-sm tracking-wide mb-2 text-white">{item.name}</h4>
                    <p className="text-xs leading-relaxed text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section className="py-24 bg-gray-950" id="about">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-amber-500 mx-auto mb-6 rounded-full" />
              <h2 className="font-black uppercase leading-tight text-4xl lg:text-6xl text-white" style={{ letterSpacing: "-0.02em" }}>
                Meet Your <span className="text-amber-600">Coach</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-sm text-gray-400">Dedicated to your success and transformation. Our coaches are certified and passionate about helping you achieve your fitness goals.</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="border-2 border-amber-600/30 p-10 rounded-xl bg-gray-800 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start gap-8">
                  <div className="w-40 h-40 flex-shrink-0 relative overflow-hidden rounded-lg border-2 border-amber-600">
                    <Image src="/images/coach-javi.jpeg" alt="Coach Javi - JJ Studio Querétaro" fill className="object-cover object-top" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-2xl font-black uppercase tracking-wide text-white">{t.about.coachName}</h3>
                      <span className="text-xs tracking-widest uppercase px-3 py-1 border border-amber-600/50 text-amber-500 rounded-lg">
                        {t.about.available}
                      </span>
                    </div>
                    <p className="text-xs tracking-widest uppercase mb-4 text-amber-500">{t.about.coachRole}</p>
                    <p className="text-sm leading-relaxed text-gray-300 mb-6">{t.about.coachBio}</p>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="font-black text-xl text-amber-600">{t.about.allTypes}</div>
                        <div className="text-xs uppercase tracking-widest mt-1 text-gray-500">{t.about.allTypesSub}</div>
                      </div>
                      <div className="w-px bg-gray-700" />
                      <div className="text-center">
                        <div className="font-black text-xl text-amber-600">{t.about.commit}</div>
                        <div className="text-xs uppercase tracking-widest mt-1 text-gray-500">{t.about.commitSub}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative py-32 overflow-hidden" id="register" style={{ background: "linear-gradient(135deg, #2D2A2A 0%, #1A1A1A 50%, #2D2A2A 100%)" }}>
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(212,175,106,0.2), transparent)" }} />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs tracking-[0.3em] uppercase mb-4 font-semibold text-amber-500">Begin Your Transformation</p>
            <h2 className="font-black uppercase leading-tight mb-8 text-white" style={{ fontSize: "clamp(2.5rem,8vw,7rem)", letterSpacing: "-0.02em" }}>
              Trust the <span className="text-amber-600">Process</span>
            </h2>
            <p className="text-lg mb-4 max-w-2xl mx-auto text-gray-300">Join JJ Studio today and start your journey to strength, stability, and transformation. Your first class is free.</p>
            <p className="text-xs uppercase tracking-widest mb-10 text-gray-500">Xentric Lomas, Campanario Norte, Querétaro</p>
            <a href="/signup" className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold tracking-widest uppercase px-12 py-5 rounded-lg inline-block transition-all shadow-lg hover:shadow-xl">
              Start Your Free Trial
            </a>
          </div>
        </section>

{/* ── NESSTY BOOKING ── */}
<section className="py-24 bg-gray-900" id="nessty">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-amber-500 mb-6 rounded-full" />
        <h2 className="font-black uppercase leading-tight text-4xl lg:text-6xl mb-8 text-white" style={{ letterSpacing: "-0.02em" }}>
          Book on <span className="text-amber-600">Nessty</span>
        </h2>
        <p className="text-base leading-relaxed mb-4 text-gray-300">
          Nessty is the most popular fitness booking app in Mexico. Schedule classes, manage your membership, and stay connected with the JJ Studio community.
        </p>
        <p className="text-sm leading-relaxed mb-8 text-gray-400">
          Available on iOS and Android. Download now and book your first Lagree class at JJ Studio.
        </p>
        <div className="flex flex-wrap gap-4">
          <a 
            href="https://nessty.mx/@jjstudio" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-lg inline-flex items-center gap-2 transition-all"
          >
            Open Nessty App →
          </a>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="bg-white p-6 rounded-xl shadow-2xl">
          <Image 
            src="/images/nessty-qr.png" 
            alt="Nessty QR Code - JJ Studio"
            width={280}
            height={280}
          />
          <p className="text-sm text-gray-700 text-center mt-4 font-semibold">Scan to book on Nessty</p>
        </div>
      </div>
    </div>
  </div>
</section>


        {/* ── CONTACT ── */}
        <section className="py-24 bg-gray-900" id="contact">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-amber-500 mb-6 rounded-full" />
                <h2 className="font-black uppercase leading-tight text-4xl lg:text-5xl mb-8 text-white" style={{ letterSpacing: "-0.02em" }}>
                  Get in <span className="text-amber-600">Touch</span>
                </h2>
                <div className="space-y-8">
                  <div>
                    <p className="text-xs tracking-widest uppercase mb-2 text-amber-500 font-semibold">Location</p>
                    <p className="text-sm text-gray-300">Xentric Lomas Norte<br />El Campanario, Lcl 211<br />Querétaro, Querétaro 76000<br />Mexico</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase mb-2 text-amber-500 font-semibold">Phone</p>
                    <a href="tel:+5213318373447" className="text-sm text-gray-300 hover:text-amber-500 transition-colors font-semibold">
                      +52 1 33 1837 3447
                    </a>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase mb-2 text-amber-500 font-semibold">Hours</p>
                    <p className="text-sm text-gray-300">Monday - Friday: 6:00 AM - 8:00 PM</p>
                    <p className="text-sm text-gray-300">Saturday: 7:00 AM - 6:00 PM</p>
                    <p className="text-sm text-gray-300">Sunday: Closed</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase mb-2 text-amber-500 font-semibold">Email</p>
                    <a href="mailto:administracion@jjstudio.mx" className="text-sm text-gray-300 hover:text-amber-500 transition-colors font-semibold">
                      administracion@jjstudio.mx
                    </a>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase mb-3 text-amber-500 font-semibold">Follow Us</p>
                    <div className="flex gap-4">
                      <a href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg==" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase text-gray-400 hover:text-amber-500 transition-colors">
                        Instagram
                      </a>
                      <a href="https://wa.me/5213318373447" target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase text-gray-400 hover:text-amber-500 transition-colors">
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault()
                setFormState("loading")
                try {
                  const res = await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                  })
                  const data = await res.json()
                  if (data.success) {
                    setFormState("success")
                    setFormData({ firstName: "", lastName: "", email: "", message: "" })
                    setTimeout(() => setFormState("idle"), 5000)
                  } else {
                    setFormState("error")
                  }
                } catch (err) {
                  console.error('Contact submit error:', err)
                  setFormState("error")
                }
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                    required
                    className="px-4 py-3 text-sm text-white w-full bg-gray-800 border border-gray-700 focus:outline-none focus:border-amber-600 transition-colors rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                    className="px-4 py-3 text-sm text-white w-full bg-gray-800 border border-gray-700 focus:outline-none focus:border-amber-600 transition-colors rounded-lg"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  required
                  className="px-4 py-3 text-sm text-white w-full bg-gray-800 border border-gray-700 focus:outline-none focus:border-amber-600 transition-colors rounded-lg"
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  required
                  className="px-4 py-3 text-sm text-white w-full bg-gray-800 border border-gray-700 focus:outline-none focus:border-amber-600 transition-colors rounded-lg resize-none"
                />
                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-widest uppercase px-8 py-4 w-full transition-all rounded-lg"
                >
                  {formState === "loading" ? "Sending..." : "Send Message"}
                </button>

                {formState === "success" && (
                  <div className="border border-amber-600/50 bg-amber-600/10 px-4 py-3 text-sm text-amber-400 tracking-wide text-center rounded-lg">
                    ✓ Message sent! We'll get back to you soon.
                  </div>
                )}
                {formState === "error" && (
                  <div className="border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-400 tracking-wide text-center rounded-lg">
                    Something went wrong. Email us at administracion@jjstudio.mx
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-gray-950 border-t border-amber-600/20 py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-6">
            <span className="text-xl font-black tracking-widest uppercase text-white">JJ<span className="text-amber-600">Studio</span></span>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
              <p className="text-xs uppercase tracking-widest text-gray-500">Premium Lagree Studio in Querétaro</p>
              <span className="text-gray-700 hidden sm:inline">|</span>
              <p className="text-xs text-gray-500">Trust the Process</p>
            </div>
            <p className="text-xs text-gray-600">© 2024 JJ Studio. All rights reserved.</p>
          </div>
        </footer>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          
          html {
            scroll-behavior: smooth;
          }
        `}</style>
      </main>
    </>
  )
}