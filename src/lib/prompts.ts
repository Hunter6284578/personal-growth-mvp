// AI 分析 Prompt 模板 - 优化版本
// 设计原则：
// 1. 基于记录说话，不空泛
// 2. 不做绝对人格判断
// 3. 给出具体、可执行建议
// 4. 使用数据支撑观点
// 5. 数据不足时明确说明

export interface AnalysisData {
  stats?: {
    physical_score: number
    execution_score: number
    focus_score: number
    emotion_score: number
    social_score: number
    creativity_score: number
    score_date: string
    note?: string
  }[]
  dailyLogs?: {
    log_date: string
    summary?: string
    mood_score?: number
    good_points?: string
    bad_points?: string
    reflection?: string
  }[]
  events?: {
    title: string
    event_date: string
    description?: string
    impact_level?: number
    tags?: string[]
    affected_stats?: string[]
  }[]
  fitness?: {
    record_date: string
    weight?: number
    body_fat?: number
    run_1000m_seconds?: number
    pull_ups?: number
    push_ups?: number
    sleep_hours?: number
  }[]
  blogPosts?: {
    title: string
    summary?: string | null
    content?: string
    created_at: string
    tags?: string[] | null
  }[]
  thoughts?: {
    content: string
    created_at: string
    tags?: string[] | null
  }[]
}

// 系统 Prompt - 定义 AI 角色和行为准则
const SYSTEM_PROMPT = `你是一位个人成长数据分析助手。你的任务是基于用户的真实记录数据，提供客观、具体、可执行的分析和建议。

【核心准则 - 必须遵守】
1. **基于记录说话**：所有结论必须有数据支撑，引用具体日期和数值
2. **拒绝空泛鸡汤**：禁止"相信自己""加油努力""坚持就是胜利"这类无意义鼓励
3. **不做人格判断**：禁止说"你是XX类型的人""你性格XX""你本质上是XX"，只描述观察到的行为模式
4. **具体可执行**：每条建议都要明确"做什么""做多少""什么时候做"
5. **证据不足时承认**：数据不够就明说"基于现有数据无法得出结论"

【输出格式 - 必须遵守】
使用 Markdown 格式，结构清晰，适当使用 emoji 增加可读性。
每个主要部分必须有内容，不能为空。

【数据引用规范 - 必须遵守】
- 引用具体日期："1月15日的记录显示..."
- 引用具体数值："心情指数从5提升到8"
- 对比时使用百分比："比上周提升20%"
- 不确定时说明："基于X条记录观察到..."

【禁止内容】
- ❌ 心理学标签（如"你是完美主义者"）
- ❌ 性格归因（如"因为你内向，所以..."）
- ❌ 空泛鼓励（如"相信你能行"）
- ❌ 绝对化判断（如"你总是...""你从不..."）
- ❌ 重复表述（同样的意思不要重复说）`;

// 辅助函数：格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 辅助函数：计算平均值
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

