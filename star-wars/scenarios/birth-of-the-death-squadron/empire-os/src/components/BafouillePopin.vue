<template>
  <!-- Intervention de Bafouille : popin persistante, déclenchée par le MJ, listant les
       fichiers que les PJ doivent télécharger. Aucun bouton de fermeture côté joueur.
       Habillage REBELLE (blanc / orange) — Bafouille n'est pas un ami de l'Empire. -->
  <div class="bafouille-popin" role="dialog" aria-label="Message de Bafouille">
    <div class="bafouille-head">
      <!-- Insigne « starbird » rebelle : glyphe `$` de la police Star Jedi (comme le `#`
           impérial du chrome OS), teinté orange Alliance. -->
      <span class="bafouille-starbird" aria-hidden="true">$</span>
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
/* Popin d'aide : habillage REBELLE (blanc cassé + orange Alliance), chaleureux et volontairement
   à contre-courant du froid impérial — Bafouille est un allié, pas un rouage de l'Empire. */
.bafouille-popin {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 40;
  width: min(340px, 80vw);
  background: #14100c; /* ardoise chaude sombre (contraste avec l'orange) */
  border: 1px solid var(--rebel);
  border-left: 3px solid var(--rebel);
  border-radius: 4px;
  padding: 12px 14px;
  color: var(--rebel-ink);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);
  font-size: 13px;
  animation: bafouille-in 0.25s ease-out;
}
.bafouille-head { display: flex; align-items: center; gap: 9px; margin-bottom: 8px; }
/* Le `$` de Star Jedi rend un insigne « starbird » (la police @font-face est déclarée
   globalement par App.vue). Teinté orange rebelle + léger halo. */
.bafouille-starbird {
  font-family: 'Star Jedi', monospace;
  color: var(--rebel);
  font-size: 24px;
  line-height: 1;
  flex: none;
  text-shadow: 0 0 6px rgba(242, 130, 42, 0.4);
}
.bafouille-name { font-weight: bold; letter-spacing: 2px; color: var(--rebel-bright); text-transform: uppercase; }
.bafouille-message { margin: 0 0 10px; line-height: 1.45; font-style: italic; color: var(--rebel-ink); }
.bafouille-files { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.bafouille-file {
  display: flex;
  flex-direction: column;
  padding: 5px 8px;
  background: var(--rebel-soft);
  border: 1px solid transparent;
  border-left: 2px solid var(--rebel);
}
.bafouille-file-name { color: var(--rebel-bright); }
.bafouille-file-path { color: #b7a892; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bafouille-empty { margin: 0; color: #b7a892; font-style: italic; }
@keyframes bafouille-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
