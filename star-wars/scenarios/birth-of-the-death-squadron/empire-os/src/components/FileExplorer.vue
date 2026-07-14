<template>
  <div class="file-explorer">
    <div class="terminal-header">
      <span>> C:\EmpireOS\Fichiers> </span>
    </div>
    <div class="file-list-container">
      <div class="file-item"
           v-for="(file, index) in files"
           :key="index"
           :class="{ selected: selectedFiles.includes(index) }"
           @click="toggleFileSelection(index)">
        {{ file.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FileExplorer",
  data() {
    return {
      files: [
        { name: "rapport_mission.docx", size: 1024, type: "docx" },
        { name: "ordre_executor.docx", size: 2048, type: "docx" },
        { name: "liste_cibles.docx", size: 512, type: "docx" },
        { name: "protocole_secret.docx", size: 4096, type: "docx" }
      ],
      selectedFiles: []
    }
  },
  methods: {
    toggleFileSelection(index) {
      const selectedIndex = this.selectedFiles.indexOf(index);
      if (selectedIndex === -1) {
        this.selectedFiles.push(index);
      } else {
        this.selectedFiles.splice(selectedIndex, 1);
      }
      this.$emit("files-selected", this.selectedFiles);
    },
    getFiles() {
      return this.files;
    },
    setFiles(newFiles) {
      this.files = newFiles;
    }
  }
}
</script>

<style scoped>
.file-explorer { color: #0f0; font-family: monospace; font-size: 14px; }
.terminal-header { margin-bottom: 10px; }
.file-list-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.file-item { padding: 6px 12px; background-color: transparent; border: 1px solid #000; cursor: pointer; }
.file-item:hover { background-color: rgba(0, 255, 0, 0.1); }
.file-item.selected { background-color: rgba(0, 255, 0, 0.3); border-color: #0f0; }
</style>