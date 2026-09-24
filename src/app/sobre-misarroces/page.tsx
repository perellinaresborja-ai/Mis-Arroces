import type { Metadata } from "next"
import SobreMisArrocesClient from "./SobreMisArrocesClient"

export const metadata: Metadata = {
  title: "¿Qué es misarroces? | misarroces",
  description: "La comunidad y el recetario digital para los apasionados del arroz. Descubre, crea, organiza y comparte tus arroces en un solo lugar.",
}

export default function SobreMisArroces() {
  return <SobreMisArrocesClient />
}

