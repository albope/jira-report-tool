"use client";

import { motion } from "framer-motion";
import { Download, FileText, Loader2, Check } from "lucide-react";

export type ExportFormat = "docx";

interface ExportMenuProps {
  onExport: (format: ExportFormat) => Promise<void>;
  isExporting: boolean;
  exportingFormat: ExportFormat | null;
  lastExportSuccess: ExportFormat | null;
  className?: string;
}

/**
 * Botón de exportación a Word.
 */
export function ExportMenu({
  onExport,
  isExporting,
  exportingFormat,
  lastExportSuccess,
  className = "",
}: ExportMenuProps) {
  const isCurrentExporting = isExporting && exportingFormat === "docx";
  const wasLastSuccess = lastExportSuccess === "docx";

  const handleExport = async () => {
    await onExport("docx");
  };

  return (
    <motion.button
      onClick={handleExport}
      disabled={isExporting}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative overflow-hidden
        flex items-center gap-2 px-6 py-3
        ${wasLastSuccess
          ? "bg-gradient-to-r from-[var(--success)] to-[var(--success-hover)]"
          : "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] hover:from-[var(--primary-hover)] hover:to-[var(--primary)]"
        }
        text-white font-semibold rounded-xl
        shadow-lg ${wasLastSuccess ? "shadow-[var(--success)]/25" : "shadow-[var(--primary)]/25"}
        hover:shadow-xl
        transition-all duration-300
        disabled:opacity-70 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {/* Efecto de brillo */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {isCurrentExporting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : wasLastSuccess ? (
        <Check className="w-5 h-5" />
      ) : (
        <FileText className="w-5 h-5" />
      )}
      <span>
        {isCurrentExporting
          ? "Exportando..."
          : wasLastSuccess
          ? "¡Exportado!"
          : "Exportar a Word"
        }
      </span>
    </motion.button>
  );
}

export default ExportMenu;
