// src/components/step-two/StyledFormComponents.tsx
"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// ============================================
// PREMIUM INPUT STYLES
// ============================================

const inputBaseClasses = `
  w-full rounded-xl px-4 py-3
  bg-[var(--input-bg)] dark:bg-[var(--surface)]
  border border-[var(--input-border)] dark:border-white/[0.08]
  text-[var(--foreground)] text-sm
  placeholder:text-[var(--input-placeholder)]
  transition-all duration-200 ease-out
  focus:outline-none
  focus:border-[var(--primary)] dark:focus:border-[var(--primary)]
  focus:ring-2 focus:ring-[var(--input-ring)]
  dark:focus:ring-[var(--input-ring)]
  dark:focus:shadow-[0_0_0_1px_var(--primary),var(--shadow-glow)]
  hover:border-[var(--input-border-hover)] dark:hover:border-white/[0.12]
`;

const inputDisabledClasses = `
  bg-[var(--surface-active)] dark:bg-white/[0.03]
  text-[var(--foreground-muted)]
  cursor-not-allowed
  opacity-70
  hover:border-[var(--input-border)]
`;

const inputErrorClasses = `
  border-[var(--error)] dark:border-[var(--error)]
  focus:border-[var(--error)] dark:focus:border-[var(--error)]
  focus:ring-[var(--error)]/20 dark:focus:ring-[var(--error)]/20
`;

const inputSuccessClasses = `
  border-[var(--success)] dark:border-[var(--success)]
  focus:border-[var(--success)] dark:focus:border-[var(--success)]
  focus:ring-[var(--success)]/20 dark:focus:ring-[var(--success)]/20
`;

const labelClasses = `
  block text-sm font-medium
  text-[var(--foreground-secondary)]
  mb-2
`;

// ============================================
// STYLED INPUT
// ============================================

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: boolean | string;
  success?: boolean;
  required?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const StyledInput = forwardRef<HTMLInputElement, StyledInputProps>(
  ({ label, id, error, success, required, hint, icon, rightElement, className, ...props }, ref) => {
    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : null;

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span className="text-[var(--error)] ml-1">*</span>}
        </label>

        <div className="relative">
          {/* Left Icon */}
          {icon && (
            <div className="
              absolute left-3 top-1/2 -translate-y-1/2
              text-[var(--foreground-muted)]
              pointer-events-none
            ">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            {...props}
            className={`
              ${inputBaseClasses}
              ${hasError ? inputErrorClasses : ""}
              ${success ? inputSuccessClasses : ""}
              ${props.disabled ? inputDisabledClasses : ""}
              ${icon ? "pl-10" : ""}
              ${rightElement ? "pr-10" : ""}
              ${className || ""}
            `}
          />

          {/* Right Element or Status Icon */}
          {(rightElement || hasError || success) && (
            <div className="
              absolute right-3 top-1/2 -translate-y-1/2
              flex items-center gap-2
            ">
              {rightElement}
              {hasError && !rightElement && (
                <AlertCircle className="w-4 h-4 text-[var(--error)]" />
              )}
              {success && !hasError && !rightElement && (
                <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
              )}
            </div>
          )}
        </div>

        {/* Error or Hint Message */}
        {(errorMessage || hint) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              text-xs mt-1.5
              ${hasError ? "text-[var(--error)]" : "text-[var(--foreground-muted)]"}
            `}
          >
            {errorMessage || hint}
          </motion.p>
        )}
      </div>
    );
  }
);

StyledInput.displayName = "StyledInput";

// ============================================
// STYLED TEXTAREA
// ============================================

interface StyledTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  required?: boolean;
  error?: boolean | string;
  success?: boolean;
  hint?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export const StyledTextarea = forwardRef<HTMLTextAreaElement, StyledTextareaProps>(
  ({ label, id, required, error, success, hint, showCharCount, maxLength, className, value, ...props }, ref) => {
    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : null;
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={id} className={labelClasses}>
            {label}
            {required && <span className="text-[var(--error)] ml-1">*</span>}
          </label>

          {showCharCount && (
            <span className={`
              text-xs
              ${maxLength && charCount > maxLength
                ? "text-[var(--error)]"
                : "text-[var(--foreground-muted)]"
              }
            `}>
              {charCount}{maxLength ? `/${maxLength}` : ""}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={id}
          value={value}
          maxLength={maxLength}
          {...props}
          className={`
            ${inputBaseClasses}
            resize-none
            min-h-[120px]
            ${hasError ? inputErrorClasses : ""}
            ${success ? inputSuccessClasses : ""}
            ${className || ""}
          `}
        />

        {(errorMessage || hint) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              text-xs mt-1.5
              ${hasError ? "text-[var(--error)]" : "text-[var(--foreground-muted)]"}
            `}
          >
            {errorMessage || hint}
          </motion.p>
        )}
      </div>
    );
  }
);

StyledTextarea.displayName = "StyledTextarea";

// ============================================
// STYLED SELECT
// ============================================

interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  required?: boolean;
  error?: boolean | string;
  hint?: string;
}

