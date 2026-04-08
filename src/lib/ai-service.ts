export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIRequest {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: string
}

export type AIProvider = 'openai' | 'deepseek' | 'gemini' | 'openai-compatible'

interface ProviderDefaults {
  url: string
  model: string
}

const providerDefaults: Record<AIProvider, ProviderDefaults> = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-2.5-flash',
  },
  'openai-compatible': {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
  },
}

function getAIConfig() {
  const provider = (process.env.AI_PROVIDER as AIProvider) || 'deepseek'
  const apiKey = process.env.AI_API_KEY
  const apiUrl = process.env.AI_BASE_URL || process.env.AI_API_URL
  const model = process.env.AI_MODEL

  if (!apiKey) {
    throw new Error('AI_API_KEY 未配置')
  }

  return { provider, apiKey, apiUrl, model }
}

function normalizeUsage(data: Record<string, unknown>) {
  const usage = data.usage as
    | {
        prompt_tokens?: number
        completion_tokens?: number
        total_tokens?: number
      }
    | undefined

  if (!usage) {
    return undefined
  }

  return {
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
    totalTokens: usage.total_tokens ?? 0,
  }
}

async function requestAI(request: AIRequest, stream: boolean) {
  const config = getAIConfig()
  const defaults = providerDefaults[config.provider]
  const url = config.apiUrl || defaults.url
  const model = config.model || defaults.model

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.4,
      max_tokens: request.maxTokens ?? 1800,
      stream,
    }),
  })
}

export async function callAI(request: AIRequest): Promise<AIResponse> {
  try {
    const response = await requestAI(request, false)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI API 错误: ${errorText}`)
    }

    const data = (await response.json()) as Record<string, unknown>
    const choice = (data.choices as Array<{ message?: { content?: string } }> | undefined)?.[0]
    const output = choice?.message?.content

    return {
      content: output || '',
      usage: normalizeUsage(data),
    }
  } catch (error) {
    console.error('AI 调用失败:', error)
    return {
      content: '',
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

export async function* callAIStream(request: AIRequest): AsyncGenerator<string, void, unknown> {
  const response = await requestAI(request, true)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI API 错误: ${errorText}`)
  }

  if (!response.body) {
    throw new Error('AI API 未返回可读流')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data:')) {
        continue
      }

      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') {
        return
      }

      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>
        }
        const content = parsed.choices?.[0]?.delta?.content
        if (content) {
          yield content
        }
      } catch {
        continue
      }
    }
  }
}
