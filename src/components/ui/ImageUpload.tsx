'use client'

import { useState, useRef } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { uploadImage } from '@/lib/upload'
import { ManagedImage } from '@/components/ui/ManagedImage'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 4 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      alert(`最多只能上传 ${maxImages} 张图片`)
      return
    }

    setUploading(true)
    try {
      const newImageUrls = [...images]
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          alert('只能上传图片文件')
          continue
        }
        // 验证文件大小 (最大 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('图片大小不能超过 5MB')
          continue
        }
        
        const url = await uploadImage(file)
        newImageUrls.push(url)
      }
      onChange(newImageUrls)
    } catch (error) {
      console.error('上传图片失败:', error)
      alert('上传图片失败，请重试')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700 group">
            <ManagedImage
              src={url}
              alt={`上传的图片 ${index + 1}`}
              width={96}
              height={96}
              sizes="96px"
              className="h-full w-full"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/50 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-6 h-6 mb-2" />
                <span className="text-xs">上传图片</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
