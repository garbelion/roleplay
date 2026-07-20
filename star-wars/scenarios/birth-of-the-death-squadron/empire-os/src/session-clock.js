// Horloge de session : source unique du temps in-game, ancrée à l'ENTRÉE dans l'OS
// (pas au chargement du module). Alimente l'heure de la barre de titre, l'horodatage des
// lignes de console (heure murale in-fiction) et l'onglet Session (écoulé / restant).
//
// Deux repères dérivent de la même ancre `anchor` (heure murale, ms, posée à l'entrée) :
//   - temps écoulé   = now - anchor            (0 avant l'entrée)
//   - heure in-game  = clockStart + écoulé     (heure « murale » narrative réglée par le MJ)
// L'ancre est réactive : les vues Vue suivent le démarrage / reset de session.

import { reactive } from "vue"

// Durée maximale d'une session avant déconnexion automatique (2 h).
export const SESSION_LIMIT_MS = 2 * 60 * 60 * 1000

const DAY_MS = 24 * 60 * 60 * 1000
const pad2 = (n) => String(n).padStart(2, "0")

/** Durée (ms) → « HH:MM:SS » (heures non bornées : 25:00:00 possible). */
export function formatSessionTime(ms) {
  const total = Math.floor(Math.max(0, ms) / 1000)
  return `${pad2(Math.floor(total / 3600))}:${pad2(Math.floor((total % 3600) / 60))}:${pad2(total % 60)}`
}

/** Heure « murale » (ms) → « HH:MM:SS » ramenée sur 24 h (roule après minuit). */
export function formatHeure(ms) {
  return formatSessionTime((((ms || 0) % DAY_MS) + DAY_MS) % DAY_MS)
}

const clock = reactive({ anchor: null, clockStartSec: 0 })

/** Démarre (ou ré-ancre) la session à l'entrée dans l'OS. */
export function startSessionClock(clockStartSec = 0, now = Date.now()) {
  clock.anchor = now
  clock.clockStartSec = clockStartSec
}

/** Réinitialise : plus d'ancre, temps écoulé nul (Reset MJ / nouvelle session / tests). */
export function resetSessionClock() {
  clock.anchor = null
  clock.clockStartSec = 0
}

/** Temps écoulé (ms) depuis l'entrée dans l'OS ; 0 tant que la session n'a pas démarré. */
export function sessionElapsedMs(now = Date.now()) {
  return clock.anchor == null ? 0 : Math.max(0, now - clock.anchor)
}

/** Heure « murale » in-game (ms) : heure de départ réglée par le MJ + temps écoulé. */
export function heureMs(now = Date.now()) {
  return clock.clockStartSec * 1000 + sessionElapsedMs(now)
}

/** Heure d'ouverture de session : instantané figé de l'heure réglée à l'entrée (ms). */
export function openingHeureMs() {
  return clock.clockStartSec * 1000
}

/** Temps restant (ms) avant déconnexion automatique ; borné à 0. */
export function sessionRemainingMs(now = Date.now(), limit = SESSION_LIMIT_MS) {
  return Math.max(0, limit - sessionElapsedMs(now))
}

/** Session expirée : démarrée ET temps écoulé ≥ limite (déclenche la déconnexion auto). */
export function isSessionExpired(now = Date.now(), limit = SESSION_LIMIT_MS) {
  return clock.anchor != null && sessionElapsedMs(now) >= limit
}
