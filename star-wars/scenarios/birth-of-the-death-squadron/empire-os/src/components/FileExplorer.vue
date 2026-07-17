<template>
  <div class="file-explorer">
    <div class="terminal-header">
      <span>{{ osName }}:{{ currentPath }}$</span>
    </div>
    <div class="file-list-container">
      <div
        v-for="(item, index) in currentDirectoryItems"
        :key="index"
        class="file-item"
        :class="{ selected: selectedFiles.includes(index), directory: item.type === 'directory', disk: item.type === 'disk' }"
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
        <span class="file-name" :title="item.name">
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
          <!-- Loader pendant le premier rendu (fetch d'un document ou chargement d'une image) -->
          <div v-if="previewLoading" class="loader">Chargement…</div>
          <!-- Aiguilleur d'affichage selon le type / previewMode du fichier.
               v-show garde l'<img> dans le DOM pendant le chargement pour capter @load. -->
          <div v-show="!previewLoading">
            <div v-if="previewKind === 'summary'" class="summary-preview">
              <p class="summary-text">{{ openedFile?.summary || 'Aperçu non disponible pour ce document.' }}</p>
              <p class="download-hint">Téléchargez le fichier pour consulter son contenu complet.</p>
            </div>
            <img v-else-if="previewKind === 'image'" :src="fileUrl(openedFile)" :alt="openedFile?.name" class="image-preview" @load="previewLoading = false" @error="previewLoading = false">
            <div v-else-if="previewKind === 'binary'" class="error">Impossible de prévisualiser ce contenu.</div>
            <pre v-else-if="previewKind === 'text'" class="raw-text">{{ fileContent }}</pre>
            <div v-else-if="fileContent" v-html="fileContent"></div>
            <div v-else class="error">Contenu non disponible</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { OS } from '../os-identity.js';

