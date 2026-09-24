import { Metadata } from "next"
import DownloadClient from "./DownloadClient"

export const metadata: Metadata = {
  title: "Descargar App | misarroces",
  description: "Instala la app oficial de misarroces en tu iPhone o Android. Acceso directo, pantalla completa y sin esperas.",
  openGraph: {
    title: "Descargar App | misarroces",
    description: "Instala la app oficial de misarroces en tu iPhone o Android.",
    images: ["/logopaellaicono.png"],
  },
}

export default function DescargarPage() {
  return <DownloadClient />
}
