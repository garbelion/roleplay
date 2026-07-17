// Durée fictive d'un « transfert » (popin d'attente), en secondes.
// Ambiance pure : décorrélée du vrai téléchargement. Voir ROADMAP point 6.
//
//   durée = (base + Σ poids_fichier + jitter±20%) × facteur_qualité × facteur_alerte
//   clampée sur [15 s, 20 min], RNG à chaque appel.

export const BASE_SECONDS = 10;
export const DEFAULT_WEIGHT = 2; // si un fichier n'a pas de `transferWeight`
export const JITTER = 0.2; // ±20 %
export const MIN_SECONDS = 15;
export const MAX_SECONDS = 20 * 60; // 1200 s

// Barèmes de conception (multiplicateurs), tweakables.
export const CONNECTION_FACTORS = {
  excellente: 0.5,
  bonne: 0.8,
  moyenne: 1.0,
  faible: 1.8,
  critique: 3.0
};

export const ALERT_LABELS = ["normal", "minimal", "major", "active-threat", "lockdown", "war"];
export const ALERT_FACTORS = [1.0, 1.3, 1.8, 2.6, 4.0, 6.5];

/**
 * @param {object}   opts
 * @param {Array}    opts.files              fichiers du lot (métadonnée `transferWeight` optionnelle)
 * @param {string}   opts.connectionQuality  clé de CONNECTION_FACTORS
 * @param {number}   opts.alertLevel         index 0..5 dans ALERT_FACTORS
 * @param {Function} opts.rng                () => [0,1) injectable (défaut Math.random)
 * @returns {number} durée en secondes, clampée [MIN_SECONDS, MAX_SECONDS]
 */
export function computeTransferDuration({
  files = [],
  connectionQuality = "moyenne",
  alertLevel = 0,
  rng = Math.random
} = {}) {
  const sumWeights = files.reduce(
    (s, f) => s + (typeof f.transferWeight === "number" ? f.transferWeight : DEFAULT_WEIGHT),
    0
  );
  const raw = BASE_SECONDS + sumWeights;
  // jitter ±20 % : rng() dans [0,1) -> facteur dans [1-0.2, 1+0.2)
  const jitterFactor = 1 + (rng() * 2 - 1) * JITTER;
  const connectionFactor = CONNECTION_FACTORS[connectionQuality] ?? 1.0;
  const alertFactor = ALERT_FACTORS[alertLevel] ?? 1.0;

  const seconds = raw * jitterFactor * connectionFactor * alertFactor;
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, seconds));
}
