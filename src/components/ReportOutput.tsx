// src/components/ReportOutput.tsx
"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Document, Packer, Footer, Paragraph, TextRun, PageNumber, AlignmentType,
} from "docx";
import { markdownToDocx } from "@/utils/markdownToDocx";
import formatReport, { FormData, HiddenFields } from "@/utils/formatReport";
import { ParsedData } from "@/utils/parseJiraContent";
import { saveAs } from "file-saver";
import { CheckCircle, ArrowLeft, DownloadCloud, RotateCcw, AlertCircle, Info, Loader2, FileImage } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessageType>(null);
  const [reportForPreview, setReportForPreview] = useState<string>("");

  useEffect(() => {
    if (parsedData) {
      setReportForPreview(formatReport(parsedData, formData, hiddenFields, 'jira'));
    }
  }, [parsedData, formData, hiddenFields]);


  const handleCopyAndExport = async () => {
    if (!parsedData) {
        setStatusMessage({ message: "No hay datos parseados para generar el reporte.", type: "error"});
        return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    let copied = false;
    let exported = false;
    let copyError = "";
    let exportError = "";

    const reportForJira = formatReport(parsedData, formData, hiddenFields, 'jira');
    try {
      await navigator.clipboard.writeText(reportForJira);
      copied = true;
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
      copyError = "No se pudo copiar el reporte para JIRA al portapapeles.";
    }

    const reportForDocx = formatReport(parsedData, formData, hiddenFields, 'docx');
    try {
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
      const filename = jiraCode?.trim()
        ? `Reporte_${jiraCode.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`
        : "Reporte_Prueba.docx";
      saveAs(blob, filename);
      exported = true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      console.error("Error exportando Word:", e);
      exportError = `Error exportando a Word: ${msg}`;
    }

    setIsLoading(false);

    if (copied && exported) {
      setStatusMessage({ message: "Reporte copiado (para JIRA) y exportado a Word con éxito.", type: "success" });
    } else if (copied && !exported) {
      setStatusMessage({ message: `Reporte copiado (para JIRA), pero falló la exportación a Word. ${exportError}`, type: "error" });
    } else if (!copied && exported) {
      setStatusMessage({ message: `Reporte exportado a Word, pero falló la copia (para JIRA) al portapapeles. ${copyError}`, type: "error" });
    } else {
      setStatusMessage({ message: `Fallaron ambas operaciones. Copia: ${copyError} Exportación: ${exportError}`, type: "error" });
    }
    setTimeout(() => setStatusMessage(null), 7000);
  };

  if (!parsedData) {
    return (
        <div className="max-w-4xl mx-auto mt-10 mb-12 p-8 text-center text-gray-600">
            Cargando datos del reporte... Si este mensaje persiste, intenta volver al paso anterior.
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-12 bg-gradient-to-br from-white via-blue-50 to-white shadow-2xl rounded-xl p-6 sm:p-8 space-y-8 relative z-10">
      <div className="flex flex-col sm:flex-row items-center justify-between pb-5 border-b border-gray-200">
        <div className="flex items-center mb-4 sm:mb-0">
            <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4 shadow">
                3
            </div>
            <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Revisión y Exportación</h2>
                <p className="text-gray-500 text-sm mt-0.5">Verifica el reporte final y utiliza las opciones de exportación.</p>
            </div>
        </div>
        <button
          onClick={onGoBackToStep2}
          className="w-full sm:w-auto inline-flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors px-4 py-2.5 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver a Datos Adicionales
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Vista Previa del Reporte (Formato JIRA):</h3>
        <div className="prose prose-sm sm:prose-base max-w-none p-4 sm:p-5 bg-white rounded-lg border border-gray-200 shadow-sm max-h-[60vh] overflow-y-auto">
          <ReactMarkdown
            components={{
              img: ({ alt, src, ...props }) => { 
                const altText = alt || ''; 
                if (!src) { 
                  return (
                    <span className="flex items-center text-xs italic text-gray-500 my-2 p-2 bg-gray-100 border border-gray-200 rounded-md">
                      <AlertCircle size={14} className="mr-2 text-yellow-500 flex-shrink-0" />
                      Referencia de imagen inválida o vacía: ({altText || 'Sin descripción'})
                    </span>
                  );
                }
                if (src.startsWith("data:image")) {
                  return (
                    <span className="flex items-center text-xs italic text-gray-500 my-2 p-2 bg-gray-100 border border-gray-200 rounded-md">
                      <FileImage size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                      {altText || 'Imagen adjunta (ver en Word)'}
                    </span>
                  );
                }
                // eslint-disable-next-line @next/next/no-img-element
                return <img src={src} alt={altText} className="max-w-sm h-auto rounded-md shadow-sm my-2" {...props}/>;
              },
              // CORRECCIÓN: Eliminado 'node' (o '_node') de la desestructuración
              table: ({ ...props}) => <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-300 my-4" {...props} /></div>,
              thead: ({ ...props}) => <thead className="bg-gray-100" {...props} />,
              th: ({ ...props}) => <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" {...props} />,
              td: ({ ...props}) => <td className="px-4 py-3 whitespace-pre-wrap text-sm text-gray-700" {...props} />,
              p: ({ ...props}) => <p className="my-2 leading-relaxed" {...props} />,
              ul: ({ ...props}) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
              ol: ({ ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
              li: ({ ...props}) => <li className="text-gray-700" {...props} />,
            }}
          >
            {reportForPreview}
          </ReactMarkdown>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3.5 rounded-md text-sm flex items-center shadow-md
          ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : ''}
          ${statusMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : ''}
          ${statusMessage.type === 'info' ? 'bg-blue-100 text-blue-700 border border-blue-300' : ''}
        `}>
          {statusMessage.type === 'success' && <CheckCircle size={18} className="mr-2.5 flex-shrink-0" />}
          {statusMessage.type === 'error' && <AlertCircle size={18} className="mr-2.5 flex-shrink-0" />}
          {statusMessage.type === 'info' && <Info size={18} className="mr-2.5 flex-shrink-0" />}
          {statusMessage.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-200 mt-8">
        <button
          onClick={handleCopyAndExport}
          disabled={isLoading || !parsedData}
          className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-base font-semibold disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin mr-2.5" />
          ) : (
            <DownloadCloud size={20} className="mr-2.5" />
          )}
          {isLoading ? "Procesando..." : "Copiar y Exportar a Word"}
        </button>

        <button
          onClick={onReset}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium disabled:opacity-70"
        >
          <RotateCcw size={16} className="mr-2" />
          Reiniciar Todo
        </button>
      </div>
    </div>
  );
}