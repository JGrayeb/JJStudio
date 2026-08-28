import { ImageResponse } from "next/og"

export const alt = "JJ Studio — Trust the Process"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ alignItems: "stretch", background: "#151312", color: "#f8f3eb", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "58px 72px", position: "relative", width: "100%" }}>
        <div style={{ background: "#d9362b", height: "14px", left: 0, position: "absolute", top: 0, width: "100%" }} />
        <div style={{ display: "flex", fontSize: 27, fontWeight: 800, letterSpacing: "0.18em" }}>
          JJ<span style={{ color: "#d9362b" }}>STUDIO</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 110, fontWeight: 900, letterSpacing: "-0.07em", lineHeight: 0.82, textTransform: "uppercase" }}>
          <span>Trust the</span>
          <span style={{ color: "#d9362b" }}>Process.</span>
        </div>
        <div style={{ color: "#ded6cc", display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Lagree · Querétaro · 45 minutos · Alta intensidad
        </div>
      </div>
    ),
    size,
  )
}
