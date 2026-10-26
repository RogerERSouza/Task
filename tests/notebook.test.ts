import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createContent,
  getCounterTotal,
  getSectionPath,
  isNotebook,
} from '../src/lib/notebook.ts'

test('counter history includes increases and corrections', () => {
  assert.equal(
    getCounterTotal([
      {
        id: '1',
        delta: 1,
        createdAt: '2026-10-26T12:00:00Z',
        note: 'Primeira planta',
      },
      { id: '2', delta: 1, createdAt: '2026-10-26T12:01:00Z', note: '' },
      {
        id: '3',
        delta: -1,
        createdAt: '2026-10-26T12:02:00Z',
        note: 'Correção',
      },
    ]),
    1,
  )
  assert.equal(getCounterTotal([]), 0)
})

test('breadcrumbs follow parents and stop on cycles', () => {
  const sections = [
    { id: 'a', parentId: null, title: 'Aprender', emoji: '', color: '#fff' },
    { id: 'b', parentId: 'a', title: 'Plantar', emoji: '', color: '#fff' },
  ]
  assert.deepEqual(
    getSectionPath(sections, 'b').map((section) => section.id),
    ['a', 'b'],
  )
  assert.deepEqual(getSectionPath(sections, 'missing'), [])
  sections[0].parentId = 'b'
  assert.equal(getSectionPath(sections, 'b').length, 2)
})

test('new content receives an independent id and empty data for its type', () => {
  const first = createContent('checklist', 'section', 'Mala')
  const second = createContent('checklist', 'section', 'Compras')
  assert.notEqual(first.id, second.id)
  assert.equal(first.sectionId, 'section')
  assert.equal(first.kind, 'checklist')
  assert.deepEqual('items' in first && first.items, [])
  const counter = createContent('counter', 'section', 'Plantas')
  assert.deepEqual('entries' in counter && counter.entries, [])
})

test('saved data validation rejects malformed content and unsupported versions', () => {
  const valid = {
    schemaVersion: 1,
    sections: [],
    contents: [createContent('note', 'section', 'Nota')],
    reminders: [],
  }
  assert.equal(isNotebook(valid), true)
  assert.equal(isNotebook({ ...valid, schemaVersion: 2 }), false)
  assert.equal(
    isNotebook({
      ...valid,
      contents: [
        {
          ...valid.contents[0],
          kind: 'counter',
          entries: [{ delta: 'wrong' }],
        },
      ],
    }),
    false,
  )
  assert.equal(isNotebook(null), false)
})
