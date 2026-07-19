import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import IntrusionShell from "../src/components/IntrusionShell.vue"
import { setSessionConfig, resetSessionState } from "../src/session-store.js"

const FIXTURE = {
  station: "Kessel-Tho",
  screens: {
    boot: { lignes: ["> lien…", "> attente…"], banniere: "LIAISON — {station}" },
    public_ok: { lignes: ["> a", "> b", "> c"], banniere: "PUBLIC — {station}" },
    interne_refus: { lignes: ["> rejet"], banniere: "ACCÈS REFUSÉ" },
  },
}

describe("IntrusionShell.vue", () => {
  beforeEach(() => resetSessionState())

  it("au chargement, affiche directement l'écran de repos (toutes les lignes + bannière interpolée)", () => {
    setSessionConfig({ intrusion: "public_ok" })
    const wrapper = mount(IntrusionShell, { props: { intrusion: FIXTURE } })
    expect(wrapper.findAll(".intrusion-line")).toHaveLength(3)
    expect(wrapper.find(".intrusion-banner").text()).toBe("PUBLIC — Kessel-Tho")
  })

  it("au changement d'état (push MJ), rejoue le défilement depuis zéro puis atteint le repos", async () => {
    vi.useFakeTimers()
    try {
      setSessionConfig({ intrusion: "boot" })
      const wrapper = mount(IntrusionShell, { props: { intrusion: FIXTURE } })
      // repos immédiat : boot montré en entier sans avancer le temps (pas de replay au chargement)
      expect(wrapper.findAll(".intrusion-line")).toHaveLength(2)

      setSessionConfig({ intrusion: "public_ok" }) // simule un push
      await wrapper.vm.$nextTick()
      // le défilement repart de zéro
      expect(wrapper.findAll(".intrusion-line")).toHaveLength(0)
      expect(wrapper.find(".intrusion-banner").exists()).toBe(false) // bannière retenue tant que ça défile

      await vi.advanceTimersByTimeAsync(2000)
      // atteint le repos : les 3 lignes + la bannière
      expect(wrapper.findAll(".intrusion-line")).toHaveLength(3)
      expect(wrapper.find(".intrusion-banner").exists()).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it("teinte les écrans d'échec (classe refus) et pas les autres", () => {
    setSessionConfig({ intrusion: "interne_refus" })
    const refus = mount(IntrusionShell, { props: { intrusion: FIXTURE } })
    expect(refus.find(".intrusion").classes()).toContain("refus")

    resetSessionState()
    setSessionConfig({ intrusion: "public_ok" })
    const ok = mount(IntrusionShell, { props: { intrusion: FIXTURE } })
    expect(ok.find(".intrusion").classes()).not.toContain("refus")
  })
})
