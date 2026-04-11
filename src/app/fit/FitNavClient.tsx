'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  BarChart3, Dumbbell, ClipboardList, Sparkles,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const fitNavItems = [
  { href: '/fit', label: '总览', icon: BarChart3 },
  { href: '/fit/logs', label: '记录训练', icon: ClipboardList },
  { href: '/fit/plan', label: 'AI 建议', icon: Sparkles },
  { href: '/fit/exercises', label: '动作库', icon: Dumbbell },
]

export function FitNavClient({ showLogout }: { showLogout?: boolean }) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  if (showLogout) {
    return (
      <Button variant="ghost" size="sm" onClick={() => signOut()}>
        <LogOut className="w-4 h-4 mr-1" />
        退出
      </Button>
    )
  }

  return (
    <div className="hidden md:flex space-x-8">
      {fitNavItems.map(item => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors border-b-2 ${
              pathname === item.href
                ? 'font-semibold'
                : ''
            }`}
            style={{
              color: pathname === item.href ? 'var(--accent)' : 'var(--text-muted)',
              borderColor: pathname === item.href ? 'var(--accent)' : 'transparent',
            }}
            onMouseEnter={e => { if (pathname !== item.href) e.currentTarget.style.color = 'var(--text-bright)' }}
            onMouseLeave={e => { if (pathname !== item.href) e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Icon className="w-4 h-4 mr-1" />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
