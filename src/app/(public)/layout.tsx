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
      <main className="mx-auto max-w-2xl px-6 py-10 sm:px-8 lg:px-0 lg:py-16">
        {children}
      </main>
      <SiteFooter lang={lang} />
    </div>
  )
}
