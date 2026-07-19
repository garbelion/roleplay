<template>
  <div class="intrusion" :class="{ refus: isRefus }">
    <div class="intrusion-log">
      <p v-for="(ligne, i) in visibleLignes" :key="i" class="intrusion-line">{{ ligne }}</p>
    </div>
    <div v-if="banniere && bannerVisible" class="intrusion-banner">{{ banniere }}</div>
  </div>
</template>

<script>
import { sessionState } from "../session-store.js"
import { intrusionScreen, isRefus } from "../intrusion.js"

// Cadence de révélation des lignes (défilement « shell »).
const REVEAL_MS = 260

export default {
  name: "IntrusionShell",
  props: {
    intrusion: { type: Object, default: null },
  },
  data() {
    return { sessionState, revealed: 0 }
  },
  computed: {
    state() { return this.sessionState.intrusion },
    screen() { return intrusionScreen(this.intrusion, this.state) },
    lignes() { return this.screen ? this.screen.lignes : [] },
    banniere() { return this.screen ? this.screen.banniere : "" },
    visibleLignes() { return this.lignes.slice(0, this.revealed) },
    bannerVisible() { return this.revealed >= this.lignes.length },
    isRefus() { return isRefus(this.state) },
  },
  created() {
    // Au chargement : saut direct à l'image de repos (toutes les lignes, pas d'animation).
    this.revealed = this.lignes.length
  },
  watch: {
    // Changement d'état (push MJ) : on rejoue le défilement depuis le début.
    state() { this.animate() },
  },
  beforeUnmount() { this.stop() },
  methods: {
    animate() {
      this.stop()
      this.revealed = 0
      this._timer = setInterval(() => {
        if (this.revealed >= this.lignes.length) { this.stop(); return }
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
/* Shell d'intrusion : plein écran, froid, anguleux. Le log défile, la bannière conclut. */
.intrusion {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
  padding: 8vmin;
  background: var(--bg);
  color: var(--accent);
  font-family: "Consolas", "Courier New", monospace;
}
.intrusion-log {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: clamp(13px, 2.4vmin, 18px);
  line-height: 1.5;
  min-height: 30vh;
}
.intrusion-line {
  margin: 0;
  color: var(--ink-dim);
  white-space: pre-wrap;
  animation: intrusion-line-in 0.18s ease-out;
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
  animation: intrusion-line-in 0.25s ease-out;
}
/* Écran d'échec : bascule en rouge impérial. */
.intrusion.refus { color: var(--danger); }
.intrusion.refus .intrusion-line { color: var(--danger); opacity: 0.8; }
.intrusion.refus .intrusion-banner { color: var(--danger); border-left-color: var(--danger); }
@keyframes intrusion-line-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