// Weekly 分析 - 最近7天总结
export function buildWeeklyPrompt(data: AnalysisData): string {
  const { stats = [], dailyLogs = [], events = [], fitness = [] } = data;
  
  // 计算统计数据
  const avgMood = dailyLogs.length > 0 && dailyLogs.some(l => l.mood_score)
    ? calculateAverage(dailyLogs.filter(l => l.mood_score).map(l => l.mood_score!))
    : null;
  
  const moodTrend = dailyLogs.length >= 2
    ? (() => {
        const first = dailyLogs[dailyLogs.length - 1].mood_score;
        const last = dailyLogs[0].mood_score;
        if (first && last) {
          return last > first ? '上升' : last < first ? '下降' : '平稳';
        }
        return null;
      })()
    : null;
  
  // 格式化数据文本
  const statsText = stats.length > 0
    ? stats.map(s => {
        const avg = Math.round((s.physical_score + s.execution_score + s.focus_score + s.emotion_score + s.social_score + s.creativity_score) / 6);
        return `- ${formatDate(s.score_date)}: 综合${avg} | 体质${s.physical_score} 执行${s.execution_score} 专注${s.focus_score} 情绪${s.emotion_score} 社交${s.social_score} 创造${s.creativity_score}${s.note ? ` (${s.note})` : ''}`;
      }).join('\n')
    : '暂无属性评分数据';
  
  const logsText = dailyLogs.length > 0
    ? dailyLogs.map(l => {
        let text = `- ${formatDate(l.log_date)}${l.mood_score ? `: 心情${l.mood_score}/10` : ''}`;
        if (l.summary) text += ` | ${l.summary}`;
        return text;
      }).join('\n')
    : '暂无每日记录';
  
  const eventsText = events.length > 0
    ? events.map(e => 
        `- ${formatDate(e.event_date)}: ${e.title}${e.impact_level ? ` (影响度${e.impact_level}/10)` : ''}`
      ).join('\n')
    : '暂无重要事件';
  
  const fitnessText = fitness.length > 0
    ? fitness.map(f => 
        `- ${formatDate(f.record_date)}: 体重${f.weight}kg${f.sleep_hours ? ` 睡眠${f.sleep_hours}h` : ''}${f.run_1000m_seconds ? ` 跑步${Math.floor(f.run_1000m_seconds/60)}'${f.run_1000m_seconds%60}"` : ''}`
      ).join('\n')
    : '暂无体测数据';
  
  // 数据充足度评估
  const dataQuality = dailyLogs.length >= 5 ? '充足' : dailyLogs.length >= 3 ? '一般' : '不足';

  return `${SYSTEM_PROMPT}

请基于以下最近7天的数据生成周报分析：

【数据概览】
- 记录天数：${dailyLogs.length}天
- 属性评分次数：${stats.length}次
- 重要事件：${events.length}个
- 数据充足度：${dataQuality}
${avgMood ? `- 平均心情指数：${avgMood}/10` : ''}
${moodTrend ? `- 心情趋势：${moodTrend}` : ''}

【属性评分记录】
${statsText}

【每日记录】
${logsText}

【重要事件】
${eventsText}

【体测数据】
${fitnessText}

【分析要求 - 必须遵守】
请按以下结构输出，每个部分必须有具体内容：

## 📊 数据概览
- 基于${dailyLogs.length}天记录和${stats.length}次评分
- 统计各维度平均值${stats.length > 0 ? '（引用具体数值）' : '（数据不足，跳过）'}
${dailyLogs.length >= 3 ? '- 指出最显著的变化（引用具体日期和数值）' : '- 数据不足，无法分析趋势'}

## ✅ 本周亮点
${dailyLogs.length > 0 ? '- 基于记录的具体积极行为（引用具体日期）' : '- 暂无足够数据'}
- 不要空泛表扬，只说观察到的行为

## ⚠️ 关注信号
${dailyLogs.length >= 3 ? '- 基于数据的潜在问题（引用具体日期）' : '- 数据不足，无法判断'}
- 只描述观察，不贴标签

## 🎯 下周行动建议
给出3-5条具体、可执行的建议：
- ❌ 不要说"多运动""保持好心情"
- ✅ 要说"本周三、五各进行30分钟有氧运动，目标心率130+"
- 每条建议都要有明确的衡量标准和时间点

## 💡 数据质量反馈
- 当前数据是否足够支撑分析？
- 建议未来记录哪些数据会更有价值？

【重要提醒】
如果数据不足（少于3天记录），请明确说明"基于现有数据无法得出可靠结论"，并给出记录建议。`;
}


