// src/components/dashboard/SimpleChart.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

// ============= DONUT CHART =============

interface DonutChartProps {
  /** Datos del gráfico */
  data: Array<{ label: string; value: number; color: string }>;
  /** Tamaño del gráfico */
  size?: number;
  /** Grosor del donut */
  thickness?: number;
  /** Mostrar leyenda */
  showLegend?: boolean;
  /** Valor central */
  centerValue?: string;
  /** Etiqueta central */
  centerLabel?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 160,
  thickness = 20,
  showLegend = true,
  centerValue,
  centerLabel,
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Fondo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-hover)"
            strokeWidth={thickness}
          />

          {/* Segmentos */}
          {data.map((item, index) => {
            const percentage = total > 0 ? item.value / total : 0;
            const strokeDasharray = circumference * percentage;
            const strokeDashoffset = -accumulatedOffset * circumference;
            accumulatedOffset += percentage;

            return (
              <motion.circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={thickness}
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${strokeDasharray} ${circumference}` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Centro */}
        {(centerValue || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <span className="text-2xl font-bold text-[var(--foreground)]">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-xs text-[var(--foreground-secondary)]">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Leyenda */}
      {showLegend && (
        <div className="flex flex-col gap-2">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-[var(--foreground-secondary)]">
                {item.label}
              </span>
              <span className="text-sm font-medium text-[var(--foreground)] ml-auto">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============= BAR CHART =============

interface BarChartProps {
  /** Datos del gráfico */
  data: Array<{ label: string; value: number; color?: string }>;
  /** Mostrar valores */
  showValues?: boolean;
  /** Color por defecto */
  defaultColor?: string;
  /** Altura máxima de las barras */
  maxHeight?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  showValues = true,
  defaultColor = "var(--primary)",
  maxHeight = 120,
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end gap-2 h-full">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * maxHeight;
        const color = item.color || defaultColor;

        return (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
            {showValues && (
              <span className="text-xs font-medium text-[var(--foreground)]">
                {item.value}
              </span>
            )}
            <motion.div
              className="w-full rounded-t-md"
              style={{ backgroundColor: color }}
              initial={{ height: 0 }}
              animate={{ height }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            />
            <span className="text-[10px] text-[var(--foreground-secondary)] truncate max-w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ============= LINE CHART =============

interface LineChartProps {
  /** Datos del gráfico */
  data: Array<{ label: string; value: number }>;
  /** Alto del gráfico */
  height?: number;
  /** Color de la línea */
  color?: string;
  /** Mostrar área bajo la línea */
  showArea?: boolean;
  /** Mostrar puntos */
  showPoints?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 120,
  color = "var(--primary)",
  showArea = true,
  showPoints = true,
}) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const width = 100;
  const padding = 10;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => ({
    x: padding + (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: padding + chartHeight - ((d.value - minValue) / range) * chartHeight,
    value: d.value,
    label: d.label,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Área */}
      {showArea && (
        <motion.path
          d={areaPath}
          fill={color}
          opacity={0.1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Línea */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Puntos */}
      {showPoints && points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
        />
      ))}
    </svg>
  );
};

// ============= PROGRESS BAR =============

interface ProgressBarProps {
  /** Valor actual */
  value: number;
  /** Valor máximo */
  max?: number;
  /** Color */
  color?: string;
  /** Mostrar porcentaje */
  showPercentage?: boolean;
  /** Etiqueta */
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = "var(--primary)",
  showPercentage = true,
  label,
}) => {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="space-y-1">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-[var(--foreground-secondary)]">{label}</span>}
          {showPercentage && <span className="font-medium text-[var(--foreground)]">{percentage}%</span>}
        </div>
      )}
      <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default { DonutChart, BarChart, LineChart, ProgressBar };
