import { supabase } from './supabase'

// 常见图片格式的 magic bytes（前若干字节）。
// 攻击者可以伪造 file.type，但伪造文件头很难，且与伪造 type 一致更难。
// 这里只允许真实图片通过；其它全部拒绝。
//
// 注意：WebP 的头是 "RIFF????WEBP"（"WEBP" 在偏移 8 处），
// 因此需要把前 4 字节 + 偏移 8-11 联合校验。
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const JPEG_MAGIC = [0xff, 0xd8, 0xff]
const GIF_MAGIC = [0x47, 0x49, 0x46, 0x38] // GIF87a / GIF89a
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46] // "RIFF"
const WEBP_TAG = [0x57, 0x45, 0x42, 0x50] // "WEBP" @ offset 8
const BMP_MAGIC = [0x42, 0x4d]
const ICO_MAGIC = [0x00, 0x00, 0x01, 0x00]

function startsWith(bytes: Uint8Array, prefix: number[], offset = 0): boolean {
  if (bytes.length < offset + prefix.length) return false
  for (let i = 0; i < prefix.length; i++) {
    if (bytes[offset + i] !== prefix[i]) return false
  }
  return true
}

// 读取文件前 12 字节并判断是否为受支持的真实图片。
// 真实校验在前，file.type 仅用于最后做一致性 sanity check。
async function verifyImageMagicBytes(file: File): Promise<{ ok: true } | { ok: false; reason: string }> {
  // 读取前 12 字节即可覆盖所有受支持格式的最大头长度
  const head = file.slice(0, 12)
  const buf = new Uint8Array(await head.arrayBuffer())

  if (startsWith(buf, PNG_MAGIC)) return { ok: true }
  if (startsWith(buf, JPEG_MAGIC)) return { ok: true }
  if (startsWith(buf, GIF_MAGIC)) return { ok: true }
  if (startsWith(buf, WEBP_RIFF) && startsWith(buf, WEBP_TAG, 8)) return { ok: true }
  if (startsWith(buf, BMP_MAGIC)) return { ok: true }
  if (startsWith(buf, ICO_MAGIC)) return { ok: true }

  // 兜底：拒绝任何无法识别的文件头
  return {
    ok: false,
    reason: '文件类型不受支持：仅允许 PNG / JPEG / GIF / WebP / BMP / ICO',
  }
}

export async function uploadImage(file: File, bucket = 'images'): Promise<string> {
  // 第 1 道：真实文件头校验（防伪装 MIME）
  const magic = await verifyImageMagicBytes(file)
  if (!magic.ok) {
    throw new Error(magic.reason)
  }

  // 第 2 道：浏览器声明的 MIME 与真实文件头一致性 sanity check
  // 若声明的 type 是 "image/*" 但与真实头不一致，仍放行（某些浏览器/系统
  // 会给出扩展名推断的 MIME）；若声明的 type 是非 image/*（如 text/html），
  // 则放行（来自剪贴板/拖拽时浏览器可能给错），以真实头为准。
  if (file.type && !file.type.startsWith('image/')) {
    // 真实头已校验为图片，但声明的 type 不是 image/* —— 视为可疑，记录但放行
    // 因为浏览器在某些拖拽场景确实会给非标准 MIME
    console.warn('[upload] 浏览器声明的 MIME 与真实文件头不一致', {
      declared: file.type,
    })
  }

  // 第 3 道：大小限制（与调用方约定一致：5MB）
  const MAX_BYTES = 5 * 1024 * 1024
  if (file.size > MAX_BYTES) {
    throw new Error(`文件过大：最大 ${MAX_BYTES / 1024 / 1024}MB，当前 ${(file.size / 1024 / 1024).toFixed(2)}MB`)
  }

  // 第 4 道：扩展名白名单（防双扩展名 .png.exe 之类）
  const allowedExts = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico'])
  const fileExt = (file.name.split('.').pop() || '').toLowerCase()
  if (!allowedExts.has(fileExt)) {
    throw new Error(`文件扩展名不受支持：.${fileExt}`)
  }

  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteImage(url: string, bucket = 'images'): Promise<void> {
  // Extract file path from public URL
  const pathMatch = url.match(new RegExp(`${bucket}/(.+)$`))
  if (!pathMatch || !pathMatch[1]) return

  const filePath = pathMatch[1]

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  if (error) {
    throw error
  }
}
