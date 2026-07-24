<template>
  <div class="file-explorer">
    <div class="terminal-header">
      <span>{{ osPrompt }}:{{ currentPath }}$</span>
    </div>
    <div class="file-list-container">
      <div
        v-for="(item, index) in currentDirectoryItems"
        :key="index"
        class="file-item"
        :class="{ selected: selectedFiles.includes(index), directory: item.type === 'directory', disk: item.type === 'disk', 'search-match': isSearchMatch(item), 'bafouille-critical': isCriticalHighlight(item) }"
        @click="handleItemClick(item, index)"
        @dblclick="handleItemDoubleClick(item)"
      >
        <!-- Icône de type (dossier, disque, image, texte, doc, binaire…) -->
        <span class="file-icon" aria-hidden="true">{{ iconFor(item) }}</span>
        <!-- Checkbox pour sélectionner les fichiers (pas les dossiers).
             Elle dérive de selectedFiles (source unique) et passe par le même
             mutateur que le clic sur la ligne, d'où une cohérence par construction. -->
        <input
          v-if="item.type === 'file'"
          type="checkbox"
          :checked="selectedFiles.includes(index)"
          class="file-checkbox"
          @change.stop="toggleFileSelection(index)"
          @click.stop
        >
        <span class="file-name" :title="item.name"><template
          v-for="(seg, i) in nameSegments(item)"
          :key="i"
        ><mark v-if="seg.match" class="hl">{{ seg.text }}</mark><template v-else>{{ seg.text }}</template></template>{{ item.type === 'directory' ? '/' : '' }}</span>
        <!-- Icône d'ouverture pour les fichiers (pas les dossiers) -->
        <span
          v-if="item.type === 'file'"
          class="open-icon"
          @click.stop="openFile(item)"
          title="Ouvrir le fichier"
        >
          📄
        </span>
      </div>
    </div>
    
    <!-- Bouton de téléchargement (visible si des fichiers sont sélectionnés) -->
    <div v-if="selectedFiles.length > 0" class="download-section">
      <button class="download-button" @click="downloadSelectedFiles">
        💾 Télécharger ({{ selectedFiles.length }}) fichiers
      </button>
    </div>

    <!-- Modale d'aperçu (composant dédié) : pilotée par le fichier ouvert. -->
    <FilePreviewModal :file="openedFile" @close="closeFileModal" />

    <!-- Popin d'attente du « transfert » (ambiance) : barre décorrélée du vrai téléchargement -->
    <div v-if="transfer" class="transfer-modal-overlay">
      <div class="transfer-modal">
        <div class="transfer-title">EXTRACTION VERS SUPPORT EXTERNE</div>
        <div class="transfer-bar">
          <div class="transfer-bar-fill" :style="{ width: transfer.progress + '%' }"></div>
        </div>
        <div class="transfer-status">{{ Math.floor(transfer.progress) }}% — transfert du flux chiffré…</div>
        <button class="transfer-cancel" @click="cancelTransfer">Annuler</button>
      </div>
    </div>

    <!-- Dock bas à onglets : recherche + console (journal de session) ; session à venir -->
    <BottomDock
      ref="dock"
      :query="searchQuery"
      :results="searchResults"
      :count-message="searchCountMessage"
      :scope="searchScope"
      :scope-label="searchScopeLabel"
      :log="sessionLog"
      :alert-level="sessionState.alertLevel"
      @update:query="searchQuery = $event"
      @select="onSearchSelect"
      @set-scope="searchScope = $event"
    />
  </div>
</template>

<script>
import { OS } from '../os-identity.js';
import { startTransfer } from '../transfer.js';
import { searchTree, formatCount, highlightSegments, matches } from '../search.js';
import { sessionLog, pushLog, surveillanceText, SESSION_OPEN_TEXT } from '../session-log.js';
import { sessionState } from '../session-store.js';
import { startPropaganda } from '../propaganda.js';
import { assignPaths } from '../file-tree.js';
import { previewKindFor, fileUrl } from '../file-preview.js';
import { withBase } from '../base-url.js';
import BottomDock from './BottomDock.vue';
import FilePreviewModal from './FilePreviewModal.vue';

