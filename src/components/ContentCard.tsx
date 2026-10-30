import { useState } from 'react'
import { CONTENT_LABELS, getCounterTotal } from '../lib/notebook'
import type { Content } from '../types'
import { Icon } from './Icon'
import { ListProgress } from './ListProgress'

export function ContentCard({
  content,
  onOpen,
  onCount,
}: {
  content: Content
  onOpen: () => void
  onCount: (delta: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const total =
    content.kind === 'counter' ? getCounterTotal(content.entries) : 0
  const isCollapsible =
    content.kind === 'checklist' || content.kind === 'tutorial'
  const detailsId = `content-details-${content.id}`

  if (isCollapsible) {
    return (
      <article
        className={
          isExpanded
            ? 'content-card collapsible-content is-expanded'
            : 'content-card collapsible-content'
        }
      >
        <button
          type="button"
          className="content-summary"
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <span className={`content-label ${content.kind}`}>
            <Icon name={content.kind} />
            {CONTENT_LABELS[content.kind]}
          </span>
          <h3>{content.title}</h3>
          {!isExpanded && content.kind === 'checklist' && (
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
          )}
          {!isExpanded && content.kind === 'tutorial' && content.text && (
            <p className="text-preview">{content.text}</p>
          )}
          <ListProgress items={content.items} />
          <span className="content-expand-label">
            {isExpanded ? 'Recolher itens' : 'Ver itens'}
            <Icon name="chevron" />
          </span>
        </button>
        <div className="content-details" id={detailsId}>
          <div className="content-details-inner">
            {content.kind === 'tutorial' && content.text && (
              <p className="content-detail-text">{content.text}</p>
            )}
            {content.items.length > 0 ? (
              <ul className="content-items-list">
                {content.items.map((item, index) => (
                  <li key={item.id}>
                    {content.kind === 'tutorial' && (
                      <span className="content-item-number">{index + 1}.</span>
                    )}
                    {content.kind === 'checklist' && (
                      <span aria-hidden="true">
                        {item.completed ? '☑' : '☐'}
                      </span>
                    )}
                    <span className={item.completed ? 'completed' : ''}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Nenhum item adicionado ainda.</p>
            )}
            <button type="button" className="text-button" onClick={onOpen}>
              Abrir para editar <Icon name="chevron" />
            </button>
          </div>
        </div>
      </article>
    )
  }

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
