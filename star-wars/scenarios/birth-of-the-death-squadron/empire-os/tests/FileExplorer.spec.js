import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import FileExplorer from "../src/components/FileExplorer.vue"
import { OS } from "../src/os-identity.js"
import { sessionLog, resetLog, surveillanceText, SESSION_OPEN_TEXT } from "../src/session-log.js"
import { setSessionConfig } from "../src/session-store.js"

// saveAs déclenche un vrai téléchargement navigateur (indisponible en jsdom) ;
// on le mocke pour capturer le blob ZIP produit et l'inspecter.
vi.mock("file-saver", () => ({ saveAs: vi.fn() }))

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
    expect(header.text()).toContain(`${OS.shortName}:/Fichiers$`)
    expect(header.text()).not.toContain("C:")
    expect(header.text()).not.toContain("\\")
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
    expect(header.text()).toContain(`${OS.shortName}:/Fichiers$`)
    expect(header.text()).not.toContain("C:")
    expect(header.text()).not.toContain("\\")
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
    wrapper.vm.openFile(file)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.file-modal').exists()).toBe(true)
  })

  it("devrait fermer la modale avec closeFileModal", async () => {
    await wrapper.vm.loadFileSystem()
    const file = wrapper.vm.currentDirectoryItems[1]
    wrapper.vm.openFile(file)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.file-modal').exists()).toBe(true)
    wrapper.vm.closeFileModal()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.file-modal').exists()).toBe(false)
  })

  it("devrait ouvrir un fichier en double-cliquant dessus", async () => {
    await wrapper.vm.loadFileSystem()
    const fileItems = wrapper.findAll(".file-item")
    const firstFile = fileItems[1] // Skip ".."
    await firstFile.trigger("dblclick")
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.file-modal').exists()).toBe(true)
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
    expect(wrapper.find('.file-modal').exists()).toBe(false)
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
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.file-modal').exists()).toBe(true)
    expect(wrapper.vm.openedFile.name).toBe("rapport_mission.md")
  })

  it("ne devrait pas afficher d'icône d'ouverture pour les dossiers", async () => {
    await wrapper.vm.loadFileSystem()
    const dirItem = wrapper.findAll(".file-item")[0] // ".."
    const openIcon = dirItem.find(".open-icon")
    expect(openIcon.exists()).toBe(false)
  })

  // Le rendu du contenu (Markdown -> HTML, texte brut, erreur « fichier introuvable », etc.)
  // est couvert au niveau de la modale dans FilePreviewModal.spec.js (seam du composant).

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
    vi.useFakeTimers()
    const originalFetch = global.fetch
    global.fetch = vi.fn((url) => {
      if (url === '/file-system.json') {
        return Promise.resolve({ json: () => Promise.resolve(mockFileSystem) })
      }
      return Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['Contenu du fichier'])) })
    })

    await wrapper.vm.loadFileSystem()
    wrapper.vm.rng = () => 0.5
    wrapper.vm.selectedFiles = [1, 2]

    // Le download passe par la popin d'attente ; on avance jusqu'à complétion.
    wrapper.vm.downloadSelectedFiles()
    await vi.advanceTimersByTimeAsync(60000)

    // Le vrai fetch (en fond) a été appelé pour chaque fichier (avec un signal d'abandon).
    expect(global.fetch).toHaveBeenCalledWith('/fichiers/rapport_mission.md', expect.anything())
    expect(global.fetch).toHaveBeenCalledWith('/fichiers/ordre_executor.md', expect.anything())

    global.fetch = originalFetch
    vi.useRealTimers()
  })
})

