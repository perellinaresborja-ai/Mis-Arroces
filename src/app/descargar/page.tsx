import { Metadata } from "next"
import DownloadClient from "./DownloadClient"

export const metadata: Metadata = {
  title: "Descarga misarroces | misarroces",
  description: "Recetas, cálculo de arroz milimétrico, bitácora y comunidad en la palma de tu mano.",
  openGraph: {
    title: "Descarga misarroces | misarroces",
    description: "Recetas, cálculo de arroz milimétrico, bitácora y comunidad en la palma de tu mano.",
    images: ["/logopngver.png"],
  },
}

export default function DescargarPage() {
  return <DownloadClient />
}
