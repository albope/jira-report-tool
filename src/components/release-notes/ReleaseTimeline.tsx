"use client";

import { motion } from "framer-motion";
import { ReleaseVersion, ChangeType } from "@/types/releaseNotes";
import { VersionCard } from "./VersionCard";

interface ReleaseTimelineProps {
  releases: ReleaseVersion[];
  latestVersion: string;
  expandedVersions: Set<string>;
  onToggleVersion: (version: string) => void;
  typeFilter?: ChangeType | "all";
  searchQuery?: string;
  highlightMatch?: (text: string) => string;
}

export function ReleaseTimeline({
  releases,
  latestVersion,
  expandedVersions,
  onToggleVersion,
  typeFilter = "all",
  searchQuery = "",
  highlightMatch,
}: ReleaseTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="
          absolute left-5 top-0 bottom-0 w-0.5
          bg-gradient-to-b from-[var(--primary)] via-[var(--primary)]/50 to-transparent
          origin-top
          hidden sm:block
        "
      />

      {/* Timeline items */}
      <div className="space-y-6">
        {releases.map((release, index) => (
          <motion.div
            key={release.version}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative sm:pl-14"
          >
            {/* Timeline node */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 500 }}
              className={`
                hidden sm:flex
                absolute left-2 top-6 w-6 h-6
                rounded-full items-center justify-center
                border-2 transition-colors
                ${release.isMajor || release.version === latestVersion
                  ? "bg-[var(--primary)] border-[var(--primary)] shadow-lg shadow-[var(--primary)]/30"
                  : "bg-[var(--surface)] border-[var(--surface-border)]"
                }
              `}
            >
              {(release.isMajor || release.version === latestVersion) && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              )}
            </motion.div>

            {/* Version Card */}
            <VersionCard
              release={release}
              isLatest={release.version === latestVersion}
              isExpanded={expandedVersions.has(release.version)}
              onToggle={() => onToggleVersion(release.version)}
              typeFilter={typeFilter}
              searchQuery={searchQuery}
              highlightMatch={highlightMatch}
            />
          </motion.div>
        ))}
      </div>

      {/* End of timeline */}
      {releases.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: releases.length * 0.1 + 0.3 }}
          className="hidden sm:flex items-center gap-3 mt-8 ml-14 text-sm text-[var(--foreground-tertiary)]"
        >
          <div className="w-3 h-3 rounded-full bg-[var(--surface-border)]" />
          <span>Inicio del proyecto</span>
        </motion.div>
      )}
    </div>
  );
}
