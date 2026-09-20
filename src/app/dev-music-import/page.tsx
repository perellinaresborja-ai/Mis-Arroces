import { notFound } from 'next/navigation'
import { MusicBulkImporter } from '@/components/admin/MusicBulkImporter'

export default function DevMusicImportPage() {
  if (process.env.NODE_ENV !== 'development') {
    // Solo permitir en entorno de desarrollo local por seguridad temporal
    notFound()
  }

  return <MusicBulkImporter />
}
