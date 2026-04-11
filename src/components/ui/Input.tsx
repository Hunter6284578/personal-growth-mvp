import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'pg-input',
            error && 'border-[var(--dash-danger)]',
            className
          )}
          style={error ? { boxShadow: '0 0 0 2px var(--dash-danger)' } : undefined}
          {...props}
        />
        {error && <p className="mt-1 text-sm" style={{ color: 'var(--dash-danger)' }}>{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
