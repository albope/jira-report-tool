// src/components/step-two/EnvironmentConfigSection.tsx
"use client";

import React from "react";
import { Settings, XCircle, PlusCircle, ListPlus } from "lucide-react";

import { FormSection } from "./FormSection";
import { StyledInput, StyledTextarea, StyledSelect } from "./StyledFormComponents";
import type { FormData, HiddenFields, Summary } from "./types";

interface EnvironmentConfigSectionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | boolean | Summary) => void;
  hiddenFields: HiddenFields;
  hideField: (key: keyof HiddenFields) => void;
  restoreAll: () => void;
  onVersionChange: (index: number, field: "appName" | "appVersion", value: string) => void;
  addVersion: () => void;
  removeVersion: (index: number) => void;
  onCustomFieldChange: (index: number, field: "label" | "value", value: string) => void;
  addCustomField: () => void;
  removeCustomField: (index: number) => void;
  collapsible?: boolean;
}

export const EnvironmentConfigSection: React.FC<EnvironmentConfigSectionProps> = ({
  formData,
  onInputChange,
  hiddenFields,
  hideField,
  restoreAll,
  onVersionChange,
  addVersion,
  removeVersion,
  onCustomFieldChange,
  addCustomField,
  removeCustomField,
  collapsible = false,
}) => {
  const anyHidden = Object.values(hiddenFields).some(Boolean);

  return (
    <FormSection title="Entorno y Configuración" icon={<Settings size={22} />} collapsible={collapsible}>
      <div className="pt-1">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-[var(--primary)] rounded-sm border-[var(--input-border)] focus:ring-[var(--primary)] focus:ring-offset-1"
            checked={formData.isApp || false}
            onChange={(e) => onInputChange("isApp", e.target.checked)}
          />
          <span className="ml-2 text-sm text-[var(--foreground-secondary)]">
            ¿Es validación de una APP Móvil/Escritorio?
          </span>
        </label>
      </div>

      {formData.isApp && (
        <div className="mt-4 p-4 border rounded-xl bg-[var(--primary-soft)] dark:bg-[var(--primary)]/10 border-[var(--primary)]/20 space-y-4">
          <h4 className="font-semibold text-[var(--primary)] text-sm">Detalles Específicos de la APP</h4>
          <StyledInput
            label="Endpoint (si aplica)"
            id="app-endpoint"
            placeholder="https://api.ejemplo.com"
            value={formData.endpoint || ""}
            onChange={(e) => onInputChange("endpoint", e.target.value)}
          />
          <StyledInput
            label="Sistema Operativo / Versión"
            id="app-os"
            placeholder="Android 13, iOS 16.5, Windows 11"
            value={formData.sistemaOperativo || ""}
            onChange={(e) => onInputChange("sistemaOperativo", e.target.value)}
          />
          <StyledInput
            label="Dispositivo de Pruebas"
            id="app-device"
            placeholder="Pixel 8, iPhone 14 Pro, PC…"
            value={formData.dispositivoPruebas || ""}
            onChange={(e) => onInputChange("dispositivoPruebas", e.target.value)}
          />
          <StyledTextarea
            label="Precondiciones Específicas APP"
            id="app-preconds"
            rows={2}
            placeholder="Ej: Permisos concedidos, versión mínima requerida..."
            value={formData.precondiciones || ""}
            onChange={(e) => onInputChange("precondiciones", e.target.value)}
          />
          <StyledInput
            label="Idioma Configurado"
            id="app-lang"
            placeholder="es-ES, en-US"
            value={formData.idioma || ""}
            onChange={(e) => onInputChange("idioma", e.target.value)}
          />
        </div>
      )}

      {/* Versiones */}
      <div className="mt-5 space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
          Versiones de Aplicativos/Componentes
        </label>
        {formData.versions.map((v, i) => (
          <div key={i} className="flex items-center space-x-3 bg-[var(--surface-hover)] dark:bg-white/[0.03] p-3 rounded-xl border border-[var(--surface-border)]">
            <input
              type="text"
              aria-label={`Nombre aplicativo ${i + 1}`}
              className="flex-grow border-[var(--input-border)] bg-[var(--input-bg)] dark:bg-[var(--surface)] text-[var(--foreground)] p-2.5 rounded-lg shadow-sm text-sm focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="Nombre aplicativo"
              value={v.appName}
              onChange={(e) => onVersionChange(i, "appName", e.target.value)}
            />
            <input
              type="text"
              aria-label={`Versión aplicativo ${i + 1}`}
              className="w-32 border-[var(--input-border)] bg-[var(--input-bg)] dark:bg-[var(--surface)] text-[var(--foreground)] p-2.5 rounded-lg shadow-sm text-sm focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="Versión"
              value={v.appVersion}
              onChange={(e) => onVersionChange(i, "appVersion", e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeVersion(i)}
              className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors"
              title="Eliminar esta versión"
            >
              <XCircle size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addVersion}
          className="inline-flex items-center mt-1.5 px-3.5 py-2 bg-[var(--success)] text-white rounded-lg text-xs font-medium hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--success)] shadow-sm transition-all"
        >
          <PlusCircle size={16} className="mr-1.5" /> Añadir versión
        </button>
      </div>

      {/* Campos de entorno adicionales */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2.5">Campos de Entorno Adicionales</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          {!hiddenFields.serverPruebas && (
            <div className="relative group">
              <StyledInput
                label="Servidor de Pruebas"
                id="serverPruebas"
                placeholder="Ej: Servidor UAT"
                value={formData.serverPruebas}
                onChange={(e) => onInputChange("serverPruebas", e.target.value)}
              />
              <button
                type="button"
                onClick={() => hideField("serverPruebas")}
                className="absolute top-1 right-1 text-[var(--foreground-muted)] hover:text-[var(--error)] p-1 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]"
                title="Ocultar campo"
              >
                <XCircle size={18} />
              </button>
            </div>
          )}
          {!hiddenFields.ipMaquina && (
            <div className="relative group">
              <StyledInput
                label="IP Máquina Cliente"
                id="ipMaquina"
                placeholder="Ej: 192.168.1.100"
                value={formData.ipMaquina}
                onChange={(e) => onInputChange("ipMaquina", e.target.value)}
              />
              <button
                type="button"
                onClick={() => hideField("ipMaquina")}
                className="absolute top-1 right-1 text-[var(--foreground-muted)] hover:text-[var(--error)] p-1 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]"
                title="Ocultar campo"
              >
                <XCircle size={18} />
              </button>
            </div>
          )}
          {!hiddenFields.navegador && (
            <div className="relative group">
              <StyledInput
                label="Navegador Utilizado"
                id="navegador"
                placeholder="Ej: Chrome 120"
                value={formData.navegador}
                onChange={(e) => onInputChange("navegador", e.target.value)}
              />
              <button
                type="button"
                onClick={() => hideField("navegador")}
                className="absolute top-1 right-1 text-[var(--foreground-muted)] hover:text-[var(--error)] p-1 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]"
                title="Ocultar campo"
              >
                <XCircle size={18} />
              </button>
            </div>
          )}
          {!hiddenFields.baseDatos && (
            <div className="relative group">
              <StyledSelect
                label="Base de Datos"
                id="baseDatos"
                value={formData.baseDatos}
                onChange={(e) => onInputChange("baseDatos", e.target.value)}
              >
                <option value="">Seleccione o escriba...</option>
                <option value="SQL Server">SQL Server</option>
                <option value="Oracle">Oracle</option>
                <option value="MySQL">MySQL</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="MongoDB">MongoDB</option>
                <option value="N/A">N/A</option>
              </StyledSelect>
              {(formData.baseDatos === "" ||
                !["SQL Server", "Oracle", "MySQL", "PostgreSQL", "MongoDB", "N/A"].includes(formData.baseDatos)) && (
                <input
                  type="text"
                  className="mt-1.5 w-full border-[var(--input-border)] bg-[var(--input-bg)] dark:bg-[var(--surface)] text-[var(--foreground)] p-2.5 rounded-lg shadow-sm text-sm focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder="Especifique BD"
                  value={formData.baseDatos}
                  onChange={(e) => onInputChange("baseDatos", e.target.value)}
                />
              )}
              <button
                type="button"
                onClick={() => hideField("baseDatos")}
                className="absolute top-1 right-1 text-[var(--foreground-muted)] hover:text-[var(--error)] p-1 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]"
                title="Ocultar campo"
              >
                <XCircle size={18} />
              </button>
            </div>
          )}
          {!hiddenFields.maquetaUtilizada && (
            <div className="relative group">
              <StyledInput
                label="Maqueta Utilizada"
                id="maquetaUtilizada"
                placeholder="Ej: Maqueta XYZ v2"
                value={formData.maquetaUtilizada}
                onChange={(e) => onInputChange("maquetaUtilizada", e.target.value)}
              />
              <button
                type="button"
                onClick={() => hideField("maquetaUtilizada")}
                className="absolute top-1 right-1 text-[var(--foreground-muted)] hover:text-[var(--error)] p-1 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]"
                title="Ocultar campo"
              >
                <XCircle size={18} />
              </button>
            </div>
          )}
          {!hiddenFields.ambiente && (
            <div className="relative group">
              <StyledSelect
                label="Ambiente"
                id="ambiente"
                value={formData.ambiente}
                onChange={(e) => onInputChange("ambiente", e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="Desarrollo">Desarrollo</option>
                <option value="Integración">Integración</option>
                <option value="UAT">UAT</option>
                <option value="Transferencia">Transferencia</option>
                <option value="PRE">Pre-Producción</option>
                <option value="PROD">Producción</option>
              </StyledSelect>
              {(formData.ambiente === "" ||
                !["Desarrollo", "Integración", "UAT", "Transferencia", "PRE", "PROD"].includes(formData.ambiente)) && (
                <input
                  type="text"
                  className="mt-1.5 w-full border-[var(--input-border)] bg-[var(--input-bg)] dark:bg-[var(--surface)] text-[var(--foreground)] p-2.5 rounded-lg shadow-sm text-sm focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder="Especifique Ambiente"
                  value={formData.ambiente}
                  onChange={(e) => onInputChange("ambiente", e.target.value)}
                />
              )}
              <button
                type="button"
                onClick={() => hideField("ambiente")}
                className="absolute top-1 right-1 text-[var(--foreground-muted)] hover:text-[var(--error)] p-1 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]"
                title="Ocultar campo"
              >
                <XCircle size={18} />
              </button>
            </div>
          )}
        </div>
        {anyHidden && (
          <div className="mt-5 text-right">
            <button
              type="button"
              onClick={restoreAll}
              className="inline-flex items-center text-xs px-3 py-1.5 bg-[var(--surface-active)] text-[var(--foreground-secondary)] rounded-lg hover:bg-[var(--surface-hover)] dark:bg-white/[0.05] dark:hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--foreground-muted)] shadow-sm transition-colors"
            >
              <ListPlus size={14} className="mr-1.5" /> Mostrar todos los campos de entorno
            </button>
          </div>
        )}
      </div>

      {/* Campos personalizados */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
          Campos Personalizados (Entorno)
        </label>
        {formData.customEnvFields.map((f, i) => (
          <div key={i} className="flex items-center space-x-3 bg-[var(--surface-hover)] dark:bg-white/[0.03] p-3 rounded-xl border border-[var(--surface-border)] mt-2">
            <input
              type="text"
              aria-label={`Nombre campo ${i + 1}`}
              placeholder="Nombre del campo"
              className="flex-grow border-[var(--input-border)] bg-[var(--input-bg)] dark:bg-[var(--surface)] text-[var(--foreground)] p-2.5 rounded-lg shadow-sm text-sm focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
              value={f.label}
              onChange={(e) => onCustomFieldChange(i, "label", e.target.value)}
            />
            <input
              type="text"
              aria-label={`Valor campo ${i + 1}`}
              placeholder="Valor del campo"
              className="flex-grow border-[var(--input-border)] bg-[var(--input-bg)] dark:bg-[var(--surface)] text-[var(--foreground)] p-2.5 rounded-lg shadow-sm text-sm focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:outline-none"
              value={f.value}
              onChange={(e) => onCustomFieldChange(i, "value", e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeCustomField(i)}
              className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors"
              title="Eliminar campo"
            >
              <XCircle size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addCustomField}
          className="inline-flex items-center mt-2.5 px-3.5 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-medium hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--primary)] shadow-sm transition-colors"
        >
          <PlusCircle size={16} className="mr-1.5" /> Añadir campo personalizado
        </button>
      </div>
    </FormSection>
  );
};
