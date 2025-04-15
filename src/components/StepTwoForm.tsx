"use client";

import React, { useEffect, useRef } from "react";
import { ParsedData } from "@/utils/parseJiraContent";
import * as XLSX from "xlsx";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

/** Batería de Pruebas */
interface BatteryTest {
  id: string;
  description: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testVersion: string;
  testStatus: string;
}

/** Incidencias */
interface Incidence {
  id: string;
  description: string;
  impact: string;
  status: string;
}

/** Resumen */
interface Summary {
  totalTests: string;
  successfulTests: string;
  failedTests: string;
  observations: string;
}

/** Campos ocultables (true = oculto) */
export interface HiddenFields {
  serverPruebas: boolean;
  ipMaquina: boolean;
  navegador: boolean;
  baseDatos: boolean;
  maquetaUtilizada: boolean;
  ambiente: boolean;
}

/** FormData principal */
export interface FormData {
  jiraCode: string;
  date: string;
  tester: string;
  testStatus: string;
  versions: Array<{ appName: string; appVersion: string }>;
  serverPruebas: string;
  ipMaquina: string;
  navegador: string;
  baseDatos: string;
  maquetaUtilizada: string;
  ambiente: string;

  batteryTests: BatteryTest[];
  summary: Summary;
  incidences: Incidence[];
  hasIncidences: boolean;
  conclusion: string;
  datosDePrueba: string;

  // Campos APP
  isApp?: boolean;
  endpoint?: string;
  sistemaOperativo?: string;
  dispositivoPruebas?: string;
  precondiciones?: string;
  idioma?: string;

  // ★ NUEVO: Campos personalizados del entorno
  customEnvFields: Array<{ label: string; value: string }>;
}

interface StepTwoFormProps {
  parsedData: ParsedData;
  formData: FormData;
  setFormData: (val: FormData) => void;

  // Ahora recibimos y seteamos la info de campos ocultos
  hiddenFields: HiddenFields;
  setHiddenFields: React.Dispatch<React.SetStateAction<HiddenFields>>;

  onGenerate: () => void;
  onReset: () => void;
  onGoBackToStep1: () => void;
}

/** Texto de ayuda para la Conclusión */
const EXAMPLE_CONCLUSION = `Ejemplo de conclusión:
❌ Rechazado → El fallo bloquea la validación de la funcionalidad`;

/** Esperamos 7 columnas en el Excel (columna 6 = "Versión") */
const EXPECTED_HEADERS = [
  "ID Prueba",
  "Descripción",
  "Pasos",
  "Resultado Esperado",
  "Resultado Obtenido",
  "Versión",
  "Estado",
];

/** ID "PR-001" => "PR-002" */
function incrementCaseId(originalId: string): string {
  const match = originalId.match(/^(\D*)(\d+)$/);
  if (!match) {
    return originalId + " (copy)";
  }
  const prefix = match[1];
  const numberStr = match[2];
  const numLength = numberStr.length;

  let numeric = parseInt(numberStr, 10);
  numeric++;
  const newNumberPart = numeric.toString().padStart(numLength, "0");
  return prefix + newNumberPart;
}

