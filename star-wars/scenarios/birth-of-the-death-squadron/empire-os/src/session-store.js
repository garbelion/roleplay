// État de session partagé (réglages MJ) : qualité de connexion + niveau d'alerte.
// Source unique consommée par la propagande/console (cadence, teinte) ET le popin de
// transfert (durée). Initialisé depuis file-system.json ; plus tard mis à jour en live
// par le back-office (Supabase Realtime — ROADMAP §5.2). Réactif : les vues suivent.

import { reactive } from 'vue'

export const DEFAULT_SESSION = { connectionQuality: 'moyenne', alertLevel: 0, intrusion: 'boot', clockStart: 0 }

export const sessionState = reactive({ ...DEFAULT_SESSION })

/**
 * Applique une config partielle ; n'écrit que les clés connues (celles de DEFAULT_SESSION)
 * présentes et définies. Les clés absentes ou inconnues sont ignorées.
 */
export function setSessionConfig(partial) {
  if (!partial) return
  for (const key of Object.keys(DEFAULT_SESSION)) {
    if (partial[key] !== undefined) sessionState[key] = partial[key]
  }
}

/** Restaure les défauts (nouvelle session / tests). */
export function resetSessionState() {
  Object.assign(sessionState, DEFAULT_SESSION)
}
