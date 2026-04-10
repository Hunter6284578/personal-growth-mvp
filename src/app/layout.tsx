import type { Metadata } from 'next'
import { Noto_Sans_SC, JetBrains_Mono } from 'next/font/google'
import { siteConfig } from '@/content/site'
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

export const metadata: Metadata = {
  metadataBase: canonicalUrl ? new URL(canonicalUrl) : undefined,
  title: {
    default: `${siteConfig.name} | ${siteConfig.role}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  applicationName: `${siteConfig.name} 个人网站`,
  keywords: [
    '个人网站',
    '个人博客',
    '作品集',
    '生活记录',
    '阶段记录',
    '写作',
    '摄影',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.role}`,
    description: siteConfig.description,
    type: 'website',
    locale: 'zh_CN',
    siteName: `${siteConfig.name} 个人网站`,
    url: canonicalUrl,
    images: [
      {
        url: `${canonicalUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} 个人网站`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | ${siteConfig.role}`,
    description: siteConfig.description,
    images: [`${canonicalUrl}/opengraph-image`],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${bodyFont.variable} ${monoFont.variable}`}>
      <body className={`${bodyFont.className} min-h-screen bg-stone-100 text-stone-950 antialiased`}>
        {children}
      </body>
    </html>
  )
}
