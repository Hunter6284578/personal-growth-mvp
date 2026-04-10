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
  applicationName: `${siteConfig.name} Portfolio`,
  keywords: [
    '个人网站',
    '求职作品集',
    '全栈开发',
    'Next.js',
    '技术博客',
    '健身记录',
    'AI 健身建议',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.role}`,
    description: siteConfig.description,
    type: 'website',
    locale: 'zh_CN',
    siteName: `${siteConfig.name} Portfolio`,
    url: canonicalUrl,
    images: [
      {
        url: `${canonicalUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Portfolio`,
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
