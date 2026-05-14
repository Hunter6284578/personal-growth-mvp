import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StateVariant = 'loading' | 'empty' | 'error'

interface StateMessageProps {
  variant: StateVariant
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

const ICON_MAP: Record<StateVariant, ComponentType<{ className?: string }>> = {
  loading: Loader2,
  empty: Inbox,
  error: AlertTriangle,
}

export function StateMessage({ variant, title, description, action, className }: StateMessageProps) {
  const Icon = ICON_MAP[variant]
  const iconClassName = variant === 'loading' ? 'h-8 w-8 animate-spin' : 'h-8 w-8'

  return (
    <div
      className={cn('rounded-lg border border-dashed py-8 text-center', className)}
      style={{ background: 'var(--dash-card-soft)', borderColor: 'var(--dash-border)' }}
    >
      <div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: 'var(--dash-card-soft)' }}
      >
        <Icon className={iconClassName} style={{ color: 'var(--text-dim)' }} />
      </div>
      <p style={{ color: 'var(--text-muted)' }}>{title}</p>
      {description ? (
        <p className="mt-1 text-sm" style={{ color: 'var(--text-dim)' }}>
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-3 inline-flex justify-center">{action}</div> : null}
    </div>
  )
}
