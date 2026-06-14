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
    "description": "Premium Lagree Megaformer fitness studio in Querétaro. Trust the Process.",
    "url": "https://jjstudio.mx",
    "telephone": "+5213318373447",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Xentric Lomas Norte, El Campanario, Lcl 211",
      "addressLocality": "Querétaro",
      "addressRegion": "Querétaro",
      "postalCode": "76000",
      "addressCountry": "MX"
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
        <meta name="description" content="JJ Studio - Premium Lagree Megaformer fitness studio in Querétaro. High-intensity, low-impact 45-min classes. All fitness levels. Trust the Process." />
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

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #0a0a0a;
          color: #fff;
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
        }

        .btn-primary {
          background: var(--primary-red);
          color: white;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 0.1em;
        }

        .btn-primary:hover {
          background: var(--dark-red);
          box-shadow: 0 10px 25px rgba(196, 30, 30, 0.3);
          transform: translateY(-2px);
        }

        .btn-secondary {
          border: 2px solid var(--primary-red);
          background: transparent;
          color: var(--primary-red);
          transition: all 0.3s ease;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 0.1em;
        }

        .btn-secondary:hover {
          background: var(--primary-red);
          color: white;
        }

        .nav-link {
          transition: all 0.3s ease;
          color: #d1d5db;
          cursor: pointer;
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.15em;
        }

        .nav-link:hover {
          color: var(--primary-red);
        }

        .social-icon {
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .social-icon:hover {
          background-color: rgba(196, 30, 30, 0.2);
          color: var(--primary-red);
        }

        .card-hover {
          transition: all 0.3s ease;
          border: 1px solid #3a3a3a;
        }

        .card-hover:hover {
          border-color: var(--dark-red);
          box-shadow: 0 20px 25px -5px rgba(196, 30, 30, 0.2);
          transform: translateY(-4px);
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

        /* PPLA STYLE SECTIONS */
        .ppla-section {
          padding: 6rem 1.5rem;
        }

        .ppla-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .ppla-header h2 {
          font-size: clamp(2rem, 6vw, 4rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .ppla-divider {
          width: 4rem;
          height: 0.25rem;
          background: linear-gradient(to right, #c41e1e, #690606);
          margin: 1.5rem auto 2rem;
          border-radius: 9999px;
        }

        .ppla-text {
          max-width: 56rem;
          margin: 0 auto;
          font-size: 1.125rem;
          line-height: 1.8;
        }

        .ppla-three-col {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .ppla-card {
          padding: 2rem;
          background: #2a2a2a;
          border: 1px solid #3a3a3a;
          border-radius: 0.75rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .ppla-card:hover {
          border-color: var(--dark-red);
          box-shadow: 0 20px 25px -5px rgba(196, 30, 30, 0.2);
          transform: translateY(-8px);
        }

        .ppla-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          color: var(--primary-red);
        }

        .ppla-card p {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #9ca3af;
        }
      `}</style>

      <main style={{ background: "#0a0a0a" }}>

        {/* ── NAVBAR ── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`} style={{ background: scrolled ? "rgba(10, 10, 10, 0.98)" : "rgba(10, 10, 10, 0.90)", borderBottom: scrolled ? "1px solid rgba(196, 30, 30, 0.2)" : "none" }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <span className="text-xl font-black tracking-widest uppercase text-white">
              JJ<span style={{ color: "#c41e1e" }}>Studio</span>
            </span>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {[
                { label: "SCHEDULE", href: "#schedule" },
                { label: "PACKAGES", href: "#packages" },
                { label: "ABOUT", href: "#about" },
                { label: "CONTACT", href: "#contact" },
              ].map(({ label, href }) => (
                <a key={label} href={href} className="nav-link">
                  {label}
                </a>
              ))}
            </div>

            {/* Auth + Socials */}
            <div className="hidden lg:flex items-center gap-4">
              <a href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg==" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
              </a>
              <a href="https://wa.me/5213318373447" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </a>
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <button onClick={() => router.push('/dashboard/client')} className="btn-primary px-5 py-2.5 rounded-lg text-xs">
                        PROFILE
                      </button>
                      <button onClick={handleLogout} className="nav-link">LOGOUT</button>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="nav-link">LOGIN</a>
                      <a href="/signup" className="btn-primary px-5 py-2.5 rounded-lg text-xs">SIGN UP</a>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`w-4 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2 w-6" : ""}`} />
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div style={{ background: "#1a1a1a", borderTop: "1px solid rgba(196, 30, 30, 0.2)" }}>
              <div className="flex flex-col px-6 gap-4 py-6">
                <a href="#schedule" className="nav-link" onClick={() => setMenuOpen(false)}>SCHEDULE</a>
                <a href="#packages" className="nav-link" onClick={() => setMenuOpen(false)}>PACKAGES</a>
                <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>ABOUT</a>
                <a href="#contact" className="nav-link" onClick={() => setMenuOpen(false)}>CONTACT</a>
              </div>
            </div>
          )}
        </nav>

        {/* ── REVIEW BANNER ── */}
        <div style={{ background: "rgba(196, 30, 30, 0.1)", borderBottom: "1px solid rgba(196, 30, 30, 0.3)", padding: "1rem" }}>
          <div className="max-w-7xl mx-auto px-6">
            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#c41e1e", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              ✦ Leave your 5-Star review and WIN A FREE MONTH OF JJ STUDIO! ✦
            </p>
          </div>
        </div>

        {/* ── HERO SECTION (PPLA STYLE) ── */}
        <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #2a0a0a 40%, #0a0a0a 100%)" }}>
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(196, 30, 30, 0.15) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-4xl">
              {/* PPLA-style label */}
              <p style={{ fontSize: "0.875rem", fontWeight: "600", letterSpacing: "0.3em", marginBottom: "1.5rem", textTransform: "uppercase", color: "#c41e1e" }}>
                Megaformer Workout
              </p>

              {/* Method name */}
              <p style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "0.1em", marginBottom: "2rem", textTransform: "uppercase", color: "#9ca3af" }}>
                Lagree Fitness
              </p>

              {/* Main headline */}
              <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)", fontWeight: "900", letterSpacing: "-0.02em", lineHeight: "1.2", marginBottom: "2rem", textTransform: "uppercase" }}>
                Welcome to <br />
                <span style={{ color: "#c41e1e" }}>JJ Studio</span>
              </h1>

              {/* Tagline */}
              <p style={{ fontSize: "1.25rem", fontWeight: "300", marginBottom: "3rem", lineHeight: "1.8", maxWidth: "600px", color: "#d1d5db" }}>
                A Lagree-inspired fitness studio that combines <span style={{ color: "#c41e1e" }}>strength, endurance, cardio, balance,</span> and flexibility in each and every move.
              </p>

              {/* CTA */}
              <button onClick={() => router.push('/signup')} className="btn-primary px-8 py-4 rounded-lg text-sm">
                START FREE TRIAL
              </button>

              {/* Trust the Process */}
              <p style={{ fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.3em", marginTop: "3rem", textTransform: "uppercase", color: "#c41e1e" }}>
                ✦ TRUST THE PROCESS ✦
              </p>
            </div>
          </div>
        </section>

        {/* ── HOW WE DO IT SECTION ── */}
        <section className="ppla-section" style={{ background: "#1a1a1a" }} id="schedule">
          <div className="max-w-7xl mx-auto">
            <p style={{ fontSize: "0.875rem", fontWeight: "700", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c41e1e", marginBottom: "2rem", textAlign: "center" }}>
              How We Do It
            </p>

            <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em", textAlign: "center", marginBottom: "2rem" }}>
              <span style={{ color: "#c41e1e" }}>MegaBurn 45</span> is our signature class
            </h2>

            <div className="ppla-text" style={{ marginBottom: "3rem", color: "#d1d5db" }}>
              <p>
                Our signature class on the Megaformer that provides you with a <span style={{ color: "#c41e1e" }}>total-body high intensity, low impact workout,</span> combining cardio and strength training to help improve endurance, flexibility and overall strength. <span style={{ color: "#c41e1e" }}>The lights are low, the music is high.</span> This 45 minute class is for all fitness levels, and our signature moves can be amplified or modified to accommodate your individual goals.
              </p>
            </div>

            {/* Call to action */}
            <div style={{ textAlign: "center" }}>
              <a href="#packages" className="btn-secondary px-8 py-4 rounded-lg text-sm inline-block">
                SEE OUR PACKAGES
              </a>
            </div>
          </div>
        </section>

        {/* ── THE PERFECT MACHINE SECTION ── */}
        <section className="ppla-section" style={{ background: "#0a0a0a" }}>
          <div className="max-w-7xl mx-auto">
            <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em", textAlign: "center", marginBottom: "2rem" }}>
              The <span style={{ color: "#c41e1e" }}>Perfect Machine</span>
            </h2>

            <div className="ppla-text" style={{ marginBottom: "3rem", color: "#d1d5db" }}>
              <p>
                The workout is done on the one of a kind <span style={{ color: "#c41e1e" }}>Megaformer™</span> which provides <span style={{ color: "#c41e1e" }}>constant resistance</span> and allow for continuous tension targeting your slow twitch muscle fibers while providing infinitely more exercise options than a traditional reformer. The Megaformer™ allows you to transition quickly and smoothly from each move while continuing to increase the heart rate and get the blood pumping.
              </p>
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center" }}>
              <a href="#schedule" className="btn-primary px-8 py-4 rounded-lg text-sm inline-block">
                VIEW OUR SCHEDULES
              </a>
            </div>
          </div>
        </section>

        {/* ── CLASSES GRID ── */}
        <section className="ppla-section" style={{ background: "#1a1a1a" }}>
          <div className="max-w-7xl mx-auto">
            <div className="ppla-header">
              <div className="ppla-divider" />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Our <span style={{ color: "#c41e1e" }}>Classes</span>
              </h2>
            </div>

            <div className="ppla-three-col">
              {[
                { name: "MegaBurn 45", level: "All Levels", duration: "45 min", desc: "Full-body strength + endurance on the Megaformer. Lights low, music high, results guaranteed." },
                { name: "Core Focus", level: "Intermediate", duration: "45 min", desc: "Deep core work targeting abs, obliques, and lower back. Build stability and definition." },
                { name: "Power Sculpt", level: "Advanced", duration: "45 min", desc: "High-intensity muscle-building on the Megaformer. Upper body, lower body, repeat." },
                { name: "Cardio Burst", level: "Intermediate", duration: "45 min", desc: "Heart-pumping cardio mixed with strength. Constant tension = maximum calorie burn." },
                { name: "Total Transformation", level: "Beginner", duration: "45 min", desc: "Perfect intro to the Megaformer. Learn form, build confidence, see results." },
                { name: "Private Training", level: "All Levels", duration: "1 hour", desc: "One-on-one personalized coaching. Custom programming for your goals and body." },
              ].map((cls, i) => (
                <div key={i} className="ppla-card card-hover">
                  <h3>{cls.name}</h3>
                  <p style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", color: "#9ca3af" }}>
                    {cls.level} • {cls.duration}
                  </p>
                  <p>{cls.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS / SOCIAL PROOF ── */}
        <section className="ppla-section" style={{ background: "#0a0a0a" }}>
          <div className="max-w-7xl mx-auto">
            <div className="ppla-header">
              <div className="ppla-divider" />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Join Our <span style={{ color: "#c41e1e" }}>Community</span>
              </h2>
            </div>

            <div className="ppla-three-col">
              {[
                { name: "María G.", quote: "I've been training for 2 months and my posture is completely different. The instructors here really care about form and progress. Trust the Process works!" },
                { name: "Carlos M.", quote: "45 minutes of pure intensity. The low-impact part is key for me — tough on the muscles, easy on my joints. Already seeing definition." },
                { name: "Jessica R.", quote: "The community here is unreal. Everyone is supportive, the studio vibe is premium, and results speak for themselves. Loving it!" },
                { name: "Diego L.", quote: "Best decision I made was trying the free trial. Now I'm obsessed. The Megaformer is unreal, and Javi's coaching is next level." },
                { name: "Ana P.", quote: "This is not your typical gym. It's a full experience — the energy, the music, the results. I'm transformed." },
                { name: "Roberto H.", quote: "Finally found a workout that challenges me AND respects my joints. This is the real deal. Trust the Process." },
              ].map((test, i) => (
                <div key={i} className="ppla-card card-hover">
                  <p style={{ fontSize: "0.95rem", fontStyle: "italic", marginBottom: "1.5rem", lineHeight: "1.8", color: "#d1d5db" }}>
                    "{test.quote}"
                  </p>
                  <p style={{ fontWeight: "700", color: "#c41e1e", textTransform: "uppercase", fontSize: "0.875rem", letterSpacing: "0.05em" }}>
                    {test.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PACKAGES ── */}
        <section className="ppla-section" style={{ background: "#1a1a1a" }} id="packages">
          <div className="max-w-7xl mx-auto">
            <div className="ppla-header">
              <div className="ppla-divider" />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Membership <span style={{ color: "#c41e1e" }}>Plans</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
              {[
                { name: "STARTER", price: "$499", period: "per month", classes: "4 classes/month", popular: false, features: ["4 classes/month", "All class types", "30 day expiration", "Access to app"] },
                { name: "UNLIMITED", price: "$899", period: "per month", classes: "Unlimited classes", popular: true, features: ["Unlimited classes", "All class types", "No expiration", "Priority booking", "VIP community"] },
                { name: "PACK 10", price: "$1,200", period: "10 classes", classes: "Valid 3 months", popular: false, features: ["10 classes", "Valid 3 months", "Any class type", "Flexible schedule"] },
              ].map((plan, i) => (
                <div key={i} style={{ padding: "2rem", background: plan.popular ? "rgba(196, 30, 30, 0.1)" : "#2a2a2a", border: `2px solid ${plan.popular ? "#c41e1e" : "#3a3a3a"}`, borderRadius: "0.75rem", position: "relative", transition: "all 0.3s ease" }} className="card-hover">
                  {plan.popular && (
                    <div style={{ position: "absolute", top: "-1rem", left: "50%", transform: "translateX(-50%)", background: "#c41e1e", color: "white", fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", padding: "0.5rem 1rem", borderRadius: "0.5rem", textTransform: "uppercase", zIndex: 10 }}>
                      Most Popular
                    </div>
                  )}
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", color: "white" }}>
                    {plan.name}
                  </h3>
                  <div style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "0.5rem", color: "white" }}>
                    {plan.price}
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
                    {plan.period}
                  </p>
                  <div style={{ width: "2rem", height: "0.25rem", background: "#c41e1e", borderRadius: "9999px", marginBottom: "1.5rem" }} />
                  <ul style={{ listStyle: "none", marginBottom: "2rem" }}>
                    {plan.features.map((feature, j) => (
                      <li key={j} style={{ fontSize: "0.95rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#d1d5db" }}>
                        <span style={{ color: "#c41e1e", fontWeight: "bold" }}>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => router.push('/signup')} className="btn-primary" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem", background: plan.popular ? "#c41e1e" : "transparent", border: plan.popular ? "none" : "2px solid #c41e1e", color: plan.popular ? "white" : "#c41e1e" }}>
                    GET STARTED
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT / LOCATIONS ── */}
        <section className="ppla-section" style={{ background: "#0a0a0a" }} id="about">
          <div className="max-w-7xl mx-auto">
            <div className="ppla-header">
              <div className="ppla-divider" />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Our <span style={{ color: "#c41e1e" }}>Location</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "56rem", margin: "0 auto" }}>
              <div style={{ padding: "2rem", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "0.75rem", textAlign: "center" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", color: "#c41e1e" }}>
                  Xentric Lomas
                </h3>
                <p style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#9ca3af", marginBottom: "1.5rem" }}>
                  Xentric Lomas Norte<br />
                  El Campanario, Lcl 211<br />
                  Querétaro, Querétaro 76000<br />
                  Mexico
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <a href="tel:+5213318373447" style={{ color: "#c41e1e", textDecoration: "none", fontWeight: "600", fontSize: "0.875rem" }}>
                    +52 1 33 1837 3447
                  </a>
                  <a href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg==" target="_blank" rel="noopener noreferrer" style={{ color: "#c41e1e", textDecoration: "none", fontWeight: "600", fontSize: "0.875rem" }}>
                    @jj_lagree_experience
                  </a>
                </div>
              </div>

              <div style={{ padding: "2rem", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "0.75rem", textAlign: "center" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", color: "#c41e1e" }}>
                  Hours
                </h3>
                <div style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#9ca3af" }}>
                  <p style={{ marginBottom: "0.75rem" }}><strong>Monday - Friday</strong><br />6:00 AM - 8:00 PM</p>
                  <p style={{ marginBottom: "0.75rem" }}><strong>Saturday</strong><br />7:00 AM - 6:00 PM</p>
                  <p><strong>Sunday</strong><br />Closed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COACH SECTION ── */}
        <section className="ppla-section" style={{ background: "#1a1a1a" }}>
          <div className="max-w-7xl mx-auto">
            <div className="ppla-header">
              <div className="ppla-divider" />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Meet Your <span style={{ color: "#c41e1e" }}>Coach</span>
              </h2>
            </div>

            <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "2.5rem", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "0.75rem" }} className="card-hover">
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem", alignItems: "start" }}>
                <div style={{ width: "200px", height: "200px", position: "relative", borderRadius: "0.5rem", border: "2px solid #c41e1e", overflow: "hidden" }}>
                  <Image src="/images/coach-javi.jpeg" alt="Coach Javi" fill className="object-cover object-top" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", color: "white" }}>
                    Javi Coach
                  </h3>
                  <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c41e1e", marginBottom: "1rem" }}>
                    Certified Lagree Instructor
                  </p>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#d1d5db", marginBottom: "1.5rem" }}>
                    Passionate about helping every client unlock their potential on the Megaformer. Certified in Lagree methodology with 5+ years of fitness coaching experience. Specializes in form, progression, and making every class challenging yet accessible for all fitness levels.
                  </p>
                  <p style={{ fontSize: "0.875rem", fontStyle: "italic", color: "#9ca3af" }}>
                    "My goal is to make you fall in love with the process, not just the results. Trust it, and transformation follows."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT SECTION ── */}
        <section className="ppla-section" style={{ background: "#0a0a0a" }} id="contact">
          <div className="max-w-7xl mx-auto">
            <div className="ppla-header">
              <div className="ppla-divider" />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Get in <span style={{ color: "#c41e1e" }}>Touch</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start", maxWidth: "56rem", margin: "0 auto" }}>
              {/* Contact Info */}
              <div>
                <div style={{ marginBottom: "2rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c41e1e", marginBottom: "0.75rem" }}>
                    LOCATION
                  </p>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#d1d5db" }}>
                    Xentric Lomas Norte<br />
                    El Campanario, Lcl 211<br />
                    Querétaro, Querétaro 76000<br />
                    Mexico
                  </p>
                </div>
                <div style={{ marginBottom: "2rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c41e1e", marginBottom: "0.75rem" }}>
                    PHONE
                  </p>
                  <a href="tel:+5213318373447" style={{ fontSize: "0.95rem", color: "#d1d5db", textDecoration: "none", fontWeight: "600" }}>
                    +52 1 33 1837 3447
                  </a>
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c41e1e", marginBottom: "0.75rem" }}>
                    FOLLOW US
                  </p>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <a href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg==" target="_blank" rel="noopener noreferrer" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "0.875rem", fontWeight: "600" }}>
                      Instagram
                    </a>
                    <a href="https://wa.me/5213318373447" target="_blank" rel="noopener noreferrer" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "0.875rem", fontWeight: "600" }}>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }} onSubmit={async (e) => {
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                    required
                    className="form-input"
                    style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", borderRadius: "0.5rem" }}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                    className="form-input"
                    style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", borderRadius: "0.5rem" }}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  required
                  className="form-input"
                  style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", borderRadius: "0.5rem" }}
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  required
                  className="form-input"
                  style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", borderRadius: "0.5rem", resize: "none" }}
                />
                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="btn-primary"
                  style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem" }}
                >
                  {formState === "loading" ? "SENDING..." : "SEND MESSAGE"}
                </button>

                {formState === "success" && (
                  <div style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", textAlign: "center", borderRadius: "0.5rem", border: "1px solid rgba(196, 30, 30, 0.5)", background: "rgba(196, 30, 30, 0.1)", color: "#c41e1e" }}>
                    ✓ Message sent! We'll get back to you soon.
                  </div>
                )}
                {formState === "error" && (
                  <div style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", textAlign: "center", borderRadius: "0.5rem", border: "1px solid #3a3a3a", background: "#2a2a2a", color: "#9ca3af" }}>
                    Something went wrong. Please try again.
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="ppla-section" style={{ background: "linear-gradient(135deg, #2a0a0a 0%, #0a0a0a 50%, #2a0a0a 100%)", position: "relative" }}>
          <div style={{ position: "absolute", inset: "0", opacity: "0.2", background: "radial-gradient(ellipse at 50% 50%, rgba(196, 30, 30, 0.2), transparent)" }} />
          <div style={{ position: "relative", zIndex: "10", maxWidth: "56rem", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              Ready to <span style={{ color: "#c41e1e" }}>Transform?</span>
            </h2>
            <p style={{ fontSize: "1.125rem", lineHeight: "1.8", color: "#d1d5db", marginBottom: "2rem" }}>
              Your first class is free. No commitment, just trust the process and see what happens.
            </p>
            <button onClick={() => router.push('/signup')} className="btn-primary px-12 py-5 rounded-lg text-sm">
              BOOK YOUR FREE CLASS
            </button>
            <p style={{ fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.3em", marginTop: "2rem", textTransform: "uppercase", color: "#c41e1e" }}>
              ✦ TRUST THE PROCESS ✦
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#0a0a0a", borderTop: "1px solid rgba(196, 30, 30, 0.2)", padding: "3rem 1.5rem" }}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            <span style={{ fontSize: "1.25rem", fontWeight: "900", letterSpacing: "0.15em", textTransform: "uppercase", color: "white" }}>
              JJ<span style={{ color: "#c41e1e" }}>Studio</span>
            </span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b7280" }}>
                Premium Lagree Megaformer Studio in Querétaro
              </p>
              <span style={{ color: "#3f444c" }}>|</span>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Trust the Process</p>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#3f444c" }}>© 2024 JJ Studio. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  )
}