import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/domain/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mis Arroces",
  description: "Tu recetario de arroz, siempre contigo.",
  manifest: "/manifest.json",
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
      <body className={`${inter.className} antialiased bg-background text-foreground safe-area-pt safe-area-pb`}>
        {/* Mobile-first container: Restrict max-width on desktop for an app-like feel */}
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-card shadow-sm sm:border-x sm:border-border relative">
          
          <main className="flex-1 pb-16">
            {children}
          </main>
          
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
