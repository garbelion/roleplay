# EmpireOS — Roadmap & décisions de conception

> Accessoire narratif diégétique pour le scénario Star Wars *Birth of the Death Squadron*.
> Ce document fait autorité sur la direction produit. Le `readme.md` décrit l'état livré ;
> ici on garde le **cap**, les **décisions gravées** et les **questions encore ouvertes**.

## 1. Vision / métier

> Nom in-fiction : **Sienar Imperial Terminal** ; `EmpireOS` / `empire-os` reste le codename du projet.

L'OS est **une récompense**, pas un point de départ : les PJ n'y accèdent qu'**après avoir
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
| `.docx` & docs riches | `previewMode: 'full'` → **rendu inline (mammoth)** ; sinon **mode `summary`** (téléchargement forcé) |
| image (type connu : png/jpg/gif/webp/bmp/svg) | **rendue inline** via `<img>` |
| autre binaire | **« Impossible de prévisualiser ce contenu »** → téléchargement uniquement |

## 4. État livré (voir `readme.md` pour le détail)

**Fonctionnel** (93 tests, build OK)
- [x] Navigation (`..`, chemins relatifs/absolus, normalisation) + prompt unix cohérent
- [x] **Multi-disques** (racine = sélecteur de disques) + atterrissage `defaultPath`
- [x] **Aperçu par type** (`previewKindFor`) : Markdown · texte brut · image inline ·
      `.docx` résumé **ou** rendu inline **mammoth** (`previewMode: 'full'`) · binaire ·
      **loader** au premier rendu
- [x] **Sélection source-unique** + téléchargement **ZIP binaire-safe** (blob)
- [x] **Popin d'attente** du transfert (durée fictive d'ambiance, annulable) + réglages MJ
      (`connectionQuality`/`alertLevel`) lus depuis `file-system.json`
- [x] **Recherche de fichiers** (récursive, insensible casse+accents) dans un **dock inférieur
      à onglets** (`BottomDock.vue`) : résultats cliquables avec chemin, compteur typé,
      surlignage `<mark>` de la liste courante, élargissement dossier→disque→`/`, **Ctrl+F**/Échap,
      query préservée à la navigation (cœur pur testé dans `src/search.js`)
- [x] **Icônes par type** ; **skin impérial** (palette CSS, logo `#` Star Jedi, horloge de
      session, build 20 AFE, angles nets)

**Technique & qualité**
- [x] **Montée d'outillage** : vite 5→8, vitest 1→4, plugin-vue/jsdom/test-utils à jour ;
      conflit de dépendances résolu (`npm install` propre, sans `--legacy-peer-deps`)
