const siteUrl = "https://jjstudio.mx"

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/api/", "/login", "/signup", "/forgot-password", "/password-reset"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
