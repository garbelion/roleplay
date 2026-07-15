import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import FileExplorer from "../src/components/FileExplorer.vue"

describe("FileExplorer.vue - Feature 1: Afficher une liste de fichiers .docx", () => {
  let wrapper

  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({
        name: 'root',
        path: '/',
        type: 'directory',
        children: [
          {
            name: 'Fichiers',
            path: '/Fichiers',
            type: 'directory',
            children: [
              { name: 'rapport_mission.docx', path: '/Fichiers/rapport_mission.docx', type: 'file' },
              { name: 'ordre_executor.docx', path: '/Fichiers/ordre_executor.docx', type: 'file' },
              { name: 'liste_cibles.docx', path: '/Fichiers/liste_cibles.docx', type: 'file' },
              { name: 'protocole_secret.docx', path: '/Fichiers/protocole_secret.docx', type: 'file' }
            ]
          }
        ]
      })
    }))
    wrapper = mount(FileExplorer)
  })

  it("devrait afficher une liste de fichiers .docx", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    expect(fileItems.length).toBe(5) // 4 fichiers + 1 ".."
  })

  it("devrait afficher les noms de fichiers corrects", async () => {
    await wrapper.vm.loadFileSystem()
    const fileNames = wrapper.findAll(".file-item").map(item => item.text())
    expect(fileNames).toEqual([
      "../",
      "rapport_mission.docx",
      "ordre_executor.docx",
      "liste_cibles.docx",
      "protocole_secret.docx"
    ])
  })

  it("devrait avoir un style DOS-like", () => {
    const explorer = wrapper.find(".file-explorer")
    expect(explorer.classes()).toContain("file-explorer")
  })

  it("devrait afficher un en-tete de terminal", async () => {
    await wrapper.vm.loadFileSystem()
    const header = wrapper.find(".terminal-header")
    expect(header.exists()).toBe(true)
    expect(header.text()).toContain("C:\\EmpireOS\\Fichiers>")
  })

  it("devrait permettre la selection de fichiers", async () => {
    await wrapper.vm.loadFileSystem()
    const firstFile = wrapper.findAll(".file-item")[1] // Skip ".."
    await firstFile.trigger("click")
    expect(wrapper.vm.selectedFiles).toContain(1)
  })

  it("devrait deselectionner un fichier deja selectionne", async () => {
    await wrapper.vm.loadFileSystem()
    const firstFile = wrapper.findAll(".file-item")[1] // Skip ".."
    await firstFile.trigger("click")
    expect(wrapper.vm.selectedFiles).toContain(1)
    await firstFile.trigger("click")
    expect(wrapper.vm.selectedFiles).not.toContain(1)
  })

  it("devrait emettre un evenement lors de la selection de fichiers", async () => {
    await wrapper.vm.loadFileSystem()
    const firstFile = wrapper.findAll(".file-item")[1] // Skip ".."
    await firstFile.trigger("click")
    expect(wrapper.emitted("files-selected")).toBeTruthy()
    expect(wrapper.emitted("files-selected")[0]).toEqual([[1]])
  })

  it("devrait avoir une methode getFiles qui retourne la liste des fichiers", async () => {
    await wrapper.vm.loadFileSystem()
    const files = wrapper.vm.getFiles()
    expect(files.length).toBe(5) // 4 fichiers + 1 ".."
    expect(files[1].name).toBe("rapport_mission.docx")
  })

  it("devrait avoir une methode setFiles qui met a jour la liste", () => {
    const newFiles = [{ name: "nouveau_fichier.docx", size: 100, type: "docx" }]
    wrapper.vm.setFiles(newFiles)
    expect(wrapper.vm.files).toEqual(newFiles)
  })
})

