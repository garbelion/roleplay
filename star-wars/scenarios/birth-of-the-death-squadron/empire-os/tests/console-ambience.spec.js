import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { startConsoleAmbience } from "../src/console-ambience.js"
import { sessionLog, resetLog, SESSION_WARNING_MS } from "../src/session-log.js"

describe("startConsoleAmbience", () => {
  beforeEach(() => { resetLog(); vi.useFakeTimers() })
  afterEach(() => vi.useRealTimers())

  it("démarre les émetteurs (propagande + avertissement 2h) et un stop unique les arrête tous", () => {
    const handle = startConsoleAmbience({ propaganda: ["SLOGAN"], intervalMs: 1000, rng: () => 0 })

    // Propagande émise sur son timer…
    vi.advanceTimersByTime(1000)
    expect(sessionLog.some(e => e.kind === "propaganda")).toBe(true)

    // …et l'avertissement de session est bien programmé (il finit par tomber).
    vi.advanceTimersByTime(SESSION_WARNING_MS)
    expect(sessionLog.some(e => e.kind === "system" && e.level === "warn")).toBe(true)

    // Un seul stop coupe tout : plus aucune propagande ensuite.
    handle.stop()
    const count = sessionLog.filter(e => e.kind === "propaganda").length
    vi.advanceTimersByTime(5000)
    expect(sessionLog.filter(e => e.kind === "propaganda").length).toBe(count)
  })
})
