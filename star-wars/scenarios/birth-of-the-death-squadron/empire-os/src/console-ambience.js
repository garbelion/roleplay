// Ambiance de la console pour une session : les émetteurs qui poussent des lignes au fil
// du temps — propagande d'ambiance + avertissement de session (> 2 h). Un handle unique
// démarre et arrête l'ensemble, pour un seul point de couture dans le cycle de vie de la vue.
// (La ligne d'amorçage « SESSION OUVERTE » reste poussée à l'ouverture pour rester en tête
//  de l'ordre chronologique — elle n'est pas gérée ici.)

import { startSessionWarning } from './session-log.js'
import { startPropaganda } from './propaganda.js'

export function startConsoleAmbience({ propaganda, alertLevel, rng, intervalMs } = {}) {
  const emitters = [
    startPropaganda({ pool: propaganda, alertLevel, rng, intervalMs }),
    startSessionWarning()
  ]
  return { stop() { emitters.forEach(e => e.stop()) } }
}
