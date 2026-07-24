import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import ConnectionGlitch from "../src/components/ConnectionGlitch.vue"
import { setSessionConfig } from "../src/session-store.js"
import { glitchBurst } from "../src/connection.js"

describe("ConnectionGlitch.vue", () => {
  it("aucune perturbation tant que la liaison est 'bonne' ou meilleure", () => {
    setSessionConfig({ connectionQuality: "bonne" })
    expect(mount(ConnectionGlitch).find(".connection-glitch").exists()).toBe(false)
    setSessionConfig({ connectionQuality: "excellente" })
    expect(mount(ConnectionGlitch).find(".connection-glitch").exists()).toBe(false)
  })

  it("intensité croissante : moyenne(1) → faible(2) → critique(3)", () => {
    setSessionConfig({ connectionQuality: "moyenne" })
    expect(mount(ConnectionGlitch).find(".connection-glitch").classes()).toContain("glitch-1")
    setSessionConfig({ connectionQuality: "faible" })
    expect(mount(ConnectionGlitch).find(".connection-glitch").classes()).toContain("glitch-2")
    setSessionConfig({ connectionQuality: "critique" })
    expect(mount(ConnectionGlitch).find(".connection-glitch").classes()).toContain("glitch-3")
  })

  it("le décrochage se matérialise en macroblocs, d'autant plus nombreux que la liaison est mauvaise", () => {
    setSessionConfig({ connectionQuality: "moyenne" })
    const doux = mount(ConnectionGlitch).findAll(".glitch-bloc").length
    setSessionConfig({ connectionQuality: "critique" })
    const dur = mount(ConnectionGlitch).findAll(".glitch-bloc").length
    expect(doux).toBeGreaterThan(0)
    expect(dur).toBeGreaterThan(doux)
  })

  it("la salve dure ce qu'annonce le profil, puis l'image se recompose jusqu'à la suivante", async () => {
    vi.useFakeTimers()
    try {
      setSessionConfig({ connectionQuality: "critique" })
      const wrapper = mount(ConnectionGlitch)
      const profil = glitchBurst("critique")
      const degrade = () => wrapper.find(".connection-glitch").classes().includes("en-salve")

      expect(degrade()).toBe(true) // la liaison lâche d'emblée
      await vi.advanceTimersByTimeAsync(profil.durationMs + 20)
      expect(degrade()).toBe(false) // accalmie : l'image se recompose
      // On franchit la salve suivante (elle s'amorce à periodMs).
      await vi.advanceTimersByTimeAsync(profil.periodMs - profil.durationMs)
      expect(degrade()).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it("re-tire les macroblocs à chaque salve : le décrochage se déplace au lieu de se figer", async () => {
    vi.useFakeTimers()
    try {
      setSessionConfig({ connectionQuality: "critique" })
      const wrapper = mount(ConnectionGlitch)
      const positions = () => wrapper.findAll(".glitch-bloc").map((b) => b.attributes("style"))
      const avant = positions()
      expect(avant.length).toBeGreaterThan(0)

      await vi.advanceTimersByTimeAsync(glitchBurst("critique").periodMs + 50)
      expect(positions()).not.toEqual(avant) // nouvelle salve, nouveaux pavés
    } finally {
      vi.useRealTimers()
    }
  })

  it("à 'critique', une couche peut gêner l'interaction ; pas aux niveaux moindres", () => {
    setSessionConfig({ connectionQuality: "critique" })
    expect(mount(ConnectionGlitch).find(".glitch-interrupt").exists()).toBe(true)
    setSessionConfig({ connectionQuality: "faible" })
    expect(mount(ConnectionGlitch).find(".glitch-interrupt").exists()).toBe(false)
  })

  it("réagit en live au store (une chute de qualité fait apparaître la perturbation)", async () => {
    setSessionConfig({ connectionQuality: "bonne" })
    const wrapper = mount(ConnectionGlitch)
    expect(wrapper.find(".connection-glitch").exists()).toBe(false)
    setSessionConfig({ connectionQuality: "critique" })
    await wrapper.vm.$nextTick()
    expect(wrapper.find(".connection-glitch").exists()).toBe(true)
  })
})
