import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: ReactNode
  subtitle?: ReactNode
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <div className="text-lg font-semibold text-white">{title}</div>}
          {subtitle && <div className="text-sm text-gray-400 mt-1">{subtitle}</div>}
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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {icon && <div className="p-3 bg-gray-700 rounded-lg">{icon}</div>}
      </div>
    </div>
  )
}
