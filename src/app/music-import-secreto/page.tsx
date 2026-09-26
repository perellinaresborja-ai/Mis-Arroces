import { redirect } from "next/navigation"

export default function OldMusicImportPage() {
  // Redirigir a la ruta administrativa protegida.
  // Si el usuario no es admin, requireAdminSession lanzará 404 en /admin/contenidos/musica.
  redirect("/admin/contenidos/musica")
}
