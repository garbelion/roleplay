import { describe, it, expect, vi } from "vitest"
import { createMjOps } from "../src/supabase-mj.js"

function fakeClient({ signInError = null, row = { connection_quality: "moyenne", alert_level: 0 } } = {}) {
  const calls = { signIn: null, updated: null }
  const client = {
    _calls: calls,
    auth: {
      signInWithPassword: vi.fn(async (creds) => { calls.signIn = creds; return { data: { user: {} }, error: signInError } })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ single: vi.fn(async () => ({ data: row })) })),
      update: vi.fn((r) => ({ eq: vi.fn(async (col, val) => { calls.updated = { r, col, val }; return { error: null } }) }))
    }))
  }
  return client
}

describe("createMjOps", () => {
  it("signIn transmet email/mot de passe à Supabase Auth", async () => {
    const client = fakeClient()
    await createMjOps(client).signIn("mj@example.com", "secret")
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({ email: "mj@example.com", password: "secret" })
  })

  it("signIn lève si Supabase renvoie une erreur", async () => {
    const client = fakeClient({ signInError: { message: "Invalid login credentials" } })
    await expect(createMjOps(client).signIn("mj@example.com", "x")).rejects.toThrow(/invalid/i)
  })

  it("fetchState mappe la ligne (snake_case -> app)", async () => {
    const client = fakeClient({ row: { connection_quality: "critique", alert_level: 3 } })
    await expect(createMjOps(client).fetchState()).resolves.toEqual({ connectionQuality: "critique", alertLevel: 3 })
  })

  it("updateState écrit la ligne id=1 en snake_case", async () => {
    const client = fakeClient()
    await createMjOps(client).updateState({ connectionQuality: "faible", alertLevel: 4 })
    expect(client._calls.updated).toEqual({
      r: { connection_quality: "faible", alert_level: 4 },
      col: "id",
      val: 1
    })
  })
})
