import { ChevronRight } from "lucide-react"
import siteContent from "@/content/site-content.json"

export default function SeoBreadcrumbs({ items, theme = "dark" }) {
  const breadcrumbs = [{ label: "Inicio", href: "/" }, ...items]
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${siteContent.siteUrl}${item.href}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <nav aria-label="Ruta de navegación" className={`flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] ${theme === "light" ? "text-[#6b625a]" : "text-[#a99f94]"}`}>
        {breadcrumbs.map((item, index) => (
          <span key={item.href} className="inline-flex items-center gap-2">
            {index > 0 && <ChevronRight size={13} aria-hidden="true" />}
            {index === breadcrumbs.length - 1 ? <span aria-current="page">{item.label}</span> : <a href={item.href} className="transition hover:text-[#f04a3e]">{item.label}</a>}
          </span>
        ))}
      </nav>
    </>
  )
}
