// src/components/step-two/GeneralInfoSection.tsx
"use client";

import React from "react";
import { Info, Edit3 } from "lucide-react";

import { FormSection } from "./FormSection";
import { StyledInput, StyledSelect } from "./StyledFormComponents";
import type { FormData, Summary } from "./types";

interface GeneralInfoSectionProps {
  parsedTitle: string;
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | boolean | Summary) => void;
  jiraCodeLocked: boolean;
  forceUnlock: boolean;
  setForceUnlock: (value: boolean) => void;
  collapsible?: boolean;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  parsedTitle,
  formData,
  onInputChange,
  jiraCodeLocked,
  forceUnlock,
  setForceUnlock,
  collapsible = false,
}) => {
  return (
    <FormSection title="Información General" icon={<Info size={22} />} collapsible={collapsible}>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
          Título JIRA (del Paso 1)
        </label>
        <p className="mt-1 p-3 bg-[var(--surface-hover)] dark:bg-white/[0.03] rounded-xl text-[var(--foreground)] text-sm min-h-[42px] border border-[var(--surface-border)]">
          {parsedTitle || "(No se cargó título desde el Paso 1)"}
        </p>
      </div>
      <StyledInput
        label="Código de JIRA"
        id="jiraCode"
        type="text"
        placeholder="Ej: PROJ-123"
        value={formData.jiraCode}
        onChange={(e) => onInputChange("jiraCode", e.target.value)}
        required
        disabled={jiraCodeLocked && !forceUnlock}
      />
      {jiraCodeLocked && !forceUnlock && (
        <button
          type="button"
          className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline mt-1.5 flex items-center transition-colors"
          onClick={() => setForceUnlock(true)}
        >
          <Edit3 size={12} className="mr-1" /> ¿Código incorrecto? Editar.
        </button>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <StyledInput
          label="Fecha de Prueba"
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => onInputChange("date", e.target.value)}
        />
        <StyledInput
          label="Tester"
          id="tester"
          type="text"
          placeholder="Iniciales o nombre completo"
          value={formData.tester}
          onChange={(e) => onInputChange("tester", e.target.value)}
        />
      </div>
      <StyledSelect
        label="Estado General de la Prueba"
        id="testStatus"
        value={formData.testStatus}
        onChange={(e) => onInputChange("testStatus", e.target.value)}
        required
      >
        <option value="" disabled>Seleccione un estado...</option>
        <option value="Exitosa">Exitosa</option>
        <option value="Fallida">Fallida</option>
        <option value="Parcial">Parcialmente Exitosa</option>
        <option value="Bloqueada">Bloqueada</option>
      </StyledSelect>
    </FormSection>
  );
};
