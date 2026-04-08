type FitnessGoal = 'muscle_gain' | 'fat_loss' | 'maintenance' | 'strength'

interface AdvisorSet {
  reps: number
  weight: number
  rir: number
  volume: number
}

interface AdvisorLog {
  date: string
  exerciseName: string
  targetMuscle: string
  totalSets: number
  totalVolume: number
  note: string | null
  sets: AdvisorSet[]
}

interface DailyHealthSnapshot {
  record_date: string
  weight: number | null
  sleep_hours: number | null
  exercise_minutes: number | null
  note: string | null
}

interface FitnessAdvisorPromptOptions {
  goal: FitnessGoal
  userNote?: string
  logs: AdvisorLog[]
  dailyHealth: DailyHealthSnapshot[]
}

const goalLabels: Record<FitnessGoal, string> = {
  muscle_gain: '增肌',
  fat_loss: '减脂',
  maintenance: '维持',
  strength: '提高力量',
}

function buildWeeklySummary(logs: AdvisorLog[]) {
  const totalSets = logs.reduce((sum, log) => sum + log.totalSets, 0)
  const totalVolume = logs.reduce((sum, log) => sum + log.totalVolume, 0)
  const trainingDays = new Set(logs.map((log) => log.date)).size

  const muscleCount = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.targetMuscle] = (acc[log.targetMuscle] ?? 0) + log.totalSets
    return acc
  }, {})

  return {
    totalSets,
    totalVolume,
    trainingDays,
    muscleCount,
  }
}

export function buildFitnessAdvisorPrompt({
  goal,
  userNote,
  logs,
  dailyHealth,
}: FitnessAdvisorPromptOptions) {
  const summary = buildWeeklySummary(logs)

  return `你是一个训练记录分析助手。请基于用户最近 14 天的训练与健康数据，输出克制、实用、可执行的训练建议。

用户目标：${goalLabels[goal]}
用户补充说明：${userNote?.trim() || '无额外备注'}

最近训练摘要：
- 训练天数：${summary.trainingDays}
- 总组数：${summary.totalSets}
- 总容量：${summary.totalVolume}
- 主要肌群分布：${JSON.stringify(summary.muscleCount, null, 2)}

训练明细：
${JSON.stringify(logs, null, 2)}

健康补充数据：
${JSON.stringify(dailyHealth, null, 2)}

输出要求：
1. 使用 Markdown 输出
2. 只给训练建议，不做医疗诊断
3. 必须包含以下小节：
   - ## 本周训练总结
   - ## 恢复与频率提醒
   - ## 负重与动作建议
   - ## 饮食与恢复建议
   - ## 注意事项
4. 每条建议尽量引用给定数据，不要空泛
5. 语气克制，不要鸡汤
6. 在最后追加一句：仅供参考，不替代专业教练或医疗建议。
`
}
