import { getPublicSupabaseClient } from './supabase-public'
import type { SkillGroup, SkillItem } from '@/types'

export interface PublicSkillGroup {
  id: string
  title_zh: string
  title_en: string
  items: { text_zh: string; text_en: string }[]
}

/**
 * 公开读取聚焦方向数据（首页使用，无需登录）
 */
export async function getPublicSkillGroups(): Promise<PublicSkillGroup[]> {
  const supabase = getPublicSupabaseClient()
  const { data, error } = await supabase
    .from('skill_groups')
    .select('id, title_zh, title_en, skill_items(text_zh, text_en)')
    .order('sort_order', { ascending: true })

  if (error) {
    // 首页不因数据错误崩溃，返回空数组
    console.error('Failed to load skill groups:', error)
    return []
  }

  return (data ?? []).map((group: Record<string, unknown>) => ({
    id: group.id as string,
    title_zh: (group.title_zh as string) || '',
    title_en: (group.title_en as string) || '',
    items: ((group.skill_items as unknown[] | null) ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => ({
        text_zh: String(item?.text_zh ?? ''),
        text_en: String(item?.text_en ?? ''),
      }),
    ),
  }))
}
