'use client'

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
      className="text-sm transition-colors"
      style={{ color: 'var(--text-dim)' }}
      aria-label={lang === 'zh' ? '切换到英文' : 'Switch to Chinese'}
    >
      {lang === 'zh' ? '中文 / EN' : 'EN / 中文'}
    </button>
  )
}
