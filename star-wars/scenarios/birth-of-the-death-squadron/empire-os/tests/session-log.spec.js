import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  surveillanceText,
  DEFAULT_SURVEILLANCE,
  sessionLog,
  pushLog,
  resetLog,
  MAX_ENTRIES
} from "../src/session-log.js"
import { startSessionClock } from "../src/session-clock.js"

describe("surveillanceText", () => {
  it("compose « LIBELLÉ : cible » à partir de l'action et de la cible", () => {
    expect(surveillanceText("open", "rapport.md")).toBe("ACCÈS FICHIER : rapport.md")
    expect(surveillanceText("navigate", "/srv-transmissions")).toBe("NAVIGATION : /srv-transmissions")
  })

  it("sans cible, n'affiche que le libellé", () => {
    expect(surveillanceText("cancelExtract")).toBe(DEFAULT_SURVEILLANCE.cancelExtract)
  })

  it("action inconnue : repli en majuscules", () => {
    expect(surveillanceText("frobnicate", "x")).toBe("FROBNICATE : x")
  })

  it("libellés surchargeables par le MJ (donnée)", () => {
    const labels = { open: "LECTURE AUTORISÉE" }
    expect(surveillanceText("open", "note.md", labels)).toBe("LECTURE AUTORISÉE : note.md")
  })
})

describe("journal de session (store capé)", () => {
  beforeEach(() => resetLog())

  it("empile les entrées dans l'ordre", () => {
    pushLog({ kind: "surveillance", text: "A" })
    pushLog({ kind: "surveillance", text: "B" })
    expect(sessionLog.map(e => e.text)).toEqual(["A", "B"])
  })

  it("ne conserve que les MAX_ENTRIES dernières", () => {
    for (let i = 0; i < MAX_ENTRIES + 25; i++) pushLog({ kind: "surveillance", text: String(i) })
    expect(sessionLog.length).toBe(MAX_ENTRIES)
    expect(sessionLog[0].text).toBe("25")
    expect(sessionLog[sessionLog.length - 1].text).toBe(String(MAX_ENTRIES + 24))
  })

  it("resetLog vide le journal", () => {
    pushLog({ kind: "surveillance", text: "A" })
    resetLog()
    expect(sessionLog.length).toBe(0)
  })

  it("horodate chaque entrée à l'heure in-game (heure MJ + temps de session écoulé)", () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(1_000_000)
      startSessionClock(52_200, Date.now()) // MJ règle 14:30:00, entrée dans l'OS
      pushLog({ kind: "system", text: "A" })
      vi.advanceTimersByTime(5_000)
      pushLog({ kind: "system", text: "B" })
      expect(sessionLog[0].at).toBe(52_200 * 1000) // 14:30:00 pile
      expect(sessionLog[1].at).toBe(52_200 * 1000 + 5_000) // +5 s d'écoulé
    } finally {
      vi.useRealTimers()
    }
  })
})
