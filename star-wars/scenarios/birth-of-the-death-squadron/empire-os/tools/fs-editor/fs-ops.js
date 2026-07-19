// Opérations d'édition de l'arbre, pures et testables (l'UI ne fait que les câbler).

// Ajoute un disque à la racine. Un disque est un nœud de premier niveau `type: 'disk'` ;
// l'app change de disque *par nom*, donc les noms doivent rester uniques.
export function addDisk(root, name) {
  const clean = (name || "").trim()
  if (!clean) throw new Error("Nom de disque vide")
  root.children = root.children || []
  if (root.children.some((c) => c.type === "disk" && c.name === clean)) {
    throw new Error("Disque déjà existant : " + clean)
  }
  const disk = { name: clean, type: "disk", children: [] }
  root.children.push(disk)
  return disk
}
