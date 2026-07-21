<template>
  <div class="mj-panel">
    <h1 class="mj-title"><span class="mj-logo" aria-hidden="true">#</span> Console MJ — {{ OS.name }}</h1>

    <!-- Aucune config Supabase : le back-office n'est pas branché -->
    <p v-if="!ops" class="mj-unconfigured">
      Back-office non configuré — aucun projet Supabase dans <code>file-system.json</code>.
    </p>

    <!-- Non authentifié : connexion Supabase Auth -->
    <form v-else-if="!authed" class="mj-login" @submit.prevent="onLogin">
      <input v-model="email" type="email" class="mj-input" placeholder="Email MJ" autocomplete="username" />
      <input v-model="password" type="password" class="mj-input" placeholder="Mot de passe" autocomplete="current-password" />
      <button type="submit" class="mj-btn" :disabled="busy">Connexion</button>
      <p v-if="error" class="mj-error">{{ error }}</p>
    </form>

    <!-- Authentifié : réglages en direct -->
    <div v-else class="mj-authed">
      <!-- Phase d'intrusion : chaque bouton pose l'écran vu par les joueurs (contrôle libre). -->
      <section class="mj-intrusion">
        <h2 class="mj-subtitle">Phase d'intrusion</h2>
        <div class="mj-screens">
          <button
            v-for="s in intrusionScreens"
            :key="s.state"
            type="button"
            class="mj-screen-btn"
            :class="{ active: currentIntrusion === s.state, refus: screenIsRefus(s.state) }"
            :data-state="s.state"
            :disabled="busy"
            @click="setIntrusion(s.state)"
          >{{ s.label }}</button>
        </div>
        <button type="button" class="mj-btn mj-reset" :disabled="busy" @click="resetSession">⟲ Reset → boot (session)</button>
        <p v-if="intrusionError" class="mj-error">{{ intrusionError }}</p>
      </section>

      <!-- Phase de recherche : les leviers narratifs une fois les joueurs DANS l'OS —
           qualité de liaison, niveau d'alerte, heure de session et aide de Bafouille. -->
      <section class="mj-recherche">
        <h2 class="mj-subtitle">Phase de recherche</h2>
        <form class="mj-controls" @submit.prevent="onApply">
          <label class="mj-field">Qualité de connexion
            <select v-model="connectionQuality" class="mj-input mj-connection">
              <option v-for="q in connections" :key="q" :value="q">{{ q }}</option>
            </select>
          </label>
          <label class="mj-field">Niveau d'alerte
            <select v-model.number="alertLevel" class="mj-input mj-alert">
              <option v-for="(label, i) in alertLabels" :key="i" :value="i">{{ i }} — {{ label }}</option>
            </select>
          </label>
          <label class="mj-field">Heure de session (départ, démarre à l'entrée dans l'OS)
            <input v-model="clockHms" type="time" step="1" class="mj-input mj-clock" />
          </label>
          <button type="submit" class="mj-btn" :disabled="busy">Appliquer</button>
          <p v-if="applied" class="mj-ok">Réglages appliqués.</p>
          <p v-if="error" class="mj-error">{{ error }}</p>
        </form>

        <!-- Aide de Bafouille : bascule l'affichage de la popin persistante côté joueurs. -->
        <button
          type="button"
          class="mj-btn mj-bafouille-btn"
          :class="{ active: bafouille }"
          :disabled="busy"
          @click="toggleBafouille"
        >◍ Intervention Bafouille : {{ bafouille ? 'ACTIVE' : 'inactive' }}</button>
      </section>
    </div>
  </div>
</template>

<script>
import { OS } from '../os-identity.js';
import { ALERT_LABELS } from '../transfer-duration.js';
import { CONNECTION_LEVELS } from '../connection.js';
import { INTRUSION_SCREENS, isRefus } from '../intrusion.js';
import { formatSessionTime } from '../session-clock.js';

const UPDATE_ERR = 'Échec de la mise à jour.';

// Reset complet de session : repart d'une base propre pour une nouvelle tentative. Sinon un
// « connexion perdue » ou une expiration relancerait la fin de session à la ré-entrée.
const SESSION_RESET = { intrusion: 'boot', connectionQuality: 'bonne', alertLevel: 0, bafouille: false, clockStart: 0 };

