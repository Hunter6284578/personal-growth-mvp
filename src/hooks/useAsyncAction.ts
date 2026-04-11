'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/Toast'

interface AsyncActionOptions {
  successMessage?: string
  errorMessage?: string
}

/**
 * 封装异步操作的 loading/error/toast 逻辑
 * 消除每个页面重复的 try/catch + setSaving + toast 模式
 */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const execute = useCallback(async <T>(
    action: () => Promise<T>,
    options: AsyncActionOptions = {}
  ): Promise<T | null> => {
    setLoading(true)
    try {
      const result = await action()
      if (options.successMessage) {
        toast(options.successMessage, 'success')
      }
      return result
    } catch (error) {
      console.error('Async action failed:', error)
      toast(options.errorMessage || '操作失败，请重试', 'error')
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  return { loading, execute }
}

/**
 * 封装数据加载的 loading 状态
 */
export function useDataLoader<T>() {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (loader: () => Promise<T>) => {
    setLoading(true)
    try {
      const result = await loader()
      setData(result)
      return result
    } catch (error) {
      console.error('Data loading failed:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, setData, load }
}
