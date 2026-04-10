import { cookies } from 'next/headers'
import { isSiteLanguage, type SiteLanguage } from '@/lib/site-language'

export async function getCurrentLanguage(): Promise<SiteLanguage> {
  const cookieStore = await cookies()
  const value = cookieStore.get('site-language')?.value
  return isSiteLanguage(value) ? value : 'zh'
}
