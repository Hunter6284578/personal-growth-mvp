'use client'

import Link from 'next/link'

interface DailyPoint {
  day: string
  total: number
}

interface TopPath {
  path: string
  count: number
}

export function AnalyticsView({
  daily,
  total,
  today,
  yesterday,
  topPaths,
  error,
}: {
  daily: DailyPoint[]
  total: number
  today: number
  yesterday: number
  topPaths: TopPath[]
  error: string | null
}) {
  const max = Math.max(1, ...daily.map((d) => d.total))
  const trend =
    yesterday === 0
      ? today > 0
        ? '+∞%'
        : '0%'
      : `${(((today - yesterday) / yesterday) * 100).toFixed(0)}%`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">网站统计</h1>
        <p className="text-sm opacity-70 mt-1">
          数据基于 Supabase <code>page_views</code> 表 / 客户端 <code>/api/track</code> 采集
        </p>
      </div>

      {error ? (
        <div className="border border-red-500/40 bg-red-500/10 rounded-md p-3 text-sm">
          加载失败：{error}
          <p className="mt-2 opacity-80">
            请确认已在 Supabase 执行 [007_page_views.sql](file:///d:/个人网页/personal-growth-mvp/supabase/migrations/007_page_views.sql)
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="今日访问" value={today.toLocaleString()} />
        <StatCard
          label="昨日访问"
          value={yesterday.toLocaleString()}
          sub={yesterday === 0 ? '昨日无数据' : null}
        />
        <StatCard
          label="30 天总访问"
          value={total.toLocaleString()}
          sub={`较昨日 ${trend}`}
        />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">最近 30 天访问趋势</h2>
        <div className="border rounded-lg p-4 bg-[var(--card)]">
          {daily.length === 0 ? (
            <div className="text-sm opacity-60 py-8 text-center">
              暂无数据。访问任一页面后端会自动写入统计。
            </div>
          ) : (
            <div className="flex items-end gap-[2px] h-40">
              {daily.map((d) => {
                const h = (d.total / max) * 100
                return (
                  <div
                    key={d.day}
                    className="flex-1 bg-[var(--accent)] rounded-t hover:opacity-80 transition-opacity relative group"
                    style={{ height: `${Math.max(h, 2)}%` }}
                    title={`${d.day}: ${d.total} 次`}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-black/80 text-white rounded whitespace-nowrap pointer-events-none z-10">
                      {d.day}: {d.total}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {daily.length > 0 ? (
            <div className="flex justify-between text-xs opacity-50 mt-2">
              <span>{daily[0]?.day}</span>
              <span>{daily[daily.length - 1]?.day}</span>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">热门路径（最近 30 天）</h2>
        <div className="border rounded-lg overflow-hidden">
          {topPaths.length === 0 ? (
            <div className="text-sm opacity-60 py-8 text-center">暂无数据</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-secondary)]">
                <tr>
                  <th className="text-left p-3">路径</th>
                  <th className="text-right p-3 w-24">访问数</th>
                </tr>
              </thead>
              <tbody>
                {topPaths.map((p) => (
                  <tr key={p.path} className="border-t">
                    <td className="p-3 font-mono text-xs">{p.path}</td>
                    <td className="p-3 text-right font-semibold">
                      {p.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <div className="text-xs opacity-60">
        <Link href="/dashboard/blog" className="hover:underline">
          ← 返回写作管理
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string | null
}) {
  return (
    <div className="border rounded-lg p-4 bg-[var(--card)]">
      <div className="text-xs opacity-60 uppercase tracking-wide">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {sub ? <div className="text-xs opacity-60 mt-1">{sub}</div> : null}
    </div>
  )
}
