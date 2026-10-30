import { getSectionPath } from './notebook.ts'
import type { Content, ContentKind, Notebook } from '../types.ts'

export type SearchResult =
  | {
      kind: 'section'
      id: string
      title: string
      detail: string
    }
  | {
      kind: 'content'
      id: string
      title: string
      detail: string
      contentKind: ContentKind
    }
  | {
      kind: 'reminder'
      id: string
      title: string
      detail: string
    }

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

function getContentText(content: Content) {
  if (content.kind === 'note') return `${content.title} ${content.text}`
  if (content.kind === 'checklist')
    return `${content.title} ${content.items.map((item) => item.text).join(' ')}`
  if (content.kind === 'tutorial')
    return `${content.title} ${content.text} ${content.items.map((item) => item.text).join(' ')}`
  return content.title
}

function getSectionName(notebook: Notebook, id: string) {
  return getSectionPath(notebook.sections, id)
    .map((section) => section.title)
    .join(' › ')
}

export function searchNotebook(
  notebook: Notebook,
  query: string,
): SearchResult[] {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return []

  const sections = notebook.sections
    .filter((section) =>
      normalize(`${section.title} ${section.emoji}`).includes(normalizedQuery),
    )
    .map((section) => ({
      kind: 'section' as const,
      id: section.id,
      title: section.title,
      detail: getSectionName(notebook, section.id),
    }))
  const contents = notebook.contents
    .filter((content) =>
      normalize(getContentText(content)).includes(normalizedQuery),
    )
    .map((content) => ({
      kind: 'content' as const,
      id: content.id,
      title: content.title,
      contentKind: content.kind,
      detail: getSectionName(notebook, content.sectionId),
    }))
  const reminders = notebook.reminders
    .filter((reminder) =>
      normalize(`${reminder.title} ${reminder.date}`).includes(normalizedQuery),
    )
    .map((reminder) => ({
      kind: 'reminder' as const,
      id: reminder.id,
      title: reminder.title,
      detail: reminder.date,
    }))

  return [...sections, ...contents, ...reminders]
}
