import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import FileExplorer from "../src/components/FileExplorer.vue"

const mockFileSystem = {
  name: 'root',
  path: '/',
  type: 'directory',
  children: [
    {
      name: 'Fichiers',
      path: '/Fichiers',
      type: 'directory',
      children: [
        { name: 'rapport_mission.md', path: '/Fichiers/rapport_mission.md', type: 'file' },
        { name: 'ordre_executor.md', path: '/Fichiers/ordre_executor.md', type: 'file' },
        { name: 'liste_cibles.md', path: '/Fichiers/liste_cibles.md', type: 'file' },
        { name: 'protocole_secret.md', path: '/Fichiers/protocole_secret.md', type: 'file' }
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
            { name: 'protocole_secret.md', path: '/Dossiers/Secrets/protocole_secret.md', type: 'file' }
          ]
        }
      ]
    }
  ]
}

// Mock global pour fetch
beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url === '/file-system.json') {
      return Promise.resolve({
        json: () => Promise.resolve(mockFileSystem)
      })
    }
    // Pour tous les autres appels (fichiers), retourner un contenu par défaut
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve('=== RAPPORT DE MISSION IMPÉRIALE ===\n\nContenu du rapport de mission...')
    })
  })
})

describe("FileExplorer.vue - Feature 1: Afficher une liste de fichiers .docx", () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(FileExplorer)
  })

  it("devrait afficher une liste de fichiers .docx", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    expect(fileItems.length).toBe(5) // 4 fichiers + 1 ".."
  })

  it("devrait afficher les noms de fichiers corrects", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const fileNames = fileItems.map(item => {
      const fileNameElement = item.find(".file-name")
      return fileNameElement ? fileNameElement.text() : item.text()
    })
    expect(fileNames).toEqual([
      "../",
      "rapport_mission.md",
      "ordre_executor.md",
      "liste_cibles.md",
      "protocole_secret.md"
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
    expect(files[1].name).toBe("rapport_mission.md")
  })
})

describe("FileExplorer.vue - Feature 2: Naviguer dans les répertoires", () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(FileExplorer)
  })

  it("devrait afficher un element .. pour remonter d'un niveau", async () => {
    await wrapper.vm.loadFileSystem()
    const items = wrapper.findAll(".file-item")
    const parentDir = items[0]
    const fileNameElement = parentDir.find(".file-name")
    expect(fileNameElement.text()).toBe("../")
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
    const itemNames = items.map(item => {
      const fileNameElement = item.find(".file-name")
      return fileNameElement ? fileNameElement.text() : item.text()
    })
    expect(itemNames).not.toContain("../")
  })
})

