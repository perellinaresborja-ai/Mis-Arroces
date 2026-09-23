import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "misarroces | Enlaces",
  description: "La red social de los arroces. Crea tu recetario e importa tus recetas de Instagram.",
}

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return children
}
