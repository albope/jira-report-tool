// src/components/step-two/TestDataSection.tsx
"use client";

import React from "react";
import { Layers } from "lucide-react";

import { FormSection } from "./FormSection";
import { StyledTextarea } from "./StyledFormComponents";
import type { FormData } from "./types";

interface TestDataSectionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  collapsible?: boolean;
}

export const TestDataSection: React.FC<TestDataSectionProps> = ({
  formData,
  onInputChange,
  collapsible = false,
}) => {
  return (
    <FormSection
      title="Datos de Prueba Utilizados (Globales)"
      icon={<Layers size={22} />}
      collapsible={collapsible}
    >
      <StyledTextarea
        label="Registro de datos de entrada, parámetros, usuarios, etc., comunes a varias pruebas."
        id="datosDePrueba"
        rows={5}
        className="font-mono text-xs"
        placeholder="Ej: Usuario: test_user | Contraseña: pwd | Pedido ID: 12345 | Filtro aplicado: Fecha='2025-04-22'"
        value={formData.datosDePrueba}
        onChange={(e) => onInputChange("datosDePrueba", e.target.value)}
      />
      <p className="text-xs text-[var(--foreground-tertiary)] mt-1.5">
        Estos son datos generales. Los datos específicos de un caso se pueden detallar dentro de cada
        tarjeta de caso de prueba si es necesario.
      </p>
    </FormSection>
  );
};