describe("FileExplorer.vue - Point 2: Multi-disques", () => {
  // Un disque est un noeud `type: 'disk'` au sommet de l'arbre, traité comme un
  // conteneur navigable. La racine liste les disques (sélecteur de disques).
  // `defaultPath` (piloté par la donnée) fixe le point d'entrée : la machine de Tana.
  const multiDiskFS = {
    name: 'root', path: '/', type: 'directory',
    defaultPath: '/user-51394345/home',
    children: [
      {
        name: 'user-51394345', path: '/user-51394345', type: 'disk',
        children: [
          {
            name: 'home', path: '/user-51394345/home', type: 'directory',
            children: [
              { name: 'rapport_mission.md', path: '/user-51394345/home/rapport_mission.md', type: 'file' }
            ]
          },
          { name: 'etc', path: '/user-51394345/etc', type: 'directory', children: [] }
        ]
      },
      {
        name: 'srv-transmissions', path: '/srv-transmissions', type: 'disk',
        children: [
          {
            name: 'partages', path: '/srv-transmissions/partages', type: 'directory',
            children: [
              { name: 'journal_transmissions.md', path: '/srv-transmissions/partages/journal_transmissions.md', type: 'file' }
            ]
          }
        ]
      }
    ]
  }

  let wrapper
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url === '/file-system.json') {
        return Promise.resolve({ json: () => Promise.resolve(multiDiskFS) })
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve('contenu') })
    })
    wrapper = mount(FileExplorer)
  })

  it("atterrit sur le point d'entrée (defaultPath) après chargement", async () => {
    await wrapper.vm.loadFileSystem()
    expect(wrapper.vm.currentPath).toBe('/user-51394345/home')
  })

  it("affiche le contenu d'un disque après y avoir navigué", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory('/srv-transmissions')
    const names = wrapper.vm.currentDirectoryItems.map(i => i.name)
    expect(names).toContain('partages')
  })

  it("entre dans un disque au clic, sans le sélectionner", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory('/') // racine = sélecteur de disques
    await wrapper.vm.$nextTick()
    const items = wrapper.findAll('.file-item')
    const reseau = items.find(i => i.find('.file-name').text().startsWith('srv-transmissions'))
    await reseau.trigger('click')
    expect(wrapper.vm.currentPath).toBe('/srv-transmissions')
    expect(wrapper.vm.selectedFiles).toEqual([])
  })

  it("marque visuellement les disques (classe disk) et ne leur met pas de checkbox", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory('/')
    await wrapper.vm.$nextTick()
    const items = wrapper.findAll('.file-item')
    const reseau = items.find(i => i.find('.file-name').text().startsWith('srv-transmissions'))
    expect(reseau.classes()).toContain('disk')
    expect(reseau.find('input[type=checkbox]').exists()).toBe(false)
  })
})

describe("FileExplorer.vue - Point 3: Aiguilleur d'affichage par type", () => {
  // Le contenu par défaut du mock contient des marqueurs qui permettent de
  // distinguer un rendu Markdown (# devient un titre) d'un affichage texte brut.
  const fsWithTypes = {
    name: 'root', path: '/', type: 'directory', defaultPath: '/data',
    children: [
      {
        name: 'data', path: '/data', type: 'disk',
        children: [
          { name: 'journal.docx', path: '/data/journal.docx', type: 'file', previewMode: 'summary', summary: 'Journal des transmissions — 214 entrees clients.' },
          { name: 'reseau.config', path: '/data/reseau.config', type: 'file' },
          { name: 'image.dat', path: '/data/image.dat', type: 'file' },
          { name: 'photo.png', path: '/data/photo.png', type: 'file' },
          { name: 'notes.md', path: '/data/notes.md', type: 'file' }
        ]
      }
    ]
  }

  let wrapper
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url === '/file-system.json') {
        return Promise.resolve({ json: () => Promise.resolve(fsWithTypes) })
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve('# titre\n<b>x</b>') })
    })
    wrapper = mount(FileExplorer)
  })

  const fileNamed = (name) => wrapper.vm.currentDirectory.children.find(f => f.name === name)

  it("mode summary : affiche le résumé et invite au téléchargement", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.openFile(fileNamed('journal.docx'))
    await wrapper.vm.$nextTick()
    const modal = wrapper.find('.file-modal')
    expect(modal.text()).toContain('Journal des transmissions — 214 entrees clients.')
    expect(modal.text().toLowerCase()).toContain('téléchargez')
  })

  it("fichier texte système (.config) : contenu brut, ni Markdown ni HTML interprété", async () => {
    await wrapper.vm.loadFileSystem()
    wrapper.vm.openFile(fileNamed('reseau.config'))
    await flushPromises()
    const modal = wrapper.find('.file-modal')
    // '# titre' reste littéral (pas de <h1>) et '<b>' n'est pas injecté
    expect(modal.text()).toContain('# titre')
    expect(modal.text()).toContain('<b>x</b>')
  })

  it("binaire inconnu (.dat) : « impossible de prévisualiser »", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.openFile(fileNamed('image.dat'))
    await wrapper.vm.$nextTick()
    const modal = wrapper.find('.file-modal')
    expect(modal.text().toLowerCase()).toContain('impossible de prévisualiser')
  })

  it("fichier .md : rend le Markdown (titre sans le #)", async () => {
    await wrapper.vm.loadFileSystem()
    wrapper.vm.openFile(fileNamed('notes.md'))
    await flushPromises()
    const modal = wrapper.find('.file-modal')
    expect(modal.text()).toContain('titre')
    expect(modal.text()).not.toContain('# titre')
  })

  it("image d'un type connu (.png) : rendue inline via <img>", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.openFile(fileNamed('photo.png'))
    await wrapper.vm.$nextTick()
    const img = wrapper.find('.file-modal img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/fichiers/photo.png')
  })
})

