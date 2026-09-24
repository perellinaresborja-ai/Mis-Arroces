import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/domain/BottomNav";
import { DesktopNav } from "@/components/domain/DesktopNav";
import { MobileHeader } from "@/components/domain/MobileHeader";
import { AuthPromptProvider } from "@/components/providers/AuthPromptProvider";
import { PwaProvider } from "@/components/providers/PwaProvider";
import { createClient } from "@/lib/supabase/server";
import { checkPendingLegal } from "@/app/actions/legal";
import { LegalConsentGate } from "@/components/domain/LegalConsentGate";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.misarroces.es'),
  verification: {
    google: "AVdmp5VSHlvt4qJ1TNYIVBm7fJ9a_oMdwDhp8gfDmQo",
  },
  title: {
    default: "misarroces | La red social de los arroces",
    template: "%s | misarroces"
  },
  description: "Descubre, guarda y comparte las mejores recetas de arroces y paellas. Únete a la comunidad de chefs arroceros y muestra tus paellas al mundo.",
  keywords: ["arroz", "paella", "recetas", "red social", "cocina", "chef", "paella valenciana", "gastronomía", "arroces"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "misarroces",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "misarroces",
    title: "misarroces | La red social de los arroces",
    description: "Descubre, guarda y comparte las mejores recetas de arroces y paellas.",
    images: [{
      url: "/logopaellaicono.png",
      width: 1200,
      height: 630,
      alt: "misarroces"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "misarroces | La red social de los arroces",
    description: "Descubre, guarda y comparte las mejores recetas de arroces y paellas.",
    images: ["/logopaellaicono.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F5F0", // Fondo crema oficial
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { UserSessionProvider } from "@/components/providers/UserSessionProvider";
import { CookieConsentBanner } from "@/components/domain/CookieConsentBanner";
import { AcquisitionProvider } from "@/components/providers/AcquisitionProvider";
import { GA4Loader } from "@/components/domain/GA4Loader";
import { AppSplashScreen } from "@/components/domain/AppSplashScreen";
import { Suspense } from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let pendingLegal = false;
  let avatarUrl: string | null = null;
  let initialUsername: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      pendingLegal = await checkPendingLegal(user.id);
      
      const { data } = await supabase.from('profiles')
        .select(`username, avatar:media_assets!fk_profiles_avatar(storage_path)`)
        .eq('id', user.id)
        .single();
      
      initialUsername = data?.username || null;
      const avatarPath = Array.isArray(data?.avatar) ? data.avatar[0]?.storage_path : data?.avatar?.storage_path;
      if (avatarPath) {
        avatarUrl = avatarPath.startsWith('http') ? avatarPath : `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/${avatarPath}`;
      }
    }
  } catch(e) {}
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background text-foreground safe-area-pt safe-area-pb overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppSplashScreen />
          <UserSessionProvider initialAvatarUrl={avatarUrl} initialUsername={initialUsername}>
            <PwaProvider>
              <AuthPromptProvider>
                <Suspense fallback={null}>
                  <GA4Loader />
                  <AcquisitionProvider />
                </Suspense>
                <LegalConsentGate pendingLegal={pendingLegal} />
                <CookieConsentBanner />
                {/* Desktop Header */}
                <DesktopNav />
                {/* Mobile Header */}
                <MobileHeader />
                
                {/* Responsive global container */}
                <div className="flex min-h-[100dvh] md:min-h-[calc(100vh-64px)] w-full flex-col bg-background relative max-w-7xl mx-auto px-0 md:px-8">
                  <main className="flex-1 w-full pb-16 md:pb-0 pt-0">
                    {children}
                  </main>
                </div>
                
                {/* Mobile Navigation */}
                <BottomNav />
                <SpeedInsights />
              </AuthPromptProvider>
            </PwaProvider>
          </UserSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
