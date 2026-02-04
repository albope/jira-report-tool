"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard, Command } from "lucide-react";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category?: string;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts: KeyboardShortcut[] = [
  { keys: ["Ctrl", "K"], description: "Abrir búsqueda", category: "Navegación" },
  { keys: ["Esc"], description: "Cerrar modal / Limpiar búsqueda", category: "Navegación" },
  { keys: ["?"], description: "Ver atajos de teclado", category: "Navegación" },
  { keys: ["↑"], description: "Sección anterior", category: "Navegación" },
  { keys: ["↓"], description: "Siguiente sección", category: "Navegación" },
  { keys: ["Home"], description: "Ir al inicio", category: "Navegación" },
  { keys: ["End"], description: "Ir al final", category: "Navegación" },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="
              relative w-full max-w-md
              bg-[var(--surface)] dark:bg-[var(--surface)]/95
              border border-[var(--surface-border)] dark:border-white/[0.08]
              rounded-2xl shadow-2xl
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--surface-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[var(--primary-soft)] dark:bg-[var(--primary)]/10 rounded-xl">
                  <Keyboard className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    Atajos de Teclado
                  </h3>
                  <p className="text-xs text-[var(--foreground-tertiary)]">
                    Navega más rápido con el teclado
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="
                  p-2 rounded-lg
                  text-[var(--foreground-tertiary)]
                  hover:text-[var(--foreground)]
                  hover:bg-[var(--surface-hover)]
                  transition-colors
                "
              >
                <X size={20} />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-[var(--foreground-tertiary)] uppercase tracking-wider mb-3">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="
                          flex items-center justify-between
                          p-3 rounded-xl
                          bg-[var(--surface-hover)] dark:bg-white/[0.03]
                          border border-transparent
                          hover:border-[var(--primary)]/20
                          transition-colors
                        "
                      >
                        <span className="text-sm text-[var(--foreground-secondary)]">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, kidx) => (
                            <span key={kidx} className="flex items-center">
                              {kidx > 0 && (
                                <span className="text-[var(--foreground-tertiary)] mx-1 text-xs">+</span>
                              )}
                              <kbd
                                className="
                                  min-w-[28px] h-7 px-2
                                  inline-flex items-center justify-center
                                  bg-[var(--surface)] dark:bg-[var(--surface)]/80
                                  border border-[var(--surface-border)] dark:border-white/[0.1]
                                  rounded-md shadow-sm
                                  text-xs font-mono font-medium
                                  text-[var(--foreground)]
                                "
                              >
                                {key === 'Ctrl' ? (
                                  <span className="flex items-center gap-0.5">
                                    <Command size={12} />
                                  </span>
                                ) : key}
                              </kbd>
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--surface-border)] bg-[var(--surface-hover)]/50">
              <p className="text-xs text-center text-[var(--foreground-tertiary)]">
                Pulsa <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--surface-border)] rounded text-[10px] mx-1">Esc</kbd> para cerrar
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
