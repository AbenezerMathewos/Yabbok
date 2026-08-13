import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/frontend/context/LanguageContext";
import { ThemeProvider } from "@/frontend/context/ThemeProvider";
import { AuthProvider } from "@/frontend/context/AuthContext";

const inter = { className: "" };

export const metadata: Metadata = {
  title: "YABBOK - Youths Strong Fellowship Platform",
  description: "Bilingual fellowship platform uniting youth members across Kale Hiywet Churches in Ethiopia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