describe("FileExplorer.vue - Point 4: Téléchargement binaire (blob)", () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(FileExplorer)
  })

  it("télécharge le contenu en binaire (blob) : les octets ne sont pas corrompus", async () => {
    // Octets non-représentables en UTF-8 : un pipeline `.text()` les mangerait.
    const originalBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff, 0xfe, 0x42])
    let capturedZip = null
    saveAs.mockImplementation((blob) => { capturedZip = blob })

    global.fetch = vi.fn((url) => {
      if (url === '/file-system.json') {
        return Promise.resolve({ json: () => Promise.resolve(mockFileSystem) })
      }
      return Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob([originalBytes])),
        text: () => Promise.resolve('CONTENU-TEXTE-CORROMPU')
      })
    })

    vi.useFakeTimers()
    await wrapper.vm.loadFileSystem()
    wrapper.vm.rng = () => 0.5
    wrapper.vm.selectedFiles = [1] // un fichier du répertoire courant

    // Le download passe par la popin d'attente ; on avance jusqu'à complétion (saveAs).
    wrapper.vm.downloadSelectedFiles()
    await vi.advanceTimersByTimeAsync(60000)
    vi.useRealTimers()

    expect(capturedZip).toBeTruthy()
    // On relit le ZIP produit et on compare les octets à l'original.
    const zip = await JSZip.loadAsync(capturedZip)
    const name = Object.keys(zip.files)[0]
    const bytes = await zip.file(name).async('uint8array')
    expect(Array.from(bytes)).toEqual(Array.from(originalBytes))
  })

  it("avorte le téléchargement en cours au démontage (fin de session) : pas de saveAs", async () => {
    saveAs.mockClear()
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(mockFileSystem) })
      : Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) }))

    vi.useFakeTimers()
    await wrapper.vm.loadFileSystem()
    wrapper.vm.rng = () => 0.5
    wrapper.vm.selectedFiles = [1]
    wrapper.vm.downloadSelectedFiles() // transfert lancé (popin d'attente)

    wrapper.unmount() // fin de session : l'OS est démonté avant complétion
    await vi.advanceTimersByTimeAsync(60000)
    vi.useRealTimers()

    expect(saveAs).not.toHaveBeenCalled() // le téléchargement entamé est perdu
  })
})

describe("FileExplorer.vue - Nom de fichier long", () => {
  const longName = 'rapport_de_surveillance_tres_long_de_la_flotte_executor_2024.md'
  const fs = {
    name: 'root', path: '/', type: 'directory', defaultPath: '/data',
    children: [
      {
        name: 'data', path: '/data', type: 'disk',
        children: [
          { name: longName, path: '/data/' + longName, type: 'file' }
        ]
      }
    ]
  }

  let wrapper
  beforeEach(() => {
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(fs) })
      : Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) }))
    wrapper = mount(FileExplorer)
  })

  it("expose le nom complet au survol (title) et garde le bouton d'ouverture présent", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.$nextTick()
    const items = wrapper.findAll('.file-item')
    const fileItem = items.find(i => i.find('.file-name').text().startsWith('rapport_de_surveillance'))
    // Nom complet accessible au survol (le nom affiché sera tronqué par le CSS).
    expect(fileItem.find('.file-name').attributes('title')).toBe(longName)
    // Le bouton d'ouverture reste dans le DOM (le CSS l'empêche d'être poussé hors vue).
    expect(fileItem.find('.open-icon').exists()).toBe(true)
  })
})

