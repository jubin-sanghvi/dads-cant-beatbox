export type IconName = 'mute' | 'unmute' | 'solo' | 'remove' | 'play' | 'stop' | 'reset' | 'download' | 'lab' | 'shuffle' | 'share' | 'eq'

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

function paths(name: IconName) {
  switch (name) {
    case 'unmute':
      return (
        <>
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
          <path d="M16 9a4 4 0 0 1 0 6" />
          <path d="M18.5 6.5a8 8 0 0 1 0 11" />
        </>
      )
    case 'mute':
      return (
        <>
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
          <path d="M17 9l5 6M22 9l-5 6" />
        </>
      )
    case 'solo':
      return (
        <>
          <path d="M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 0z" fill="currentColor" stroke="none" />
          <path d="M20 13v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 0z" fill="currentColor" stroke="none" />
          <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
          <path d="M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 0zM20 13v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 0z" />
        </>
      )
    case 'remove':
      return <path d="M6 6l12 12M18 6L6 18" />
    case 'play':
      return (
        <path d="M7 5l12 7-12 7V5z" fill="currentColor" stroke="none" strokeLinejoin="round" />
      )
    case 'stop':
      return (
        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
      )
    case 'reset':
      return (
        <>
          <path d="M3 12a9 9 0 1 1 3 7" />
          <path d="M3 22v-7h7" />
        </>
      )
    case 'download':
      return (
        <>
          <path d="M12 3v12M12 15l-4-4M12 15l4-4" />
          <path d="M5 19h14" />
        </>
      )
    case 'lab':
      return (
        <>
          <path d="M9 3h6M10 3v6l-5 8.5c-.6 1 .1 2.5 1.4 2.5h11.2c1.3 0 2-1.5 1.4-2.5L14 9V3" />
          <path d="M8.5 14h7" />
        </>
      )
    case 'shuffle':
      return (
        <>
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </>
      )
    case 'share':
      return (
        <>
          <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </>
      )
    case 'eq':
      return (
        <>
          <rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor" />
          <rect x="10" y="6" width="4" height="14" rx="1" fill="currentColor" />
          <rect x="16" y="9" width="4" height="11" rx="1" fill="currentColor" />
        </>
      )
    default:
      return null
  }
}

export default function Icon({ name, size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths(name)}
    </svg>
  )
}
