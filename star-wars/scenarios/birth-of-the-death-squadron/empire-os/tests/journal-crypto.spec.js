import { describe, it, expect } from "vitest"
import { deriveColumnKey, encryptCell, decryptCell, decoyBlob } from "../tools/journal-crypto/crypto.js"

const SECRET = "cle-maitresse-de-tana"
const PASS_MSG = "passphrase-message"
const PASS_COORD = "passphrase-coordonnees"

describe("deriveColumnKey", () => {
  it("dérive une clé AES-128 (16 octets) déterministe", () => {
    const k1 = deriveColumnKey(SECRET, PASS_MSG)
    const k2 = deriveColumnKey(SECRET, PASS_MSG)
    expect(k1).toHaveLength(16)
    expect(k1.equals(k2)).toBe(true)
  })

  it("donne deux clés DIFFÉRENTES pour deux colonnes (même secret, passphrase différente)", () => {
    const kMsg = deriveColumnKey(SECRET, PASS_MSG)
    const kCoord = deriveColumnKey(SECRET, PASS_COORD)
    expect(kMsg.equals(kCoord)).toBe(false)
  })

  it("refuse un secret ou une passphrase vide", () => {
    expect(() => deriveColumnKey("", PASS_MSG)).toThrow()
    expect(() => deriveColumnKey(SECRET, "")).toThrow()
  })
})

describe("encryptCell / decryptCell", () => {
  const key = deriveColumnKey(SECRET, PASS_MSG)

  it("fait un aller-retour fidèle, accents compris", () => {
    const clair = "...essais finaux du châssis en orbite de Fondor. Sécurité renforcée..."
    expect(decryptCell(encryptCell(clair, key), key)).toBe(clair)
  })

  it("produit une sortie base64 différente à chaque appel (IV aléatoire)", () => {
    const clair = "Grille L-13, orbite de Fondor"
    expect(encryptCell(clair, key)).not.toBe(encryptCell(clair, key))
  })

  it("est déterministe à IV fixé (known-answer)", () => {
    const iv = Buffer.alloc(16, 7)
    const a = encryptCell("position de la flotte", key, iv)
    const b = encryptCell("position de la flotte", key, iv)
    expect(a).toBe(b)
    expect(decryptCell(a, key)).toBe("position de la flotte")
  })

  it("ne se déchiffre pas avec la clé de l'autre colonne", () => {
    const kCoord = deriveColumnKey(SECRET, PASS_COORD)
    const blob = encryptCell("message intercepté", key)
    expect(() => decryptCell(blob, kCoord)).toThrow()
  })
})

describe("decoyBlob", () => {
  it("est du base64 valide, non vide, et non réversible (pas de clé)", () => {
    const blob = decoyBlob("Renouvellement trimestriel standard.")
    expect(blob).toMatch(/^[A-Za-z0-9+/]+=*$/)
    expect(Buffer.from(blob, "base64").length).toBeGreaterThanOrEqual(32)
  })

  it("varie d'un appel à l'autre", () => {
    expect(decoyBlob("x")).not.toBe(decoyBlob("x"))
  })

  it("ressemble à du ciphertext AES : longueur = IV(16) + multiple de 16", () => {
    const raw = Buffer.from(decoyBlob("douze caractères ici"), "base64")
    expect((raw.length - 16) % 16).toBe(0)
  })
})
