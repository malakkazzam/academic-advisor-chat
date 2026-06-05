import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn('flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500', className)} {...props}>
    {children}
  </select>
))
Select.displayName = 'Select'

const SelectTrigger = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm', className)} {...props} />
))
SelectTrigger.displayName = 'SelectTrigger'

const SelectValue = ({ placeholder, className }) => (
  <span className={cn('text-gray-500', className)}>{placeholder}</span>
)

const SelectContent = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('absolute z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white py-1 shadow-lg', className)} {...props}>
    {children}
  </div>
))
SelectContent.displayName = 'SelectContent'

const SelectItem = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100', className)} {...props}>
    {children}
  </div>
))
SelectItem.displayName = 'SelectItem'

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }