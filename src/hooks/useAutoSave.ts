// src/hooks/useAutoSave.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AutoSaveOptions<T> {
  key: string;
  data: T;
  debounceMs?: number;
  onSave?: () => void;
  onRestore?: (data: T) => void;
  enabled?: boolean;
}

interface AutoSaveState {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
}

export function useAutoSave<T>({
  key,
  data,
  debounceMs = 1000,
  onSave,
  onRestore,
  enabled = true,
}: AutoSaveOptions<T>) {
  const [state, setState] = useState<AutoSaveState>({
    status: "idle",
    lastSaved: null,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const previousDataRef = useRef<string>("");

  // Restore data on mount
  useEffect(() => {
    if (!enabled) return;

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data && onRestore) {
          onRestore(parsed.data);
          setState({
            status: "saved",
            lastSaved: parsed.timestamp ? new Date(parsed.timestamp) : null,
          });
        }
      }
    } catch (error) {
      console.error("Error restoring auto-saved data:", error);
    }
    isFirstRender.current = false;
  }, [key, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save on data change
  useEffect(() => {
    if (!enabled || isFirstRender.current) return;

    const currentData = JSON.stringify(data);

    // Only save if data actually changed
    if (currentData === previousDataRef.current) return;
    previousDataRef.current = currentData;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState((prev) => ({ ...prev, status: "saving" }));

    timeoutRef.current = setTimeout(() => {
      try {
        const saveData = {
          data,
          timestamp: new Date().toISOString(),
          version: 1,
        };
        localStorage.setItem(key, JSON.stringify(saveData));
        setState({
          status: "saved",
          lastSaved: new Date(),
        });
        onSave?.();
      } catch (error) {
        console.error("Error auto-saving data:", error);
        setState((prev) => ({ ...prev, status: "error" }));
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, key, debounceMs, onSave, enabled]);

  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState({ status: "idle", lastSaved: null });
    } catch (error) {
      console.error("Error clearing saved data:", error);
    }
  }, [key]);

  const forceSave = useCallback(() => {
    if (!enabled) return;

    try {
      const saveData = {
        data,
        timestamp: new Date().toISOString(),
        version: 1,
      };
      localStorage.setItem(key, JSON.stringify(saveData));
      setState({
        status: "saved",
        lastSaved: new Date(),
      });
      onSave?.();
    } catch (error) {
      console.error("Error force saving data:", error);
      setState((prev) => ({ ...prev, status: "error" }));
    }
  }, [data, key, onSave, enabled]);

  return {
    ...state,
    clearSaved,
    forceSave,
  };
}
