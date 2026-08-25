import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/frontend/context/LanguageContext";
import { ThemeProvider } from "@/frontend/context/ThemeProvider";
import { AuthProvider } from "@/frontend/context/AuthContext";
import { AudioProvider } from "@/frontend/context/AudioContext";
import { GlobalAudioPlayer } from "@/frontend/components/shared/GlobalAudioPlayer";
import { ServiceWorkerRegister } from "@/frontend/components/shared/ServiceWorkerRegister";
import { Geist } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { ScrollProgress } from "@/components/ui/scroll-progress";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "YABBOK - Youths Strong Fellowship Platform",
  description: "Bilingual fellowship platform uniting youth members across Kale Hiywet Churches in Ethiopia.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable, plusJakarta.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <LanguageProvider>
              <AudioProvider>
                <ScrollProgress />
                <SmoothScroll>
                  {children}
                </SmoothScroll>
                <GlobalAudioPlayer />
                <ServiceWorkerRegister />
                <Toaster 
                  richColors 
                  position="top-right" 
                  toastOptions={{
                    style: {
                      background: 'var(--slate-900)',
                      color: 'var(--gold-400)',
                      border: '1px solid var(--slate-800)',
                    },
                    className: 'font-sans font-bold shadow-2xl',
                  }}
                />
              </AudioProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
