import { describe, expect, it } from 'vitest'
import { activityTotal, HEALTH_DEFAULTS, makeFood, makeManualActivity, makeMeal, mealForDay, mergeHealthState, nutritionTotals } from './health.js'

describe('backwards-compatible health state', () => {
  it('adds new nutrition and activity defaults without changing legacy workout data', () => {
    const oldState = { workouts: [{ d: '2026-10-25' }], bodyweight: [{ d: '2026-10-25', w: 70 }] }
    const merged = mergeHealthState(oldState)
    expect(merged.workouts).toEqual(oldState.workouts)
    expect(merged.nutrition.goals).toEqual(HEALTH_DEFAULTS.nutrition.goals)
    expect(merged.nutrition.meals).toEqual([])
    expect(merged.activity.records).toEqual([])
  })
  it('fills missing nested target defaults while retaining saved records', () => {
    const saved = { nutrition: { goals: { calories: 1850 }, meals: [{ id: 'a' }] }, activity: { stepGoal: 6500 } }
    const merged = mergeHealthState(saved)
    expect(merged.nutrition.goals).toMatchObject({ calories: 1850, protein: 130, weightGoal: 'maintain' })
    expect(merged.nutrition.meals).toEqual([{ id: 'a' }])
    expect(merged.activity).toMatchObject({ stepGoal: 6500, records: [] })
  })
})

describe('nutrition tracking', () => {
  it('scales values from an explicit 100g basis and snapshots logged nutrients', () => {
    const food = makeFood({ name: 'Oats', calories: 380, protein: 13, carbs: 68, fat: 7, fiber: 10 })
    const meal = makeMeal(food, 50, 'Breakfast', '2026-10-26')
    food.nutrientsPer100g.calories = 900
    expect(meal.nutrients).toEqual({ calories: 190, protein: 6.5, carbs: 34, fat: 3.5, fiber: 5 })
  })

  it('aggregates only the selected local date', () => {
    const S = { nutrition: { meals: [
      { day: '2026-10-26', nutrients: { calories: 300, protein: 20 } },
      { day: '2026-10-25', nutrients: { calories: 500, protein: 40 } }
    ] } }
    expect(nutritionTotals(mealForDay(S, '2026-10-26'))).toMatchObject({ calories: 300, protein: 20, carbs: 0 })
  })
})

describe('activity tracking', () => {
  it('uses one canonical provider for a day instead of adding overlapping totals', () => {
    const records = [
      makeManualActivity({ metric: 'steps', value: 8000, day: '2026-10-26' }),
      { ...makeManualActivity({ metric: 'steps', value: 9000, day: '2026-10-26' }), provider: 'health_connect', externalRecordId: 'health:1' }
    ]
    expect(activityTotal(records, 'steps', '2026-10-26')).toBe(9000)
  })

  it('replaces duplicated source records with the same external identity', () => {
    const first = makeManualActivity({ metric: 'steps', value: 4000, day: '2026-10-26' })
    const second = { ...first, value: 5000, id: 'retry' }
    expect(activityTotal([first, second], 'steps', '2026-10-26')).toBe(5000)
  })

  it('does not sum overlapping same-priority device totals', () => {
    const base = makeManualActivity({ metric: 'steps', value: 4000, day: '2026-10-26' })
    const secondDevice = { ...base, id: 'other', provider: 'health_connect', deviceId: 'phone-2', value: 9000, externalRecordId: 'hc:2', syncedAt: '2026-10-26T10:00:00.000Z' }
    expect(activityTotal([{ ...base, provider: 'health_connect', syncedAt: '2026-10-26T09:00:00.000Z' }, secondDevice], 'steps', '2026-10-26')).toBe(9000)
  })
})
