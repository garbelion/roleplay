// Générateur du document fusionné « Signal de Détresse » (docx-js).
// Prérequis : dans ce dossier, `npm init -y && npm i docx@8`, puis `node generate_docx.js`.
// Le contenu de référence (texte) est docs/scenario_fusion_draft.md.
// Embarque la police Star Jedi (titres) directement dans le .docx (police OOXML obfusquée).
const path = require("path");
const fs = require("fs");
// Résout `docx` depuis un node_modules local (ce dossier) ou global.
const docx = require("docx");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, TableOfContents,
  PageBreak, Footer, PageNumber,
} = docx;
let JSZip; try { JSZip = require("jszip"); } catch (e) { JSZip = require(path.join(__dirname, "../empire-os/node_modules/jszip")); }

// ---------- police de titre embarquée ----------
const TITLE_FONT = "Star Jedi";
const FONT_TTF = path.join(__dirname, "../empire-os/src/assets/starjedi/Starjedi.ttf");
const FONT_GUID = "6F5E4D3C-2B1A-4F9C-8B7A-1234567890AB";

// ---------- palette / layout ----------
const H1COL = "26425C", H2COL = "3A5A7A", H3COL = "555555";
const ACCENT = "8A1C1C", BOXFILL = "EEEEE8", ENCFILL = "F4F1E8";
const COL_W = 4592;            // two-column body: usable column width (dxa)
const MARGIN = 1134;           // 2cm

// ---------- inline markdown -> runs ----------
function md(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  const runs = [];
  for (const p of parts) {
    if (!p) continue;
    if (p.startsWith("**") && p.endsWith("**")) runs.push(new TextRun({ text: p.slice(2, -2), bold: true }));
    else if (p.startsWith("*") && p.endsWith("*")) runs.push(new TextRun({ text: p.slice(1, -1), italics: true }));
    else if (p.startsWith("`") && p.endsWith("`")) runs.push(new TextRun({ text: p.slice(1, -1), font: "Consolas", size: 18 }));
    else runs.push(new TextRun({ text: p }));
  }
  return runs;
}

// ---------- paragraph helpers ----------
const P = (t, o = {}) => new Paragraph({ children: md(t), alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, line: 264 }, ...o });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: md(t) });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: md(t) });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: md(t) });
const B = (t) => new Paragraph({ children: md(t), numbering: { reference: "bul", level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 60, line: 260 } });
const NUM = (t) => new Paragraph({ children: md(t), numbering: { reference: "ord", level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 60, line: 260 } });

// ---------- schema (simple boxed flow) ----------
function box(text) {
  return new Table({
    width: { size: COL_W, type: WidthType.DXA },
    columnWidths: [COL_W],
    borders: allBorders("999999", 4),
    rows: [ new TableRow({ children: [ new TableCell({
      width: { size: COL_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: BOXFILL, color: "auto" },
      margins: { top: 40, bottom: 40, left: 80, right: 80 },
      children: [ new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, line: 240 }, children: md(text) }) ],
    }) ] }) ],
  });
}
const arrow = () => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20, after: 20 }, children: [ new TextRun({ text: "▼", color: ACCENT, size: 18 }) ] });
function schema(arr, title, nodes) {
  arr.push(new Paragraph({ spacing: { before: 60, after: 40 }, keepNext: true, children: [ new TextRun({ text: "PLAN — " + title, bold: true, italics: true, size: 17, color: ACCENT }) ] }));
  nodes.forEach((n, i) => { arr.push(box(n)); if (i < nodes.length - 1) arr.push(arrow()); });
  arr.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
}

// ---------- encart (call-out box) ----------
function allBorders(color, size) {
  const b = { style: BorderStyle.SINGLE, size, color };
  return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
}
function encart(arr, title, contentParas) {
  const inner = [];
  if (title) inner.push(new Paragraph({ spacing: { after: 80 }, children: [ new TextRun({ text: title, bold: true, size: 19, color: ACCENT }) ] }));
  contentParas.forEach((p) => inner.push(p));
  arr.push(new Table({
    width: { size: COL_W, type: WidthType.DXA },
    columnWidths: [COL_W],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "D8D2BE" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "D8D2BE" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "D8D2BE" },
      left: { style: BorderStyle.SINGLE, size: 28, color: ACCENT },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: [ new TableRow({ children: [ new TableCell({
      width: { size: COL_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: ENCFILL, color: "auto" },
      margins: { top: 100, bottom: 100, left: 160, right: 140 },
      children: inner,
    }) ] }) ],
  }));
  arr.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
}
// encart content paragraph helpers (tight)
const EP = (t) => new Paragraph({ children: md(t), alignment: AlignmentType.JUSTIFIED, spacing: { after: 60, line: 258 } });
const EB = (t) => new Paragraph({ children: md(t), numbering: { reference: "bul", level: 0 }, spacing: { after: 40, line: 252 } });

