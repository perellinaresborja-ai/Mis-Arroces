import { Metadata } from "next"
import ImportInstagramClient from "./ImportInstagramClient"

export const metadata: Metadata = {
  title: "Trae tus recetas de Instagram | misarroces",
  description: "Importa recetas desde publicaciones o Reels de Instagram o desde cualquier web a tu recetario en misarroces. Ingredientes, cantidades y pasos estructurados.",
  openGraph: {
    title: "Trae tus recetas de Instagram | misarroces",
    description: "Importa recetas desde Instagram o desde cualquier web directamente a tu recetario digital de misarroces.",
    images: ["/logopngver.webp"],
  },
}

export default function ImportInstagramPage() {
  return <ImportInstagramClient />
}
