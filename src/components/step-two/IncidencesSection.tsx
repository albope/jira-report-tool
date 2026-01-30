// src/components/step-two/IncidencesSection.tsx
"use client";

import React from "react";
import { AlertOctagon, XCircle, PlusCircle } from "lucide-react";

import { FormSection } from "./FormSection";
import { StyledInput, StyledTextarea } from "./StyledFormComponents";
import type { FormData, Incidence } from "./types";

interface IncidencesSectionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: boolean) => void;
  onIncidenceChange: (index: number, field: keyof Incidence, value: string) => void;
  addIncidence: () => void;
  removeIncidence: (index: number) => void;
  collapsible?: boolean;
}

export const IncidencesSection: React.FC<IncidencesSectionProps> = ({
  formData,
  onInputChange,
  onIncidenceChange,
  addIncidence,
  removeIncidence,
  collapsible = false,
}) => {
  return (
    <FormSection title="Incidencias Detectadas" icon={<AlertOctagon size={22} />} collapsible={collapsible}>
      <div className="flex items-center gap-4 mb-3">
        <label className="block text-sm font-medium text-[var(--foreground-secondary)] whitespace-nowrap">
          ¿Se detectaron incidencias?
        </label>
        <div className="flex items-center gap-3">
          {(["Sí", "No"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onInputChange("hasIncidences", option === "Sí")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm
                ${
                  (formData.hasIncidences && option === "Sí") ||
                  (!formData.hasIncidences && option === "No")
                    ? "bg-[var(--primary)] text-white ring-2 ring-offset-2 ring-[var(--primary)]/50"
                    : "bg-[var(--surface)] dark:bg-white/[0.05] text-[var(--foreground)] border border-[var(--surface-border)] hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.08] hover:border-[var(--foreground-muted)]"
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {formData.hasIncidences && (
        <div className="mt-5 space-y-5">
          {formData.incidences.map((inc, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border bg-[var(--error-soft)] dark:bg-[var(--error)]/10 border-[var(--error)]/30 relative space-y-4 shadow"
            >
              <button
                type="button"
                onClick={() => removeIncidence(i)}
                className="absolute top-2.5 right-2.5 p-1 text-[var(--error)] hover:text-[var(--error-hover)] rounded-full hover:bg-[var(--error)]/10 transition-colors"
                title="Eliminar incidencia"
              >
                <XCircle size={20} />
              </button>
              <h5 className="text-sm font-semibold text-[var(--error)]">Incidencia #{i + 1}</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <StyledInput
                  label="ID Prueba Relacionada"
                  id={`inc-id-${i}`}
                  placeholder="Ej: CASO-005"
                  value={inc.id}
                  onChange={(e) => onIncidenceChange(i, "id", e.target.value)}
                />
                <StyledInput
                  label="Estado Incidencia"
                  id={`inc-status-${i}`}
                  placeholder="Ej: Reportada, Corregida"
                  value={inc.status}
                  onChange={(e) => onIncidenceChange(i, "status", e.target.value)}
                />
              </div>
              <StyledTextarea
                label="Descripción Incidencia"
                id={`inc-desc-${i}`}
                rows={3}
                placeholder="Describe brevemente el problema"
                value={inc.description}
                onChange={(e) => onIncidenceChange(i, "description", e.target.value)}
              />
              <StyledInput
                label="Impacto"
                id={`inc-impact-${i}`}
                placeholder="Ej: Crítico, Alto, Medio"
                value={inc.impact}
                onChange={(e) => onIncidenceChange(i, "impact", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addIncidence}
            className="inline-flex items-center mt-2 px-3.5 py-2 bg-[var(--error)] text-white rounded-lg text-xs font-medium hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--error)] shadow-sm transition-all"
          >
            <PlusCircle size={16} className="mr-1.5" /> Añadir incidencia
          </button>
        </div>
      )}
    </FormSection>
  );
};
