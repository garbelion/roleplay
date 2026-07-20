<template>
  <div class="bottom-dock">
    <div class="dock-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="dock-tab"
        :class="{ active: tab.id === activeTab }"
        @click="activeTab = tab.id"
      >{{ tab.label }}</button>
    </div>

    <div class="dock-panel">
      <div v-if="activeTab === 'search'" class="search-panel">
        <input
          ref="searchInput"
          class="search-input"
          type="text"
          :value="query"
          placeholder="Rechercher (Ctrl+F)…"
          @input="$emit('update:query', $event.target.value)"
        >
        <!-- Sélecteur de périmètre : dossier courant / disque / tous les disques -->
        <div v-if="query" class="search-scopes" role="group" aria-label="Périmètre de recherche">
          <button
            v-for="opt in scopeOptions"
            :key="opt.id"
            class="scope-btn"
            :class="{ active: opt.id === scope }"
            @click="$emit('set-scope', opt.id)"
          >{{ opt.label }}</button>
        </div>
        <!-- Rappel du périmètre courant résolu (avec le chemin exact) -->
        <div v-if="scopeLabel" class="search-scope">Périmètre : {{ scopeLabel }}</div>
        <div v-if="countMessage" class="search-count">{{ countMessage }}</div>
        <ul class="search-results">
          <li
            v-for="r in results"
            :key="r.path"
            class="search-result"
            @click="$emit('select', r)"
          >
            <span class="result-name"><template
              v-for="(seg, i) in segments(r.name)"
              :key="i"
            ><mark v-if="seg.match" class="hl">{{ seg.text }}</mark><span v-else>{{ seg.text }}</span></template></span>
            <span class="result-path">{{ r.path }}</span>
          </li>
        </ul>
      </div>

      <div
        v-else-if="activeTab === 'console'"
        class="console-panel"
        :class="`alert-${alertLevel}`"
      >
        <div v-if="!log.length" class="console-empty">Aucune activité enregistrée.</div>
        <ul v-else class="console-log">
          <li
            v-for="(e, i) in orderedLog"
            :key="i"
            class="console-line"
            :class="[`kind-${e.kind}`, e.level ? `level-${e.level}` : '']"
          >
            <span class="console-time">{{ time(e.at) }}</span>
            <span class="console-text">{{ e.text }}</span>
          </li>
        </ul>
      </div>

      <SessionPanel v-else-if="activeTab === 'session'" :alert-level="alertLevel" />

      <div v-else class="dock-placeholder">{{ activeLabel }} — à venir</div>
    </div>
  </div>
</template>

<script>
import { highlightSegments } from '../search.js';
import { formatSessionTime } from '../session-log.js';
import SessionPanel from './SessionPanel.vue';

export default {
  name: 'BottomDock',
  components: { SessionPanel },
  props: {
    query: { type: String, default: '' },
    results: { type: Array, default: () => [] },
    countMessage: { type: String, default: '' },
    // Périmètre de recherche courant : 'dir' | 'disk' | 'all' (surligne le bon bouton).
    scope: { type: String, default: 'dir' },
    // Rappel du périmètre de recherche courant, chemin résolu (vide = masqué).
    scopeLabel: { type: String, default: '' },
    // Journal de session (onglet Console) : entrées { kind, level?, text, at }.
    log: { type: Array, default: () => [] },
    // Niveau d'alerte 0..5 : teinte la console (plus rouge = alerte plus haute).
    alertLevel: { type: Number, default: 0 }
  },
  emits: ['update:query', 'select', 'set-scope'],
  data() {
    return {
      activeTab: 'console',
      // Positions du sélecteur de périmètre (ids alignés sur searchScope de FileExplorer).
      scopeOptions: [
        { id: 'dir', label: 'Dossier' },
        { id: 'disk', label: 'Disque' },
        { id: 'all', label: 'Tous les disques' }
      ],
      tabs: [
        { id: 'search', label: 'Recherche' },
        { id: 'console', label: 'Console' },
        { id: 'session', label: 'Session' }
      ]
    };
  },
  computed: {
    activeLabel() {
      const tab = this.tabs.find(t => t.id === this.activeTab);
      return tab ? tab.label : '';
    },
    // Console : plus récents en premier (le journal est empilé en ordre chronologique).
    orderedLog() {
      return [...this.log].reverse();
    }
  },
  methods: {
    segments(name) {
      return highlightSegments(name, this.query);
    },
    // Horodatage d'une ligne : heure in-game (heure murale narrative) ramenée sur 24 h.
    time(at) {
      const DAY = 24 * 3600 * 1000;
      return formatSessionTime((((at || 0) % DAY) + DAY) % DAY);
    },
    // Appelé par le parent (Ctrl+F) : active l'onglet Recherche et focus le champ.
    focusSearch() {
      this.activeTab = 'search';
      this.$nextTick(() => this.$refs.searchInput && this.$refs.searchInput.focus());
    }
  }
};
</script>

