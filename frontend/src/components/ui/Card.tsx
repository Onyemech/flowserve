import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps {
  title?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function Card({ title, children, actions, className }: CardProps) {
  return (
    <div className={cn('bg-background border border-gray-200 rounded-lg shadow-sm', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between p-4 border-b">
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
