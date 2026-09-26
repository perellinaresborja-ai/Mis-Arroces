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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.webp?v=8", type: "image/webp" },
      { url: "/icons/icon-192x192.png?v=8", type: "image/png" },
      { url: "/icons/icon-512x512.png?v=8", sizes: "512x512", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png?v=8",
    shortcut: "/icons/icon-192x192.png?v=8"
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "misarroces",
    title: "misarroces | La red social de los arroces",
    description: "Descubre, guarda y comparte las mejores recetas de arroces y paellas.",
    images: [{
      url: "/logopngver.webp",
      width: 1200,
      height: 630,
      alt: "misarroces"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "misarroces | La red social de los arroces",
    description: "Descubre, guarda y comparte las mejores recetas de arroces y paellas.",
    images: ["/logopngver.webp"]
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
import { MultiAccountProvider } from "@/components/providers/MultiAccountProvider";
import { AccountSwitcherSheet } from "@/components/domain/AccountSwitcherSheet";
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
  let user: any = null;
  let pendingLegal = false;
  let avatarUrl: string | null = null;
  let initialUsername: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      user = authUser;
      pendingLegal = await checkPendingLegal(authUser.id);
      
      const { data } = await supabase.from('profiles')
        .select(`username, avatar:media_assets!fk_profiles_avatar(storage_path)`)
        .eq('id', authUser.id)
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  window.__deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    window.__deferredPrompt = e;
    try { window.dispatchEvent(new CustomEvent('pwa-prompt-ready')); } catch(err){}
  });
  window.addEventListener('appinstalled', function() {
    window.__deferredPrompt = null;
    try {
      localStorage.setItem('misarroces_pwa_installed', 'true');
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    } catch(err){}
  });
})();
`,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppSplashScreen />
          <UserSessionProvider initialUser={user} initialAvatarUrl={avatarUrl} initialUsername={initialUsername}>
            <MultiAccountProvider>
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
                  <AccountSwitcherSheet />
                  <SpeedInsights />
                </AuthPromptProvider>
              </PwaProvider>
            </MultiAccountProvider>
          </UserSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

