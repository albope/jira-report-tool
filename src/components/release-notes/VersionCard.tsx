"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Calendar } from "lucide-react";
import { ReleaseVersion, ChangeType } from "@/types/releaseNotes";
import { getVersionStats } from "@/utils/releaseNotesData";
import { ChangeItem } from "./ChangeItem";
import { VersionStats } from "./VersionStats";

interface VersionCardProps {
  release: ReleaseVersion;
  isLatest?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  typeFilter?: ChangeType | "all";
  searchQuery?: string;
  highlightMatch?: (text: string) => string;
}

export function VersionCard({
  release,
  isLatest = false,
  isExpanded = false,
  onToggle,
  typeFilter = "all",
  searchQuery = "",
  highlightMatch,
}: VersionCardProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const expanded = onToggle ? isExpanded : localExpanded;
  const toggleExpanded = onToggle || (() => setLocalExpanded(!localExpanded));

  const stats = getVersionStats(release);
  const isHighlighted = release.isMajor || isLatest;

  // Filter changes by type
  const filteredChanges = typeFilter === "all"
    ? release.changes
    : release.changes.filter((c) => c.type === typeFilter);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-2xl overflow-hidden
        bg-[var(--surface)] dark:bg-[var(--surface)]/80
        border transition-all duration-300
        ${isHighlighted
          ? "border-[var(--primary)]/30 shadow-lg shadow-[var(--primary)]/10"
          : "border-[var(--surface-border)] dark:border-white/[0.06]"
        }
        ${expanded ? "shadow-xl" : "hover:shadow-lg"}
      `}
    >
      {/* Header - Always visible */}
      <button
        onClick={toggleExpanded}
        className="
          w-full p-5 text-left
          flex items-center justify-between gap-4
          hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.02]
          transition-colors
        "
      >
        <div className="flex-1 min-w-0">
          {/* Version row */}
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`text-xl font-bold ${isHighlighted ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>
              v{release.version}
            </h3>

            {release.isMajor && (
              <span className="
                px-2 py-0.5 text-xs font-semibold uppercase
                bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white
                rounded-full flex items-center gap-1
                shadow-md shadow-[var(--primary)]/20
              ">
                <Sparkles size={12} />
                Major
              </span>
            )}

            {isLatest && !release.isMajor && (
              <span className="
                px-2 py-0.5 text-xs font-semibold uppercase
                bg-[var(--success)] text-white rounded-full
                animate-pulse
              ">
                Última
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-tertiary)]">
              <Calendar size={14} />
              {release.date}
            </span>

            {/* Summary */}
            {release.summary && (
              <span className="text-sm text-[var(--foreground-secondary)] hidden sm:inline">
                — {release.summary}
              </span>
            )}
          </div>

          {/* Stats badges */}
          <div className="mt-3">
            <VersionStats stats={stats} variant="compact" />
          </div>
        </div>

        {/* Expand/Collapse indicator */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`
            shrink-0 p-2 rounded-xl
            ${expanded
              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
              : "bg-[var(--surface-hover)] text-[var(--foreground-tertiary)]"
            }
          `}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 border-t border-[var(--surface-border)]">
              {/* Changes list */}
              {filteredChanges.length > 0 ? (
                <ul className="mt-4 space-y-1">
                  {filteredChanges.map((change, idx) => (
                    <ChangeItem
                      key={idx}
                      change={change}
                      index={idx}
                      highlightedText={highlightMatch ? highlightMatch(change.text) : undefined}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--foreground-tertiary)] py-4 text-center">
                  No hay cambios de este tipo en esta versión.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
