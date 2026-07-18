import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import BottomDock from "../src/components/BottomDock.vue"
import { formatSessionTime } from "../src/session-log.js"

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
    expect(lines[0].text()).toContain(formatSessionTime(65000)) // 00:01:05
    expect(lines[0].text()).toContain('ACCÈS FICHIER : rapport.md')
    expect(lines[0].classes()).toContain('kind-surveillance')
    expect(lines[1].classes()).toContain('kind-propaganda')
  })

  it("affiche un état vide quand le journal est vide", async () => {
    const wrapper = mount(BottomDock, { props: { log: [] } })
    await openConsole(wrapper)
    expect(wrapper.find('.console-empty').exists()).toBe(true)
    expect(wrapper.findAll('.console-line').length).toBe(0)
  })

  it("teinte la console selon le niveau d'alerte (classe alert-N)", async () => {
    const log = [{ kind: 'system', text: 'x', at: 0 }]
    const wrapper = mount(BottomDock, { props: { log, alertLevel: 3 } })
    await openConsole(wrapper)
    expect(wrapper.find('.console-panel').classes()).toContain('alert-3')
  })
})
