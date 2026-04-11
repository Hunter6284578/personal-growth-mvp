'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/toc'

interface TableOfContentsProps {
  items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[]

    if (headingElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    headingElements.forEach((el) => observer.observe(el))
    observers.push(observer)

    return () => {
      observers.forEach((o) => o.disconnect())
    }
  }, [items])

  if (items.length === 0) return null

  return (
    <nav aria-label="Table of contents">
      <p className="eyebrow mb-4">目录</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: item.level === 3 ? '1rem' : '0' }}
          >
            <a
              href={`#${item.id}`}
              className="block text-sm transition-colors"
              style={{
                color: activeId === item.id ? 'var(--accent)' : 'var(--text-dim)',
                borderLeft: activeId === item.id ? '2px solid var(--accent)' : '2px solid transparent',
                paddingLeft: '0.5rem',
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
