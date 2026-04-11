import { Card, StatCard } from '@/components/ui/Card'
import { 
  Calendar, 
  Activity, 
  Lightbulb,
  Award,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ChartsPanel } from '@/components/dashboard/ChartsPanel'
import { STAT_CONFIG } from '@/lib/constants'
import { ManagedImage } from '@/components/ui/ManagedImage'

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
  
  // 计算平均分
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
  
  return {
    profile,
    stats,
    avgScore,
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

  return (
    <div className="space-y-8">
      {/* 用户信息卡 — 去游戏化 */}
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold overflow-hidden relative"
            style={{
              background: data.profile?.avatar_url ? 'transparent' : 'var(--dash-card-soft)',
              border: '1px solid var(--dash-border)',
              color: 'var(--text-bright)',
            }}
          >
            {data.profile?.avatar_url ? (
              <ManagedImage
                src={data.profile.avatar_url}
                alt={`${data.profile.character_name || '用户'}头像`}
                width={64}
                height={64}
                sizes="64px"
                className="h-full w-full"
              />
            ) : (
              <User className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-bright)' }}>
              {data.profile?.character_name || '用户'}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {data.profile?.bio || '开始你的成长之旅'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>
                <span className="font-medium" style={{ color: 'var(--text-bright)' }}>{data.avgScore}</span> 评分
              </span>
              <span style={{ color: 'var(--dash-border)' }}>|</span>
              <span>
                <span className="font-medium" style={{ color: 'var(--text-bright)' }}>{data.dailyCount}</span> 天记录
              </span>
              <span style={{ color: 'var(--dash-border)' }}>|</span>
              <span>
                <span className="font-medium" style={{ color: 'var(--text-bright)' }}>{data.eventsCount}</span> 个事件
              </span>
              <span style={{ color: 'var(--dash-border)' }}>|</span>
              <span>
                <span className="font-medium" style={{ color: 'var(--dash-success)' }}>{data.streak || 0}</span> 天连续
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="每日记录"
          value={data.dailyCount}
          icon={<Calendar className="w-5 h-5" />}
          trend={data.streak > 0 ? `${data.streak}天连续` : '开始记录'}
          trendUp={data.streak > 0}
        />
        <StatCard
          label="经历事件"
          value={data.eventsCount}
          icon={<Lightbulb className="w-5 h-5" />}
        />
        <StatCard
          label="体测记录"
          value={data.fitnessCount}
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          label="综合评分"
          value={data.avgScore}
          icon={<Award className="w-5 h-5" />}
          trend={avgDelta === 0 ? '较上次持平' : `较上次 ${avgDeltaLabel}`}
          trendUp={avgDelta >= 0}
        />
      </div>

      <ChartsPanel radarData={radarData} trendData={trendData} />

      <div className="grid lg:grid-cols-2 gap-8">
        <Card title="最近每日记录" subtitle="过去3天">
          <div className="space-y-3">
            {data.recentDailyLogs.length > 0 ? (
              data.recentDailyLogs.map((log) => (
                <div key={log.id} className="pg-card-soft p-4 transition-colors" style={{ cursor: 'default' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: 'var(--text-bright)' }}>{log.log_date}</span>
                    <span style={{ color: 'var(--dash-warning)' }}>心情 {log.mood_score}/10</span>
                  </div>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{log.summary || '无总结'}</p>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-lg text-center" style={{ border: '1px dashed var(--dash-border)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--dash-card-soft)' }}>
                  <Calendar className="w-7 h-7" style={{ color: 'var(--text-dim)' }} />
                </div>
                <p style={{ color: 'var(--text-muted)' }}>暂无记录</p>
                <a href="/dashboard/daily" className="text-sm mt-2 inline-block" style={{ color: 'var(--accent)' }}>
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
                <div key={event.id} className="pg-card-soft p-4 transition-colors" style={{ cursor: 'default' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium line-clamp-1" style={{ color: 'var(--text-bright)' }}>{event.title}</span>
                    <span className="text-sm" style={{ color: 'var(--dash-info)' }}>影响 {event.impact_level}/10</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{event.event_date}</p>
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {event.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ background: 'var(--dash-card-soft)', color: 'var(--text-muted)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 rounded-lg text-center" style={{ border: '1px dashed var(--dash-border)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--dash-card-soft)' }}>
                  <Lightbulb className="w-7 h-7" style={{ color: 'var(--text-dim)' }} />
                </div>
                <p style={{ color: 'var(--text-muted)' }}>暂无事件</p>
                <a href="/dashboard/events" className="text-sm mt-2 inline-block" style={{ color: 'var(--accent)' }}>
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
