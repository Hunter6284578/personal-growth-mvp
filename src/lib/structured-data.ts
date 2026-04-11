import { siteConfig } from '@/content/site'

export function getPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    sameAs: [siteConfig.github],
    email: siteConfig.email,
    knowsAbout: [
      'Web Development',
      'TypeScript',
      'React',
      'Next.js',
      'Personal Knowledge Management',
    ],
  }
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.title,
    url: siteConfig.siteUrl,
    inLanguage: ['zh-CN', 'en'],
    author: {
      '@type': 'Person',
      name: siteConfig.name,
    },
  }
}

export function getArticleSchema(input: {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    mainEntityOfPage: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: {
      '@type': 'Person',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.title,
    },
  }
}