describe("FileExplorer.vue - Feature 3: Ouvrir les fichiers pour consultation", () => {
  let wrapper

  beforeEach(() => {
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

  it("devrait charger le contenu du fichier dans fileContent", async () => {
    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1]
    await wrapper.vm.openFile(file)
    // Attendre que le contenu soit chargé
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(wrapper.vm.fileContent).toContain("RAPPORT DE MISSION IMPÉRIALE")
  })

  it("devrait fermer la modale avec closeFileModal", async () => {
    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1]
    await wrapper.vm.openFile(file)
    expect(wrapper.vm.showFileModal).toBe(true)
    wrapper.vm.closeFileModal()
    expect(wrapper.vm.showFileModal).toBe(false)
    expect(wrapper.vm.fileContent).toBe('')
  })

  it("devrait ouvrir un fichier en double-cliquant dessus", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Skip ".."
    await firstFile.trigger("dblclick")
    expect(wrapper.vm.showFileModal).toBe(true)
    expect(wrapper.vm.openedFile.name).toBe("rapport_mission.md")
  })

  it("devrait afficher le nom du fichier dans la modale", async () => {
    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1]
    await wrapper.vm.openFile(file)
    const modal = wrapper.find(".file-modal")
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain("rapport_mission.md")
  })

  it("ne devrait pas ouvrir un dossier en double-cliquant", async () => {
    await wrapper.vm.loadFileSystem()
    const dirItem = wrapper.findAll(".file-item")[0] // ".."
    await dirItem.trigger("dblclick")
    expect(wrapper.vm.showFileModal).toBe(false)
  })

  it("devrait afficher une icône d'ouverture pour les fichiers", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Premier fichier
    const openIcon = firstFile.find(".open-icon")
    expect(openIcon.exists()).toBe(true)
  })

  it("devrait ouvrir un fichier en cliquant sur l'icône", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Premier fichier
    const openIcon = firstFile.find(".open-icon")
    await openIcon.trigger("click")
    expect(wrapper.vm.showFileModal).toBe(true)
    expect(wrapper.vm.openedFile.name).toBe("rapport_mission.md")
  })

  it("ne devrait pas afficher d'icône d'ouverture pour les dossiers", async () => {
    await wrapper.vm.loadFileSystem()
    const dirItem = wrapper.findAll(".file-item")[0] // ".."
    const openIcon = dirItem.find(".open-icon")
    expect(openIcon.exists()).toBe(false)
  })

  it("devrait parser le Markdown en HTML dans la modale", async () => {
    // Mock pour retourner du Markdown
    global.fetch = vi.fn((url) => {
      if (url === '/file-system.json') {
        return Promise.resolve({ json: () => Promise.resolve(mockFileSystem) })
      }
      // Retourne du Markdown pour les fichiers
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('# Rapport Mission\n\n## Objectifs\n\n- Cible 1\n- Cible 2\n\n| Agent | Statut |\n|-------|--------|\n| DK-7  | ✅     |')
      })
    })

    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1]
    await wrapper.vm.openFile(file)
    
    // Attendre le parsing
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Vérifier que le contenu est converti en HTML
    expect(wrapper.vm.fileContent).toContain('<h1>Rapport Mission</h1>')
    expect(wrapper.vm.fileContent).toContain('<h2>Objectifs</h2>')
    expect(wrapper.vm.fileContent).toContain('<table>')
  })

  it("devrait gérer les fichiers introuvables", async () => {
    // Mock pour simuler un fichier introuvable
    global.fetch = vi.fn((url) => {
      if (url === '/file-system.json') {
        return Promise.resolve({ json: () => Promise.resolve(mockFileSystem) })
      }
      return Promise.resolve({ ok: false, status: 404 })
    })

    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1]
    await wrapper.vm.openFile(file)
    
    // Vérifier qu'un message d'erreur est affiché
    expect(wrapper.vm.fileContent).toContain('Fichier introuvable')
  })

  it("devrait afficher les fichiers .md avec une icône spécifique", async () => {
    // Mettre à jour le mock pour inclure des .md
    const mockFileSystemWithMd = {
      ...mockFileSystem,
      children: mockFileSystem.children.map(dir => {
        if (dir.name === 'Fichiers') {
          return {
            ...dir,
            children: dir.children.map(file => (
              file.name.endsWith('.docx') 
                ? { ...file, name: file.name.replace('.docx', '.md') } 
                : file
            ))
          }
        }
        return dir
      })
    }

    global.fetch = vi.fn((url) => {
      if (url === '/file-system.json') {
        return Promise.resolve({ json: () => Promise.resolve(mockFileSystemWithMd) })
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve('Contenu Markdown') })
    })

    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1]
    const fileNameElement = firstFile.find(".file-name")
    
    // Vérifier que l'extension est .md
    expect(fileNameElement.text()).toBe("rapport_mission.md")
  })

  // Feature 4: Sélection de fichiers pour téléchargement
  it("devrait afficher une checkbox pour chaque fichier", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Skip ".."
    const checkbox = firstFile.find("input[type=checkbox]")
    expect(checkbox.exists()).toBe(true)
  })

  it("ne devrait pas afficher de checkbox pour les dossiers", async () => {
    await wrapper.vm.loadFileSystem()
    const dirItem = wrapper.findAll(".file-item")[0] // ".."
    const checkbox = dirItem.find("input[type=checkbox]")
    expect(checkbox.exists()).toBe(false)
  })

  it("devrait sélectionner un fichier via la checkbox", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Skip ".."
    const checkbox = firstFile.find("input[type=checkbox]")
    await checkbox.setValue(true)
    expect(wrapper.vm.selectedFiles).toContain(1)
  })

  it("devrait désélectionner un fichier via la checkbox", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Skip ".."
    const checkbox = firstFile.find("input[type=checkbox]")
    await checkbox.setValue(true)
    await checkbox.setValue(false)
    expect(wrapper.vm.selectedFiles).not.toContain(1)
  })

  it("devrait afficher un bouton de téléchargement quand des fichiers sont sélectionnés", async () => {
    await wrapper.vm.loadFileSystem()
    wrapper.vm.selectedFiles = [1]
    await wrapper.vm.$nextTick()
    const downloadButton = wrapper.find(".download-button")
    expect(downloadButton.exists()).toBe(true)
  })

  it("ne devrait pas afficher le bouton de téléchargement si aucun fichier n'est sélectionné", async () => {
    await wrapper.vm.loadFileSystem()
    wrapper.vm.selectedFiles = []
    await wrapper.vm.$nextTick()
    const downloadButton = wrapper.find(".download-button")
    expect(downloadButton.exists()).toBe(false)
  })

  // Synchronisation entre sélection visuelle et checkbox
  it("devrait cocher la checkbox quand on clique sur un fichier", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Skip ".."
    
    // Clic sur le fichier (pas la checkbox)
    await firstFile.trigger("click")
    
    // Vérifier que la checkbox est cochée
    const checkbox = firstFile.find("input[type=checkbox]")
    expect(checkbox.element.checked).toBe(true)
    // Vérifier que l'index est dans selectedFiles
    expect(wrapper.vm.selectedFiles).toContain(1)
  })

  it("devrait décocher la checkbox quand on clique à nouveau sur un fichier", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Skip ".."

    // Premier clic : coche
    await firstFile.trigger("click")
    expect(wrapper.vm.selectedFiles).toContain(1)

    // Deuxième clic : décoche
    await firstFile.trigger("click")
    expect(wrapper.vm.selectedFiles).not.toContain(1)
  })

  it("devrait réinitialiser la sélection lors d'un changement de répertoire", async () => {
    await wrapper.vm.loadFileSystem()
    // Sélectionner un fichier dans /Fichiers
    const firstFile = wrapper.findAll(".file-item")[1] // Skip ".."
    await firstFile.trigger("click")
    expect(wrapper.vm.selectedFiles).toContain(1)

    // Naviguer vers un autre répertoire : les index positionnels ne doivent pas
    // se reporter sur un dossier au contenu différent.
    await wrapper.vm.changeDirectory("/")
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedFiles).toEqual([])
  })

  it("devrait surligner le fichier quand on coche la checkbox", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Skip ".."
    const checkbox = firstFile.find("input[type=checkbox]")

    // Cocher la checkbox (aucune synchro manuelle : la sélection est une source unique)
    await checkbox.setValue(true)
    await wrapper.vm.$nextTick()

    // Vérifier que le fichier est surligné (classe "selected")
    expect(firstFile.classes()).toContain("selected")
  })

  it("devrait désurligner le fichier quand on décoche la checkbox", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Skip ".."
    const checkbox = firstFile.find("input[type=checkbox]")

    // Cocher puis décocher (aucune synchro manuelle)
    await checkbox.setValue(true)
    await checkbox.setValue(false)
    await wrapper.vm.$nextTick()

    // Vérifier que le fichier n'est plus surligné
    expect(firstFile.classes()).not.toContain("selected")
  })

  // Feature 5: Télécharger les fichiers en ZIP
  it("devrait avoir une méthode downloadSelectedFiles", async () => {
    await wrapper.vm.loadFileSystem()
    expect(typeof wrapper.vm.downloadSelectedFiles).toBe('function')
  })

  it("devrait loguer un avertissement si aucun fichier n'est sélectionné", async () => {
    const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    await wrapper.vm.loadFileSystem()
    wrapper.vm.selectedFiles = []
    
    await wrapper.vm.downloadSelectedFiles()
    
    // Vérifier qu'un avertissement est logged
    expect(mockConsoleWarn).toHaveBeenCalledWith('Aucun fichier sélectionné pour téléchargement.')
    
    mockConsoleWarn.mockRestore()
  })

  it("devrait appeler fetch pour chaque fichier sélectionné", async () => {
    // Mock global.fetch pour vérifier les appels
    const originalFetch = global.fetch
    global.fetch = vi.fn((url) => {
      if (url === '/file-system.json') {
        return Promise.resolve({ json: () => Promise.resolve(mockFileSystem) })
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve('Contenu du fichier') })
    })
    
    await wrapper.vm.loadFileSystem()
    // Sélectionner 2 fichiers
    wrapper.vm.selectedFiles = [1, 2]
    
    // Appeler downloadSelectedFiles
    await wrapper.vm.downloadSelectedFiles()
    
    // Vérifier que fetch a été appelé pour chaque fichier
    expect(global.fetch).toHaveBeenCalledWith('/fichiers/rapport_mission.md')
    expect(global.fetch).toHaveBeenCalledWith('/fichiers/ordre_executor.md')
    
    // Restaurer fetch
    global.fetch = originalFetch
  })
})
