import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { isSiteAdmin } from '@/lib/site-admin'
import { AnalyticsView } from '@/components/dashboard/AnalyticsView'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = await isSiteAdmin(supabase, user)
  if (!admin) redirect('/login')

  // 1. 最近 30 天每日访问总数
  const { data: dailyRows, error: dailyErr } = await supabase.rpc(
    'get_daily_page_views',
    { p_days: 30 }
  )

  // 2. 总访问数（最近 30 天）
  const total = (dailyRows ?? []).reduce(
    (acc: number, r: { total: number | string }) => acc + Number(r.total),
    0
  )

  // 3. 今天 / 昨天（一次 RPC 拿两条记录，desc 顺序：[今天, 昨天]）
  const { data: twoDayRows } = await supabase.rpc('get_recent_two_days')
  const todayCount = (twoDayRows ?? [])[0]
  const yestCount = (twoDayRows ?? [])[1]
  const todayTotal = todayCount ? Number(todayCount.total) : 0
  const yestTotal = yestCount ? Number(yestCount.total) : 0

  // 5. 路径 Top 10（最近 30 天）
  const { data: topRows } = await supabase
    .from('page_views')
    .select('path, view_count')
    .gte('view_date', 'now() - interval \'30 days\'')
    .order('view_count', { ascending: false })
    .limit(10)

  const topPaths = (topRows ?? []).map((r: { path: string; view_count: number }) => ({
    path: r.path,
    count: Number(r.view_count),
  }))

  return (
    <AnalyticsView
      daily={(dailyRows ?? []).map((r: { day: string; total: number | string }) => ({
        day: r.day,
        total: Number(r.total),
      }))}
      total={total}
      today={todayTotal}
      yesterday={yestTotal}
      topPaths={topPaths}
      error={dailyErr?.message ?? null}
    />
  )
}
