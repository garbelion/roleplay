<template>
  <div class="dos-window">
    <div class="dos-title-bar">
      <span class="dos-title">
        <span class="os-mark">▤</span>
        {{ OS.name }}
        <span class="os-full">— {{ OS.fullName }}</span>
      </span>
      <span class="dos-meta">{{ OS.version }} · {{ OS.build }}</span>
      <span class="os-clock">{{ clock }}</span>
      <button class="dos-close-button" @click="closeTerminal">X</button>
    </div>
    <div class="terminal-container">
      <FileExplorer />
    </div>
    <div class="dos-status-bar">
      <span class="status-licence">LICENCE : {{ OS.licensee }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import FileExplorer from "./components/FileExplorer.vue";
import { OS } from "./os-identity.js";

const pad = (n) => String(n).padStart(2, "0");
const formatTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

const clock = ref(formatTime(new Date()));
let timer;
onMounted(() => {
  timer = setInterval(() => { clock.value = formatTime(new Date()); }, 1000);
});
onUnmounted(() => clearInterval(timer));

const closeTerminal = () => {
  console.log("Terminal ferme");
};
</script>

<style scoped>
.dos-window {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);
  color: var(--ink);
  border: 1px solid var(--line-strong);
}

/* Barre de titre : anguleuse, froide, hiérarchisée (ordre impérial) */
.dos-title-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 12px;
  background: var(--panel-raised);
  border-bottom: 1px solid var(--line-strong);
  font-size: 13px;
  letter-spacing: 0.5px;
}
.dos-title { display: flex; align-items: baseline; gap: 8px; font-weight: bold; text-transform: uppercase; color: var(--ink); }
.os-mark { color: var(--accent); }
.os-full { font-weight: normal; text-transform: none; color: var(--ink-dim); font-size: 12px; letter-spacing: 0; }
.dos-meta { color: var(--ink-dim); font-size: 12px; }
.os-clock { margin-left: auto; color: var(--accent); font-variant-numeric: tabular-nums; letter-spacing: 1px; }
.dos-close-button {
  background: transparent;
  color: var(--ink-dim);
  border: 1px solid var(--line);
  width: 22px; height: 20px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 0;
}
.dos-close-button:hover { color: var(--bg); background: var(--danger); border-color: var(--danger); }

.terminal-container { flex: 1; padding: 12px; overflow: auto; }

/* Barre de statut basse : licence / mentions (ambiance OS) */
.dos-status-bar {
  padding: 4px 12px;
  background: var(--panel);
  border-top: 1px solid var(--line);
  color: var(--ink-dim);
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
</style>