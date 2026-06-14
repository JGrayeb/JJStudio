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

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "JJ Studio Lagree",
    "description": "Premium Lagree fitness studio in Querétaro. High-intensity, low-impact Megaformer classes. Trust the Process.",
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
    }
  }

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
    } else {
      router.push('/login')
    }
  }

  const handlePackageClick = (e) => {
    e?.preventDefault()
    setMenuOpen(false)
    if (user) {
      router.push('/dashboard/client#packages', { scroll: false })
    } else {
      router.push('/login')
    }
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
        <title>JJ Studio Lagree Querétaro | Megaformer Classes | Trust the Process</title>
        <meta name="description" content="JJ Studio - Premium Lagree Megaformer fitness studio in Querétaro. High-intensity, low-impact 45-min classes. All fitness levels. Trust the Process. Book your free trial." />
        <meta name="keywords" content="Lagree Querétaro, Megaformer, fitness studio, high-intensity workout, low-impact training" />
        <meta property="og:title" content="JJ Studio Lagree | Trust the Process" />
        <meta property="og:description" content="Premium Lagree Megaformer classes in Querétaro. Trust the Process." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://jjstudio.mx" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      </Head>

      <style>{`
        :root {
          --primary-red: #c41e1e;
          --dark-red: #690606;
          --blood-red: #8a0303;
          --bg-black: #0a0a0a;
          --bg-dark: #1a1a1a;
          --bg-card: #2a2a2a;
        }

        .btn-primary {
          background: var(--primary-red);
          color: white;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          background: var(--dark-red);
          box-shadow: 0 10px 25px rgba(196, 30, 30, 0.3);
        }

        .btn-secondary {
          border: 2px solid var(--primary-red);
          color: var(--primary-red);
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          background: var(--primary-red);
          color: white;
        }

        .nav-link {
          transition: all 0.3s ease;
          color: #d1d5db;
        }
        .nav-link:hover {
          color: var(--primary-red);
        }

        .social-icon {
          transition: all 0.3s ease;
        }
        .social-icon:hover {
          background-color: rgba(196, 30, 30, 0.2);
          color: var(--primary-red);
        }

        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          border-color: var(--primary-red);
          box-shadow: 0 20px 25px -5px rgba(196, 30, 30, 0.2);
        }

        .form-input {
          background: var(--bg-card);
          border: 1px solid #3a3a3a;
          color: white;
          transition: border-color 0.3s ease;
        }
        .form-input:focus {
          border-color: var(--dark-red);
          outline: none;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee {
          animation: marquee 25s linear infinite;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <main className="text-gray-900 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#0a0a0a" }}>

        {/* ── NAVBAR ── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`} style={{ background: scrolled ? "rgba(10, 10, 10, 0.98)" : "rgba(10, 10, 10, 0.90)" }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xl font-black tracking-widest uppercase text-white">
                JJ<span style={{ color: "#c41e1e" }}>Studio</span>
              </span>
              <div className="h-6 w-px" style={{ background: "rgba(196, 30, 30, 0.4)" }} />
              <a href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg==" target="_blank" rel="noopener noreferrer" className="social-icon p-2 rounded-lg text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
              </a>
              <a href="https://wa.me/5213318373447?text=Hola%20JJ%20Studio" target="_blank" rel="noopener noreferrer" className="social-icon p-2 rounded-lg text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </a>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              {[
                { label: "HOME", handler: handleHomeClick },
                { label: "SCHEDULE", handler: handleScheduleClick },
                { label: "PACKAGES", handler: handlePackageClick },
                { label: "ABOUT", handler: handleAboutClick },
                { label: "CONTACT", handler: handleContactClick },
              ].map(({ label, handler }) => (
                <button key={label} onClick={handler} className="nav-link text-xs font-medium tracking-widest uppercase">
                  {label}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <button onClick={() => router.push('/dashboard/client')} className="btn-primary text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-lg">
                        PROFILE
                      </button>
                      <button onClick={handleLogout} className="nav-link text-xs font-bold tracking-widest uppercase text-gray-400">
                        LOGOUT
                      </button>
                    </div>
                  ) : (
                    <>
                      <a href="/login" className="nav-link text-xs font-bold tracking-widest uppercase text-gray-400">LOGIN</a>
                      <a href="/signup" className="btn-primary text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-lg">SIGN UP</a>
                    </>
                  )}
                </>
              )}
            </div>

            <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(o => !o)}>
              <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`w-4 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2 w-6" : ""}`} />
            </button>
          </div>

          {menuOpen && (
            <div className="lg:hidden border-t" style={{ background: "#1a1a1a", borderColor: "rgba(196, 30, 30, 0.2)" }}>
              <div className="flex flex-col px-6 gap-5 py-6">
                <button onClick={(e) => { handleHomeClick(e); setMenuOpen(false) }} className="nav-link text-sm font-medium tracking-widest uppercase">HOME</button>
                <button onClick={(e) => { handleScheduleClick(e); setMenuOpen(false) }} className="nav-link text-sm font-medium tracking-widest uppercase">SCHEDULE</button>
                <button onClick={(e) => { handlePackageClick(e); setMenuOpen(false) }} className="nav-link text-sm font-medium tracking-widest uppercase">PACKAGES</button>
                <button onClick={(e) => { handleAboutClick(e); setMenuOpen(false) }} className="nav-link text-sm font-medium tracking-widest uppercase">ABOUT</button>
                <button onClick={(e) => { handleContactClick(e); setMenuOpen(false) }} className="nav-link text-sm font-medium tracking-widest uppercase">CONTACT</button>
              </div>
            </div>
          )}
        </nav>

        {/* ── PPLA-STYLE HERO ── */}
        <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20" id="home" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #2a0a0a 40%, #0a0a0a 100%)" }}>
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(196, 30, 30, 0.15) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              {/* Main headline like PPLA */}
              <h1 className="font-black uppercase leading-tight mb-4" style={{ fontSize: "clamp(2.5rem,8vw,5.5rem)", letterSpacing: "-0.02em", color: "#FFFFFF" }}>
                <span style={{ color: "#c41e1e" }}>Megaformer</span><br />
                <span className="text-gray-300">45 Minutes</span><br />
                <span style={{ color: "#c41e1e" }}>Full-Body</span>
              </h1>

              {/* Subheading with vibe description (PPLA style) */}
              <p className="text-xl font-light mb-6 text-gray-300 leading-relaxed">
                High-intensity, low-impact sessions with <span style={{ color: "#c41e1e" }}>lights low</span>, <span style={{ color: "#c41e1e" }}>music high</span>, and relentless results.
              </p>

              {/* Method promise */}
              <p className="text-lg text-gray-400 mb-10 font-light max-w-2xl">
                Constant resistance on the Megaformer targets deep muscle layers. Build strength, core stability, and endurance — all fitness levels welcome.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4">
                <a href="/signup" className="btn-primary text-white text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-lg shadow-lg">
                  START FREE TRIAL
                </a>
                <button onClick={handleScheduleClick} className="btn-secondary text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-lg">
                  BOOK A CLASS
                </button>
              </div>

              {/* Trust the Process motto - centered */}
              <p className="text-xs font-semibold tracking-[0.3em] mt-12 uppercase" style={{ color: "#c41e1e" }}>
                ✦ TRUST THE PROCESS ✦
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs tracking-widest uppercase text-gray-500">Scroll to explore</span>
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
              <path d="M8 0v20M1 13l7 7 7-7" stroke="rgba(196, 30, 30, 0.6)" strokeWidth="1.5" />
            </svg>
          </div>
        </section>

        {/* ── METHOD EXPLAINER (PPLA STYLE) ── */}
        <section className="py-20 px-6" style={{ background: "#1a1a1a" }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "⚡", title: "Constant Resistance", desc: "The Megaformer's unique pulley system keeps muscles under tension the entire class — no momentum, pure strength." },
                { icon: "🎯", title: "Low-Impact", desc: "Smooth, controlled movements protect joints while delivering high-intensity results. Safe for all bodies." },
                { icon: "🔥", title: "Real Transformation", desc: "45 minutes targets deep muscle layers. Tone, strengthen, and build core stability fast." },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{item.icon}</div>
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-3 text-white" style={{ color: "#c41e1e" }}>{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="py-6 overflow-hidden" style={{ background: "linear-gradient(90deg, #2a0a0a 0%, #0a0a0a 50%, #2a0a0a 100%)", borderTop: "1px solid rgba(196, 30, 30, 0.3)", borderBottom: "1px solid rgba(196, 30, 30, 0.3)" }}>
          <div className="marquee flex whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex items-center gap-0 shrink-0">
                <span className="flex items-center">
                  <span className="text-xs font-bold tracking-[0.3em] uppercase mx-12 text-gray-300">Trust the Process</span>
                  <span className="text-xs mx-2" style={{ color: "#c41e1e" }}>✦</span>
                  <span className="text-xs font-bold tracking-[0.3em] uppercase mx-12 text-gray-300">Strength • Endurance • Core</span>
                  <span className="text-xs mx-2" style={{ color: "#c41e1e" }}>✦</span>
                  <span className="text-xs font-bold tracking-[0.3em] uppercase mx-12 text-gray-300">45 Minutes</span>
                  <span className="text-xs mx-2" style={{ color: "#c41e1e" }}>✦</span>
                  <span className="text-xs font-bold tracking-[0.3em] uppercase mx-12 text-gray-300">All Fitness Levels</span>
                  <span className="text-xs mx-2" style={{ color: "#c41e1e" }}>✦</span>
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ── CLASSES SECTION ── */}
        <section className="py-24" id="schedule" style={{ background: "#1a1a1a" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
              <div>
                <div className="w-16 h-1 mb-6 rounded-full" style={{ background: "linear-gradient(to right, #c41e1e, #690606)" }} />
                <h2 className="font-black uppercase leading-tight text-4xl lg:text-5xl text-white">
                  Our <span style={{ color: "#c41e1e" }}>Classes</span>
                </h2>
              </div>
              <button onClick={handleScheduleClick} className="btn-secondary text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-lg">
                VIEW SCHEDULE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "MegaBurn 45", level: "All Levels", duration: "45 min", desc: "Full-body strength + endurance on the Megaformer. Lights low, music high, results guaranteed." },
                { name: "Core Focus", level: "Intermediate", duration: "45 min", desc: "Deep core work targeting abs, obliques, and lower back. Build stability and definition." },
                { name: "Power Sculpt", level: "Advanced", duration: "45 min", desc: "High-intensity muscle-building on the Megaformer. Upper body, lower body, repeat." },
              ].map((cls, i) => (
                <div key={i} className="card-hover p-8 rounded-xl transition-all border" style={{ background: "#2a2a2a", borderColor: "#3a3a3a" }}>
                  <h3 className="text-xl font-bold uppercase tracking-wide mb-2 text-white">{cls.name}</h3>
                  <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#c41e1e" }}>{cls.level} • {cls.duration}</p>
                  <p className="text-sm leading-relaxed text-gray-400">{cls.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS / SOCIAL PROOF ── */}
        <section className="py-24" style={{ background: "#0a0a0a" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="w-16 h-1 mx-auto mb-6 rounded-full" style={{ background: "linear-gradient(to right, #c41e1e, #690606)" }} />
              <h2 className="font-black uppercase text-4xl lg:text-5xl text-white">
                Join Our <span style={{ color: "#c41e1e" }}>Community</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "María G.", quote: "I've been training for 2 months and my posture is completely different. The instructors here really care about form and progress. Trust the Process works!" },
                { name: "Carlos M.", quote: "45 minutes of pure intensity. The low-impact part is key for me — tough on the muscles, easy on my joints. Love it." },
                { name: "Jessica R.", quote: "The community here is unreal. Everyone is supportive, the studio vibe is premium, and results speak for themselves. Already seeing definition." },
              ].map((test, i) => (
                <div key={i} className="card-hover p-8 rounded-xl border" style={{ background: "#2a2a2a", borderColor: "#3a3a3a" }}>
                  <p className="text-sm text-gray-300 mb-6 italic leading-relaxed">"{test.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full" style={{ background: "#c41e1e" }} />
                    <p className="text-sm font-bold text-white">{test.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PACKAGES ── */}
        <section className="py-24" id="packages" style={{ background: "#1a1a1a" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="w-16 h-1 mx-auto mb-6 rounded-full" style={{ background: "linear-gradient(to right, #c41e1e, #690606)" }} />
              <h2 className="font-black uppercase text-4xl lg:text-5xl text-white">
                Membership <span style={{ color: "#c41e1e" }}>Plans</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "STARTER", price: "$499", period: "per month", classes: "4 classes/month", popular: false },
                { name: "UNLIMITED", price: "$899", period: "per month", classes: "Unlimited classes", popular: true },
                { name: "PACK 10", price: "$1,200", period: "10 classes", classes: "Valid 3 months", popular: false },
              ].map((plan, i) => (
                <div key={i} className={`p-8 rounded-xl flex flex-col transition-all relative border-2`} style={{ background: plan.popular ? "rgba(196, 30, 30, 0.1)" : "#2a2a2a", borderColor: plan.popular ? "#c41e1e" : "#3a3a3a" }}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs px-4 py-1 tracking-widest uppercase rounded-lg" style={{ background: "#c41e1e" }}>
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-2 text-white">{plan.name}</h3>
                  <div className="font-black text-3xl mb-2 text-white">{plan.price}</div>
                  <p className="text-xs text-gray-400 mb-6">{plan.period}</p>
                  <div className="w-8 h-1 rounded-full mb-6" style={{ background: "#c41e1e" }} />
                  <p className="text-sm mb-8 text-gray-300">{plan.classes}</p>
                  <button onClick={handlePackageClick} className={`text-center text-xs font-bold tracking-widest uppercase px-4 py-3 rounded-lg transition-all text-white`} style={{ background: plan.popular ? "#c41e1e" : "transparent", border: plan.popular ? "none" : "2px solid #c41e1e", color: plan.popular ? "white" : "#c41e1e" }}>
                    GET STARTED
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT / COACH ── */}
        <section className="py-24" id="about" style={{ background: "#0a0a0a" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="w-16 h-1 mx-auto mb-6 rounded-full" style={{ background: "linear-gradient(to right, #c41e1e, #690606)" }} />
              <h2 className="font-black uppercase text-4xl lg:text-5xl text-white">
                Meet Your <span style={{ color: "#c41e1e" }}>Coach</span>
              </h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="p-10 rounded-xl card-hover border" style={{ borderColor: "rgba(196, 30, 30, 0.3)", background: "#2a2a2a" }}>
                <div className="flex flex-col sm:flex-row items-start gap-8">
                  <div className="w-40 h-40 flex-shrink-0 relative overflow-hidden rounded-lg" style={{ border: "2px solid #c41e1e" }}>
                    <Image src="/images/coach-javi.jpeg" alt="Coach Javi - JJ Studio" fill className="object-cover object-top" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black uppercase tracking-wide text-white mb-2">Javi Coach</h3>
                    <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#c41e1e" }}>Certified Lagree Instructor</p>
                    <p className="text-sm leading-relaxed text-gray-300 mb-6">
                      Passionate about helping every client unlock their potential on the Megaformer. Certified in Lagree methodology with 5+ years of fitness coaching experience. Specializes in form, progression, and making every class challenging yet accessible.
                    </p>
                    <p className="text-xs text-gray-400">"My goal is to make you fall in love with the process, not just the results. Trust it, and transformation follows."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="py-24" id="contact" style={{ background: "#1a1a1a" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <div className="w-16 h-1 mb-6 rounded-full" style={{ background: "linear-gradient(to right, #c41e1e, #690606)" }} />
                <h2 className="font-black uppercase text-4xl lg:text-5xl mb-8 text-white">
                  Get in <span style={{ color: "#c41e1e" }}>Touch</span>
                </h2>

                <div className="space-y-8">
                  <div>
                    <p className="text-xs tracking-widest uppercase mb-2 font-semibold" style={{ color: "#c41e1e" }}>LOCATION</p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Xentric Lomas Norte<br />
                      El Campanario, Lcl 211<br />
                      Querétaro, Querétaro 76000<br />
                      Mexico
                    </p>
                  </div>

                  <div>
                    <p className="text-xs tracking-widest uppercase mb-2 font-semibold" style={{ color: "#c41e1e" }}>PHONE</p>
                    <a href="tel:+5213318373447" className="text-sm text-gray-300 font-semibold nav-link">
                      +52 1 33 1837 3447
                    </a>
                  </div>

                  <div>
                    <p className="text-xs tracking-widest uppercase mb-2 font-semibold" style={{ color: "#c41e1e" }}>HOURS</p>
                    <p className="text-sm text-gray-300">Monday - Friday: 6:00 AM - 8:00 PM</p>
                    <p className="text-sm text-gray-300">Saturday: 7:00 AM - 6:00 PM</p>
                    <p className="text-sm text-gray-300">Sunday: Closed</p>
                  </div>

                  <div>
                    <p className="text-xs tracking-widest uppercase mb-3 font-semibold" style={{ color: "#c41e1e" }}>FOLLOW US</p>
                    <div className="flex gap-4">
                      <a href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg==" target="_blank" rel="noopener noreferrer" className="nav-link text-xs tracking-widest uppercase text-gray-400">
                        Instagram
                      </a>
                      <a href="https://wa.me/5213318373447?text=Hola%20JJ%20Studio" target="_blank" rel="noopener noreferrer" className="nav-link text-xs tracking-widest uppercase text-gray-400">
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
                    className="form-input px-4 py-3 text-sm text-white w-full rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                    className="form-input px-4 py-3 text-sm text-white w-full rounded-lg"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  required
                  className="form-input px-4 py-3 text-sm text-white w-full rounded-lg"
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  required
                  className="form-input px-4 py-3 text-sm text-white w-full rounded-lg resize-none"
                />
                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="btn-primary text-white text-xs font-bold tracking-widest uppercase px-8 py-4 w-full rounded-lg disabled:opacity-50"
                >
                  {formState === "loading" ? "SENDING..." : "SEND MESSAGE"}
                </button>

                {formState === "success" && (
                  <div className="px-4 py-3 text-sm tracking-wide text-center rounded-lg" style={{ border: "1px solid rgba(196, 30, 30, 0.5)", background: "rgba(196, 30, 30, 0.1)", color: "#c41e1e" }}>
                    ✓ Message sent! We'll get back to you soon.
                  </div>
                )}
                {formState === "error" && (
                  <div className="px-4 py-3 text-sm tracking-wide text-center rounded-lg" style={{ border: "1px solid #3a3a3a", background: "#2a2a2a", color: "#9ca3af" }}>
                    Something went wrong. Email us directly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="relative py-32 overflow-hidden" style={{ background: "linear-gradient(135deg, #2a0a0a 0%, #0a0a0a 50%, #2a0a0a 100%)" }}>
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(196, 30, 30, 0.2), transparent)" }} />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-black uppercase leading-tight mb-6 text-white" style={{ fontSize: "clamp(2rem,6vw,4rem)", letterSpacing: "-0.02em" }}>
              Ready to <span style={{ color: "#c41e1e" }}>Transform?</span>
            </h2>
            <p className="text-lg mb-4 text-gray-300 max-w-2xl mx-auto">
              Your first class is free. No commitment, just trust the process and see what happens.
            </p>
            <a href="/signup" className="btn-primary text-white text-sm font-bold tracking-widest uppercase px-12 py-5 rounded-lg inline-block shadow-lg">
              BOOK YOUR FREE CLASS
            </a>
            <p className="text-xs uppercase tracking-widest mt-8 text-gray-500">
              ✦ TRUST THE PROCESS ✦
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="py-12" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(196, 30, 30, 0.2)" }}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-6">
            <span className="text-xl font-black tracking-widest uppercase text-white">
              JJ<span style={{ color: "#c41e1e" }}>Studio</span>
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
              <p className="text-xs uppercase tracking-widest text-gray-500">Premium Lagree Megaformer Studio in Querétaro</p>
              <span className="text-gray-700 hidden sm:inline">|</span>
              <p className="text-xs text-gray-500">Trust the Process</p>
            </div>
            <p className="text-xs text-gray-600">© 2024 JJ Studio. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  )
}