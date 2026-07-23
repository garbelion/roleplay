# SIGNAL DE DÉTRESSE
### Un scénario Star Wars sur la station-relais impériale de Kessel-Tho
*« La naissance de l'Escadron de la Mort »*

> **Brouillon de travail** — contenu source du document fusionné à générer en `.docx`
> (deux colonnes, hors page de titre et sommaire). Les schémas `[SCHÉMA: …]` seront
> rendus en images/tableaux à la génération. Handouts (d)→(j) : mentionnés, non inclus.

---

<!-- ===================== PAGE DE TITRE (pleine largeur) ===================== -->

## Page de titre *(pleine largeur — mise en page à part)*

- Titre : **SIGNAL DE DÉTRESSE**
- Sous-titre : *Station-relais impériale Kessel-Tho — Bordure Extérieure*
- Accroche : « Un signal a rebondi jusqu'ici. L'Empire aussi le cherche. »
- Mention : *Scénario d'enquête et d'infiltration — à l'usage du Maître de Jeu*

<!-- ===================== SOMMAIRE (pleine largeur) ===================== -->

## Sommaire *(pleine largeur — généré automatiquement)*

1. Présentation
2. Chronologie des événements
3. Personnages pré-tirés *(à compléter par le MJ)*
4. Les lieux de la station
5. Issues possibles & ouverture

<!-- ===================== DÉBUT DES DEUX COLONNES ===================== -->

# 1. PRÉSENTATION

## Le pitch

Un signal de détresse chiffré a fini par atteindre les personnages-joueurs. Il ne
vient pas d'un vaisseau en perte de puissance, mais d'une femme qui sait quelque
chose que l'Empire tuerait pour enterrer. Sur une petite station-relais oubliée
en bordure du secteur de Kessel, une technicienne du nom de **Tana Wrey** a
intercepté, quart après quart, les fragments d'une opération militaire de très
grande ampleur : le **Projet Faucheur**.

Traquée par ses propres soupçons autant que par ceux de son supérieur, Tana s'est
effacée derrière un alias — **Doiron**, tenancière d'une modeste échoppe du quai.
Elle a dispersé aux quatre coins de la station les clés qui permettent de lire ce
qu'elle a caché, de sorte que personne — pas même elle — ne puisse tout livrer sous
la contrainte. Les PJ devront gagner sa confiance, reconstituer ces clés en résolvant
quatre énigmes physiques, et exfiltrer l'information **avant** qu'une équipe du Bureau
de Sécurité Impériale (ISB), déjà en route, ne remonte la trace du signal jusqu'à eux.

## Le contexte : le Projet Faucheur

Ce que Tana a assemblé sans le vouloir, c'est le portrait en creux de la
**naissance de l'Escadron de la Mort** : la sortie de chantier d'un bâtiment
« hors normes, aucune désignation officielle » en orbite de **Fondor** — le
Super Destroyer Stellaire *Executor* — et le déploiement d'une flotte chargée de
ratisser méthodiquement une portion de la Bordure Extérieure à la recherche d'une
**base dissidente**. Les entrées les plus récentes du journal parlent d'une flotte
« maintenue en position, prête à exécution sur ordre », puis d'un dernier fragment
avant brouillage : *« …si confirmation reçue, exécution immédiate… »*.

Autrement dit : les coordonnées cachées dans le journal de Tana pointent vers une
cible que l'Empire s'apprête à frapper. Les PJ ne mettent pas seulement la main sur
un secret — ils tiennent peut-être le seul avertissement capable de sauver une base
entière.

> **La station Kessel-Tho.** Station-relais de communication de la Bordure
> Extérieure, sur une route commerciale secondaire de Kessel. Cinq niveaux
> superposés : **N4 Communications**, **N3 Administration & sécurité**,
> **N2 Vie quotidienne**, **N1 Amarrage & commerce**, **N0 Soubassement
> technique**. Une colonne de sécurité blindée relie directement le commandement
> (N4/N3) au niveau technique (N0) sans traverser les niveaux civils.

## Comment fonctionne l'enquête

Le point de départ est la **boutique de Doiron** (N1). Tana y a laissé un
**message (0)** — un datapad — qui, une fois consulté, oriente vers **quatre
contacts**. Chaque contact garde, sans le savoir, l'un des quatre **indices**
physiques que Tana a dissimulés :

| Indice | Lieu | Contact | Ce qu'il donne |
|---|---|---|---|
| **(a)** Faux clients | Centre culturel | Maren Estil | Les 3 alias à cibler dans le journal |
| **(b)** Fresque | Galerie de maintenance | Dosh Kavarel | Phrase **ORPHELINS** (clé Coordonnées) |
| **(c)** Pentaminos | Centre sportif | Grash Meloi | Phrase **JENESUISPLUSSEULEICI** (clé Messages) |
| **(d)** Annonces du mess | Mess du personnel | Kessa Droman | Clé maître **RépubliqueRetour** + **Argon2** |

Une fois les paramètres réunis, c'est le droïde **Bafouille** (ou l'outil
`bafouille.exe` fourni au MJ) qui effectue les calculs et restitue en clair les
**18 entrées** cachées de Tana parmi les 78 lignes du **journal (document d)**,
isolé dans la **DMZ** du niveau 0. *Le jeu, c'est la résolution des énigmes — pas
la cryptographie : les joueurs fournissent les paramètres, la machine calcule.*

> **⚠ Attention à la lettre « (d) ».** Dans les documents source, « (d) » désigne
> **deux choses distinctes** : la **4ᵉ énigme** (les annonces du mess) **et** le
> **journal chiffré** (document d, le trésor final). Ce document conserve les deux
> libellés d'origine ; ne les confondez pas en jeu.

## La menace : l'horloge ISB (la triangulation)

Le **moteur de tension** du scénario. Une équipe restreinte du **Bureau de Sécurité
Impériale** — l'agent **Rennard**, l'analyste **Sorae Vint**, les commandos **Ferrus
& Skarn** (fiches en §4.7) — ratisse le secteur. Vint retrace pas à pas le **rebond
de fréquence** qui a trahi l'interception. Ce n'est pas « l'Empire soupçonne les
PJ » : c'est l'Empire qui **resserre l'endroit** d'où le signal est parti — et cet
endroit converge vers Kessel-Tho, puis la DMZ et le journal, puis Tana et ceux qui
l'aident. La triangulation est **inexorable** : elle avance toujours.