describe("FileExplorer.vue - Loader d'affichage", () => {
  const fs = {
    name: 'root', path: '/', type: 'directory', defaultPath: '/data',
    children: [
      {
        name: 'data', path: '/data', type: 'disk',
        children: [
          { name: 'photo.png', path: '/data/photo.png', type: 'file' },
          { name: 'notes.md', path: '/data/notes.md', type: 'file' }
        ]
      }
    ]
  }

  let wrapper
  beforeEach(() => {
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(fs) })
      : Promise.resolve({ ok: true, text: () => Promise.resolve('# hi') }))
    wrapper = mount(FileExplorer)
  })

  const fileNamed = (name) => wrapper.vm.currentDirectory.children.find(f => f.name === name)

  it("image : affiche un loader tant qu'elle n'a pas déclenché son chargement", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.openFile(fileNamed('photo.png'))
    await wrapper.vm.$nextTick()
    // Loader visible tant que l'<img> n'a pas fini de charger
    expect(wrapper.find('.file-modal .loader').exists()).toBe(true)
    // Une fois l'image chargée (événement load), le loader disparaît
    await wrapper.find('.file-modal img').trigger('load')
    expect(wrapper.find('.file-modal .loader').exists()).toBe(false)
  })

  it("markdown/texte : affiche un loader pendant le chargement du contenu", async () => {
    let resolveContent
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(fs) })
      : new Promise((res) => { resolveContent = () => res({ ok: true, text: () => Promise.resolve('# hi') }) }))
    await wrapper.vm.loadFileSystem()

    wrapper.vm.openFile(fileNamed('notes.md')) // fetch en attente
    await flushPromises() // l'enfant monte et pose loading=true
    expect(wrapper.find('.file-modal .loader').exists()).toBe(true) // loader pendant le fetch

    resolveContent()
    await flushPromises()
    expect(wrapper.find('.file-modal .loader').exists()).toBe(false) // contenu prêt, loader parti
  })
})

describe("FileExplorer.vue - Point 6: Popin d'attente (transfert)", () => {
  // gros.bin : poids 20 -> durée = base 10 + 20 = 30 s (jitter neutre, qualité/alerte par défaut)
  const fs = {
    name: 'root', path: '/', type: 'directory', defaultPath: '/data',
    children: [
      {
        name: 'data', path: '/data', type: 'disk',
        children: [
          { name: 'gros.bin', path: '/data/gros.bin', type: 'file', transferWeight: 20 }
        ]
      }
    ]
  }

  let wrapper
  beforeEach(() => {
    saveAs.mockReset()
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(fs) })
      : Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) }))
    wrapper = mount(FileExplorer)
  })

  it("ouvre une popin d'attente et n'enregistre qu'à la complétion de la barre", async () => {
    vi.useFakeTimers()
    await wrapper.vm.loadFileSystem()
    wrapper.vm.rng = () => 0.5 // jitter neutre -> durée déterministe 30 s
    wrapper.vm.selectedFiles = [1] // gros.bin (index 0 = '..')

    wrapper.vm.downloadSelectedFiles()
    await wrapper.vm.$nextTick()
    // Popin visible, rien d'enregistré encore
    expect(wrapper.find('.transfer-modal').exists()).toBe(true)
    expect(saveAs).not.toHaveBeenCalled()

    // Avance jusqu'à la complétion (30 s) en flushant les promesses (fetch + zip)
    await vi.advanceTimersByTimeAsync(30000)
    await wrapper.vm.$nextTick()
    expect(saveAs).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.transfer-modal').exists()).toBe(false)

    vi.useRealTimers()
  })

  it("annuler ferme la popin sans enregistrer et interrompt le vrai transfert", async () => {
    vi.useFakeTimers()
    const signals = []
    global.fetch = vi.fn((url, opts) => {
      if (url === '/file-system.json') return Promise.resolve({ json: () => Promise.resolve(fs) })
      if (opts && opts.signal) signals.push(opts.signal)
      return Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) })
    })
    await wrapper.vm.loadFileSystem()
    wrapper.vm.rng = () => 0.5
    wrapper.vm.selectedFiles = [1]

    wrapper.vm.downloadSelectedFiles()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.transfer-modal').exists()).toBe(true)

    await wrapper.find('.transfer-cancel').trigger('click')
    expect(wrapper.find('.transfer-modal').exists()).toBe(false)

    // Même en laissant filer le temps : aucun enregistrement, et le fetch a été abandonné.
    await vi.advanceTimersByTimeAsync(60000)
    expect(saveAs).not.toHaveBeenCalled()
    expect(signals.some(s => s.aborted)).toBe(true)
    vi.useRealTimers()
  })

  // Note : l'application des réglages de session depuis file-system.json est désormais
  // portée par App (hôte persistant) — cf. tests/App.spec.js. FileExplorer ne fait plus
  // que lire le store partagé.
})

