'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * 极简页面访问埋点：路由变化时 POST 到 /api/track
 * - 只统计页面访问（不统计静态资源）
 * - 失败静默，不影响用户体验
 * - 不发个人识别信息（IP 已在服务端被 hash 后才入库）
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    if (lastPath.current === pathname) return
    lastPath.current = pathname

    // 用 sendBeacon：导航/关闭页面也能发出去
    if (typeof navigator === 'undefined' || !navigator.sendBeacon) return

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || '',
    })
    try {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/track', blob)
    } catch {
      // 兜底 fetch
      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }
  }, [pathname])

  return null
}
