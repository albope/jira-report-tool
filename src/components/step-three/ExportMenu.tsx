"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Clipboard,
  FileText,
  FileCode,
  FileType,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";

export type ExportFormat = "clipboard" | "docx" | "html" | "pdf";

interface ExportOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface ExportMenuProps {
  onExport: (format: ExportFormat) => Promise<void>;
  isExporting: boolean;
  exportingFormat: ExportFormat | null;
  lastExportSuccess: ExportFormat | null;
  className?: string;
}

const exportOptions: ExportOption[] = [
  {
    id: "clipboard",
    label: "Copiar para JIRA",
    description: "Copia el formato JIRA al portapapeles",
    icon: <Clipboard className="w-4 h-4" />,
  },
  {
    id: "docx",
    label: "Exportar a Word",
    description: "Descarga documento .docx",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "html",
    label: "Exportar HTML",
    description: "Descarga archivo .html",
    icon: <FileCode className="w-4 h-4" />,
  },
  {
    id: "pdf",
    label: "Exportar PDF",
    description: "Descarga documento .pdf",
    icon: <FileType className="w-4 h-4" />,
  },
];

/**
 * Menú desplegable de opciones de exportación.
 */
export function ExportMenu({
  onExport,
  isExporting,
  exportingFormat,
  lastExportSuccess,
  className = "",
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setIsOpen(false);
    await onExport(format);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="
          group relative overflow-hidden
          flex items-center gap-2 px-6 py-3
          bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)]
          hover:from-[var(--primary-hover)] hover:to-[var(--primary)]
          text-white font-semibold rounded-xl
          shadow-lg shadow-[var(--primary)]/25
          hover:shadow-xl hover:shadow-[var(--primary)]/30
          transition-all duration-300
          disabled:opacity-70 disabled:cursor-not-allowed
        "
      >
        {/* Efecto de brillo */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {isExporting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        <span>{isExporting ? "Exportando..." : "Exportar"}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Menú desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute right-0 top-full mt-2 z-50
              w-72 p-2
              bg-[var(--surface)] dark:bg-[var(--surface)]
              border border-[var(--surface-border)] dark:border-white/10
              rounded-xl shadow-xl
              backdrop-blur-xl
            "
          >
            {exportOptions.map((option, index) => {
              const isCurrentExporting = isExporting && exportingFormat === option.id;
              const wasLastSuccess = lastExportSuccess === option.id;

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleExport(option.id)}
                  disabled={isExporting}
                  className="
                    w-full flex items-start gap-3 p-3 rounded-lg
                    text-left
                    hover:bg-[var(--surface-hover)] dark:hover:bg-white/5
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  <span
                    className={`
                      flex-shrink-0 p-2 rounded-lg
                      ${wasLastSuccess
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : "bg-[var(--surface-hover)] dark:bg-white/5 text-[var(--foreground-secondary)]"
                      }
                    `}
                  >
                    {isCurrentExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : wasLastSuccess ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      option.icon
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {option.label}
                    </p>
                    <p className="text-xs text-[var(--foreground-tertiary)] mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExportMenu;
