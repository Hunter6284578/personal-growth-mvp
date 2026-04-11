'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Plus,
  Trash2,
  Edit2,
  X,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Target,
} from 'lucide-react'
import {
  getSkillGroups,
  createSkillGroup,
  updateSkillGroup,
  deleteSkillGroup,
  createSkillItem,
  updateSkillItem,
  deleteSkillItem,
} from '@/lib/services'
import { useAuth } from '@/hooks/useAuth'
import type { SkillGroup, SkillItem } from '@/types'
import { useToast } from '@/components/ui/Toast'
import { useConfirm, ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function FocusPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { confirm, cancel, dialogState } = useConfirm()
  const [groups, setGroups] = useState<(SkillGroup & { items: SkillItem[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 分组表单
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [titleZh, setTitleZh] = useState('')
  const [titleEn, setTitleEn] = useState('')

  // 展开的分组
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // 每个分组的条目编辑状态
  const [itemEditing, setItemEditing] = useState<Record<string, { textZh: string; textEn: string }>>({})
  const [itemCreating, setItemCreating] = useState<Record<string, { textZh: string; textEn: string }>>({})

  const loadGroups = useCallback(async () => {
    if (!user) return
    try {
      const data = await getSkillGroups(user.id)
      setGroups(data as (SkillGroup & { items: SkillItem[] })[])
      if (data.length > 0) {
        setExpandedGroups(new Set(data.map(g => g.id)))
      }
    } catch (error) {
      console.error('Error loading skill groups:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) void loadGroups()
  }, [user, loadGroups])

  const resetGroupForm = () => {
    setEditingGroupId(null)
    setTitleZh('')
    setTitleEn('')
  }

  const handleSaveGroup = async () => {
    if (!user || !titleZh.trim()) return
    setSaving(true)
    try {
      if (editingGroupId) {
        await updateSkillGroup(editingGroupId, {
          title_zh: titleZh.trim(),
          title_en: titleEn.trim(),
        })
      } else {
        await createSkillGroup({
          user_id: user.id,
          title_zh: titleZh.trim(),
          title_en: titleEn.trim(),
          sort_order: groups.length,
        })
      }
      resetGroupForm()
      setShowGroupForm(false)
      await loadGroups()
      toast(editingGroupId ? '分组更新成功！' : '分组添加成功！', 'success')
    } catch (error) {
      console.error('Error saving group:', error)
      toast('保存失败，请重试', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    const confirmed = await confirm({ message: '确定删除这个分组及其所有条目吗？', variant: 'danger' })
    if (!confirmed) return
    try {
      await deleteSkillGroup(id)
      await loadGroups()
    } catch (error) {
      console.error('Error deleting group:', error)
      toast('删除失败', 'error')
    }
  }

  const handleEditGroup = (group: SkillGroup & { items: SkillItem[] }) => {
    setEditingGroupId(group.id)
    setTitleZh(group.title_zh)
    setTitleEn(group.title_en)
    setShowGroupForm(true)
  }

  const toggleExpand = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // 条目操作
  const startCreateItem = (groupId: string) => {
    setItemCreating(prev => ({ ...prev, [groupId]: { textZh: '', textEn: '' } }))
  }

  const cancelCreateItem = (groupId: string) => {
    setItemCreating(prev => {
      const next = { ...prev }
      delete next[groupId]
      return next
    })
  }

  const handleCreateItem = async (groupId: string) => {
    const item = itemCreating[groupId]
    if (!item?.textZh.trim()) return
    setSaving(true)
    try {
      const group = groups.find(g => g.id === groupId)
      await createSkillItem({
        group_id: groupId,
        text_zh: item.textZh.trim(),
        text_en: item.textEn.trim(),
        sort_order: group?.items?.length ?? 0,
      })
      cancelCreateItem(groupId)
      await loadGroups()
    } catch (error) {
      console.error('Error creating item:', error)
      toast('添加失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const startEditItem = (item: SkillItem) => {
    setItemEditing(prev => ({
      ...prev,
      [item.id]: { textZh: item.text_zh, textEn: item.text_en },
    }))
  }

  const cancelEditItem = (itemId: string) => {
    setItemEditing(prev => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }

  const handleUpdateItem = async (itemId: string) => {
    const edit = itemEditing[itemId]
    if (!edit?.textZh.trim()) return
    setSaving(true)
    try {
      await updateSkillItem(itemId, {
        text_zh: edit.textZh.trim(),
        text_en: edit.textEn.trim(),
      })
      cancelEditItem(itemId)
      await loadGroups()
    } catch (error) {
      console.error('Error updating item:', error)
      toast('更新失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    const confirmed = await confirm({ message: '确定删除这条？', variant: 'danger' })
    if (!confirmed) return
    try {
      await deleteSkillItem(itemId)
      await loadGroups()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast('删除失败', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-bright)' }}>我在聚焦什么</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>管理首页展示的聚焦方向和技能标签</p>
        </div>
        <Button
          onClick={() => { resetGroupForm(); setShowGroupForm(!showGroupForm); }}
        >
          {showGroupForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showGroupForm ? '取消' : '添加分组'}
        </Button>
      </div>

      {/* 添加/编辑分组表单 */}
      {showGroupForm && (
        <Card title={editingGroupId ? '编辑分组' : '添加新分组'}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>中文标题 *</label>
                <input
                  type="text"
                  value={titleZh}
                  onChange={e => setTitleZh(e.target.value)}
                  placeholder="如：技术栈"
                  required
                  className="pg-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>English Title</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={e => setTitleEn(e.target.value)}
                  placeholder="e.g. Tech Stack"
                  className="pg-input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={handleSaveGroup} loading={saving} disabled={!titleZh.trim()}>
                {editingGroupId ? '更新' : '保存'}
              </Button>
              {editingGroupId && (
                <Button type="button" variant="outline" onClick={resetGroupForm}>
                  取消编辑
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 分组列表 */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-dim)' }}>加载中...</div>
      ) : groups.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed px-5 py-12 text-center" style={{ borderColor: 'var(--dash-border)', background: 'var(--dash-card-soft)' }}>
          <Target className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            暂无内容，点击上方&quot;添加分组&quot;开始创建。
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
            创建的分组和条目将显示在首页的&quot;我在聚焦什么&quot;区域
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const isExpanded = expandedGroups.has(group.id)
            const creating = itemCreating[group.id]

            return (
              <Card key={group.id} className="overflow-hidden">
                {/* 分组头部 */}
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => toggleExpand(group.id)}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <GripVertical className="w-4 h-4 shrink-0" style={{ color: 'var(--text-dim)' }} />
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--dash-success)' }} />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-dim)' }} />
                    )}
                    <h3 className="text-lg font-semibold truncate" style={{ color: 'var(--text-bright)' }}>{group.title_zh}</h3>
                    {group.title_en && (
                      <span className="text-xs hidden sm:inline truncate" style={{ color: 'var(--text-dim)' }}>{group.title_en}</span>
                    )}
                    {group.items && group.items.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full border ml-auto sm:ml-0" style={{ background: 'rgba(107, 143, 113, 0.15)', color: 'var(--dash-success)', borderColor: 'rgba(107, 143, 113, 0.2)' }}>
                        {group.items.length} 项
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 ml-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="p-1.5 transition-colors rounded-md"
                      style={{ color: 'var(--text-muted)' }}
                      title="编辑分组"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-1.5 transition-colors rounded-md"
                      style={{ color: 'var(--text-muted)' }}
                      title="删除分组"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 展开的内容：条目列表 */}
                {isExpanded && (
                  <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid var(--dash-border)' }}>
                    {/* 现有条目 */}
                    {(group.items && group.items.length > 0) ? (
                      <div className="space-y-2">
                        {group.items.map((item) => {
                          const edit = itemEditing[item.id]
                          if (edit) {
                            return (
                              <div key={item.id} className="flex gap-2 items-start p-3 rounded-xl border" style={{ background: 'rgba(107, 143, 113, 0.08)', borderColor: 'rgba(107, 143, 113, 0.15)' }}>
                                <input
                                  autoFocus
                                  value={edit.textZh}
                                  onChange={e => setItemEditing(prev => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], textZh: e.target.value },
                                  }))}
                                  placeholder="中文"
                                  className="pg-input text-sm flex-1"
                                />
                                <input
                                  value={edit.textEn}
                                  onChange={e => setItemEditing(prev => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], textEn: e.target.value },
                                  }))}
                                  placeholder="English"
                                  className="pg-input text-sm w-40 hidden sm:block"
                                />
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => handleUpdateItem(item.id)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                                    style={{ background: 'var(--dash-success)', color: 'var(--dash-bg)' }}
                                  >
                                    确定
                                  </button>
                                  <button
                                    onClick={() => cancelEditItem(item.id)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                                    style={{ background: 'var(--dash-card-soft)', color: 'var(--text)' }}
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            )
                          }

                          return (
                            <div key={item.id} className="flex items-center justify-between group/item p-2 rounded-lg" style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--dash-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <GripVertical className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" style={{ color: 'var(--text-dim)' }} />
                                <span className="text-sm truncate" style={{ color: 'var(--text)' }}>{item.text_zh}</span>
                                {item.text_en && (
                                  <span className="text-xs truncate hidden md:inline-block max-w-[150px]" style={{ color: 'var(--text-dim)' }}>{item.text_en}</span>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditItem(item)}
                                  className="p-1 transition-colors rounded"
                                  style={{ color: 'var(--text-dim)' }}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 transition-colors rounded"
                                  style={{ color: 'var(--text-dim)' }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      !creating && (
                        <p className="text-xs text-center py-2" style={{ color: 'var(--text-dim)' }}>暂无条目，下方添加</p>
                      )
                    )}

                    {/* 新增条目输入框 */}
                    {creating ? (
                      <div className="flex gap-2 items-start p-3 rounded-xl border border-dashed" style={{ background: 'var(--dash-hover)', borderColor: 'var(--dash-border)' }}>
                        <input
                          autoFocus
                          value={creating.textZh}
                          onChange={e => setItemCreating(prev => ({
                            ...prev,
                            [group.id]: { ...prev[group.id]!, textZh: e.target.value },
                                  }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleCreateItem(group.id) }}
                          placeholder="中文标签..."
                          className="pg-input text-sm flex-1"
                          />
                        <input
                          value={creating.textEn}
                          onChange={e => setItemCreating(prev => ({
                            ...prev,
                            [group.id]: { ...prev[group.id]!, textEn: e.target.value },
                          }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleCreateItem(group.id) }}
                          placeholder="English tag..."
                          className="pg-input text-sm w-36 hidden sm:block"
                        />
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleCreateItem(group.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{ background: 'var(--dash-success)', color: 'var(--dash-bg)' }}
                          >
                            确定
                          </button>
                          <button
                            onClick={() => cancelCreateItem(group.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{ background: 'var(--dash-card-soft)', color: 'var(--text)' }}
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startCreateItem(group.id)}
                        className="flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded-md"
                        style={{ color: 'var(--text-dim)' }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        添加条目
                      </button>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={dialogState.open}
        onConfirm={dialogState.onConfirm}
        onCancel={cancel}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.variant}
      />
    </div>
  )
}
