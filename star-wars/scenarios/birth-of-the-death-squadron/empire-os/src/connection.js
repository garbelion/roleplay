// Domaine « qualité de liaison » (paramètre narratif réglé par le MJ). Échelle ordonnée du
// meilleur au pire. 'perdue' = niveau terminal : la session s'arrête. Les autres pilotent les
// perturbations visuelles (glitch) de l'OS. Voir ROADMAP §5.7.

export const CONNECTION_LEVELS = ['excellente', 'bonne', 'moyenne', 'faible', 'critique', 'perdue']

/** Rang du niveau (0 = meilleur) ; -1 si inconnu. */
export function connectionRank(level) {
  return CONNECTION_LEVELS.indexOf(level)
}

/** Niveau terminal : la connexion est perdue, la session se termine. */
export const isConnectionLost = (level) => level === 'perdue'

// Intensité des perturbations : 0 (>= bonne, aucune), 1..3 pour moyenne/faible/critique.
// 'perdue' n'a pas de glitch (la session se termine à ce niveau).
const GLITCH = { moyenne: 1, faible: 2, critique: 3 }
export function glitchLevel(level) {
  return GLITCH[level] || 0
}

/**
 * Sens d'un changement de qualité, pour l'annoncer en console.
 * @returns {'amelioration'|'degradation'|null}  null si égal ou niveau inconnu.
 */
export function connectionChangeKind(prev, next) {
  const a = connectionRank(prev)
  const b = connectionRank(next)
  if (a === -1 || b === -1 || a === b) return null
  return b < a ? 'amelioration' : 'degradation' // rang plus bas = meilleure connexion
}

/**
 * Ligne de console à pousser pour un changement de qualité (ou null si aucun/inconnu).
 * @returns {{kind:'system', level?:'warn', text:string}|null}
 */
export function connectionChangeLog(prev, next) {
  const kind = connectionChangeKind(prev, next)
  if (!kind) return null
  const quality = String(next).toUpperCase()
  return kind === 'degradation'
    ? { kind: 'system', level: 'warn', text: `LIAISON DÉGRADÉE — QUALITÉ ${quality}` }
    : { kind: 'system', text: `LIAISON RÉTABLIE — QUALITÉ ${quality}` }
}