export default {
  name: 'FileExplorer',
  components: { BottomDock, FilePreviewModal },
  data() {
    return {
      osPrompt: OS.shortName,
      // Journal de session partagé (onglet Console du dock) ; alimenté par logSurveillance.
      sessionLog,
      // Recherche : requête + portée récursive ('dir' | 'disk' | 'all').
      searchQuery: '',
      searchScope: 'dir',
      fileSystem: null,
      currentPath: '/Fichiers',
      // Transfert en cours (popin d'attente) : null | { progress: 0..100 }
      transfer: null,
      // Réglages MJ (connexion / alerte) : store réactif partagé, initialisé depuis
      // file-system.json, plus tard mis à jour en live par le back-office (§5.2).
      sessionState,
      // RNG injectable (déterminisme en test).
      rng: Math.random,
      // Source unique de la sélection : index des fichiers cochés dans currentDirectoryItems.
      selectedFiles: [],
      // Fichier ouvert dans la modale d'aperçu (null = fermée) ; le composant FilePreviewModal
      // possède le chargement/rendu du contenu.
      openedFile: null
    }
  },
  computed: {
    // Libellés de surveillance surchargeables par le MJ (donnée `console.surveillance`) ;
    // undefined => session-log.js applique ses défauts.
    surveillanceLabels() {
      return this.fileSystem?.console?.surveillance
    },
    currentDirectory() {
      if (!this.fileSystem) return { children: [] }
      const dir = this.findDirectoryByPath(this.currentPath)
      return dir || this.fileSystem
    },
    currentDirectoryItems() {
      // Conteneurs (disques/dossiers) avant les fichiers ; ordre d'auteur préservé dans
      // chaque groupe (tri stable). Le `..` reste toujours en tête.
      const items = [...this.currentDirectory.children]
        .sort((a, b) => Number(this.isContainer(b)) - Number(this.isContainer(a)))
      if (this.currentPath !== '/') {
        items.unshift({
          name: '..',
          path: '..',
          type: 'directory'
        })
      }
      return items
    },
    // Racine de la recherche récursive selon la portée courante.
    searchRootPath() {
      if (this.searchScope === 'all') return '/'
      if (this.searchScope === 'disk') return this.diskRootPath(this.currentPath)
      return this.currentPath
    },
    searchResults() {
      const query = this.searchQuery.trim()
      if (!query || !this.fileSystem) return []
      const root = this.findDirectoryByPath(this.searchRootPath)
      return root ? searchTree(root, query) : []
    },
    searchCountMessage() {
      return this.searchQuery.trim() ? formatCount(this.searchResults) : ''
    },
    // Rappel du périmètre : le sélecteur nomme déjà la portée, on n'ajoute que le chemin exact
    // résolu (rien pour 'all', dont la racine `/` n'apporte pas d'info).
    searchScopeLabel() {
      if (!this.searchQuery.trim() || this.searchScope === 'all') return ''
      return this.searchRootPath
    }
  },
  async created() {
    // Amorçage : la console s'ouvre sur une ligne système (jamais vide, en tête chronologique).
    pushLog({ kind: 'system', text: SESSION_OPEN_TEXT })
    await this.loadFileSystem()
    // Propagande d'ambiance : émetteur sur timer, arrêté au démontage.
    this._propaganda = startPropaganda({
      pool: this.fileSystem?.console?.propaganda,
      alertLevel: sessionState.alertLevel,
      rng: this.rng
    })
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown)
    if (this._propaganda) this._propaganda.stop()
    // Fin de session (expiration / connexion perdue) => l'OS est démonté : le téléchargement
    // en cours est perdu (transfert avorté). Tant que la connexion tient, rien ne l'interrompt.
    if (this._transfer) this._transfer.cancel()
  },
  methods: {
    normalizePath(path) {
      if (!path) return '/'
      let normalized = path.replace(/\/+/g, '/').replace(/^\//, '/').replace(/\/$/, '')
      return normalized === '' ? '/' : normalized
    },
    // Un conteneur navigable : un dossier classique ou un disque (noeud de tête).
    isContainer(item) {
      return item.type === 'directory' || item.type === 'disk'
    },
    // Racine du disque contenant `path` (le premier segment) ; '/' si à la racine.
    diskRootPath(path) {
      const parts = this.normalizePath(path).split('/').filter(p => p)
      return parts.length ? '/' + parts[0] : '/'
    },
    // Clic sur un résultat de recherche : on y navigue (dossier/disque) ou on l'ouvre (fichier).
    onSearchSelect(node) {
      if (this.isContainer(node)) this.changeDirectory(node.path)
      else this.openFile(node)
    },
    // Nom découpé pour le surlignage de recherche (jamais pour `..`).
    nameSegments(item) {
      if (item.name === '..' || !this.searchQuery.trim()) return [{ text: item.name, match: false }]
      return highlightSegments(item.name, this.searchQuery)
    },
    isSearchMatch(item) {
      return item.name !== '..' && matches(item.name, this.searchQuery)
    },
    // Highlight « aide Bafouille » : les fichiers critiques ressortent tant que le MJ
    // maintient l'intervention active (pourtour orange rebelle).
    isCriticalHighlight(item) {
      return this.sessionState.bafouille && !!item.isCritical
    },
    // Raccourcis : Ctrl/Cmd+F active la recherche (écrase le natif) ; Échap efface la requête.
    onKeydown(event) {
      if ((event.ctrlKey || event.metaKey) && (event.key === 'f' || event.key === 'F')) {
        event.preventDefault()
        if (this.$refs.dock) this.$refs.dock.focusSearch()
      } else if (event.key === 'Escape' && this.searchQuery) {
        this.searchQuery = ''
      }
    },
    // Icône de type (glyphe monochrome, cohérent avec le skin froid).
    iconFor(item) {
      if (item.name === '..') return '↰'
      if (item.type === 'disk') return '▤'
      if (item.type === 'directory') return '▸'
      switch (previewKindFor(item)) {
        case 'markdown': return '≡'
        case 'text': return '⚙'
        case 'image': return '▦'
        case 'summary': return '◈' // documents riches / verrouillés
        default: return '▪' // binaire
      }
    },
    async loadFileSystem() {
      try {
        const response = await fetch(withBase('file-system.json'))
        // Les chemins sont dérivés de la structure (jamais stockés dans le JSON).
        this.fileSystem = assignPaths(await response.json())
        // Point d'entrée piloté par la donnée : le MJ décide où l'on atterrit
        // (ex. le home de la machine piratée). Défaut conservé sinon.
        if (this.fileSystem.defaultPath) {
          this.currentPath = this.fileSystem.defaultPath
        }
      } catch (error) {
        console.error('Erreur lors du chargement du file system:', error)
        // Pas de faux arbre en dur : on retombe sur une racine vide (le contenu est
        // de la donnée, jamais du code).
        this.fileSystem = { name: 'root', path: '/', type: 'directory', children: [] }
      }
    },
    findDirectoryByPath(path) {
      const normalizedPath = this.normalizePath(path)
      if (normalizedPath === '/') return this.fileSystem
      const pathParts = normalizedPath.split('/').filter(p => p)
      let current = this.fileSystem
      for (const part of pathParts) {
        const found = current.children.find(child => child.name === part && this.isContainer(child))
        if (!found) return null
        current = found
      }
      return current
    },
    async changeDirectory(path) {
      const normalizedPath = this.normalizePath(path)
      
      if (normalizedPath === '..') {
        const parts = this.normalizePath(this.currentPath).split('/').filter(p => p)
        if (parts.length === 0) {
          this.currentPath = '/'
          return
        }
        this.currentPath = '/' + parts.slice(0, -1).join('/')
        return
      }
      
      if (normalizedPath === '/') {
        this.currentPath = '/'
        return
      }
      
      if (normalizedPath.startsWith('/')) {
        const dir = this.findDirectoryByPath(normalizedPath)
        if (dir) {
          this.currentPath = this.normalizePath(normalizedPath)
        }
        return
      }
      
      const currentDir = this.currentDirectory
      const target = currentDir.children.find(child => child.name === normalizedPath && this.isContainer(child))
      if (target) {
        this.currentPath = target.path
      }
    },
    // Pousse une ligne de surveillance dans le journal de session (onglet Console).
    logSurveillance(action, target) {
      pushLog({ kind: 'surveillance', text: surveillanceText(action, target, this.surveillanceLabels) })
    },
    // Ouvre la modale d'aperçu sur ce fichier (le rendu/chargement est délégué à
    // FilePreviewModal). Toute ouverture est un événement de surveillance.
    openFile(file) {
      this.logSurveillance('open', file.name)
      this.openedFile = file
    },
    closeFileModal() {
      this.openedFile = null
    },
    handleItemClick(item, index) {
      if (this.isContainer(item)) {
        this.changeDirectory(item.path)
      } else {
        this.toggleFileSelection(index)
      }
    },
    handleItemDoubleClick(item) {
      if (this.isContainer(item)) {
        this.changeDirectory(item.path)
      } else {
        this.openFile(item)
      }
    },
    toggleFileSelection(index) {
      const selectedIndex = this.selectedFiles.indexOf(index)
      if (selectedIndex === -1) {
        this.selectedFiles.push(index)
      } else {
        this.selectedFiles.splice(selectedIndex, 1)
      }
      this.$emit('files-selected', this.selectedFiles)
    },

    // Ouvre la popin d'attente et délègue toute l'orchestration au module transfer.js
    // (fausse barre + vrai ZIP en fond + saveAs à la complétion). Cf. point 6.
    downloadSelectedFiles() {
      if (this.selectedFiles.length === 0) {
        console.warn('Aucun fichier sélectionné pour téléchargement.')
        return
      }
      if (this.transfer) return // un transfert est déjà en cours

      const files = this.selectedFiles
        .map(i => this.currentDirectoryItems[i])
        .filter(f => f && f.type === 'file')

      this.logSurveillance('extract', files.map(f => f.name).join(', '))
      this.transfer = { progress: 0 }
      this._transfer = startTransfer({
        files,
        config: sessionState,
        fileUrl,
        rng: this.rng,
        onProgress: (progress) => { if (this.transfer) this.transfer.progress = progress },
        onDone: () => { this.transfer = null; this.logSurveillance('extractDone') }
      })
    },
    cancelTransfer() {
      if (this._transfer) this._transfer.cancel()
      this.logSurveillance('cancelExtract')
    }
  },
  watch: {
    currentPath(newPath) {
      // La sélection est indexée par position dans le répertoire courant ;
      // on la vide à chaque navigation pour éviter des index périmés.
      this.selectedFiles = []
      // La requête est préservée à la navigation, mais on repart d'une portée étroite.
      this.searchScope = 'dir'
      // Toute navigation est un événement de surveillance (point unique : capte
      // breadcrumb, '..', sélection depuis la recherche…).
      this.logSurveillance('navigate', newPath)
    },
    searchQuery() {
      // Une nouvelle recherche repart du répertoire courant (portée étroite).
      this.searchScope = 'dir'
    }
  }
}
</script>

