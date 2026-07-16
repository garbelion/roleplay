# EmpireOS — Roadmap & décisions de conception

> Accessoire narratif diégétique pour le scénario Star Wars *Birth of the Death Squadron*.
> Ce document fait autorité sur la direction produit. Le `readme.md` décrit l'état livré ;
> ici on garde le **cap**, les **décisions gravées** et les **questions encore ouvertes**.

## 1. Vision / métier

EmpireOS est **une récompense**, pas un point de départ : les PJ n'y accèdent qu'**après avoir
réussi le hack** (résolu à la table, hors app). Le MJ leur « met alors la page sous les mains ».

C'est un **OS impérial simulé**, volontairement **dépaysant** : sous un habillage rétro MS-DOS
(années 90/2000), l'arborescence imite un système **peu familier aux joueurs** (type Unix/Solaris)
pour les forcer à **fouiller au hasard ou via la recherche**. Techniquement, c'est un
**explorateur de fichiers piloté par de la donnée** — le contenu (arbre + fichiers) est de la
donnée, jamais du code.

Deux publics :
- **le MJ / auteur** : rédige les documents et structure les disques/dossiers (via `file-system.json`) ;
- **les joueurs** : explorent, lisent (ou téléchargent) les documents, pièces du scénario.

## 2. Principes de conception gravés (non négociables)

- **Le contenu est de la donnée.** Toute l'arbo vit dans les `file-system.json` + les fichiers
  de `public/`. Le composant est un lecteur générique ; changer l'histoire ne touche pas au code.
- **Modèle de fichiers mixte, aucune conversion.** Chaque fichier est servi et **téléchargé dans
  son format d'origine** (`.md`, `.docx`, `.json`, `.ini`, `.config`, binaires…).
- **Intégrité du puzzle : aucun matériel de déchiffrement dans le bundle.** EmpireOS ne contient
  que du **ciphertext**. Clé, méthodes de dérivation et phrases de passe s'assemblent **hors app** ;
  rien de tout cela ne doit être accessible via le bundle JS ou les devtools, sous peine de
  court-circuiter le scénario.
- **Skin MS-DOS visuel, structure Unix dépaysante.** L'esthétique est rétro-impériale ; la *forme*
  de l'arbre est alien aux joueurs. Palette impériale (gris / noir / bleu nuit, anguleux, froid) —
  **on abandonne le vert MS-DOS** au profit d'un accent impérial (cyan hologramme / blanc-bleu froid).

## 3. Modèle de fichiers & de disques (cible)

### Disques
- La **racine** liste les **disques** (montages) : machine locale + **disque(s) réseau**.
- On **redescend à la racine** pour changer de disque (root = sélecteur de disques).
- Chaque disque a son propre arbre (idéalement son propre `file-system.json`).
- Le document clé **(d) — le « journal » de Tana — est sur un disque réseau**, *pas* sur la machine
  piratée. Il est visible dès qu'on entre dans ce disque : **aucun verrou logiciel** ; savoir *où*
  chercher est une énigme résolue à la table.

### Métadonnées par fichier (extension légère du modèle)
- `type` / extension → pilote l'affichage.
- `previewMode` : `full` (lisible in-app) | `summary` (aperçu = résumé, **lecture = téléchargement**).
- `summary` : court texte d'accroche rédigé par le MJ (utilisé en mode `summary`).

