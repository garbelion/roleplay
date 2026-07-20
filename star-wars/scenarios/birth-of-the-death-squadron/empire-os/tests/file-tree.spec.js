import { describe, it, expect } from "vitest"
import { assignPaths, collectCriticalFiles } from "../src/file-tree.js"

describe("assignPaths", () => {
  it("dérive le chemin de chaque nœud depuis sa position dans l'arbre (noms d'ancêtres)", () => {
    const tree = {
      name: "root", type: "directory",
      children: [
        {
          name: "user-51394345", type: "disk",
          children: [
            {
              name: "home", type: "directory",
              children: [{ name: "rapport.md", type: "file" }]
            },
            { name: "notes.md", type: "file" }
          ]
        }
      ]
    }
    assignPaths(tree)

    expect(tree.path).toBe("/")
    expect(tree.children[0].path).toBe("/user-51394345")
    expect(tree.children[0].children[0].path).toBe("/user-51394345/home")
    expect(tree.children[0].children[0].children[0].path).toBe("/user-51394345/home/rapport.md")
    expect(tree.children[0].children[1].path).toBe("/user-51394345/notes.md")
  })

  it("écrase un chemin authored erroné (la structure fait autorité) et gère les feuilles sans children", () => {
    const tree = {
      name: "root", type: "directory",
      children: [{ name: "d", type: "disk", path: "/WRONG", children: [{ name: "f.txt", type: "file" }] }]
    }
    assignPaths(tree)
    expect(tree.children[0].path).toBe("/d")
    expect(tree.children[0].children[0].path).toBe("/d/f.txt")
  })
})

describe("collectCriticalFiles", () => {
  it("collecte les fichiers isCritical avec leur chemin dérivé, dans l'ordre de l'arbre", () => {
    const tree = {
      name: "root", type: "directory",
      children: [
        {
          name: "user-51394345", type: "disk",
          children: [
            {
              name: "home", type: "directory",
              children: [
                { name: "rapport.md", type: "file" },
                { name: "liste_cibles.md", type: "file", isCritical: true }
              ]
            },
            { name: "protocole.md", type: "file", isCritical: true }
          ]
        }
      ]
    }
    expect(collectCriticalFiles(tree)).toEqual([
      { name: "liste_cibles.md", path: "/user-51394345/home/liste_cibles.md" },
      { name: "protocole.md", path: "/user-51394345/protocole.md" }
    ])
  })

  it("renvoie une liste vide quand aucun fichier n'est critique (ou arbre vide)", () => {
    expect(collectCriticalFiles({ name: "root", type: "directory", children: [{ name: "a.md", type: "file" }] })).toEqual([])
    expect(collectCriticalFiles({ name: "root", type: "directory" })).toEqual([])
  })
})
