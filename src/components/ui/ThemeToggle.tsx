"use client";

import { useTheme, Theme } from "@/hooks/useTheme";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  showLabel?: boolean;
  variant?: "icon" | "dropdown" | "segmented";
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-10 h-10",
};

const iconSizes = {
  sm: 16,
  md: 18,
  lg: 20,
};

export function ThemeToggle({
  showLabel = false,
  variant = "icon",
  size = "md",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Claro", icon: <Sun size={iconSizes[size]} /> },
    { value: "dark", label: "Oscuro", icon: <Moon size={iconSizes[size]} /> },
    { value: "system", label: "Sistema", icon: <Monitor size={iconSizes[size]} /> },
  ];

  const currentIcon = resolvedTheme === "dark" ? (
    <Moon size={iconSizes[size]} />
  ) : (
    <Sun size={iconSizes[size]} />
  );

  // Simple icon toggle button
  if (variant === "icon") {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center rounded-lg
          text-[var(--foreground-secondary)] hover:text-[var(--primary)]
          bg-transparent hover:bg-[var(--surface-hover)]
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2
          focus:ring-offset-[var(--background)]
        `}
        whileTap={{ scale: 0.95 }}
        aria-label={`Cambiar a modo ${resolvedTheme === "dark" ? "claro" : "oscuro"}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={resolvedTheme}
            initial={{ y: -10, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 10, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
          >
            {currentIcon}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    );
  }

  // Dropdown menu with all options
  if (variant === "dropdown") {
    return (
      <div className="relative" ref={dropdownRef}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            ${sizeClasses[size]}
            flex items-center justify-center rounded-lg
            text-[var(--foreground-secondary)] hover:text-[var(--primary)]
            bg-transparent hover:bg-[var(--surface-hover)]
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
          `}
          whileTap={{ scale: 0.95 }}
          aria-label="Seleccionar tema"
          aria-expanded={isOpen}
        >
          {currentIcon}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="
                absolute right-0 mt-2 py-1 w-36
                bg-[var(--surface)] border border-[var(--surface-border)]
                rounded-lg shadow-lg z-50
              "
            >
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-3 py-2 flex items-center gap-2 text-sm
                    transition-colors duration-150
                    ${
                      theme === option.value
                        ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)]"
                    }
                  `}
                >
                  {option.icon}
                  <span>{option.label}</span>
                  {theme === option.value && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto text-[var(--primary)]"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M13.5 4.5L6 12L2.5 8.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Segmented control with all options visible
  return (
    <div
      className="
        inline-flex items-center gap-1 p-1
        bg-[var(--surface-hover)] rounded-lg
      "
      role="radiogroup"
      aria-label="Seleccionar tema"
    >
      {themeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={`
            relative px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium
            transition-colors duration-200
            ${
              theme === option.value
                ? "text-[var(--primary)]"
                : "text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)]"
            }
          `}
          role="radio"
          aria-checked={theme === option.value}
        >
          {theme === option.value && (
            <motion.span
              layoutId="theme-indicator"
              className="absolute inset-0 bg-[var(--surface)] rounded-md shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {option.icon}
            {showLabel && <span>{option.label}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

export default ThemeToggle;
