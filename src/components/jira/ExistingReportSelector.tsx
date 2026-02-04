// src/components/jira/ExistingReportSelector.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  RefreshCw,
  ChevronRight,
  FileCheck,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useJira } from "@/contexts/JiraContext";
import { parseJiraReport, isTestReport } from "@/utils/parseJiraReport";
import type { JiraComment } from "@/types/jira";
import type { FormData } from "@/utils/formatReport";

interface ExistingReportSelectorProps {
  /** Código del issue de JIRA */
  issueKey: string;
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Callback para cerrar el modal */
  onClose: () => void;
  /** Callback cuando se selecciona cargar un reporte */
  onLoadReport: (formData: Partial<FormData>, commentId: string) => void;
  /** Callback cuando se selecciona crear nuevo */
  onCreateNew: () => void;
}

interface CommentWithParsed extends JiraComment {
  parsedData?: Partial<FormData>;
  parseConfidence?: number;
}

export const ExistingReportSelector: React.FC<ExistingReportSelectorProps> = ({
  issueKey,
  isOpen,
  onClose,
  onLoadReport,
  onCreateNew,
}) => {
  const { credentials, isConfigured } = useJira();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentWithParsed[]>([]);
  const [selectedComment, setSelectedComment] = useState<CommentWithParsed | null>(null);

  // Cargar comentarios
  const loadComments = useCallback(async () => {
    if (!isConfigured || !credentials || !issueKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jira-comments?issueKey=${encodeURIComponent(issueKey)}`, {
        headers: {
          "X-Jira-Domain": credentials.domain,
          "X-Jira-Email": credentials.email,
          "X-Jira-Token": credentials.token,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al cargar comentarios");
      }

      const data = await response.json();

      // Filtrar y parsear solo los que parecen reportes
      const reportComments: CommentWithParsed[] = data.comments
        .filter((c: JiraComment) => isTestReport(c.body))
        .map((c: JiraComment) => {
          const parsed = parseJiraReport(c.body);
          return {
            ...c,
            parsedData: parsed.formData,
            parseConfidence: parsed.confidence,
          };
        });

      setComments(reportComments);

      if (reportComments.length === 0 && data.comments.length > 0) {
        setError("No se encontraron reportes de prueba en los comentarios existentes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [credentials, isConfigured, issueKey]);

  // Cargar al abrir
  useEffect(() => {
    if (isOpen && issueKey) {
      loadComments();
      setSelectedComment(null);
    }
  }, [isOpen, issueKey, loadComments]);

  // Manejar selección de comentario
  const handleSelectComment = (comment: CommentWithParsed) => {
    setSelectedComment(comment);
  };

  // Manejar carga de reporte
  const handleLoadReport = () => {
    if (selectedComment && selectedComment.parsedData) {
      onLoadReport(selectedComment.parsedData, selectedComment.id);
    }
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden"
          >
            <div className="bg-[var(--surface)] dark:bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--surface-border)] dark:border-white/10 flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex-shrink-0 relative px-6 pt-6 pb-4 border-b border-[var(--surface-border)] dark:border-white/10">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">
                      Reportes existentes
                    </h2>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      {issueKey} - Selecciona un reporte para cargar o crea uno nuevo
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Loading */}
                {isLoading && (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Buscando reportes existentes...
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                  <div className="py-8 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-amber-500" />
                    </div>
                    <p className="text-sm text-[var(--foreground-secondary)] text-center">
                      {error}
                    </p>
                    <Button variant="secondary" size="sm" onClick={loadComments}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reintentar
                    </Button>
                  </div>
                )}

                {/* Lista de reportes */}
                {!isLoading && !error && comments.length > 0 && (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <button
                        key={comment.id}
                        onClick={() => handleSelectComment(comment)}
                        className={`
                          w-full p-4 rounded-xl text-left transition-all
                          border-2
                          ${selectedComment?.id === comment.id
                            ? "border-[var(--primary)] bg-[var(--primary)]/5"
                            : "border-[var(--surface-border)] dark:border-white/10 hover:border-[var(--primary)]/50 hover:bg-[var(--surface-hover)]"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            p-2 rounded-lg
                            ${selectedComment?.id === comment.id
                              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                              : "bg-[var(--surface-hover)] text-[var(--foreground-secondary)]"
                            }
                          `}>
                            <FileCheck className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-[var(--foreground)]">
                                Reporte de Pruebas
                              </span>
                              {comment.parseConfidence !== undefined && (
                                <span className={`
                                  px-1.5 py-0.5 rounded text-[10px] font-medium
                                  ${comment.parseConfidence > 0.7
                                    ? "bg-green-500/10 text-green-500"
                                    : comment.parseConfidence > 0.4
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-red-500/10 text-red-500"
                                  }
                                `}>
                                  {Math.round(comment.parseConfidence * 100)}% compatible
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-[var(--foreground-secondary)]">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {comment.author.displayName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(comment.created)}
                              </span>
                            </div>

                            {/* Preview de datos extraídos */}
                            {comment.parsedData && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {comment.parsedData.tester && (
                                  <span className="px-2 py-0.5 rounded bg-[var(--surface-hover)] text-xs">
                                    Tester: {comment.parsedData.tester}
                                  </span>
                                )}
                                {comment.parsedData.testStatus && (
                                  <span className={`
                                    px-2 py-0.5 rounded text-xs
                                    ${comment.parsedData.testStatus === "Exitoso"
                                      ? "bg-green-500/10 text-green-500"
                                      : comment.parsedData.testStatus === "Fallido"
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-[var(--surface-hover)]"
                                    }
                                  `}>
                                    {comment.parsedData.testStatus}
                                  </span>
                                )}
                                {comment.parsedData.batteryTests && (
                                  <span className="px-2 py-0.5 rounded bg-[var(--surface-hover)] text-xs">
                                    {comment.parsedData.batteryTests.length} caso(s)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <ChevronRight className={`
                            w-5 h-5 flex-shrink-0 transition-transform
                            ${selectedComment?.id === comment.id ? "text-[var(--primary)]" : "text-[var(--foreground-muted)]"}
                          `} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Sin reportes */}
                {!isLoading && !error && comments.length === 0 && (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                      <FilePlus className="w-8 h-8 text-[var(--foreground-secondary)]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[var(--foreground)] font-medium">
                        No hay reportes previos
                      </p>
                      <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                        Este issue no tiene comentarios con formato de reporte
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 py-4 bg-[var(--surface-hover)] dark:bg-white/[0.02] border-t border-[var(--surface-border)] dark:border-white/10 flex justify-between">
                <Button variant="secondary" onClick={onCreateNew}>
                  <FilePlus className="w-4 h-4 mr-2" />
                  Crear nuevo reporte
                </Button>

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleLoadReport}
                    disabled={!selectedComment}
                  >
                    Cargar reporte seleccionado
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExistingReportSelector;
