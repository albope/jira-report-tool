// src/app/release-notes/page.tsx
"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";
import {
  ReleaseNotesHero,
  ReleaseNotesSidebar,
  ReleaseNotesSearch,
  ReleaseTimeline,
} from "@/components/release-notes";
import { useReleaseNotesSearch } from "@/hooks/useReleaseNotesSearch";
import { ALL_RELEASES, getLatestVersion } from "@/utils/releaseNotesData";

export default function ReleaseNotesPage() {
  const latestVersion = getLatestVersion();

  // Search and filter state
  const {
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    filteredReleases,
    resultsCount,
    highlightMatch,
  } = useReleaseNotesSearch();

  // Expanded versions state (for accordion behavior)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set([latestVersion.version]) // Latest version expanded by default
  );

  // Active version for sidebar highlight
  const [activeVersion, setActiveVersion] = useState<string | null>(latestVersion.version);

  // Toggle version expansion
  const handleToggleVersion = useCallback((version: string) => {
    setExpandedVersions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
    setActiveVersion(version);
  }, []);

  // Navigate to version (from sidebar)
  const handleNavigateToVersion = useCallback((version: string) => {
    // Expand the version
    setExpandedVersions((prev) => new Set([...prev, version]));
    setActiveVersion(version);

    // Scroll to version card
    const element = document.getElementById(`version-${version}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <>
      <HeaderNav />

      <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Hero Section */}
          <ReleaseNotesHero />

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 max-w-3xl mx-auto"
          >
            <ReleaseNotesSearch
              query={query}
              onQueryChange={setQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              resultsCount={query ? resultsCount : undefined}
            />
          </motion.div>

          {/* Main content with sidebar */}
          <div className="mt-10 flex gap-8">
            {/* Sidebar - Desktop only */}
            <ReleaseNotesSidebar
              versions={ALL_RELEASES}
              activeVersion={activeVersion}
              latestVersion={latestVersion.version}
              onNavigate={handleNavigateToVersion}
            />

            {/* Timeline content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {filteredReleases.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="
                      text-center py-16 px-6
                      bg-[var(--surface)]/50 rounded-2xl
                      border border-[var(--surface-border)]
                    "
                  >
                    <p className="text-[var(--foreground-secondary)]">
                      No se encontraron versiones que coincidan con tu búsqueda.
                    </p>
                    <button
                      onClick={() => {
                        setQuery("");
                        setTypeFilter("all");
                      }}
                      className="
                        mt-4 px-4 py-2 rounded-lg
                        bg-[var(--primary)] text-white
                        hover:bg-[var(--primary-hover)]
                        transition-colors
                      "
                    >
                      Limpiar filtros
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Version anchors for navigation */}
                    {filteredReleases.map((release) => (
                      <div key={release.version} id={`version-${release.version}`} />
                    ))}

                    <ReleaseTimeline
                      releases={filteredReleases}
                      latestVersion={latestVersion.version}
                      expandedVersions={expandedVersions}
                      onToggleVersion={handleToggleVersion}
                      typeFilter={typeFilter}
                      searchQuery={query}
                      highlightMatch={query ? highlightMatch : undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="
              mt-12 text-center text-sm text-[var(--foreground-tertiary)]
              pt-8 border-t border-[var(--surface-border)]
            "
          >
            ¿Tienes sugerencias o encontraste un error? Usa el botón flotante
            &quot;Feedback + Bugs&quot; o escribe a{" "}
            <a
              href="mailto:abort.etraid@grupoetra.com"
              className="text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline transition-colors"
            >
              abort.etraid@grupoetra.com
            </a>
          </motion.div>
        </motion.div>
      </main>

      <FooterNav />
    </>
  );
}
