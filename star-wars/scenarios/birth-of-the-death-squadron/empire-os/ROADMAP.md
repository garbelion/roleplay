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

**Un nœud = `{ name, type, children? }`.** Le **chemin n'est pas stocké** : il est dérivé de la
position dans l'arbre (chaîne des noms d'ancêtres) au chargement (`file-tree.js` `assignPaths`).
La structure fait autorité ; le JSON reste minimal et sans redondance à maintenir.

**Fichiers réels à plat.** Tous les fichiers vivent à plat dans `public/fichiers/`, adressés par
leur **nom de base** (`fileUrl`). L'arbre est purement logique : déplacer un nœud ne déplace aucun
fichier physique. Invariant à surveiller : **unicité des noms** (adressage à plat) + cohérence
arbre ↔ disque.

**Outil d'édition dev-only (`npm run fs:editor`).** Petit serveur Node sans dépendance
(`tools/fs-editor/`) + éditeur web : arbre éditable (ajout de **disque** à la racine, ajout /
retrait / renommage / déplacement drag-and-drop de nœuds), enregistrement direct dans
`file-system.json`, et **panneau de synchro live** — manquants / orphelins / doublons — via
`fs-sync.js` (`diffFileSystem`, cœur pur testé) ; opérations pures dans `fs-ops.js`. Gère aussi les
**messages de propagande** (`console.propaganda`) : ajout / édition / retrait. **C'est l'outil
d'auteur pour la *structure* des disques et la propagande** (tranche §6 : structure = outil séparé,
livré).

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

**132 tests, build OK.** Une ligne par capacité ; le détail vit dans l'historique git.

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
  **sélecteur de périmètre** (dossier / disque / tous les disques) + rappel du chemin résolu,
  **Ctrl+F**/Échap, query préservée à la navigation. Cœur pur : `search.js`.
- **Console « big brother »** : onglet Console (affiché **par défaut**) alimenté par un journal
  de session (`session-log.js`), **plus récents en premier** — surveillance des actions,
  propagande d'ambiance sur timer (`propaganda.js`, pool MJ), avertissement > 2 h, ligne
  d'amorçage « SESSION OUVERTE », teinte montant avec `alertLevel`. Émetteurs regroupés sous
  un handle unique (`console-ambience.js`). Onglet **Session** = coquille prête.
- **Notifications OS** : tout message console **non-surveillance** surgit 5 s en overlay
  (`notifications.js` + overlay `App.vue`), cliquable pour fermer.
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

### 5.2 — Back-office MJ *(premier jalon actionnable)*
2ᵉ page (URL connue du seul MJ) pour régler **en live** `connectionQuality` / `alertLevel`.
Le MJ étant sur un **poste séparé**, deux navigateurs ne partagent aucun état : il faut un
**store partagé joignable par les deux machines**. Choisi : **Supabase Realtime** — le MJ
**écrit** une ligne, les joueurs la reçoivent en **push** (websocket), pas de polling.

