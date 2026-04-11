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
          background: 'linear-gradient(160deg, #0e0f11 0%, #12131a 100%)',
          padding: 56,
          color: '#d4d1cb',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 28,
            fontWeight: 400,
            letterSpacing: 4,
            color: '#7a7670',
          }}
        >
          {siteConfig.title}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.08, color: '#d4d1cb' }}>
            {siteConfig.role.zh}
          </div>
          <div style={{ width: 48, height: 2, background: '#8b7355' }} />
          <div style={{ fontSize: 30, lineHeight: 1.45, color: '#7a7670' }}>
            {siteConfig.description.zh}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            color: '#4a4742',
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
