// app/help/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUpCircle,
  ExternalLink,
  HelpCircle,
  FileText,
  Sparkles,
} from "lucide-react";

// New Help Components
import {
  HelpSearchBar,
  HelpSidebar,
  HelpProgressTracker,
  InteractiveTour,
  TourStartButton,
  defaultTourSteps,
  KeyboardShortcutsModal,
} from "@/components/help";

// Hooks
import { useHelpProgress } from "@/hooks/useHelpProgress";
import { useHelpSearch } from "@/hooks/useHelpSearch";
import { useHelpKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Data
import { helpContentItems } from "@/utils/helpContent";

export default function HelpPage() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const {
    progress,
    isLoaded,
    toggleComplete,
    isCompleted,
    resetProgress,
    getProgressPercentage,
  } = useHelpProgress();

  const {
    query,
    setQuery,
    filteredItems,
    resultsCount,
    clearSearch,
  } = useHelpSearch(helpContentItems);

  // Keyboard shortcuts
  useHelpKeyboardShortcuts({
    onSearch: () => searchInputRef.current?.focus(),
    onShowShortcuts: () => setShowShortcuts(true),
    onEscape: () => {
      if (showShortcuts) setShowShortcuts(false);
      else if (showTour) setShowTour(false);
      else if (lightboxImage) setLightboxImage(null);
      else if (query) clearSearch();
    },
  });

  // Scroll handler
  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 300);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Check if first visit for tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("help-tour-completed");
    if (!hasSeenTour && isLoaded) {
      // Delay tour start slightly
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem("help-tour-completed", "true");
  };

  const progressPercentage = getProgressPercentage(helpContentItems.length);

  return (
    <>
      <HeaderNav />

      <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen bg-[var(--background)]">
        <div className="max-w-7xl mx-auto flex gap-8">
          {/* Sidebar */}
          <HelpSidebar
            items={helpContentItems}
            progress={progress}
            activeSection={activeSection}
            onNavigate={scrollToSection}
            onResetProgress={resetProgress}
          />

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-w-0 space-y-10"
          >
            {/* Search Bar - Sticky */}
            <div className="sticky top-20 z-30 bg-[var(--background)]/80 backdrop-blur-xl py-4 -mx-2 px-2 rounded-xl" id="help-search">
              <HelpSearchBar
                query={query}
                onChange={setQuery}
                resultsCount={query ? resultsCount : undefined}
              />
            </div>

            {/* Hero Section */}
            <section className="text-center space-y-6" id="help-hero">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                className="
                  mx-auto w-20 h-20 rounded-2xl
                  bg-gradient-to-br from-[var(--primary)] to-purple-600
                  flex items-center justify-center
                  shadow-xl shadow-[var(--primary)]/30
                "
              >
                <HelpCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] tracking-tight">
                Centro de Ayuda
              </h1>
              <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
                Encuentra guías, respuestas y consejos para sacar el máximo provecho a nuestra herramienta.
              </p>

              {/* Progress indicator */}
              {isLoaded && progressPercentage > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--success)]/10 border border-[var(--success)]/20"
                >
                  <Sparkles size={16} className="text-[var(--success)]" />
                  <span className="text-sm font-medium text-[var(--success)]">
                    {progressPercentage}% completado
                  </span>
                </motion.div>
              )}

              {/* Tour button */}
              <div className="pt-2">
                <TourStartButton onClick={() => setShowTour(true)} />
              </div>

              {/* Quick Start Cards */}
              <div className="grid gap-6 sm:grid-cols-2 pt-6" id="quick-start">
                <QuickStartCard
                  title="Crear un JIRA"
                  desc="Aprende a generar tickets JIRA estructurados y completos desde cero."
                  href="/create-jira"
                  icon={<Info size={24} className="text-[var(--primary)]" />}
                />
                <QuickStartCard
                  title="Generar Reporte"
                  desc="Descubre cómo crear reportes detallados a partir del contenido de un JIRA existente."
                  href="/generate-report"
                  icon={<FileText size={24} className="text-[var(--success)]" />}
                />
              </div>
            </section>

            {/* Table of Contents */}
            <nav
              aria-label="Tabla de contenidos"
              className="
                p-6 rounded-2xl
                bg-[var(--surface)] dark:bg-[var(--surface)]/80
                border border-[var(--surface-border)] dark:border-white/[0.06]
                shadow-lg dark:shadow-2xl
                backdrop-blur-xl
              "
            >
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center">
                <Search size={20} className="mr-3 text-[var(--primary)]" />
                Índice Detallado
              </h2>
              <ul className="space-y-2">
                {[
                  { href: "#jira-guide", label: "A. Guía: Plantilla para crear un JIRA", id: "jira-intro" },
                  { href: "#report-guide", label: "B. Guía: Plantilla para reportar pruebas", id: "report-intro" },
                  { href: "#faq", label: "C. Preguntas Frecuentes (FAQ)", id: "faq-when-to-use" },
                ].map((item) => (
                  <li key={item.href}>
                    <button
                      onClick={() => scrollToSection(item.href.slice(1))}
                      className="
                        w-full text-left
                        text-[var(--primary)] hover:text-[var(--primary-hover)]
                        text-base py-2 flex items-center
                        transition-colors rounded-lg px-3
                        hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]
                      "
                    >
                      <ExternalLink size={16} className="mr-2 opacity-70" />
                      {item.label}
                      {isCompleted(item.id) && (
                        <CheckCircle size={16} className="ml-auto text-[var(--success)]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* A. CREAR UN JIRA */}
            <HelpSection id="jira-guide" title="A. Crear un JIRA desde cero">
              <p className="text-[var(--foreground-secondary)] text-base">
                Usa este formulario cuando la incidencia aún no existe en JIRA y
                necesitas documentarla completamente.
              </p>
              <HelpProgressTracker
                itemId="jira-intro"
                isCompleted={isCompleted("jira-intro")}
                onToggleComplete={toggleComplete}
                variant="inline"
              />

              <SubStep number={1} title="Datos básicos" id="jira-step-1">
                <FieldBullet name="Proyecto" note="Nombre del proyecto (i.e ATMV, MLO...)." />
                <FieldBullet name="Herramienta" note="Aplicativo o herramienta afectada." />
                <FieldBullet name="Descripción breve del error" note="Frase concisa describiendo el problema." />
                <ImageShow src="/help/jira-basic.png" alt="Paso 1 – Datos básicos" onImageClick={setLightboxImage} />
                <Tip type="info">
                  El título final se genera automáticamente combinando estos tres
                  campos: <em>PROYECTO – Herramienta – Descripción</em>.
                </Tip>
                <HelpProgressTracker
                  itemId="jira-step-1"
                  isCompleted={isCompleted("jira-step-1")}
                  onToggleComplete={toggleComplete}
                  variant="compact"
                />
              </SubStep>

              <SubStep number={2} title="Detalle del problema" id="jira-step-2">
                <FieldBullet name="Descripción del problema" note="Detallar el problema/error identificado de forma detallada." />
                <FieldBullet name="Pasos para reproducir" note="Describir los pasos llevados a cabo para reproducir el error." />
                <FieldBullet name="Resultado esperado" note="Describir lo que se esperaría si el comportamiento del aplicativo fuese correcto." />
                <FieldBullet name="Resultado real" note="Describir el comportamiento actual del aplicativo." />
                <FieldBullet name="Impacto del error" note="Selecciona Crítico / Alto / …" />
                <ImageShow src="/help/jira-problem.png" alt="Paso 2 – Detalle" onImageClick={setLightboxImage} />
                <HelpProgressTracker
                  itemId="jira-step-2"
                  isCompleted={isCompleted("jira-step-2")}
                  onToggleComplete={toggleComplete}
                  variant="compact"
                />
              </SubStep>

              <SubStep number={3} title="Entorno de pruebas" id="jira-step-3">
                <FieldBullet name="Servidor de pruebas" note="Nombre del servidor donde se han realizado las pruebas." />
                <FieldBullet name="IP Cliente" note="IP del servidor donde se han realizado las pruebas." />
                <FieldBullet name="Navegador" note="Chrome, Edge, Mozilla..." />
                <FieldBullet name="Base de datos" note="Selecciona la BD sobre la que se han realizado las pruebas." />
                <FieldBullet name="Entorno" note="Desarrollo / UAT / PRE / PROD…" />
                <Tip type="warning">
                  Haz clic en «✕» en el formulario de creación para ocultar un campo de entorno que no aplique a tu caso.
                </Tip>
                <HelpProgressTracker
                  itemId="jira-step-3"
                  isCompleted={isCompleted("jira-step-3")}
                  onToggleComplete={toggleComplete}
                  variant="compact"
                />
              </SubStep>

              <SubStep number={4} title="Versiones y campos extra" id="jira-step-4">
                <FieldBullet name="Versiones de aplicativos/componentes" note="Añade tantas como necesites." />
                <FieldBullet name="Campos personalizados" note="Introduce el campo y contenido que desees para el entorno." />
                <HelpProgressTracker
                  itemId="jira-step-4"
                  isCompleted={isCompleted("jira-step-4")}
                  onToggleComplete={toggleComplete}
                  variant="compact"
                />
              </SubStep>

              <SubStep number={5} title="Finalizar" id="jira-step-5">
                <p className="text-[var(--foreground-secondary)]">
                  Usa <strong className="text-[var(--foreground)]">Copiar contenido del JIRA</strong> para enviar el
                  texto a JIRA, o <strong className="text-[var(--foreground)]">Reiniciar formulario</strong> si deseas
                  empezar de nuevo.
                </p>
                <Tip type="success">
                  La sección <em>Evidencias</em> se añade automáticamente al
                  final del contenido copiado para que puedas adjuntar capturas, logs, etc., directamente en JIRA.
                </Tip>
                <HelpProgressTracker
                  itemId="jira-step-5"
                  isCompleted={isCompleted("jira-step-5")}
                  onToggleComplete={toggleComplete}
                  variant="compact"
                />
              </SubStep>
            </HelpSection>

            {/* B. REPORTE DE PRUEBAS */}
            <HelpSection id="report-guide" title="B. Reporte de pruebas (JIRA existente)">
              <p className="text-[var(--foreground-secondary)] text-base">
                Empléalo cuando el ticket ya existe en JIRA y quieres documentar
                las pruebas realizadas.
              </p>
              <HelpProgressTracker
                itemId="report-intro"
                isCompleted={isCompleted("report-intro")}
                onToggleComplete={toggleComplete}
                variant="inline"
              />

              <SubStep number={1} title="Pegar contenido del JIRA" id="report-step-1">
                <p className="text-[var(--foreground-secondary)]">
                  Copia todo el cuerpo del ticket y pégalo en el cuadro <em>Paso 1</em>. También puedes introducir el código del JIRA para obtener el título automáticamente.
                </p>
                <ImageShow src="/help/report-paste.png" alt="Reporte Paso 1" onImageClick={setLightboxImage} />
                <HelpProgressTracker
                  itemId="report-step-1"
                  isCompleted={isCompleted("report-step-1")}
                  onToggleComplete={toggleComplete}
                  variant="compact"
                />
              </SubStep>

              <SubStep number={2} title="Completar información de pruebas" id="report-step-2">
                <FieldBullet name="Fecha de prueba" />
                <FieldBullet name="Tester" />
                <FieldBullet name="Entorno de pruebas completo" />
                <FieldBullet name="Versiones de aplicativos/componentes" />
                <FieldBullet name="Batería / Casos de prueba detallados" />
                <Tip type="info">
                  Todos los campos son opcionales, pero completarlos mejora la trazabilidad
                  para auditorías y facilita a desarrollo la identificación de errores.
                </Tip>
                <HelpProgressTracker
                  itemId="report-step-2"
                  isCompleted={isCompleted("report-step-2")}
                  onToggleComplete={toggleComplete}
                  variant="compact"
                />
              </SubStep>

              <SubStep number={3} title="Generar y exportar" id="report-step-3">
                <p className="text-[var(--foreground-secondary)]">
                  Verifica el Markdown y usa el botón <strong className="text-[var(--foreground)]">Copiar y Exportar a Word</strong>. Esto te proporcionará:
                </p>
                <ul className="list-disc list-inside ml-4 text-[var(--foreground-secondary)] space-y-1 mt-2">
                  <li>El contenido en formato Markdown copiado a tu portapapeles, listo para pegar como comentario en JIRA.</li>
                  <li>Un archivo `.docx` (Word) descargado, que puedes adjuntar al ticket de JIRA como evidencia formal.</li>
                </ul>
                <ImageShow src="/help/report-export.png" alt="Reporte Paso 3" onImageClick={setLightboxImage} />
                <HelpProgressTracker
                  itemId="report-step-3"
                  isCompleted={isCompleted("report-step-3")}
                  onToggleComplete={toggleComplete}
                  variant="compact"
                />
              </SubStep>
            </HelpSection>

            {/* FAQ */}
            <HelpSection id="faq" title="C. Preguntas Frecuentes (FAQ)">
              <FAQItem
                question="¿Cuándo debo usar Crear un JIRA y cuándo Generar un reporte?"
                id="faq-when-to-use"
                isCompleted={isCompleted("faq-when-to-use")}
                onToggleComplete={toggleComplete}
              >
                <p>
                  <strong className="text-[var(--foreground)]">Crear un JIRA:</strong> Utiliza esta opción cuando la incidencia aún no existe en JIRA y necesitas documentarla desde cero, incluyendo todos los detalles técnicos, pasos para reproducir, impacto y entorno de pruebas. Es ideal para reportar nuevos bugs o proponer nuevas tareas.
                </p>
                <p className="mt-2">
                  <strong className="text-[var(--foreground)]">Generar un reporte:</strong> Usa esta opción cuando el JIRA ya está creado (por ti o por otra persona) y necesitas añadir un comentario formal sobre las pruebas realizadas, validar funcionalidades, documentar la evolución de un error, o adjuntar un informe de pruebas completo. Esta opción es clave para la trazabilidad y auditorías.
                </p>
              </FAQItem>

              <FAQItem
                question="¿Cómo puedo asegurarme de que mi reporte sea claro y completo?"
                id="faq-clear-report"
                isCompleted={isCompleted("faq-clear-report")}
                onToggleComplete={toggleComplete}
              >
                <ul className="list-disc list-inside space-y-1">
                  <li>Incluye siempre <strong className="text-[var(--foreground)]">pasos detallados</strong> para reproducir el error.</li>
                  <li>Añade <strong className="text-[var(--foreground)]">versiones exactas</strong> de los componentes para evitar ambigüedades.</li>
                  <li>Describe tanto el <strong className="text-[var(--foreground)]">resultado esperado</strong> como el <strong className="text-[var(--foreground)]">resultado real</strong> de forma concisa.</li>
                  <li>Usa <strong className="text-[var(--foreground)]">capturas y logs</strong> en la sección de Evidencias para aportar contexto visual y técnico.</li>
                  <li>Verifica que el impacto esté correctamente clasificado (<strong className="text-[var(--foreground)]">Crítico</strong>, <strong className="text-[var(--foreground)]">Alto</strong>, <strong className="text-[var(--foreground)]">Medio</strong>, <strong className="text-[var(--foreground)]">Bajo</strong>, <strong className="text-[var(--foreground)]">Visual</strong>, <strong className="text-[var(--foreground)]">Mejora</strong>).</li>
                  <li>Si generas un reporte sobre un JIRA existente, asegúrate de que tu reporte añade valor y actualiza el estado de las pruebas.</li>
                </ul>
              </FAQItem>

              <FAQItem
                question="¿Puedo personalizar los campos del entorno en los reportes?"
                id="faq-custom-fields"
                isCompleted={isCompleted("faq-custom-fields")}
                onToggleComplete={toggleComplete}
              >
                <p>
                  ¡Sí! Tanto en la creación de un nuevo JIRA como en la generación de reportes sobre JIRAs existentes, puedes añadir &quot;Campos Personalizados del Entorno&quot;. Esto te permite incluir cualquier información específica de tu entorno que no esté cubierta por los campos estándar (ej. &quot;Versión del Driver X&quot;, &quot;Configuración Específica Y&quot;). Estos campos aparecerán en la sección &quot;Entorno de Pruebas&quot; de tu reporte.
                </p>
              </FAQItem>

              <FAQItem
                question="¿Qué hago si la obtención automática del título del JIRA falla?"
                id="faq-title-error"
                isCompleted={isCompleted("faq-title-error")}
                onToggleComplete={toggleComplete}
              >
                <p>
                  Si al introducir el código del JIRA en el <em>Paso 1</em> del generador de reportes la herramienta no puede obtener el título automáticamente (por ejemplo, debido a problemas de conexión, permisos, o si el JIRA no existe), no te preocupes.
                </p>
                <p className="mt-2">
                  La aplicación te mostrará un mensaje de error y habilitará un área de texto para que puedas pegar manualmente el contenido completo de tu JIRA. Aunque el título no se cargue, podrás continuar con el proceso de generación del reporte introduciendo los datos manualmente.
                </p>
              </FAQItem>
            </HelpSection>

            {/* Footer */}
            <div className="text-center text-sm text-[var(--foreground-tertiary)] pt-8 border-t border-[var(--surface-border)]">
              ¿Necesitas ayuda adicional o tienes alguna sugerencia? Usa el botón flotante &quot;Feedback + Bugs&quot;
              o escribe a&nbsp;
              <a href="mailto:abort.etraid@grupoetra.com" className="text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline transition-colors">
                abort.etraid@grupoetra.com
              </a>.
            </div>
          </motion.div>
        </div>
      </main>

      <FooterNav />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <Image
                src={lightboxImage}
                alt="Vista ampliada"
                width={1200}
                height={800}
                style={{ objectFit: "contain", maxWidth: "90vw", maxHeight: "90vh" }}
                className="rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="
              fixed bottom-6 right-6
              bg-[var(--primary)] text-white
              p-3 rounded-full
              shadow-lg shadow-[var(--primary-glow)]
              hover:bg-[var(--primary-hover)]
              transition-colors z-50
            "
            title="Volver arriba"
          >
            <ArrowUpCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Interactive Tour */}
      <InteractiveTour
        steps={defaultTourSteps}
        isOpen={showTour}
        onComplete={handleTourComplete}
        onSkip={() => {
          setShowTour(false);
          localStorage.setItem("help-tour-completed", "true");
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  );
}

/* Sub-components */

function QuickStartCard({
  title,
  desc,
  href,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        flex flex-col items-center text-center
        bg-[var(--surface)] dark:bg-[var(--surface)]/80
        hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]
        border border-[var(--surface-border)] dark:border-white/[0.06]
        hover:border-[var(--primary)]/30
        rounded-2xl p-6
        shadow-lg dark:shadow-2xl
        hover:shadow-xl hover:shadow-[var(--primary-glow)]
        transition-all duration-300
        group
      "
    >
      <div className="
        mb-4 p-3 rounded-xl
        bg-[var(--primary-soft)] dark:bg-[var(--primary)]/10
        group-hover:scale-110 transition-transform
      ">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-[var(--foreground-secondary)] text-sm flex-1 mb-4">{desc}</p>
      <span className="mt-auto inline-flex items-center text-[var(--primary)] font-medium text-sm group-hover:text-[var(--primary-hover)]">
        Abrir Guía
        <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
}

function HelpSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="
        space-y-6 p-6 sm:p-8
        bg-[var(--surface)] dark:bg-[var(--surface)]/80
        border border-[var(--surface-border)] dark:border-white/[0.06]
        rounded-2xl shadow-lg dark:shadow-2xl
        backdrop-blur-xl
        scroll-mt-28
      "
    >
      <h2 className="text-2xl font-bold text-[var(--foreground)] border-b border-[var(--surface-border)] pb-4">
        {title}
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
}

function SubStep({
  number,
  title,
  id,
  children,
}: {
  number: number;
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="
        space-y-4 p-5
        border-l-4 border-[var(--primary)]
        bg-[var(--primary-soft)] dark:bg-[var(--primary)]/5
        rounded-r-xl
        scroll-mt-28
      "
    >
      <h3 className="text-xl font-semibold text-[var(--primary)]">
        Paso {number}. {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function FieldBullet({ name, note }: { name: string; note?: string }) {
  return (
    <p className="flex items-start text-[var(--foreground-secondary)] text-sm">
      <span className="mt-0.5 mr-3 text-[var(--success)]">
        <CheckCircle size={16} />
      </span>
      <span>
        <strong className="font-medium text-[var(--foreground)]">{name}</strong>
        {note && <span className="text-[var(--foreground-tertiary)]"> — {note}</span>}
      </span>
    </p>
  );
}

type TipType = "info" | "warning" | "success" | "danger";

function Tip({ children, type = "info" }: { children: React.ReactNode; type?: TipType }) {
  const styles = {
    info: {
      icon: <Info size={18} />,
      border: "border-[var(--primary)]",
      bg: "bg-[var(--primary-soft)] dark:bg-[var(--primary)]/10",
      text: "text-[var(--primary)]",
    },
    warning: {
      icon: <AlertTriangle size={18} />,
      border: "border-[var(--warning)]",
      bg: "bg-[var(--warning-soft)] dark:bg-[var(--warning)]/10",
      text: "text-[var(--warning)]",
    },
    success: {
      icon: <CheckCircle size={18} />,
      border: "border-[var(--success)]",
      bg: "bg-[var(--success-soft)] dark:bg-[var(--success)]/10",
      text: "text-[var(--success)]",
    },
    danger: {
      icon: <AlertTriangle size={18} />,
      border: "border-[var(--error)]",
      bg: "bg-[var(--error-soft)] dark:bg-[var(--error)]/10",
      text: "text-[var(--error)]",
    },
  };

  const style = styles[type];

  return (
    <div className={`border-l-4 ${style.border} ${style.bg} p-4 rounded-r-xl my-4 flex items-start`}>
      <div className={`mr-3 flex-shrink-0 ${style.text}`}>{style.icon}</div>
      <div className={`text-sm ${style.text}`}>
        {children}
      </div>
    </div>
  );
}

function ImageShow({ src, alt, onImageClick }: { src: string; alt: string; onImageClick: (src: string) => void }) {
  return (
    <div className="my-6 text-center">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={450}
        className="
          rounded-xl
          border-2 border-[var(--surface-border)]
          shadow-lg hover:shadow-xl
          transition-shadow cursor-pointer mx-auto
          hover:border-[var(--primary)]/30
        "
        onClick={() => onImageClick(src)}
      />
      <p className="text-xs text-[var(--foreground-tertiary)] mt-2 italic">{alt} (Haz clic para ampliar)</p>
    </div>
  );
}

function FAQItem({
  question,
  id,
  isCompleted,
  onToggleComplete,
  children,
}: {
  question: string;
  id: string;
  isCompleted?: boolean;
  onToggleComplete?: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <details
      id={id}
      className="
        group
        bg-[var(--surface-hover)] dark:bg-white/[0.03]
        p-4 rounded-xl
        border border-[var(--surface-border)] dark:border-white/[0.06]
        hover:border-[var(--primary)]/30
        transition-colors
        scroll-mt-28
      "
    >
      <summary className="
        font-semibold text-base text-[var(--foreground)]
        cursor-pointer list-none
        flex justify-between items-center gap-2
        group-hover:text-[var(--primary)]
        transition-colors
      ">
        <span className="flex-1">{question}</span>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <CheckCircle size={16} className="text-[var(--success)]" />
          )}
          <span className="text-[var(--primary)] transform transition-transform duration-300 group-open:rotate-180">
            <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
              <path d="M6 9l6 6 6-6"></path>
            </svg>
          </span>
        </div>
      </summary>
      <div className="mt-3 pt-3 border-t border-[var(--surface-border)] text-[var(--foreground-secondary)] text-sm space-y-2">
        {children}
        {onToggleComplete && (
          <div className="mt-4 pt-3 border-t border-[var(--surface-border)]/50">
            <HelpProgressTracker
              itemId={id}
              isCompleted={isCompleted ?? false}
              onToggleComplete={onToggleComplete}
              variant="inline"
            />
          </div>
        )}
      </div>
    </details>
  );
}
