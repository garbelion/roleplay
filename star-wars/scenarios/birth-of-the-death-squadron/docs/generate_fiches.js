// Génère les fiches de personnage remplies des 6 pré-tirés (format « visions de légendes »).
// Companion du scénario. Prérequis : npm i docx@8 ; puis `node generate_fiches.js`.
// Les stats dérivées (Initiative, Ténacité/Vitalité, Pénalité de coordination) sont
// laissées à remplir par l'utilisateur selon les règles.
const path = require("path");
const fs = require("fs");
const docx = require("docx");
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, ShadingType, Table, TableRow, TableCell, WidthType, PageBreak } = docx;

const H1COL = "26425C", ACCENT = "8A1C1C", H2COL = "3A5A7A";
const MARGIN = 1134, W = 9638;

function md(t) {
  const parts = String(t).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  const r = [];
  for (const p of parts) { if (!p) continue;
    if (p.startsWith("**") && p.endsWith("**")) r.push(new TextRun({ text: p.slice(2, -2), bold: true }));
    else if (p.startsWith("*") && p.endsWith("*")) r.push(new TextRun({ text: p.slice(1, -1), italics: true }));
    else r.push(new TextRun({ text: p }));
  }
  return r;
}
const line = (t, o = {}) => new Paragraph({ spacing: { after: 40, line: 250 }, children: md(t), ...o });

function band(nom, role) {
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [ new TableRow({ children: [ new TableCell({
      width: { size: W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: H1COL, color: "auto" },
      margins: { top: 90, bottom: 90, left: 160, right: 160 },
      children: [
        new Paragraph({ spacing: { after: 20 }, children: [ new TextRun({ text: nom, bold: true, size: 32, color: "FFFFFF", font: "Calibri" }) ] }),
        new Paragraph({ children: [ new TextRun({ text: role, italics: true, size: 19, color: "DCE6F0" }) ] }),
      ],
    }) ] }) ],
  });
}
function sub(t) { return new Paragraph({ spacing: { before: 120, after: 40 }, children: [ new TextRun({ text: t, bold: true, size: 19, color: ACCENT }) ] }); }

