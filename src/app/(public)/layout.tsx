import { PublicNavigation } from '@/components/Navigation'
import { SiteFooter } from '@/components/site/Footer'
import { getCurrentLanguage } from '@/lib/site-language.server'


export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const lang = await getCurrentLanguage()

  return (
    <div className="public-shell">
      <PublicNavigation lang={lang} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
      <SiteFooter lang={lang} />
    </div>
  )
}
