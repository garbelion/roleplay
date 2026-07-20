// Opérations d'édition de l'arbre, pures et testables (l'UI ne fait que les câbler).

// Trim + refus du vide, avec un libellé pour le message d'erreur.
function requireText(value, label) {
  const clean = (value || "").trim()
  if (!clean) throw new Error(label + " vide")
  return clean
}

// Ajoute un disque à la racine. Un disque est un nœud de premier niveau `type: 'disk'` ;
// l'app change de disque *par nom*, donc les noms doivent rester uniques.
export function addDisk(root, name) {
  const clean = requireText(name, "Nom de disque")
  root.children = root.children || []
  if (root.children.some((c) => c.type === "disk" && c.name === clean)) {
    throw new Error("Disque déjà existant : " + clean)
  }
  const disk = { name: clean, type: "disk", children: [] }
  root.children.push(disk)
  return disk
}

// Ajoute un fichier à un dossier/disque. `isCritical` marque une pièce que les PJ doivent
// télécharger (mise en avant par l'aide Bafouille) ; on ne l'écrit que si vrai (JSON minimal).
export function addFile(parent, name, { isCritical = false } = {}) {
  const clean = requireText(name, "Nom de fichier")
  parent.children = parent.children || []
  const file = { name: clean, type: "file" }
  if (isCritical) file.isCritical = true
  parent.children.push(file)
  return file
}

// Ajoute un sous-dossier (nœud navigable) à un dossier/disque.
export function addDirectory(parent, name) {
  const clean = requireText(name, "Nom de dossier")
  parent.children = parent.children || []
  const dir = { name: clean, type: "directory", children: [] }
  parent.children.push(dir)
  return dir
}

// Marque / démarque un fichier existant comme critique (retiré plutôt que mis à false).
export function setCritical(file, isCritical) {
  if (isCritical) file.isCritical = true
  else delete file.isCritical
  return file
}

// Ajoute un message de propagande (pool `console.propaganda`, tiré à l'ambiance de la console).
export function addPropaganda(root, message) {
  const clean = requireText(message, "Message")
  root.console = root.console || {}
  root.console.propaganda = root.console.propaganda || []
  root.console.propaganda.push(clean)
  return clean
}

// Renvoie le pool de propagande après avoir validé que `index` le vise bien.
function propagandaAt(root, index) {
  const list = (root.console && root.console.propaganda) || []
  if (!Number.isInteger(index) || index < 0 || index >= list.length) {
    throw new Error("Index de propagande hors bornes : " + index)
  }
  return list
}

export function editPropaganda(root, index, message) {
  const clean = requireText(message, "Message")
  const list = propagandaAt(root, index)
  list[index] = clean
  return clean
}

export function removePropaganda(root, index) {
  return propagandaAt(root, index).splice(index, 1)[0]
}
