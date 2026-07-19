import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import IntrusionShell from "../src/components/IntrusionShell.vue"
import { setSessionConfig, resetSessionState } from "../src/session-store.js"
import { OS } from "../src/os-identity.js"

const FIXTURE = {
  station: "Kessel-Tho",
  screens: {
    boot: { lignes: ["> lien…", "> attente…"], banniere: "LIAISON — {station}" },
    public_ok: { lignes: ["> a", "> b", "> c"], banniere: "PUBLIC — {station}" },
    interne_refus: { lignes: ["> rejet"], banniere: "ACCÈS REFUSÉ" },
  },
}

const mountShell = () => mount(IntrusionShell, { props: { intrusion: FIXTURE } })

describe("IntrusionShell.vue", () => {
  beforeEach(() => resetSessionState())

  it("habille la barre de titre avec l'identité EmpireOS (logo impérial + nom + version)", () => {
    setSessionConfig({ intrusion: "boot" })
    const wrapper = mountShell()
    const bar = wrapper.find(".intrusion-titlebar")
    expect(bar.find(".intrusion-logo").text()).toBe("#") // rendu en glyphe impérial (Star Jedi)
    expect(bar.text()).toContain(OS.name)
    expect(bar.text()).toContain(OS.version)
  })

  it("au chargement, amorce la console avec l'écran courant au repos (lignes + bannière interpolée)", () => {
    setSessionConfig({ intrusion: "public_ok" })
    const wrapper = mountShell()
    expect(wrapper.findAll(".intrusion-line")).toHaveLength(3)
    const banner = wrapper.find(".intrusion-banner").text()
    expect(banner).toContain("PUBLIC — Kessel-Tho")
    expect(banner).toContain("|*") // rendu en encadré ASCII, comme des lignes de console
  })

  it("un changement d'état AJOUTE à la console sans effacer l'historique, en animant les nouvelles lignes", async () => {
    vi.useFakeTimers()
    try {
      setSessionConfig({ intrusion: "boot" })
      const wrapper = mountShell()
      expect(wrapper.findAll(".intrusion-line")).toHaveLength(2) // boot au repos

      setSessionConfig({ intrusion: "public_ok" }) // push MJ
      await wrapper.vm.$nextTick()
      // l'historique boot est conservé ; le nouvel écran n'est pas encore défilé
      expect(wrapper.findAll(".intrusion-line")).toHaveLength(2)

      await vi.advanceTimersByTimeAsync(2000)
      // boot (2) + public_ok (3) accumulés
      expect(wrapper.findAll(".intrusion-line")).toHaveLength(5)
      const banners = wrapper.findAll(".intrusion-banner").map((b) => b.text())
      expect(banners.some((b) => b.includes("LIAISON — Kessel-Tho"))).toBe(true)
      expect(banners.some((b) => b.includes("PUBLIC — Kessel-Tho"))).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it("affiche les blocs en ordre anti-chronologique (le plus récent en tête)", async () => {
    setSessionConfig({ intrusion: "boot" })
    const wrapper = mountShell()
    setSessionConfig({ intrusion: "public_ok" })
    await wrapper.vm.$nextTick()

    const blocks = wrapper.findAll(".intrusion-block")
    expect(blocks[0].attributes("data-state")).toBe("public_ok") // le plus récent d'abord
    expect(blocks[1].attributes("data-state")).toBe("boot")
  })

  it("teinte le bloc d'un écran d'échec (refus) et pas celui d'un succès", () => {
    setSessionConfig({ intrusion: "interne_refus" })
    expect(mountShell().find(".intrusion-block").classes()).toContain("refus")

    resetSessionState()
    setSessionConfig({ intrusion: "public_ok" })
    expect(mountShell().find(".intrusion-block").classes()).not.toContain("refus")
  })
})