<style scoped>
/* Skin impérial : sombre, froid, anguleux. Couleurs via variables (index.html :root). */
.file-explorer {
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* Prompt : chemin unix, accent hologramme */
.terminal-header {
  margin-bottom: 12px;
  color: var(--accent);
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 6px;
  flex-shrink: 0;
}

.file-list-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 6px; flex: 1; min-height: 0; overflow: auto; align-content: start; }
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background-color: var(--panel);
  border: 1px solid var(--line);
  border-radius: 0;              /* angles nets */
  cursor: pointer;
  transition: background-color 0.12s, border-color 0.12s;
}
.file-item:hover { background-color: var(--panel-raised); border-color: var(--line-strong); }
.file-item.selected { background-color: var(--selection); border-color: var(--accent); }
.file-item.directory { color: var(--accent); }
.file-item.directory:hover { background-color: var(--accent-soft); }
/* Un disque (noeud de tête) : distinct des dossiers, marqué par une bordure d'accent. */
.file-item.disk {
  color: var(--ink);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-left: 3px solid var(--accent);
}
.file-item.disk:hover { background-color: var(--accent-soft); }
/* Correspondance de recherche : barre d'accent à gauche — DISTINCT de la sélection (fond cyan). */
.file-item.search-match { box-shadow: inset 3px 0 0 var(--accent); }
/* Highlight « aide Bafouille » : pourtour orange rebelle + halo, sur les fichiers critiques
   tant que le MJ maintient l'intervention. Distinct du cyan impérial (allié, pas Empire). */
