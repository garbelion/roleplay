import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import App from "../src/App.vue"
import { OS } from "../src/os-identity.js"
import { notify } from "../src/notifications.js"

const mockFS = { name: "root", path: "/", type: "directory", children: [] }

beforeEach(() => {
  global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(mockFS) }))
})

describe("App.vue - Skin / chrome impérial", () => {
  it("affiche le nom et la version de l'OS dans la barre de titre", () => {
    const wrapper = mount(App)
    const bar = wrapper.find(".dos-title-bar")
    expect(bar.exists()).toBe(true)
    expect(bar.text()).toContain(OS.name)
    expect(bar.text()).toContain(OS.version)
  })

  it("affiche un logo impérial (# en police Star Jedi) dans la barre de titre", () => {
    const wrapper = mount(App)
    const logo = wrapper.find(".dos-title-bar .os-logo")
    expect(logo.exists()).toBe(true)
    expect(logo.text()).toBe("#") // rendu en glyphe impérial par la police Star Jedi
  })

  it("affiche une horloge de session (durée écoulée) démarrant à 00:00:00", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 14, 30, 45))
    const wrapper = mount(App)
    await wrapper.vm.$nextTick()
    const clock = wrapper.find(".os-clock")
    expect(clock.exists()).toBe(true)
    // Durée de session, pas l'heure murale : démarre à zéro.
    expect(clock.text()).toBe("00:00:00")

    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    expect(clock.text()).toBe("00:00:01")

    vi.advanceTimersByTime(3600 * 1000) // +1h
    await wrapper.vm.$nextTick()
    expect(clock.text()).toBe("01:00:01")

    vi.useRealTimers()
  })

  it("affiche une notification à l'écran pour un message non-surveillance", async () => {
    const wrapper = mount(App)
    await flushPromises()
    notify({ kind: "propaganda", text: "ALERTE PROPAGANDE" })
    await wrapper.vm.$nextTick()
    const texts = wrapper.findAll(".os-notification").map(n => n.text())
    expect(texts).toContain("ALERTE PROPAGANDE")
  })
})
