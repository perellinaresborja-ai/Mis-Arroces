import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/domain/BottomNav";
import { DesktopNav } from "@/components/domain/DesktopNav";

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
      <body className={`${inter.className} antialiased bg-background text-foreground safe-area-pt safe-area-pb overflow-x-hidden`}>
        {/* Desktop Header */}
        <DesktopNav />
        
        {/* Responsive global container */}
        <div className="flex min-h-screen w-full flex-col bg-background relative max-w-7xl mx-auto px-0 md:px-8">
          <main className="flex-1 pb-20 md:pb-8">
            {children}
          </main>
          
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
