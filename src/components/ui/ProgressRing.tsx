"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  strokeWidth?: number;
  showPercentage?: boolean;
  label?: string;
  variant?: "default" | "gradient" | "success" | "warning" | "error";
  className?: string;
}

/**
 * Progress Ring circular con animaciones y variantes de color.
 * Ideal para mostrar progreso de completado de formularios.
 */
export function ProgressRing({
  progress,
  size = "md",
  strokeWidth,
  showPercentage = true,
  label,
  variant = "default",
  className = "",
}: ProgressRingProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const sizeMap = {
    sm: { size: 48, stroke: 4, fontSize: "text-xs" },
    md: { size: 72, stroke: 5, fontSize: "text-sm" },
    lg: { size: 96, stroke: 6, fontSize: "text-lg" },
  };

  const { size: ringSize, stroke: defaultStroke, fontSize } = sizeMap[size];
  const actualStroke = strokeWidth || defaultStroke;
  const radius = (ringSize - actualStroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const variantColors = {
    default: {
      track: "stroke-[var(--surface-hover)] dark:stroke-white/10",
      progress: "stroke-[var(--primary)]",
      text: "text-[var(--foreground)]",
    },
    gradient: {
      track: "stroke-[var(--surface-hover)] dark:stroke-white/10",
      progress: "stroke-[url(#gradient)]",
      text: "text-[var(--foreground)]",
    },
    success: {
      track: "stroke-[var(--success-soft)]",
      progress: "stroke-[var(--success)]",
      text: "text-[var(--success)]",
    },
    warning: {
      track: "stroke-[var(--warning-soft)]",
      progress: "stroke-[var(--warning)]",
      text: "text-[var(--warning)]",
    },
    error: {
      track: "stroke-[var(--error-soft)]",
      progress: "stroke-[var(--error)]",
      text: "text-[var(--error)]",
    },
  };

  const colors = variantColors[variant];

  // Determinar variante automática basada en progreso
  const autoVariant = progress >= 100 ? "success" : progress >= 70 ? "default" : progress >= 40 ? "warning" : "error";
  const autoColors = variant === "default" ? variantColors[autoVariant] : colors;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        width={ringSize}
        height={ringSize}
        className="transform -rotate-90"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>

        {/* Track (background circle) */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStroke}
          className={autoColors.track}
        />

        {/* Progress circle */}
        <motion.circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStroke}
          strokeLinecap="round"
          className={variant === "gradient" ? "" : autoColors.progress}
          style={variant === "gradient" ? { stroke: "url(#gradient)" } : {}}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeDasharray={circumference}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {showPercentage && (
          <motion.span
            className={`font-bold ${fontSize} ${autoColors.text}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            {Math.round(clampedProgress)}%
          </motion.span>
        )}
      </div>

      {/* Label */}
      {label && (
        <span className="mt-2 text-xs text-[var(--foreground-tertiary)] text-center">
          {label}
        </span>
      )}
    </div>
  );
}

export default ProgressRing;
