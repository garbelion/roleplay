<template>
  <div class="intrusion">
    <!-- Simili-console (fenêtre de terminal) centrée dans la page, sur fond noir. -->
    <div class="intrusion-window">
      <div class="intrusion-titlebar">
        <span class="intrusion-logo" aria-hidden="true">#</span>
        <span class="intrusion-name">{{ OS.name }}</span>
        <span class="intrusion-meta">{{ OS.version }} · {{ OS.build }}</span>
        <span class="intrusion-tt">console d'accès<template v-if="station"> — {{ station }}</template></span>
      </div>
      <!-- Fin de session (expiration / connexion perdue) : bannière d'erreur en tête, cause affichée. -->
      <div v-if="errorReason" class="intrusion-error" role="alert">{{ errorText }}</div>
      <!-- Une seule console qui accumule l'historique, le plus récent en tête (anti-chronologique). -->
      <div class="intrusion-console">
        <div
          v-for="block in blocks"
          :key="block.id"
          class="intrusion-block"
          :class="{ refus: block.refus }"
          :data-state="block.state"
        >
          <pre v-if="block.bannerText" class="intrusion-banner">{{ block.bannerText }}</pre>
          <p v-for="(ligne, i) in block.lignes" :key="i" class="intrusion-line">{{ ligne }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sessionState } from "../session-store.js"
import { intrusionScreen, isRefus, asciiBanner } from "../intrusion.js"
import { OS } from "../os-identity.js"

// Cadence de révélation des lignes du dernier bloc (défilement « shell »).
const REVEAL_MS = 260

export default {
  name: "IntrusionShell",
  props: {
    intrusion: { type: Object, default: null },
    // Cause d'une fin de session ('expired' | 'lost') : affiche une bannière d'erreur et
    // ramène l'écran au boot, quelle que soit l'intrusion partagée.
    errorReason: { type: String, default: "" },
  },
  data() {
    // `entries` : un bloc par transition d'état (historique conservé). `revealed` ne
    // s'applique qu'au dernier bloc (le seul qui défile) ; les précédents restent figés.
    return { OS, sessionState, entries: [], revealed: 0 }
  },
  computed: {
    // Une fin de session force l'écran de boot (retour à la case départ) ; sinon l'écran partagé.
    state() { return this.errorReason ? "boot" : this.sessionState.intrusion },
    errorText() {
      if (this.errorReason === "lost") return "CONNEXION PERDUE — LIAISON INTERROMPUE"
      if (this.errorReason === "expired") return "SESSION EXPIRÉE — DURÉE MAXIMALE DÉPASSÉE"
      return ""
    },
    station() { return this.intrusion?.station || "" },
    blocks() {
      const last = this.entries.length - 1
      return this.entries
        .map((e, i) => {
          const count = i === last ? this.revealed : e.lignes.length
          const withBanner = !!e.banniere && count >= e.lignes.length
          return {
            id: e.id,
            state: e.state,
            refus: e.refus,
            lignes: e.lignes.slice(0, count),
            // La bannière de changement de phase est rendue en encadré ASCII (lignes de console).
            bannerText: withBanner ? asciiBanner(e.banniere).join("\n") : "",
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
/* Shell d'intrusion : une fenêtre de terminal centrée dans la page. */
.intrusion {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vmin;
  background: var(--bg);
  font-family: "Consolas", "Courier New", monospace;
}
.intrusion-window {
  display: flex;
  flex-direction: column;
  width: min(920px, 100%);
  height: min(74vh, 100%);
  background: #000;
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}
/* Barre de titre : chrome EmpireOS (logo imperial + nom + version), coherent avec l'OS. */
.intrusion-titlebar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  background: var(--panel-raised);
  border-bottom: 1px solid var(--line-strong);
  flex: none;
  font-size: 12px;
  letter-spacing: 0.5px;
}
.intrusion-logo { font-family: 'Star Jedi', monospace; color: var(--accent); font-size: 18px; line-height: 1; }
.intrusion-name { font-weight: bold; text-transform: uppercase; color: var(--ink); }
.intrusion-meta { color: var(--ink-dim); }
.intrusion-tt { margin-left: auto; text-transform: uppercase; color: var(--ink-dim); }
/* Bannière de fin de session : rouge impérial, pleine largeur, en tête de la fenêtre. */
.intrusion-error {
  flex: none;
  padding: 8px 14px;
  background: rgba(207, 75, 69, 0.12);
  border-bottom: 1px solid var(--danger);
  color: var(--danger);
  font-weight: bold;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
}
/* Corps : la console qui accumule et défile (le plus récent en tête). */
.intrusion-console {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 26px;
}
/* Un bloc = un écran posé. Bannière puis log de l'étape (lignes resserrées, look terminal). */
.intrusion-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: intrusion-in 0.2s ease-out;
}
/* Bannière de phase : encadré ASCII rendu comme des lignes de console (monospace, aligné). */
.intrusion-banner {
  margin: 0;
  align-self: flex-start;
  font-family: inherit;
  font-size: clamp(13px, 1.9vmin, 16px);
  line-height: 1.15;
  color: var(--accent);
  white-space: pre;
  animation: intrusion-in 0.2s ease-out;
}
.intrusion-line {
  margin: 0;
  font-size: clamp(13px, 1.9vmin, 16px);
  line-height: 1.3;
  color: var(--accent);
  opacity: 0.85;
  white-space: pre-wrap;
  animation: intrusion-in 0.18s ease-out;
}
/* Préfixe de prompt, factorisé ici (hors donnée) : chaque ligne de log s'ouvre par « > ». */
.intrusion-line::before { content: "> "; opacity: 0.55; }
/* Écran d'échec : le bloc bascule en rouge impérial. */
.intrusion-block.refus .intrusion-line,
.intrusion-block.refus .intrusion-banner { color: var(--danger); }
/* Les blocs plus anciens s'estompent (profondeur d'historique). */
.intrusion-block:not(:first-child) { opacity: 0.5; }
@keyframes intrusion-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
