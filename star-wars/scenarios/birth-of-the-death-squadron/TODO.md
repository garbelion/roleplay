# TODO — Scénario « Signal de Détresse » (Kessel-Tho)

Checklist de suite de rédaction, issue du retour critique sur
`docs/scenario_fusion_draft.md`.

Branche de travail : `fusion-scenario-signal-detresse` (jamais sur `main`).
Source de vérité du contenu : `docs/scenario_fusion_draft.md`
→ régénérer le `.docx` via `docs/generate_docx.js` (voir `redaction_options.md` §10).

Priorités : **Bloquant** > **Haute** > **Moyenne** > **Basse**.

---

## Bloquant

- [x] **1. Rédiger la section 3 — Personnages pré-tirés** (4 à 6 fiches). ✅ FAIT
  6 pré-tirés (équipage du *Murmure*) avec stat-blocks **Star Wars D6 (WEG R&E)**,
  18D attributs / ~7D compétences : Renna (meneuse), Dax (slicer), Yssha (infiltration),
  Bren (pilote), Holt (ex-impérial/force), Ithra (médecin-érudite, lien Alderaan).
  Synergies scénario intégrées (slicer↔journal, Ithra↔indice a & Tana, Yssha↔Skarn,
  Holt↔ISB, Bren↔exfil). Rendu 2 colonnes vérifié.

## Haute

- [x] **2. Concrétiser l'horloge ISB** (moteur de tension). ✅ FAIT
  Piste en **6 crans** (états escaladés jusqu'au VERROUILLAGE), avance passive
  (+1/quart ou /scène-clé) + bavures chiffrées (mineure +1 / majeure +2),
  leviers de ralentissement (−1 : désinformation, Holt/procédures ISB, diversion),
  signes à télégraphier, pilotage caché + variantes de départ (cran 1/2/3).
  Branché sur #3 (événements), #4 (rayonnements) et le pré-tiré Holt.
  Rédigé dans la Présentation (remplace l'ancien « compte à rebours » flou).

- [x] **3. Ajouter une table d'événements aléatoires de la station.** ✅ FAIT
  Table **d66** (2 dés : thème 1-6 × événement 1-6 = 36 entrées, 100 % dés D6),
  6 thèmes (quai/vaisseaux, technique/pannes, personnel/social, sécurité/impérial,
  commerce/rumeurs, ambiance). Ancrée dans le journal de nuit (doc g : Perce-Brume,
  Étoile Voilée, passerelle 3, panne élec C19/J133, altercations…) et crochetée sur
  l'horloge ISB (#2), les rayonnements (#4) et les leviers sociaux. Placée dans une
  nouvelle section **Annexes — outils de MJ** (annexe A) après la conclusion.

- [x] **4. Ajouter une table « météo des rayonnements » & incidents gravitationnels.** ✅ FAIT
  **Annexe B**. Échelle météo (1D/quart : Calme 1-3 / Instable 4-5 / Tempête 6) à
  effets mécaniques à double usage : comms & **détresse** (−1D/−2D), **horloge ISB**
  (ralentie à Instable, **gelée** à Tempête, cf. #2), **départs de vaisseaux**
  (astrogation +1 / hyperespace suspendu). + table d'**incidents (1D)** cross-liée
  (#2 ISB, #3 événement technique 2·2, détresse). Note de pilotage (levier de rythme
  pour le climax). Lettrage annexes acté : **A** Événements · **B** Rayonnements ·
  **C** Handout (re-lettré depuis B).

- [ ] **5. Étoffer le climax** (DMZ + exfiltration + confrontation Rennard).
  Actuellement sous-écrit face à l'enquête. Développer la scène finale : entrée
  en DMZ (2 voies déjà posées), extraction sous tension, options de fuite,
  face-à-face possible avec l'agent Rennard. Rééquilibrer le rythme montée/sommet.

## Moyenne

- [ ] **6. Clarifier la nomenclature.**
  - Trancher la collision « (d) » : énigme (d) du mess **vs** document (d) le
    journal-trésor. Décision à acter (option pressentie : renommer le journal
    « document J » / « le journal-trésor » pour lever l'ambiguïté à la racine).
  - Aligner l'ordre du tableau des indices §1 (a, b, c, d) avec l'ordre de
    visite des lieux §4 (a → d → b → c), ou signaler explicitement la divergence.

- [ ] **7. Combler les références orphelines.**
  - Ajouter un **index des handouts (d)→(j)** : quel fichier, ce qu'il contient,
    et « où on le trouve » en jeu.
  - **Supprimer toute mention de `bafouille.exe`** (outil annulé). Bafouille
    (le droïde) reste, mais plus de référence à un exécutable fourni au MJ.

- [ ] **8. Ajouter le front-matter.**
  Durée estimée, nombre de joueurs, ton, mention **système D6**, et un encadré
  d'accroche prêt à lire pour les joueurs (comment ils reçoivent le signal).

## Basse

- [ ] **9. Fiche-solution récap MJ + trim de la présentation.**
  Aide-mémoire « 4 indices → clés → résultat » en un coup d'œil. Alléger la
  présentation (phrases longues) et vérifier que les schémas rendus aident
  réellement à la spatialisation.

---

## Notes de suivi

- Après toute modif de contenu : reporter dans `generate_docx.js` puis régénérer
  `docs/scenario_signal_detresse_FUSION.docx`.
- Décisions impactant `redaction_options.md` : système **D6** (remplace l'ancien
  défaut « sans stat-blocks »), collision « (d) » **à trancher** (n'est plus
  simplement « libellés conservés + encart »), `bafouille.exe` **annulé**.
