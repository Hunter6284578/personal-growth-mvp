import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import { FitNavClient } from './FitNavClient'

export default async function FitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="pg-page">
      <nav className="border-b backdrop-blur-xl" style={{ background: 'var(--dash-surface)', borderColor: 'var(--dash-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-3 flex items-center gap-1.5 transition-colors hover:text-[var(--text-bright)]" style={{ color: 'var(--text-dim)' }}>
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Studio</span>
              </Link>
              <span style={{ color: 'var(--dash-border)' }}>/</span>
              <Link href="/fit" className="text-xl font-bold ml-3 mr-10 flex items-center gap-2" style={{ color: 'var(--text-bright)' }}>
                <LayoutDashboard className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                Fitness Studio
              </Link>
              <FitNavClient />
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors hover:text-[var(--text-bright)]" style={{ color: 'var(--text-dim)' }}>
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>总览</span>
              </Link>
              <span className="text-sm" style={{ color: 'var(--text-dim)' }}>{user.email}</span>
              <FitNavClient showLogout />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
