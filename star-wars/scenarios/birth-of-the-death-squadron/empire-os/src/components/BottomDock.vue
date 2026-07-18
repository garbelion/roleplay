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
      <div v-else class="dock-placeholder">— {{ activeLabel }} —</div>
    </div>
  </div>
</template>

<script>
import { highlightSegments } from '../search.js';

export default {
  name: 'BottomDock',
  props: {
    query: { type: String, default: '' },
    results: { type: Array, default: () => [] },
    countMessage: { type: String, default: '' },
    // Libellé du bouton d'élargissement (vide = pas de proposition).
    widenLabel: { type: String, default: '' }
  },
  emits: ['update:query', 'select', 'widen'],
  data() {
    return {
      activeTab: 'search',
      tabs: [
        { id: 'search', label: 'Recherche' },
        { id: 'console', label: 'Console — à venir' },
        { id: 'session', label: 'Session — à venir' }
      ]
    };
  },
  computed: {
    activeLabel() {
      const tab = this.tabs.find(t => t.id === this.activeTab);
      return tab ? tab.label : '';
    }
  },
  methods: {
    segments(name) {
      return highlightSegments(name, this.query);
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
.hl { background: var(--accent); color: var(--bg); padding: 0 1px; }
.dock-placeholder { color: var(--ink-dim); font-size: 12px; text-align: center; padding: 16px; }
</style>
