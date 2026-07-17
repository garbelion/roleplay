import { describe, it, expect } from "vitest"
import { computeTransferDuration } from "../src/transfer-duration.js"

describe("computeTransferDuration", () => {
  const noJitter = () => 0.5 // rng médian -> jitter neutre (×1)

  it("somme la base (10 s) et les poids des fichiers, multiplicateurs neutres", () => {
    const d = computeTransferDuration({
      files: [{ transferWeight: 20 }],
      connectionQuality: "moyenne",
      alertLevel: 0,
      rng: noJitter
    })
    expect(d).toBe(30) // base 10 + poids 20, ×1 ×1 ×1
  })

  it("applique un poids par défaut de 2 s quand la métadonnée est absente", () => {
    const d = computeTransferDuration({
      files: [{}, {}, {}], // 3 fichiers sans transferWeight -> 3 × 2 = 6
      connectionQuality: "moyenne",
      alertLevel: 0,
      rng: noJitter
    })
    expect(d).toBe(16) // base 10 + 6
  })

  it("applique le facteur de qualité de connexion", () => {
    const d = computeTransferDuration({
      files: [{ transferWeight: 20 }], // raw 30
      connectionQuality: "faible", // ×1.8
      alertLevel: 0,
      rng: noJitter
    })
    expect(d).toBe(54) // 30 × 1.8
  })

  it("applique le facteur de niveau d'alerte", () => {
    const d = computeTransferDuration({
      files: [{ transferWeight: 20 }], // raw 30
      connectionQuality: "moyenne",
      alertLevel: 5, // war ×6.5
      rng: noJitter
    })
    expect(d).toBe(195) // 30 × 6.5
  })

  it("applique le jitter aux bornes ±20 %", () => {
    const base = { files: [{ transferWeight: 20 }], connectionQuality: "moyenne", alertLevel: 0 }
    expect(computeTransferDuration({ ...base, rng: () => 0 })).toBe(24) // 30 × 0.8
    expect(computeTransferDuration({ ...base, rng: () => 1 })).toBe(36) // 30 × 1.2
  })

  it("clampe sur [15 s, 20 min]", () => {
    // trop court -> plancher 15 s
    expect(computeTransferDuration({ files: [], rng: noJitter })).toBe(15) // base 10 seul
    // énorme -> plafond 1200 s
    expect(computeTransferDuration({ files: [{ transferWeight: 100000 }], rng: noJitter })).toBe(1200)
  })
})