describe("FileExplorer.vue - Point 9: Icônes par type", () => {
  const fs = {
    name: 'root', path: '/', type: 'directory', defaultPath: '/d',
    children: [
      {
        name: 'd', path: '/d', type: 'disk',
        children: [
          { name: 'sous', path: '/d/sous', type: 'directory', children: [] },
          { name: 'photo.png', path: '/d/photo.png', type: 'file' },
          { name: 'note.md', path: '/d/note.md', type: 'file' },
          { name: 'conf.ini', path: '/d/conf.ini', type: 'file' },
          { name: 'blob.dat', path: '/d/blob.dat', type: 'file' }
        ]
      }
    ]
  }

  let wrapper
  beforeEach(() => {
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(fs) })
      : Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) }))
    wrapper = mount(FileExplorer)
  })

  const itemNamed = (name) => wrapper.findAll('.file-item')
    .find(i => i.find('.file-name').text().startsWith(name))

  it("affiche une icône de type devant chaque entrée (dossier)", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.$nextTick()
    const dir = itemNamed('sous')
    expect(dir.find('.file-icon').exists()).toBe(true)
    expect(dir.find('.file-icon').text()).toBe('▸')
  })

  it("mappe une icône distincte par type", async () => {
    await wrapper.vm.loadFileSystem()
    const icon = (item) => wrapper.vm.iconFor(item)
    expect(icon({ name: '..', type: 'directory' })).toBe('↰')
    expect(icon({ name: 'd', type: 'disk' })).toBe('▤')
    expect(icon({ name: 'sous', type: 'directory' })).toBe('▸')
    expect(icon({ name: 'note.md', type: 'file' })).toBe('≡')
    expect(icon({ name: 'conf.ini', type: 'file' })).toBe('⚙')
    expect(icon({ name: 'photo.png', type: 'file' })).toBe('▦')
    expect(icon({ name: 'j.docx', type: 'file' })).toBe('◈') // doc riche -> summary
    expect(icon({ name: 'blob.dat', type: 'file' })).toBe('▪') // binaire
  })
})

describe("FileExplorer.vue - Point 8: Rendu .docx inline (mammoth)", () => {
  // Construit un vrai .docx minimal (zip OOXML) pour tester le rendu réel via mammoth.
  async function makeDocx(text) {
    const zip = new JSZip()
    zip.file('[Content_Types].xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '</Types>')
    zip.folder('_rels').file('.rels',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      '</Relationships>')
    zip.folder('word').file('document.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      `<w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`)
    return zip.generateAsync({ type: 'arraybuffer' })
  }

  const fs = {
    name: 'root', path: '/', type: 'directory', defaultPath: '/d',
    children: [
      {
        name: 'd', path: '/d', type: 'disk',
        children: [
          { name: 'note.docx', path: '/d/note.docx', type: 'file', previewMode: 'full' }
        ]
      }
    ]
  }

  it("rend un .docx (previewMode full) inline via mammoth, sans mode summary", async () => {
    const docxAB = await makeDocx('RAPPORT IMPERIAL CONFIDENTIEL')
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(fs) })
      : Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(docxAB) }))
    const wrapper = mount(FileExplorer)
    await wrapper.vm.loadFileSystem()

    const file = wrapper.vm.currentDirectory.children.find(f => f.name === 'note.docx')
    wrapper.vm.openFile(file)
    // La modale charge le .docx (import dynamique de mammoth + conversion) : on laisse
    // la chaîne asynchrone se dérouler avant d'inspecter le rendu.
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 100))
    await flushPromises()

    const modal = wrapper.find('.file-modal')
    expect(modal.text()).toContain('RAPPORT IMPERIAL CONFIDENTIEL')
    expect(modal.text().toLowerCase()).not.toContain('téléchargez') // pas le mode summary
  })
  // Le routage .docx (full -> inline, sinon résumé « journal verrouillé ») est désormais
  // couvert de façon unitaire dans file-preview.spec.js (fonction pure previewKindFor).
})

