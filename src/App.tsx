import { useEffect, useState, useSyncExternalStore } from 'react'
import type { FormEvent } from 'react'
import { CalendarPicker } from './components/CalendarPicker'
import { ContentCard } from './components/ContentCard'
import { ContentEditor } from './components/ContentEditor'
import { Icon } from './components/Icon'
import { Modal } from './components/Modal'
import { SectionCard } from './components/SectionCard'
import { useNotebook } from './hooks/useNotebook'
import {
  CONTENT_LABELS,
  createContent,
  getCounterTotal,
  getSectionPath,
  SECTION_COLORS,
} from './lib/notebook'
import {
  formatReminderCountdown,
  formatReminderDate,
  getDateInputValue,
  getReminderDate,
  getReminderPriority,
} from './lib/reminders'
import type { ReminderDraft } from './lib/reminders'
import type { Content, ContentKind, Reminder, Section } from './types'
import './App.css'

type Editor =
  | { kind: 'section'; section?: Section }
  | { kind: 'content' }
  | { kind: 'settings' }
  | { kind: 'reminder'; reminder?: Reminder }
  | null

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}
function getHash() {
  return window.location.hash
}
function navigate(kind?: 'section' | 'content', id?: string) {
  const updateRoute = () => {
    window.location.hash = kind && id ? `${kind}/${id}` : ''
  }
  const documentWithTransitions = document as Document & {
    startViewTransition?: (callback: () => void) => void
  }
  if (documentWithTransitions.startViewTransition)
    documentWithTransitions.startViewTransition(updateRoute)
  else updateRoute()
}

function SectionForm({
  section,
  onSave,
}: {
  section?: Section
  onSave: (values: Pick<Section, 'title' | 'emoji' | 'color'>) => void
}) {
  const [title, setTitle] = useState(section?.title ?? '')
  const [emoji, setEmoji] = useState(section?.emoji ?? '📁')
  const [color, setColor] = useState(section?.color ?? SECTION_COLORS[0])
  return (
    <form
      className="modal-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (title.trim())
          onSave({ title: title.trim(), emoji: emoji.trim(), color })
      }}
    >
      <label className="field">
        <span>Nome da seção</span>
        <input
          required
          maxLength={80}
          placeholder="Ex.: Coisas para aprender"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label className="field">
        <span>
          Emoji <small>opcional</small>
        </span>
        <input
          maxLength={12}
          value={emoji}
          onChange={(event) => setEmoji(event.target.value)}
        />
      </label>
      <fieldset className="color-field">
        <legend>Cor de destaque</legend>
        <div
          className="color-options"
          role="radiogroup"
          aria-label="Cores sugeridas"
        >
          {SECTION_COLORS.map((option, index) => (
            <label
              key={option}
              className="color-option"
              style={{ background: option }}
            >
              <input
                type="radio"
                name="color"
                value={option}
                checked={color === option}
                onChange={() => setColor(option)}
                aria-label={
                  ['Azul', 'Lilás', 'Verde', 'Amarelo', 'Rosa'][index]
                }
              />
              <span aria-hidden="true">{color === option ? '✓' : ''}</span>
            </label>
          ))}
          <label className="color-picker" title="Escolher outra cor">
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              aria-label="Escolher outra cor"
            />
            <span aria-hidden="true">+</span>
          </label>
        </div>
        <span className="color-value" aria-live="polite">
          Cor atual: {color.toUpperCase()}
        </span>
      </fieldset>
      <button className="primary-button" type="submit" disabled={!title.trim()}>
        {section ? 'Salvar alterações' : 'Criar seção'}
      </button>
    </form>
  )
}

