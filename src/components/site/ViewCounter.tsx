'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ViewCounterProps {
  slug: string
  initialCount: number
}

export default function ViewCounter({ slug, initialCount }: ViewCounterProps) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    // 空依赖数组确保只执行一次，避免重复计数
    const incrementView = async () => {
      try {
        await supabase.rpc('increment_post_view_count', { post_slug: slug })
        setCount((prev) => prev + 1)
      } catch {
        // 失败时静默处理，不影响页面显示
      }
    }

    incrementView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span className="inline-flex items-center gap-2">
      <Eye className="h-4 w-4" />
      {count} 次阅读
    </span>
  )
}
