// Écran de la phase d'intrusion pour un état donné (ROADMAP §5.4). Pur.
// Le contenu vit dans file-system.json (bloc `intrusion` : { station, screens }), éditable ;
// le nom de station est une source unique interpolée dans les textes via `{station}`.

const interpolate = (text, station) => String(text).replaceAll('{station}', station)

/** Un écran d'échec suit la convention `*_refus` (teinte danger côté UI). */
export const isRefus = (state) => typeof state === 'string' && state.endsWith('_refus')

// Énumération canonique des écrans d'intrusion, dans l'ordre des 3 jets, avec le libellé MJ.
// Source unique du panneau de contrôle (/mj). `os` = accès accordé -> bascule sur l'OS.
export const INTRUSION_SCREENS = [
  { state: 'boot', label: 'Amorçage (attente)' },
  { state: 'public_ok', label: 'Firewall extérieur — accès accordé' },
  { state: 'public_refus', label: 'Firewall extérieur — refusé' },
  { state: 'interne_ok', label: 'Réseau interne — accès accordé' },
  { state: 'interne_refus', label: 'Réseau interne — refusé' },
  { state: 'os_refus', label: 'Poste user-51394345 — refusé' },
  { state: 'os', label: 'EmpireOS — accès accordé' },
]

/**
 * @param {{station?: string, screens?: Object}|undefined} intrusion  bloc `intrusion` de file-system.json
 * @param {string} state  écran courant (boot, public_ok, public_refus, interne_ok, …)
 * @returns {{lignes: string[], banniere: string}|null}  écran interpolé, ou null si absent
 */
export function intrusionScreen(intrusion, state) {
  const screen = intrusion?.screens?.[state]
  if (!screen) return null
  const station = intrusion.station || ''
  return {
    lignes: (screen.lignes || []).map((l) => interpolate(l, station)),
    banniere: interpolate(screen.banniere || '', station),
  }
}
