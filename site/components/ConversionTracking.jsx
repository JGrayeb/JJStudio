"use client"

import { useRef } from "react"
import { track } from "@vercel/analytics"
import { trackMetaCustomEvent, trackMetaEvent } from "@/lib/meta-pixel"
import NesstyCalendar from "@/components/NesstyCalendar"

const FIRST_CLASS_VALUE = 245

function trackEvent(eventName, parameters) {
  track(eventName, parameters)
  trackMetaCustomEvent(eventName, parameters)
}

export function TrackedNesstyLink({
  href,
  location,
  firstClass = false,
  children,
  className = "",
  ariaLabel,
  onClick,
  style,
}) {
  const handleClick = (event) => {
    onClick?.(event)

    const parameters = {
      destination: "nessty",
      location,
      ...(firstClass ? { offer: "primera_clase", currency: "MXN", value: FIRST_CLASS_VALUE } : {}),
    }

    if (firstClass) {
      trackEvent("primera_clase_cta", parameters)
      trackMetaEvent("Lead", {
        content_name: "Primera clase Lagree",
        currency: "MXN",
        lead_type: "reservation_intent",
        location,
        value: FIRST_CLASS_VALUE,
      })
    }

    trackEvent("nessty_abierto", parameters)
    trackMetaEvent("Schedule", {
      content_name: firstClass ? "Primera clase Lagree" : "Calendario JJ Studio",
      currency: "MXN",
      location,
      ...(firstClass ? { value: FIRST_CLASS_VALUE } : {}),
    })
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </a>
  )
}

export function TrackedNesstyCalendar({ href, title, className = "", location = "horarios" }) {
  const trackedRef = useRef(false)

  const handleLoad = () => {
    if (trackedRef.current) return
    trackedRef.current = true

    const parameters = { destination: "nessty", location }
    trackEvent("calendario_visto", parameters)
    trackMetaEvent("ViewContent", {
      content_name: "Calendario JJ Studio",
      content_type: "schedule",
      location,
    })
  }

  return (
    <NesstyCalendar
      title={title}
      href={href}
      className={className}
      onLoad={handleLoad}
    />
  )
}
