<template>
  <!-- Route MJ (#/mj) : back-office, séparé de l'OS joueur. -->
  <MjPanel v-if="isMj" :ops="mjOps" />

  <!-- Amorçage : on attend le premier settle de l'état de session avant de router
       (évite un replay du défilement d'intrusion au refresh). -->
  <div v-else-if="!booted" class="os-boot" aria-live="polite">CONNEXION AU RÉSEAU IMPÉRIAL…</div>

  <!-- Déconnexion auto : la session a dépassé sa durée max (2 h) — les joueurs sont éjectés
       de l'OS. Écran de coupure jusqu'au Reset MJ (qui ramène au shell d'intrusion). -->
  <div v-else-if="disconnected" class="os-disconnected" aria-live="polite">
    <span class="os-disconnected-logo" aria-hidden="true">#</span>
    <p class="os-disconnected-title">SESSION EXPIRÉE</p>
    <p class="os-disconnected-msg">CONNEXION INTERROMPUE — DURÉE MAXIMALE DÉPASSÉE.</p>
  </div>

  <!-- Phase d'intrusion (avant l'accès OS) : shell plein écran piloté par le MJ. -->
  <IntrusionShell v-else-if="!showOs" :intrusion="fileSystem && fileSystem.intrusion" />

  <div v-else class="dos-window">
    <!-- Filigrane décoratif : logo impérial (Star Jedi) estompé en fond de l'OS. -->
    <div class="os-watermark" aria-hidden="true">#</div>
    <div class="dos-title-bar">
      <span class="dos-title">
        <span class="os-logo" aria-hidden="true">#</span>
        <span class="os-name">{{ OS.name }}</span>
        <span class="os-full">— {{ OS.fullName }}</span>
      </span>
      <span class="dos-meta">{{ OS.version }} · {{ OS.build }}</span>
      <!-- Badge d'alerte : n'apparaît qu'au-dessus de la normale, teinte montante -->
      <span v-if="alertLevel > 0" class="os-alert" :class="`alert-${alertLevel}`">
        ALERTE — {{ alertLabel }}
      </span>
      <span class="os-clock">{{ clock }}</span>
      <button class="dos-close-button" @click="closeTerminal">X</button>
    </div>
    <div class="terminal-container">
      <FileExplorer />
    </div>
    <div class="dos-status-bar">
      <span class="status-licence">LICENCE : {{ OS.licensee }}</span>
    </div>

    <!-- Aide de Bafouille (MJ) : popin persistante des fichiers critiques à télécharger. -->
    <BafouillePopin v-if="showBafouille" :files="criticalFiles" :message="bafouilleMessage" />

    <!-- Notifications éphémères : tout message console non-surveillance surgit ici 5 s. -->
    <div class="os-notifications" aria-live="polite">
      <button
        v-for="n in notifications"
        :key="n.id"
        class="os-notification"
        :class="`kind-${n.kind}`"
        @click="dismiss(n.id)"
      >{{ n.text }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import FileExplorer from "./components/FileExplorer.vue";
import IntrusionShell from "./components/IntrusionShell.vue";
import MjPanel from "./components/MjPanel.vue";
import BafouillePopin from "./components/BafouillePopin.vue";
import { collectCriticalFiles } from "./file-tree.js";
import { createMjOpsFromConfig } from "./supabase-mj.js";
import { connectSupabaseSession } from "./supabase-source.js";
import { OS } from "./os-identity.js";
import { formatSessionTime } from "./session-log.js";
import { notifications, dismiss } from "./notifications.js";
import { sessionState, setSessionConfig } from "./session-store.js";
import { startSessionClock, resetSessionClock, heureMs, isSessionExpired } from "./session-clock.js";
import { ALERT_LABELS } from "./transfer-duration.js";

// Routage minimal par hash : #/mj => back-office MJ, sinon l'OS joueur.
const route = ref(window.location.hash);
const onHashChange = () => { route.value = window.location.hash; };
const isMj = computed(() => route.value === "#/mj");

// Contenu (file-system.json) + état d'amorçage. `App` est l'hôte persistant du côté
// joueur : il possède la config de session et la connexion live (qui doit survivre à la
// bascule intrusion <-> OS), puis route selon l'écran d'intrusion courant.
const fileSystem = ref(null);
const booted = ref(false);
const showOs = computed(() => sessionState.intrusion === "os");
// Déconnexion auto : vrai une fois la durée max de session atteinte pendant qu'on est dans l'OS.
const expired = ref(false);
const disconnected = computed(() => showOs.value && expired.value);
let remote = null;

// Gate d'amorçage : on borne l'attente du premier settle pour ne jamais bloquer le boot.
const GATE_TIMEOUT_MS = 1500;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Opérations MJ (Supabase) construites à la demande quand on entre sur la page MJ.
const mjOps = ref(null);
watch(isMj, async (on) => {
  if (on && !mjOps.value) mjOps.value = await createMjOpsFromConfig();
}, { immediate: true });

// Niveau d'alerte MJ (live via le store réactif) + son libellé canonique.
const alertLevel = computed(() => sessionState.alertLevel);
const alertLabel = computed(() => (ALERT_LABELS[sessionState.alertLevel] || "").toUpperCase());

// Intervention de Bafouille (déclenchée par le MJ, live) : popin persistante listant les
// fichiers critiques (chemins dérivés de l'arbre) + sa voix, éditable en donnée.
const showBafouille = computed(() => sessionState.bafouille);
const criticalFiles = computed(() => (fileSystem.value ? collectCriticalFiles(fileSystem.value) : []));
const bafouilleMessage = computed(() => fileSystem.value?.bafouille?.message || "");

// Horloge de session (heure in-game) : source unique dans session-clock.js, **ancrée à
// l'entrée dans EmpireOS** (pas au chargement). L'entrée pose l'ancre (heure réglée par le
// MJ, `clockStart`) ; la sortie / le Reset la libère. Format HH:MM:SS canonique.
const clock = ref(formatSessionTime(0));
function tickClock() {
  clock.value = formatSessionTime(heureMs());
  // La durée max de session déclenche la déconnexion auto (vérifiée à chaque tic).
  if (isSessionExpired()) expired.value = true;
}
watch(showOs, (on) => {
  // L'entrée pose l'ancre et repart d'une session « fraîche » ; la sortie / le Reset la libère.
  if (on) startSessionClock(sessionState.clockStart, Date.now());
  else resetSessionClock();
  expired.value = false;
  tickClock();
}, { immediate: true });

let timer;
onMounted(async () => {
  timer = setInterval(tickClock, 1000);
  window.addEventListener("hashchange", onHashChange);
  try {
    const res = await fetch("/file-system.json");
    fileSystem.value = await res.json();
    // Réglages de session statiques (défauts) puis connexion live (Supabase Realtime) :
    // possédées ici pour survivre à la bascule intrusion <-> OS.
    setSessionConfig(fileSystem.value.session);
    remote = connectSupabaseSession(fileSystem.value.session?.supabase);
    // Attendre le premier settle (borné) : le shell naît alors à l'état courant (pas de replay).
    await Promise.race([remote.ready, delay(GATE_TIMEOUT_MS)]);
  } catch {
    // Contenu injoignable : on démarre en mode dégradé (défauts statiques).
  }
  booted.value = true;
});
onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener("hashchange", onHashChange);
  if (remote) remote.disconnect();
});

const closeTerminal = () => {
  console.log("Terminal ferme");
};
</script>

<style scoped>
/* Écran de déconnexion auto (durée de session dépassée) : coupure froide, centrée. */
.os-disconnected {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--bg);
  color: var(--danger);
  text-align: center;
  padding: 4vmin;
}
.os-disconnected-logo { font-family: 'Star Jedi', monospace; font-size: 18vmin; line-height: 1; opacity: 0.5; }
.os-disconnected-title { font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
.os-disconnected-msg { font-size: 13px; color: var(--ink-dim); text-transform: uppercase; letter-spacing: 1px; margin: 0; }

.dos-window {
  position: relative; /* ancre l'overlay de notifications */
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);
  color: var(--ink);
  border: 1px solid var(--line-strong);
}

