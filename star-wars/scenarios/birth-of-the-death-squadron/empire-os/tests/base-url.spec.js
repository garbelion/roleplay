import { describe, it, expect } from "vitest"
import { withBase } from "../src/base-url.js"

describe("withBase", () => {
  it("sert à la racine quand le base est '/' (comportement historique)", () => {
    expect(withBase("file-system.json", "/")).toBe("/file-system.json")
    expect(withBase("fichiers/a.md", "/")).toBe("/fichiers/a.md")
  })

  it("préfixe par le sous-chemin de déploiement (ex. GitHub Pages)", () => {
    expect(withBase("file-system.json", "/roleplay/")).toBe("/roleplay/file-system.json")
    expect(withBase("fichiers/a.md", "/roleplay/")).toBe("/roleplay/fichiers/a.md")
  })

  it("tolère un base sans slash final et un chemin avec slash initial (pas de double slash)", () => {
    expect(withBase("/fichiers/a.md", "/roleplay")).toBe("/roleplay/fichiers/a.md")
    expect(withBase("//file-system.json", "/roleplay/")).toBe("/roleplay/file-system.json")
  })

  it("supporte un base relatif ('./', déploiement à la racine d'un sous-domaine)", () => {
    expect(withBase("file-system.json", "./")).toBe("./file-system.json")
  })

  it("utilise import.meta.env.BASE_URL par défaut (='/' sous test)", () => {
    expect(withBase("file-system.json")).toBe("/file-system.json")
  })
})
