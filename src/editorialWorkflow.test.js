import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getEditorialPublicationState,
  isEditoriallyPublished,
  isScheduledPublicationDue,
} from './editorialWorkflow.js'

const now = new Date('2026-08-02T15:00:00.000Z')

test('un borrador nunca es público', () => {
  assert.equal(isEditoriallyPublished({ publication_status: 'draft' }, now), false)
  assert.equal(getEditorialPublicationState({ publication_status: 'draft' }, now).key, 'draft')
})

test('una programación futura permanece oculta', () => {
  const product = {
    publication_status: 'scheduled',
    planned_publish_at: '2026-08-03T15:00:00.000Z',
  }
  assert.equal(isScheduledPublicationDue(product, now), false)
  assert.equal(isEditoriallyPublished(product, now), false)
})

test('una programación vencida se publica', () => {
  const product = {
    publication_status: 'scheduled',
    planned_publish_at: '2026-08-02T14:00:00.000Z',
  }
  assert.equal(isScheduledPublicationDue(product, now), true)
  assert.equal(isEditoriallyPublished(product, now), true)
  assert.equal(getEditorialPublicationState(product, now).public, true)
})

test('productos anteriores a la migración conservan el comportamiento público', () => {
  assert.equal(isEditoriallyPublished({}, now), true)
})