describe("FileExplorer.vue - Feature 2: Naviguer dans les répertoires", () => {
  let wrapper

  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({
        name: 'root',
        path: '/',
        type: 'directory',
        children: [
          {
            name: 'Fichiers',
            path: '/Fichiers',
            type: 'directory',
            children: [
              { name: 'rapport_mission.docx', path: '/Fichiers/rapport_mission.docx', type: 'file' },
              { name: 'ordre_executor.docx', path: '/Fichiers/ordre_executor.docx', type: 'file' },
              { name: 'liste_cibles.docx', path: '/Fichiers/liste_cibles.docx', type: 'file' },
              { name: 'protocole_secret.docx', path: '/Fichiers/protocole_secret.docx', type: 'file' }
            ]
          },
          {
            name: 'Dossiers',
            path: '/Dossiers',
            type: 'directory',
            children: [
              {
                name: 'Secrets',
                path: '/Dossiers/Secrets',
                type: 'directory',
                children: [
                  { name: 'protocole_secret.docx', path: '/Dossiers/Secrets/protocole_secret.docx', type: 'file' }
                ]
              }
            ]
          }
        ]
      })
    }))
    wrapper = mount(FileExplorer)
  })

  it("devrait afficher un element .. pour remonter d'un niveau", async () => {
    await wrapper.vm.loadFileSystem()
    const items = wrapper.findAll(".file-item")
    const parentDir = items[0]
    expect(parentDir.text()).toBe("../")
  })

  it("devrait changer de répertoire avec un chemin relatif valide", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("Fichiers")
    expect(wrapper.vm.currentPath).toBe("/Fichiers")
  })

  it("devrait changer de répertoire avec un chemin absolu valide", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("/Fichiers")
    expect(wrapper.vm.currentPath).toBe("/Fichiers")
  })

  it("devrait remonter d'un niveau avec '..'", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("Fichiers")
    await wrapper.vm.changeDirectory("..")
    expect(wrapper.vm.currentPath).toBe("/")
  })

  it("devrait rester à la racine si '..' est appelé à la racine", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("/")
    await wrapper.vm.changeDirectory("..")
    expect(wrapper.vm.currentPath).toBe("/")
  })

  it("devrait ignorer les chemins invalides", async () => {
    await wrapper.vm.loadFileSystem()
    const initialPath = wrapper.vm.currentPath
    await wrapper.vm.changeDirectory("Inexistant")
    expect(wrapper.vm.currentPath).toBe(initialPath)
  })

  it("devrait mettre à jour l'en-tête avec le chemin courant", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("/Fichiers")
    const header = wrapper.find(".terminal-header")
    expect(header.text()).toContain("C:\\EmpireOS\\Fichiers>")
  })

  it("devrait mettre à jour currentDirectory après navigation", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("/Fichiers")
    expect(wrapper.vm.currentDirectory.name).toBe("Fichiers")
    expect(wrapper.vm.currentDirectory.children.length).toBe(4) // 4 fichiers (sans "..")
  })

  it("devrait gérer les chemins avec des barres obliques multiples", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("//Fichiers//")
    expect(wrapper.vm.currentPath).toBe("/Fichiers")
  })

  it("devrait naviguer vers un sous-dossier depuis un répertoire parent", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("Fichiers")
    expect(wrapper.vm.currentPath).toBe("/Fichiers")
    expect(wrapper.vm.currentDirectory.children.length).toBe(4) // 4 fichiers (sans "..")
  })

  it("devrait naviguer vers la racine avec '/'", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("Fichiers")
    await wrapper.vm.changeDirectory("/")
    expect(wrapper.vm.currentPath).toBe("/")
    expect(wrapper.vm.currentDirectory.name).toBe("root")
  })

  it("devrait permettre de cliquer sur .. pour remonter d'un niveau", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("Fichiers")
    const parentDir = wrapper.findAll(".file-item")[0]
    await parentDir.trigger("click")
    expect(wrapper.vm.currentPath).toBe("/")
  })

  it("ne devrait pas afficher .. à la racine", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory("/")
    const items = wrapper.findAll(".file-item")
    const itemNames = items.map(item => item.text())
    expect(itemNames).not.toContain("../")
  })
})

describe("FileExplorer.vue - Feature 3: Ouvrir les fichiers pour consultation", () => {
  let wrapper

  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({
        name: 'root',
        path: '/',
        type: 'directory',
        children: [
          {
            name: 'Fichiers',
            path: '/Fichiers',
            type: 'directory',
            children: [
              { name: 'rapport_mission.docx', path: '/Fichiers/rapport_mission.docx', type: 'file', content: 'Contenu du rapport de mission' },
              { name: 'ordre_executor.docx', path: '/Fichiers/ordre_executor.docx', type: 'file', content: 'Ordre de l\'Exécuteur' },
              { name: 'liste_cibles.docx', path: '/Fichiers/liste_cibles.docx', type: 'file', content: 'Liste des cibles prioritaires' },
              { name: 'protocole_secret.docx', path: '/Fichiers/protocole_secret.docx', type: 'file', content: 'Protocole secret de l\'Empire' }
            ]
          }
        ]
      })
    }))
    wrapper = mount(FileExplorer)
  })

  it("devrait avoir une méthode openFile", async () => {
    await wrapper.vm.loadFileSystem()
    expect(typeof wrapper.vm.openFile).toBe('function')
  })

  it("devrait ouvrir un fichier et mettre à jour openedFile", async () => {
    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1] // Premier fichier (rapport_mission.docx)
    await wrapper.vm.openFile(file)
    expect(wrapper.vm.openedFile).toEqual(file)
  })

  it("devrait afficher une modale lors de l'ouverture d'un fichier", async () => {
    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1]
    await wrapper.vm.openFile(file)
    expect(wrapper.vm.showFileModal).toBe(true)
  })

  it("devrait fermer la modale avec closeFileModal", async () => {
    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1]
    await wrapper.vm.openFile(file)
    expect(wrapper.vm.showFileModal).toBe(true)
    wrapper.vm.closeFileModal()
    expect(wrapper.vm.showFileModal).toBe(false)
  })

  it("devrait ouvrir un fichier en double-cliquant dessus", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Skip ".."
    await firstFile.trigger("dblclick")
    expect(wrapper.vm.showFileModal).toBe(true)
    expect(wrapper.vm.openedFile.name).toBe("rapport_mission.docx")
  })

  it("devrait afficher le nom du fichier dans la modale", async () => {
    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1]
    await wrapper.vm.openFile(file)
    const modal = wrapper.find(".file-modal")
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain("rapport_mission.docx")
  })

  it("devrait afficher le contenu du fichier dans la modale", async () => {
    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1]
    await wrapper.vm.openFile(file)
    const modal = wrapper.find(".file-modal")
    expect(modal.text()).toContain("Contenu du rapport de mission")
  })

  it("ne devrait pas ouvrir un dossier en double-cliquant", async () => {
    await wrapper.vm.loadFileSystem()
    const dirItem = wrapper.findAll(".file-item")[0] // ".."
    await dirItem.trigger("dblclick")
    expect(wrapper.vm.showFileModal).toBe(false)
  })
})
