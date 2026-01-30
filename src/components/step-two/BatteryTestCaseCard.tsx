// src/components/step-two/BatteryTestCaseCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import Tippy from "@tippyjs/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Copy, Trash2, XCircle, Download } from "lucide-react";
import "tippy.js/dist/tippy.css";

import { StyledInput, StyledTextarea, StyledSelect } from "./StyledFormComponents";
import type { BatteryTest, FormData } from "./types";

const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

async function downloadImagesZip(tests: BatteryTest[]) {
  const zip = new JSZip();
  tests.forEach((t) => {
    if (!t.images?.length) return;
    const folderName = t.id.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const folder = zip.folder(folderName)!;
    t.images.forEach((b64, i) => {
      const mimeMatch = b64.match(/^data:(image\/\w+)/);
      const mime = mimeMatch ? mimeMatch[1] : "image/png";
      const ext = mime.split("/")[1]?.toLowerCase() || "png";
      const base64Data = b64.split(",")[1];
      if (base64Data) {
        folder.file(`evidencia-${i + 1}.${ext}`, base64Data, { base64: true });
      }
    });
  });
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "evidencias_pruebas.zip");
}

interface BatteryTestCaseCardProps {
  test: BatteryTest;
  index: number;
  onTestChange: (index: number, field: keyof BatteryTest, value: string) => void;
  onRemoveTest: (index: number) => void;
  onDuplicateTest: (index: number) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export const BatteryTestCaseCard: React.FC<BatteryTestCaseCardProps> = ({
  test,
  index,
  onTestChange,
  onRemoveTest,
  onDuplicateTest,
  setFormData,
}) => {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const b64s = await Promise.all(files.map(readFileAsBase64));
      setFormData((prev: FormData) => {
        const updatedTests = prev.batteryTests.map((t, i) => {
          if (i === index) {
            return { ...t, images: [...(t.images || []), ...b64s] };
          }
          return t;
        });
        return { ...prev, batteryTests: updatedTests };
      });
    } catch (error) {
      console.error("Error al leer imágenes:", error);
      alert("Hubo un error al cargar una o más imágenes.");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveImage = (imgIndex: number) => {
    setFormData((prev: FormData) => {
      const updatedTests = prev.batteryTests.map((t, i) => {
        if (i === index) {
          const updatedImages = t.images?.filter((_, idx) => idx !== imgIndex);
          return { ...t, images: updatedImages };
        }
        return t;
      });
      return { ...prev, batteryTests: updatedTests };
    });
  };

  // Theme-aware status colors using CSS variables
  const getStatusStyles = () => {
    switch (test.testStatus) {
      case "Exitoso":
        return {
          border: "border-[var(--success)]",
          text: "text-[var(--success-soft-foreground)]",
          bg: "bg-[var(--success-soft)]",
        };
      case "Fallido":
        return {
          border: "border-[var(--error)]",
          text: "text-[var(--error-soft-foreground)]",
          bg: "bg-[var(--error-soft)]",
        };
      case "Bloqueado":
        return {
          border: "border-[var(--warning)]",
          text: "text-[var(--warning-soft-foreground)]",
          bg: "bg-[var(--warning-soft)]",
        };
      default:
        return {
          border: "border-[var(--surface-border)]",
          text: "text-[var(--foreground-secondary)]",
          bg: "bg-[var(--surface-hover)]",
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <div className={`p-5 rounded-xl border-2 ${statusStyles.border} ${statusStyles.bg} shadow-md space-y-4 relative group transition-colors duration-200`}>
      <div className={`flex justify-between items-center pb-2 mb-3 border-b ${statusStyles.border}`}>
        <span className={`text-sm font-semibold ${statusStyles.text} px-2.5 py-1 rounded-md`}>
          ID Caso: {test.id || `Caso #${index + 1}`}
        </span>
        <div className="flex space-x-1">
          <Tippy content="Duplicar Caso de Prueba">
            <button
              type="button"
              onClick={() => onDuplicateTest(index)}
              className="p-2 text-[var(--primary)] hover:bg-[var(--primary-soft)] rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <Copy size={16} />
            </button>
          </Tippy>
          <Tippy content="Eliminar Caso de Prueba">
            <button
              type="button"
              onClick={() => onRemoveTest(index)}
              className="p-2 text-[var(--error)] hover:bg-[var(--error-soft)] rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--error)]"
            >
              <Trash2 size={16} />
            </button>
          </Tippy>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <StyledInput
          label="ID Prueba (Editable)"
          id={`test-id-${index}`}
          placeholder="Ej: CASO-001"
          value={test.id}
          onChange={(e) => onTestChange(index, "id", e.target.value)}
        />
        <StyledInput
          label="Versión Probada"
          id={`test-version-${index}`}
          placeholder="Ej: v1.2.0"
          value={test.testVersion}
          onChange={(e) => onTestChange(index, "testVersion", e.target.value)}
        />
      </div>
      <StyledTextarea
        label="Descripción del Caso"
        id={`test-desc-${index}`}
        rows={2}
        placeholder="Describe el objetivo de la prueba"
        value={test.description}
        onChange={(e) => onTestChange(index, "description", e.target.value)}
      />
      <StyledTextarea
        label="Pasos para Reproducir"
        id={`test-steps-${index}`}
        rows={4}
        placeholder="1. Ir a...\n2. Hacer clic en...\n3. Verificar que..."
        value={test.steps}
        onChange={(e) => onTestChange(index, "steps", e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <StyledTextarea
          label="Resultado Esperado"
          id={`test-expected-${index}`}
          rows={3}
          placeholder="Lo que debería suceder"
          value={test.expectedResult}
          onChange={(e) => onTestChange(index, "expectedResult", e.target.value)}
        />
        <StyledTextarea
          label="Resultado Obtenido"
          id={`test-obtained-${index}`}
          rows={3}
          placeholder="Lo que sucedió realmente"
          value={test.obtainedResult}
          onChange={(e) => onTestChange(index, "obtainedResult", e.target.value)}
        />
      </div>
      <StyledSelect
        label="Estado del Caso"
        id={`test-status-${index}`}
        value={test.testStatus}
        onChange={(e) => onTestChange(index, "testStatus", e.target.value)}
      >
        <option value="Pendiente">Pendiente</option>
        <option value="Exitoso">Exitoso</option>
        <option value="Fallido">Fallido</option>
        <option value="Bloqueado">Bloqueado</option>
        <option value="No aplica">No aplica</option>
      </StyledSelect>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
          Evidencias (Imágenes)
        </label>
        <input
          type="file"
          accept="image/*,.jpeg,.jpg,.png,.gif"
          multiple
          className="block w-full text-xs text-[var(--foreground-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--primary-soft)] file:text-[var(--primary)] hover:file:bg-[var(--surface-hover)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          onChange={handleImageUpload}
        />
        {test.images && test.images.length > 0 && (
          <div className="mt-3.5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {test.images.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-md overflow-hidden border-2 border-[var(--surface-border)] shadow-sm group/image hover:border-[var(--primary)] transition-all"
              >
                <Image
                  src={src}
                  alt={`Evidencia ${index + 1}-${i + 1}`}
                  fill
                  className="object-cover group-hover/image:scale-105 transition-transform duration-300"
                  unoptimized={true}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 bg-[var(--error)]/80 hover:bg-[var(--error-hover)] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover/image:opacity-100 transition-opacity focus:opacity-100"
                  title="Eliminar esta imagen"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {test.images && test.images.length > 0 && (
          <div className="text-right mt-2.5">
            <button
              type="button"
              onClick={() => downloadImagesZip([test])}
              className="inline-flex items-center text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium hover:underline"
            >
              <Download size={14} className="mr-1" /> Descargar ZIP ({test.images.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
