// src/components/ReportOutput.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Document,
  Packer,
  Footer,
  Header,
  Paragraph,
  TextRun,
  PageNumber,
  AlignmentType,
  convertInchesToTwip,
  TabStopType,
  TabStopPosition,
} from "docx";
import { markdownToDocx } from "@/utils/markdownToDocx";
import formatReport, { FormData, HiddenFields } from "@/utils/formatReport";
import { ParsedData } from "@/utils/parseJiraContent";
import { saveAs } from "file-saver";
import {
  CheckCircle,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  Sparkles,
  FileCheck,
  Save,
  Check,
  Loader2,
  FilePlus2,
} from "lucide-react";

import { PreviewTabs, PreviewContent, ExportMenu, PublishToJiraButton } from "./step-three";
import { Button } from "@/components/ui/Button";
import type { PreviewFormat } from "./step-three/types";
import type { ExportFormat } from "./step-three/ExportMenu";

interface ReportOutputProps {
  parsedData: ParsedData | null;
  formData: FormData;
  hiddenFields: HiddenFields;
  onReset: () => void;
  onGoBackToStep2: () => void;
  jiraCode?: string;
  onSaveToHistory?: () => Promise<void>;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

type StatusMessageType = {
  message: string;
  type: "success" | "error";
} | null;

export default function ReportOutput({
  parsedData,
  formData,
  hiddenFields,
  onReset,
  onGoBackToStep2,
  jiraCode,
  onSaveToHistory,
  isSaving = false,
  lastSaved,
}: ReportOutputProps) {
  const [previewFormat, setPreviewFormat] = useState<PreviewFormat>("jira");
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [lastExportSuccess, setLastExportSuccess] = useState<ExportFormat | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessageType>(null);
  const [reportContent, setReportContent] = useState<string>("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [completedAction, setCompletedAction] = useState<"jira" | "export" | null>(null);

  // Mostrar feedback de guardado exitoso
  useEffect(() => {
    if (lastSaved && !isSaving) {
      setShowSaveSuccess(true);
      const timer = setTimeout(() => setShowSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved, isSaving]);

  // Generar el contenido del reporte
  useEffect(() => {
    if (parsedData) {
      const format = previewFormat === "word" ? "docx" : "jira";
      setReportContent(formatReport(parsedData, formData, hiddenFields, format));
    }
  }, [parsedData, formData, hiddenFields, previewFormat]);

  // Limpiar mensaje después de un tiempo
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const getFilename = useCallback(
    (extension: string) => {
      const code = jiraCode?.trim();
      const sanitized = code ? code.replace(/[^a-zA-Z0-9_-]/g, "_") : "Reporte_Prueba";
      return `Reporte_${sanitized}.${extension}`;
    },
    [jiraCode]
  );

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!parsedData) {
        setStatusMessage({
          message: "No hay datos para exportar.",
          type: "error",
        });
        return;
      }

      setIsExporting(true);
      setExportingFormat(format);
      setLastExportSuccess(null);

      try {
        // Solo exportación a Word
        const reportForDocx = formatReport(parsedData, formData, hiddenFields, "docx");
        const docElements = markdownToDocx(reportForDocx);

        // Fecha formateada para el documento
        const formattedDate = formData.date || new Date().toISOString().split("T")[0];
        const reportTitle = `Reporte de Pruebas - ${jiraCode || "Sin código"}`;

        const doc = new Document({
          // Metadata del documento
          creator: formData.tester || "JIRA Report Tool",
          title: reportTitle,
          description: `Reporte de pruebas para ${jiraCode || "ticket"} generado el ${formattedDate}`,
          keywords: "pruebas, QA, reporte, JIRA",
          lastModifiedBy: formData.tester || "JIRA Report Tool",

          sections: [
            {
              properties: {
                // Márgenes personalizados (en twips: 1 inch = 1440 twips)
                page: {
                  margin: {
                    top: convertInchesToTwip(1),
                    right: convertInchesToTwip(1),
                    bottom: convertInchesToTwip(1),
                    left: convertInchesToTwip(1),
                  },
                },
              },
              headers: {
                default: new Header({
                  children: [
                    new Paragraph({
                      tabStops: [
                        {
                          type: TabStopType.RIGHT,
                          position: TabStopPosition.MAX,
                        },
                      ],
                      children: [
                        new TextRun({
                          text: jiraCode || "Reporte de Pruebas",
                          bold: true,
                          size: 20, // 10pt
                          color: "666666",
                        }),
                        new TextRun({
                          text: "\t", // Tab para alinear a la derecha
                        }),
                        new TextRun({
                          text: formattedDate,
                          size: 20,
                          color: "666666",
                        }),
                      ],
                      border: {
                        bottom: {
                          color: "CCCCCC",
                          space: 1,
                          size: 6,
                          style: "single" as const,
                        },
                      },
                      spacing: { after: 200 },
                    }),
                  ],
                }),
              },
              footers: {
                default: new Footer({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      border: {
                        top: {
                          color: "CCCCCC",
                          space: 1,
                          size: 6,
                          style: "single" as const,
                        },
                      },
                      spacing: { before: 200 },
                      children: [
                        new TextRun({
                          text: "Página ",
                          size: 18,
                          color: "666666",
                        }),
                        new TextRun({
                          children: [PageNumber.CURRENT],
                          size: 18,
                          color: "666666",
                        }),
                        new TextRun({
                          text: " de ",
                          size: 18,
                          color: "666666",
                        }),
                        new TextRun({
                          children: [PageNumber.TOTAL_PAGES],
                          size: 18,
                          color: "666666",
                        }),
                      ],
                    }),
                  ],
                }),
              },
              children: docElements,
            },
          ],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, getFilename("docx"));
        setStatusMessage({
          message: "Documento Word exportado correctamente",
          type: "success",
        });
        setLastExportSuccess("docx");
        setCompletedAction("export");
      } catch (error) {
        console.error("Error during export:", error);
        setStatusMessage({
          message: `Error al exportar: ${error instanceof Error ? error.message : "Error desconocido"}`,
          type: "error",
        });
      } finally {
        setIsExporting(false);
        setExportingFormat(null);
      }
    },
    [parsedData, formData, hiddenFields, getFilename, jiraCode]
  );

  const handleJiraPublishSuccess = useCallback(() => {
    setCompletedAction("jira");
  }, []);

  if (!parsedData) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-8 text-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-hover)]" />
          <div className="h-4 w-48 bg-[var(--surface-hover)] rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      {/* Card principal con glassmorphism */}
      <div
        className="
          relative overflow-hidden
          bg-[var(--glass-bg)] backdrop-blur-xl
          border border-[var(--glass-border)]
          rounded-2xl shadow-xl
        "
      >
        {/* Efecto de gradiente decorativo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[var(--primary)]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 sm:p-8 border-b border-[var(--surface-border)] dark:border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                className="
                  flex items-center justify-center w-12 h-12
                  bg-gradient-to-br from-[var(--success)] to-[var(--success-hover)]
                  text-white rounded-xl shadow-lg shadow-[var(--success)]/25
                "
              >
                <FileCheck className="w-6 h-6" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  Revisión y Exportación
                </h2>
                <p className="text-sm text-[var(--foreground-tertiary)] mt-0.5">
                  Verifica el reporte final y exporta en el formato deseado
                </p>
              </div>
            </div>
            <button
              onClick={onGoBackToStep2}
              className="
                inline-flex items-center gap-2 px-4 py-2.5
                text-sm font-medium text-[var(--foreground-secondary)]
                bg-[var(--surface-hover)] dark:bg-white/5
                hover:bg-[var(--surface-active)] dark:hover:bg-white/10
                rounded-xl transition-colors
              "
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="relative p-6 sm:p-8 space-y-6">
          {/* Tabs de preview y acciones */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <PreviewTabs
              activeFormat={previewFormat}
              onFormatChange={setPreviewFormat}
            />
            <div className="flex items-center gap-3">
              {/* Botón para guardar en historial */}
              {onSaveToHistory && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onSaveToHistory}
                  disabled={isSaving}
                  className="relative"
                >
                  <AnimatePresence mode="wait">
                    {isSaving ? (
                      <motion.span
                        key="saving"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </motion.span>
                    ) : showSaveSuccess ? (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-[var(--success)]"
                      >
                        <Check className="w-4 h-4" />
                        <span>Guardado</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              )}
              {/* Botón para publicar en JIRA */}
              {jiraCode && (
                <PublishToJiraButton
                  jiraCode={jiraCode}
                  reportContent={formatReport(parsedData, formData, hiddenFields, "jira")}
                  variant="secondary"
                  size="md"
                  onSuccess={handleJiraPublishSuccess}
                />
              )}
              <ExportMenu
                onExport={handleExport}
                isExporting={isExporting}
                exportingFormat={exportingFormat}
                lastExportSuccess={lastExportSuccess}
              />
            </div>
          </div>

          {/* Status message */}
          <AnimatePresence mode="wait">
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={`
                  flex items-center gap-3 p-4 rounded-xl
                  ${statusMessage.type === "success"
                    ? "bg-[var(--success-soft)] border border-[var(--success)]/30 text-[var(--success-soft-foreground)]"
                    : "bg-[var(--error-soft)] border border-[var(--error)]/30 text-[var(--error-soft-foreground)]"
                  }
                `}
              >
                {statusMessage.type === "success" && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                {statusMessage.type === "error" && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <span className="text-sm font-medium">{statusMessage.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Banner de acción completada con botón Nuevo Reporte */}
          <AnimatePresence>
            {completedAction && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="
                  flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl
                  bg-gradient-to-r from-[var(--success)]/10 via-[var(--success)]/5 to-transparent
                  border border-[var(--success)]/30
                "
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-[var(--success)]/20">
                    <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {completedAction === "jira"
                        ? "¡Reporte publicado en JIRA!"
                        : "¡Documento exportado!"}
                    </p>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      ¿Listo para crear un nuevo reporte?
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onReset}
                  className="whitespace-nowrap shadow-lg shadow-[var(--primary)]/25"
                >
                  <FilePlus2 className="w-5 h-5 mr-2" />
                  Nuevo Reporte
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Área de preview */}
          <div
            className="
              relative rounded-xl overflow-hidden
              bg-[var(--surface)] dark:bg-[var(--surface)]
              border border-[var(--surface-border)] dark:border-white/5
            "
          >
            {/* Barra de título del preview */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--surface-border)] dark:border-white/5 bg-[var(--surface-hover)] dark:bg-white/[0.02]">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <span className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <span className="ml-2 text-xs text-[var(--foreground-tertiary)] font-medium">
                {previewFormat.toUpperCase()} Preview
              </span>
            </div>

            {/* Contenido del preview */}
            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                <PreviewContent
                  content={reportContent}
                  format={previewFormat}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Información adicional */}
          <div className="flex items-center gap-2 text-xs text-[var(--foreground-tertiary)]">
            <Sparkles className="w-4 h-4" />
            <span>
              El reporte contiene {formData.batteryTests.length} caso(s) de prueba
              {formData.hasIncidences && ` y ${formData.incidences.length} incidencia(s)`}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative p-6 sm:p-8 border-t border-[var(--surface-border)] dark:border-white/5 bg-[var(--surface-hover)] dark:bg-white/[0.02]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--foreground-tertiary)]">
              ¿Necesitas hacer cambios? Puedes volver al paso anterior.
            </p>
            <button
              onClick={onReset}
              disabled={isExporting}
              className="
                inline-flex items-center gap-2 px-5 py-2.5
                text-sm font-medium
                text-[var(--foreground-secondary)]
                bg-[var(--surface)] dark:bg-white/5
                hover:bg-[var(--surface-active)] dark:hover:bg-white/10
                border border-[var(--surface-border)] dark:border-white/10
                rounded-xl transition-colors
                disabled:opacity-50
              "
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar Todo
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
