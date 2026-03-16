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
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="当前属性"
                  dataKey="A"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-700 flex items-center justify-center mb-4">
                <span className="text-4xl">?</span>
              </div>
              <p>暂无属性数据</p>
              <a href="/dashboard/stats" className="text-blue-400 text-sm hover:underline mt-2">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="平均"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-700" />
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
