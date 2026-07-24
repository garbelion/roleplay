# Relecture finale avant impression — « Signal de Détresse »

Relecture du 2026-07-24, sur les `.docx` du dossier `docs/` (versions disque de 15h50,
sauf `enigmes_signal_detresse.docx` qui était **ouvert dans Word** pendant la relecture —
si des modifications non enregistrées y traînent, elles ne sont pas couvertes).
Contrôle du contenu + rendu PDF page à page (FUSION 16 p., annexes).

Classement : **Bloquant** (à corriger avant d'imprimer) · **À corriger si temps** · **Cosmétique**.

> **Mise à jour 2026-07-24 (après-midi)** : les quatre bloquants sont traités.
> B1 → la grille Polybe est retirée du doc énigmes (référence à l'image externe à la place ;
> la table de correspondance conservée renvoie désormais à cette image, qui fait foi).
> B2 → contenus J141↔J138 et J134↔J131 remis dans le bon ordre. B3 → mention
> `bafouille.exe` supprimée. B4 → plans mis à jour (neuf fenêtres, graffiti du couloir,
> accès DMZ aligné sur le §5, « journal-trésor » partout, + « RépubliqueRetour » recollé).
> Fichiers modifiés non commités ; originaux sauvegardés dans le scratchpad de session.

---

## Bloquant

### B1. Énigme (b) — la table fenêtres/Polybe ne produit pas ORPHELINS
`enigmes_signal_detresse.docx`, « Ordre de lecture des neuf fenêtres ».
La colonne **Polybe** duplique la colonne **Fenêtre**, et ces coordonnées, appliquées à la
grille LOTUS imprimée juste au-dessus, donnent **A-G-Q-S-T-K-C-I-R**, pas ORPHELINS.
Avec la grille telle qu'imprimée (rang 1 = L O T U S, rang 2 = A B C D E, rang 3 = F G H I/J K,
rang 4 = M N P Q R), les positions correctes sont :

| Lettre | O | R | P | H | E | L | I | N | S |
|---|---|---|---|---|---|---|---|---|---|
| (rang, col) | (1,2) | (4,5) | (4,3) | (3,3) | (2,5) | (1,1) | (3,4) | (4,2) | (1,5) |

→ Corriger les deux colonnes de la table (fenêtres allumées **et** Polybe) avec ces
coordonnées, ou refaire la grille. En l'état, un MJ qui dessine la fresque d'après ce
document fabrique une énigme insoluble.

### B2. Journal de nuit (g) — deux paires d'entrées interverties
`g_journal_nuit.docx`. Le journal est antichronologique, mais :
- l'entrée **J138** dit « quart calme après la nuit agitée du 140 » et « suivi du rapport
  d'incident de la nuit du 140 » — le J140 est **postérieur** au J138 ;
- l'entrée **J131** dit « suivi de la panne électrique de la nuit du 133 » — même problème.

Les contenus de **J138 ↔ J141** et de **J131 ↔ J134** ont visiblement été intervertis lors
de la mise en ordre antichronologique. C'est un handout joueur : un joueur attentif le
verra et y cherchera un sens qui n'existe pas.

### B3. `bafouille.exe` ressuscité dans le doc énigmes
`enigmes_signal_detresse.docx`, récapitulatif final : « ils fournissent les paramètres à
Bafouille **(ou à l'outil bafouille.exe fourni par le MJ)** ». Le TODO #7 avait acté la
suppression de l'exécutable ; le FUSION est propre, cette annexe non.

### B4. `plans_station_kessel_tho.docx` — non aligné sur la version finale
Quatre restes d'une version antérieure :
- « **Dix** fenêtres du palais sont allumées » → **neuf** partout ailleurs (et ORPHELINS = 9 lettres) ;
- le carré de Polybe « dissimulé **dans le parterre de fleurs au premier plan** » → la version
  finale le place en **graffiti séparé dans le couloir** (FUSION §4.4 + doc énigmes) ;
- « Accès physique **encore à concevoir** » pour la DMZ → résolu depuis (trois voies, §5 du FUSION) ;
  une mention « à concevoir » dans un document imprimé fait brouillon ;
- le journal y est appelé « **indice (d)** » (deux occurrences + le résumé N0) → contredit
  l'encart « Convention de nommage » du FUSION (le journal-trésor n'est jamais « (d) »).

