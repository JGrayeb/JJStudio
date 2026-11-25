"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export default function useReviewRequest(path, transport) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [revision, setRevision] = useState(0)
  const sequence = useRef(0)
  const refresh = useCallback(() => setRevision((value) => value + 1), [])
  useEffect(() => {
    const request = ++sequence.current
    const controller = new AbortController()
    setLoading(true)
    setError("")
    setResult(null)
    Promise.resolve().then(() => transport(path, { signal: controller.signal })).then((result) => {
      if (!controller.signal.aborted && request === sequence.current) {
        if (!result || result.private !== true || result.readOnly !== true) throw new Error("No pudimos comprobar que esta consulta sea privada. Vuelve a intentarlo.")
        setResult({ path, transport, value: result })
      }
    }).catch((cause) => {
      if (!controller.signal.aborted && request === sequence.current) setError(cause?.message || "No pudimos consultar estos registros. Intenta nuevamente.")
    }).finally(() => {
      if (!controller.signal.aborted && request === sequence.current) setLoading(false)
    })
    return () => { controller.abort(); sequence.current++ }
  }, [path, transport, revision])
  // Never expose a previous request's DTO for even one render after navigation
  // or an authentication transport change, before effect cleanup has executed.
  const current = result?.path === path && result?.transport === transport
  return { data: current ? result.value : null, loading: loading || (!current && !error), error, refresh }
}
