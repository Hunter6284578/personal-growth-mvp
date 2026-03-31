'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from './ui/Button'
import { Home, BookOpen, Lightbulb, User, LayoutDashboard, LogOut, Menu, X, FileText, Sparkles, Calendar, Activity } from 'lucide-react'
import { useState } from 'react'

const publicNavItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/blog', label: '博客', icon: BookOpen },
  { href: '/thoughts', label: '想法', icon: Lightbulb },
  { href: '/about', label: '关于', icon: User },
]

const dashboardNavItems = [
  { href: '/dashboard', label: '总览', icon: LayoutDashboard },
  { href: '/dashboard/stats', label: '属性', icon: User },
  { href: '/dashboard/daily', label: '每日', icon: Calendar },
  { href: '/dashboard/events', label: '经历', icon: Activity },
  { href: '/dashboard/fitness', label: '体测', icon: User },
  { href: '/dashboard/thoughts', label: '想法', icon: Sparkles },
  { href: '/dashboard/blog', label: '博客', icon: FileText },
  { href: '/dashboard/analysis', label: 'AI分析', icon: LayoutDashboard },
  { href: '/dashboard/settings', label: '设置', icon: User },
]

export function PublicNavigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              成长记录
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {publicNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    后台
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  退出
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">登录</Button>
              </Link>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-800 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {publicNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.label}
                </Link>
              )
            })}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  后台
                </Link>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  退出
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export function DashboardNavigation() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* 顶部导航栏 */}
      <nav className="bg-gray-900 border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-300 hover:text-white p-2 mr-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/dashboard" className="text-xl font-bold text-white">
                人物面板
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">返回前台</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-1" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 侧边栏 */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 ease-in-out z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-4 space-y-1 overflow-y-auto h-full">
          {dashboardNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </aside>

      {/* 遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
