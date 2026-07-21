import "./globals.css"
import Script from "next/script"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const siteUrl = "https://jjstudio.mx"

export const metadata = {
  metadataBase: new URL(siteUrl),
  verification: {
    google: "vt3rCHU-eHRf3gB8K1ReR1udBbBYtCp7H1HHGHQ67fI",
  },
  title: {
    default: "JJ Studio | Lagree en Querétaro",
    template: "%s | JJ Studio",
  },
  description: "JJ Studio es un espacio de Lagree en Querétaro: 45 minutos de fuerza, control y alta intensidad sobre Megaformer.",
  applicationName: "JJ Studio",
  keywords: ["Lagree Querétaro", "Megaformer Querétaro", "JJ Studio", "fitness en Querétaro", "clases de Lagree", "Xentric Lomas Norte"],
  category: "fitness",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "JJ Studio | Lagree en Querétaro",
    description: "45 minutos de fuerza, resistencia y control sobre Megaformer.",
    url: "/",
    siteName: "JJ Studio",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "JJ Studio — Trust the Process" }],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JJ Studio | Lagree en Querétaro",
    description: "45 minutos de fuerza, resistencia y control sobre Megaformer.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
}

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "JJ Studio",
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    image: `${siteUrl}/opengraph-image`,
    description: "Estudio de Lagree en Querétaro con clases de fuerza, resistencia y control sobre Megaformer.",
    sameAs: ["https://www.instagram.com/jj_lagree_experience/"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Concord, Xentric Lomas Norte, Local 211",
      postalCode: "76146",
      addressLocality: "Santiago de Querétaro",
      addressRegion: "Querétaro",
      addressCountry: "MX",
    },
    hasMap: "https://maps.app.goo.gl/rKRTAWWS8aJ38gCi6",
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:15", closes: "12:15" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "17:15", closes: "21:15" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:15", closes: "12:15" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "09:15", closes: "12:15" },
    ],
    telephone: "+524423947704",
    email: "administracion@jjstudio.mx",
    priceRange: "$$",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "atención a clientes",
      telephone: "+524423947704",
      email: "administracion@jjstudio.mx",
      availableLanguage: ["es-MX"],
    },
  }

  return (
    <html lang="es-MX" className={inter.variable}>
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
