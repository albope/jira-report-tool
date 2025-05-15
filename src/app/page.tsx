"use client";

import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";
// Importar iconos de lucide-react
import { FilePlus2, ClipboardList, ArrowRight } from "lucide-react";

/**
 * Landing Page — Estética Apple:
 * fondo gris claro, jerarquía tipográfica limpia,
 * botones azul sólido y outline azul.
 */
export default function Landing() {
  return (
    <>
      <HeaderNav />

      <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] px-4 overflow-hidden"> {/* Añadido overflow-hidden para contener animaciones */}
        {/* ---------- HERO ---------- */}
        <section className="text-center max-w-3xl py-20"> {/* Añadido py-20 para más espacio vertical */}
          {/* Título */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold text-gray-900 tracking-tight animate-fadeInUp">
            Herramienta de&nbsp;
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"> {/* Degradado ajustado ligeramente */}
              Reportes JIRA
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fadeInUp delay-100"> {/* Aumentado mt, max-w, leading y color */}
            Automatiza la creación de tickets JIRA o genera reportes detallados de pruebas de manera rápida y sencilla.
          </p>

          {/* CTA buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fadeInUp delay-200"> {/* Aumentado mt y gap */}
            <CTA href="/create-jira" variant="primary">
              <FilePlus2 size={22} className="mr-2.5" /> {/* Icono y margen */}
              Crear un nuevo JIRA
            </CTA>
            <CTA href="/generate-report" variant="outline">
              <ClipboardList size={22} className="mr-2.5" /> {/* Icono y margen */}
              Generar reporte de pruebas
            </CTA>
          </div>

          {/* Rainbow tagline opcional */}
          <p className="mt-16 text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-orange-500 to-emerald-500 animate-fadeInUp delay-300"> {/* Aumentado mt */}
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
  const baseClasses =
    "inline-flex items-center justify-center px-7 py-3.5 md:px-8 md:py-4 rounded-xl text-base md:text-lg font-semibold transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md"; // Ajustado padding, rounded, font-size, añadido focus y hover suave

  const variantClasses =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500" // Azul más brillante en hover
      : "border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white focus:ring-blue-500"; // Borde más grueso, hover fill

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses} group hover:-translate-y-0.5`}> {/* Efecto hover de elevación */}
      {children}
      {/* Podríamos añadir una flecha en hover para el botón primario, estilo Apple */}
      {variant === "primary" && <ArrowRight size={20} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>}
    </Link>
  );
}