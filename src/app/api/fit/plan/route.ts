import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { callAI } from '@/lib/ai-service'
import { buildFitnessAdvisorPrompt } from '@/lib/fit/advisor'
import { logError, logInfo } from '@/lib/logger'
import { checkRateLimit, getRequestKey } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30

type FitnessGoal = 'muscle_gain' | 'fat_loss' | 'maintenance' | 'strength'

interface RequestBody {
  goal?: FitnessGoal
  note?: string
}

const MAX_NOTE_LENGTH = 500

function normalizeGoal(goal: string | undefined): FitnessGoal {
  if (goal === 'fat_loss' || goal === 'maintenance' || goal === 'strength') {
    return goal
  }

  return 'muscle_gain'
}

function validateRequest(body: unknown): { data?: RequestBody; error?: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' }
  }

  const { goal, note } = body as Record<string, unknown>
  if (goal && typeof goal !== 'string') {
    return { error: 'goal must be a string.' }
  }
  if (note && typeof note !== 'string') {
    return { error: 'note must be a string.' }
  }
  if (typeof note === 'string' && note.length > MAX_NOTE_LENGTH) {
    return { error: `note must be ${MAX_NOTE_LENGTH} characters or fewer.` }
  }

  return { data: { goal: goal as FitnessGoal | undefined, note: note as string | undefined } }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const limit = checkRateLimit(getRequestKey(ip, 'api-fit-plan'))
    if (limit.limited) {
      return NextResponse.json({ error: '请求过于频繁，请稍后重试' }, { status: 429 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logError(authError ?? new Error('missing user'), { endpoint: '/api/fit/plan', stage: 'auth' })
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    let body: RequestBody = {}
    try {
      const parsedBody = await request.json()
      const validation = validateRequest(parsedBody)
      if (validation.error) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
      body = validation.data ?? {}
    } catch (error) {
      logError(error, { endpoint: '/api/fit/plan', stage: 'parseBody' })
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const goal = normalizeGoal(body.goal)
    const note = body.note?.trim()

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const startDate = twoWeeksAgo.toISOString().slice(0, 10)
    const today = new Date().toISOString().slice(0, 10)

    const [{ data: fitLogs, error: fitError }, { data: dailyHealth, error: healthError }] =
      await Promise.all([
        supabase
          .from('fit_logs')
          .select('date, total_sets, total_volume, note, sets, fit_exercises(name, target_muscle)')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', today)
          .order('date', { ascending: false }),
        supabase
          .from('daily_health')
          .select('record_date, weight, sleep_hours, exercise_minutes, note')
          .eq('user_id', user.id)
          .gte('record_date', startDate)
          .lte('record_date', today)
          .order('record_date', { ascending: false }),
      ])

    if (fitError) {
      throw fitError
    }

    if (healthError) {
      throw healthError
    }

    const logs =
      fitLogs?.map((item) => {
        const exercise = Array.isArray(item.fit_exercises) ? item.fit_exercises[0] : item.fit_exercises
        return {
          date: item.date,
          exerciseName: exercise?.name || '未命名动作',
          targetMuscle: exercise?.target_muscle || '未分类',
          totalSets: item.total_sets,
          totalVolume: item.total_volume,
          note: item.note,
          sets: Array.isArray(item.sets) ? item.sets : [],
        }
      }) ?? []

    const prompt = buildFitnessAdvisorPrompt({
      goal,
      userNote: note,
      logs,
      dailyHealth: dailyHealth ?? [],
    })

    const result = await callAI({
      messages: [
        {
          role: 'system',
          content: '你是训练记录分析助手，只做健身训练和恢复建议，不做医疗诊断。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      maxTokens: 2200,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    const advice = result.content.trim()
    if (!advice) {
      return NextResponse.json({ error: 'AI 未返回有效内容' }, { status: 500 })
    }

    await supabase.from('ai_analyses').insert({
      user_id: user.id,
      analysis_type: 'fitness_advice',
      input_summary: `goal=${goal}; note=${note || 'none'}; logs=${logs.length}; health=${dailyHealth?.length || 0}`,
      result: advice,
    })

    logInfo('fitness advice generated', { endpoint: '/api/fit/plan', userId: user.id, goal })
    return NextResponse.json({
      advice,
      meta: {
        goal,
        logs: logs.length,
        healthEntries: dailyHealth?.length || 0,
      },
    })
  } catch (error) {
    logError(error, { endpoint: '/api/fit/plan', stage: 'uncaught' })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务端错误' },
      { status: 500 }
    )
  }
}
