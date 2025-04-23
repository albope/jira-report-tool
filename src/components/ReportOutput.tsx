"use client";

import React from "react";
import ReactMarkdown from "react-markdown";      // ya instalado
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
import { saveAs } from "file-saver";

interface ReportOutputProps {
  report: string;
  onReset: () => void;
  onGoBackToStep2: () => void;
  jiraCode?: string;
}

export default function ReportOutput({
  report,
  onReset,
  onGoBackToStep2,
  jiraCode,
}: ReportOutputProps) {
  const handleCopyAndExport = async () => {
    let copied = false,
      exported = false;

    try {
      await navigator.clipboard.writeText(report);
      copied = true;
    } catch {
      alert("No se pudo copiar al portapapeles.");
    }

    try {
      const docElements = markdownToDocx(report);
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
        ? `Reporte_${jiraCode.trim()}.docx`
        : "Reporte_Prueba.docx";
      saveAs(blob, filename);
      exported = true;
    } catch (e: any) {
      alert("Error exportando Word: " + e.message);
    }

    if (copied && exported) {
      alert("Reporte copiado y exportado con éxito.");
    } else if (copied) {
      alert("Reporte copiado, pero falló la exportación a Word.");
    } else if (exported) {
      alert("Reporte exportado, pero falló la copia al portapapeles.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 shadow-xl rounded-lg p-8 space-y-6 relative z-10 mb-8">
      {/* ——— Encabezado Paso 3 con botón alineado ——— */}
      <div className="space-y-6 max-w-3xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="flex items-center text-2xl font-bold mb-1">
              {/* Icono azul (check-circle) */}
              <svg
                className="w-6 h-6 mr-2 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L9 13.414l4.707-4.707z"
                  clipRule="evenodd"
                />
              </svg>
              Paso 3
            </h2>
            <p className="text-gray-600">
              Revisa el reporte y luego cópialo/exporta.
            </p>
            <hr className="mt-3 border-gray-200" />
          </div>

          {/* Botón «Volver a Editar (Paso 2)» al lado derecho */}
          <button
            onClick={onGoBackToStep2}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            ← Volver a datos adicionales
          </button>
        </div>
      </div>

      {/* ——— Preview Markdown renderizado, sin imágenes rotas ——— */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700">Vista Previa:</h3>
        <div className="prose max-w-none p-4 bg-white rounded border">
          <ReactMarkdown
            components={{
              img: ({ alt }) => (
                <span className="text-sm italic text-gray-500">{alt}</span>
              ),
            }}
          >
            {report}
          </ReactMarkdown>
        </div>
      </div>

      {/* ——— Botones de acción ——— */}
      <div className="flex flex-wrap gap-4 justify-center pt-6 border-t mt-6">
        <button
          onClick={handleCopyAndExport}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center gap-2"
        >
          {/* Icono Copiar */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copiar y Exportar a Word
        </button>

        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          {/* Icono Reiniciar */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2m0 0H15"
            />
          </svg>
          Reiniciar Todo
        </button>
      </div>
    </div>
  );
}