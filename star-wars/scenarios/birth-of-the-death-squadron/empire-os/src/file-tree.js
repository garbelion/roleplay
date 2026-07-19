// Le chemin d'un nœud est entièrement déterminé par sa position dans l'arbre (la chaîne de
// noms de ses ancêtres). Le stocker dans file-system.json serait redondant et fragile ; on
// l'annote donc au chargement, à partir de la seule structure. La racine a le chemin '/'.

export function assignPaths(root) {
  const walk = (node, path) => {
    node.path = path
    for (const child of node.children || []) {
      walk(child, path === '/' ? '/' + child.name : path + '/' + child.name)
    }
  }
  walk(root, '/')
  return root
}
