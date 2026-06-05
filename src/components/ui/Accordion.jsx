import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Accordion = ({ children, className }) => {
  return <div className={cn('space-y-1', className)}>{children}</div>
}

export const AccordionItem = ({ children, title, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-medium bg-gray-50 hover:bg-gray-100 transition"
      >
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-4 py-3 border-t">{children}</div>}
    </div>
  )
}

// إصدارات مبسطة للـ AccordionTrigger و AccordionContent إذا كنت بحاجة لها
export const AccordionTrigger = ({ children, onClick, isOpen }) => (
  <button onClick={onClick} className="flex w-full justify-between items-center px-4 py-2 font-medium">
    {children}
    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </button>
)

export const AccordionContent = ({ children, isOpen }) => (
  <div className={`overflow-hidden transition-all ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
    <div className="px-4 pb-4">{children}</div>
  </div>
)