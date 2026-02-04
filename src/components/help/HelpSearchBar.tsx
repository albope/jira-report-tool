"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Command } from "lucide-react";

interface HelpSearchBarProps {
  query: string;
  onChange: (query: string) => void;
  resultsCount?: number;
  placeholder?: string;
  autoFocus?: boolean;
}

export function HelpSearchBar({
  query,
  onChange,
  resultsCount,
  placeholder = "Buscar en la ayuda...",
  autoFocus = false,
}: HelpSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Expose focus method via ref
  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="relative group">
        {/* Search Icon */}
        <Search
          className="
            absolute left-4 top-1/2 -translate-y-1/2
            w-5 h-5 text-[var(--foreground-tertiary)]
            group-focus-within:text-[var(--primary)]
            transition-colors
          "
        />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-24 py-3.5 rounded-xl
            bg-[var(--surface)] dark:bg-[var(--surface)]/80
            border border-[var(--surface-border)] dark:border-white/[0.08]
            text-[var(--foreground)] text-base
            placeholder:text-[var(--foreground-tertiary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50
            focus:border-[var(--primary)]
            hover:border-[var(--primary)]/30
            transition-all duration-200
            shadow-sm
          "
        />

        {/* Right side: Clear button or Shortcut hint */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <AnimatePresence mode="wait">
            {query ? (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onChange('')}
                className="
                  p-1.5 rounded-lg
                  text-[var(--foreground-tertiary)]
                  hover:text-[var(--foreground)]
                  hover:bg-[var(--surface-hover)]
                  transition-colors
                "
                title="Limpiar búsqueda"
              >
                <X size={18} />
              </motion.button>
            ) : (
              <motion.div
                key="shortcut"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="
                  flex items-center gap-1 px-2 py-1
                  bg-[var(--surface-hover)] dark:bg-white/[0.05]
                  rounded-md border border-[var(--surface-border)]
                  text-xs text-[var(--foreground-tertiary)]
                "
              >
                <Command size={12} />
                <span>K</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results count indicator */}
      <AnimatePresence>
        {query && resultsCount !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="
              absolute left-0 -bottom-6
              text-xs text-[var(--foreground-tertiary)]
            "
          >
            {resultsCount === 0 ? (
              <span className="text-[var(--warning)]">
                No se encontraron resultados
              </span>
            ) : (
              <span>
                {resultsCount} resultado{resultsCount !== 1 ? 's' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Export focus utility
export const focusHelpSearch = () => {
  const searchInput = document.querySelector<HTMLInputElement>('[data-help-search]');
  searchInput?.focus();
};
