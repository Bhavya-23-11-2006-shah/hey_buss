import test from 'node:test'
import assert from 'node:assert/strict'
import { handleIntent } from '../src/voice'
import { trips } from '../src/store'
import type { Profile } from '../src/types'

const profile: Profile = {
  name: 'Voice Test',
  language: 'en',
  needs: ['wheelchair'],
  howToHelp: ['Need the ramp'],
}

test('voice booking understands a short next-bus request and confirms it', async () => {
  const trip = trips.find(item => item.id === 'HB-801')!
  const original = { status: trip.status, baysFree: trip.baysFree }
  trip.status = 'ON_TIME'
  trip.baysFree = 2

  try {
    const sessionId = `voice-next-${Date.now()}`
    const prompt = await handleIntent('book next bus to Salt Lake', sessionId, profile)
    assert.equal(prompt.uiAction.type, 'ASK_CONFIRM')
    assert.equal(prompt.uiAction.trips?.exact?.id, 'HB-801')
    assert.equal(prompt.entities.from, 'Esplanade')

    const confirmed = await handleIntent('yes', sessionId, profile)
    assert.equal(confirmed.uiAction.type, 'BOOKED')
    assert.equal(confirmed.uiAction.booking?.tripId, 'HB-801')
  } finally {
    trip.status = original.status
    trip.baysFree = original.baysFree
  }
})

test('voice booking carries stop and time answers through to confirmation', async () => {
  const trip = trips.find(item => item.id === 'HB-803')!
  const original = { status: trip.status, baysFree: trip.baysFree }
  trip.status = 'ON_TIME'
  trip.baysFree = 1

  try {
    const sessionId = `voice-followup-${Date.now()}`
    const first = await handleIntent('book bus to Salt Lake', sessionId, profile)
    assert.match(first.spokenReply, /time/i)

    const second = await handleIntent('9 am', sessionId, profile)
    assert.equal(second.uiAction.type, 'ASK_CONFIRM')
    assert.equal(second.uiAction.trips?.exact?.id, 'HB-803')

    const confirmed = await handleIntent('yes', sessionId, profile)
    assert.equal(confirmed.uiAction.type, 'BOOKED')
    assert.equal(confirmed.uiAction.booking?.tripId, 'HB-803')
  } finally {
    trip.status = original.status
    trip.baysFree = original.baysFree
  }
})
