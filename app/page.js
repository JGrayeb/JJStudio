// app/page.js

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
  const [knowUsMenuOpen, setKnowUsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", message: "" })
  const [formState, setFormState] = useState("idle")
  const [instaPosts, setInstaPosts] = useState([])
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

  // Fetch Instagram posts via backend
  useEffect(() => {
    const fetchInstaPosts = async () => {
      try {
        const res = await fetch("/api/instagram-posts")
        const data = await res.json()
        if (data.posts) {
          setInstaPosts(data.posts.slice(0, 4)) // Get last 4 posts
        }
      } catch (err) {
        console.error('Instagram fetch error:', err)
        // Fallback: use placeholder data
        setInstaPosts([
          { id: 1, image: "/images/insta-1.jpg", caption: "Strong is beautiful 💪", likes: 234 },
          { id: 2, image: "/images/insta-2.jpg", caption: "MegaBurn 45 never fails 🔥", likes: 456 },
          { id: 3, image: "/images/insta-3.jpg", caption: "Trust the Process ✦", likes: 389 },
          { id: 4, image: "/images/insta-4.jpg", caption: "Transform with us 🎯", likes: 512 },
        ])
      }
    }
    fetchInstaPosts()
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

  const handleBooking = (e) => {
    e?.preventDefault()
    if (user) {
      router.push('/dashboard/client')
    } else {
      router.push('/login')
    }
  }

  return (
    <>
<Head>
  <meta name="google-site-verification" content="vt3rCHU-eHRf3gB8K1ReR1udBbBYtCp7H1HHGHQ67fI" />
  <title>{t.title}</title>
  <meta name="description" content={t.description} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href="https://jjstudio.mx" />
  {/* Open Graph */}
  <meta property="og:title" content={t.title} />
  <meta property="og:description" content={t.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://jjstudio.mx" />
  <meta property="og:site_name" content="JJ Studio" />
  <meta property="og:locale" content={lang === 'es' ? 'es_MX' : 'en_US'} />
  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={t.title} />
  <meta name="twitter:description" content={t.description} />
  {/* JSON-LD LocalBusiness */}
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FitnessCenter",
    "name": "JJ Studio Lagree",
    "description": t.description,
    "url": "https://jjstudio.mx",
    "telephone": "+52 1 33 1837 3447",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Xentric Lomas Norte, El Campanario, Lcl 211",
      "addressLocality": "Querétaro",
      "addressRegion": "Querétaro",
      "postalCode": "76000",
      "addressCountry": "MX"
    },
    "sameAs": [
      "https://www.instagram.com/jj_lagree_experience",
      "https://wa.me/5213318373447"
    ]
  }) }} />
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

        .submenu {
          position: absolute;
          top: 100%;
          left: 0;
          background: rgba(10, 10, 10, 0.98);
          border: 1px solid rgba(196, 30, 30, 0.2);
          border-top: none;
          min-width: 200px;
          padding: 0.5rem 0;
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }

        .submenu.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .submenu-item {
          display: block;
          padding: 0.75rem 1rem;
          color: #d1d5db;
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .submenu-item:hover {
          background: rgba(196, 30, 30, 0.1);
          color: #c41e1e;
          padding-left: 1.5rem;
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
            <a href="/" style={{ fontSize: "0.875rem", fontWeight: "900", letterSpacing: "0.1em", textTransform: "uppercase", color: "white", textDecoration: "none" }}>
              JJ<span style={{ color: "#c41e1e" }}>STUDIO</span>
            </a>

            {/* Desktop Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }} className="lg:flex lg:items-center lg:gap-8">
              <a href="/" className="nav-link" style={{ textDecoration: "none" }}>HOME</a>
              
              {/* Know Us Dropdown */}
              <div style={{ position: "relative" }} 
                onMouseEnter={() => setKnowUsMenuOpen(true)}
                onMouseLeave={() => setKnowUsMenuOpen(false)}>
                <button 
                  className="nav-link" 
                  style={{ textDecoration: "none", background: "none", border: "none", padding: 0 }}
                  onClick={() => setKnowUsMenuOpen(!knowUsMenuOpen)}
                >
                  KNOW US ▼
                </button>
                <div className={`submenu ${knowUsMenuOpen ? 'open' : ''}`}>
                  <a href="/about-us" className="submenu-item">About Us</a>
                  <a href="/about-lagree" className="submenu-item">About Lagree</a>
                </div>
              </div>

              <a href="#packages" className="nav-link" style={{ textDecoration: "none" }}>PACKAGES</a>
              <a href="#contact" className="nav-link" style={{ textDecoration: "none" }}>CONTACT</a>
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
                  <button onClick={handleBooking} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.625rem" }}>
                    BOOKINGS
                  </button>
                  {user ? (
                    <>
                      <button onClick={() => router.push('/dashboard/client')} className="nav-link" style={{ fontSize: "0.625rem", background: "none", border: "none", padding: 0 }}>PROFILE</button>
                      <button onClick={handleLogout} className="nav-link" style={{ fontSize: "0.625rem", background: "none", border: "none", padding: 0 }}>LOGOUT</button>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="nav-link" style={{ fontSize: "0.625rem", textDecoration: "none" }}>LOGIN</a>
                      <a href="/signup" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.625rem", textDecoration: "none" }}>SIGN UP</a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ── HERO SECTION - PPLA STYLE ── */}
        <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: "80px" }}>
          {/* Background Image - Right Side */}
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "55%", background: "linear-gradient(135deg, rgba(10, 10, 10, 0.7) 0%, rgba(106, 6, 6, 0.3) 100%)" }}>
            <Image
             src="/images/hero-megaformer.jpg"
              alt="JJ Studio Megaformer Class"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
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
                <span style={{ color: "white" }}>TRUST,</span>
                <br />
                <span style={{ color: "#c41e1e" }}>THE</span>
                <br />
                <span style={{ color: "white" }}>PROCESS</span>
                <br />
                <span style={{ color: "#c41e1e" }}>LAGREE</span>
              </h1>

              {/* Description */}
              <p style={{ fontSize: "1rem", fontWeight: "400", lineHeight: "1.8", marginBottom: "2.5rem", maxWidth: "500px", color: "#d1d5db" }}>
                Welcome to JJ Studio, a Lagree-inspired workout studio that combines <span style={{ color: "#c41e1e" }}>strength, endurance, cardio, balance,</span> and flexibility in each and every move.
              </p>

              {/* CTA Button */}
              <button onClick={handleBooking} className="btn-primary">
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
                <span style={{ color: "#c41e1e" }}>MEGABURN 45</span> is our signature class
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
              <button onClick={handleBooking} className="btn-primary">
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

        {/* ── INSTAGRAM FEED ── */}
        <section style={{ padding: "6rem 1.5rem", background: "#1a1a1a" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ width: "4rem", height: "0.25rem", background: "linear-gradient(to right, #c41e1e, #690606)", margin: "0 auto 1.5rem", borderRadius: "9999px" }} />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Follow Our <span style={{ color: "#c41e1e" }}>JOURNEY</span>
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#9ca3af", marginTop: "1rem" }}>
                @jj_lagree_experience
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
              {instaPosts.map((post, i) => (
                <a
                  key={i}
                  href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ position: "relative", overflow: "hidden", aspectRatio: "1", cursor: "pointer", group: "true" }}
                  onMouseEnter={(e) => { e.currentTarget.querySelector('img').style.transform = "scale(1.05)"; e.currentTarget.querySelector('.overlay').style.opacity = "1"; }}
                  onMouseLeave={(e) => { e.currentTarget.querySelector('img').style.transform = "scale(1)"; e.currentTarget.querySelector('.overlay').style.opacity = "0"; }}
                >
                  <Image
                  src={post.image}
                  alt={post.caption}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                  />
                  <div
                    className="overlay"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(135deg, rgba(196, 30, 30, 0.8) 0%, rgba(106, 6, 6, 0.9) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                      zIndex: 10
                    }}
                  >
                    <div style={{ textAlign: "center", color: "white" }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="white" style={{ margin: "0 auto 0.5rem" }}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <p style={{ fontSize: "0.75rem", fontWeight: "700" }}>{post.likes} Likes</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <a href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg==" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                FOLLOW US ON INSTAGRAM
              </a>
            </div>
          </div>
        </section>

        {/* ── PACKAGES ── */}
        <section style={{ padding: "6rem 1.5rem", background: "#0a0a0a" }} id="packages">
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div style={{ width: "4rem", height: "0.25rem", background: "linear-gradient(to right, #c41e1e, #690606)", margin: "0 auto 1.5rem", borderRadius: "9999px" }} />
              <h2 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Pricing <span style={{ color: "#c41e1e" }}>PLANS</span>
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#9ca3af", marginTop: "1rem", maxWidth: "600px", margin: "1rem auto 0" }}>
                All packages include access to our full class schedule. Beverage points expire 30 days after purchase.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
              {[
                {
                  name: "1 CLASS",
                  price: "$370",
                  points: "1 point",
                  expiration: "5 days",
                  beverage: "0 beverage points",
                  popular: false
                },
                {
                  name: "10 CLASSES",
                  price: "$3,300",
                  points: "10 points",
                  expiration: "14 days",
                  beverage: "0 beverage points",
                  popular: true
                },
                {
                  name: "24 CLASSES",
                  price: "$7,200",
                  points: "24 points",
                  expiration: "30 days",
                  beverage: "0 beverage points",
                  popular: false
                },
                {
                  name: "UNLIMITED",
                  price: "$8,000",
                  points: "Unlimited",
                  expiration: "30 days",
                  beverage: "2 beverage points",
                  popular: false
                },
              ].map((plan, i) => (
                <div key={i} style={{ padding: "2rem", background: plan.popular ? "rgba(196, 30, 30, 0.1)" : "#1a1a1a", border: `2px solid ${plan.popular ? "#c41e1e" : "#3a3a3a"}`, borderRadius: "0", position: "relative", transition: "all 0.3s" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(196, 30, 30, 0.2)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
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
                  <div style={{ width: "2rem", height: "0.25rem", background: "#c41e1e", marginBottom: "1.5rem", borderRadius: "9999px" }} />
                  <ul style={{ listStyle: "none", marginBottom: "2rem" }}>
                    <li style={{ fontSize: "0.95rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#d1d5db" }}>
                      <span style={{ color: "#c41e1e", fontWeight: "bold" }}>✓</span> {plan.points}
                    </li>
                    <li style={{ fontSize: "0.95rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#d1d5db" }}>
                      <span style={{ color: "#c41e1e", fontWeight: "bold" }}>✓</span> Expires in {plan.expiration}
                    </li>
                    <li style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#d1d5db" }}>
                      <span style={{ color: "#c41e1e", fontWeight: "bold" }}>✓</span> {plan.beverage}
                    </li>
                  </ul>
                  <button onClick={handleBooking} className="btn-primary" style={{ width: "100%", background: plan.popular ? "#c41e1e" : "transparent", border: plan.popular ? "none" : "2px solid #c41e1e", color: plan.popular ? "white" : "#c41e1e" }}>
                    BUY NOW
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section style={{ padding: "6rem 1.5rem", background: "#1a1a1a" }} id="contact">
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
                <div style={{ marginBottom: "2rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c41e1e", marginBottom: "0.75rem" }}>
                    EMAIL
                  </p>
                  <a href="mailto:administracion@jjstudio.mx" style={{ fontSize: "0.95rem", color: "#d1d5db", textDecoration: "none", fontWeight: "600" }}>
                    administracion@jjstudio.mx
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

        {/* ── FINAL CTA ── */}
        <section style={{ padding: "6rem 1.5rem", background: "linear-gradient(135deg, #2a0a0a 0%, #0a0a0a 50%, #2a0a0a 100%)", position: "relative" }}>
          <div style={{ position: "absolute", inset: "0", opacity: "0.2", background: "radial-gradient(ellipse at 50% 50%, rgba(196, 30, 30, 0.2), transparent)" }} />
          <div style={{ position: "relative", zIndex: 10, maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              Ready to <span style={{ color: "#c41e1e" }}>TRANSFORM?</span>
            </h2>
            <p style={{ fontSize: "1.125rem", lineHeight: "1.8", color: "#d1d5db", marginBottom: "2rem" }}>
              Your first class is free. No commitment, just trust the process and see what happens.
            </p>
            <button onClick={handleBooking} className="btn-primary">
              BOOK YOUR FREE CLASS
            </button>
            <p style={{ fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.3em", marginTop: "2rem", textTransform: "uppercase", color: "#c41e1e" }}>
              ✦ TRUST THE PROCESS ✦
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#0a0a0a", borderTop: "1px solid rgba(196, 30, 30, 0.2)", padding: "3rem 1.5rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: "2rem", textAlign: "center" }}>
            <a href="/" style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "0.15em", textTransform: "uppercase", color: "white", textDecoration: "none" }}>
              JJ<span style={{ color: "#c41e1e" }}>STUDIO</span>
            </a>
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