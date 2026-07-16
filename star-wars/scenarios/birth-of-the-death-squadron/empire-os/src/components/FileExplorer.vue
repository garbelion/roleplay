<template>
  <div class="file-explorer">
    <div class="terminal-header">
      <span>> C:\EmpireOS{{ currentPath.replace(/\//g, '\\') }}></span>
    </div>
    <div class="file-list-container">
      <div
        v-for="(item, index) in currentDirectoryItems"
        :key="index"
        class="file-item"
        :class="{ selected: selectedFiles.includes(index), directory: item.type === 'directory' }"
        @click="handleItemClick(item, index)"
        @dblclick="handleItemDoubleClick(item)"
      >
        <!-- Checkbox pour sélectionner les fichiers (pas les dossiers).
             Elle dérive de selectedFiles (source unique) et passe par le même
             mutateur que le clic sur la ligne, d'où une cohérence par construction. -->
        <input
          v-if="item.type === 'file'"
          type="checkbox"
          :checked="selectedFiles.includes(index)"
          class="file-checkbox"
          @change.stop="toggleFileSelection(index)"
          @click.stop
        >
        <span class="file-name">
          {{ item.name }}{{ item.type === 'directory' ? '/' : '' }}
        </span>
        <!-- Icône d'ouverture pour les fichiers (pas les dossiers) -->
        <span
          v-if="item.type === 'file'"
          class="open-icon"
          @click.stop="openFile(item)"
          title="Ouvrir le fichier"
        >
          📄
        </span>
      </div>
    </div>
    
    <!-- Bouton de téléchargement (visible si des fichiers sont sélectionnés) -->
    <div v-if="selectedFiles.length > 0" class="download-section">
      <button class="download-button" @click="downloadSelectedFiles">
        💾 Télécharger ({{ selectedFiles.length }}) fichiers
      </button>
    </div>

    <!-- Modale pour afficher le contenu des fichiers -->
    <div v-if="showFileModal" class="file-modal-overlay" @click="closeFileModal">
      <div class="file-modal" @click.stop>
        <div class="modal-header">
          <span>Fichier: {{ openedFile?.name }}</span>
          <button class="close-button" @click="closeFileModal">X</button>
        </div>
        <div class="modal-content">
          <!-- Afficher le contenu HTML (pas de texte brut) -->
          <div v-if="fileContent" v-html="fileContent"></div>
          <div v-else class="error">Contenu non disponible</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default {
  name: 'FileExplorer',
  data() {
    return {
      fileSystem: null,
      currentPath: '/Fichiers',
      // Source unique de la sélection : index des fichiers cochés dans currentDirectoryItems.
      selectedFiles: [],
      showFileModal: false,
      openedFile: null,
      fileContent: ''
    }
  },
  computed: {
    currentDirectory() {
      if (!this.fileSystem) return { children: [] }
      const dir = this.findDirectoryByPath(this.currentPath)
      return dir || this.fileSystem
    },
    currentDirectoryItems() {
      const items = [...this.currentDirectory.children]
      if (this.currentPath !== '/') {
        items.unshift({
          name: '..',
          path: '..',
          type: 'directory'
        })
      }
      return items
    }
  },
  async created() {
    await this.loadFileSystem()
  },
  methods: {
    normalizePath(path) {
      if (!path) return '/'
      let normalized = path.replace(/\/+/g, '/').replace(/^\//, '/').replace(/\/$/, '')
      return normalized === '' ? '/' : normalized
    },
    async loadFileSystem() {
      try {
        const response = await fetch('/file-system.json')
        this.fileSystem = await response.json()
      } catch (error) {
        console.error('Erreur lors du chargement du file system:', error)
        this.fileSystem = {
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
            }
          ]
        }
      }
    },
    findDirectoryByPath(path) {
      const normalizedPath = this.normalizePath(path)
      if (normalizedPath === '/') return this.fileSystem
      const pathParts = normalizedPath.split('/').filter(p => p)
      let current = this.fileSystem
      for (const part of pathParts) {
        const found = current.children.find(child => child.name === part && child.type === 'directory')
        if (!found) return null
        current = found
      }
      return current
    },
    async changeDirectory(path) {
      const normalizedPath = this.normalizePath(path)
      
      if (normalizedPath === '..') {
        const parts = this.normalizePath(this.currentPath).split('/').filter(p => p)
        if (parts.length === 0) {
          this.currentPath = '/'
          return
        }
        this.currentPath = '/' + parts.slice(0, -1).join('/')
        if (this.currentPath === '/') this.currentPath = '/'
        return
      }
      
      if (normalizedPath === '/') {
        this.currentPath = '/'
        return
      }
      
      if (normalizedPath.startsWith('/')) {
        const dir = this.findDirectoryByPath(normalizedPath)
        if (dir) {
          this.currentPath = this.normalizePath(normalizedPath)
        }
        return
      }
      
      const currentDir = this.currentDirectory
      const target = currentDir.children.find(child => child.name === normalizedPath && child.type === 'directory')
      if (target) {
        this.currentPath = target.path
      }
    },
    async openFile(file) {
      this.openedFile = file
      this.showFileModal = true
      await this.loadFileContent(file)
    },
    async loadFileContent(file) {
      try {
        // L'arborescence (file-system.json) est un décor : physiquement, tous les
        // fichiers vivent à plat dans /public/fichiers/ et sont adressés par leur
        // nom de base. Deux fichiers de même nom dans des dossiers différents
        // pointent donc volontairement vers le même contenu physique.
        const filename = file.path.split('/').pop()
        const response = await fetch(`/fichiers/${filename}`)
        if (response.ok) {
          const markdownContent = await response.text()
          // Contenu Markdown local et maîtrisé par l'auteur du scénario, rendu via
          // v-html. Si un jour ce contenu devient éditable/externe, il faudra
          // assainir la sortie (ex: DOMPurify) avant injection.
          this.fileContent = marked.parse(markdownContent)
        } else {
          // Si le fichier n'existe pas, afficher un message d'erreur
          this.fileContent = '<div class="error">Fichier introuvable</div>'
        }
      } catch (error) {
        console.error('Erreur lors du chargement du fichier:', error)
        this.fileContent = '<div class="error">Fichier introuvable</div>'
      }
    },
    closeFileModal() {
      this.showFileModal = false
      this.openedFile = null
      this.fileContent = ''
    },
    handleItemClick(item, index) {
      if (item.type === 'directory') {
        this.changeDirectory(item.path)
      } else {
        this.toggleFileSelection(index)
      }
    },
    handleItemDoubleClick(item) {
      if (item.type === 'directory') {
        this.changeDirectory(item.path)
      } else {
        this.openFile(item)
      }
    },
    toggleFileSelection(index) {
      const selectedIndex = this.selectedFiles.indexOf(index)
      if (selectedIndex === -1) {
        this.selectedFiles.push(index)
      } else {
        this.selectedFiles.splice(selectedIndex, 1)
      }
      this.$emit('files-selected', this.selectedFiles)
    },

    // Méthode pour télécharger les fichiers sélectionnés en ZIP
    async downloadSelectedFiles() {
      if (this.selectedFiles.length === 0) {
        console.warn('Aucun fichier sélectionné pour téléchargement.')
        return
      }

      try {
        // Créer une nouvelle archive ZIP
        const zip = new JSZip()

        // Ajouter chaque fichier sélectionné à l'archive
        for (const index of this.selectedFiles) {
          const file = this.currentDirectoryItems[index]
          if (file.type === 'file') {
            const filename = file.path.split('/').pop()
            const response = await fetch(`/fichiers/${filename}`)
            if (response.ok) {
              const fileContent = await response.text()
              zip.file(filename, fileContent)
            }
          }
        }

        // Générer le ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        
        // Télécharger le ZIP
        saveAs(zipBlob, 'EmpireOS_Fichiers.zip')
        
        console.log('Téléchargement terminé.')
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error)
      }
    },
    getFiles() {
      return this.currentDirectoryItems
    }
  },
  watch: {
    currentPath() {
      // La sélection est indexée par position dans le répertoire courant ;
      // on la vide à chaque navigation pour éviter des index périmés.
      this.selectedFiles = []
    }
  }
}
</script>

<style scoped>
.file-explorer { color: #0f0; font-family: monospace; font-size: 14px; line-height: 1.5; }
.terminal-header { margin-bottom: 10px; color: #0f0; }
.file-list-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background-color: transparent;
  border: 1px solid #000;
  cursor: pointer;
}
.file-item:hover { background-color: rgba(0, 255, 0, 0.1); }
.file-item.selected { background-color: rgba(0, 255, 0, 0.3); border-color: #0f0; }
.file-item.directory { color: #0ff; }
.file-item.directory:hover { background-color: rgba(0, 255, 255, 0.1); }

.file-name {
  flex: 1;
}

/* Checkbox pour la sélection de fichiers */
.file-checkbox {
  margin-right: 8px;
  cursor: pointer;
  accent-color: #0f0; /* Couleur verte pour cocher la checkbox */
}

/* Icône d'ouverture pour les fichiers */
.open-icon {
  cursor: pointer;
  margin-left: 8px;
  font-size: 16px;
  opacity: 0.7;
}

.open-icon:hover {
  opacity: 1;
}

/* Styles pour la modale */
.file-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.file-modal {
  background-color: #111;
  border: 2px solid #0f0;
  border-radius: 4px;
  width: 80%;
  max-width: 600px;
  max-height: 80%;
  overflow: auto;
  color: #0f0;
  font-family: monospace;
  font-size: 14px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #0f0;
  background-color: #000;
}

.modal-content {
  padding: 15px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Styles pour le contenu Markdown */
.modal-content h1, .modal-content h2, .modal-content h3 {
  color: #0f0;
  margin-top: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid #0f0;
  padding-bottom: 4px;
}

.modal-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
  color: #0f0;
}

.modal-content table th, .modal-content table td {
  border: 1px solid #0f0;
  padding: 6px;
  text-align: left;
}

.modal-content table th {
  background-color: #000;
}

.modal-content ul, .modal-content ol {
  margin-left: 20px;
  margin-bottom: 10px;
}

.modal-content li {
  margin-bottom: 4px;
}

.error {
  color: #f00;
  font-weight: bold;
}

.close-button {
  background: none;
  border: 1px solid #0f0;
  color: #0f0;
  cursor: pointer;
  padding: 4px 8px;
  font-family: monospace;
  font-size: 12px;
}

.close-button:hover {
  background-color: #0f0;
  color: #000;
}

/* Bouton de téléchargement */
.download-section {
  margin-top: 15px;
  text-align: right;
}

.download-button {
  background-color: #000;
  border: 1px solid #0f0;
  color: #0f0;
  cursor: pointer;
  padding: 8px 16px;
  font-family: monospace;
  font-size: 14px;
  transition: all 0.2s;
}

.download-button:hover {
  background-color: #0f0;
  color: #000;
  border-color: #0f0;
}
</style>
