import { Metadata } from "next"
import CreateRecipeDemoClient from "./CreateRecipeDemoClient"

export const metadata: Metadata = {
  title: "Crea tu recetario | misarroces",
  description: "Descubre el editor de recetas de misarroces. Organiza tus ingredientes, proporciones de caldo y pasos de cocina en tu recetario digital.",
  openGraph: {
    title: "Crea tu recetario | misarroces",
    description: "Crea y organiza tu propio recetario de arroces de forma estructurada y profesional en misarroces.",
    images: ["/logopaellaicono.png"],
  },
}

export default function CrearRecetaDemoPage() {
  return <CreateRecipeDemoClient />
}