.file-item.bafouille-critical {
  border-color: var(--rebel);
  box-shadow: 0 0 0 1px var(--rebel), 0 0 10px rgba(242, 130, 42, 0.35);
}

/* Icône de type (glyphe à gauche du nom) */
.file-icon {
  flex-shrink: 0;
  width: 1.2em;
  margin-right: 8px;
  text-align: center;
  color: var(--ink-dim);
}
.file-item.directory .file-icon,
.file-item.disk .file-icon { color: var(--accent); }

.file-name {
  flex: 1;
  min-width: 0;            /* autorise le rétrécissement sous la taille du contenu */
  overflow: hidden;
  text-overflow: ellipsis; /* nom tronqué (…) ; nom complet dispo via title au survol */
  white-space: nowrap;
}

/* Checkbox pour la sélection de fichiers */
.file-checkbox {
  margin-right: 8px;
  cursor: pointer;
  accent-color: var(--accent);
}

/* Icône d'ouverture pour les fichiers */
.open-icon {
  cursor: pointer;
  margin-left: 8px;
  font-size: 16px;
  opacity: 0.7;
  flex-shrink: 0;   /* le bouton ne se comprime jamais : toujours visible */
}

.open-icon:hover {
  opacity: 1;
}

/* Bouton de téléchargement */
.download-section {
  margin-top: 15px;
  text-align: right;
  flex-shrink: 0;
}

.download-button {
  background-color: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  cursor: pointer;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 0;
  transition: all 0.15s;
}

.download-button:hover {
  background-color: var(--accent);
  color: var(--bg);
  border-color: var(--accent);
}

/* Popin d'attente du transfert */
.transfer-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(3, 5, 8, 0.82);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}
.transfer-modal {
  background-color: var(--panel);
  border: 1px solid var(--line-strong);
  padding: 20px 24px;
  width: 80%;
  max-width: 460px;
  color: var(--ink);
  text-align: center;
}
.transfer-title {
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--accent);
  font-size: 13px;
  margin-bottom: 16px;
}
.transfer-bar {
  height: 14px;
  border: 1px solid var(--line-strong);
  background-color: var(--bg);
  overflow: hidden;
}
.transfer-bar-fill {
  height: 100%;
  background-color: var(--accent);
  transition: width 0.1s linear;
}
.transfer-status {
  margin-top: 10px;
  font-size: 12px;
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}
.transfer-cancel {
  margin-top: 16px;
  background: transparent;
  border: 1px solid var(--danger);
  color: var(--danger);
  cursor: pointer;
  padding: 6px 14px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 0;
}
.transfer-cancel:hover { background-color: var(--danger); color: var(--bg); }
</style>
