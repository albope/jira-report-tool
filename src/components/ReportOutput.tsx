"use client";

import React, { useEffect} from "react";
import { Document, Packer } from "docx";
import { markdownToDocx } from "@/utils/markdownToDocx";

interface ReportOutputProps {
  report: string;
  onReset: () => void;
  onGoBackToStep2: () => void;
  /** Nueva prop para renombrar Word */
  jiraCode?: string;
}

export default function ReportOutput({
  report,
  onReset,
  onGoBackToStep2,
  jiraCode,
}: ReportOutputProps) {
  // Eliminamos el menú desplegable, ya que ahora habrá un solo botón
  // con la lógica combinada.
  // Por ello, ya no necesitamos showExportMenu ni dropdownRef.

  useEffect(() => {
    // Antes había lógica para cerrar el menú, la removemos al quitar el dropdown.
    // Si la quisiéramos conservar para algo adicional, dejaríamos aquí, 
    // pero ya no es necesaria para el botón único.
  }, []);

  /**
   * Función que realiza ambas acciones:
   * 1) Copiar el reporte al portapapeles.
   * 2) Exportar a Word con el nombre `Reporte_{jiraCode}.docx` si `jiraCode` existe.
   */
  const handleCopyAndExport = async () => {
    try {
      // 1) Copiar al portapapeles
      await navigator.clipboard.writeText(report);

      // 2) Generar documento Word
      const docElements = markdownToDocx(report);
      const doc = new Document({
        sections: [{ children: docElements }],
      });

      const blob = await Packer.toBlob(doc);
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const code = jiraCode?.trim();
      link.download = code ? `Reporte_${code}.docx` : "Reporte.docx";
      link.click();

      URL.revokeObjectURL(blobUrl);

      // 3) Notificación al usuario
      alert("Reporte copiado al portapapeles y exportado a Word.");
    } catch (error) {
      console.error("Error al copiar y/o exportar", error);
      alert("Ocurrió un error al copiar/exportar el reporte");
    }
  };

  return (
    <div
      className="
        max-w-4xl mx-auto
        mt-8
        bg-gradient-to-br from-white via-blue-50 to-white
        shadow-lg rounded-lg p-8 space-y-6
        relative z-10
        mb-8
      "
    >
      {/* Título / Encabezado */}
      <div className="mb-6">
        <div className="flex items-center mb-2 space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="text-white w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732
                   7.943 7.523 5 12 5c4.477 0
                   8.268 2.943 9.542 7-1.274
                   4.057-5.065 7-9.542 7-4.477
                   0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Paso 3</h2>
        </div>
        <p className="text-gray-600 ml-10">Revisión del Reporte</p>
        <hr className="mt-3 border-gray-200" />
      </div>

      {/* Sección superior con título y botón "Volver" */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Reporte Generado</h3>
        <button
          onClick={onGoBackToStep2}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 transition"
        >
          ← Volver a Datos Adicionales
        </button>
      </div>

      {/* Visualización del reporte en <pre> */}
      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-auto text-gray-800">
        {report}
      </pre>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3 justify-end">
        {/* Botón único que hace ambas cosas */}
        <button
          onClick={handleCopyAndExport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
        >
          Copiar y Exportar
        </button>

        {/* Botón Reiniciar */}
        <button
          onClick={onReset}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}