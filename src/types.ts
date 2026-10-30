export type ContentKind = 'note' | 'checklist' | 'tutorial' | 'counter'

export interface Section {
  id: string
  parentId: string | null
  title: string
  emoji: string
  color: string
  favorite?: boolean
  tags?: string[]
}

export interface ListItem {
  id: string
  text: string
  completed: boolean
}

export interface CounterEntry {
  id: string
  delta: number
  createdAt: string
  note: string
}

export interface ContentBase {
  id: string
  sectionId: string
  title: string
}

export type Content =
  | (ContentBase & { kind: 'note'; text: string })
  | (ContentBase & { kind: 'checklist'; items: ListItem[] })
  | (ContentBase & { kind: 'tutorial'; text: string; items: ListItem[] })
  | (ContentBase & { kind: 'counter'; entries: CounterEntry[] })

export interface Reminder {
  id: string
  title: string
  date: string
  schedule?: 'all-day' | 'time-range'
  startTime?: string
  endDate?: string
  endTime?: string
  repeatTimes?: string[]
  duration?: 'single-day' | 'multi-day'
  countdownFormat?:
    'automatic' | 'days-hours' | 'hours-minutes' | 'minutes-seconds'
}

export interface Notebook {
  schemaVersion: 1
  sections: Section[]
  contents: Content[]
  reminders: Reminder[]
}
