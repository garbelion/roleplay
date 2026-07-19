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
    <form v-else class="mj-controls" @submit.prevent="onApply">
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
      <button type="submit" class="mj-btn" :disabled="busy">Appliquer</button>
      <p v-if="applied" class="mj-ok">Réglages appliqués.</p>
      <p v-if="error" class="mj-error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { OS } from '../os-identity.js';
import { ALERT_LABELS, CONNECTION_FACTORS } from '../transfer-duration.js';

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
      connections: Object.keys(CONNECTION_FACTORS),
      authed: false,
      busy: false,
      error: '',
      applied: false,
      email: '',
      password: '',
      connectionQuality: 'moyenne',
      alertLevel: 0
    };
  },
  methods: {
    async onLogin() {
      this.error = '';
      this.busy = true;
      try {
        await this.ops.signIn(this.email, this.password);
        this.authed = true;
        this.password = '';
        const state = await this.ops.fetchState();
        if (state) {
          if (state.connectionQuality !== undefined) this.connectionQuality = state.connectionQuality;
          if (state.alertLevel !== undefined) this.alertLevel = state.alertLevel;
        }
      } catch (e) {
        this.error = e?.message || 'Connexion impossible.';
      } finally {
        this.busy = false;
      }
    },
    async onApply() {
      this.error = '';
      this.applied = false;
      this.busy = true;
      try {
        await this.ops.updateState({ connectionQuality: this.connectionQuality, alertLevel: this.alertLevel });
        this.applied = true;
      } catch (e) {
        this.error = e?.message || 'Échec de la mise à jour.';
      } finally {
        this.busy = false;
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
</style>
