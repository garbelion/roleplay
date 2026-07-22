# journal-crypto — chiffrement du journal (d)

Outil **dev-only** (comme `fs-editor`). Il n'est **jamais importé par l'app** ni embarqué dans
le bundle vite (seuls `src/` et `public/` le sont). Il produit, à partir d'une **source unique** :

1. le **docx chiffré** du bundle → `public/fichiers/registre_creneaux.docx` ;
2. la **feuille MJ déchiffrée-filtrée** → `../docs/d_journal_MJ_dechiffre.md` (à imprimer).

```bash
npm run journal:encode
```

## Ce qui est chiffré, et comment

Le journal (d) est un tableau `Date | Auteur | Client | Message | Coordonnées`. Seules les
colonnes **Message** et **Coordonnées** sont protégées (ROADMAP §7) :

| Entrées | Colonnes Message + Coordonnées | Réversible ? |
|---|---|---|
| **Tana** (`type: "faux"`, 18 lignes) | **AES-128-CBC** réel | Oui — régénère la feuille MJ |
| **Autres clients** (`type: "réel"`, 60 lignes) | **blobs** aléatoires (`decoyBlob`) | Non, par conception |

- **Modèle de clés (ROADMAP §7 : « même clé dérivée de deux façons »)** : un **secret maîtresse**
  (`baseSecret`, la clé de Tana) + **une passphrase par colonne**. Chaque colonne dérive sa
  propre clé AES-128 via `pbkdf2(secret, passphrase_colonne, 200k, sha256, 16 o)`. Deux
  passphrases ⇒ deux clés distinctes issues du **même** secret.
- **Format d'une cellule chiffrée** : `base64( IV[16] || AES-128-CBC(plaintext) )`. IV aléatoire
  par cellule, préfixé au ciphertext.
- **Leurres** : `base64( random[16] || random[16·n] )` — même charset et même granularité de
  bloc que du vrai ciphertext, donc **indiscernables**. Dans la fiction, ces lignes sont
  chiffrées par la clé du technicien gérant (absente du bundle). Le plaintext de secours reste
  côté MJ dans `docs/journal_complet.json` si les joueurs l'obtiennent en jeu (corruption/otage).

## Intégrité du puzzle

- **Aucune clé, passphrase ni plaintext dans `public/`** : seul du ciphertext y est écrit. Le
  secret et les passphrases vivent dans `config.js` (répertoire `tools/`, hors bundle).
- Le **déchiffrement se joue à la table** (jets de dé) ; l'app ne déchiffre jamais. Le docx du
  bundle est servi en **`previewMode: summary`** (téléchargement forcé, pas de rendu inline).

## Passphrases (à poser avant la partie)

`config.js` porte des **PLACEHOLDERS**. Pour un ciphertext « honnête » (déchiffrable avec les
vraies phrases que les joueurs reconstituent), remplace-les par celles de la chaîne d'énigme,
puis relance `npm run journal:encode` :

```bash
JOURNAL_SECRET="…" JOURNAL_PASS_MESSAGE="…" JOURNAL_PASS_COORD="…" npm run journal:encode
```

> Le déchiffrement étant narratif, la **feuille MJ est régénérée dans la même passe** : la
> cohérence bundle ↔ feuille imprimée est garantie quelle que soit la valeur des passphrases.

## Fichiers

- `crypto.js` — dérivation de clés + AES-128-CBC + blobs leurres (pur, testé :
  `tests/journal-crypto.spec.js`).
- `docx-cells.js` — chirurgie XML pure du `word/document.xml` : ne remplace que le **texte** des
  cellules ciblées, préserve toute la mise en forme (testé : `tests/journal-docx-cells.spec.js`).
- `encode-journal.js` — orchestration (lit JSON + gabarit docx, écrit docx chiffré + feuille MJ).
- `config.js` — secret, passphrases, noms de fichiers.

Le gabarit `docs/d_journal_decrypte.docx` reste la **source riche éditable** (en-tête/pied, page
de garde, sommaire, tableau). On le **transforme** — jamais on ne le régénère depuis du Markdown.
Un garde-fou vérifie ligne à ligne que le gabarit et `journal_complet.json` concordent (78 lignes)
avant de chiffrer, et fait un aller-retour de contrôle sur chaque cellule de Tana.
