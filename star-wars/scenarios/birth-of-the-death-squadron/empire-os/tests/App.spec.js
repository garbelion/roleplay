import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import App from "../src/App.vue"
import IntrusionShell from "../src/components/IntrusionShell.vue"
import { OS } from "../src/os-identity.js"
import { notify } from "../src/notifications.js"
import { setSessionConfig, sessionState } from "../src/session-store.js"

const mockFS = { name: "root", path: "/", type: "directory", children: [] }

beforeEach(() => {
  global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(mockFS) }))
})

// Monte l'App directement dans l'OS (intrusion=os) et attend la fin du boot.
async function mountOs(options) {
  setSessionConfig({ intrusion: "os" })
  const wrapper = mount(App, options)
  await flushPromises()
  return wrapper
}

describe("App.vue - Routage (MJ / intrusion / OS)", () => {
  afterEach(() => { window.location.hash = "" })

  it("affiche la page MJ sur #/mj (ni OS ni shell)", () => {
    window.location.hash = "#/mj"
    const wrapper = mount(App, { global: { stubs: { MjPanel: true } } })
    expect(wrapper.find(".dos-title-bar").exists()).toBe(false)
    expect(wrapper.findComponent({ name: "MjPanel" }).exists()).toBe(true)
  })

  it("par défaut (intrusion=boot), affiche le shell d'intrusion, pas l'OS", async () => {
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.findComponent(IntrusionShell).exists()).toBe(true)
    expect(wrapper.find(".dos-title-bar").exists()).toBe(false)
  })

  it("quand intrusion=os, affiche l'OS, pas le shell d'intrusion", async () => {
    const wrapper = await mountOs()
    expect(wrapper.find(".dos-title-bar").exists()).toBe(true)
    expect(wrapper.findComponent(IntrusionShell).exists()).toBe(false)
  })

  it("tant que le boot n'est pas terminé, affiche l'écran d'amorçage (ni OS ni shell)", () => {
    global.fetch = vi.fn(() => new Promise(() => {})) // ne résout jamais
    const wrapper = mount(App)
    expect(wrapper.find(".os-boot").exists()).toBe(true)
    expect(wrapper.find(".dos-title-bar").exists()).toBe(false)
    expect(wrapper.findComponent(IntrusionShell).exists()).toBe(false)
  })

  it("applique les réglages de session depuis file-system.json au démarrage", async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({ ...mockFS, session: { connectionQuality: "critique", alertLevel: 3 } })
    }))
    mount(App)
    await flushPromises()
    expect(sessionState).toMatchObject({ connectionQuality: "critique", alertLevel: 3 })
  })
})

