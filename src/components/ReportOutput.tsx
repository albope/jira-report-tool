"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
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
      alert(
        "No se pudo copiar el reporte al portapapeles. Verifica permisos."
      );
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
      const name = jiraCode?.trim()
        ? `Reporte_${jiraCode.trim()}.docx`
        : "Reporte_Prueba.docx";
      saveAs(blob, name);
      exported = true;
    } catch {
      alert("Ocurrió un error al exportar a Word.");
    }

    if (copied && exported) {
      alert("Reporte copiado y exportado a Word con éxito.");
    } else if (copied) {
      alert("Reporte copiado, pero falló la exportación a Word.");
    } else if (exported) {
      alert("Reporte exportado a Word, pero falló la copia al portapapeles.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 shadow-xl rounded-lg">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Paso 3: Reporte Generado
        </h2>
        <p className="text-gray-600">Revisa el reporte y luego cópialo/exporta.</p>
        <hr className="mt-2 border-gray-300" />
      </div>

      {/* Volver */}
      <div className="text-right">
        <button
          onClick={onGoBackToStep2}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Volver a Paso 2
        </button>
      </div>

      {/* Vista previa Markdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700">
          Vista Previa (Markdown):
        </h3>
        <div className="prose max-h-[60vh] overflow-auto p-4 bg-white rounded border">
          <ReactMarkdown
            components={{
              img: ({ node, ...props }) => (
                <img {...props} className="max-w-full" />
              ),
            }}
          >
            {report}
          </ReactMarkdown>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-center gap-4 pt-4 border-t">
        <button
          onClick={handleCopyAndExport}
          className="px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 flex items-center gap-2"
        >
          Copiar &amp; Exportar a Word
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
        >
          Reiniciar Todo
        </button>
      </div>
    </div>
  );
}
