// src/hooks/useJiraSearch.ts
// Hook para búsqueda de issues en JIRA con debounce

import { useState, useCallback, useRef, useEffect } from "react";
import type { JiraIssue, JiraSearchResult } from "@/types/jira";
import { useJira } from "@/contexts/JiraContext";

interface UseJiraSearchOptions {
  /** Delay de debounce en ms (default: 300) */
  debounceMs?: number;
  /** Máximo de resultados (default: 10) */
  maxResults?: number;
  /** Proyecto para filtrar (opcional) */
  project?: string;
  /** Mínimo de caracteres para buscar (default: 2) */
  minChars?: number;
}

interface UseJiraSearchResult {
  /** Resultados de búsqueda */
  results: JiraIssue[];
  /** Total de resultados encontrados */
  total: number;
  /** Si está cargando */
  isLoading: boolean;
  /** Error de la última búsqueda */
  error: string | null;
  /** Query actual */
  query: string;
  /** Actualizar query (dispara búsqueda con debounce) */
  setQuery: (query: string) => void;
  /** Forzar búsqueda inmediata */
  search: (query: string) => Promise<void>;
  /** Limpiar resultados */
  clear: () => void;
  /** Si hay más resultados disponibles */
  hasMore: boolean;
  /** Cargar más resultados */
  loadMore: () => Promise<void>;
}

export function useJiraSearch(options: UseJiraSearchOptions = {}): UseJiraSearchResult {
  const {
    debounceMs = 300,
    maxResults = 10,
    project,
    minChars = 2,
  } = options;

  const { credentials, isConfigured } = useJira();

  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<JiraIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startAt, setStartAt] = useState(0);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Función de búsqueda
  const performSearch = useCallback(async (
    searchQuery: string,
    offset: number = 0,
    append: boolean = false
  ) => {
    if (!isConfigured || !credentials) {
      setError("JIRA no está configurado");
      return;
    }

    if (searchQuery.length < minChars) {
      if (!append) {
        setResults([]);
        setTotal(0);
      }
      return;
    }

    // Cancelar búsqueda anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        maxResults: maxResults.toString(),
        startAt: offset.toString(),
      });

      if (project) {
        params.set("project", project);
      }

      const response = await fetch(`/api/jira-search?${params}`, {
        headers: {
          "X-Jira-Domain": credentials.domain,
          "X-Jira-Email": credentials.email,
          "X-Jira-Token": credentials.token,
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Error en la búsqueda");
      }

      const data: JiraSearchResult = await response.json();

      if (append) {
        setResults(prev => [...prev, ...data.issues]);
      } else {
        setResults(data.issues);
      }
      setTotal(data.total);
      setStartAt(offset + data.issues.length);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // Búsqueda cancelada, ignorar
        return;
      }
      setError(err instanceof Error ? err.message : "Error en la búsqueda");
      if (!append) {
        setResults([]);
        setTotal(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [credentials, isConfigured, maxResults, minChars, project]);

  // Setter con debounce
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si query está vacía, limpiar inmediatamente
    if (!newQuery.trim()) {
      setResults([]);
      setTotal(0);
      setStartAt(0);
      setError(null);
      return;
    }

    // Debounce la búsqueda
    debounceTimerRef.current = setTimeout(() => {
      setStartAt(0);
      performSearch(newQuery, 0, false);
    }, debounceMs);
  }, [debounceMs, performSearch]);

  // Búsqueda inmediata
  const search = useCallback(async (searchQuery: string) => {
    setQueryState(searchQuery);
    setStartAt(0);
    await performSearch(searchQuery, 0, false);
  }, [performSearch]);

  // Limpiar resultados
  const clear = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setQueryState("");
    setResults([]);
    setTotal(0);
    setStartAt(0);
    setError(null);
    setIsLoading(false);
  }, []);

  // Cargar más resultados
  const loadMore = useCallback(async () => {
    if (isLoading || results.length >= total) return;
    await performSearch(query, startAt, true);
  }, [isLoading, results.length, total, performSearch, query, startAt]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    total,
    isLoading,
    error,
    query,
    setQuery,
    search,
    clear,
    hasMore: results.length < total,
    loadMore,
  };
}
