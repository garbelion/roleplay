# Sienar Imperial Terminal (codename `empire-os`)

Accessoire narratif diégétique pour le scénario Star Wars *Birth of the Death Squadron* :
un **OS impérial simulé** que les PJ « piratent » pour découvrir des documents. Sous un
habillage rétro impérial (sombre, froid, anguleux), l'arborescence imite un système
volontairement **dépaysant** (type Unix) pour forcer la fouille.

> **Vision, décisions gravées et suite** : voir **[ROADMAP.md](ROADMAP.md)** (source faisant autorité).
> Le nom in-fiction est **Sienar Imperial Terminal** ; `empire-os` reste le codename du projet.

## Principe

Le contenu est de la **donnée**, jamais du code : toute l'arborescence vit dans
`public/file-system.json` et les fichiers de `public/fichiers/`. Le composant est un lecteur
générique — changer l'histoire ne touche pas au code.

## Stack technique

- **Vue 3** (Options API) — framework
- **Vite 8** — bundler / dev server
- **marked** — rendu Markdown
- **mammoth** — rendu `.docx` → HTML inline (importé dynamiquement, code-split)
- **JSZip** + **FileSaver** — archive `.zip` côté client
- Tests : **Vitest 4**, **@vue/test-utils**, **jsdom** (~77 tests)
- Police **Star Jedi** (libre, dafont) : le caractère `#` y rend le logo impérial

> `@xterm/xterm` figure encore dans les dépendances mais n'est **plus utilisé** (décision « pas de
> terminal ») — à retirer (cf. backlog ROADMAP).

## Structure

```
empire-os/
├── public/
│   ├── fichiers/            # fichiers réels servis à plat (.md, .docx, .webp, .config…)
│   └── file-system.json     # arbre (disques/dossiers/fichiers) + defaultPath + session (réglages MJ)
├── src/
│   ├── App.vue              # chrome impérial (barre de titre : logo, nom, version, build, horloge de session)
│   ├── components/
│   │   └── FileExplorer.vue # explorateur : navigation, aperçu, sélection, déclenchement du transfert
│   ├── transfer.js          # orchestration du « transfert » (popin d'attente + ZIP réel + saveAs)
│   ├── transfer-duration.js # formule de durée fictive (pure, testable)
│   ├── os-identity.js       # identité de l'OS (nom, version, build 20 AFE, licence) — source unique
│   ├── assets/starjedi/     # police Star Jedi
│   └── main.js
├── tests/                   # FileExplorer.spec.js, App.spec.js, transfer-duration.spec.js…
├── tools/fs-editor/         # éditeur d'arborescence local (MJ) + contrôle de synchro (dev-only)
├── vite.config.js
└── index.html               # palette impériale en variables CSS (:root)
```

## Développement

```bash
npm install        # install propre (deps alignées ; plus de --legacy-peer-deps)
npm run dev        # serveur de dev
npm run build      # build de production
npm run test:unit  # tests (Vitest)
npm run test:coverage
```

## Outil d'édition de l'arborescence (MJ, local)

Pour éditer `file-system.json` et garder `public/fichiers/` cohérent sans manipuler le JSON à la
main :

```bash
npm run fs:editor  # -> http://localhost:5177
```

Éditeur web local (dev-only, `tools/fs-editor/`, sans dépendance — hors bundle appli) :

- **Arbre éditable** : **ajouter un disque** à la racine (nom unique), ajouter / renommer / retirer
  un nœud, réordonner (⬆⬇) et **déplacer par glisser-déposer** sur un dossier. Les fichiers vivant à
  plat, déplacer un nœud ne bouge aucun fichier physique — seul l'emplacement logique change ;
  l'invariant à tenir est l'unicité des noms.
- **Contrôle de synchro en direct** : panneau listant **manquants** (déclarés, absents du disque),
  **orphelins** (présents, non déclarés) et **doublons** de noms ; les nœuds fautifs sont surlignés.
- **Messages de propagande** : ajouter / éditer / retirer les slogans (`console.propaganda`) depuis
  le panneau latéral.
- **Enregistrer** (bouton ou `Ctrl+S`) réécrit `public/file-system.json` directement.

Le cœur de comparaison (`fs-sync.js`, `diffFileSystem`) est une fonction pure testée, réutilisée
par le serveur et l'UI pour un diagnostic identique des deux côtés.

## Fonctionnalités livrées

- **Phase d'intrusion** (avant l'accès OS) : simili-console de terminal (chrome EmpireOS) figurant
  l'effraction réseau, **non interactive mais pilotée en direct par le MJ** depuis `#/mj` (3 jets →
  écrans posables, refus possible, `Reset → boot`) ; la console **accumule l'historique** (récent en
  tête). Contenu en donnée (`file-system.json` › `intrusion`).
- **Horloge de session réglable (MJ)** : le MJ règle une heure de départ (`#/mj`) ; l'horloge
  **démarre à l'entrée dans EmpireOS** et compte le temps écoulé.
- *Prérequis live (Supabase `session_state`) : colonnes `intrusion` (text) et `clock_start` (int).*
- **Navigation** : chemins relatifs/absolus, `..`, normalisation, prompt unix cohérent
  (`sienar:/user-51394345/home$`).
- **Multi-disques** : la racine liste les disques (machine locale + disque réseau) ; atterrissage
  piloté par la donnée (`defaultPath`).
- **Aperçu par type** (`previewKindFor`) : Markdown rendu · texte système brut (échappé) · image
  inline · `.docx` en **résumé** (téléchargement forcé) ou **rendu inline mammoth** si
  `previewMode: 'full'` · binaire « aperçu impossible ». **Loader** pendant le premier rendu.
- **Sélection + téléchargement ZIP** binaire-safe, via une **popin d'attente** (durée fictive
  d'ambiance, décorrélée du vrai transfert, annulable). Réglages MJ (`connectionQuality`,
  `alertLevel`) lus depuis `file-system.json`.
- **Icônes par type** (glyphes monochromes) devant chaque entrée.
- **Skin impérial** : palette sombre/froide (variables CSS), chrome (logo `#`, nom, version,
  build **20 AFE**, **horloge de session**), angles nets.

## Modèle de données (`file-system.json`)

- Racine : `children` (disques `type: 'disk'` / dossiers `type: 'directory'` / fichiers `type: 'file'`),
  `defaultPath` (point d'entrée), `session` (`connectionQuality`, `alertLevel`).
- Par fichier : `previewMode` (`full` | `summary`), `summary` (accroche), `transferWeight`
  (poids de durée du transfert, défaut 2 s).

## Qualité / méthodo

Développement en **TDD** (rouge → vert), refactor guidé par revue de code (extraction de
`transfer.js`, dédup, suppression de code mort). Le contenu narratif et l'intégrité du puzzle
(aucun matériel de déchiffrement dans le bundle) sont détaillés dans la ROADMAP.

## Déploiement

Hébergement **statique** (Netlify / Vercel / GitHub Pages) : `npm run build`, puis publier `dist/`.
Le chunk `mammoth` (~0,5 Mo) est chargé **à la demande** (uniquement à l'ouverture d'un `.docx`
en aperçu inline).
