interface IconProps {
  className?: string
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="m4.5 12.75 6 6 9-13.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function XIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="m6 18 12-12M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}

export function PencilIcon({ className }: IconProps) {
  const path = [
    'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82',
    'a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897',
    'l12.682-12.681Z',
  ].join(' ')
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  const path = [
    'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21 1.022.166m-1.022-.165L18.16 19.673',
    'a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79',
    'm14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562 1.022-.165m0 0',
    'a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916a2.25 2.25 0 0 0-2.09-2.201',
    'a51.964 51.964 0 0 0-3.32 0 2.25 2.25 0 0 0-2.09 2.201v.916m7.5 0',
    'a48.667 48.667 0 0 0-7.5 0',
  ].join(' ')
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
