<template>
  <div class="intrusion">
    <!-- Une seule console qui accumule l'historique, le plus récent en tête (anti-chronologique). -->
    <div class="intrusion-console">
      <div
        v-for="block in blocks"
        :key="block.id"
        class="intrusion-block"
        :class="{ refus: block.refus }"
        :data-state="block.state"
      >
        <div v-if="block.showBanner" class="intrusion-banner">{{ block.banniere }}</div>
        <p v-for="(ligne, i) in block.lignes" :key="i" class="intrusion-line">{{ ligne }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { sessionState } from "../session-store.js"
import { intrusionScreen, isRefus } from "../intrusion.js"

// Cadence de révélation des lignes du dernier bloc (défilement « shell »).
const REVEAL_MS = 260

export default {
  name: "IntrusionShell",
  props: {
    intrusion: { type: Object, default: null },
  },
  data() {
    // `entries` : un bloc par transition d'état (historique conservé). `revealed` ne
    // s'applique qu'au dernier bloc (le seul qui défile) ; les précédents restent figés.
    return { sessionState, entries: [], revealed: 0 }
  },
  computed: {
    state() { return this.sessionState.intrusion },
    blocks() {
      const last = this.entries.length - 1
      return this.entries
        .map((e, i) => {
          const count = i === last ? this.revealed : e.lignes.length
          return {
            id: e.id,
            state: e.state,
            refus: e.refus,
            lignes: e.lignes.slice(0, count),
            banniere: e.banniere,
            showBanner: !!e.banniere && count >= e.lignes.length,
          }
        })
        .reverse() // le plus récent en tête
    },
  },
  created() {
    this._seq = 0
    // Amorçage : l'écran courant apparaît d'emblée au repos (pas d'animation au chargement).
    const seeded = this.pushScreen(this.state)
    if (seeded) this.revealed = seeded.lignes.length
  },
  watch: {
    // Changement d'état (push MJ) : on AJOUTE le nouvel écran et on l'anime — l'historique reste.
    state() {
      if (this.pushScreen(this.state)) this.animate()
    },
  },
  beforeUnmount() { this.stop() },
  methods: {
    pushScreen(state) {
      const screen = intrusionScreen(this.intrusion, state)
      if (!screen) return null
      const entry = {
        id: ++this._seq,
        state,
        refus: isRefus(state),
        lignes: screen.lignes,
        banniere: screen.banniere,
      }
      this.entries.push(entry)
      return entry
    },
    animate() {
      this.stop()
      this.revealed = 0
      const total = this.entries[this.entries.length - 1].lignes.length
      this._timer = setInterval(() => {
        if (this.revealed >= total) { this.stop(); return }
        this.revealed++
      }, REVEAL_MS)
    },
    stop() {
      if (this._timer) { clearInterval(this._timer); this._timer = null }
    },
  },
}
</script>

<style scoped>
/* Shell d'intrusion : une console plein écran, ancrée en haut, qui accumule et défile. */
.intrusion {
  height: 100%;
  background: var(--bg);
  color: var(--accent);
  font-family: "Consolas", "Courier New", monospace;
  padding: 6vmin 8vmin;
  overflow-y: auto;
}
.intrusion-console {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
/* Un bloc = un écran posé (le plus récent en tête). Bannière puis log de l'étape. */
.intrusion-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: intrusion-in 0.2s ease-out;
}
.intrusion-banner {
  align-self: flex-start;
  max-width: 100%;
  font-size: clamp(18px, 4vmin, 34px);
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--accent);
  border-left: 4px solid var(--accent);
  padding: 10px 18px;
  background: var(--panel);
}
.intrusion-line {
  margin: 0;
  font-size: clamp(13px, 2.4vmin, 18px);
  line-height: 1.5;
  color: var(--ink-dim);
  white-space: pre-wrap;
  animation: intrusion-in 0.18s ease-out;
}
/* Écran d'échec : le bloc bascule en rouge impérial. */
.intrusion-block.refus .intrusion-line { color: var(--danger); opacity: 0.85; }
.intrusion-block.refus .intrusion-banner { color: var(--danger); border-left-color: var(--danger); }
/* Les blocs plus anciens s'estompent légèrement (profondeur d'historique). */
.intrusion-block:not(:first-child) { opacity: 0.6; }
@keyframes intrusion-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