describe("FileExplorer.vue - Highlight des fichiers critiques (aide Bafouille)", () => {
  const treeWithCritical = {
    name: 'root', path: '/', type: 'directory', defaultPath: '/Fichiers',
    children: [{
      name: 'Fichiers', path: '/Fichiers', type: 'directory',
      children: [
        { name: 'plan.md', path: '/Fichiers/plan.md', type: 'file', isCritical: true },
        { name: 'banal.md', path: '/Fichiers/banal.md', type: 'file' }
      ]
    }]
  }
  const mountLoaded = async () => {
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(treeWithCritical) })
      : Promise.resolve({ ok: true, text: () => Promise.resolve('x') }))
    const wrapper = mount(FileExplorer)
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.$nextTick()
    return wrapper
  }
  const itemNamed = (wrapper, name) =>
    wrapper.findAll('.file-item').find(i => i.text().includes(name))

  it("surligne les fichiers critiques quand l'intervention Bafouille est active", async () => {
    setSessionConfig({ bafouille: true })
    const wrapper = await mountLoaded()
    expect(itemNamed(wrapper, 'plan.md').classes()).toContain('bafouille-critical')
    expect(itemNamed(wrapper, 'banal.md').classes()).not.toContain('bafouille-critical')
  })

  it("ne surligne aucun fichier quand l'intervention est inactive", async () => {
    setSessionConfig({ bafouille: false })
    const wrapper = await mountLoaded()
    expect(itemNamed(wrapper, 'plan.md').classes()).not.toContain('bafouille-critical')
  })
})

describe("FileExplorer.vue - Tri des entrées (dossiers avant fichiers)", () => {
  // Ordre d'auteur : un fichier AVANT un dossier -> le tri doit remonter le dossier.
  const fs = {
    name: 'root', path: '/', type: 'directory', defaultPath: '/d',
    children: [
      {
        name: 'd', path: '/d', type: 'disk',
        children: [
          { name: 'zeta.md', path: '/d/zeta.md', type: 'file' },
          { name: 'alpha', path: '/d/alpha', type: 'directory', children: [] },
          { name: 'beta.md', path: '/d/beta.md', type: 'file' }
        ]
      }
    ]
  }

  it("place les dossiers avant les fichiers, ordre d'auteur préservé dans chaque groupe", async () => {
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(fs) })
      : Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) }))
    const wrapper = mount(FileExplorer)
    await wrapper.vm.loadFileSystem()
    const names = wrapper.vm.currentDirectoryItems.map(i => i.name)
    // '..' en tête, puis le dossier (remonté), puis les fichiers en ordre d'auteur
    expect(names).toEqual(['..', 'alpha', 'zeta.md', 'beta.md'])
  })
})

