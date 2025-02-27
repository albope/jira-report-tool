"use client";

import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, Table, TextRun } from "docx";
import autoTable from "jspdf-autotable";

import { markdownToDocx } from "@/utils/markdownToDocx"; // <-- Nueva función para convertir Markdown a docx nativo

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
   * Copiar el reporte (Markdown) al portapapeles
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
   * Exportar a PDF con tablas nativas usando jspdf + autotable
   */
  const exportToPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");

    // Dividimos en bloques por doble salto de línea
    const blocks = report.split("\n\n");
    let yPos = 50;

    for (const block of blocks) {
      const lines = block.split("\n").map((line) => line.trim());
      // Detectar si es tabla:
      // - Mínimo 2 líneas
      // - Primera y segunda empiezan con "|"
      if (
        lines.length >= 2 &&
        lines[0].startsWith("|") &&
        lines[1].startsWith("|")
      ) {
        // Parseamos la tabla para autotable
        const { head, body } = parseMarkdownTable(lines);

        autoTable(doc, {
          startY: yPos,
          head: [head],
          body,
          theme: "grid",
          styles: { fontSize: 10 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 20;
      } else {
        // Texto normal => lo imprimimos línea a línea
        for (const line of lines) {
          doc.text(line, 50, yPos);
          yPos += 14; // salto de línea
        }
        yPos += 10; // espacio entre bloques
      }
    }

    doc.save("Reporte.pdf");
  };

  /**
   * parseMarkdownTable:
   *  Dadas las líneas de una tabla Markdown, genera { head, body } para jspdf-autotable
   */
  const parseMarkdownTable = (lines: string[]) => {
    // lines[0] => encabezado
    // lines[1] => separador
    // lines[2..] => filas
    const headerCells = parseTableRow(lines[0]);
    const head = headerCells; // array de celdas

    const dataLines = lines.slice(2);
    const body: string[][] = [];

    for (const dl of dataLines) {
      if (!dl.startsWith("|")) continue;
      const rowCells = parseTableRow(dl);
      body.push(rowCells);
    }

    return { head, body };
  };

  /**
   * parseTableRow:
   *  "| Col1 | Col2 |" => ["Col1", "Col2"]
   */
  const parseTableRow = (line: string): string[] => {
    return line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0 && !cell.startsWith("---"));
  };

  /**
   * Exportar a Word con tablas nativas usando docx
   */
  const exportToWord = async () => {
    // markdownToDocx => convierte el Markdown en un array de Paragraph | Table
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
    <div className="max-w-3xl mx-auto bg-white p-4 rounded shadow space-y-4 relative z-50">
      {/* Título de Paso 3 */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-600">Paso 3: Revisión del Reporte</h3>
      </div>

      {/* Encabezado con botón a la derecha */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Reporte Generado</h2>
        <button
          onClick={onGoBackToStep2}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          ← Volver a Datos Adicionales
        </button>
      </div>

      {/* Texto del reporte en un <pre> para mostrar saltos de línea */}
      <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200 max-h-96 overflow-auto">
        {report}
      </pre>

      <div className="flex flex-wrap gap-3">
        {/* Botón para copiar */}
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
        >
          Copiar al Portapapeles
        </button>

        {/* Dropdown Exportar */}
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
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Word
              </button>
              <button
                onClick={exportToPDF}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                PDF
              </button>
            </div>
          )}
        </div>

        {/* Botón para Reiniciar */}
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