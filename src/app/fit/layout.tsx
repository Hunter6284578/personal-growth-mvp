import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-gray-400 hover:text-white mr-4 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">返回</span>
              </Link>
              <Link href="/fit" className="text-xl font-bold text-white mr-10">
                健身追踪
              </Link>
              <FitNavClient />
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">{user.email}</span>
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
