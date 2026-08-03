import siteContent from "@/content/site-content.json"

const siteUrl = siteContent.siteUrl

export default function sitemap() {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/horarios`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/metodo-lagree`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/sobre-nosotros`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/beverages`, changeFrequency: "monthly", priority: 0.7 },
  ]
}
