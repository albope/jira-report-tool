// src/components/step-two/SummarySection.tsx
"use client";

import React from "react";
import { BarChart3, AlertTriangle } from "lucide-react";

import { FormSection } from "./FormSection";
import { StyledInput, StyledTextarea } from "./StyledFormComponents";
import type { FormData, Summary } from "./types";

interface SummarySectionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: Summary) => void;
  summaryValidationError: string | null;
  collapsible?: boolean;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  formData,
  onInputChange,
  summaryValidationError,
  collapsible = false,
}) => {
  return (
    <FormSection title="Resumen de Resultados" icon={<BarChart3 size={22} />} collapsible={collapsible}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
        <StyledInput
          label="Total de Pruebas"
          id="totalTests"
          type="number"
          min={0}
          value={formData.summary.totalTests}
          onChange={(e) =>
            onInputChange("summary", { ...formData.summary, totalTests: e.target.value })
          }
        />
        <StyledInput
          label="Pruebas Exitosas"
          id="successfulTests"
          type="number"
          min={0}
          max={Number(formData.summary.totalTests) || undefined}
          value={formData.summary.successfulTests}
          onChange={(e) =>
            onInputChange("summary", { ...formData.summary, successfulTests: e.target.value })
          }
        />
        <StyledInput
          label="Pruebas Fallidas"
          id="failedTests"
          type="number"
          min={0}
          max={Number(formData.summary.totalTests) || undefined}
          value={formData.summary.failedTests}
          onChange={(e) =>
            onInputChange("summary", { ...formData.summary, failedTests: e.target.value })
          }
        />
      </div>
      {summaryValidationError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700 text-sm">
          <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
          {summaryValidationError}
        </div>
      )}
      <StyledTextarea
        label="Observaciones del Resumen"
        id="observations"
        rows={4}
        placeholder="Breve resumen, notas adicionales sobre los resultados globales, o cualquier impedimento encontrado."
        value={formData.summary.observations}
        onChange={(e) =>
          onInputChange("summary", { ...formData.summary, observations: e.target.value })
        }
      />
    </FormSection>
  );
};
