import siteContent from "@/content/site-content.json"

const siteUrl = siteContent.siteUrl

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
