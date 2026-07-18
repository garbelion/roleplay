import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { computeTransferDuration } from './transfer-duration.js';

// Construit un ZIP binaire-safe des fichiers (lecture en blob : .text() corromprait
// .docx / images / binaires), annulable via `signal`.
async function buildZip(files, fileUrl, signal) {
  const zip = new JSZip();
  for (const file of files) {
    const response = await fetch(fileUrl(file), { signal });
    if (response.ok) zip.file(file.path.split('/').pop(), await response.blob());
  }
  return zip.generateAsync({ type: 'blob' });
}

// Démarre un « transfert » d'ambiance (point 6) : une fausse barre à durée fictive,
// décorrélée du vrai ZIP construit en fond. `onProgress(0..100)` pilote l'affichage ;
// l'enregistrement réel (saveAs) ne part qu'à la complétion (et attend le vrai ZIP s'il
// est plus lent). `onDone` est appelé à la fin (complétion OU annulation). Horloge et RNG
// injectables pour des tests déterministes.
export function startTransfer({
  files, config, fileUrl, onProgress, onDone,
  rng = Math.random, now = () => Date.now()
}) {
  const duration = computeTransferDuration({
    files,
    connectionQuality: config.connectionQuality,
    alertLevel: config.alertLevel,
    rng
  });

  const abort = new AbortController();
  const blobPromise = buildZip(files, fileUrl, abort.signal);
  const start = now();
  let cancelled = false;
  let finishing = false;

  const timer = setInterval(async () => {
    if (cancelled || finishing) return;
    const elapsed = (now() - start) / 1000;
    onProgress(Math.min(100, (elapsed / duration) * 100));
    if (elapsed >= duration) {
      finishing = true;
      clearInterval(timer);
      try {
        const blob = await blobPromise;
        if (!cancelled) saveAs(blob, 'transfert_sienar.zip');
      } catch (error) {
        console.error('Erreur lors du transfert:', error);
      }
      onDone();
    }
  }, 100);

  return {
    cancel() {
      cancelled = true;
      abort.abort();
      clearInterval(timer);
      onDone();
    }
  };
}
