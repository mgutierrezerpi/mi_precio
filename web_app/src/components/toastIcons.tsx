/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import type { ToastType } from '../lib/toast'

const warningPath = [
  'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71',
  'c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5',
  '-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
].join('')
const infoPath = [
  'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836',
  'a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0',
  '9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
].join('')

const Icon = ({ path }: { path: string }) => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
)

export const toastIcons: Record<ToastType, ReactNode> = {
  success: <Icon path="M4.5 12.75l6 6 9-13.5" />,
  error: <Icon path="M6 18L18 6M6 6l12 12" />,
  warning: <Icon path={warningPath} />,
  info: <Icon path={infoPath} />,
}
