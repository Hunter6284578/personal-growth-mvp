// AI 服务封装 - 支持多种模型提供商

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

// 支持的 AI 提供商
export type AIProvider = 'openai' | 'deepseek' | 'zhipu' | 'siliconflow'

// 获取环境变量中的配置
const getAIConfig = () => {
  const provider = (process.env.AI_PROVIDER as AIProvider) || 'deepseek'
  const apiKey = process.env.AI_API_KEY
  const apiUrl = process.env.AI_API_URL
  const model = process.env.AI_MODEL

  if (!apiKey) {
    throw new Error('AI_API_KEY 未配置')
  }

  return { provider, apiKey, apiUrl, model }
}

// 获取默认模型和 API URL
const getProviderDefaults = (provider: AIProvider): { url: string; model: string } => {
  switch (provider) {
    case 'openai':
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4o-mini'
      }
    case 'deepseek':
      return {
        url: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-chat'
      }
    case 'zhipu':
      return {
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: 'glm-4-flash'
      }
    case 'siliconflow':
      return {
        url: 'https://api.siliconflow.cn/v1/chat/completions',
        model: 'deepseek-ai/DeepSeek-V2.5'
      }
    default:
      return {
        url: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-chat'
      }
  }
}

// 主调用函数
export async function callAI(request: AIRequest): Promise<AIResponse> {
  try {
    const config = getAIConfig()
    const defaults = getProviderDefaults(config.provider)
    
    const url = config.apiUrl || defaults.url
    const model = config.model || defaults.model

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2000,
        stream: false
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`AI API 错误: ${error}`)
    }

    const data = await response.json()

    // 统一不同提供商的响应格式
    return {
      content: data.choices?.[0]?.message?.content || data.output?.text || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined
    }
  } catch (error) {
    console.error('AI 调用失败:', error)
    return {
      content: '',
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 流式调用（可选，用于后续扩展）
export async function* callAIStream(request: AIRequest): AsyncGenerator<string, void, unknown> {
  // 流式实现留作后续扩展
  const response = await callAI(request)
  if (response.error) {
    throw new Error(response.error)
  }
  yield response.content
}