<style scoped>
.bottom-dock {
  border-top: 1px solid var(--line-strong);
  background: var(--panel);
  display: flex;
  flex-direction: column;
  max-height: 220px;
  flex-shrink: 0;
}
.dock-tabs {
  display: flex;
  gap: 1px;
  background: var(--line);
  border-bottom: 1px solid var(--line-strong);
}
.dock-tab {
  background: var(--panel);
  color: var(--ink-dim);
  border: none;
  border-radius: 0;
  padding: 5px 12px;
  font-family: inherit;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
}
.dock-tab.active { background: var(--panel-raised); color: var(--accent); }
.dock-panel { padding: 10px 12px; overflow: auto; }
.search-input {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--line-strong);
  color: var(--ink);
  font-family: inherit;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 0;
}
.search-input:focus { outline: none; border-color: var(--accent); }
/* Sélecteur segmenté de périmètre : angles nets, l'actif en accent plein. */
.search-scopes { display: flex; gap: 1px; margin: 8px 0 4px; background: var(--line); border: 1px solid var(--line-strong); width: fit-content; }
.scope-btn {
  background: var(--panel);
  color: var(--ink-dim);
  border: none;
  border-radius: 0;
  padding: 4px 10px;
  font-family: inherit;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
}
.scope-btn:hover { color: var(--ink); }
.scope-btn.active { background: var(--accent); color: var(--bg); }
.search-scope { margin: 4px 0; color: var(--accent); font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; }
.search-count { margin: 4px 0 8px; color: var(--ink-dim); font-size: 12px; letter-spacing: 0.5px; }
.search-results { list-style: none; margin: 0; padding: 0; }
.search-result {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 6px;
  cursor: pointer;
  border: 1px solid transparent;
}
.search-result:hover { background: var(--panel-raised); border-color: var(--line); }
.result-name { color: var(--ink); white-space: nowrap; }
.result-path { color: var(--ink-dim); font-size: 11px; overflow: hidden; text-overflow: ellipsis; }
.dock-placeholder { color: var(--ink-dim); font-size: 12px; text-align: center; padding: 16px; }

/* Console « big brother » : journal horodaté, monospace, couleur par nature. */
.console-panel { font-size: 12px; border-left: 3px solid transparent; padding-left: 8px; transition: border-color 0.4s, background 0.4s; }
/* Teinte montante avec le niveau d'alerte (0 = neutre → 5 = rouge impérial saturé). */
.console-panel.alert-1 { border-left-color: rgba(207, 75, 69, 0.25); }
.console-panel.alert-2 { border-left-color: rgba(207, 75, 69, 0.45); background: rgba(207, 75, 69, 0.04); }
.console-panel.alert-3 { border-left-color: rgba(207, 75, 69, 0.65); background: rgba(207, 75, 69, 0.07); }
.console-panel.alert-4 { border-left-color: rgba(207, 75, 69, 0.85); background: rgba(207, 75, 69, 0.10); }
.console-panel.alert-5 { border-left-color: var(--danger); background: rgba(207, 75, 69, 0.14); }
.console-empty { color: var(--ink-dim); text-align: center; padding: 16px; }
.console-log { list-style: none; margin: 0; padding: 0; }
.console-line { display: flex; gap: 10px; padding: 2px 4px; line-height: 1.5; }
.console-time { color: var(--ink-dim); flex-shrink: 0; font-variant-numeric: tabular-nums; }
.console-text { color: var(--ink); word-break: break-word; }
/* Surveillance : le regard de l'Empire (accent froid). Propagande : rouge impérial. */
.console-line.kind-surveillance .console-text { color: var(--accent); }
.console-line.kind-propaganda .console-text { color: var(--danger); letter-spacing: 0.5px; }
.console-line.kind-system .console-text { color: var(--ink-dim); }
.console-line.level-warn .console-text,
.console-line.level-alert .console-text { color: var(--danger); font-weight: bold; }
</style>
