import type { CSSProperties } from 'react'

type IconName =
  | 'plus'
  | 'search'
  | 'back'
  | 'chevron'
  | 'more'
  | 'close'
  | 'note'
  | 'checklist'
  | 'tutorial'
  | 'counter'
  | 'download'
  | 'home'
  | 'arrow-up'
  | 'arrow-down'
  | 'trash'
  | 'settings'
const paths: Record<IconName, string> = {
  plus: 'M12 5v14M5 12h14',
  search: 'm21 21-4.5-4.5M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  back: 'm14 6-6 6 6 6M8 12h13',
  chevron: 'm9 5 7 7-7 7',
  more: 'M12 5h.01M12 12h.01M12 19h.01',
  close: 'm6 6 12 12M6 18 18 6',
  note: 'M7 3h10l4 4v14H3V3h4M7 11h10M7 15h10',
  checklist: 'm3 7 2 2 4-4M12 7h9m-18 8 2 2 4-4m3 2h9',
  tutorial: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  counter: 'M8 3 6 21M18 3l-2 18M3 9h18M2 15h18',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  home: 'm3 10 9-7 9 7v11h-7v-7h-4v7H3V10',
  'arrow-up': 'm6 12 6-6 6 6M12 6v14',
  'arrow-down': 'm6 12 6 6 6-6M12 18V4',
  settings: 'M4 7h16M4 17h16M8 4v6M16 14v6',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
}

export function Icon({
  name,
  style,
}: {
  name: IconName
  style?: CSSProperties
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  )
}
