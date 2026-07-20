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
`fs-sync.js` (`diffFileSystem`, cœur pur testé) ; opérations pures dans `fs-ops.js`
(`addDisk`/`addFile`/`addDirectory`/`setCritical`…). Un fichier peut être marqué **critique**
(`isCritical`, badge + bascule ☆/✪) = pièce que les PJ doivent télécharger (mise en avant par l'aide
Bafouille). Gère aussi les
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
  propagande d'ambiance sur timer (`propaganda.js`, pool MJ), ligne
  d'amorçage « SESSION OUVERTE », teinte montant avec `alertLevel`. Onglet **Session** = état
  temporel de la connexion (`SessionPanel.vue`).
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
  (`session-log.js`, store réactif capé, **horodaté à l'heure in-game**). Sources :
  **surveillance** des actions (ouverture/navigation/extraction/annulation), **propagande**
  d'ambiance sur timer (`propaganda.js`, pool en donnée MJ `console.propaganda`, cadence qui se
  resserre avec l'alerte), **lignes système** (ligne d'amorçage). Couleur par
  nature (surveillance cyan, propagande/alerte rouge) et **teinte de la console montant avec
  `alertLevel`**. Console **récent-d'abord**, onglet **par défaut**, ligne d'amorçage
  « SESSION OUVERTE », et **notifications OS 5 s** pour tout message non-surveillance
  (`notifications.js`). ~40 tests dédiés.
- ✅ **Badge d'alerte dans le chrome** livré via la **slice 3 du back-office** (§5.2) : barre de
  titre, libellé `ALERT_LABELS`, teinte montante, piloté par le store réactif (source unique).

### 5.4 — Phase d'intrusion (amorçage « shell ») *(livré — prérequis live : colonnes Supabase `intrusion`, `clock_start`)*
Séquence diégétique **façon shell** jouée **avant** l'accès à EmpireOS, figurant l'effraction sur le
réseau. **Non interactive côté joueur, réactive au MJ** : le hack se résout à la table (**3 jets de
dé**) ; à chaque jet le MJ **pose l'écran correspondant** depuis `/mj`, poussé en Realtime. Réutilise
le back-office (§5.2) : nouvelle donnée de session, même tuyau que `alertLevel`.

**Modèle** — état partagé = **une énumération d'écrans** (un refus n'est pas un événement fugace :
c'est un **écran de repos** où les joueurs restent jusqu'au clic suivant) :
`boot → public_ok | public_refus → interne_ok | interne_refus → os | os_refus`.
Les 3 jets : **firewall extérieur** (réseau public de Kessel-Tho) → **réseau interne** → **localiser
`user-51394345` + entrer**. **Chaque jet peut échouer à l'écran** (y compris le dernier). `os` =
accès accordé → bascule sur `FileExplorer`.

**Décisions actées (grilling)** :
- **Un seul écran partagé** à la table (pas de synchro multi-device).
- **Contrôle libre** depuis `/mj` : le MJ pose **n'importe quel écran** (correction live / retour arrière).
- **Animation au changement d'état seulement** ; au chargement/refresh, **saut direct à l'écran de
  repos** (pas de replay du boot).
- **Aucune logique dans l'app** : ni compteur de tentatives, ni règle de re-jet — tout reste à la
  table. L'app **affiche** l'écran posé, point.
- **Alerte découplée** : un refus **n'incrémente pas** `alertLevel` automatiquement (le MJ le règle à
  la main ; trop d'échecs = sa décision, pas de couplage magique).
