import { describe, it, expect } from "vitest"
import { diffFileSystem } from "../tools/fs-editor/fs-sync.js"

describe("diffFileSystem", () => {
  it("signale les fichiers déclarés mais absents du disque (manquants)", () => {
    const tree = {
      name: "root", type: "directory",
      children: [{ name: "home", type: "directory", children: [
        { name: "present.md", type: "file" },
        { name: "absent.md", type: "file" },
      ] }],
    }
    const { missing, orphans, duplicates } = diffFileSystem(tree, ["present.md"])
    expect(missing).toEqual([{ name: "absent.md", path: "/home/absent.md" }])
    expect(orphans).toEqual([])
    expect(duplicates).toEqual([])
  })

  it("signale les fichiers présents sur le disque mais non déclarés (orphelins)", () => {
    const tree = {
      name: "root", type: "directory",
      children: [{ name: "declare.md", type: "file" }],
    }
    const { missing, orphans } = diffFileSystem(tree, ["declare.md", "oublie.md"])
    expect(missing).toEqual([])
    expect(orphans).toEqual(["oublie.md"])
  })

  it("signale un même nom de fichier déclaré à deux endroits (collision, stockage à plat)", () => {
    const tree = {
      name: "root", type: "directory",
      children: [
        { name: "a", type: "directory", children: [{ name: "note.md", type: "file" }] },
        { name: "b", type: "directory", children: [{ name: "note.md", type: "file" }] },
      ],
    }
    const { duplicates } = diffFileSystem(tree, ["note.md"])
    expect(duplicates).toEqual([{ name: "note.md", paths: ["/a/note.md", "/b/note.md"] }])
  })

  it("ne compte que les nœuds fichier (les dossiers ne sont ni manquants ni orphelins)", () => {
    const tree = {
      name: "root", type: "directory",
      children: [
        { name: "disk", type: "disk", children: [
          { name: "vide", type: "directory", children: [] },
          { name: "doc.md", type: "file" },
        ] },
      ],
    }
    const { missing, orphans, duplicates } = diffFileSystem(tree, ["doc.md"])
    expect(missing).toEqual([])
    expect(orphans).toEqual([])
    expect(duplicates).toEqual([])
  })
})
