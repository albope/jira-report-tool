"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Sparkles, Play } from "lucide-react";
import { TourStep } from "@/types/help";

interface InteractiveTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function InteractiveTour({ steps, isOpen, onComplete, onSkip }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen || steps.length === 0) return null;

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200]"
      >
        {/* Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onSkip}
        />

        {/* Tour Card */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            key={step.id}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="
              w-full max-w-lg
              bg-[var(--surface)] dark:bg-[var(--surface)]/95
              border border-[var(--surface-border)] dark:border-white/[0.08]
              rounded-2xl shadow-2xl
              overflow-hidden
              pointer-events-auto
            "
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-[var(--primary)] to-purple-600 p-6 text-white">
              <button
                onClick={onSkip}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Saltar tour"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles size={20} />
                </div>
                <span className="text-sm font-medium text-white/80">
                  Paso {currentStep + 1} de {steps.length}
                </span>
              </div>

              <h3 className="text-xl font-bold">
                {step.title}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                {step.content}
              </p>
            </div>

            {/* Footer with navigation */}
            <div className="px-6 pb-6 flex items-center justify-between">
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {steps.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={`
                      h-2 rounded-full transition-all duration-300
                      ${idx === currentStep
                        ? 'w-8 bg-[var(--primary)]'
                        : idx < currentStep
                          ? 'w-2 bg-[var(--success)]'
                          : 'w-2 bg-[var(--surface-border)]'
                      }
                    `}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-2">
                {!isFirstStep && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrev}
                    className="
                      px-4 py-2 rounded-xl
                      text-sm font-medium
                      text-[var(--foreground-secondary)]
                      hover:bg-[var(--surface-hover)]
                      transition-colors
                      flex items-center gap-1
                    "
                  >
                    <ArrowLeft size={16} />
                    Anterior
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="
                    px-5 py-2 rounded-xl
                    text-sm font-semibold
                    bg-[var(--primary)] text-white
                    hover:bg-[var(--primary-hover)]
                    shadow-lg shadow-[var(--primary)]/20
                    transition-colors
                    flex items-center gap-2
                  "
                >
                  {isLastStep ? (
                    <>
                      ¡Comenzar!
                      <Sparkles size={16} />
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Tour Start Button Component
interface TourStartButtonProps {
  onClick: () => void;
  className?: string;
}

export function TourStartButton({ onClick, className = "" }: TourStartButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-xl
        bg-gradient-to-r from-[var(--primary)] to-purple-600
        text-white text-sm font-semibold
        shadow-lg shadow-[var(--primary)]/20
        hover:shadow-xl hover:shadow-[var(--primary)]/30
        transition-all
        ${className}
      `}
    >
      <Play size={16} fill="currentColor" />
      Iniciar Tour Guiado
    </motion.button>
  );
}

// Default tour steps
export const defaultTourSteps: TourStep[] = [
  {
    id: "welcome",
    target: "#help-hero",
    title: "¡Bienvenido al Centro de Ayuda!",
    content: "Aquí encontrarás todo lo que necesitas para dominar la herramienta de reportes JIRA. Te guiaré por las secciones principales.",
    placement: "center",
  },
  {
    id: "search",
    target: "#help-search",
    title: "Búsqueda Rápida",
    content: "Usa la barra de búsqueda para encontrar rápidamente lo que necesitas. También puedes presionar Ctrl+K desde cualquier lugar.",
    placement: "bottom",
  },
  {
    id: "quick-start",
    target: "#quick-start",
    title: "Inicio Rápido",
    content: "Estas tarjetas te llevan directamente a las dos funciones principales: crear un nuevo JIRA o generar un reporte de pruebas.",
    placement: "bottom",
  },
  {
    id: "sidebar",
    target: "#help-sidebar",
    title: "Tu Progreso",
    content: "La barra lateral muestra tu progreso. Marca las secciones como 'entendidas' para trackear lo que ya has aprendido.",
    placement: "right",
  },
  {
    id: "sections",
    target: "#jira-guide",
    title: "Guías Detalladas",
    content: "Cada sección incluye pasos detallados, capturas de pantalla y tips útiles. ¡No dudes en explorarlas!",
    placement: "top",
  },
  {
    id: "complete",
    target: "#help-hero",
    title: "¡Listo para empezar!",
    content: "Ahora conoces lo básico. Explora las guías a tu ritmo y marca tu progreso. ¡Buena suerte!",
    placement: "center",
  },
];
