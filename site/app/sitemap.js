import siteContent from "@/content/site-content.json"

const siteUrl = siteContent.siteUrl

export default function sitemap() {
  const lastModified = new Date("2026-08-18T12:00:00-06:00")

  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/horarios`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/metodo-lagree`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/lagree-vs-pilates`, lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: `${siteUrl}/primera-clase-lagree`, lastModified, changeFrequency: "monthly", priority: 0.85 },
    { url: `${siteUrl}/lagree-mayores-de-40`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/cuantas-clases-lagree-por-semana`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/regalos`, lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: `${siteUrl}/sobre-nosotros`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/beverages`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/evidencia-lagree`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/aviso-de-privacidad`, lastModified: new Date("2026-11-10T12:00:00-06:00"), changeFrequency: "yearly", priority: 0.3 },
  ]
}
