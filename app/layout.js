import "./globals.css"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Inter } from "next/font/google"
import siteContent from "@/content/site-content.json"
import MobileActionBar from "@/components/MobileActionBar"
import MetaPixel from "@/components/MetaPixel"
import { PurchaseProvider } from "@/components/PurchaseFlow"
import { META_PIXEL_ID } from "@/lib/meta-pixel"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const siteUrl = siteContent.siteUrl

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
    "@type": ["HealthClub", "SportsActivityLocation"],
    name: "JJ Studio",
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    image: [`${siteUrl}/opengraph-image`, `${siteUrl}/images/seo/estudio-interior.jpg`],
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
    hasMap: siteContent.links.maps,
    geo: {
      "@type": "GeoCoordinates",
      latitude: 20.634130901213975,
      longitude: -100.34342662385824,
    },
    areaServed: ["Querétaro", "Juriquilla", "El Refugio", "Zibatá", "Lomas del Marqués"],
    amenityFeature: {
      "@type": "LocationFeatureSpecification",
      name: "Estacionamiento gratuito en la plaza",
      value: true,
    },
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
        <meta name="facebook-domain-verification" content="o2zrb8pdq1dxfd91guvsv1cs4q0h0i" />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');window.dispatchEvent(new Event('jjstudio:meta-pixel-ready'));`}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
        </noscript>
      </head>
      <body>
        <MetaPixel />
        <PurchaseProvider>
          {children}
          <MobileActionBar />
        </PurchaseProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
