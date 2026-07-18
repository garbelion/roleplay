import { describe, it, expect, beforeEach, vi } from "vitest"
import { connectSessionRemote } from "../src/session-remote.js"
import { sessionState, resetSessionState, DEFAULT_SESSION } from "../src/session-store.js"

// Fausse "source" : contrat minimal { fetchState, onChange } que l'orchestration consomme.
function fakeSource({ initial = null, fetchError = false } = {}) {
  const src = {
    _cb: null,
    unsub: vi.fn(),
    fetchState: vi.fn(async () => { if (fetchError) throw new Error("boom"); return initial }),
    onChange: vi.fn((cb) => { src._cb = cb; return src.unsub }),
    emit(state) { src._cb && src._cb(state) }
  }
  return src
}

describe("connectSessionRemote", () => {
  beforeEach(() => resetSessionState())

  it("applique l'état initial récupéré au store", async () => {
    await connectSessionRemote(fakeSource({ initial: { connectionQuality: "faible", alertLevel: 2 } }))
    expect(sessionState).toMatchObject({ connectionQuality: "faible", alertLevel: 2 })
  })

  it("applique les changements Realtime au store (partiels)", async () => {
    const src = fakeSource({ initial: { connectionQuality: "moyenne", alertLevel: 0 } })
    await connectSessionRemote(src)
    src.emit({ alertLevel: 5 })
    expect(sessionState.alertLevel).toBe(5)
    expect(sessionState.connectionQuality).toBe("moyenne") // inchangé
  })

  it("dégrade proprement si le fetch initial échoue (défauts conservés, pas d'exception)", async () => {
    const src = fakeSource({ fetchError: true })
    await expect(connectSessionRemote(src)).resolves.toBeTruthy()
    expect(sessionState).toMatchObject(DEFAULT_SESSION)
    // l'abonnement reste actif malgré l'échec du fetch
    src.emit({ alertLevel: 4 })
    expect(sessionState.alertLevel).toBe(4)
  })

  it("sans source (non configuré), renvoie un handle inerte sans toucher au store", async () => {
    const handle = await connectSessionRemote(null)
    expect(sessionState).toMatchObject(DEFAULT_SESSION)
    expect(() => handle.disconnect()).not.toThrow()
  })

  it("disconnect() se désabonne", async () => {
    const src = fakeSource({ initial: { alertLevel: 1 } })
    const handle = await connectSessionRemote(src)
    handle.disconnect()
    expect(src.unsub).toHaveBeenCalled()
  })
})
