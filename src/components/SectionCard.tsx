import type { Section } from '../types'
import { Icon } from './Icon'

export function SectionCard({
  section,
  count,
  onOpen,
  onEdit,
}: {
  section: Section
  count: number
  onOpen: () => void
  onEdit: () => void
}) {
  return (
    <article className="section-card" style={{ borderTopColor: section.color }}>
      <button className="section-open" onClick={onOpen}>
        <span className="section-emoji" aria-hidden="true">
          {section.emoji || '📁'}
        </span>
        <h3>{section.title}</h3>
        <span className="muted">
          {count} {count === 1 ? 'item' : 'itens'}
        </span>
        <Icon name="chevron" />
      </button>
      <button
        className="icon-button section-menu"
        aria-label={`Configurar ${section.title}`}
        onClick={onEdit}
      >
        <Icon name="more" />
      </button>
    </article>
  )
}
