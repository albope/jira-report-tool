"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

/**
 * Componente de Tabs premium con animaciones y múltiples variantes.
 */
export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "default",
  size = "md",
  fullWidth = false,
  className = "",
}: TabsProps) {
  const sizeClasses = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-5 py-3",
  };

  const baseTabClasses = `
    relative z-10 flex items-center justify-center gap-2
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50
    ${sizeClasses[size]}
  `;

  if (variant === "pills") {
    return (
      <div
        className={`
          inline-flex p-1 rounded-xl
          bg-[var(--surface-hover)] dark:bg-white/5
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              ${baseTabClasses}
              ${fullWidth ? "flex-1" : ""}
              rounded-lg
              ${activeTab === tab.id
                ? "bg-[var(--surface)] dark:bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)]"
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === "underline") {
    return (
      <div className={`relative border-b border-[var(--surface-border)] dark:border-white/10 ${className}`}>
        <div className={`flex ${fullWidth ? "w-full" : ""}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                ${baseTabClasses}
                ${fullWidth ? "flex-1" : ""}
                border-b-2 -mb-[1px]
                ${activeTab === tab.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] hover:border-[var(--surface-border)]"
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default: Cards con indicador animado
  return (
    <div
      className={`
        relative flex gap-1 p-1 rounded-xl
        bg-[var(--surface-hover)] dark:bg-white/5
        border border-[var(--surface-border)] dark:border-white/10
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              ${baseTabClasses}
              ${fullWidth ? "flex-1" : ""}
              rounded-lg
              ${isActive
                ? "text-[var(--foreground)]"
                : "text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)]"
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-[var(--surface)] dark:bg-[var(--surface)] rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
