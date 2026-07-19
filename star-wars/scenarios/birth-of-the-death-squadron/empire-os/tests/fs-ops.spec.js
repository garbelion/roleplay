import { describe, it, expect } from "vitest"
import { addDisk, addPropaganda, editPropaganda, removePropaganda } from "../tools/fs-editor/fs-ops.js"

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

describe("addPropaganda", () => {
  it("ajoute un message à la fin de console.propaganda et renvoie le texte retenu (trim)", () => {
    const root = { name: "root", type: "directory", console: { propaganda: ["L'EMPIRE VEILLE."] } }
    const msg = addPropaganda(root, "  GLOIRE À L'EMPEREUR.  ")
    expect(msg).toBe("GLOIRE À L'EMPEREUR.")
    expect(root.console.propaganda).toEqual(["L'EMPIRE VEILLE.", "GLOIRE À L'EMPEREUR."])
  })

  it("crée console.propaganda si absent", () => {
    const root = { name: "root", type: "directory" }
    addPropaganda(root, "ORDRE ET SÉCURITÉ.")
    expect(root.console.propaganda).toEqual(["ORDRE ET SÉCURITÉ."])
  })

  it("refuse un message vide ou fait d'espaces", () => {
    const root = { name: "root", type: "directory", console: { propaganda: [] } }
    expect(() => addPropaganda(root, "")).toThrow()
    expect(() => addPropaganda(root, "   ")).toThrow()
    expect(root.console.propaganda).toHaveLength(0)
  })
})

describe("editPropaganda", () => {
  it("remplace le message à l'index donné (trim) et renvoie le texte retenu", () => {
    const root = { console: { propaganda: ["A", "B", "C"] } }
    const msg = editPropaganda(root, 1, "  NOUVEAU  ")
    expect(msg).toBe("NOUVEAU")
    expect(root.console.propaganda).toEqual(["A", "NOUVEAU", "C"])
  })

  it("refuse un message vide et un index hors bornes, sans rien modifier", () => {
    const root = { console: { propaganda: ["A", "B"] } }
    expect(() => editPropaganda(root, 0, "  ")).toThrow()
    expect(() => editPropaganda(root, 2, "X")).toThrow()
    expect(() => editPropaganda(root, -1, "X")).toThrow()
    expect(root.console.propaganda).toEqual(["A", "B"])
  })
})

describe("removePropaganda", () => {
  it("retire le message à l'index donné et renvoie le texte retiré", () => {
    const root = { console: { propaganda: ["A", "B", "C"] } }
    const removed = removePropaganda(root, 1)
    expect(removed).toBe("B")
    expect(root.console.propaganda).toEqual(["A", "C"])
  })

  it("refuse un index hors bornes, sans rien modifier", () => {
    const root = { console: { propaganda: ["A"] } }
    expect(() => removePropaganda(root, 1)).toThrow()
    expect(() => removePropaganda(root, -1)).toThrow()
    expect(root.console.propaganda).toEqual(["A"])
  })
})
