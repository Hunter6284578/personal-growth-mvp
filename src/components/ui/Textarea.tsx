import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'pg-input resize-vertical',
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

Textarea.displayName = 'Textarea'
