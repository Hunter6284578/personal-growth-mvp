import { ImageResponse } from 'next/og'
import { siteConfig } from '@/content/site'

export const runtime = 'edge'
export const alt = siteConfig.title
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
          background: 'linear-gradient(160deg, rgb(8, 17, 31) 0%, rgb(15, 23, 42) 60%, rgb(6, 78, 59) 100%)',
          padding: 56,
          color: '#f8fafc',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#86efac',
          }}
        >
          {siteConfig.title}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.08 }}>
            {siteConfig.role.zh}
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.45, color: '#cbd5e1' }}>
            {siteConfig.description.zh}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
            color: '#cbd5e1',
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