- **Reset explicite** : bouton `/mj` « **Reset → boot** » (jamais d'auto-reset ; `session_state`
  persiste, sinon les joueurs rechargeraient direct dans l'OS).

**Contenu (donnée, éditable via `fs:editor`)** : par étape `{ lignes: [...], banniere, refus: [...] }`
+ **nom de station en donnée** (« Kessel-Tho »). Skin cohérent (froid, **pas de vert MS-DOS**).

**Implémentation (slices TDD)** :
1. ✅ **Store + mapping** : `intrusion` dans `sessionState` (défaut `'boot'`), `setSessionConfig`
   piloté par les clés de `DEFAULT_SESSION` ; colonne `intrusion` dans `mapRow`/`toRow` +
   `SESSION_COLUMNS` (source unique du `select`, dédupliquée entre `supabase-source` et `supabase-mj`).
2. ✅ **Modèle de contenu** : bloc `intrusion` dans `file-system.json` (`{ station, screens }`,
   un écran `{lignes, banniere}` par état) + helper pur `intrusion.js` `intrusionScreen(intrusion,
   state)` → écran interpolé (`{station}` = source unique) ou `null`.
3. ✅ **`IntrusionShell.vue`** : **console unique qui accumule l'historique** — un bloc par
   transition d'état, affichés **anti-chronologiquement** (le plus récent en tête, façon terminal
   qui défile) ; seul le nouveau bloc défile (les précédents figés/estompés), amorçage au repos au
   chargement ; teinte `refus` **par bloc** (`isRefus`). Les **bannières de phase** sont rendues
   comme des **lignes de console en encadré box-drawing** `┌┐└┘` (`asciiBanner`), pas un bandeau CSS.
   Présentation : **fenêtre de terminal centrée sur fond noir**, barre de titre reprenant le
   **chrome EmpireOS** (logo impérial `#` Star Jedi, nom, version/build) + station. *(Retours de test : ne plus remplacer l'écran à chaque
   changement ; rendu moins artificiel via une simili-console centrée, cohérente avec l'OS.)*

**Horloge de session réglable (MJ).** Champ de session `clockStart` (secondes, colonne `clock_start`) :
le MJ règle une **heure de départ** (`#/mj`, format HH:MM:SS) ; l'horloge **démarre à l'entrée dans
EmpireOS** (ancrée sur la bascule `intrusion → os`, pas au chargement) et **compte le temps qui
passe**. Piloté par le store réactif (même tuyau Realtime), affiché dans le chrome de l'OS.
4. ✅ **Routage `App` + propriété de session** : `App` devient l'hôte persistant — fetch de
   `file-system.json`, application des réglages de session, **connexion live** (remontée de
   `FileExplorer` : elle doit survivre à la bascule intrusion ⇄ OS) — puis route `IntrusionShell`
   tant que `intrusion !== 'os'`, sinon l'OS (`FileExplorer`). **Gate d'amorçage** : rend l'écran
   seulement après le premier settle (`connectSupabaseSession().ready`, borné) → le shell naît à
   l'état courant, pas de replay au refresh. *Dette assumée : `file-system.json` fetché aussi par
   `FileExplorer` (arbre) — servi par le cache, correctif disproportionné.*
5. ✅ **Contrôles `/mj`** : section « Phase d'intrusion » dans `MjPanel` — un bouton par écran
   (`INTRUSION_SCREENS`, contrôle libre, clic = push immédiat via `updateState`), écran courant
   surligné, écrans d'échec teintés, + **Reset → boot**.

*Prérequis hors-code (pour le live) : ajouter la colonne `intrusion` (text, défaut `'boot'`) à la
table Supabase `session_state`. Tout est codable/testable avec le client mocké en attendant.*

### 5.5 — Plus tard / parqué
- **Déconnexion forcée par le MJ** : action `/mj` pour **éjecter le joueur de l'OS** à volonté.
  *Partiellement couvert* : §5.6 livre l'**écran de coupure** « SESSION EXPIRÉE » et la **déconnexion
  auto à 2 h** ; le **contrôle libre** de §5.4 permet déjà de reculer l'état d'intrusion (= éjection vers
  le shell). Reste à décider si on veut un **bouton MJ explicite** de coupure immédiate (réutilisant
  l'écran existant) en plus de l'échéance auto.
- **Recherche dans le contenu** des fichiers texte / descriptions (v2 de la recherche).
- **Options popin** : rendu **non-linéaire** (débit qui fluctue, paliers, « reconnexion au
  nœud relais… »), **échec narratif** (« CONNEXION PERDUE — 73 % », MJ-only, retryable).
- **Droïde Bafouille** : *intervention livrée* (§5.6, popin MJ des fichiers critiques + voix en donnée).
  Reste à écrire : l'**aide au déchiffrement** proprement dite, active **seulement si les PJ sont
  corrects avec lui** (logique conditionnelle / dialogue).
- **Éditeur de *contenu* MJ in-app** : rédiger les documents depuis l'app (voir §6). *La
  **structure** des disques est déjà couverte hors app par `fs:editor` (§3) ; ne reste ici que la
  rédaction du contenu.*
- **Dette technique — décomposer `FileExplorer.vue`** *(revue thermo)* : god-component (~770 lignes)
  qui mêle navigation d'arbre, **modale d'aperçu** (`openedFile`/`fileContent`/`previewKind`/
  `previewLoading` + `loadFileContent` + template + CSS modale), orchestration du transfert/ZIP,
  câblage recherche et log de surveillance. **Code-judo** : extraire un **`FilePreviewModal.vue`**
  (retire ~250 lignes + une responsabilité entière), FileExplorer ne gardant que « quel fichier
  ouvrir ». **Bloqué par le couplage des tests** : `FileExplorer.spec.js` (1309 lignes) accède ~28×
  à `vm.openFile`/`vm.fileContent`/`vm.openedFile` — l'extraction casse ces tests, à migrer vers des
  assertions **niveau DOM** (`.file-modal`, `.modal-content`). À faire **MJ dans la boucle** (rendu
  vérifiable dans l'app), pas en autonomie. *(Déjà fait en revue : `previewKindFor` → `file-preview.js`
  pur, `formatSessionTime`/`formatHeure` → `session-clock.js`, helper `withBusy` dans `MjPanel`.)*

### 5.6 — Onglet Session, horloge in-game & aide Bafouille *(livré)*
Lot de features autour du **temps de session** et de l'**aide au déchiffrement** (Bafouille).

**Décisions actées (cadrage)** :
- **Déconnexion auto à 2 h** : à l'échéance, l'app **éjecte les joueurs de l'OS** (pas seulement un
  avertissement). Rejoint la « déconnexion forcée » parquée en §5.5.
- **Date d'ouverture = heure in-fiction seule** : instantané figé de l'heure réglée par le MJ
  (`clockStart`) au moment de l'entrée dans l'OS ; pas de date calendaire.
- **Popin Bafouille = MJ seul** : persistante, **non fermable par les joueurs** (toggle depuis `/mj`),
  avec une **voix** de Bafouille éditable en donnée + la liste des fichiers **critiques**.

**Implémentation (slices TDD)** :
1. ✅ **Horloge de session ancrée à l'entrée (`session-clock.js`)** : source unique du temps in-game,
   **ancrée sur la bascule `intrusion → os`** (plus au chargement du module). Expose temps écoulé,
   **heure in-game** (`clockStart` + écoulé), **heure d'ouverture** (instantané figé), **temps restant**
   (limite 2 h) et **expiration**. `App` pose l'ancre à l'entrée, la libère à la sortie / au Reset ;
   l'horloge du chrome s'y branche. *(Remplace l'ancrage local `osEnteredAt` de §5.4.)*
2. ✅ **Heure dans les lignes de console** : l'horodatage des lignes du journal (`session-log.js` →
   `BottomDock`) affiche l'**heure in-game** (heure murale narrative, ramenée sur 24 h) au lieu du temps
   de session écoulé — `pushLog` estampille désormais à `heureMs()`.
3. ✅ **Onglet Session + déconnexion auto** : `SessionPanel.vue` (ticker 1 s, lit `session-clock`) remplit
   la coquille du dock — **heure d'ouverture** (figée), **temps écoulé**, **temps restant avant
   déconnexion (2 h)**, **niveau d'alerte**, en **cards** (grille `auto-fit` qui se stacke, confortable
   en wide screen). À l'échéance, `App` **éjecte les joueurs** vers un écran de
   coupure (« SESSION EXPIRÉE ») jusqu'au Reset MJ. *Nettoyage thermo : le seuil 2 h vit désormais dans
   `session-clock` seul ; l'ancien `startSessionWarning` (ancre parallèle) et le wrapper
   `console-ambience` (réduit à un seul émetteur) sont retirés — la propagande est câblée directement.*
