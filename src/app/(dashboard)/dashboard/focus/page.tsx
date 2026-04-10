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

export default function FocusPage() {
  const { user } = useAuth()
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
      alert(editingGroupId ? '分组更新成功！' : '分组添加成功！')
    } catch (error) {
      console.error('Error saving group:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('确定删除这个分组及其所有条目吗？')) return
    try {
      await deleteSkillGroup(id)
      await loadGroups()
    } catch (error) {
      console.error('Error deleting group:', error)
      alert('删除失败')
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
      alert('添加失败')
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
      alert('更新失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('确定删除这条？')) return
    try {
      await deleteSkillItem(itemId)
      await loadGroups()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('删除失败')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">我在聚焦什么</h1>
          <p className="text-slate-400 mt-1 text-sm">管理首页展示的聚焦方向和技能标签</p>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">中文标题 *</label>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">English Title</label>
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
        <div className="text-center py-12 text-slate-500">加载中...</div>
      ) : groups.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-[#0d1520]/50 px-5 py-12 text-center">
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">
            暂无内容，点击上方"添加分组"开始创建。
          </p>
          <p className="text-slate-600 text-xs mt-1">
            创建的分组和条目将显示在首页的"我在聚焦什么"区域
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
                    <GripVertical className="w-4 h-4 text-slate-600 shrink-0" />
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <h3 className="text-lg font-semibold text-white truncate">{group.title_zh}</h3>
                    {group.title_en && (
                      <span className="text-xs text-slate-500 hidden sm:inline truncate">{group.title_en}</span>
                    )}
                    {group.items && group.items.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 ml-auto sm:ml-0">
                        {group.items.length} 项
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 ml-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors rounded-md hover:bg-white/5"
                      title="编辑分组"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-md hover:bg-white/5"
                      title="删除分组"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 展开的内容：条目列表 */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    {/* 现有条目 */}
                    {(group.items && group.items.length > 0) ? (
                      <div className="space-y-2">
                        {group.items.map((item) => {
                          const edit = itemEditing[item.id]
                          if (edit) {
                            return (
                              <div key={item.id} className="flex gap-2 items-start bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/15">
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
                                    className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-gray-900 rounded-lg hover:bg-emerald-400 transition-colors"
                                  >
                                    确定
                                  </button>
                                  <button
                                    onClick={() => cancelEditItem(item.id)}
                                    className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            )
                          }

                          return (
                            <div key={item.id} className="flex items-center justify-between group/item p-2 rounded-lg hover:bg-white/[0.02]">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <GripVertical className="w-3 h-3 text-slate-700 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                                <span className="text-sm text-slate-200 truncate">{item.text_zh}</span>
                                {item.text_en && (
                                  <span className="text-xs text-slate-600 truncate hidden md:inline-block max-w-[150px]">{item.text_en}</span>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditItem(item)}
                                  className="p-1 text-slate-500 hover:text-emerald-400 transition-colors rounded"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 text-slate-500 hover:text-red-400 transition-colors rounded"
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
                        <p className="text-xs text-slate-600 text-center py-2">暂无条目，下方添加</p>
                      )
                    )}

                    {/* 新增条目输入框 */}
                    {creating ? (
                      <div className="flex gap-2 items-start bg-white/[0.03] p-3 rounded-xl border border-dashed border-white/10">
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
                            className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-gray-900 rounded-lg hover:bg-emerald-400 transition-colors"
                          >
                            确定
                          </button>
                          <button
                            onClick={() => cancelCreateItem(group.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startCreateItem(group.id)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-400 transition-colors px-2 py-1 rounded-md hover:bg-white/[0.02]"
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
    </div>
  )
}
