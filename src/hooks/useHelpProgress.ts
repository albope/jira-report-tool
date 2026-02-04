"use client";

import { useState, useEffect, useCallback } from 'react';
import { HelpProgress } from '@/types/help';

const STORAGE_KEY = 'jira-report-help-progress';

export function useHelpProgress() {
  const [progress, setProgress] = useState<HelpProgress>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load help progress:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && Object.keys(progress).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.error('Failed to save help progress:', error);
      }
    }
  }, [progress, isLoaded]);

  const markComplete = useCallback((itemId: string) => {
    setProgress(prev => ({
      ...prev,
      [itemId]: { completed: true, lastVisited: Date.now() },
    }));
  }, []);

  const markIncomplete = useCallback((itemId: string) => {
    setProgress(prev => ({
      ...prev,
      [itemId]: { completed: false, lastVisited: Date.now() },
    }));
  }, []);

  const toggleComplete = useCallback((itemId: string) => {
    setProgress(prev => {
      const current = prev[itemId];
      return {
        ...prev,
        [itemId]: {
          completed: !current?.completed,
          lastVisited: Date.now()
        },
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset help progress:', error);
    }
  }, []);

  const isCompleted = useCallback((itemId: string) => {
    return progress[itemId]?.completed ?? false;
  }, [progress]);

  const getCompletedCount = useCallback(() => {
    return Object.values(progress).filter(p => p.completed).length;
  }, [progress]);

  const getProgressPercentage = useCallback((totalItems: number) => {
    if (totalItems === 0) return 0;
    return Math.round((getCompletedCount() / totalItems) * 100);
  }, [getCompletedCount]);

  return {
    progress,
    isLoaded,
    markComplete,
    markIncomplete,
    toggleComplete,
    resetProgress,
    isCompleted,
    getCompletedCount,
    getProgressPercentage,
  };
}
