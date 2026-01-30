// src/components/step-two/FormActions.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trash2, FileCheck, ArrowRight } from "lucide-react";

interface FormActionsProps {
  onReset: () => void;
  onGenerate: () => void;
  loading?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onReset,
  onGenerate,
  loading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="
        flex flex-col sm:flex-row justify-between items-center gap-4
        mt-8 pt-6
        border-t border-[var(--surface-border)] dark:border-white/[0.06]
      "
    >
      {/* Reset Button */}
      <motion.button
        type="button"
        onClick={onReset}
        className="
          w-full sm:w-auto
          inline-flex items-center justify-center gap-2
          px-5 py-3 rounded-xl
          text-sm font-medium
          text-[var(--foreground-secondary)]
          bg-[var(--surface)] dark:bg-white/[0.03]
          border border-[var(--surface-border)] dark:border-white/[0.06]
          hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.06]
          hover:text-[var(--error)]
          hover:border-[var(--error)]/30
          transition-all duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
          order-2 sm:order-1
        "
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Trash2 size={16} />
        Reiniciar
      </motion.button>

      {/* Generate Button */}
      <motion.button
        type="button"
        onClick={onGenerate}
        disabled={loading}
        className="
          w-full sm:w-auto
          inline-flex items-center justify-center gap-2.5
          px-8 py-3.5 rounded-xl
          text-base font-semibold
          text-white dark:text-[var(--background)]
          bg-[var(--foreground)] dark:bg-white
          shadow-lg shadow-black/10 dark:shadow-white/10
          hover:shadow-xl hover:shadow-black/15 dark:hover:shadow-white/15
          disabled:opacity-50 disabled:cursor-not-allowed
          disabled:shadow-none
          transition-all duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2
          group
          order-1 sm:order-2
        "
        whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generando...
          </>
        ) : (
          <>
            <FileCheck size={18} />
            Generar Reporte
            <ArrowRight
              size={16}
              className="
                opacity-60 -ml-0.5
                group-hover:opacity-100 group-hover:translate-x-0.5
                transition-all duration-200
              "
            />
          </>
        )}
      </motion.button>
    </motion.div>
  );
};