describe("App.vue - Skin / chrome impérial (dans l'OS)", () => {
  it("affiche le nom et la version de l'OS dans la barre de titre", async () => {
    const wrapper = await mountOs()
    const bar = wrapper.find(".dos-title-bar")
    expect(bar.text()).toContain(OS.name)
    expect(bar.text()).toContain(OS.version)
  })

  it("affiche un logo impérial (# en police Star Jedi) dans la barre de titre", async () => {
    const wrapper = await mountOs()
    const logo = wrapper.find(".dos-title-bar .os-logo")
    expect(logo.exists()).toBe(true)
    expect(logo.text()).toBe("#")
  })

  it("affiche une horloge de session (durée écoulée) démarrant à 00:00:00", async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(2026, 0, 1, 14, 30, 45))
      setSessionConfig({ intrusion: "os" })
      const wrapper = mount(App)
      await flushPromises()
      const clock = wrapper.find(".os-clock")
      expect(clock.text()).toBe("00:00:00")

      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()
      expect(clock.text()).toBe("00:00:01")

      vi.advanceTimersByTime(3600 * 1000) // +1h
      await wrapper.vm.$nextTick()
      expect(clock.text()).toBe("01:00:01")
    } finally {
      vi.useRealTimers()
    }
  })

  it("démarre l'horloge depuis l'heure réglée par le MJ (clockStart) et la fait avancer", async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(2026, 0, 1, 10, 0, 0))
      setSessionConfig({ intrusion: "os", clockStart: 3661 }) // 01:01:01
      const wrapper = mount(App)
      await flushPromises()
      expect(wrapper.find(".os-clock").text()).toBe("01:01:01")

      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find(".os-clock").text()).toBe("01:01:02")
    } finally {
      vi.useRealTimers()
    }
  })

  it("ne démarre l'horloge qu'à l'entrée dans l'OS (pas au chargement pendant l'intrusion)", async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(2026, 0, 1, 10, 0, 0))
      setSessionConfig({ intrusion: "boot" }) // on démarre dans la phase d'intrusion
      const wrapper = mount(App)
      await flushPromises()

      vi.advanceTimersByTime(5000) // 5 s s'écoulent avant l'entrée dans l'OS
      setSessionConfig({ intrusion: "os" }) // entrée dans EmpireOS maintenant
      await wrapper.vm.$nextTick()
      // l'horloge démarre à l'entrée, pas au chargement : elle repart de la base (0)
      expect(wrapper.find(".os-clock").text()).toBe("00:00:00")

      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find(".os-clock").text()).toBe("00:00:01")
    } finally {
      vi.useRealTimers()
    }
  })

  it("déconnecte automatiquement les joueurs de l'OS au bout de 2 h", async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(2026, 0, 1, 10, 0, 0))
      setSessionConfig({ intrusion: "os" })
      const wrapper = mount(App)
      await flushPromises()
      expect(wrapper.find(".dos-title-bar").exists()).toBe(true)
      expect(wrapper.find(".os-disconnected").exists()).toBe(false)

      vi.advanceTimersByTime(2 * 3600 * 1000) // durée max atteinte
      await wrapper.vm.$nextTick()
      expect(wrapper.find(".os-disconnected").exists()).toBe(true)
      expect(wrapper.find(".dos-title-bar").exists()).toBe(false) // OS masqué
    } finally {
      vi.useRealTimers()
    }
  })

  it("un Reset MJ (intrusion→boot) ramène au shell d'intrusion après la déconnexion auto", async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(2026, 0, 1, 10, 0, 0))
      setSessionConfig({ intrusion: "os" })
      const wrapper = mount(App)
      await flushPromises()
      vi.advanceTimersByTime(2 * 3600 * 1000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find(".os-disconnected").exists()).toBe(true)

      setSessionConfig({ intrusion: "boot" }) // Reset MJ
      await wrapper.vm.$nextTick()
      expect(wrapper.find(".os-disconnected").exists()).toBe(false)
      expect(wrapper.findComponent(IntrusionShell).exists()).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it("affiche un filigrane du logo impérial en fond (décoratif)", async () => {
    const wrapper = await mountOs()
    const mark = wrapper.find(".os-watermark")
    expect(mark.exists()).toBe(true)
    expect(mark.text()).toBe("#")
    expect(mark.attributes("aria-hidden")).toBe("true")
  })

  it("affiche un badge d'alerte dans le chrome dès que alertLevel > 0 (live)", async () => {
    const wrapper = await mountOs()
    expect(wrapper.find(".os-alert").exists()).toBe(false) // niveau 0 par défaut

    setSessionConfig({ alertLevel: 2 }) // simule un push back-office
    await wrapper.vm.$nextTick()
    const badge = wrapper.find(".os-alert")
    expect(badge.exists()).toBe(true)
    expect(badge.text().toLowerCase()).toContain("major") // ALERT_LABELS[2]
  })

  it("affiche la popin de Bafouille dans l'OS quand le MJ la déclenche (fichiers critiques + voix)", async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({
        ...mockFS,
        bafouille: { message: "C'est Bafouille, prends ça !" },
        children: [{
          name: "user-51394345", type: "disk",
          children: [{ name: "liste_cibles.md", type: "file", isCritical: true }]
        }]
      })
    }))
    setSessionConfig({ intrusion: "os", bafouille: true })
    const wrapper = mount(App)
    await flushPromises()

    const popin = wrapper.find(".bafouille-popin")
    expect(popin.exists()).toBe(true)
    expect(popin.text()).toContain("C'est Bafouille, prends ça !")
    expect(popin.text()).toContain("liste_cibles.md")
    expect(popin.text()).toContain("/user-51394345/liste_cibles.md")

    // Le MJ coupe l'intervention → la popin disparaît (piloté par le store réactif).
    setSessionConfig({ bafouille: false })
    await wrapper.vm.$nextTick()
    expect(wrapper.find(".bafouille-popin").exists()).toBe(false)
  })

  it("affiche une notification à l'écran pour un message non-surveillance", async () => {
    const wrapper = await mountOs()
    notify({ kind: "propaganda", text: "ALERTE PROPAGANDE" })
    await wrapper.vm.$nextTick()
    const texts = wrapper.findAll(".os-notification").map(n => n.text())
    expect(texts.some(t => t.includes("ALERTE PROPAGANDE"))).toBe(true)
  })

  it("encadre les notifications de propagande de deux logos impériaux (#), pas les autres", async () => {
    const wrapper = await mountOs()
    notify({ kind: "propaganda", text: "GLOIRE À L'EMPIRE" })
    notify({ kind: "system", text: "SYSTÈME" })
    await wrapper.vm.$nextTick()

    const propaganda = wrapper.find(".os-notification.kind-propaganda")
    const logos = propaganda.findAll(".os-notif-logo")
    expect(logos.map(l => l.text())).toEqual(["#", "#"]) // un avant, un après
    // Une notification non-propagande n'est pas encadrée.
    expect(wrapper.find(".os-notification.kind-system .os-notif-logo").exists()).toBe(false)
  })
})
