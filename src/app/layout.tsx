import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/components/Providers";
import { ThemeScript } from "@/components/ui/ThemeScript";

export const metadata: Metadata = {
  title: "[EID] Generador Reportes JIRA",
  description: "Ejemplo minimalista con Next.js, Tailwind y TypeScript",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
