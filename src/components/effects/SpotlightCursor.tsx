"use client";

import { useEffect, useState } from "react";

interface SpotlightCursorProps {
  size?: number;
  color?: string;
  opacity?: number;
}

/**
 * Efecto de spotlight que sigue el cursor del mouse.
 * Crea un gradiente radial sutil que se mueve con el cursor.
 * Se desactiva en mobile para mejor rendimiento.
 */
export function SpotlightCursor({
  size = 600,
  color = "59, 130, 246", // RGB del primary blue
  opacity = 0.06,
}: SpotlightCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es dispositivo móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Solo añadir listeners si no es móvil
    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
      document.body.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible, isMobile]);

  // No renderizar en móvil
  if (isMobile) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        background: `radial-gradient(${size}px at ${position.x}px ${position.y}px, rgba(${color}, ${opacity}), transparent 80%)`,
      }}
      aria-hidden="true"
    />
  );
}

export default SpotlightCursor;
