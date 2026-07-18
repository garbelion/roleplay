// Adaptateur Supabase -> "source" de session (contrat consommé par session-remote.js).
// Isole ici l'API chaînable de Supabase et le mapping schéma DB (snake_case) <-> app.
// La table `session_state` porte une seule ligne : { connection_quality, alert_level }.

import { connectSessionRemote } from './session-remote.js'

const TABLE = 'session_state'

// Ligne DB -> config app ; null si pas de ligne.
const mapRow = (row) =>
  row ? { connectionQuality: row.connection_quality, alertLevel: row.alert_level } : null

/**
 * Construit une source { fetchState, onChange } à partir d'un client Supabase.
 * @param {object} client  client `@supabase/supabase-js`
 * @param {string} table   table d'état (défaut 'session_state')
 */
export function createSupabaseSource(client, table = TABLE) {
  return {
    async fetchState() {
      const { data } = await client.from(table).select('connection_quality, alert_level').single()
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
 * incomplète => handle inerte (mode 100 % statique, aucun SDK chargé). Renvoie `{ disconnect }`.
 */
export async function connectSupabaseSession(config) {
  if (!config?.url || !config?.anonKey) return { disconnect() {} }
  const { createClient } = await import('@supabase/supabase-js')
  const client = createClient(config.url, config.anonKey)
  return connectSessionRemote(createSupabaseSource(client))
}
