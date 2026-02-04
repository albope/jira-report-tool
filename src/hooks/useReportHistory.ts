// src/hooks/useReportHistory.ts
// Hook para gestionar el historial de reportes con IndexedDB

import { useState, useCallback, useEffect } from "react";
import {
  saveReport,
  getReport,
  getAllReports,
  deleteReport,
  searchReports,
  getReportsByJiraCode,
  countReports,
  clearAllReports,
  type SavedReport,
} from "@/utils/indexedDB";
import type { FormData, HiddenFields } from "@/utils/formatReport";
import type { ParsedData } from "@/utils/parseJiraContent";
import formatReport from "@/utils/formatReport";

interface UseReportHistoryResult {
  /** Lista de reportes */
  reports: SavedReport[];
  /** Número total de reportes */
  totalCount: number;
  /** Si está cargando */
  isLoading: boolean;
  /** Error actual */
  error: string | null;
  /** Guarda el reporte actual */
  saveCurrentReport: (data: {
    formData: FormData;
    hiddenFields: HiddenFields;
    parsedData: ParsedData;
    jiraCommentId?: string;
  }) => Promise<string | null>;
  /** Carga un reporte por ID */
  loadReport: (id: string) => Promise<SavedReport | null>;
  /** Elimina un reporte */
  removeReport: (id: string) => Promise<boolean>;
  /** Busca reportes */
  search: (query: string) => Promise<void>;
  /** Recarga la lista de reportes */
  refresh: () => Promise<void>;
  /** Obtiene reportes por código JIRA */
  getByJiraCode: (jiraCode: string) => Promise<SavedReport[]>;
  /** Limpia todo el historial */
  clearHistory: () => Promise<boolean>;
  /** Limpia el error actual */
  clearError: () => void;
}

export function useReportHistory(initialLimit: number = 50): UseReportHistoryResult {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar reportes al montar
  const loadReports = useCallback(async () => {
    if (typeof window === "undefined") return;

    setIsLoading(true);
    setError(null);

    try {
      const [loadedReports, count] = await Promise.all([
        getAllReports(initialLimit),
        countReports(),
      ]);

      setReports(loadedReports);
      setTotalCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar historial");
    } finally {
      setIsLoading(false);
    }
  }, [initialLimit]);

  // Hidratación
  useEffect(() => {
    setIsHydrated(true);
    loadReports();
  }, [loadReports]);

  // Guardar reporte actual
  const saveCurrentReport = useCallback(async (data: {
    formData: FormData;
    hiddenFields: HiddenFields;
    parsedData: ParsedData;
    jiraCommentId?: string;
  }): Promise<string | null> => {
    if (!isHydrated) return null;

    setError(null);

    try {
      const { formData, hiddenFields, parsedData, jiraCommentId } = data;

      // Generar contenido del reporte
      const reportContent = formatReport(parsedData, formData, hiddenFields, "jira");

      // Crear estructura del reporte
      const report = {
        jiraCode: formData.jiraCode,
        title: parsedData.title || formData.jiraCode,
        formData,
        hiddenFields,
        parsedData,
        reportContent,
        metadata: {
          testStatus: formData.testStatus,
          totalTests: formData.batteryTests.length,
          successfulTests: parseInt(formData.summary.successfulTests || "0", 10),
          failedTests: parseInt(formData.summary.failedTests || "0", 10),
          tester: formData.tester,
        },
        jiraCommentId,
      };

      const id = await saveReport(report);

      // Recargar lista
      await loadReports();

      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar reporte");
      return null;
    }
  }, [isHydrated, loadReports]);

  // Cargar un reporte específico
  const loadReport = useCallback(async (id: string): Promise<SavedReport | null> => {
    if (!isHydrated) return null;

    setError(null);

    try {
      const report = await getReport(id);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reporte");
      return null;
    }
  }, [isHydrated]);

  // Eliminar reporte
  const removeReport = useCallback(async (id: string): Promise<boolean> => {
    if (!isHydrated) return false;

    setError(null);

    try {
      await deleteReport(id);
      await loadReports();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar reporte");
      return false;
    }
  }, [isHydrated, loadReports]);

  // Buscar reportes
  const search = useCallback(async (query: string): Promise<void> => {
    if (!isHydrated) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!query.trim()) {
        await loadReports();
        return;
      }

      const results = await searchReports(query);
      setReports(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la búsqueda");
    } finally {
      setIsLoading(false);
    }
  }, [isHydrated, loadReports]);

  // Obtener por código JIRA
  const getByJiraCode = useCallback(async (jiraCode: string): Promise<SavedReport[]> => {
    if (!isHydrated) return [];

    try {
      return await getReportsByJiraCode(jiraCode);
    } catch {
      return [];
    }
  }, [isHydrated]);

  // Limpiar todo el historial
  const clearHistory = useCallback(async (): Promise<boolean> => {
    if (!isHydrated) return false;

    setError(null);

    try {
      await clearAllReports();
      setReports([]);
      setTotalCount(0);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al limpiar historial");
      return false;
    }
  }, [isHydrated]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    reports,
    totalCount,
    isLoading,
    error,
    saveCurrentReport,
    loadReport,
    removeReport,
    search,
    refresh: loadReports,
    getByJiraCode,
    clearHistory,
    clearError,
  };
}
