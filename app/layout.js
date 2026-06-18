// app/layout.js

import "./globals.css"

export const metadata = {
  verification: {
    google: "vt3rCHU-eHRf3gB8K1ReR1udBbBYtCp7H1HHGHQ67fI",
  },
  title: "JJStudio — Trust The Process",
  description: "Boutique fitness studio at Xentric Lomas Norte. Group classes: Full Body, Core, Lower Body, Arms & Hell. Your first class is free.",
  keywords: "JJStudio, fitness, boutique gym, clases grupales, Xentric Lomas Norte, entrenamiento",
  openGraph: {
    title: "JJStudio — Trust The Process",
    description: "Your first class is on us. No commitment. Just show up.",
    url: "https://jjstudio.mx",
    siteName: "JJStudio",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JJStudio — Trust The Process",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JJStudio — Trust The Process",
    description: "Boutique fitness studio. Your first class is free.",
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}