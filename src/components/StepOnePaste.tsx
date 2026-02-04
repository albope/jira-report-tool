// src/components/StepOnePaste.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  AlertTriangle,
  Loader2,
  FileText,
  Globe,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useJira } from "@/contexts/JiraContext";
import { JiraSearchInput } from "@/components/jira/JiraSearchInput";
import type { JiraIssue } from "@/types/jira";

interface StepOnePasteProps {
  jiraContent: string;
  setJiraContent: (value: string) => void;
  onParse: (jiraKey?: string) => void;
}

type LoadMode = "api" | "paste";

export default function StepOnePaste({
  jiraContent,
  setJiraContent,
  onParse,
}: StepOnePasteProps) {
  const router = useRouter();
  const { isConfigured: userJiraConfigured } = useJira();
  const [loadMode, setLoadMode] = useState<LoadMode>("api");
  const [jiraKey, setJiraKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchedJiraTitle, setFetchedJiraTitle] = useState<string | null>(null);
  const [jiraConfigured, setJiraConfigured] = useState<boolean | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);

  // Handler para cuando se selecciona un issue desde JiraSearchInput
  const handleJiraSelect = (issue: JiraIssue) => {
    setJiraKey(issue.key);
    setFetchedJiraTitle(issue.summary);
    setJiraContent(issue.summary);
    setFetchError(null);
  };

  // Real-time validation
  const validation = useMemo(() => {
    const jiraKeyRegex = /^[A-Z]+-\d+$/;
    const isValidJiraKey = jiraKeyRegex.test(jiraKey.trim());
    const hasContent = jiraContent.trim().length > 0;
    const contentLength = jiraContent.trim().length;

    return {
      jiraKey: {
        isValid: jiraKey.trim() === "" || isValidJiraKey,
        message: jiraKey.trim() && !isValidJiraKey ? "Formato: PROYECTO-123" : null,
      },
      content: {
        isValid: hasContent,
        length: contentLength,
        message: contentLength > 0 && contentLength < 10 ? "Contenido muy corto" : null,
      },
    };
  }, [jiraKey, jiraContent]);

  // Check if JIRA is configured
  useEffect(() => {
    const checkJiraStatus = async () => {
      try {
        const res = await fetch("/api/jira-status");
        const data = await res.json();
        setJiraConfigured(data.configured);
        if (!data.configured) {
          setLoadMode("paste");
        }
      } catch {
        setJiraConfigured(false);
        setLoadMode("paste");
      }
    };
    checkJiraStatus();
  }, []);

  // Sync fetchedJiraTitle with jiraContent
  useEffect(() => {
    if (fetchedJiraTitle) {
      setJiraContent(fetchedJiraTitle);
    }
  }, [fetchedJiraTitle, setJiraContent]);

  const handleFetchSummary = async () => {
    if (!jiraKey.trim()) {
      setFetchError("Por favor, introduce un código de JIRA.");
      setIsConfigError(false);
      return;
    }

    setLoading(true);
    setFetchError(null);
    setIsConfigError(false);
    setFetchedJiraTitle(null);
    setJiraContent("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(
        `/api/jira-summary?key=${encodeURIComponent(jiraKey.trim())}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMsg = "No se pudo obtener el título del JIRA desde la API.";
        let isConfig = false;
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
          if (errorMsg.includes("variables de entorno") || errorMsg.includes("Configuración JIRA")) {
            isConfig = true;
          }
        } catch {
          // Ignore parsing errors
        }
        setIsConfigError(isConfig);
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (data.summary) {
        setFetchedJiraTitle(data.summary);
        if (data.key) setJiraKey(data.key);
      } else {
        setFetchError("No se encontró un título para este JIRA.");
        setFetchedJiraTitle(null);
      }
    } catch (err: unknown) {
      console.error("Error en fetchSummary:", err);
      let message = "Error consultando el JIRA.";
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          message = "La consulta tardó demasiado (timeout).";
        } else {
          message = err.message;
        }
      }
      setFetchError(message);
      setFetchedJiraTitle(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    onParse(jiraKey.trim() ? jiraKey.trim() : undefined);
  };

  const canProceed = fetchedJiraTitle || jiraContent.trim().length >= 10;

  const tabs = [
    {
      id: "api",
      label: jiraConfigured === false ? "API (no configurada)" : "Buscar API",
      icon: <Globe className={`w-4 h-4 ${jiraConfigured === false ? "opacity-50" : ""}`} />
    },
    { id: "paste", label: "Pegar texto", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="
        relative z-10 max-w-3xl mx-auto
        bg-[var(--surface)] dark:bg-[var(--surface)]/80
        dark:backdrop-blur-xl
        rounded-2xl
        border border-[var(--surface-border)] dark:border-white/[0.06]
        shadow-lg dark:shadow-2xl
        overflow-hidden
        transition-colors duration-200
      "
    >
      {/* Header Section */}
      <div className="relative px-6 sm:px-8 pt-6 sm:pt-8 pb-6 border-b border-[var(--surface-border)] dark:border-white/[0.06]">
        {/* Home Button */}
        <motion.button
          onClick={() => router.push("/")}
          title="Volver al inicio"
          className="
            absolute top-4 right-4 p-2.5 rounded-xl
            text-[var(--foreground-tertiary)]
            hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]
            hover:text-[var(--foreground)]
            transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
          "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home className="h-5 w-5" />
        </motion.button>

        {/* Title Area */}
        <div className="flex items-start gap-4">
          <div className="
            w-12 h-12 rounded-xl
            bg-gradient-to-br from-blue-600 to-violet-600
            flex items-center justify-center flex-shrink-0
            shadow-lg
          ">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              Generador de Reportes
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="
                px-2.5 py-1 rounded-full
                bg-[var(--primary-soft)] dark:bg-[var(--primary)]/10
                text-xs font-medium text-[var(--primary)]
              ">
                Paso 1 de 3
              </span>
              <span className="text-sm text-[var(--foreground-tertiary)]">
                Cargar contenido
              </span>
            </div>
          </div>
        </div>

        <p className="text-[var(--foreground-secondary)] mt-4">
          Selecciona cómo quieres cargar el contenido del JIRA para generar tu reporte.
        </p>
      </div>

      {/* Tabs Section */}
      <div className="px-6 sm:px-8 pt-6">
        <Tabs
          tabs={tabs}
          activeTab={loadMode}
          onChange={(id) => {
            setLoadMode(id as LoadMode);
            setFetchError(null);
          }}
          variant="default"
          fullWidth
        />
      </div>

      {/* Content Section */}
      <div className="px-6 sm:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* API Mode */}
          {loadMode === "api" && (
            <motion.div
              key="api"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Warning if JIRA not configured at all */}
              {!userJiraConfigured && jiraConfigured === false && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    flex items-start gap-3 p-4 rounded-xl
                    bg-[var(--warning-soft)] border border-[var(--warning)]/20
                  "
                >
                  <Info className="h-5 w-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--warning-soft-foreground)]">
                      API de JIRA no configurada
                    </p>
                    <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                      Configura tus credenciales JIRA en el botón de ajustes del header para habilitar la búsqueda con autocompletado.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* JIRA Search Input - Con autocompletado cuando usuario tiene credenciales */}
              {userJiraConfigured ? (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                    Buscar Issue en JIRA
                  </label>
                  <JiraSearchInput
                    onSelect={handleJiraSelect}
                    placeholder="Buscar por código (PROJ-123) o texto..."
                    initialValue={jiraKey}
                  />
                  <p className="text-xs text-[var(--foreground-muted)] mt-2">
                    Escribe al menos 2 caracteres para ver sugerencias
                  </p>
                </div>
              ) : (
                /* JIRA Key Input - Sin autocompletado (usa solo env vars del servidor) */
                <div>
                  <label
                    htmlFor="jiraKeyInput"
                    className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2"
                  >
                    Código del JIRA
                  </label>
                  <div className="flex items-stretch gap-3">
                    <div className="relative flex-grow">
                      <input
                        id="jiraKeyInput"
                        type="text"
                        placeholder="Ej: PROYECTO-1234"
                        value={jiraKey}
                        onChange={(e) => {
                          const newKey = e.target.value.toUpperCase();
                          setJiraKey(newKey);
                          if (fetchError) setFetchError(null);
                          if (fetchedJiraTitle) {
                            setFetchedJiraTitle(null);
                            setJiraContent("");
                          }
                        }}
                        className={`
                          w-full rounded-xl px-4 py-3
                          bg-[var(--input-bg)] dark:bg-[var(--surface)]
                          border text-[var(--foreground)] text-sm
                          placeholder:text-[var(--input-placeholder)]
                          transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)]
                          dark:focus:shadow-[0_0_0_1px_var(--primary),var(--shadow-glow)]
                          ${!validation.jiraKey.isValid
                            ? "border-[var(--warning)] focus:border-[var(--warning)]"
                            : "border-[var(--input-border)] dark:border-white/[0.08] focus:border-[var(--primary)]"
                          }
                        `}
                      />
                      {/* Validation Indicator */}
                      {jiraKey && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {validation.jiraKey.isValid ? (
                            <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Search Button */}
                    <motion.button
                      onClick={handleFetchSummary}
                      disabled={loading || !jiraKey.trim() || !validation.jiraKey.isValid}
                      className="
                        inline-flex items-center justify-center gap-2
                        bg-[var(--foreground)] dark:bg-white
                        text-white dark:text-[var(--background)]
                        px-5 py-3 rounded-xl
                        font-medium text-sm
                        shadow-sm hover:shadow-md
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        disabled:shadow-none
                      "
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Search className="h-5 w-5" />
                      )}
                      <span className="hidden sm:inline">
                        {loading ? "Buscando..." : "Buscar"}
                      </span>
                    </motion.button>
                  </div>
                  {validation.jiraKey.message && (
                    <p className="text-xs text-[var(--warning)] mt-2">
                      {validation.jiraKey.message}
                    </p>
                  )}
                </div>
              )}

              {/* Loading Progress - Solo para modo sin autocompletado */}
              {!userJiraConfigured && loading && (
                <div className="py-2">
                  <ProgressBar variant="gradient" size="sm" />
                  <p className="text-sm text-[var(--foreground-tertiary)] mt-2 text-center">
                    Consultando API de JIRA...
                  </p>
                </div>
              )}

              {/* Error or Config Warning - Solo para modo sin autocompletado */}
              {!userJiraConfigured && fetchError && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    flex items-start gap-3 p-4 rounded-xl
                    ${isConfigError
                      ? "bg-[var(--warning-soft)] border border-[var(--warning)]/20"
                      : "bg-[var(--error-soft)] border border-[var(--error)]/20"
                    }
                  `}
                >
                  {isConfigError ? (
                    <Info className="h-5 w-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isConfigError ? "text-[var(--warning-soft-foreground)]" : "text-[var(--error-soft-foreground)]"}`}>
                      {fetchError}
                    </p>
                    <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                      Puedes usar las otras opciones para cargar el contenido manualmente.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Success */}
              {fetchedJiraTitle && !loading && !fetchError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="
                    p-4 rounded-xl
                    bg-[var(--success-soft)] border border-[var(--success)]/20
                  "
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--success-soft-foreground)]">
                        Título cargado correctamente
                      </p>
                      <p className="text-[var(--foreground)] mt-1">{fetchedJiraTitle}</p>
                      <p className="text-xs text-[var(--foreground-tertiary)] mt-2">
                        Podrás editarlo en el siguiente paso.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Paste Mode */}
          {loadMode === "paste" && (
            <motion.div
              key="paste"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="jira-input"
                    className="block text-sm font-medium text-[var(--foreground-secondary)]"
                  >
                    Contenido del JIRA
                  </label>
                  {jiraContent && (
                    <span className="text-xs text-[var(--foreground-muted)]">
                      {jiraContent.length} caracteres
                    </span>
                  )}
                </div>
                <textarea
                  id="jira-input"
                  className="
                    w-full h-48 rounded-xl px-4 py-3
                    bg-[var(--input-bg)] dark:bg-[var(--surface)]
                    border border-[var(--input-border)] dark:border-white/[0.08]
                    text-[var(--foreground)] text-sm
                    placeholder:text-[var(--input-placeholder)]
                    transition-all duration-200
                    focus:outline-none focus:border-[var(--primary)]
                    focus:ring-2 focus:ring-[var(--input-ring)]
                    dark:focus:shadow-[0_0_0_1px_var(--primary),var(--shadow-glow)]
                    resize-none
                  "
                  placeholder="Pega aquí el contenido completo del JIRA (título, descripción, etc.)"
                  value={jiraContent}
                  onChange={(e) => setJiraContent(e.target.value)}
                />
                {validation.content.message && (
                  <p className="text-xs text-[var(--warning)] mt-2">
                    {validation.content.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="px-6 sm:px-8 py-5 bg-[var(--surface-hover)] dark:bg-white/[0.02] border-t border-[var(--surface-border)] dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--foreground-tertiary)]">
            {canProceed ? (
              <span className="flex items-center gap-1.5 text-[var(--success)]">
                <CheckCircle2 className="w-4 h-4" />
                Listo para continuar
              </span>
            ) : (
              "Carga contenido para continuar"
            )}
          </p>

          <motion.button
            onClick={handleNextStep}
            disabled={!canProceed}
            className="
              inline-flex items-center gap-2
              bg-[var(--foreground)] dark:bg-white
              text-white dark:text-[var(--background)]
              py-3 px-6 rounded-xl
              font-semibold text-sm
              shadow-sm hover:shadow-md
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:shadow-none
            "
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
          >
            Siguiente Paso
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
