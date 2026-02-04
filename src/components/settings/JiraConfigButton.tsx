// src/components/settings/JiraConfigButton.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings2, CheckCircle2, AlertCircle } from "lucide-react";
import { useJira } from "@/contexts/JiraContext";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface JiraConfigButtonProps {
  /** Tamaño del botón */
  size?: "sm" | "md";
  /** Mostrar etiqueta de texto */
  showLabel?: boolean;
}

export const JiraConfigButton: React.FC<JiraConfigButtonProps> = ({
  size = "md",
  showLabel = false,
}) => {
  const { isConfigured, configStatus, openConfigModal } = useJira();

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
  };

  const tooltipContent = isConfigured
    ? `JIRA conectado: ${configStatus.domain}`
    : "Configurar conexión JIRA";

  return (
    <Tippy content={tooltipContent} placement="bottom">
      <motion.button
        onClick={openConfigModal}
        className={`
          relative flex items-center gap-2 rounded-lg
          ${sizeClasses[size]}
          text-[var(--foreground-secondary)]
          hover:text-[var(--primary)]
          hover:bg-[var(--surface-hover)] dark:hover:bg-white/5
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50
        `}
        whileTap={{ scale: 0.95 }}
        aria-label={tooltipContent}
      >
        {/* Icono principal */}
        <div className="relative">
          <Settings2 size={iconSizes[size]} />

          {/* Indicador de estado */}
          <span
            className={`
              absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
              border-2 border-[var(--surface)] dark:border-[var(--background)]
              ${isConfigured
                ? "bg-green-500"
                : "bg-gray-400 dark:bg-gray-600"
              }
            `}
          />
        </div>

        {/* Label opcional */}
        {showLabel && (
          <span className="text-sm font-medium">
            {isConfigured ? "JIRA" : "Conectar JIRA"}
          </span>
        )}
      </motion.button>
    </Tippy>
  );
};

/**
 * Versión expandida del botón con más información
 */
export const JiraConfigCard: React.FC = () => {
  const { isConfigured, configStatus, openConfigModal } = useJira();

  return (
    <motion.button
      onClick={openConfigModal}
      className="
        w-full flex items-center gap-3 p-4 rounded-xl
        bg-[var(--surface)] dark:bg-white/[0.02]
        border border-[var(--surface-border)] dark:border-white/10
        hover:border-[var(--primary)]/50
        hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]
        transition-all duration-200
        text-left
      "
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Icono */}
      <div
        className={`
          p-3 rounded-xl
          ${isConfigured
            ? "bg-green-500/10 text-green-500"
            : "bg-[var(--surface-hover)] dark:bg-white/5 text-[var(--foreground-secondary)]"
          }
        `}
      >
        {isConfigured ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Settings2 className="w-5 h-5" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)]">
          {isConfigured ? "JIRA Conectado" : "Conectar JIRA"}
        </p>
        <p className="text-xs text-[var(--foreground-secondary)] truncate">
          {isConfigured
            ? configStatus.domain
            : "Configura tu cuenta de Atlassian"
          }
        </p>
      </div>

      {/* Status badge */}
      <div
        className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${isConfigured
            ? "bg-green-500/10 text-green-500"
            : "bg-amber-500/10 text-amber-500"
          }
        `}
      >
        {isConfigured ? "Activo" : "Pendiente"}
      </div>
    </motion.button>
  );
};

/**
 * Versión inline para mostrar estado en otras partes de la UI
 */
export const JiraStatusBadge: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { isConfigured, configStatus, openConfigModal } = useJira();

  const handleClick = onClick || openConfigModal;

  if (!isConfigured) {
    return (
      <button
        onClick={handleClick}
        className="
          inline-flex items-center gap-1.5 px-2 py-1 rounded-full
          bg-amber-500/10 text-amber-600 dark:text-amber-400
          hover:bg-amber-500/20 transition-colors
          text-xs font-medium
        "
      >
        <AlertCircle className="w-3 h-3" />
        JIRA no configurado
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="
        inline-flex items-center gap-1.5 px-2 py-1 rounded-full
        bg-green-500/10 text-green-600 dark:text-green-400
        hover:bg-green-500/20 transition-colors
        text-xs font-medium
      "
    >
      <CheckCircle2 className="w-3 h-3" />
      {configStatus.domain}
    </button>
  );
};

// Export por defecto
export default JiraConfigButton;
