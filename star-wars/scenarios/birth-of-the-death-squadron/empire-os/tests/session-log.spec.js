import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  formatSessionTime,
  surveillanceText,
  DEFAULT_SURVEILLANCE,
  sessionLog,
  pushLog,
  resetLog,
  MAX_ENTRIES,
  startSessionWarning,
  sessionStart,
  SESSION_WARNING_MS
} from "../src/session-log.js"

describe("formatSessionTime", () => {
  it("formate une durée écoulée en HH:MM:SS", () => {
    expect(formatSessionTime(0)).toBe("00:00:00")
    expect(formatSessionTime(1000)).toBe("00:00:01")
    expect(formatSessionTime(65000)).toBe("00:01:05")
    expect(formatSessionTime(3661000)).toBe("01:01:01")
  })
})

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
    pushLog({ kind: "system", text: "A" })
    pushLog({ kind: "system", text: "B" })
    expect(sessionLog.map(e => e.text)).toEqual(["A", "B"])
  })

  it("ne conserve que les MAX_ENTRIES dernières", () => {
    for (let i = 0; i < MAX_ENTRIES + 25; i++) pushLog({ kind: "system", text: String(i) })
    expect(sessionLog.length).toBe(MAX_ENTRIES)
    expect(sessionLog[0].text).toBe("25")
    expect(sessionLog[sessionLog.length - 1].text).toBe(String(MAX_ENTRIES + 24))
  })

  it("resetLog vide le journal", () => {
    pushLog({ kind: "system", text: "A" })
    resetLog()
    expect(sessionLog.length).toBe(0)
  })
})

describe("startSessionWarning (avertissement > 2 h)", () => {
  beforeEach(() => { resetLog(); vi.useFakeTimers() })
  afterEach(() => vi.useRealTimers())

  it("pousse un avertissement système (warn) au seuil, une seule fois", () => {
    const h = startSessionWarning({ thresholdMs: 5000, now: () => sessionStart })
    vi.advanceTimersByTime(4999)
    expect(sessionLog.length).toBe(0)
    vi.advanceTimersByTime(1)
    const e = sessionLog.at(-1)
    expect(e.kind).toBe("system")
    expect(e.level).toBe("warn")
    vi.advanceTimersByTime(10000)
    expect(sessionLog.filter(x => x.level === "warn").length).toBe(1)
    h.stop()
  })

  it("stop annule l'avertissement", () => {
    const h = startSessionWarning({ thresholdMs: 5000, now: () => sessionStart })
    h.stop()
    vi.advanceTimersByTime(10000)
    expect(sessionLog.length).toBe(0)
  })

  it("seuil par défaut = 2 h", () => {
    expect(SESSION_WARNING_MS).toBe(2 * 60 * 60 * 1000)
  })
})
