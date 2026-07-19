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

    expect(ops.updateState).toHaveBeenCalledWith({ connectionQuality: "faible", alertLevel: 4 })
  })
})
