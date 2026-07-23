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

- [ ] **2. Concrétiser l'horloge ISB** (moteur de tension, actuellement flou).
  Définir : paliers de triangulation de l'analyste Sorae Vint, déclencheurs
  concrets (question de trop, effraction repérée, PNJ alarmé…), seuil de
  verrouillage de la station. Objectif : une échelle pilotable et reproductible
  d'un MJ à l'autre.

- [ ] **3. Ajouter une table d'événements aléatoires de la station.**
  Incidents du quotidien, pannes, bagarres, arrivées/départs de vaisseaux.
  S'appuyer sur le journal de nuit (doc g) et la panne électrique C19/J133 déjà
  posée comme complication réutilisable.

- [ ] **4. Ajouter une table « météo des rayonnements » & incidents gravitationnels.**
  Kessel-Tho est en bordure de la Gueule (amas de trous noirs) : tempêtes de
  rayonnement, pics gravitationnels, brouillage des comms/senseurs. Table à
  double usage : ambiance + complications mécaniques (impact sur détresse, sur
  la triangulation ISB, sur les départs de vaisseaux).

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
