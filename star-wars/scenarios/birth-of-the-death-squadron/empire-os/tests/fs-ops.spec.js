import { describe, it, expect } from "vitest"
import { addDisk } from "../tools/fs-editor/fs-ops.js"

describe("addDisk", () => {
  it("ajoute un disque à la racine (type 'disk', children vides) et le renvoie", () => {
    const root = {
      name: "root", type: "directory",
      children: [{ name: "user-51394345", type: "disk", children: [] }],
    }
    const disk = addDisk(root, "srv-archives")
    expect(disk).toEqual({ name: "srv-archives", type: "disk", children: [] })
    expect(root.children).toHaveLength(2)
    expect(root.children[1]).toBe(disk)
  })

  it("refuse un nom vide ou fait d'espaces, et n'ajoute rien", () => {
    const root = { name: "root", type: "directory", children: [] }
    expect(() => addDisk(root, "")).toThrow()
    expect(() => addDisk(root, "   ")).toThrow()
    expect(root.children).toHaveLength(0)
  })

  it("retient le nom débarrassé des espaces de bord", () => {
    const root = { name: "root", type: "directory", children: [] }
    const disk = addDisk(root, "  srv-archives  ")
    expect(disk.name).toBe("srv-archives")
  })

  it("refuse un nom déjà porté par un disque existant (l'app switch par nom)", () => {
    const root = {
      name: "root", type: "directory",
      children: [{ name: "user-51394345", type: "disk", children: [] }],
    }
    expect(() => addDisk(root, "user-51394345")).toThrow()
    expect(() => addDisk(root, "  user-51394345 ")).toThrow() // même nom, espaces autour
    expect(root.children).toHaveLength(1)
  })
})
