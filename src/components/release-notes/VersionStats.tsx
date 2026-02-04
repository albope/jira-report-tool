"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Bug, Palette } from "lucide-react";
import { VersionStats as VersionStatsType } from "@/types/releaseNotes";

interface VersionStatsProps {
  stats: VersionStatsType;
  variant?: "compact" | "full";
}

const statItems = [
  { key: "features", label: "Nuevo", icon: Sparkles, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  { key: "improvements", label: "Mejoras", icon: TrendingUp, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  { key: "fixes", label: "Fixes", icon: Bug, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  { key: "styles", label: "UX", icon: Palette, color: "text-purple-500", bg: "bg-purple-500/10" },
] as const;

export function VersionStats({ stats, variant = "compact" }: VersionStatsProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {statItems.map(({ key, icon: Icon, color, bg }) => {
          const count = stats[key as keyof VersionStatsType];
          if (count === 0) return null;

          return (
            <motion.span
              key={key}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
              className={`
                inline-flex items-center gap-1 px-2 py-0.5
                text-xs font-medium rounded-full
                ${bg} ${color}
              `}
            >
              <Icon size={10} />
              {count}
            </motion.span>
          );
        })}
      </div>
    );
  }

  // Full variant
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statItems.map(({ key, label, icon: Icon, color, bg }, index) => {
        const count = stats[key as keyof VersionStatsType];

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex flex-col items-center p-3 rounded-xl
              ${bg} border border-transparent
              hover:border-current/20 transition-colors
            `}
          >
            <Icon size={20} className={color} />
            <span className={`text-2xl font-bold mt-1 ${color}`}>{count}</span>
            <span className="text-xs text-[var(--foreground-tertiary)]">{label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

// Global stats component for hero section
interface GlobalStatsProps {
  stats: VersionStatsType & { totalVersions: number };
}

export function GlobalStats({ stats }: GlobalStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="
          flex flex-col items-center p-4 rounded-xl
          bg-gradient-to-br from-[var(--primary)]/10 to-purple-500/10
          border border-[var(--primary)]/20
        "
      >
        <span className="text-3xl font-bold text-[var(--primary)]">{stats.totalVersions}</span>
        <span className="text-xs text-[var(--foreground-tertiary)] mt-1">Versiones</span>
      </motion.div>

      {statItems.map(({ key, label, icon: Icon, color, bg }, index) => {
        const count = stats[key as keyof VersionStatsType];

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + (index + 1) * 0.1 }}
            className={`
              flex flex-col items-center p-4 rounded-xl
              ${bg} border border-transparent
              hover:border-current/20 transition-all
              hover:scale-105
            `}
          >
            <Icon size={18} className={`${color} mb-1`} />
            <span className={`text-2xl font-bold ${color}`}>{count}</span>
            <span className="text-xs text-[var(--foreground-tertiary)]">{label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
