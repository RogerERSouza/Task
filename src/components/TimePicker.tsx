function clamp(value: number, maximum: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(Math.trunc(value), 0), maximum)
}

function toTime(hour: number, minute: number): string {
  return `${String(clamp(hour, 23)).padStart(2, '0')}:${String(clamp(minute, 59)).padStart(2, '0')}`
}

export function TimePicker({
  id,
  label,
  value,
  onChange,
  activeId,
  onActiveChange,
}: {
  id: string
  label: string
  value: string
  onChange: (time: string) => void
  activeId: string | null
  onActiveChange: (id: string | null) => void
}) {
  const isOpen = activeId === id
  const [hour, minute] = value.split(':').map(Number)
  return (
    <div className="time-picker">
      <span>{label}</span>
      <button
        type="button"
        className="time-picker-trigger"
        aria-expanded={isOpen}
        onClick={() => onActiveChange(isOpen ? null : id)}
      >
        {toTime(hour, minute)}
        <span aria-hidden="true">⌄</span>
      </button>
      {isOpen && (
        <div className="time-picker-panel">
          <label>
            Hora
            <input
              type="number"
              min="0"
              max="23"
              value={hour}
              onChange={(event) =>
                onChange(toTime(Number(event.target.value), minute))
              }
            />
          </label>
          <span className="time-picker-separator">:</span>
          <label>
            Minuto
            <input
              type="number"
              min="0"
              max="59"
              value={minute}
              onChange={(event) =>
                onChange(toTime(hour, Number(event.target.value)))
              }
            />
          </label>
          <button type="button" onClick={() => onActiveChange(null)}>
            Pronto
          </button>
        </div>
      )}
    </div>
  )
}
