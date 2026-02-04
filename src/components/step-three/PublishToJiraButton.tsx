// src/components/step-three/PublishToJiraButton.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2, AlertCircle, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useJira } from "@/contexts/JiraContext";
import { useToast } from "@/components/ui/Toast";

interface PublishToJiraButtonProps {
  /** Código del issue de JIRA */
  jiraCode: string;
  /** Contenido del reporte a publicar */
  reportContent: string;
  /** ID del comentario existente (para actualizar en lugar de crear) */
  existingCommentId?: string;
  /** Callback cuando se publica exitosamente */
  onSuccess?: (commentId: string) => void;
  /** Variante del botón */
  variant?: "primary" | "secondary" | "ghost";
  /** Tamaño del botón */
  size?: "sm" | "md" | "lg";
  /** Si mostrar solo icono */
  iconOnly?: boolean;
}

export const PublishToJiraButton: React.FC<PublishToJiraButtonProps> = ({
  jiraCode,
  reportContent,
  existingCommentId,
  onSuccess,
  variant = "primary",
  size = "md",
  iconOnly = false,
}) => {
  const { credentials, isConfigured, openConfigModal } = useJira();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    commentId?: string;
    error?: string;
  } | null>(null);

  // Si no está configurado JIRA, no mostrar el botón
  if (!isConfigured) {
    return null;
  }

  const handleClick = () => {
    setIsModalOpen(true);
    setPublishResult(null);
  };

  const handlePublish = async () => {
    if (!credentials) return;

    setIsPublishing(true);
    setPublishResult(null);

    try {
      const method = existingCommentId ? "PUT" : "POST";

      const response = await fetch("/api/jira-comment", {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Jira-Domain": credentials.domain,
          "X-Jira-Email": credentials.email,
          "X-Jira-Token": credentials.token,
        },
        body: JSON.stringify({
          issueKey: jiraCode,
          comment: reportContent,
          commentId: existingCommentId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al publicar el comentario");
      }

      setPublishResult({
        success: true,
        commentId: data.commentId,
      });

      toast.success(
        existingCommentId ? "Comentario actualizado" : "Reporte publicado",
        `El reporte se ha ${existingCommentId ? "actualizado" : "publicado"} en ${jiraCode}`
      );

      onSuccess?.(data.commentId);

      // Cerrar modal después de un momento
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setPublishResult({
        success: false,
        error: errorMessage,
      });
      toast.error("Error al publicar", errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    if (!isPublishing) {
      setIsModalOpen(false);
    }
  };

  const buttonLabel = existingCommentId ? "Actualizar en JIRA" : "Publicar en JIRA";

  return (
    <>
      {/* Botón principal */}
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={!jiraCode || !reportContent}
        title={!jiraCode ? "Se requiere un código JIRA" : buttonLabel}
      >
        <Send className={iconOnly ? "w-4 h-4" : "w-4 h-4 mr-2"} />
        {!iconOnly && buttonLabel}
      </Button>

      {/* Modal de confirmación */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Modal Container - centered with flexbox */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md">
              <div className="bg-[var(--surface)] dark:bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--surface-border)] dark:border-white/10">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 border-b border-[var(--surface-border)] dark:border-white/10">
                  <button
                    onClick={handleClose}
                    disabled={isPublishing}
                    className="absolute top-4 right-4 p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--foreground)]">
                        {existingCommentId ? "Actualizar comentario" : "Publicar reporte"}
                      </h2>
                      <p className="text-sm text-[var(--foreground-secondary)]">
                        {jiraCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                  {/* Estado: Sin resultado (confirmación) */}
                  {!publishResult && !isPublishing && (
                    <div className="space-y-4">
                      <p className="text-sm text-[var(--foreground-secondary)]">
                        {existingCommentId
                          ? "Se actualizará el comentario existente con el nuevo contenido del reporte."
                          : "Se creará un nuevo comentario con el contenido del reporte en el issue de JIRA."
                        }
                      </p>

                      {/* Preview del contenido */}
                      <div className="p-3 rounded-lg bg-[var(--background)] dark:bg-white/[0.02] border border-[var(--surface-border)] dark:border-white/10 max-h-40 overflow-y-auto">
                        <pre className="text-xs text-[var(--foreground-secondary)] whitespace-pre-wrap font-mono">
                          {reportContent.slice(0, 500)}
                          {reportContent.length > 500 && "..."}
                        </pre>
                      </div>

                      <p className="text-xs text-[var(--foreground-muted)]">
                        {reportContent.length} caracteres
                      </p>
                    </div>
                  )}

                  {/* Estado: Publicando */}
                  {isPublishing && (
                    <div className="py-8 flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                      <p className="text-sm text-[var(--foreground-secondary)]">
                        {existingCommentId ? "Actualizando comentario..." : "Publicando reporte..."}
                      </p>
                    </div>
                  )}

                  {/* Estado: Éxito */}
                  {publishResult?.success && (
                    <div className="py-8 flex flex-col items-center gap-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-[var(--foreground)]">
                          {existingCommentId ? "Comentario actualizado" : "Reporte publicado"}
                        </p>
                        <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                          El reporte está disponible en JIRA
                        </p>
                      </div>
                      <a
                        href={`https://${credentials?.domain}/browse/${jiraCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                      >
                        Ver en JIRA
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Estado: Error */}
                  {publishResult && !publishResult.success && (
                    <div className="py-6 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-[var(--foreground)]">
                          Error al publicar
                        </p>
                        <p className="text-sm text-red-500 mt-1">
                          {publishResult.error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-[var(--surface-hover)] dark:bg-white/[0.02] border-t border-[var(--surface-border)] dark:border-white/10 flex justify-end gap-3">
                  {!publishResult && !isPublishing && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={handleClose}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handlePublish}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {existingCommentId ? "Actualizar" : "Publicar"}
                      </Button>
                    </>
                  )}

                  {publishResult && !publishResult.success && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={handleClose}
                      >
                        Cerrar
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handlePublish}
                      >
                        Reintentar
                      </Button>
                    </>
                  )}

                  {publishResult?.success && (
                    <Button
                      variant="primary"
                      onClick={handleClose}
                    >
                      Cerrar
                    </Button>
                  )}
                </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublishToJiraButton;
