import Image from "next/image"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Bebas_Neue, Inter } from "next/font/google"

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const inter = Inter({ subsets: ["latin"], variable: "--font-body" })

const coaches = [
  {
    name: "Javi",
    role: "Coach Lagree certificado",
    image: "/images/Coach Javi.JPG",
    quote:
      "Coach Lagree profesional certificado por HQ. Entrena a los niveles más exigentes con calidad, esfuerzo y dedicación en cada clase. Prepárate para desafiar tus límites y esculpir tu cuerpo de una forma que nunca imaginaste. Cada sesión es una experiencia transformadora, diseñada para fortalecer tu core, tonificar tus músculos y mejorar tu resistencia de manera integral.",
  },
  {
    name: "Miyu",
    role: "Coach Lagree",
    image: "/images/Coach Miyu.JPG",
    quote:
      "Creo que el movimiento tiene el poder de transformar mucho más que el cuerpo. Como coach de Lagree, mi objetivo es que cada persona se sienta fuerte, capaz y orgullosa de lo que puede lograr, sin importar su nivel de experiencia.",
    detail:
      "Me gusta crear un ambiente donde puedas desafiarte, disfrutar el proceso y salir de cada clase con más confianza y energía de la que llegaste. Encontrarás entrenamientos intensos, técnica, atención a los detalles y, sobre todo, mucho acompañamiento para que des tu mejor versión en cada sesión. ¡Nos vemos en el Mega! ✨🤍",
  },
  {
    name: "Xime",
    role: "Coach Lagree",
    image: "/images/Coach Xime.JPG",
    quote:
      "Combino intensidad con una enseñanza cercana y paciente. Creo que los mejores resultados vienen de una buena técnica, por eso cuido cada detalle de tus movimientos mientras te reto a salir de tu zona de confort.",
    detail:
      "Mis clases están diseñadas para que encuentres el shake, ganes fuerza, control y confianza, sin importar si eres principiante o ya tienes experiencia.",
  },
  {
    name: "Dani Campos",
    role: "Coach Lagree",
    image: "/images/Coach Dani.JPG",
    quote:
      "Hola, soy Daniela. Me apasiona entrenar, pero aún más compartir esa pasión con quienes deciden retarse conmigo. En mis clases tendrás 45 minutos de trabajo intenso, controlado y muy efectivo.",
    detail:
      "Mi compromiso es acompañarte durante todo el proceso: motivarte cuando creas que no puedes más, corregir tu técnica para que entrenes de forma segura y ayudarte a descubrir una versión de ti más fuerte en cada clase. Aquí no se trata de ser perfecta, sino de dar lo mejor de ti en cada clase. Prepárate para temblar, retarte y enamorarte del proceso. 💪🏻",
  },
  {
    name: "Dan",
    role: "Coach Lagree",
    image: "/images/Coach Dan.JPG",
    quote:
      "Mis clases están hechas para quienes disfrutan el reto de verdad: ritmo, técnica y tensión sin atajos. Vamos a buscar ese punto donde cada repetición exige concentración, control y carácter.",
    detail:
      "Cuido cada detalle para que el esfuerzo tenga propósito. Si eres perfeccionista y quieres salir de tu zona de confort, aquí encontrarás 45 minutos pesados, precisos y profundamente satisfactorios.",
  },
  {
    name: "Erika",
    role: "Coach Lagree",
    image: "/images/Coach Erika.JPG",
    quote:
      "Creo en los 45 minutos que pueden cambiar el tono de tu día. Mis clases son un espacio para hacer pausa, enfocarte y volver a tu cuerpo, sin importar desde dónde empieces.",
    detail:
      "Te acompaño a construir fuerza, claridad y confianza una repetición a la vez. Encontrarás un reto para tu cuerpo y una mentalidad presente para terminar la clase sintiéndote más capaz que cuando llegaste.",
  },
]

export const metadata = {
  title: "Nuestro equipo | JJ Studio",
  description: "Conoce a los coaches de JJ Studio en Querétaro.",
}

export default function SobreNosotros() {
  return (
    <main className={`${bebas.variable} ${inter.variable} min-h-screen bg-[#151312] font-[family-name:var(--font-body)] text-[#f8f3eb]`}>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <a href="/" className="text-xl font-black tracking-[0.2em] text-white">JJ<span className="text-[#d9362b]">STUDIO</span></a>
          <a href="/" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ded6cc] transition hover:text-[#f04a3e]">
            <ArrowLeft size={15} /> Inicio
          </a>
        </div>
      </header>

      <section className="border-b border-white/10 px-6 py-20 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f04a3e]">JJ Studio · Querétaro</p>
          <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-7xl uppercase leading-[0.78] tracking-[-0.02em] sm:text-8xl lg:text-9xl">
            Conoce a<br /><span className="text-[#d9362b]">tu equipo.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-[#cfc6bc] sm:text-lg">
            Coaches que combinan técnica, energía y acompañamiento para que cada clase sea tu momento de retarte y descubrir de qué eres capaz.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:gap-20">
          {coaches.map((coach, index) => (
            <article key={coach.name} className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${index % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#27221f]">
                <Image src={coach.image} alt={`Coach ${coach.name} de JJ Studio`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-7 left-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f0e9df]">{coach.role}</p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-6xl uppercase leading-none text-white sm:text-7xl">{coach.name}</h2>
                </div>
              </div>
              <div className="max-w-xl lg:px-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f04a3e]">Coach JJ Studio</p>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-4xl uppercase leading-[0.9] text-white sm:text-5xl">Entrena. Siente. Evoluciona.</h3>
                <p className="mt-7 text-base leading-relaxed text-[#ded6cc] sm:text-lg">{coach.quote}</p>
                {coach.detail && <p className="mt-5 text-base leading-relaxed text-[#a99f94]">{coach.detail}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#d9362b] px-6 py-20 text-[#1a1816] sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em]">Tu siguiente clase empieza aquí</p>
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase leading-[0.82] sm:text-7xl">Encuentra a tu<br />mejor versión.</h2>
          <a href="https://nessty.mx/@jjstudio" target="_blank" rel="noreferrer" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#1a1816] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-[#1a1816]">
            Reservar clase <ArrowUpRight size={15} strokeWidth={2.5} />
          </a>
        </div>
      </section>
    </main>
  )
}
