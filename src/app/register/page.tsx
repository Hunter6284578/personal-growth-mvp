import Link from 'next/link'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function RegisterPage() {
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
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <LockKeyhole className="w-8 h-8" style={{ color: '#fff' }} />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-bright)' }}>注册已关闭</h1>
            <p className="leading-7" style={{ color: 'var(--text-muted)' }}>
              这是个人网站的站主后台，不开放公共注册。访客可以直接阅读公开文章。
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/login">
                <Button variant="primary" size="lg" className="w-full">
                  站主登录
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" size="lg" className="w-full">
                  阅读文章
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