### Aiguilleur d'affichage (dispatcher par type)
| Type | Aperçu in-app |
|---|---|
| `.md` | Markdown rendu (comportement actuel) |
| Texte système (`.json`, `.ini`, `.config`, `.log`, `.txt`) | **texte brut** (canal de fouille / planque d'indices) |
| `.docx` & docs riches | **mode `summary`** (téléchargement forcé pour lire) ; *mammoth.js inline en option si on y arrive* |
| image | *(à décider — aperçu inline probable)* |
| autre binaire | **« Impossible de prévisualiser ce contenu »** → téléchargement uniquement |

## 4. État livré (voir `readme.md` pour le détail)

- [x] Liste de fichiers, navigation (`..`, chemins relatifs/absolus, normalisation)
- [x] Ouverture en modale, rendu Markdown
- [x] Sélection (checkbox + surlignage, **source unique**) et téléchargement ZIP
- [x] Implémentation revue (revue thermo-nucléaire) : source de sélection unique, reset à la
      navigation, suppression de l'état vestigial

## 5. Roadmap priorisée *(proposition à valider)*

> Contrainte connue : **la feature « popin d'attente » n'est pas la priorité n°1.**
> Le chemin critique, c'est rendre le cœur du scénario jouable (atteindre et extraire **(d)**).

**Chemin critique — cœur jouable**
1. **Contenu réel + arbo Unix dépaysante + leurres** — rédiger les vrais fichiers en quantité,
   remplacer la structure de test par une arbo alien avec dossiers/fichiers de diversion.
   le contenu n'est pas disponible pour l'instant, feature en pause. 
2. **Multi-disques** — racine = sélecteur de disques ; ajouter le **disque réseau** (poste de Tana)
   où vit **(d)**. *Prérequis narratif, pas du polish.*
3. **Aiguilleur d'affichage par type + mode `summary`** — texte brut pour les configs, « aperçu
   impossible » pour les binaires, **`summary` pour (d)**.
4. **Correctif téléchargement en blob + download `.docx` réel** — *voir §6 (must-fix)*.

**Immersion & tension**
5. **Skin impérial** — palette, chrome d'ambiance (version / révision / licence / horloge), lignes
   angulaires et froides. *(Indépendant : peut avancer en parallèle ; forte valeur « produit ».)*
6. **Popin d'attente à progression bidon (RNG)** — *détails encore ouverts, voir §7.*
7. **Console d'ambiance réactive + barre de recherche** — logs qui réagissent aux actions ;
   recherche par **nom, sur le répertoire courant** (v1) | messages en rouge façon big brother "l'Empire vous protège du chaos".
8. Rendu **mammoth.js inline** des `.docx` (si un aperçu fidèle in-app devient souhaitable).
9. icônes par type de fichier.


**Plus tard / parqué**
- Recherche avancée (contenu, multi-disques).
- Interface MJ **Page éditeur** (voir §7 — G) fonctionnalités pour faire intervenir le droid Bafouille et aider les PJ.

## 6. Must-fix technique (à traiter avec le download `.docx`)

Le téléchargement actuel fait `await response.text()` puis `zip.file(name, text)`. `.text()` décode
les octets en UTF-8 → **corrompt tout binaire** (`.docx` inclus, qui est un zip de XML). Correctif
uniforme (le blob marche aussi pour le texte) :

```js
const blob = await response.blob()
zip.file(filename, blob)
```

À implémenter **en TDD** au moment du download `.docx` (ajouter un cas binaire), pas avant.

## 7. Décisions encore ouvertes

### Popin d'attente RNG (feature 6)
- **Critères de durée** : taille/nombre de fichiers ? cran de « tension/hostilité » réglable MJ ?
  type de fichier (un « protocole secret » plus long qu'un rapport) ?
- **Bornes** de durée (ex. 10–40 s ? plus ?).
- **Main du MJ** : bouton caché « forcer complétion » / « déclencher un échec » ?
- **Échec narratif** : le transfert peut-il échouer/s'interrompre (« CONNEXION PERDUE — 73% ») ?
- **Fermeture de la popin** à mi-parcours : annule / continue en fond / attente forcée non fermable ?
- **Dialogue natif `saveAs`** (« Enregistrer sous » Windows) qui casse l'immersion : on l'assume
  ou on met en scène autour ?
- **Testabilité** : horloge + RNG **injectables** (seed) pour tester en déterministe.

### Page éditeur / générateur MJ (G)
- Route dans *cette* app (ex. `/forge`, réservée MJ) ou outil séparé ? — **à trancher quand/si.**
- « Plusieurs tentatives de hacking » : configs **qui varient** d'une tentative à l'autre
  (anti méta-jeu) ou simple édition/régénération de confort ?

### Autres
- Aperçu **image** inline : oui/non.
- Palette impériale : accent exact (cyan hologramme vs blanc-bleu froid).

## 8. Contexte narratif lié (hors périmètre app, pour mémoire)

- **Le journal (d)** : liste de messages que des clients ont payé pour envoyer illégalement. La PNJ
  **Tana** y a caché, sous **faux alias clients**, du renseignement sur la **flotte de l'Executor**
  en cours de constitution (an **1 ABY**). Deux colonnes du tableau — **message** et **destinataire**
  — sont **chiffrées AES-128**, avec **la même clé dérivée de deux façons différentes**. Les fausses
  entrées de Tana, une fois déchiffrées, disent « message intercepté » / « position de la flotte ».
- **Chaîne d'énigme (à la table)** : apprendre l'existence de l'info → localiser (d) sur le disque
  réseau du poste de Tana → identifier les clients à extraire → comprendre le chiffrement et
  récupérer clé + méthodes de dérivation + phrases de passe (une par colonne) → hacker l'OS
  (déblocage d'EmpireOS) → télécharger (d) → déchiffrer.
- **Bafouille** : droïde laissé par Tana (en fuite). Aide au déchiffrement, **mais seulement si les
  PJ sont corrects avec lui et ne médisent pas de Tana**. Programme diégétique **à écrire ultérieurement**.
- **(d) doit rester un `.docx` éditable** : le MJ le produit via Claude.ai / Google Docs (gratuit,
  éditable partout), et les PJ voudront l'éditer eux-mêmes pour extraire les vrais clients. Format
  riche requis : en-tête/pied de page, page de garde avec tableau de suivi, sommaire, tableau —
  ce que le Markdown ne sait pas exprimer, d'où (d) en **`.docx` natif**, pas généré depuis du `.md`.
