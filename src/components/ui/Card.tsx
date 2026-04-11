import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  title?: ReactNode
  subtitle?: ReactNode
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={cn('pg-card p-6', className)}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <div className="text-lg font-semibold" style={{ color: 'var(--text-bright)' }}>{title}</div>}
          {subtitle && <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
}: {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: string
  trendUp?: boolean
}) {
  return (
    <div className="pg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-bright)' }}>{value}</p>
          {trend && (
            <p className="text-sm mt-1" style={{ color: trendUp ? 'var(--dash-success)' : 'var(--dash-danger)' }}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="p-3 rounded-lg"
            style={{
              border: '1px solid var(--dash-border)',
              background: 'var(--dash-card-soft)',
              color: 'var(--accent)',
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
