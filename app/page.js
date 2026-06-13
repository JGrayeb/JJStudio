"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
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

  // Navigation handlers with auth checks
  const handleScheduleClick = (e) => {
    e?.preventDefault()
    if (user) {
      router.push('/bookings')
    } else {
      router.push('/login')
    }
  }

  const handlePackageClick = (e) => {
    e?.preventDefault()
    router.push('/packages')
  }

  const handleBeveragesClick = (e) => {
    e?.preventDefault()
    router.push('/beverages')
  }

  const handleAboutClick = (e) => {
    e?.preventDefault()
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
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
    <main className="bg-black text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/95 shadow-lg shadow-red-900/20" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="text-xl font-black tracking-widest uppercase">
            JJ<span className="text-red-900">Studio</span>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {[
              ["#", t.nav.home],
              ["#schedule", t.nav.schedule],
              ["#packages", t.nav.packages],
              ["#beverages", t.nav.beverages],
              ["#about", t.nav.about],
              ["#contact", t.nav.contact],
            ].map(([href, label], idx) => (
              <button key={href}
                onClick={(e) => {
                  if (idx === 1) handleScheduleClick(e)
                  else if (idx === 2) handlePackageClick(e)
                  else if (idx === 3) handleBeveragesClick(e)
                  else if (idx === 4) handleAboutClick(e)
                  else {
                    e.preventDefault()
                    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="text-xs font-medium tracking-widest uppercase text-white/70 hover:text-white transition-colors relative group"
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-red-900 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          {/* Right side - Language + Auth buttons */}
          <div className="hidden lg:flex items-center gap-5">
            <button onClick={toggleLang} className="flex items-center gap-2 cursor-pointer select-none group">
              <span className={`text-xs font-bold tracking-widest transition-colors ${lang === "es" ? "text-white" : "text-white/30"}`}>ES</span>
              <div className={`relative w-12 h-6 rounded-full border transition-all duration-300 ${lang === "en" ? "bg-white/10 border-white/20" : "bg-red-900/40 border-red-900"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-red-800 transition-all duration-300 ${lang === "en" ? "left-1" : "left-6"}`} />
              </div>
              <span className={`text-xs font-bold tracking-widest transition-colors ${lang === "en" ? "text-white" : "text-white/30"}`}>EN</span>
            </button>

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleProfileClick}
                      className="bg-red-900 hover:bg-red-800 text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      PROFILE
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-bold tracking-widest uppercase text-white/50 hover:text-white transition-colors"
                    >
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <>
                    <a href="/login"
                      className="text-xs font-bold tracking-widest uppercase text-white/50 hover:text-white transition-colors">
                      LOGIN
                    </a>
                    <a href="/signup"
                      className="bg-red-900 hover:bg-red-800 text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 transition-all duration-200 hover:-translate-y-0.5">
                      {t.nav.register}
                    </a>
                  </>
                )}
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(o => !o)}>
            <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`w-4 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2 w-6" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden bg-black border-t border-white/10 overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-screen py-6" : "max-h-0"}`}>
          <div className="flex flex-col px-6 gap-5">
            <button onClick={(e) => { handleScheduleClick(e); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-white/70 hover:text-white text-left">
              {t.nav.schedule}
            </button>
            <button onClick={(e) => { handlePackageClick(e); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-white/70 hover:text-white text-left">
              {t.nav.packages}
            </button>
            <button onClick={(e) => { handleBeveragesClick(e); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-white/70 hover:text-white text-left">
              {t.nav.beverages}
            </button>
            <button onClick={(e) => { handleAboutClick(e); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-white/70 hover:text-white text-left">
              {t.nav.about}
            </button>
            <button onClick={() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }} className="text-sm font-medium tracking-widest uppercase text-white/70 hover:text-white text-left">
              {t.nav.contact}
            </button>
            
            <div className="border-t border-white/10 pt-5">
              <button onClick={toggleLang} className="flex items-center gap-2 self-start mb-4">
                <span className={`text-xs font-bold tracking-widest ${lang === "es" ? "text-white" : "text-white/30"}`}>ES</span>
                <div className={`relative w-12 h-6 rounded-full border transition-all duration-300 ${lang === "en" ? "bg-white/10 border-white/20" : "bg-red-900/40 border-red-900"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-red-800 transition-all duration-300 ${lang === "en" ? "left-1" : "left-6"}`} />
                </div>
                <span className={`text-xs font-bold tracking-widest ${lang === "en" ? "text-white" : "text-white/30"}`}>EN</span>
              </button>

              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <button onClick={() => { handleProfileClick(); setMenuOpen(false) }} className="w-full bg-red-900 text-white text-xs font-bold tracking-widest uppercase px-5 py-3 mb-2">
                        PROFILE
                      </button>
                      <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="w-full text-xs font-bold tracking-widest uppercase text-white/50 hover:text-white py-2">
                        LOGOUT
                      </button>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="block bg-black border border-white/20 text-white text-xs font-bold tracking-widest uppercase px-5 py-3 text-center mb-2">
                        LOGIN
                      </a>
                      <a href="/signup" className="block bg-red-900 text-white text-xs font-bold tracking-widest uppercase px-5 py-3 text-center">
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

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #000 0%, #1a0000 40%, #000 100%)" }} id="home">
        <div className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(128,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(128,0,0,0.07) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(128,0,0,0.2) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] mb-6 uppercase text-red-800">{t.hero.location}</p>
            <h1 className="font-black uppercase leading-none mb-8"
              style={{ fontSize: "clamp(3.5rem,9vw,8rem)", letterSpacing: "-0.02em" }}>
              {t.hero.trust}<br />
              <span style={{ color: "rgba(255,255,255,0.08)", WebkitTextStroke: "1px rgba(255,255,255,0.35)" }}>
                {t.hero.the}
              </span><br />
              <span className="text-red-800">{t.hero.process}</span>
            </h1>
            <p className="text-lg font-light max-w-md mb-10 leading-relaxed text-white/50">{t.hero.sub}</p>
            <div className="flex flex-wrap gap-4">
              <a href="/signup"
                className="bg-red-900 hover:bg-red-800 text-white text-sm font-bold tracking-widest uppercase px-8 py-4 transition-all hover:-translate-y-0.5">
                {t.hero.cta1}
              </a>
              <button onClick={handleAboutClick}
                className="border border-white text-white text-sm font-bold tracking-widest uppercase px-8 py-4 hover:bg-white hover:text-black transition-all">
                {t.hero.cta2}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs tracking-widest uppercase text-white/25">{t.hero.scroll}</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <path d="M8 0v20M1 13l7 7 7-7" stroke="rgba(128,0,0,0.6)" strokeWidth="1.5" />
          </svg>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="py-4 overflow-hidden border-y border-red-950" style={{ background: "#800000" }}>
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 25s linear infinite" }}>
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center gap-0 shrink-0">
              {t.marquee.split(" · ").map((item, j) => (
                <span key={j} className="flex items-center">
                  <span className="text-xs font-bold tracking-[0.3em] uppercase mx-12 text-white/85">{item}</span>
                  <span className="text-xs text-white/35 mx-2">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── CLASSES ── */}
      <section className="py-24 bg-black" id="schedule">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <div>
              <div className="w-14 h-0.5 bg-red-900 mb-6" />
              <h2 className="font-black uppercase leading-none text-4xl lg:text-6xl" style={{ letterSpacing: "-0.02em" }}>
                {t.classes.title1}<br /><span className="text-red-800">{t.classes.title2}</span>
              </h2>
            </div>
            <button onClick={handleScheduleClick} className="border border-white text-white text-xs font-bold tracking-widest uppercase px-6 py-3 hover:bg-white hover:text-black transition-all self-start">
              {t.classes.book}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-white/5"
            style={{ background: "rgba(255,255,255,0.05)", gap: "1px" }}>
            {t.classes.items.map((cls, i) => (
              <div key={i}
                className={`bg-black p-8 group cursor-pointer hover:-translate-y-1 transition-all duration-300 ${i === 1 ? "border-x border-white/5" : ""} ${i >= 3 ? "border-t border-white/5" : ""}`}>
                {cls.badge && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-black text-red-800">{cls.num}</span>
                    <span className="text-xs tracking-widest uppercase px-2 py-1 border border-red-900/50 text-red-800">{cls.badge}</span>
                  </div>
                )}
                {!cls.badge && <div className="text-4xl font-black text-red-800 mb-4">{cls.num}</div>}
                <h3 className="text-xl font-bold uppercase tracking-wide mb-3">{cls.name}</h3>
                <p className="text-sm leading-relaxed mb-6 text-white/40">{cls.desc}</p>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/25">
                  <span>{cls.duration}</span><span>•</span><span>{cls.level}</span>
                </div>
                <div className="h-0.5 bg-red-900 mt-6 w-0 group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section className="py-24 bg-zinc-950" id="packages">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="w-14 h-0.5 bg-red-900 mx-auto mb-6" />
            <h2 className="font-black uppercase leading-none text-4xl lg:text-6xl" style={{ letterSpacing: "-0.02em" }}>
              {t.packages.title1} <span className="text-red-800">{t.packages.title2}</span>
            </h2>
            <p className="mt-4 max-w-sm mx-auto text-sm text-white/35">{t.packages.sub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.packages.plans.map((plan, i) => (
              <div key={i}
                className={`p-7 flex flex-col hover:-translate-y-1.5 transition-all duration-300 relative border ${plan.popular ? "border-red-900" : "border-white/10"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-900 text-white text-xs px-4 py-1 tracking-widest uppercase whitespace-nowrap">
                    {t.packages.popular}
                  </div>
                )}
                <p className={`text-xs tracking-widest uppercase mb-4 ${plan.popular ? "text-red-800" : "text-white/35"}`}>{plan.label}</p>
                <div className="font-black leading-none mb-1" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>{plan.price}</div>
                <p className="text-xs mb-1 text-white/30">{plan.sub}</p>
                <div className="w-14 h-0.5 bg-red-900 my-5" />
                <ul className="space-y-2.5 mb-8 flex-1">
                  <li className="text-sm flex items-center gap-3 text-white/55"><span className="text-red-800">✓</span>{plan.classes}</li>
                  <li className="text-sm flex items-center gap-3 text-white/55"><span className="text-red-800">✓</span>All class types</li>
                  <li className="text-sm flex items-center gap-3 text-white/55"><span className="text-red-800">✓</span>{plan.expire}</li>
                  <li className={`text-sm flex items-center gap-3 ${plan.beverage ? "text-white/80" : "text-white/20"}`}>
                    <span>{plan.beverage ? "✓" : "–"}</span>
                    {plan.beverage ? t.packages.bev : t.packages.noBev}
                  </li>
                </ul>
                <button onClick={handlePackageClick}
                  className={`block text-center text-xs font-bold tracking-widest uppercase px-4 py-3 transition-all ${plan.popular ? "bg-red-900 hover:bg-red-800 text-white" : "border border-white text-white hover:bg-white hover:text-black"}`}>
                  {t.packages.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {t.packages.perClass.map((item, i) => (
              <span key={i} className={`text-xs uppercase tracking-widest ${i === 2 ? "text-red-800 font-bold" : "text-white/35"}`}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEVERAGES ── */}
      <section className="py-24 bg-black" id="beverages">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-14 h-0.5 bg-red-900 mb-6" />
              <h2 className="font-black uppercase leading-none text-4xl lg:text-6xl mb-6" style={{ letterSpacing: "-0.02em" }}>
                {t.beverages.title1} <span className="text-red-800">{t.beverages.title2}</span>
              </h2>
              <p className="text-base leading-relaxed mb-4 text-white/50">{t.beverages.p1}</p>
              <p className="text-sm leading-relaxed mb-8 text-white/30">{t.beverages.p2}</p>
              <button onClick={handleBeveragesClick} className="bg-red-900 hover:bg-red-800 text-white text-xs font-bold tracking-widest uppercase px-8 py-4 inline-block transition-all">
                {t.beverages.cta}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {t.beverages.items.map((item, i) => (
                <div key={i} className="p-6 border border-white/8 bg-white/[0.03] hover:-translate-y-1 transition-all duration-300">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h4 className="font-bold uppercase text-sm tracking-wide mb-2">{item.name}</h4>
                  <p className="text-xs leading-relaxed text-white/35">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT / COACHES ── */}
      <section className="py-24 bg-zinc-950" id="about">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="w-14 h-0.5 bg-red-900 mx-auto mb-6" />
            <h2 className="font-black uppercase leading-none text-4xl lg:text-6xl" style={{ letterSpacing: "-0.02em" }}>
              {t.about.title1} <span className="text-red-800">{t.about.title2}</span>
            </h2>
            <p className="mt-4 max-w-md mx-auto text-sm text-white/35">{t.about.sub}</p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="border border-red-900/40 p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 opacity-5"
                style={{ background: "radial-gradient(circle, #800000, transparent)" }} />
              <div className="flex flex-col sm:flex-row items-start gap-8">
                <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden border-2 border-red-900">
                  <Image src="/images/coach-javi.jpeg" alt="Coach Javi" fill className="object-cover object-top" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-2xl font-black uppercase tracking-wide">{t.about.coachName}</h3>
                    <span className="text-xs tracking-widest uppercase px-2 py-1 border border-red-900/50 text-red-800">
                      {t.about.available}
                    </span>
                  </div>
                  <p className="text-xs tracking-widest uppercase mb-4 text-white/30">{t.about.coachRole}</p>
                  <p className="text-sm leading-relaxed text-white/50">{t.about.coachBio}</p>
                  <div className="flex gap-6 mt-6">
                    <div className="text-center">
                      <div className="font-black text-xl text-red-800">{t.about.allTypes}</div>
                      <div className="text-xs uppercase tracking-widest mt-1 text-white/25">{t.about.allTypesSub}</div>
                    </div>
                    <div className="w-px bg-white/8" />
                    <div className="text-center">
                      <div className="font-black text-xl text-red-800">{t.about.commit}</div>
                      <div className="text-xs uppercase tracking-widest mt-1 text-white/25">{t.about.commitSub}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 overflow-hidden" id="register"
        style={{ background: "linear-gradient(135deg, #1a0000 0%, #000 50%, #1a0000 100%)" }}>
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "linear-gradient(rgba(128,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(128,0,0,0.07) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 font-semibold text-red-800">{t.cta.ready}</p>
          <h2 className="font-black uppercase leading-none mb-8" style={{ fontSize: "clamp(3rem,8vw,8rem)", letterSpacing: "-0.02em" }}>
            {t.cta.join}<br /><span className="text-red-800">{t.cta.studio}</span>
          </h2>
          <p className="text-lg mb-4 max-w-md mx-auto text-white/40">{t.cta.sub}</p>
          <p className="text-xs uppercase tracking-widest mb-10 text-white/25">{t.cta.location}</p>
          <a href="/signup" className="bg-red-900 hover:bg-red-800 text-white text-sm font-bold tracking-widest uppercase px-12 py-5 inline-block transition-all hover:-translate-y-0.5">
            {t.cta.btn}
          </a>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-24 bg-black" id="contact">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <div className="w-14 h-0.5 bg-red-900 mb-6" />
              <h2 className="font-black uppercase leading-none text-4xl lg:text-5xl mb-8" style={{ letterSpacing: "-0.02em" }}>
                {t.contact.title1} <span className="text-red-800">{t.contact.title2}</span>
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-xs tracking-widest uppercase mb-1 text-white/25">{t.contact.location}</p>
                  <p className="text-sm text-white/65">{t.contact.locationVal}</p>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase mb-1 text-white/25">{t.contact.hours}</p>
                  <p className="text-sm text-white/65">{t.contact.hoursVal1}</p>
                  <p className="text-sm text-white/65">{t.contact.hoursVal2}</p>
                </div>
                <div>
                    <p className="text-xs tracking-widest uppercase mb-1 text-white/25">{t.contact.email}</p>
                    <a href="mailto:administracion@jjstudio.mx" className="text-sm text-white/65 hover:text-white transition-colors">
                       administracion@jjstudio.mx
                    </a>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase mb-2 text-white/25">{t.contact.follow}</p>
                  <div className="flex gap-4">
                   {[
                     { name: "Instagram", url: "https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg==" },
                    { name: "TikTok", url: "https://tiktok.com/@yourhandle" },
                    { name: "WhatsApp", url: "https://wa.me/5213318373447" },
                      ].map(link => (
                        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase text-white/35 hover:text-white transition-colors">{link.name}</a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
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
                  } else {
                    setFormState("error")
                  }
                } catch (err) {
                  console.error('Contact submit error:', err)
                  setFormState("error")
                }
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t.contact.firstName}
                  value={formData.firstName}
                  onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                  required
                  className="px-4 py-3 text-sm text-white w-full bg-white/5 border border-white/10 focus:outline-none focus:border-red-900 transition-colors"
                />
                <input
                  type="text"
                  placeholder={t.contact.lastName}
                  value={formData.lastName}
                  onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                  className="px-4 py-3 text-sm text-white w-full bg-white/5 border border-white/10 focus:outline-none focus:border-red-900 transition-colors"
                />
              </div>
              <input
                type="email"
                placeholder={t.contact.emailPlaceholder}
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                required
                className="px-4 py-3 text-sm text-white w-full bg-white/5 border border-white/10 focus:outline-none focus:border-red-900 transition-colors"
              />
              <textarea
                placeholder={t.contact.message}
                rows={4}
                value={formData.message}
                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                required
                className="px-4 py-3 text-sm text-white w-full bg-white/5 border border-white/10 focus:outline-none focus:border-red-900 transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={formState === "loading"}
                className="bg-red-900 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-widest uppercase px-8 py-4 w-full transition-all"
              >
                {formState === "loading" ? "Sending..." : t.contact.send}
              </button>

              {formState === "success" && (
                <div className="border border-red-900/50 bg-red-900/10 px-4 py-3 text-sm text-red-400 tracking-wide text-center">
                  ✓ Message sent — we'll get back to you soon.
                </div>
              )}
              {formState === "error" && (
                <div className="border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/40 tracking-wide text-center">
                  Something went wrong. Try emailing us at administracion@jjstudio.mx
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <span className="text-xl font-black tracking-widest uppercase">JJ<span className="text-red-800">Studio</span></span>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
            <p className="text-xs uppercase tracking-widest text-white/20">{t.footer.tagline}</p>
            <span className="text-white/10 hidden sm:inline">|</span>
            <p className="text-xs text-white/20">{t.footer.location}</p>
          </div>
          <p className="text-xs text-white/15">{t.footer.rights}</p>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </main>
  )
} 