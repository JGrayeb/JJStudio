
"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { content } from "./lib/i18n"
import { Calendar, Package, Droplet, Users, Zap, ArrowRight } from "lucide-react"

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

  // ✅ FIXED: Proper navigation handlers
  const handleScheduleClick = (e) => {
    e?.preventDefault()
    if (user) {
      router.push('/dashboard/client?tab=book')
    } else {
      router.push('/login')
    }
  }

  const handlePackageClick = (e) => {
    e?.preventDefault()
    if (user) {
      router.push('/dashboard/client?tab=packages')
    } else {
      router.push('/signup')
    }
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
    <main className="bg-black text-white overflow-x-hidden" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/95 shadow-lg shadow-red-900/30 border-b border-red-900/20" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="font-black text-2xl tracking-tight">
              <span className="text-white">JJ</span>
              <span className="text-red-600 ml-1">STUDIO</span>
            </div>
            <Zap size={24} className="text-red-600 group-hover:scale-110 transition-transform" />
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {[
              ["#home", t.nav.home],
              ["#schedule", t.nav.schedule],
              ["#packages", t.nav.packages],
              ["#about", t.nav.about],
              ["#contact", t.nav.contact],
            ].map(([href, label], idx) => (
              <button key={href}
                onClick={(e) => {
                  if (idx === 1) handleScheduleClick(e)
                  else if (idx === 2) handlePackageClick(e)
                  else {
                    e.preventDefault()
                    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="text-sm font-bold uppercase tracking-wide text-gray-300 hover:text-red-500 transition-colors relative group"
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          {/* Right side - Auth buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button onClick={toggleLang} className="flex items-center gap-2 px-3 py-1 rounded-lg border border-red-900/30 hover:border-red-600 transition-colors text-xs font-bold uppercase">
              {lang === "en" ? "ES" : "EN"}
            </button>

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleProfileClick}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-sm px-6 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-red-600/50"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-red-500 font-bold uppercase text-xs transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <a href="/login"
                      className="text-gray-400 hover:text-white font-bold uppercase text-sm transition-colors">
                      Login
                    </a>
                    <a href="/signup"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase px-6 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-red-600/50">
                      Start Free
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
            <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden bg-black/95 border-t border-red-900/20 overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-screen py-6" : "max-h-0"}`}>
          <div className="flex flex-col px-6 gap-4">
            <button onClick={(e) => { handleScheduleClick(e); setMenuOpen(false) }} className="text-sm font-bold uppercase text-gray-300 hover:text-red-500 text-left">
              {t.nav.schedule}
            </button>
            <button onClick={(e) => { handlePackageClick(e); setMenuOpen(false) }} className="text-sm font-bold uppercase text-gray-300 hover:text-red-500 text-left">
              {t.nav.packages}
            </button>
            <button onClick={(e) => { handleAboutClick(e); setMenuOpen(false) }} className="text-sm font-bold uppercase text-gray-300 hover:text-red-500 text-left">
              {t.nav.about}
            </button>
            <button onClick={() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }} className="text-sm font-bold uppercase text-gray-300 hover:text-red-500 text-left">
              {t.nav.contact}
            </button>
            
            <div className="border-t border-red-900/20 pt-4 space-y-3">
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <button onClick={() => { handleProfileClick(); setMenuOpen(false) }} className="w-full bg-red-600 text-white font-bold uppercase text-sm py-2 rounded-lg">
                        Dashboard
                      </button>
                      <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="w-full text-gray-400 hover:text-red-500 font-bold uppercase text-sm py-2">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="block bg-red-900/20 border border-red-900 text-white font-bold uppercase text-sm py-2 text-center rounded-lg">
                        Login
                      </a>
                      <a href="/signup" className="block bg-red-600 text-white font-bold uppercase text-sm py-2 text-center rounded-lg">
                        Start Free
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
      <section className="min-h-screen flex flex-col justify-center pt-20 relative overflow-hidden" id="home"
        style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #2d0a0a 50%, #0a0a0a 100%)" }}>
        <div className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(220,38,38,0.1) 0%, transparent 50%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <p className="text-red-600 font-bold uppercase tracking-widest text-sm mb-6">✦ Lagree Megaformer Training</p>
            <h1 className="font-black uppercase leading-tight mb-6"
              style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}>
              Shake, Sweat,<br />
              <span className="text-red-600">Sculpt Your Body</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mb-8 leading-relaxed">
              Low-impact, high-intensity megaformer training that delivers transformative results in just 50 minutes. Join hundreds of members who've already discovered their strength.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/signup"
                className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase px-8 py-4 rounded-lg transition-all hover:shadow-lg hover:shadow-red-600/50 flex items-center gap-2">
                Get Started <ArrowRight size={18} />
              </a>
              <button onClick={handleAboutClick}
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase px-8 py-4 rounded-lg transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs tracking-widest uppercase text-red-900">Scroll</span>
          <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
            <path d="M10 5v15M5 15l5 5 5-5" stroke="rgba(220,38,38,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ── QUICK STATS ── */}
      <section className="py-16 bg-gray-900/50 border-y border-red-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Active Members", value: "500+" },
              { icon: Zap, label: "Classes Weekly", value: "45+" },
              { icon: Calendar, label: "Est. Since", value: "2023" },
              { icon: Package, label: "Flexible Plans", value: "4 Types" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon size={32} className="text-red-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHEDULE SECTION ── */}
      <section className="py-24 bg-black" id="schedule">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-red-600 font-bold uppercase tracking-widest text-sm mb-3">📅 Book Your Spot</p>
              <h2 className="font-black uppercase leading-tight text-4xl lg:text-5xl">
                Find Your Perfect<br /><span className="text-red-600">Class Time</span>
              </h2>
            </div>
            <button onClick={handleScheduleClick} className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase px-8 py-4 rounded-lg transition-all hover:shadow-lg hover:shadow-red-600/50 flex items-center gap-2 self-start lg:self-end">
              <Calendar size={20} />
              {user ? "View Schedule" : "Sign Up to Book"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { time: "6:00 AM", class: "Full Body Blast", coach: "Javi", spots: "3" },
              { time: "9:00 AM", class: "Power Hour", coach: "Available", spots: "6" },
              { time: "12:00 PM", class: "Midday Sculpt", coach: "TBD", spots: "5" },
              { time: "6:00 PM", class: "Evening Burn", coach: "Javi", spots: "2" },
            ].map((slot, i) => (
              <div key={i} className="bg-gray-900/50 border border-red-900/30 rounded-lg p-6 hover:border-red-600 transition-all hover:shadow-lg hover:shadow-red-900/20 cursor-pointer"
                onClick={handleScheduleClick}>
                <p className="text-red-600 font-bold text-lg mb-2">{slot.time}</p>
                <h3 className="font-bold text-white text-lg mb-2">{slot.class}</h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>Coach: <span className="text-white">{slot.coach}</span></p>
                  <p>{slot.spots} spots available</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button onClick={handleScheduleClick} className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase px-12 py-4 rounded-lg transition-all inline-flex items-center gap-2">
              View Full Schedule <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ── PACKAGES SECTION ── */}
      <section className="py-24 bg-gray-950" id="packages">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-red-600 font-bold uppercase tracking-widest text-sm mb-3">💪 Pricing Plans</p>
            <h2 className="font-black uppercase leading-tight text-4xl lg:text-5xl mb-4">
              Choose Your <span className="text-red-600">Membership</span>
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">All plans include unlimited class access and flexible pause options.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { name: "Starter", price: "$99", period: "/month", classes: "4 Classes/month", popular: false },
              { name: "Active", price: "$199", period: "/month", classes: "8 Classes/month", popular: false },
              { name: "Unlimited", price: "$299", period: "/month", classes: "Unlimited Classes", popular: true },
              { name: "Annual", price: "$2,999", period: "/year", classes: "Unlimited + Perks", popular: false },
            ].map((plan, i) => (
              <div key={i}
                className={`relative p-8 rounded-lg transition-all ${plan.popular ? "bg-red-600 border-2 border-red-600 shadow-lg shadow-red-600/50 scale-105" : "bg-gray-900/50 border border-red-900/30 hover:border-red-600"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-800 text-white text-xs font-bold uppercase px-4 py-1 rounded">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xl font-bold uppercase mb-2 ${plan.popular ? "text-white" : "text-white"}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-4xl font-black ${plan.popular ? "text-white" : "text-red-600"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ml-2 ${plan.popular ? "text-red-100" : "text-gray-400"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm font-bold uppercase mb-6 ${plan.popular ? "text-red-100" : "text-gray-400"}`}>
                  {plan.classes}
                </p>
                <button onClick={handlePackageClick}
                  className={`w-full font-bold uppercase py-3 rounded-lg transition-all ${plan.popular ? "bg-white text-red-600 hover:bg-gray-100" : "border border-red-600 text-red-600 hover:bg-red-600 hover:text-white"}`}>
                  Learn More
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gray-900/50 border border-red-900/30 rounded-lg p-8 text-center">
            <p className="text-gray-300 mb-4">Not sure which plan is right for you?</p>
            <button onClick={handlePackageClick} className="text-red-600 font-bold hover:text-red-500 underline uppercase text-sm">
              Chat with our team →
            </button>
          </div>
        </div>
      </section>

      {/* ── ABOUT / WHY LAGREE ── */}
      <section className="py-24 bg-black" id="about">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <p className="text-red-600 font-bold uppercase tracking-widest text-sm mb-4">💡 Why Choose Us</p>
              <h2 className="font-black uppercase leading-tight text-4xl lg:text-5xl mb-6">
                The Lagree <span className="text-red-600">Method Works</span>
              </h2>
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed mb-8">
                <p>✦ <strong>Low-impact, high-intensity</strong> — Strengthen your entire body without joint stress</p>
                <p>✦ <strong>50 minutes, total body</strong> — Every class targets all major muscle groups</p>
                <p>✦ <strong>Visible results fast</strong> — Members report changes within 2-3 weeks</p>
                <p>✦ <strong>Supportive community</strong> — Train alongside people who share your goals</p>
              </div>
              <button onClick={handleScheduleClick} className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase px-8 py-4 rounded-lg transition-all">
                Start Your Transformation
              </button>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden border-2 border-red-900/30">
              <Image 
                src="/images/coach-javi.jpeg" 
                alt="Javi - Head Coach" 
                fill 
                className="object-cover"
              />
            </div>
          </div>

          {/* Our Coach */}
          <div className="bg-gray-900/50 border border-red-900/30 rounded-lg p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1">
                <h3 className="text-2xl font-black uppercase mb-2">Meet Your Coach</h3>
                <p className="text-red-600 font-bold uppercase text-sm">Head Instructor</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-xl font-bold uppercase mb-4">Javi Delgado</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  With 5+ years of Lagree experience and 3+ years teaching, Javi brings energy, technique, and personalized attention to every class. Whether you're just starting or pushing for PRs, Javi's got you covered.
                </p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-red-600 font-bold text-xl">500+</p>
                    <p className="text-gray-400 text-sm">Classes Led</p>
                  </div>
                  <div>
                    <p className="text-red-600 font-bold text-xl">95%</p>
                    <p className="text-gray-400 text-sm">Member Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 bg-gradient-to-b from-black to-red-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-red-600 font-bold uppercase tracking-widest text-sm mb-4">🚀 Ready?</p>
          <h2 className="font-black uppercase leading-tight text-4xl lg:text-5xl mb-6">
            Join the JJ Studio <span className="text-red-600">Community</span>
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Your first class is free. No credit card required. Come experience the Lagree Method and see why hundreds of people are obsessed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase px-12 py-4 rounded-lg transition-all hover:shadow-lg hover:shadow-red-600/50">
              Claim Free Class
            </a>
            <button onClick={handleScheduleClick} className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase px-12 py-4 rounded-lg transition-all">
              View Schedule
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-24 bg-black border-t border-red-900/20" id="contact">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-red-600 font-bold uppercase tracking-widest text-sm mb-4">📍 Get In Touch</p>
              <h2 className="font-black uppercase leading-tight text-4xl lg:text-5xl mb-12">
                Visit JJ <span className="text-red-600">Studio</span>
              </h2>
              
              <div className="space-y-8">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Location</p>
                  <p className="text-white text-lg">Xentric Lomas Norte, El Campanario, Lcl 211<br />Monterrey, México</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Hours</p>
                  <p className="text-white">Monday - Friday: 6:00 AM - 7:00 PM<br />Saturday: 8:00 AM - 5:00 PM<br />Sunday: Closed</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Contact</p>
                  <a href="tel:+5213318373447" className="text-red-600 hover:text-red-500 text-lg font-bold mb-2 block">
                    +52 1 33 1837 3447
                  </a>
                  <a href="mailto:administracion@jjstudio.mx" className="text-red-600 hover:text-red-500">
                    administracion@jjstudio.mx
                  </a>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-3">Follow Us</p>
                  <div className="flex gap-4">
                    <a href="https://www.instagram.com/jj_lagree_experience" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 font-bold uppercase text-sm">Instagram</a>
                    <a href="https://wa.me/5213318373447" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 font-bold uppercase text-sm">WhatsApp</a>
                  </div>
                </div>
              </div>
            </div>

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
                  className="px-4 py-3 text-sm text-white bg-gray-900/50 border border-red-900/30 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                  className="px-4 py-3 text-sm text-white bg-gray-900/50 border border-red-900/30 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                required
                className="px-4 py-3 text-sm text-white w-full bg-gray-900/50 border border-red-900/30 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
              />
              <textarea
                placeholder="Message"
                rows={4}
                value={formData.message}
                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                required
                className="px-4 py-3 text-sm text-white w-full bg-gray-900/50 border border-red-900/30 rounded-lg focus:outline-none focus:border-red-600 transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={formState === "loading"}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase px-8 py-3 w-full rounded-lg transition-all"
              >
                {formState === "loading" ? "Sending..." : "Send Message"}
              </button>

              {formState === "success" && (
                <div className="bg-green-900/20 border border-green-600 text-green-400 px-4 py-3 rounded-lg text-sm text-center font-bold uppercase">
                  ✓ Message sent! We'll get back soon.
                </div>
              )}
              {formState === "error" && (
                <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg text-sm text-center font-bold uppercase">
                  Error sending message. Try emailing us directly.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black border-t border-red-900/20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 JJ Studio. All rights reserved. | <a href="#" className="text-red-600 hover:text-red-500">Privacy Policy</a>
          </p>
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
