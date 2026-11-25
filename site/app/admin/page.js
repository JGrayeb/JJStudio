import { ArrowUpRight } from "lucide-react"
import PromotionAdmin from "@/components/PromotionAdmin"
import { headers } from "next/headers"
import { classAccountAdjustmentsEnabled } from "@/lib/class-account-admin-domain.mjs"
import { importReviewEnabled } from "@/lib/private-import-review-domain.mjs"
import "./admin.css"
import "@/components/private-review/review.css"

export const metadata = { title: "Control del estudio", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const requestHeaders = await headers()
  const productionOperations = classAccountAdjustmentsEnabled(requestHeaders.get("host"))
  return (
    <main className="admin-app">
      <header className="adm-topbar"><div className="adm-topbar-inner">
        <a href="/" aria-label="JJStudio, volver al sitio" className="adm-wordmark">JJ<span>STUDIO</span></a>
        <span className="adm-topbar-label">Control del estudio</span>
        <a href="/" target="_blank" rel="noopener noreferrer" className="adm-site-link">Ver página pública <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">Se abre en otra pestaña</span></a>
      </div></header>
      <div className="adm-page-container"><PromotionAdmin importReviewAvailable={importReviewEnabled()} productionOperations={productionOperations} /></div>
    </main>
  )
}
