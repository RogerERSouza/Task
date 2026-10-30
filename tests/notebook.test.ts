import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createContent,
  getCounterTotal,
  getSectionPath,
  isNotebook,
  parseNotebookBackup,
  removeSectionTree,
} from '../src/lib/notebook.ts'
import {
  formatReminderCountdown,
  formatReminderDate,
  getReminderNextOccurrence,
  getReminderPriority,
  isReminderExpired,
} from '../src/lib/reminders.ts'

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

test('removing a section also removes its descendants and contents', () => {
  const notebook = {
    schemaVersion: 1 as const,
    sections: [
      { id: 'keep', parentId: null, title: 'Manter', emoji: '', color: '#fff' },
      {
        id: 'remove',
        parentId: null,
        title: 'Apagar',
        emoji: '',
        color: '#fff',
      },
      {
        id: 'child',
        parentId: 'remove',
        title: 'Subseção',
        emoji: '',
        color: '#fff',
      },
    ],
    contents: [
      createContent('note', 'keep', 'Fica'),
      createContent('note', 'remove', 'Sai'),
      createContent('checklist', 'child', 'Também sai'),
    ],
    reminders: [],
  }

  const updated = removeSectionTree(notebook, 'remove')
  assert.deepEqual(
    updated.sections.map((section) => section.id),
    ['keep'],
  )
  assert.deepEqual(
    updated.contents.map((content) => content.sectionId),
    ['keep'],
  )
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

test('sections keep an optional favorite preference in backups', () => {
  const base = {
    schemaVersion: 1,
    contents: [],
    reminders: [],
  }
  assert.equal(
    isNotebook({
      ...base,
      sections: [
        {
          id: 'section',
          parentId: null,
          title: 'Importante',
          emoji: '⭐',
          color: '#edcf94',
          favorite: true,
        },
      ],
    }),
    true,
  )
  assert.equal(
    isNotebook({
      ...base,
      sections: [
        {
          id: 'section',
          parentId: null,
          title: 'Inválida',
          emoji: '',
          color: '#edcf94',
          favorite: 'yes',
        },
      ],
    }),
    false,
  )
})

test('backup import accepts valid data and rejects invalid JSON or a wrong schema', () => {
  const backup = {
    schemaVersion: 1,
    sections: [],
    contents: [],
    reminders: [],
  }
  assert.deepEqual(parseNotebookBackup(JSON.stringify(backup)), backup)
  assert.throws(() => parseNotebookBackup('{invalid'))
  assert.throws(() =>
    parseNotebookBackup(JSON.stringify({ ...backup, schemaVersion: 2 })),
  )
})

test('saved data keeps legacy reminders and accepts scheduled reminders', () => {
  const base = {
    schemaVersion: 1,
    sections: [],
    contents: [],
  }
  assert.equal(
    isNotebook({
      ...base,
      reminders: [{ id: 'legacy', title: 'Antigo', date: '2026-11-02T09:00' }],
    }),
    true,
  )
  assert.equal(
    isNotebook({
      ...base,
      reminders: [
        {
          id: 'new',
          title: 'Novo',
          date: '2026-11-02',
          schedule: 'time-range',
          startTime: '09:00',
          endDate: '2026-11-03',
          endTime: '10:00',
          duration: 'multi-day',
          countdownFormat: 'days-hours',
        },
      ],
    }),
    true,
  )
  assert.equal(
    isNotebook({
      ...base,
      reminders: [
        { id: 'invalid', title: 'Erro', date: '2026-11-02', schedule: 'soon' },
      ],
    }),
    false,
  )
  assert.equal(
    isNotebook({
      ...base,
      reminders: [
        {
          id: 'invalid-duration',
          title: 'Erro',
          date: '2026-11-02',
          duration: 'forever',
        },
      ],
    }),
    false,
  )
})

test('reminder dates and countdowns use the selected schedule', () => {
  const reminder = {
    id: 'new',
    title: 'Prova',
    date: '2026-11-02',
    schedule: 'time-range' as const,
    startTime: '09:00',
    endTime: '10:00',
    countdownFormat: 'hours-minutes' as const,
  }
  assert.match(formatReminderDate(reminder), /02 de nov\./)
  assert.equal(
    formatReminderCountdown(reminder, new Date(2026, 10, 2, 7, 30)),
    'Faltam 01h 30min',
  )
  assert.equal(
    formatReminderCountdown(reminder, new Date(2026, 10, 2, 9, 30)),
    'Em andamento',
  )
  assert.equal(
    formatReminderCountdown(
      {
        id: 'all-day',
        title: 'Feriado',
        date: '2026-11-02',
        schedule: 'all-day',
      },
      new Date(2026, 10, 2, 15, 30),
    ),
    'Hoje',
  )
})

test('multi-day reminders show their range and upcoming reminders are prioritized', () => {
  const multiDay = {
    id: 'trip',
    title: 'Viagem',
    date: '2026-11-02',
    endDate: '2026-11-04',
    schedule: 'time-range' as const,
    startTime: '09:00',
    endTime: '18:00',
  }
  assert.match(formatReminderDate(multiDay), /02 de nov\..*04 de nov\./)
  assert.equal(
    formatReminderCountdown(multiDay, new Date(2026, 10, 1, 9, 0)),
    'Faltam 1d 00h',
  )

  const now = new Date(2026, 10, 1, 8, 0)
  const later = {
    ...multiDay,
    id: 'later',
    date: '2026-11-05',
    endDate: '2026-11-06',
  }
  assert.ok(
    getReminderPriority(multiDay, now) < getReminderPriority(later, now),
  )
})

test('scheduled daily times find the next occurrence inside the selected period', () => {
  const medicine = {
    id: 'medicine',
    title: 'Remédio',
    date: '2026-11-02',
    endDate: '2026-11-08',
    schedule: 'time-range' as const,
    repeatTimes: ['08:00', '20:00'],
  }
  const now = new Date(2026, 10, 3, 10, 0)
  const next = getReminderNextOccurrence(medicine, now)
  assert.equal(next?.getHours(), 20)
  assert.equal(next?.getDate(), 3)
  assert.equal(formatReminderCountdown(medicine, now), 'Faltam 10h 00min')
  assert.match(formatReminderDate(medicine), /08:00, 20:00/)
})

test('expired reminders are separated from reminders still in progress', () => {
  const reminder = {
    id: 'exam',
    title: 'Prova',
    date: '2026-11-02',
    schedule: 'time-range' as const,
    startTime: '09:00',
    endTime: '10:00',
  }
  assert.equal(isReminderExpired(reminder, new Date(2026, 10, 2, 9, 30)), false)
  assert.equal(isReminderExpired(reminder, new Date(2026, 10, 2, 10, 0)), true)
})

test('a single-time reminder shows its one scheduled time', () => {
  const reminder = {
    id: 'class',
    title: 'Aula',
    date: '2026-11-02',
    schedule: 'time-range' as const,
    startTime: '14:30',
  }
  assert.match(formatReminderDate(reminder), /02 de nov\. · 14:30/)
  assert.equal(
    formatReminderCountdown(reminder, new Date(2026, 10, 2, 14, 0)),
    'Faltam 30min 00s',
  )
})
