// Opérations back-office MJ (page #/mj) sur Supabase : authentification + lecture + écriture
// de l'état de session. Réutilise le mapping schéma canonique de supabase-source.js.
// Client injecté (mocké en test) ; le SDK réel est chargé par connectMjOpsFromConfig (glue).

import { SESSION_TABLE, SESSION_COLUMNS, mapRow, toRow } from './supabase-source.js'
import { loadSupabaseClient } from './supabase-client.js'

/**
 * Construit les opérations MJ { signIn, fetchState, updateState } sur un client Supabase.
 */
export function createMjOps(client) {
  return {
    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
    },
    async fetchState() {
      const { data } = await client.from(SESSION_TABLE).select(SESSION_COLUMNS).single()
      return mapRow(data)
    },
    async updateState(patch) {
      const { error } = await client.from(SESSION_TABLE).update(toRow(patch)).eq('id', 1)
      if (error) throw new Error(error.message)
    }
  }
}

/**
 * Glue d'amorçage de la page MJ : lit la config `session.supabase` de file-system.json,
 * importe le SDK (dynamique) et crée le client + les ops. Config absente => null (page inerte).
 */
export async function createMjOpsFromConfig() {
  const res = await fetch('/file-system.json')
  const fs = await res.json()
  const cfg = fs?.session?.supabase
  if (!cfg?.url || !cfg?.anonKey) return null
  return createMjOps(await loadSupabaseClient(cfg))
}
