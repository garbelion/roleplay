<template>
  <!-- Onglet Session du dock : état temporel de la connexion (côté joueur), en cards
       qui se répartissent en grille et se stackent quand la place manque. -->
  <dl class="session-info">
    <div class="session-card session-opening">
      <dt>Ouverture de session</dt>
      <dd>{{ fmt(openingHeureMs()) }}</dd>
    </div>
    <div class="session-card session-elapsed">
      <dt>Temps écoulé</dt>
      <dd>{{ fmt(sessionElapsedMs(now)) }}</dd>
    </div>
    <div class="session-card session-remaining" :class="{ 'session-danger': sessionRemainingMs(now) === 0 }">
      <dt>Avant déconnexion</dt>
      <dd>{{ fmt(sessionRemainingMs(now)) }}</dd>
    </div>
    <div class="session-card session-alert" :class="`alert-${alertLevel}`">
      <dt>Niveau d'alerte</dt>
      <dd>{{ alertLevel }} — {{ alertLabel }}</dd>
    </div>
  </dl>
</template>

<script>
import {
  openingHeureMs,
  sessionElapsedMs,
  sessionRemainingMs,
  formatSessionTime,
} from "../session-clock.js"
import { ALERT_LABELS } from "../transfer-duration.js"

export default {
  name: "SessionPanel",
  props: {
    // Niveau d'alerte courant (0..5) — même source que le reste du chrome.
    alertLevel: { type: Number, default: 0 },
  },
  data() {
    // `now` : horloge locale rafraîchie à la seconde, moteur des durées vivantes.
    return { now: Date.now(), openingHeureMs, sessionElapsedMs, sessionRemainingMs }
  },
  computed: {
    alertLabel() {
      return (ALERT_LABELS[this.alertLevel] || "").toUpperCase()
    },
  },
  created() {
    this._timer = setInterval(() => { this.now = Date.now() }, 1000)
  },
  beforeUnmount() {
    clearInterval(this._timer)
  },
  methods: {
    fmt(ms) {
      return formatSessionTime(ms)
    },
  },
}
</script>

<style scoped>
/* Grille de cards : autant de colonnes que la largeur le permet (min 150px), sinon on stacke.
   Confortable en wide screen (pas de lignes étirées) comme en étroit (une colonne). */
.session-info {
  margin: 0;
  font-size: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}
.session-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  background: var(--panel-raised);
  border: 1px solid var(--line);
  border-left: 3px solid var(--line-strong);
}
.session-card dt { color: var(--ink-dim); text-transform: uppercase; letter-spacing: 0.5px; margin: 0; font-size: 11px; }
.session-card dd { margin: 0; color: var(--ink); font-variant-numeric: tabular-nums; font-size: 16px; }
.session-remaining { border-left-color: var(--accent); }
.session-remaining dd { color: var(--accent); }
.session-remaining.session-danger { border-left-color: var(--danger); }
.session-remaining.session-danger dd { color: var(--danger); font-weight: bold; }
.session-alert.alert-1 dd { color: #cf9b45; }
.session-alert.alert-2 dd { color: #cf7b45; }
.session-alert.alert-3 dd { color: #cf5b45; }
.session-alert.alert-4 dd,
.session-alert.alert-5 dd { color: var(--danger); font-weight: bold; }
.session-alert.alert-4, .session-alert.alert-5 { border-left-color: var(--danger); }
</style>
