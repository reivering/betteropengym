import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { todayISO, isoOf } from '../lib/format.js'
import { t } from '../lib/i18n.js'
import { activityTotal, makeManualActivity, preferredRecords } from '../lib/health.js'
import { Button } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { confirmSheet } from '../sheets.jsx'

function EntrySheet({ close, onSave }) {
  const [activeCalories, setActiveCalories] = useState('')
  return <div className="health-sheet">
    <label className="health-label">{t('Active calories')}<input className="health-input" type="number" min="0" step="1" autoFocus value={activeCalories} onChange={e => setActiveCalories(e.target.value)} placeholder={t('Not recorded')} /></label>
    <div className="health-help">{t('Activity calories are separate from resting and workout energy. Total burn stays unknown unless a source records it.')}</div>
    <Button variant="primary" icon="check" onClick={() => { onSave(activeCalories); close() }}>{t('Save activity')}</Button>
  </div>
}

export default function Activity() {
  const S = useStore(s => s.S)
  const user = useStore(s => s.user)
  const update = useStore(s => s.update)
  const openSheet = useUI(s => s.openSheet)
  const toast = useUI(s => s.toast)
  const [day, setDay] = useState(todayISO())
  const records = S.activity?.records || []
  const energy = activityTotal(records, 'active_energy', day)
  const selectedRecords = preferredRecords(records, 'active_energy', day)
  const writeActivity = value => update(s => {
    if (value === '') return
    s.activity ||= { records: [] }
    const record = makeManualActivity({ metric: 'active_energy', value, day, userId: user?.id || null })
    s.activity.records = (s.activity.records || []).filter(r => r.externalRecordId !== record.externalRecordId)
    s.activity.records.push(record)
  })
  const add = () => openSheet(close => <EntrySheet close={close} onSave={value => { writeActivity(value); toast(t('Activity saved')) }} />)
  const shiftDay = delta => setDay(value => { const date = new Date(value + 'T12:00:00'); date.setDate(date.getDate() + delta); return isoOf(date) })
  const shownDate = new Date(day + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  return <div className="health-page">
    <header className="hdr health-header"><div><h1>{t('Activity')}</h1><div className="sub">{shownDate}</div></div></header>
    <section className="health-overview activity-overview">
      <div className="health-date-row"><button className="iconbtn" onClick={() => shiftDay(-1)} aria-label={t('Previous day')}><Icon name="chevronLeft" /></button><span>{day === todayISO() ? t('Today') : shownDate}</span><button className="iconbtn" onClick={() => shiftDay(1)} disabled={day >= todayISO()} aria-label={t('Next day')}><Icon name="chevronRight" /></button></div>
      <div className="energy-summary"><span>{t('Active energy')}</span><strong>{selectedRecords.length ? `${Math.round(energy)} kcal` : t('Not recorded')}</strong></div>
      <p className="health-help">{t('FORM. does not estimate workout energy or resting energy, so total expenditure remains unknown.')}</p>
      <Button variant="tinted" icon="plus" onClick={add}>{t('Log active energy')}</Button>
    </section>
    {selectedRecords.length > 0 && <section className="meal-group"><h2>{t('Activity records')}</h2><div className="sect-b">{selectedRecords.map(record => <div className="meal-row" key={record.id}>
      <div className="meal-dot"><Icon name="flame" /></div><div className="meal-info"><b>{Math.round(record.value)} {t('active kcal')}</b><small>{record.provider === 'browser_motion' ? t('Phone activity') : record.provider} · {record.day}</small></div>
      <button className="meal-remove" aria-label={t('Remove activity record')} onClick={() => confirmSheet({ title: t('Remove activity record?'), message: t('This record will be removed from your activity history.'), confirmText: t('Remove'), danger: true, onConfirm: () => update(s => { s.activity.records = s.activity.records.filter(r => r.id !== record.id) }) })}><Icon name="trash" /></button>
    </div>)}</div></section>}
  </div>
}
