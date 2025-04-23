"use client";

import React, { useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import Tippy from "@tippyjs/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "tippy.js/dist/tippy.css";

import { ParsedData } from "@/utils/parseJiraContent"; // Ajusta la ruta si es necesario

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
  // === NUEVO: Campo para Logs ===
  logsRelevantes?: string;
  // ============================
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

  onGenerate: () => void; // Esta función ahora se llamará desde ReportOutput
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
    // Usar ID limpio para nombre de carpeta
    const folder = zip.folder(t.id.trim())!;
    t.images.forEach((b64, i) => {
      const mimeMatch = b64.match(/^data:(image\/\w+)/);
      const mime = mimeMatch ? mimeMatch[1] : "image/png";
      const ext = mime.split("/")[1] || "png"; // Default a png si no se detecta
      // Extraer solo la parte base64
      const base64Data = b64.split(",")[1];
      if (base64Data) { // Asegurarse que hay datos
        folder.file(`evidencia-${i + 1}.${ext}`, base64Data, {
          base64: true,
        });
      }
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
  onGenerate, // onGenerate se pasará al siguiente paso (ReportOutput)
  onReset,
  onGoBackToStep1,
}: StepTwoFormProps) {
  // Actualiza formData
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | Summary
  ) => {
    // Manejo especial para el objeto summary (como antes)
    if (field === "summary" && typeof value === "object") {
      const newSummary = { ...formData.summary, ...value } as Summary;
      const total = +newSummary.totalTests || 0; // Usar 0 si no es número
      const suc = +newSummary.successfulTests || 0;
      const fail = +newSummary.failedTests || 0;

      if (suc > total || fail > total || (suc + fail) > total) {
        // Añadida validación extra suc + fail <= total
        alert("La suma de pruebas Exitosas y Fallidas no puede superar el Total.");
        // Opcionalmente, no actualizar si es inválido, o resetear campos
        // Aquí simplemente no actualizamos si la suma excede
        if ((suc + fail) > total) return;
      }
      setFormData({ ...formData, summary: newSummary });
      return;
    }
    // Manejo para otros campos
    setFormData({ ...formData, [field]: value });
  };


  // Demo on mount (sin cambios)
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
    // Solo actualiza si realmente hubo cambios para evitar bucles innecesarios
    if (JSON.stringify(updated) !== JSON.stringify(formData.batteryTests)) {
      setFormData({ ...formData, batteryTests: updated });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencia vacía intencional para que corra solo al montar

  // --- CRUD Batería (con actualización correcta de estado) ---
  const addBatteryTest = () => {
    const nt: BatteryTest = {
      id: `PR-${String(formData.batteryTests.length + 1).padStart(3, '0')}`, // ID incremental básico
      description: "",
      steps: "Paso 1: ...",
      expectedResult: "Resultado esperado...",
      obtainedResult: "",
      testVersion: "",
      testStatus: "Pendiente", // Estado inicial
      images: [],
    };
    // Crear nuevo array inmutable
    const updatedTests = [...formData.batteryTests, nt];
    setFormData({
      ...formData,
      batteryTests: updatedTests,
      // Actualizar resumen basado en el nuevo array
      summary: { ...formData.summary, totalTests: String(updatedTests.length) },
    });
  };

  const removeBatteryTest = (i: number) => {
    // Crear nuevo array filtrando el elemento
    const updatedTests = formData.batteryTests.filter((_, index) => index !== i);
    setFormData({
      ...formData,
      batteryTests: updatedTests,
      summary: { ...formData.summary, totalTests: String(updatedTests.length) },
    });
  };

  const duplicateBatteryTest = (i: number) => {
    const orig = formData.batteryTests[i];
    // Usar trim() en el ID original antes de incrementar
    const clone = { ...orig, id: incrementCaseId(orig.id.trim()), images: [] }; // Clonar sin imágenes
    // Crear nuevo array insertando el clon
    const updatedTests = [
      ...formData.batteryTests.slice(0, i + 1),
      clone,
      ...formData.batteryTests.slice(i + 1),
    ];
    setFormData({
      ...formData,
      batteryTests: updatedTests,
      summary: { ...formData.summary, totalTests: String(updatedTests.length) },
    });
  };

  const handleBatteryTestChange = (
    idx: number,
    field: keyof BatteryTest,
    val: string
  ) => {
    // Actualización inmutable del array de tests
    const updatedTests = formData.batteryTests.map((test, index) => {
      if (index === idx) {
        return { ...test, [field]: val }; // Crear copia del test modificado
      }
      return test; // Mantener los otros tests igual
    });
    setFormData({ ...formData, batteryTests: updatedTests });
  };


  // --- Incidencias (lógica simplificada y con actualización inmutable) ---
  const addIncidence = () => {
    // Añade una incidencia por defecto si no hay ninguna y hasIncidences es true
    // La lógica de limitar a 1 se maneja mejor en la UI o al procesar
    const newIncidence: Incidence = {
      id: "INC-001", // O algún ID por defecto
      description: "Descripción de la incidencia...",
      impact: "Medio",
      status: "Abierto",
    };
    setFormData({
      ...formData,
      incidences: [...formData.incidences, newIncidence],
    });
  };

  const removeIncidence = (i: number) => {
    // Actualización inmutable
    const updatedIncidences = formData.incidences.filter((_, index) => index !== i);
    setFormData({ ...formData, incidences: updatedIncidences });
  };

  // Efecto para manejar el array de incidencias basado en hasIncidences
  useEffect(() => {
    if (formData.hasIncidences && formData.incidences.length === 0) {
      // Si se marca "Sí" y no hay incidencias, añadir una por defecto
      addIncidence();
    } else if (!formData.hasIncidences && formData.incidences.length > 0) {
      // Si se marca "No" y hay incidencias, limpiarlas
      setFormData({ ...formData, incidences: [] });
    }
    // Dependencias correctas: formData.hasIncidences y formData.incidences.length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hasIncidences, formData.incidences.length]);

  // Actualizar incidencia específica (inmutable)
  const handleIncidenceChange = (
    idx: number,
    field: keyof Incidence,
    val: string
  ) => {
    const updatedIncidences = formData.incidences.map((inc, index) => {
      if (index === idx) {
        return { ...inc, [field]: val };
      }
      return inc;
    });
    setFormData({ ...formData, incidences: updatedIncidences });
  };


  // --- Versiones (con actualización inmutable) ---
  const handleVersionChange = (
    i: number,
    field: "appName" | "appVersion",
    v: string
  ) => {
    const updatedVersions = formData.versions.map((version, index) => {
      if (index === i) {
        return { ...version, [field]: v };
      }
      return version;
    });
    setFormData({ ...formData, versions: updatedVersions });
  };

  const addVersion = () =>
    setFormData({
      ...formData,
      // Añadir nuevo objeto versión al array inmutablemente
      versions: [...formData.versions, { appName: "", appVersion: "" }],
    });

  const removeVersion = (i: number) => {
    // Filtrar para crear nuevo array inmutable
    const updatedVersions = formData.versions.filter((_, index) => index !== i);
    setFormData({ ...formData, versions: updatedVersions });
  };

  // --- Campos Personalizados (con actualización inmutable) ---
  const handleCustomFieldChange = (
    i: number,
    field: "label" | "value",
    val: string
  ) => {
    const updatedFields = formData.customEnvFields.map((f, index) => {
      if (index === i) {
        return { ...f, [field]: val };
      }
      return f;
    });
    setFormData({ ...formData, customEnvFields: updatedFields });
  };

  const addCustomField = () => {
    setFormData({
      ...formData,
      customEnvFields: [...formData.customEnvFields, { label: "", value: "" }],
    });
  };

  const removeCustomField = (i: number) => {
    const updatedFields = formData.customEnvFields.filter((_, index) => index !== i);
    setFormData({ ...formData, customEnvFields: updatedFields });
  };


  // Conclusión (sin cambios)
  const isExampleConclusion =
    formData.conclusion === EXAMPLE_CONCLUSION;

  // Importar Excel (sin cambios funcionales, pero asegurar inmutabilidad)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const sh = wb.Sheets[wb.SheetNames[0]];
      if (!sh) throw new Error("Hoja no encontrada en el Excel");
      const sd: any[][] = XLSX.utils.sheet_to_json(sh, {
        header: 1,
        blankrows: false,
      });
      if (sd.length < 2) {
        alert("Excel vacío o sin datos suficientes (mínimo cabecera y una fila).");
        return;
      }
      const hdr = sd[0] as string[];
      if (
        hdr.length !== EXPECTED_HEADERS.length ||
        !EXPECTED_HEADERS.every((expectedH, i) => expectedH === hdr[i]?.trim()) // Trim a las cabeceras leídas
      ) {
        alert(
          "El formato de las columnas no coincide con el esperado:\n" +
          EXPECTED_HEADERS.join(" | ") + "\n\n" +
          "Columnas encontradas:\n" + hdr.join(" | ")
        );
        return;
      }
      const imp: BatteryTest[] = [];
      sd.slice(1).forEach((row: any[], rowIndex) => {
        // Permitir filas más cortas, pero asegurar que los índices existan
        const [id, d, steps, er, or, ver, st] = row;
        const nt: BatteryTest = {
          id: String(id || `IMP-${rowIndex + 1}`).trim(), // Usar trim y ID por defecto si está vacío
          description: String(d || ""),
          steps: String(steps || ""),
          expectedResult: String(er || ""),
          obtainedResult: String(or || ""),
          testVersion: String(ver || ""),
          testStatus: String(st || "Pendiente"), // Estado por defecto
          images: [], // Las imágenes no se importan de Excel
        };
        // Importar solo si el ID no está vacío después de trim
        if (nt.id) imp.push(nt);
      });

      if (!imp.length) {
        alert("No se importaron casos de prueba válidos desde el Excel.");
        return;
      }

      // Combinar tests existentes con importados de forma inmutable
      const combinedTests = [...formData.batteryTests, ...imp];
      setFormData({
        ...formData,
        batteryTests: combinedTests,
        summary: { ...formData.summary, totalTests: String(combinedTests.length) },
      });
      alert(`Importados ${imp.length} casos de prueba.`);
    } catch (error) {
      console.error("Error al leer Excel:", error);
      alert(`Error al leer el archivo Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      // Limpiar el input para permitir importar el mismo archivo de nuevo si es necesario
      if (e.target) e.target.value = "";
    }
  };

  // Ocultar campos entorno (sin cambios)
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

  // --- Renderizado del Formulario ---
  return (
    <div className="space-y-6 max-w-3xl mx-auto mb-12">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center text-2xl font-bold mb-1">
            <svg /* Icono */ className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            Paso 2
          </h2>
          <p className="text-gray-600">Introduce los datos adicionales del reporte</p>
          <hr className="mt-3 border-gray-200" />
        </div>
        <button
          onClick={onGoBackToStep1}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors" // Botón volver
        >
          ← Volver a la introducción del JIRA
        </button>
      </div>

      {/* Datos básicos */}
      <div className="p-4 border rounded shadow-sm bg-white space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Información General</h3>
        {/* Título (Solo lectura) */}
        <div>
          <label className="block font-medium text-gray-700">Título JIRA</label>
          <p className="p-2 bg-gray-100 rounded text-gray-800 text-sm">{parsedData.title}</p>
        </div>
        {/* Código de JIRA */}
        <div>
          <label htmlFor="jiraCode" className="block font-medium text-gray-700">
            Código de JIRA <span className="text-red-500">*</span>
          </label>
          <input
            id="jiraCode"
            type="text"
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: SAENEXTBUS-1411"
            value={formData.jiraCode}
            onChange={(e) => handleInputChange("jiraCode", e.target.value)}
            required // HTML5 validation
          />
        </div>
        {/* Fecha */}
        <div>
          <label htmlFor="date" className="block font-medium text-gray-700">Fecha de Prueba</label>
          <input
            id="date"
            type="date"
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
          />
        </div>
        {/* Tester */}
        <div>
          <label htmlFor="tester" className="block font-medium text-gray-700">Tester</label>
          <input
            id="tester"
            type="text"
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Iniciales o nombre"
            value={formData.tester}
            onChange={(e) => handleInputChange("tester", e.target.value)}
          />
        </div>
        {/* Estado */}
        <div>
          <label htmlFor="testStatus" className="block font-medium text-gray-700">Estado General de la Prueba</label>
          <select
            id="testStatus"
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={formData.testStatus}
            onChange={(e) => handleInputChange("testStatus", e.target.value)}
          >
            <option value="" disabled>Seleccione...</option>
            <option value="Exitosa">Exitosa</option>
            <option value="Fallida">Fallida</option>
            <option value="Parcial">Parcialmente Exitosa</option>
            <option value="Bloqueada">Bloqueada</option>
          </select>
        </div>
      </div>


      {/* Entorno y Configuración */}
      <div className="p-4 border rounded shadow-sm bg-white space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Entorno y Configuración</h3>
        {/* Checkbox APP */}
        <div className="mt-4">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              checked={formData.isApp || false}
              onChange={(e) => handleInputChange("isApp", e.target.checked)}
            />
            <span className="ml-2 text-gray-700">¿Es validación de una APP Móvil/Escritorio?</span>
          </label>
        </div>

        {/* Campos APP Condicionales */}
        {formData.isApp && (
          <div className="mt-4 border p-3 rounded space-y-3 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800">Detalles de la APP</h4>
            {/* Endpoint */}
            <div>
              <label htmlFor="endpoint" className="block font-medium text-sm">Endpoint (si aplica)</label>
              <input id="endpoint" type="text" className="border p-2 rounded w-full text-sm" placeholder="Ej: https://api.ejemplo.com" value={formData.endpoint || ""} onChange={(e) => handleInputChange("endpoint", e.target.value)} />
            </div>
            {/* Sistema Operativo */}
            <div>
              <label htmlFor="sistemaOperativo" className="block font-medium text-sm">Sistema Operativo / Versión</label>
              <input id="sistemaOperativo" type="text" className="border p-2 rounded w-full text-sm" placeholder="Ej: Android 13, iOS 16.5, Windows 11" value={formData.sistemaOperativo || ""} onChange={(e) => handleInputChange("sistemaOperativo", e.target.value)} />
            </div>
            {/* Dispositivo */}
            <div>
              <label htmlFor="dispositivoPruebas" className="block font-medium text-sm">Dispositivo de Pruebas</label>
              <input id="dispositivoPruebas" type="text" className="border p-2 rounded w-full text-sm" placeholder="Ej: Pixel 8, iPhone 14 Pro, PC (marca/modelo)" value={formData.dispositivoPruebas || ""} onChange={(e) => handleInputChange("dispositivoPruebas", e.target.value)} />
            </div>
            {/* Precondiciones APP */}
            <div>
              <label htmlFor="precondiciones" className="block font-medium text-sm">Precondiciones Específicas APP</label>
              <textarea id="precondiciones" rows={2} className="w-full border p-2 rounded text-sm" placeholder="Ej: Permisos concedidos, versión mínima requerida..." value={formData.precondiciones || ""} onChange={(e) => handleInputChange("precondiciones", e.target.value)} />
            </div>
            {/* Idioma APP */}
            <div>
              <label htmlFor="idioma" className="block font-medium text-sm">Idioma Configurado</label>
              <input id="idioma" type="text" className="border p-2 rounded w-full text-sm" placeholder="Ej: es-ES, en-US" value={formData.idioma || ""} onChange={(e) => handleInputChange("idioma", e.target.value)} />
            </div>
          </div>
        )}

        {/* Versiones */}
        <div className="mt-6 space-y-3">
          <label className="block font-medium text-gray-700">Versiones de Aplicativos/Componentes</label>
          {formData.versions.map((v, i) => (
            <div key={i} className="flex items-center space-x-2">
              <input type="text" aria-label={`Nombre aplicativo ${i + 1}`} className="border p-2 rounded flex-grow" placeholder="Nombre aplicativo" value={v.appName} onChange={(e) => handleVersionChange(i, "appName", e.target.value)} />
              <input type="text" aria-label={`Versión aplicativo ${i + 1}`} className="border p-2 rounded flex-grow" placeholder="Versión" value={v.appVersion} onChange={(e) => handleVersionChange(i, "appVersion", e.target.value)} />
              <button type="button" onClick={() => removeVersion(i)} className="text-red-600 hover:text-red-800 font-bold px-2 py-1" title="Eliminar esta versión">✕</button>
            </div>
          ))}
          <button type="button" onClick={addVersion} className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">+ Añadir versión</button>
        </div>

        {/* Campos entorno ocultables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Servidor */}
          {!hiddenFields.serverPruebas && (
            <div className="relative group">
              <label htmlFor="serverPruebas" className="block font-medium text-sm">Servidor de Pruebas</label>
              <input id="serverPruebas" type="text" className="border p-2 rounded w-full pr-8 text-sm" placeholder="Ej: Servidor UAT" value={formData.serverPruebas} onChange={(e) => handleInputChange("serverPruebas", e.target.value)} />
              <button type="button" onClick={() => hideField("serverPruebas")} className="absolute top-6 right-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Ocultar este campo del reporte">✕</button>
            </div>
          )}
          {/* IP */}
          {!hiddenFields.ipMaquina && (
            <div className="relative group">
              <label htmlFor="ipMaquina" className="block font-medium text-sm">IP Máquina Cliente</label>
              <input id="ipMaquina" type="text" className="border p-2 rounded w-full pr-8 text-sm" placeholder="Ej: 192.168.1.100" value={formData.ipMaquina} onChange={(e) => handleInputChange("ipMaquina", e.target.value)} />
              <button type="button" onClick={() => hideField("ipMaquina")} className="absolute top-6 right-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Ocultar este campo del reporte">✕</button>
            </div>
          )}
          {/* Navegador */}
          {!hiddenFields.navegador && (
            <div className="relative group">
              <label htmlFor="navegador" className="block font-medium text-sm">Navegador Utilizado (si aplica)</label>
              <input id="navegador" type="text" className="border p-2 rounded w-full pr-8 text-sm" placeholder="Ej: Chrome 120, Firefox 118" value={formData.navegador} onChange={(e) => handleInputChange("navegador", e.target.value)} />
              <button type="button" onClick={() => hideField("navegador")} className="absolute top-6 right-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Ocultar este campo del reporte">✕</button>
            </div>
          )}
          {/* Base de Datos */}
          {!hiddenFields.baseDatos && (
            <div className="relative group">
              <label htmlFor="baseDatos" className="block font-medium text-sm">Base de Datos (si aplica)</label>
              <select id="baseDatos" className="border p-2 rounded w-full pr-8 text-sm bg-white appearance-none" value={formData.baseDatos} onChange={(e) => handleInputChange("baseDatos", e.target.value)}>
                <option value="">Seleccione o escriba...</option>
                <option value="SQL Server">SQL Server</option>
                <option value="Oracle">Oracle</option>
                <option value="MySQL">MySQL</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="MongoDB">MongoDB</option>
                <option value="N/A">N/A</option>
              </select>
              {/* Input para escribir si no está en la lista */}
              {formData.baseDatos === "" || !["SQL Server", "Oracle", "MySQL", "PostgreSQL", "MongoDB", "N/A"].includes(formData.baseDatos) && (
                <input type="text" className="border p-2 rounded w-full pr-8 text-sm mt-1" placeholder="Especifique BD" value={formData.baseDatos} onChange={(e) => handleInputChange("baseDatos", e.target.value)} />
              )}
              <button type="button" onClick={() => hideField("baseDatos")} className="absolute top-6 right-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Ocultar este campo del reporte">✕</button>
            </div>
          )}
          {/* Maqueta */}
          {!hiddenFields.maquetaUtilizada && (
            <div className="relative group">
              <label htmlFor="maquetaUtilizada" className="block font-medium text-sm">Maqueta Utilizada (si aplica)</label>
              <input id="maquetaUtilizada" type="text" className="border p-2 rounded w-full pr-8 text-sm" placeholder="Ej: Maqueta XYZ v2" value={formData.maquetaUtilizada} onChange={(e) => handleInputChange("maquetaUtilizada", e.target.value)} />
              <button type="button" onClick={() => hideField("maquetaUtilizada")} className="absolute top-6 right-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Ocultar este campo del reporte">✕</button>
            </div>
          )}
          {/* Ambiente */}
          {!hiddenFields.ambiente && (
            <div className="relative group">
              <label htmlFor="ambiente" className="block font-medium text-sm">Ambiente</label>
              <select id="ambiente" className="border p-2 rounded w-full pr-8 text-sm bg-white appearance-none" value={formData.ambiente} onChange={(e) => handleInputChange("ambiente", e.target.value)}>
                <option value="">Seleccione...</option>
                <option value="Desarrollo">Desarrollo</option>
                <option value="Integración">Integración</option>
                <option value="UAT">UAT</option>
                <option value="Transferencia">Transferencia</option>
                <option value="PRE">Pre-Producción</option>
                <option value="PROD">Producción</option>
              </select>
              {/* Input para escribir si no está en la lista */}
              {formData.ambiente === "" || !["Desarrollo", "Integración", "UAT", "Transferencia", "PRE", "PROD"].includes(formData.ambiente) && (
                <input type="text" className="border p-2 rounded w-full pr-8 text-sm mt-1" placeholder="Especifique Ambiente" value={formData.ambiente} onChange={(e) => handleInputChange("ambiente", e.target.value)} />
              )}
              <button type="button" onClick={() => hideField("ambiente")} className="absolute top-6 right-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Ocultar este campo del reporte">✕</button>
            </div>
          )}
        </div>

        {/* Campos personalizados */}
        <div className="mt-4">
          <label className="block font-medium text-sm mb-2">Campos Personalizados del Entorno</label>
          {formData.customEnvFields.map((f, i) => (
            <div key={i} className="flex items-center space-x-2 mt-2">
              <input type="text" aria-label={`Nombre campo personalizado ${i + 1}`} placeholder="Nombre del campo" className="border p-2 rounded w-1/3 text-sm" value={f.label} onChange={(e) => handleCustomFieldChange(i, "label", e.target.value)} />
              <input type="text" aria-label={`Valor campo personalizado ${i + 1}`} placeholder="Valor del campo" className="border p-2 rounded w-1/3 text-sm" value={f.value} onChange={(e) => handleCustomFieldChange(i, "value", e.target.value)} />
              <button type="button" onClick={() => removeCustomField(i)} className="text-red-600 hover:text-red-800 font-bold" title="Eliminar campo personalizado">✕</button>
            </div>
          ))}
          <button type="button" onClick={addCustomField} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">+ Añadir campo personalizado</button>
        </div>

        {/* Restaurar campos ocultos */}
        {anyHidden && (
          <div className="mt-4 text-right">
            <button type="button" onClick={restoreAll} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">🔁 Mostrar todos los campos del entorno</button>
          </div>
        )}

      </div>


      {/* Batería de Pruebas */}
      <div className="p-4 border rounded shadow-sm bg-white mt-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Batería de Pruebas</h3>
        <p className="text-sm text-gray-500 mb-4">
          Define aquí los casos de prueba ejecutados. Puedes añadir, eliminar, duplicar o importar desde Excel.
        </p>

        {/* Contenedor de Tests */}
        <div className="space-y-4">
          {formData.batteryTests.map((test, idx) => {
            // const isExample = test.id === "PR-001"; // Ya no se usa la lógica de ejemplo directamente
            return (
              <div key={idx} className="relative border rounded p-4 space-y-3 bg-gray-50 border-gray-200">
                {/* Botones de Acción por Test */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button type="button" onClick={() => duplicateBatteryTest(idx)} className="text-blue-500 hover:text-blue-700 p-1" title="Duplicar este caso">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                  <button type="button" onClick={() => removeBatteryTest(idx)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar este caso">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>

                {/* Campos del Test */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`test-id-${idx}`} className="block font-medium text-sm">ID Prueba</label>
                    <input id={`test-id-${idx}`} type="text" className="border p-2 rounded w-full text-sm" placeholder="Ej: CASO-001" value={test.id} onChange={(e) => handleBatteryTestChange(idx, "id", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor={`test-version-${idx}`} className="block font-medium text-sm">Versión Probada</label>
                    <input id={`test-version-${idx}`} type="text" className="border p-2 rounded w-full text-sm" placeholder="Ej: v1.2.0" value={test.testVersion} onChange={(e) => handleBatteryTestChange(idx, "testVersion", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label htmlFor={`test-desc-${idx}`} className="block font-medium text-sm">Descripción</label>
                  <textarea id={`test-desc-${idx}`} rows={2} className="w-full border p-2 rounded text-sm" placeholder="Describe el objetivo de la prueba" value={test.description} onChange={(e) => handleBatteryTestChange(idx, "description", e.target.value)} />
                </div>
                <div>
                  <label htmlFor={`test-steps-${idx}`} className="block font-medium text-sm">Pasos</label>
                  <textarea id={`test-steps-${idx}`} rows={4} className="w-full border p-2 rounded text-sm" placeholder="1. Ir a...\n2. Hacer clic en...\n3. Verificar que..." value={test.steps} onChange={(e) => handleBatteryTestChange(idx, "steps", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`test-expected-${idx}`} className="block font-medium text-sm">Resultado Esperado</label>
                    <textarea id={`test-expected-${idx}`} rows={3} className="w-full border p-2 rounded text-sm" placeholder="Lo que debería suceder" value={test.expectedResult} onChange={(e) => handleBatteryTestChange(idx, "expectedResult", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor={`test-obtained-${idx}`} className="block font-medium text-sm">Resultado Obtenido</label>
                    <textarea id={`test-obtained-${idx}`} rows={3} className="w-full border p-2 rounded text-sm" placeholder="Lo que sucedió realmente (usa ❌ o ✅)" value={test.obtainedResult} onChange={(e) => handleBatteryTestChange(idx, "obtainedResult", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label htmlFor={`test-status-${idx}`} className="block font-medium text-sm">Estado del Caso</label>
                  <select id={`test-status-${idx}`} className="border p-2 rounded w-full text-sm bg-white" value={test.testStatus} onChange={(e) => handleBatteryTestChange(idx, "testStatus", e.target.value)}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Exitoso">Exitoso</option>
                    <option value="Fallido">Fallido</option>
                    <option value="Bloqueado">Bloqueado</option>
                    <option value="No aplica">No aplica</option>
                  </select>
                </div>
                {/* === SECCIÓN DATOS DE PRUEBA (AÑADIR ESTO) === */}
                <div className="p-4 border rounded shadow-sm bg-white mt-6">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4">Datos de Prueba Utilizados</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Registra aquí los datos de entrada, parámetros, usuarios, o cualquier información específica usada para poder reproducir las pruebas.
                  </p>
                  <textarea
                    id="datosDePrueba" // ID para accesibilidad
                    rows={5} // Puedes ajustar la altura
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm" // Fuente monoespaciada opcional
                    placeholder="Ej: Usuario: test_user | Contraseña: pwd | Pedido ID: 12345 | Filtro aplicado: Fecha='2025-04-22'"
                    value={formData.datosDePrueba} // Enlazar al estado
                    onChange={(e) => handleInputChange("datosDePrueba", e.target.value)} // Enlazar al handler
                  />
                </div>
                {/* =========================================== */}

                {/* Evidencias */}
                <div>
                  <label className="block font-medium text-sm mb-1">Evidencias (Imágenes)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="mb-2 text-sm"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      try {
                        const b64s = await Promise.all(files.map(readFileAsBase64));
                        // Actualización inmutable
                        const updatedTests = formData.batteryTests.map((t, index) => {
                          if (index === idx) {
                            return { ...t, images: [...(t.images || []), ...b64s] };
                          }
                          return t;
                        });
                        setFormData({ ...formData, batteryTests: updatedTests });
                      } catch (error) {
                        console.error("Error al leer imágenes:", error);
                        alert("Hubo un error al cargar una o más imágenes.");
                      } finally {
                        if (e.target) e.target.value = ""; // Limpiar input
                      }
                    }}
                  />
                  {/* Miniaturas */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {test.images?.map((src, i) => (
                      <div key={`${idx}-${i}`} className="relative w-20 h-20 rounded overflow-hidden border group">
                        <img src={src} alt={`Evidencia ${idx + 1}-${i + 1}`} className="w-full h-full object-contain" />
                        {/* Botón eliminar imagen */}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedTests = formData.batteryTests.map((t, index) => {
                              if (index === idx) {
                                const updatedImages = t.images?.filter((_, imgIndex) => imgIndex !== i);
                                return { ...t, images: updatedImages };
                              }
                              return t;
                            });
                            setFormData({ ...formData, batteryTests: updatedTests });
                          }}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar esta imagen"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Descargar ZIP de este test */}
                  {test.images?.length ? (
                    <div className="text-right mt-1">
                      <button
                        type="button"
                        onClick={() => downloadImagesZip([test])} // Solo este test
                        className="flex items-center text-purple-600 hover:text-purple-800 text-xs ml-auto"
                        title={`Descargar ${test.images.length} evidencia(s) de ${test.id.trim()} en ZIP`}
                      >
                        <svg /* Icono ZIP */ className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        ZIP Evidencias
                      </button>
                    </div>
                  ) : null}
                </div> {/* Fin Evidencias */}
              </div> // Fin Test Case Div
            );
          })}
        </div>

        {/* Botones añadir/importar/plantilla */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
          <button
            type="button"
            onClick={addBatteryTest}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            + Añadir caso
          </button>

          <div className="flex items-center">
            <Tippy
              content={`Importa casos desde Excel.\nColumnas: ${EXPECTED_HEADERS.join(
                ", "
              )}`}
              placement="top"
            >
              <button
                type="button"
                onClick={handleImportClick}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
              >
                Importar Excel
              </button>
            </Tippy>
          </div>
          <a
            href="/plantillas/plantilla_bateria_pruebas.xlsx"
            download
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-1"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 2h9a2 2 0 012 2v4h-2V4H6v16h6v2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
              <path d="M13 12l3 3h-2v4h-2v-4h-2l3-3z" />
            </svg>
            Descargar Plantilla Excel
          </a>
        </div>
        <input type="file" accept=".xls,.xlsx" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </div>

      {/* === NUEVO: Sección Logs Relevantes === */}
      <div className="p-4 border rounded shadow-sm bg-white mt-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Logs Relevantes</h3>
        <p className="text-sm text-gray-500 mb-2">
          Pega aquí extractos de logs que ayuden a entender el comportamiento o errores observados durante las pruebas.
        </p>
        <textarea
          id="logsRelevantes"
          rows={10}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 font-mono text-xs bg-gray-800 text-gray-200" // Estilo tipo consola
          placeholder={`Ejemplo:\n[INFO] 2025-04-22 18:00:01 - User logged in: testuser\n[ERROR] 2025-04-22 18:05:30 - Failed to process order 123: Connection timed out`}
          value={formData.logsRelevantes || ""}
          onChange={(e) => handleInputChange("logsRelevantes", e.target.value)}
        />
      </div>
      {/* ===================================== */}


      {/* Resumen de Resultados */}
      <div className="p-4 border rounded shadow-sm bg-white mt-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Resumen de Resultados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="totalTests" className="block font-medium text-sm">Total de Pruebas</label>
            <input id="totalTests" type="number" min={0} className="border p-2 rounded w-full text-sm" value={formData.summary.totalTests} onChange={(e) => handleInputChange("summary", { ...formData.summary, totalTests: e.target.value })} />
          </div>
          <div>
            <label htmlFor="successfulTests" className="block font-medium text-sm">Pruebas Exitosas</label>
            <input id="successfulTests" type="number" min={0} max={Number(formData.summary.totalTests) || undefined} className="border p-2 rounded w-full text-sm" value={formData.summary.successfulTests} onChange={(e) => handleInputChange("summary", { ...formData.summary, successfulTests: e.target.value })} />
          </div>
          <div>
            <label htmlFor="failedTests" className="block font-medium text-sm">Pruebas Fallidas</label>
            <input id="failedTests" type="number" min={0} max={Number(formData.summary.totalTests) || undefined} className="border p-2 rounded w-full text-sm" value={formData.summary.failedTests} onChange={(e) => handleInputChange("summary", { ...formData.summary, failedTests: e.target.value })} />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="observations" className="block font-medium text-sm">Observaciones del Resumen</label>
          <textarea id="observations" rows={3} className="w-full border p-2 rounded text-sm" placeholder="Breve resumen o notas adicionales sobre los resultados globales." value={formData.summary.observations} onChange={(e) => handleInputChange("summary", { ...formData.summary, observations: e.target.value })} />
        </div>
      </div>


      {/* Incidencias */}
      <div className="p-4 border rounded shadow-sm bg-white mt-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Incidencias Detectadas</h3>
        <div>
          <label className="block font-medium text-sm mb-2">¿Se detectaron incidencias?</label>
          <select
            className="border p-2 rounded w-full md:w-1/3 text-sm bg-white"
            value={formData.hasIncidences ? "Sí" : "No"}
            onChange={(e) => handleInputChange("hasIncidences", e.target.value === "Sí")}
          >
            <option value="No">No</option>
            <option value="Sí">Sí</option>
          </select>
        </div>

        {/* Lista de Incidencias (si hasIncidences es true) */}
        {formData.hasIncidences && (
          <div className="mt-4 space-y-4">
            {formData.incidences.map((inc, i) => (
              <div key={i} className="relative border rounded p-3 space-y-2 bg-red-50 border-red-200">
                <button type="button" onClick={() => removeIncidence(i)} className="absolute top-1 right-1 text-red-500 hover:text-red-700" title="Eliminar incidencia">✕</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`inc-id-${i}`} className="block font-medium text-xs">ID Prueba Relacionada</label>
                    <input id={`inc-id-${i}`} type="text" className="border p-1 rounded w-full text-sm" placeholder="Ej: CASO-005" value={inc.id} onChange={(e) => handleIncidenceChange(i, "id", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor={`inc-status-${i}`} className="block font-medium text-xs">Estado Incidencia</label>
                    <input id={`inc-status-${i}`} type="text" className="border p-1 rounded w-full text-sm" placeholder="Ej: Reportada, Corregida, Reabierta" value={inc.status} onChange={(e) => handleIncidenceChange(i, "status", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label htmlFor={`inc-desc-${i}`} className="block font-medium text-xs">Descripción Incidencia</label>
                  <textarea id={`inc-desc-${i}`} rows={2} className="w-full border p-1 rounded text-sm" placeholder="Describe brevemente el problema encontrado" value={inc.description} onChange={(e) => handleIncidenceChange(i, "description", e.target.value)} />
                </div>
                <div>
                  <label htmlFor={`inc-impact-${i}`} className="block font-medium text-xs">Impacto</label>
                  <input id={`inc-impact-${i}`} type="text" className="border p-1 rounded w-full text-sm" placeholder="Ej: Crítico, Alto, Medio, Bajo" value={inc.impact} onChange={(e) => handleIncidenceChange(i, "impact", e.target.value)} />
                </div>
              </div>
            ))}
            {/* Botón Añadir Incidencia */}
            <button type="button" onClick={addIncidence} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">+ Añadir incidencia</button>
          </div>
        )}
      </div>


      {/* Conclusiones */}
      <div className="p-4 border rounded shadow-sm bg-white mt-6">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Conclusiones Finales</h3>
        <textarea
          id="conclusion"
          rows={5}
          className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-sm ${isExampleConclusion ? "italic text-gray-400" : ""}`}
          placeholder={EXAMPLE_CONCLUSION}
          value={formData.conclusion}
          onChange={(e) => handleInputChange("conclusion", e.target.value)}
        />
      </div>

      {/* Botones finales */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button" // Cambiado a type="button" si no es el submit principal del form
          onClick={onGenerate} // Esta función debería ahora pasar al siguiente paso (ReportOutput)
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors text-lg font-semibold"
        >
          Generar Reporte →
        </button>
        <button
          type="button"
          onClick={onReset}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
        >
          Reiniciar Formulario
        </button>
      </div>
    </div>
  );
}