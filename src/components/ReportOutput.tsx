"use client";

import React, { useState, useEffect, useRef } from "react";
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

  /** Copiar al portapapeles */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(report);
      alert("Reporte copiado al portapapeles.");
    } catch (error) {
      console.error("Error al copiar al portapapeles", error);
    }
  };

  /** Exportar a Word => "Reporte_{jiraCode}.docx" */
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

    // Si tenemos jiraCode, usarlo en el nombre
    const code = jiraCode?.trim();
    link.download = code ? `Reporte_${code}.docx` : "Reporte.docx";

    link.click();
    URL.revokeObjectURL(blobUrl);
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
      {/* Título Paso 3 */}
      <div className="mb-6">
        <div className="flex items-center mb-2 space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="text-white w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477
                   0 8.268 2.943 9.542 7-1.274 4.057-5.065
                   7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Paso 3</h2>
        </div>
        <p className="text-gray-600 ml-10">Revisión del Reporte</p>
        <hr className="mt-3 border-gray-200" />
      </div>

      {/* Barra superior: Título y Volver */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Reporte Generado</h3>
        <button
          onClick={onGoBackToStep2}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 transition"
        >
          ← Volver a Datos Adicionales
        </button>
      </div>

      {/* Contenido del reporte en pre */}
      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-auto text-gray-800">
        {report}
      </pre>

      {/* Botones finales */}
      <div className="flex flex-wrap gap-3 justify-end">
        {/* Botón Copiar */}
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
        >
          Copiar al Portapapeles
        </button>

        {/* Menú Exportar (ahora puedes optar por integrarlo en un solo botón, si gustas) */}
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