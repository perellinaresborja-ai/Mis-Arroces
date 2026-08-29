export async function resizeImage(file: File, maxWidth: number = 2048, maxHeight: number = 2048, quality: number = 0.8): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (file.type === 'image/gif') return file // Don't process GIFs

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        
        // Prefer webp, fallback to jpeg
        const mimeType = 'image/webp'
        
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
            type: mimeType,
            lastModified: Date.now(),
          })
          resolve(newFile)
        }, mimeType, quality)
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}