---

## À corriger si temps

### C1. Double emploi du label « message (0) »
Le FUSION appelle « message (0) » **deux objets différents** : le datapad de la boutique
(§4.1, oriente vers les quatre contacts) et l'annonce du marché noir (« message 0 »,
annexe D, qui amène les PJ à Kessel-Tho). De plus, le **texte complet du datapad n'existe
nulle part** — seulement des bribes citées (« mes lectures du mois », « ma marque là où il
travaille », « mes jeux d'hiver, casier 12-3-20 », le mess). C'est le pivot qui lance
l'enquête : soit rédiger ce handout (quelques lignes suffisent), soit assumer que le MJ
paraphrase — mais alors le dire explicitement.

### C2. Supports matériels des énigmes non fournis
- **(b)** : « Handouts : (1) photo de la fresque…, (2) photo du graffiti-grille » — ces
  images n'existent pas dans le repo. Le MJ devra dessiner la façade 4×5 et la grille
  lui-même (possible avec la table B1 corrigée, mais à savoir avant la séance).
- **(c)** : le doc énigmes donne la ligne centrale des deux solutions, mais pas le
  **lettrage complet des 12 pentaminos** (3×20 = 60 lettres, pièce par pièce). Impossible
  de fabriquer le puzzle physique sans ce gabarit.
- **(d)** : les six annonces sont dans le doc énigmes mais entrelardées des solutions —
  pas de version « bouts de papier » découpable alors que le handout recommandé est
  précisément celui-là.

### C3. Aucun stat-block adverse
Ni le FUSION ni `pnj_signal_detresse.docx` ne donnent de caractéristiques D6 pour
Rennard, Ferrus, Skarn, la garnison ou la corvette. Le FUSION renvoie à des « fiches en
§4.7 » qui n'existent pas (l'encart est descriptif). Le climax peut finir en fusillade :
prévoir au minimum 3-4 lignes de stats pour Rennard et les deux commandos (la FDADV
vierge est là pour ça).

### C4. Contradiction de durée sur le casse
« En bref » : session « ~3-4 h » et « le casse ≈ la durée de la session » ; §5 : « la
fenêtre du casse ≈ la durée de la session **(~2 h de jeu)** ». Deux valeurs différentes,
et la formule d'« En bref » est cryptique tant qu'on n'a pas lu le §5. Suggestion :
« En bref » → « ~3-4 h ; la fenêtre du casse est confortable (~2 h), la vraie pression
vient après ».

### C5. Nombre de joueurs incohérent
« En bref » : **3 à 6** joueurs ; §3 : « toute sous-partie de **4 à 6** de ces profils
forme un groupe jouable ». Trancher (à 3 joueurs, quelles synergies sont indispensables ?).

### C6. Doc énigmes — pièces fixes du pentaminos
« les pièces **U, X et P** ne bougent pas » (texte) vs « **U, X, P, T, V — fixes** »
(table juste dessous).

### C7. Indice d'animation périmé dans `message_initial_tana.docx`
« la redondance “**répond au nom de…** / chez la marchande Doiron” » : l'annonce actuelle
dit « **nommé** Bafouille ». Le FUSION (annexe D) cite correctement ; l'annexe source non.

### C8. Traduction MJ incomplète en annexe D du FUSION
La liste « Le message caché (lignes impaires), en clair » omet deux fragments réels de la
lecture impaire (« Il y a du gros et du très gros cette fois-ci avec ces / impériaux, pas
de négociation possible » et le « possible / que du monde soit intéressé… »). La version
complète et correcte est dans `message_initial_tana.docx` — soit aligner, soit renvoyer
explicitement (« liste partielle, version ligne à ligne dans le doc source »).

### C9. Registre des antennes (h) — signataire des bornes WN
Toutes les interventions WN sont signées **D. Kavarel**, alors que Bissik est « en charge
du réseau interne » (FUSION, PNJ, plans). Un joueur qui recoupe peut s'y perdre. Une
signature « N. Bissik » sur les interventions WN récentes suffirait.