export default {
  name: 'MjPanel',
  props: {
    // Opérations back-office injectées : { signIn(email,pw), fetchState(), updateState(patch) }.
    ops: { type: Object, default: null }
  },
  data() {
    return {
      OS,
      alertLabels: ALERT_LABELS,
      connections: CONNECTION_LEVELS,
      intrusionScreens: INTRUSION_SCREENS,
      authed: false,
      busy: false,
      error: '',
      applied: false,
      email: '',
      password: '',
      connectionQuality: 'moyenne',
      alertLevel: 0,
      clockHms: '00:00:00',
      currentIntrusion: 'boot',
      intrusionError: '',
      bafouille: false
    };
  },
  methods: {
    // Exécute `fn` en portant l'état `busy` (remis à zéro même en cas d'échec) : point unique
    // du cycle occupé/relâché pour toutes les opérations back-office.
    async withBusy(fn) {
      this.busy = true;
      try {
        return await fn();
      } finally {
        this.busy = false;
      }
    },
    async onLogin() {
      this.error = '';
      try {
        await this.withBusy(async () => {
          await this.ops.signIn(this.email, this.password);
          this.authed = true;
          this.password = '';
          const state = await this.ops.fetchState();
          if (state) {
            if (state.connectionQuality !== undefined) this.connectionQuality = state.connectionQuality;
            if (state.alertLevel !== undefined) this.alertLevel = state.alertLevel;
            if (state.intrusion !== undefined) this.currentIntrusion = state.intrusion;
            if (state.clockStart !== undefined) this.clockHms = this.secondsToHms(state.clockStart);
            if (state.bafouille !== undefined) this.bafouille = state.bafouille;
          }
        });
      } catch (e) {
        this.error = e?.message || 'Connexion impossible.';
      }
    },
    async onApply() {
      this.error = '';
      this.applied = false;
      try {
        await this.withBusy(() => this.ops.updateState({
          connectionQuality: this.connectionQuality,
          alertLevel: this.alertLevel,
          clockStart: this.hmsToSeconds(this.clockHms)
        }));
        this.applied = true;
      } catch (e) {
        this.error = e?.message || UPDATE_ERR;
      }
    },
    screenIsRefus(state) {
      return isRefus(state);
    },
    // Heure de départ <-> secondes. Formatage via le formateur canonique (session-clock).
    secondsToHms(seconds) {
      return formatSessionTime((seconds || 0) * 1000);
    },
    hmsToSeconds(hms) {
      const [h = 0, m = 0, s = 0] = String(hms || '').split(':').map(Number);
      return (h * 3600) + (m * 60) + s;
    },
    // Bascule l'intervention de Bafouille (popin persistante côté joueurs), poussée en live.
    async toggleBafouille() {
      const next = !this.bafouille;
      try {
        await this.withBusy(() => this.ops.updateState({ bafouille: next }));
        this.bafouille = next;
      } catch (e) {
        this.error = e?.message || UPDATE_ERR;
      }
    },
    // Reset complet : repose intrusion=boot + tous les paramètres de session à leurs défauts,
    // et réaligne le formulaire local.
    async resetSession() {
      this.intrusionError = '';
      try {
        await this.withBusy(() => this.ops.updateState({ ...SESSION_RESET }));
        this.currentIntrusion = SESSION_RESET.intrusion;
        this.connectionQuality = SESSION_RESET.connectionQuality;
        this.alertLevel = SESSION_RESET.alertLevel;
        this.bafouille = SESSION_RESET.bafouille;
        this.clockHms = this.secondsToHms(SESSION_RESET.clockStart);
      } catch (e) {
        this.intrusionError = e?.message || UPDATE_ERR;
      }
    },
    // Contrôle libre : chaque clic pousse l'écran choisi (le refus est un écran de repos).
    async setIntrusion(state) {
      this.intrusionError = '';
      try {
        await this.withBusy(() => this.ops.updateState({ intrusion: state }));
        this.currentIntrusion = state;
      } catch (e) {
        this.intrusionError = e?.message || UPDATE_ERR;
      }
    }
  }
};
</script>

<style scoped>
.mj-panel {
  max-width: 420px;
  margin: 8vh auto;
  padding: 24px;
  background: var(--panel);
  border: 1px solid var(--line-strong);
  color: var(--ink);
  font-family: "Consolas", "DejaVu Sans Mono", monospace;
}
.mj-title { font-size: 15px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.mj-logo { font-family: 'Star Jedi', monospace; font-size: 22px; line-height: 1; }
.mj-login, .mj-controls { display: flex; flex-direction: column; gap: 12px; }
.mj-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ink-dim); }
.mj-input {
  background: var(--bg);
  border: 1px solid var(--line-strong);
  color: var(--ink);
  font-family: inherit;
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 0;
}
.mj-input:focus { outline: none; border-color: var(--accent); }
.mj-btn {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: inherit;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 0;
  cursor: pointer;
}
.mj-btn:hover:not(:disabled) { background: var(--accent); color: var(--bg); }
.mj-btn:disabled { opacity: 0.5; cursor: default; }
.mj-unconfigured { color: var(--ink-dim); font-size: 13px; line-height: 1.5; }
.mj-unconfigured code { color: var(--accent); }
.mj-error { color: var(--danger); font-size: 12px; }
.mj-ok { color: var(--accent); font-size: 12px; }

/* Contrôles d'intrusion : liste d'écrans posables + reset. */
.mj-authed { display: flex; flex-direction: column; gap: 20px; }
.mj-intrusion { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); padding-top: 16px; }
.mj-subtitle { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--ink-dim); margin: 0; }
.mj-screens { display: flex; flex-direction: column; gap: 6px; }
.mj-screen-btn {
  text-align: left;
  background: var(--bg);
  border: 1px solid var(--line-strong);
  color: var(--ink-dim);
  font-family: inherit;
  font-size: 12px;
  padding: 7px 10px;
  border-radius: 0;
  cursor: pointer;
}
.mj-screen-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--ink); }
.mj-screen-btn.active { border-color: var(--accent); color: var(--accent); background: var(--panel-raised); }
.mj-screen-btn.refus { border-left: 3px solid var(--danger); }
.mj-screen-btn.active.refus { color: var(--danger); border-color: var(--danger); }
.mj-screen-btn:disabled { opacity: 0.5; cursor: default; }
.mj-reset { align-self: flex-start; }

/* Aide de Bafouille : bascule; l'état actif est marqué en accent plein. */
.mj-recherche { display: flex; flex-direction: column; gap: 16px; border-top: 1px solid var(--line); padding-top: 16px; }
.mj-bafouille-btn { align-self: flex-start; }
.mj-bafouille-btn.active { background: var(--accent); color: var(--bg); }
</style>
