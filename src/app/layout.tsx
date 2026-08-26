import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/domain/BottomNav";
import { DesktopNav } from "@/components/domain/DesktopNav";
import { AuthPromptProvider } from "@/components/providers/AuthPromptProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Mis Arroces | La red social de los arroces",
    template: "%s | Mis Arroces"
  },
  description: "Descubre, guarda y comparte las mejores recetas de arroces y paellas. nete a la comunidad de chefs arroceros.",
  manifest: "/manifest.json",
  keywords: ["arroz", "paella", "recetas", "red social", "cocina", "chef"],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://misarroces.com",
    siteName: "Mis Arroces",
    title: "Mis Arroces | La red social de los arroces",
    description: "Descubre, guarda y comparte las mejores recetas de arroces y paellas.",
    images: [{
      url: "/logohor.png",
      width: 1200,
      height: 630,
      alt: "Mis Arroces Logo"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Mis Arroces | La red social de los arroces",
    description: "Descubre, guarda y comparte las mejores recetas de arroces y paellas.",
    images: ["/logohor.png"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F7F2E8", // Cream background
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-background text-foreground safe-area-pt safe-area-pb overflow-x-hidden`}>
        <AuthPromptProvider>
          {/* Desktop Header */}
          <DesktopNav />
          
          {/* Responsive global container */}
          <div className="flex min-h-screen w-full flex-col bg-background relative max-w-7xl mx-auto px-0 md:px-8">
            <main className="flex-1 pb-20 md:pb-8">
              {children}
            </main>
            
            <BottomNav />
          </div>
        </AuthPromptProvider>
      </body>
    </html>
  );
}

