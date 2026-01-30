"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";

interface ValidationError {
  field: string;
  message: string;
  section?: string;
}

interface ValidationSummaryProps {
  errors: ValidationError[];
  warnings?: ValidationError[];
  onErrorClick?: (field: string) => void;
  onDismiss?: () => void;
  collapsible?: boolean;
  className?: string;
}

/**
 * Panel de resumen de validación que muestra errores y advertencias.
 * Permite navegación a campos específicos al hacer clic.
 */
export function ValidationSummary({
  errors,
  warnings = [],
  onErrorClick,
  onDismiss,
  collapsible = true,
  className = "",
}: ValidationSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          p-4 rounded-xl
          bg-[var(--success-soft)] border border-[var(--success)]/30
          ${className}
        `}
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[var(--success)]" />
          <p className="text-sm font-medium text-[var(--success-soft-foreground)]">
            Todos los campos requeridos están completos
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-xl overflow-hidden
        ${hasErrors
          ? "bg-[var(--error-soft)] border border-[var(--error)]/30"
          : "bg-[var(--warning-soft)] border border-[var(--warning)]/30"
        }
        ${className}
      `}
    >
      {/* Header */}
      <div
        className={`
          flex items-center justify-between p-4
          ${collapsible ? "cursor-pointer" : ""}
        `}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className={`w-5 h-5 ${hasErrors ? "text-[var(--error)]" : "text-[var(--warning)]"}`} />
          <div>
            <p className={`text-sm font-medium ${hasErrors ? "text-[var(--error-soft-foreground)]" : "text-[var(--warning-soft-foreground)]"}`}>
              {hasErrors
                ? `${errors.length} campo${errors.length > 1 ? "s" : ""} requiere${errors.length > 1 ? "n" : ""} atención`
                : `${warnings.length} advertencia${warnings.length > 1 ? "s" : ""}`
              }
            </p>
            {!isExpanded && (
              <p className="text-xs text-[var(--foreground-tertiary)] mt-0.5">
                Haz clic para ver detalles
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-[var(--foreground-tertiary)]" />
            </button>
          )}
          {collapsible && (
            <span className="text-[var(--foreground-tertiary)]">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {/* Errors */}
              {errors.map((error, index) => (
                <motion.button
                  key={`error-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onErrorClick?.(error.field)}
                  className="
                    w-full flex items-start gap-3 p-3 rounded-lg
                    bg-white/50 dark:bg-black/20
                    hover:bg-white/80 dark:hover:bg-black/30
                    transition-colors text-left
                  "
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {error.message}
                    </p>
                    {error.section && (
                      <p className="text-xs text-[var(--foreground-tertiary)] mt-0.5">
                        Sección: {error.section}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}

              {/* Warnings */}
              {warnings.map((warning, index) => (
                <motion.button
                  key={`warning-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (errors.length + index) * 0.05 }}
                  onClick={() => onErrorClick?.(warning.field)}
                  className="
                    w-full flex items-start gap-3 p-3 rounded-lg
                    bg-white/50 dark:bg-black/20
                    hover:bg-white/80 dark:hover:bg-black/30
                    transition-colors text-left
                  "
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {warning.message}
                    </p>
                    {warning.section && (
                      <p className="text-xs text-[var(--foreground-tertiary)] mt-0.5">
                        Sección: {warning.section}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ValidationSummary;