// ====================================================================
//  TITLE PAGE
// ====================================================================
const rule = () => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT } }, children: [] });
const title = [
  new Paragraph({ spacing: { before: 2600 }, children: [] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [ new TextRun({ text: "SIGNAL DE DÉTRESSE", bold: true, size: 64, font: TITLE_FONT, color: H1COL }) ] }),
  rule(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [ new TextRun({ text: "Un scénario Star Wars", italics: true, size: 26, color: "333333" }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [ new TextRun({ text: "Station-relais impériale de Kessel-Tho — Bordure Extérieure", italics: true, size: 24, color: "333333" }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 900 }, children: [ new TextRun({ text: "« La naissance de l'Escadron de la Mort »", size: 24, bold: true, color: ACCENT }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [ new TextRun({ text: "« Un signal a rebondi jusqu'ici. L'Empire aussi le cherche. »", italics: true, size: 22, color: "444444" }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1400 }, children: [ new TextRun({ text: "Scénario d'enquête et d'infiltration — à l'usage du Maître de Jeu", size: 18, color: "777777" }) ] }),
];

// ====================================================================
//  TABLE OF CONTENTS
// ====================================================================
const toc = [
  new Paragraph({ spacing: { after: 240 }, children: [ new TextRun({ text: "Sommaire", bold: true, size: 40, font: TITLE_FONT, color: H1COL }) ] }),
  new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-2" }),
];

// ====================================================================
//  BODY (two columns)
// ====================================================================
const b = [];

// ---- 1. PRÉSENTATION ----
b.push(H1("1. Présentation"));
b.push(H2("Le pitch"));
b.push(P("Un signal de détresse chiffré a fini par atteindre les personnages-joueurs. Il ne vient pas d'un vaisseau en perte de puissance, mais d'une femme qui sait quelque chose que l'Empire tuerait pour enterrer. Sur une petite station-relais oubliée en bordure du secteur de Kessel, une technicienne du nom de **Tana Wrey** a intercepté, quart après quart, les fragments d'une opération militaire de très grande ampleur : le **Projet Faucheur**."));
b.push(P("Traquée par ses propres soupçons autant que par ceux de son supérieur, Tana s'est effacée derrière un alias — **Doiron**, tenancière d'une modeste échoppe du quai. Elle a dispersé aux quatre coins de la station les clés qui permettent de lire ce qu'elle a caché, de sorte que personne — pas même elle — ne puisse tout livrer sous la contrainte. Les PJ devront gagner sa confiance, reconstituer ces clés en résolvant quatre énigmes physiques, et exfiltrer l'information **avant** qu'une équipe du Bureau de Sécurité Impériale (ISB), déjà en route, ne remonte la trace du signal jusqu'à eux."));

b.push(H2("Le contexte : le Projet Faucheur"));
b.push(P("Ce que Tana a assemblé sans le vouloir, c'est le portrait en creux de la **naissance de l'Escadron de la Mort** : la sortie de chantier d'un bâtiment « hors normes, aucune désignation officielle » en orbite de **Fondor** — le Super Destroyer Stellaire *Executor* — et le déploiement d'une flotte chargée de ratisser méthodiquement une portion de la Bordure Extérieure à la recherche d'une **base dissidente**. Les entrées les plus récentes parlent d'une flotte « maintenue en position, prête à exécution sur ordre », puis d'un dernier fragment avant brouillage : *« …si confirmation reçue, exécution immédiate… »*."));
b.push(P("Autrement dit : les coordonnées cachées dans le journal de Tana pointent vers une cible que l'Empire s'apprête à frapper. Les PJ ne mettent pas seulement la main sur un secret — ils tiennent peut-être le seul avertissement capable de sauver une base entière."));
encart(b, "La station Kessel-Tho", [
  EP("Station-relais de communication de la Bordure Extérieure, sur une route commerciale secondaire de Kessel. Cinq niveaux superposés :"),
  EB("**N4** — Communications"),
  EB("**N3** — Administration & sécurité"),
  EB("**N2** — Vie quotidienne"),
  EB("**N1** — Amarrage & commerce"),
  EB("**N0** — Soubassement technique"),
  EP("Une colonne de sécurité blindée relie directement le commandement (N4/N3) au niveau technique (N0) sans traverser les niveaux civils."),
]);

b.push(H2("Comment fonctionne l'enquête"));
b.push(P("Le point de départ est la **boutique de Doiron** (N1). Tana y a laissé un **message (0)** — un datapad — qui, une fois consulté, oriente vers **quatre contacts**. Chaque contact garde, sans le savoir, l'un des quatre **indices** physiques que Tana a dissimulés :"));
b.push(B("**(a) Faux clients** — Centre culturel (Maren Estil) : donne les **3 alias** à cibler dans le journal."));
b.push(B("**(b) Fresque** — Galerie de maintenance (Dosh Kavarel) : phrase **ORPHELINS** (clé des Coordonnées)."));
b.push(B("**(c) Pentaminos** — Centre sportif (Grash Meloi) : phrase **JENESUISPLUSSEULEICI** (clé des Messages)."));
b.push(B("**(d) Annonces du mess** — Mess (Kessa Droman) : clé maître **RépubliqueRetour** + **Argon2**."));
b.push(P("Une fois les paramètres réunis, c'est le droïde **Bafouille** (ou l'outil `bafouille.exe` fourni au MJ) qui effectue les calculs et restitue en clair les **18 entrées** cachées de Tana parmi les 78 lignes du **journal (document d)**, isolé dans la **DMZ** du niveau 0. *Le jeu, c'est la résolution des énigmes — pas la cryptographie : les joueurs fournissent les paramètres, la machine calcule.*"));
encart(b, "⚠ Attention à la lettre « (d) »", [
  EP("Dans les documents source, « (d) » désigne **deux choses distinctes** : la **4ᵉ énigme** (les annonces du mess) **et** le **journal chiffré** (document d, le trésor final). Ce document conserve les deux libellés d'origine ; ne les confondez pas en jeu."),
]);

b.push(H2("La menace : l'horloge ISB (la triangulation)"));
b.push(P("Le **moteur de tension** du scénario. Une équipe restreinte du **Bureau de Sécurité Impériale** — l'agent **Rennard**, l'analyste **Sorae Vint**, les commandos **Ferrus & Skarn** (fiches en §4.7) — ratisse le secteur. Vint retrace pas à pas le **rebond de fréquence** qui a trahi l'interception. Ce n'est pas « l'Empire soupçonne les PJ » : c'est l'Empire qui **resserre l'endroit** d'où le signal est parti — et cet endroit converge vers Kessel-Tho, puis la DMZ et le journal, puis Tana et ceux qui l'aident. La triangulation est **inexorable** : elle avance toujours."));
b.push(P("**La piste — 6 crans.** L'horloge démarre au **cran 2** (l'équipe arrive sur Kessel-Tho, parmi d'autres stations ratissées). Chaque cran change concrètement la situation :"));
b.push(B("**Cran 1 — Ratissage large.** L'équipe est encore ailleurs dans le secteur. *(Départ possible pour une intro plus lente.)*"));
b.push(B("**Cran 2 — Arrivée.** Rennard prend ses quartiers (zone commandos, N3). Skarn amorce une reconnaissance discrète du quai et des niveaux publics. *Départ recommandé.*"));
b.push(B("**Cran 3 — Corrélation.** Vint relie le rebond à Kessel-Tho précisément. Contrôles d'accès renforcés ; premiers entretiens avec le personnel (Aashe, Kallan, garnison)."));
b.push(B("**Cran 4 — Le trafic de fréquences.** Rennard réquisitionne les registres (capitainerie, transmissions). **Tout départ de vaisseau exige désormais un feu vert de l'ISB.** L'étau se resserre sur la DMZ."));
b.push(B("**Cran 5 — Les faux clients.** Vint isole l'anomalie des trois alias. L'ISB cherche activement « Doiron » : la boutique est surveillée, les contacts de Tana (re)interrogés."));
b.push(B("**Cran 6 — VERROUILLAGE.** Station bouclée : quais fermés, tout départ inspecté, Ferrus et Skarn en intervention. Chasse ouverte à Tana et à quiconque la couvre. *Le climax se joue maintenant, de gré ou de force.*"));
keyHead("Ce qui fait avancer l'horloge")(b);
b.push(B("**Avance passive (le temps) :** +1 cran par **quart** écoulé (~8 h de fiction). À défaut de suivre l'heure, comptez +1 après chaque **scène-clé** (indice bouclé, changement de niveau majeur). L'horloge ne recule jamais d'elle-même."));
b.push(B("**Bavure mineure (+1) :** une question de trop qui remonte (interroger un impérial ou un PNJ prudent sur Tana / Doiron / les fréquences) ; un jet social raté devant un uniforme ; se faire remarquer au quai ou au marché gris ; un achat voyant à l'armurerie."));
b.push(B("**Bavure majeure (+2) :** effraction repérée (DMZ, bureau Kallan, terminal des transmissions) ; alarme déclenchée ; PNJ alarmé qui alerte la garnison ou l'ISB ; violence ou arme dégainée en public ; **trace numérique laissée au slicing** (échec critique en Sécurité / Programmation)."));
keyHead("Ce qui peut la ralentir (−1, une fois chacun)")(b);
b.push(B("**Désinformation active :** planter une fausse piste crédible — faire porter le rebond au *Long Sillage* déjà « suspecté » (rapport e), brouiller une borne WN, falsifier un registre."));
b.push(B("**Holt Marek de l'intérieur :** exploiter les procédures ISB (faux ordre, lenteur administrative provoquée) — −1 sur un jet de *Bureaucratie impériale* réussi."));
b.push(B("**Diversion coûteuse :** provoquer un incident de station (cf. table d'événements ; ex. panne électrique C19/J133) qui accapare l'attention — gare aux dégâts collatéraux."));
b.push(P("**Signes à télégraphier** *(faire sentir l'horloge sans montrer le chiffre)* : une silhouette grise (Skarn) aperçue deux fois ; le personnel plus nerveux, moins bavard ; un contrôle d'identité au quai qui n'y était pas la veille ; l'annonce que « les départs sont soumis à autorisation ». Chaque montée d'un cran mérite un signe concret."));
b.push(P("**Pilotage & variantes.** Gardez le compteur caché ; laissez les joueurs lire la pression aux signes. One-shot tendu : démarrez au **cran 3**. Intro posée : **cran 1**. Une **tempête de rayonnements** (cf. table météo) peut geler l'avance passive d'un quart — répit ambigu, car les comms des PJ sautent aussi."));

b.push(H2("Conseils de conduite"));
b.push(B("**Tana observe avant d'aider.** Elle jauge les PJ depuis sa boutique buggée ; sa coopération se mérite. Tant qu'elle n'a pas décidé, elle joue Doiron la marchande."));
b.push(B("**Les quatre indices sont indépendants** : l'ordre de résolution n'a pas d'importance mécanique. L'ordre présenté ici est le plus probable, pas le seul."));
b.push(B("**Les PNJ gardiens des indices ignorent leur sens.** Ils coopèrent si on les aborde avec tact et/ou si on leur montre le datapad (0)."));
b.push(B("**Les handouts (d)→(j)** existent comme documents séparés à distribuer selon les fouilles des PJ ; ils ne sont pas reproduits ici."));

// ---- 2. CHRONOLOGIE ----
b.push(H1("2. Chronologie des événements"));
b.push(P("*Le calendrier local se compte en cycles et en jours. Trois fils se superposent : ce que le journal de Tana révèle, la vie récente de la station, et le présent du scénario.*"));
b.push(H2("Ce que révèle le journal (arrière-plan, C18-C19)"));
b.push(B("**C18 / J058** — Première mention : *« Faucheur activé selon calendrier. »*"));
b.push(B("**C18 / J140** — Ratissage systématique du **Bras Occidental** engagé."));
b.push(B("**C18 / J145** — *« Essais finaux du châssis en orbite de Fondor. Dimensions hors normes… »* → l'*Executor* en construction."));
b.push(B("**C18 / J160-298** — Le ratissage s'enlise ; premiers signes d'**activité dissidente** (grille L-14)."));
b.push(B("**C19 / J020** — *« Signature compatible avec une base dissidente établie. »*"));
b.push(B("**C19 / J030** — *« Le chantier de Fondor confirme la sortie de dock de l'*Executor*. »*"));
b.push(B("**C19 / J089** — *« Le Faucheur se repositionne. Flotte principale en approche. »*"));
b.push(B("**C19 / J178** — *« Autorisation de frappe en attente de confirmation finale. »*"));
b.push(B("**C19 / J199** — Dernier fragment avant brouillage : *« …si confirmation reçue, exécution immédiate… »* — **c'est le signal que Tana a intercepté**, et dont le rebond a alerté l'ISB."));
b.push(H2("La station, récemment (journal de nuit, doc g)"));
b.push(B("**C19 / J121** — Altercation entre techniciens de quai (incident disciplinaire)."));
b.push(B("**C19 / J133** — **Panne électrique majeure** (secteurs B/C) ; bascule de secours anormalement lente — réseau jugé préoccupant."));
b.push(B("**C19 / J140** — Deux vaisseaux non identifiés s'accrochent près de la station (règlement de comptes de contrebandiers)."));
b.push(B("**C19 / J149** — **Signal de détresse** du caboteur *Étoile Voilée*, remorqué et amarré en urgence."));
b.push(B("**C19 / J150** — Situation nominale ; la **passerelle 3 grince** toujours (marronnier)."));
b.push(H2("Le présent du scénario"));
b.push(NUM("Les soupçons de **Torvin Aashe** (supérieur de Tana) la poussent à disparaître derrière l'alias **Doiron** et à disperser ses indices."));
b.push(NUM("Le rebond du signal du J199 alerte le Bureau : l'équipe **Rennard** est dépêchée dans le secteur."));
b.push(NUM("Le **signal de détresse chiffré** de Tana atteint les PJ, qui gagnent Kessel-Tho."));
b.push(NUM("**Le scénario commence** à leur arrivée au quai. L'horloge ISB tourne déjà."));

// ---- 3. PERSONNAGES PRÉ-TIRÉS ----
function pc(name, sub, lines) {
  b.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: md(name) }));
  b.push(new Paragraph({ spacing: { after: 70 }, children: [ new TextRun({ text: sub, italics: true, color: H2COL, size: 18 }) ] }));
  lines.forEach((l) => b.push(new Paragraph({ spacing: { after: 24, line: 246 }, alignment: AlignmentType.JUSTIFIED, children: md(l) })));
  b.push(new Paragraph({ spacing: { after: 150 }, children: [] }));
}
b.push(H1("3. Personnages pré-tirés"));
b.push(P("Les personnages forment l'équipage du **Murmure**, un petit cargo léger qui a capté le signal de détresse chiffré de Tana et mis le cap sur Kessel-Tho. Le MJ les rattache à l'**Alliance naissante** (cellule affiliée) ou les garde **francs-tireurs** selon sa campagne. Toute sous-partie de 4 à 6 de ces profils forme un groupe jouable."));
b.push(P("**Répartition des rôles.** Meneuse (Renna) · slicer (Dax) · infiltration (Yssha) · pilotage & extraction (Bren) · force & procédures impériales (Holt) · soins, savoir & lien avec Alderaan (Ithra)."));
encart(b, null, [
  EP("*Profils bâtis sur le gabarit standard **Star Wars D6** (West End Games, édition révisée) : 18D d'attributs, ~7D de compétences, Déplacement 10. Ajustez librement. Attributs : Dextérité, Perception, Savoir, Vigueur, Mécanique, Technique. Les compétences non citées valent la valeur de leur attribut.*"),
]);
pc("Renna Calder — Agent de liaison *(meneuse)*", "Humaine · femme · Chandrila · commandement, contacts, baratin", [
  "**DEXTÉRITÉ 2D+2** — Blaster 3D+2, Esquive 3D+2",
  "**PERCEPTION 4D** — Baratin 5D, Commandement 5D, Marchandage 4D+2, Persuasion 4D+2",
  "**SAVOIR 3D** — Bureaucratie impériale 4D, Cultures 4D, Systèmes planétaires 3D+2",
  "**VIGUEUR 2D**",
  "**MÉCANIQUE 3D** — Communications 4D, Sensoreurs 3D+2",
  "**TECHNIQUE 3D+1** — Sécurité 3D+2",
  "**Déplacement** 10 · **Points de Force** 1 · **Points de Personnage** 5",
  "**Équipement** — blaster léger (holster discret), comlink chiffré, datapad de faux ordres, code-cylindre volé (périmé)",
  "*Accroche — c'est elle qui a décodé l'en-tête du signal de Tana. Convaincue qu'il y a « plus gros que nous » derrière ; porte le poids de mener vers le danger des gens qu'elle aime.*",
]);
pc("Dax « Fil » Orrin — Slicer / technicien", "Humain · homme · Corellia · réseaux, déchiffrement, portes verrouillées", [
  "**DEXTÉRITÉ 2D** — Esquive 2D+2",
  "**PERCEPTION 3D** — Fouille 3D+2, Discrétion 3D+1",
  "**SAVOIR 3D** — Valeur (milieu) 3D+2, Technologie 4D",
  "**VIGUEUR 2D**",
  "**MÉCANIQUE 3D** — Communications 3D+2",
  "**TECHNIQUE 5D** — Programmation/réparation d'ordinateurs 6D, Sécurité 5D+2, Réparation de droïdes 5D+1",
  "**Déplacement** 10 · **Points de Force** 1 · **Points de Personnage** 5",
  "**Équipement** — datapad de slicing, kit de crochetage électronique (spikes), multitool, comlink",
  "*Accroche — le seul à pouvoir dialoguer avec Bafouille d'égal à égal, et à mesurer ce qu'implique un déchiffrement Argon2. Tendance à foncer sur un terminal en oubliant la discrétion.*",
]);
pc("Yssha Vel — Éclaireuse / infiltratrice", "Twi'lek · femme · Ryloth · discrétion, filature, repérage", [
  "**DEXTÉRITÉ 4D** — Blaster 4D+1, Corps à corps 4D+1, Esquive 4D+2",
  "**PERCEPTION 4D** — Discrétion 5D+1, Fouille 4D+2, Pickpocket 4D+1",
  "**SAVOIR 2D** — Langues 2D+2",
  "**VIGUEUR 3D** — Escalade/saut 3D+2",
  "**MÉCANIQUE 2D**",
  "**TECHNIQUE 3D** — Sécurité 3D+2",
  "*Capacité twi'lek — communication discrète par micro-mouvements des lekku.*",
  "**Déplacement** 10 · **Points de Force** 1 · **Points de Personnage** 5",
  "**Équipement** — blaster hold-out, combinaison souple sombre, brouilleur de capteurs de proximité, macrojumelles",
  "*Accroche — repère la filature de la commando Skarn avant tout le monde… si on l'écoute. A appris la discrétion en fuyant les rafles impériales de Ryloth.*",
]);
pc("Bren Sarkori — Pilote / franc-tireur", "Humain · homme · Nar Shaddaa · pilotage, extraction, sang-froid", [
  "**DEXTÉRITÉ 3D** — Blaster 4D, Esquive 3D+2",
  "**PERCEPTION 3D** — Baratin 3D+2, Jeu 3D+2",
  "**SAVOIR 2D** — Astrographie 2D+2",
  "**VIGUEUR 2D+2**",
  "**MÉCANIQUE 4D** — Pilotage spatial 5D, Artillerie spatiale 4D+2, Astrogation 4D+1, Sensoreurs 4D",
  "**TECHNIQUE 3D+1** — Réparation de vaisseaux 4D",
  "**Déplacement** 10 · **Points de Force** 1 · **Points de Personnage** 5",
  "**Équipement** — blaster lourd, veste de vol, comlink, les clés du *Murmure*",
  "*Accroche — capitaine-pilote du Murmure. Garde le vaisseau chaud sur l'aire d'amarrage : le plan d'extraction, c'est lui. Déteste rester à quai à attendre.*",
]);
pc("Holt Marek — Ancien sergent impérial *(déserteur)*", "Humain · homme · monde de garnison · force, sécurité, procédures impériales", [
  "**DEXTÉRITÉ 4D** — Blaster 5D, Armes lourdes 4D+2, Esquive 4D+1",
  "**PERCEPTION 3D** — Commandement 3D+2, Intimidation 4D",
  "**SAVOIR 3D** — Bureaucratie impériale 3D+2, Tactique militaire 3D+2",
  "**VIGUEUR 3D** — Bagarre 4D, Encaissement 4D",
  "**MÉCANIQUE 2D**",
  "**TECHNIQUE 3D** — Sécurité 4D, Premiers soins 3D+2",
  "**Déplacement** 10 · **Points de Force** 1 · **Points de Personnage** 5",
  "**Équipement** — blaster E-11 « emprunté », armure légère sous vareuse civile, code-cylindre impérial périmé, plaques d'identité arrachées",
  "*Accroche — connaît de l'intérieur les protocoles d'une station-relais et les manies de l'ISB : inestimable pour lire la menace Rennard. Chaque uniforme impérial croisé réveille ce qu'il a fui.*",
]);
pc("Ithra Wen — Médecin de bord / érudite", "Humaine · femme · réfugiée d'Alderaan · soins, savoir, histoire alderaanienne", [
  "**DEXTÉRITÉ 2D** — Esquive 2D+2",
  "**PERCEPTION 3D** — Baratin 3D+2, Persuasion 4D",
  "**SAVOIR 4D** — Cultures 5D, Histoire alderaanienne & républicaine 5D, Langues 4D+2",
  "**VIGUEUR 3D**",
  "**MÉCANIQUE 2D**",
  "**TECHNIQUE 4D** — Premiers soins 5D, (A) Médecine 4D+2",
  "**Déplacement** 10 · **Points de Force** 2 · **Points de Personnage** 5",
  "**Équipement** — trousse médicale de campagne, injecteurs de stims, exemplaire annoté d'un ouvrage d'histoire alderaanienne",
  "*Accroche — comme Tana, elle a vu Alderaan mourir. C'est elle qui reconnaît d'emblée les trois noms de l'indice (a) comme des figures réelles, et qui gagnera le plus vite la confiance de Tana. Le deuil la rend parfois imprudente face à l'Empire.*",
]);

// ---- 4. LES LIEUX ----
b.push(H1("4. Les lieux de la station"));
b.push(P("*Parcourus dans l'ordre de visite le plus probable. Pour chaque lieu : une **description**, les **éléments-clés** du scénario, un **plan** schématique, et les **PNJ** rencontrés. Les lieux purement secondaires sont regroupés en fin de section.*"));

function lieu(arr, num, titre, blocks) {
  arr.push(H2(num + " — " + titre));
  blocks.forEach((fn) => fn(arr));
}
function descP(t){ return (a)=> a.push(new Paragraph({ spacing:{after:80,line:264}, alignment:AlignmentType.JUSTIFIED, children:[ new TextRun({text:"Description. ",bold:true,color:H2COL}), ...md(t) ] })); }
function keyHead(t){ return (a)=> a.push(new Paragraph({ spacing:{before:40,after:60}, keepNext:true, children:[ new TextRun({text:t,bold:true,color:ACCENT,size:19}) ] })); }
function para(t){ return (a)=> a.push(P(t)); }
function bul(t){ return (a)=> a.push(B(t)); }
function sch(t,nodes){ return (a)=> schema(a,t,nodes); }
function pnjHead(){ return (a)=> a.push(new Paragraph({ spacing:{before:40,after:40}, keepNext:true, children:[ new TextRun({text:"PNJ",bold:true,color:H2COL,size:19}) ] })); }

// 4.0 Quai
lieu(b, "4.0", "Quai principal & Capitainerie *(N1 — arrivée)*", [
  descP("Le point d'entrée de la station : sas d'amarrage, quai principal et **passerelle 3** (qui grince depuis des cycles, jamais réparée). La **capitainerie** attenante tient les registres d'entrée/sortie des vaisseaux. Ambiance de bordure : néons fatigués, odeur de carburant froid, personnel de quart débordé."),
  keyHead("Éléments-clés"),
  bul("Premier contact des PJ avec la station : contrôle d'amarrage, formalités sommaires. Bonne scène d'introduction et de prise de température."),
  bul("La **capitainerie** permet de recouper les mouvements de vaisseaux avec le **rapport d'analyse de trafic (doc e)** et le **manifeste de fret (doc j)** : un PJ méthodique peut y repérer le *Long Sillage* (« suspicion modérée ») ou les passages de chasseurs de primes."),
  bul("**Amorce de tension** : c'est aussi par ce quai qu'arrivera l'équipe ISB. Le MJ peut y semer un premier signe (navette de liaison inhabituelle, la **commando Skarn** en reconnaissance discrète)."),
  sch("Quai (N1)", ["Sas d'amarrage", "Passerelle 3 (grince)", "Quai principal", "Guichet capitainerie — registres (e / j)", "Vers échoppes du quai · ascenseur central"]),
  pnjHead(),
  bul("**Nills Bregman** — humain, contremaître du **quart de nuit**. Consciencieux, protecteur de son équipe. Auteur du journal de bord (g). *« Un quart calme, c'est un quart où personne n'a besoin de moi. »*"),
  bul("**Elin Voss** — Devaronienne, contremaîtresse du **quart de jour**, plus bavarde. Source complémentaire sur la vie diurne. *« Bregman note tout, sauf l'essentiel. »*"),
]);

// 4.1 Doiron
lieu(b, "4.1", "Boutique de Doiron *(N1 — le point de départ)*", [
  descP("Une devanture modeste coincée entre deux échoppes du quai : pièces détachées, bricoles d'occasion, un comptoir encombré et un astromécano cabossé qui cliquette dans un coin. Rien n'y attire l'œil — c'est exactement le but."),
  keyHead("Éléments-clés"),
  bul("**Point de départ de toute l'enquête.** Le **message (0)** y est laissé sur un datapad ; consulté, il oriente vers les **quatre contacts** en termes voilés (« mes lectures du mois », « ma marque là où il travaille », « mes jeux d'hiver, casier 12-3-20 », le mess)."),
  bul("**La boutique est buggée par Tana elle-même.** Elle **observe les PJ** dès leur arrivée et jauge leur fiabilité avant de se dévoiler. Selon leur comportement, elle se révèle tôt (aide active) ou reste Doiron la marchande méfiante."),
  bul("Le datapad (0) sert aussi de **laissez-passer social** : le montrer aux PNJ gardiens lève leurs réticences."),
  sch("Boutique", ["Devanture / quai", "Comptoir — datapad (0)", "Arrière-boutique — Bafouille + poste d'observation caché de Tana"]),
  pnjHead(),
  bul("**Tana Wrey (alias Doiron)** — humaine, Alderaan, ~25 ans, mains tachées d'encre et de peinture, veste trop grande. Vive, méthodique jusqu'à l'obsession, marquée par la perte d'Alderaan. **Cœur de l'intrigue.** *« Je n'ai pas fui Alderaan pour regarder l'Empire recommencer ailleurs sans rien dire. »*"),
  bul("**Bafouille** — astromécano série R rafistolé, roue voilée au cliquetis caractéristique. Loyal à Tana au-delà de toute logique ; comprend plus qu'il n'en montre. C'est lui qui **assemble les clés et déchiffre**. *(Bips ≈ « Ça dépend qui demande. »)*"),
]);

// 4.2 Culturel
lieu(b, "4.2", "Centre culturel *(N2 — indice a)*", [
  descP("La petite bibliothèque de la station, tenue avec soin par une Alderaanienne exilée. Rayonnages serrés, quelques ouvrages d'histoire républicaine, une table de lecture. Un îlot de calme dans une station utilitaire."),
  keyHead("Éléments-clés — INDICE (a), « Les faux clients »"),
  bul("Tana a emprunté *« Histoire d'Alderaan des origines à la Haute République »* et **glissé entre ses pages une liste manuscrite de trois noms** : **Ulic Qel-Droma**, **Liana Merian**, **Agrippa Aldrete** — figures secondaires alderaaniennes (Jedi / sénateurs) vérifiables mais obscures."),
  bul("Ce sont les **trois alias** sous lesquels Tana a caché ses entrées. Comprendre que ce sont de **vrais noms historiques** est la clé : cela permet de cibler **18 entrées** au lieu de trier 78 lignes à la main."),
  bul("Le livre est **toujours dans le rayon** (Tana ne l'a pas rendu). *Sans (a) : 1 h de transfert du journal entier + tri manuel.*"),
  sch("Centre culturel", ["Entrée", "Comptoir — Maren Estil", "Rayon Histoire — le livre + liste manuscrite (3 noms)", "Table de lecture"]),
  pnjHead(),
  bul("**Maren Estil** — humaine, Alderaan, ~60 ans, chignon gris, châle alderaanien. Passionnée d'histoire républicaine. Confirme l'emprunt de Tana si on lui montre le datapad (0) ; ignore le sens des annotations. *« Un livre d'histoire, ça se manipule avec des mains propres et un esprit ouvert. »*"),
]);

// 4.3 Mess
lieu(b, "4.3", "Mess du personnel *(N2 — indice d, la clé maître)*", [
  descP("La cantine commune, cœur de la vie sociale : tablées bruyantes, odeur de caf noir, un grand **tableau d'affichage** couvert de petites annonces. Tenu par une Zabrak chaleureuse qui entend tout sans en avoir l'air."),
  keyHead("Éléments-clés — INDICE (d), « Les petites annonces »"),
  bul("Six annonces épinglées, mêlées à d'autres, forment **trois paires**. Pour chaque paire, **seuls les mots communs aux deux annonces** composent le message : Paire 1-2 → *« Le début de la clé est République »* ; Paire 3-4 → *« La deuxième moitié est retour »* ; Paire 5-6 → *« Pour dériver, prendre Argon2 »*."),
  bul("**Solution assemblée** : clé maître **« RépubliqueRetour »** (16 caractères) + algorithme **Argon2**. C'est le socle de tous les déchiffrements."),
  bul("Les six annonces ont un **style homogène** (mêmes doigts) : les repérer comme un ensemble fait partie de l'énigme. L'annonce 6 (« Vendu chez Doiron ») **renvoie clin d'œil vers le point de départ**."),
  para("*Handout recommandé : les six annonces sur des bouts de papier séparés — les comparer côte à côte est bien plus efficace qu'une lecture à voix haute.*"),
  sch("Mess", ["Comptoir — Kessa Droman", "Tablées", "Tableau d'affichage — 6 annonces en 3 paires (parmi le bruit)"]),
  pnjHead(),
  bul("**Kessa Droman** — Zabrak, Iridonia, tatouages estompés, sourire facile, observatrice redoutable. **Quatrième contact** de Tana. Sait qu'elle passe épingler des annonces, sans en connaître le contenu. *« Ici, on nourrit tout le monde pareil. »*"),
]);

// 4.4 Galerie
lieu(b, "4.4", "Galerie de maintenance *(N0 — indice b)*", [
  descP("Un corridor technique du soubassement, éclairage cru, faisceaux de câbles. Sur un pan de mur, incongrue, une **fresque** peinte : les jardins du palais du Vice-roi d'Alderaan. L'administration l'a tolérée comme « dégradation esthétique sans conséquence »."),
  keyHead("Éléments-clés — INDICE (b), « La fresque stéganographique »"),
  bul("La fresque cache deux éléments : la **façade du palais** (4 étages × 5 fenêtres), dont **neuf fenêtres sont allumées** selon un **dégradé de teinte** (du plus pâle au plus sombre) ; et, séparé dans le couloir, un **graffiti-grille 4×5** qui sert de **légende** — un **carré de Polybe à mot-clé LOTUS**."),
  bul("En lisant les neuf fenêtres **dans l'ordre du dégradé** et en les décodant via la grille, on obtient la phrase de passe **ORPHELINS** → clé des **Coordonnées** du journal."),
  bul("**Dosh Kavarel** ne montre le mur que si on l'aborde avec tact ; pour lui, c'est juste « le mur que la fille aimait peindre »."),
  para("*Handouts : (1) photo de la fresque aux neuf fenêtres allumées, (2) photo du graffiti-grille.*"),
  sch("Galerie (N0)", ["Couloir — graffiti-grille 4×5 (Polybe / LOTUS)", "Fresque — façade 4×5, 9 fenêtres allumées en dégradé", "Lecture ordonnée → ORPHELINS"]),
  pnjHead(),
  bul("**Dosh Kavarel** — Duros, taciturne, peu curieux. Technicien antennes / maintenance ; connaît Tana de longue date sans s'être interrogé. *« Elle peint, je répare. On n'a jamais eu besoin de se poser plus de questions. »*"),
]);

// 4.5 Sportif
lieu(b, "4.5", "Centre sportif *(N2 — indice c)*", [
  descP("Une salle d'entraînement fonctionnelle et des vestiaires alignés de casiers métalliques, tenue par un Trandoshan bourru attaché à la propreté et à la discipline. Odeur de métal et de désinfectant."),
  keyHead("Éléments-clés — INDICE (c), « Le puzzle pentaminos »"),
  bul("Le **casier 12-3-20** (mnémonique : 12 pentaminos, 3 rangées, 20 colonnes) contient un **puzzle physique** : assembler les 12 pentaminos en rectangle 3×20. Il n'existe que **deux solutions** ; Tana a peint des lettres sur les pièces."),
  bul("**Une seule** solution fait apparaître une phrase cohérente sur la ligne centrale : **JENESUISPLUSSEULEICI** → clé des **Messages** du journal."),
  bul("**Piège volontaire** : les six premières lettres (JENESU) sont identiques dans les deux solutions ; la mauvaise vire ensuite au charabia. Un joueur peut croire avoir réussi avant de buter sur le milieu."),
  bul("Grash Meloi ouvre le casier si on lui montre le datapad (0) ; il ignore ce qu'il contient (« c'était pour un ami qui passerait le chercher »)."),
  sch("Centre sportif", ["Salle d'entraînement", "Vestiaires — casier 12-3-20", "Puzzle 3×20 → ligne centrale = JENESUISPLUSSEULEICI"]),
  pnjHead(),
  bul("**Grash Meloi** — Trandoshan, bourru mais juste, respecte l'effort et méprise la paresse. Gère les casiers. *« Un casier qui reste fermé un an, ce n'est pas mes affaires. Un casier qui déborde, ça l'est. »*"),
]);

// 4.6 DMZ
lieu(b, "4.6", "Locaux des ingénieurs & serveur DMZ *(N0 — le journal)*", [
  descP("Au plus bas de la station, la **zone démilitarisée (DMZ)** : systèmes critiques isolés du réseau commercial courant, salle serveur froide et bruyante, accès contrôlé. Le point sensible et la fin logique du parcours."),
  keyHead("Éléments-clés — LE JOURNAL (document d)"),
  bul("C'est **ici** qu'est stocké, isolé en DMZ, le **journal de facturation illégale** de l'administrateur **Kallan** — celui dans lequel Tana a dissimulé ses **18 entrées** sous les trois faux alias. Kallan le **protège sans le savoir** (par intérêt : c'est aussi son registre de fréquences revendues au noir)."),
  bul("Une fois sur place avec les **quatre indices**, **Bafouille assemble** : RépubliqueRetour + Argon2 + **ORPHELINS** → clé des Coordonnées ; RépubliqueRetour + Argon2 + **JENESUISPLUSSEULEICI** → clé des Messages ; et (a) désigne **quelles 18 entrées** parmi 78 déchiffrer."),
  bul("Le résultat : les messages en clair du Projet Faucheur **et les coordonnées** de la base dissidente menacée (grille **L-14**, sous-secteur 4, proche de la balise Kessel Secondaire)."),
  bul("**Accès** — deux voies : la **colonne de sécurité** blindée depuis N4/N3 (rapide mais surveillée), ou, plus discret socialement mais risqué, le **terminal de la salle de contrôle des transmissions** (N4) sous l'œil d'Aashe. Présence probable de Kavarel / Bissik ou de la garnison à proximité."),
  sch("N0 — DMZ", ["Colonne de sécurité (depuis N3 / N4)", "Sas contrôlé", "Salle serveur — journal (d), isolé", "Voie alternative : terminal salle transmissions (N4)"]),
  pnjHead(),
  bul("**Naro Bissik** — Sullustan, vif, curieux, bavard sur la technique. En charge du **réseau interne** (bornes WN-01/02/03) ; complémentaire de Kavarel. Allié involontaire (adore les systèmes bien conçus) ou obstacle. *« Un réseau mal segmenté, c'est comme une porte laissée entrouverte. »*"),
]);

// 4.7 Secondaires
b.push(H2("4.7 — Lieux secondaires *(encarts)*"));
b.push(P("*Décors d'appui, sources d'information et de tension. À piocher selon les besoins.*"));
b.push(B("**Cantina Le Sas** *(N1)* — Bar des équipages de passage, distinct du mess. **Vezz Nurodo** (Gran, trois yeux, jovial) y surveille toute la salle. Meilleure source de **rumeurs** sur visiteurs, chasseurs de primes et contrebandiers (j)."));
b.push(B("**Échoppe de Trik Ossoval** *(N1)* — Brocante et **recel** de pièces (Rodien retors mais pas malhonnête). Matériel hors circuit, rumeurs sur les vaisseaux."));
b.push(B("**Commerce de Hooru Damm** *(N1)* — Vivres et équipement courant (Ithorien doux et patient). Fournisseur du mess et des livraisons fraîches (j)."));
b.push(B("**Armurerie de Fennik Doss** *(N1)* — Armes légères et protection, marché gris toléré. Tenancier méfiant, peu bavard."));
b.push(B("**Comptoir de change de Chessa Vorn** *(N1)* — Change et prêts sur gages (Muun froide). **Sait qui a des dettes** — bon **levier** sur un PNJ endetté."));
b.push(B("**Infirmerie** *(N2)* — **Docteure Lyra Senn** (Twi'lek, calme, discrète). A soigné l'équipage de l'*Étoile Voilée* (g) ; reçoit les évacuations du *Bacta Express*. Discrétion à toute épreuve."));
b.push(B("**Atelier de droïdes « Rouages »** *(N1)* — Loué à la semaine par un réparateur itinérant. Lieu plausible pour une **intervention sur Bafouille** en cours de jeu."));
b.push(B("**Salle de contrôle des transmissions** *(N4)* — Poste **habituel de Tana** ; c'est d'ici qu'elle a intercepté les fragments. Supervisée par **Torvin Aashe** (méticuleux, pointilleux) — le supérieur **dont les soupçons ont déclenché la fuite** de Tana. Voie d'accès alternative au journal."));
b.push(B("**Bureau de l'administrateur Kallan** *(N3)* — **Joreth Kallan** (Corellia, pragmatique et vénal). Revend des fréquences ; a mené la correspondance du **pot-de-vin** (doc i). Protège le vrai journal **par intérêt**. *« Tant que les chiffres tombent juste, je ne pose pas de questions inutiles. »*"));
b.push(B("**Salle de passation Bregman/Voss** *(N3)* — Relève des quarts, source du **journal de bord (g)**."));
b.push(B("**Quartiers & poste de la garnison** *(N3)* — Autorité impériale **visible** (distincte de l'ISB). **Lt Corin Adrast** (ambitieux) ; **Soldat Denz** (bavard, corruptible, bonne source informelle) ; **Soldat Ansel Voy** (rigide, contrepoids de Denz) ; **Ss-Lt Pello Rance** (navette de liaison *Aigle du Secteur*)."));
b.push(B("**Zone d'intervention des commandos** *(N3)* — Base temporaire de l'**équipe ISB Rennard** : la menace antagoniste la plus directe (voir encart)."));
b.push(B("**Niveaux techniques restants** *(N0)* — **Réseau électrique (secteur B)** : panne du C19/J133 (**complication réutilisable** : un black-out isole une zone). **Recyclage d'air (secteur C)**. **Bornes WN-01/02/03**. **Ateliers de Kavarel & Bissik**."));
b.push(B("**Locaux désaffectés** *(N1)* — **Bazar Ryloth** (casier locatif jamais réclamé), **ancien bureau des licences** (dossiers oubliés), **coursive B condamnée** (scellée mais pas hermétique) : bonnes **caches** ou scènes annexes."));

encart(b, "Encart — La menace ISB (équipe Rennard)", [
  EB("**Agent Ivo Rennard** (humain, Coruscant) : méthodique, sans affect, ne bluffe presque jamais. *« Je ne cherche pas un coupable. Je cherche un fait. »*"),
  EB("**Analyste Sorae Vint** : obsédée par les données, retrace le rebond. **Sa progression = le compte à rebours.** Plus manipulable que Rennard."),
  EB("**Commando Ferrus** : ne parle qu'en accusés de réception — menace physique."),
  EB("**Commando Skarn** : reconnaissance / infiltration ; peut être **repérée en filature** avant même que l'équipe se déclare."),
]);
encart(b, "Encart — Équipages de passage (manifeste j & rapport e)", [
  EB("**Fenn Yorrik** — Bothan, capitaine du *Long Sillage*, affréteur régulier classé « suspicion modérée » (e). Ambigu : information et discrétion se négocient."),
  EB("**Ossa Trill** — Mon Calamari, pilote-médecin du *Bacta Express* (évacuations)."),
  EB("**Krul Ashen « Widowmaker »** — Weequay, chasseur de primes de passage (j) : source de tension si les PJ croisent sa route ou sa cible."),
  EP("*Autres coques citées : Perce-Brume, Étoile Voilée, Aube Grise.*"),
]);

// ---- 5. ISSUES & OUVERTURE ----
b.push(H1("5. Issues possibles et ouverture"));
b.push(H2("Les dénouements"));
b.push(P("Le scénario se joue sur deux tensions : **obtenir** le contenu du journal, et **repartir** avant que l'ISB ne verrouille la station. Les issues combinent ces deux axes."));
b.push(P("**Réussite discrète (l'idéal).** Les PJ gagnent la confiance de Tana, réunissent les quatre indices, laissent Bafouille déchiffrer, et **exfiltrent les coordonnées** de la base dissidente **avant** que Vint ne boucle sa triangulation. La station ignore tout ; l'ISB arrive trop tard. Les PJ tiennent l'avertissement qui peut sauver la base de la grille L-14."));
b.push(P("**Réussite coûteuse.** Les PJ obtiennent l'information mais **laissent une trace** : un PNJ alarmé, une effraction repérée, une erreur devant Skarn. L'extraction se fait **sous tension** (course-poursuite, fusillade au quai, black-out provoqué au N0 pour couvrir la fuite). Ils repartent avec le journal, mais **Rennard sait** désormais où chercher — et retient leurs visages."));
b.push(P("**Échec partiel.** Le déchiffrement échoue ou traîne (indices manqués, Bafouille endommagé, Tana refuse de coopérer). Les PJ repartent les mains vides ou avec des fragments inexploitables ; la base dissidente reste sans avertissement."));
b.push(P("**Capture.** Un PJ ou **Tana** tombe entre les mains de Rennard. Le journal est saisi ou détruit ; l'ISB remonte la filière. Si l'ordre *« exécution immédiate »* du J199 est confirmé, la **base de la grille L-14 est frappée** — conséquence lourde pour la suite."));
b.push(H2("Le sort de Tana"));
b.push(B("**Elle part avec les PJ** — nouvelle alliée récurrente, précieuse en cryptanalyse et connaissance de l'Empire."));
b.push(B("**Elle reste** — pour continuer à écouter depuis Kessel-Tho, source dormante et point de contact futur (au prix d'un risque croissant)."));
b.push(B("**Elle se sacrifie** — pour couvrir la fuite des PJ ou détruire le journal avant l'ISB : fin tragique et marquante, dette morale pour les personnages."));
b.push(H2("Ouverture vers le futur"));
b.push(B("**L'avertissement.** Les coordonnées L-14 lancent une course : prévenir la base dissidente avant la frappe — accroche directe pour la suite de campagne."));
b.push(B("**La traque commence.** Ce que les PJ ont entrevu, c'est la **naissance de l'Escadron de la Mort** : l'*Executor* et sa flotte entrent en scène. Le secteur n'est plus sûr."));
b.push(B("**Une némésis.** Si Rennard a vu leurs visages, il devient un **antagoniste récurrent** — patient, méthodique, sans colère et sans oubli."));
b.push(B("**Kessel-Tho, point d'appui.** Selon leurs actes, la station reste une base arrière possible (Kallan manipulable, PNJ ralliés, caches des locaux désaffectés) — ou un lieu désormais trop chaud."));
// ---- ANNEXES ----
function evtHead(t) { b.push(new Paragraph({ spacing: { before: 90, after: 40 }, keepNext: true, children: [ new TextRun({ text: t, bold: true, size: 19, color: H2COL }) ] })); }
function evt(n, text) { b.push(new Paragraph({ spacing: { after: 20, line: 248 }, indent: { left: 300, hanging: 300 }, alignment: AlignmentType.JUSTIFIED, children: [ new TextRun({ text: n + "  ", bold: true, color: ACCENT }), ...md(text) ] })); }
b.push(H1("Annexes"));
b.push(H2("A. Événements aléatoires de la station"));
b.push(P("Pour donner vie à la station entre deux temps d'enquête. **Lancez deux dés** (ou 1D deux fois) : le premier donne le **thème** (1-6), le second l'**événement** (1-6). Roulez une fois par **quart**, ou dès qu'une scène a besoin de texture. La plupart sont de l'ambiance ; certains portent un **crochet mécanique** *(horloge ISB ; rayonnements → annexe B ; leviers sociaux)*."));
evtHead("1 · Quai & vaisseaux");
evt("1", "Arrivée du *Perce-Brume* (denrées) : déchargement bruyant, quai encombré une heure.");
evt("2", "Un remorqueur ramène un caboteur en avarie (écho de l'*Étoile Voilée*) : l'infirmerie est sollicitée.");
evt("3", "Départ précipité d'un contrebandier sans acquitter ses taxes de quai — Bregman fulmine.");
evt("4", "Deux vaisseaux non déclarés s'accrochent au loin (règlement de comptes) : **confinement partiel**, quai verrouillé ~2 h.");
evt("5", "Le *Long Sillage* (Fenn Yorrik) fait escale : rumeurs et marchandages à la cantina.");
evt("6", "La **passerelle 3 grince** de plus belle ; un docker se tord la cheville, ticket de maintenance relancé (en vain).");
evtHead("2 · Technique & pannes");
evt("1", "Micro-coupure d'éclairage secteur D, réglée en moins d'une heure — mais une porte reste bloquée entre-temps.");
evt("2", "**Fluctuation du réseau électrique** (secteurs B/C), bascule de secours lente : noir de ~90 s *(diversion possible, cf. horloge ISB)*.");
evt("3", "Contrôle du recyclage d'air secteur C : léger défaut, odeur de brûlé, secteur évacué 20 min.");
evt("4", "Antenne AD-01 : micro-coupures des comms extérieures pendant 30 min (senseurs dégradés).");
evt("5", "Un droïde de maintenance tombe en panne au milieu d'une coursive et bloque le passage.");
evt("6", "Recalibrage d'antenne par Kavarel : accès à la galerie de maintenance temporairement restreint.");
evtHead("3 · Personnel & social");
evt("1", "Altercation entre deux dockers (manutention ratée) : fin de service anticipée, tension palpable.");
evt("2", "Kessa Droman sert un plat spécial au mess : tout le monde s'y presse (bon moment social).");
evt("3", "Rumeur de réduction d'effectifs : le personnel est nerveux, moins bavard.");
evt("4", "Le centre culturel réclame (encore) des crédits à l'administration ; Maren Estil de mauvaise humeur.");
evt("5", "Passation Bregman/Voss houleuse : un rapport « oublié » refait surface.");
evt("6", "Quelqu'un a trop bu à la cantina ; Vezz Nurodo cherche à le faire raccompagner discrètement.");
evtHead("4 · Sécurité & présence impériale");
evt("1", "Contrôle d'identité inopiné au quai (Denz & Voy) : file d'attente, nervosité générale.");
evt("2", "Le Lt Adrast inspecte un niveau au hasard, pour « faire du zèle » devant l'ISB.");
evt("3", "Une **silhouette grise** (Skarn ?) est aperçue à un carrefour, puis disparaît. *(Signe d'horloge ISB.)*");
evt("4", "Patrouille conjointe : Denz bavarde (info gratuite), Voy raccourcit la conversation.");
evt("5", "Rennard demande à consulter un registre à la capitainerie : l'étau se resserre *(avancer l'horloge ?)*.");
evt("6", "Fausse alerte capteur : **confinement 15 min**, tout le monde sur les nerfs.");
evtHead("5 · Commerce & rumeurs");
evt("1", "Trik Ossoval propose une « pièce rare » (peut-être utile, peut-être volée).");
evt("2", "Chessa Vorn fait la tournée de ses débiteurs : on apprend qui est endetté *(levier social)*.");
evt("3", "Le chasseur de primes *Widowmaker* (Krul Ashen) est de passage : la cantina se tait à son entrée.");
evt("4", "Hooru Damm livre des vivres frais : petit attroupement, bonne occasion d'écouter des ragots.");
evt("5", "Fennik Doss reçoit une caisse « non déclarée » à l'armurerie ; il se fait discret.");
evt("6", "Un colis mal étiqueté circule de main en main à la recherche de son destinataire.");
evtHead("6 · Ambiance & anodin");
evt("1", "Une **tempête électromagnétique** fait grésiller les comms 10 min *(voir annexe B)*.");
evt("2", "Coupure d'eau chaude aux quartiers : ronchonnements généralisés.");
evt("3", "Un enfant (rare sur la station) s'est perdu dans une coursive ; qui le raccompagne ?");
evt("4", "Odeur persistante de caf brûlé au mess ; Kessa s'excuse platement.");
evt("5", "Un haut-parleur défectueux répète une annonce en boucle jusqu'à ce qu'on le débranche.");
evt("6", "Rien de notable — la station ronronne. *(Le calme avant quelque chose ?)*");

// ---- ANNEXE B — MÉTÉO DES RAYONNEMENTS ----
b.push(H2("B. Météo des rayonnements & incidents gravitationnels (la Gueule)"));
b.push(P("Kessel-Tho est en bordure de **la Gueule**, l'amas de trous noirs du système. Tempêtes de rayonnement, pics gravitationnels et brouillage des senseurs font partie du décor — et de la mécanique. Roulez **1D par quart** (ou quand le récit s'y prête) ; en cas d'agitation, complétez par un **incident**."));
keyHead("Échelle météo (1D par quart)")(b);
b.push(B("**1-3 · Calme.** Rien de notable. Comms et senseurs nominaux ; départs normaux ; horloge ISB : avance normale."));
b.push(B("**4-5 · Instable.** Grésillements, brouillage intermittent. **−1D** aux jets de Communications et Sensoreurs (et pour capter/émettre la détresse) ; astrogation de départ **+1 cran de difficulté** ; **l'horloge ISB n'avance pas passivement ce quart** (le rebond se noie dans le bruit) ; roulez un incident."));
b.push(B("**6 · Tempête.** Rayonnement intense et turbulences gravitationnelles. **−2D** aux comms/senseurs, comms externes possiblement **coupées** ; **départs en hyperespace suspendus** (les vaisseaux sont cloués — l'exfiltration attendra) ; **horloge ISB gelée** ce quart (répit ambigu : les PJ aussi sont bloqués) ; **incident garanti** + danger radiologique pour qui reste exposé (coque fine, sortie extravéhiculaire)."));
keyHead("Incidents (1D)")(b);
evt("1", "**Cascade de parasites** : les comms internes grésillent 10 min ; un message important arrive tronqué (le MJ coupe une info en deux).");
evt("2", "**Pic gravitationnel** : brève micro-gravité dans un secteur ; jet d'Esquive ou de Vigueur pour ne pas être déséquilibré ; un sas se coince.");
evt("3", "**Bouffée de rayonnement** : alarme radiologique, coursives extérieures évacuées ; qui reste exposé encaisse des dégâts (jet de Vigueur / ~1D de dégâts, à l'appréciation du MJ).");
evt("4", "**Senseurs aveugles** : la station est « sourde » 30 min — un vaisseau peut arriver ou repartir **inaperçu** (l'ISB… ou un allié). À double tranchant.");
evt("5", "**Surtension** : couplée au réseau électrique fragile (cf. panne C19/J133), risque de **panne** — enchaînez sur l'événement technique 2·2 ; les lumières faiblissent.");
evt("6", "**Fenêtre de silence** : le brouillage couvre tout — **moment idéal** pour une transmission clandestine (émettre/recevoir sans être triangulé) ou pour se faufiler pendant que les capteurs sont noyés.");
b.push(P("**Pilotage.** Une tempête est un excellent **levier de rythme** : programmez-la pour le climax (piéger les PJ à quai, forcer un choix tendu), ou laissez-la émerger au dé. Elle **met en pause l'horloge ISB** — utile pour souffler — mais **verrouille aussi les départs** : le répit a un prix."));

// ---- ANNEXE C — HANDOUT (section PLEINE LARGEUR, hors 2 colonnes) ----
const HAND_W = 9638; // largeur utile en 1 colonne (A4 - 2 x marge 1134)
const hand = [];
hand.push(H2("C. Handout — Le message initial de Tana (le « message 0 »)"));
hand.push(P("Point de départ du scénario. Avant de disparaître sous l'alias **Doiron**, Tana a posté une annonce sur un canal privé de marché noir : en apparence une brocante banale, mais **une ligne sur deux (les impaires)** forme un message d'alerte à l'Alliance — procédé **« Sand/Musset »** (un texte anodin dont une ligne sur deux cache un second message). Un intermédiaire, **le Courtier**, l'a relayé à la Rébellion : c'est ce qui amène les PJ à Kessel-Tho."));
hand.push(P("**Volontairement, les coordonnées de la flotte n'y figurent pas** (ni en surface, ni en caché) : Tana refuse de les confier à un canal ouvert. Il faut la retrouver physiquement et déchiffrer son journal."));
hand.push(new Paragraph({ spacing: { before: 40, after: 40 }, children: [ new TextRun({ text: "Le message caché (lignes impaires), en clair :", bold: true, color: ACCENT, size: 19 }) ] }));
[
  "**« Le Faucheur est de sortie »** → le Projet Faucheur est opérationnel et en mouvement.",
  "**« …trajectoire mesurée et calibrée sur plus de deux semaines »** → elle a suivi et calculé leur trajectoire : elle sait où ils vont.",
  "**« …à l'écoute notamment chez les / impériaux »** → le canal est surveillé par l'Empire (prudence).",
  "**« Bafouille … chez la marchande Doiron, quai de Kessel-Tho »** → point de contact et identité de couverture.",
  "**« Je change de casier tous les jours, situation instable »** → elle est traquée, elle se déplace.",
  "**« Ne tardez pas, l'offre ne durera pas »** → urgence absolue.",
].forEach((t) => hand.push(new Paragraph({ children: md(t), numbering: { reference: "bul", level: 0 }, spacing: { after: 40, line: 258 } })));
hand.push(P("**Le double sens de « impériaux ».** Le mot revient deux fois : en surface c'est la devise (« crédits impériaux »), mais isolé dans la lecture cachée il se lit « les Impériaux » — l'Empire. L'effet est voulu."));
hand.push(P("**Aide si les joueurs bloquent :** les redondances (« nommé Bafouille / chez la marchande Doiron ») et le mot « impériaux » répété sont des anomalies de rédaction qui trahissent une structure. Qui connaît la correspondance Sand/Musset trouve aussitôt — bonne récompense de culture générale."));
hand.push(new Paragraph({ spacing: { before: 80, after: 60 }, children: [ new TextRun({ text: "À imprimer pour les joueurs :", bold: true, size: 19, color: H2COL }) ] }));
// encadré handout (pleine largeur)
const adLines = [
  "Le Faucheur est de sortie",
  "Lots disponibles comme d'habitude, premier arrivé, premier servi",
  "Il y a du gros et du très gros cette fois-ci avec ces",
  "lots de convertisseurs d'énergie, état correct, prix 200 crédits",
  "impériaux, pas de négociation possible",
  "Aussi disponible un casque de pilote Z-95 avec son émission de",
  "trajectoire mesurée et calibrée sur plus de deux semaines,",
  "visière à remplacer, prix 50 crédits impériaux, négociation",
  "possible",
  "Containers de pièces de blindage, en gros uniquement. J'espère",
  "que du monde soit intéressé et à l'écoute notamment chez les",
  "pirates. Paiement par virement exigé, prix à la tonne 500 crédits",
  "impériaux",
  "Droïde astromécano listé en commission, dévoué, compétent nommé",
  "Bafouille disponible chez la marchande Doiron, quai de Kessel-Tho",
  "Réservoirs auxiliaires, fuite mineure, bon pour pièces.",
  "Je change de casier tous les jours, situation instable.",
  "Livraison main à main uniquement, pas d'intermédiaire.",
  "Ne tardez pas, l'offre ne durera pas.",
  "Contactez le Courtier habituel pour les détails.",
];
const adInner = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [ new TextRun({ text: "PETITES ANNONCES — SECTEUR KESSEL", bold: true, font: "Consolas", size: 22, color: "222222" }) ] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "C9B99A" } }, children: [ new TextRun({ text: "canal privé — lot du cycle", italics: true, font: "Consolas", size: 16, color: "666666" }) ] }),
  ...adLines.map((l) => new Paragraph({ spacing: { after: 26, line: 240 }, children: [ new TextRun({ text: l, font: "Consolas", size: 18, color: "222222" }) ] })),
];
hand.push(new Table({
  width: { size: HAND_W, type: WidthType.DXA }, columnWidths: [HAND_W], borders: allBorders("8A1C1C", 10),
  rows: [ new TableRow({ children: [ new TableCell({ width: { size: HAND_W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: "FBF7EE", color: "auto" }, margins: { top: 200, bottom: 200, left: 240, right: 240 }, children: adInner }) ] }) ],
}));
hand.push(new Paragraph({ spacing: { before: 100 }, children: md("*Source détaillée (version annotée ligne à ligne, traduction complète) : `docs/message_initial_tana.docx`.*") }));
hand.push(new Paragraph({ spacing: { before: 240 }, alignment: AlignmentType.CENTER, children: [ new TextRun({ text: "— Fin du document · Handouts (d)→(j) fournis séparément —", italics: true, size: 18, color: "888888" }) ] }));

