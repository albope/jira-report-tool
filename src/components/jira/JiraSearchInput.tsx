// src/components/jira/JiraSearchInput.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, X, ExternalLink, User, AlertCircle } from "lucide-react";
import { useJiraSearch } from "@/hooks/useJiraSearch";
import { useJira } from "@/contexts/JiraContext";
import type { JiraIssue } from "@/types/jira";

interface JiraSearchInputProps {
  /** Callback cuando se selecciona un issue */
  onSelect: (issue: JiraIssue) => void;
  /** Placeholder del input */
  placeholder?: string;
  /** Valor inicial */
  initialValue?: string;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Proyecto para filtrar (opcional) */
  project?: string;
}

export const JiraSearchInput: React.FC<JiraSearchInputProps> = ({
  onSelect,
  placeholder = "Buscar issue (ej: PROJ-123 o texto)",
  initialValue = "",
  disabled = false,
  className = "",
  project,
}) => {
  const { isConfigured, openConfigModal } = useJira();
  const {
    results,
    isLoading,
    error,
    query,
    setQuery,
    clear,
  } = useJiraSearch({ project, maxResults: 8 });

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setQuery(value);
    setIsOpen(true);
  };

  // Manejar selección de issue
  const handleSelect = (issue: JiraIssue) => {
    setInputValue(issue.key);
    setIsOpen(false);
    clear();
    onSelect(issue);
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
    }
  };

  // Limpiar input
  const handleClear = () => {
    setInputValue("");
    clear();
    inputRef.current?.focus();
  };

  // Si JIRA no está configurado, mostrar botón para configurar
  if (!isConfigured) {
    return (
      <button
        onClick={openConfigModal}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl
          border-2 border-dashed border-[var(--surface-border)] dark:border-white/10
          bg-[var(--surface)] dark:bg-white/[0.02]
          hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5
          transition-all duration-200
          text-left
          ${className}
        `}
      >
        <div className="p-2 rounded-lg bg-amber-500/10">
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            Configurar JIRA
          </p>
          <p className="text-xs text-[var(--foreground-secondary)]">
            Conecta tu cuenta para buscar issues
          </p>
        </div>
      </button>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)]">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-12 pr-10 py-3 rounded-xl
            border border-[var(--surface-border)] dark:border-white/10
            bg-[var(--background)] dark:bg-[var(--background)]
            text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
          `}
        />

        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      <AnimatePresence>
        {isOpen && (query.length >= 2 || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-full left-0 right-0 mt-2 z-50
              bg-[var(--surface)] dark:bg-[var(--surface)]
              border border-[var(--surface-border)] dark:border-white/10
              rounded-xl shadow-xl overflow-hidden
              max-h-80 overflow-y-auto
            "
          >
            {/* Error */}
            {error && (
              <div className="px-4 py-3 text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Sin resultados */}
            {!error && !isLoading && results.length === 0 && query.length >= 2 && (
              <div className="px-4 py-3 text-sm text-[var(--foreground-secondary)]">
                No se encontraron issues para &quot;{query}&quot;
              </div>
            )}

            {/* Resultados */}
            {results.map((issue, index) => (
              <button
                key={issue.key}
                onClick={() => handleSelect(issue)}
                className={`
                  w-full px-4 py-3 flex items-start gap-3 text-left
                  hover:bg-[var(--surface-hover)] dark:hover:bg-white/5
                  transition-colors
                  ${index > 0 ? "border-t border-[var(--surface-border)] dark:border-white/5" : ""}
                `}
              >
                {/* Key y tipo */}
                <div className="flex-shrink-0">
                  {issue.issueTypeIcon ? (
                    <img
                      src={issue.issueTypeIcon}
                      alt={issue.issueType || ""}
                      className="w-5 h-5"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded bg-[var(--primary)]/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[var(--primary)]">
                        {issue.issueType?.[0] || "?"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-[var(--primary)]">
                      {issue.key}
                    </span>
                    <StatusBadge status={issue.status} category={issue.statusCategory} />
                  </div>
                  <p className="text-sm text-[var(--foreground)] truncate mt-0.5">
                    {issue.summary}
                  </p>
                  {issue.assignee && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-[var(--foreground-secondary)]">
                      <User className="w-3 h-3" />
                      {issue.assignee}
                    </div>
                  )}
                </div>

                {/* External link hint */}
                <ExternalLink className="w-4 h-4 text-[var(--foreground-muted)] flex-shrink-0 mt-1" />
              </button>
            ))}

            {/* Loading más */}
            {isLoading && results.length > 0 && (
              <div className="px-4 py-2 text-center">
                <Loader2 className="w-4 h-4 animate-spin inline-block text-[var(--primary)]" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente auxiliar para el badge de estado
function StatusBadge({ status, category }: { status: string; category?: string }) {
  const colors = {
    todo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    undefined: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  const colorClass = colors[category as keyof typeof colors] || colors.undefined;

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colorClass}`}>
      {status}
    </span>
  );
}

export default JiraSearchInput;
