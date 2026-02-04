// src/hooks/useJiraCredentials.ts
// Hook para gestionar credenciales JIRA

import { useState, useCallback, useEffect } from "react";
import type { JiraCredentials, JiraConfigStatus } from "@/types/jira";
import {
  getCredentials,
  saveCredentials as saveToStorage,
  clearCredentials as clearFromStorage,
  getConfigStatus,
  updateLastVerified,
  normalizeDomain,
  validateCredentials,
} from "@/utils/jiraCredentials";

interface UseJiraCredentialsResult {
  /** Credenciales actuales (null si no configuradas) */
  credentials: JiraCredentials | null;
  /** Estado de configuración */
  configStatus: JiraConfigStatus;
  /** Si hay credenciales configuradas */
  isConfigured: boolean;
  /** Si se está verificando las credenciales */
  isVerifying: boolean;
  /** Error de la última operación */
  error: string | null;
  /** Guarda credenciales (verifica antes de guardar) */
  saveCredentials: (creds: JiraCredentials) => Promise<boolean>;
  /** Elimina credenciales */
  clearCredentials: () => void;
  /** Verifica las credenciales actuales contra la API */
  verifyCredentials: () => Promise<boolean>;
  /** Recarga las credenciales desde localStorage */
  refresh: () => void;
}

export function useJiraCredentials(): UseJiraCredentialsResult {
  const [credentials, setCredentials] = useState<JiraCredentials | null>(null);
  const [configStatus, setConfigStatus] = useState<JiraConfigStatus>({
    isConfigured: false,
    isVerified: false,
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar credenciales al montar
  const loadCredentials = useCallback(() => {
    const stored = getCredentials();
    setCredentials(stored);
    setConfigStatus(getConfigStatus());
  }, []);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  // Verificar credenciales contra la API
  const verifyCredentials = useCallback(async (): Promise<boolean> => {
    const creds = credentials || getCredentials();
    if (!creds) {
      setError("No hay credenciales configuradas");
      return false;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("/api/jira-status", {
        method: "GET",
        headers: {
          "X-Jira-Domain": creds.domain,
          "X-Jira-Email": creds.email,
          "X-Jira-Token": creds.token,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Error al verificar credenciales");
      }

      // Credenciales válidas - actualizar timestamp
      updateLastVerified();
      loadCredentials();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Timeout: la verificación tardó demasiado");
        } else {
          setError(err.message);
        }
      } else {
        setError("Error desconocido al verificar credenciales");
      }
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [credentials, loadCredentials]);

  // Guardar credenciales
  const saveCredentials = useCallback(async (newCreds: JiraCredentials): Promise<boolean> => {
    setError(null);

    // Normalizar dominio
    const normalizedCreds: JiraCredentials = {
      ...newCreds,
      domain: normalizeDomain(newCreds.domain),
      email: newCreds.email.trim(),
      token: newCreds.token.trim(),
    };

    // Validar formato
    const validation = validateCredentials(normalizedCreds);
    if (!validation.valid) {
      setError(validation.errors.join(". "));
      return false;
    }

    // Verificar contra la API antes de guardar
    setIsVerifying(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("/api/jira-status", {
        method: "GET",
        headers: {
          "X-Jira-Domain": normalizedCreds.domain,
          "X-Jira-Email": normalizedCreds.email,
          "X-Jira-Token": normalizedCreds.token,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Las credenciales no son válidas");
      }

      // Guardar con timestamp de verificación
      normalizedCreds.lastVerified = new Date().toISOString();
      saveToStorage(normalizedCreds);
      loadCredentials();
      return true;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Timeout: la verificación tardó demasiado");
        } else {
          setError(err.message);
        }
      } else {
        setError("Error al verificar credenciales");
      }
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [loadCredentials]);

  // Limpiar credenciales
  const clearCredentials = useCallback(() => {
    clearFromStorage();
    setCredentials(null);
    setConfigStatus({
      isConfigured: false,
      isVerified: false,
    });
    setError(null);
  }, []);

  return {
    credentials,
    configStatus,
    isConfigured: configStatus.isConfigured,
    isVerifying,
    error,
    saveCredentials,
    clearCredentials,
    verifyCredentials,
    refresh: loadCredentials,
  };
}