// ---------- footer ----------
const makeFooter = () => new Footer({ children: [ new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } }, children: [ new TextRun({ text: "Signal de Détresse — Kessel-Tho     ", size: 16, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999" }) ] }) ] });

// ---------- document ----------
const heading = (size, color) => ({ run: { font: "Calibri", size, bold: true, color }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true } });
const doc = new Document({
  creator: "MJ",
  title: "Signal de Détresse — Kessel-Tho",
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: "Cambria", size: 20, color: "1A1A1A" } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: TITLE_FONT, size: 30, bold: true, color: H1COL }, paragraph: { spacing: { before: 280, after: 120 }, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C9C2AE" } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 24, bold: true, color: H2COL }, paragraph: { spacing: { before: 200, after: 80 }, keepNext: true } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 21, bold: true, color: H3COL }, paragraph: { spacing: { before: 140, after: 60 }, keepNext: true } },
    ],
  },
  numbering: {
    config: [
      { reference: "bul", levels: [ { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { run: { color: ACCENT }, paragraph: { indent: { left: 300, hanging: 200 } } } } ] },
      { reference: "ord", levels: [ { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 320, hanging: 220 } } } } ] },
    ],
  },
  sections: [
    { properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, children: title },
    { properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, children: toc },
    { properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } }, column: { count: 2, space: 454, equalWidth: true } }, footers: { default: makeFooter() }, children: b },
    { properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, footers: { default: makeFooter() }, children: hand },
  ],
});

