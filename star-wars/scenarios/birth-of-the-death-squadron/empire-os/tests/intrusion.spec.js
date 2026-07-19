import { describe, it, expect } from "vitest"
import { intrusionScreen } from "../src/intrusion.js"

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
