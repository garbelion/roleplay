// Journal de session : le canal « big brother » de l'OS impérial.
// Les actions des PJ (surveillance), la propagande d'ambiance et les avertissements
// système y poussent des lignes ; l'onglet Console du dock les affiche. Voir ROADMAP §5.3.
//
// Une entrée : { kind: 'surveillance'|'propaganda'|'system', level?: 'info'|'warn'|'alert',
//                text: string, at?: number (ms écoulés depuis le début de session) }.

import { reactive } from 'vue'
import { notify } from './notifications.js'
import { heureMs } from './session-clock.js'

export const MAX_ENTRIES = 200

// Libellés de surveillance par défaut. Le MJ peut les surcharger via la donnée
// (clé `console.surveillance` de file-system.json).
export const DEFAULT_SURVEILLANCE = {
  open: 'ACCÈS FICHIER',
  navigate: 'NAVIGATION',
  extract: 'EXTRACTION VERS SUPPORT EXTERNE',
  cancelExtract: 'EXTRACTION INTERROMPUE',
  extractDone: 'TRANSFERT ACHEVÉ'
}

/** « LIBELLÉ : cible » (ou juste le libellé si pas de cible). Action inconnue → repli MAJ. */
export function surveillanceText(action, target, labels = DEFAULT_SURVEILLANCE) {
  const label = labels[action] || action.toUpperCase()
  return target ? `${label} : ${target}` : label
}

// Journal réactif partagé (singleton d'app) : producteurs → vue découplés.
export const sessionLog = reactive([])

/**
 * Empile une entrée, en gardant au plus MAX_ENTRIES lignes (les plus récentes).
 * Horodate automatiquement à l'**heure in-game** (`at` = heure murale narrative au moment
 * du log = heure réglée par le MJ + temps de session écoulé) si l'appelant ne l'a pas fait.
 */
export function pushLog(entry) {
  const stamped = entry.at === undefined ? { ...entry, at: heureMs() } : entry
  sessionLog.push(stamped)
  if (sessionLog.length > MAX_ENTRIES) sessionLog.splice(0, sessionLog.length - MAX_ENTRIES)
  // Tout message non-surveillance surgit aussi en notification éphémère (notify filtre lui-même).
  notify(stamped)
}

/** Vide le journal (usage principal : tests / nouvelle session). */
export function resetLog() {
  sessionLog.splice(0)
}

// Ligne d'amorçage : la console n'est jamais vide au premier coup d'œil.
export const SESSION_OPEN_TEXT = 'SESSION OUVERTE — SURVEILLANCE ACTIVE.'
