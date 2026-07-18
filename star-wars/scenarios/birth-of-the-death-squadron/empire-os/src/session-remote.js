// Lecture temps réel de l'état de session (back-office MJ, ROADMAP §5.2).
// Orchestration pure et vendor-agnostique : consomme une "source" injectable
//   source = { fetchState(): Promise<{connectionQuality?, alertLevel?}|null>,
//              onChange(cb): unsubscribe }
// et applique tout au store réactif (setSessionConfig). L'adaptateur Supabase
// (supabase-source.js) fournit une telle source ; les tests en injectent une fausse.

import { setSessionConfig } from './session-store.js'

/**
 * Connecte le store à une source distante : applique l'état initial puis chaque
 * changement. Dégradation propre : sans source ou en cas d'échec du fetch, on garde
 * les défauts statiques (l'app reste utilisable hors-ligne). Renvoie `{ disconnect }`.
 */
export async function connectSessionRemote(source) {
  if (!source) return { disconnect() {} } // non configuré -> défauts statiques

  try {
    const initial = await source.fetchState()
    if (initial) setSessionConfig(initial)
  } catch {
    // Injoignable au démarrage : on garde les défauts, l'abonnement prendra le relais.
  }

  const unsubscribe = source.onChange((state) => setSessionConfig(state))
  return { disconnect() { if (unsubscribe) unsubscribe() } }
}
