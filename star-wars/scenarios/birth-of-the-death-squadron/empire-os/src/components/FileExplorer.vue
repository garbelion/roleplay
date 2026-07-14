<template>
  <div class="file-explorer">
    <div class="terminal-header">
      <span>> C:\EmpireOS\{{ currentPath.replace(/\//g, '\\') }}> </span>
    </div>
    <div class="file-list-container">
      <div
        v-for="(item, index) in currentDirectory.children"
        :key="index"
        class="file-item"
        :class="{ selected: selectedFiles.includes(index), directory: item.type === 'directory' }"
        @click="handleItemClick(item)"
        @dblclick="handleItemDoubleClick(item)"
      >
        {{ item.name }}{{ item.type === 'directory' ? '/' : '' }}
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
      files: [] // Gardé pour compatibilité avec les tests Feature 1
    }
  },
  async created() {
    await this.loadFileSystem()
    this.updateCurrentDirectory()
  },
  methods: {
    async loadFileSystem() {
      try {
        const response = await fetch('/file-system.json')
        this.fileSystem = await response.json()
      } catch (error) {
        console.error('Erreur lors du chargement du file system:', error)
        // Fallback : structure par défaut si le fichier n est pas trouvé
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
                { name: 'rapport_mission.docx', path: '/Fichiers/rapport_mission.docx', type: 'file' },
                { name: 'ordre_executor.docx', path: '/Fichiers/ordre_executor.docx', type: 'file' },
                { name: 'liste_cibles.docx', path: '/Fichiers/liste_cibles.docx', type: 'file' },
                { name: 'protocole_secret.docx', path: '/Fichiers/protocole_secret.docx', type: 'file' }
              ]
            }
          ]
        }
      }
    },
    getCurrentDirectory() {
      if (!this.fileSystem) return { children: [] }
      return this.findDirectoryByPath(this.currentPath) || this.fileSystem
    },
    findDirectoryByPath(path) {
      if (path === '/') return this.fileSystem
      const pathParts = path.split('/').filter(p => p)
      let current = this.fileSystem
      for (const part of pathParts) {
        const found = current.children.find(child => child.name === part && child.type === 'directory')
        if (!found) return null
        current = found
      }
      return current
    },
    async changeDirectory(path) {
      if (path === '..') {
        const parts = this.currentPath.split('/').filter(p => p)
        if (parts.length === 0) return // Déjà à la racine
        this.currentPath = '/' + parts.slice(0, -1).join('/')
        if (this.currentPath === '/') this.currentPath = '/'
        this.updateCurrentDirectory()
        return
      }
      if (path === '/') {
        this.currentPath = '/'
        this.updateCurrentDirectory()
        return
      }
      if (path.startsWith('/')) {
        const dir = this.findDirectoryByPath(path)
        if (dir) {
          this.currentPath = path
          this.updateCurrentDirectory()
        }
        return
      }
      // Chemin relatif
      const currentDir = this.getCurrentDirectory()
      const target = currentDir.children.find(child => child.name === path && child.type === 'directory')
      if (target) {
        this.currentPath = target.path
        this.updateCurrentDirectory()
      }
    },
    updateCurrentDirectory() {
      const currentDir = this.getCurrentDirectory()
      this.files = currentDir.children || []
    },
    handleItemClick(item) {
      if (item.type === 'directory') {
        this.changeDirectory(item.path)
      } else {
        const index = this.files.indexOf(item)
        this.toggleFileSelection(index)
      }
    },
    handleItemDoubleClick(item) {
      if (item.type === 'directory') {
        this.changeDirectory(item.path)
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
</style>