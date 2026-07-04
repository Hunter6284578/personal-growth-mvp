import type { User } from '@supabase/supabase-js'
import type { createClient } from '@/lib/supabase-server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function getConfiguredOwnerEmails() {
  return (process.env.SITE_OWNER_EMAIL || process.env.NEXT_PUBLIC_SITE_OWNER_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

// ---------- 启动自检 ----------
// 在模块加载时检查环境变量维度是否存在 owner 配置。
// 注意：此检查只覆盖 env 维度，site_admins 表是否为空只能在运行时
// 首次调用 isSiteAdmin() 时再确认。
//
// 设计取舍：仅在 env 维度全空时打一次 warning，避免日志刷屏；
// NODE_ENV 也会带上，便于在生产环境区分告警来源。
(function startupSiteAdminSelfCheck() {
  if (typeof process === 'undefined') return
  const ownerEmails = getConfiguredOwnerEmails()
  if (ownerEmails.length === 0) {
    const env = process.env.NODE_ENV || 'development'
    // 使用 console.warn：不是 fatal，但需要被日志收集系统看见
    console.warn(
      `[site-admin][${env}] 启动自检：SITE_OWNER_EMAIL 未配置。` +
      '管理员鉴权将完全依赖 Supabase 的 site_admins 表。' +
      '建议在 .env.local 中至少配置 1 个 SITE_OWNER_EMAIL 作为兜底，' +
      '避免 site_admins 表被误删后无人可管理网站。'
    )
  }
})()

// 首次调用 isSiteAdmin 时再做一次运行时自检：site_admins 表是否完全为空。
// 模块级 flag 保证只跑一次，不会污染热路径。
let dbOwnerCheckDone = false
let dbHasOwners: boolean | null = null
async function checkSiteAdminsTableHasOwners(
  supabase: SupabaseServerClient
): Promise<boolean | null> {
  if (dbOwnerCheckDone) return dbHasOwners
  dbOwnerCheckDone = true
  try {
    const { count, error } = await supabase
      .from('site_admins')
      .select('user_id', { count: 'exact', head: true })
    if (error) {
      dbHasOwners = null
      return null
    }
    dbHasOwners = (count ?? 0) > 0
    if (!dbHasOwners && getConfiguredOwnerEmails().length === 0) {
      // 真正的紧急情况：env 也没有，表里也没有 —— 无人可管网站
      console.error(
        '[site-admin][CRITICAL] 启动自检：SITE_OWNER_EMAIL 未配置且 site_admins 表为空。' +
        '当前部署下任何用户都无法访问后台。请立即在 .env.local 设置 SITE_OWNER_EMAIL，' +
        '或向 site_admins 表插入至少一条记录。'
      )
    }
    return dbHasOwners
  } catch {
    dbHasOwners = null
    return null
  }
}

export async function isSiteAdmin(supabase: SupabaseServerClient, user: User | null) {
  if (!user) return false

  const ownerEmails = getConfiguredOwnerEmails()
  if (user.email && ownerEmails.includes(user.email.toLowerCase())) {
    return true
  }

  try {
    const { data, error } = await supabase
      .from('site_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) return false
    const isAdmin = Boolean(data)

    // 顺手做一次"site_admins 表是否完全为空"的运行时自检（仅一次）
    if (!isAdmin) {
      void checkSiteAdminsTableHasOwners(supabase)
    }

    return isAdmin
  } catch {
    return false
  }
}
