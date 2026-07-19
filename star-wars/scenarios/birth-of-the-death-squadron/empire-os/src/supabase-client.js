// Point unique où le SDK Supabase est requis : import dynamique (code-split) + createClient.
// Réutilisé par le chemin lecture (supabase-source) et le chemin MJ (supabase-mj), pour ne pas
// dupliquer la façon d'obtenir un client (version du SDK, options...).

export async function loadSupabaseClient({ url, anonKey }) {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(url, anonKey)
}
