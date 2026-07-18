import { describe, it, expect } from "vitest"
import { searchTree, highlightSegments, formatCount } from "../src/search.js"

const tree = {
  name: 'root', path: '/', type: 'directory',
  children: [
    {
      name: 'user-51394345', path: '/user-51394345', type: 'disk',
      children: [
        {
          name: 'home', path: '/user-51394345/home', type: 'directory',
          children: [
            { name: 'rapport_mission.md', path: '/user-51394345/home/rapport_mission.md', type: 'file' },
            { name: 'Résumé.txt', path: '/user-51394345/home/Résumé.txt', type: 'file' }
          ]
        },
        { name: 'rapports', path: '/user-51394345/rapports', type: 'directory', children: [] }
      ]
    }
  ]
}

describe("searchTree", () => {
  it("trouve récursivement les entrées dont le nom contient la requête (ordre de parcours)", () => {
    const paths = searchTree(tree, 'rap').map(r => r.path)
    expect(paths).toEqual([
      '/user-51394345/home/rapport_mission.md',
      '/user-51394345/rapports'
    ])
  })

  it("est insensible à la casse et aux accents", () => {
    expect(searchTree(tree, 'RESUME').map(r => r.name)).toEqual(['Résumé.txt'])
  })

  it("retourne [] pour une requête vide", () => {
    expect(searchTree(tree, '   ')).toEqual([])
  })
})

describe("highlightSegments", () => {
  it("découpe le nom autour de la sous-chaîne correspondante", () => {
    expect(highlightSegments('rapport_mission.md', 'miss')).toEqual([
      { text: 'rapport_', match: false },
      { text: 'miss', match: true },
      { text: 'ion.md', match: false }
    ])
  })

  it("surligne la bonne sous-chaîne originale malgré les accents", () => {
    expect(highlightSegments('Résumé.txt', 'resume')).toEqual([
      { text: 'Résumé', match: true },
      { text: '.txt', match: false }
    ])
  })

  it("un seul segment non-matché sans correspondance ou requête vide", () => {
    expect(highlightSegments('rapport.md', 'xyz')).toEqual([{ text: 'rapport.md', match: false }])
    expect(highlightSegments('rapport.md', '')).toEqual([{ text: 'rapport.md', match: false }])
  })
})

describe("formatCount", () => {
  const n = (count, type) => Array.from({ length: count }, () => ({ type }))

  it("compte par type avec accord singulier/pluriel", () => {
    expect(formatCount([...n(4, 'file'), ...n(2, 'directory')]))
      .toBe('4 fichiers et 2 dossiers correspondent à votre recherche')
    expect(formatCount([...n(1, 'file'), ...n(1, 'directory')]))
      .toBe('1 fichier et 1 dossier correspondent à votre recherche')
    expect(formatCount(n(1, 'file')))
      .toBe('1 fichier correspond à votre recherche')
    expect(formatCount([...n(1, 'file'), ...n(1, 'directory'), ...n(1, 'disk')]))
      .toBe('1 fichier, 1 dossier et 1 disque correspondent à votre recherche')
  })

  it("« Aucun résultat » quand rien ne correspond", () => {
    expect(formatCount([])).toBe('Aucun résultat')
  })
})
