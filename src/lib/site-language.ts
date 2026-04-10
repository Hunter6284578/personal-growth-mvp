export type SiteLanguage = 'zh' | 'en'

export interface LocalizedText {
  zh: string
  en: string
}

export interface LocalizedList {
  zh: string[]
  en: string[]
}

const SITE_LANGUAGE_COOKIE = 'site-language'

export function isSiteLanguage(value: string | undefined | null): value is SiteLanguage {
  return value === 'zh' || value === 'en'
}

export function pickText(text: LocalizedText, language: SiteLanguage) {
  return text[language]
}

export function pickList(list: LocalizedList, language: SiteLanguage) {
  return list[language]
}

export function getLocale(language: SiteLanguage) {
  return language === 'zh' ? 'zh-CN' : 'en-US'
}

export function formatDate(value: string | Date, language: SiteLanguage) {
  return new Intl.DateTimeFormat(getLocale(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(typeof value === 'string' ? new Date(value) : value)
}

export function getReadingTimeLabel(minutes: number, language: SiteLanguage) {
  return language === 'zh' ? `${minutes} 分钟阅读` : `${minutes} min read`
}

export const siteLanguageCookie = SITE_LANGUAGE_COOKIE