**La piste — 6 crans.** L'horloge démarre au **cran 2** (l'équipe arrive sur
Kessel-Tho, parmi d'autres stations ratissées). Chaque cran change concrètement la
situation :

- **Cran 1 — Ratissage large.** L'équipe est encore ailleurs dans le secteur. *(Départ possible pour une intro plus lente.)*
- **Cran 2 — Arrivée.** Rennard prend ses quartiers (zone commandos, N3). Skarn amorce une reconnaissance discrète du quai et des niveaux publics. *Départ recommandé.*
- **Cran 3 — Corrélation.** Vint relie le rebond à Kessel-Tho précisément. Contrôles d'accès renforcés ; premiers entretiens avec le personnel (Aashe, Kallan, garnison).
- **Cran 4 — Le trafic de fréquences.** Rennard réquisitionne les registres (capitainerie, transmissions). **Tout départ de vaisseau exige désormais un feu vert de l'ISB.** L'étau se resserre sur la DMZ.
- **Cran 5 — Les faux clients.** Vint isole l'anomalie des trois alias. L'ISB cherche activement « Doiron » : la boutique est surveillée, les contacts de Tana (re)interrogés.
- **Cran 6 — VERROUILLAGE.** Station bouclée : quais fermés, tout départ inspecté, Ferrus et Skarn en intervention. Chasse ouverte à Tana et à quiconque la couvre. *Le climax se joue maintenant, de gré ou de force.*

**Ce qui fait avancer l'horloge.**
- **Avance passive (le temps) :** +1 cran par **quart** écoulé (~8 h de fiction). À défaut de suivre l'heure, comptez +1 après chaque **scène-clé** (indice bouclé, changement de niveau majeur). L'horloge ne recule jamais d'elle-même.
- **Bavure mineure (+1) :** une question de trop qui remonte (interroger un impérial ou un PNJ prudent sur Tana / Doiron / les fréquences) ; un jet social raté devant un uniforme ; se faire remarquer au quai ou au marché gris ; un achat voyant à l'armurerie.
- **Bavure majeure (+2) :** effraction repérée (DMZ, bureau Kallan, terminal des transmissions) ; alarme déclenchée ; PNJ alarmé qui alerte la garnison ou l'ISB ; violence ou arme dégainée en public ; **trace numérique laissée au slicing** (échec critique en Sécurité / Programmation).

