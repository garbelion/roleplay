import { describe, it, expect, vi } from "vitest"
import { createSupabaseSource, connectSupabaseSession, mapRow, toRow } from "../src/supabase-source.js"

// Faux client Supabase : reproduit l'API chaînable dont l'adaptateur a besoin.
function fakeClient({ row = null } = {}) {
  const calls = { handler: null, filter: null, channelName: null, removed: null }
  const channel = {
    on: vi.fn((event, filter, handler) => { calls.handler = handler; calls.filter = filter; return channel }),
    subscribe: vi.fn(() => channel)
  }
  const client = {
    _calls: calls,
    from: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: row, error: null })) })) })),
    channel: vi.fn((name) => { calls.channelName = name; return channel }),
    removeChannel: vi.fn((ch) => { calls.removed = ch }),
    _emit: (newRow) => calls.handler && calls.handler({ new: newRow })
  }
  return client
}

describe("createSupabaseSource", () => {
  it("fetchState mappe la ligne (snake_case -> camelCase)", async () => {
    const src = createSupabaseSource(fakeClient({ row: { connection_quality: "critique", alert_level: 3 } }))
    await expect(src.fetchState()).resolves.toEqual({ connectionQuality: "critique", alertLevel: 3 })
  })

  it("fetchState renvoie null s'il n'y a pas de ligne", async () => {
    const src = createSupabaseSource(fakeClient({ row: null }))
    await expect(src.fetchState()).resolves.toBe(null)
  })

  it("fetchState mappe la colonne intrusion (écran de la phase d'entrée)", async () => {
    const row = { connection_quality: "moyenne", alert_level: 0, intrusion: "interne_ok" }
    const src = createSupabaseSource(fakeClient({ row }))
    await expect(src.fetchState()).resolves.toEqual({ connectionQuality: "moyenne", alertLevel: 0, intrusion: "interne_ok" })
  })
})

describe("mapRow / toRow", () => {
  it("mapRow expose intrusion ; toRow le réécrit en colonne DB", () => {
    expect(mapRow({ connection_quality: "faible", alert_level: 2, intrusion: "os_refus" }))
      .toEqual({ connectionQuality: "faible", alertLevel: 2, intrusion: "os_refus" })
    expect(toRow({ intrusion: "os" })).toMatchObject({ intrusion: "os" })
  })

  it("mapRow/toRow portent l'heure de départ (clock_start <-> clockStart)", () => {
    expect(mapRow({ connection_quality: "moyenne", alert_level: 0, intrusion: "boot", clock_start: 3600 }))
      .toMatchObject({ clockStart: 3600 })
    expect(toRow({ clockStart: 3600 })).toMatchObject({ clock_start: 3600 })
  })

  it("onChange mappe payload.new et fournit un désabonnement", () => {
    const client = fakeClient()
    const src = createSupabaseSource(client)
    const received = []
    const unsub = src.onChange((s) => received.push(s))

    client._emit({ connection_quality: "faible", alert_level: 1 })
    expect(received).toEqual([{ connectionQuality: "faible", alertLevel: 1 }])
    // s'abonne bien sur la table de session
    expect(client._calls.filter).toMatchObject({ table: "session_state" })

    unsub()
    expect(client.removeChannel).toHaveBeenCalled()
  })
})

describe("connectSupabaseSession (mode statique)", () => {
  it("sans config, renvoie un handle synchrone inerte (aucun SDK chargé)", () => {
    const handle = connectSupabaseSession(undefined)
    expect(typeof handle.disconnect).toBe("function") // synchrone, pas une Promise
    expect(() => handle.disconnect()).not.toThrow()
    expect(connectSupabaseSession({ url: "x" }).disconnect).toBeTypeOf("function") // config incomplète
  })
})
