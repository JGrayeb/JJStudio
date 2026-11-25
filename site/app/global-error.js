"use client"

export default function GlobalError({ reset }) {
  return (
    <html lang="es-MX">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", background: "#11100f", color: "white", textAlign: "center", fontFamily: "sans-serif" }}>
          <div>
            <p style={{ color: "#f04a3e", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>JJ Studio</p>
            <h1 style={{ marginTop: "20px", fontSize: "clamp(2.5rem, 8vw, 5rem)", textTransform: "uppercase" }}>Necesitamos volver a cargar.</h1>
            <button type="button" onClick={reset} style={{ marginTop: "28px", border: 0, borderRadius: "999px", padding: "14px 24px", background: "#d9362b", color: "white", fontWeight: 800, textTransform: "uppercase", cursor: "pointer" }}>Recargar JJ Studio</button>
          </div>
        </main>
      </body>
    </html>
  )
}