describe("FileExplorer.vue - Point 7: Recherche (dock)", () => {
  const fs = {
    name: 'root', path: '/', type: 'directory', defaultPath: '/d',
    children: [
      {
        name: 'd', path: '/d', type: 'disk',
        children: [
          {
            name: 'sous', path: '/d/sous', type: 'directory',
            children: [
              { name: 'rapport_mission.md', path: '/d/sous/rapport_mission.md', type: 'file' }
            ]
          },
          { name: 'notes.md', path: '/d/notes.md', type: 'file' }
        ]
      }
    ]
  }

  let wrapper
  beforeEach(() => {
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(fs) })
      : Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) }))
    wrapper = mount(FileExplorer)
  })

  afterEach(() => {
    // Le listener clavier vit sur window : on démonte pour éviter les fuites entre tests.
    if (wrapper) wrapper.unmount()
  })

  // La Console est l'onglet par défaut : on active la Recherche comme le ferait Ctrl+F.
  const activateSearch = async (w) => { w.vm.$refs.dock.focusSearch(); await w.vm.$nextTick() }

  it("affiche les résultats récursifs (avec chemin) et le compteur dans le dock", async () => {
    await wrapper.vm.loadFileSystem() // currentPath = /d
    await activateSearch(wrapper)
    await wrapper.find('.search-input').setValue('rapport')
    await wrapper.vm.$nextTick()
    const dock = wrapper.find('.bottom-dock')
    expect(dock.text()).toContain('/d/sous/rapport_mission.md') // résultat récursif + chemin
    expect(dock.text().toLowerCase()).toContain('1 fichier correspond')
  })

  it("rappelle le périmètre de recherche courant dans le dock", async () => {
    await wrapper.vm.loadFileSystem() // currentPath = /d
    await activateSearch(wrapper)
    await wrapper.find('.search-input').setValue('rap')
    await wrapper.vm.$nextTick()
    const scope = wrapper.find('.search-scope')
    expect(scope.exists()).toBe(true)
    expect(scope.text()).toContain('/d') // périmètre = dossier courant
  })

  it("ne rappelle aucun périmètre sans requête", async () => {
    await wrapper.vm.loadFileSystem()
    await activateSearch(wrapper)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.search-scope').exists()).toBe(false)
  })

  it("le périmètre rappelé suit l'élargissement (dossier -> disque -> tous)", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory('/d/sous')
    await activateSearch(wrapper)
    await wrapper.find('.search-input').setValue('notes') // absent de /d/sous
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.search-scope').text()).toContain('/d/sous') // chemin du dossier courant

    // bascule explicite sur le disque via le sélecteur : le rappel montre la racine du disque
    await wrapper.findAll('.scope-btn').find(b => b.text().toLowerCase().includes('disque')).trigger('click')
    await wrapper.vm.$nextTick()
    const scope = wrapper.find('.search-scope').text()
    expect(scope).toContain('/d')
    expect(scope).not.toContain('/d/sous') // périmètre remonté au disque
  })

  it("surligne dans la liste courante les entrées qui matchent (classe + <mark>)", async () => {
    await wrapper.vm.loadFileSystem() // /d ; 'notes.md' y est directement
    await activateSearch(wrapper)
    await wrapper.find('.search-input').setValue('notes')
    await wrapper.vm.$nextTick()
    const notes = wrapper.findAll('.file-item')
      .find(i => i.find('.file-name').text().startsWith('notes'))
    expect(notes.classes()).toContain('search-match')
    expect(notes.find('mark.hl').exists()).toBe(true)
    expect(notes.find('mark.hl').text()).toBe('notes')
  })

  // Sélecteur de périmètre : on choisit explicitement dossier / disque / tous les disques.
  const scopeBtn = (w, needle) =>
    w.findAll('.scope-btn').find(b => b.text().toLowerCase().includes(needle))

  it("permet de changer de périmètre via le sélecteur (les résultats se recalculent)", async () => {
    await wrapper.vm.loadFileSystem()
    await wrapper.vm.changeDirectory('/d/sous') // 'notes.md' n'est pas ici (il est dans /d)
    await activateSearch(wrapper)
    await wrapper.find('.search-input').setValue('notes')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.bottom-dock').text()).not.toContain('/d/notes.md') // 0 résultat dans le dossier

    await scopeBtn(wrapper, 'tous').trigger('click') // je bascule sur « tous les disques »
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.bottom-dock').text()).toContain('/d/notes.md')
  })

  it("marque le périmètre actif dans le sélecteur", async () => {
    await wrapper.vm.loadFileSystem()
    await activateSearch(wrapper)
    await wrapper.find('.search-input').setValue('rap')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.scope-btn.active').text().toLowerCase()).toContain('dossier')

    await scopeBtn(wrapper, 'disque').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.scope-btn.active').text().toLowerCase()).toContain('disque')
  })

  it("Échap efface la requête", async () => {
    await wrapper.vm.loadFileSystem()
    wrapper.vm.searchQuery = 'rap'
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.searchQuery).toBe('')
  })

  it("Ctrl+F focus le champ de recherche et écrase le raccourci natif", async () => {
    wrapper.unmount() // retire le listener du wrapper du beforeEach
    wrapper = mount(FileExplorer, { attachTo: document.body })
    await wrapper.vm.loadFileSystem()
    const event = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, cancelable: true })
    window.dispatchEvent(event)
    await wrapper.vm.$nextTick()
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(wrapper.find('.search-input').element)
  })

  it("préserve la requête à la navigation", async () => {
    await wrapper.vm.loadFileSystem()
    wrapper.vm.searchQuery = 'rap'
    await wrapper.vm.changeDirectory('/d/sous')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.searchQuery).toBe('rap')
  })
})

