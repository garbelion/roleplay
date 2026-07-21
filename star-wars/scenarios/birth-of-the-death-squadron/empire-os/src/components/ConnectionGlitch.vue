<template>
  <!-- Perturbations d'affichage pilotées par la qualité de liaison (paramètre narratif MJ).
       Rien à « bonne »+ ; statique/scanlines/décalage croissants de moyenne(1) à critique(3).
       À critique, une couche intermittente peut gêner l'interaction. Purement décoratif (aria-hidden). -->
  <div v-if="glitch > 0" class="connection-glitch" :class="`glitch-${glitch}`" aria-hidden="true">
    <div class="glitch-static"></div>
    <div class="glitch-scan"></div>
    <div v-if="glitch >= 3" class="glitch-interrupt"></div>
  </div>
</template>

<script>
import { sessionState } from "../session-store.js"
import { glitchLevel } from "../connection.js"

export default {
  name: "ConnectionGlitch",
  data() {
    return { sessionState }
  },
  computed: {
    glitch() {
      return glitchLevel(this.sessionState.connectionQuality)
    },
  },
}
</script>

<style scoped>
/* Calque plein cadre au-dessus du contenu de l'OS. Par défaut sans capture de clic (visuel). */
.connection-glitch {
  position: absolute;
  inset: 0;
  z-index: 30;
  pointer-events: none;
  overflow: hidden;
  mix-blend-mode: screen;
}
/* Statique : bruit animé (dégradés répétés qui défilent) ; opacité montant avec l'intensité. */
.glitch-static {
  position: absolute;
  inset: -50%;
  background:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.06) 0, rgba(255, 255, 255, 0.06) 1px, transparent 1px, transparent 2px),
    repeating-linear-gradient(90deg, rgba(79, 184, 207, 0.05) 0, rgba(79, 184, 207, 0.05) 1px, transparent 1px, transparent 3px);
  animation: glitch-noise 0.18s steps(2) infinite;
}
/* Lignes de balayage qui glissent. */
.glitch-scan {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.25) 51%);
  background-size: 100% 4px;
  animation: glitch-scan 6s linear infinite;
}
/* Intensité : plus la liaison est mauvaise, plus le bruit est marqué et rapide. */
.glitch-1 { opacity: 0.35; }
.glitch-2 { opacity: 0.6; }
.glitch-2 .glitch-static { animation-duration: 0.12s; }
.glitch-3 { opacity: 0.85; }
.glitch-3 .glitch-static { animation-duration: 0.07s; }
.glitch-3 .glitch-scan { animation-duration: 2.5s; }

/* Couche d'interruption (critique seulement) : bandeaux de coupure qui surgissent par à-coups
   et CAPTENT le clic quand ils sont visibles — l'OS devient réellement pénible à opérer. */
.glitch-interrupt {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    115deg,
    rgba(5, 7, 11, 0.9) 0, rgba(5, 7, 11, 0.9) 26px,
    rgba(207, 75, 69, 0.12) 26px, rgba(207, 75, 69, 0.12) 34px
  );
  pointer-events: auto;
  animation: glitch-interrupt 3.4s steps(1) infinite;
}

@keyframes glitch-noise {
  0% { transform: translate(0, 0); }
  100% { transform: translate(2%, -1%); }
}
@keyframes glitch-scan {
  0% { background-position-y: 0; }
  100% { background-position-y: 100%; }
}
/* Surgit ~0,4 s toutes les ~3,4 s : bloque l'interaction par intermittence, sinon transparent. */
@keyframes glitch-interrupt {
  0%, 88% { opacity: 0; pointer-events: none; }
  89%, 99% { opacity: 1; pointer-events: auto; }
  100% { opacity: 0; pointer-events: none; }
}
</style>
