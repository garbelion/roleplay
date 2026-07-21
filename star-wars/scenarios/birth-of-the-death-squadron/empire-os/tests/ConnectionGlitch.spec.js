import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import ConnectionGlitch from "../src/components/ConnectionGlitch.vue"
import { setSessionConfig } from "../src/session-store.js"

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
