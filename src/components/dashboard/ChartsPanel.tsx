'use client'

import { Card } from '@/components/ui/Card'
import { TrendingUp } from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

interface ChartsPanelProps {
  radarData: Array<{ subject: string; A: number; fullMark: number; color: string }>
  trendData: Array<{ date: string; 平均: number }>
}

export function ChartsPanel({ radarData, trendData }: ChartsPanelProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card title="六维能力" subtitle="当前属性分布">
        <div className="h-[350px] w-full">
          {radarData.some(d => d.A !== 50) ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="var(--dash-border-hover)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="当前属性"
                  dataKey="A"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="var(--accent)"
                  fillOpacity={0.15}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--dash-surface)',
                    border: '1px solid var(--dash-border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
              <div className="w-28 h-28 rounded-full flex items-center justify-center mb-4" style={{ border: '2px dashed var(--dash-border)' }}>
                <span className="text-3xl">?</span>
              </div>
              <p>暂无属性数据</p>
              <a href="/dashboard/stats" className="text-sm mt-2" style={{ color: 'var(--accent)' }}>
                去评估属性 →
              </a>
            </div>
          )}
        </div>
      </Card>

      <Card title="评分趋势" subtitle="最近7次评估">
        <div className="h-[250px] w-full">
          {trendData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--dash-surface)',
                    border: '1px solid var(--dash-border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="平均"
                  stroke="var(--dash-stat-social)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--dash-stat-social)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
              <div className="text-center">
                <TrendingUp className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-dim)' }} />
                <p>数据不足，无法显示趋势</p>
                <p className="text-sm">至少需要2条记录</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
