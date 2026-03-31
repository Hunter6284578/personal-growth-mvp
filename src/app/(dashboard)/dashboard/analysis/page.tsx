'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  Activity, 
  Brain, 
  Calendar, 
  User, 
  Clock, 
  ChevronDown,
  AlertCircle,
  RefreshCw,
  FileText,
  History,
  X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getLifeEvents, getAIAnalyses } from '@/lib/services'
import { LifeEvent, AIAnalysis } from '@/types'

const markdownComponents = {
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xl font-bold text-white mt-6 mb-3">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h3>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="text-white">{children}</strong>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc ml-4 text-gray-300 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal ml-4 text-gray-300 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-gray-300 mb-1">{children}</li>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-gray-300 mb-2 leading-relaxed">{children}</p>
  ),
}

const analysisTypes = [
  {
    id: 'weekly' as const,
    label: '周报分析',
    description: '基于最近7天数据生成周报',
    icon: TrendingUp,
    dataRequirement: '需要最近7天的记录数据',
    minDataRequirement: '建议至少有3天记录',
  },
  {
    id: 'event' as const,
    label: '事件分析',
    description: '分析单条事件的影响',
    icon: Activity,
    dataRequirement: '需要选择一个已记录的事件',
    minDataRequirement: '需要至少1个事件',
  },
  {
    id: 'profile' as const,
    label: '人物画像',
    description: '基于30天数据生成画像',
    icon: Brain,
    dataRequirement: '需要最近30天的记录数据',
    minDataRequirement: '建议至少有7天记录',
  },
]

type AnalysisType = 'weekly' | 'event' | 'profile'
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 骨架屏组件
function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-700 rounded w-1/3"></div>
      <div className="space-y-3">
        <div className="h-20 bg-gray-800 rounded"></div>
        <div className="h-20 bg-gray-800 rounded"></div>
        <div className="h-20 bg-gray-800 rounded"></div>
      </div>
    </div>
  )
}

// 空状态组件
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ElementType
  title: string
  description: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
      <p className="text-gray-400 font-medium">{title}</p>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
      {action && (
        <a 
          href={action.href}
          className="inline-flex items-center text-blue-400 text-sm hover:underline mt-3"
        >
          {action.label}
          <RefreshCw className="w-3 h-3 ml-1" />
        </a>
      )}
    </div>
  )
}

// 错误状态组件
function ErrorState({ 
  message, 
  onRetry 
}: { 
  message: string
  onRetry?: () => void 
}) {
  return (
    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-red-400 font-medium">分析失败</h3>
          <p className="text-red-300/80 text-sm mt-1">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-4 border-red-700 text-red-400 hover:bg-red-900/30"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// 类型标签组件
function TypeBadge({ type }: { type: AnalysisType }) {
  const config = {
    weekly: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: '周报' },
    event: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: '事件' },
    profile: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: '画像' },
  }
  const { color, label } = config[type]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {label}
    </span>
  )
}

