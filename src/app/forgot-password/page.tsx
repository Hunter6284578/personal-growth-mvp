'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

const PageBg = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden pg-bg-hero" style={{ background: 'var(--bg-warm)' }}>
    <div className="absolute inset-0" style={{ background: 'rgba(14, 15, 17, 0.75)' }} />
    <div className="w-full max-w-md relative z-10">{children}</div>
  </div>
)

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await resetPassword(email)

    if (error) {
      if (error.message.includes('User not found')) {
        setError('该邮箱未注册')
      } else {
        setError('发送重置邮件失败，请稍后再试')
      }
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <PageBg>
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回首页
          </Button>
        </Link>

        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" style={{ color: '#fff' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-bright)' }}>邮件已发送</h1>
            <p className="mb-2" style={{ color: 'var(--text-muted)' }}>
              重置密码的链接已发送到
            </p>
            <p className="text-blue-400 font-medium mb-6">{email}</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-dim)' }}>
              请检查你的收件箱（包括垃圾邮件），点击邮件中的链接来重置密码。
            </p>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                返回登录
              </Button>
            </Link>
          </div>
        </Card>
      </PageBg>
    )
  }

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
            <Mail className="w-8 h-8" style={{ color: '#fff' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-bright)' }}>忘记密码</h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
            输入你的邮箱，我们将发送重置密码的链接
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label="邮箱"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            发送重置链接
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            想起密码了？{' '}
            <Link href="/login" style={{ color: 'var(--accent)' }}>
              返回登录
            </Link>
          </p>
        </div>
      </Card>
    </PageBg>
  )
}
