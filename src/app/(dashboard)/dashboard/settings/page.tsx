'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Save, Camera, Loader2 } from 'lucide-react'
import { getProfile, upsertProfile } from '@/lib/services'
import { uploadImage } from '@/lib/upload'
import { useAuth } from '@/hooks/useAuth'
import type { Profile } from '@/types'
import { ManagedImage } from '@/components/ui/ManagedImage'
import { useToast } from '@/components/ui/Toast'

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // 表单状态
  const [characterName, setCharacterName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const loadProfile = useCallback(async () => {
    if (!user) return
    try {
      const data = await getProfile(user.id)
      setProfile(data)
      setCharacterName(data.character_name || '主角')
      setBio(data.bio || '')
      setAvatarUrl(data.avatar_url || '')
    } catch (error) {
      console.error('Error loading profile:', error)
      setCharacterName('主角')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      void loadProfile()
    }
  }, [user, loadProfile])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast('只能上传图片文件', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('图片大小不能超过 5MB', 'error')
      return
    }

    setAvatarUploading(true)
    try {
      const url = await uploadImage(file)
      setAvatarUrl(url)
    } catch (error) {
      console.error('上传头像失败:', error)
      toast('上传头像失败，请重试', 'error')
    } finally {
      setAvatarUploading(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
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
      toast('保存成功！', 'success')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast('保存失败，请重试', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-bright)' }}>设置</h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>管理你的个人资料</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 个人资料 */}
        <Card title="个人资料" subtitle="编辑你的角色信息">
          {loading ? (
            <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>加载中...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 头像 - 点击上传 */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden relative group cursor-pointer transition-all disabled:opacity-50"
                  style={{ background: 'var(--dash-card-soft)' }}
                >
                  {avatarUrl ? (
                    <ManagedImage
                      src={avatarUrl}
                      alt={`${characterName || '用户'}头像`}
                      width={80}
                      height={80}
                      sizes="80px"
                      className="h-full w-full"
                    />
                  ) : (
                    <User className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
                  )}
                  <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
                    {avatarUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-bright)' }} />
                    ) : (
                      <Camera className="w-6 h-6" style={{ color: 'var(--text-bright)' }} />
                    )}
                  </div>
                </button>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>头像</p>
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>点击头像上传图片</p>
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  角色名称 *
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="你的角色名称"
                  required
                  className="pg-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  个人简介
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="介绍一下你自己..."
                  rows={4}
                  className="pg-input resize-none"
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
              <div className="p-4 rounded-lg" style={{ background: 'var(--dash-card-soft)' }}>
                <p className="mb-2" style={{ color: 'var(--text)' }}>邮箱</p>
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{user?.email || '未登录'}</p>
              </div>

              <div className="p-4 rounded-lg" style={{ background: 'var(--dash-card-soft)' }}>
                <p className="mb-2" style={{ color: 'var(--text)' }}>密码</p>
                <p className="text-sm mb-3" style={{ color: 'var(--text-dim)' }}>
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
              <div className="p-4 rounded-lg" style={{ background: 'var(--dash-card-soft)' }}>
                <p className="mb-2" style={{ color: 'var(--text)' }}>导出数据</p>
                <p className="text-sm mb-3" style={{ color: 'var(--text-dim)' }}>
                  下载你的所有数据备份
                </p>
                <Button variant="outline" size="sm">
                  导出 JSON
                </Button>
              </div>

              <div className="p-4 rounded-lg" style={{ background: 'rgba(139, 85, 85, 0.12)', border: '1px solid var(--dash-danger)' }}>
                <p className="mb-2" style={{ color: 'var(--dash-danger)' }}>危险区域</p>
                <p className="text-sm mb-3" style={{ color: 'var(--text-dim)' }}>
                  删除账户将清除所有数据，此操作不可恢复
                </p>
                <Button variant="outline" size="sm" style={{ borderColor: 'var(--dash-danger)', color: 'var(--dash-danger)' }}>
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
