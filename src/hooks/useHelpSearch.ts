"use client";

import { useState, useMemo, useCallback } from 'react';
import { HelpContentItem } from '@/types/help';

export function useHelpSearch(items: HelpContentItem[]) {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase().trim();
    const queryWords = lowerQuery.split(/\s+/);

    return items.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      const keywordMatch = item.keywords.some(kw =>
        kw.toLowerCase().includes(lowerQuery)
      );
      // Match if all query words appear in title or keywords
      const allWordsMatch = queryWords.every(word =>
        item.title.toLowerCase().includes(word) ||
        item.keywords.some(kw => kw.toLowerCase().includes(word))
      );

      return titleMatch || keywordMatch || allWordsMatch;
    });
  }, [query, items]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, HelpContentItem[]> = {
      'jira-guide': [],
      'report-guide': [],
      'faq': [],
    };

    filteredItems.forEach(item => {
      if (groups[item.section]) {
        groups[item.section].push(item);
      }
    });

    return groups;
  }, [filteredItems]);

  const hasResults = filteredItems.length > 0;
  const resultsCount = filteredItems.length;

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  const highlightMatch = useCallback((text: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.trim()})`, 'gi');
    return text.replace(regex, '<mark class="bg-[var(--primary)]/20 text-[var(--primary)] rounded px-0.5">$1</mark>');
  }, [query]);

  return {
    query,
    setQuery,
    filteredItems,
    groupedResults,
    hasResults,
    resultsCount,
    clearSearch,
    highlightMatch,
  };
}
