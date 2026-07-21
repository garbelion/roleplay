// Adaptateur Supabase -> "source" de session (contrat consommé par session-remote.js).
// Isole ici l'API chaînable de Supabase et le mapping schéma DB (snake_case) <-> app.
// La table `session_state` porte une seule ligne : { connection_quality, alert_level }.

import { connectSessionRemote } from './session-remote.js'
import { loadSupabaseClient } from './supabase-client.js'

// Schéma de la table d'état (source unique du mapping snake_case <-> app).
export const SESSION_TABLE = 'session_state'
const TABLE = SESSION_TABLE
// Colonnes lues (une seule ligne : réglages MJ + écran d'intrusion + heure de départ + Bafouille).
export const SESSION_COLUMNS = 'connection_quality, alert_level, intrusion, clock_start, bafouille'

// Ligne DB -> config app ; null si pas de ligne.
export const mapRow = (row) =>
  row
    ? { connectionQuality: row.connection_quality, alertLevel: row.alert_level, intrusion: row.intrusion, clockStart: row.clock_start, bafouille: row.bafouille }
    : null

// Config app -> ligne DB (écriture). Les clés absentes ressortent `undefined` et sont
// écartées à la sérialisation JSON (updates partiels côté MJ).
export const toRow = ({ connectionQuality, alertLevel, intrusion, clockStart, bafouille }) =>
  ({ connection_quality: connectionQuality, alert_level: alertLevel, intrusion, clock_start: clockStart, bafouille })

/**
 * Construit une source { fetchState, onChange } à partir d'un client Supabase.
 * @param {object} client  client `@supabase/supabase-js`
 * @param {string} table   table d'état (défaut 'session_state')
 */
export function createSupabaseSource(client, table = TABLE) {
  const fetchState = async () => {
    const { data } = await client.from(table).select(SESSION_COLUMNS).single()
    return mapRow(data)
  }
  return {
    fetchState,
    onChange(cb) {
      const channel = client
        .channel('session_state')
        // On ne fait PAS confiance à `payload.new` : selon la publication Realtime, une colonne
        // ajoutée après coup peut en être absente (charge partielle) — appliquer un tel payload
        // laisserait des champs périmés (ex. l'intervention Bafouille qui ne se coupe pas).
        // Toute notification déclenche donc une relecture autoritative de la ligne complète.
        .on('postgres_changes', { event: '*', schema: 'public', table }, async () => {
          const state = await fetchState()
          if (state) cb(state)
        })
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
 * Renvoie un handle `{ disconnect, ready }` **synchrone** : le chargement du SDK et la connexion
 * se font en fond ; `disconnect()` est sûr qu'ils soient terminés ou non (la course est gérée
 * ici, pas dans l'appelant), et `ready` se résout après le premier settle (fetch initial appliqué)
 * ou l'échec — l'hôte s'en sert pour ne router qu'une fois l'état connu. Échec => mode statique.
 */
export function connectSupabaseSession(config) {
  if (!config?.url || !config?.anonKey) return { disconnect() {}, ready: Promise.resolve() }
  let inner = null
  let stopped = false
  const ready = (async () => {
    try {
      const client = await loadSupabaseClient(config)
      if (stopped) return
      inner = await connectSessionRemote(createSupabaseSource(client))
      if (stopped) inner.disconnect()
    } catch {
      // SDK ou connexion indisponible : on garde les défauts statiques.
    }
  })()
  return { disconnect() { stopped = true; if (inner) inner.disconnect() }, ready }
}
