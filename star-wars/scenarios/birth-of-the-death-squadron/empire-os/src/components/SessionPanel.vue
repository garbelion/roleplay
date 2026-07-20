<template>
  <!-- Onglet Session du dock : état temporel de la connexion (côté joueur). -->
  <dl class="session-info">
    <div class="session-row session-opening">
      <dt>Ouverture de session</dt>
      <dd>{{ fmt(openingHeureMs()) }}</dd>
    </div>
    <div class="session-row session-elapsed">
      <dt>Temps écoulé</dt>
      <dd>{{ fmt(sessionElapsedMs(now)) }}</dd>
    </div>
    <div class="session-row session-remaining" :class="{ 'session-danger': sessionRemainingMs(now) === 0 }">
      <dt>Avant déconnexion</dt>
      <dd>{{ fmt(sessionRemainingMs(now)) }}</dd>
    </div>
    <div class="session-row session-alert" :class="`alert-${alertLevel}`">
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
} from "../session-clock.js"
import { formatSessionTime } from "../session-log.js"
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
.session-info { margin: 0; font-size: 12px; }
.session-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 3px 4px;
  border-bottom: 1px solid var(--line);
}
.session-row dt { color: var(--ink-dim); text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
.session-row dd { margin: 0; color: var(--ink); font-variant-numeric: tabular-nums; }
.session-remaining dd { color: var(--accent); }
.session-remaining.session-danger dd { color: var(--danger); font-weight: bold; }
.session-alert dd { color: var(--ink); }
.session-alert.alert-1 dd { color: #cf9b45; }
.session-alert.alert-2 dd { color: #cf7b45; }
.session-alert.alert-3 dd { color: #cf5b45; }
.session-alert.alert-4 dd,
.session-alert.alert-5 dd { color: var(--danger); font-weight: bold; }
</style>
