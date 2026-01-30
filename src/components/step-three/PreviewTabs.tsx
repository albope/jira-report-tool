"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, FileCode, FileType, Clipboard } from "lucide-react";
import type { PreviewFormat } from "./types";

interface PreviewTabsProps {
  activeFormat: PreviewFormat;
  onFormatChange: (format: PreviewFormat) => void;
  className?: string;
}

const formats: { id: PreviewFormat; label: string; icon: React.ReactNode }[] = [
  { id: "jira", label: "JIRA", icon: <Clipboard className="w-4 h-4" /> },
  { id: "word", label: "Word", icon: <FileText className="w-4 h-4" /> },
  { id: "html", label: "HTML", icon: <FileCode className="w-4 h-4" /> },
  { id: "pdf", label: "PDF", icon: <FileType className="w-4 h-4" /> },
];

/**
 * Tabs para seleccionar el formato de preview del reporte.
 */
export function PreviewTabs({
  activeFormat,
  onFormatChange,
  className = "",
}: PreviewTabsProps) {
  return (
    <div
      className={`
        relative flex gap-1 p-1.5 rounded-xl
        bg-[var(--surface-hover)] dark:bg-white/5
        border border-[var(--surface-border)] dark:border-white/10
        ${className}
      `}
    >
      {formats.map((format) => {
        const isActive = activeFormat === format.id;
        return (
          <button
            key={format.id}
            onClick={() => onFormatChange(format.id)}
            className={`
              relative z-10 flex items-center justify-center gap-2
              px-4 py-2 rounded-lg font-medium text-sm
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50
              ${isActive
                ? "text-[var(--foreground)]"
                : "text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)]"
              }
            `}
          >
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="previewTabIndicator"
                  className="absolute inset-0 bg-[var(--surface)] dark:bg-[var(--surface)] rounded-lg shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </AnimatePresence>
            <span className="relative z-10 flex items-center gap-2">
              {format.icon}
              <span className="hidden sm:inline">{format.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default PreviewTabs;