export default function StepTwoForm({
  parsedData,
  formData,
  setFormData,
  hiddenFields,
  setHiddenFields,
  onGenerate,
  onReset,
  onGoBackToStep1,
}: StepTwoFormProps) {
  /**
   * Manejador genérico para actualizar formData
   */
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | Summary
  ) => {
    // Manejo especial para 'summary'
    if (field === "summary" && typeof value === "object") {
      const newSummary = { ...formData.summary, ...value } as Summary;
      const total = parseInt(newSummary.totalTests || "0", 10);
      const success = parseInt(newSummary.successfulTests || "0", 10);
      const failed = parseInt(newSummary.failedTests || "0", 10);

      if (success > total) {
        alert("Las Pruebas Exitosas no pueden superar el número Total de Pruebas.");
        return;
      }
      if (failed > total) {
        alert("Las Pruebas Fallidas no pueden superar el número Total de Pruebas.");
        return;
      }
      setFormData({ ...formData, summary: newSummary });
      return;
    }

    setFormData({ ...formData, [field]: value });
  };

  /**
   * 2) Ajuste de la batería de pruebas al montar
   */
  useEffect(() => {
    const newTests = [...formData.batteryTests];
    newTests.forEach((test) => {
      if (
        test.id === "PR-001" &&
        !test.obtainedResult.includes("El sistema no procesó correctamente")
      ) {
        test.obtainedResult =
          "❌ El sistema no procesó correctamente la eliminación del servicio con retirada, generando un error inesperado.";
      }
    });
    setFormData({ ...formData, batteryTests: newTests });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 3) Añadir / Eliminar / Duplicar Casos de Prueba
   */
  const addBatteryTest = () => {
    const newTest: BatteryTest = {
      id: "PR-001",
      description: "",
      steps: "Paso 1: Acceder a la acción de regulación de eliminar servicio...",
      expectedResult:
        "El servicio se elimina correctamente añadiendo su viaje de retirada correspondiente.",
      obtainedResult:
        "❌ El sistema no procesó correctamente la eliminación del servicio con retirada, generando un error inesperado.",
      testVersion: "",
      testStatus: "FALLIDO",
    };

    const newTests = [...formData.batteryTests, newTest];
    const updatedSummary = {
      ...formData.summary,
      totalTests: String(newTests.length),
    };
    setFormData({ ...formData, batteryTests: newTests, summary: updatedSummary });
  };

  const removeBatteryTest = (index: number) => {
    const newTests = [...formData.batteryTests];
    newTests.splice(index, 1);
    const updatedSummary = {
      ...formData.summary,
      totalTests: String(newTests.length),
    };
    setFormData({ ...formData, batteryTests: newTests, summary: updatedSummary });
  };

  const duplicateBatteryTest = (index: number) => {
    const original = formData.batteryTests[index];
    const cloned: BatteryTest = { ...original };
    cloned.id = incrementCaseId(original.id);

    const newTests = [...formData.batteryTests];
    newTests.splice(index + 1, 0, cloned);

    const updatedSummary = {
      ...formData.summary,
      totalTests: String(newTests.length),
    };
    setFormData({ ...formData, batteryTests: newTests, summary: updatedSummary });
  };

  const handleBatteryTestChange = (
    index: number,
    field: keyof BatteryTest,
    value: string
  ) => {
    const newTests = [...formData.batteryTests];
    newTests[index][field] = value;
    setFormData({ ...formData, batteryTests: newTests });
  };

  /**
   * 4) Incidencias
   */
  const addIncidence = () => {
    if (formData.incidences.length === 0) {
      setFormData({
        ...formData,
        incidences: [
          {
            id: "PR-001",
            description: "Descripción de la incidencia (ejemplo editable)",
            impact: "Error LEVE (ejemplo editable)",
            status: "Reabierto (ejemplo editable)",
          },
        ],
      });
    }
  };

  const removeIncidence = (index: number) => {
    const newInc = [...formData.incidences];
    newInc.splice(index, 1);
    setFormData({ ...formData, incidences: newInc });
  };

  /** Manejo hasIncidences */
  useEffect(() => {
    if (formData.hasIncidences) {
      if (formData.incidences.length === 0) {
        addIncidence();
      } else if (formData.incidences.length > 1) {
        const firstInc = formData.incidences[0];
        setFormData({ ...formData, incidences: [firstInc] });
      }
    } else {
      setFormData({ ...formData, incidences: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hasIncidences]);

  /**
   * 5) Manejo de versiones
   */
  const handleVersionChange = (
    index: number,
    field: "appName" | "appVersion",
    value: string
  ) => {
    const newVersions = [...formData.versions];
    newVersions[index][field] = value;
    setFormData({ ...formData, versions: newVersions });
  };

  const addVersion = () => {
    setFormData({
      ...formData,
      versions: [...formData.versions, { appName: "", appVersion: "" }],
    });
  };

  const removeVersion = (index: number) => {
    const newVersions = [...formData.versions];
    newVersions.splice(index, 1);
    setFormData({ ...formData, versions: newVersions });
  };

  /**
   * 6) Conclusión
   */
  const isExampleConclusion = formData.conclusion === EXAMPLE_CONCLUSION;

  /**
   * 7) Importar Excel
   */
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const sheetData = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
        header: 1,
        blankrows: false,
      });

      if (!sheetData || sheetData.length < 2) {
        alert("El Excel está vacío o no tiene filas suficientes.");
        return;
      }

      // Validar cabecera
      const headers = sheetData[0] as string[];
      if (
        headers.length !== EXPECTED_HEADERS.length ||
        !EXPECTED_HEADERS.every((col, idx) => col === headers[idx])
      ) {
        alert(
          "El formato de columnas no coincide con:\n" +
            EXPECTED_HEADERS.join(" | ")
        );
        return;
      }

      // Filas
      const rows = sheetData.slice(1);
      const importedTests: BatteryTest[] = [];

      rows.forEach((row) => {
        if (!row || row.length < 7) return;
        const [id, description, steps, expResult, obtResult, testVersion, status] =
          row;

        const newTest: BatteryTest = {
          id: id?.toString() || "",
          description: description?.toString() || "",
          steps: steps?.toString() || "",
          expectedResult: expResult?.toString() || "",
          obtainedResult: obtResult?.toString() || "",
          testVersion: testVersion?.toString() || "",
          testStatus: status?.toString() || "",
        };

        if (newTest.id.trim() !== "") {
          importedTests.push(newTest);
        }
      });

      if (importedTests.length === 0) {
        alert(
          "No se ha podido importar ningún caso. Revisa que las filas tengan contenido."
        );
        return;
      }

      const updatedTests = [...formData.batteryTests, ...importedTests];
      const updatedSummary = {
        ...formData.summary,
        totalTests: String(updatedTests.length),
      };

      setFormData({
        ...formData,
        batteryTests: updatedTests,
        summary: updatedSummary,
      });

      alert(`Se han importado ${importedTests.length} casos de prueba desde Excel.`);
    } catch (error) {
      console.error("Error importando el Excel:", error);
      alert("Ocurrió un error al leer el Excel. Ver consola para más detalles.");
    } finally {
      // limpiar input
      e.target.value = "";
    }
  };

  /**
   * 8) Ocultar completamente un campo de entorno
   */
  const hideField = (fieldKey: keyof HiddenFields) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldKey]: true,
    }));
  };

  /**
   * 9) Botón para restaurar todos los campos ocultos
   *    - Aparece solo si al menos uno en hiddenFields === true
   *    - Restaura hiddenFields a todos "false"
   */
  const anyFieldHidden = Object.values(hiddenFields).some((val) => val);
  const restoreAllHiddenFields = () => {
    setHiddenFields({
      serverPruebas: false,
      ipMaquina: false,
      navegador: false,
      baseDatos: false,
      maquetaUtilizada: false,
      ambiente: false,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto relative z-20 mb-12">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-1">
            <svg
              className="w-6 h-6 mr-2 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            Paso 2
          </h2>
          <p className="text-gray-600">Introduce los datos adicionales</p>
          <hr className="mt-3 border-gray-200" />
        </div>

        <button
          onClick={onGoBackToStep1}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 transition"
        >
          ← Volver a la introducción del JIRA
        </button>
      </div>

      {/* Datos básicos */}
      <div className="space-y-4">
        {/* Título inmutable */}
        <div>
          <label className="block font-medium text-gray-700">Título</label>
          <p className="p-2 bg-gray-100 rounded text-gray-800">{parsedData.title}</p>
        </div>

        {/* Código de JIRA */}
        <div>
          <label className="block font-medium text-gray-700">
            Código de JIRA <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: SAERAIL-1400"
            value={formData.jiraCode}
            onChange={(e) => handleInputChange("jiraCode", e.target.value)}
          />
        </div>

        {/* Fecha de Prueba */}
        <div>
          <label className="block font-medium text-gray-700">Fecha de Prueba</label>
          <input
            type="date"
            className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
          />
        </div>

        {/* Tester */}
        <div>
          <label className="block font-medium text-gray-700">Tester</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ABP"
            value={formData.tester}
            onChange={(e) => handleInputChange("tester", e.target.value)}
          />
        </div>

        {/* Estado de la Prueba */}
        <div>
          <label className="block font-medium text-gray-700">Estado de la Prueba</label>
          <select
            className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.testStatus}
            onChange={(e) => handleInputChange("testStatus", e.target.value)}
          >
            <option value="">Seleccione...</option>
            <option value="Exitosa">Exitosa</option>
            <option value="Fallida">Fallida</option>
          </select>
        </div>
      </div>

      {/* Sección APP */}
      <h3 className="text-xl font-semibold text-gray-800 mt-8">
        Entorno de Pruebas y Configuración
      </h3>
      <div className="mt-4">
        <label className="block font-medium text-gray-700 mb-1">
          ¿Validación de una APP?
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={formData.isApp || false}
            onChange={(e) => handleInputChange("isApp", e.target.checked)}
          />
          <span className="ml-2 text-gray-700">Sí (activar campos APP)</span>
        </label>
      </div>

      {formData.isApp && (
        <div className="mt-4 space-y-2 border border-gray-200 rounded p-3">
          <div>
            <label className="block font-medium text-gray-700">Endpoint</label>
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: http://localhost:3000 ó 172.25.2.99"
              value={formData.endpoint || ""}
              onChange={(e) => handleInputChange("endpoint", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">
              Sistema Operativo / Versión
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Android 13, iOS 18.4"
              value={formData.sistemaOperativo || ""}
              onChange={(e) =>
                handleInputChange("sistemaOperativo", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">
              Dispositivo de Pruebas
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Pixel 8, Galaxy A1, emulador iPhone"
              value={formData.dispositivoPruebas || ""}
              onChange={(e) =>
                handleInputChange("dispositivoPruebas", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Precondiciones</label>
            <textarea
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Usuario de pruebas dado de alta, permisos de localización..."
              value={formData.precondiciones || ""}
              onChange={(e) => handleInputChange("precondiciones", e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Idioma</label>
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: es-ES, en-UK"
              value={formData.idioma || ""}
              onChange={(e) => handleInputChange("idioma", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Versiones */}
      <div className="space-y-2 mt-6">
        <label className="block font-medium text-gray-700">Versiones</label>
        {formData.versions.map((version, idx) => (
          <div key={idx} className="flex space-x-2 items-center relative">
            <input
              type="text"
              className="border border-gray-300 rounded p-2 flex-1 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre aplicativo (ej. Rail-server)"
              value={version.appName}
              onChange={(e) => handleVersionChange(idx, "appName", e.target.value)}
            />
            <input
              type="text"
              className="border border-gray-300 rounded p-2 flex-1 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Versión (ej. 1.25.02.1)"
              value={version.appVersion}
              onChange={(e) => handleVersionChange(idx, "appVersion", e.target.value)}
            />
            <button
              onClick={() => removeVersion(idx)}
              className="text-red-600 font-bold px-2"
              title="Eliminar esta versión"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addVersion}
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-400 transition"
        >
          + Añadir versión
        </button>
      </div>

      {/* Entorno de Pruebas (campos con Aspa) */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Servidor de Pruebas */}
        {!hiddenFields.serverPruebas && (
          <div className="relative">
            <label className="block font-medium text-gray-700">Servidor de Pruebas</label>
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="MLOApps"
              value={formData.serverPruebas}
              onChange={(e) => handleInputChange("serverPruebas", e.target.value)}
            />
            <button
              type="button"
              className="absolute top-8 right-2 text-red-500 font-bold"
              title="Ocultar este campo"
              onClick={() => hideField("serverPruebas")}
            >
              ✕
            </button>
          </div>
        )}

        {/* IP Máquina */}
        {!hiddenFields.ipMaquina && (
          <div className="relative">
            <label className="block font-medium text-gray-700">IP Máquina</label>
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="172.25.2.62"
              value={formData.ipMaquina}
              onChange={(e) => handleInputChange("ipMaquina", e.target.value)}
            />
            <button
              type="button"
              className="absolute top-8 right-2 text-red-500 font-bold"
              title="Ocultar este campo"
              onClick={() => hideField("ipMaquina")}
            >
              ✕
            </button>
          </div>
        )}

        {/* Navegador */}
        {!hiddenFields.navegador && (
          <div className="relative">
            <label className="block font-medium text-gray-700">Navegador Utilizado</label>
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Chrome"
              value={formData.navegador}
              onChange={(e) => handleInputChange("navegador", e.target.value)}
            />
            <button
              type="button"
              className="absolute top-8 right-2 text-red-500 font-bold"
              title="Ocultar este campo"
              onClick={() => hideField("navegador")}
            >
              ✕
            </button>
          </div>
        )}

        {/* Base de Datos */}
        {!hiddenFields.baseDatos && (
          <div className="relative">
            <label className="block font-medium text-gray-700">Base de Datos</label>
            <select
              className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              value={formData.baseDatos}
              onChange={(e) => handleInputChange("baseDatos", e.target.value)}
              style={{ paddingRight: "4rem" }} // Asegura espacio para la ❌
            >
              <option value="">Seleccione...</option>
              <option value="SQL Server">SQL Server</option>
              <option value="Oracle">Oracle</option>
              <option value="MongoDB">MongoDB</option>
            </select>
            <button
              type="button"
              className="absolute top-[1.8rem] right-[-1rem] text-red-500 font-bold"
              title="Ocultar este campo"
              onClick={() => hideField("baseDatos")}
            >
              ✕
            </button>
          </div>
        )}

        {/* Maqueta Utilizada */}
        {!hiddenFields.maquetaUtilizada && (
          <div className="relative">
            <label className="block font-medium text-gray-700">Maqueta Utilizada</label>
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Maqueta MLO - 172.31.27.16"
              value={formData.maquetaUtilizada}
              onChange={(e) => handleInputChange("maquetaUtilizada", e.target.value)}
            />
            <button
              type="button"
              className="absolute top-8 right-2 text-red-500 font-bold"
              title="Ocultar este campo"
              onClick={() => hideField("maquetaUtilizada")}
            >
              ✕
            </button>
          </div>
        )}

        {/* Ambiente */}
        {!hiddenFields.ambiente && (
          <div className="relative">
            <label className="block font-medium text-gray-700">Ambiente</label>
            <select
              className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              value={formData.ambiente}
              onChange={(e) => handleInputChange("ambiente", e.target.value)}
              style={{ paddingRight: "4rem" }} // Asegura espacio para la ❌
            >
              <option value="">Seleccione...</option>
              <option value="Transferencia">Transferencia</option>
              <option value="PRE">PRE</option>
              <option value="PROD">PROD</option>
              <option value="Desarrollo">Desarrollo</option>
            </select>
            <button
              type="button"
              className="absolute top-[1.8rem] right-[-1rem] text-red-500 font-bold"
              title="Ocultar este campo"
              onClick={() => hideField("ambiente")}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Bloque para campos personalizados del entorno */}
      <div className="mt-4">
        {formData.customEnvFields.map((field, idx) => (
          <div key={idx} className="flex space-x-2 items-center mt-2">
            <input
              type="text"
              placeholder="Nombre del campo"
              value={field.label}
              onChange={(e) => {
                const updatedFields = [...formData.customEnvFields];
                updatedFields[idx].label = e.target.value;
                setFormData({ ...formData, customEnvFields: updatedFields });
              }}
              className="border border-gray-300 rounded p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Valor del campo"
              value={field.value}
              onChange={(e) => {
                const updatedFields = [...formData.customEnvFields];
                updatedFields[idx].value = e.target.value;
                setFormData({ ...formData, customEnvFields: updatedFields });
              }}
              className="border border-gray-300 rounded p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                const updatedFields = formData.customEnvFields.filter((_, i) => i !== idx);
                setFormData({ ...formData, customEnvFields: updatedFields });
              }}
              className="text-red-600 font-bold"
              title="Eliminar este campo"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const updatedFields = [...formData.customEnvFields, { label: "", value: "" }];
            setFormData({ ...formData, customEnvFields: updatedFields });
          }}
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-400 transition"
        >
          + Añadir campo personalizado
        </button>
      </div>

      {/* Botón para recuperar TODOS los campos ocultos */}
      {anyFieldHidden && (
        <div className="mt-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
            onClick={restoreAllHiddenFields}
          >
            🔁 Restaurar campos ocultos
          </button>
        </div>
      )}

      {/* Batería de Pruebas */}
      <div className="space-y-2 mt-6">
        <h3 className="font-semibold text-gray-800">Batería de Pruebas</h3>
        <p className="text-sm text-gray-500">
          (En esta sección se definen los casos de prueba realizados y sus resultados.)
        </p>

        {formData.batteryTests.map((test, idx) => {
          const isExample = test.id === "PR-001";
          return (
            <div
              key={idx}
              className="relative border border-gray-300 rounded p-2 space-y-2"
            >
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => removeBatteryTest(idx)}
                  className="text-red-600 font-bold"
                  title="Eliminar este caso de prueba"
                >
                  X
                </button>
                <button
                  onClick={() => duplicateBatteryTest(idx)}
                  className="text-blue-600 font-bold"
                  title="Duplicar este caso de prueba"
                >
                  ↻
                </button>
              </div>

              <div>
                <label className="block font-medium text-gray-700">ID Prueba</label>
                <input
                  type="text"
                  className={`border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: PR-001"
                  value={test.id}
                  onChange={(e) => handleBatteryTestChange(idx, "id", e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Descripción</label>
                <textarea
                  className={`w-full border border-gray-300 rounded p-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: Muestra distancias en el mapa..."
                  value={test.description}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "description", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Pasos</label>
                <textarea
                  className={`w-full border border-gray-300 rounded p-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: 1. Acceder a la acción de regulación..."
                  value={test.steps}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "steps", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">
                  Resultado Esperado
                </label>
                <textarea
                  className={`w-full border border-gray-300 rounded p-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: El servicio se elimina correctamente..."
                  value={test.expectedResult}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "expectedResult", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">
                  Resultado Obtenido
                </label>
                <textarea
                  className={`w-full border border-gray-300 rounded p-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: ❌ El sistema no procesó correctamente..."
                  value={test.obtainedResult}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "obtainedResult", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Versión</label>
                <input
                  type="text"
                  className={`border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: v1.0.1"
                  value={test.testVersion}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "testVersion", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Estado</label>
                <input
                  type="text"
                  className={`border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: FALLIDO"
                  value={test.testStatus}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "testStatus", e.target.value)
                  }
                />
              </div>
            </div>
          );
        })}

        {/* Botones para Añadir / Importar Excel / Plantilla */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={addBatteryTest}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-400 transition"
          >
            + Añadir caso de prueba
          </button>

          <div className="relative inline-block">
            <button
              onClick={handleImportClick}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-400 transition"
            >
              Importar Fichero Excel
            </button>
            <Tippy
              content={
                <div style={{ whiteSpace: "pre-line" }}>
                  {`Para evitar errores, descarga la plantilla disponible en "Plantilla Excel →" y respeta el orden exacto de columnas:
                  
columna 1: ID Prueba
columna 2: Descripción
columna 3: Pasos
columna 4: Resultado Esperado
columna 5: Resultado Obtenido
columna 6: Versión
columna 7: Estado`}
                </div>
              }
              placement="right"
            >
              <span className="inline-block ml-1 text-gray-500 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                  />
                </svg>
              </span>
            </Tippy>
          </div>

          <a
            href="/plantillas/plantilla_bateria_pruebas.xlsx"
            download
            className="text-sm text-gray-500 underline hover:text-gray-700 transition"
          >
            Plantilla Excel →
          </a>
        </div>

        <input
          type="file"
          accept=".xls,.xlsx"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Datos de Prueba */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800">Datos de Prueba</h3>
        <p className="text-sm text-gray-500">
          (Registra aquí los datos de entrada o parámetros usados para reproducir las pruebas.)
        </p>
        <textarea
          className="w-full border border-gray-300 rounded p-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Ej: Parámetros, credenciales de prueba, datos específicos, etc."
          value={formData.datosDePrueba}
          onChange={(e) => handleInputChange("datosDePrueba", e.target.value)}
        />
      </div>

      {/* Resumen de Resultados */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800">Resumen de Resultados</h3>
        <p className="text-sm text-gray-500">
          (Número total de pruebas, las exitosas y las fallidas, y observaciones.)
        </p>
        <div>
          <label className="block font-medium text-gray-700">Total de Pruebas</label>
          <input
            type="number"
            min="0"
            step="1"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.summary.totalTests}
            onChange={(e) =>
              handleInputChange("summary", {
                ...formData.summary,
                totalTests: e.target.value,
              } as Summary)
            }
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Pruebas Exitosas</label>
          <input
            type="number"
            min="0"
            step="1"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.summary.successfulTests}
            onChange={(e) =>
              handleInputChange("summary", {
                ...formData.summary,
                successfulTests: e.target.value,
              } as Summary)
            }
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Pruebas Fallidas</label>
          <input
            type="number"
            min="0"
            step="1"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.summary.failedTests}
            onChange={(e) =>
              handleInputChange("summary", {
                ...formData.summary,
                failedTests: e.target.value,
              } as Summary)
            }
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Observaciones</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.summary.observations}
            onChange={(e) =>
              handleInputChange("summary", {
                ...formData.summary,
                observations: e.target.value,
              } as Summary)
            }
          />
        </div>
      </div>

      {/* Incidencias */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800">Incidencias Detectadas</h3>
        <p className="text-sm text-gray-500">
          (En esta sección se registran las incidencias encontradas durante la ejecución.)
        </p>
        <div>
          <label className="block font-medium text-gray-700">
            ¿Se detectaron incidencias?
          </label>
          <select
            className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.hasIncidences ? "Sí" : "No"}
            onChange={(e) =>
              handleInputChange("hasIncidences", e.target.value === "Sí")
            }
          >
            <option value="No">No</option>
            <option value="Sí">Sí</option>
          </select>
        </div>

        {formData.hasIncidences &&
          formData.incidences.map((inc, idx) => {
            const isExample = inc.id === "PR-001";
            return (
              <div
                key={idx}
                className="relative border border-gray-300 rounded p-2 space-y-2"
              >
                <button
                  onClick={() => removeIncidence(idx)}
                  className="absolute top-2 right-2 text-red-600 font-bold"
                  title="Eliminar esta incidencia"
                >
                  X
                </button>
                <div>
                  <label className="block font-medium text-gray-700">ID Prueba</label>
                  <input
                    type="text"
                    className={`border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isExample ? "text-gray-400 italic" : ""
                    }`}
                    placeholder="Ejemplo: PR-001"
                    value={inc.id}
                    onChange={(e) => {
                      const newInc = [...formData.incidences];
                      newInc[idx].id = e.target.value;
                      setFormData({ ...formData, incidences: newInc });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">
                    Descripción de la Incidencia
                  </label>
                  <textarea
                    className={`w-full border border-gray-300 rounded p-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isExample ? "text-gray-400 italic" : ""
                    }`}
                    placeholder="Ejemplo: Descripción de la incidencia"
                    value={inc.description}
                    onChange={(e) => {
                      const newInc = [...formData.incidences];
                      newInc[idx].description = e.target.value;
                      setFormData({ ...formData, incidences: newInc });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Impacto</label>
                  <input
                    type="text"
                    className={`border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isExample ? "text-gray-400 italic" : ""
                    }`}
                    placeholder="Ejemplo: Error LEVE"
                    value={inc.impact}
                    onChange={(e) => {
                      const newInc = [...formData.incidences];
                      newInc[idx].impact = e.target.value;
                      setFormData({ ...formData, incidences: newInc });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Estado</label>
                  <input
                    type="text"
                    className={`border border-gray-300 rounded p-2 w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isExample ? "text-gray-400 italic" : ""
                    }`}
                    placeholder="Ejemplo: Reabierto"
                    value={inc.status}
                    onChange={(e) => {
                      const newInc = [...formData.incidences];
                      newInc[idx].status = e.target.value;
                      setFormData({ ...formData, incidences: newInc });
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {/* Conclusiones */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800">Conclusiones</h3>
        <textarea
          className={`w-full border border-gray-300 rounded p-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isExampleConclusion ? "text-gray-400 italic" : ""
          }`}
          placeholder={EXAMPLE_CONCLUSION}
          value={formData.conclusion}
          onChange={(e) => handleInputChange("conclusion", e.target.value)}
        />
      </div>

      {/* Botones finales */}
      <div className="flex flex-wrap gap-3 justify-end mt-6">
        <button
          onClick={onGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
        >
          Generar Reporte
        </button>
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