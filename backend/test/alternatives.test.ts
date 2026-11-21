import test from 'node:test'
import assert from 'node:assert/strict'
import { findAlternatives, trips } from '../src/store'

test('9:00 full trip returns accessible earlier and later alternatives', () => {
  const trip = trips.find(t => t.id === 'HB-803')!
  trip.status = 'FULL'
  trip.baysFree = 0

  const result = findAlternatives('09:00', ['wheelchair'], 'Esplanade', 'Salt Lake Sector V')

  assert.equal(result.exact, null)
  assert.equal(result.earlier?.id, 'HB-802')
  assert.equal(result.later?.id, 'HB-804')
  assert.match(result.reason, /09:00 is full/)
})
