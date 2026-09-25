import { Metadata } from "next"
import CreateRecipeDemoClient from "./CreateRecipeDemoClient"

export const metadata: Metadata = {
  title: "Crea tu recetario de arroces | misarroces",
  description: "Todos tus arroces, organizados en un único lugar. Guarda cantidades, ingredientes, elaboración, fotos y todos los datos necesarios para volver a cocinarlos siempre que quieras.",
  openGraph: {
    title: "Crea tu recetario de arroces | misarroces",
    description: "Todos tus arroces, organizados en un único lugar. Guarda cantidades, ingredientes, elaboración, fotos y todos los datos necesarios para volver a cocinarlos siempre que quieras.",
    images: ["/logopngver.webp"],
  },
}

export default function CrearRecetaDemoPage() {
  return <CreateRecipeDemoClient />
}
