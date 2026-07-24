<template>
  <!-- Perturbations d'affichage pilotées par la qualité de liaison (paramètre narratif MJ).
       Rien à « bonne »+ ; au-delà, la liaison lâche par SALVES : des macroblocs perdent leur
       définition (le contenu vivant dessous est flouté via backdrop-filter, façon flux vidéo
       qui décroche). Salves plus fournies et plus rapprochées à mesure que ça se dégrade.
       À critique seulement, la salve capte le clic. Purement décoratif (aria-hidden). -->
  <div
    v-if="burst"
    class="connection-glitch"
    :class="[`glitch-${glitch}`, { 'en-salve': enSalve }]"
    :style="layerStyle"
    aria-hidden="true"
  >
    <div v-for="b in blocs" :key="b.id" class="glitch-bloc" :style="b.style"></div>
    <div v-if="burst.blocking" class="glitch-interrupt"></div>
  </div>
</template>

<script>
import { sessionState } from "../session-store.js"
import { glitchLevel, glitchBurst } from "../connection.js"

// Grille de macroblocs (colonnes × rangées) : les blocs s'y alignent, d'où le rendu « codec »
// en pavés francs plutôt qu'en taches floues.
const COLS = 16
const ROWS = 10
const entre = (min, max) => min + Math.floor(Math.random() * (max - min + 1))

export default {
  name: "ConnectionGlitch",
  data() {
    // `tirage` s'incrémente à chaque salve : il ré-amorce le tirage des pavés, pour que le
    // décrochage se déplace d'une salve à l'autre au lieu de figer les mêmes zones.
    return { sessionState, tirage: 0, enSalve: false }
  },
  computed: {
    glitch() {
      return glitchLevel(this.sessionState.connectionQuality)
    },
    burst() {
      return glitchBurst(this.sessionState.connectionQuality)
    },
    // Durée de l'arrachement + ampleur de la perte de définition, passées au CSS.
    // (La cadence, elle, est pilotée en JS : cf. armer()/salve().)
    layerStyle() {
      if (!this.burst) return null
      return {
        "--duree": `${this.burst.durationMs}ms`,
        "--flou": `${this.glitch * 4 - 2}px`, // 2 / 6 / 10 px (calibré au test joueur)
      }
    },
    // Pavés tirés au sort sur la grille, re-tirés à chaque salve (dépend de `tirage`).
    blocs() {
      if (!this.burst) return []
      void this.tirage
      return Array.from({ length: this.burst.blocks }, (_, id) => {
        const w = entre(1, 3)
        const h = entre(1, 2)
        const col = entre(0, COLS - w)
        const row = entre(0, ROWS - h)
        return {
          id,
          style: {
            left: `${(col / COLS) * 100}%`,
            top: `${(row / ROWS) * 100}%`,
            width: `${(w / COLS) * 100}%`,
            height: `${(h / ROWS) * 100}%`,
            // Décalage de phase : les pavés ne lâchent pas tous au même instant.
            animationDelay: `${(id % 4) * 60}ms`,
          },
        }
      })
    },
  },
  watch: {
    // La cadence suit la qualité : on ré-arme l'horloge des salves à chaque changement.
    burst: { immediate: true, handler() { this.armer() } },
  },
  beforeUnmount() { this.stop() },
  methods: {
    armer() {
      this.stop()
      if (!this.burst) return
      this.salve() // la liaison lâche d'emblée, puis à chaque période
      this._timer = setInterval(() => this.salve(), this.burst.periodMs)
    },
    // Une salve : nouveaux pavés, écran dégradé pendant `durationMs`, puis l'image se recompose.
    salve() {
      this.tirage++
      this.enSalve = true
      clearTimeout(this._fin)
      this._fin = setTimeout(() => { this.enSalve = false }, this.burst.durationMs)
    },
    stop() {
      if (this._timer) { clearInterval(this._timer); this._timer = null }
      clearTimeout(this._fin)
      this.enSalve = false
    },
  },
}
</script>

<style scoped>
/* Calque plein cadre au-dessus du contenu de l'OS. Par défaut sans capture de clic (visuel).
   Éteint hors salve ; `en-salve` (piloté par le profil, cf. connection.js) l'allume. */
.connection-glitch {
  position: absolute;
  inset: 0;
  z-index: 30;
  pointer-events: none;
  overflow: hidden;
  opacity: 0;
  transition: opacity 70ms steps(2);
}
.connection-glitch.en-salve { opacity: var(--force); }
/* Un macrobloc : le contenu VIVANT dessous perd sa définition (backdrop-filter), avec des
   arêtes franches alignées sur la grille — d'où la lecture « pavé de codec » et non « flou ». */
.glitch-bloc {
  position: absolute;
  backdrop-filter: blur(var(--flou)) contrast(1.35) saturate(0.55);
  -webkit-backdrop-filter: blur(var(--flou)) contrast(1.35) saturate(0.55);
  background: rgba(79, 184, 207, 0.05);
  animation: glitch-pave var(--duree) ease-out infinite;
}
/* Intensité globale : plus la liaison est mauvaise, plus le décrochage est opaque. */
.glitch-1 { --force: 0.8; }
.glitch-2 { --force: 0.92; }
.glitch-3 { --force: 1; }

/* Couche d'interruption (critique seulement) : l'image entière se délite en gros pavés et
   CAPTE le clic pendant la salve — l'OS devient réellement pénible à opérer. */
.glitch-interrupt {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(10px) contrast(1.7) saturate(0.25);
  -webkit-backdrop-filter: blur(10px) contrast(1.7) saturate(0.25);
  background: repeating-linear-gradient(
      90deg, rgba(5, 7, 11, 0.55) 0, rgba(5, 7, 11, 0.55) 24px, transparent 24px, transparent 48px
    ),
    repeating-linear-gradient(
      0deg, rgba(5, 7, 11, 0.55) 0, rgba(5, 7, 11, 0.55) 24px, transparent 24px, transparent 48px
    );
  pointer-events: none;
}
/* Ne capte le clic que pendant la salve (sinon l'OS resterait inutilisable en continu). */
.connection-glitch.en-salve .glitch-interrupt { pointer-events: auto; }
/* Un pavé décroche : léger arrachement latéral pendant qu'il perd sa définition. */
@keyframes glitch-pave {
  0% { transform: translateX(-3px); }
  60% { transform: translateX(2px); }
  100% { transform: translateX(0); }
}
</style>
