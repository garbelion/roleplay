// Chiffrement du journal (d), pur et testable — outil dev-only (jamais importé par l'app,
// jamais embarqué dans le bundle : il ne produit QUE du ciphertext côté public/).
//
// Modèle (ROADMAP §7) : deux colonnes chiffrées — Message et Coordonnées — avec **la même
// clé maîtresse dérivée de deux façons différentes** (une passphrase par colonne). AES-128-CBC,
// IV aléatoire préfixé, sortie base64. Le déchiffrement se joue à la table (aucune clé dans le
// bundle) ; ce module sert au MJ à *produire* le docx chiffré et à régénérer sa feuille en clair.

import { pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } from "node:crypto"

const KDF_ITERATIONS = 200000
const KEY_BYTES = 16 // AES-128
const IV_BYTES = 16

// Une clé AES-128 par colonne, dérivée du **même** secret maîtresse via la passphrase de la
// colonne (deux dérivations distinctes → deux clés distinctes, exactement le modèle du scénario).
export function deriveColumnKey(baseSecret, passphrase) {
  const secret = (baseSecret || "").toString()
  const pass = (passphrase || "").toString()
  if (!secret) throw new Error("secret maîtresse requis")
  if (!pass) throw new Error("passphrase de colonne requise")
  // passphrase = sel de dérivation : même secret + sel différent ⇒ clé différente par colonne.
  return pbkdf2Sync(secret, pass, KDF_ITERATIONS, KEY_BYTES, "sha256")
}

// AES-128-CBC. Renvoie base64(IV || ciphertext). L'IV est aléatoire par défaut ; on peut
// l'injecter pour des tests déterministes (known-answer).
export function encryptCell(plaintext, key, iv = randomBytes(IV_BYTES)) {
  const cipher = createCipheriv("aes-128-cbc", key, iv)
  const enc = Buffer.concat([cipher.update(plaintext.toString(), "utf8"), cipher.final()])
  return Buffer.concat([Buffer.from(iv), enc]).toString("base64")
}

// Inverse d'encryptCell : sert au MJ à régénérer la feuille déchiffrée à partir du docx du bundle.
export function decryptCell(blob, key) {
  const raw = Buffer.from(blob.toString(), "base64")
  const iv = raw.subarray(0, IV_BYTES)
  const enc = raw.subarray(IV_BYTES)
  const decipher = createDecipheriv("aes-128-cbc", key, iv)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8")
}

// Blob décoratif, **non réversible par conception**, pour les entrées d'autres clients :
// dans la fiction elles sont chiffrées par la clé de leur technicien (absente du bundle).
// Même charset (base64) et longueur alignée sur le plaintext (blocs CBC de 16) que du vrai
// ciphertext, pour un rendu indiscernable. Le plaintext « de secours » reste côté MJ dans
// journal_complet.json si les joueurs l'obtiennent en jeu (corruption / otage).
export function decoyBlob(plaintext, rng = randomBytes) {
  const len = plaintext.toString().length
  const blocks = Math.floor(len / 16) + 1 // padding PKCS#7 : toujours au moins un bloc de plus
  return Buffer.concat([rng(IV_BYTES), rng(blocks * 16)]).toString("base64")
}
