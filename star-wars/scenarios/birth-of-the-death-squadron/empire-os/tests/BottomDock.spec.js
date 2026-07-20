import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import BottomDock from "../src/components/BottomDock.vue"
import { formatSessionTime } from "../src/session-clock.js"

const openConsole = async (wrapper) => {
  const tab = wrapper.findAll('.dock-tab').find(t => t.text().toLowerCase().includes('console'))
  await tab.trigger('click')
}

describe("BottomDock - onglet Console", () => {
  it("rend les entrées du journal (horodatées + classées par nature)", async () => {
    const log = [
      { kind: 'surveillance', text: 'ACCÈS FICHIER : rapport.md', at: 65000 },
      { kind: 'propaganda', level: 'info', text: "L'EMPIRE VEILLE.", at: 70000 }
    ]
    const wrapper = mount(BottomDock, { props: { log } })
    await openConsole(wrapper)

    const lines = wrapper.findAll('.console-line')
    expect(lines.length).toBe(2)
    // Récent d'abord : la propagande (at 70000) est empilée après la surveillance (at 65000).
    expect(lines[0].classes()).toContain('kind-propaganda')
    expect(lines[1].text()).toContain(formatSessionTime(65000)) // 00:01:05
    expect(lines[1].text()).toContain('ACCÈS FICHIER : rapport.md')
    expect(lines[1].classes()).toContain('kind-surveillance')
  })

  it("affiche l'heure in-game (heure murale) de chaque ligne, ramenée sur 24 h", async () => {
    const DAY = 24 * 3600 * 1000
    const log = [
      { kind: 'system', text: 'MATIN', at: 52_200 * 1000 }, // 14:30:00
      { kind: 'system', text: 'APRÈS MINUIT', at: DAY + 65_000 } // roule au-delà de minuit → 00:01:05
    ]
    const wrapper = mount(BottomDock, { props: { log } })
    await openConsole(wrapper)
    const lines = wrapper.findAll('.console-line')
    expect(lines[0].text()).toContain('00:01:05') // récent d'abord, heure ramenée sur 24 h
    expect(lines[1].text()).toContain('14:30:00')
  })

  it("encadre les messages de propagande de deux logos impériaux (# Star Jedi), pas les autres lignes", async () => {
    const log = [
      { kind: 'surveillance', text: 'ACCÈS FICHIER : x', at: 1000 },
      { kind: 'propaganda', text: "L'EMPIRE VEILLE.", at: 2000 }
    ]
    const wrapper = mount(BottomDock, { props: { log } })
    await openConsole(wrapper)

    const propaganda = wrapper.find('.console-line.kind-propaganda')
    const logos = propaganda.findAll('.console-logo')
    expect(logos).toHaveLength(2) // un de chaque côté du message
    expect(logos.map(l => l.text())).toEqual(['#', '#'])

    // Une ligne non-propagande n'est pas encadrée.
    expect(wrapper.find('.console-line.kind-surveillance .console-logo').exists()).toBe(false)
  })

  it("affiche un état vide quand le journal est vide", async () => {
    const wrapper = mount(BottomDock, { props: { log: [] } })
    await openConsole(wrapper)
    expect(wrapper.find('.console-empty').exists()).toBe(true)
    expect(wrapper.findAll('.console-line').length).toBe(0)
  })

  it("ouvre sur l'onglet Console par défaut (pas de clic requis)", () => {
    const wrapper = mount(BottomDock, { props: { log: [] } })
    expect(wrapper.find('.console-panel').exists()).toBe(true)
    expect(wrapper.find('.search-panel').exists()).toBe(false)
    const active = wrapper.find('.dock-tab.active')
    expect(active.text()).toBe('Console')
  })

  it("affiche les messages les plus récents en premier", async () => {
    const log = [
      { kind: 'system', text: 'ANCIEN', at: 1000 },
      { kind: 'system', text: 'RÉCENT', at: 2000 }
    ]
    const wrapper = mount(BottomDock, { props: { log } })
    await openConsole(wrapper)
    const lines = wrapper.findAll('.console-line')
    expect(lines[0].text()).toContain('RÉCENT')
    expect(lines[1].text()).toContain('ANCIEN')
  })

  it("l'onglet Session rend le panneau de session (état temporel)", async () => {
    const wrapper = mount(BottomDock, { props: { log: [], alertLevel: 1 } })
    const tab = wrapper.findAll('.dock-tab').find(t => t.text().toLowerCase().includes('session'))
    await tab.trigger('click')
    expect(wrapper.find('.session-info').exists()).toBe(true)
    expect(wrapper.find('.dock-placeholder').exists()).toBe(false)
  })

  it("teinte la console selon le niveau d'alerte (classe alert-N)", async () => {
    const log = [{ kind: 'system', text: 'x', at: 0 }]
    const wrapper = mount(BottomDock, { props: { log, alertLevel: 3 } })
    await openConsole(wrapper)
    expect(wrapper.find('.console-panel').classes()).toContain('alert-3')
  })
})
