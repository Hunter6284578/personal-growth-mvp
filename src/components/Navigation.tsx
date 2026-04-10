'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, BriefcaseBusiness, NotebookPen, Dumbbell, FileUser, LayoutDashboard, LogOut, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { siteConfig } from '@/content/site'

const publicNavItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/projects', label: '作品', icon: BriefcaseBusiness },
  { href: '/blog', label: '文字', icon: NotebookPen },
  { href: '/fitness', label: '记录', icon: Dumbbell },
  { href: '/about', label: '关于', icon: FileUser },
]

const dashboardNavItems = [
  { href: '/dashboard', label: '总览' },
  { href: '/dashboard/stats', label: '属性评分' },
  { href: '/dashboard/daily', label: '每日记录' },
  { href: '/dashboard/events', label: '事件库' },
  { href: '/dashboard/fitness', label: '健康记录' },
  { href: '/dashboard/thoughts', label: '短记录' },
  { href: '/dashboard/blog', label: '文章管理' },
  { href: '/dashboard/analysis', label: 'AI 分析' },
  { href: '/dashboard/settings', label: '设置' },
]

export function PublicNavigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === href : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-50/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <p className="hidden truncate text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 sm:block">
            {siteConfig.role}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-stone-950">{siteConfig.name}</p>
            <span className="rounded-md border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-stone-600 sm:hidden">
              {siteConfig.roleShort}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {publicNavItems.map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-900 hover:text-stone-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950"
          >
            GitHub
          </Link>
          {user ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Studio
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="border-stone-300 bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                退出
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                登录工作台
              </Button>
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex rounded-full border border-stone-200 bg-white p-2 text-stone-700 lg:hidden"
          aria-label="切换菜单"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-stone-200 bg-stone-100/95 px-4 py-4 lg:hidden">
          <div className="mb-4 rounded-3xl border border-stone-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">简介</p>
            <p className="mt-2 text-base font-semibold text-stone-950">{siteConfig.role}</p>
            <p className="mt-2 text-sm leading-6 text-stone-600">{siteConfig.lookingFor}</p>
          </div>

          <div className="space-y-2">
            {publicNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-stone-950 text-white'
                      : 'bg-white text-stone-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700"
            >
              GitHub
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Studio
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-stone-300 bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm">
                  登录工作台
                </Button>
              </Link>
            )}
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

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="text-base font-semibold text-white">
              Content Studio
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white">
              返回公开站
            </Link>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              退出
            </Button>
          </div>
        </div>
      </nav>

      <aside
        className={`fixed inset-y-16 left-0 z-40 w-64 border-r border-slate-800 bg-slate-950/95 px-4 py-6 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-1">
          {dashboardNavItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-teal-500/20 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="关闭侧边栏"
        />
      ) : null}
    </>
  )
}
