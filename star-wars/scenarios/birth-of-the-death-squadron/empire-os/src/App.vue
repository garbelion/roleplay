<template>
  <div class="dos-window">
    <div class="dos-title-bar">
      <span class="dos-title">Empire OS</span>
      <button class="dos-close-button" @click="closeTerminal">X</button>
    </div>
    <div class="terminal-container">
      <FileExplorer />
    </div>
  </div>
</template>

<script setup>
import FileExplorer from "./components/FileExplorer.vue";

const closeTerminal = () => {
  console.log("Terminal ferme");
};
</script>

<style scoped>
.dos-window { background-color: #000; color: #0f0; border: 2px solid #555; }
.dos-title-bar { background: linear-gradient(to right, #111, #333); color: #fff; padding: 4px 8px; font-size: 14px; border-bottom: 2px solid #555; display: flex; justify-content: space-between; align-items: center; }
.terminal-container { flex: 1; padding: 8px; }
</style>