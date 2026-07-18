// Notifications éphémères de l'OS : chaque nouveau message de la console qui n'est PAS
// un suivi d'action (donc propagande / système, pas surveillance) s'affiche brièvement
// à l'écran. Alimenté par pushLog (session-log.js) ; rendu par l'overlay d'App.vue.

import { reactive } from 'vue'

export const NOTIFICATION_MS = 5000

// Notifications actives (les plus récentes en fin de liste) : { id, text, kind }.
export const notifications = reactive([])

let seq = 0

/** Signale une entrée du journal en notification (5 s), sauf le suivi d'action (surveillance). */
export function notify(entry) {
  if (entry.kind === 'surveillance') return
  const id = ++seq
  notifications.push({ id, text: entry.text, kind: entry.kind })
  setTimeout(() => dismiss(id), NOTIFICATION_MS)
}

/** Retire une notification par id (expiration ou clic). */
export function dismiss(id) {
  const i = notifications.findIndex(n => n.id === id)
  if (i !== -1) notifications.splice(i, 1)
}

/** Vide les notifications (usage principal : tests). */
export function resetNotifications() {
  notifications.splice(0)
}
