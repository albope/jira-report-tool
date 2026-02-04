"use client";

import { useState, useMemo } from "react";
import { ReleaseVersion, ChangeType } from "@/types/releaseNotes";
import { ALL_RELEASES, searchReleases, filterByChangeType, highlightSearchMatch } from "@/utils/releaseNotesData";

interface UseReleaseNotesSearchProps {
  initialTypeFilter?: ChangeType | "all";
}

interface UseReleaseNotesSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  typeFilter: ChangeType | "all";
  setTypeFilter: (type: ChangeType | "all") => void;
  filteredReleases: ReleaseVersion[];
  hasResults: boolean;
  resultsCount: number;
  clearSearch: () => void;
  highlightMatch: (text: string) => string;
}

export function useReleaseNotesSearch({
  initialTypeFilter = "all",
}: UseReleaseNotesSearchProps = {}): UseReleaseNotesSearchReturn {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ChangeType | "all">(initialTypeFilter);

  const filteredReleases = useMemo(() => {
    // First filter by type
    let releases = filterByChangeType(typeFilter);

    // Then filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      releases = releases.filter((release) => {
        // Match version number
        if (release.version.toLowerCase().includes(lowerQuery)) return true;

        // Match summary
        if (release.summary?.toLowerCase().includes(lowerQuery)) return true;

        // Match change text (respecting type filter)
        const relevantChanges = typeFilter === "all"
          ? release.changes
          : release.changes.filter((c) => c.type === typeFilter);

        return relevantChanges.some((change) =>
          change.text.toLowerCase().includes(lowerQuery)
        );
      });
    }

    return releases;
  }, [query, typeFilter]);

  const clearSearch = () => {
    setQuery("");
  };

  const highlightMatch = (text: string): string => {
    return highlightSearchMatch(text, query);
  };

  return {
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    filteredReleases,
    hasResults: filteredReleases.length > 0,
    resultsCount: filteredReleases.length,
    clearSearch,
    highlightMatch,
  };
}
