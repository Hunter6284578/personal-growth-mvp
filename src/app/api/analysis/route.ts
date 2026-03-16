// AI 分析 API 路由 - 优化版本
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { callAI } from '@/lib/ai-service'
import { buildPrompt, AnalysisData } from '@/lib/prompts'

// 验证请求体的函数
function validateRequest(body: unknown): { valid: boolean; error?: string; data?: { type: 'weekly' | 'event' | 'profile'; eventId?: string } } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: '请求体必须是 JSON 对象' }
  }

  const { type, eventId } = body as Record<string, unknown>

  // 验证 type 字段
  if (!type) {
    return { valid: false, error: '缺少必需字段: type' }
  }

  if (typeof type !== 'string' || !['weekly', 'event', 'profile'].includes(type)) {
    return { valid: false, error: '无效的分析类型，必须是 weekly、event 或 profile' }
  }

  // 验证 eventId（当 type 为 event 时）
  if (type === 'event') {
    if (!eventId) {
      return { valid: false, error: 'Event 分析需要提供 eventId' }
    }
    if (typeof eventId !== 'string' || eventId.length === 0) {
      return { valid: false, error: 'eventId 必须是有效的字符串' }
    }
  }

  return { 
    valid: true, 
    data: { 
      type: type as 'weekly' | 'event' | 'profile', 
      eventId: eventId as string | undefined 
    } 
  }
}

// 获取分析所需的数据
async function getAnalysisData(userId: string, days: number): Promise<AnalysisData> {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]
  
  // 并行获取所有数据
  const [
    { data: stats },
    { data: dailyLogs },
    { data: events },
    { data: fitness }
  ] = await Promise.all([
    supabase
      .from('stat_scores')
      .select('*')
      .eq('user_id', userId)
      .gte('score_date', startDateStr)
      .order('score_date', { ascending: false }),
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', startDateStr)
      .order('log_date', { ascending: false }),
    supabase
      .from('life_events')
      .select('*')
      .eq('user_id', userId)
      .gte('event_date', startDateStr)
      .order('event_date', { ascending: false }),
    supabase
      .from('fitness_records')
      .select('*')
      .eq('user_id', userId)
      .gte('record_date', startDateStr)
      .order('record_date', { ascending: false })
  ])
  
  return {
    stats: stats || [],
    dailyLogs: dailyLogs || [],
    events: events || [],
    fitness: fitness || []
  }
}

// 获取并验证事件所有权
async function getEventWithOwnership(userId: string, eventId: string) {
  const supabase = await createClient()
  
  const { data: event, error } = await supabase
    .from('life_events')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // 记录不存在或不属于当前用户
      return { exists: false, event: null }
    }
    throw new Error(`数据库查询失败: ${error.message}`)
  }
  
  return { exists: true, event }
}

// 保存分析结果
async function saveAnalysis(
  userId: string,
  type: string,
  prompt: string,
  result: string
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ai_analyses')
    .insert({
      user_id: userId,
      analysis_type: type,
      input_summary: prompt.slice(0, 500),
      result: result
    })
    .select()
    .single()
  
  if (error) {
    console.error('保存分析结果失败:', error)
    return null
  }
  
  return data
}

// 检查数据充足度
function checkDataSufficiency(type: string, data: AnalysisData): { sufficient: boolean; message?: string } {
  const { stats = [], dailyLogs = [], events = [] } = data
  
  switch (type) {
    case 'weekly':
      if (dailyLogs.length === 0 && stats.length === 0) {
        return { 
          sufficient: false, 
          message: '最近7天没有足够的记录数据。建议先记录每日日志或属性评分。' 
        }
      }
      if (dailyLogs.length < 3) {
        return { 
          sufficient: true, 
          message: `警告：最近7天只有 ${dailyLogs.length} 天记录，分析可能不够准确。` 
        }
      }
      return { sufficient: true }
      
    case 'event':
      // Event 分析的数据充足度在调用前检查
      return { sufficient: true }
      
    case 'profile':
      if (dailyLogs.length === 0 && stats.length === 0) {
        return { 
          sufficient: false, 
          message: '最近30天没有足够的记录数据。建议先积累一些记录。' 
        }
      }
      if (dailyLogs.length < 7) {
        return { 
          sufficient: true, 
          message: `警告：最近30天只有 ${dailyLogs.length} 天记录，建议至少记录7天以获得更准确的画像。` 
        }
      }
      return { sufficient: true }
      
    default:
      return { sufficient: false, message: '未知的分析类型' }
  }
}

