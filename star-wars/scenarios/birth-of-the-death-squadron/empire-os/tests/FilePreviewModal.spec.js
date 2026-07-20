import { describe, it, expect, vi, afterEach } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import FilePreviewModal from "../src/components/FilePreviewModal.vue"

// Monte la modale sur un fichier, avec un fetch de contenu mocké, et attend le chargement.
async function open(file, { text = "", ok = true } = {}) {
  global.fetch = vi.fn(() => Promise.resolve({ ok, text: () => Promise.resolve(text) }))
  const wrapper = mount(FilePreviewModal, { props: { file } })
  await flushPromises()
  return wrapper
}

describe("FilePreviewModal.vue", () => {
  afterEach(() => vi.restoreAllMocks())

  it("sans fichier (file=null), ne rend rien", () => {
    const wrapper = mount(FilePreviewModal, { props: { file: null } })
    expect(wrapper.find(".file-modal").exists()).toBe(false)
  })

  it("affiche le nom du fichier dans l'en-tête", async () => {
    const wrapper = await open({ name: "rapport.md", path: "/d/rapport.md", type: "file" }, { text: "x" })
    expect(wrapper.find(".file-modal").text()).toContain("rapport.md")
  })

  it("mode summary : montre le résumé et invite au téléchargement (pas de fetch)", () => {
    const file = { name: "journal.docx", path: "/d/journal.docx", type: "file", previewMode: "summary", summary: "214 entrées clients." }
    const wrapper = mount(FilePreviewModal, { props: { file } })
    expect(wrapper.find(".summary-text").text()).toContain("214 entrées clients.")
    expect(wrapper.find(".download-hint").text().toLowerCase()).toContain("téléchargez")
  })

  it("texte système (.config) : contenu brut, ni Markdown ni HTML interprété", async () => {
    const wrapper = await open({ name: "reseau.config", path: "/d/reseau.config", type: "file" }, { text: "# titre\n<b>x</b>" })
    const raw = wrapper.find(".raw-text")
    expect(raw.exists()).toBe(true)
    expect(raw.text()).toContain("# titre") // le # reste littéral
    expect(raw.text()).toContain("<b>x</b>") // le HTML n'est pas injecté
  })

  it("Markdown (.md) : rendu HTML (titres, table) et # absent en tant que littéral", async () => {
    const md = "# Rapport\n\n## Objectifs\n\n| A | B |\n|---|---|\n| 1 | 2 |"
    const wrapper = await open({ name: "notes.md", path: "/d/notes.md", type: "file" }, { text: md })
    const html = wrapper.find(".modal-content").html()
    expect(html).toContain("<h1>Rapport</h1>")
    expect(html).toContain("<h2>Objectifs</h2>")
    expect(html).toContain("<table>")
    expect(wrapper.find(".modal-content").text()).not.toContain("# Rapport")
  })

  it("binaire inconnu (.dat) : « impossible de prévisualiser » (pas de fetch)", () => {
    const wrapper = mount(FilePreviewModal, { props: { file: { name: "img.dat", path: "/d/img.dat", type: "file" } } })
    expect(wrapper.find(".error").text().toLowerCase()).toContain("impossible de prévisualiser")
  })

  it("image (.png) : rendue inline via <img> à l'URL à plat /fichiers/", () => {
    const wrapper = mount(FilePreviewModal, { props: { file: { name: "photo.png", path: "/d/photo.png", type: "file" } } })
    const img = wrapper.find("img.image-preview")
    expect(img.exists()).toBe(true)
    expect(img.attributes("src")).toBe("/fichiers/photo.png")
  })

  it("fichier introuvable (fetch !ok) : message d'erreur", async () => {
    const wrapper = await open({ name: "notes.md", path: "/d/notes.md", type: "file" }, { ok: false })
    expect(wrapper.find(".modal-content").text()).toContain("Fichier introuvable")
  })

  it("émet `close` au clic sur la croix et sur l'arrière-plan", async () => {
    const wrapper = await open({ name: "reseau.config", path: "/d/reseau.config", type: "file" }, { text: "x" })
    await wrapper.find(".close-button").trigger("click")
    await wrapper.find(".file-modal-overlay").trigger("click")
    expect(wrapper.emitted("close")).toHaveLength(2)
  })
})
