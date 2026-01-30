"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  FileText,
  Settings,
  TestTube,
  Database,
  FileCode,
  BarChart3,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";

export interface Section {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
  isComplete?: boolean;
  hasError?: boolean;
}

interface MobileSectionNavProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
}

// Secciones predefinidas del formulario Step 2
export const defaultSections: Section[] = [
  { id: "general", label: "Info General", shortLabel: "General", icon: <FileText className="w-4 h-4" /> },
  { id: "environment", label: "Entorno", shortLabel: "Entorno", icon: <Settings className="w-4 h-4" /> },
  { id: "tests", label: "Casos de Prueba", shortLabel: "Tests", icon: <TestTube className="w-4 h-4" /> },
  { id: "testdata", label: "Datos de Prueba", shortLabel: "Datos", icon: <Database className="w-4 h-4" /> },
  { id: "logs", label: "Logs", shortLabel: "Logs", icon: <FileCode className="w-4 h-4" /> },
  { id: "summary", label: "Resumen", shortLabel: "Resumen", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "incidences", label: "Incidencias", shortLabel: "Inc.", icon: <AlertTriangle className="w-4 h-4" /> },
  { id: "conclusions", label: "Conclusiones", shortLabel: "Conc.", icon: <CheckSquare className="w-4 h-4" /> },
];

/**
 * Navegación horizontal scrolleable para secciones del formulario en móvil.
 * Muestra indicadores de completado y errores.
 */
export function MobileSectionNav({
  sections,
  activeSection,
  onSectionChange,
  className = "",
}: MobileSectionNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  // Scroll al tab activo cuando cambia
  useEffect(() => {
    const activeTab = document.getElementById(`tab-${activeSection}`);
    if (activeTab && scrollRef.current) {
      const container = scrollRef.current;
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;
      const containerWidth = container.offsetWidth;

      // Centrar el tab activo
      const targetScroll = tabLeft - containerWidth / 2 + tabWidth / 2;
      container.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  }, [activeSection]);

  // Actualizar gradientes según scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftGradient(scrollLeft > 10);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Gradiente izquierdo */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-8 z-10
          bg-gradient-to-r from-[var(--surface)] to-transparent
          pointer-events-none transition-opacity duration-200
          ${showLeftGradient ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Gradiente derecho */}
      <div
        className={`
          absolute right-0 top-0 bottom-0 w-8 z-10
          bg-gradient-to-l from-[var(--surface)] to-transparent
          pointer-events-none transition-opacity duration-200
          ${showRightGradient ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Tabs scrolleables */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="
          flex gap-1 overflow-x-auto scrollbar-hide
          px-1 py-2
          -mx-1
        "
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {sections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              id={`tab-${section.id}`}
              onClick={() => onSectionChange(section.id)}
              className={`
                relative flex items-center gap-1.5
                px-3 py-2 rounded-lg
                text-sm font-medium whitespace-nowrap
                transition-all duration-200
                flex-shrink-0
                ${isActive
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "bg-[var(--surface-hover)] dark:bg-white/5 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                }
              `}
            >
              {/* Icono */}
              <span className={isActive ? "text-white" : section.hasError ? "text-[var(--error)]" : ""}>
                {section.icon}
              </span>

              {/* Label */}
              <span className="hidden sm:inline">{section.label}</span>
              <span className="sm:hidden">{section.shortLabel || section.label}</span>

              {/* Indicador de completado */}
              {section.isComplete && !section.hasError && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="
                    absolute -top-1 -right-1
                    w-3 h-3 rounded-full
                    bg-[var(--success)] border-2 border-[var(--surface)]
                  "
                />
              )}

              {/* Indicador de error */}
              {section.hasError && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="
                    absolute -top-1 -right-1
                    w-3 h-3 rounded-full
                    bg-[var(--error)] border-2 border-[var(--surface)]
                  "
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MobileSectionNav;
