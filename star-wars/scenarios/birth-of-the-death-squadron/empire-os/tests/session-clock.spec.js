import { describe, it, expect, beforeEach } from "vitest"
import {
  startSessionClock,
  resetSessionClock,
  sessionElapsedMs,
  heureMs,
  openingHeureMs,
  sessionRemainingMs,
  isSessionExpired,
  SESSION_LIMIT_MS,
  formatSessionTime,
  formatHeure,
} from "../src/session-clock.js"

describe("formatSessionTime / formatHeure", () => {
  it("formatSessionTime : durée (ms) → HH:MM:SS, heures non bornées", () => {
    expect(formatSessionTime(0)).toBe("00:00:00")
    expect(formatSessionTime(65_000)).toBe("00:01:05")
    expect(formatSessionTime(3_661_000)).toBe("01:01:01")
    expect(formatSessionTime(25 * 3600 * 1000)).toBe("25:00:00") // pas de bornage
  })

  it("formatHeure : heure murale ramenée sur 24 h (roule après minuit)", () => {
    expect(formatHeure(52_200 * 1000)).toBe("14:30:00")
    expect(formatHeure(24 * 3600 * 1000 + 65_000)).toBe("00:01:05") // > 24 h → roule
  })
})

describe("session-clock", () => {
  beforeEach(() => resetSessionClock())

  it("le temps écoulé vaut 0 tant que la session n'a pas démarré, puis court depuis l'ancre", () => {
    // Avant l'entrée dans l'OS : aucune ancre, aucun temps écoulé.
    expect(sessionElapsedMs(10_000)).toBe(0)

    // L'entrée dans l'OS pose l'ancre (heure murale = 10 000 ms).
    startSessionClock(0, 10_000)
    expect(sessionElapsedMs(10_000)).toBe(0)
    expect(sessionElapsedMs(15_000)).toBe(5_000)
  })

  it("l'heure in-game part de l'heure réglée par le MJ et avance avec le temps écoulé", () => {
    // MJ règle 14:30:00 (52 200 s). Entrée dans l'OS à l'ancre 1000.
    startSessionClock(52_200, 1_000)
    expect(heureMs(1_000)).toBe(52_200 * 1000) // à l'entrée : exactement l'heure réglée
    expect(heureMs(61_000)).toBe(52_200 * 1000 + 60_000) // +60 s plus tard
  })

  it("l'heure d'ouverture est un instantané figé de l'heure réglée, indépendant du temps écoulé", () => {
    startSessionClock(52_200, 1_000)
    expect(openingHeureMs()).toBe(52_200 * 1000)
    // Même 90 min plus tard, l'heure d'ouverture ne bouge pas.
    expect(openingHeureMs()).toBe(52_200 * 1000)
  })

  it("le temps restant décompte depuis la limite (2 h) et se borne à 0", () => {
    startSessionClock(0, 0)
    expect(sessionRemainingMs(0)).toBe(SESSION_LIMIT_MS)
    expect(sessionRemainingMs(60_000)).toBe(SESSION_LIMIT_MS - 60_000)
    // Au-delà de la limite : borné à 0 (jamais négatif).
    expect(sessionRemainingMs(SESSION_LIMIT_MS + 5_000)).toBe(0)
  })

  it("la session est expirée quand le temps écoulé atteint la limite — jamais avant démarrage", () => {
    expect(isSessionExpired(SESSION_LIMIT_MS + 1)).toBe(false) // pas d'ancre => pas d'expiration
    startSessionClock(0, 0)
    expect(isSessionExpired(SESSION_LIMIT_MS - 1)).toBe(false)
    expect(isSessionExpired(SESSION_LIMIT_MS)).toBe(true)
  })
})
