// Setup global des tests : les journaux/notifications sont des singletons de module.
// On les remet à zéro après chaque test pour éviter l'accumulation entre tests
// (sinon chaque montage rend un journal qui grossit — coût O(n²) — et l'état fuit).
import { afterEach } from 'vitest'
import { resetLog } from '../src/session-log.js'
import { resetNotifications } from '../src/notifications.js'
import { resetSessionState } from '../src/session-store.js'
import { resetSessionClock } from '../src/session-clock.js'

afterEach(() => {
  resetLog()
  resetNotifications()
  resetSessionState()
  resetSessionClock()
})
