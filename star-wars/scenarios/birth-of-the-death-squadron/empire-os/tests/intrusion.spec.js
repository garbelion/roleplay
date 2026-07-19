import { describe, it, expect } from "vitest"
import { intrusionScreen, isRefus, asciiBanner } from "../src/intrusion.js"

describe("intrusionScreen", () => {
  const intrusion = {
    station: "Kessel-Tho",
    screens: {
      public_ok: {
        lignes: ["ACCÈS {station} : ACCORDÉ", "handshake établi"],
        banniere: "RÉSEAU IMPÉRIAL PUBLIC — {station}",
      },
    },
  }

  it("renvoie l'écran de l'état demandé, avec {station} interpolé (bannière + lignes)", () => {
    expect(intrusionScreen(intrusion, "public_ok")).toEqual({
      lignes: ["ACCÈS Kessel-Tho : ACCORDÉ", "handshake établi"],
      banniere: "RÉSEAU IMPÉRIAL PUBLIC — Kessel-Tho",
    })
  })

  it("renvoie null pour un état inconnu ou une config d'intrusion absente", () => {
    expect(intrusionScreen(intrusion, "interne_ok")).toBe(null)
    expect(intrusionScreen(undefined, "public_ok")).toBe(null)
  })
})

describe("asciiBanner", () => {
  it("encadre le texte dans une boîte ASCII de 3 lignes alignées", () => {
    const [top, mid, bottom] = asciiBanner("Kessel-Tho")
    // ligne du milieu = texte entouré, source de vérité indépendante de l'impl
    expect(mid).toBe("|* Kessel-Tho *|")
    // les trois lignes ont la même largeur (encadré aligné)
    expect(top.length).toBe(mid.length)
    expect(bottom.length).toBe(mid.length)
    // coins de l'encadré
    expect(top.startsWith("/")).toBe(true)
    expect(top.endsWith("|")).toBe(true)
    expect(bottom.startsWith("|")).toBe(true)
    expect(bottom.endsWith("/")).toBe(true)
    // bordures haut/bas pleines d'étoiles
    expect(top.slice(1, -1)).toBe("*".repeat(mid.length - 2))
    expect(bottom.slice(1, -1)).toBe("*".repeat(mid.length - 2))
  })
})

describe("isRefus", () => {
  it("reconnaît les écrans d'échec (convention *_refus)", () => {
    expect(isRefus("public_refus")).toBe(true)
    expect(isRefus("os_refus")).toBe(true)
    expect(isRefus("interne_ok")).toBe(false)
    expect(isRefus("boot")).toBe(false)
    expect(isRefus(undefined)).toBe(false)
  })
})
