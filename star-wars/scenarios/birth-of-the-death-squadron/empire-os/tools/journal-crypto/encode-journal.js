// Génère, à partir d'une source UNIQUE (docs/journal_complet.json + le gabarit riche
// docs/d_journal_decrypte.docx) :
//   1) le docx CHIFFRÉ pour le bundle  -> empire-os/public/fichiers/<outputDocx>
//        (colonnes Message + Coordonnées : vrai AES-128 pour les entrées de Tana [type "faux"],
//         blobs décoratifs pour les autres clients [type "réel"]) ;
//   2) la feuille MJ déchiffrée-filtrée -> docs/<mjSheet> (uniquement les entrées de Tana,
//        en clair, à imprimer et remettre aux joueurs après le déchiffrement à la table).
//
// Dev-only. Aucune clé n'atterrit dans public/ : seul du ciphertext y est écrit.
// Usage : `npm run journal:encode`  (depuis empire-os/).

import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import JSZip from "jszip"

import { CONFIG } from "./config.js"
import { deriveColumnKey, encryptCell, decryptCell, decoyBlob } from "./crypto.js"
import { splitRows, splitCells, extractCellText, isDataRow, replaceRowCells } from "./docx-cells.js"

const here = path.dirname(fileURLToPath(import.meta.url)) // …/empire-os/tools/journal-crypto
const empireRoot = path.resolve(here, "../..") // …/empire-os
const docsDir = path.resolve(empireRoot, "../docs") // …/birth-of-the-death-squadron/docs
const fichiersDir = path.resolve(empireRoot, "public/fichiers")

const norm = (s) => s.toString().replace(/\s+/g, " ").trim()

async function main() {
  const entries = JSON.parse(readFileSync(path.join(docsDir, CONFIG.journalJson), "utf8"))
    .slice()
    .sort((a, b) => a.ligne - b.ligne)

  const keyMsg = deriveColumnKey(CONFIG.baseSecret, CONFIG.passphraseMessage)
  const keyCoord = deriveColumnKey(CONFIG.baseSecret, CONFIG.passphraseCoord)

  // --- 1) docx chiffré (transformation chirurgicale du gabarit) ---
  const templateBuf = readFileSync(path.join(docsDir, CONFIG.templateDocx))
  const zip = await JSZip.loadAsync(templateBuf)
  let xml = await zip.file("word/document.xml").async("string")

  const dataRows = splitRows(xml).filter(isDataRow)
  if (dataRows.length !== entries.length) {
    throw new Error(
      `Incohérence : ${dataRows.length} lignes de données dans le docx vs ${entries.length} entrées JSON.`,
    )
  }

  const MSG = 3
  const COORD = 4
  let encFaux = 0
  let blobbed = 0

  dataRows.forEach((row, i) => {
    const entry = entries[i]
    const cells = splitCells(row)
    // Garde-fou : le gabarit et le JSON doivent parler de la même ligne.
    if (norm(extractCellText(cells[MSG])) !== norm(entry.message)) {
      throw new Error(`Ligne ${entry.ligne} : Message docx ≠ JSON.\n docx: ${extractCellText(cells[MSG])}\n json: ${entry.message}`)
    }
    if (norm(extractCellText(cells[COORD])) !== norm(entry.coordonnees)) {
      throw new Error(`Ligne ${entry.ligne} : Coordonnées docx ≠ JSON.`)
    }

    let newMsg
    let newCoord
    if (entry.type === "faux") {
      newMsg = encryptCell(entry.message, keyMsg)
      newCoord = encryptCell(entry.coordonnees, keyCoord)
      encFaux += 1
      // Vérif « ciphertext honnête » : aller-retour sur cette cellule.
      if (decryptCell(newMsg, keyMsg) !== entry.message) throw new Error(`AR chiffrement KO ligne ${entry.ligne}`)
    } else {
      newMsg = decoyBlob(entry.message)
      newCoord = decoyBlob(entry.coordonnees)
      blobbed += 1
    }
    xml = xml.replace(row, replaceRowCells(row, { [MSG]: newMsg, [COORD]: newCoord }))
  })

  // Immersion : l'intro ne doit pas prétendre que le doc est « en clair ».
  if (xml.includes(CONFIG.faultyIntro)) {
    xml = xml.replace(CONFIG.faultyIntro, CONFIG.lockedIntro)
  }

  zip.file("word/document.xml", xml)
  const outBuf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
  const outPath = path.join(fichiersDir, CONFIG.outputDocx)
  writeFileSync(outPath, outBuf)

  // --- 2) feuille MJ : entrées de Tana (type "faux") en clair, à imprimer ---
  const tana = entries.filter((e) => e.type === "faux")
  const md = renderMjSheet(tana)
  const mjPath = path.join(docsDir, CONFIG.mjSheet)
  writeFileSync(mjPath, md, "utf8")

  console.log(`✔ docx chiffré      : ${path.relative(empireRoot, outPath)}`)
  console.log(`   • entrées Tana (AES réversible) : ${encFaux}`)
  console.log(`   • entrées leurres (blobs)        : ${blobbed}`)
  console.log(`✔ feuille MJ (clair) : ${path.relative(empireRoot, mjPath)}  (${tana.length} entrées de Tana)`)
}

function renderMjSheet(tana) {
  const esc = (s) => (s || "").toString().replace(/\|/g, "\\|")
  const rows = tana
    .map(
      (e) =>
        `| ${e.date} | ${esc(e.client)} | ${e.sous_type || ""} | ${esc(e.message)} | ${esc(e.coordonnees)} |`,
    )
    .join("\n")
  return `# Journal (d) — feuille MJ déchiffrée (entrées de Tana)

> **Confidentiel MJ.** Version en clair, filtrée sur les seules entrées cachées par Tana
> (colonnes Message + Coordonnées déchiffrées). À imprimer et remettre aux joueurs **après**
> la réussite du déchiffrement à la table. Généré par \`npm run journal:encode\` — ne pas éditer
> à la main (régénéré à chaque passe).

| Date | Client (alias) | Nature | Message déchiffré | Coordonnées déchiffrées |
|---|---|---|---|---|
${rows}
`
}

main().catch((err) => {
  console.error("[X] Échec encode-journal :", err.message)
  process.exit(1)
})
