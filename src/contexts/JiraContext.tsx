// src/contexts/JiraContext.tsx
// Context global para el estado de JIRA

"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
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

interface JiraContextValue {
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
  /** Si el modal de configuración está abierto */
  isConfigModalOpen: boolean;
  /** Abre el modal de configuración */
  openConfigModal: () => void;
  /** Cierra el modal de configuración */
  closeConfigModal: () => void;
  /** Guarda credenciales (verifica antes de guardar) */
  saveCredentials: (creds: JiraCredentials) => Promise<boolean>;
  /** Guarda credenciales sin verificar (útil si hay problemas de red) */
  saveCredentialsWithoutVerify: (creds: JiraCredentials) => boolean;
  /** Elimina credenciales */
  clearCredentials: () => void;
  /** Verifica las credenciales actuales contra la API */
  verifyCredentials: () => Promise<boolean>;
  /** Recarga las credenciales desde localStorage */
  refresh: () => void;
  /** Limpia el error actual */
  clearError: () => void;
}

const JiraContext = createContext<JiraContextValue | null>(null);

interface JiraProviderProps {
  children: React.ReactNode;
}

export function JiraProvider({ children }: JiraProviderProps) {
  const [credentials, setCredentials] = useState<JiraCredentials | null>(null);
  const [configStatus, setConfigStatus] = useState<JiraConfigStatus>({
    isConfigured: false,
    isVerified: false,
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar credenciales al montar (solo en cliente)
  const loadCredentials = useCallback(() => {
    if (typeof window === "undefined") return;
    const stored = getCredentials();
    setCredentials(stored);
    setConfigStatus(getConfigStatus());
  }, []);

  // Hidratación
  useEffect(() => {
    setIsHydrated(true);
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
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

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

    const normalizedCreds: JiraCredentials = {
      ...newCreds,
      domain: normalizeDomain(newCreds.domain),
      email: newCreds.email.trim(),
      token: newCreds.token.trim(),
    };

    const validation = validateCredentials(normalizedCreds);
    if (!validation.valid) {
      setError(validation.errors.join(". "));
      return false;
    }

    setIsVerifying(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

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

  // Guardar sin verificar (útil si hay problemas de red)
  const saveCredentialsWithoutVerify = useCallback((newCreds: JiraCredentials): boolean => {
    setError(null);

    const normalizedCreds: JiraCredentials = {
      ...newCreds,
      domain: normalizeDomain(newCreds.domain),
      email: newCreds.email.trim(),
      token: newCreds.token.trim(),
    };

    const validation = validateCredentials(normalizedCreds);
    if (!validation.valid) {
      setError(validation.errors.join(". "));
      return false;
    }

    // Guardar sin lastVerified ya que no verificamos
    saveToStorage(normalizedCreds);
    loadCredentials();
    return true;
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

  const openConfigModal = useCallback(() => setIsConfigModalOpen(true), []);
  const closeConfigModal = useCallback(() => setIsConfigModalOpen(false), []);
  const clearError = useCallback(() => setError(null), []);

  // No renderizar hasta que esté hidratado para evitar mismatch
  const value: JiraContextValue = {
    credentials: isHydrated ? credentials : null,
    configStatus: isHydrated ? configStatus : { isConfigured: false, isVerified: false },
    isConfigured: isHydrated && configStatus.isConfigured,
    isVerifying,
    error,
    isConfigModalOpen,
    openConfigModal,
    closeConfigModal,
    saveCredentials,
    saveCredentialsWithoutVerify,
    clearCredentials,
    verifyCredentials,
    refresh: loadCredentials,
    clearError,
  };

  return (
    <JiraContext.Provider value={value}>
      {children}
    </JiraContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de JIRA
 */
export function useJira(): JiraContextValue {
  const context = useContext(JiraContext);
  if (!context) {
    throw new Error("useJira debe usarse dentro de un JiraProvider");
  }
  return context;
}
