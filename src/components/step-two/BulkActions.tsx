"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Square,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface BulkActionsProps {
  totalItems: number;
  selectedItems: Set<number>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onSetStatusSelected: (status: string) => void;
  className?: string;
}

/**
 * Barra de acciones masivas para gestionar múltiples casos de prueba.
 */
export function BulkActions({
  totalItems,
  selectedItems,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  onDuplicateSelected,
  onSetStatusSelected,
  className = "",
}: BulkActionsProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedCount = selectedItems.size;
  const allSelected = selectedCount === totalItems && totalItems > 0;
  const someSelected = selectedCount > 0;

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusOptions = [
    { value: "Exitoso", label: "Exitoso", icon: CheckCircle, color: "text-[var(--success)]" },
    { value: "Fallido", label: "Fallido", icon: XCircle, color: "text-[var(--error)]" },
    { value: "Pendiente", label: "Pendiente", icon: Clock, color: "text-[var(--warning)]" },
  ];

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Selector de todos */}
      <div className="flex items-center gap-3">
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="
            flex items-center gap-2 px-3 py-2 rounded-lg
            text-sm font-medium
            bg-[var(--surface-hover)] dark:bg-white/5
            hover:bg-[var(--surface-active)] dark:hover:bg-white/10
            text-[var(--foreground-secondary)]
            transition-colors
          "
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-[var(--primary)]" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          <span>
            {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
          </span>
        </button>

        {someSelected && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="
              px-2.5 py-1 rounded-full
              bg-[var(--primary-soft)] text-[var(--primary)]
              text-xs font-medium
            "
          >
            {selectedCount} seleccionado{selectedCount > 1 ? "s" : ""}
          </motion.span>
        )}
      </div>

      {/* Acciones (solo visibles si hay selección) */}
      <AnimatePresence>
        {someSelected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-2"
          >
            {/* Cambiar estado */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="
                  flex items-center gap-2 px-3 py-2 rounded-lg
                  text-sm font-medium
                  bg-[var(--surface-hover)] dark:bg-white/5
                  hover:bg-[var(--surface-active)] dark:hover:bg-white/10
                  text-[var(--foreground-secondary)]
                  transition-colors
                "
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Estado</span>
              </button>

              <AnimatePresence>
                {showStatusMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="
                      absolute right-0 top-full mt-2 z-50
                      min-w-[160px] p-1.5
                      bg-[var(--surface)] dark:bg-[var(--surface)]
                      border border-[var(--surface-border)] dark:border-white/10
                      rounded-xl shadow-lg
                    "
                  >
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onSetStatusSelected(option.value);
                          setShowStatusMenu(false);
                        }}
                        className="
                          w-full flex items-center gap-2 px-3 py-2 rounded-lg
                          text-sm text-left
                          hover:bg-[var(--surface-hover)] dark:hover:bg-white/5
                          transition-colors
                        "
                      >
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                        <span className="text-[var(--foreground)]">{option.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Duplicar */}
            <button
              onClick={onDuplicateSelected}
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg
                text-sm font-medium
                bg-[var(--surface-hover)] dark:bg-white/5
                hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]
                text-[var(--foreground-secondary)]
                transition-colors
              "
              title="Duplicar seleccionados"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Duplicar</span>
            </button>

            {/* Eliminar */}
            <button
              onClick={onDeleteSelected}
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg
                text-sm font-medium
                bg-[var(--error-soft)] hover:bg-[var(--error)]
                text-[var(--error-soft-foreground)] hover:text-white
                transition-colors
              "
              title="Eliminar seleccionados"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>

            {/* Limpiar selección */}
            <button
              onClick={onDeselectAll}
              className="
                p-2 rounded-lg
                text-[var(--foreground-tertiary)]
                hover:bg-[var(--surface-hover)] dark:hover:bg-white/5
                hover:text-[var(--foreground)]
                transition-colors
              "
              title="Limpiar selección"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BulkActions;