/* Barre de titre : anguleuse, froide, hiérarchisée (ordre impérial) */
.dos-title-bar {
  position: relative;
  z-index: 1; /* au-dessus du filigrane */
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 12px;
  background: var(--panel-raised);
  border-bottom: 1px solid var(--line-strong);
  font-size: 13px;
  letter-spacing: 0.5px;
}

/* Filigrane décoratif : logo impérial (Star Jedi) estompé, centré, derrière tout le contenu.
   Visible dans les zones transparentes de l'explorateur. */
.os-watermark {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Star Jedi', monospace;
  font-size: 62vmin;
  line-height: 1;
  color: var(--accent);
  opacity: 0.04;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
}
/* Police Star Jedi (libre d'utilisation, dafont) — le « # » y rend un logo impérial. */
@font-face {
  font-family: 'Star Jedi';
  src: url('./assets/starjedi/Starjedi.ttf') format('truetype');
  font-display: swap;
}

.dos-title { display: flex; align-items: center; gap: 8px; min-width: 0; font-weight: bold; text-transform: uppercase; color: var(--ink); }
.os-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.os-logo {
  font-family: 'Star Jedi', monospace;
  color: var(--accent);
  font-size: 20px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}
.os-full { font-weight: normal; text-transform: none; color: var(--ink-dim); font-size: 12px; letter-spacing: 0; }
.dos-meta { color: var(--ink-dim); font-size: 12px; }
/* Badge d'alerte : encadré anguleux, teinte montant du orangé au rouge impérial. */
.os-alert {
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 2px 8px;
  border: 1px solid currentColor;
  color: var(--danger);
  white-space: nowrap;
}
.os-alert.alert-1 { color: #cf9b45; }
.os-alert.alert-2 { color: #cf7b45; }
.os-alert.alert-3 { color: #cf5b45; }
.os-alert.alert-4 { color: var(--danger); }
.os-alert.alert-5 { color: var(--bg); background: var(--danger); animation: os-alert-pulse 1s steps(2) infinite; }
@keyframes os-alert-pulse { 50% { opacity: 0.55; } }
.os-clock { margin-left: auto; color: var(--accent); font-variant-numeric: tabular-nums; letter-spacing: 1px; }
.dos-close-button {
  background: transparent;
  color: var(--ink-dim);
  border: 1px solid var(--line);
  width: 22px; height: 20px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 0;
}
.dos-close-button:hover { color: var(--bg); background: var(--danger); border-color: var(--danger); }

.terminal-container { position: relative; z-index: 1; flex: 1; min-height: 0; padding: 12px; overflow: hidden; }

/* Barre de statut basse : licence / mentions (ambiance OS) */
.dos-status-bar {
  position: relative;
  z-index: 1; /* au-dessus du filigrane */
  padding: 4px 12px;
  background: var(--panel);
  border-top: 1px solid var(--line);
  color: var(--ink-dim);
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Responsive : sous une certaine largeur, le chrome affiche trop d'infos -> on condense.
   Cœur conservé (logo + nom tronquable + horloge + fermeture) ; secondaire masqué. */
@media (max-width: 640px) {
  .dos-title-bar { gap: 10px; padding: 6px 10px; font-size: 12px; }
  .os-full { display: none; }   /* « — Engineer Desktop Edition » */
  .dos-meta { display: none; }  /* « version · build » */
  .dos-status-bar { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}
@media (max-width: 380px) {
  .dos-status-bar { display: none; } /* licence : trop longue en très étroit */
}

/* Overlay de notifications : haut-centre, empilées, cliquables pour fermer. */
.os-notifications {
  position: absolute;
  top: 44px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: min(360px, 80vw);
  z-index: 20;
  pointer-events: none;
}
.os-notification {
  pointer-events: auto;
  text-align: center;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.4;
  color: var(--ink);
  background: var(--panel-raised);
  border: 1px solid var(--line-strong);
  border-left: 3px solid var(--accent);
  border-radius: 0;
  padding: 8px 12px;
  cursor: pointer;
  letter-spacing: 0.4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
  animation: os-notif-in 0.25s ease-out;
}
.os-notification:hover { background: var(--panel); }
/* Propagande / alerte : accent rouge impérial pour se distinguer du système. */
.os-notification.kind-propaganda { border-left-color: var(--danger); }
@keyframes os-notif-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>