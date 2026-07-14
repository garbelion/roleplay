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
│   └── fichiers/          # Dossier pour les fichiers .docx
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

- [x] Feature 1: Afficher une liste de fichiers .docx
- [ ] Feature 2: Naviguer dans les répertoires
- [ ] Feature 3: Ouvrir les fichiers pour consultation
- [ ] Feature 4: Sélectionner des fichiers pour téléchargement
- [ ] Feature 5: Télécharger les fichiers en .zip avec progression

## TDD

Chaque feature est développée en suivant la méthodologie TDD:
1. Écrire les tests unitaires
2. Voir les tests échouer
3. Implémenter le code minimal pour faire passer les tests
4. Refactorer si nécessaire
5. Commiter avec les tests

## Déploiement

Le projet est déployable sur n'importe quel hébergement statique (Netlify, Vercel, GitHub Pages).

npm run build
# Puis uploader le contenu du dossier dist/