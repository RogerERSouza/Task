import { useState } from 'react'
import { getDateInputValue } from '../lib/reminders'

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Sex', 'Sáb']
const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
})

function getMonthStart(date: string): Date {
  const [year, month] = date.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

function getDays(month: Date): Array<Date | null> {
  const firstWeekDay = month.getDay()
  const totalDays = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate()
  const days: Array<Date | null> = Array.from(
    { length: firstWeekDay },
    () => null,
  )
  for (let day = 1; day <= totalDays; day += 1)
    days.push(new Date(month.getFullYear(), month.getMonth(), day))
  while (days.length % 7) days.push(null)
  return days
}

export function CalendarPicker({
  value,
  onChange,
  label = 'Escolher data',
}: {
  value: string
  onChange: (date: string) => void
  label?: string
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(value))
  const today = getDateInputValue()
  const days = getDays(visibleMonth)
  function selectDate(date: string) {
    onChange(date)
    setVisibleMonth(getMonthStart(date))
  }
  return (
    <section className="calendar-picker" aria-label={label}>
      <span className="calendar-label">{label}</span>
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          aria-label="Mês anterior"
          onClick={() =>
            setVisibleMonth(
              (month) => new Date(month.getFullYear(), month.getMonth() - 1, 1),
            )
          }
        >
          ‹
        </button>
        <strong>{monthFormatter.format(visibleMonth)}</strong>
        <button
          type="button"
          className="calendar-nav"
          aria-label="Próximo mês"
          onClick={() =>
            setVisibleMonth(
              (month) => new Date(month.getFullYear(), month.getMonth() + 1, 1),
            )
          }
        >
          ›
        </button>
      </div>
      <div className="calendar-grid" role="grid" aria-label="Dias do mês">
        {weekDays.map((day) => (
          <span className="calendar-weekday" key={day} aria-hidden="true">
            {day}
          </span>
        ))}
        {days.map((day, index) => {
          if (!day)
            return <span className="calendar-empty" key={`empty-${index}`} />
          const date = getDateInputValue(day)
          return (
            <button
              type="button"
              className={
                date === value
                  ? 'calendar-day selected'
                  : date === today
                    ? 'calendar-day today'
                    : 'calendar-day'
              }
              key={date}
              aria-pressed={date === value}
              onClick={() => selectDate(date)}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        className="calendar-today"
        onClick={() => selectDate(today)}
      >
        Ir para hoje
      </button>
    </section>
  )
}
