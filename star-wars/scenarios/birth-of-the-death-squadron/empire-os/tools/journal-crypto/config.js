// Paramètres du chiffrement du journal (d). CE FICHIER VIT DANS tools/ — jamais embarqué dans
// le bundle vite (seuls src/ et public/ le sont). C'est ici que le MJ pose la clé maîtresse et
// les deux phrases de passe (une par colonne) du scénario.
//
// ⚠ Les passphrases par défaut sont des PLACEHOLDERS. Pour que le ciphertext du bundle soit
// « honnête » (déchiffrable avec les vraies phrases que les joueurs reconstituent à la table),
// remplace-les par celles de la chaîne d'énigme, puis relance `npm run journal:encode`.
// Le déchiffrement se joue de toute façon à la table (jet de dé) : la feuille MJ est régénérée
// dans la même passe, donc la cohérence bundle ↔ feuille est garantie quelle que soit la valeur.

export const CONFIG = {
  // Secret maîtresse de Tana, dérivé de deux façons (une passphrase par colonne).
  baseSecret: process.env.JOURNAL_SECRET || "KESSEL-THO::ADMIN-WREY",
  passphraseMessage: process.env.JOURNAL_PASS_MESSAGE || "PLACEHOLDER-MESSAGE",
  passphraseCoord: process.env.JOURNAL_PASS_COORD || "PLACEHOLDER-COORDONNEES",

  // Entrées (relatives à docs/) et sorties.
  journalJson: "journal_complet.json", // source plaintext (docs/)
  templateDocx: "d_journal_decrypte.docx", // gabarit riche en clair (docs/)
  outputDocx: "registre_creneaux.docx", // docx CHIFFRÉ écrit dans empire-os/public/fichiers/
  mjSheet: "d_journal_MJ_dechiffre.md", // feuille MJ déchiffrée-filtrée écrite dans docs/

  // Réécriture d'immersion de l'intro (le docx du bundle n'est PAS « en clair »).
  faultyIntro: "Document ci-dessous présenté en clair pour archivage de travail.",
  lockedIntro:
    "Contenu des colonnes protégées illisible hors des accès administrateur de station.",
}
