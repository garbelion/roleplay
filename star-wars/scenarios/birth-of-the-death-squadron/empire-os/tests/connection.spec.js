import { describe, it, expect } from "vitest"
import {
  CONNECTION_LEVELS,
  connectionRank,
  isConnectionLost,
  glitchLevel,
  glitchBurst,
  connectionChangeKind,
  connectionChangeLog,
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

  it("glitchBurst : salves plus fournies ET plus fréquentes à mesure que la liaison se dégrade", () => {
    expect(glitchBurst("bonne")).toBe(null) // pas de perturbation
    expect(glitchBurst("perdue")).toBe(null) // session terminée
    const moyenne = glitchBurst("moyenne")
    const faible = glitchBurst("faible")
    const critique = glitchBurst("critique")
    // importance : le décrochage emporte de plus en plus de macroblocs
    expect(moyenne.blocks).toBeLessThan(faible.blocks)
    expect(faible.blocks).toBeLessThan(critique.blocks)
    // fréquence : les salves se rapprochent (période plus courte)
    expect(moyenne.periodMs).toBeGreaterThan(faible.periodMs)
    expect(faible.periodMs).toBeGreaterThan(critique.periodMs)
  })

  it("glitchBurst : la part de temps dégradé grimpe — anecdotique à 'moyenne', majoritaire à 'critique'", () => {
    const part = (l) => {
      const b = glitchBurst(l)
      return b.durationMs / b.periodMs
    }
    expect(part("moyenne")).toBeLessThan(0.2) // décoratif : on opère sans gêne réelle
    expect(part("faible")).toBeGreaterThan(0.25) // pénible : ça revient sans cesse
    expect(part("faible")).toBeLessThan(0.5) // mais l'écran reste net la plupart du temps
    // À critique, l'écran est dégradé plus souvent que net : on ne peut plus attendre l'accalmie pour lire.
    expect(part("critique")).toBeGreaterThan(0.5)
  })

  it("glitchBurst : seul le niveau critique bloque l'interaction (les moindres restent opérables)", () => {
    expect(glitchBurst("critique").blocking).toBe(true)
    expect(glitchBurst("faible").blocking).toBe(false) // pénible, mais on peut opérer
    expect(glitchBurst("moyenne").blocking).toBe(false) // décoratif
  })

  it("connectionChangeKind : sens du changement pour la console", () => {
    expect(connectionChangeKind("bonne", "faible")).toBe("degradation")
    expect(connectionChangeKind("critique", "moyenne")).toBe("amelioration")
    expect(connectionChangeKind("bonne", "bonne")).toBe(null) // pas de changement
    expect(connectionChangeKind("bonne", "n'importe quoi")).toBe(null) // niveau inconnu
  })

  it("connectionChangeLog : ligne console typée pour la dégradation / l'amélioration (null sinon)", () => {
    expect(connectionChangeLog("bonne", "bonne")).toBe(null)
    const deg = connectionChangeLog("bonne", "faible")
    expect(deg).toMatchObject({ kind: "system", level: "warn" })
    expect(deg.text).toContain("DÉGRADÉE")
    expect(deg.text).toContain("FAIBLE")
    const amel = connectionChangeLog("faible", "bonne")
    expect(amel.kind).toBe("system")
    expect(amel.level).toBeUndefined()
    expect(amel.text).toContain("RÉTABLIE")
  })
})
