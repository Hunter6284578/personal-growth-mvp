import type { Metadata } from 'next'
import { Noto_Sans_SC, JetBrains_Mono } from 'next/font/google'
import { siteConfig } from '@/content/site'
import { getCurrentLanguage } from '@/lib/site-language.server'

import './globals.css'

const bodyFont = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const canonicalUrl = siteConfig.siteUrl || siteUrl

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguage()
  const isZh = language === 'zh'
  const role = isZh ? siteConfig.role.zh : siteConfig.role.en
  const description = isZh ? siteConfig.description.zh : siteConfig.description.en
  const locale = isZh ? 'zh_CN' : 'en_US'

  return {
    metadataBase: canonicalUrl ? new URL(canonicalUrl) : undefined,
    title: {
      default: `${siteConfig.title} | ${role}`,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
    },
    applicationName: siteConfig.title,
    keywords: isZh
      ? ['个人网站', '个人品牌', '作品集', '成长日志', 'Next.js', 'Portfolio']
      : ['personal website', 'personal brand', 'portfolio', 'growth log', 'Next.js'],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    openGraph: {
      title: `${siteConfig.title} | ${role}`,
      description,
      type: 'website',
      locale,
      siteName: siteConfig.title,
      url: canonicalUrl,
      images: [
        {
          url: `${canonicalUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: siteConfig.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteConfig.title} | ${role}`,
      description,
      images: [`${canonicalUrl}/opengraph-image`],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const language = await getCurrentLanguage()

  return (
    <html lang={language === 'zh' ? 'zh-CN' : 'en'} className={`${bodyFont.variable} ${monoFont.variable}`}>
      <body className={`${bodyFont.className} min-h-screen bg-[#08111f] text-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  )
}
