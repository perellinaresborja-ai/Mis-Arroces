import { notFound } from "next/navigation"
import { getGiveawayByCertificate } from "@/app/actions/giveaways"
import { CertificateView } from "./CertificateView"

interface SorteoPageProps {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: SorteoPageProps) {
  const resolvedParams = await params
  const giveaway = await getGiveawayByCertificate(resolvedParams.code)

  if (!giveaway) {
    return {
      title: "Certificado no encontrado | misarroces",
      robots: { index: false, follow: false },
    }
  }

  const organizerName = giveaway.organizer?.display_name || giveaway.organizer?.username || "un arrocero"
  const isDrawn = giveaway.status === "DRAWN"
  const winnersCount = (giveaway.results || []).filter(r => r.role === "WINNER").length

  const title = `Certificado Oficial: ${giveaway.title} | misarroces`
  const description = isDrawn
    ? `Certificado oficial del sorteo "${giveaway.title}" organizado por @${giveaway.organizer?.username}. Ganadores certificados con tecnología criptográfica transparente.`
    : `Bases y certificado del sorteo "${giveaway.title}" organizado por @${giveaway.organizer?.username} en misarroces. Premio: ${giveaway.prize}.`

  const canonicalUrl = `https://www.misarroces.es/sorteos/${giveaway.certificate_code}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "misarroces",
      images: [
        {
          url: "https://www.misarroces.es/logopngver.webp",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://www.misarroces.es/logopngver.webp"],
    },
  }
}

export default async function SorteoCertificatePage({ params }: SorteoPageProps) {
  const resolvedParams = await params
  const giveaway = await getGiveawayByCertificate(resolvedParams.code)

  if (!giveaway) {
    notFound()
  }

  return <CertificateView giveaway={giveaway} />
}
