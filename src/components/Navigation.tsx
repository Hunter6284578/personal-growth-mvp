'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Menu,
  X,
  BriefcaseBusiness,
  NotebookPen,
  Dumbbell,
  FileUser,
  LayoutDashboard,
  LogOut,
  Home,
  CalendarDays,
  BarChart3,
  Lightbulb,
  HeartPulse,
  MessageSquareText,
  PenLine,
  Sparkles,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { siteConfig } from '@/content/site'
import { LanguageSwitch } from '@/components/site/LanguageSwitch'
import { pickText, type SiteLanguage } from '@/lib/site-language'

const publicNavItems = [
  {
    href: '/',
    label: { zh: '首页', en: 'Home' },
    icon: Home,
  },
  {
    href: '/projects',
    label: { zh: '作品', en: 'Projects' },
    icon: BriefcaseBusiness,
  },
  {
    href: '/blog',
    label: { zh: '日志', en: 'Journal' },
    icon: NotebookPen,
  },
  {
    href: '/fitness',
    label: { zh: '训练', en: 'Fitness' },
    icon: Dumbbell,
  },
  {
    href: '/about',
    label: { zh: '关于', en: 'About' },
    icon: FileUser,
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
    title: '工作台',
    items: [
      { href: '/dashboard', label: '总览', icon: LayoutDashboard },
      { href: '/dashboard/daily', label: '每日记录', icon: CalendarDays },
      { href: '/dashboard/events', label: '事件库', icon: Lightbulb },
      { href: '/dashboard/thoughts', label: '短记录', icon: MessageSquareText },
      { href: '/dashboard/blog', label: '文章管理', icon: PenLine },
    ],
  },
  {
    title: '数据',
    items: [
      { href: '/dashboard/stats', label: '属性评分', icon: BarChart3 },
      { href: '/dashboard/fitness', label: '健康记录', icon: HeartPulse },
      { href: '/fit', label: '健身训练', icon: Dumbbell },
      { href: '/dashboard/analysis', label: 'AI 分析', icon: Sparkles },
    ],
  },
  {
    title: '账户',
    items: [
      { href: '/dashboard/settings', label: '设置', icon: Settings },
    ],
  },
]

const flatNavItems = dashboardNavGroups.flatMap((g) => g.items)

interface PublicNavigationProps {
  lang: SiteLanguage
}

export function PublicNavigation({ lang }: PublicNavigationProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === href : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08111f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <p className="hidden truncate text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80 sm:block">
            {pickText(siteConfig.role, lang)}
          </p>
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold text-white">{siteConfig.title}</p>
            <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-semibold text-slate-300 sm:hidden">
              {pickText(siteConfig.roleShort, lang)}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'border-emerald-400/40 bg-emerald-400/12 text-white'
                  : 'border-white/10 bg-white/6 text-slate-300 hover:border-white/20 hover:text-white'
              }`}
            >
              {pickText(item.label, lang)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitch lang={lang} />
          <Link
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            GitHub
          </Link>
          {user ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-white/10 bg-white/6 text-slate-100 hover:bg-white/10 hover:text-white"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Studio
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="border-white/15 bg-transparent text-slate-200 hover:bg-white/8 hover:text-white"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {lang === 'zh' ? '退出' : 'Sign out'}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                {lang === 'zh' ? '登录工作台' : 'Studio Login'}
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitch lang={lang} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex rounded-full border border-white/12 bg-white/6 p-2 text-slate-200"
            aria-label={lang === 'zh' ? '切换菜单' : 'Toggle menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-white/10 bg-[#08111f]/95 px-4 py-4 lg:hidden">
          <div className="mb-4 rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
              {lang === 'zh' ? '简介' : 'Intro'}
            </p>
            <p className="mt-2 text-base font-semibold text-white">{pickText(siteConfig.role, lang)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{pickText(siteConfig.lookingFor, lang)}</p>
          </div>

          <div className="space-y-2">
            {publicNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
                    isActive(item.href)
                      ? 'border-emerald-400/40 bg-emerald-400/12 text-white'
                      : 'border-white/10 bg-white/6 text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {pickText(item.label, lang)}
                </Link>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-200"
            >
              GitHub
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border border-white/10 bg-white/6 text-slate-100 hover:bg-white/10 hover:text-white"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Studio
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/15 bg-transparent text-slate-200 hover:bg-white/8 hover:text-white"
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {lang === 'zh' ? '退出' : 'Sign out'}
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm">
                  {lang === 'zh' ? '登录工作台' : 'Studio Login'}
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const activeItem = flatNavItems.find((item) => isActive(item.href))

  return (
    <>
      {/* 顶部导航 */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#0a0f1a]/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
                <LayoutDashboard className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-white">Studio</span>
            </Link>
            {activeItem && (
              <div className="hidden items-center gap-1.5 text-sm text-slate-500 sm:flex">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-slate-300">{activeItem.label}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">公开站</span>
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 侧边栏 */}
      <aside
        className={`fixed inset-y-14 left-0 z-40 w-60 border-r border-white/[0.06] bg-[#0a0f1a]/95 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          {dashboardNavGroups.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
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
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                        active
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                      }`}
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
