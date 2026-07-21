import { describe, it, expect, vi } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import MjPanel from "../src/components/MjPanel.vue"

// Fausses opérations MJ (contrat { signIn, fetchState, updateState }) injectées au panneau.
function fakeOps({ signInOk = true, state = { connectionQuality: "moyenne", alertLevel: 0 } } = {}) {
  return {
    signIn: vi.fn(async (email, password) => { if (!signInOk) throw new Error("Identifiants invalides"); return { email } }),
    fetchState: vi.fn(async () => state),
    updateState: vi.fn(async () => {})
  }
}

const mountPanel = (ops) => mount(MjPanel, { props: { ops } })

async function login(ops) {
  const wrapper = mountPanel(ops)
  await wrapper.find(".mj-login input[type=email]").setValue("mj@example.com")
  await wrapper.find(".mj-login input[type=password]").setValue("secret")
  await wrapper.find(".mj-login").trigger("submit")
  await flushPromises()
  return wrapper
}

describe("MjPanel.vue", () => {
  it("sans ops (back-office non configuré), affiche un message et pas de login", () => {
    const wrapper = mount(MjPanel, { props: { ops: null } })
    expect(wrapper.find(".mj-unconfigured").exists()).toBe(true)
    expect(wrapper.find(".mj-login").exists()).toBe(false)
  })

  it("affiche le formulaire de connexion tant que le MJ n'est pas authentifié", () => {
    const wrapper = mountPanel(fakeOps())
    expect(wrapper.find(".mj-login").exists()).toBe(true)
    expect(wrapper.find(".mj-controls").exists()).toBe(false)
  })

  it("connexion réussie : appelle signIn avec les identifiants et bascule sur les contrôles", async () => {
    const ops = fakeOps()
    const wrapper = mountPanel(ops)
    await wrapper.find(".mj-login input[type=email]").setValue("mj@example.com")
    await wrapper.find(".mj-login input[type=password]").setValue("secret")
    await wrapper.find(".mj-login").trigger("submit")
    await flushPromises()

    expect(ops.signIn).toHaveBeenCalledWith("mj@example.com", "secret")
    expect(wrapper.find(".mj-controls").exists()).toBe(true)
    expect(wrapper.find(".mj-login").exists()).toBe(false)
  })

  it("connexion échouée : affiche une erreur et reste sur le login", async () => {
    const wrapper = mountPanel(fakeOps({ signInOk: false }))
    await wrapper.find(".mj-login input[type=email]").setValue("mj@example.com")
    await wrapper.find(".mj-login input[type=password]").setValue("mauvais")
    await wrapper.find(".mj-login").trigger("submit")
    await flushPromises()

    expect(wrapper.find(".mj-error").exists()).toBe(true)
    expect(wrapper.find(".mj-controls").exists()).toBe(false)
  })

  it("après connexion, préremplit les contrôles depuis l'état courant", async () => {
    const ops = fakeOps({ state: { connectionQuality: "critique", alertLevel: 3 } })
    const wrapper = mountPanel(ops)
    await wrapper.find(".mj-login input[type=email]").setValue("mj@example.com")
    await wrapper.find(".mj-login input[type=password]").setValue("secret")
    await wrapper.find(".mj-login").trigger("submit")
    await flushPromises()

    expect(ops.fetchState).toHaveBeenCalled()
    expect(wrapper.find("select.mj-connection").element.value).toBe("critique")
    expect(wrapper.find("select.mj-alert").element.value).toBe("3")
  })

  it("« Appliquer » envoie les valeurs choisies via updateState", async () => {
    const ops = fakeOps()
    const wrapper = mountPanel(ops)
    await wrapper.find(".mj-login input[type=email]").setValue("mj@example.com")
    await wrapper.find(".mj-login input[type=password]").setValue("secret")
    await wrapper.find(".mj-login").trigger("submit")
    await flushPromises()

    await wrapper.find("select.mj-connection").setValue("faible")
    await wrapper.find("select.mj-alert").setValue("4")
    await wrapper.find(".mj-controls").trigger("submit")
    await flushPromises()

    expect(ops.updateState).toHaveBeenCalledWith({ connectionQuality: "faible", alertLevel: 4, clockStart: 0 })
  })

  it("« Appliquer » envoie l'heure de départ réglée (clockStart en secondes)", async () => {
    const ops = fakeOps()
    const wrapper = await login(ops)
    await wrapper.find("input.mj-clock").setValue("01:00:00")
    await wrapper.find(".mj-controls").trigger("submit")
    await flushPromises()
    expect(ops.updateState).toHaveBeenCalledWith(expect.objectContaining({ clockStart: 3600 }))
  })

  it("préremplit l'heure de départ depuis l'état courant", async () => {
    const ops = fakeOps({ state: { connectionQuality: "moyenne", alertLevel: 0, clockStart: 3600 } })
    const wrapper = await login(ops)
    expect(wrapper.find("input.mj-clock").element.value).toBe("01:00:00")
  })

  it("après connexion, affiche les contrôles de la phase d'intrusion (un bouton par écran + reset)", async () => {
    const wrapper = await login(fakeOps())
    expect(wrapper.find(".mj-intrusion").exists()).toBe(true)
    expect(wrapper.findAll(".mj-screen-btn").length).toBeGreaterThanOrEqual(6)
    expect(wrapper.find(".mj-reset").exists()).toBe(true)
  })

  it("clic sur un écran d'intrusion pousse cet état via updateState", async () => {
    const ops = fakeOps()
    const wrapper = await login(ops)
    await wrapper.find('.mj-screen-btn[data-state="interne_ok"]').trigger("click")
    await flushPromises()
    expect(ops.updateState).toHaveBeenCalledWith({ intrusion: "interne_ok" })
  })

  it("le bouton Reset repose TOUTE la session à ses défauts (base propre)", async () => {
    const ops = fakeOps()
    const wrapper = await login(ops)
    await wrapper.find(".mj-reset").trigger("click")
    await flushPromises()
    expect(ops.updateState).toHaveBeenCalledWith({
      intrusion: "boot",
      connectionQuality: "bonne",
      alertLevel: 0,
      bafouille: false,
      clockStart: 0,
    })
  })

  it("regroupe connexion, alerte et Bafouille dans une section « Phase de recherche »", async () => {
    const wrapper = await login(fakeOps())
    const zone = wrapper.find(".mj-recherche")
    expect(zone.exists()).toBe(true)
    expect(zone.text().toLowerCase()).toContain("phase de recherche")
    expect(zone.find("select.mj-connection").exists()).toBe(true)
    expect(zone.find("select.mj-alert").exists()).toBe(true)
    expect(zone.find(".mj-bafouille-btn").exists()).toBe(true)
  })

  it("permet de régler la qualité de liaison sur « perdue » (fin de session)", async () => {
    const wrapper = await login(fakeOps())
    const options = wrapper.findAll("select.mj-connection option").map(o => o.element.value)
    expect(options).toContain("perdue")
  })

  it("propose une bascule d'intervention Bafouille et pousse l'état via updateState", async () => {
    const ops = fakeOps()
    const wrapper = await login(ops)
    const btn = wrapper.find(".mj-bafouille-btn")
    expect(btn.exists()).toBe(true)
    await btn.trigger("click")
    await flushPromises()
    expect(ops.updateState).toHaveBeenCalledWith({ bafouille: true })
    await btn.trigger("click")
    await flushPromises()
    expect(ops.updateState).toHaveBeenCalledWith({ bafouille: false })
  })

  it("préremplit l'état de l'intervention Bafouille depuis l'état courant", async () => {
    const ops = fakeOps({ state: { connectionQuality: "moyenne", alertLevel: 0, bafouille: true } })
    const wrapper = await login(ops)
    expect(wrapper.find(".mj-bafouille-btn.active").exists()).toBe(true)
  })
})
