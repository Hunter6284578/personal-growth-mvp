'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { Lock, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError('邮箱或密码错误')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden pg-bg-hero" style={{ background: 'var(--bg-warm)' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(14, 15, 17, 0.75)' }} />
      <div className="w-full max-w-md relative z-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回首页
          </Button>
        </Link>

        <Card>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" style={{ color: '#fff' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-bright)' }}>登录</h1>
            <p className="mt-2" style={{ color: 'var(--text-muted)' }}>进入你的个人成长空间</p>
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

            <Input
              type="password"
              label="密码"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              登录
            </Button>
          </form>

          <div className="mt-4 text-right">
            <Link
              href="/forgot-password"
              className="text-sm hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              忘记密码？
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              还没有账号？{' '}
              <Link href="/register" style={{ color: 'var(--accent)' }}>
                去注册
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
