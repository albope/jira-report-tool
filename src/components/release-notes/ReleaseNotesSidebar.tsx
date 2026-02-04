"use client";

import { motion } from "framer-motion";
import { Tag, Sparkles, Circle } from "lucide-react";
import { ReleaseVersion } from "@/types/releaseNotes";
import { getVersionStats } from "@/utils/releaseNotesData";

interface ReleaseNotesSidebarProps {
  versions: ReleaseVersion[];
  activeVersion: string | null;
  latestVersion: string;
  onNavigate: (version: string) => void;
}

export function ReleaseNotesSidebar({
  versions,
  activeVersion,
  latestVersion,
  onNavigate,
}: ReleaseNotesSidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="
        hidden lg:flex flex-col
        sticky top-24 h-fit max-h-[calc(100vh-8rem)]
        w-64 shrink-0
        bg-[var(--surface)]/80 backdrop-blur-xl
        border border-[var(--surface-border)] dark:border-white/[0.06]
        rounded-2xl
        shadow-lg dark:shadow-2xl
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="p-5 border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-[var(--primary)]" />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Versiones
          </h3>
        </div>
        <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
          {versions.length} versiones publicadas
        </p>
      </div>

      {/* Version List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {versions.map((release, index) => {
          const isActive = activeVersion === release.version;
          const isLatest = release.version === latestVersion;
          const isMajor = release.isMajor;
          const stats = getVersionStats(release);

          return (
            <motion.button
              key={release.version}
              onClick={() => onNavigate(release.version)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full text-left px-3 py-3 rounded-xl text-sm
                transition-all duration-200
                flex items-center gap-3
                ${isActive
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium border border-[var(--primary)]/20'
                  : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]'
                }
              `}
            >
              {/* Version indicator */}
              <span className="shrink-0">
                {isMajor ? (
                  <Sparkles
                    size={16}
                    className={isActive ? "text-[var(--primary)]" : "text-[var(--warning)]"}
                  />
                ) : (
                  <Circle
                    size={8}
                    fill={isActive ? "var(--primary)" : isLatest ? "var(--success)" : "transparent"}
                    className={`
                      ${isActive
                        ? "text-[var(--primary)]"
                        : isLatest
                          ? "text-[var(--success)]"
                          : "text-[var(--foreground-tertiary)]"
                      }
                    `}
                  />
                )}
              </span>

              {/* Version info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">v{release.version}</span>
                  {isLatest && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-[var(--success)] text-white rounded">
                      Nueva
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[var(--foreground-tertiary)] mt-0.5">
                  {stats.total} cambio{stats.total !== 1 ? 's' : ''}
                </div>
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--surface-border)] bg-[var(--surface-hover)]/50">
        <p className="text-[10px] text-[var(--foreground-tertiary)] text-center">
          Haz clic para navegar
        </p>
      </div>
    </motion.aside>
  );
}
