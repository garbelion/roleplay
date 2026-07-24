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

- [x] **5. Étoffer le climax.** ✅ FAIT (design durci en séance /grill-me)
  Section 5 réécrite : **deux goulots** (casse → extraction) sous chrono. Casse =
  point d'accès réseau (tunnel de maintenance / Kavarel / effraction) + Bafouille.
  **Trace inévitable** (le segment de Kallan, déjà sous surveillance ISB car déloyal)
  → Rennard alerté → corvette de Kessel. **Face-à-face au quai (rue de western)** :
  posture de Rennard mappée sur l'horloge de traque (crans bas = embuscade solo /
  crans hauts = renforts + parle) ; **parler = son arme** (gagner du temps pour la
  corvette). **Chrono corvette** : 10 rounds (+5 météo, +5 si rapides) ; fuite = jets
  Piloter/Réparation en vol. **4 axes de fin** modulaires + 2 encarts MJ (soupapes de
  sacrifice, gradient de fins, ton space opera « toujours un fil d'espoir »). Rennard
  jetable (one-shot). 4.6 réaligné + renvoi vers §5.

## Moyenne

- [x] **6. Clarifier la nomenclature.** ✅ FAIT
  - Collision « (d) » tranchée : le journal est désormais **« le journal-trésor »**
    partout dans la prose (jamais « (d) ») ; les 4 énigmes restent (a)–(d). Encart
    « Convention de nommage » remplace l'ancien avertissement.
  - Tableau des indices §1 réordonné dans l'**ordre de visite** (a → d → b → c).

- [x] **7. Combler les références orphelines.** ✅ FAIT
  - **Index des handouts (d)→(j)** ajouté en Présentation (fichier, contenu,
    « où on le trouve » en jeu ; le message 0 = annexe D).
  - **`bafouille.exe` supprimé** (générateur + brouillon) ; Bafouille le droïde
    fait les calculs, sans exécutable. Bonus : skill « Bureaucratie impériale » de
    l'horloge ISB renommée **Administration** (cohérence « visions de légendes »).

- [x] **8. Ajouter le front-matter.** ✅ FAIT
  Encart **« En bref »** (système visions de légendes, 3-6 joueurs, ~3-4 h, ton
  space opera, pitch) + encart **« À lire aux joueurs »** (accroche prête à lire :
  l'annonce du Courtier, l'arrivée du Murmure) en tête de la Présentation.

- [ ] **10. Reporter les 6 pré-tirés sur la feuille FDPJ.**
  Produire une **fiche remplie par personnage** au format `FDPJ RV v.3.8.2`
  (Renna, Dax, Yssha, Bren, Holt, Ithra) : attributs, compétences, équipement,
  citation. Les **stats dérivées** (Initiative, Ténacité/Vitalité, Pénalité de
  coordination) sont calculées **par l'utilisateur**. Voir #1 (stats sources,
  ~18D compétences, système « visions de légendes »).

## Basse

- [x] **9. Fiche-solution récap MJ + trim.** ✅ FAIT
  Encart **« Fiche-solution — la chaîne d'un coup d'œil »** (a/b/c/d → clés →
  résultat) dans la Présentation. Trim léger du pitch (phrase la plus longue
  resserrée). Schémas de lieux jugés suffisants pour la spatialisation.

---

## Notes de suivi

- Après toute modif de contenu : reporter dans `generate_docx.js` puis régénérer
  `docs/scenario_signal_detresse_FUSION.docx`.
- Décisions impactant `redaction_options.md` : système **D6** (remplace l'ancien
  défaut « sans stat-blocks »), collision « (d) » **à trancher** (n'est plus
  simplement « libellés conservés + encart »), `bafouille.exe` **annulé**.
