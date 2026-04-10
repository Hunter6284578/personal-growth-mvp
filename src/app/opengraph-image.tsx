import { ImageResponse } from 'next/og'
import { siteConfig } from '@/content/site'

export const runtime = 'edge'
export const alt = `${siteConfig.name} 个人网站`
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'linear-gradient(140deg, rgb(248, 245, 239) 0%, rgb(243, 239, 232) 48%, rgb(230, 245, 242) 100%)',
          padding: 56,
          color: '#171717',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#0f766e',
          }}
        >
            CagedSheep
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.08 }}>
            {siteConfig.name} · {siteConfig.role}
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.45, color: '#44403c' }}>
            作品、文字与日常片段，留给自己，也留给后来回看的时刻。
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
            color: '#44403c',
          }}
        >
          <div>{siteConfig.github}</div>
          <div>{siteConfig.email}</div>
        </div>
      </div>
    ),
    size
  )
}
