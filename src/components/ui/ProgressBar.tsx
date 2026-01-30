"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  progress?: number; // 0-100, si no se proporciona es indeterminado
  variant?: "default" | "gradient" | "glow";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

/**
 * Progress bar premium con modos determinado e indeterminado.
 * Incluye variantes con gradiente y efectos glow.
 */
export function ProgressBar({
  progress,
  variant = "default",
  size = "md",
  showLabel = false,
  label,
  className = "",
}: ProgressBarProps) {
  const isIndeterminate = progress === undefined;

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-[var(--primary)]",
    gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
    glow: "bg-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)]",
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[var(--foreground-secondary)]">
            {label || "Cargando..."}
          </span>
          {!isIndeterminate && (
            <span className="text-sm font-medium text-[var(--foreground)]">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}

      <div
        className={`
          w-full overflow-hidden rounded-full
          bg-[var(--surface-hover)] dark:bg-white/10
          ${sizeClasses[size]}
        `}
      >
        {isIndeterminate ? (
          // Modo indeterminado - animación continua
          <motion.div
            className={`h-full w-1/3 rounded-full ${variantClasses[variant]}`}
            animate={{
              x: ["-100%", "400%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ) : (
          // Modo determinado - progreso específico
          <motion.div
            className={`h-full rounded-full ${variantClasses[variant]}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Indicador de pasos para wizards/formularios multi-paso.
 */
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
  className = "",
}: StepIndicatorProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={stepNumber} className="flex items-center flex-1">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-colors duration-300
                  ${isCompleted
                    ? "bg-[var(--success)] text-white"
                    : isCurrent
                      ? "bg-[var(--primary)] text-white shadow-[0_0_15px_var(--primary-glow)]"
                      : "bg-[var(--surface-hover)] dark:bg-white/10 text-[var(--foreground-tertiary)]"
                  }
                `}
                animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </motion.div>
              {labels && labels[i] && (
                <span
                  className={`
                    mt-2 text-xs font-medium
                    ${isCurrent ? "text-[var(--primary)]" : "text-[var(--foreground-tertiary)]"}
                  `}
                >
                  {labels[i]}
                </span>
              )}
            </div>

            {/* Connector line */}
            {stepNumber < totalSteps && (
              <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-[var(--surface-hover)] dark:bg-white/10">
                <motion.div
                  className="h-full bg-[var(--success)]"
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProgressBar;
