"use client";

import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";

/**
 * Landing Page — Estética Apple:
 * fondo gris claro, jerarquía tipográfica limpia,
 * botones azul sólido y outline azul.
 */
export default function Landing() {
  return (
    <>
      <HeaderNav />

      <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] px-4">
        {/* ---------- HERO ---------- */}
        <section className="text-center max-w-3xl">
          {/* Título */}
          <h1 className="text-6xl md:text-7xl font-semibold text-gray-900 tracking-tight">
            Herramienta de&nbsp;
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Reportes JIRA
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="mt-4 text-2xl text-gray-700">
          Automatiza la creación de tickets JIRA o genera reportes detallados de pruebas de manera rápida y sencilla.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <CTA href="/create-jira" variant="primary">
              ➕ Crear un nuevo JIRA
            </CTA>
            <CTA href="/generate-report" variant="outline">
              📝 Generar reporte de pruebas
            </CTA>
          </div>

          {/* Rainbow tagline opcional */}
          <p className="mt-10 text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-orange-500 to-emerald-500">
          Selecciona según el caso · Creación de JIRAs o generación de reportes de prueba
          </p>
        </section>
      </main>

      <FooterNav />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* --------------------------  Botón reutilizable  -------------------------- */
/* -------------------------------------------------------------------------- */
function CTA({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "primary" | "outline";
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold transition-colors duration-150";
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
      : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}