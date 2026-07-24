# Passation — déploiement `empire-os` sur GitHub Pages

> Document de reprise pour un agent suivant. Rédigé le 2026-07-24.
> Ne duplique pas la doc : voir la section **Déploiement** de [`readme.md`](readme.md) et le
> workflow [`.github/workflows/deploy-empire-os.yml`](../../../../.github/workflows/deploy-empire-os.yml).

## Objectif

Héberger gratuitement l'accessoire narratif `empire-os` (SPA statique Vue 3 / Vite) sur
**GitHub Pages**, servi sous le sous-chemin `https://<user>.github.io/roleplay/`.

## État actuel (fait)

- **Fix « base-aware » livré et poussé sur `origin/main`.** L'appli chargeait ses données par
  chemins absolus (`/file-system.json`, `/fichiers/…`), qui cassent sous un sous-chemin Pages.
  Helper pur `withBase()` ([`src/base-url.js`](src/base-url.js)) + test
  ([`tests/base-url.spec.js`](tests/base-url.spec.js)), câblé dans `fileUrl` (images/docx/ZIP)
  et les 3 `fetch(file-system.json)` (`App.vue`, `components/FileExplorer.vue`, `supabase-mj.js`).
- **Workflow CI** : `npm ci` → tests → `vite build --base=/roleplay/` → publication de `dist/`
  sur push `main` touchant le dossier `empire-os` (ou `workflow_dispatch`).
- **Vérifié** : 281 tests verts (`npm run test:unit -- --run`) ; build de prod OK avec les assets
  ET les données préfixés `/roleplay/`.
- **`vite.config.js` non modifié** (`base: './'`) : `npm run dev`, l'éditeur MJ (`fs:editor`),
  Netlify/Vercel restent intacts ; le base `/roleplay/` n'est passé **qu'au build CI**.

### Note historique (ne pas « corriger »)

À cause d'une session concurrente qui poussait au même instant, le commit qui porte ce
changement empire-os s'intitule **« Ajout des handouts et mise en page sommaire »** (message
trompeur, contenu correct). C'est déjà sur `main` partagé : **ne pas réécrire l'historique**
juste pour le message.

## Reste à faire (RAF)

1. **Activer Pages** (action manuelle, hors CLI) : repo `garbelion/roleplay` → **Settings → Pages
   → Source : GitHub Actions**. Tant que ce n'est pas fait, le job `deploy` du workflow échoue.
   *Le repo doit être **public*** (ou plan GitHub payant) pour Pages. Publier `dist/` est sûr côté
   énigme : aucun matériel de déchiffrement dans le bundle (invariant ROADMAP).
2. **Vérifier le run** : onglet **Actions** du repo → workflow « Deploy empire-os to GitHub Pages ».
   Relancer via *Run workflow* si besoin (`workflow_dispatch`).
3. **Tester en ligne** : `https://garbelion.github.io/roleplay/` (OS joueur) et
   `…/roleplay/#/mj` (back-office MJ).
4. **Supabase** : garder le projet sur l'offre gratuite avec les colonnes `intrusion` (text),
   `clock_start` (int), `bafouille` (bool) de `session_state`, sinon les fonctions live MJ ne
   répondent pas (cf. readme).

## Solutions alternatives (si GitHub Pages est abandonné)

- **Cloudflare Pages / Netlify (recommandé si on veut le plus simple)** : servi à la **racine**
  d'un sous-domaine (`xxx.pages.dev`), donc **aucun `--base` nécessaire** — `npm run build`
  (base `./`) suffit. HTTPS + déploiement git auto inclus. Le fix `withBase` reste inoffensif
  (à la racine `BASE_URL` vaut `/`).
- **GitHub Pages + domaine perso (CNAME)** : sert à la racine du domaine → plus besoin du
  sous-chemin. Nécessite un nom de domaine.
- **free.fr (pages perso)** : techniquement possible (statique + hash-routing, pas de réécriture
  d'URL requise), mais **HTTP seulement** (site « non sécurisé ») et **upload FTP manuel**.
  Déconseillé.

## Pièges connus

- Si le repo est **renommé**, adapter `--base=/<repo>/` dans le workflow.
- Warning au build `"base" option should start with a slash` : **cosmétique** (résidu du
  `base:'./'` du config), sans effet — la sortie est bien en `/roleplay/`.
- `dist/` est **gitignoré** : ne jamais le committer, la CI le régénère.

## Skills suggérés pour la suite

- **`run`** — pour lancer/prévisualiser l'appli en local et confirmer visuellement le rendu
  (dev server ou preview du build).
- **`tdd`** — pour toute nouvelle modif de code (le projet est en TDD strict ; le fix ci-dessus
  a été fait ainsi).
- Rappel process : **relecture avant commit** par Jacques, sauf contre-ordre explicite.
