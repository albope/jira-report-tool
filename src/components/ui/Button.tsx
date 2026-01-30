// src/components/ui/Button.tsx
"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)]
    hover:from-[var(--primary-hover)] hover:to-[var(--primary)]
    text-white shadow-lg shadow-[var(--primary-glow)]
    hover:shadow-xl hover:shadow-[var(--primary-glow)]
    active:shadow-md
  `,
  secondary: `
    bg-[var(--surface)] border border-[var(--surface-border)]
    hover:bg-[var(--surface-hover)] hover:border-[var(--foreground-muted)]
    text-[var(--foreground)] shadow-sm
    dark:bg-white/[0.05] dark:border-white/[0.08]
    dark:hover:bg-white/[0.08]
    hover:shadow-md
  `,
  danger: `
    bg-gradient-to-r from-[var(--error)] to-[var(--error)]
    hover:brightness-110
    text-white shadow-lg shadow-[var(--error)]/25
    hover:shadow-xl hover:shadow-[var(--error)]/30
  `,
  success: `
    bg-gradient-to-r from-[var(--success)] to-[var(--success)]
    hover:brightness-110
    text-white shadow-lg shadow-[var(--success)]/25
    hover:shadow-xl hover:shadow-[var(--success)]/30
  `,
  ghost: `
    bg-transparent hover:bg-[var(--surface-hover)]
    text-[var(--foreground-secondary)] hover:text-[var(--foreground)]
    dark:hover:bg-white/[0.05]
  `,
  outline: `
    bg-transparent border-2 border-[var(--primary)]
    hover:bg-[var(--primary-soft)] text-[var(--primary)]
    hover:border-[var(--primary-hover)]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled,
  className = "",
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </motion.div>
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </motion.button>
  );
};

// Icon Button variant
interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  icon: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = "ghost",
  size = "md",
  loading = false,
  tooltip,
  disabled,
  className = "",
  ...props
}) => {
  const isDisabled = disabled || loading;

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.1 }}
      whileTap={isDisabled ? {} : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={isDisabled}
      title={tooltip}
      className={`
        inline-flex items-center justify-center
        rounded-full
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-4 h-4" />
        </motion.div>
      ) : (
        icon
      )}
    </motion.button>
  );
};
