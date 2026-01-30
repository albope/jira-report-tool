"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlowButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

/**
 * Botón premium con efecto glow y animaciones suaves.
 * Soporta Link (href) o button (onClick).
 */
export function GlowButton({
  href,
  onClick,
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled = false,
  icon,
  iconPosition = "left",
}: GlowButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const baseClasses = `
    relative inline-flex items-center justify-center gap-2
    font-semibold rounded-xl
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)]
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-purple-600
      text-white
      shadow-[0_0_20px_rgba(59,130,246,0.3)]
      hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]
      hover:from-blue-500 hover:to-purple-500
      focus:ring-blue-500
      before:absolute before:inset-0 before:rounded-xl
      before:bg-gradient-to-r before:from-blue-400 before:to-purple-400
      before:opacity-0 hover:before:opacity-20
      before:transition-opacity
    `,
    secondary: `
      bg-white/5 backdrop-blur-sm
      border border-white/10
      text-white
      hover:bg-white/10 hover:border-white/20
      hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
      focus:ring-white/30
    `,
    ghost: `
      bg-transparent
      text-[var(--foreground-secondary)]
      hover:text-[var(--foreground)]
      hover:bg-white/5
      focus:ring-white/20
    `,
  };

  const content = (
    <>
      {icon && iconPosition === "left" && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </>
  );

  const buttonElement = (
    <motion.span
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {content}
    </motion.span>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="inline-block">
        {buttonElement}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-block"
    >
      {buttonElement}
    </button>
  );
}

export default GlowButton;
