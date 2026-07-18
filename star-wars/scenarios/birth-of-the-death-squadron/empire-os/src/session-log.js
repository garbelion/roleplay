// Journal de session : le canal « big brother » de l'OS impérial.
// Les actions des PJ (surveillance), la propagande d'ambiance et les avertissements
// système y poussent des lignes ; l'onglet Console du dock les affiche. Voir ROADMAP §5.3.
//
// Une entrée : { kind: 'surveillance'|'propaganda'|'system', level?: 'info'|'warn'|'alert',
//                text: string, at?: number (ms écoulés depuis le début de session) }.

import { reactive } from 'vue'

export const MAX_ENTRIES = 200

const pad2 = (n) => String(n).padStart(2, '0')

/** Durée écoulée (ms) → « HH:MM:SS ». */
export function formatSessionTime(ms) {
  const total = Math.floor(Math.max(0, ms) / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`
}

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

// Début de session : instant de chargement du module (= ouverture de l'OS).
// Sert d'origine à l'horodatage des entrées (temps écoulé, pas heure murale).
export const sessionStart = Date.now()

// Journal réactif partagé (singleton d'app) : producteurs → vue découplés.
export const sessionLog = reactive([])

/**
 * Empile une entrée, en gardant au plus MAX_ENTRIES lignes (les plus récentes).
 * Horodate automatiquement (`at` = ms écoulés) si l'appelant ne l'a pas fait.
 */
export function pushLog(entry) {
  const stamped = entry.at === undefined ? { ...entry, at: Date.now() - sessionStart } : entry
  sessionLog.push(stamped)
  if (sessionLog.length > MAX_ENTRIES) sessionLog.splice(0, sessionLog.length - MAX_ENTRIES)
}

/** Vide le journal (usage principal : tests / nouvelle session). */
export function resetLog() {
  sessionLog.splice(0)
}

// Avertissement de session : au-delà de 2 h d'ouverture, l'OS « signale » la connexion.
export const SESSION_WARNING_MS = 2 * 60 * 60 * 1000
export const SESSION_WARNING_TEXT =
  'DURÉE DE SESSION ANORMALE — CONNEXION SIGNALÉE AU BUREAU DES TRANSMISSIONS.'

/**
 * Programme l'avertissement « > 2 h » : pousse une entrée système (level 'warn')
 * une seule fois, au franchissement du seuil. Renvoie `{ stop }`.
 * @param {number}   opts.thresholdMs seuil (défaut 2 h)
 * @param {string}   opts.text        libellé
 * @param {Function} opts.now         horloge injectable (défaut Date.now)
 */
export function startSessionWarning({
  thresholdMs = SESSION_WARNING_MS,
  text = SESSION_WARNING_TEXT,
  now = Date.now
} = {}) {
  const remaining = Math.max(0, thresholdMs - (now() - sessionStart))
  const id = setTimeout(() => {
    pushLog({ kind: 'system', level: 'warn', text })
  }, remaining)
  return { stop() { clearTimeout(id) } }
}
