import { describe, it, expect, beforeEach } from "vitest"
import {
  sessionState,
  DEFAULT_SESSION,
  setSessionConfig,
  resetSessionState
} from "../src/session-store.js"

describe("session-store", () => {
  beforeEach(() => resetSessionState())

  it("expose les défauts (connexion moyenne, alerte 0, intrusion boot, horloge 0)", () => {
    expect(sessionState.connectionQuality).toBe("moyenne")
    expect(sessionState.alertLevel).toBe(0)
    expect(sessionState.intrusion).toBe("boot")
    expect(sessionState.clockStart).toBe(0)
    expect(DEFAULT_SESSION).toEqual({ connectionQuality: "moyenne", alertLevel: 0, intrusion: "boot", clockStart: 0 })
  })

  it("setSessionConfig applique l'heure de départ (clockStart, en secondes) sans écraser les autres clés", () => {
    setSessionConfig({ clockStart: 3600 })
    expect(sessionState.clockStart).toBe(3600)
    expect(sessionState.intrusion).toBe("boot") // inchangé
  })

  it("setSessionConfig applique une config partielle sans écraser les clés absentes", () => {
    setSessionConfig({ alertLevel: 3 })
    expect(sessionState.alertLevel).toBe(3)
    expect(sessionState.connectionQuality).toBe("moyenne") // inchangé
    setSessionConfig({ connectionQuality: "critique" })
    expect(sessionState.connectionQuality).toBe("critique")
    expect(sessionState.alertLevel).toBe(3) // inchangé
  })

  it("setSessionConfig applique l'écran d'intrusion sans écraser les autres clés", () => {
    setSessionConfig({ intrusion: "public_ok" })
    expect(sessionState.intrusion).toBe("public_ok")
    expect(sessionState.alertLevel).toBe(0) // inchangé
    expect(sessionState.connectionQuality).toBe("moyenne") // inchangé
  })

  it("setSessionConfig ignore une entrée vide/nulle", () => {
    setSessionConfig(undefined)
    setSessionConfig({})
    expect(sessionState).toMatchObject(DEFAULT_SESSION)
  })

  it("resetSessionState restaure les défauts", () => {
    setSessionConfig({ connectionQuality: "faible", alertLevel: 5 })
    resetSessionState()
    expect(sessionState).toMatchObject(DEFAULT_SESSION)
  })
})
