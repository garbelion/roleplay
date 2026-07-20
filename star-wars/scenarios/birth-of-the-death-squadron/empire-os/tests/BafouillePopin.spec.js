import { describe, it, expect, vi, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import BafouillePopin from "../src/components/BafouillePopin.vue"

const FILES = [
  { name: "liste_cibles.md", path: "/user-51394345/home/liste_cibles.md" },
  { name: "protocole_secret.md", path: "/user-51394345/tmp/protocole_secret.md" },
]

describe("BafouillePopin.vue", () => {
  afterEach(() => { delete navigator.clipboard })

  it("présente Bafouille, sa voix (donnée) et la liste des fichiers critiques (nom + chemin)", () => {
    const wrapper = mount(BafouillePopin, {
      props: { files: FILES, message: "Récupérez ces fichiers, vite !" },
    })
    expect(wrapper.find(".bafouille-popin").exists()).toBe(true)
    expect(wrapper.text()).toContain("BAFOUILLE")
    expect(wrapper.find(".bafouille-message").text()).toContain("Récupérez ces fichiers, vite !")

    const items = wrapper.findAll(".bafouille-file")
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain("liste_cibles.md")
    expect(items[0].text()).toContain("/user-51394345/home/liste_cibles.md")
  })

  it("arbore un logo starbird (glyphe $ en police Star Jedi — allégeance rebelle)", () => {
    const wrapper = mount(BafouillePopin, { props: { files: FILES } })
    const star = wrapper.find(".bafouille-starbird")
    expect(star.exists()).toBe(true)
    expect(star.text()).toBe("$") // rendu en insigne rebelle via la police Star Jedi
  })

  it("est persistante : aucun contrôle de fermeture côté joueur", () => {
    const wrapper = mount(BafouillePopin, { props: { files: FILES } })
    expect(wrapper.find(".bafouille-close").exists()).toBe(false)
  })

  it("chaque suggestion offre un bouton copiant le nom du fichier dans le presse-papier", async () => {
    const writeText = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })

    const wrapper = mount(BafouillePopin, { props: { files: FILES } })
    const copyButtons = wrapper.findAll(".bafouille-copy")
    expect(copyButtons).toHaveLength(2)

    await copyButtons[1].trigger("click")
    expect(writeText).toHaveBeenCalledWith("protocole_secret.md") // le nom, pas le chemin
  })

  it("sans fichier critique, l'indique explicitement (pas de liste vide muette)", () => {
    const wrapper = mount(BafouillePopin, { props: { files: [] } })
    expect(wrapper.findAll(".bafouille-file")).toHaveLength(0)
    expect(wrapper.find(".bafouille-empty").exists()).toBe(true)
  })
})