### C10. Citation d'Adrast bancale
`pnj_signal_detresse.docx` : « Kessel-Tho n'est pas Coruscant, **lieutenant-colonel**. » —
Adrast est lieutenant et commande la garnison ; on ne sait pas à qui il parle ni pourquoi
ce grade. Reformuler (ou « caporal », s'il rabroue un subordonné).

---

## Cosmétique

- **Markdown résiduel dans le FUSION** : « le \*Murmure\* au bout de la “rue” » (§5,
  p. 11 — astérisques imprimés, vérifié sur le PDF) ; « Le trésor.\* » (index des
  handouts, §1) ; backticks visibles autour des noms de fichiers (index des handouts,
  encart Convention de nommage, note de fin d'annexe D).
- **« Sensoreurs »** → Senseurs (annexe C, échelle météo, cran Instable — présent aussi
  dans l'archive `.md`).
- **Page 15 quasi vide** : l'annexe C se termine en haut de la p. 15 et l'annexe D ne
  commence qu'en p. 16. Un saut de section à revoir si tu veux économiser une feuille.
- **« Erudition »** sans accent dans les stat-blocks (Dax, Ithra — FUSION et fiches) alors
  que le reste du texte est accentué.
- `d_journal_MJ_dechiffre.md` (interne MJ) : l'en-tête dit encore « Généré par `npm run
  journal:encode` — ne pas éditer à la main » alors que le pipeline a été retiré.
- Bruit du journal-trésor : les clients fictifs « **Renna** Rusk », « **Renard** Karnas »,
  « **Renard** Solveig » frôlent « Renna Calder » (PJ) et « Rennard » (ISB). Si c'est un
  clin d'œil, il fonctionnera surtout comme fausse piste involontaire.

---

## Ce qui est solide (vérifié, rien à faire)

- **Comptes exacts** : 78 lignes au journal-trésor, dont exactement 18 entrées de Tana
  réparties sur les trois alias ; la feuille MJ déchiffrée liste bien ces 18 entrées.
  Tana signe aussi des entrées banales (bon camouflage d'auteur).
- **Clés cohérentes** : RépubliqueRetour = 16 caractères ; JENESUISPLUSSEULEICI = 20
  lettres (ligne centrale d'un 3×20) ; ORPHELINS = 9 lettres = 9 fenêtres ; le rectangle
  3×20 a bien exactement 2 solutions.
- **Le message 0 fonctionne** : la lecture des lignes impaires du handout imprimé donne un
  message caché complet et cohérent (vérifié ligne à ligne), et le double sens
  « impériaux » marche.
- **Toile de fond très cohérente** : les recoupements e/g/h/i/j se répondent presque
  parfaitement (séjours du Long Sillage, de l'Aube Grise, du Vestige et de Marée Basse
  identiques entre e et j ; Étoile Voilée et Perce-Brume alignés entre g et j ; fresque
  signalée en C15 dans h ; pot-de-vin de i raccord avec la « réallocation de fréquences »
  pointée par l'audit f ; la DMZ en « exception positive » dans f justifie le casse).
- **Chronologie FUSION ↔ journal** : les 9 jalons « Ce que révèle le journal » et les 5
  jalons « La station, récemment » correspondent aux documents sources.
- **Fiches pré-tirés** : stats identiques entre FUSION §3 et `pretires_fiches.docx`,
  champs dérivés laissés vides comme prévu, une fiche par page, rendu propre.
- **Mise en page du FUSION** : sommaire complet et paginé, deux colonnes équilibrées,
  encarts et plans schématiques bien rendus, police de titre embarquée OK, en-têtes/pieds
  corrects — aucun tableau coupé constaté sur les 16 pages.
- **Rythme** : horloge à 6 crans avec leviers ± bien branchée sur les tables A/C et le
  climax ; les deux goulots + chrono corvette donnent une fin datée ; les soupapes de
  sacrifice couvrent le « game over ». Rien à redire sur l'enchaînement.
