import { describe, it, expect } from "vitest"
import {
  escapeXml, unescapeXml, splitRows, splitCells, extractCellText,
  replaceCellText, isDataRow, replaceRowCells,
} from "../tools/journal-crypto/docx-cells.js"

// Fragment calqué sur la vraie structure (Google-docs export) : un <w:t xml:space="preserve">
// porteur + un run vide en fin de cellule, bordures dans <w:tcPr>.
const cell = (text) =>
  `<w:tc><w:tcPr><w:tcBorders><w:top w:sz="4"/></w:tcBorders></w:tcPr>` +
  `<w:p><w:pPr><w:rPr/></w:pPr>` +
  `<w:r><w:rPr><w:rFonts w:ascii="Arial"/><w:sz w:val="14"/></w:rPr>` +
  `<w:t xml:space="preserve">${text}</w:t></w:r>` +
  `<w:r><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc>`

const row = (cells) => `<w:tr><w:trPr><w:cantSplit w:val="1"/></w:trPr>${cells.join("")}</w:tr>`

const dataRow = row([
  cell("Cycle 18 / Jour 058"),
  cell("Technicienne T. Wrey"),
  cell("Ulic Qel-Droma"),
  cell("...Faucheur activé selon calendrier..."),
  cell("Grille M-12, environ 3 jours de trajet de la balise Anaxes"),
])
const headerRow = row([cell("Date"), cell("Auteur"), cell("Client"), cell("Message"), cell("Coordonnées")])

describe("escapeXml / unescapeXml", () => {
  it("échappe et rétablit les caractères réservés", () => {
    const s = `a & b < c > d " e ' f`
    expect(unescapeXml(escapeXml(s))).toBe(s)
    expect(escapeXml("<w:t>")).not.toContain("<w:t>")
  })
})

describe("splitRows / splitCells", () => {
  it("découpe lignes et cellules dans l'ordre", () => {
    const rows = splitRows(headerRow + dataRow)
    expect(rows).toHaveLength(2)
    expect(splitCells(rows[1])).toHaveLength(5)
  })
})

describe("extractCellText", () => {
  it("lit le texte porté par le <w:t> (dé-échappé)", () => {
    expect(extractCellText(cell("Grille L-13, orbite de Fondor"))).toBe("Grille L-13, orbite de Fondor")
    expect(extractCellText(cell("A &amp; B"))).toBe("A & B")
  })
})

describe("isDataRow", () => {
  it("reconnaît une ligne de données par sa date en 1re cellule", () => {
    expect(isDataRow(dataRow)).toBe(true)
  })
  it("rejette la ligne d'en-tête", () => {
    expect(isDataRow(headerRow)).toBe(false)
  })
})

describe("replaceCellText", () => {
  it("remplace le texte en conservant les attributs (xml:space) et la mise en forme", () => {
    const out = replaceCellText(cell("clair"), "AAAABBBBCCCC==")
    expect(extractCellText(out)).toBe("AAAABBBBCCCC==")
    expect(out).toContain('xml:space="preserve"')
    expect(out).toContain('w:ascii="Arial"')
  })
  it("échappe le nouveau texte", () => {
    const out = replaceCellText(cell("x"), "a<b&c")
    expect(out).toContain("a&lt;b&amp;c")
    expect(extractCellText(out)).toBe("a<b&c")
  })
})

describe("replaceRowCells", () => {
  it("ne remplace que les cellules ciblées, ordre préservé", () => {
    const out = replaceRowCells(dataRow, { 3: "MSG_ENC", 4: "COORD_ENC" })
    const cells = splitCells(out)
    expect(extractCellText(cells[0])).toBe("Cycle 18 / Jour 058")
    expect(extractCellText(cells[2])).toBe("Ulic Qel-Droma")
    expect(extractCellText(cells[3])).toBe("MSG_ENC")
    expect(extractCellText(cells[4])).toBe("COORD_ENC")
  })
})
