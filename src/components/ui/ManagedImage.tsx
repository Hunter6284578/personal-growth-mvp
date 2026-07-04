'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ManagedImageProps {
  src: string
  alt: string
  className?: string
  imageClassName?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  style?: React.CSSProperties
  /**
   * 强制不走 next/image 优化（保留原图直出）。
   * 仅在确认优化器与目标 URL 不兼容时设置，例如 SVG、动图 GIF（next/image
   * 仍会优化 GIF，但部分场景会失败）。
   */
  unoptimized?: boolean
}

// 1x1 透明 PNG → 用作 blur placeholder，避免 CLS、首屏有占位
// 优点：不需要每次为每张图生成 base64，启动时打包好即可
const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

// 简单判断：URL 是不是本站点代理（相对路径或同源），是的话跳过优化器
// （优化器对自己的 /_next/static 图片没必要再压缩）
function isLocalAsset(src: string): boolean {
  return src.startsWith('/') && !src.startsWith('//')
}

export function ManagedImage({
  src,
  alt,
  className,
  imageClassName,
  fill = false,
  width = 96,
  height = 96,
  sizes,
  priority = false,
  style,
  unoptimized = false,
}: ManagedImageProps) {
  // 本地资产 / 用户明确指定 → 关闭优化
  const shouldOptimize = !unoptimized && !isLocalAsset(src)

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)} style={style}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          priority={priority}
          unoptimized={!shouldOptimize}
          placeholder={shouldOptimize ? 'blur' : 'empty'}
          blurDataURL={BLUR_DATA_URL}
          quality={80}
          className={cn('object-cover', imageClassName)}
        />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={style}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes ?? `${width}px`}
        priority={priority}
        unoptimized={!shouldOptimize}
        placeholder={shouldOptimize ? 'blur' : 'empty'}
        blurDataURL={BLUR_DATA_URL}
        quality={80}
        className={cn('h-full w-full object-cover', imageClassName)}
      />
    </div>
  )
}
