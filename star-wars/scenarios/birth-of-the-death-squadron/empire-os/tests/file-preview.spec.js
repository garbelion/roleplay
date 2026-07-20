import { describe, it, expect } from "vitest"
import { previewKindFor, fileUrl } from "../src/file-preview.js"

describe("fileUrl", () => {
  it("adresse le fichier à plat dans /fichiers/ par son nom de base (dérivé du chemin)", () => {
    expect(fileUrl({ name: "a.md", path: "/user-51394345/home/a.md" })).toBe("/fichiers/a.md")
    expect(fileUrl({ name: "photo.png", path: "/d/photo.png" })).toBe("/fichiers/photo.png")
  })
})

describe("previewKindFor", () => {
  it("previewMode 'summary' prime sur l'extension", () => {
    expect(previewKindFor({ name: "note.md", previewMode: "summary" })).toBe("summary")
  })

  it("route par extension : markdown / texte système / image / binaire", () => {
    expect(previewKindFor({ name: "rapport.md" })).toBe("markdown")
    expect(previewKindFor({ name: "reseau.config" })).toBe("text")
    expect(previewKindFor({ name: "a.json" })).toBe("text")
    expect(previewKindFor({ name: "photo.webp" })).toBe("image")
    expect(previewKindFor({ name: "blob.dat" })).toBe("binary")
    expect(previewKindFor({ name: "sans_extension" })).toBe("binary")
  })

  it("docs riches : rendu inline mammoth seulement pour un .docx en previewMode 'full', sinon résumé", () => {
    expect(previewKindFor({ name: "journal.docx", previewMode: "full" })).toBe("docx")
    expect(previewKindFor({ name: "journal.docx" })).toBe("summary")
    expect(previewKindFor({ name: "tableur.xlsx", previewMode: "full" })).toBe("summary") // full ne rend inline que .docx
    expect(previewKindFor({ name: "vieux.doc" })).toBe("summary")
  })
})
