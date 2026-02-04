"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MorphingMeshProps {
  /** Colores para los puntos de gradiente */
  colors?: string[];
  /** Número de puntos de mesh (4-8 recomendado) */
  pointCount?: number;
  /** Intensidad del blur (menor = más definido) */
  blur?: number;
  /** Opacidad base de los gradientes */
  opacity?: number;
  /** Seguir el mouse con efecto parallax */
  followMouse?: boolean;
  /** Modo de tema */
  variant?: "dark" | "light";
  /** Clase CSS adicional */
  className?: string;
}

// Configuración de blobs predefinidos para movimiento más fluido
const blobConfigs = [
  { x: [10, 30, 20, 40, 10], y: [20, 40, 60, 30, 20], size: 600 },
  { x: [70, 50, 80, 60, 70], y: [10, 30, 20, 50, 10], size: 550 },
  { x: [20, 50, 30, 60, 20], y: [70, 50, 80, 60, 70], size: 500 },
  { x: [80, 60, 70, 40, 80], y: [60, 80, 50, 70, 60], size: 580 },
  { x: [40, 60, 50, 70, 40], y: [40, 20, 50, 30, 40], size: 520 },
  { x: [50, 30, 60, 40, 50], y: [30, 50, 40, 60, 30], size: 540 },
];

/**
 * MorphingMesh - Efecto de gradientes fluidos estilo Apple/Stripe
 *
 * Versión mejorada con animaciones más visibles y dinámicas
 */
export function MorphingMesh({
  colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4", "#6366F1", "#F59E0B"],
  pointCount = 6,
  blur = 80,
  opacity = 0.6,
  followMouse = true,
  variant = "dark",
  className = "",
}: MorphingMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse position with spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  // Mouse tracking
  useEffect(() => {
    if (!followMouse) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 50;
      const y = (e.clientY / window.innerHeight - 0.5) * 50;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [followMouse, mouseX, mouseY]);

  const blobs = blobConfigs.slice(0, pointCount);
  const isLight = variant === "light";

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Animated gradient blobs */}
      {blobs.map((config, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full pointer-events-none will-change-transform"
          style={{
            width: config.size,
            height: config.size,
            background: `radial-gradient(circle at 30% 30%, ${colors[index % colors.length]}, ${colors[index % colors.length]}99 40%, transparent 70%)`,
            filter: `blur(${blur}px)`,
            opacity: isLight ? opacity * 0.5 : opacity,
            x: springX,
            y: springY,
            mixBlendMode: isLight ? "multiply" : "screen",
          }}
          initial={{
            left: `${config.x[0]}%`,
            top: `${config.y[0]}%`,
            scale: 1,
          }}
          animate={{
            left: config.x.map(v => `${v}%`),
            top: config.y.map(v => `${v}%`),
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 20 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glow center accent */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 800,
          height: 800,
          left: "50%",
          top: "30%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${colors[0]}40 0%, transparent 60%)`,
          filter: `blur(${blur * 0.8}px)`,
          opacity: isLight ? 0.3 : 0.5,
          x: springX,
          y: springY,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: isLight ? [0.2, 0.4, 0.2] : [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Overlay noise texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

export default MorphingMesh;
