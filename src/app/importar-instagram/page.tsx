import { Metadata } from "next"
import ImportInstagramClient from "./ImportInstagramClient"

export const metadata: Metadata = {
  title: "Trae tus recetas de Instagram | misarroces",
  description: "Convierte cualquier post o reel de Instagram en una receta estructurada en misarroces. Ingredientes, pasos y cálculo de raciones automático.",
  openGraph: {
    title: "Trae tus recetas de Instagram | misarroces",
    description: "Importa recetas de Instagram directamente a tu recetario digital de misarroces.",
    images: ["/logopaellaicono.png"],
  },
}

export default function ImportInstagramPage() {
  return <ImportInstagramClient />
}
