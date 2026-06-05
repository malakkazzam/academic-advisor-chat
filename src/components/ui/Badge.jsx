import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Badge = forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
  }
  return (
    <div ref={ref} className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors', variants[variant], className)} {...props} />
  )
})
Badge.displayName = 'Badge'
export { Badge }