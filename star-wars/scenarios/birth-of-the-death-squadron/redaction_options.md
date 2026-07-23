# Rédaction — Fusion du scénario « Signal de Détresse » (Kessel-Tho)

Document de travail : décisions, questions ouvertes, hypothèses et suivi de
progression. **But : pouvoir reprendre la rédaction à tout moment.**

Branche de travail : `fusion-scenario-signal-detresse` (jamais sur `main`).

---

## 1. Objectif

Fusionner les documents du scénario en **un seul document neuf**, avec :

- Mise en page **sur deux colonnes**, SAUF page de titre et sommaire (pleine largeur).
- Documents **(d) à (j)** = handouts : **mentionnés mais NON inclus** dans la fusion.
- Structure imposée :
  1. **Présentation** + brève **chronologie des événements**
  2. **Personnages pré-tirés** (TODO côté MJ → simple placeholder)
  3. **Revue des lieux** dans l'ordre de visite probable des PJ ;
     pour chaque lieu : *description · éléments-clés du scénario · plan · PNJ*
  4. **Conclusion** : issues possibles + ouverture vers le futur des PJ

## 2. Livrable

- **Format : Word `.docx`** (décision utilisateur). Deux colonnes natives via
  sauts de section Word ; page de titre + sommaire en pleine largeur.
  Produit via la skill `docx` (docx-js / OOXML).
- Fichier cible : `docs/scenario_signal_detresse_FUSION.docx`.
- **Police de titre Star Jedi embarquée** (demande utilisateur) : couverture,
  « Sommaire » et les 5 titres de section H1 en **Star Jedi** ; H2/H3 restent en
  Calibri (lisibilité). La police est **embarquée dans le .docx** (police OOXML
  obfusquée, algo ECMA-376 : clé GUID 16 octets inversés, XOR des 32 premiers
  octets ; `embedTrueTypeFonts` dans settings.xml). L'embarquement est intégré au
  générateur (`generate_docx.js`, fonction `embedTitleFont`, via `jszip`). Source
  de la police : `empire-os/src/assets/starjedi/Starjedi.ttf` (déjà dans le repo).
  NB : `&` n'a pas de glyphe littéral dans Star Jedi (rendu = petit soleil) → le
  titre §5 a été passé à « Issues possibles **et** ouverture ».

## 3. Décisions utilisateur (validées)

