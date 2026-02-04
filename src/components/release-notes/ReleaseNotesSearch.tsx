"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Command, Sparkles, TrendingUp, Bug, Palette } from "lucide-react";
import { ChangeType } from "@/types/releaseNotes";
import { changeTypeStyles } from "@/utils/releaseNotesData";

interface ReleaseNotesSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  typeFilter: ChangeType | "all";
  onTypeFilterChange: (type: ChangeType | "all") => void;
  resultsCount?: number;
  placeholder?: string;
}

const filterOptions: Array<{ type: ChangeType | "all"; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { type: "all", label: "Todos", icon: Search },
  { type: "feat", label: "Nuevo", icon: Sparkles },
  { type: "impr", label: "Mejoras", icon: TrendingUp },
  { type: "fix", label: "Fixes", icon: Bug },
  { type: "style", label: "UX", icon: Palette },
];

export function ReleaseNotesSearch({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  resultsCount,
  placeholder = "Buscar en release notes...",
}: ReleaseNotesSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        onQueryChange("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onQueryChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Search input */}
      <div className="relative group">
        <Search
          className="
            absolute left-4 top-1/2 -translate-y-1/2
            w-5 h-5 text-[var(--foreground-tertiary)]
            group-focus-within:text-[var(--primary)]
            transition-colors
          "
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
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

        {/* Right side controls */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <AnimatePresence mode="wait">
            {query ? (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onQueryChange("")}
                className="
                  p-1.5 rounded-lg
                  text-[var(--foreground-tertiary)]
                  hover:text-[var(--foreground)]
                  hover:bg-[var(--surface-hover)]
                  transition-colors
                "
                title="Limpiar búsqueda (Esc)"
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

      {/* Filter chips */}
      <div className="
        flex flex-wrap gap-2 p-3
        bg-[var(--surface)]/50 dark:bg-[var(--surface)]/30
        border border-[var(--surface-border)] dark:border-white/[0.04]
        rounded-xl
      ">
        {filterOptions.map(({ type, label, icon: Icon }) => {
          const isActive = typeFilter === type;
          const style = type !== "all" ? changeTypeStyles[type] : null;

          return (
            <motion.button
              key={type}
              onClick={() => onTypeFilterChange(type)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5
                text-sm font-medium rounded-lg
                transition-all duration-200
                ${isActive
                  ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
                  : `
                    bg-[var(--surface)] dark:bg-white/[0.05]
                    ${style ? style.text : "text-[var(--foreground-secondary)]"}
                    hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.08]
                    border border-[var(--surface-border)] dark:border-white/[0.06]
                  `
                }
              `}
            >
              <Icon size={14} />
              {label}
            </motion.button>
          );
        })}
      </div>

      {/* Results count */}
      <AnimatePresence>
        {query && resultsCount !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-[var(--foreground-tertiary)]"
          >
            {resultsCount === 0 ? (
              <span className="text-[var(--warning)]">
                No se encontraron resultados para &quot;{query}&quot;
              </span>
            ) : (
              <span>
                {resultsCount} versión{resultsCount !== 1 ? "es" : ""} encontrada{resultsCount !== 1 ? "s" : ""}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
