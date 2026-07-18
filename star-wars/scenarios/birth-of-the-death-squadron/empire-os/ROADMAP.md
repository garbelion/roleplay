# EmpireOS — Roadmap & décisions de conception

> Accessoire narratif diégétique pour le scénario Star Wars *Birth of the Death Squadron*.
> Ce document fait autorité sur la **direction produit** : le cap, les décisions gravées, le
> reste-à-faire. Le `readme.md` décrit l'usage/l'installation.
> Nom in-fiction : **Sienar Imperial Terminal** ; `EmpireOS` / `empire-os` reste le codename.

## 1. Vision / métier

L'OS est **une récompense, pas un point de départ** : les PJ n'y accèdent qu'**après avoir
réussi le hack** (résolu à la table, hors app). Le MJ leur « met alors la page sous les mains ».

C'est un **OS impérial simulé**, volontairement **dépaysant** : sous un habillage rétro
(années 90/2000), l'arborescence imite un système **peu familier aux joueurs** (type Unix)
pour les forcer à **fouiller** ou **rechercher**. Techniquement : un **explorateur de fichiers
piloté par de la donnée** — le contenu (arbre + fichiers) est de la donnée, jamais du code.

Deux publics : le **MJ / auteur** (rédige les documents, structure les disques via
`file-system.json`) et les **joueurs** (explorent, lisent ou téléchargent les pièces du scénario).

## 2. Principes gravés (non négociables)

- **Le contenu est de la donnée.** Toute l'arbo vit dans `file-system.json` + les fichiers de
  `public/`. Le composant est un lecteur générique ; changer l'histoire ne touche pas au code.
- **Modèle de fichiers mixte, aucune conversion.** Chaque fichier est servi et **téléchargé dans
  son format d'origine** (`.md`, `.docx`, `.json`, `.ini`, binaires…).
- **Intégrité du puzzle : aucun matériel de déchiffrement dans le bundle.** EmpireOS ne contient
  que du **ciphertext**. Clé, dérivations et phrases de passe s'assemblent **hors app** ; rien de
  tout cela ne doit fuiter via le bundle JS ou les devtools, sous peine de court-circuiter le jeu.
- **Skin impérial, structure Unix dépaysante.** Esthétique rétro-impériale (gris/noir/bleu nuit,
  anguleux, froid, accent cyan hologramme — **pas de vert MS-DOS**) ; la *forme* de l'arbre est
  alien aux joueurs.

## 3. Modèle de fichiers & de disques

**Disques.** La racine liste les **disques** (montages : machine locale + disque(s) réseau) ;
on redescend à la racine pour changer de disque. Chaque disque a son propre arbre. Le document
clé **(d)** — le journal de Tana — vit sur un **disque réseau**, *pas* sur la machine piratée :
aucun verrou logiciel, savoir *où* chercher est l'énigme (résolue à la table).

**Métadonnées par fichier.** `type`/extension pilote l'affichage ; `previewMode` = `full`
(lisible in-app) ou `summary` (aperçu = résumé, lecture = téléchargement) ; `summary` = accroche
rédigée par le MJ ; `transferWeight` = poids pour la durée de transfert fictive.

**Aiguilleur d'affichage (`previewKindFor`).**

| Type | Aperçu in-app |
|---|---|
| `.md` | Markdown rendu |
| Texte système (`.json`, `.ini`, `.config`, `.log`, `.txt`) | **texte brut** échappé (canal de fouille) |
| `.docx` & docs riches | `previewMode:'full'` → **rendu inline (mammoth)** ; sinon **mode `summary`** |
| image (png/jpg/gif/webp/bmp/svg) | **rendue inline** (`<img>`) |
| autre binaire | **« Impossible de prévisualiser »** → téléchargement uniquement |

## 4. État livré (archive)

**93 tests, build OK.** Une ligne par capacité ; le détail vit dans l'historique git.

- **Navigation** Unix (`..`, chemins relatifs/absolus, normalisation) + prompt cohérent
  (`sienar:/user-51394345/home$`).
- **Multi-disques** : racine = sélecteur ; disque = nœud `type:'disk'` navigable, non
  sélectionnable ; atterrissage piloté par `defaultPath`.
- **Aperçu par type** (`previewKindFor`) : Markdown · texte brut · image inline · `.docx`
  résumé **ou** rendu inline **mammoth** (import dynamique, code-split) · binaire · **loader**
  au premier rendu.
