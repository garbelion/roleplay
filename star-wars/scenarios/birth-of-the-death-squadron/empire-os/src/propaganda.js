// Propagande d'ambiance de la console : des slogans impériaux défilent tout seuls,
// indépendamment des actions du PJ. La cadence se resserre quand le niveau d'alerte monte.
// Voir ROADMAP §5.3. Le pool de textes est de la donnée MJ (console.propaganda).

import { pushLog } from './session-log.js'
import { ALERT_FACTORS } from './transfer-duration.js'

// Pool par défaut (fallback si le MJ n'a rien fourni). Chrome d'ambiance, pas de contenu narratif.
export const DEFAULT_PROPAGANDA = [
  "L'EMPIRE VEILLE.",
  "TOUTE ACTIVITÉ EST ENREGISTRÉE.",
  "LA LOYAUTÉ EST RÉCOMPENSÉE. LA TRAHISON, PUNIE.",
  "L'ORDRE NOUVEAU GARANTIT VOTRE SÉCURITÉ.",
  "SIGNALEZ TOUTE ACTIVITÉ SÉDITIEUSE.",
  "LA GLOIRE À L'EMPEREUR."
]

// Cadence de base (ms) entre deux slogans, à niveau d'alerte nul.
export const PROPAGANDA_BASE_MS = 45000

/** Intervalle (ms) entre deux slogans : `base` divisé par le facteur d'alerte (se resserre en alerte). */
export function propagandaInterval(alertLevel = 0, base = PROPAGANDA_BASE_MS) {
  const factor = ALERT_FACTORS[alertLevel] ?? 1.0
  return Math.round(base / factor)
}

/** Choisit une ligne du pool via le RNG injecté ; null si pool vide. */
export function pickPropaganda(pool = DEFAULT_PROPAGANDA, rng = Math.random) {
  if (!pool.length) return null
  return pool[Math.floor(rng() * pool.length)]
}

/**
 * Démarre l'émetteur de propagande (setInterval). Renvoie `{ stop }`.
 * @param {Array}    opts.pool        textes (défaut DEFAULT_PROPAGANDA)
 * @param {number}   opts.alertLevel  0..5 (pilote la cadence si intervalMs absent)
 * @param {Function} opts.rng         RNG injectable
 * @param {number}   opts.intervalMs  période explicite (prioritaire sur alertLevel)
 */
export function startPropaganda({
  pool = DEFAULT_PROPAGANDA,
  alertLevel = 0,
  rng = Math.random,
  intervalMs
} = {}) {
  if (!pool.length) return { stop() {} }
  const period = intervalMs ?? propagandaInterval(alertLevel)
  const id = setInterval(() => {
    const text = pickPropaganda(pool, rng)
    if (text) pushLog({ kind: 'propaganda', text })
  }, period)
  return { stop() { clearInterval(id) } }
}
