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
        <meta name="description" content="JJ Studio - Premium Lagree Megaformer fitness studio in Querétaro. Trust the Process." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      </Head>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body, html {
          background: #0a0a0a;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }

        .btn-primary {
          background: #c41e1e;
          color: white;
          transition: all 0.3s ease;
          border: 2px solid #c41e1e;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 0.1em;
          padding: 1rem 2rem;
          border-radius: 0;
          font-size: 0.75rem;
        }

        .btn-primary:hover {
          background: #690606;
          border-color: #690606;
          box-shadow: 0 10px 25px rgba(196, 30, 30, 0.3);
        }

        .btn-secondary {
          border: 2px solid #c41e1e;
          background: transparent;
          color: #c41e1e;
          transition: all 0.3s ease;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 0.1em;
          padding: 1rem 2rem;
          border-radius: 0;
          font-size: 0.75rem;
        }

        .btn-secondary:hover {
          background: #c41e1e;
          color: white;
        }

        .nav-link {
          transition: all 0.3s ease;
          color: #d1d5db;
          cursor: pointer;
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
        }

        .nav-link:hover {
          color: #c41e1e;
        }

        .social-icon {
          transition: all 0.3s ease;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #9ca3af;
        }

        .social-icon:hover {
          color: #c41e1e;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <main style={{ background: "#0a0a0a" }}>

        {/* ── NAVBAR ── */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: scrolled ? "rgba(10, 10, 10, 0.98)" : "rgba(10, 10, 10, 0.90)", borderBottom: scrolled ? "1px solid rgba(196, 30, 30, 0.2)" : "none", transition: "all 0.3s" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo */}
            <span style={{ fontSize: "0.875rem", fontWeight: "900", letterSpacing: "0.1em", textTransform: "uppercase", color: "white" }}>
              JJ<span style={{ color: "#c41e1e" }}>STUDIO</span>
            </span>

            {/* Desktop Nav */}
            <div style={{ display: "none" }} className="lg:flex lg:items-center lg:gap-8">
              {["SCHEDULE", "PACKAGES", "ABOUT", "CONTACT"].map((label) => (
                <a key={label} href={`#${label.toLowerCase()}`} className="nav-link">
                  {label}
                </a>
              ))}
            </div>

            {/* Right Side - Socials + Auth */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.75rem" }}>
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
              </div>

              {!isLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {user ? (
                    <>
                      <button onClick={() => router.push('/dashboard/client')} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.625rem" }}>PROFILE</button>
                      <button onClick={handleLogout} className="nav-link" style={{ fontSize: "0.625rem" }}>LOGOUT</button>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="nav-link" style={{ fontSize: "0.625rem" }}>LOGIN</a>
                      <a href="/signup" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.625rem" }}>SIGN UP</a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ── HERO SECTION - PPLA STYLE WITH IMAGE ON RIGHT ── */}
        <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: "80px" }}>
          {/* Background Image - Right Side */}
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "55%", background: "linear-gradient(135deg, rgba(10, 10, 10, 0.7) 0%, rgba(106, 6, 6, 0.3) 100%)" }}>
            <Image
              src="/images/hero-megaformer.jpg"
              alt="JJ Studio Megaformer Class"
              fill
              priority
              className="object-cover object-center"
              style={{ objectPosition: "center" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0a0a0a 0%, transparent 30%, rgba(10, 10, 10, 0.5) 100%)" }} />
          </div>

          {/* Content - Left Side */}
          <div style={{ position: "relative", zIndex: 10, maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem", width: "100%", maxWidth: "60%" }}>
            <div>
              {/* Label */}
              <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.3em", marginBottom: "1rem", textTransform: "uppercase", color: "#c41e1e" }}>
                MEGAFORMER WORKOUT
              </p>

              {/* Subheading */}
              <p style={{ fontSize: "1.125rem", fontWeight: "700", letterSpacing: "0.1em", marginBottom: "1.5rem", textTransform: "uppercase", color: "#9ca3af" }}>
                LAGREE FITNESS
              </p>

              {/* Main Headline */}
              <h1 style={{ fontSize: "clamp(2rem, 8vw, 5.5rem)", fontWeight: "900", letterSpacing: "-0.02em", lineHeight: "1.2", marginBottom: "2rem", textTransform: "uppercase" }}>
                <span style={{ color: "white" }}>STRENGTH,</span>
                <br />
                <span style={{ color: "#c41e1e" }}>EVOLVED.</span>
                <br />
                <span style={{ color: "white" }}>LAGREE</span>
                <br />
                <span style={{ color: "#c41e1e" }}>QUERÉTARO</span>
              </h1>

              {/* Description */}
              <p style={{ fontSize: "1rem", fontWeight: "400", lineHeight: "1.8", marginBottom: "2.5rem", maxWidth: "500px", color: "#d1d5db" }}>
                Welcome to JJ Studio, a Lagree-inspired workout studio that combines <span style={{ color: "#c41e1e" }}>strength, endurance, cardio, balance,</span> and flexibility in each and every move.
              </p>

              {/* CTA Button */}
              <button onClick={() => router.push('/signup')} className="btn-primary">
                BOOK YOUR FIRST CLASS
              </button>

              {/* Motto */}
              <p style={{ fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.3em", marginTop: "3rem", textTransform: "uppercase", color: "#c41e1e" }}>
                ✦ TRUST THE PROCESS ✦
              </p>
            </div>
          </div>
        </section>

        {/* ── HOW WE DO IT SECTION ── */}
        <section style={{ padding: "6rem 1.5rem", background: "#1a1a1a" }} id="schedule">
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c41e1e", marginBottom: "1rem" }}>
                HOW WE DO IT
              </p>
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                <span style={{ color: "#c41e1e" }}>MEGABURNBURN 45</span> is our signature class
              </h2>
            </div>

            <div style={{ maxWidth: "800px", margin: "0 auto 3rem" }}>
              <p style={{ fontSize: "1.125rem", lineHeight: "1.8", color: "#d1d5db", marginBottom: "1.5rem" }}>
                Our signature class on the Megaformer that provides you with a <span style={{ color: "#c41e1e" }}>total-body high intensity, low impact workout,</span> combining cardio and strength training to help improve endurance, flexibility and overall strength.
              </p>
              <p style={{ fontSize: "1.125rem", lineHeight: "1.8", color: "#d1d5db" }}>
                <span style={{ color: "#c41e1e" }}>The lights are low, the music is high.</span> This 45 minute class is for all fitness levels, and our signature moves can be amplified or modified to accommodate your individual goals.
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <a href="#packages" className="btn-secondary">
                SEE OUR PACKAGES
              </a>
            </div>
          </div>
        </section>

        {/* ── THE PERFECT MACHINE ── */}
        <section style={{ padding: "6rem 1.5rem", background: "#0a0a0a" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                The <span style={{ color: "#c41e1e" }}>PERFECT MACHINE</span>
              </h2>
            </div>

            <div style={{ maxWidth: "800px", margin: "0 auto 3rem" }}>
              <p style={{ fontSize: "1.125rem", lineHeight: "1.8", color: "#d1d5db", marginBottom: "1.5rem" }}>
                The workout is done on the one of a kind <span style={{ color: "#c41e1e" }}>Megaformer™</span> which provides <span style={{ color: "#c41e1e" }}>constant resistance</span> and allow for continuous tension targeting your slow twitch muscle fibers while providing infinitely more exercise options than a traditional reformer.
              </p>
              <p style={{ fontSize: "1.125rem", lineHeight: "1.8", color: "#d1d5db" }}>
                The Megaformer™ allows you to transition quickly and smoothly from each move while continuing to increase the heart rate and get the blood pumping.
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={() => document.getElementById('schedule').scrollIntoView({ behavior: 'smooth' })} className="btn-primary">
                VIEW OUR SCHEDULES
              </button>
            </div>
          </div>
        </section>

        {/* ── CLASSES GRID ── */}
        <section style={{ padding: "6rem 1.5rem", background: "#1a1a1a" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ width: "4rem", height: "0.25rem", background: "linear-gradient(to right, #c41e1e, #690606)", margin: "0 auto 1.5rem", borderRadius: "9999px" }} />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Our <span style={{ color: "#c41e1e" }}>CLASSES</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
              {[
                { name: "MegaBurn 45", level: "All Levels", duration: "45 min", desc: "Full-body strength + endurance on the Megaformer. Lights low, music high, results guaranteed." },
                { name: "Core Focus", level: "Intermediate", duration: "45 min", desc: "Deep core work targeting abs, obliques, and lower back. Build stability and definition." },
                { name: "Power Sculpt", level: "Advanced", duration: "45 min", desc: "High-intensity muscle-building on the Megaformer. Upper body, lower body, repeat." },
              ].map((cls, i) => (
                <div key={i} style={{ padding: "2rem", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "0", transition: "all 0.3s", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#690606"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(196, 30, 30, 0.2)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3a3a3a"; e.currentTarget.style.boxShadow = "none"; }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem", color: "white" }}>
                    {cls.name}
                  </h3>
                  <p style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", color: "#9ca3af" }}>
                    {cls.level} • {cls.duration}
                  </p>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#9ca3af" }}>
                    {cls.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ padding: "6rem 1.5rem", background: "#0a0a0a" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ width: "4rem", height: "0.25rem", background: "linear-gradient(to right, #c41e1e, #690606)", margin: "0 auto 1.5rem", borderRadius: "9999px" }} />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Join Our <span style={{ color: "#c41e1e" }}>COMMUNITY</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
              {[
                { name: "María G.", quote: "I've been training for 2 months and my posture is completely different. Trust the Process works!" },
                { name: "Carlos M.", quote: "45 minutes of pure intensity. Low-impact and tough. Already seeing definition." },
                { name: "Jessica R.", quote: "The community here is unreal. Premium experience, amazing results." },
              ].map((test, i) => (
                <div key={i} style={{ padding: "2rem", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "0", transition: "all 0.3s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#690606"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(196, 30, 30, 0.2)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3a3a3a"; e.currentTarget.style.boxShadow = "none"; }}>
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
        <section style={{ padding: "6rem 1.5rem", background: "#1a1a1a" }} id="packages">
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ width: "4rem", height: "0.25rem", background: "linear-gradient(to right, #c41e1e, #690606)", margin: "0 auto 1.5rem", borderRadius: "9999px" }} />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Membership <span style={{ color: "#c41e1e" }}>PLANS</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
              {[
                { name: "STARTER", price: "$499", period: "per month", classes: "4 classes/month", popular: false },
                { name: "UNLIMITED", price: "$899", period: "per month", classes: "Unlimited classes", popular: true },
                { name: "PACK 10", price: "$1,200", period: "10 classes", classes: "Valid 3 months", popular: false },
              ].map((plan, i) => (
                <div key={i} style={{ padding: "2rem", background: plan.popular ? "rgba(196, 30, 30, 0.1)" : "#2a2a2a", border: `2px solid ${plan.popular ? "#c41e1e" : "#3a3a3a"}`, borderRadius: "0", position: "relative", transition: "all 0.3s" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(196, 30, 30, 0.2)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
                  {plan.popular && (
                    <div style={{ position: "absolute", top: "-1rem", left: "50%", transform: "translateX(-50%)", background: "#c41e1e", color: "white", fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", padding: "0.5rem 1rem", textTransform: "uppercase" }}>
                      MOST POPULAR
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
                  <div style={{ width: "2rem", height: "0.25rem", background: "#c41e1e", marginBottom: "1.5rem", borderRadius: "9999px" }} />
                  <p style={{ fontSize: "0.95rem", marginBottom: "2rem", color: "#d1d5db" }}>
                    {plan.classes}
                  </p>
                  <button onClick={() => router.push('/signup')} className="btn-primary" style={{ width: "100%", background: plan.popular ? "#c41e1e" : "transparent", border: plan.popular ? "none" : "2px solid #c41e1e", color: plan.popular ? "white" : "#c41e1e" }}>
                    GET STARTED
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section style={{ padding: "6rem 1.5rem", background: "#0a0a0a" }} id="contact">
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ width: "4rem", height: "0.25rem", background: "linear-gradient(to right, #c41e1e, #690606)", margin: "0 auto 1.5rem", borderRadius: "9999px" }} />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Get in <span style={{ color: "#c41e1e" }}>TOUCH</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", maxWidth: "900px", margin: "0 auto" }}>
              {/* Contact Info */}
              <div>
                <div style={{ marginBottom: "2rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c41e1e", marginBottom: "0.75rem" }}>
                    LOCATION
                  </p>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#d1d5db" }}>
                    Xentric Lomas Norte<br />
                    El Campanario, Lcl 211<br />
                    Querétaro, Querétaro 76000
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
                    FOLLOW
                  </p>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <a href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg==" target="_blank" rel="noopener noreferrer" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "0.875rem", fontWeight: "600" }}>
                      INSTAGRAM
                    </a>
                    <a href="https://wa.me/5213318373447" target="_blank" rel="noopener noreferrer" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "0.875rem", fontWeight: "600" }}>
                      WHATSAPP
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
                  <input type="text" placeholder="First Name" value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} required style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "0", color: "white" }} />
                  <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "0", color: "white" }} />
                </div>
                <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "0", color: "white" }} />
                <textarea placeholder="Message" rows={4} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} required style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", background: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "0", color: "white", resize: "none" }} />
                <button type="submit" disabled={formState === "loading"} className="btn-primary">
                  {formState === "loading" ? "SENDING..." : "SEND"}
                </button>
                {formState === "success" && <div style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "center", border: "1px solid rgba(196, 30, 30, 0.5)", background: "rgba(196, 30, 30, 0.1)", color: "#c41e1e" }}>✓ Message sent!</div>}
              </form>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#0a0a0a", borderTop: "1px solid rgba(196, 30, 30, 0.2)", padding: "3rem 1.5rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: "2rem", textAlign: "center" }}>
            <span style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "0.15em", textTransform: "uppercase", color: "white" }}>
              JJ<span style={{ color: "#c41e1e" }}>STUDIO</span>
            </span>
            <p style={{ fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b7280" }}>
              Premium Lagree Megaformer Studio in Querétaro | Trust the Process
            </p>
            <p style={{ fontSize: "0.75rem", color: "#3f444c" }}>© 2024 JJ Studio</p>
          </div>
        </footer>
      </main>
    </>
  )
}