// 属性评估 Prompt
export function buildAttributeEvalPrompt(data: AnalysisData): string {
  const { stats = [], dailyLogs = [], events = [], fitness = [], blogPosts = [], thoughts = [] } = data;

  const logsText = dailyLogs.length > 0
    ? dailyLogs.map(l => `- ${formatDate(l.log_date)}: ${l.summary || ''} ${l.reflection || ''}`).join('\n')
    : '暂无每日记录';

  const eventsText = events.length > 0
    ? events.map(e => `- ${formatDate(e.event_date)}: ${e.title} (${e.description || ''})`).join('\n')
    : '暂无重要事件';

  const fitnessText = fitness.length > 0
    ? fitness.map(f => `- ${formatDate(f.record_date)}: 体重${f.weight}kg 运动表现: ${f.run_1000m_seconds ? `1000m ${f.run_1000m_seconds}s` : ''} ${f.pull_ups ? `引体${f.pull_ups}` : ''}`).join('\n')
    : '暂无体测数据';

  const blogsText = blogPosts.length > 0
    ? blogPosts.map(b => `- ${formatDate(b.created_at)}: [标题]${b.title} [摘要]${b.summary || ''} [内容片段]${b.content?.slice(0, 200)}...`).join('\n')
    : '暂无博客文章';

  const thoughtsText = thoughts.length > 0
    ? thoughts.map(t => `- ${formatDate(t.created_at)}: ${t.content}`).join('\n')
    : '暂无想法记录';

  const previousStats = stats.length > 0
    ? `最近一次评分 (${formatDate(stats[0].score_date)}): 体质${stats[0].physical_score} 执行${stats[0].execution_score} 专注${stats[0].focus_score} 情绪${stats[0].emotion_score} 社交${stats[0].social_score} 创造${stats[0].creativity_score}`
    : '暂无历史评分';

  return `${SYSTEM_PROMPT}

请基于用户最近的记录（每日日志、事件、体测、博客、想法），对用户的六维属性进行客观评估。

【参考数据】
[历史评分]
${previousStats}

[每日记录]
${logsText}

[重要事件]
${eventsText}

[体测数据]
${fitnessText}

[博客文章]
${blogsText}

[想法/闪念]
${thoughtsText}

【评估任务】
请分析上述数据，给出各项属性的评分（0-100分）和简短评价。
这名用户是一名大二学生，你需要结合大学生的生活特点进行评估。
评分标准：
- 身体素质：基于体测数据、运动频率、睡眠质量
- 执行力：基于每日计划完成情况、目标达成
- 专注力：基于深度工作记录、学习时长
- 情绪稳定性：基于心情指数、情绪记录
- 社交状态：基于社交活动、人际互动记录
- 创造力：基于博客产出、想法数量和质量

【输出格式 - 必须严格遵守】
请仅返回一个 JSON 对象，不要包含 markdown 代码块标记或其他文字。格式如下：
{
  "physical_score": number,
  "execution_score": number,
  "focus_score": number,
  "emotion_score": number,
  "social_score": number,
  "creativity_score": number,
  "note": "string (100字以内的综合评价，解释评分依据)"
}`;
}

