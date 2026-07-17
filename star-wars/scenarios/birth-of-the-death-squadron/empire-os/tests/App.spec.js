import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import App from "../src/App.vue"
import { OS } from "../src/os-identity.js"

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

  it("affiche une horloge HH:MM:SS qui s'actualise chaque seconde", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 14, 30, 45))
    const wrapper = mount(App)
    await wrapper.vm.$nextTick()
    const clock = wrapper.find(".os-clock")
    expect(clock.exists()).toBe(true)
    expect(clock.text()).toBe("14:30:45")

    // advanceTimersByTime avance aussi l'horloge système : +1s -> 14:30:46
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    expect(clock.text()).toBe("14:30:46")

    vi.useRealTimers()
  })
})
