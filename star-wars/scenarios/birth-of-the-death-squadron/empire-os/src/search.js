// Recherche de fichiers (point 7). Fonctions pures, testables.

// Repli casse + accents, en PRÉSERVANT la longueur (chaque caractère -> sa lettre de base
// minuscule) : l'index d'une correspondance dans le repli reste valide dans le nom original,
// ce qui permet de surligner la sous-chaîne exacte.
export function fold(str) {
  return [...str].map(c => c.normalize('NFD')[0].toLowerCase()).join('');
}

// Le nom `name` correspond-il à `query` (substring, insensible casse+accents) ?
export function matches(name, query) {
  const q = fold(query.trim());
  return !!q && fold(name).includes(q);
}

// Parcourt récursivement `rootNode` (dossier/disque) et retourne, dans l'ordre de parcours,
// les descendants (fichiers, dossiers, disques) dont le nom contient `query` (substring,
// insensible casse+accents). La racine de départ et les entrées `..` sont exclues.
export function searchTree(rootNode, query) {
  const q = fold(query.trim());
  if (!q) return [];
  const results = [];
  const walk = (node) => {
    for (const child of node.children || []) {
      if (child.name !== '..' && fold(child.name).includes(q)) results.push(child);
      if (child.children) walk(child);
    }
  };
  walk(rootNode);
  return results;
}

// Découpe `name` en segments [{ text, match }] autour de la sous-chaîne correspondant à
// `query` (pour un rendu avec <mark>). Le repli préservant la longueur, l'index trouvé dans
// le repli s'applique tel quel au nom original (surlignage exact malgré les accents).
export function highlightSegments(name, query) {
  const q = fold(query.trim());
  const i = q ? fold(name).indexOf(q) : -1;
  if (i < 0) return [{ text: name, match: false }];
  const segments = [];
  if (i > 0) segments.push({ text: name.slice(0, i), match: false });
  segments.push({ text: name.slice(i, i + q.length), match: true });
  if (i + q.length < name.length) segments.push({ text: name.slice(i + q.length), match: false });
  return segments;
}

// Message de comptage typé, avec accord : « 4 fichiers et 2 dossiers correspondent à votre
// recherche » / « 1 fichier correspond… » / « Aucun résultat ».
export function formatCount(results) {
  const counts = { file: 0, directory: 0, disk: 0 };
  for (const r of results) if (counts[r.type] !== undefined) counts[r.type]++;
  const total = counts.file + counts.directory + counts.disk;
  if (total === 0) return 'Aucun résultat';

  const label = (count, singular) => `${count} ${singular}${count > 1 ? 's' : ''}`;
  const parts = [];
  if (counts.file) parts.push(label(counts.file, 'fichier'));
  if (counts.directory) parts.push(label(counts.directory, 'dossier'));
  if (counts.disk) parts.push(label(counts.disk, 'disque'));

  const list = parts.length > 1
    ? `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`
    : parts[0];
  return `${list} ${total > 1 ? 'correspondent' : 'correspond'} à votre recherche`;
}
