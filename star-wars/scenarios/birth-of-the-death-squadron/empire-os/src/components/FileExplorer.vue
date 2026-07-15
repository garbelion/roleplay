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
        {{ item.name }}{{ item.type === 'directory' ? '/' : '' }}
      </div>
    </div>
    
    <!-- Modale pour afficher le contenu des fichiers -->
    <div v-if="showFileModal" class="file-modal-overlay" @click="closeFileModal">
      <div class="file-modal" @click.stop>
        <div class="modal-header">
          <span>Fichier: {{ openedFile?.name }}</span>
          <button class="close-button" @click="closeFileModal">X</button>
        </div>
        <div class="modal-content">
          <pre>{{ openedFile?.content || 'Contenu non disponible' }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileExplorer',
  data() {
    return {
      fileSystem: null,
      currentPath: '/Fichiers',
      selectedFiles: [],
      files: [],
      showFileModal: false,
      openedFile: null
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
                { name: 'rapport_mission.docx', path: '/Fichiers/rapport_mission.docx', type: 'file', content: 'Contenu du rapport de mission' },
                { name: 'ordre_executor.docx', path: '/Fichiers/ordre_executor.docx', type: 'file', content: 'Ordre de l\'Exécuteur' },
                { name: 'liste_cibles.docx', path: '/Fichiers/liste_cibles.docx', type: 'file', content: 'Liste des cibles prioritaires' },
                { name: 'protocole_secret.docx', path: '/Fichiers/protocole_secret.docx', type: 'file', content: 'Protocole secret de l\'Empire' }
              ]
            }
          ]
        }
      }
      this.updateCurrentDirectory()
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
    openFile(file) {
      this.openedFile = file
      this.showFileModal = true
    },
    closeFileModal() {
      this.showFileModal = false
      this.openedFile = null
    },
    updateCurrentDirectory() {
      this.files = this.currentDirectoryItems
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
    getFiles() {
      return this.files
    },
    setFiles(newFiles) {
      this.files = newFiles
    }
  },
  watch: {
    currentPath: {
      handler() {
        this.updateCurrentDirectory()
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.file-explorer { color: #0f0; font-family: monospace; font-size: 14px; line-height: 1.5; }
.terminal-header { margin-bottom: 10px; color: #0f0; }
.file-list-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.file-item { padding: 6px 12px; background-color: transparent; border: 1px solid #000; cursor: pointer; }
.file-item:hover { background-color: rgba(0, 255, 0, 0.1); }
.file-item.selected { background-color: rgba(0, 255, 0, 0.3); border-color: #0f0; }
.file-item.directory { color: #0ff; }
.file-item.directory:hover { background-color: rgba(0, 255, 255, 0.1); }

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
</style>
