"use client";

interface GridPatternProps {
  className?: string;
  fadeIntensity?: "light" | "medium" | "strong";
}

/**
 * Patrón de grid SVG con efecto de fade radial.
 * Crea un fondo de cuadrícula sutil estilo Vercel/Linear.
 */
export function GridPattern({
  className = "",
  fadeIntensity = "medium",
}: GridPatternProps) {
  const fadeMap = {
    light: "70%",
    medium: "60%",
    strong: "50%",
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* SVG Grid Pattern */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-white/[0.03] dark:text-white/[0.04]"
            />
          </pattern>
          <radialGradient id="grid-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset={fadeMap[fadeIntensity]} stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-fade)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-pattern)"
          mask="url(#grid-mask)"
        />
      </svg>
    </div>
  );
}

export default GridPattern;
