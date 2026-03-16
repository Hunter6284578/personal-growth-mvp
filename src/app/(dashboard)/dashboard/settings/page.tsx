'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Save } from 'lucide-react'
import { getProfile, upsertProfile } from '@/lib/services'
import { useAuth } from '@/hooks/useAuth'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 表单状态
  const [characterName, setCharacterName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // 加载数据
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    try {
      const data = await getProfile(user.id)
      setProfile(data)
      setCharacterName(data.character_name || '主角')
      setBio(data.bio || '')
      setAvatarUrl(data.avatar_url || '')
    } catch (error) {
      console.error('Error loading profile:', error)
      // 如果还没有资料，使用默认值
      setCharacterName('主角')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      await upsertProfile({
        id: profile?.id,
        user_id: user.id,
        character_name: characterName,
        bio,
        avatar_url: avatarUrl,
      })
      await loadProfile()
      alert('保存成功！')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">设置</h1>
        <p className="text-gray-400 mt-1">管理你的个人资料</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 个人资料 */}
        <Card title="个人资料" subtitle="编辑你的角色信息">
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 头像 */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    头像 URL
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  角色名称 *
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="你的角色名称"
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  个人简介
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="介绍一下你自己..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <Button type="submit" loading={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                保存设置
              </Button>
            </form>
          )}
        </Card>

        {/* 账户信息 */}
        <div className="space-y-6">
          <Card title="账户信息" subtitle="你的登录信息">
            <div className="space-y-4">
              <div className="p-4 bg-gray-900 rounded-lg">
                <p className="text-gray-300 mb-2">邮箱</p>
                <p className="text-sm text-gray-500">{user?.email || '未登录'}</p>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg">
                <p className="text-gray-300 mb-2">密码</p>
                <p className="text-sm text-gray-500 mb-3">
                  定期更改密码可以提高账户安全性
                </p>
                <Button variant="outline" size="sm">
                  修改密码
                </Button>
              </div>
            </div>
          </Card>

          <Card title="数据管理" subtitle="管理你的数据">
            <div className="space-y-3">
              <div className="p-4 bg-gray-900 rounded-lg">
                <p className="text-gray-300 mb-2">导出数据</p>
                <p className="text-sm text-gray-500 mb-3">
                  下载你的所有数据备份
                </p>
                <Button variant="outline" size="sm">
                  导出 JSON
                </Button>
              </div>

              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400 mb-2">危险区域</p>
                <p className="text-sm text-gray-500 mb-3">
                  删除账户将清除所有数据，此操作不可恢复
                </p>
                <Button variant="outline" size="sm" className="text-red-400 border-red-800 hover:bg-red-900/30">
                  删除账户
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
