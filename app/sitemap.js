const siteUrl = "https://jjstudio.mx"

export default function sitemap() {
  const lastModified = new Date()

  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/horarios`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/metodo-lagree`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/sobre-nosotros`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ]
}
