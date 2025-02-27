// NO uses "use client" aquí
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Generador de Reportes JIRA",
  description: "Ejemplo minimalista con Next.js, Tailwind y TypeScript",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}