const OUT = path.join(__dirname, "scenario_signal_detresse_FUSION.docx");

// Post-traitement : embarque la police de titre (TTF -> police OOXML obfusquée).
function obfuscate(buf, guid) {
  const key = Buffer.from(guid.replace(/[{}-]/g, ""), "hex").reverse(); // clé ECMA-376 (16 octets, inversés)
  const out = Buffer.from(buf);
  for (let i = 0; i < 32 && i < out.length; i++) out[i] ^= key[i % 16];
  return out;
}
async function embedTitleFont(docxBuf) {
  if (!fs.existsSync(FONT_TTF)) { console.warn("! police introuvable, embarquement ignoré :", FONT_TTF); return docxBuf; }
  const z = await JSZip.loadAsync(docxBuf);
  z.file("word/fonts/font1.odttf", obfuscate(fs.readFileSync(FONT_TTF), FONT_GUID));
  let ft = await z.file("word/fontTable.xml").async("string");
  const entry = `<w:font w:name="${TITLE_FONT}"><w:charset w:val="00"/><w:family w:val="auto"/><w:pitch w:val="variable"/><w:embedRegular r:id="rIdFont1" w:fontKey="{${FONT_GUID}}" w:subsetted="false"/></w:font>`;
  ft = ft.replace(/<w:fonts\b([^>]*)\/>/, `<w:fonts$1>${entry}</w:fonts>`);
  if (!ft.includes(entry)) ft = ft.replace(/<\/w:fonts>/, `${entry}</w:fonts>`);
  z.file("word/fontTable.xml", ft);
  let rels = await z.file("word/_rels/fontTable.xml.rels").async("string");
  const rel = `<Relationship Id="rIdFont1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/font1.odttf"/>`;
  rels = /<\/Relationships>/.test(rels) ? rels.replace(/<\/Relationships>/, `${rel}</Relationships>`) : rels.replace(/(<Relationships\b[^>]*)\/>/, `$1>${rel}</Relationships>`);
  z.file("word/_rels/fontTable.xml.rels", rels);
  let drels = await z.file("word/_rels/document.xml.rels").async("string");
  if (!drels.includes("/fontTable")) {
    drels = drels.replace(/<\/Relationships>/, `<Relationship Id="rIdFontTable" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/></Relationships>`);
    z.file("word/_rels/document.xml.rels", drels);
  }
  let st = await z.file("word/settings.xml").async("string");
  if (!st.includes("embedTrueTypeFonts")) {
    st = st.includes("<w:displayBackgroundShape/>")
      ? st.replace("<w:displayBackgroundShape/>", `<w:displayBackgroundShape/><w:embedTrueTypeFonts/><w:saveSubsetFonts w:val="false"/>`)
      : st.replace(/(<w:settings\b[^>]*>)/, `$1<w:embedTrueTypeFonts/><w:saveSubsetFonts w:val="false"/>`);
    z.file("word/settings.xml", st);
  }
  return z.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

Packer.toBuffer(doc)
  .then(embedTitleFont)
  .then((buf) => { fs.writeFileSync(OUT, buf); console.log("WROTE", OUT, buf.length, "bytes (police", TITLE_FONT, "embarquée)"); })
  .catch((e) => { console.error("FAIL", e); process.exit(1); });
