// Aiguilleur d'affichage : décide COMMENT prévisualiser un fichier, à partir de sa seule
// métadonnée (`name` + `previewMode`). Pur et testable — l'explorateur ne fait que le câbler.
// `previewMode: 'summary'` (métadonnée MJ) prime sur l'extension.
//
// Renvoie : 'summary' | 'markdown' | 'text' | 'image' | 'docx' | 'binary'.

const TEXT_EXTS = ['json', 'ini', 'config', 'log', 'txt']
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']
const RICH_DOC_EXTS = ['docx', 'doc', 'xlsx', 'pptx', 'pdf']

export function previewKindFor(file) {
  if (file.previewMode === 'summary') return 'summary'
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (ext === 'md') return 'markdown'
  if (TEXT_EXTS.includes(ext)) return 'text' // canal de fouille : brut, échappé
  if (IMAGE_EXTS.includes(ext)) return 'image' // rendues inline via <img>
  // Docs riches (Office/PDF) : `previewMode: 'full'` -> rendu inline (mammoth pour .docx) ;
  // sinon téléchargement forcé via résumé (défaut, ex. le journal (d) verrouillé).
  if (RICH_DOC_EXTS.includes(ext)) {
    return file.previewMode === 'full' && ext === 'docx' ? 'docx' : 'summary'
  }
  return 'binary'
}
