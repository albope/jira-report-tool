"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  variant?: "default" | "elevated" | "bordered";
  hover?: boolean;
  glow?: boolean;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Card con efecto glassmorphism y opciones de glow/hover.
 * Diseñado para el estilo visual premium.
 */
export function GlassCard({
  children,
  variant = "default",
  hover = true,
  glow = false,
  className = "",
  padding = "md",
}: GlassCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const baseClasses = `
    relative rounded-2xl
    transition-all duration-300
    ${paddingClasses[padding]}
  `;

  const variantClasses = {
    default: `
      bg-[var(--surface)]
      border border-[var(--surface-border)]
    `,
    elevated: `
      bg-[var(--surface)]/80
      backdrop-blur-xl
      border border-[var(--surface-border)]
      shadow-[var(--shadow-elevated)]
    `,
    bordered: `
      bg-transparent
      border border-[var(--surface-border-bright)]
    `,
  };

  const glowClasses = glow
    ? "shadow-[0_0_30px_-10px_var(--primary-glow)]"
    : "";

  return (
    <motion.div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${glowClasses}
        ${hover ? "cursor-pointer hover:border-[var(--surface-border-bright)] hover:shadow-[0_0_30px_-10px_var(--primary-glow)]" : ""}
        ${className}
      `}
      whileHover={hover ? { scale: 1.01, y: -4 } : undefined}
      transition={hover ? { type: "spring" as const, stiffness: 400, damping: 25 } : undefined}
    >
      {/* Gradient border effect on hover */}
      {hover && (
        <div
          className="
            absolute inset-0 rounded-2xl p-[1px]
            bg-gradient-to-r from-transparent via-blue-500/20 to-transparent
            opacity-0 hover:opacity-100
            transition-opacity duration-500
            pointer-events-none
          "
          aria-hidden="true"
        />
      )}
      {children}
    </motion.div>
  );
}

export default GlassCard;