**Ce qui peut la ralentir (−1, une fois chacun).**
- **Désinformation active :** planter une fausse piste crédible — faire porter le rebond au *Long Sillage* déjà « suspecté » (rapport e), brouiller une borne WN, falsifier un registre.
- **Holt Marek de l'intérieur :** exploiter les procédures ISB (faux ordre, lenteur administrative provoquée) — −1 sur un jet de *Bureaucratie impériale* réussi.
- **Diversion coûteuse :** provoquer un incident de station (cf. table d'événements §… ; ex. panne électrique C19/J133) qui accapare l'attention — gare aux dégâts collatéraux.

**Signes à télégraphier** (faire *sentir* l'horloge sans montrer le chiffre) : une
silhouette grise (Skarn) aperçue deux fois ; le personnel plus nerveux, moins bavard ;
un contrôle d'identité au quai qui n'y était pas la veille ; l'annonce que « les
départs sont soumis à autorisation ». Chaque montée d'un cran mérite un signe concret.

**Pilotage & variantes.** Gardez le compteur caché ; laissez les joueurs lire la
pression aux signes. One-shot tendu : démarrez au **cran 3**. Intro posée : **cran 1**.
Une **tempête de rayonnements** (cf. table météo) peut geler l'avance passive d'un
quart — répit ambigu, car les comms des PJ sautent aussi.

## Conseils de conduite

- **Tana observe avant d'aider.** Elle jauge les PJ depuis sa boutique buggée ; sa
  coopération se mérite. Tant qu'elle n'a pas décidé, elle joue Doiron la marchande.
- **Les quatre indices sont indépendants** : l'ordre de résolution n'a pas
  d'importance mécanique. L'ordre présenté ici est le plus probable, pas le seul.
- **Les PNJ gardiens des indices ignorent leur sens.** Ils coopèrent si on les
  aborde avec tact et/ou si on leur montre le datapad (0).
- **Les handouts (d)→(j) existent comme documents séparés** à distribuer selon les
  fouilles des PJ ; ils ne sont pas reproduits ici.

---

# 2. CHRONOLOGIE DES ÉVÉNEMENTS

*Le calendrier local se compte en cycles et en jours. Trois fils se superposent :
ce que le journal de Tana révèle, la vie récente de la station, et le présent du
scénario.*

## Ce que révèle le journal (arrière-plan, cycles 18-19)

- **C18 / J058** — Première mention : *« Faucheur activé selon calendrier. »*
- **C18 / J140** — Ratissage systématique du **Bras Occidental** engagé.
- **C18 / J145** — *« Essais finaux du châssis en orbite de Fondor. Dimensions hors
  normes… »* → l'*Executor* en construction.
- **C18 / J160-J298** — Le ratissage s'enlise ; pertes de droïdes-sondes ; premiers
  signes d'**activité dissidente** dans la zone (grille L-14).
- **C19 / J020** — *« Signature compatible avec une base dissidente établie. »*
- **C19 / J030** — *« Le chantier de Fondor confirme la sortie de dock de l'*Executor*. »*
- **C19 / J089** — *« Le Faucheur se repositionne. Flotte principale en approche. »*
- **C19 / J178** — *« Autorisation de frappe en attente de confirmation finale. »*
- **C19 / J199** — Dernier fragment avant brouillage : *« …si confirmation reçue,
  exécution immédiate… »* — **c'est le signal que Tana a intercepté, et dont le
  rebond a alerté l'ISB.**

## La station, récemment (extraits du journal de nuit, doc g)

- **C19 / J121** — Altercation entre techniciens de quai (incident disciplinaire).
- **C19 / J133** — **Panne électrique majeure** (secteurs B/C) ; délai de bascule de
  secours anormalement long — réseau jugé préoccupant.
- **C19 / J140** — Deux vaisseaux non identifiés s'accrochent près de la station
  (probable règlement de comptes de contrebandiers).
- **C19 / J149** — **Signal de détresse** du caboteur *Étoile Voilée*, remorqué et
  amarré en urgence ; équipage soigné à l'infirmerie.
- **C19 / J150** — Situation nominale ; la **passerelle 3 grince** toujours (marronnier).

## Le présent du scénario

1. Les soupçons de **Torvin Aashe** (supérieur de Tana) la poussent à disparaître
   derrière l'alias **Doiron** et à disperser ses indices.
2. Le rebond du signal du **J199** alerte le Bureau : l'équipe **Rennard** est
   dépêchée dans le secteur.
3. Le **signal de détresse chiffré** de Tana atteint les PJ, qui gagnent Kessel-Tho.
4. **Le scénario commence** à leur arrivée au quai. L'horloge ISB tourne déjà.

---

# 3. PERSONNAGES PRÉ-TIRÉS

Les personnages forment l'équipage du **Murmure**, un petit cargo léger qui a capté
le signal de détresse chiffré de Tana et mis le cap sur Kessel-Tho. Le MJ les
rattache à l'**Alliance naissante** (cellule affiliée) ou les garde **francs-tireurs**
selon sa campagne. Toute sous-partie de 4 à 6 de ces profils forme un groupe jouable.

**Répartition des rôles.** Meneuse (Renna) · slicer (Dax) · infiltration (Yssha) ·
pilotage & extraction (Bren) · force & procédures impériales (Holt) · soins, savoir
& lien avec Alderaan (Ithra).

> *Profils bâtis sur le gabarit standard **Star Wars D6** (West End Games, édition
> révisée) : 18D d'attributs, ~7D de compétences, Déplacement 10. Ajustez librement.
> Attributs : Dextérité, Perception, Savoir, Vigueur, Mécanique, Technique. Les
> compétences non citées valent la valeur de leur attribut.*

## Renna Calder — Agent de liaison *(meneuse)*
*Humaine · femme · Chandrila · commandement, contacts, baratin*
- **DEXTÉRITÉ 2D+2** — Blaster 3D+2, Esquive 3D+2
- **PERCEPTION 4D** — Baratin 5D, Commandement 5D, Marchandage 4D+2, Persuasion 4D+2
- **SAVOIR 3D** — Bureaucratie impériale 4D, Cultures 4D, Systèmes planétaires 3D+2
- **VIGUEUR 2D**
- **MÉCANIQUE 3D** — Communications 4D, Sensoreurs 3D+2
- **TECHNIQUE 3D+1** — Sécurité 3D+2
- **Déplacement** 10 · **Points de Force** 1 · **Points de Personnage** 5
- **Équipement** — blaster léger (holster discret), comlink chiffré, datapad de faux ordres, code-cylindre volé (périmé)
- *Accroche — c'est elle qui a décodé l'en-tête du signal de Tana. Convaincue qu'il y a « plus gros que nous » derrière ; porte le poids de mener vers le danger des gens qu'elle aime.*

## Dax « Fil » Orrin — Slicer / technicien
*Humain · homme · Corellia · réseaux, déchiffrement, portes verrouillées*
- **DEXTÉRITÉ 2D** — Esquive 2D+2
- **PERCEPTION 3D** — Fouille 3D+2, Discrétion 3D+1
- **SAVOIR 3D** — Valeur (milieu) 3D+2, Technologie 4D
- **VIGUEUR 2D**
- **MÉCANIQUE 3D** — Communications 3D+2
- **TECHNIQUE 5D** — Programmation/réparation d'ordinateurs 6D, Sécurité 5D+2, Réparation de droïdes 5D+1
- **Déplacement** 10 · **Points de Force** 1 · **Points de Personnage** 5
- **Équipement** — datapad de slicing, kit de crochetage électronique (spikes), multitool, comlink
- *Accroche — le seul à pouvoir dialoguer avec Bafouille d'égal à égal, et à mesurer ce qu'implique un déchiffrement Argon2. Tendance à foncer sur un terminal en oubliant la discrétion.*

## Yssha Vel — Éclaireuse / infiltratrice
*Twi'lek · femme · Ryloth · discrétion, filature, repérage*
- **DEXTÉRITÉ 4D** — Blaster 4D+1, Corps à corps 4D+1, Esquive 4D+2
- **PERCEPTION 4D** — Discrétion 5D+1, Fouille 4D+2, Pickpocket 4D+1
- **SAVOIR 2D** — Langues 2D+2
- **VIGUEUR 3D** — Escalade/saut 3D+2
- **MÉCANIQUE 2D**
- **TECHNIQUE 3D** — Sécurité 3D+2
- *Capacité twi'lek — communication discrète par micro-mouvements des lekku.*
- **Déplacement** 10 · **Points de Force** 1 · **Points de Personnage** 5
- **Équipement** — blaster hold-out, combinaison souple sombre, brouilleur de capteurs de proximité, macrojumelles
- *Accroche — repère la filature de la commando Skarn avant tout le monde… si on l'écoute. A appris la discrétion en fuyant les rafles impériales de Ryloth.*

## Bren Sarkori — Pilote / franc-tireur
*Humain · homme · Nar Shaddaa · pilotage, extraction, sang-froid*
- **DEXTÉRITÉ 3D** — Blaster 4D, Esquive 3D+2
- **PERCEPTION 3D** — Baratin 3D+2, Jeu 3D+2
- **SAVOIR 2D** — Astrographie 2D+2
- **VIGUEUR 2D+2**
- **MÉCANIQUE 4D** — Pilotage spatial 5D, Artillerie spatiale 4D+2, Astrogation 4D+1, Sensoreurs 4D
- **TECHNIQUE 3D+1** — Réparation de vaisseaux 4D
- **Déplacement** 10 · **Points de Force** 1 · **Points de Personnage** 5
- **Équipement** — blaster lourd, veste de vol, comlink, les clés du *Murmure*
- *Accroche — capitaine-pilote du Murmure. Garde le vaisseau chaud sur l'aire d'amarrage : le plan d'extraction, c'est lui. Déteste rester à quai à attendre.*

## Holt Marek — Ancien sergent impérial *(déserteur)*
*Humain · homme · monde de garnison · force, sécurité, procédures impériales*
- **DEXTÉRITÉ 4D** — Blaster 5D, Armes lourdes 4D+2, Esquive 4D+1
- **PERCEPTION 3D** — Commandement 3D+2, Intimidation 4D
- **SAVOIR 3D** — Bureaucratie impériale 3D+2, Tactique militaire 3D+2
- **VIGUEUR 3D** — Bagarre 4D, Encaissement 4D
- **MÉCANIQUE 2D**
- **TECHNIQUE 3D** — Sécurité 4D, Premiers soins 3D+2
- **Déplacement** 10 · **Points de Force** 1 · **Points de Personnage** 5
- **Équipement** — blaster E-11 « emprunté », armure légère sous vareuse civile, code-cylindre impérial périmé, plaques d'identité arrachées
- *Accroche — connaît de l'intérieur les protocoles d'une station-relais et les manies de l'ISB : inestimable pour lire la menace Rennard. Chaque uniforme impérial croisé réveille ce qu'il a fui.*

## Ithra Wen — Médecin de bord / érudite
*Humaine · femme · réfugiée d'Alderaan · soins, savoir, histoire alderaanienne*
- **DEXTÉRITÉ 2D** — Esquive 2D+2
- **PERCEPTION 3D** — Baratin 3D+2, Persuasion 4D
- **SAVOIR 4D** — Cultures 5D, Histoire alderaanienne & républicaine 5D, Langues 4D+2
- **VIGUEUR 3D**
- **MÉCANIQUE 2D**
- **TECHNIQUE 4D** — Premiers soins 5D, (A) Médecine 4D+2
- **Déplacement** 10 · **Points de Force** 2 · **Points de Personnage** 5
- **Équipement** — trousse médicale de campagne, injecteurs de stims, exemplaire annoté d'un ouvrage d'histoire alderaanienne
- *Accroche — comme Tana, elle a vu Alderaan mourir. C'est elle qui reconnaît d'emblée les trois noms de l'indice (a) comme des figures réelles, et qui gagnera le plus vite la confiance de Tana. Le deuil la rend parfois imprudente face à l'Empire.*

---

# 4. LES LIEUX DE LA STATION

*Parcourus dans l'ordre de visite le plus probable. Pour chaque lieu : une
**description**, les **éléments-clés** du scénario qui s'y jouent, un **plan**
schématique, et les **PNJ** qu'on y rencontre. Les lieux purement secondaires sont
regroupés en fin de section.*

## 4.0 — Quai principal & Capitainerie *(N1 — arrivée)*

**Description.** Le point d'entrée de la station : sas d'amarrage, quai principal
et **passerelle 3** (qui grince depuis des cycles, jamais réparée — détail
d'ambiance récurrent). La **capitainerie** attenante tient les registres d'entrée
et de sortie des vaisseaux. Atmosphère de bordure : néons fatigués, odeur de
carburant froid, personnel de quart débordé.

**Éléments-clés.**
- Premier contact des PJ avec la station : contrôle d'amarrage, formalités
  sommaires. Bonne scène d'introduction et de prise de température.
- La **capitainerie** permet de recouper les mouvements de vaisseaux avec le
  **rapport d'analyse de trafic (doc e)** et le **manifeste de fret (doc j)** : un
  PJ méthodique peut y repérer le *Long Sillage* (affréteur régulier, « suspicion
  modérée » dans le rapport e) ou les passages de chasseurs de primes.
- **Amorce de tension** : c'est aussi par ce quai qu'arrivera l'équipe ISB. Le MJ
  peut y semer un premier signe (une navette de liaison inhabituelle, la
  **commando Skarn** en reconnaissance discrète).

[SCHÉMA: Quai N1 — sas d'amarrage → passerelle 3 (grince) → quai principal →
guichet capitainerie ; sorties vers échoppes du quai et ascenseur central.]

**PNJ.**
- **Nills Bregman** — humain, contremaître du **quart de nuit**. Consciencieux,
  protecteur de son équipe, rapports secs mais complets. Auteur du journal de bord
  (g). *« Un quart calme, c'est un quart où personne n'a besoin de moi. »*
- **Elin Voss** — Devaronienne, contremaîtresse du **quart de jour**, plus bavarde
  que Bregman. Source d'information complémentaire sur la vie diurne. *« Bregman
  note tout, sauf l'essentiel. »*

## 4.1 — Boutique de Doiron *(N1 — le point de départ)*

**Description.** Une devanture modeste coincée entre deux échoppes du quai : pièces
détachées, bricoles d'occasion, un comptoir encombré et un astromécano cabossé qui
cliquette dans un coin. Rien n'y attire l'œil — c'est exactement le but.

**Éléments-clés.**
- **Point de départ de toute l'enquête.** Le **message (0)** y est laissé sur un
  datapad ; consulté, il oriente vers les **quatre contacts** (culturel, galerie,
  sportif, mess) en termes voilés (« mes lectures du mois », « ma marque là où il
  travaille », « mes jeux d'hiver, casier 12-3-20 », le mess).
- **La boutique est buggée par Tana elle-même.** Elle **observe les PJ** dès leur
  arrivée et jauge leur fiabilité avant de se dévoiler. Selon leur comportement,
  elle se révélera tôt (aide active) ou restera Doiron la marchande méfiante.
- Le datapad (0) sert aussi de **laissez-passer social** : le montrer aux PNJ
  gardiens (Maren Estil, Grash Meloi…) lève leurs réticences.

[SCHÉMA: Boutique — devanture/quai → comptoir (datapad 0) → arrière-boutique
(Bafouille, poste d'observation caché de Tana).]

**PNJ.**
- **Tana Wrey (alias Doiron)** — humaine, Alderaan, ~25 ans, mains tachées d'encre
  et de peinture, veste trop grande. Vive, méthodique jusqu'à l'obsession, marquée
  par la perte d'Alderaan. **Cœur de l'intrigue.** *« Je n'ai pas fui Alderaan pour
  regarder l'Empire recommencer ailleurs sans rien dire. »*
- **Bafouille** — astromécano série R rafistolé, roue voilée au cliquetis
  caractéristique. Loyal à Tana au-delà de toute logique ; comprend plus qu'il n'en
  montre. C'est lui qui **assemble les clés et déchiffre**. *(Bips ≈ « Ça dépend qui
  demande. »)*

## 4.2 — Centre culturel *(N2 — indice a)*

**Description.** La petite bibliothèque de la station, tenue avec soin par une
Alderaanienne exilée. Rayonnages serrés, quelques ouvrages d'histoire républicaine,
une table de lecture. Un îlot de calme dans une station utilitaire.

**Éléments-clés — INDICE (a), « Les faux clients ».**
- Tana a emprunté *« Histoire d'Alderaan des origines à la Haute République »* et
  **glissé entre ses pages une liste manuscrite de trois noms** : **Ulic Qel-Droma**,
  **Liana Merian**, **Agrippa Aldrete** — figures secondaires alderaaniennes
  (Jedi/sénateurs) vérifiables mais obscures.
- Ce sont les **trois alias** sous lesquels Tana a caché ses entrées dans le journal.
  Comprendre que ce sont de **vrais noms historiques** (pas des personnages inventés)
  est la clé : cela permet de cibler **18 entrées** au lieu de trier 78 lignes à la main.
- Le livre est **toujours dans le rayon** (Tana ne l'a pas rendu). *Sans (a) : 1 h de
  transfert du journal entier + tri manuel.*

[SCHÉMA: Centre culturel — entrée → comptoir (Maren Estil) → rayon Histoire
(le livre + liste manuscrite entre les pages) → table de lecture.]

**PNJ.**
- **Maren Estil** — humaine, Alderaan, ~60 ans, chignon gris, châle alderaanien.
  Passionnée d'histoire républicaine. Confirme sans hésiter l'emprunt de Tana si on
  lui montre le datapad (0) ; ignore tout du sens des annotations. Chaleureuse avec
  qui respecte ses livres, sèche sinon. *« Un livre d'histoire, ça se manipule avec
  des mains propres et un esprit ouvert. »*

## 4.3 — Mess du personnel *(N2 — indice d, la clé maître)*

**Description.** La cantine commune, cœur de la vie sociale : tablées bruyantes,
odeur de caf noir, un grand **tableau d'affichage** couvert de petites annonces.
Tenu par une Zabrak chaleureuse qui entend tout sans en avoir l'air.

**Éléments-clés — INDICE (d), « Les petites annonces ».**
- Six annonces épinglées au tableau, mêlées à d'autres, forment **trois paires**.
  Pour chaque paire, **seuls les mots communs aux deux annonces** composent le
  message caché :
  - Paire 1-2 → *« Le début de la clé est République »*
  - Paire 3-4 → *« La deuxième moitié est retour »*
  - Paire 5-6 → *« Pour dériver, prendre Argon2 »*
- **Solution assemblée** : clé maître **« RépubliqueRetour »** (16 caractères) +
  algorithme de dérivation **Argon2**. C'est le socle de tous les déchiffrements.
- Les six annonces ont un **style homogène** (tapées par la même personne) : les
  repérer comme un ensemble fait partie de l'énigme. L'annonce 6 (« Vendu chez
  Doiron ») **renvoie clin d'œil vers le point de départ**.

*Handout recommandé : les six annonces sur des bouts de papier séparés — les
comparer physiquement côte à côte est bien plus efficace qu'une lecture à voix haute.*

[SCHÉMA: Mess — comptoir (Kessa Droman) → tablées → tableau d'affichage
(6 annonces en 3 paires parmi le bruit).]

**PNJ.**
- **Kessa Droman** — Zabrak, Iridonia, tatouages faciaux estompés, sourire facile,
  observatrice redoutable. **Quatrième contact** de Tana. Sait qu'elle passe
  épingler des annonces, sans en connaître le contenu. *« Ici, on nourrit tout le
  monde pareil — l'administrateur, le mécano, et celui qui ne veut pas dire son nom. »*

## 4.4 — Galerie de maintenance *(N0 — indice b)*

**Description.** Un corridor technique secondaire du soubassement, éclairage cru,
faisceaux de câbles. Sur un pan de mur, incongrue, une **fresque** peinte : les
jardins du palais du Vice-roi d'Alderaan. L'administration l'a tolérée comme
« dégradation esthétique sans conséquence ».

**Éléments-clés — INDICE (b), « La fresque stéganographique ».**
- La fresque cache deux éléments codés : la **façade du palais** (4 étages × 5
  fenêtres), dont **neuf fenêtres sont allumées** selon un **dégradé de teinte** (du
  plus pâle au plus sombre) ; et, séparé dans le couloir, un **graffiti-grille 4×5**
  qui sert de **légende** — un **carré de Polybe à mot-clé LOTUS**.
- En lisant les neuf fenêtres **dans l'ordre du dégradé** et en les décodant via la
  grille, on obtient la phrase de passe **ORPHELINS** → clé de déchiffrement des
  **COORDONNÉES** du journal.
- **Dosh Kavarel** ne montre le mur que si on l'aborde avec tact ; pour lui, c'est
  juste « le mur que la fille aimait peindre ».

*Handouts : (1) photo de la fresque aux neuf fenêtres allumées, (2) photo du
graffiti-grille.*

[SCHÉMA: Galerie — grille de Polybe (LOTUS) au mur du couloir | fresque : façade
4×5, 9 fenêtres allumées en dégradé → lecture = ORPHELINS.]

**PNJ.**
- **Dosh Kavarel** — Duros, taciturne, peu curieux de la vie d'autrui. Technicien
  antennes/maintenance ; connaît Tana de longue date sans s'être jamais interrogé.
  *« Elle peint, je répare. On n'a jamais eu besoin de se poser plus de questions. »*

## 4.5 — Centre sportif *(N2 — indice c)*

**Description.** Une salle d'entraînement fonctionnelle et des vestiaires alignés de
casiers métalliques, tenue par un Trandoshan bourru attaché à la propreté et à la
discipline. Odeur de métal et de désinfectant.

**Éléments-clés — INDICE (c), « Le puzzle pentaminos ».**
- Le **casier 12-3-20** (mnémonique : 12 pentaminos, 3 rangées, 20 colonnes)
  contient un **puzzle physique** : assembler les 12 pentaminos en rectangle 3×20.
  Il n'existe que **deux solutions** ; Tana a peint des lettres sur les pièces.
- **Une seule** solution fait apparaître une phrase cohérente sur la ligne centrale :
  **JENESUISPLUSSEULEICI** → clé de déchiffrement des **MESSAGES** du journal.
- **Piège volontaire** : les six premières lettres (JENESU) sont identiques dans les
  deux solutions ; la mauvaise vire ensuite au charabia (JENESUCIELUESSULISPI). Un
  joueur peut croire avoir réussi avant de buter sur le milieu.
- Grash Meloi ouvre le casier sans sourciller si on lui montre le datapad (0) ; il
  ignore ce qu'il contient (« c'était pour un ami qui passerait le chercher »).

[SCHÉMA: Centre sportif — salle d'entraînement | vestiaires : rangée de casiers,
casier 12-3-20 mis en avant → puzzle 3×20 → ligne centrale = phrase.]

**PNJ.**
- **Grash Meloi** — Trandoshan, bourru mais juste, respecte l'effort et méprise la
  paresse. Gère les casiers. *« Un casier qui reste fermé un an, ce n'est pas mes
  affaires. Un casier qui déborde, ça l'est. »*

## 4.6 — Locaux des ingénieurs & serveur DMZ *(N0 — le journal)*

**Description.** Au plus bas de la station, la **zone démilitarisée (DMZ)** :
systèmes critiques isolés du réseau commercial courant, salle serveur froide et
bruyante, accès contrôlé. C'est le point sensible et la fin logique du parcours.

**Éléments-clés — LE JOURNAL (document d).**
- C'est **ici** qu'est stocké, isolé en DMZ, le **journal de facturation illégale**
  de l'administrateur **Kallan** — celui dans lequel Tana a dissimulé ses **18
  entrées** sous les trois faux alias. Kallan le **protège sans le savoir** (par
  intérêt : c'est aussi son registre de fréquences revendues au noir).
- Une fois sur place avec les **quatre indices**, **Bafouille assemble** :
  - RépubliqueRetour + Argon2 + **ORPHELINS** → clé des **Coordonnées**
  - RépubliqueRetour + Argon2 + **JENESUISPLUSSEULEICI** → clé des **Messages**
  - et (a) désigne **quelles 18 entrées** parmi 78 déchiffrer.
- Le résultat : les messages en clair du Projet Faucheur **et les coordonnées** de la
  base dissidente menacée (grille **L-14**, sous-secteur 4, proche de la balise
  Kessel Secondaire).
- **Accès.** Deux voies : la **colonne de sécurité** blindée depuis N4/N3 (rapide
  mais surveillée), ou, plus discret socialement mais risqué, le **terminal de la
  salle de contrôle des transmissions** (N4) qui donne accès à l'interface de
  consultation — sous l'œil d'Aashe. Présence probable de **Kavarel/Bissik** ou de
  la **garnison** à proximité.

[SCHÉMA: N0 DMZ — colonne de sécurité (depuis N3/N4) → sas contrôlé → salle serveur
(journal d, isolé) ; voie alternative : terminal salle transmissions N4.]

**PNJ.**
- **Naro Bissik** — Sullustan, vif, curieux, un peu trop bavard sur la technique.
  En charge du **réseau interne** (bornes WN-01/02/03) ; complémentaire de Kavarel
  sur le volet numérique. Peut être un allié involontaire (adore les systèmes bien
  conçus) ou un obstacle. *« Un réseau mal segmenté, c'est comme une porte laissée
  entrouverte en espérant que personne ne pousse. »*

---

## 4.7 — Lieux secondaires *(encarts)*

*Décors d'appui, sources d'information et de tension. À piocher selon les besoins.*

**Cantina Le Sas** *(N1)* — Bar des équipages de passage, distinct du mess.
**Vezz Nurodo** (Gran, trois yeux, jovial) y surveille toute la salle. Meilleure
source de **rumeurs** sur visiteurs, chasseurs de primes et contrebandiers du
manifeste (j).

**Échoppe de Trik Ossoval** *(N1)* — Brocante et **recel** de pièces (Rodien
retors mais pas malhonnête). Matériel hors circuit officiel, rumeurs sur les
vaisseaux de passage.

**Commerce de Hooru Damm** *(N1)* — Vivres et équipement courant (Ithorien doux et
patient). Fournisseur du mess et des livraisons fraîches du manifeste (j).

**Armurerie de Fennik Doss** *(N1)* — Armes légères et protection, marché gris
toléré. Tenancier méfiant, peu bavard.

**Comptoir de change de Chessa Vorn** *(N1)* — Change et prêts sur gages (Muun
froide). **Sait qui, sur la station, a des dettes** — bon **levier** sur un PNJ
endetté.

**Infirmerie** *(N2)* — **Docteure Lyra Senn** (Twi'lek, calme, discrète). A soigné
l'équipage de l'*Étoile Voilée* (g) ; reçoit les évacuations du *Bacta Express*.
Discrétion à toute épreuve sur ce qu'elle observe.

**Atelier de droïdes « Rouages »** *(N1)* — Loué à la semaine par un réparateur
itinérant. Lieu plausible pour une **intervention sur Bafouille** en cours de jeu.

**Salle de contrôle des transmissions** *(N4)* — Poste **habituel de Tana** ; c'est
d'ici qu'elle a intercepté les fragments, en plein exercice de ses fonctions.
Supervisée par **Torvin Aashe** (humain, méticuleux, pointilleux) — le supérieur
**dont les soupçons ont déclenché la fuite** de Tana. Voie d'accès alternative au
journal (interface de consultation).

**Bureau de l'administrateur Kallan** *(N3)* — **Joreth Kallan** (humain, Corellia,
pragmatique et vénal). Revend des fréquences excédentaires ; a mené la
correspondance du **pot-de-vin** (doc i). Protège le vrai journal **par intérêt**,
sans en connaître le vrai contenu. *« Tant que les chiffres tombent juste, je ne
pose pas de questions inutiles. »*

**Salle de passation Bregman/Voss** *(N3)* — Relève des quarts, source du **journal
de bord (g)** : incidents et vie courante de la station.

**Quartiers & poste de la garnison impériale** *(N3)* — Autorité impériale **visible**
(distincte de l'ISB). **Lt Corin Adrast** (ambitieux, règlement à la lettre quand
ça sert son image) ; **Soldat Denz** (bavard, corruptible, bonne source informelle) ;
**Soldat Ansel Voy** (rigide, contrepoids de Denz) ; **Ss-Lt Pello Rance** (pilote
de la navette de liaison *Aigle du Secteur*).

**Zone d'intervention des commandos** *(N3)* — Base temporaire de l'**équipe ISB
Rennard** quand elle est présente : **la menace antagoniste la plus directe** du
scénario. Voir l'encart « La menace ISB ».

**Niveaux techniques restants** *(N0)* — **Réseau électrique principal (secteur B)** :
lieu de la panne du C19/J133 (bascule de secours trop lente — **complication
réutilisable** : provoquer un black-out isole une zone). **Recyclage d'air (secteur
C)**. **Bornes réseau WN-01/02/03** (mises à jour au cycle 17). **Ateliers de
Kavarel & Bissik**.

**Locaux désaffectés** *(N1)* — **Bazar Ryloth** (échoppe en faillite, casier
locatif jamais réclamé), **ancien bureau des licences** (dossiers papier oubliés),
**coursive B condamnée** (section endommagée, scellée mais pas hermétique) : bonnes
**caches** ou scènes annexes.

> **Encart — La menace ISB (équipe Rennard).**
> - **Agent Ivo Rennard** (humain, Coruscant) : méthodique, sans affect, ne bluffe
>   presque jamais. *« Je ne cherche pas un coupable. Je cherche un fait. »*
> - **Analyste Sorae Vint** (humaine) : obsédée par les données, retrace le rebond.
>   **Sa progression = le compte à rebours.** Plus manipulable que Rennard.
> - **Commando Ferrus** (armure noire, ne parle qu'en accusés de réception) :
>   menace physique.
> - **Commando Skarn** (reconnaissance/infiltration) : peut être **repérée en
>   filature** par des PJ attentifs avant même que l'équipe se déclare.

> **Encart — Équipages de passage (manifeste j & rapport e).**
> - **Fenn Yorrik** — Bothan, capitaine du *Long Sillage*, affréteur régulier classé
>   « suspicion modérée » (e). Ambigu : information et discrétion se négocient.
> - **Ossa Trill** — Mon Calamari, pilote-médecin du *Bacta Express* (évacuations).
> - **Krul Ashen « Widowmaker »** — Weequay, chasseur de primes de passage (j) :
>   source de tension si les PJ croisent sa route ou sa cible.
> - *Autres coques citées : Perce-Brume, Étoile Voilée, Aube Grise.*

---

# 5. ISSUES POSSIBLES ET OUVERTURE

## Les dénouements

Le scénario se joue sur deux tensions : **obtenir** le contenu du journal, et
**repartir** avant que l'ISB ne verrouille la station. Les issues combinent ces deux
axes.

**Réussite discrète (l'idéal).** Les PJ gagnent la confiance de Tana, réunissent les
quatre indices, laissent Bafouille déchiffrer, et **exfiltrent les coordonnées** de
la base dissidente **avant** que Vint ne boucle sa triangulation. La station ignore
tout ; l'ISB arrive trop tard ou repart bredouille. Les PJ tiennent l'avertissement
qui peut sauver la base de la grille L-14.

**Réussite coûteuse.** Les PJ obtiennent l'information mais **laissent une trace** :
un PNJ alarmé, une effraction repérée, une erreur devant Skarn. L'extraction se fait
**sous tension** (course-poursuite, fusillade au quai, black-out provoqué au N0 pour
couvrir la fuite). Ils repartent avec le journal, mais **Rennard sait** désormais où
chercher — et retient leurs visages.

**Échec partiel.** Le déchiffrement échoue ou traîne (indices manqués, Bafouille
endommagé, Tana refuse de coopérer). Les PJ repartent les mains vides ou avec des
fragments inexploitables ; la base dissidente reste sans avertissement.

**Capture.** Un PJ ou **Tana** tombe entre les mains de Rennard. Le journal est saisi
ou détruit ; l'ISB remonte la filière. Si l'ordre *« exécution immédiate »* du J199
est confirmé, la **base de la grille L-14 est frappée** — conséquence lourde à faire
peser sur la suite.

## Le sort de Tana

À moduler selon la relation nouée :
- **Elle part avec les PJ** — nouvelle alliée récurrente de la cellule, précieuse en
  cryptanalyse et connaissance de l'Empire.
- **Elle reste** — pour continuer à écouter depuis Kessel-Tho, source dormante et
  point de contact futur (au prix d'un risque croissant).
- **Elle se sacrifie** — pour couvrir la fuite des PJ ou détruire le journal avant
  l'ISB : fin tragique et marquante, dette morale pour les personnages.

## Ouverture vers le futur

- **L'avertissement.** Les coordonnées L-14 lancent une course : prévenir la base
  dissidente avant la frappe — accroche directe pour la suite de campagne.
- **La traque commence.** Ce que les PJ ont entrevu, c'est la **naissance de
  l'Escadron de la Mort** : l'*Executor* et sa flotte entrent en scène. Le secteur
  n'est plus sûr ; les PJ savent désormais ce qui approche.
- **Une némésis.** Si Rennard a vu leurs visages, il devient un **antagoniste
  récurrent** — patient, méthodique, sans colère et sans oubli.
- **Kessel-Tho, point d'appui.** Selon leurs actes, la station reste une base
  arrière possible (Kallan compromis et donc manipulable, PNJ ralliés, caches des
  locaux désaffectés) — ou un lieu désormais trop chaud pour y remettre les pieds.

---

# ANNEXES

## A. Événements aléatoires de la station

Pour donner vie à la station entre deux temps d'enquête. **Lancez deux dés** (ou 1D
deux fois) : le premier donne le **thème** (1-6), le second l'**événement** (1-6).
Roulez une fois par **quart**, ou dès qu'une scène a besoin de texture. La plupart
sont de l'ambiance ; certains portent un **crochet mécanique** *(horloge ISB §Présentation ;
rayonnements → annexe B ; leviers sociaux)*.

**1 · Quai & vaisseaux**
1. Arrivée du *Perce-Brume* (denrées) : déchargement bruyant, quai encombré une heure.
2. Un remorqueur ramène un caboteur en avarie (écho de l'*Étoile Voilée*) : l'infirmerie est sollicitée.
3. Départ précipité d'un contrebandier sans acquitter ses taxes de quai — Bregman fulmine.
4. Deux vaisseaux non déclarés s'accrochent au loin (règlement de comptes) : **confinement partiel**, quai verrouillé ~2 h.
5. Le *Long Sillage* (Fenn Yorrik) fait escale : rumeurs et marchandages à la cantina.
6. La **passerelle 3 grince** de plus belle ; un docker se tord la cheville, ticket de maintenance relancé (en vain).

**2 · Technique & pannes**
1. Micro-coupure d'éclairage secteur D, réglée en moins d'une heure — mais une porte reste bloquée entre-temps.
2. **Fluctuation du réseau électrique** (secteurs B/C), bascule de secours lente : noir de ~90 s *(diversion possible, cf. horloge ISB)*.
3. Contrôle du recyclage d'air secteur C : léger défaut, odeur de brûlé, secteur évacué 20 min.
4. Antenne AD-01 : micro-coupures des comms extérieures pendant 30 min (senseurs dégradés).
5. Un droïde de maintenance tombe en panne au milieu d'une coursive et bloque le passage.
6. Recalibrage d'antenne par Kavarel : accès à la galerie de maintenance temporairement restreint.

**3 · Personnel & social**
1. Altercation entre deux dockers (manutention ratée) : fin de service anticipée, tension palpable.
2. Kessa Droman sert un plat spécial au mess : tout le monde s'y presse (bon moment social).
3. Rumeur de réduction d'effectifs : le personnel est nerveux, moins bavard.
4. Le centre culturel réclame (encore) des crédits à l'administration ; Maren Estil de mauvaise humeur.
5. Passation Bregman/Voss houleuse : un rapport « oublié » refait surface.
6. Quelqu'un a trop bu à la cantina ; Vezz Nurodo cherche à le faire raccompagner discrètement.

**4 · Sécurité & présence impériale**
1. Contrôle d'identité inopiné au quai (Denz & Voy) : file d'attente, nervosité générale.
2. Le Lt Adrast inspecte un niveau au hasard, pour « faire du zèle » devant l'ISB.
3. Une **silhouette grise** (Skarn ?) est aperçue à un carrefour, puis disparaît. *(Signe d'horloge ISB.)*
4. Patrouille conjointe : Denz bavarde (info gratuite), Voy raccourcit la conversation.
5. Rennard demande à consulter un registre à la capitainerie : l'étau se resserre *(avancer l'horloge ?)*.
6. Fausse alerte capteur : **confinement 15 min**, tout le monde sur les nerfs.

**5 · Commerce & rumeurs**
1. Trik Ossoval propose une « pièce rare » (peut-être utile, peut-être volée).
2. Chessa Vorn fait la tournée de ses débiteurs : on apprend qui est endetté *(levier social)*.
3. Le chasseur de primes *Widowmaker* (Krul Ashen) est de passage : la cantina se tait à son entrée.
4. Hooru Damm livre des vivres frais : petit attroupement, bonne occasion d'écouter des ragots.
5. Fennik Doss reçoit une caisse « non déclarée » à l'armurerie ; il se fait discret.
6. Un colis mal étiqueté circule de main en main à la recherche de son destinataire.

**6 · Ambiance & anodin**
1. Une **tempête électromagnétique** fait grésiller les comms 10 min *(voir annexe B)*.
2. Coupure d'eau chaude aux quartiers : ronchonnements généralisés.
3. Un enfant (rare sur la station) s'est perdu dans une coursive ; qui le raccompagne ?
4. Odeur persistante de caf brûlé au mess ; Kessa s'excuse platement.
5. Un haut-parleur défectueux répète une annonce en boucle jusqu'à ce qu'on le débranche.
6. Rien de notable — la station ronronne. *(Le calme avant quelque chose ?)*

---

## B. Handout — Le message initial de Tana (le « message 0 »)

*Cette section est en pleine largeur (hors mise en page à deux colonnes).*

Point de départ du scénario. Avant de disparaître sous l'alias **Doiron**, Tana a
posté une annonce sur un canal privé de marché noir : en apparence une brocante
banale, mais **une ligne sur deux (les impaires)** forme un message d'alerte à
l'Alliance — procédé **« Sand/Musset »** (un texte anodin dont une ligne sur deux
cache un second message). Un intermédiaire, **le Courtier**, l'a relayé à la
Rébellion : c'est ce qui amène les PJ à Kessel-Tho.

**Volontairement, les coordonnées de la flotte n'y figurent pas** (ni en surface, ni
en caché) : Tana refuse de les confier à un canal ouvert. Il faut la retrouver
physiquement et déchiffrer son journal.

**Le message caché (lignes impaires), en clair :**
- **« Le Faucheur est de sortie »** → le Projet Faucheur est opérationnel et en mouvement.
- **« …trajectoire mesurée et calibrée sur plus de deux semaines »** → elle a suivi et calculé leur trajectoire : elle sait où ils vont.
- **« …à l'écoute notamment chez les / impériaux »** → le canal est surveillé par l'Empire (prudence).
- **« Bafouille … chez la marchande Doiron, quai de Kessel-Tho »** → point de contact et identité de couverture.
- **« Je change de casier tous les jours, situation instable »** → elle est traquée, elle se déplace.
- **« Ne tardez pas, l'offre ne durera pas »** → urgence absolue.

**Le double sens de « impériaux ».** Le mot revient deux fois : en surface c'est la
devise (« crédits impériaux »), mais isolé dans la lecture cachée il se lit « les
Impériaux » — l'Empire. L'effet est voulu.

**Aide si les joueurs bloquent :** les redondances (« nommé Bafouille / chez la
marchande Doiron ») et le mot « impériaux » répété sont des anomalies de rédaction
qui trahissent une structure. Qui connaît la correspondance Sand/Musset trouve
aussitôt — bonne récompense de culture générale.

**À imprimer pour les joueurs :**

> **PETITES ANNONCES — SECTEUR KESSEL**
> *canal privé — lot du cycle*
>
> Le Faucheur est de sortie
> Lots disponibles comme d'habitude, premier arrivé, premier servi
> Il y a du gros et du très gros cette fois-ci avec ces
> lots de convertisseurs d'énergie, état correct, prix 200 crédits
> impériaux, pas de négociation possible
> Aussi disponible un casque de pilote Z-95 avec son émission de
> trajectoire mesurée et calibrée sur plus de deux semaines,
> visière à remplacer, prix 50 crédits impériaux, négociation
> possible
> Containers de pièces de blindage, en gros uniquement. J'espère
> que du monde soit intéressé et à l'écoute notamment chez les
> pirates. Paiement par virement exigé, prix à la tonne 500 crédits
> impériaux
> Droïde astromécano listé en commission, dévoué, compétent nommé
> Bafouille disponible chez la marchande Doiron, quai de Kessel-Tho
> Réservoirs auxiliaires, fuite mineure, bon pour pièces.
> Je change de casier tous les jours, situation instable.
> Livraison main à main uniquement, pas d'intermédiaire.
> Ne tardez pas, l'offre ne durera pas.
> Contactez le Courtier habituel pour les détails.

*Source détaillée (version annotée ligne à ligne, traduction complète) :
`docs/message_initial_tana.docx`.*

---

*Fin du document fusionné. Handouts (d)→(j) fournis séparément.*
