import type { Reminder } from '../types'

export type ReminderDraft = Omit<Reminder, 'id'>

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

function localDate(date: string, time = '00:00'): Date | null {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  )
    return null
  const result = new Date(year, month - 1, day, hour, minute)
  return result.getFullYear() === year && result.getMonth() === month - 1
    ? result
    : null
}

export function getDateInputValue(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getReminderDate(reminder: Reminder): string {
  return reminder.schedule ? reminder.date : reminder.date.slice(0, 10)
}

export function getReminderStart(reminder: Reminder): Date | null {
  if (reminder.schedule)
    return localDate(reminder.date, reminder.startTime ?? '00:00')
  const legacyDate = new Date(reminder.date)
  return Number.isNaN(legacyDate.getTime()) ? null : legacyDate
}

export function getReminderEnd(reminder: Reminder): Date | null {
  if (reminder.schedule !== 'time-range' || !reminder.endTime) return null
  const start = getReminderStart(reminder)
  const end = localDate(reminder.date, reminder.endTime)
  if (!start || !end) return null
  if (end <= start) end.setDate(end.getDate() + 1)
  return end
}

export function formatReminderDate(reminder: Reminder): string {
  const start = getReminderStart(reminder)
  if (!start) return 'Data inválida'
  if (reminder.schedule === 'all-day')
    return `${dateFormatter.format(start)} · Dia todo`
  if (reminder.schedule === 'time-range')
    return `${dateFormatter.format(start)} · ${reminder.startTime ?? '--:--'}–${reminder.endTime ?? '--:--'}`
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(start)
}

export function formatReminderCountdown(
  reminder: Reminder,
  now = new Date(),
): string {
  const start = getReminderStart(reminder)
  if (!start) return ''
  if (
    reminder.schedule === 'all-day' &&
    reminder.date === getDateInputValue(now)
  )
    return 'Hoje'
  const end = getReminderEnd(reminder)
  if (now >= start) return end && now < end ? 'Em andamento' : 'Encerrado'

  const totalSeconds = Math.floor((start.getTime() - now.getTime()) / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60
  const format = reminder.countdownFormat ?? 'automatic'
  const selectedFormat =
    format === 'automatic'
      ? days > 0
        ? 'days-hours'
        : hours > 0
          ? 'hours-minutes'
          : 'minutes-seconds'
      : format

  if (selectedFormat === 'days-hours') return `Faltam ${days}d ${hours}h`
  if (selectedFormat === 'hours-minutes')
    return `Faltam ${Math.floor(totalSeconds / 3_600)}h ${minutes}min`
  return `Faltam ${Math.floor(totalSeconds / 60)}min ${seconds}s`
}