export default function AnalysisPage() {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState<AnalysisType>('weekly')
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [events, setEvents] = useState<LifeEvent[]>([])
  const [result, setResult] = useState('')
  const [analysisState, setAnalysisState] = useState<LoadingState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [history, setHistory] = useState<AIAnalysis[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AIAnalysis | null>(null)

  // 加载数据
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setDataLoading(true)
    setErrorMessage('')
    try {
      const [eventsData, historyData] = await Promise.all([
        getLifeEvents(user.id, 20),
        getAIAnalyses(user.id, 10)
      ])
      setEvents(eventsData)
      setHistory(historyData)
    } catch (error) {
      console.error('加载数据失败:', error)
      setErrorMessage('加载数据失败，请刷新页面重试')
    } finally {
      setDataLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!user) {
      setErrorMessage('请先登录')
      return
    }

    if (selectedType === 'event' && !selectedEvent) {
      setErrorMessage('请先选择一个事件')
      return
    }

    setAnalysisState('loading')
    setResult('')
    setErrorMessage('')

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          eventId: selectedType === 'event' ? selectedEvent : undefined,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '分析请求失败')
      }
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setResult(data.result)
      setAnalysisState('success')
      
      // 刷新历史记录
      if (data.saved) {
        const historyData = await getAIAnalyses(user.id, 10)
        setHistory(historyData)
      }
    } catch (error) {
      console.error('分析失败:', error)
      setAnalysisState('error')
      setErrorMessage(error instanceof Error ? error.message : '分析失败，请稍后重试')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'weekly': return '周报分析'
      case 'event': return '事件分析'
      case 'profile': return '人物画像'
      default: return type
    }
  }

  // 检查是否可以进行 event 分析
  const canDoEventAnalysis = events.length > 0



  if (dataLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">AI 分析</h1>
          <p className="text-gray-400 mt-1">加载中...</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card title="选择分析类型">
              <SkeletonCard />
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card title="分析结果">
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-white">AI 分析</h1>
        <p className="text-gray-400 mt-1">基于你的真实数据生成个性化分析</p>
      </div>

      {/* 全局错误提示 */}
      {errorMessage && analysisState === 'idle' && (
        <ErrorState message={errorMessage} onRetry={loadData} />
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 左侧：分析类型选择 */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="选择分析类型">
            <div className="space-y-3">
              {analysisTypes.map((type) => {
                const Icon = type.icon
                const isDisabled = type.id === 'event' && !canDoEventAnalysis
                const isSelected = selectedType === type.id
                
                return (
                  <button
                    key={type.id}
                    onClick={() => !isDisabled && setSelectedType(type.id)}
                    disabled={isDisabled}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500'
                        : isDisabled
                        ? 'bg-gray-800/50 border-gray-800 opacity-50 cursor-not-allowed'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start">
                      <Icon className={`w-5 h-5 mr-3 mt-0.5 ${
                        isSelected ? 'text-blue-400' : isDisabled ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${
                            isSelected ? 'text-white' : isDisabled ? 'text-gray-500' : 'text-gray-300'
                          }`}>
                            {type.label}
                          </p>
                          {isDisabled && (
                            <span className="text-xs text-gray-600">暂不可用</span>
                          )}
                        </div>
                        <p className={`text-sm ${isDisabled ? 'text-gray-600' : 'text-gray-500'}`}>
                          {type.description}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {type.minDataRequirement}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* 事件选择（仅 event 类型） */}
          {selectedType === 'event' && (
            <Card title="选择事件" subtitle={`共 ${events.length} 个事件`}>
              {canDoEventAnalysis ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedEvent === event.id
                          ? 'bg-purple-600/20 border-purple-500'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-sm line-clamp-1">
                          {event.title}
                        </span>
                        {event.impact_level && (
                          <span className="text-xs text-purple-400">
                            影响 {event.impact_level}/10
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{event.event_date}</p>
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {event.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Activity}
                  title="暂无事件记录"
                  description="需要先记录事件才能进行事件分析"
                  action={{ label: '去添加事件', href: '/dashboard/events' }}
                />
              )}
            </Card>
          )}

          {/* 无可选事件时的提示 */}
          {selectedType === 'event' && !canDoEventAnalysis && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400 font-medium text-sm">无法进行事件分析</p>
                  <p className="text-yellow-300/70 text-xs mt-1">
                    你还没有记录任何事件。请先前往&quot;经历事件&quot;页面添加至少一个事件。
                  </p>
                  <a 
                    href="/dashboard/events"
                    className="inline-flex items-center text-yellow-400 text-xs hover:underline mt-2"
                  >
                    去添加事件 →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 历史分析记录 */}
          {history.length > 0 && (
            <Card 
              title={
                <div className="flex items-center">
                  <History className="w-4 h-4 mr-2 text-gray-400" />
                  历史分析
                </div>
              }
              subtitle={
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-blue-400 text-sm flex items-center hover:text-blue-300"
                >
                  {showHistory ? '收起' : `查看全部 (${history.length})`}
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                </button>
              }
            >
              {showHistory && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors group"
                      onClick={() => setSelectedHistoryItem(item)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <TypeBadge type={item.analysis_type as AnalysisType} />
                        <span className="text-gray-500 text-xs">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-2">
                        {item.result.slice(0, 120)}...
                      </p>
                      <div className="flex items-center text-blue-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileText className="w-3 h-3 mr-1" />
                        点击查看详情
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* 右侧：分析区域 */}
        <div className="lg:col-span-2">
          <Card 
            title="分析结果" 
            subtitle={
              selectedType === 'event' && selectedEvent
                ? `正在分析: ${events.find(e => e.id === selectedEvent)?.title}`
                : analysisState === 'loading' 
                  ? 'AI 正在分析你的数据...'
                  : '点击开始生成分析'
            }
          >
            {/* 操作按钮 */}
            <div className="mb-6">
              <Button
                onClick={handleAnalyze}
                loading={analysisState === 'loading'}
                disabled={selectedType === 'event' && !selectedEvent}
                className="w-full sm:w-auto"
              >
                {analysisState === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始分析
                  </>
                )}
              </Button>
              
              {analysisState === 'success' && (
                <span className="ml-4 text-green-400 text-sm">
                  ✓ 分析完成
                </span>
              )}
            </div>

            {/* 错误状态 */}
            {analysisState === 'error' && (
              <div className="mb-6">
                <ErrorState 
                  message={errorMessage} 
                  onRetry={handleAnalyze}
                />
              </div>
            )}

            {/* 分析结果 */}
            {result && analysisState === 'success' && (
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">AI 分析结果</h3>
                  </div>
                  <button
                    onClick={() => {
                      setResult('')
                      setAnalysisState('idle')
                    }}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {result}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* 空状态 */}
            {analysisState === 'idle' && !result && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-12 h-12 text-gray-600" />
                </div>
                <p className="text-gray-400 text-lg">选择分析类型并点击开始</p>
                <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                  AI 将基于你的真实记录数据生成个性化分析，包括数据概览、行为观察、具体建议等
                </p>
                
                <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">周报分析</p>
                    <p className="text-xs text-gray-500">7天数据总结</p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">事件分析</p>
                    <p className="text-xs text-gray-500">单条事件影响</p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <User className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">人物画像</p>
                    <p className="text-xs text-gray-500">30天行为模式</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 历史详情弹窗 */}
      {selectedHistoryItem && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedHistoryItem(null)}
        >
          <div 
            className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TypeBadge type={selectedHistoryItem.analysis_type as AnalysisType} />
                <span className="text-gray-400 text-sm">
                  {formatDate(selectedHistoryItem.created_at)}
                </span>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {selectedHistoryItem.result}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分析说明 */}
      <Card title="分析说明" subtitle="AI 分析的工作原理">
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-400" />
              基于真实数据
            </h4>
            <p className="text-gray-400">
              AI 只分析你主动记录的数据，包括每日日志、属性评分、事件记录等，不做无依据的推测。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-green-400" />
              时间范围
            </h4>
            <p className="text-gray-400">
              周报分析使用最近7天数据，人物画像使用最近30天数据。数据越多，分析越准确。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
              隐私保护
            </h4>
            <p className="text-gray-400">
              分析结果仅你可见，AI 服务仅接收必要的数据片段，不会存储或用于其他用途。
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
