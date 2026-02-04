// src/components/ui/KeyboardShortcutsHelp.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard, Command, ArrowUp } from "lucide-react";
import { formatShortcutKeys } from "@/hooks/useKeyboardShortcuts";

/**
 * Shortcuts disponibles en la aplicación
 */
const SHORTCUTS = [
  {
    category: "Navegación",
    items: [
      { keys: "Alt+H", description: "Ir al inicio" },
      { keys: "Ctrl+Enter", description: "Siguiente paso / Generar reporte" },
      { keys: "Escape", description: "Cerrar modal o panel" },
    ],
  },
  {
    category: "Acciones",
    items: [
      { keys: "Ctrl+S", description: "Guardar reporte en historial" },
      { keys: "Ctrl+Shift+C", description: "Copiar reporte al portapapeles" },
    ],
  },
  {
    category: "Formulario",
    items: [
      { keys: "Alt+1", description: "Ir a sección 1 (Preparación)" },
      { keys: "Alt+2", description: "Ir a sección 2 (Ejecución)" },
      { keys: "Alt+3", description: "Ir a sección 3 (Batería)" },
      { keys: "Alt+4", description: "Ir a sección 4 (Conclusiones)" },
    ],
  },
  {
    category: "Ayuda",
    items: [
      { keys: "F1", description: "Mostrar esta ayuda" },
      { keys: "?", description: "Mostrar esta ayuda (alternativa)" },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  // Detectar si es Mac
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="
                w-full max-w-lg
                bg-[var(--surface)] dark:bg-[#1a1a1a]
                rounded-2xl
                border border-[var(--surface-border)] dark:border-white/10
                shadow-2xl
                overflow-hidden
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-border)] dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">
                      Atajos de Teclado
                    </h2>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Navega más rápido con el teclado
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="
                    p-2 rounded-lg
                    text-[var(--foreground-secondary)]
                    hover:text-[var(--foreground)]
                    hover:bg-[var(--surface-hover)]
                    transition-colors
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                {/* Nota sobre teclas */}
                {isMac && (
                  <div className="mb-4 p-3 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 text-sm flex items-center gap-2">
                    <Command className="w-4 h-4 flex-shrink-0" />
                    <span>En Mac, usa ⌘ (Cmd) en lugar de Ctrl</span>
                  </div>
                )}

                {/* Categorías de shortcuts */}
                <div className="space-y-6">
                  {SHORTCUTS.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-sm font-medium text-[var(--foreground-secondary)] uppercase tracking-wider mb-3">
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.items.map((shortcut, index) => (
                          <ShortcutRow
                            key={index}
                            keys={shortcut.keys}
                            description={shortcut.description}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-[var(--surface-hover)] dark:bg-white/5 border-t border-[var(--surface-border)] dark:border-white/10">
                <p className="text-xs text-[var(--foreground-tertiary)] text-center">
                  Presiona <kbd className="kbd">Esc</kbd> o <kbd className="kbd">?</kbd> para cerrar
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Fila de shortcut individual
 */
function ShortcutRow({ keys, description }: { keys: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--surface-hover)] dark:hover:bg-white/5 transition-colors">
      <span className="text-[var(--foreground)]">{description}</span>
      <KeyCombo keys={keys} />
    </div>
  );
}

/**
 * Muestra una combinación de teclas con estilo
 */
function KeyCombo({ keys }: { keys: string }) {
  const parts = keys.split("+");
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  return (
    <div className="flex items-center gap-1">
      {parts.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="kbd">
            {formatKey(key, isMac)}
          </kbd>
          {index < parts.length - 1 && (
            <span className="text-[var(--foreground-tertiary)]">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Formatea una tecla individual para mostrar
 */
function formatKey(key: string, isMac: boolean): string {
  const k = key.toLowerCase();
  if (k === "ctrl" || k === "control") return isMac ? "⌘" : "Ctrl";
  if (k === "alt") return isMac ? "⌥" : "Alt";
  if (k === "shift") return "⇧";
  if (k === "enter") return "↵";
  if (k === "escape" || k === "esc") return "Esc";
  if (k === "?") return "?";
  if (k === "/") return "/";
  return key.toUpperCase();
}

// Estilos CSS para las teclas
// Agregar al archivo globals.css o como style tag
export const keyboardStyles = `
.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--foreground);
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.dark .kbd {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}
`;