const PCS = [
  {
    nom: "Renna Calder", role: "Agent de liaison (meneuse) · Humaine · femme · Chandrila",
    motiv: "Prévenir l'Alliance ; ramener son équipe entière.",
    cit: "Tenez-vous prêts. Il y a plus gros que nous derrière tout ça.",
    attrs: [
      "**COORDINATION 2D+2** — Blaster 3D+2, Esquive 3D+2",
      "**SAVOIR 3D** — Administration 5D, Systèmes Planétaires 4D, Illégalité 4D",
      "**PERCEPTION 4D** — Subterfuge 6D, Persuasion 6D, Commerce 5D, Empathie 4D+2",
      "**MÉCANIQUE 3D** — Communications 4D+2, Senseurs 4D",
      "**TECHNIQUE 3D** — Sécurité 4D",
      "**VIGUEUR 2D** — Autorité 5D",
    ],
    equip: "Blaster léger (holster discret), comlink chiffré, datapad de faux ordres, code-cylindre volé (périmé).",
    pp: 5, pf: 1,
  },
  {
    nom: "Dax « Fil » Orrin", role: "Slicer / technicien · Humain · homme · Corellia",
    motiv: "Le défi technique ; une dette envers la cellule.",
    cit: "Donne-moi trente secondes et une prise réseau, je te sors n'importe quoi.",
    attrs: [
      "**COORDINATION 2D** — Esquive 3D, Habileté manuelle 4D",
      "**SAVOIR 3D** — Illégalité 5D, Erudition 5D",
      "**PERCEPTION 3D** — Recherche 5D, Furtivité 4D+1",
      "**MÉCANIQUE 3D** — Communications 4D+2, Senseurs 4D",
      "**TECHNIQUE 5D** — Prog. et Rép. ordinat. 8D, Sécurité 7D, Prog. et Rép. Droïds 6D",
      "**VIGUEUR 2D** — Résistance 3D",
    ],
    equip: "Datapad de slicing, kit de crochetage électronique (spikes), multitool, comlink.",
    pp: 5, pf: 1,
  },
  {
    nom: "Yssha Vel", role: "Éclaireuse / infiltratrice · Twi'lek · femme · Ryloth",
    motiv: "La liberté de Ryloth ; ne plus jamais fuir à l'aveugle.",
    cit: "Je l'ai vue deux fois. On nous suit.",
    attrs: [
      "**COORDINATION 4D** — Blaster 5D, Esquive 6D, Habileté manuelle 5D, Agilité 5D",
      "**SAVOIR 2D** — Langages 3D, Illégalité 4D",
      "**PERCEPTION 4D** — Furtivité 7D, Recherche 5D+2, Subterfuge 5D",
      "**MÉCANIQUE 2D** — Senseurs 3D",
      "**TECHNIQUE 3D** — Sécurité 5D",
      "**VIGUEUR 3D** — Mouvement 5D, Arme de mêlée 4D+2",
      "*Capacité twi'lek — communication discrète par les lekku.*",
    ],
    equip: "Blaster hold-out, combinaison souple sombre, brouilleur de capteurs de proximité, macrojumelles.",
    pp: 5, pf: 1,
  },
  {
    nom: "Bren Sarkori", role: "Pilote / franc-tireur · Humain · homme · Nar Shaddaa",
    motiv: "Son vaisseau, son équipage, sa liberté.",
    cit: "Montez, je garde les moteurs chauds. On ne traîne pas.",
    attrs: [
      "**COORDINATION 3D** — Blaster 5D, Esquive 4D+2",
      "**SAVOIR 2D** — Systèmes Planétaires 4D, Illégalité 4D",
      "**PERCEPTION 3D** — Subterfuge 4D+2, Commerce 4D",
      "**MÉCANIQUE 4D** — Piloter vaisseaux 7D, Armes vaisseaux 6D, Astrogation 5D+2, Senseurs 5D, Propulseurs indiv 5D",
      "**TECHNIQUE 3D** — Réparation Transports 5D",
      "**VIGUEUR 2D+2** — Résistance 3D+2",
    ],
    equip: "Blaster lourd, veste de vol, comlink, les clés du Murmure.",
    pp: 5, pf: 1,
  },
  {
    nom: "Holt Marek", role: "Ancien sergent impérial (déserteur) · Humain · homme · monde de garnison",
    motiv: "Racheter ce qu'il a servi.",
    cit: "Je connais leurs procédures. C'est exactement pour ça qu'elles me font peur.",
    attrs: [
      "**COORDINATION 4D** — Blaster 6D, Lance-projectiles 5D, Esquive 5D",
      "**SAVOIR 3D** — Administration 5D, Tactique 5D",
      "**PERCEPTION 3D** — Subterfuge 4D",
      "**MÉCANIQUE 2D** — Conduire véhicules 3D+2",
      "**TECHNIQUE 3D** — Sécurité 5D, Armures et Exos. 5D, Médecine 4D",
      "**VIGUEUR 3D** — Autorité 5D, Arme de mêlée 5D, Résistance 5D+2, Arts martiaux 4D+2",
    ],
    equip: "Blaster E-11 « emprunté », armure légère sous vareuse civile, code-cylindre impérial périmé, plaques d'identité arrachées.",
    pp: 5, pf: 1,
  },
  {
    nom: "Ithra Wen", role: "Médecin de bord / érudite · Humaine · femme · réfugiée d'Alderaan",
    motiv: "Qu'Alderaan ne se répète nulle part.",
    cit: "Ces noms… ce sont des gens réels. Je les connais.",
    attrs: [
      "**COORDINATION 2D** — Esquive 3D",
      "**SAVOIR 4D** — Erudition 6D, Xénologie 6D, Langages 5D+2, Systèmes Planétaires 4D+2",
      "**PERCEPTION 3D** — Empathie 5D, Persuasion 4D+2, Recherche 4D",
      "**MÉCANIQUE 2D**",
      "**TECHNIQUE 4D** — Médecine 7D, Réparation Équipement 4D+2",
      "**VIGUEUR 3D** — Volonté 5D",
    ],
    equip: "Trousse médicale de campagne, injecteurs de stims, ouvrage d'histoire alderaanienne annoté.",
    pp: 5, pf: 2,
  },
];

const all = [];
PCS.forEach((pc, i) => {
  all.push(band(pc.nom, pc.role));
  all.push(new Paragraph({ spacing: { before: 100, after: 40 }, children: [ new TextRun({ text: "Motivation : ", bold: true }), ...md(pc.motiv) ] }));
  all.push(new Paragraph({ spacing: { after: 40 }, children: [ new TextRun({ text: "Citation : ", bold: true }), new TextRun({ text: "« " + pc.cit + " »", italics: true }) ] }));
  all.push(sub("Attributs & compétences (visions de légendes)"));
  pc.attrs.forEach((a) => all.push(line(a)));
  all.push(sub("Équipement"));
  all.push(line(pc.equip));
  all.push(new Paragraph({ spacing: { before: 100, after: 40 }, children: [ new TextRun({ text: `Points de personnage ${pc.pp}  ·  Points de Force ${pc.pf}  ·  Sensible à la Force : non`, bold: true }) ] }));
  all.push(new Paragraph({ spacing: { after: 40 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } }, children: [ new TextRun({ text: "À compléter selon les règles : ", italics: true, color: "777777" }), new TextRun({ text: "Initiative ______ · Ténacité / Vitalité ______ · Pénalité de coordination ______", color: "777777" }) ] }));
  if (i < PCS.length - 1) all.push(new Paragraph({ children: [ new PageBreak() ] }));
});

const doc = new Document({
  creator: "MJ", title: "Signal de Détresse — fiches des pré-tirés",
  styles: { default: { document: { run: { font: "Cambria", size: 20, color: "1A1A1A" } } } },
  sections: [ { properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, children: all } ],
});
const OUT = path.join(__dirname, "pretires_fiches.docx");
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log("WROTE", OUT, buf.length, "bytes"); }).catch((e) => { console.error("FAIL", e); process.exit(1); });
