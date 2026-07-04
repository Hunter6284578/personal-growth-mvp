/**
 * AI 客户端 — 本地 Ollama (OpenAI 兼容协议)
 *
 * 配置：
 *   - AI_BASE_URL: Ollama 服务地址，默认 http://127.0.0.1:11434/v1
 *   - AI_API_KEY:  Ollama 不校验 key，传任意非空字符串即可（默认 "ollama"）
 *   - AI_MODEL:    模型名，默认 qwen2.5:1.5b
 *   - AI_TIMEOUT_MS: 单次请求超时（毫秒），默认 30000
 *
 * 使用须知：
 *   1. 本地 Ollama 跑在 127.0.0.1:11434
 *   2. 部署到 ECS 时此模块不可用 — 调用会因 ECONNREFUSED 失败
 *   3. 所有错误都以抛出 Error 的形式返回，调用方需 try/catch
 */

const BASE_URL = process.env.AI_BASE_URL || 'http://127.0.0.1:11434/v1'
const API_KEY = process.env.AI_API_KEY || 'ollama'
const MODEL = process.env.AI_MODEL || 'qwen2.5:1.5b'
const TIMEOUT_MS = Number.parseInt(process.env.AI_TIMEOUT_MS || '30000', 10)

// OpenAI 兼容的 chat message 类型
export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatOptions {
  /** 覆盖默认模型 */
  model?: string
  /** 温度，0-2，默认 0.7 */
  temperature?: number
  /** 最大输出 tokens，默认 1024 */
  maxTokens?: number
  /** 是否流式输出（SSE），默认 false */
  stream?: boolean
  /** 超时（毫秒），默认 AI_TIMEOUT_MS */
  timeoutMs?: number
}

export interface ChatResult {
  content: string
  model: string
  /** 原始响应，便于调试 */
  raw: unknown
}

/**
 * 调用 Ollama 聊天补全（OpenAI 兼容协议）
 *
 * @example
 *   const r = await chatCompletion([
 *     { role: 'system', content: '你是助手' },
 *     { role: 'user', content: '你好' },
 *   ])
 *   console.log(r.content)
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatResult> {
  const model = options.model || MODEL
  const body = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
    stream: Boolean(options.stream),
  }

  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? TIMEOUT_MS,
  )

  let resp: Response
  try {
    resp = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`AI 请求超时（>${options.timeoutMs ?? TIMEOUT_MS}ms）`)
    }
    // 典型：ECS 部署时连不上 127.0.0.1:11434
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`AI 服务不可达（${BASE_URL}）：${msg}`)
  }
  clearTimeout(timeout)

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`AI 返回 ${resp.status}：${text.slice(0, 200)}`)
  }

  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[]
    model?: string
  }
  const content = data.choices?.[0]?.message?.content ?? ''
  return {
    content,
    model: data.model || model,
    raw: data,
  }
}

/**
 * 流式调用：每个 chunk 回调一次
 *
 * @example
 *   await streamChat(messages, {
 *     onDelta: (chunk) => process.stdout.write(chunk),
 *   })
 */
export async function streamChat(
  messages: ChatMessage[],
  onDelta: (delta: string) => void,
  options: ChatOptions = {},
): Promise<void> {
  const model = options.model || MODEL
  const body = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
    stream: true,
  }

  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? TIMEOUT_MS,
  )

  let resp: Response
  try {
    resp = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeout)
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`AI 服务不可达（${BASE_URL}）：${msg}`)
  }
  clearTimeout(timeout)

  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => '')
    throw new Error(`AI 返回 ${resp.status}：${text.slice(0, 200)}`)
  }

  // 解析 SSE：每行 "data: {...}"
  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') return
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[]
        }
        const delta = json.choices?.[0]?.delta?.content
        if (delta) onDelta(delta)
      } catch {
        // 忽略解析失败的 chunk
      }
    }
  }
}

/**
 * 健康检查：返回 Ollama 是否可达 + 当前模型列表
 *
 * 在 API route 中用：
 *   const status = await aiHealth()
 *   if (!status.ok) return NextResponse.json({ status: 'down' }, { status: 503 })
 */
export interface AiHealth {
  ok: boolean
  baseUrl: string
  model: string
  error?: string
  models?: string[]
}

export async function aiHealth(): Promise<AiHealth> {
  try {
    const resp = await fetch(`${BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      signal: AbortSignal.timeout(5000),
    })
    if (!resp.ok) {
      return { ok: false, baseUrl: BASE_URL, model: MODEL, error: `HTTP ${resp.status}` }
    }
    const data = (await resp.json()) as { data?: { id: string }[] }
    const models = (data.data || []).map((m) => m.id)
    return { ok: true, baseUrl: BASE_URL, model: MODEL, models }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, baseUrl: BASE_URL, model: MODEL, error: msg }
  }
}
