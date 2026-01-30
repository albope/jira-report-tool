"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout,
  Check,
  FileText,
  Briefcase,
  Zap,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import type { Template } from "./types";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  className?: string;
}

// Templates predefinidos
const templates: Template[] = [
  {
    id: "default",
    name: "Estándar",
    description: "Formato completo con todas las secciones",
    isDefault: true,
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Solo información esencial",
  },
  {
    id: "executive",
    name: "Ejecutivo",
    description: "Resumen para stakeholders",
  },
  {
    id: "technical",
    name: "Técnico",
    description: "Detalle técnico completo con logs",
  },
];

const templateIcons: Record<string, React.ReactNode> = {
  default: <FileText className="w-5 h-5" />,
  minimal: <Zap className="w-5 h-5" />,
  executive: <Briefcase className="w-5 h-5" />,
  technical: <Layout className="w-5 h-5" />,
};

/**
 * Selector de templates para el reporte.
 */
export function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
  className = "",
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0];

  return (
    <div className={`relative ${className}`}>
      {/* Botón del selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-3 px-4 py-2.5 w-full
          bg-[var(--surface-hover)] dark:bg-white/5
          hover:bg-[var(--surface-active)] dark:hover:bg-white/10
          border border-[var(--surface-border)] dark:border-white/10
          rounded-xl transition-colors
          text-left
        "
      >
        <span className="p-2 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
          {templateIcons[currentTemplate.id]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)]">
            {currentTemplate.name}
          </p>
          <p className="text-xs text-[var(--foreground-tertiary)] truncate">
            {currentTemplate.description}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[var(--foreground-tertiary)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para cerrar */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="
                absolute left-0 right-0 top-full mt-2 z-50
                p-2
                bg-[var(--surface)] dark:bg-[var(--surface)]
                border border-[var(--surface-border)] dark:border-white/10
                rounded-xl shadow-xl
                backdrop-blur-xl
              "
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2 mb-1">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-xs font-medium text-[var(--foreground-secondary)]">
                  Selecciona un template
                </span>
              </div>

              {/* Opciones */}
              {templates.map((template, index) => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <motion.button
                    key={template.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onTemplateChange(template.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg
                      text-left transition-colors
                      ${isSelected
                        ? "bg-[var(--primary-soft)] dark:bg-[var(--primary)]/10"
                        : "hover:bg-[var(--surface-hover)] dark:hover:bg-white/5"
                      }
                    `}
                  >
                    <span
                      className={`
                        p-2 rounded-lg
                        ${isSelected
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--surface-hover)] dark:bg-white/5 text-[var(--foreground-secondary)]"
                        }
                      `}
                    >
                      {templateIcons[template.id]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${
                            isSelected ? "text-[var(--primary)]" : "text-[var(--foreground)]"
                          }`}
                        >
                          {template.name}
                        </p>
                        {template.isDefault && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[var(--surface-hover)] dark:bg-white/10 text-[var(--foreground-tertiary)] rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--foreground-tertiary)] mt-0.5">
                        {template.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TemplateSelector;
