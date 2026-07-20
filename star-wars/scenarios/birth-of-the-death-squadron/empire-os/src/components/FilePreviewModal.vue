<template>
  <!-- Modale d'aperçu d'un fichier. Pilotée par la prop `file` (null = fermée) ; émet `close`.
       L'aiguillage du rendu suit le `kind` (previewKindFor) ; le contenu est chargé ici. -->
  <div v-if="file" class="file-modal-overlay" @click="$emit('close')">
    <div class="file-modal" @click.stop>
      <div class="modal-header">
        <span>Fichier: {{ file.name }}</span>
        <button class="close-button" @click="$emit('close')">X</button>
      </div>
      <div class="modal-content">
        <!-- Loader pendant le premier rendu (fetch d'un document ou chargement d'une image) -->
        <div v-if="loading" class="loader">Chargement…</div>
        <!-- v-show garde l'<img> dans le DOM pendant le chargement pour capter @load. -->
        <div v-show="!loading">
          <div v-if="kind === 'summary'" class="summary-preview">
            <p class="summary-text">{{ file.summary || 'Aperçu non disponible pour ce document.' }}</p>
            <p class="download-hint">Téléchargez le fichier pour consulter son contenu complet.</p>
          </div>
          <img v-else-if="kind === 'image'" :src="url" :alt="file.name" class="image-preview" @load="loading = false" @error="loading = false">
          <div v-else-if="kind === 'binary'" class="error">Impossible de prévisualiser ce contenu.</div>
          <pre v-else-if="kind === 'text'" class="raw-text">{{ content }}</pre>
          <div v-else-if="content" v-html="content"></div>
          <div v-else class="error">Contenu non disponible</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import { previewKindFor, fileUrl } from '../file-preview.js';

export default {
  name: 'FilePreviewModal',
  props: {
    // Fichier à prévisualiser (nœud de l'arbre) ; null = modale fermée.
    file: { type: Object, default: null }
  },
  emits: ['close'],
  data() {
    return {
      // Contenu chargé (texte brut, ou HTML pour markdown/docx) et état de chargement.
      fileContent: '',
      loading: false
    };
  },
  computed: {
    kind() { return this.file ? previewKindFor(this.file) : ''; },
    url() { return this.file ? fileUrl(this.file) : ''; },
    content() { return this.fileContent; }
  },
  watch: {
    // Chaque nouveau fichier (ré)amorce l'aperçu.
    file: { immediate: true, handler() { this.open(); } }
  },
  methods: {
    async open() {
      this.fileContent = '';
      if (!this.file) { this.loading = false; return; }
      const needsFetch = ['markdown', 'text', 'docx'].includes(this.kind);
      // Loader tant que l'aperçu n'est pas prêt : pendant le fetch (md/texte/docx), ou
      // jusqu'à l'événement load/error pour une image. summary/binaire : instantané.
      this.loading = needsFetch || this.kind === 'image';
      if (needsFetch) {
        await this.loadContent();
        this.loading = false;
      }
    },
    async loadContent() {
      try {
        const response = await fetch(this.url);
        if (!response.ok) throw new Error('Fichier introuvable');
        if (this.kind === 'docx') {
          // Rendu fidèle inline du .docx via mammoth (docx -> HTML), affiché en v-html.
          // Import dynamique : mammoth est volumineux, on le charge à la demande.
          const mammoth = (await import('mammoth/mammoth.browser')).default;
          const result = await mammoth.convertToHtml({ arrayBuffer: await response.arrayBuffer() });
          this.fileContent = result.value;
        } else {
          const raw = await response.text();
          // Markdown : rendu HTML via v-html (contenu local maîtrisé par l'auteur ; assainir —
          // ex. DOMPurify — s'il devient éditable/externe). Texte système : brut (échappé) dans un <pre>.
          this.fileContent = this.kind === 'markdown' ? marked.parse(raw) : raw;
        }
      } catch (error) {
        console.error('Erreur lors du chargement du fichier:', error);
        this.fileContent = this.kind === 'markdown'
          ? '<div class="error">Fichier introuvable</div>'
          : 'Fichier introuvable';
      }
    }
  }
};
</script>

<style scoped>
.file-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(3, 5, 8, 0.82);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.file-modal {
  background-color: var(--panel);
  border: 1px solid var(--line-strong);
  border-radius: 0;
  width: 80%;
  max-width: 640px;
  max-height: 80%;
  overflow: auto;
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid var(--line-strong);
  background-color: var(--panel-raised);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 13px;
}
.modal-content {
  padding: 15px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
/* Styles du Markdown rendu (v-html) */
.modal-content h1, .modal-content h2, .modal-content h3 {
  color: var(--accent);
  margin-top: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 4px;
}
.modal-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
  color: var(--ink);
}
.modal-content table th, .modal-content table td {
  border: 1px solid var(--line);
  padding: 6px;
  text-align: left;
}
.modal-content table th {
  background-color: var(--panel-raised);
  color: var(--accent);
}
.modal-content ul, .modal-content ol {
  margin-left: 20px;
  margin-bottom: 10px;
}
.modal-content li {
  margin-bottom: 4px;
}
.error {
  color: var(--danger);
  font-weight: bold;
}
/* Aperçu texte brut (fichiers système : .config/.ini/.json/.log/.txt) */
.raw-text {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  color: var(--ink);
}
/* Aperçu « résumé » (docs riches / previewMode summary : lecture = téléchargement) */
.summary-text { margin: 0 0 12px; }
.download-hint { color: var(--accent); font-style: italic; opacity: 0.9; }
/* Aperçu image (types connus) */
.image-preview { max-width: 100%; height: auto; display: block; }
/* Loader d'affichage (premier rendu d'un document / image) */
.loader {
  color: var(--accent);
  font-family: inherit;
  padding: 20px 0;
  text-align: center;
  opacity: 0.9;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.loader::after {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-left: 8px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: loader-spin 0.8s linear infinite;
  vertical-align: middle;
}
@keyframes loader-spin { to { transform: rotate(360deg); } }
.close-button {
  background: none;
  border: 1px solid var(--line-strong);
  color: var(--ink-dim);
  cursor: pointer;
  padding: 4px 8px;
  font-family: inherit;
  font-size: 12px;
  border-radius: 0;
}
.close-button:hover {
  background-color: var(--danger);
  border-color: var(--danger);
  color: var(--bg);
}
</style>
