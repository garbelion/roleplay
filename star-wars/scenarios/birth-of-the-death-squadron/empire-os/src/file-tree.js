// Le chemin d'un nœud est entièrement déterminé par sa position dans l'arbre (la chaîne de
// noms de ses ancêtres). Le stocker dans file-system.json serait redondant et fragile ; on
// l'annote donc au chargement, à partir de la seule structure. La racine a le chemin '/'.

const childPath = (path, name) => (path === '/' ? '/' + name : path + '/' + name)

export function assignPaths(root) {
  const walk = (node, path) => {
    node.path = path
    for (const child of node.children || []) {
      walk(child, childPath(path, child.name))
    }
  }
  walk(root, '/')
  return root
}

// Fichiers marqués `isCritical` (pièces que les PJ doivent télécharger), avec leur chemin
// dérivé de la structure. Ordre de l'arbre préservé. Alimente l'aide Bafouille (§5.6).
export function collectCriticalFiles(root) {
  const out = []
  const walk = (node, path) => {
    if (node.type === 'file' && node.isCritical) out.push({ name: node.name, path })
    for (const child of node.children || []) {
      walk(child, childPath(path, child.name))
    }
  }
  walk(root, '/')
  return out
}
