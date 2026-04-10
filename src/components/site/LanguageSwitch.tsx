'use client'

import { Languages } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { siteLanguageCookie, type SiteLanguage } from '@/lib/site-language'

interface LanguageSwitchProps {
  lang: SiteLanguage
}

export function LanguageSwitch({ lang }: LanguageSwitchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const nextLang: SiteLanguage = lang === 'zh' ? 'en' : 'zh'

  const handleToggle = () => {
    document.cookie = `${siteLanguageCookie}=${nextLang}; path=/; max-age=31536000; samesite=lax`
    const query = searchParams.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:bg-white/10 hover:text-white"
      aria-label={lang === 'zh' ? '切换到英文' : 'Switch to Chinese'}
    >
      <Languages className="h-4 w-4" />
      {lang === 'zh' ? 'EN' : '中文'}
    </button>
  )
}
