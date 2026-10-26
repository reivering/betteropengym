import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { todayISO, isoOf } from '../lib/format.js'
import { t } from '../lib/i18n.js'
import { activityTotal, makeManualActivity, preferredRecords } from '../lib/health.js'
import { Button } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { confirmSheet } from '../sheets.jsx'

function EntrySheet({ goal, close, onSave }) {
  const [steps, setSteps] = useState('')
  const [activeCalories, setActiveCalories] = useState('')
  return <div className="health-sheet">
    <div className="muted small">Enter today's totals from a device or your own count. A new manual total replaces today's previous manual total.</div>
    <label className="health-label">Steps today<input className="health-input" type="number" min="0" step="1" autoFocus value={steps} onChange={e => setSteps(e.target.value)} placeholder="e.g. 6420" /></label>
    <label className="health-label">Active calories (optional)<input className="health-input" type="number" min="0" step="1" value={activeCalories} onChange={e => setActiveCalories(e.target.value)} placeholder="Not recorded" /></label>
    <div className="health-help">Active calories are separate from resting and workout energy. FORM. does not combine or estimate total burn yet.</div>
    <Button variant="primary" icon="check" onClick={() => { onSave({ steps, activeCalories }); close() }}>Save activity</Button>
  </div>
}

function GoalSheet({ value, close, onSave }) {
  const [goal, setGoal] = useState(String(value))
  return <div className="health-sheet"><label className="health-label">Daily step goal<input className="health-input" type="number" min="1" step="100" value={goal} onChange={e => setGoal(e.target.value)} /></label><div className="health-help">Choose a target that fits your routine. It does not have to be 10,000.</div><Button variant="primary" icon="check" onClick={() => { onSave(Math.max(1, Number(goal) || 8000)); close() }}>Save goal</Button></div>
}

export default function Activity() {
  const S = useStore(s => s.S)
  const user = useStore(s => s.user)
  const update = useStore(s => s.update)
  const openSheet = useUI(s => s.openSheet)
  const toast = useUI(s => s.toast)
  const [day, setDay] = useState(todayISO())
  const activity = S.activity || { stepGoal: 8000, records: [] }
  const records = activity.records || []
  const steps = activityTotal(records, 'steps', day)
  const energy = activityTotal(records, 'active_energy', day)
  const selectedStepRecords = preferredRecords(records, 'steps', day)
  const selectedEnergyRecords = preferredRecords(records, 'active_energy', day)
  const lastSeven = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(day + 'T12:00:00'); date.setDate(date.getDate() - (6 - index))
    const iso = isoOf(date)
    return { day: iso, label: date.toLocaleDateString(undefined, { weekday: 'short' }), count: activityTotal(records, 'steps', iso) }
  }), [records, day])
  const maxSteps = Math.max(activity.stepGoal || 8000, ...lastSeven.map(d => d.count), 1)
  const writeActivity = values => update(s => {
    s.activity ||= { stepGoal: 8000, records: [] }
    if (values.steps !== '') {
      const record = makeManualActivity({ metric: 'steps', value: values.steps, day, userId: user?.id || null })
      s.activity.records = s.activity.records.filter(r => r.externalRecordId !== record.externalRecordId)
      s.activity.records.push(record)
    }
    if (values.activeCalories !== '') {
      const record = makeManualActivity({ metric: 'active_energy', value: values.activeCalories, day, userId: user?.id || null })
      s.activity.records = s.activity.records.filter(r => r.externalRecordId !== record.externalRecordId)
      s.activity.records.push(record)
    }
  })
  const add = () => openSheet(close => <EntrySheet goal={activity.stepGoal} close={close} onSave={values => { writeActivity(values); toast('Activity saved') }} />)
  const editGoal = () => openSheet(close => <GoalSheet value={activity.stepGoal || 8000} close={close} onSave={value => update(s => { s.activity ||= { records: [] }; s.activity.stepGoal = value })} />)
  const previous = () => setDay(d => { const date = new Date(d + 'T12:00:00'); date.setDate(date.getDate() - 1); return isoOf(date) })
  const next = () => { if (day < todayISO()) setDay(d => { const date = new Date(d + 'T12:00:00'); date.setDate(date.getDate() + 1); return isoOf(date) }) }
  const recordsToday = [...selectedStepRecords, ...selectedEnergyRecords]

  return <div className="health-page">
    <header className="hdr health-header"><div><div className="kicker">{t('EVERYDAY MOVEMENT')}</div><h1>Activity</h1><div className="sub">{new Date(day + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div></div><button className="iconbtn" onClick={editGoal} aria-label="Edit step goal"><Icon name="target" /></button></header>
    <section className="health-overview activity-overview">
      <div className="health-date-row"><button className="iconbtn" onClick={previous} aria-label="Previous day"><Icon name="chevronLeft" /></button><span>{day === todayISO() ? 'Today' : day}</span><button className="iconbtn" onClick={next} disabled={day >= todayISO()} aria-label="Next day"><Icon name="chevronRight" /></button></div>
      <div className="step-readout"><div><span className="muted small">Steps</span><b>{steps.toLocaleString()}</b></div><span className="health-target">of {(activity.stepGoal || 8000).toLocaleString()}</span></div>
      <div className="health-progress"><i style={{ '--health-progress': Math.min(1, steps / (activity.stepGoal || 8000)) }} /></div>
      <div className="health-note"><span>{Math.round(steps / (activity.stepGoal || 8000) * 100)}% of daily goal</span><Button size="sm" variant="plain" onClick={editGoal}>Change goal</Button></div>
      <Button variant="primary" icon="plus" onClick={add}>Log activity</Button>
    </section>
    <section className="health-overview week-activity">
      <div className="health-toolbar"><h2>Steps · last 7 days</h2></div>
      <div className="step-week-chart">{lastSeven.map(item => <div className="step-day" key={item.day}><span>{item.count ? item.count.toLocaleString() : '–'}</span><div className="step-bar"><i style={{ height: Math.max(2, item.count / maxSteps * 100) + '%' }} /></div><small>{item.label}</small></div>)}</div>
      <div className="health-footnote">Source-aware totals use the highest-priority provider for each date rather than adding overlapping device totals. Manual entry is the current source.</div>
    </section>
    <section className="health-overview energy-overview">
      <div className="health-toolbar"><h2>Energy from activity</h2></div>
      <div className="energy-pair"><div><span>Active calories</span><b>{energy ? `${Math.round(energy)} kcal` : 'Not recorded'}</b></div><div><span>Resting / total burn</span><b>Not available</b></div></div>
      <div className="health-help">Activity calories are not added to nutrition targets. Workout energy and resting energy are not yet measured, so FORM. leaves total expenditure unknown.</div>
    </section>
    {recordsToday.length > 0 && <section className="meal-group"><div className="meal-category">Today's source records</div><div className="sect-b">{recordsToday.map(record => <div className="meal-row" key={record.id}><div className="meal-dot"><Icon name={record.metric === 'steps' ? 'walk' : 'flame'} /></div><div className="meal-info"><b>{record.metric === 'steps' ? `${Number(record.value).toLocaleString()} steps` : `${Math.round(record.value)} active kcal`}</b><small>{record.provider} · {record.day}</small></div><button className="meal-remove" aria-label="Remove activity record" onClick={() => confirmSheet({ title: 'Remove activity record?', message: 'This record will be removed from your activity history.', confirmText: 'Remove', danger: true, onConfirm: () => update(s => { s.activity.records = s.activity.records.filter(r => r.id !== record.id) }) })}><Icon name="trash" /></button></div>)}</div></section>}
  </div>
}
