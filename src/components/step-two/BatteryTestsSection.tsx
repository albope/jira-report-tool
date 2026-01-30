// src/components/step-two/BatteryTestsSection.tsx
"use client";

import React, { useRef } from "react";
import Tippy from "@tippyjs/react";
import * as XLSX from "xlsx";
import { ListChecks, PlusCircle, Sheet, Download } from "lucide-react";
import "tippy.js/dist/tippy.css";

import { FormSection } from "./FormSection";
import { BatteryTestCaseCard } from "./BatteryTestCaseCard";
import type { BatteryTest, FormData } from "./types";

const EXPECTED_HEADERS = [
  "ID Prueba",
  "Descripción",
  "Pasos",
  "Resultado Esperado",
  "Resultado Obtenido",
  "Versión",
  "Estado",
];

interface BatteryTestsSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onTestChange: (index: number, field: keyof BatteryTest, value: string) => void;
  onAddTest: () => void;
  onRemoveTest: (index: number) => void;
  onDuplicateTest: (index: number) => void;
  collapsible?: boolean;
}

export const BatteryTestsSection: React.FC<BatteryTestsSectionProps> = ({
  formData,
  setFormData,
  onTestChange,
  onAddTest,
  onRemoveTest,
  onDuplicateTest,
  collapsible = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const sh = wb.Sheets[wb.SheetNames[0]];
      if (!sh) throw new Error("Hoja no encontrada en el Excel");
      const sd: unknown[][] = XLSX.utils.sheet_to_json(sh, { header: 1, blankrows: false });
      if (sd.length < 2) {
        alert("Excel vacío o sin datos suficientes.");
        return;
      }
      const hdr = sd[0] as string[];
      if (
        hdr.length !== EXPECTED_HEADERS.length ||
        !EXPECTED_HEADERS.every((h, i) => h === hdr[i]?.trim())
      ) {
        alert(
          `El formato de columnas no coincide.\nEsperado: ${EXPECTED_HEADERS.join(" | ")}\nEncontrado: ${hdr.join(" | ")}`
        );
        return;
      }
      const imp: BatteryTest[] = sd
        .slice(1)
        .map((row: unknown[], rowIndex) => {
          const [id, d, steps, er, or, ver, st] = row;
          return {
            id: String(id || `IMP-${rowIndex + 1}`).trim(),
            description: String(d || ""),
            steps: String(steps || ""),
            expectedResult: String(er || ""),
            obtainedResult: String(or || ""),
            testVersion: String(ver || ""),
            testStatus: String(st || "Pendiente"),
            images: [],
          };
        })
        .filter((nt) => nt.id);

      if (!imp.length) {
        alert("No se importaron casos válidos.");
        return;
      }

      setFormData((prev) => {
        const combinedTests = [...prev.batteryTests, ...imp];
        return {
          ...prev,
          batteryTests: combinedTests,
          summary: { ...prev.summary, totalTests: String(combinedTests.length) },
        };
      });
      alert(`Importados ${imp.length} casos de prueba.`);
    } catch (err) {
      console.error("Error al leer Excel:", err);
      alert(`Error al leer el archivo Excel: ${err instanceof Error ? err.message : "Error desconocido"}`);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  return (
    <FormSection title="Batería de Pruebas" icon={<ListChecks size={22} />} collapsible={collapsible}>
      <p className="text-sm text-[var(--foreground-tertiary)] -mt-3 mb-5">
        Define los casos de prueba ejecutados. Puedes añadir, eliminar, duplicar o importar desde Excel.
      </p>
      <div className="space-y-6">
        {formData.batteryTests.map((test, idx) => (
          <BatteryTestCaseCard
            key={test.id || idx}
            test={test}
            index={idx}
            onTestChange={onTestChange}
            onRemoveTest={onRemoveTest}
            onDuplicateTest={onDuplicateTest}
            setFormData={setFormData}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-[var(--surface-border)]">
        <button
          type="button"
          onClick={onAddTest}
          className="inline-flex items-center px-4 py-2 bg-[var(--success)] text-white rounded-lg text-sm font-medium hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--success)] shadow-sm hover:shadow-md transition-all"
        >
          <PlusCircle size={18} className="mr-2" /> Añadir Caso de Prueba
        </button>
        <Tippy content={`Importa casos desde Excel. Columnas: ${EXPECTED_HEADERS.join(", ")}`} placement="top">
          <button
            type="button"
            onClick={handleImportClick}
            className="inline-flex items-center px-4 py-2 bg-[var(--warning)] text-white rounded-lg text-sm font-medium hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--warning)] shadow-sm hover:shadow-md transition-all"
          >
            <Sheet size={18} className="mr-2" /> Importar Excel
          </button>
        </Tippy>
        <a
          href="/plantillas/plantilla_bateria_pruebas.xlsx"
          download
          className="inline-flex items-center text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline font-medium transition-colors"
        >
          <Download size={16} className="mr-1.5" />
          Descargar Plantilla Excel
        </a>
      </div>
      <input
        type="file"
        accept=".xls,.xlsx"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </FormSection>
  );
};
