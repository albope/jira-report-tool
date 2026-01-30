"use client";

import { motion } from "framer-motion";

interface GradientBlobProps {
  className?: string;
  colors?: [string, string, string];
  size?: "sm" | "md" | "lg" | "xl";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  animate?: boolean;
}

/**
 * Blob de gradiente decorativo con animación suave.
 * Añade profundidad visual y color a fondos oscuros.
 */
export function GradientBlob({
  className = "",
  colors = ["#3B82F6", "#8B5CF6", "#EC4899"],
  size = "lg",
  position = "top-right",
  animate = true,
}: GradientBlobProps) {
  const sizeMap = {
    sm: "w-64 h-64",
    md: "w-96 h-96",
    lg: "w-[500px] h-[500px]",
    xl: "w-[700px] h-[700px]",
  };

  const positionMap = {
    "top-left": "-top-32 -left-32",
    "top-right": "-top-32 -right-32",
    "bottom-left": "-bottom-32 -left-32",
    "bottom-right": "-bottom-32 -right-32",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  const blob = (
    <div
      className={`
        absolute ${sizeMap[size]} ${positionMap[position]}
        rounded-full blur-3xl opacity-20
        pointer-events-none
        ${className}
      `}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]} 50%, ${colors[2]} 100%)`,
      }}
      aria-hidden="true"
    />
  );

  if (!animate) return blob;

  return (
    <motion.div
      className={`
        absolute ${sizeMap[size]} ${positionMap[position]}
        rounded-full blur-3xl opacity-20
        pointer-events-none
        ${className}
      `}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]} 50%, ${colors[2]} 100%)`,
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    />
  );
}

export default GradientBlob;
