// src/components/step-two/FormSection.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "error";
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false,
  badge,
  badgeVariant = "default",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const badgeColors = {
    default: "bg-[var(--surface-active)] text-[var(--foreground-secondary)]",
    success: "bg-[var(--success-soft)] text-[var(--success-soft-foreground)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning-soft-foreground)]",
    error: "bg-[var(--error-soft)] text-[var(--error-soft-foreground)]",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-[var(--surface)] dark:bg-[var(--surface)]/80
        dark:backdrop-blur-sm
        rounded-2xl
        border border-[var(--surface-border)] dark:border-white/[0.06]
        shadow-sm dark:shadow-lg
        transition-all duration-200
        overflow-hidden
        ${className || ""}
      `}
    >
      {/* Section Header */}
      <div
        className={`
          flex items-center justify-between
          px-6 py-5
          border-b border-[var(--surface-border)] dark:border-white/[0.06]
          ${collapsible ? "cursor-pointer select-none" : ""}
          ${collapsible ? "hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.02]" : ""}
          transition-colors duration-150
        `}
        onClick={toggleCollapse}
        role={collapsible ? "button" : undefined}
        aria-expanded={collapsible ? !isCollapsed : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={collapsible ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCollapse();
          }
        } : undefined}
      >
        <div className="flex items-center gap-3">
          {/* Icon with gradient background */}
          {icon && (
            <div className="
              w-10 h-10 rounded-xl
              bg-gradient-to-br from-blue-600 to-violet-600
              dark:from-blue-500 dark:to-violet-500
              flex items-center justify-center
              text-white
              shadow-sm
            ">
              {icon}
            </div>
          )}

          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {title}
            </h3>

            {/* Optional Badge */}
            {badge && (
              <span className={`
                px-2.5 py-1 rounded-full
                text-xs font-medium
                ${badgeColors[badgeVariant]}
              `}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        {collapsible && (
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="
              w-8 h-8 rounded-lg
              flex items-center justify-center
              text-[var(--foreground-muted)]
              hover:text-[var(--foreground)]
              hover:bg-[var(--surface-active)] dark:hover:bg-white/[0.05]
              transition-colors duration-150
            "
          >
            <ChevronDown size={18} />
          </motion.div>
        )}
      </div>

      {/* Section Content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="p-6 space-y-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
