"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { RefreshCw, ShieldCheck } from "lucide-react"
import { ReviewHeader, ReviewNavigation, ReviewScope, ReviewStats } from "./ReviewChrome"
import ReviewDirectory from "./ReviewDirectory"
import ReviewRecordDetail from "./ReviewRecordDetail"
import useReviewRequest from "./use-review-request"
import { REVIEW_VIEWS } from "./review-format.mjs"

export default function PrivateReviewPanel({ transport, onSignOut, adminEmail, embedded = false }) {
  const [criteria, setCriteria] = useState({ view: "all", q: "", page: 1 })
  const [draft, setDraft] = useState("")
  const [recordId, setRecordId] = useState(null)
  const [stats, setStats] = useState(null)
  const rowButtons = useRef(new Map())
  const searchRef = useRef(null)
  const titleRef = useRef(null)
  const lastOpened = useRef(null)
  const path = useMemo(() => `/api/admin/import-review?${new URLSearchParams({ view: criteria.view, q: criteria.q, page: String(criteria.page) })}`, [criteria])
  const { data, loading, error, refresh } = useReviewRequest(path, transport)
  const currentView = REVIEW_VIEWS.find((item) => item.id === criteria.view) || REVIEW_VIEWS[0]
  const Workspace = embedded ? "section" : "main"
  const Heading = embedded ? "h2" : "h1"

  useEffect(() => {
    const timer = setTimeout(() => setCriteria((current) => current.q === draft.trim() ? current : { ...current, q: draft.trim(), page: 1 }), 350)
    return () => clearTimeout(timer)
  }, [draft])
  useEffect(() => { if (data?.stats) setStats(data.stats) }, [data])

  function selectView(view) {
    setRecordId(null)
    setCriteria((current) => ({ ...current, view, page: 1 }))
    requestAnimationFrame(() => titleRef.current?.focus())
  }
  function openRecord(id) { lastOpened.current = id; setRecordId(id) }
  function back() {
    setRecordId(null)
    requestAnimationFrame(() => { const opener = rowButtons.current.get(lastOpened.current); if (opener) opener.focus(); else searchRef.current?.focus() })
  }
  function rememberButton(id, node) { if (node) rowButtons.current.set(id, node); else rowButtons.current.delete(id) }

  return <div className={`pvr-root${embedded ? " pvr-app pvr-embedded" : ""}`}>{!embedded && <ReviewHeader adminEmail={adminEmail} onSignOut={onSignOut} />}<div className="pvr-container"><a className="pvr-skip" href="#private-review-main">Ir a los registros</a><div className="pvr-layout"><ReviewNavigation view={criteria.view} stats={stats} onSelect={selectView} /><Workspace id="private-review-main" className="pvr-workspace" aria-labelledby="private-review-heading"><header className="pvr-workspace-header"><div>{!embedded && <p className="pvr-breadcrumb">Revisión privada <span>/</span> {currentView.label}</p>}<Heading id="private-review-heading" ref={titleRef} tabIndex={-1}>{currentView.id === "all" ? "Contactos importados" : currentView.id === "attention" ? "Contactos por revisar" : "Evidencias de compra"}</Heading><p className="pvr-description">{currentView.id === "all" ? "Datos preparados para revisión, sin crear cuentas ni asignar clases." : currentView.id === "attention" ? "Registros separados para verificar su identidad o sus datos de contacto." : "Compras conservadas como evidencia, con comprador y beneficiario diferenciados."}</p></div><span className="pvr-private-tag"><ShieldCheck size={16} aria-hidden="true" />Solo consulta</span></header>
      {!recordId && <><ReviewStats stats={stats} /><ReviewScope recentBatch={stats?.recentBatch} /><div className="pvr-section-title"><h2>{currentView.label}</h2><button type="button" onClick={refresh} disabled={loading} className="pvr-button"><RefreshCw size={17} aria-hidden="true" />Actualizar</button></div></>}
      {recordId ? <ReviewRecordDetail key={recordId} recordId={recordId} transport={transport} onBack={back} /> : <ReviewDirectory view={criteria.view} data={data} loading={loading || draft.trim() !== criteria.q} error={error} draft={draft} onDraft={setDraft} onRefresh={refresh} onOpen={openRecord} rememberButton={rememberButton} searchRef={searchRef} onPage={(page) => setCriteria((current) => ({ ...current, page }))} />}
    </Workspace></div></div></div>
}
