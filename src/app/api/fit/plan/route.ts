import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { callAI } from '@/lib/ai-service'
import { getExercisesByMuscle, getFitLogs } from '@/lib/fit/services'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 提取过去 14 天的肩部训练数据
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const startDate = twoWeeksAgo.toISOString().split('T')[0]

    const recentLogs = await getFitLogs(user.id, startDate, new Date().toISOString().split('T')[0])

    // 获取肩部动作库
    const shoulderExercises = await getExercisesByMuscle('三角肌中束')

    // 筛选肩部训练记录
    const shoulderLogs = recentLogs.filter(log => {
      const muscle = log.exercise?.target_muscle || ''
      return muscle.includes('三角肌')
    })

    // 组装 context
    const context = {
      user_goal: '每周4天训练频率，核心生理诉求为肩部肌群肥大（宽肩）',
      recent_shoulder_logs: shoulderLogs.map(log => ({
        date: log.date,
        exercise: log.exercise?.name,
        sets: log.sets,
        total_volume: log.total_volume,
      })),
      available_exercises: shoulderExercises.map(e => ({
        id: e.id,
        name: e.name,
        equipment: e.equipment,
      })),
      today: new Date().toISOString().split('T')[0],
    }

    const systemPrompt = `你是一个专业的健身教练 AI，专注于力量训练和肌肥大训练规划。
根据用户的训练数据，生成一份今日训练计划。

用户核心目标：${context.user_goal}

可用动作库（含 ID）：
${JSON.stringify(context.available_exercises, null, 2)}

近期肩部训练数据（过去14天）：
${JSON.stringify(context.recent_shoulder_logs, null, 2)}

必须返回以下 JSON 格式，不要包含任何其他文本：
{
  "plan_date": "YYYY-MM-DD",
  "focus_area": "训练聚焦部位",
  "exercises": [
    {
      "exercise_id": "uuid",
      "name": "动作名称",
      "target_sets": 4,
      "rep_range": "12-15",
      "intensity_guideline": "RIR 1-2",
      "rationale": "基于数据的简短理由"
    }
  ]
}

规划原则：
1. 如果近期容量下降，适当减载或维持
2. 优先选择 RIR 偏高的动作加量
3. 中束动作每周总容量目标是渐进超负荷
4. 包含 3-5 个动作，总组数 12-20 组
5. 每个动作的 rationale 必须基于实际数据`

    const result = await callAI({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `今日日期：${context.today}，请生成训练计划。` },
      ],
      temperature: 0.4,
      maxTokens: 2000,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // 尝试解析 JSON
    let plan
    try {
      const jsonStr = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      plan = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({
        error: 'AI 返回格式异常',
        raw: result.content,
      }, { status: 500 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('AI 训练规划失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务端错误' },
      { status: 500 }
    )
  }
}
