// Adaptateur Supabase -> "source" de session (contrat consommé par session-remote.js).
// Isole ici l'API chaînable de Supabase et le mapping schéma DB (snake_case) <-> app.
// La table `session_state` porte une seule ligne : { connection_quality, alert_level }.

import { connectSessionRemote } from './session-remote.js'
import { loadSupabaseClient } from './supabase-client.js'

// Schéma de la table d'état (source unique du mapping snake_case <-> app).
export const SESSION_TABLE = 'session_state'
const TABLE = SESSION_TABLE
// Colonnes lues (une seule ligne : réglages MJ + écran de la phase d'intrusion).
export const SESSION_COLUMNS = 'connection_quality, alert_level, intrusion'

// Ligne DB -> config app ; null si pas de ligne.
export const mapRow = (row) =>
  row ? { connectionQuality: row.connection_quality, alertLevel: row.alert_level, intrusion: row.intrusion } : null

// Config app -> ligne DB (écriture). Les clés absentes ressortent `undefined` et sont
// écartées à la sérialisation JSON (updates partiels côté MJ).
export const toRow = ({ connectionQuality, alertLevel, intrusion }) =>
  ({ connection_quality: connectionQuality, alert_level: alertLevel, intrusion })

/**
 * Construit une source { fetchState, onChange } à partir d'un client Supabase.
 * @param {object} client  client `@supabase/supabase-js`
 * @param {string} table   table d'état (défaut 'session_state')
 */
export function createSupabaseSource(client, table = TABLE) {
  return {
    async fetchState() {
      const { data } = await client.from(table).select(SESSION_COLUMNS).single()
      return mapRow(data)
    },
    onChange(cb) {
      const channel = client
        .channel('session_state')
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => cb(mapRow(payload.new)))
        .subscribe()
      return () => client.removeChannel(channel)
    }
  }
}

/**
 * Glue d'amorçage : depuis la config `session.supabase` de file-system.json, importe le SDK
 * (dynamique, code-split), crée le client et connecte le store au Realtime. Config absente /
 * incomplète => handle inerte (mode 100 % statique, aucun SDK chargé).
 *
 * Renvoie un handle `{ disconnect }` **synchrone** : le chargement du SDK et la connexion se
 * font en fond, et `disconnect()` est sûr qu'ils soient terminés ou non (la course est gérée
 * ici, pas dans l'appelant). Échec d'import/connexion => on reste en mode statique.
 */
export function connectSupabaseSession(config) {
  if (!config?.url || !config?.anonKey) return { disconnect() {} }
  let inner = null
  let stopped = false
  ;(async () => {
    try {
      const client = await loadSupabaseClient(config)
      if (stopped) return
      inner = await connectSessionRemote(createSupabaseSource(client))
      if (stopped) inner.disconnect()
    } catch {
      // SDK ou connexion indisponible : on garde les défauts statiques.
    }
  })()
  return { disconnect() { stopped = true; if (inner) inner.disconnect() } }
}
