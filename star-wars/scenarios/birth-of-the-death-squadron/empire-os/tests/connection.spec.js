import { describe, it, expect } from "vitest"
import {
  CONNECTION_LEVELS,
  connectionRank,
  isConnectionLost,
  glitchLevel,
  connectionChangeKind,
} from "../src/connection.js"

describe("connection — domaine de la qualité de liaison", () => {
  it("échelle ordonnée du meilleur au pire, terminée par 'perdue'", () => {
    expect(CONNECTION_LEVELS[0]).toBe("excellente")
    expect(CONNECTION_LEVELS.at(-1)).toBe("perdue")
    // 'bonne' est meilleure que 'critique'
    expect(connectionRank("bonne")).toBeLessThan(connectionRank("critique"))
  })

  it("isConnectionLost ne vaut que pour 'perdue'", () => {
    expect(isConnectionLost("perdue")).toBe(true)
    expect(isConnectionLost("critique")).toBe(false)
    expect(isConnectionLost("bonne")).toBe(false)
  })

  it("glitchLevel : nul à 'bonne'+ , croissant de moyenne(1) à critique(3), nul à 'perdue'", () => {
    expect(glitchLevel("excellente")).toBe(0)
    expect(glitchLevel("bonne")).toBe(0)
    expect(glitchLevel("moyenne")).toBe(1)
    expect(glitchLevel("faible")).toBe(2)
    expect(glitchLevel("critique")).toBe(3)
    expect(glitchLevel("perdue")).toBe(0) // la session se termine, pas de glitch
  })

  it("connectionChangeKind : sens du changement pour la console", () => {
    expect(connectionChangeKind("bonne", "faible")).toBe("degradation")
    expect(connectionChangeKind("critique", "moyenne")).toBe("amelioration")
    expect(connectionChangeKind("bonne", "bonne")).toBe(null) // pas de changement
    expect(connectionChangeKind("bonne", "n'importe quoi")).toBe(null) // niveau inconnu
  })
})
