import { PublicNavigation } from '@/components/Navigation'
import { SiteFooter } from '@/components/site/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="public-shell">
      <PublicNavigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
