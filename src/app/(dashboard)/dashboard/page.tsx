import { Card, StatCard } from '@/components/ui/Card'
import { 
  Calendar, 
  Activity, 
  Lightbulb,
  Award,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ChartsPanel } from '@/components/dashboard/ChartsPanel'
import { STAT_CONFIG } from '@/lib/constants'

// 获取真实数据
async function getDashboardData(userId: string) {
  const supabase = await createClient()
  
  // 获取用户资料
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  // 获取最新属性评分
  const { data: latestStats } = await supabase
    .from('stat_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(1)
    .single()
  
  // 获取最近7条属性评分（用于趋势图）
  const { data: recentStats } = await supabase
    .from('stat_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(7)
  
  // 获取每日记录数量
  const { count: dailyCount } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  // 获取事件数量
  const { count: eventsCount } = await supabase
    .from('life_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  // 获取体测记录数量
  const { count: fitnessCount } = await supabase
    .from('fitness_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  // 获取最近3条每日记录
  const { data: recentDailyLogs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(3)
  
  // 获取最近3条事件
  const { data: recentEvents } = await supabase
    .from('life_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: false })
    .limit(3)
  
  // 获取连续记录天数
  const { data: allDailyLogs } = await supabase
    .from('daily_logs')
    .select('log_date')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
  
  // 计算连续记录天数（使用日期字符串避免时区问题，使用 Set 优化查找）
  let streak = 0
  if (allDailyLogs && allDailyLogs.length > 0) {
    const today = new Date()
    const todayStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0')

    const dateSet = new Set<string>(
      allDailyLogs.map(log => String(log.log_date).slice(0, 10))
    )

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.getFullYear() + '-' +
      String(yesterday.getMonth() + 1).padStart(2, '0') + '-' +
      String(yesterday.getDate()).padStart(2, '0')

    const checkDate = new Date(
      dateSet.has(todayStr) ? todayStr : yesterdayStr
    )

    while (dateSet.has(
      checkDate.getFullYear() + '-' +
      String(checkDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(checkDate.getDate()).padStart(2, '0')
    )) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }
  
  // 计算等级
  const defaultStats = {
    physical_score: 50,
    execution_score: 50,
    focus_score: 50,
    emotion_score: 50,
    social_score: 50,
    creativity_score: 50
  }
  
  const stats = latestStats || defaultStats
  const avgScore = Math.round(
    (stats.physical_score + stats.execution_score + stats.focus_score + 
     stats.emotion_score + stats.social_score + stats.creativity_score) / 6
  )
  
  // 等级计算
  let level = 1
  let title = '新手'
  if (avgScore >= 90) { level = 10; title = '传说' }
  else if (avgScore >= 80) { level = 8; title = '大师' }
  else if (avgScore >= 70) { level = 6; title = '专家' }
  else if (avgScore >= 60) { level = 4; title = '进阶' }
  else if (avgScore >= 50) { level = 2; title = '入门' }
  
  return {
    profile,
    stats,
    avgScore,
    level,
    title,
    dailyCount: dailyCount || 0,
    eventsCount: eventsCount || 0,
    fitnessCount: fitnessCount || 0,
    streak,
    recentDailyLogs: recentDailyLogs || [],
    recentEvents: recentEvents || [],
    recentStats: recentStats || []
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const data = await getDashboardData(user.id)
  
  // 雷达图数据
  const radarData = STAT_CONFIG.map(stat => ({
    subject: stat.shortLabel,
    A: data.stats[stat.key as keyof typeof data.stats],
    fullMark: 100,
    color: stat.color
  }))
  
  // 趋势图数据
  const trendData = data.recentStats.slice().reverse().map(item => ({
    date: new Date(item.score_date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    平均: Math.round((item.physical_score + item.execution_score + item.focus_score + 
                     item.emotion_score + item.social_score + item.creativity_score) / 6)
  }))
  const previousStats = data.recentStats[1]
  const previousAvgScore = previousStats
    ? Math.round((previousStats.physical_score + previousStats.execution_score + previousStats.focus_score +
      previousStats.emotion_score + previousStats.social_score + previousStats.creativity_score) / 6)
    : data.avgScore
  const avgDelta = data.avgScore - previousAvgScore
  const avgDeltaLabel = avgDelta === 0 ? '持平' : `${avgDelta > 0 ? '+' : ''}${avgDelta}`
  const avgTrendUp = avgDelta >= 0

  return (
    <div className="space-y-8">
      <Card className="border-emerald-500/15 bg-gradient-to-br from-emerald-950/40 via-[#0d1520] to-[#0d1520]">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-emerald-900/30">
              {data.profile?.character_name?.[0] || user.email?.[0] || '?'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-gray-900 border-2 border-[#0d1520]">
              {data.level}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <h1 className="text-2xl font-bold text-white">
                {data.profile?.character_name || '冒险者'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                {data.title}
              </span>
            </div>
            <p className="text-slate-400 mt-1 text-sm">
              {data.profile?.bio || '开始你的成长之旅'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3 text-sm">
              <span className="text-slate-500">
                <span className="text-white font-medium">{data.avgScore}</span> 评分
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">
                <span className="text-white font-medium">{data.dailyCount}</span> 天记录
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">
                <span className="text-white font-medium">{data.eventsCount}</span> 个事件
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">
                <span className="text-emerald-400 font-medium">{data.streak || 0}</span> 天连续
              </span>
            </div>
          </div>
          
          {/* 等级进度 */}
          <div className="text-center shrink-0">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Lv.{data.level}
            </div>
            <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                style={{ width: `${data.avgScore}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="每日记录"
          value={data.dailyCount}
          icon={<Calendar className="w-6 h-6 text-emerald-400" />}
          trend={data.streak > 0 ? `${data.streak}天连续` : '开始记录'}
          trendUp={data.streak > 0}
        />
        <StatCard
          label="经历事件"
          value={data.eventsCount}
          icon={<Lightbulb className="w-6 h-6 text-amber-400" />}
        />
        <StatCard
          label="体测记录"
          value={data.fitnessCount}
          icon={<Activity className="w-6 h-6 text-teal-400" />}
        />
        <StatCard
          label="综合评分"
          value={data.avgScore}
          icon={<Award className="w-6 h-6 text-violet-400" />}
          trend={avgDelta === 0 ? '较上次持平' : `较上次 ${avgDeltaLabel}`}
          trendUp={avgTrendUp}
        />
      </div>

      <ChartsPanel radarData={radarData} trendData={trendData} />

      <div className="grid lg:grid-cols-2 gap-8">
        <Card title="最近每日记录" subtitle="过去3天">
          <div className="space-y-3">
            {data.recentDailyLogs.length > 0 ? (
              data.recentDailyLogs.map((log) => (
                <div key={log.id} className="pg-card-soft p-4 hover:border-gray-500/70 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{log.log_date}</span>
                    <span className="text-yellow-400">心情 {log.mood_score}/10</span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{log.summary || '无总结'}</p>
                </div>
              ))
            ) : (
              <div className="p-8 bg-gray-900/70 rounded-lg text-center border border-dashed border-gray-700">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">暂无记录</p>
                <a href="/dashboard/daily" className="text-emerald-400 text-sm hover:underline mt-2 inline-block">
                  去添加第一条记录 →
                </a>
              </div>
            )}
          </div>
        </Card>

        <Card title="最近经历事件" subtitle="过去3条">
          <div className="space-y-3">
            {data.recentEvents.length > 0 ? (
              data.recentEvents.map((event) => (
                <div key={event.id} className="pg-card-soft p-4 hover:border-gray-500/70 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium line-clamp-1">{event.title}</span>
                    <span className="text-purple-400 text-sm">影响 {event.impact_level}/10</span>
                  </div>
                  <p className="text-gray-400 text-sm">{event.event_date}</p>
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {event.tags.map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 bg-gray-900/70 rounded-lg text-center border border-dashed border-gray-700">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lightbulb className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">暂无事件</p>
                <a href="/dashboard/events" className="text-emerald-400 text-sm hover:underline mt-2 inline-block">
                  去添加第一个事件 →
                </a>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
