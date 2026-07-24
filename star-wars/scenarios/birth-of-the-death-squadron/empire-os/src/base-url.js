// Préfixe un chemin d'asset par le base URL de déploiement (`import.meta.env.BASE_URL`),
// pour que l'appli fonctionne aussi bien à la racine d'un domaine que sous un sous-chemin
// (ex. GitHub Pages : /roleplay/). Les fichiers de données (file-system.json, /fichiers/…)
// sont servis à côté du bundle : leur URL doit donc suivre le même base que les assets.
// Pur et testable : le base est injectable (défaut = celui résolu par Vite au build).
export function withBase(path, base = import.meta.env.BASE_URL) {
  const b = base.endsWith('/') ? base : base + '/'
  return b + String(path).replace(/^\/+/, '')
}