**Décisions actées** :
- **Déploiement = URL partagée** ; **app reste un frontend statique** (Supabase est externe).
- **Périmètre MVP** = `connectionQuality` + `alertLevel` **seuls** (le reste au backlog : message
  console à la volée, échec de transfert forcé, verrouillage de l'OS).
- **Service = Supabase Realtime** (push, pas de polling → **aucun quota de requêtes** grillé par
  une page laissée ouverte). Le SDK `@supabase/supabase-js` est **importé en dynamique** (code-split).
- **Config = `session.supabase` dans `file-system.json`** (`{ url, anonKey }`, publics par design) ;
  **absente ⇒ mode 100 % statique inchangé**.
- **Sécurité = RLS** : `anon` en **lecture + subscribe seulement** ; l'**écriture MJ passe par
  Supabase Auth** (un compte MJ, connexion sur `#/mj`) — pas de clé secrète dans le bundle.
- **Page MJ = route `#/mj`** (routage par hash, pas de serveur ; confirmé, pas d'app séparée).

**Backlog (slices TDD)** :
1. ✅ **`session-store.js`** : état de session (`{connectionQuality, alertLevel}`) réactif, défauts
   depuis `file-system.json`, consommé par propagande/console **et** popin de transfert. *Refactor
   iso-comportement — le point d'injection unique des MàJ live.*
2. ✅ **`session-remote.js` + `supabase-source.js` (lecture)** : orchestration vendor-agnostique
   (fetch initial + abonnement Realtime → `setSessionConfig`), adaptateur Supabase (mapping +
   canal), branché dans FileExplorer si `session.supabase` présent. **Non configuré ⇒ statique
   inchangé** ; SDK **code-split**. Source injectée (mockée en test).
3. ✅ **Affichage live** : teinte console **+ badge d'alerte dans le chrome** (barre de titre,
   libellé canonique `ALERT_LABELS` minimal→war, teinte montante + pulse au niveau war) suivent
   le store réactif → réagissent en live à un push. *(Absorbe le « reste » de §5.3.)*
4. ✅ **Route `#/mj`** : routage par hash (`MjPanel.vue`) + connexion MJ (Supabase Auth) +
   formulaire (sélecteurs connexion/alerte, « Appliquer », préremplis). `loadSupabaseClient`
   partagé lecture/MJ ; état « non configuré » si Supabase absent.
5. ✅ **Écriture MJ** (`supabase-mj.js` `updateState`) : `update` de la ligne (id=1) par le MJ
   authentifié — **validé de bout en bout** (login → write → relecture). RLS : `anon` lecture,
   `authenticated` lecture+écriture. Client mocké en test.
6. **(option) Re-tuning live des timers** : cadence propagande redémarre quand `alertLevel` change
   (`watch` → restart). Indépendante ; pour le « tout temps réel » des émetteurs.

**Prérequis hors-code (MJ)** : créer un projet Supabase (free), une table `session_state`
(1 ligne : `connection_quality`, `alert_level`), **activer Realtime** dessus, poser la **RLS**
(SELECT pour `anon`, UPDATE réservé à l'utilisateur authentifié), créer le **compte MJ** (Auth),
noter **URL du projet + clé `anon`**. Tout est codable/testable en **mockant le client Supabase**
en attendant.

### 5.3 — Immersion « big brother » (onglets du dock)
- ✅ **Console v1 livrée** : onglet Console du dock alimenté par un **journal de session**
  (`session-log.js`, store réactif capé, horodaté à l'horloge de session). Trois sources :
  **surveillance** des actions (ouverture/navigation/extraction/annulation), **propagande**
  d'ambiance sur timer (`propaganda.js`, pool en donnée MJ `console.propaganda`, cadence qui se
  resserre avec l'alerte), **avertissements système** (dont le warning **> 2 h**). Couleur par
  nature (surveillance cyan, propagande/alerte rouge) et **teinte de la console montant avec
  `alertLevel`**. Console **récent-d'abord**, onglet **par défaut**, ligne d'amorçage
  « SESSION OUVERTE », et **notifications OS 5 s** pour tout message non-surveillance
  (`notifications.js`). ~40 tests dédiés.
- ✅ **Badge d'alerte dans le chrome** livré via la **slice 3 du back-office** (§5.2) : barre de
  titre, libellé `ALERT_LABELS`, teinte montante, piloté par le store réactif (source unique).

### 5.4 — Phase d'intrusion (amorçage « shell ») *(nouveau — à concevoir)*
Aujourd'hui l'app démarre **après** le hack réussi (l'OS est la récompense). Il manque la **phase
d'entrée** : une séquence diégétique **façon shell** (messages qui défilent) figurant l'effraction
sur le réseau, jouée **avant** l'accès à EmpireOS.

**À trancher (conception) avant tout code** :
- **Rôle** : purement **cosmétique** — animation de récompense du hack **déjà résolu à la table**,
  non interactive (cohérent avec « l'OS est une récompense, le hack se résout hors app »).
  *Défaut recommandé* : toute interactivité rouvrirait un puzzle censé être résolu à la table.
- **Enchaînement** : écran d'amorçage → défilement → bascule **auto** vers l'OS (`defaultPath`).
  Skippable ? rejouable par le MJ ?
- **Contenu** : lignes de boot / scan / *bruteforce* en **donnée** (comme la propagande), rédigées
  MJ ; vitesse de défilement ; skin cohérent (froid, **pas de vert MS-DOS**).
- **Où** : écran monté **avant** `FileExplorer` (bascule par état, pas d'URL).

### 5.5 — Plus tard / parqué
- **Recherche dans le contenu** des fichiers texte / descriptions (v2 de la recherche).
- **Options popin** : rendu **non-linéaire** (débit qui fluctue, paliers, « reconnexion au
  nœud relais… »), **échec narratif** (« CONNEXION PERDUE — 73 % », MJ-only, retryable).
- **Droïde Bafouille** : programme diégétique d'aide au déchiffrement, actif **seulement si les PJ
  sont corrects avec lui**. À écrire ultérieurement.
- **Éditeur de *contenu* MJ in-app** : rédiger les documents depuis l'app (voir §6). *La
  **structure** des disques est déjà couverte hors app par `fs:editor` (§3) ; ne reste ici que la
  rédaction du contenu.*

## 6. Décisions encore ouvertes

- **Éditeur MJ** : la **structure** des disques est tranchée → **outil séparé** (`fs:editor`, §3,
  livré). Reste ouvert pour la **rédaction de contenu** : route dans *cette* app (ex. `/forge`) ou
  extension de l'outil ? « Plusieurs tentatives de hacking » = configs qui **varient** d'une
  tentative à l'autre (anti méta-jeu) ou simple édition de confort ? *À trancher quand/si.*
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
