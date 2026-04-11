'use client'

import { useState, type ReactNode } from 'react'
import { Card } from './Card'
import { Button } from './Button'
import { AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
}: ConfirmDialogProps) {
  if (!open) return null

  const variantStyle = {
    danger: { border: 'var(--dash-danger)', color: 'var(--dash-danger)', icon: 'var(--dash-danger)' },
    warning: { border: 'var(--dash-warning)', color: 'var(--dash-warning)', icon: 'var(--dash-warning)' },
    default: { border: 'var(--accent)', color: 'var(--accent)', icon: 'var(--accent)' },
  }[variant]

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onCancel}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <Card>
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: variantStyle.icon }} />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-bright)' }}>{title}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{message}</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={onCancel}>
                  {cancelText}
                </Button>
                <Button
                  size="sm"
                  onClick={onConfirm}
                  style={variant === 'danger' ? { background: 'var(--dash-danger)', color: 'var(--dash-bg)' } : undefined}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Hook for easier usage
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    title: string
    message: string
    variant: 'danger' | 'warning' | 'default'
    onConfirm: () => void
  }>({ open: false, title: '', message: '', variant: 'default', onConfirm: () => {} })

  const confirm = (options: {
    title?: string
    message: string
    variant?: 'danger' | 'warning' | 'default'
    confirmText?: string
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title || '确认操作',
        message: options.message,
        variant: options.variant || 'default',
        onConfirm: () => {
          setState(prev => ({ ...prev, open: false }))
          resolve(true)
        },
      })
    })
  }

  const cancel = () => {
    setState(prev => ({ ...prev, open: false }))
  }

  return { confirm, cancel, dialogState: state }
}
