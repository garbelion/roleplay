import { describe, it, expect, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import FileExplorer from "../src/components/FileExplorer.vue"

// Mock du fetch pour simuler le chargement du file-system.json
global.fetch = vi.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      name: "root",
      path: "/",
      type: "directory",
      children: [
        {
          name: "Fichiers",
          path: "/Fichiers",
          type: "directory",
          children: [
            { name: "rapport_mission.docx", path: "/Fichiers/rapport_mission.docx", type: "file" },
            { name: "ordre_executor.docx", path: "/Fichiers/ordre_executor.docx", type: "file" },
            { name: "liste_cibles.docx", path: "/Fichiers/liste_cibles.docx", type: "file" }
          ]
        },
        {
          name: "Dossiers",
          path: "/Dossiers",
          type: "directory",
          children: [
            {
              name: "Secrets",
              path: "/Dossiers/Secrets",
              type: "directory",
              children: [
                { name: "protocole_secret.docx", path: "/Dossiers/Secrets/protocole_secret.docx", type: "file" }
              ]
            }
          ]
        },
        {
          name: "Archives",
          path: "/Archives",
          type: "directory",
          children: []
        }
      ]
    })
  })
);

describe("FileExplorer - Feature 2: Naviguer dans les répertoires", () => {
  let wrapper

  beforeEach(async () => {
    fetch.mockClear()
    wrapper = mount(FileExplorer)
    await wrapper.vm.loadFileSystem() // Charge la structure
  })

  it("devrait charger la structure des répertoires depuis file-system.json", async () => {
    expect(fetch).toHaveBeenCalledWith("/file-system.json")
    expect(wrapper.vm.fileSystem).toBeDefined()
    expect(wrapper.vm.fileSystem.name).toBe("root")
  })

  it("devrait avoir un répertoire courant par défaut = /Fichiers", () => {
    expect(wrapper.vm.currentPath).toBe("/Fichiers")
  })

  it("devrait lister le contenu du répertoire courant", () => {
    const currentDir = wrapper.vm.getCurrentDirectory()
    expect(currentDir.children.length).toBe(3) // 3 fichiers dans /Fichiers
    expect(currentDir.children[0].name).toBe("rapport_mission.docx")
  })

  it("devrait permettre de changer de répertoire (cd Dossiers)", async () => {
    await wrapper.vm.changeDirectory("/Dossiers")
    expect(wrapper.vm.currentPath).toBe("/Dossiers")
    const currentDir = wrapper.vm.getCurrentDirectory()
    expect(currentDir.name).toBe("Dossiers")
  })

  it("devrait permettre de changer de répertoire (cd Dossiers/Secrets)", async () => {
    await wrapper.vm.changeDirectory("/Dossiers/Secrets")
    expect(wrapper.vm.currentPath).toBe("/Dossiers/Secrets")
    const currentDir = wrapper.vm.getCurrentDirectory()
    expect(currentDir.children[0].name).toBe("protocole_secret.docx")
  })

  it("devrait permettre de remonter d un niveau (cd ..)", async () => {
    await wrapper.vm.changeDirectory("/Dossiers/Secrets")
    expect(wrapper.vm.currentPath).toBe("/Dossiers/Secrets")
    await wrapper.vm.changeDirectory("..")
    expect(wrapper.vm.currentPath).toBe("/Dossiers")
  })

  it("devrait permettre de revenir à la racine (cd /)", async () => {
    await wrapper.vm.changeDirectory("/Dossiers/Secrets")
    await wrapper.vm.changeDirectory("/")
    expect(wrapper.vm.currentPath).toBe("/")
  })

  it("devrait afficher le chemin courant dans l interface", () => {
    const pathDisplay = wrapper.find(".terminal-header")
    expect(pathDisplay.text()).toContain("C:\EmpireOS\Fichiers>")
  })

  it("devrait mettre à jour l affichage du chemin lors du changement de répertoire", async () => {
    await wrapper.vm.changeDirectory("/Dossiers")
    const pathDisplay = wrapper.find(".terminal-header")
    expect(pathDisplay.text()).toContain("C:\EmpireOS\Dossiers>")
  })

  it("devrait gérer les chemins invalides en restant dans le répertoire courant", async () => {
    const initialPath = wrapper.vm.currentPath
    await wrapper.vm.changeDirectory("/Inexistant")
    expect(wrapper.vm.currentPath).toBe(initialPath) // Doit rester sur le même chemin
  })
});