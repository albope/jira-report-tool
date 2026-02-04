"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ThumbsUp } from "lucide-react";

interface HelpProgressTrackerProps {
  itemId: string;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
  variant?: "default" | "compact" | "inline";
}

export function HelpProgressTracker({
  itemId,
  isCompleted,
  onToggleComplete,
  variant = "default",
}: HelpProgressTrackerProps) {
  if (variant === "inline") {
    return (
      <motion.button
        onClick={() => onToggleComplete(itemId)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
          text-xs font-medium transition-all
          ${isCompleted
            ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
            : 'bg-[var(--surface-hover)] text-[var(--foreground-tertiary)] border border-[var(--surface-border)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)]'
          }
        `}
      >
        {isCompleted ? (
          <>
            <CheckCircle2 size={14} />
            <span>Completado</span>
          </>
        ) : (
          <>
            <Circle size={14} />
            <span>Marcar</span>
          </>
        )}
      </motion.button>
    );
  }

  if (variant === "compact") {
    return (
      <motion.button
        onClick={() => onToggleComplete(itemId)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          text-sm font-medium transition-all
          ${isCompleted
            ? 'bg-[var(--success)] text-white shadow-md shadow-[var(--success)]/20'
            : 'bg-[var(--surface-hover)] text-[var(--foreground-secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'
          }
        `}
      >
        {isCompleted ? (
          <CheckCircle2 size={16} />
        ) : (
          <Circle size={16} />
        )}
        <span>{isCompleted ? '¡Entendido!' : 'Marcar como entendido'}</span>
      </motion.button>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`
        flex items-center justify-between gap-4 p-4 mt-6
        rounded-xl border transition-all
        ${isCompleted
          ? 'bg-[var(--success)]/5 border-[var(--success)]/20'
          : 'bg-[var(--primary-soft)] dark:bg-[var(--primary)]/5 border-[var(--primary)]/20'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
            className="p-2 bg-[var(--success)]/10 rounded-lg"
          >
            <ThumbsUp size={20} className="text-[var(--success)]" />
          </motion.div>
        ) : (
          <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
            <CheckCircle2 size={20} className="text-[var(--primary)]" />
          </div>
        )}
        <div>
          <p className={`text-sm font-medium ${isCompleted ? 'text-[var(--success)]' : 'text-[var(--foreground)]'}`}>
            {isCompleted ? '¡Sección completada!' : '¿Has entendido esta sección?'}
          </p>
          <p className="text-xs text-[var(--foreground-tertiary)]">
            {isCompleted
              ? 'Puedes desmarcarla si necesitas revisarla de nuevo'
              : 'Marca como entendido para registrar tu progreso'
            }
          </p>
        </div>
      </div>

      <motion.button
        onClick={() => onToggleComplete(itemId)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          shrink-0 px-5 py-2.5 rounded-xl
          text-sm font-semibold transition-all
          ${isCompleted
            ? 'bg-[var(--surface)] text-[var(--foreground-secondary)] border border-[var(--surface-border)] hover:bg-[var(--surface-hover)]'
            : 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30'
          }
        `}
      >
        {isCompleted ? 'Desmarcar' : 'Entendido'}
      </motion.button>
    </motion.div>
  );
}
