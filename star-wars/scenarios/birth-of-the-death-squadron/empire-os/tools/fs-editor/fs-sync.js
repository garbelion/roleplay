// Outil dev-only : compare l'arbre logique (file-system.json) au contenu réel de public/fichiers/.
// Les fichiers vivent à plat, adressés par nom de base ; la position d'un nœud dans l'arbre est
// purement logique. La cohérence à surveiller se réduit donc à trois cas :
//   - missing    : un nœud fichier déclaré dont le nom n'existe pas sur le disque
//   - orphans    : un fichier présent sur le disque que l'arbre ne déclare pas
//   - duplicates : un même nom déclaré à plusieurs endroits (collision, car adressage à plat)

// Chemin dérivé de la position (mêmes règles qu'assignPaths), sans muter l'arbre.
function collectFiles(root) {
  const files = []
  const walk = (node, path) => {
    if (node.type === "file") files.push({ name: node.name, path })
    for (const child of node.children || []) {
      walk(child, path === "/" ? "/" + child.name : path + "/" + child.name)
    }
  }
  walk(root, "/")
  return files
}

export function diffFileSystem(root, physicalFiles) {
  const declared = collectFiles(root)

  const byName = new Map()
  for (const { name, path } of declared) {
    const paths = byName.get(name) || []
    paths.push(path)
    byName.set(name, paths)
  }

  const physical = new Set(physicalFiles)
  const missing = declared.filter((f) => !physical.has(f.name))
  const orphans = physicalFiles.filter((name) => !byName.has(name))
  const duplicates = [...byName.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([name, paths]) => ({ name, paths }))

  return { missing, orphans, duplicates }
}
