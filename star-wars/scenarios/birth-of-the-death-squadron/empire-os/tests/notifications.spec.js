import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  notifications,
  notify,
  dismiss,
  resetNotifications,
  NOTIFICATION_MS
} from "../src/notifications.js"

describe("notifications", () => {
  beforeEach(() => { resetNotifications(); vi.useFakeTimers() })
  afterEach(() => vi.useRealTimers())

  it("signale une entrée non-surveillance, puis la retire après NOTIFICATION_MS", () => {
    notify({ kind: "propaganda", text: "L'EMPIRE VEILLE." })
    expect(notifications.length).toBe(1)
    expect(notifications[0].text).toBe("L'EMPIRE VEILLE.")

    vi.advanceTimersByTime(NOTIFICATION_MS - 1)
    expect(notifications.length).toBe(1)
    vi.advanceTimersByTime(1)
    expect(notifications.length).toBe(0)
  })

  it("ignore les entrées de surveillance (suivi d'action)", () => {
    notify({ kind: "surveillance", text: "ACCÈS FICHIER : rapport.md" })
    vi.advanceTimersByTime(NOTIFICATION_MS)
    expect(notifications.length).toBe(0)
  })

  it("gère plusieurs notifications indépendamment (chacune son minuteur)", () => {
    notify({ kind: "system", text: "A" })
    vi.advanceTimersByTime(2000)
    notify({ kind: "system", text: "B" })
    expect(notifications.map(n => n.text)).toEqual(["A", "B"])
    vi.advanceTimersByTime(3000) // A atteint 5s, B à 3s
    expect(notifications.map(n => n.text)).toEqual(["B"])
    vi.advanceTimersByTime(2000)
    expect(notifications.length).toBe(0)
  })

  it("dismiss retire une notification par id avant expiration", () => {
    notify({ kind: "system", text: "A" })
    const id = notifications[0].id
    dismiss(id)
    expect(notifications.length).toBe(0)
  })
})
