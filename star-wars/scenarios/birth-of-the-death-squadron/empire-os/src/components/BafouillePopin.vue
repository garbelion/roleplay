<template>
  <!-- Intervention de Bafouille : popin persistante, déclenchée par le MJ, listant les
       fichiers que les PJ doivent télécharger. Aucun bouton de fermeture côté joueur. -->
  <div class="bafouille-popin" role="dialog" aria-label="Message de Bafouille">
    <div class="bafouille-head">
      <span class="bafouille-avatar" aria-hidden="true">◍</span>
      <span class="bafouille-name">BAFOUILLE</span>
    </div>
    <p class="bafouille-message">{{ voice }}</p>
    <ul v-if="files.length" class="bafouille-files">
      <li v-for="f in files" :key="f.path" class="bafouille-file">
        <span class="bafouille-file-name">{{ f.name }}</span>
        <span class="bafouille-file-path">{{ f.path }}</span>
      </li>
    </ul>
    <p v-else class="bafouille-empty">Aucun fichier signalé pour l'instant.</p>
  </div>
</template>

<script>
// Voix par défaut si le MJ n'a rien rédigé dans la donnée (`bafouille.message`).
const DEFAULT_MESSAGE =
  "Pssst… c'est Bafouille. Récupérez ces fichiers avant qu'ils ne coupent la ligne."

export default {
  name: "BafouillePopin",
  props: {
    // Fichiers critiques { name, path } à mettre en avant.
    files: { type: Array, default: () => [] },
    // Voix de Bafouille, éditable en donnée (fallback si vide).
    message: { type: String, default: "" },
  },
  computed: {
    voice() {
      return this.message || DEFAULT_MESSAGE
    },
  },
}
</script>

<style scoped>
/* Popin d'aide : encart chaleureux (Bafouille est un allié) tranchant sur le froid impérial. */
.bafouille-popin {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 40;
  width: min(340px, 80vw);
  background: var(--panel-raised);
  border: 1px solid var(--accent);
  border-left: 3px solid var(--accent);
  border-radius: 0;
  padding: 12px 14px;
  color: var(--ink);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);
  font-size: 13px;
  animation: bafouille-in 0.25s ease-out;
}
.bafouille-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.bafouille-avatar { color: var(--accent); font-size: 18px; line-height: 1; }
.bafouille-name { font-weight: bold; letter-spacing: 1px; color: var(--accent); text-transform: uppercase; }
.bafouille-message { margin: 0 0 10px; line-height: 1.45; font-style: italic; }
.bafouille-files { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.bafouille-file {
  display: flex;
  flex-direction: column;
  padding: 5px 8px;
  background: var(--bg);
  border: 1px solid var(--line);
}
.bafouille-file-name { color: var(--accent); }
.bafouille-file-path { color: var(--ink-dim); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bafouille-empty { margin: 0; color: var(--ink-dim); font-style: italic; }
@keyframes bafouille-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