- [x] **Revue thermo-nucléaire** : extraction de l'orchestration du transfert dans
      `src/transfer.js` (fin des 5 champs d'instance magiques), `fileUrl` canonique réutilisé,
      dédup des branches d'erreur, suppression de code mort / wrapper vestigial, fallback
      `loadFileSystem` sans faux arbre en dur. Recherche : cœur pur isolé dans `src/search.js`,
      dock présentationnel (`BottomDock.vue`), `.hl` hissé en style global.

## 5. Roadmap priorisée *(proposition à valider)*

> Contrainte connue : **la feature « popin d'attente » n'est pas la priorité n°1.**
> Le chemin critique, c'est rendre le cœur du scénario jouable (atteindre et extraire **(d)**).

**Chemin critique — cœur jouable**
1. **Contenu réel + arbo Unix dépaysante + leurres** — rédiger les vrais fichiers en quantité,
   remplacer la structure de test par une arbo alien avec dossiers/fichiers de diversion.
   le contenu n'est pas disponible pour l'instant, feature en pause. 
2. **Multi-disques** — racine = sélecteur de disques ; ajouter le **disque réseau** (poste de Tana)
   où vit **(d)**. *Prérequis narratif, pas du polish.*
   - ✅ **Capacité livrée** : un disque est un noeud `type: 'disk'` navigable, distinct
     visuellement, non sélectionnable ; navigation dans/hors des disques (tests + build OK).
   - ✅ **Atterrissage piloté par la donnée** (`defaultPath` dans la config) : on arrive sur
     le home de la machine piratée (`/user-51394345/home`). Vérifié en live dans le navigateur.
   - ✅ **Données de démo** : arbo UNIX-ish à 2 disques (`user-51394345` machine de Tana +
     `srv-transmissions` disque réseau où vit le journal placeholder).
   - ✅ **En-tête cohérent** : le prompt affiche un chemin unix (`EmpireOS:/user-51394345/home$`),
     plus de préfixe DOS `C:\EmpireOS\` ni de backslashes. (L'habillage visuel complet reste au
     point 5.)
   - ⏳ **Reste** : configs séparées par disque — **non prioritaire**, on garde un seul
     `file-system.json`.
3. **Aiguilleur d'affichage par type + mode `summary`** — texte brut pour les configs, « aperçu
   impossible » pour les binaires, **`summary` pour (d)**.
   - ✅ **Livré** : `previewKindFor` aiguille l'ouverture — `.md`→Markdown, texte système
     (`.json/.ini/.config/.log/.txt`)→brut (échappé, pas de `v-html`), **image d'un type connu
     (png/jpg/gif/webp/bmp/svg)→rendue inline via `<img>`**, docs riches
     (`.docx…`)/`previewMode:'summary'`→résumé + invite au téléchargement, binaire→« impossible
     de prévisualiser ». Métadonnées `previewMode`/`summary` dans la config. Mode summary
     vérifié en live. 58 tests, build OK.
   - ⏳ **Ouvert** : rendu **mammoth.js** inline des `.docx` (parqué, point 8).
4. **Correctif téléchargement en blob + download `.docx` réel** — *voir §6 (must-fix)*.
   - ✅ **Livré** : le téléchargement lit chaque fichier en `blob()` (au lieu de `.text()`)
     avant de l'ajouter au ZIP → `.docx`, images et binaires ressortent **intacts**. Test de
     non-régression : on relit le ZIP produit et on compare les octets à l'original. 59 tests.

**Immersion & tension**
5. **Skin impérial** — palette, chrome d'ambiance (version / révision / licence / horloge), lignes
   angulaires et froides. *(Indépendant : peut avancer en parallèle ; forte valeur « produit ».)*
   - ✅ **Livré** : palette impériale centralisée en variables CSS (`index.html :root` :
     noir bleuté, ardoise, acier froid, accent cyan hologramme, rouge impérial), angles nets,
     majuscules/letter-spacing. Chrome : barre de titre (nom OS + version + build + horloge)
     et barre de statut (licence). Vert MS-DOS abandonné.
   - ✅ **Renommage** : l'OS s'appelle **Sienar Imperial Terminal** (piloté par
     `src/os-identity.js`, changeable en une ligne). Prompt en forme courte :
     `sienar:/user-51394345/home$`.
   - ✅ **Datation impériale** : `build` = **20 AFE** (*After the Formation of the Empire*,
     canon — an 0 = fondation de l'Empire en 19 av. BY ; le scénario en 1 ABY = 20 AFE).
   - ✅ **Horloge de session** : durée écoulée depuis l'ouverture (le temps in-game n'étant
     pas synchronisable), démarrant à `00:00:00`. Prépare l'avertissement 2 h (cf. point 7).
   - ✅ **Logo & police** : police **Star Jedi** (libre, dafont) ; le caractère `#` rend le
     logo impérial, en tête de la barre de titre. Alignement du chrome corrigé (centrage vertical).
   - Tests : identité + horloge de session + logo + prompt (fake timers). Le reste (couleurs/angles)
     est du CSS non vérifiable en jsdom → validation visuelle.
6. **Popin d'attente à progression bidon (RNG)** — *ambiance pure* : faire poireauter les PJ
   pendant l'« extraction » de leurs précieuses données en milieu hostile. Fausse barre découplée
   du vrai transfert (le vrai `fetch`+zip tourne en fond ; `saveAs` réel à la complétion ; si le
   vrai est plus lent, on l'attend aussi). **Une popin pour tout le lot.**
   - **Durée (s)** = `(base + Σ poids_fichier + jitter±20%) × facteur_qualité × facteur_alerte`,
     **clampée [15 s, 20 min]**, **retirée au sort à chaque téléchargement** (pas de recalcul en
     cours de route).
     - `base` = 10 s ; `poids_fichier` = métadonnée `transferWeight` par fichier, **défaut 2 s** ;
       `jitter` = ±20 % de la somme.
     - `facteur_qualité` (connexion) : excellente ×0.5 · bonne ×0.8 · moyenne ×1.0 · faible ×1.8 · critique ×3.0.
     - `facteur_alerte` (niveau 0–5 : normal, minimal, major, active-threat, lockdown, war) :
       ×1.0 / 1.3 / 1.8 / 2.6 / 4.0 / 6.5 *(défauts tweakables)*.
   - **Réglages MJ** (`connectionQuality`, `alertLevel`) : lus depuis une **config statique**
     (racine de `file-system.json`) pour le MVP, via un petit **store de session** (pour pouvoir
     basculer la source plus tard). Dépendent de la prépa des PJ + d'un jet d'informatique.
   - **Annulation** depuis la modale = abandon total (AbortController, aucun fichier), relançable.
     Incite à la stratégie (ne pas tout rafler sans regarder).
   - **Sortie** : `saveAs` assumé, habillé « EXTRACTION VERS SUPPORT EXTERNE ». Barre **linéaire**
     au MVP.
   - **Injectables** : horloge + RNG (seed) → durée testable en déterministe.
   - **MVP** : formule + barre bornée + annulation + download réel à la complétion + texte
     diégétique. *Reportés* : échec narratif (« CONNEXION PERDUE — 73 % »), rendu non-linéaire
     (fluctuations/paliers liés à la qualité), câblage vers la console (point 7).
7. **Dock inférieur à onglets (recherche + console) + recherche de fichiers**
   - **Dock bas à onglets** (toujours visible) : onglet **Recherche** (v1) ; **Console** (logs
     rouges « big brother » façon *l'Empire vous protège du chaos ») et **État de session** = onglets
     futurs. Squelette d'onglets construit dès le v1.
   - **Recherche de fichiers** (spec tranchée) :
     - Par **nom**, substring, insensible **casse + accents** (`fold` à longueur préservée).
     - **Récursive** depuis le **répertoire courant** ; si 0 résultat, **proposer** d'élargir au
       **disque courant**, puis à **tous les disques** (`/`).
     - Résultats dans le dock avec **chemin complet**, **cliquables** (→ navigation/ouverture) ;
       **compteur typé** (« 4 fichiers et 2 dossiers correspondent… ») / « Aucun résultat ».
     - **Surlignage** des matches présents dans le répertoire courant : ligne + `<mark>` sur la
       sous-chaîne (état **distinct** de la sélection-download cyan).
     - Query **préservée à la navigation** (résultats/surlignages recalculés pour le nouvel endroit).
     - **Ctrl+F** (écrase le natif) active l'onglet + focus ; **Échap** efface la query. `..` jamais matché.
     - *Plus tard* : recherche **dans le contenu** des fichiers texte / descriptions.
   - **Avancement** : ✅ **recherche v1 complète.**
     [x] `src/search.js` (`fold`, `matches`, `searchTree` récursif, `highlightSegments`, `formatCount`).
     [x] `BottomDock.vue` (onglets Recherche/Console/Session ; panneau recherche : champ, résultats
     avec chemin cliquables, compteur). [x] surlignage liste courante (ligne + `<mark>`, distinct de
     la sélection). [x] élargissement dossier→disque→`/`. [x] Ctrl+F (écrase natif) / Échap ; query
     préservée à la navigation. ~93 tests. *Reste : recherche dans le contenu (plus tard).*
   - **Avertissement de session** : au-delà de **2 h** d'horloge de session, un warning système
     défile dans la **console** (onglet). S'appuie sur l'horloge de session (point 5).
8. **Rendu `.docx` inline (mammoth)** — ✅ **livré** : un `.docx` avec `previewMode: 'full'` est
   rendu inline (mammoth docx→HTML) ; sinon il reste en **`summary`** (le journal (d) verrouillé
   garde son téléchargement forcé). Mammoth **importé dynamiquement** (code-split, chargé à la
   demande). TDD sur un vrai `.docx` minimal (fixture OOXML via JSZip) + garde summary. 77 tests.
9. **Icônes par type** — ✅ **livré** : glyphe monochrome (`iconFor`) devant chaque entrée
   (disque ▤, dossier ▸, markdown ≡, texte ⚙, image ▦, doc riche ◈, binaire ▪).


**Plus tard / parqué**
- Recherche avancée (contenu, multi-disques).
- Interface MJ **Page éditeur** (voir §7 — G) fonctionnalités pour faire intervenir le droid Bafouille et aider les PJ.

**Backlog UX / responsive**
- [x] **En-tête en mode mobile** : chrome condensé sous 640px (secondaire masqué : tagline,
      version·build ; nom tronquable ; licence masquée sous 380px).
- [x] **Tri des entrées** : dossiers/disques **avant** les fichiers (tri stable, ordre d'auteur
      préservé dans chaque groupe ; `..` en tête). *Note : pas d'alphabétique imposé — le MJ garde
      la main ; à basculer en alpha si souhaité.*

**Backlog technique**
- **Retirer `@xterm/xterm`** : dépendance morte (seul son CSS est importé dans `main.js`, aucun
  terminal utilisé — décision « pas de terminal »). Supprimer l'import + la dépendance.

## 6. Must-fix technique (à traiter avec le download `.docx`)

Le téléchargement actuel fait `await response.text()` puis `zip.file(name, text)`. `.text()` décode
les octets en UTF-8 → **corrompt tout binaire** (`.docx` inclus, qui est un zip de XML). Correctif
uniforme (le blob marche aussi pour le texte) :

```js
const blob = await response.blob()
zip.file(filename, blob)
```

✅ **Fait** (point 4) : le download lit en `blob()` ; test d'intégrité binaire (relecture du ZIP).

## 7. Décisions encore ouvertes

### Popin d'attente RNG (feature 6)
✅ **Tranché** — spec complète au **point 6** (§5). Résumé : ambiance pure, formule bornée
[15 s, 20 min], réglages MJ en config statique (MVP), annulation, injectables.

**Avancement MVP (TDD)** — ✅ **MVP terminé** :
- [x] Formule de durée (`src/transfer-duration.js`) + tests unitaires (`tests/transfer-duration.spec.js`).
- [x] Popin d'attente : barre sur horloge injectée (`rng`/`Date.now` injectables), complétion →
      `saveAs` réel ; le vrai ZIP se construit en fond (`buildZip`, AbortController). Tests download
      existants adaptés au nouveau flux.
- [x] **Annulation** : bouton + `cancelTransfer()` (abort du fetch, pas de `saveAs`, popin fermée) + test.
- [x] **Config MJ** : `connectionQuality`/`alertLevel` lus depuis `file-system.json` (racine `session`)
      dans `sessionConfig`. Défauts `moyenne`/`0` si absent.

**Reste (hors MVP)** : options popin (rendu non-linéaire, échec narratif), affichage du niveau
d'alerte dans l'OS, back-office MJ live (dépendance backend). Voir plus bas.

### Back-office MJ + synchro temps réel *(nouvelle feature — dépendance backend)*
Une **2ᵉ page** (URL connue du seul MJ) pour régler **en live** `connectionQuality` / `alertLevel`.
Le MJ étant sur un **poste séparé**, deux navigateurs sur deux machines ne partagent aucun état :
ça **exige un store temps réel** (Supabase/Firebase recommandé, gratuit) → l'app **cesse d'être
statique**. À décider avant de l'implémenter. Le popin (point 6) lit déjà via un store de session,
donc la bascule de source sera localisée.

### Affichage du niveau d'alerte dans l'OS *(nouvelle feature)*
Dès `alertLevel > 0`, un indicateur d'alerte s'affiche dans le chrome (barre de statut / titre),
avec le libellé du niveau (minimal → war) et une teinte montante (jusqu'au rouge impérial).

### Options popin *(reportées)*
Rendu **non-linéaire** (débit qui fluctue, paliers qui stagnent, « reconnexion au nœud relais… »),
d'autant plus marqué que la connexion est faible. **Échec narratif** (« CONNEXION PERDUE — 73 % »),
MJ-only, retryable.

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