describe("FileExplorer.vue - Console: surveillance des actions", () => {
  let wrapper
  beforeEach(async () => {
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(mockFileSystem) })
      : Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) }))
    wrapper = mount(FileExplorer)
    await wrapper.vm.loadFileSystem()
    resetLog() // isole l'action testée du bruit du chargement
  })
  afterEach(() => {
    if (wrapper.vm._transfer) wrapper.vm.cancelTransfer()
    wrapper.unmount()
  })

  it("journalise l'ouverture d'un fichier", async () => {
    await wrapper.vm.openFile({ name: 'rapport_mission.md', path: '/Fichiers/rapport_mission.md', type: 'file' })
    const entry = sessionLog.at(-1)
    expect(entry.kind).toBe('surveillance')
    expect(entry.text).toBe(surveillanceText('open', 'rapport_mission.md'))
  })

  it("journalise la navigation (via le watcher currentPath)", async () => {
    await wrapper.vm.changeDirectory('/Dossiers')
    const texts = sessionLog.filter(e => e.kind === 'surveillance').map(e => e.text)
    expect(texts).toContain(surveillanceText('navigate', '/Dossiers'))
  })

  it("journalise le lancement d'une extraction avec les fichiers visés", () => {
    wrapper.vm.selectedFiles = [1] // rapport_mission.md (index 0 = '..')
    wrapper.vm.downloadSelectedFiles()
    const entry = sessionLog.find(e => e.kind === 'surveillance' && e.text.startsWith('EXTRACTION'))
    expect(entry.text).toBe(surveillanceText('extract', 'rapport_mission.md'))
  })

  it("journalise l'annulation d'une extraction", () => {
    wrapper.vm.selectedFiles = [1]
    wrapper.vm.downloadSelectedFiles()
    wrapper.vm.cancelTransfer()
    const entry = sessionLog.at(-1)
    expect(entry.text).toBe(surveillanceText('cancelExtract'))
  })

  it("ouvre la session par une ligne système « Session ouverte »", async () => {
    resetLog()
    const w = mount(FileExplorer)
    await flushPromises()
    const boot = sessionLog.find(e => e.kind === 'system' && e.text === SESSION_OPEN_TEXT)
    expect(boot).toBeTruthy()
    w.unmount()
  })
})

describe("FileExplorer.vue - Console: propagande d'ambiance", () => {
  const fsProp = {
    name: 'root', path: '/', type: 'directory',
    children: [{ name: 'd', path: '/d', type: 'disk', children: [] }],
    session: { alertLevel: 0 },
    console: { propaganda: ["SLOGAN TEST"] }
  }
  beforeEach(() => {
    resetLog()
    vi.useFakeTimers()
    global.fetch = vi.fn((url) => url === '/file-system.json'
      ? Promise.resolve({ json: () => Promise.resolve(fsProp) })
      : Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) }))
  })
  afterEach(() => vi.useRealTimers())

  it("émet la propagande (pool MJ) sur timer, puis s'arrête au démontage", async () => {
    const wrapper = mount(FileExplorer)
    await flushPromises() // laisse created()/loadFileSystem se résoudre
    resetLog() // ignore le bruit du chargement (navigation initiale)

    await vi.advanceTimersByTimeAsync(45000) // cadence de base (alerte 0)
    const propa = sessionLog.filter(e => e.kind === 'propaganda')
    expect(propa.length).toBeGreaterThanOrEqual(1)
    expect(propa[0].text).toBe("SLOGAN TEST")

    wrapper.unmount()
    const before = sessionLog.length
    await vi.advanceTimersByTimeAsync(90000)
    expect(sessionLog.length).toBe(before) // plus rien après démontage
  })
})
