// src/components/share/ShareReportModal.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  generateShareableLink,
  copyToClipboard,
  estimateShareSize,
  formatSize,
} from "@/utils/shareReport";
import type { FormData, HiddenFields } from "@/utils/formatReport";
import type { ParsedData } from "@/utils/parseJiraContent";

interface ShareReportModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Callback para cerrar */
  onClose: () => void;
  /** Datos del formulario */
  formData: FormData;
  /** Campos ocultos */
  hiddenFields: HiddenFields;
  /** Datos parseados */
  parsedData: ParsedData;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  formData,
  hiddenFields,
  parsedData,
}) => {
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Estimar tamaño
  const sizeInfo = useMemo(() => {
    return estimateShareSize(formData, hiddenFields, parsedData);
  }, [formData, hiddenFields, parsedData]);

  // Generar URL cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const result = generateShareableLink(formData, hiddenFields, parsedData);
      if (result.success) {
        setShareUrl(result.url);
        setError(null);
      } else {
        setShareUrl("");
        setError(result.error || "Error al generar el link");
      }
      setCopied(false);
    }
  }, [isOpen, formData, hiddenFields, parsedData]);

  // Copiar al portapapeles
  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Abrir en nueva pestaña
  const handleOpenLink = () => {
    window.open(shareUrl, "_blank");
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
          >
            <div className="bg-[var(--surface)] dark:bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--surface-border)] dark:border-white/10">
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-[var(--surface-border)] dark:border-white/10">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">
                      Compartir Reporte
                    </h2>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      {formData.jiraCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-5">
                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-500">
                        No se puede compartir
                      </p>
                      <p className="text-sm text-red-400 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* URL generada */}
                {shareUrl && !error && (
                  <>
                    {/* Input con URL */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--foreground)]">
                        Link compartible
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--surface-border)] dark:border-white/10">
                          <LinkIcon className="w-4 h-4 text-[var(--foreground-secondary)] flex-shrink-0" />
                          <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 bg-transparent text-[var(--foreground)] text-sm truncate outline-none"
                          />
                        </div>
                        <Button
                          variant={copied ? "primary" : "secondary"}
                          onClick={handleCopy}
                          className="flex-shrink-0"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Info del tamaño */}
                    <div className="flex items-center justify-between text-xs text-[var(--foreground-secondary)]">
                      <span>Tamaño del link: {formatSize(shareUrl.length)}</span>
                      <button
                        onClick={handleOpenLink}
                        className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                      >
                        Abrir link
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Advertencia */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-600 dark:text-amber-400">
                        <p className="font-medium">Nota de privacidad</p>
                        <p className="mt-1">
                          Este link contiene todos los datos del reporte. Cualquier persona con
                          el link podrá ver la información. No incluye credenciales de JIRA.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Tamaño muy grande */}
                {!sizeInfo.isValid && !error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-500">
                        Reporte muy grande
                      </p>
                      <p className="text-sm text-amber-400 mt-1">
                        El reporte contiene muchos datos (especialmente imágenes).
                        Considera reducir el número de imágenes para poder compartirlo.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[var(--surface-hover)] dark:bg-white/[0.02] border-t border-[var(--surface-border)] dark:border-white/10 flex justify-end">
                <Button variant="secondary" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareReportModal;
