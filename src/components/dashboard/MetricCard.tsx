// src/components/dashboard/MetricCard.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { formatNumber } from "@/utils/metrics";

interface MetricCardProps {
  /** Título de la métrica */
  title: string;
  /** Valor principal */
  value: number | string;
  /** Sufijo opcional (%, etc.) */
  suffix?: string;
  /** Icono */
  icon?: LucideIcon;
  /** Color del icono */
  iconColor?: string;
  /** Fondo del icono */
  iconBg?: string;
  /** Tendencia (positivo = mejora) */
  trend?: number;
  /** Etiqueta de tendencia */
  trendLabel?: string;
  /** Descripción adicional */
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  suffix = "",
  icon: Icon,
  iconColor = "text-[var(--primary)]",
  iconBg = "bg-[var(--primary)]/10",
  trend,
  trendLabel = "vs período anterior",
  description,
}) => {
  const displayValue = typeof value === "number" ? formatNumber(value) : value;

  const getTrendInfo = () => {
    if (trend === undefined || trend === 0) {
      return { icon: Minus, color: "text-gray-500", bg: "bg-gray-500/10", text: "Sin cambios" };
    }
    if (trend > 0) {
      return { icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", text: `+${trend}%` };
    }
    return { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", text: `${trend}%` };
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] dark:border-white/10 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}

        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendInfo.bg}`}>
            <TrendIcon className={`w-3 h-3 ${trendInfo.color}`} />
            <span className={`text-xs font-medium ${trendInfo.color}`}>
              {trendInfo.text}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-[var(--foreground-secondary)]">{title}</p>
        <p className="text-3xl font-bold text-[var(--foreground)]">
          {displayValue}
          {suffix && <span className="text-lg ml-1">{suffix}</span>}
        </p>
        {description && (
          <p className="text-xs text-[var(--foreground-muted)]">{description}</p>
        )}
        {trend !== undefined && (
          <p className="text-xs text-[var(--foreground-muted)]">{trendLabel}</p>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
