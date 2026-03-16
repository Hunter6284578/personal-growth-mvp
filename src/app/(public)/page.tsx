import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ArrowRight, BookOpen, Lightbulb, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-white mb-6">
          记录成长，成为更好的自己
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          通过数据追踪个人发展，记录每日进步，分析成长轨迹，
          让每一次努力都看得见。
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/blog">
            <Button variant="primary" size="lg">
              阅读博客
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">
              了解更多
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card title="博客文章" subtitle="分享学习与思考">
          <BookOpen className="w-12 h-12 text-blue-400 mb-4" />
          <p className="text-gray-400">
            记录技术学习、读书笔记和生活感悟，沉淀知识体系。
          </p>
        </Card>
        <Card title="灵感想法" subtitle="捕捉瞬间的火花">
          <Lightbulb className="w-12 h-12 text-yellow-400 mb-4" />
          <p className="text-gray-400">
            随时记录闪现的想法和灵感，不让任何创意溜走。
          </p>
        </Card>
        <Card title="成长追踪" subtitle="数据驱动进步">
          <TrendingUp className="w-12 h-12 text-green-400 mb-4" />
          <p className="text-gray-400">
            通过六大属性维度，量化个人成长，可视化进步轨迹。
          </p>
        </Card>
      </section>

      {/* Stats Preview Section */}
      <section className="bg-gray-900 rounded-2xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              游戏化的人物面板
            </h2>
            <p className="text-gray-400 mb-6">
              将个人成长游戏化，通过六大属性维度全面评估自己：
              身体素质、执行力、专注力、情绪稳定性、社交状态、创造力。
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                每日记录，追踪习惯养成
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                体测数据，关注身体健康
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                AI 分析，获取成长建议
              </li>
            </ul>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="space-y-4">
              {[
                { label: '身体素质', value: 75, color: 'bg-red-500' },
                { label: '执行力', value: 82, color: 'bg-blue-500' },
                { label: '专注力', value: 68, color: 'bg-green-500' },
                { label: '情绪稳定', value: 85, color: 'bg-yellow-500' },
                { label: '社交状态', value: 70, color: 'bg-purple-500' },
                { label: '创造力', value: 78, color: 'bg-pink-500' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{stat.label}</span>
                    <span className="text-white">{stat.value}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stat.color} rounded-full transition-all`}
                      style={{ width: `${stat.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