// POST /api/analysis
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录或登录已过期', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    // 2. 解析并验证请求体
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: '无效的 JSON 请求体', code: 'INVALID_JSON' },
        { status: 400 }
      )
    }
    
    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    
    const { type, eventId } = validation.data!
    
    // 3. 获取数据
    let data: AnalysisData
    let targetEvent: NonNullable<AnalysisData['events']>[number] | undefined
    
    if (type === 'event') {
      // 验证事件存在性和所有权
      const eventCheck = await getEventWithOwnership(user.id, eventId!)
      if (!eventCheck.exists) {
        return NextResponse.json(
          { error: '事件不存在或无权访问', code: 'EVENT_NOT_FOUND' },
          { status: 404 }
        )
      }
      targetEvent = eventCheck.event
      
      // 获取事件前后15天的数据
      data = await getAnalysisData(user.id, 15)
    } else if (type === 'weekly') {
      data = await getAnalysisData(user.id, 7)
    } else {
      data = await getAnalysisData(user.id, 30)
    }
    
    // 4. 检查数据充足度
    const sufficiency = checkDataSufficiency(type, data)
    if (!sufficiency.sufficient) {
      return NextResponse.json({
        result: `## 📊 分析结果\n\n${sufficiency.message}\n\n**建议：**\n1. 先记录一些每日日志，记录心情和总结\n2. 定期评估六维属性\n3. 记录重要事件及其影响\n\n数据积累越多，分析越准确！`,
        saved: false,
        warning: sufficiency.message
      })
    }
    
    // 5. 构建 prompt
    let prompt: string
    try {
      prompt = buildPrompt(type, data, targetEvent)
    } catch (error) {
      console.error('构建 Prompt 失败:', error)
      return NextResponse.json(
        { error: '构建分析请求失败', code: 'PROMPT_BUILD_ERROR' },
        { status: 500 }
      )
    }
    
    // 6. 调用 AI
    const aiResponse = await callAI({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 2500
    })
    
    // 7. 处理 AI 响应错误
    if (aiResponse.error) {
      console.error('AI 调用失败:', aiResponse.error)
      
      // 分类错误类型
      let errorCode = 'AI_ERROR'
      let statusCode = 500
      let userMessage = 'AI 分析服务暂时不可用，请稍后重试'
      
      if (aiResponse.error.includes('API Key')) {
        errorCode = 'CONFIG_ERROR'
        userMessage = 'AI 服务配置错误，请联系管理员'
      } else if (aiResponse.error.includes('timeout') || aiResponse.error.includes('ECONNREFUSED')) {
        errorCode = 'NETWORK_ERROR'
        userMessage = '网络连接超时，请检查网络后重试'
      } else if (aiResponse.error.includes('rate limit')) {
        errorCode = 'RATE_LIMIT'
        statusCode = 429
        userMessage = '请求过于频繁，请稍后再试'
      }
      
      return NextResponse.json(
        { 
          error: userMessage, 
          code: errorCode,
          details: process.env.NODE_ENV === 'development' ? aiResponse.error : undefined
        },
        { status: statusCode }
      )
    }
    
    // 8. 验证 AI 输出
    if (!aiResponse.content || aiResponse.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'AI 返回了空内容，请重试', code: 'EMPTY_RESPONSE' },
        { status: 500 }
      )
    }
    
    // 9. 保存分析结果
    const savedAnalysis = await saveAnalysis(user.id, type, prompt, aiResponse.content)
    
    // 10. 返回结果
    return NextResponse.json({
      result: aiResponse.content,
      saved: !!savedAnalysis,
      analysisId: savedAnalysis?.id,
      usage: aiResponse.usage,
      warning: sufficiency.message
    })
    
  } catch (error) {
    console.error('AI 分析 API 未捕获错误:', error)
    
    // 区分已知错误和未知错误
    if (error instanceof Error) {
      // 数据库连接错误
      if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: '数据库连接失败', code: 'DB_ERROR' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: '服务器内部错误', 
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' && error instanceof Error 
          ? error.message 
          : undefined
      },
      { status: 500 }
    )
  }
}

// GET /api/analysis - 获取历史分析记录
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // 验证 limit 参数
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'limit 参数必须在 1-100 之间', code: 'INVALID_PARAM' },
        { status: 400 }
      )
    }
    
    // 验证 type 参数
    if (type && !['weekly', 'event', 'profile'].includes(type)) {
      return NextResponse.json(
        { error: '无效的分析类型', code: 'INVALID_TYPE' },
        { status: 400 }
      )
    }
    
    let query = supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (type) {
      query = query.eq('analysis_type', type)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('获取分析记录失败:', error)
      return NextResponse.json(
        { error: '获取分析记录失败', code: 'DB_ERROR' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      analyses: data,
      count: data?.length || 0
    })
    
  } catch (error) {
    console.error('获取分析记录错误:', error)
    return NextResponse.json(
      { error: '服务器错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
