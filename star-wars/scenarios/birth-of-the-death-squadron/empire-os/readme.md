# Empire OS - Interface de Hacking

Interface graphique façon MS-DOS pour le scénario Star Wars "Birth of the Death Squadron".

## Description

Cette application web simule un terminal MS-DOS permettant aux joueurs de:
- Naviguer dans un système de fichiers
- Afficher une liste de fichiers .docx
- Ouvrir les fichiers pour consultation
- Sélectionner des fichiers pour téléchargement
- Télécharger les fichiers sélectionnés dans une archive .zip

## Technos

- Vue.js 3: Framework principal
- Vite: Bundler pour un développement rapide
- xterm.js: Émulateur de terminal
- JSZip: Création d'archives .zip côté client
- FileSaver.js: Téléchargement des fichiers

## Structure

empire-os/
├── public/
│   ├── fichiers/          # Dossier pour les fichiers .docx (contenu réel)
│   │   ├── rapport_mission.docx
│   │   ├── ordre_executor.docx
│   │   ├── liste_cibles.docx
│   │   └── protocole_secret.docx
│   └── file-system.json   # Structure des répertoires et fichiers
├── src/
│   ├── components/
│   │   └── FileExplorer.vue
│   ├── App.vue
│   └── main.js
├── tests/
│   └── FileExplorer.spec.js
├── package.json
├── vite.config.js
└── index.html

## Développement

### Installation

npm install

### Lancement

npm run dev

### Build

npm run build

### Tests

npm run test:unit

## Features

- [x] Feature 1: Afficher une liste de fichiers .md (anciennement .docx)
- [x] Feature 2: Naviguer dans les répertoires (avec support de `..` pour remonter)
- [x] Feature 3: Ouvrir les fichiers pour consultation (avec icônes 📄 et contenu Markdown structuré)
- [x] Feature 4: Sélectionner des fichiers pour téléchargement (checkboxes + surlignage synchronisé)
- [x] Feature 5: Télécharger les fichiers en .zip avec JSZip et FileSaver

## Roadmap

La direction produit, les décisions de conception gravées et les questions ouvertes sont
maintenues dans **[ROADMAP.md](ROADMAP.md)** (source faisant autorité).

En bref, les prochains chantiers : contenu réel + arborescence dépaysante, multi-disques (dont
le disque réseau), aiguilleur d'affichage par type de fichier (mode `summary` / téléchargement),
skin impérial, popin d'attente narrative, et console d'ambiance + recherche.

## Détails des Features

### Feature 1: Afficher une liste de fichiers .docx
- Affiche les fichiers `.docx` dans le répertoire courant.
- Style DOS-like appliqué (couleurs vertes, police monospace).
- Tests: 9 tests unitaires.

### Feature 2: Naviguer dans les répertoires
- Navigation via chemins relatifs (`cd Fichiers`).
- Navigation via chemins absolus (`cd /Fichiers`).
- Remontée d'un niveau avec `..` (bouton cliquable dans l'interface).
- Gestion des chemins invalides (ignore et reste dans le répertoire courant).
- Normalisation des chemins (suppression des `/` multiples et finaux).
- **L'élément `..` est affiché dans tous les sous-dossiers pour permettre de remonter à la racine.**
- Tests: 13 tests unitaires (dont 10 spécifiques à la Feature 2).

### Feature 3: Ouvrir les fichiers pour consultation
- Ouverture des fichiers `.docx` en double-cliquant dessus **ou via une icône 📄**.
- **Icônes d'action** :
  - Une icône 📄 est affichée à côté de chaque fichier (pas des dossiers).
  - Clic sur l'icône ouvre le fichier dans une modale.
  - Prêt pour les futures icônes (téléchargement, etc.).
- **Chargement du contenu réel** :
  - Les fichiers `.docx` sont stockés dans `/public/fichiers/` avec un contenu en Lorem Ipsum + détails thématiques Star Wars.
  - Le contenu est chargé dynamiquement via `fetch` et affiché dans la modale.
- Affichage d'une **modale** avec :
  - Le nom du fichier.
  - Le contenu du fichier (chargé depuis le fichier réel).
  - Un bouton de fermeture (X).
- Fermeture de la modale en cliquant à l'extérieur ou sur le bouton X.
- **Les dossiers ne s'ouvrent pas en double-cliquant** (navigation via `changeDirectory`).
- Style DOS-like pour la modale (fond noir, bordures vertes).
- Tests: 11 tests unitaires (8 pour la Feature 3 + 2 pour les icônes).

## TDD

Chaque feature est développée en suivant la méthodologie TDD:
1. Écrire les tests unitaires
2. Voir les tests échouer
3. Implémenter le code minimal pour faire passer les tests
4. Refactorer si nécessaire
5. Commiter avec les tests

## Déploiement

Le projet est déployable sur n'importe quel hébergement statique (Netlify, Vercel, GitHub Pages).

```bash
npm run build
# Puis uploader le contenu du dossier dist/
```

## Contenu des fichiers

Les fichiers `.docx` dans `/public/fichiers/` contiennent un mélange de **Lorem Ipsum** et de **contenu thématique Star Wars** pour une immersion totale dans l'univers du scénario "Birth of the Death Squadron".

Exemples de contenu :
- **rapport_mission.docx** : Rapport d'une mission impériale avec objectifs et résultats.
- **ordre_executor.docx** : Ordre direct de l'Exécuteur (Lord Dark Vador).
- **liste_cibles.docx** : Liste des cibles prioritaires de l'Empire (Luke Skywalker, Leia, etc.).
- **protocole_secret.docx** : Protocole secret de l'Empire avec instructions et codes d'urgence.
