// src/components/ReportOutput.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Document,
  Packer,
  Footer,
  Paragraph,
  TextRun,
  PageNumber,
  AlignmentType,
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
  Info,
  Sparkles,
  FileCheck,
} from "lucide-react";

import { PreviewTabs, PreviewContent, ExportMenu } from "./step-three";
import type { PreviewFormat } from "./step-three/types";
import type { ExportFormat } from "./step-three/ExportMenu";

interface ReportOutputProps {
  parsedData: ParsedData | null;
  formData: FormData;
  hiddenFields: HiddenFields;
  onReset: () => void;
  onGoBackToStep2: () => void;
  jiraCode?: string;
}

type StatusMessageType = {
  message: string;
  type: "success" | "error" | "info";
} | null;

export default function ReportOutput({
  parsedData,
  formData,
  hiddenFields,
  onReset,
  onGoBackToStep2,
  jiraCode,
}: ReportOutputProps) {
  const [previewFormat, setPreviewFormat] = useState<PreviewFormat>("jira");
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [lastExportSuccess, setLastExportSuccess] = useState<ExportFormat | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessageType>(null);
  const [reportContent, setReportContent] = useState<string>("");

  // Generar el contenido del reporte
  useEffect(() => {
    if (parsedData) {
      const format = previewFormat === "word" || previewFormat === "pdf" ? "docx" : "jira";
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
        switch (format) {
          case "clipboard": {
            const reportForJira = formatReport(parsedData, formData, hiddenFields, "jira");
            await navigator.clipboard.writeText(reportForJira);
            setStatusMessage({
              message: "Reporte copiado al portapapeles (formato JIRA)",
              type: "success",
            });
            setLastExportSuccess("clipboard");
            break;
          }

          case "docx": {
            const reportForDocx = formatReport(parsedData, formData, hiddenFields, "docx");
            const docElements = markdownToDocx(reportForDocx);
            const doc = new Document({
              sections: [
                {
                  properties: {},
                  footers: {
                    default: new Footer({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({ children: [PageNumber.CURRENT] }),
                            new TextRun({ children: [" / ", PageNumber.TOTAL_PAGES] }),
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
            break;
          }

          case "html": {
            const reportForHtml = formatReport(parsedData, formData, hiddenFields, "jira");
            const htmlContent = generateHtmlDocument(reportForHtml, formData.jiraCode);
            const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
            saveAs(blob, getFilename("html"));
            setStatusMessage({
              message: "Archivo HTML exportado correctamente",
              type: "success",
            });
            setLastExportSuccess("html");
            break;
          }

          case "pdf": {
            // Para PDF, generamos una página HTML y la abrimos para imprimir
            const reportForPdf = formatReport(parsedData, formData, hiddenFields, "docx");
            const htmlForPrint = generatePrintableHtml(reportForPdf, formData.jiraCode);
            const printWindow = window.open("", "_blank");
            if (printWindow) {
              printWindow.document.write(htmlForPrint);
              printWindow.document.close();
              printWindow.onload = () => {
                printWindow.print();
              };
            }
            setStatusMessage({
              message: "Ventana de impresión abierta. Selecciona 'Guardar como PDF'",
              type: "info",
            });
            setLastExportSuccess("pdf");
            break;
          }
        }
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
    [parsedData, formData, hiddenFields, getFilename]
  );

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
            <ExportMenu
              onExport={handleExport}
              isExporting={isExporting}
              exportingFormat={exportingFormat}
              lastExportSuccess={lastExportSuccess}
            />
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
                    : ""
                  }
                  ${statusMessage.type === "error"
                    ? "bg-[var(--error-soft)] border border-[var(--error)]/30 text-[var(--error-soft-foreground)]"
                    : ""
                  }
                  ${statusMessage.type === "info"
                    ? "bg-[var(--primary-soft)] border border-[var(--primary)]/30 text-[var(--primary)]"
                    : ""
                  }
                `}
              >
                {statusMessage.type === "success" && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                {statusMessage.type === "error" && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                {statusMessage.type === "info" && <Info className="w-5 h-5 flex-shrink-0" />}
                <span className="text-sm font-medium">{statusMessage.message}</span>
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

/**
 * Genera un documento HTML completo para exportación.
 */
function generateHtmlDocument(markdownContent: string, jiraCode: string): string {
  // Convertir markdown básico a HTML (simplificado)
  const htmlBody = markdownContent
    // Headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Line breaks
    .replace(/\n/g, "<br>\n")
    // Emojis section headers
    .replace(/📌/g, "&#128204;")
    .replace(/🖥️/g, "&#128421;")
    .replace(/✅/g, "&#9989;")
    .replace(/💾/g, "&#128190;")
    .replace(/📎/g, "&#128206;")
    .replace(/📝/g, "&#128221;")
    .replace(/📊/g, "&#128202;")
    .replace(/🛠️/g, "&#128736;")
    .replace(/📱/g, "&#128241;");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Pruebas - ${jiraCode}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f7;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    h1, h2, h3 { margin: 1.5rem 0 1rem; color: #1a1a1a; }
    h1 { font-size: 1.75rem; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; color: #374151; }
    h3 { font-size: 1rem; color: #6b7280; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.875rem;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 0.75rem;
      text-align: left;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    tr:nth-child(even) { background: #f9fafb; }
    pre, code {
      background: #1a1a2e;
      color: #e5e5e5;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Fira Code', monospace;
      font-size: 0.875rem;
    }
    .footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="container">
    ${htmlBody}
    <div class="footer">
      Generado automáticamente por JIRA Report Tool
    </div>
  </div>
</body>
</html>`;
}

/**
 * Genera HTML para impresión/PDF.
 */
function generatePrintableHtml(markdownContent: string, jiraCode: string): string {
  const htmlBody = markdownContent
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>\n")
    .replace(/📌/g, "&#128204;")
    .replace(/🖥️/g, "&#128421;")
    .replace(/✅/g, "&#9989;")
    .replace(/💾/g, "&#128190;")
    .replace(/📎/g, "&#128206;")
    .replace(/📝/g, "&#128221;")
    .replace(/📊/g, "&#128202;")
    .replace(/🛠️/g, "&#128736;")
    .replace(/📱/g, "&#128241;");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte de Pruebas - ${jiraCode}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: #000;
      font-size: 11pt;
    }
    h1 { font-size: 16pt; margin-bottom: 0.5cm; border-bottom: 1pt solid #000; }
    h2 { font-size: 13pt; margin-top: 0.5cm; }
    h3 { font-size: 11pt; }
    table { width: 100%; border-collapse: collapse; margin: 0.5cm 0; }
    th, td { border: 1pt solid #ccc; padding: 4pt 6pt; font-size: 9pt; }
    th { background: #f0f0f0; font-weight: bold; }
    pre, code {
      font-family: 'Courier New', monospace;
      background: #f5f5f5;
      padding: 8pt;
      font-size: 9pt;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;
}
