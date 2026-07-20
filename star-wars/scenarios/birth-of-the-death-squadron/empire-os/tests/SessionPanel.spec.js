import { describe, it, expect, afterEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import SessionPanel from "../src/components/SessionPanel.vue"
import { startSessionClock } from "../src/session-clock.js"

// (resetSessionClock est appelé globalement par tests/setup.js après chaque test.)

describe("SessionPanel.vue", () => {
  afterEach(() => vi.useRealTimers())

  it("affiche l'heure d'ouverture, le temps écoulé, le temps restant (2 h) et le niveau d'alerte", () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000_000)
    startSessionClock(52_200, Date.now()) // MJ règle 14:30:00 ; entrée dans l'OS

    const wrapper = mount(SessionPanel, { props: { alertLevel: 2 } })
    expect(wrapper.find(".session-opening").text()).toContain("14:30:00")
    expect(wrapper.find(".session-elapsed").text()).toContain("00:00:00")
    expect(wrapper.find(".session-remaining").text()).toContain("02:00:00")
    const alert = wrapper.find(".session-alert").text()
    expect(alert).toContain("2")
    expect(alert.toLowerCase()).toContain("major") // ALERT_LABELS[2]
  })

  it("regroupe les informations en cards (une par indicateur)", () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000_000)
    startSessionClock(52_200, Date.now())
    const wrapper = mount(SessionPanel, { props: { alertLevel: 0 } })
    // Un card par indicateur : ouverture, écoulé, restant, alerte.
    expect(wrapper.findAll(".session-card")).toHaveLength(4)
    // Chaque indicateur nommé est bien porté par un card.
    expect(wrapper.find(".session-opening").classes()).toContain("session-card")
  })

  it("fait vivre le temps écoulé et le temps restant à la seconde", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000_000)
    startSessionClock(52_200, Date.now())

    const wrapper = mount(SessionPanel, { props: { alertLevel: 0 } })
    vi.advanceTimersByTime(65_000) // +1 min 5 s
    await wrapper.vm.$nextTick()
    expect(wrapper.find(".session-elapsed").text()).toContain("00:01:05")
    expect(wrapper.find(".session-remaining").text()).toContain("01:58:55")
    // L'heure d'ouverture, elle, reste figée.
    expect(wrapper.find(".session-opening").text()).toContain("14:30:00")
  })
})
