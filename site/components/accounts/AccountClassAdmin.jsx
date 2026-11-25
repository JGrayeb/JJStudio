"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, LockKeyhole, RefreshCw, Search } from "lucide-react"
import { apiRequest, inputClass, panelClass } from "@/components/subscriptions/account-ui"
import AccountBillingNotice from "./AccountBillingNotice"
import AccountClassDetail from "./AccountClassDetail"
import AccountDirectoryViews, { ACCOUNT_DIRECTORY_VIEWS } from "./AccountDirectoryViews"
import AccountListCard from "./AccountListCard"

function revealDirectory(element) {
  if (!element) return
  element.focus({ preventScroll: true })
  element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" })
}

export default function AccountClassAdmin({ session, onNavigationLockChange }) {
  const token = session?.access_token
  const [data, setData] = useState(null)
  const [view, setView] = useState("all")
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [accountId, setAccountId] = useState(null)
  const loadNumber = useRef(0)
  const returnFocus = useRef(null)
  const currentView = ACCOUNT_DIRECTORY_VIEWS.find((item) => item.id === view) || ACCOUNT_DIRECTORY_VIEWS[0]

  const load = useCallback(async () => {
    if (!token) return
    const request = ++loadNumber.current
    setLoading(true)
    setError("")
    try {
      const result = await apiRequest(`/api/admin/accounts?view=${encodeURIComponent(view)}&page=${page}&perPage=25`, { token })
      if (request === loadNumber.current) setData(result)
    } catch (cause) { if (request === loadNumber.current) { setData(null); setError(cause.message) } }
    finally { if (request === loadNumber.current) setLoading(false) }
  }, [page, token, view])

  useEffect(() => { load(); return () => { loadNumber.current++ } }, [load])
  useEffect(() => {
    if (accountId) return
    const frame = requestAnimationFrame(() => revealDirectory(returnFocus.current))
    return () => cancelAnimationFrame(frame)
  }, [accountId, page, view])

  const accounts = [...new Map((Array.isArray(data?.accounts) ? data.accounts : []).map((account) => [account.id, account])).values()]
  const needle = query.trim().toLocaleLowerCase("es-MX")
  const visible = accounts.filter((item) => !needle || [item.email, item.fullName, item.directory?.packageName, ...(item.packages || []).map((entry) => entry.name)].join(" ").toLocaleLowerCase("es-MX").includes(needle))
  function back() { setAccountId(null) }
  function selectView(id) {
    if (!ACCOUNT_DIRECTORY_VIEWS.some((item) => item.id === id)) return
    if (id === view) { revealDirectory(returnFocus.current); return }
    loadNumber.current++
    setView(id)
    setPage(1)
    setQuery("")
    setData(null)
    setError("")
  }
  function selectPage(nextPage) { loadNumber.current++; setPage(nextPage); setQuery(""); setData(null) }

  return <section className="adm-client-directory space-y-5" aria-label="Clientes y sus cuentas">
    {accountId ? <AccountClassDetail key={accountId} accountId={accountId} token={token} onBack={back} onUpdated={load} onNavigationLockChange={onNavigationLockChange} /> : <>
      <AccountDirectoryViews activeView={view} onSelect={selectView} />
      <div className="adm-directory-head flex flex-wrap items-start justify-between gap-3"><div className="adm-directory-context min-w-0"><h2 id="admin-accounts-heading" ref={returnFocus} tabIndex={-1} className="text-lg font-semibold outline-none">{currentView.title}</h2><p className="adm-directory-criteria mt-2 max-w-3xl text-sm leading-relaxed text-[#c9beb3]">{currentView.criteria}</p></div><button type="button" onClick={load} disabled={loading} className="adm-button adm-button-quiet inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold"><RefreshCw size={17} aria-hidden="true" />{loading ? "Actualizando lista…" : "Actualizar lista"}</button></div>
      {view !== "all" && data?.billingMode === "test" && <AccountBillingNotice mode="test" />}
      {view === "recent" && <p className="adm-directory-scope text-xs leading-relaxed text-[#bcb4aa]">Cobertura actual: pagos de suscripciones web. Todavía no incluye Nessty, caja ni compras únicas.</p>}
      <div className="adm-directory-tools space-y-3"><label className="adm-search-field block"><span className="mb-2 block text-sm font-semibold">Buscar entre estos clientes</span><span className="relative block"><Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#c9beb3]" aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Escribe su nombre, correo o paquete" autoComplete="off" className={`${inputClass} !mt-0 !pl-12`} /></span></label><p className="text-xs leading-relaxed text-[#bcb4aa]">Busca en esta página de resultados. Usa «Siguiente» para consultar más clientes.</p></div>
      <div id="admin-directory-results" className="space-y-4" aria-busy={loading}>
        {error && <p role="alert" className="adm-notice rounded-xl border border-[#ffb3aa]/50 p-4 text-base leading-relaxed text-[#ffb3aa]">{error}</p>}
        {loading && <div role="status" className="adm-client-loading space-y-3" aria-label="Consultando clientes"><span className="sr-only">Consultando clientes…</span>{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />)}</div>}
        {!loading && data && <>
          {data.indexTruncated && <p role="status" className="adm-notice">La consulta alcanzó su límite de registros. Esta lista es parcial; no representa todos los clientes que cumplen el criterio.</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#bcb4aa]"><p role="status">{needle ? `${visible.length} coincidencia(s) entre ${accounts.length} clientes de esta página` : `${accounts.length} cliente(s) en esta página`}{Number.isSafeInteger(data.total) && data.total >= 0 && !data.indexTruncated ? ` · ${data.total} en esta vista` : ""}</p><p>Página {data.page || page}</p></div>
          {visible.length ? <ul className="adm-client-list space-y-2">{visible.map((account) => <AccountListCard key={account.id} account={account} onOpen={setAccountId} />)}</ul> : <div className={`${panelClass} adm-client-empty`}><p className="text-lg font-semibold">{needle ? "No encontramos a ese cliente en esta página." : data.indexTruncated ? "No se encontraron clientes en la parte consultada." : currentView.empty}</p><p className="mt-2 text-sm leading-relaxed text-[#c9beb3]">{needle ? "Prueba otro nombre o revisa la siguiente página de resultados." : data.indexTruncated ? "La consulta es parcial. No podemos concluir que no existan más clientes que cumplan el criterio." : currentView.emptyHint}</p>{(needle || view !== "all") && <button type="button" className="adm-button adm-button-quiet mt-4" onClick={() => { setQuery(""); selectView("all") }}>Ver todos los clientes</button>}</div>}
          <nav aria-label="Páginas de clientes" className="flex items-center justify-between gap-3"><button type="button" disabled={page <= 1} onClick={() => selectPage(page - 1)} className="adm-button adm-button-quiet inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold"><ChevronLeft size={18} aria-hidden="true" />Anterior</button><button type="button" disabled={!data.hasMore} onClick={() => selectPage(page + 1)} className="adm-button adm-button-quiet inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold">Siguiente<ChevronRight size={18} aria-hidden="true" /></button></nav>
        </>}
      </div>
      <p className="adm-inline-note flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-relaxed text-[#bcb4aa]"><LockKeyhole size={15} className="mt-0.5 shrink-0" aria-hidden="true" />Consulta privada del equipo. Los ajustes de clases no modifican cobros ni Nessty.</p>
    </>}
  </section>
}
