'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const typeStyles: Record<ToastType, { bg: string; border: string; color: string }> = {
  success: { bg: 'rgba(107, 143, 113, 0.15)', border: 'var(--dash-success)', color: 'var(--dash-success)' },
  error: { bg: 'rgba(139, 85, 85, 0.15)', border: 'var(--dash-danger)', color: 'var(--dash-danger)' },
  info: { bg: 'rgba(85, 114, 139, 0.15)', border: 'var(--dash-info)', color: 'var(--dash-info)' },
  warning: { bg: 'rgba(139, 115, 85, 0.15)', border: 'var(--dash-warning)', color: 'var(--dash-warning)' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 3500)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '400px' }}>
        {toasts.map((t) => {
          const style = typeStyles[t.type]
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-xl pointer-events-auto animate-in slide-in-from-right"
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                color: style.color,
              }}
            >
              <p className="flex-1 text-sm">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
