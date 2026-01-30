// src/components/step-two/LogsSection.tsx
"use client";

import React from "react";
import { FileTextIcon } from "lucide-react";

import { FormSection } from "./FormSection";
import { StyledTextarea } from "./StyledFormComponents";
import type { FormData } from "./types";

interface LogsSectionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  collapsible?: boolean;
}

export const LogsSection: React.FC<LogsSectionProps> = ({
  formData,
  onInputChange,
  collapsible = false,
}) => {
  return (
    <FormSection title="Logs Relevantes" icon={<FileTextIcon size={22} />} collapsible={collapsible}>
      <StyledTextarea
        label="Extractos de logs que ayuden a entender comportamientos o errores."
        id="logsRelevantes"
        rows={10}
        className="font-mono text-xs bg-[#1a1a2e] dark:bg-[#0d0d14] text-[var(--success)] placeholder-[var(--foreground-muted)] rounded-xl p-4"
        placeholder={`Ejemplo:\n[INFO] 2025-05-16 10:30:00 - User 'albope' logged in.\n[ERROR] 2025-05-16 10:32:15 - Service 'X' failed: Timeout after 30s.`}
        value={formData.logsRelevantes || ""}
        onChange={(e) => onInputChange("logsRelevantes", e.target.value)}
      />
    </FormSection>
  );
};
