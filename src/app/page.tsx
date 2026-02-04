"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";
import { GridPattern, MorphingMesh } from "@/components/effects";
import { FilePlus2, ClipboardList } from "lucide-react";

/**
 * Landing Page Premium — Inspirada en Linear, Vercel, Stripe
 * Diseño minimalista con jerarquía visual clara y microinteracciones elegantes
 */
export default function Landing() {
  return (
    <>
      <HeaderNav />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <GridPattern fadeIntensity="strong" />

        {/* Morphing Gradient Mesh - Dark Mode */}
        <div className="dark:block hidden">
          <MorphingMesh
            colors={["#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4", "#6366F1", "#10B981"]}
            pointCount={6}
            blur={70}
            opacity={0.7}
            followMouse={true}
            variant="dark"
          />
        </div>

        {/* Morphing Gradient Mesh - Light Mode */}
        <div className="dark:hidden block">
          <MorphingMesh
            colors={["#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4", "#6366F1"]}
            pointCount={5}
            blur={90}
            opacity={0.5}
            followMouse={true}
            variant="light"
          />
        </div>
      </div>

      <main className="relative min-h-screen flex flex-col">
        {/* ========== HERO SECTION ========== */}
        <section className="relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            {/* Badge - Departamento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="
                inline-flex items-center gap-2 px-3 py-1.5 rounded-md
                bg-[var(--surface)] dark:bg-white/[0.05]
                border border-[var(--surface-border)] dark:border-white/[0.08]
                text-xs font-medium text-[var(--foreground-tertiary)] uppercase tracking-wider
              ">
                Dpto. Transferencia Desarrollo
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="
                text-3xl sm:text-4xl md:text-5xl
                font-semibold tracking-tight
                text-[var(--foreground)]
              "
            >
              Reportes y Tickets JIRA
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="
                mt-3 text-base sm:text-lg text-[var(--foreground-secondary)]
                max-w-xl mx-auto
              "
            >
              Generador de reportes de pruebas y creación de tickets JIRA
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <PrimaryButton href="/generate-report">
                <ClipboardList className="w-5 h-5" />
                Generar Reporte
              </PrimaryButton>

              <SecondaryButton href="/create-jira">
                <FilePlus2 className="w-5 h-5" />
                Crear JIRA
              </SecondaryButton>
            </motion.div>
          </div>
        </section>

        {/* ========== FEATURES SECTION ========== */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Feature Cards - Grid compacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Feature Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <FeatureCard
                  href="/generate-report"
                  icon={<ClipboardList className="w-5 h-5" />}
                  title="Generador de Reportes"
                  description="Reportes de pruebas con casos, resultados e incidencias. Copia al portapapeles en formato texto estructurado."
                  gradient="from-blue-600 to-blue-500"
                />
              </motion.div>

              {/* Feature Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <FeatureCard
                  href="/create-jira"
                  icon={<FilePlus2 className="w-5 h-5" />}
                  title="Crear Ticket JIRA"
                  description="Genera la estructura del ticket con descripción, pasos de reproducción y prioridad. Listo para pegar en JIRA."
                  gradient="from-violet-600 to-violet-500"
                />
              </motion.div>
            </div>

          </div>
        </section>
      </main>

      <FooterNav />
    </>
  );
}

/* ========================================================================== */
/* ==========================  INTERNAL COMPONENTS  ========================= */
/* ========================================================================== */

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="group">
      <motion.span
        className="
          inline-flex items-center justify-center gap-2.5
          px-6 py-3.5 rounded-xl
          text-base font-semibold text-white
          bg-[var(--foreground)] dark:bg-white dark:text-[var(--background)]
          shadow-lg shadow-black/10 dark:shadow-white/10
          transition-all duration-200
        "
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.span>
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="group">
      <motion.span
        className="
          inline-flex items-center justify-center gap-2.5
          px-6 py-3.5 rounded-xl
          text-base font-semibold
          text-[var(--foreground)] dark:text-white
          bg-[var(--surface)] dark:bg-white/[0.05]
          border border-[var(--surface-border)] dark:border-white/[0.1]
          shadow-sm
          transition-all duration-200
          hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.08]
          hover:border-[var(--foreground-muted)] dark:hover:border-white/[0.15]
        "
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.span>
    </Link>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
  gradient,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Link href={href} className="group block h-full">
      <motion.div
        className="
          relative h-full p-5 rounded-xl
          bg-[var(--surface)] dark:bg-[var(--surface)]/50
          border border-[var(--surface-border)] dark:border-white/[0.06]
          transition-all duration-200
          hover:border-[var(--foreground-muted)] dark:hover:border-white/[0.12]
        "
        whileHover={{ y: -1 }}
      >
        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`
            inline-flex items-center justify-center
            w-9 h-9 rounded-lg
            bg-gradient-to-br ${gradient}
            text-white
          `}>
            {icon}
          </div>
          <h3 className="text-base font-medium text-[var(--foreground)]">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
          {description}
        </p>
      </motion.div>
    </Link>
  );
}

