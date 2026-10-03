/**
 * normalizeImageUrl – Tự động chuyển đổi các đường link ảnh từ Google Drive,
 * Dropbox hoặc các dịch vụ lưu trữ thành link ảnh trực tiếp (direct image URL)
 * để thẻ <img> hiển thị mượt mà.
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  // 1. Google Drive (dạng /file/d/FILE_ID/view hoặc open?id=FILE_ID hoặc uc?id=FILE_ID)
  const gDriveMatch =
    trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:[^&]*&)*id=([a-zA-Z0-9_-]+)/)

  if (gDriveMatch && gDriveMatch[1]) {
    // CDN trực tiếp của Google Photos / Drive:
    return `https://lh3.googleusercontent.com/d/${gDriveMatch[1]}`
  }

  // 2. Dropbox (đổi dl=0 thành raw=1)
  if (trimmed.includes('dropbox.com') && (trimmed.includes('?dl=0') || trimmed.includes('&dl=0'))) {
    return trimmed.replace(/[?&]dl=0/, '?raw=1')
  }

  return trimmed
}
