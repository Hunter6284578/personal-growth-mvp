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
          {title && <div className="text-lg font-semibold text-gray-800">{title}</div>}
          {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
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
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className={cn('text-sm mt-1', trendUp ? 'text-green-400' : 'text-red-400')}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {icon && <div className="p-3 bg-gray-700/80 rounded-lg border border-gray-600/70">{icon}</div>}
      </div>
    </div>
  )
}
