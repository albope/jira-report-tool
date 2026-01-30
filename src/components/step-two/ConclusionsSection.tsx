// src/components/step-two/ConclusionsSection.tsx
"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

import { FormSection } from "./FormSection";
import { StyledTextarea } from "./StyledFormComponents";
import type { FormData } from "./types";

const EXAMPLE_CONCLUSION = `Ejemplo de conclusión:\n❌ Rechazado → El fallo bloquea la validación de la funcionalidad`;

interface ConclusionsSectionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  collapsible?: boolean;
}

export const ConclusionsSection: React.FC<ConclusionsSectionProps> = ({
  formData,
  onInputChange,
  collapsible = false,
}) => {
  const isExampleConclusion = formData.conclusion === EXAMPLE_CONCLUSION;

  return (
    <FormSection title="Conclusiones Finales" icon={<CheckCircle2 size={22} />} collapsible={collapsible}>
      <StyledTextarea
        label="Evaluación final del ciclo de pruebas y próximos pasos recomendados."
        id="conclusion"
        rows={5}
        className={isExampleConclusion ? "italic text-[var(--foreground-muted)]" : ""}
        placeholder={EXAMPLE_CONCLUSION}
        value={formData.conclusion}
        onChange={(e) => onInputChange("conclusion", e.target.value)}
      />
    </FormSection>
  );
};
