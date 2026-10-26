import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { t } from '../lib/i18n.js'
import { todayISO, isoOf } from '../lib/format.js'
import { HEALTH_DEFAULTS, makeFood, makeMeal, mealForDay, nutritionTotals } from '../lib/health.js'
import { Button } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { confirmSheet } from '../sheets.jsx'
import { ingestMediaFile } from '../lib/media-ingest.js'
import { estimateFoodPhoto } from '../lib/coach-api.js'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
const num = n => Math.round((Number(n) || 0) * 10) / 10

function FoodSheet({ day, foods, onSave, close, aiReady }) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [grams, setGrams] = useState('100')
  const [category, setCategory] = useState('Breakfast')
  const [fresh, setFresh] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' })
  const [creating, setCreating] = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [estimate, setEstimate] = useState(null)
  const photoInput = useRef(null)
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview) }, [photoPreview])
  const found = foods.filter(food => food.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 12)

  const save = () => {
    const foodName = fresh.name.trim() || search.trim()
    const food = foodName && (creating || !selectedId) ? makeFood({ ...fresh, name: foodName }) : foods.find(f => f.id === selectedId)
    if (!food) return
    const amount = Number(grams)
    if (!Number.isFinite(amount) || amount <= 0) return
    onSave(food, makeMeal(food, amount, category, day))
    close()
  }
  const setField = (key, value) => setFresh(f => ({ ...f, [key]: value }))
  const analyzePhoto = async file => {
    if (!file) return
    setPhotoError(''); setEstimate(null); setPhotoBusy(true)
    let preview = ''
    try {
      const ingested = await ingestMediaFile(file)
      if (ingested.media.kind !== 'image') throw new Error(t('Choose a still food photo.'))
      const image = ingested.blobs.find(item => item.hash === ingested.media.hash)?.blob
      if (!image) throw new Error(t('That photo could not be prepared.'))
      preview = URL.createObjectURL(image)
      setPhotoPreview(previous => { if (previous) URL.revokeObjectURL(previous); return preview })
      const result = await estimateFoodPhoto(image)
      const serving = Math.max(1, Number(result.servingGrams) || 100)
      const per100 = key => num((Number(result[key]) || 0) * 100 / serving)
      setFresh({ name: String(result.name || t('Meal estimate')).slice(0, 100), calories: per100('calories'), protein: per100('protein'), carbs: per100('carbs'), fat: per100('fat'), fiber: per100('fiber') })
      setSearch(''); setSelectedId(''); setCreating(true); setGrams(String(serving))
      setEstimate({ ...result, servingGrams: serving })
    } catch (error) {
      setPhotoError(error?.message || t('The food photo could not be analyzed.'))
    } finally { setPhotoBusy(false) }
  }
  return <div className="health-sheet">
    <input ref={photoInput} hidden type="file" accept="image/*" capture="environment" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; analyzePhoto(file) }} />
    <div className="food-photo-card">
      <div className="muted small">{t('Take a clear photo of your meal and the AI Coach will estimate calories and nutrients.')}</div>
      <Button icon="camera" disabled={!aiReady || photoBusy} onClick={() => photoInput.current?.click()}>{photoBusy ? t('Analyzing photo…') : t('Analyze food photo')}</Button>
      {!aiReady && <div className="health-help">{t('Connect the server Codex Coach to use photo estimates.')}</div>}
      {photoPreview && <img className="food-photo-preview" src={photoPreview} alt={t('Selected food photo')} />}
      {photoBusy && <div className="muted small" role="status">{t('The photo is being sent to your server’s Codex AI for an estimate. It is not saved by FORM.')}</div>}
      {photoError && <div className="food-photo-error" role="alert">{photoError}</div>}
      {estimate && <div className="health-help">{t('AI estimate: {0} kcal for about {1} g. Check the food and amounts below, then save when they look right.', num(estimate.calories), estimate.servingGrams)}{estimate.confidence ? ` · ${t('Confidence')}: ${estimate.confidence}` : ''}{estimate.notes ? ` · ${estimate.notes}` : ''}</div>}
      {!photoBusy && !photoError && !estimate && <div className="muted small">{t('Your photo is sent only when you choose Analyze. Nothing is logged until you review and save.')}</div>}
    </div>
    <div className="muted small">Pick a saved food or enter a new food using values per 100 g.</div>
    <label className="health-label">Search saved foods<input className="health-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your foods" /></label>
    {found.length > 0 && <div className="food-options">{found.map(food => <button key={food.id} className={'food-option' + (selectedId === food.id ? ' selected' : '')} onClick={() => { setSelectedId(food.id); setCreating(false); setFresh({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' }) }}><span><b>{food.name}</b><small>{food.nutrientsPer100g.calories} kcal · {food.nutrientsPer100g.protein} g protein per 100 g</small></span>{selectedId === food.id && <Icon name="check" />}</button>)}</div>}
    <button className="health-text-btn" onClick={() => { setCreating(true); setFresh(f => ({ ...f, name: search })); setSelectedId('') }}><Icon name="plus" /> Create a food manually</button>
    {(creating || (!selectedId && search.trim() && found.length === 0)) ? <div className="health-form-grid">
      <label className="health-label span2">Food name<input className="health-input" value={fresh.name || search} onChange={e => setField('name', e.target.value)} placeholder="e.g. Plain Greek yogurt" /></label>
      {['calories', 'protein', 'carbs', 'fat', 'fiber'].map(key => <label className="health-label" key={key}>{({ calories: 'Calories', protein: 'Protein (g)', carbs: 'Carbohydrates (g)', fat: 'Fat (g)', fiber: 'Fiber (g)' })[key]} per 100 g<input className="health-input" type="number" min="0" step="0.1" value={fresh[key]} onChange={e => setField(key, e.target.value)} placeholder="0" /></label>)}
    </div> : null}
    <div className="health-form-grid">
      <label className="health-label">Meal<select className="health-input" value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="health-label">Amount (g)<input className="health-input" type="number" min="1" step="1" value={grams} onChange={e => setGrams(e.target.value)} /></label>
    </div>
    <Button variant="primary" icon="check" onClick={save}>{t('Save meal')}</Button>
  </div>
}

function GoalsSheet({ goals, onSave, close }) {
  const [form, setForm] = useState({ ...goals })
  const fields = [['calories', 'Calories (kcal)'], ['protein', 'Protein (g)'], ['carbs', 'Carbohydrates (g)'], ['fat', 'Fat (g)'], ['fiber', 'Fiber (g)']]
  return <div className="health-sheet">
    <div className="health-form-grid">{fields.map(([key, label]) => <label className="health-label" key={key}>{label}<input className="health-input" type="number" min="0" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></label>)}
      <label className="health-label">Goal type<select className="health-input" value={form.weightGoal} onChange={e => setForm(f => ({ ...f, weightGoal: e.target.value }))}><option value="lose">Lose weight</option><option value="maintain">Maintain</option><option value="gain">Gain weight</option></select></label>
    </div>
    <div className="health-help">Targets are yours to change. Nutrition targets stay fixed regardless of activity calories.</div>
    <Button variant="primary" icon="check" onClick={() => { onSave(Object.fromEntries(Object.entries(form).map(([k, v]) => [k, k === 'weightGoal' ? v : Math.max(0, Number(v) || 0)]))); close() }}>Save targets</Button>
  </div>
}

export default function Nutrition() {
  const S = useStore(s => s.S)
  const user = useStore(s => s.user)
  const config = useStore(s => s.config)
  const update = useStore(s => s.update)
  const openSheet = useUI(s => s.openSheet)
  const toast = useUI(s => s.toast)
  const [day, setDay] = useState(todayISO())
  const nutrition = { ...HEALTH_DEFAULTS.nutrition, ...(S.nutrition || {}), goals: { ...HEALTH_DEFAULTS.nutrition.goals, ...(S.nutrition?.goals || {}) } }
  const entries = mealForDay({ nutrition }, day)
  const totals = nutritionTotals(entries)
  const goals = nutrition.goals
  const byCategory = CATEGORIES.map(category => ({ category, meals: entries.filter(e => e.category === category) }))
  const showDate = value => new Date(value + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  const aiReady = !!user && config?.coach?.enabled && config?.coach?.provider === 'codex'
  const addFood = () => openSheet(close => <FoodSheet day={day} foods={nutrition.foods} aiReady={aiReady} close={close} onSave={(food, meal) => {
    update(s => {
      s.nutrition ||= structuredClone(HEALTH_DEFAULTS.nutrition)
      if (!s.nutrition.foods.some(f => f.name.toLowerCase() === food.name.toLowerCase())) s.nutrition.foods.push(food)
      s.nutrition.meals.push(meal)
    })
    toast(t('Meal logged'))
  }} />)
  const editGoals = () => openSheet(close => <GoalsSheet goals={goals} close={close} onSave={next => update(s => { s.nutrition ||= structuredClone(HEALTH_DEFAULTS.nutrition); s.nutrition.goals = next })} />)
  const pct = (value, target) => target ? Math.min(100, value / target * 100) : 0
  const prev = () => setDay(d => { const n = new Date(d + 'T12:00:00'); n.setDate(n.getDate() - 1); return isoOf(n) })
  const next = () => { if (day < todayISO()) setDay(d => { const n = new Date(d + 'T12:00:00'); n.setDate(n.getDate() + 1); return isoOf(n) }) }

  return <div className="health-page">
    <header className="hdr health-header"><div><div className="kicker">{t('NUTRITION')}</div><h1>{t('Nutrition')}</h1><div className="sub">{showDate(day)}</div></div><button className="iconbtn" onClick={editGoals} aria-label={t('Nutrition goals')}><Icon name="gear" /></button></header>
    <section className="health-overview">
      <div className="health-date-row"><button className="iconbtn" onClick={prev} aria-label={t('Previous day')}><Icon name="chevronLeft" /></button><span>{day === todayISO() ? t('Today') : showDate(day)}</span><button className="iconbtn" onClick={next} disabled={day >= todayISO()} aria-label={t('Next day')}><Icon name="chevronRight" /></button></div>
      <div className="health-calories"><div><span className="muted small">{t('Calories consumed')}</span><b>{num(totals.calories)} <small>kcal</small></b></div><div className="health-remaining"><span>{t('Remaining')}</span><b>{num(goals.calories - totals.calories)} kcal</b></div></div>
      <div className="health-progress"><i style={{ '--health-progress': pct(totals.calories, goals.calories) / 100 }} /></div>
      <div className="health-note">{t('Daily target')} <b>{num(goals.calories)} kcal</b></div>
      <div className="macro-grid">{[['Protein', 'protein'], ['Carbs', 'carbs'], ['Fat', 'fat'], ['Fiber', 'fiber']].map(([label, key]) => <div className="macro-meter" key={key}><div><span>{t(label)}</span><b>{num(totals[key])}<small> / {num(goals[key])} g</small></b></div><div className="health-progress"><i style={{ '--health-progress': pct(totals[key], goals[key]) / 100 }} /></div></div>)}</div>
    </section>
    <div className="health-toolbar"><h2>{t("Today's meals")}</h2><Button size="sm" icon="plus" variant="primary" onClick={addFood}>{t('Add food')}</Button></div>
    {!entries.length ? <div className="empty-health"><span className="lrow-i"><Icon name="fork" /></span><h3>{t('No food logged yet')}</h3><p>{t('Add your first food to see calories and nutrients here.')}</p><Button icon="plus" onClick={addFood}>{t('Log a meal')}</Button></div> : byCategory.map(group => group.meals.length > 0 && <section className="meal-group" key={group.category}><div className="meal-category">{t(group.category)}<span>{group.meals.reduce((n, m) => n + m.nutrients.calories, 0)} kcal</span></div><div className="sect-b">{group.meals.map(meal => <div className="meal-row" key={meal.id}><div className="meal-dot"><Icon name="fork" /></div><div className="meal-info"><b>{meal.foodName}</b><small>{meal.quantityGrams} g · {num(meal.nutrients.calories)} kcal · {num(meal.nutrients.protein)} g protein</small></div><button className="meal-remove" aria-label={t('Remove food')} onClick={() => confirmSheet({ title: t('Remove food?'), message: t('This food entry will be removed from this meal.'), confirmText: t('Remove'), danger: true, onConfirm: () => update(s => { s.nutrition.meals = s.nutrition.meals.filter(x => x.id !== meal.id) }) })}><Icon name="trash" /></button></div>)}</div></section>)}
    <div className="health-footnote">{t('Food values are user-entered estimates, stored per 100 g. Logged meals keep a nutrient snapshot.')}</div>
  </div>
}
