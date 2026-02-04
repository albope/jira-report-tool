// src/hooks/useReportHistoryAPI.ts
// Hook para gestionar el historial de reportes con Supabase (backend)

import { useState, useCallback, useEffect } from "react";
import type { FormData, HiddenFields } from "@/utils/formatReport";
import type { ParsedData } from "@/utils/parseJiraContent";
import formatReport from "@/utils/formatReport";
import { getCredentials } from "@/utils/jiraCredentials";

// Tipo compatible con el existente SavedReport de indexedDB
export interface SavedReport {
  id: string;
  jiraCode: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  formData: FormData;
  hiddenFields: HiddenFields;
  parsedData: ParsedData;
  reportContent: string;
  metadata: {
    testStatus: string;
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    tester: string;
  };
  jiraCommentId?: string;
}

// Tipo de respuesta de la API (snake_case)
interface APIReport {
  id: string;
  user_email: string;
  jira_code: string;
  title: string;
  form_data: FormData;
  hidden_fields: HiddenFields;
  parsed_data: ParsedData;
  report_content: string;
  metadata: {
    testStatus: string;
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    tester: string;
  };
  jira_comment_id?: string;
  created_at: string;
  updated_at: string;
}

// Convertir de snake_case (API) a camelCase (frontend)
function transformReport(apiReport: APIReport): SavedReport {
  return {
    id: apiReport.id,
    jiraCode: apiReport.jira_code,
    title: apiReport.title,
    createdAt: apiReport.created_at,
    updatedAt: apiReport.updated_at,
    formData: apiReport.form_data,
    hiddenFields: apiReport.hidden_fields,
    parsedData: apiReport.parsed_data,
    reportContent: apiReport.report_content,
    metadata: apiReport.metadata,
    jiraCommentId: apiReport.jira_comment_id,
  };
}

interface UseReportHistoryAPIResult {
  reports: SavedReport[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  saveCurrentReport: (data: {
    formData: FormData;
    hiddenFields: HiddenFields;
    parsedData: ParsedData;
    jiraCommentId?: string;
  }) => Promise<string | null>;
  loadReport: (id: string) => Promise<SavedReport | null>;
  removeReport: (id: string) => Promise<boolean>;
  search: (query: string) => Promise<void>;
  refresh: () => Promise<void>;
  getByJiraCode: (jiraCode: string) => Promise<SavedReport[]>;
  clearHistory: () => Promise<boolean>;
  clearError: () => void;
}

// Obtiene el email del usuario desde localStorage (credenciales JIRA)
function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const credentials = getCredentials();
    return credentials?.email || null;
  } catch {
    // Ignorar errores
  }

  return null;
}

export function useReportHistoryAPI(initialLimit: number = 50): UseReportHistoryAPIResult {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Hidratación y obtener email
  useEffect(() => {
    setIsHydrated(true);
    setUserEmail(getUserEmail());
  }, []);

  // Cargar reportes
  const loadReports = useCallback(async () => {
    const email = getUserEmail();
    if (!email) {
      setReports([]);
      setTotalCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports?limit=${initialLimit}`, {
        headers: {
          "x-user-email": email,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar reportes");
      }

      const data = await response.json();
      const transformedReports = (data.reports || []).map(transformReport);
      setReports(transformedReports);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar historial");
    } finally {
      setIsLoading(false);
    }
  }, [initialLimit]);

  // Cargar al montar
  useEffect(() => {
    if (isHydrated && userEmail) {
      loadReports();
    }
  }, [isHydrated, userEmail, loadReports]);

  // Guardar reporte
  const saveCurrentReport = useCallback(async (data: {
    formData: FormData;
    hiddenFields: HiddenFields;
    parsedData: ParsedData;
    jiraCommentId?: string;
  }): Promise<string | null> => {
    const email = getUserEmail();

    if (!isHydrated) {
      throw new Error("El sistema aún no está listo. Intenta de nuevo.");
    }

    if (!email) {
      throw new Error("Configura tus credenciales de JIRA para guardar reportes.");
    }

    setError(null);

    try {
      const { formData, hiddenFields, parsedData, jiraCommentId } = data;

      // Generar contenido del reporte
      const reportContent = formatReport(parsedData, formData, hiddenFields, "jira");

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email,
        },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar reporte");
      }

      const result = await response.json();
      await loadReports();

      return result.report?.id || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar reporte");
      return null;
    }
  }, [isHydrated, loadReports]);

  // Cargar un reporte específico
  const loadReport = useCallback(async (id: string): Promise<SavedReport | null> => {
    const email = getUserEmail();
    if (!isHydrated || !email) return null;

    setError(null);

    try {
      const response = await fetch(`/api/reports/${id}`, {
        headers: {
          "x-user-email": email,
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Error al cargar reporte");
      }

      const data = await response.json();
      return transformReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reporte");
      return null;
    }
  }, [isHydrated]);

  // Eliminar reporte
  const removeReport = useCallback(async (id: string): Promise<boolean> => {
    const email = getUserEmail();
    if (!isHydrated || !email) return false;

    setError(null);

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-email": email,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar reporte");
      }

      await loadReports();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar reporte");
      return false;
    }
  }, [isHydrated, loadReports]);

  // Buscar reportes
  const search = useCallback(async (query: string): Promise<void> => {
    const email = getUserEmail();
    if (!isHydrated || !email) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!query.trim()) {
        await loadReports();
        return;
      }

      const response = await fetch(`/api/reports?search=${encodeURIComponent(query)}`, {
        headers: {
          "x-user-email": email,
        },
      });

      if (!response.ok) {
        throw new Error("Error en la búsqueda");
      }

      const data = await response.json();
      const transformedReports = (data.reports || []).map(transformReport);
      setReports(transformedReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la búsqueda");
    } finally {
      setIsLoading(false);
    }
  }, [isHydrated, loadReports]);

  // Obtener por código JIRA
  const getByJiraCode = useCallback(async (jiraCode: string): Promise<SavedReport[]> => {
    const email = getUserEmail();
    if (!isHydrated || !email) return [];

    try {
      const response = await fetch(`/api/reports?jiraCode=${encodeURIComponent(jiraCode)}`, {
        headers: {
          "x-user-email": email,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return (data.reports || []).map(transformReport);
    } catch {
      return [];
    }
  }, [isHydrated]);

  // Limpiar todo el historial (eliminar todos los reportes del usuario)
  const clearHistory = useCallback(async (): Promise<boolean> => {
    const email = getUserEmail();
    if (!isHydrated || !email) return false;

    setError(null);

    try {
      // Eliminar cada reporte uno por uno
      for (const report of reports) {
        await fetch(`/api/reports/${report.id}`, {
          method: "DELETE",
          headers: {
            "x-user-email": email,
          },
        });
      }

      setReports([]);
      setTotalCount(0);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al limpiar historial");
      return false;
    }
  }, [isHydrated, reports]);

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
