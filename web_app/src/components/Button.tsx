import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { SpinnerIcon } from './SpinnerIcon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  isLoading?: boolean
}

const variantClasses = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
  outline:
    'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-emerald-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <SpinnerIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />}
      {children}
    </button>
  )
}

export default Button