export const StyledSelect = forwardRef<HTMLSelectElement, StyledSelectProps>(
  ({ label, id, children, required, error, hint, className, ...props }, ref) => {
    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : null;

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span className="text-[var(--error)] ml-1">*</span>}
        </label>

        <div className="relative">
          <select
            ref={ref}
            id={id}
            {...props}
            className={`
              ${inputBaseClasses}
              appearance-none
              pr-10
              cursor-pointer
              ${hasError ? inputErrorClasses : ""}
              ${className || ""}
            `}
          >
            {children}
          </select>

          {/* Custom Dropdown Arrow */}
          <div className="
            pointer-events-none
            absolute inset-y-0 right-0 flex items-center pr-3
            text-[var(--foreground-muted)]
          ">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {(errorMessage || hint) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              text-xs mt-1.5
              ${hasError ? "text-[var(--error)]" : "text-[var(--foreground-muted)]"}
            `}
          >
            {errorMessage || hint}
          </motion.p>
        )}
      </div>
    );
  }
);

StyledSelect.displayName = "StyledSelect";

// ============================================
// STYLED CHECKBOX (Premium Toggle Style)
// ============================================

interface StyledCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  id: string;
  description?: string;
}

export const StyledCheckbox: React.FC<StyledCheckboxProps> = ({
  label,
  id,
  description,
  className,
  ...props
}) => (
  <label
    htmlFor={id}
    className={`
      flex items-start gap-3.5 cursor-pointer
      p-3 -m-3 rounded-xl
      hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.02]
      transition-colors duration-150
      group
      ${className || ""}
    `}
  >
    <div className="relative flex items-center justify-center mt-0.5">
      <input
        type="checkbox"
        id={id}
        {...props}
        className="peer sr-only"
      />

      {/* Custom Checkbox */}
      <div className="
        w-5 h-5 rounded-md
        border-2 border-[var(--input-border)] dark:border-white/[0.15]
        bg-[var(--input-bg)] dark:bg-[var(--surface)]
        peer-checked:bg-[var(--primary)]
        peer-checked:border-[var(--primary)]
        peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--input-ring)]
        dark:peer-focus-visible:shadow-[0_0_15px_-5px_var(--primary-glow)]
        peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
        transition-all duration-200
        flex items-center justify-center
      ">
        {/* Checkmark */}
        <svg
          className="
            w-3 h-3 text-white
            opacity-0 scale-50
            peer-checked:opacity-100 peer-checked:scale-100
            transition-all duration-200
          "
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <span className="
        text-sm font-medium text-[var(--foreground)]
        group-hover:text-[var(--primary)]
        transition-colors duration-150
      ">
        {label}
      </span>
      {description && (
        <p className="text-xs text-[var(--foreground-muted)] mt-0.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  </label>
);

// ============================================
// STYLED SWITCH (iOS Style Toggle)
// ============================================

interface StyledSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  id: string;
  description?: string;
}

export const StyledSwitch: React.FC<StyledSwitchProps> = ({
  label,
  id,
  description,
  className,
  ...props
}) => (
  <label
    htmlFor={id}
    className={`
      flex items-center justify-between gap-4 cursor-pointer
      p-3 -m-3 rounded-xl
      hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.02]
      transition-colors duration-150
      group
      ${className || ""}
    `}
  >
    <div className="flex-1 min-w-0">
      <span className="
        text-sm font-medium text-[var(--foreground)]
        group-hover:text-[var(--primary)]
        transition-colors duration-150
      ">
        {label}
      </span>
      {description && (
        <p className="text-xs text-[var(--foreground-muted)] mt-0.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>

    <div className="relative flex-shrink-0">
      <input
        type="checkbox"
        id={id}
        {...props}
        className="peer sr-only"
      />

      {/* Switch Track */}
      <div className="
        w-11 h-6 rounded-full
        bg-[var(--surface-active)] dark:bg-white/[0.1]
        peer-checked:bg-[var(--primary)]
        peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--input-ring)] peer-focus-visible:ring-offset-2
        peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
        transition-colors duration-200
      ">
        {/* Switch Knob */}
        <div className="
          absolute top-0.5 left-0.5
          w-5 h-5 rounded-full
          bg-white
          shadow-sm
          peer-checked:translate-x-5
          transition-transform duration-200
        " />
      </div>
    </div>
  </label>
);

// ============================================
// FIELD GROUP (For grouped inputs)
// ============================================

interface FieldGroupProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  children,
  columns = 2,
  className,
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className || ""}`}>
      {children}
    </div>
  );
};

// ============================================
// ACTION BUTTON (For inline actions)
// ============================================

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  variant = "secondary",
  size = "md",
  icon,
  loading,
  className,
  disabled,
  onClick,
  type = "button",
  ...props
}) => {
  const variantStyles = {
    primary: `
      bg-[var(--primary)] text-white
      hover:bg-[var(--primary-hover)]
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-[var(--surface)] dark:bg-white/[0.05]
      border border-[var(--surface-border)] dark:border-white/[0.08]
      text-[var(--foreground)]
      hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.08]
      hover:border-[var(--foreground-muted)] dark:hover:border-white/[0.12]
      shadow-sm
    `,
    ghost: `
      text-[var(--foreground-secondary)]
      hover:text-[var(--foreground)]
      hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]
    `,
    danger: `
      bg-[var(--error)] text-white
      hover:bg-[var(--error-hover)]
      shadow-sm
    `,
  };

  const sizes = {
    sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
    md: "h-10 px-4 text-sm gap-2 rounded-xl",
    lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={isDisabled ? undefined : { scale: 1.01 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      className={`
        inline-flex items-center justify-center
        font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizes[size]}
        ${className || ""}
      `}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </motion.button>
  );
};
