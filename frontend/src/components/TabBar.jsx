import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { effectiveRoutineIds, effectiveRoutines } from '../lib/history.js'
import { todayISO } from '../lib/format.js'
import { t } from '../lib/i18n.js'
import Icon from './Icon.jsx'
import Elapsed from './Elapsed.jsx'
import { useConnectionTrouble } from './SyncBanner.jsx'

// Module scope, not TabBar's render body. Declared inside it, `Tab` was a new function on every
// render, so React saw a different component type each time and threw the button away and built a
// fresh one — on a bar that is fixed on screen, and once a second for the whole of a rest. The
// state it took with it is the DOM node itself: focus, the :active tint, any in-flight transition.
function Tab({ active, icon, label, onClick, dot }) {
  return (
    <button className={active ? 'on' : ''} onClick={onClick} aria-label={dot ? label + ', ' + t('Connection problem') : undefined}>
      <span className="tab-ic"><Icon name={icon} />{dot && <span className="tab-dot" aria-hidden="true" />}</span><span>{label}</span>
    </button>
  )
}

export default function TabBar({ onStart }) {
  const nav = useNavigate()
  const loc = useLocation()
  const S = useStore(s => s.S)
  const user = useStore(s => s.user)
  const isGuest = useStore(s => s.isGuest())
  // With the connection banner switched off, a sync problem shows as a dot on Home, the tab
  // Settings lives under (#369, #330).
  const trouble = useConnectionTrouble()
  if (!user && !isGuest) return null
  const cur = loc.pathname.split('/')[1] || 'home'
  // A screen without a tab of its own lights the tab it is opened from (Muscles from both).
  const PARENT = { history: 'stats', 'structural-balance': 'stats', 'progress-photos': 'stats', measurements: 'health', settings: 'home', checkin: 'home', muscles: 'library', nutrition: 'health', activity: 'health' }
  const parent = cur === 'muscles' && loc.state?.from === '/stats' ? 'stats' : PARENT[cur]
  const on = k => cur === k || parent === k

  // Root tabs are peers, not another level to unwind with Android Back.
  const switchTab = path => {
    if (loc.pathname !== path || loc.search) nav(path, { replace: true })
  }

  const running = !!S.active && cur !== 'workout' && !S.active.editingWorkoutId && !S.active.backfill && S.active.start > 0
  const startWorkout = () => {
    if (!S.active) {
      // A weekday can hold several routines; start the combined session if any of them has
      // exercises, otherwise fall through to the picker.
      if (effectiveRoutines(S, todayISO()).some(r => r.ex.length)) { onStart(effectiveRoutineIds(S, todayISO())); return }
    }
    nav('/workout')
  }

  const planned = effectiveRoutines(S, todayISO()).filter(r => r.ex.length)
  const actionLabel = S.active ? (S.active.editingWorkoutId ? t('Edit workout') : t('Resume')) : t('Start workout')
  return <>
    <button className={'session-action' + (!S.active && cur !== 'home' ? ' compact' : '')} onClick={startWorkout} aria-label={running ? t('Resume') : actionLabel}>
      <span className="session-action-icon"><Icon name={S.active ? S.active.editingWorkoutId ? 'pencil' : 'play' : 'play'} /></span>
      <span className="session-action-copy"><strong>{actionLabel}</strong><small>{S.active ? S.active.name : loc.pathname === '/home' && planned.length ? planned.map(r => r.name).join(' + ') : t('Ready when you are')}</small></span>
      {running && <span className="session-action-time"><Elapsed start={S.active.start} /></span>}
    </button>
    <nav id="tabbar" aria-label={t('Main navigation')}>
      <Tab active={on('home')} icon="house" label={t('Today')} dot={trouble} onClick={() => switchTab('/home')} />
      <Tab active={on('plan')} icon="calendar" label={t('Plan')} onClick={() => switchTab('/plan')} />
      <Tab active={on('health')} icon="heart" label={t('Health')} onClick={() => switchTab('/health')} />
      <Tab active={on('stats')} icon="chart" label={t('Progress')} onClick={() => switchTab('/stats')} />
      <Tab active={on('library')} icon="dumbbell" label={t('Library')} onClick={() => switchTab('/library')} />
      <button className={'nav-utility' + (cur === 'settings' ? ' on' : '')} onClick={() => nav('/settings')}>
        <span className="tab-ic"><Icon name="gear" /></span>
        <span>{t('Settings')}{user?.name ? <small>{user.name}</small> : null}</span>
      </button>
    </nav>
  </>
}
