// Chirurgie XML pure sur le `word/document.xml` d'un .docx — chaînes uniquement, aucune
// dépendance. On ne touche QU'au texte des cellules ciblées ; toute la mise en forme (styles,
// bordures, en-tête/pied, page de garde, sommaire) est préservée telle quelle.
//
// Le tableau du journal a une structure régulière : chaque cellule <w:tc> porte son texte dans
// un unique <w:t ...>…</w:t>. On remplace le texte de ce <w:t>, on vide les éventuels autres.

const XML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }
const XML_UNESCAPES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", "#34": '"' }

export function escapeXml(text) {
  return text.toString().replace(/[&<>"']/g, (c) => XML_ESCAPES[c])
}

export function unescapeXml(text) {
  return text.replace(/&(amp|lt|gt|quot|apos|#39|#34);/g, (_, e) => XML_UNESCAPES[e])
}

// Blocs <w:tr>…</w:tr> dans l'ordre du document (pas d'imbrication de lignes ici).
export function splitRows(xml) {
  return xml.match(/<w:tr\b[\s\S]*?<\/w:tr>/g) || []
}

// Blocs <w:tc>…</w:tc> d'une ligne, dans l'ordre.
export function splitCells(rowXml) {
  return rowXml.match(/<w:tc\b[\s\S]*?<\/w:tc>/g) || []
}

// Texte affiché d'une cellule = concaténation de ses <w:t>, dé-échappée.
export function extractCellText(cellXml) {
  const parts = cellXml.match(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g) || []
  return parts.map((p) => unescapeXml(p.replace(/^<w:t\b[^>]*>/, "").replace(/<\/w:t>$/, ""))).join("")
}

// Remplace le texte de la cellule : le nouveau texte va dans le PREMIER <w:t> (attributs
// conservés, dont xml:space), les <w:t> suivants sont vidés. Renvoie le XML de cellule modifié.
export function replaceCellText(cellXml, newText) {
  let first = true
  return cellXml.replace(/(<w:t\b[^>]*>)([\s\S]*?)(<\/w:t>)/g, (_, open, __, close) => {
    const inner = first ? escapeXml(newText) : ""
    first = false
    return open + inner + close
  })
}

// Une ligne de données du journal : sa 1re cellule est une date « Cycle N / Jour NNN ».
export function isDataRow(rowXml) {
  const cells = splitCells(rowXml)
  if (!cells.length) return false
  return /^\s*Cycle\s+\d+\s*\/\s*Jour\s+\d+/.test(extractCellText(cells[0]))
}

// Réécrit une ligne en remplaçant le texte des cellules d'indices donnés. `replacements` =
// { index: nouveauTexte }. Reconstruit la ligne cellule par cellule (ordre préservé).
export function replaceRowCells(rowXml, replacements) {
  const cells = splitCells(rowXml)
  let out = rowXml
  cells.forEach((cell, i) => {
    if (i in replacements) {
      out = out.replace(cell, replaceCellText(cell, replacements[i]))
    }
  })
  return out
}
