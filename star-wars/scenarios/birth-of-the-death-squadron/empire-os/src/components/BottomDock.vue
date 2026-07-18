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
        <div v-if="countMessage" class="search-count">{{ countMessage }}</div>
        <!-- Proposition d'élargissement quand la portée courante ne donne rien -->
        <button v-if="widenLabel" class="search-widen" @click="$emit('widen')">{{ widenLabel }}</button>
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

      <div v-else class="dock-placeholder">{{ activeLabel }} — à venir</div>
    </div>
  </div>
</template>

<script>
import { highlightSegments } from '../search.js';
import { formatSessionTime } from '../session-log.js';

export default {
  name: 'BottomDock',
  props: {
    query: { type: String, default: '' },
    results: { type: Array, default: () => [] },
    countMessage: { type: String, default: '' },
    // Libellé du bouton d'élargissement (vide = pas de proposition).
    widenLabel: { type: String, default: '' },
    // Journal de session (onglet Console) : entrées { kind, level?, text, at }.
    log: { type: Array, default: () => [] },
    // Niveau d'alerte 0..5 : teinte la console (plus rouge = alerte plus haute).
    alertLevel: { type: Number, default: 0 }
  },
  emits: ['update:query', 'select', 'widen'],
  data() {
    return {
      activeTab: 'console',
      tabs: [
        { id: 'search', label: 'Recherche', ready: true },
        { id: 'console', label: 'Console', ready: true },
        { id: 'session', label: 'Session', ready: false }
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
    time(at) {
      return formatSessionTime(at || 0);
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
.search-count { margin: 8px 0; color: var(--ink-dim); font-size: 12px; letter-spacing: 0.5px; }
.search-widen {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  cursor: pointer;
  padding: 4px 10px;
  font-family: inherit;
  font-size: 12px;
  text-transform: uppercase;
  border-radius: 0;
  margin-bottom: 8px;
}
.search-widen:hover { background: var(--accent); color: var(--bg); }
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