4. ✅ **Fichier critique (`fs:editor`)** : ops pures `addFile`/`addDirectory`/`setCritical` dans
   `fs-ops.js` ; l'éditeur demande « critique ? » à l'ajout d'un fichier et expose un **badge + bascule
   ☆/✪** sur chaque fichier (marquage des fichiers déjà présents). Drapeau `isCritical` écrit dans
   `file-system.json`, **seulement si vrai** (JSON minimal).
5. ✅ **Popin Bafouille** : champ de session `bafouille` (bool, colonnes/mapping `supabase-source`,
   défaut `false`), **toggle depuis `/mj`** (poussé en Realtime) ; popin persistante `BafouillePopin.vue`
   (**non fermable par les joueurs**) listant les fichiers **critiques** par **chemin calculé**
   (`collectCriticalFiles`, `file-tree.js`) + **voix de Bafouille** éditable en donnée (`bafouille.message`).
   Rendue **dans l'OS** seulement, pilotée par le store réactif. **Habillage rebelle** (blanc/orange
   Alliance, insigne *starbird* stylisé original) — Bafouille n'est pas un ami de l'Empire. En plus de
   la liste, l'intervention active **surligne les fichiers critiques dans l'OS** (pourtour orange,
   `.bafouille-critical` dans `FileExplorer`). Palette rebelle canonique dans `index.html :root`
   (`--rebel*`). *Prérequis hors-code : colonne `bafouille` (bool, défaut `false`) dans `session_state`.*

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
