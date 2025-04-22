"use client";

import React, { useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import Tippy from "@tippyjs/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "tippy.js/dist/tippy.css";

import { ParsedData } from "@/utils/parseJiraContent";

/** Batería de Pruebas */
export interface BatteryTest {
  id: string;
  description: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testVersion: string;
  testStatus: string;
  images?: string[]; // base64
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

/** Campos ocultables */
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

  // ★ Campos personalizados del entorno
  customEnvFields: Array<{ label: string; value: string }>;
}

interface StepTwoFormProps {
  parsedData: ParsedData;
  formData: FormData;
  setFormData: (val: FormData) => void;

  hiddenFields: HiddenFields;
  setHiddenFields: React.Dispatch<React.SetStateAction<HiddenFields>>;

  onGenerate: () => void;
  onReset: () => void;
  onGoBackToStep1: () => void;
}

/** Ayuda para la conclusión */
const EXAMPLE_CONCLUSION = `Ejemplo de conclusión:
❌ Rechazado → El fallo bloquea la validación de la funcionalidad`;

/** Cabeceras esperadas Excel */
const EXPECTED_HEADERS = [
  "ID Prueba",
  "Descripción",
  "Pasos",
  "Resultado Esperado",
  "Resultado Obtenido",
  "Versión",
  "Estado",
];

/** Incrementa ID tipo PR-001 → PR-002 */
function incrementCaseId(originalId: string): string {
  const match = originalId.match(/^(\D*)(\d+)$/);
  if (!match) return originalId + " (copy)";
  const [_, prefix, num] = match;
  const next = String(parseInt(num, 10) + 1).padStart(num.length, "0");
  return prefix + next;
}

// Lee File a base64
const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

// Genera ZIP de evidencias de un array de tests
async function downloadImagesZip(tests: BatteryTest[]) {
  const zip = new JSZip();
  tests.forEach((t) => {
    if (!t.images?.length) return;
    const folder = zip.folder(t.id)!;
    t.images.forEach((b64, i) => {
      const mime = b64.match(/^data:(image\/\w+)/)?.[1] || "image/png";
      const ext = mime.split("/")[1];
      folder.file(`evidencia-${i + 1}.${ext}`, b64.split(",")[1], {
        base64: true,
      });
    });
  });
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "evidencias.zip");
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
  // Actualiza formData
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | Summary
  ) => {
    if (field === "summary" && typeof value === "object") {
      const newSummary = { ...formData.summary, ...value } as Summary;
      const total = +newSummary.totalTests,
        suc = +newSummary.successfulTests,
        fail = +newSummary.failedTests;
      if (suc > total || fail > total) {
        alert("Exitosas/Fallidas no pueden superar Total");
        return;
      }
      setFormData({ ...formData, summary: newSummary });
      return;
    }
    setFormData({ ...formData, [field]: value });
  };

  // Demo on mount
  useEffect(() => {
    const updated = formData.batteryTests.map((t) =>
      t.id === "PR-001" &&
        !t.obtainedResult.includes("El sistema no procesó correctamente")
        ? {
          ...t,
          obtainedResult:
            "❌ El sistema no procesó correctamente la eliminación del servicio con retirada, generando un error inesperado.",
        }
        : t
    );
    setFormData({ ...formData, batteryTests: updated });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CRUD batería
  const addBatteryTest = () => {
    const nt: BatteryTest = {
      id: "PR-001",
      description: "",
      steps: "Paso 1: Acceder a la acción de regulación de eliminar servicio...",
      expectedResult: "El servicio se elimina correctamente añadiendo su viaje de retirada correspondiente.",
      obtainedResult: "❌ El sistema no procesó correctamente la eliminación del servicio con retirada, generando un error inesperado.",
      testVersion: "",
      testStatus: "Fallido",
      images: [],
    };
    const arr = [...formData.batteryTests, nt];
    setFormData({
      ...formData,
      batteryTests: arr,
      summary: { ...formData.summary, totalTests: String(arr.length) },
    });
  };
  const removeBatteryTest = (i: number) => {
    const arr = [...formData.batteryTests];
    arr.splice(i, 1);
    setFormData({
      ...formData,
      batteryTests: arr,
      summary: { ...formData.summary, totalTests: String(arr.length) },
    });
  };
  const duplicateBatteryTest = (i: number) => {
    const orig = formData.batteryTests[i];
    const clone = { ...orig, id: incrementCaseId(orig.id) };
    const arr = [...formData.batteryTests];
    arr.splice(i + 1, 0, clone);
    setFormData({
      ...formData,
      batteryTests: arr,
      summary: { ...formData.summary, totalTests: String(arr.length) },
    });
  };
  const handleBatteryTestChange = (
    idx: number,
    field: keyof BatteryTest,
    val: string
  ) => {
    const arr = [...formData.batteryTests];
    // @ts-ignore
    arr[idx][field] = val;
    setFormData({ ...formData, batteryTests: arr });
  };

  // Incidencias
  const addIncidence = () => {
    if (!formData.incidences.length) {
      setFormData({
        ...formData,
        incidences: [
          {
            id: "PR-001",
            description: "Descripción de la incidencia …",
            impact: "Error LEVE",
            status: "Reabierto",
          },
        ],
      });
    }
  };
  const removeIncidence = (i: number) => {
    const arr = [...formData.incidences];
    arr.splice(i, 1);
    setFormData({ ...formData, incidences: arr });
  };
  useEffect(() => {
    if (formData.hasIncidences) {
      if (!formData.incidences.length) addIncidence();
      else if (formData.incidences.length > 1) {
        setFormData({
          ...formData,
          incidences: [formData.incidences[0]],
        });
      }
    } else {
      setFormData({ ...formData, incidences: [] });
    }
  }, [formData.hasIncidences]);

  // Versiones
  const handleVersionChange = (
    i: number,
    field: "appName" | "appVersion",
    v: string
  ) => {
    const arr = [...formData.versions];
    arr[i][field] = v;
    setFormData({ ...formData, versions: arr });
  };
  const addVersion = () =>
    setFormData({
      ...formData,
      versions: [...formData.versions, { appName: "", appVersion: "" }],
    });
  const removeVersion = (i: number) => {
    const arr = [...formData.versions];
    arr.splice(i, 1);
    setFormData({ ...formData, versions: arr });
  };

  // Conclusión
  const isExampleConclusion =
    formData.conclusion === EXAMPLE_CONCLUSION;

  // Importar Excel
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const sh = wb.Sheets[wb.SheetNames[0]];
      const sd: any[] = XLSX.utils.sheet_to_json(sh, {
        header: 1,
        blankrows: false,
      });
      if (sd.length < 2) {
        alert("Excel vacío o pocas filas");
        return;
      }
      const hdr = sd[0] as string[];
      if (
        hdr.length !== EXPECTED_HEADERS.length ||
        !EXPECTED_HEADERS.every((c, i) => c === hdr[i])
      ) {
        alert(
          "Formato columnas debe ser:\n" +
          EXPECTED_HEADERS.join(" | ")
        );
        return;
      }
      const imp: BatteryTest[] = [];
      sd.slice(1).forEach((row: any[]) => {
        if (row.length < 7) return;
        const [id, d, steps, er, or, ver, st] = row;
        const nt: BatteryTest = {
          id: String(id || ""),
          description: String(d || ""),
          steps: String(steps || ""),
          expectedResult: String(er || ""),
          obtainedResult: String(or || ""),
          testVersion: String(ver || ""),
          testStatus: String(st || ""),
          images: [],
        };
        if (nt.id.trim()) imp.push(nt);
      });
      if (!imp.length) {
        alert("No se importaron casos");
        return;
      }
      const arr = [...formData.batteryTests, ...imp];
      setFormData({
        ...formData,
        batteryTests: arr,
        summary: { ...formData.summary, totalTests: String(arr.length) },
      });
      alert(`Importados ${imp.length} casos`);
    } catch {
      alert("Error al leer Excel");
    } finally {
      e.target.value = "";
    }
  };

  // Ocultar campos entorno
  const hideField = (k: keyof HiddenFields) =>
    setHiddenFields((p) => ({ ...p, [k]: true }));
  const anyHidden = Object.values(hiddenFields).some(Boolean);
  const restoreAll = () =>
    setHiddenFields({
      serverPruebas: false,
      ipMaquina: false,
      navegador: false,
      baseDatos: false,
      maquetaUtilizada: false,
      ambiente: false,
    });

  return (
    <div className="space-y-6 max-w-3xl mx-auto mb-12">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center text-2xl font-bold mb-1">
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
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
        >
          ← Volver a la introducción del JIRA
        </button>
      </div>

      {/* Datos básicos */}
      <div className="space-y-4">
        {/* Título */}
        <div>
          <label className="block font-medium text-gray-700">Título</label>
          <p className="p-2 bg-gray-100 rounded text-gray-800">
            {parsedData.title}
          </p>
        </div>
        {/* Código de JIRA */}
        <div>
          <label className="block font-medium text-gray-700">
            Código de JIRA <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: SAERAIL-1400"
            value={formData.jiraCode}
            onChange={(e) =>
              handleInputChange("jiraCode", e.target.value)
            }
          />
        </div>
        {/* Fecha */}
        <div>
          <label className="block font-medium text-gray-700">
            Fecha de Prueba
          </label>
          <input
            type="date"
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
          />
        </div>
        {/* Tester */}
        <div>
          <label className="block font-medium text-gray-700">
            Tester
          </label>
          <input
            type="text"
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ABP"
            value={formData.tester}
            onChange={(e) => handleInputChange("tester", e.target.value)}
          />
        </div>
        {/* Estado */}
        <div>
          <label className="block font-medium text-gray-700">
            Estado de la Prueba
          </label>
          <select
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.testStatus}
            onChange={(e) => handleInputChange("testStatus", e.target.value)}
          >
            <option value="">Seleccione…</option>
            <option value="Exitosa">Exitosa</option>
            <option value="Fallida">Fallida</option>
          </select>
        </div>
      </div>

      {/* APP */}
      <h3 className="text-xl font-semibold mt-8">
        Entorno de Pruebas y Configuración
      </h3>
      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={formData.isApp || false}
            onChange={(e) =>
              handleInputChange("isApp", e.target.checked)
            }
          />
          <span className="ml-2">Validación de una APP</span>
        </label>
      </div>
      {formData.isApp && (
        <div className="mt-4 border p-3 rounded space-y-2">
          <div>
            <label className="block font-medium">Endpoint</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              placeholder="Ej: http://localhost:3000"
              value={formData.endpoint || ""}
              onChange={(e) =>
                handleInputChange("endpoint", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block font-medium">
              Sistema Operativo / Versión
            </label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              placeholder="Ej: Android 13"
              value={formData.sistemaOperativo || ""}
              onChange={(e) =>
                handleInputChange("sistemaOperativo", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block font-medium">
              Dispositivo de Pruebas
            </label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              placeholder="Ej: Pixel 8"
              value={formData.dispositivoPruebas || ""}
              onChange={(e) =>
                handleInputChange("dispositivoPruebas", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block font-medium">Precondiciones</label>
            <textarea
              className="w-full border p-2 rounded"
              placeholder="Ej: Usuario de pruebas dado de alta"
              value={formData.precondiciones || ""}
              onChange={(e) =>
                handleInputChange("precondiciones", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block font-medium">Idioma</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              placeholder="Ej: es-ES"
              value={formData.idioma || ""}
              onChange={(e) =>
                handleInputChange("idioma", e.target.value)
              }
            />
          </div>
        </div>
      )}

      {/* Versiones */}
      <div className="mt-6 space-y-2">
        <label className="block font-medium">Versiones</label>
        {formData.versions.map((v, i) => (
          <div key={i} className="flex items-center space-x-2">
            <input
              type="text"
              className="border p-2 rounded flex-1"
              placeholder="Nombre aplicativo"
              value={v.appName}
              onChange={(e) =>
                handleVersionChange(i, "appName", e.target.value)
              }
            />
            <input
              type="text"
              className="border p-2 rounded flex-1"
              placeholder="Versión"
              value={v.appVersion}
              onChange={(e) =>
                handleVersionChange(i, "appVersion", e.target.value)
              }
            />
            <button
              onClick={() => removeVersion(i)}
              className="text-red-600 font-bold px-2"
              title="Eliminar esta versión"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addVersion}
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
        >
          + Añadir versión
        </button>
      </div>

      {/* Campos entorno ocultables */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {!hiddenFields.serverPruebas && (
          <div className="relative">
            <label className="block font-medium">Servidor de Pruebas</label>
            <input
              type="text"
              className="border p-2 rounded w-full pr-10"
              placeholder="MLOApps"
              value={formData.serverPruebas}
              onChange={(e) =>
                handleInputChange("serverPruebas", e.target.value)
              }
            />
            <button
              onClick={() => hideField("serverPruebas")}
              className="absolute top-8 right-2 text-red-500 font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {!hiddenFields.ipMaquina && (
          <div className="relative">
            <label className="block font-medium">IP Máquina</label>
            <input
              type="text"
              className="border p-2 rounded w-full pr-10"
              placeholder="172.25.2.62"
              value={formData.ipMaquina}
              onChange={(e) =>
                handleInputChange("ipMaquina", e.target.value)
              }
            />
            <button
              onClick={() => hideField("ipMaquina")}
              className="absolute top-8 right-2 text-red-500 font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {!hiddenFields.navegador && (
          <div className="relative">
            <label className="block font-medium">Navegador Utilizado</label>
            <input
              type="text"
              className="border p-2 rounded w-full pr-10"
              placeholder="Chrome"
              value={formData.navegador}
              onChange={(e) =>
                handleInputChange("navegador", e.target.value)
              }
            />
            <button
              onClick={() => hideField("navegador")}
              className="absolute top-8 right-2 text-red-500 font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {!hiddenFields.baseDatos && (
          <div className="relative">
            <label className="block font-medium">Base de Datos</label>
            <select
              className="border p-2 rounded w-full pr-10"
              value={formData.baseDatos}
              onChange={(e) =>
                handleInputChange("baseDatos", e.target.value)
              }
            >
              <option value="">Seleccione…</option>
              <option value="SQL Server">SQL Server</option>
              <option value="Oracle">Oracle</option>
              <option value="MongoDB">MongoDB</option>
            </select>
            <button
              onClick={() => hideField("baseDatos")}
              className="absolute top-[1.8rem] right-[-1rem] text-red-500 font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {!hiddenFields.maquetaUtilizada && (
          <div className="relative">
            <label className="block font-medium">Maqueta Utilizada</label>
            <input
              type="text"
              className="border p-2 rounded w-full pr-10"
              placeholder="Maqueta MLO – 172.31.27.16"
              value={formData.maquetaUtilizada}
              onChange={(e) =>
                handleInputChange("maquetaUtilizada", e.target.value)
              }
            />
            <button
              onClick={() => hideField("maquetaUtilizada")}
              className="absolute top-8 right-2 text-red-500 font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {!hiddenFields.ambiente && (
          <div className="relative">
            <label className="block font-medium">Ambiente</label>
            <select
              className="border p-2 rounded w-full pr-10"
              value={formData.ambiente}
              onChange={(e) =>
                handleInputChange("ambiente", e.target.value)
              }
            >
              <option value="">Seleccione…</option>
              <option value="Transferencia">Transferencia</option>
              <option value="PRE">PRE</option>
              <option value="PROD">PROD</option>
              <option value="Desarrollo">Desarrollo</option>
            </select>
            <button
              onClick={() => hideField("ambiente")}
              className="absolute top-[1.8rem] right-[-1rem] text-red-500 font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Campos personalizados */}
      <div className="mt-4">
        {formData.customEnvFields.map((f, i) => (
          <div key={i} className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              placeholder="Nombre del campo"
              className="border p-2 rounded w-1/3"
              value={f.label}
              onChange={(e) => {
                const arr = [...formData.customEnvFields];
                arr[i].label = e.target.value;
                setFormData({ ...formData, customEnvFields: arr });
              }}
            />
            <input
              type="text"
              placeholder="Valor del campo"
              className="border p-2 rounded w-1/3"
              value={f.value}
              onChange={(e) => {
                const arr = [...formData.customEnvFields];
                arr[i].value = e.target.value;
                setFormData({ ...formData, customEnvFields: arr });
              }}
            />
            <button
              onClick={() => {
                const arr = formData.customEnvFields.filter(
                  (_, idx) => idx !== i
                );
                setFormData({ ...formData, customEnvFields: arr });
              }}
              className="text-red-600 font-bold"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            setFormData({
              ...formData,
              customEnvFields: [
                ...formData.customEnvFields,
                { label: "", value: "" },
              ],
            })
          }
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
        >
          + Añadir campo personalizado
        </button>
      </div>

      {anyHidden && (
        <div className="mt-2">
          <button
            onClick={restoreAll}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            🔁 Restaurar campos ocultos
          </button>
        </div>
      )}

      {/* Batería de Pruebas */}
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold text-gray-800">Batería de Pruebas</h3>
        <p className="text-sm text-gray-500">
          (En esta sección se definen los casos de prueba realizados y sus resultados.)
        </p>

        {formData.batteryTests.map((test, idx) => {
          const isExample = test.id === "PR-001";
          return (
            <div
              key={idx}
              className="relative border rounded p-2 space-y-2"
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

              {/* ID */}
              <div>
                <label className="block font-medium text-gray-700">
                  ID Prueba
                </label>
                <input
                  type="text"
                  className={`border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 ${isExample ? "italic text-gray-400" : ""
                    }`}
                  placeholder="Ejemplo: PR-001"
                  value={test.id}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "id", e.target.value)
                  }
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 ${isExample ? "italic text-gray-400" : ""
                    }`}
                  placeholder="Ejemplo: Muestra distancias en el mapa..."
                  value={test.description}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "description", e.target.value)
                  }
                />
              </div>

              {/* Pasos */}
              <div>
                <label className="block font-medium text-gray-700">
                  Pasos
                </label>
                <textarea
                  className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 ${isExample ? "italic text-gray-400" : ""
                    }`}
                  placeholder="Ejemplo: 1. Acceder a la acción de regulación de eliminar servicio..."
                  value={test.steps}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "steps", e.target.value)
                  }
                />
              </div>

              {/* Resultado Esperado */}
              <div>
                <label className="block font-medium text-gray-700">
                  Resultado Esperado
                </label>
                <textarea
                  className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 ${isExample ? "italic text-gray-400" : ""
                    }`}
                  placeholder="Ejemplo: El servicio se elimina correctamente añadiendo su viaje de retirada correspondiente."
                  value={test.expectedResult}
                  onChange={(e) =>
                    handleBatteryTestChange(
                      idx,
                      "expectedResult",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* Resultado Obtenido */}
              <div>
                <label className="block font-medium text-gray-700">
                  Resultado Obtenido
                </label>
                <textarea
                  className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 ${isExample ? "italic text-gray-400" : ""
                    }`}
                  placeholder="❌ El sistema no procesó correctamente la eliminación del servicio con retirada, generando un error inesperado."
                  value={test.obtainedResult}
                  onChange={(e) =>
                    handleBatteryTestChange(
                      idx,
                      "obtainedResult",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* Versión */}
              <div>
                <label className="block font-medium text-gray-700">
                  Versión
                </label>
                <input
                  type="text"
                  className={`border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 ${isExample ? "italic text-gray-400" : ""
                    }`}
                  placeholder="Ejemplo: v1.0.1"
                  value={test.testVersion}
                  onChange={(e) =>
                    handleBatteryTestChange(
                      idx,
                      "testVersion",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block font-medium text-gray-700">
                  Estado
                </label>
                <input
                  type="text"
                  className={`border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 ${isExample ? "italic text-gray-400" : ""
                    }`}
                  placeholder="Ejemplo: Fallido"
                  value={test.testStatus}
                  onChange={(e) =>
                    handleBatteryTestChange(
                      idx,
                      "testStatus",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* Evidencias */}
              <div>
                <label className="block font-medium text-gray-700">
                  Evidencias (imágenes)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mb-2"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    const b64s = await Promise.all(
                      files.map(readFileAsBase64)
                    );
                    const arr = [
                      ...(formData.batteryTests[idx].images || []),
                      ...b64s,
                    ];
                    const newTests = [...formData.batteryTests];
                    newTests[idx].images = arr;
                    setFormData({
                      ...formData,
                      batteryTests: newTests,
                    });
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {test.images?.map((src, i) => (
                    <div
                      key={i}
                      className="relative w-24 h-24 rounded overflow-hidden"
                    >
                      <img
                        src={src}
                        alt={`${test.id}-${i}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          const newTests = [...formData.batteryTests];
                          newTests[idx].images!.splice(i, 1);
                          setFormData({
                            ...formData,
                            batteryTests: newTests,
                          });
                        }}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* BOTÓN DESCARGAR ZIP (ahora dentro del bloque) */}
                {test.images?.length ? (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => downloadImagesZip([test])}
                      className="flex items-center text-purple-600 hover:text-purple-800 text-sm"
                      title="Descargar imagenes adjuntadas en ZIP"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M5 20h14v-2H5v2zM12 2l-5.5 6h4v6h3V8h4L12 2z" />
                      </svg>
                      Descargar ZIP
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {/* Botones añadir/importar/plantilla */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={addBatteryTest}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            + Añadir caso de prueba
          </button>
          <div className="relative">
            <button
              onClick={handleImportClick}
              className="px-3 py-1 bg-yellow-500 text-white rounded"
            >
              Importar Excel
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
          className="hidden"
        />
      </div>

      {/* Datos de Prueba */}
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold text-gray-800">Datos de Prueba</h3>
        <p className="text-gray-500 text-sm">
          (Registra aquí los datos de entrada o parámetros usados para reproducir las pruebas.)
        </p>
        <textarea
          rows={4}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Parámetros, credenciales de prueba, datos específicos, etc."
          value={formData.datosDePrueba}
          onChange={(e) =>
            handleInputChange("datosDePrueba", e.target.value)
          }
        />
      </div>

      {/* Resumen de Resultados */}
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold text-gray-800">
          Resumen de Resultados
        </h3>
        <p className="text-gray-500 text-sm">
          (Número total de pruebas, las exitosas y las fallidas, y observaciones.)
        </p>
        <div>
          <label className="block font-medium">Total de Pruebas</label>
          <input
            type="number"
            min={0}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
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
          <label className="block font-medium">Pruebas Exitosas</label>
          <input
            type="number"
            min={0}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
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
          <label className="block font-medium">Pruebas Fallidas</label>
          <input
            type="number"
            min={0}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
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
          <label className="block font-medium">Observaciones</label>
          <textarea
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
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
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold text-gray-800">
          Incidencias Detectadas
        </h3>
        <p className="text-gray-500 text-sm">
          (En esta sección se registran las incidencias encontradas durante la ejecución.)
        </p>
        <div>
          <label className="block font-medium">
            ¿Se detectaron incidencias?
          </label>
          <select
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
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
          formData.incidences.map((inc, i) => {
            const isEx = inc.id === "PR-001";
            return (
              <div key={i} className="relative border rounded p-2">
                <button
                  onClick={() => removeIncidence(i)}
                  className="absolute top-2 right-2 text-red-600 font-bold"
                >
                  X
                </button>
                <div>
                  <label className="block font-medium">
                    ID Prueba
                  </label>
                  <input
                    type="text"
                    className={`border p-2 rounded w-full ${isEx ? "italic text-gray-400" : ""
                      } focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ejemplo: PR-001"
                    value={inc.id}
                    onChange={(e) => {
                      const arr = [...formData.incidences];
                      arr[i].id = e.target.value;
                      setFormData({ ...formData, incidences: arr });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium">
                    Descripción
                  </label>
                  <textarea
                    className={`w-full border p-2 rounded ${isEx ? "italic text-gray-400" : ""
                      } focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ejemplo: Descripción de la incidencia"
                    value={inc.description}
                    onChange={(e) => {
                      const arr = [...formData.incidences];
                      arr[i].description = e.target.value;
                      setFormData({ ...formData, incidences: arr });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium">
                    Impacto
                  </label>
                  <input
                    type="text"
                    className={`border p-2 rounded w-full ${isEx ? "italic text-gray-400" : ""
                      } focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ejemplo: Error LEVE"
                    value={inc.impact}
                    onChange={(e) => {
                      const arr = [...formData.incidences];
                      arr[i].impact = e.target.value;
                      setFormData({ ...formData, incidences: arr });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium">
                    Estado
                  </label>
                  <input
                    type="text"
                    className={`border p-2 rounded w-full ${isEx ? "italic text-gray-400" : ""
                      } focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ejemplo: Reabierto"
                    value={inc.status}
                    onChange={(e) => {
                      const arr = [...formData.incidences];
                      arr[i].status = e.target.value;
                      setFormData({ ...formData, incidences: arr });
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {/* Conclusiones */}
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold text-gray-800">Conclusiones</h3>
        <textarea
          className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 ${isExampleConclusion ? "italic text-gray-400" : ""
            }`}
          placeholder={EXAMPLE_CONCLUSION}
          value={formData.conclusion}
          onChange={(e) =>
            handleInputChange("conclusion", e.target.value)
          }
        />
      </div>

      {/* Botones finales */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Generar Reporte
        </button>
        <button
          onClick={onReset}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-300"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}