function ContentForm({
  onSave,
}: {
  onSave: (kind: ContentKind, title: string) => void
}) {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<ContentKind>('note')
  return (
    <form
      className="modal-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (title.trim()) onSave(kind, title.trim())
      }}
    >
      <label className="field">
        <span>Título</span>
        <input
          required
          maxLength={100}
          placeholder="O que você quer registrar?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <fieldset className="type-field">
        <legend>Tipo de conteúdo</legend>
        <div className="type-options">
          {(Object.keys(CONTENT_LABELS) as ContentKind[]).map((option) => (
            <label
              className={
                kind === option ? 'type-option selected' : 'type-option'
              }
              key={option}
            >
              <input
                type="radio"
                name="kind"
                value={option}
                checked={kind === option}
                onChange={() => setKind(option)}
              />
              <Icon name={option} />
              {CONTENT_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>
      <button className="primary-button" type="submit" disabled={!title.trim()}>
        Criar e abrir
      </button>
    </form>
  )
}

function getTimeOneHourLater(time: string): string {
  const [hour, minute] = time.split(':').map(Number)
  return `${String((hour + 1) % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function ReminderForm({
  reminder,
  onSave,
  onRemove,
}: {
  reminder?: Reminder
  onSave: (values: ReminderDraft) => void
  onRemove: () => void
}) {
  const initialDate = reminder ? getReminderDate(reminder) : getDateInputValue()
  const [title, setTitle] = useState(reminder?.title ?? '')
  const [date, setDate] = useState(initialDate)
  const [spansMultipleDays, setSpansMultipleDays] = useState(
    Boolean(reminder?.endDate && reminder.endDate !== initialDate),
  )
  const [endDate, setEndDate] = useState(reminder?.endDate ?? initialDate)
  const [schedule, setSchedule] = useState<'all-day' | 'time-range'>(
    reminder?.schedule ?? (reminder ? 'time-range' : 'all-day'),
  )
  const legacyTime = reminder?.date.slice(11, 16)
  const [startTime, setStartTime] = useState(
    reminder?.startTime ?? legacyTime ?? '09:00',
  )
  const [endTime, setEndTime] = useState(
    reminder?.endTime ?? getTimeOneHourLater(legacyTime ?? '09:00'),
  )
  const invalidDateRange = spansMultipleDays && endDate < date
  const invalidTimeRange =
    schedule === 'time-range' &&
    (!endTime || (!spansMultipleDays && endTime <= startTime))
  function changeStartDate(nextDate: string) {
    setDate(nextDate)
    if (!spansMultipleDays) setEndDate(nextDate)
  }
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (title.trim() && date && !invalidDateRange && !invalidTimeRange)
      onSave({
        title: title.trim(),
        date,
        schedule,
        ...(spansMultipleDays ? { endDate } : {}),
        ...(schedule === 'time-range' ? { startTime, endTime } : {}),
        countdownFormat: 'automatic',
      })
  }
  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Lembrete</span>
        <input
          required
          maxLength={80}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="O que você quer lembrar?"
        />
      </label>
      <CalendarPicker
        label="Data de início"
        value={date}
        onChange={changeStartDate}
      />
      <fieldset className="reminder-schedule-field">
        <legend>Duração</legend>
        <div className="reminder-schedule-options" role="group">
          <button
            type="button"
            className={
              !spansMultipleDays
                ? 'reminder-schedule-option selected'
                : 'reminder-schedule-option'
            }
            aria-pressed={!spansMultipleDays}
            onClick={() => {
              setSpansMultipleDays(false)
              setEndDate(date)
            }}
          >
            Um dia
          </button>
          <button
            type="button"
            className={
              spansMultipleDays
                ? 'reminder-schedule-option selected'
                : 'reminder-schedule-option'
            }
            aria-pressed={spansMultipleDays}
            onClick={() => setSpansMultipleDays(true)}
          >
            Vários dias
          </button>
        </div>
      </fieldset>
      {spansMultipleDays && (
        <CalendarPicker
          label="Data de término"
          value={endDate}
          onChange={setEndDate}
        />
      )}
      <fieldset className="reminder-schedule-field">
        <legend>Quando acontece?</legend>
        <div className="reminder-schedule-options" role="group">
          <button
            type="button"
            className={
              schedule === 'all-day'
                ? 'reminder-schedule-option selected'
                : 'reminder-schedule-option'
            }
            aria-pressed={schedule === 'all-day'}
            onClick={() => setSchedule('all-day')}
          >
            Dia todo
          </button>
          <button
            type="button"
            className={
              schedule === 'time-range'
                ? 'reminder-schedule-option selected'
                : 'reminder-schedule-option'
            }
            aria-pressed={schedule === 'time-range'}
            onClick={() => setSchedule('time-range')}
          >
            Com horário
          </button>
        </div>
      </fieldset>
      {schedule === 'time-range' && (
        <div className="reminder-time-range">
          <label className="field">
            <span>Começa</span>
            <input
              type="time"
              required
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Termina</span>
            <input
              type="time"
              required
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </label>
        </div>
      )}
      {invalidDateRange && (
        <p className="range-warning" role="alert">
          A data de término precisa ser igual ou posterior à data de início.
        </p>
      )}
      {invalidTimeRange && !invalidDateRange && (
        <p className="range-warning" role="alert">
          O horário de término precisa ser posterior ao início no mesmo dia.
        </p>
      )}
      <p className="muted">
        O contador escolhe automaticamente a melhor unidade de tempo.
      </p>
      <button
        className="primary-button"
        type="submit"
        disabled={
          !title.trim() || !date || invalidDateRange || invalidTimeRange
        }
      >
        Salvar lembrete
      </button>
      {reminder && (
        <button type="button" className="text-button danger" onClick={onRemove}>
          Concluir e remover lembrete
        </button>
      )}
    </form>
  )
}

function App() {
  const { notebook, setNotebook, storageError } = useNotebook()
  const hash = useSyncExternalStore(subscribeToHash, getHash)
  const [routeKind, routeId] = hash.slice(1).split('/')
  const currentContent =
    routeKind === 'content'
      ? notebook.contents.find((content) => content.id === routeId)
      : undefined
  const currentSection = notebook.sections.find(
    (section) =>
      section.id ===
      (currentContent?.sectionId ?? (routeKind === 'section' ? routeId : null)),
  )
  const isHome = !hash || hash === '#'
  const isMissing = !isHome && !currentSection
  const path = getSectionPath(notebook.sections, currentSection?.id ?? null)
  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('manual')
  const [editor, setEditor] = useState<Editor>(null)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
  const parentId = currentSection?.id ?? null
  const visibleSections = notebook.sections.filter(
    (section) =>
      (isHome && normalizedQuery ? true : section.parentId === parentId) &&
      section.title.toLocaleLowerCase('pt-BR').includes(normalizedQuery),
  )
  if (sortOrder === 'alphabetical')
    visibleSections.sort((first, second) =>
      first.title.localeCompare(second.title, 'pt-BR'),
    )
  const visibleContents = notebook.contents.filter(
    (content) =>
      content.sectionId === currentSection?.id &&
      content.title.toLocaleLowerCase('pt-BR').includes(normalizedQuery),
  )
  const reminders = [...notebook.reminders].sort(
    (first, second) =>
      getReminderPriority(first, now) - getReminderPriority(second, now),
  )

  function openSection(id?: string) {
    setQuery('')
    navigate(id ? 'section' : undefined, id)
  }
  function updateContent(updatedContent: Content) {
    setNotebook((current) => ({
      ...current,
      contents: current.contents.map((content) =>
        content.id === updatedContent.id ? updatedContent : content,
      ),
    }))
  }
  function changeCount(id: string, delta: number) {
    setNotebook((current) => ({
      ...current,
      contents: current.contents.map((content) => {
        if (
          content.id !== id ||
          content.kind !== 'counter' ||
          getCounterTotal(content.entries) + delta < 0
        )
          return content
        return {
          ...content,
          entries: [
            ...content.entries,
            {
              id: crypto.randomUUID(),
              delta,
              createdAt: new Date().toISOString(),
              note: '',
            },
          ],
        }
      }),
    }))
  }
  function exportNotebook() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(notebook, null, 2)], {
        type: 'application/json',
      }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `tomohu-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="app-shell">
      <main className="main-content">
        {storageError && (
          <div className="storage-warning" role="alert">
            {storageError}
            <button className="text-button" onClick={exportNotebook}>
              Exportar cópia
            </button>
          </div>
        )}
        {!isHome && (
          <nav className="breadcrumb" aria-label="Localização">
            <button onClick={() => openSection()}>Início</button>
            {path.map((section) => (
              <span key={section.id}>
                <Icon name="chevron" />
                <button
                  onClick={() => openSection(section.id)}
                  aria-current={
                    !currentContent && currentSection?.id === section.id
                      ? 'page'
                      : undefined
                  }
                >
                  {section.title}
                </button>
              </span>
            ))}
            {currentContent && (
              <span>
                <Icon name="chevron" />
                <span aria-current="page">{currentContent.title}</span>
              </span>
            )}
          </nav>
        )}

        {isMissing ? (
          <section className="empty-state">
            <h1>Conteúdo não encontrado</h1>
            <p>Este endereço não está neste caderno.</p>
            <button className="primary-button" onClick={() => openSection()}>
              Voltar ao início
            </button>
          </section>
        ) : currentContent ? (
          <>
            <div className="page-heading">
              <div>
                <span className="eyebrow">
                  {CONTENT_LABELS[currentContent.kind]}
                </span>
                <h1>{currentContent.title || 'Sem título'}</h1>
              </div>
              <button
                className="secondary-button"
                onClick={() => openSection(currentContent.sectionId)}
              >
                <Icon name="back" />
                Voltar à seção
              </button>
            </div>
            <ContentEditor
              key={currentContent.id}
              content={currentContent}
              onChange={updateContent}
              onCount={(delta) => changeCount(currentContent.id, delta)}
            />
          </>
        ) : (
          <>
            {!isHome && (
              <div className="page-heading">
                <h1>
                  {currentSection?.emoji} {currentSection?.title}
                </h1>
                <button
                  className="secondary-button"
                  onClick={() =>
                    setEditor({ kind: 'section', section: currentSection })
                  }
                >
                  <Icon name="more" />
                  Editar seção
                </button>
              </div>
            )}
            {isHome && (
              <section
                className="reminders-section"
                aria-labelledby="reminders-title"
              >
                <div className="subheading">
                  <h1 id="reminders-title">Lembretes</h1>
                  <button
                    className="text-button"
                    onClick={() => setEditor({ kind: 'reminder' })}
                  >
                    <Icon name="plus" />
                    Novo lembrete
                  </button>
                </div>
                {reminders.length > 0 && (
                  <div className="reminder-strip">
                    {reminders.map((reminder) => (
                      <button
                        key={reminder.id}
                        className="reminder-paper"
                        onClick={() =>
                          setEditor({ kind: 'reminder', reminder })
                        }
                      >
                        <span className="paper-tape" />
                        <span className="reminder-date">
                          {formatReminderDate(reminder)}
                        </span>
                        <strong>{reminder.title}</strong>
                        <span className="reminder-countdown">
                          {formatReminderCountdown(reminder, now)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
            <section aria-labelledby="sections-title" className="sections-area">
              <div className="subheading">
                <h2 id="sections-title">
                  {isHome ? 'Suas seções' : 'Dentro desta seção'}
                  <span className="section-count">
                    {visibleSections.length + visibleContents.length}
                  </span>
                </h2>
              </div>
              <div className="toolbar">
                <label className="search-field">
                  <Icon name="search" />
                  <input
                    type="search"
                    aria-label="Pesquisar seções e conteúdos"
                    placeholder={
                      isHome ? 'Pesquisar seções…' : 'Pesquisar nesta seção…'
                    }
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <div className="sort-control">
                  <span className="sort-label">Ordenar</span>
                  <div
                    className="sort-options"
                    role="group"
                    aria-label="Ordenar seções"
                  >
                    <button
                      type="button"
                      className={
                        sortOrder === 'manual'
                          ? 'sort-option active'
                          : 'sort-option'
                      }
                      onClick={() => setSortOrder('manual')}
                      aria-pressed={sortOrder === 'manual'}
                    >
                      Recentes
                    </button>
                    <button
                      type="button"
                      className={
                        sortOrder === 'alphabetical'
                          ? 'sort-option active'
                          : 'sort-option'
                      }
                      onClick={() => setSortOrder('alphabetical')}
                      aria-pressed={sortOrder === 'alphabetical'}
                    >
                      A–Z
                    </button>
                  </div>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setEditor({ kind: 'section' })}
                >
                  <Icon name="plus" />
                  <span>{isHome ? 'Nova seção' : 'Subseção'}</span>
                </button>
                {!isHome && (
                  <button
                    className="secondary-button"
                    onClick={() => setEditor({ kind: 'content' })}
                  >
                    <Icon name="plus" />
                    Conteúdo
                  </button>
                )}
              </div>
              <div className="section-grid">
                {visibleSections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    count={
                      notebook.sections.filter(
                        (child) => child.parentId === section.id,
                      ).length +
                      notebook.contents.filter(
                        (content) => content.sectionId === section.id,
                      ).length
                    }
                    onOpen={() => openSection(section.id)}
                    onEdit={() => setEditor({ kind: 'section', section })}
                  />
                ))}
              </div>
              {visibleContents.length > 0 && (
                <div className="content-grid">
                  {visibleContents.map((content) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onOpen={() => navigate('content', content.id)}
                      onCount={(delta) => changeCount(content.id, delta)}
                    />
                  ))}
                </div>
              )}
              {!visibleSections.length && !visibleContents.length && (
                <div className="empty-state">
                  <Icon name="note" />
                  <h3>
                    {normalizedQuery
                      ? 'Nenhum resultado por aqui'
                      : 'Seção vazia'}
                  </h3>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <nav className="bottom-nav" aria-label="Navegação principal">
        <button
          className={
            isHome && editor?.kind !== 'settings'
              ? 'bottom-nav-button active'
              : 'bottom-nav-button'
          }
          aria-current={
            isHome && editor?.kind !== 'settings' ? 'page' : undefined
          }
          onClick={() => {
            setEditor(null)
            openSection()
          }}
        >
          <Icon name="home" />
          <span>Início</span>
        </button>
        <button
          className={
            editor?.kind === 'settings'
              ? 'bottom-nav-button active'
              : 'bottom-nav-button'
          }
          aria-haspopup="dialog"
          aria-expanded={editor?.kind === 'settings'}
          onClick={() => setEditor({ kind: 'settings' })}
        >
          <Icon name="settings" />
          <span>Ajustes</span>
        </button>
      </nav>
      {editor && (
        <Modal
          title={
            editor.kind === 'section'
              ? editor.section
                ? 'Editar seção'
                : 'Nova seção'
              : editor.kind === 'content'
                ? 'Novo conteúdo'
                : editor.kind === 'settings'
                  ? 'Ajustes'
                  : editor.reminder
                    ? 'Editar lembrete'
                    : 'Novo lembrete'
          }
          onClose={() => setEditor(null)}
        >
          {editor.kind === 'settings' && (
            <div className="settings-panel">
              <button className="secondary-button" onClick={exportNotebook}>
                <Icon name="download" />
                Exportar cópia dos dados
              </button>
              <p className="muted">Os dados ficam neste navegador.</p>
              <span className="muted">Tomohu · v0.4.0</span>
            </div>
          )}
          {editor.kind === 'section' && (
            <SectionForm
              section={editor.section}
              onSave={(values) => {
                const existing = editor.section
                setNotebook((current) => ({
                  ...current,
                  sections: existing
                    ? current.sections.map((section) =>
                        section.id === existing.id
                          ? { ...section, ...values }
                          : section,
                      )
                    : [
                        ...current.sections,
                        { id: crypto.randomUUID(), parentId, ...values },
                      ],
                }))
                setEditor(null)
              }}
            />
          )}
          {editor.kind === 'content' && currentSection && (
            <ContentForm
              onSave={(kind, title) => {
                const content = createContent(kind, currentSection.id, title)
                setNotebook((current) => ({
                  ...current,
                  contents: [...current.contents, content],
                }))
                setEditor(null)
                navigate('content', content.id)
              }}
            />
          )}
          {editor.kind === 'reminder' && (
            <ReminderForm
              reminder={editor.reminder}
              onSave={(values) => {
                const existing = editor.reminder
                setNotebook((current) => ({
                  ...current,
                  reminders: existing
                    ? current.reminders.map((reminder) =>
                        reminder.id === existing.id
                          ? { id: reminder.id, ...values }
                          : reminder,
                      )
                    : [
                        ...current.reminders,
                        { id: crypto.randomUUID(), ...values },
                      ],
                }))
                setEditor(null)
              }}
              onRemove={() => {
                const id = editor.reminder?.id
                setNotebook((current) => ({
                  ...current,
                  reminders: current.reminders.filter(
                    (reminder) => reminder.id !== id,
                  ),
                }))
                setEditor(null)
              }}
            />
          )}
        </Modal>
      )}
    </div>
  )
}

export default App
