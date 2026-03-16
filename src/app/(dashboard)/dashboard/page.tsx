import { Card, StatCard } from '@/components/ui/Card'
import { 
  Calendar, 
  Activity, 
  Lightbulb,
  Zap,
  TrendingUp,
  Award,
  User
} from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

// 六维属性配置
const statConfig = [
  { key: 'physical_score', label: '身体素质', color: '#EF4444', shortLabel: '体质' },
  { key: 'execution_score', label: '执行力', color: '#3B82F6', shortLabel: '执行' },
  { key: 'focus_score', label: '专注力', color: '#10B981', shortLabel: '专注' },
  { key: 'emotion_score', label: '情绪稳定', color: '#F59E0B', shortLabel: '情绪' },
  { key: 'social_score', label: '社交状态', color: '#8B5CF6', shortLabel: '社交' },
  { key: 'creativity_score', label: '创造力', color: '#EC4899', shortLabel: '创造' },
]

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
  
  // 计算连续记录天数
  let streak = 0
  if (allDailyLogs && allDailyLogs.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const dates = allDailyLogs.map(log => {
      const d = new Date(log.log_date)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
    
    const todayTime = today.getTime()
    const yesterdayTime = todayTime - 24 * 60 * 60 * 1000
    
    let checkDate = dates.includes(todayTime) ? todayTime : yesterdayTime
    
    while (dates.includes(checkDate)) {
      streak++
      checkDate -= 24 * 60 * 60 * 1000
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
  const radarData = statConfig.map(stat => ({
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

  return (
    <div className="space-y-8">
      {/* 人物总览卡片 */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* 头像区域 */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              {data.profile?.character_name?.[0] || user.email?.[0] || '?'}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-sm font-bold text-gray-900">
              {data.level}
            </div>
          </div>
          
          {/* 信息区域 */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-2xl font-bold text-white">
                {data.profile?.character_name || '冒险者'}
              </h1>
              <span className="inline-block px-3 py-1 bg-blue-600/30 text-blue-400 text-sm rounded-full border border-blue-500/30">
                {data.title}
              </span>
            </div>
            <p className="text-gray-400 mt-1">
              {data.profile?.bio || '开始你的成长之旅'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm">
              <span className="text-gray-400">
                <span className="text-white font-medium">{data.avgScore}</span> 综合评分
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">
                <span className="text-white font-medium">{data.dailyCount}</span> 天记录
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">
                <span className="text-white font-medium">{data.eventsCount}</span> 个事件
              </span>
            </div>
          </div>
          
          {/* 等级进度 */}
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Lv.{data.level}
            </div>
            <div className="text-sm text-gray-400 mt-1">{data.title}</div>
            <div className="w-32 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                style={{ width: `${data.avgScore}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="每日记录"
          value={data.dailyCount}
          icon={<Calendar className="w-6 h-6 text-blue-400" />}
          trend={data.streak > 0 ? `${data.streak}天连续` : '开始记录'}
          trendUp={data.streak > 0}
        />
        <StatCard
          label="经历事件"
          value={data.eventsCount}
          icon={<Lightbulb className="w-6 h-6 text-yellow-400" />}
        />
        <StatCard
          label="体测记录"
          value={data.fitnessCount}
          icon={<Activity className="w-6 h-6 text-green-400" />}
        />
        <StatCard
          label="综合评分"
          value={data.avgScore}
          icon={<Award className="w-6 h-6 text-purple-400" />}
          trend={data.avgScore >= 60 ? '良好' : '提升中'}
          trendUp={data.avgScore >= 60}
        />
      </div>

      {/* 主内容区 - 六维雷达图 + 趋势 */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 六维雷达图 */}
        <Card title="六维能力" subtitle="当前属性分布">
          <div className="h-[350px] w-full">
            {radarData.some(d => d.A !== 50) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="当前属性"
                    dataKey="A"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value, '评分']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-700 flex items-center justify-center mb-4">
                  <span className="text-4xl">?</span>
                </div>
                <p>暂无属性数据</p>
                <a href="/dashboard/stats" className="text-blue-400 text-sm hover:underline mt-2">
                  去评估属性 →
                </a>
              </div>
            )}
          </div>
          
          {/* 属性数值 */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {statConfig.map(stat => (
              <div key={stat.key} className="text-center p-2 bg-gray-900 rounded-lg">
                <div className="text-xs text-gray-500">{stat.label}</div>
                <div className="text-lg font-bold" style={{ color: stat.color }}>
                  {data.stats[stat.key as keyof typeof data.stats]}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 趋势图 + 快捷操作 */}
        <div className="space-y-8">
          <Card title="评分趋势" subtitle="最近7次评估">
            <div className="h-[250px] w-full">
              {trendData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="平均" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      dot={{ fill: '#8B5CF6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-700" />
                    <p>数据不足，无法显示趋势</p>
                    <p className="text-sm">至少需要2条记录</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 快捷操作 */}
          <Card title="快捷操作" subtitle="快速记录今日数据">
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/dashboard/daily"
                className="bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg transition-colors font-medium text-sm"
              >
                记录今日
              </a>
              <a
                href="/dashboard/stats"
                className="bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg transition-colors font-medium text-sm"
              >
                更新属性
              </a>
              <a
                href="/dashboard/events"
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-center py-3 rounded-lg transition-colors font-medium text-sm"
              >
                添加经历
              </a>
              <a
                href="/dashboard/fitness"
                className="bg-purple-600 hover:bg-purple-700 text-white text-center py-3 rounded-lg transition-colors font-medium text-sm"
              >
                记录体测
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* 最近记录 */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 最近每日记录 */}
        <Card title="最近每日记录" subtitle="过去3天">
          <div className="space-y-3">
            {data.recentDailyLogs.length > 0 ? (
              data.recentDailyLogs.map((log) => (
                <div key={log.id} className="p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{log.log_date}</span>
                    <span className="text-yellow-400">心情 {log.mood_score}/10</span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{log.summary || '无总结'}</p>
                </div>
              ))
            ) : (
              <div className="p-8 bg-gray-900 rounded-lg text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">暂无记录</p>
                <a href="/dashboard/daily" className="text-blue-400 text-sm hover:underline mt-2 inline-block">
                  去添加第一条记录 →
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* 最近经历事件 */}
        <Card title="最近经历事件" subtitle="过去3条">
          <div className="space-y-3">
            {data.recentEvents.length > 0 ? (
              data.recentEvents.map((event) => (
                <div key={event.id} className="p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
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
              <div className="p-8 bg-gray-900 rounded-lg text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lightbulb className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">暂无事件</p>
                <a href="/dashboard/events" className="text-blue-400 text-sm hover:underline mt-2 inline-block">
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