| # | Question | Réponse |
|---|----------|---------|
| Format | docx / pdf / md | **Word .docx** |
| Plans par lieu | schéma généré / texte+placeholder / coupe verticale | **Schéma simple généré par lieu** (stylisé, pas plan d'architecte) |
| `station_kessel_tho_personnel.md` (équipe de nuit, Cap. Vexis Morvay…) | exclure / récupérer / demander | **Récupérer les bonnes idées** et les adapter aux PNJ actuels, SANS reprendre les anciens noms |
| Ordre des lieux | — | **Ordre candidat fourni par l'utilisateur** (voir §5) |

## 4. Sources analysées

**Cœur du scénario (INCLUS dans la fusion) :**
- `docs/enigmes_signal_detresse.docx` → énigmes (a)(b)(c)(d), solutions, animation
- `docs/pnj_signal_detresse.docx` → tous les PNJ (centraux, admin, garnison, service, ISB, équipages)
- `docs/plans_station_kessel_tho.docx` → 5 niveaux (N0→N4), tous les lieux
- `docs/station_kessel_tho_personnel.md` → **brouillon antérieur** (autre prémisse). On n'en récupère QUE des idées de tension/secret réutilisables (voir §7).

**Handouts (d)→(j) : MENTIONNÉS uniquement, PAS inclus :**
- (d) `d_journal_decrypte.docx` / `d_journal_MJ_dechiffre.md` / `journal_complet.json` — le journal chiffré de Tana (18 entrées cachées sur 78). C'est LE trésor.
- (e) `e_note_analyse_trafic.docx` — rapport d'analyse de trafic (Renn Okuda)
- (f) `f_audit_ccs4.docx` — audit sectoriel
- (g) `g_journal_nuit.docx` — journal de bord de nuit (Bregman) : incidents station
- (h) `h_registre_antennes.docx` — registre de maintenance antennes
- (i) `i_correspondance_licence.docx` — correspondance licence (pot-de-vin Kallan)
- (j) `j_manifeste_fret.docx` — manifeste de fret (vaisseaux de passage)
- `enigmes_signal_detresse.docx` (déjà listé, inclus) ; `pnj_signal_detresse.docx` (inclus)

## 5. Ordre de visite des lieux (validé par l'utilisateur)

0. **Quai principal & Capitainerie** (arrivée)
1. **Boutique de Doiron** — message (0)
2. **Centre culturel** — indice (a)
3. **Mess du personnel** — indice (d) [clé maître Argon2 + RépubliqueRetour]
4. **Galerie de maintenance** — indice (b) [ORPHELINS]
5. **Centre sportif** — indice (c) [JENESUISPLUSSEULEICI]
6. **Locaux des ingénieurs / DMZ** — le journal (document d)
7. **Lieux secondaires** (annexe / encarts) : Cantina Le Sas, échoppes (Ossoval,
   Damm, Doss, Vorn), infirmerie, atelier droïdes « Rouages », salle de contrôle
   des transmissions, bureau Kallan, salle de passation, garnison, zone commandos,
   niveaux techniques (réseau élec., recyclage air, bornes WN), locaux désaffectés.

## 6. Synthèse de l'intrigue (pour cohérence rédactionnelle)

- **Lieu** : station-relais impériale **Kessel-Tho** (Bordure Extérieure, route de Kessel), 5 niveaux (N0 technique → N4 communications).
- **Tana Wrey** (humaine, Alderaan, alias **Doiron**), technicienne aux transmissions, a intercepté pendant ses quarts des fragments sur le **Projet Faucheur** = naissance de la **Death Squadron** (sortie de l'*Executor* du chantier de Fondor, ratissage pour trouver une base dissidente ; cf. journal d, cycles 18-19).
- Elle a caché 18 entrées décodées dans le **journal de facturation illégale** de l'administrateur **Kallan** (document d, isolé en **DMZ N0**), sous 3 faux alias alderaaniens : **Ulic Qel-Droma / Liana Merian / Agrippa Aldrete**.
- Les **clés de déchiffrement** sont éparpillées en 4 énigmes physiques ; le droïde **Bafouille** fait les calculs. Personne seul (même Tana) ne détient tout.
- Le supérieur de Tana (**Torvin Aashe**) a eu des soupçons → Tana a pris l'alias Doiron. Elle **teste les PJ** avant de les aider.
- **Menace / compte à rebours** : l'équipe **ISB de l'agent Ivo Rennard** (analyste Sorae Vint + commandos Ferrus & Skarn) ratisse le secteur pour localiser la source de l'interception. Vint retrace le rebond de fréquence = horloge réelle.
- **Point de départ PJ** : boutique de Doiron, où le **message (0)** oriente vers 4 contacts (Maren Estil/culturel, Kavarel/galerie, Grash Meloi/sportif, Kessa Droman/mess).

## 7. Éléments récupérés du brouillon `station_kessel_tho_personnel.md`

Anciens noms NON repris. Idées réutilisables (à réinjecter comme leviers/tensions,
adaptées aux PNJ actuels) — **à valider en rédaction** :
- Principe « faiblesses exploitables » (dette de jeu, sympathie rebelle, trafic de
  médicaments, caméras désactivées) → transposable en leviers sociaux sur PNJ actuels
  (ex. Kallan vénal, Denz corruptible, Lyra Senn discrète, Chessa Vorn sait les dettes).
- Idée d'instabilité des générateurs / panne = isolement temporaire → cohérent avec la
  panne électrique cycle 19 (journal g) : réutilisable comme complication.
- Tensions inter-personnelles entre chefs de service → transposable (Aashe/Kallan, etc.).
> NB : ces idées ne doivent PAS réintroduire l'ancienne prémisse (station de guerre
> électronique Delta-9, décodeur rebelle volé, etc.) qui contredit « Signal de Détresse ».

## 8. Questions ouvertes / ambiguïtés relevées

1. **Collision de la lettre (d)** : dans la source, « (d) » désigne À LA FOIS la 4e énigme
   (annonces du mess) ET le journal chiffré (document d). → **Statut : À TRANCHER**
   (retour utilisateur). La solution v1 (libellés conservés + encart d'avertissement) est
   jugée insuffisante ; option pressentie = renommer le journal « document J » / « journal-trésor »
   pour lever l'ambiguïté à la racine. Voir `TODO.md` #6.
2. **Système de jeu** : **DÉCISION — système D6** (retour utilisateur). Les PNJ et les
   personnages pré-tirés doivent recevoir des stat-blocks D6. *(Remplace l'ancien défaut
   « aucun stat-bloc / description narrative seule ».)* Voir `TODO.md` #1 et #8.
3. **Emplacement du fichier de sortie** : défaut = racine du scénario. À confirmer.
4. **Identité des PJ** : implicitement cellule rebelle / sympathisants ayant capté le signal.
   Non explicité dans les sources → à préciser lors de la rédaction des pré-tirés (`TODO.md` #1).
5. **`bafouille.exe` : ANNULÉ** (retour utilisateur). Supprimer toute mention de l'outil/exécutable
   dans le brouillon ; le droïde Bafouille reste, mais sans référence à un `.exe` fourni au MJ.
   Voir `TODO.md` #7.

## 8ter. Annexes (état)

Section **Annexes** (H1) après la conclusion :
- **A. Événements aléatoires de la station** — table d66 (2 colonnes, TODO #3, fait).
- **B. Handout — Le message initial de Tana (« message 0 »)** — ajout intermède
  utilisateur. **Rendue en section PLEINE LARGEUR** (exception à la mise en page 2
  colonnes, demandée par l'utilisateur) : 4ᵉ section Word, 1 colonne. Contient la
  note MJ (chiffre « Sand/Musset » = 1 ligne sur 2, relais par « le Courtier »,
  message décodé, double sens de « impériaux ») + l'**encadré à imprimer** (police
  Consolas, liseré rouge/fond parchemin). Source détaillée : `docs/message_initial_tana.docx`.
- **Lettrage acté (fait)** : **A** Événements · **B** Météo des rayonnements (outils
  MJ, 2 colonnes) · **C** Handout (joueurs, pleine largeur). Le handout a été re-lettré B→C.

Technique docx : le passage 2 colonnes → 1 colonne se fait via une **nouvelle section**
(`sections[]`), pas via un saut de colonne. Footer dupliqué via `makeFooter()`.

## 8bis. Suite de rédaction (retour critique)

Le retour critique sur `docs/scenario_fusion_draft.md` est consolidé en checklist versionnée
dédiée : **`TODO.md`** (racine du scénario). Priorités : section 3 pré-tirés (bloquant),
horloge ISB + tables aléatoires (station / rayonnements de la Gueule) + climax (haute),
nomenclature « (d) » & index handouts & front-matter D6 (moyenne), fiche-solution & trim (basse).

## 9. Progression

- [x] Exploration des sources + extraction des .docx en markdown (scratchpad)
- [x] Branche dédiée créée
- [x] Décisions utilisateur recueillies
- [x] `redaction_options.md` initialisé
- [x] Plan détaillé du document fusionné
- [x] Rédaction contenu (brouillon `docs/scenario_fusion_draft.md`) : Présentation + chronologie + Lieux + Conclusion
- [x] Génération du `.docx` → `docs/scenario_signal_detresse_FUSION.docx` (2 colonnes, titre + sommaire pleine largeur, schémas en boîtes, encarts)
- [x] Vérification visuelle : page de titre (PNG) + rendu 2 colonnes/schémas/encarts (PNG de contrôle) OK, 9 pages, accents corrects
- [x] Commit + push sur la branche

## 10. Comment régénérer le .docx

Le contenu source (texte) est `docs/scenario_fusion_draft.md`. Le `.docx` est produit
par le script docx-js **versionné** `docs/generate_docx.js`.
Pour reprendre/modifier la mise en forme :
1. Éditer le texte dans `scenario_fusion_draft.md` (source de vérité du contenu).
2. Reporter les changements dans `generate_docx.js` (helpers `md/P/B/H1/H2/schema/encart`).
3. Dans `docs/` : `npm init -y && npm i docx@8`, puis `node generate_docx.js` → écrit le `.docx`.
> Note : docx-js ne peut pas *ouvrir* un docx existant ; toute régénération repart du script.
> Le sommaire (TOC) se peuple à l'ouverture Word/LibreOffice (champ `updateFields`).

### Journal de bord
- *(init)* Sources analysées, intrigue synthétisée, décisions validées.
- *(rédaction)* Brouillon markdown complet écrit dans `docs/scenario_fusion_draft.md` — c'est la source de contenu. Structure : Présentation (pitch, contexte Projet Faucheur, mécanique des 4 indices, menace ISB, conseils) → Chronologie (3 fils) → Personnages pré-tirés (placeholder TODO MJ) → Lieux dans l'ordre §5 (0 quai → 1 Doiron → 2 culturel → 3 mess → 4 galerie → 5 sportif → 6 DMZ, + secondaires en encarts) → Issues & ouverture. Encart d'avertissement sur la collision « (d) ». Idées du vieux brouillon réinjectées comme leviers (Kallan vénal, Denz corruptible, panne élec = complication).
- *(génération)* En cours : script docx-js. Sortie prévue : `docs/scenario_signal_detresse_FUSION.docx`. Utilisateur a autorisé commit+push sur la branche ; ajustements de son côté via commit séparé.
