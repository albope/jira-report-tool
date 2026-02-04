"use client";

import { motion } from "framer-motion";
import { Tag, Calendar } from "lucide-react";
import { GlobalStats } from "./VersionStats";
import { getGlobalStats, getLatestVersion } from "@/utils/releaseNotesData";

export function ReleaseNotesHero() {
  const globalStats = getGlobalStats();
  const latestVersion = getLatestVersion();

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative text-center space-y-6 py-8">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
          className="
            mx-auto w-20 h-20 rounded-2xl
            bg-gradient-to-br from-[var(--primary)] to-purple-600
            flex items-center justify-center
            shadow-xl shadow-[var(--primary)]/30
          "
        >
          <Tag className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] tracking-tight">
            Release Notes
          </h1>
          <p className="text-lg text-[var(--foreground-secondary)] mt-3 max-w-2xl mx-auto">
            Historial de cambios y mejoras del Generador de Reportes JIRA
          </p>
        </motion.div>

        {/* Latest version badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 text-sm"
        >
          <span className="
            inline-flex items-center gap-2 px-4 py-2
            bg-[var(--success)]/10 text-[var(--success)]
            rounded-full font-medium
            border border-[var(--success)]/20
          ">
            <span className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse" />
            Última: v{latestVersion.version}
          </span>
          <span className="
            inline-flex items-center gap-2 px-4 py-2
            bg-[var(--surface)] text-[var(--foreground-secondary)]
            rounded-full
            border border-[var(--surface-border)]
          ">
            <Calendar size={14} />
            {latestVersion.date}
          </span>
        </motion.div>

        {/* Global Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <GlobalStats stats={globalStats} />
        </motion.div>
      </div>
    </section>
  );
}
