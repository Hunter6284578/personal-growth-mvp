import { Card } from '@/components/ui/Card'
import { User, Mail, Github, Twitter } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-32 h-32 bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
          <User className="w-16 h-16 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">关于我</h1>
        <p className="text-gray-400">一个追求持续成长的普通人</p>
      </div>

      <div className="space-y-6">
        <Card title="个人简介">
          <p className="text-gray-300 leading-relaxed">
            欢迎来到我的个人成长网站。这里记录着我的学习历程、思考感悟和成长轨迹。
            我相信通过持续的记录和反思，可以更好地认识自己，发现进步的空间。
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            这个网站的核心概念是&quot;人物面板&quot;——将自己抽象成一个游戏角色，
            通过六大属性维度来量化和追踪个人成长。这不仅让成长过程变得可视化，
            也增添了一些趣味性。
          </p>
        </Card>

        <Card title="六大属性">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: '身体素质', desc: '身体健康、体能状况、运动能力', color: 'text-red-400' },
              { name: '执行力', desc: '行动力、任务完成度、拖延程度', color: 'text-blue-400' },
              { name: '专注力', desc: '注意力集中、深度工作时间', color: 'text-green-400' },
              { name: '情绪稳定性', desc: '情绪管理、压力应对、心态平和', color: 'text-yellow-400' },
              { name: '社交状态', desc: '人际关系、社交活动、沟通能力', color: 'text-purple-400' },
              { name: '创造力', desc: '创新思维、产出质量、学习速度', color: 'text-pink-400' },
            ].map((attr) => (
              <div key={attr.name} className="bg-gray-900 rounded-lg p-4">
                <h3 className={`font-semibold ${attr.color} mb-1`}>{attr.name}</h3>
                <p className="text-sm text-gray-400">{attr.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="联系方式">
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:996717215@qq.com"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              996717215@qq.com
            </a>
            <a
              href="https://github.com/Hunter6284578"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5 mr-2" />
              GitHub
            </a>
            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5 mr-2" />
              Twitter
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