// Event 分析 - 单条事件分析
export function buildEventPrompt(event: NonNullable<AnalysisData['events']>[number], context: AnalysisData): string {
  const { stats = [], dailyLogs = [] } = context;
  
  // 找到事件前后的数据（各最多3条）
  const eventDate = new Date(event.event_date);
  const beforeStats = stats.filter(s => new Date(s.score_date) <= eventDate).slice(0, 3);
  const afterStats = stats.filter(s => new Date(s.score_date) > eventDate).slice(0, 3);
  const beforeLogs = dailyLogs.filter(l => new Date(l.log_date) <= eventDate).slice(0, 3);
  const afterLogs = dailyLogs.filter(l => new Date(l.log_date) > eventDate).slice(0, 3);
  
  const hasBeforeData = beforeStats.length > 0 || beforeLogs.length > 0;
  const hasAfterData = afterStats.length > 0 || afterLogs.length > 0;
  
  const beforeStatsText = beforeStats.length > 0
    ? beforeStats.map(s => {
        const avg = Math.round((s.physical_score + s.execution_score + s.focus_score + s.emotion_score + s.social_score + s.creativity_score) / 6);
        return `- ${formatDate(s.score_date)}: 综合${avg}`;
      }).join('\n')
    : '无事件前属性数据';
  
  const afterStatsText = afterStats.length > 0
    ? afterStats.map(s => {
        const avg = Math.round((s.physical_score + s.execution_score + s.focus_score + s.emotion_score + s.social_score + s.creativity_score) / 6);
        return `- ${formatDate(s.score_date)}: 综合${avg}`;
      }).join('\n')
    : '无事件后属性数据';
  
  const beforeLogsText = beforeLogs.length > 0
    ? beforeLogs.map(l => `- ${formatDate(l.log_date)}: 心情${l.mood_score || '?'}/10${l.summary ? ` | ${l.summary}` : ''}`).join('\n')
    : '无事件前记录';
  
  const afterLogsText = afterLogs.length > 0
    ? afterLogs.map(l => `- ${formatDate(l.log_date)}: 心情${l.mood_score || '?'}/10${l.summary ? ` | ${l.summary}` : ''}`).join('\n')
    : '无事件后记录';

  return `${SYSTEM_PROMPT}

请分析以下事件的影响：

【事件信息】
- 标题：${event.title}
- 日期：${formatDate(event.event_date)}
- 影响度：${event.impact_level || '未评分'}/10
- 描述：${event.description || '无描述'}
- 标签：${event.tags?.join(', ') || '无'}
- 影响属性：${event.affected_stats?.join(', ') || '未指定'}

【数据可用性】
- 事件前数据：${hasBeforeData ? `${beforeStats.length}条评分 + ${beforeLogs.length}条记录` : '不足'}
- 事件后数据：${hasAfterData ? `${afterStats.length}条评分 + ${afterLogs.length}条记录` : '不足'}

【事件前数据（最近3条）】
属性评分：
${beforeStatsText}

每日记录：
${beforeLogsText}

【事件后数据（最近3条）】
属性评分：
${afterStatsText}

每日记录：
${afterLogsText}

【分析要求 - 必须遵守】
请按以下结构输出：

## 🎯 事件概述
简要描述事件内容和用户记录的影响度评分

## 📈 数据变化
${hasBeforeData && hasAfterData 
  ? '对比事件前后的数据变化（引用具体数值）：\n- 综合评分变化：事件前X → 事件后Y\n- 心情指数变化：事件前X → 事件后Y'
  : '⚠️ 数据不足，无法准确分析变化\n- 建议：记录更多事件前后的数据以获得更准确分析'}

## 💭 可能的影响分析
基于事件类型和影响度，分析可能产生的：
- 短期影响（1-3天）
- 中期影响（1-2周）
${!hasBeforeData || !hasAfterData ? '- 注意：基于有限数据的推测' : ''}

## 🎯 行动建议
针对这类事件，给出具体建议：
- 如果是积极事件：如何延续正面影响？（具体做法）
- 如果是挑战事件：如何恢复和应对？（具体步骤）
- 具体行动步骤（可衡量、可执行）

## 📝 记录建议
未来遇到类似事件，建议记录哪些维度的数据来更好评估影响？

【重要提醒】
如果数据不足，请明确说明"基于有限数据"，不要做出确定性的判断。`;
}

