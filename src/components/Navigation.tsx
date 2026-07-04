'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Home,
  PenLine,
  MessageCircle,
  ChevronRight,
  NotebookPen,
  FlaskConical,
  UserRound,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { siteConfig } from '@/content/site'
import { LanguageSwitch } from '@/components/site/LanguageSwitch'
import { pickText, type SiteLanguage } from '@/lib/site-language'

const publicNavItems = [
  {
    href: '/blog',
    label: { zh: '文章', en: 'Writing' },
    icon: NotebookPen,
  },
  {
    href: '/projects',
    label: { zh: '作品', en: 'Works' },
    icon: FlaskConical,
  },
  {
    href: '/about',
    label: { zh: '关于', en: 'About' },
    icon: UserRound,
  },
]

interface DashboardNavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
}

const dashboardNavGroups: Array<{ title: string; items: DashboardNavItem[] }> = [
  {
    title: '博客',
    items: [
      { href: '/dashboard/blog', label: '文章管理', icon: PenLine },
      { href: '/dashboard/comments', label: '评论管理', icon: MessageCircle },
    ],
  },
  {
    title: '数据',
    items: [
      { href: '/dashboard/analytics', label: '访问统计', icon: BarChart3 },
    ],
  },
]

const flatNavItems = dashboardNavGroups.flatMap((g) => g.items)

interface PublicNavigationProps {
  lang: SiteLanguage
}

export function PublicNavigation({ lang }: PublicNavigationProps) {
  const pathname = usePathname()
  const { isAdmin, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === href : pathname.startsWith(href)

  return (
    <header className="z-40" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-5 sm:px-8 lg:px-0">
        <Link href="/" className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-bright)' }}>
            {siteConfig.title}
          </p>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm transition-colors"
              style={{
                color: isActive(item.href) ? 'var(--text-bright)' : 'var(--text-dim)',
              }}
            >
              {pickText(item.label, lang)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <LanguageSwitch lang={lang} />
          {isAdmin ? (
            <>
              <Link
                href="/dashboard/blog"
                className="text-sm transition-colors"
                style={{ color: 'var(--text-dim)' }}
              >
                写作
              </Link>
              <button
                type="button"
                className="text-sm transition-colors"
                style={{ color: 'var(--text-dim)' }}
                onClick={signOut}
              >
                {lang === 'zh' ? '退出' : 'Out'}
              </button>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitch lang={lang} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex rounded border p-2 transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            aria-label={lang === 'zh' ? '切换菜单' : 'Toggle menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="px-6 py-4 lg:hidden" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="space-y-1">
            {publicNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm transition-colors"
                  style={{
                    color: isActive(item.href) ? 'var(--text-bright)' : 'var(--text-dim)',
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {pickText(item.label, lang)}
                </Link>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {isAdmin ? (
              <>
                <Link
                  href="/dashboard/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-dim)' }}
                >
                  写作
                </Link>
                <button
                  type="button"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-dim)' }}
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                >
                  {lang === 'zh' ? '退出' : 'Out'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}

export function DashboardNavigation() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const activeItem = flatNavItems.find((item) => isActive(item.href))

  return (
    <>
      {/* 顶部导航 */}
      <nav
        className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
        style={{ borderColor: 'var(--dash-border)', background: 'color-mix(in srgb, var(--dash-sidebar-bg) 90%, transparent)' }}
      >
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-md p-2 transition-colors hover:text-[var(--text-bright)]"
              style={{ color: 'var(--text-muted)' }}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ border: '1px solid var(--border)' }}>
                <LayoutDashboard className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-bright)' }}>Studio</span>
            </Link>
            {activeItem && (
              <div className="hidden items-center gap-1.5 text-sm sm:flex" style={{ color: 'var(--text-dim)' }}>
                <ChevronRight className="h-3.5 w-3.5" />
                <span style={{ color: 'var(--text-muted)' }}>{activeItem.label}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors hover:text-[var(--text-bright)]"
              style={{ color: 'var(--text-dim)' }}
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">公开站</span>
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors hover:text-[var(--text-bright)]"
              style={{ color: 'var(--text-dim)' }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 侧边栏 */}
      <aside
        className={`fixed inset-y-14 left-0 z-40 w-60 border-r backdrop-blur-xl transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderColor: 'var(--dash-border)', background: 'color-mix(in srgb, var(--dash-sidebar-bg) 95%, transparent)' }}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          {dashboardNavGroups.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <p className="mb-2 px-3 text-[11px] tracking-[0.15em]" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono), monospace' }}>
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors"
                      style={{
                        color: active ? 'var(--text-bright)' : 'var(--text-muted)',
                        background: active ? 'rgba(255,255,255,0.04)' : undefined,
                      }}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 移动端遮罩 */}
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="关闭侧边栏"
        />
      ) : null}
    </>
  )
}
