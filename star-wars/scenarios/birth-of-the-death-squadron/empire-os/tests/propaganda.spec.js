import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  pickPropaganda,
  propagandaInterval,
  startPropaganda,
  DEFAULT_PROPAGANDA,
  PROPAGANDA_BASE_MS
} from "../src/propaganda.js"
import { sessionLog, resetLog } from "../src/session-log.js"

describe("pickPropaganda", () => {
  it("choisit une ligne du pool via le RNG injecté", () => {
    const pool = ["A", "B", "C"]
    expect(pickPropaganda(pool, () => 0)).toBe("A")
    expect(pickPropaganda(pool, () => 0.99)).toBe("C")
  })

  it("null si le pool est vide", () => {
    expect(pickPropaganda([], () => 0)).toBe(null)
  })
})

describe("propagandaInterval", () => {
  it("cadence de base à alerte 0, et se resserre quand l'alerte monte", () => {
    expect(propagandaInterval(0)).toBe(PROPAGANDA_BASE_MS)
    expect(propagandaInterval(5)).toBeLessThan(propagandaInterval(0))
    expect(propagandaInterval(3)).toBeLessThan(propagandaInterval(1))
  })
})

describe("startPropaganda (timer injecté)", () => {
  beforeEach(() => { resetLog(); vi.useFakeTimers() })
  afterEach(() => vi.useRealTimers())

  it("pousse une ligne de propagande à chaque période, jusqu'au stop", () => {
    const handle = startPropaganda({ pool: ["L'EMPIRE VEILLE."], intervalMs: 1000, rng: () => 0 })
    expect(sessionLog.length).toBe(0)
    vi.advanceTimersByTime(1000)
    expect(sessionLog.length).toBe(1)
    expect(sessionLog[0]).toMatchObject({ kind: "propaganda", text: "L'EMPIRE VEILLE." })
    vi.advanceTimersByTime(1000)
    expect(sessionLog.length).toBe(2)
    handle.stop()
    vi.advanceTimersByTime(5000)
    expect(sessionLog.length).toBe(2)
  })

  it("pool vide : aucun timer, stop ne casse pas", () => {
    const handle = startPropaganda({ pool: [], intervalMs: 1000 })
    vi.advanceTimersByTime(5000)
    expect(sessionLog.length).toBe(0)
    expect(() => handle.stop()).not.toThrow()
  })

  it("expose un pool par défaut non vide", () => {
    expect(DEFAULT_PROPAGANDA.length).toBeGreaterThan(0)
  })
})
