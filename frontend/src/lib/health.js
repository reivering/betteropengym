import { uid } from './format.js'

export const HEALTH_DEFAULTS = {
  nutrition: { goals: { calories: 2000, protein: 130, carbs: 220, fat: 65, fiber: 28, weightGoal: 'maintain', exerciseAdjustment: 0 }, foods: [], meals: [] },
  activity: { stepGoal: 8000, records: [] }
}

export function mergeHealthState(state, defaults = HEALTH_DEFAULTS) {
  const saved = state || {}
  return {
    ...saved,
    nutrition: {
      ...defaults.nutrition,
      ...(saved.nutrition || {}),
      goals: { ...defaults.nutrition.goals, ...(saved.nutrition?.goals || {}) },
      foods: Array.isArray(saved.nutrition?.foods) ? saved.nutrition.foods : [],
      meals: Array.isArray(saved.nutrition?.meals) ? saved.nutrition.meals : []
    },
    activity: {
      ...defaults.activity,
      ...(saved.activity || {}),
      stepGoal: Number(saved.activity?.stepGoal) > 0 ? Number(saved.activity.stepGoal) : defaults.activity.stepGoal,
      records: Array.isArray(saved.activity?.records) ? saved.activity.records : []
    }
  }
}

// Device/server merges keep health entries from both copies. Goals and source preferences follow
// the winning profile copy, while separately logged records are joined by stable ID.
export function mergeHealthNamespaces(newer, older) {
  const n = mergeHealthState(newer)
  const o = mergeHealthState(older)
  const union = (first, second) => {
    const out = new Map()
    for (const entry of [...(second || []), ...(first || [])]) {
      if (!entry || entry.id == null) continue
      if (!out.has(entry.id)) out.set(entry.id, entry)
    }
    return [...out.values()]
  }
  return {
    nutrition: {
      ...n.nutrition,
      foods: union(n.nutrition.foods, o.nutrition.foods),
      meals: union(n.nutrition.meals, o.nutrition.meals)
    },
    activity: { ...n.activity, records: union(n.activity.records, o.activity.records) }
  }
}

export function mealForDay(S, day) {
  return (S.nutrition?.meals || []).filter(entry => entry.day === day)
}

export function nutritionTotals(entries) {
  return entries.reduce((total, entry) => {
    for (const key of ['calories', 'protein', 'carbs', 'fat', 'fiber']) total[key] += Number(entry.nutrients?.[key] || 0)
    return total
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
}

// Per-day source priority prevents overlapping whole-day totals from being added across
// devices. Future providers should upload interval records and dedupe identical external IDs.
const SOURCE_PRIORITY = { health_connect: 30, healthkit: 30, manual: 20, import: 10 }
export function preferredRecords(records, metric, day) {
  const candidates = (records || []).filter(r => r.metric === metric && r.day === day)
  if (!candidates.length) return []
  const groups = new Map()
  for (const record of candidates) {
    const key = `${record.provider || 'unknown'}:${record.deviceId || 'unknown'}`
    const group = groups.get(key) || { key, priority: SOURCE_PRIORITY[record.provider] || 0, syncedAt: '' }
    if ((record.syncedAt || '') > group.syncedAt) group.syncedAt = record.syncedAt || ''
    groups.set(key, group)
  }
  // One provider/device is canonical for a full-day metric. If priority ties, use the
  // freshest source and then a stable lexical tie-break so totals never double-count.
  const source = [...groups.values()].sort((a, b) => b.priority - a.priority || b.syncedAt.localeCompare(a.syncedAt) || a.key.localeCompare(b.key))[0]
  const preferred = candidates.filter(r => `${r.provider || 'unknown'}:${r.deviceId || 'unknown'}` === source.key)
  const byId = new Map()
  for (const record of preferred) byId.set(record.externalRecordId || record.id, record)
  return [...byId.values()]
}

export function activityTotal(records, metric, day) {
  return preferredRecords(records, metric, day).reduce((sum, record) => sum + Number(record.value || 0), 0)
}

export function makeFood({ name, calories, protein, carbs, fat, fiber = 0 }) {
  return {
    id: uid(), name: String(name).trim(), basis: '100g', origin: 'manual', verified: false,
    nutrientsPer100g: Object.fromEntries(['calories', 'protein', 'carbs', 'fat', 'fiber'].map(key => [key, Math.max(0, Number({ calories, protein, carbs, fat, fiber }[key]) || 0)]))
  }
}

export function makeMeal(food, grams, category, day) {
  const quantity = Math.max(0, Number(grams) || 0)
  const nutrients = Object.fromEntries(Object.entries(food.nutrientsPer100g).map(([key, value]) => [key, Math.round(value * quantity / 100 * 10) / 10]))
  return { id: uid(), day, category, foodId: food.id, foodName: food.name, quantityGrams: quantity, nutrients, source: food.origin || 'manual' }
}

export function makeManualActivity({ metric, value, day, deviceId = 'manual-entry', userId = null }) {
  return {
    id: uid(), userId, provider: 'manual', deviceId,
    startAt: new Date(`${day}T00:00:00`).toISOString(), endAt: new Date(`${day}T23:59:59`).toISOString(), day,
    metric, value: Math.max(0, Number(value) || 0), unit: metric === 'steps' ? 'count' : 'kcal',
    externalRecordId: `manual:${metric}:${deviceId}:${day}`, syncedAt: new Date().toISOString()
  }
}