// Profile 分析 - 30天人物画像
export function buildProfilePrompt(data: AnalysisData): string {
  const { stats = [], dailyLogs = [], events = [], fitness = [] } = data;
  
  // 计算统计数据
  const avgMood = dailyLogs.length > 0 && dailyLogs.some(l => l.mood_score)
    ? calculateAverage(dailyLogs.filter(l => l.mood_score).map(l => l.mood_score!))
    : null;
  
  const recordConsistency = Math.round((dailyLogs.length / 30) * 100);
  
  const avgStats = stats.length > 0
    ? {
        physical: calculateAverage(stats.map(s => s.physical_score)),
        execution: calculateAverage(stats.map(s => s.execution_score)),
        focus: calculateAverage(stats.map(s => s.focus_score)),
        emotion: calculateAverage(stats.map(s => s.emotion_score)),
        social: calculateAverage(stats.map(s => s.social_score)),
        creativity: calculateAverage(stats.map(s => s.creativity_score)),
      }
    : null;
  
  const statsText = avgStats
    ? `平均六维评分：
- 身体素质：${avgStats.physical}
- 执行力：${avgStats.execution}
- 专注力：${avgStats.focus}
- 情绪稳定性：${avgStats.emotion}
- 社交状态：${avgStats.social}
- 创造力：${avgStats.creativity}

评分记录次数：${stats.length}次`
    : '暂无属性评分数据';
  
  const logsText = dailyLogs.length > 0
    ? `记录天数：${dailyLogs.length}天（覆盖率${recordConsistency}%）
${avgMood ? `平均心情指数：${avgMood}/10` : ''}
记录一致性：${dailyLogs.length >= 20 ? '高' : dailyLogs.length >= 10 ? '中' : '低'}`
    : '暂无每日记录';
  
  const eventsText = events.length > 0
    ? `记录事件数：${events.length}个
高影响事件（8+分）：${events.filter(e => (e.impact_level || 0) >= 8).length}个
主要事件类型：${[...new Set(events.flatMap(e => e.tags || []))].slice(0, 3).join(', ') || '未分类'}`
    : '暂无重要事件记录';

  // 数据充足度评估
  const hasEnoughData = dailyLogs.length >= 7;
  const hasStatsData = stats.length >= 2;

  return `${SYSTEM_PROMPT}

请基于以下最近30天的数据生成人物画像分析：

【数据概览】
- 记录天数：${dailyLogs.length}/30天（${recordConsistency}%）
- 属性评分：${stats.length}次
- 重要事件：${events.length}个
- 数据充足度：${hasEnoughData ? '充足' : '不足'}

【属性评分统计】
${statsText}

【每日记录统计】
${logsText}

【事件统计】
${eventsText}

【重要提醒】
⚠️ 这不是人格测评，而是基于你主动记录的数据的行为观察。
⚠️ 避免说"你是XX类型的人"，而是说"数据显示你在XX方面呈现XX模式"。
⚠️ 数据不足时明确承认，不要强行分析。

【分析要求 - 必须遵守】
请按以下结构输出：

## 📊 数据画像概览
基于30天数据的整体观察：
- 记录完整度：${recordConsistency}%
- 各维度平均水平${hasStatsData ? '（引用具体数值）' : '（数据不足）'}
- 最活跃的记录维度

## 🎯 行为模式观察（基于数据，不做人格判断）
${hasEnoughData 
  ? '从记录中观察到的行为倾向：\n- 记录习惯：是否规律？什么时间段记录最多？\n- 情绪模式：波动大还是稳定？有无周期性？\n- 事件响应：对高影响事件的记录是否及时？'
  : '⚠️ 数据不足（少于7天），无法可靠分析行为模式'}

## ⚖️ 平衡性分析
${hasStatsData 
  ? '六维属性的分布情况：\n- 哪些维度记录较充分？\n- 哪些维度可能关注不足？\n- 各维度之间的关联（如有数据支撑）'
  : '⚠️ 属性评分数据不足，无法分析平衡性'}

## 🚀 下阶段建议
基于当前数据情况，给出30天行动计划：
1. **记录优化**：如何提高记录完整度？（具体方法）
2. **维度补强**：建议关注哪个维度？（具体理由）
3. **具体目标**：设定可衡量的目标（如"连续记录21天""每周评估2次属性"）
4. **习惯养成**：将记录融入日常的具体方法

## 💡 数据价值提示
- 你的记录数据已经能说明什么？
- 未来记录什么会更有价值？
- 当前数据质量评估

【重要提醒】
${!hasEnoughData 
  ? '⚠️ 当前数据不足（少于7天记录），以上分析仅供参考。建议继续记录以获得更准确的画像。' 
  : '数据充足，分析结果可信度较高。'}

【禁止内容】
- ❌ "你是XX类型的人"
- ❌ "你的性格是XX"
- ❌ "本质上你是XX"
- ❌ 任何心理学标签`;
}

// 根据分析类型选择对应的 prompt 构建函数
export function buildPrompt(type: 'weekly' | 'event' | 'profile' | 'attribute_eval', data: AnalysisData, targetEvent?: NonNullable<AnalysisData['events']>[number]): string {
  if (type === 'weekly') {
    return buildWeeklyPrompt(data);
  } else if (type === 'event') {
    if (!targetEvent) throw new Error('Event analysis requires a target event');
    return buildEventPrompt(targetEvent, data);
  } else if (type === 'profile') {
    return buildProfilePrompt(data);
  } else {
    return buildAttributeEvalPrompt(data);
  }
}
