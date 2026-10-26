import { expect, it } from 'vitest'
import { bootWait } from './boot.js'

it('lets the FORM. stroke draw finish before it goes', () => {
  expect(bootWait(100, false)).toBe(600)
  expect(bootWait(720, false)).toBe(0)
})

it('does not wait again after the wordmark has finished drawing', () => {
  expect(bootWait(650, false)).toBe(50)
  expect(bootWait(700, false)).toBe(0)
  expect(bootWait(1750, false)).toBe(0)
})

it('goes at once with reduced motion or no timing to read', () => {
  expect(bootWait(300, true)).toBe(0)
  expect(bootWait(NaN, false)).toBe(0)
})
