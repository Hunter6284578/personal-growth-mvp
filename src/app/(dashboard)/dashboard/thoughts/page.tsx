import { createClient } from '@/lib/supabase-server'
import { ThoughtsManager } from '@/components/dashboard/ThoughtsManager'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ThoughtsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: thoughts } = await supabase
    .from('thoughts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">想法管理</h1>
        <p className="text-gray-400">随时记录你的灵感和想法</p>
      </div>

      <ThoughtsManager 
        initialThoughts={thoughts || []} 
        userId={user.id} 
      />
    </div>
  )
}
