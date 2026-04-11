import type { Metadata } from 'next'
import { Noto_Sans_SC, Noto_Serif_SC, JetBrains_Mono } from 'next/font/google'
import { siteConfig } from '@/content/site'
import { getPersonSchema, getWebsiteSchema } from '@/lib/structured-data'
import { getCurrentLanguage } from '@/lib/site-language.server'

import './globals.css'

const bodyFont = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  preload: true,
})

const titleFont = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-title',
  preload: true,
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
      types: {
        'application/rss+xml': `${canonicalUrl}/feed.xml`,
      },
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

  const personSchema = getPersonSchema()
  const websiteSchema = getWebsiteSchema()

  const themeInitScript = `
    (function(){
      try{
        var m=document.cookie.match(/(?:^|; )site-theme=([^;]*)/);
        var t=m&&m[1];
        if(t)document.documentElement.setAttribute('data-theme',t);
      }catch(e){}
    })()
  `

  return (
    <html
      lang={language === 'zh' ? 'zh-CN' : 'en'}
      className={`${bodyFont.variable} ${titleFont.variable} ${monoFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {children}
      </body>
    </html>
  )
}
