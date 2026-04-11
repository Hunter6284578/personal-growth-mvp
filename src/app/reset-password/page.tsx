'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react'

const PageBg = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden pg-bg-hero" style={{ background: 'var(--bg-warm)' }}>
    <div className="absolute inset-0" style={{ background: 'rgba(14, 15, 17, 0.75)' }} />
    <div className="w-full max-w-md relative z-10">{children}</div>
  </div>
)

export default function ResetPasswordPage() {
  const router = useRouter()
  const { user, loading: authLoading, updatePassword } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/forgot-password')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('密码至少需要 6 个字符')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)

    const { error } = await updatePassword(newPassword)

    if (error) {
      if (error.message.includes('same as the old password')) {
        setError('新密码不能与旧密码相同')
      } else {
        setError('重置密码失败，请稍后再试')
      }
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-warm)' }}>
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (success) {
    return (
      <PageBg>
        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" style={{ color: '#fff' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-bright)' }}>密码重置成功</h1>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              你的密码已经更新，请使用新密码登录。
            </p>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                去登录
              </Button>
            </Link>
          </div>
        </Card>
      </PageBg>
    )
  }

  if (!user) return null

  return (
    <PageBg>
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回首页
        </Button>
      </Link>

      <Card>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8" style={{ color: '#fff' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-bright)' }}>重置密码</h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>请输入你的新密码</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="password"
            label="新密码"
            placeholder="至少 6 个字符"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText="密码至少需要 6 个字符"
          />

          <Input
            type="password"
            label="确认密码"
            placeholder="再次输入新密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={confirmPassword && confirmPassword !== newPassword ? '两次输入的密码不一致' : undefined}
          />

          {error && (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(127, 29, 29, 0.5)', border: '1px solid rgba(153, 27, 27, 0.6)' }}>
              <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            重置密码
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            没有收到邮件？{' '}
            <Link href="/forgot-password" style={{ color: 'var(--accent)' }}>
              重新发送
            </Link>
          </p>
        </div>
      </Card>
    </PageBg>
  )
}
