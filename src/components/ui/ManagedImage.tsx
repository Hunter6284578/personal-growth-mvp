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
}: ManagedImageProps) {
  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)} style={style}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? '(max-width: 768px) 100vw, 33vw'}
          priority={priority}
          unoptimized
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
        unoptimized
        className={cn('h-full w-full object-cover', imageClassName)}
      />
    </div>
  )
}
