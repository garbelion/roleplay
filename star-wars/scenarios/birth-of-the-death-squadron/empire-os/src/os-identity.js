// Identité de l'OS simulé — source unique, pilote la barre de titre et le prompt.
// Pour renommer l'OS, il suffit de changer ces valeurs.
export const OS = {
  name: 'Sienar Imperial Terminal',
  // Forme courte pour le prompt (style hostname unix, sans espace) : sienar:/chemin$
  shortName: 'sienar',
  fullName: "Système d'exploitation impérial",
  version: 'v2.14.7',
  // Datation impériale (canon) : an 0 = fondation de l'Empire (19 av. BY), notée AFE
  // (After the Formation of the Empire). Le scénario en 1 ABY correspond à 20 AFE.
  build: '20 AFE',
  licensee: 'Bureau Impérial des Transmissions'
}