- **Sélection source-unique** + téléchargement **ZIP binaire-safe** (lecture `blob()`, test
  d'intégrité binaire par relecture du ZIP).
- **Popin d'attente** du transfert : durée fictive bornée **[15 s, 20 min]** =
  `(base 10 + Σ transferWeight + jitter±20%) × facteur_qualité × facteur_alerte`, barre sur
  horloge injectée, **annulable** (abort, aucun fichier). Réglages MJ (`connectionQuality` /
  `alertLevel`) lus depuis `file-system.json`. Cœur : `transfer.js` + `transfer-duration.js`.
- **Recherche de fichiers** : récursive, insensible **casse+accents** (`fold` longueur préservée),
  dans un **dock inférieur à onglets** (`BottomDock.vue`). Résultats cliquables avec chemin,
  compteur typé, surlignage `<mark>` de la liste courante (distinct de la sélection cyan),
  élargissement **dossier→disque→`/`**, **Ctrl+F**/Échap, query préservée à la navigation.
  Cœur pur : `search.js`. Onglets **Console** / **Session** = coquilles prêtes.
- **Skin impérial** : palette CSS centralisée (`index.html :root`), chrome (barre de titre :
  logo `#` **Star Jedi**, nom OS, version, build **20 AFE**, **horloge de session** ; barre de
  statut : licence), angles nets, responsive (chrome condensé <640px). Identité pilotée par
  `os-identity.js`.
- **Icônes par type** ; **tri** disques/dossiers avant fichiers (stable, ordre d'auteur préservé).

**Qualité.** Outillage à jour (vite 8, vitest 4, jsdom/test-utils). Revues thermo-nucléaires :
transfert extrait dans `transfer.js`, recherche isolée dans `search.js` + dock présentationnel,
`loadFileSystem` sans faux arbre en dur. **Dépendance morte `@xterm/xterm` retirée.**

## 5. Prochains jalons

### 5.1 — Contenu réel *(chemin critique — actuellement bloqué)*
Rédiger les **vrais fichiers** en quantité et remplacer les données de démo par une **arbo Unix
dépaysante** avec dossiers/fichiers **leurres**, le **disque réseau** de Tana et le vrai **journal
(d)**. **Bloqué** : le contenu narratif n'est pas encore disponible. L'app tourne sur des données
de démo (2 disques) en attendant. *Rien à coder côté app tant que le contenu n'est pas prêt.*

### 5.2 — Back-office MJ temps réel *(premier jalon actionnable)*
2ᵉ page (URL connue du seul MJ) pour régler **en live** `connectionQuality` / `alertLevel`.
Le MJ étant sur un **poste séparé**, deux navigateurs ne partagent aucun état → **exige un store
temps réel** (Supabase/Firebase, gratuit). Conséquence assumée : **l'app cesse d'être statique.**
Le popin lit déjà via un store de session, donc la bascule de source sera localisée.
*Décisions à trancher au démarrage : Supabase vs Firebase ; schéma de session ; auth de la page MJ.*

### 5.3 — Immersion « big brother » (onglets du dock)
- **Console** : logs rouges façon *« l'Empire vous protège du chaos »*.
- **Avertissement de session** : au-delà de **2 h** d'horloge de session, un warning défile dans
  la console (s'appuie sur l'horloge existante).
- **Indicateur de niveau d'alerte** : dès `alertLevel > 0`, badge dans le chrome (libellé
  minimal→war, teinte montante jusqu'au rouge impérial).

### 5.4 — Plus tard / parqué
- **Recherche dans le contenu** des fichiers texte / descriptions (v2 de la recherche).
- **Options popin** : rendu **non-linéaire** (débit qui fluctue, paliers, « reconnexion au
  nœud relais… »), **échec narratif** (« CONNEXION PERDUE — 73 % », MJ-only, retryable).
- **Droïde Bafouille** : programme diégétique d'aide au déchiffrement, actif **seulement si les PJ
  sont corrects avec lui**. À écrire ultérieurement.
- **Page éditeur / générateur MJ** : rédiger/structurer les disques depuis l'app (voir §6).

## 6. Décisions encore ouvertes

- **Back-office temps réel — choix du backend** : Supabase vs Firebase ; modèle d'auth de la page
  MJ ; forme du store de session partagé. *À trancher au démarrage du jalon 5.2.*
- **Page éditeur MJ** : route dans *cette* app (ex. `/forge`) ou outil séparé ? « Plusieurs
  tentatives de hacking » = configs qui **varient** d'une tentative à l'autre (anti méta-jeu) ou
  simple édition de confort ? *À trancher quand/si.*
- **Configs séparées par disque** : un `file-system.json` par disque plutôt qu'un fichier unique.
  *Non prioritaire tant que le volume de contenu ne l'impose pas.*

## 7. Contexte narratif lié *(hors périmètre app, pour mémoire)*

- **Le journal (d)** : liste de messages que des clients ont payé pour envoyer illégalement. La PNJ
  **Tana** y a caché, sous **faux alias clients**, du renseignement sur la **flotte de l'Executor**
  en constitution (an **1 ABY**). Deux colonnes — **message** et **destinataire** — sont
  **chiffrées AES-128**, avec **la même clé dérivée de deux façons différentes**. Les fausses
  entrées, une fois déchiffrées, disent « message intercepté » / « position de la flotte ».
- **Chaîne d'énigme (à la table)** : apprendre l'existence de l'info → localiser (d) sur le disque
  réseau du poste de Tana → identifier les clients à extraire → comprendre le chiffrement et
  récupérer clé + dérivations + phrases de passe (une par colonne) → hacker l'OS (déblocage
  d'EmpireOS) → télécharger (d) → déchiffrer.
- **Bafouille** : droïde laissé par Tana (en fuite). Aide au déchiffrement, **mais seulement si les
  PJ sont corrects avec lui et ne médisent pas de Tana**.
- **(d) doit rester un `.docx` éditable** : le MJ le produit via Claude.ai / Google Docs (éditable
  partout), et les PJ voudront l'éditer pour extraire les vrais clients. Format riche requis
  (en-tête/pied, page de garde, sommaire, tableau) — d'où (d) en **`.docx` natif**, pas généré
  depuis du Markdown.
