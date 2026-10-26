import { CONTENT_LABELS, getCounterTotal } from '../lib/notebook'
import type { Content } from '../types'
import { Icon } from './Icon'

export function ContentCard({
  content,
  onOpen,
  onCount,
}: {
  content: Content
  onOpen: () => void
  onCount: (delta: number) => void
}) {
  const total =
    content.kind === 'counter' ? getCounterTotal(content.entries) : 0
  return (
    <article className="content-card">
      <button className="content-open" onClick={onOpen}>
        <span className={`content-label ${content.kind}`}>
          <Icon name={content.kind} />
          {CONTENT_LABELS[content.kind]}
        </span>
        <h3>{content.title}</h3>
        {content.kind === 'note' && (
          <p className="text-preview">
            {content.text || 'Abra para escrever sua nota.'}
          </p>
        )}
        {content.kind === 'tutorial' && (
          <>
            <p className="text-preview">
              {content.text || 'Abra para organizar as instruções.'}
            </p>
            <span className="muted">{content.items.length} passos</span>
          </>
        )}
        {content.kind === 'checklist' && (
          <>
            <ul className="checklist-preview">
              {content.items.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <span aria-hidden="true">{item.completed ? '☑' : '☐'}</span>
                  <span className={item.completed ? 'completed' : ''}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <span className="muted">
              {content.items.filter((item) => item.completed).length} de{' '}
              {content.items.length} concluídos
            </span>
          </>
        )}
        <span className="open-label">
          Abrir {CONTENT_LABELS[content.kind].toLocaleLowerCase('pt-BR')}{' '}
          <Icon name="chevron" />
        </span>
      </button>
      {content.kind === 'counter' && (
        <div className="counter-controls">
          <button
            className="icon-button"
            aria-label={`Diminuir ${content.title}`}
            disabled={total === 0}
            onClick={() => onCount(-1)}
          >
            −
          </button>
          <output aria-live="polite">{total}</output>
          <button
            className="icon-button"
            aria-label={`Aumentar ${content.title}`}
            onClick={() => onCount(1)}
          >
            +
          </button>
        </div>
      )}
    </article>
  )
}
