import { NextResponse } from "next/server"

export async function GET() {
  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "es.misarroces.app",
        sha256_cert_fingerprints: [
          // Se completa con la huella digital SHA-256 de Google Play App Signing
          // Ejemplo: "14:6D:E9:..."
          process.env.ANDROID_SHA256_FINGERPRINT || "__SUBSTITUIR_POR_HUELLA_SHA256_GOOGLE_PLAY__"
        ]
      }
    }
  ]

  return new NextResponse(JSON.stringify(assetLinks, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  })
}