export default {
  name: 'FileExplorer',
  data() {
    return {
      osName: OS.name,
      fileSystem: null,
      currentPath: '/Fichiers',
      // Source unique de la sélection : index des fichiers cochés dans currentDirectoryItems.
      selectedFiles: [],
      showFileModal: false,
      openedFile: null,
      fileContent: '',
      // Mode d'aperçu résolu à l'ouverture : 'markdown' | 'text' | 'summary' | 'binary' | 'image'.
      previewKind: '',
      // Vrai tant que l'aperçu n'est pas prêt à s'afficher (fetch ou chargement image).
      previewLoading: false
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
    // Un conteneur navigable : un dossier classique ou un disque (noeud de tête).
    isContainer(item) {
      return item.type === 'directory' || item.type === 'disk'
    },
    async loadFileSystem() {
      try {
        const response = await fetch('/file-system.json')
        this.fileSystem = await response.json()
        // Point d'entrée piloté par la donnée : le MJ décide où l'on atterrit
        // (ex. le home de la machine piratée). Défaut conservé sinon.
        if (this.fileSystem.defaultPath) {
          this.currentPath = this.fileSystem.defaultPath
        }
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
        const found = current.children.find(child => child.name === part && this.isContainer(child))
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
      const target = currentDir.children.find(child => child.name === normalizedPath && this.isContainer(child))
      if (target) {
        this.currentPath = target.path
      }
    },
    // Aiguilleur d'affichage : décide COMMENT prévisualiser un fichier.
    // `previewMode: 'summary'` (métadonnée MJ) prime sur l'extension.
    previewKindFor(file) {
      if (file.previewMode === 'summary') return 'summary'
      const ext = (file.name.split('.').pop() || '').toLowerCase()
      if (ext === 'md') return 'markdown'
      if (['json', 'ini', 'config', 'log', 'txt'].includes(ext)) return 'text'
      // Images d'un type connu : rendues inline via <img>.
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
      // Documents riches (Office/PDF) : téléchargement forcé via résumé.
      // Un rendu fidèle inline (mammoth.js) pourra venir plus tard.
      if (['docx', 'doc', 'xlsx', 'pptx', 'pdf'].includes(ext)) return 'summary'
      return 'binary'
    },
    // URL physique d'un fichier : tous vivent à plat dans /public/fichiers/,
    // adressés par leur nom de base.
    fileUrl(file) {
      return `/fichiers/${file.path.split('/').pop()}`
    },
    async openFile(file) {
      this.openedFile = file
      this.previewKind = this.previewKindFor(file)
      this.fileContent = ''
      const textual = this.previewKind === 'markdown' || this.previewKind === 'text'
      // Loader tant que l'aperçu n'est pas prêt : pendant le fetch (md/texte),
      // ou jusqu'à l'événement load/error pour une image. summary/binaire : instantané.
      this.previewLoading = textual || this.previewKind === 'image'
      this.showFileModal = true
      if (textual) {
        await this.loadFileContent(file)
        this.previewLoading = false
      }
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
          const raw = await response.text()
          // Markdown : rendu HTML via v-html (contenu local maîtrisé par l'auteur ;
          // assainir — ex. DOMPurify — s'il devient éditable/externe).
          // Texte système : affiché brut (échappé) dans un <pre>, jamais interprété.
          this.fileContent = this.previewKind === 'markdown' ? marked.parse(raw) : raw
        } else {
          this.fileContent = this.previewKind === 'markdown'
            ? '<div class="error">Fichier introuvable</div>'
            : 'Fichier introuvable'
        }
      } catch (error) {
        console.error('Erreur lors du chargement du fichier:', error)
        this.fileContent = this.previewKind === 'markdown'
          ? '<div class="error">Fichier introuvable</div>'
          : 'Fichier introuvable'
      }
    },
    closeFileModal() {
      this.showFileModal = false
      this.openedFile = null
      this.fileContent = ''
      this.previewKind = ''
      this.previewLoading = false
    },
    handleItemClick(item, index) {
      if (this.isContainer(item)) {
        this.changeDirectory(item.path)
      } else {
        this.toggleFileSelection(index)
      }
    },
    handleItemDoubleClick(item) {
      if (this.isContainer(item)) {
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
              // Lecture en blob (binaire) : .text() corromprait les .docx, images
              // et autres binaires en les décodant en UTF-8.
              const fileBlob = await response.blob()
              zip.file(filename, fileBlob)
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
/* Skin impérial : sombre, froid, anguleux. Couleurs via variables (index.html :root). */
.file-explorer { color: var(--ink); font-family: inherit; font-size: 14px; line-height: 1.5; }

/* Prompt : chemin unix, accent hologramme */
.terminal-header {
  margin-bottom: 12px;
  color: var(--accent);
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 6px;
}

.file-list-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 6px; }
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background-color: var(--panel);
  border: 1px solid var(--line);
  border-radius: 0;              /* angles nets */
  cursor: pointer;
  transition: background-color 0.12s, border-color 0.12s;
}
.file-item:hover { background-color: var(--panel-raised); border-color: var(--line-strong); }
.file-item.selected { background-color: var(--selection); border-color: var(--accent); }
.file-item.directory { color: var(--accent); }
.file-item.directory:hover { background-color: var(--accent-soft); }
/* Un disque (noeud de tête) : distinct des dossiers, marqué par une bordure d'accent. */
.file-item.disk {
  color: var(--ink);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-left: 3px solid var(--accent);
}
.file-item.disk:hover { background-color: var(--accent-soft); }

.file-name {
  flex: 1;
  min-width: 0;            /* autorise le rétrécissement sous la taille du contenu */
  overflow: hidden;
  text-overflow: ellipsis; /* nom tronqué (…) ; nom complet dispo via title au survol */
  white-space: nowrap;
}

/* Checkbox pour la sélection de fichiers */
.file-checkbox {
  margin-right: 8px;
  cursor: pointer;
  accent-color: var(--accent);
}

/* Icône d'ouverture pour les fichiers */
.open-icon {
  cursor: pointer;
  margin-left: 8px;
  font-size: 16px;
  opacity: 0.7;
  flex-shrink: 0;   /* le bouton ne se comprime jamais : toujours visible */
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
  background-color: rgba(3, 5, 8, 0.82);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.file-modal {
  background-color: var(--panel);
  border: 1px solid var(--line-strong);
  border-radius: 0;
  width: 80%;
  max-width: 640px;
  max-height: 80%;
  overflow: auto;
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid var(--line-strong);
  background-color: var(--panel-raised);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 13px;
}

.modal-content {
  padding: 15px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Styles pour le contenu Markdown */
.modal-content h1, .modal-content h2, .modal-content h3 {
  color: var(--accent);
  margin-top: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 4px;
}

.modal-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
  color: var(--ink);
}

.modal-content table th, .modal-content table td {
  border: 1px solid var(--line);
  padding: 6px;
  text-align: left;
}

.modal-content table th {
  background-color: var(--panel-raised);
  color: var(--accent);
}

.modal-content ul, .modal-content ol {
  margin-left: 20px;
  margin-bottom: 10px;
}

.modal-content li {
  margin-bottom: 4px;
}

.error {
  color: var(--danger);
  font-weight: bold;
}

/* Aperçu texte brut (fichiers système : .config/.ini/.json/.log/.txt) */
.raw-text {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  color: var(--ink);
}

/* Aperçu « résumé » (docs riches / previewMode summary : lecture = téléchargement) */
.summary-text { margin: 0 0 12px; }
.download-hint { color: var(--accent); font-style: italic; opacity: 0.9; }

/* Aperçu image (types connus) */
.image-preview { max-width: 100%; height: auto; display: block; }

/* Loader d'affichage (premier rendu d'un document / image) */
.loader {
  color: var(--accent);
  font-family: inherit;
  padding: 20px 0;
  text-align: center;
  opacity: 0.9;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.loader::after {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-left: 8px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: loader-spin 0.8s linear infinite;
  vertical-align: middle;
}
@keyframes loader-spin { to { transform: rotate(360deg); } }

.close-button {
  background: none;
  border: 1px solid var(--line-strong);
  color: var(--ink-dim);
  cursor: pointer;
  padding: 4px 8px;
  font-family: inherit;
  font-size: 12px;
  border-radius: 0;
}

.close-button:hover {
  background-color: var(--danger);
  border-color: var(--danger);
  color: var(--bg);
}

/* Bouton de téléchargement */
.download-section {
  margin-top: 15px;
  text-align: right;
}

.download-button {
  background-color: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  cursor: pointer;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 0;
  transition: all 0.15s;
}

.download-button:hover {
  background-color: var(--accent);
  color: var(--bg);
  border-color: var(--accent);
}
</style>
