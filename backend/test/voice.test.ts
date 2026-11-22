import test from 'node:test'
import assert from 'node:assert/strict'
import { bookings } from '../src/store'
import { extractSlots, handleIntent, parseSpokenTime } from '../src/voice'

const profile = {
  name: 'Test passenger',
  language: 'en' as const,
  needs: ['wheelchair' as const],
  howToHelp: [],
}

test('parses spoken English, Hindi, and Bengali-compatible time forms', () => {
  assert.equal(parseSpokenTime('nine thirty'), '09:30')
  assert.equal(parseSpokenTime('half past nine'), '09:30')
  assert.equal(parseSpokenTime('9 baje'), '09:00')
  assert.equal(parseSpokenTime('साढ़े नौ बजे'), '09:30')
  assert.equal(parseSpokenTime('6 pm'), '18:00')
})

test('does not treat digits in stop names as departure time', () => {
  const slots = extractSlots('book a bus from Howrah Station to Airport Gate 3')
  assert.equal(slots.from, 'Howrah Station')
  assert.equal(slots.to, 'Airport Gate 3')
  assert.equal(slots.time, undefined)
})

test('requires an exact confirmation before booking a pending trip', async () => {
  const sessionId = `voice-test-${Date.now()}`
  const before = bookings.size
  await handleIntent('book a bus from Esplanade to Salt Lake Sector V at 9', sessionId, profile)
  await handleIntent('I am looking for an earlier one', sessionId, profile)
  assert.equal(bookings.size, before)
})
