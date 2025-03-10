// src/components/ReportOutput.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Document, Packer } from "docx";
import { markdownToDocx } from "@/utils/markdownToDocx";

interface ReportOutputProps {
  report: string;
  onReset: () => void;
  onGoBackToStep2: () => void; // Botón para volver a la pantalla 2
}

export default function ReportOutput({
  report,
  onReset,
  onGoBackToStep2,
}: ReportOutputProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleExportMenu = () => setShowExportMenu(!showExportMenu);

  /**
   * Copiar el reporte (Markdown) al portapapeles.
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(report);
      alert("Reporte copiado al portapapeles.");
    } catch (error) {
      console.error("Error al copiar al portapapeles", error);
    }
  };

  /**
   * Exportar a Word (sin numeración de páginas).
   */
  const exportToWord = async () => {
    const docElements = markdownToDocx(report);
    const doc = new Document({
      sections: [
        {
          children: docElements,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "Reporte.docx";
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div
      className="
        max-w-4xl mx-auto
        bg-gradient-to-br from-white via-blue-50 to-white
        shadow-lg rounded-lg p-8 space-y-6
        relative z-50
        mb-8
      "
    >
      {/* Título de Paso 3 */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800">
          Paso 3: Revisión del Reporte
        </h3>
      </div>

      {/* Encabezado con botón a la derecha */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Reporte Generado</h2>
        <button
          onClick={onGoBackToStep2}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 transition"
        >
          ← Volver a Datos Adicionales
        </button>
      </div>

      {/* Visualización del reporte */}
      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-auto text-gray-800">
        {report}
      </pre>

      <div className="flex flex-wrap gap-3 justify-end">
        {/* Botón Copiar */}
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
        >
          Copiar al Portapapeles
        </button>

        {/* Menú desplegable para Exportar */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleExportMenu}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Exportar
          </button>
          {showExportMenu && (
            <div
              className="absolute mt-2 w-32 bg-white border border-gray-300 rounded shadow-lg z-50"
              style={{ top: "100%", left: 0 }}
            >
              <button
                onClick={exportToWord}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
              >
                Word
              </button>
            </div>
          )}
        </div>

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