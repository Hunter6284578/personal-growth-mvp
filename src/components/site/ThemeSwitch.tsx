'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const themeCookie = 'site-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const match = document.cookie.match(new RegExp(`(?:^|; )${themeCookie}=([^;]*)`))
  return (match?.[1] as Theme) || 'dark'
}

interface ThemeSwitchProps {
  lang: string
}

export function ThemeSwitch({ lang }: ThemeSwitchProps) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setTheme(getInitialTheme())
  }, [])

  const handleToggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.cookie = `${themeCookie}=${next}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.setAttribute('data-theme', next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="text-sm transition-colors"
      style={{ color: 'var(--text-dim)' }}
      aria-label={theme === 'dark' ? '切换到亮色模式' : 'Switch to dark mode'}
    >
      {lang === 'zh'
        ? (theme === 'dark' ? '亮 / 暗' : '暗 / 亮')
        : (theme === 'dark' ? 'Light / Dark' : 'Dark / Light')}
    </button>
  )
}
