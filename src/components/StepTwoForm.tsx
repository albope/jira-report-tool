// src/components/StepTwoForm.tsx
"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image"; // Importado para las imágenes de la batería
import * as XLSX from "xlsx";
import Tippy from "@tippyjs/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "tippy.js/dist/tippy.css";

import {
  Info, Settings, ListChecks, FileTextIcon, BarChart3, AlertOctagon, CheckCircle2,
  Sheet, Download, PlusCircle, XCircle, Copy, Trash2, Layers, Edit3, ListPlus, GripVertical,
  FileCheckIcon // Asegurado que está importado
} from 'lucide-react';

import { ParsedData } from "@/utils/parseJiraContent";

// --- Interfaces (Se mantienen como las proporcionaste) ---
export interface BatteryTest {
  id: string;
  description: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testVersion: string;
  testStatus: string;
  images?: string[]; 
}
interface Incidence {
  id: string;
  description: string;
  impact: string;
  status: string;
}
interface Summary {
  totalTests: string;
  successfulTests: string;
  failedTests: string;
  observations: string;
}
export interface HiddenFields {
  serverPruebas: boolean;
  ipMaquina: boolean;
  navegador: boolean;
  baseDatos: boolean;
  maquetaUtilizada: boolean;
  ambiente: boolean;
}
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
  logsRelevantes?: string;
  isApp?: boolean;
  endpoint?: string;
  sistemaOperativo?: string;
  dispositivoPruebas?: string;
  precondiciones?: string;
  idioma?: string;
  customEnvFields: Array<{ label: string; value: string }>;
}
interface StepTwoFormProps {
  parsedData: ParsedData;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>; // Tipo corregido
  hiddenFields: HiddenFields;
  setHiddenFields: React.Dispatch<React.SetStateAction<HiddenFields>>;
  onGenerate: () => void;
  onReset: () => void;
  onGoBackToStep1: () => void;
  jiraCodeLocked?: boolean;
}
// --- Fin de Interfaces ---

const EXAMPLE_CONCLUSION = `Ejemplo de conclusión:\n❌ Rechazado → El fallo bloquea la validación de la funcionalidad`;
const EXPECTED_HEADERS = ["ID Prueba", "Descripción", "Pasos", "Resultado Esperado", "Resultado Obtenido", "Versión", "Estado"];

function incrementCaseId(originalId: string): string {
  const match = originalId.match(/^(\D*)(\d+)$/);
  if (!match) return originalId + " (copy)";
  const [_, prefix, numStr] = match;
  const nextNum = String(parseInt(numStr, 10) + 1).padStart(numStr.length, "0");
  return prefix + nextNum;
}

const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

async function downloadImagesZip(tests: BatteryTest[]) {
  const zip = new JSZip();
  tests.forEach((t) => {
    if (!t.images?.length) return;
    const folderName = t.id.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const folder = zip.folder(folderName)!;
    t.images.forEach((b64, i) => {
      const mimeMatch = b64.match(/^data:(image\/\w+)/);
      const mime = mimeMatch ? mimeMatch[1] : "image/png";
      const ext = mime.split("/")[1]?.toLowerCase() || "png";
      const base64Data = b64.split(",")[1];
      if (base64Data) {
        folder.file(`evidencia-${i + 1}.${ext}`, base64Data, { base64: true });
      }
    });
  });
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "evidencias_pruebas.zip"); // Nombre de archivo ligeramente más descriptivo
}

// --- Sub-componentes de Estilo ---
const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; error?: boolean; required?: boolean }> = ({ label, id, error, required, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      {...props}
      className={`w-full border ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'} rounded-lg px-3.5 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
    />
  </div>
);

const StyledTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; id: string; required?: boolean }> = ({ label, id, required, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={id}
      {...props}
      className={`w-full border border-gray-300 rounded-lg px-3.5 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm ${props.className || ''}`}
    />
  </div>
);

const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; id: string; required?: boolean }> = ({ label, id, children, required, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={id}
      {...props}
      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-sm appearance-none" // appearance-none para estilizar flecha si se desea
    >
      {children}
    </select>
  </div>
);

const FormSection: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
  <section className={`bg-white p-6 rounded-xl shadow-lg space-y-5 ${className || ''}`}>
    <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-4 mb-6 flex items-center">
      {icon && <span className="mr-3 text-blue-600">{icon}</span>}
      {title}
    </h3>
    {children}
  </section>
);
// --- Fin Sub-componentes de Estilo ---


export default function StepTwoForm({
  parsedData,
  formData,
  setFormData,
  hiddenFields,
  setHiddenFields,
  onGenerate,
  onReset,
  onGoBackToStep1,
  jiraCodeLocked = false,
}: StepTwoFormProps) {
  const [forceUnlock, setForceUnlock] = React.useState(false);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | Summary
  ) => {
    if (field === "summary" && typeof value === "object") {
      const newSummary = { ...formData.summary, ...value } as Summary;
      const total = +newSummary.totalTests || 0; 
      const suc = +newSummary.successfulTests || 0;
      const fail = +newSummary.failedTests || 0;

      if (suc > total || fail > total || (suc + fail) > total) {
        alert("La suma de pruebas Exitosas y Fallidas no puede superar el Total.");
        if ((suc + fail) > total) return;
      }
      setFormData({ ...formData, summary: newSummary });
      return;
    }
    setFormData({ ...formData, [field]: value });
  };

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
    if (JSON.stringify(updated) !== JSON.stringify(formData.batteryTests)) {
      setFormData({ ...formData, batteryTests: updated });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const addBatteryTest = () => {
    const nt: BatteryTest = {
      id: `PR-${String(formData.batteryTests.length + 1).padStart(3, '0')}`,
      description: "",
      steps: "1. ",
      expectedResult: "",
      obtainedResult: "",
      testVersion: "",
      testStatus: "Pendiente", 
      images: [],
    };
    const updatedTests = [...formData.batteryTests, nt];
    setFormData((prev) => ({ // Usar forma funcional para asegurar el estado más reciente
      ...prev,
      batteryTests: updatedTests,
      summary: { ...prev.summary, totalTests: String(updatedTests.length) },
    }));
  };

  const removeBatteryTest = (i: number) => {
    if (window.confirm(`¿Seguro que quieres eliminar el caso de prueba "${formData.batteryTests[i]?.id || i + 1}"?`)) {
      const updatedTests = formData.batteryTests.filter((_, index) => index !== i);
      setFormData((prev) => ({
        ...prev,
        batteryTests: updatedTests,
        summary: { ...prev.summary, totalTests: String(updatedTests.length) },
      }));
    }
  };

  const duplicateBatteryTest = (i: number) => {
    const orig = formData.batteryTests[i];
    const clone = { ...orig, id: incrementCaseId(orig.id.trim()), images: [] }; 
    const updatedTests = [
      ...formData.batteryTests.slice(0, i + 1),
      clone,
      ...formData.batteryTests.slice(i + 1),
    ];
    setFormData((prev) => ({
      ...prev,
      batteryTests: updatedTests,
      summary: { ...prev.summary, totalTests: String(updatedTests.length) },
    }));
  };
  
  const handleBatteryTestChange = (
    idx: number,
    field: keyof BatteryTest,
    val: string
  ) => {
    const updatedTests = formData.batteryTests.map((test, index) => {
      if (index === idx) {
        return { ...test, [field]: val }; 
      }
      return test; 
    });
    setFormData(prev => ({ ...prev, batteryTests: updatedTests }));
  };

  const addIncidence = () => {
    const newIncidence: Incidence = {
      id: `INC-${String(formData.incidences.length + 1).padStart(3, '0')}`, 
      description: "",
      impact: "Medio",
      status: "Abierto",
    };
    setFormData((prev) => ({
      ...prev,
      incidences: [...prev.incidences, newIncidence],
    }));
  };

  const removeIncidence = (i: number) => {
     if (window.confirm("¿Seguro que quieres eliminar esta incidencia?")) {
        const updatedIncidences = formData.incidences.filter((_, index) => index !== i);
        setFormData(prev => ({ ...prev, incidences: updatedIncidences }));
    }
  };

  useEffect(() => {
    if (formData.hasIncidences && formData.incidences.length === 0) {
      addIncidence();
    } else if (!formData.hasIncidences && formData.incidences.length > 0) {
      setFormData(prev => ({ ...prev, incidences: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hasIncidences]); // Ajustado para depender solo de hasIncidences

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
    setFormData(prev => ({ ...prev, incidences: updatedIncidences }));
  };

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
    setFormData(prev => ({ ...prev, versions: updatedVersions }));
  };

  const addVersion = () =>
    setFormData((prev) => ({
      ...prev,
      versions: [...prev.versions, { appName: "", appVersion: "" }],
    }));

  const removeVersion = (i: number) => {
    const updatedVersions = formData.versions.filter((_, index) => index !== i);
    setFormData(prev => ({ ...prev, versions: updatedVersions }));
  };
  
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
    setFormData(prev => ({ ...prev, customEnvFields: updatedFields }));
  };

  const addCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customEnvFields: [...prev.customEnvFields, { label: "", value: "" }],
    }));
  };

  const removeCustomField = (i: number) => {
    const updatedFields = formData.customEnvFields.filter((_, index) => index !== i);
    setFormData(prev => ({ ...prev, customEnvFields: updatedFields }));
  };

  const isExampleConclusion = formData.conclusion === EXAMPLE_CONCLUSION;
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
      const sd: unknown[][] = XLSX.utils.sheet_to_json(sh, { header: 1, blankrows: false });
      if (sd.length < 2) { alert("Excel vacío o sin datos suficientes."); return; }
      const hdr = sd[0] as string[];
      if (hdr.length !== EXPECTED_HEADERS.length || !EXPECTED_HEADERS.every((h, i) => h === hdr[i]?.trim())) {
        alert(`El formato de columnas no coincide.\nEsperado: ${EXPECTED_HEADERS.join(" | ")}\nEncontrado: ${hdr.join(" | ")}`);
        return;
      }
      const imp: BatteryTest[] = sd.slice(1).map((row: unknown[], rowIndex) => {
        const [id, d, steps, er, or, ver, st] = row;
        return {
          id: String(id || `IMP-${rowIndex + 1}`).trim(), 
          description: String(d || ""),
          steps: String(steps || ""),
          expectedResult: String(er || ""),
          obtainedResult: String(or || ""),
          testVersion: String(ver || ""),
          testStatus: String(st || "Pendiente"), 
          images: [], 
        };
      }).filter(nt => nt.id);

      if (!imp.length) { alert("No se importaron casos válidos."); return; }
      
      setFormData(prev => {
        const combinedTests = [...prev.batteryTests, ...imp];
        return {
          ...prev,
          batteryTests: combinedTests,
          summary: { ...prev.summary, totalTests: String(combinedTests.length) },
        };
      });
      alert(`Importados ${imp.length} casos de prueba.`);
    } catch (err) {
      console.error("Error al leer Excel:", err);
      alert(`Error al leer el archivo Excel: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      if (e.target) e.target.value = "";
    }
  };
  
  const hideField = (k: keyof HiddenFields) => setHiddenFields((p) => ({ ...p, [k]: true }));
  const anyHidden = Object.values(hiddenFields).some(Boolean);
  const restoreAll = () => setHiddenFields({
    serverPruebas: false, ipMaquina: false, navegador: false, baseDatos: false, maquetaUtilizada: false, ambiente: false,
  });


  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      {/* Encabezado del Paso 2 */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-5 border-b border-gray-300">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4 shadow">
            2
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Datos Adicionales del Reporte</h2>
            <p className="text-gray-500 text-sm mt-0.5">Completa la información necesaria para generar un reporte detallado.</p>
          </div>
        </div>
        <button
          onClick={onGoBackToStep1}
          className="mt-4 sm:mt-0 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
        >
          <Layers size={16} className="mr-1.5" />
          Volver al Paso 1
        </button>
      </div>

      {/* --- Sección: Información General --- */}
      <FormSection title="Información General" icon={<Info size={22}/>}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título JIRA (del Paso 1)</label>
          <p className="mt-1 p-3 bg-gray-100 rounded-lg text-gray-800 text-sm min-h-[42px] border border-gray-200">{parsedData.title || "(No se cargó título desde el Paso 1)"}</p>
        </div>
        <StyledInput
          label="Código de JIRA"
          id="jiraCode"
          type="text"
          placeholder="Ej: PROJ-123"
          value={formData.jiraCode}
          onChange={(e) => handleInputChange("jiraCode", e.target.value)}
          required
          disabled={jiraCodeLocked && !forceUnlock}
          style={jiraCodeLocked && !forceUnlock ? { backgroundColor: "#e9ecef", color: "#6c757d", cursor: "not-allowed" } : {}}
        />
        {jiraCodeLocked && !forceUnlock && (
          <button type="button" className="text-xs text-blue-600 hover:underline mt-1.5 flex items-center" onClick={() => setForceUnlock(true)}>
            <Edit3 size={12} className="mr-1" /> ¿Código incorrecto? Editar.
          </button>
        )}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <StyledInput
                label="Fecha de Prueba"
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
            />
            <StyledInput
                label="Tester"
                id="tester"
                type="text"
                placeholder="Iniciales o nombre completo"
                value={formData.tester}
                onChange={(e) => handleInputChange("tester", e.target.value)}
            />
        </div>
        <StyledSelect
            label="Estado General de la Prueba"
            id="testStatus"
            value={formData.testStatus}
            onChange={(e) => handleInputChange("testStatus", e.target.value)}
            required
        >
            <option value="" disabled>Seleccione un estado...</option>
            <option value="Exitosa">Exitosa</option>
            <option value="Fallida">Fallida</option>
            <option value="Parcial">Parcialmente Exitosa</option>
            <option value="Bloqueada">Bloqueada</option>
        </StyledSelect>
      </FormSection>

      {/* --- Sección: Entorno y Configuración --- */}
      <FormSection title="Entorno y Configuración" icon={<Settings size={22}/>}>
        <div className="pt-1"> {/* Pequeño ajuste para alinear con el título de sección */}
            <label className="inline-flex items-center cursor-pointer">
                <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500 focus:ring-offset-1"
                checked={formData.isApp || false}
                onChange={(e) => handleInputChange("isApp", e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">¿Es validación de una APP Móvil/Escritorio?</span>
            </label>
        </div>

        {formData.isApp && (
          <div className="mt-4 p-4 border rounded-lg bg-blue-50/60 border-blue-200 space-y-4">
            <h4 className="font-semibold text-blue-700 text-sm">Detalles Específicos de la APP</h4>
            <StyledInput label="Endpoint (si aplica)" id="app-endpoint" placeholder="https://api.ejemplo.com" value={formData.endpoint || ""} onChange={(e) => handleInputChange("endpoint", e.target.value)} />
            <StyledInput label="Sistema Operativo / Versión" id="app-os" placeholder="Android 13, iOS 16.5, Windows 11" value={formData.sistemaOperativo || ""} onChange={(e) => handleInputChange("sistemaOperativo", e.target.value)} />
            <StyledInput label="Dispositivo de Pruebas" id="app-device" placeholder="Pixel 8, iPhone 14 Pro, PC…" value={formData.dispositivoPruebas || ""} onChange={(e) => handleInputChange("dispositivoPruebas", e.target.value)} />
            <StyledTextarea label="Precondiciones Específicas APP" id="app-preconds" rows={2} placeholder="Ej: Permisos concedidos, versión mínima requerida..." value={formData.precondiciones || ""} onChange={(e) => handleInputChange("precondiciones", e.target.value)} />
            <StyledInput label="Idioma Configurado" id="app-lang" placeholder="es-ES, en-US" value={formData.idioma || ""} onChange={(e) => handleInputChange("idioma", e.target.value)} />
          </div>
        )}

        <div className="mt-5 space-y-3"> {/* Incrementado mt */}
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Versiones de Aplicativos/Componentes</label>
          {formData.versions.map((v, i) => (
            <div key={i} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <input type="text" aria-label={`Nombre aplicativo ${i + 1}`} className="flex-grow border-gray-300 p-2.5 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Nombre aplicativo" value={v.appName} onChange={(e) => handleVersionChange(i, "appName", e.target.value)} />
              <input type="text" aria-label={`Versión aplicativo ${i + 1}`} className="w-32 border-gray-300 p-2.5 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Versión" value={v.appVersion} onChange={(e) => handleVersionChange(i, "appVersion", e.target.value)} />
              <button type="button" onClick={() => removeVersion(i)} className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors" title="Eliminar esta versión"><XCircle size={20} /></button>
            </div>
          ))}
          <button type="button" onClick={addVersion} className="inline-flex items-center mt-1.5 px-3.5 py-2 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 shadow-sm"><PlusCircle size={16} className="mr-1.5" /> Añadir versión</button>
        </div>
        
        <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2.5">Campos de Entorno Adicionales</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {!hiddenFields.serverPruebas && ( <div className="relative group"> <StyledInput label="Servidor de Pruebas" id="serverPruebas" placeholder="Ej: Servidor UAT" value={formData.serverPruebas} onChange={(e) => handleInputChange("serverPruebas", e.target.value)} /> <button type="button" onClick={() => hideField("serverPruebas")} className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-100" title="Ocultar campo"><XCircle size={18} /></button> </div> )}
                {!hiddenFields.ipMaquina && ( <div className="relative group"> <StyledInput label="IP Máquina Cliente" id="ipMaquina" placeholder="Ej: 192.168.1.100" value={formData.ipMaquina} onChange={(e) => handleInputChange("ipMaquina", e.target.value)} /> <button type="button" onClick={() => hideField("ipMaquina")} className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-100" title="Ocultar campo"><XCircle size={18} /></button> </div> )}
                {!hiddenFields.navegador && ( <div className="relative group"> <StyledInput label="Navegador Utilizado" id="navegador" placeholder="Ej: Chrome 120" value={formData.navegador} onChange={(e) => handleInputChange("navegador", e.target.value)} /> <button type="button" onClick={() => hideField("navegador")} className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-100" title="Ocultar campo"><XCircle size={18} /></button> </div> )}
                {!hiddenFields.baseDatos && ( <div className="relative group"> <StyledSelect label="Base de Datos" id="baseDatos" value={formData.baseDatos} onChange={(e) => handleInputChange("baseDatos", e.target.value)}> <option value="">Seleccione o escriba...</option> <option value="SQL Server">SQL Server</option><option value="Oracle">Oracle</option><option value="MySQL">MySQL</option> <option value="PostgreSQL">PostgreSQL</option><option value="MongoDB">MongoDB</option><option value="N/A">N/A</option> </StyledSelect> {formData.baseDatos === "" || !["SQL Server", "Oracle", "MySQL", "PostgreSQL", "MongoDB", "N/A"].includes(formData.baseDatos) && ( <input type="text" className="mt-1.5 w-full border-gray-300 p-2.5 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Especifique BD" value={formData.baseDatos} onChange={(e) => handleInputChange("baseDatos", e.target.value)} /> )} <button type="button" onClick={() => hideField("baseDatos")} className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-100" title="Ocultar campo"><XCircle size={18} /></button> </div> )}
                {!hiddenFields.maquetaUtilizada && ( <div className="relative group"> <StyledInput label="Maqueta Utilizada" id="maquetaUtilizada" placeholder="Ej: Maqueta XYZ v2" value={formData.maquetaUtilizada} onChange={(e) => handleInputChange("maquetaUtilizada", e.target.value)} /> <button type="button" onClick={() => hideField("maquetaUtilizada")} className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-100" title="Ocultar campo"><XCircle size={18} /></button> </div> )}
                {!hiddenFields.ambiente && ( <div className="relative group"> <StyledSelect label="Ambiente" id="ambiente" value={formData.ambiente} onChange={(e) => handleInputChange("ambiente", e.target.value)}> <option value="">Seleccione...</option> <option value="Desarrollo">Desarrollo</option><option value="Integración">Integración</option><option value="UAT">UAT</option> <option value="Transferencia">Transferencia</option><option value="PRE">Pre-Producción</option><option value="PROD">Producción</option> </StyledSelect> {formData.ambiente === "" || !["Desarrollo", "Integración", "UAT", "Transferencia", "PRE", "PROD"].includes(formData.ambiente) && ( <input type="text" className="mt-1.5 w-full border-gray-300 p-2.5 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Especifique Ambiente" value={formData.ambiente} onChange={(e) => handleInputChange("ambiente", e.target.value)} /> )} <button type="button" onClick={() => hideField("ambiente")} className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-100" title="Ocultar campo"><XCircle size={18} /></button> </div> )}
            </div>
            {anyHidden && (
            <div className="mt-5 text-right">
                <button type="button" onClick={restoreAll} className="inline-flex items-center text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 shadow-sm"><ListPlus size={14} className="mr-1.5"/> Mostrar todos los campos de entorno</button>
            </div>
            )}
        </div>

        <div className="mt-5"> {/* Incrementado mt */}
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Campos Personalizados (Entorno)</label>
          {formData.customEnvFields.map((f, i) => (
            <div key={i} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
              <input type="text" aria-label={`Nombre campo ${i + 1}`} placeholder="Nombre del campo" className="flex-grow border-gray-300 p-2.5 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" value={f.label} onChange={(e) => handleCustomFieldChange(i, "label", e.target.value)} />
              <input type="text" aria-label={`Valor campo ${i + 1}`} placeholder="Valor del campo" className="flex-grow border-gray-300 p-2.5 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" value={f.value} onChange={(e) => handleCustomFieldChange(i, "value", e.target.value)} />
              <button type="button" onClick={() => removeCustomField(i)} className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors" title="Eliminar campo"><XCircle size={20}/></button>
            </div>
          ))}
          <button type="button" onClick={addCustomField} className="inline-flex items-center mt-2.5 px-3.5 py-2 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 shadow-sm"><PlusCircle size={16} className="mr-1.5" /> Añadir campo personalizado</button>
        </div>
      </FormSection>

      <FormSection title="Batería de Pruebas" icon={<ListChecks size={22} />}>
        <p className="text-sm text-gray-500 -mt-3 mb-5"> {/* Ajuste de margen */}
          Define los casos de prueba ejecutados. Puedes añadir, eliminar, duplicar o importar desde Excel.
        </p>
        <div className="space-y-6">
          {formData.batteryTests.map((test, idx) => (
            <BatteryTestCaseCard
              key={test.id || idx} // Usar un ID más estable si es posible, fallback al índice
              test={test}
              index={idx}
              onTestChange={handleBatteryTestChange}
              onRemoveTest={removeBatteryTest}
              onDuplicateTest={duplicateBatteryTest}
              setFormData={setFormData} 
              allTests={formData.batteryTests} 
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-gray-200"> {/* Aumentado gap y padding/margen */}
          <button type="button" onClick={addBatteryTest} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm hover:shadow-md"><PlusCircle size={18} className="mr-2" /> Añadir Caso de Prueba</button>
          <Tippy content={`Importa casos desde Excel. Columnas: ${EXPECTED_HEADERS.join(", ")}`} placement="top">
            <button type="button" onClick={handleImportClick} className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-sm hover:shadow-md"><Sheet size={18} className="mr-2" /> Importar Excel</button>
          </Tippy>
          <a href="/plantillas/plantilla_bateria_pruebas.xlsx" download className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
            <Download size={16} className="mr-1.5" />Descargar Plantilla Excel
          </a>
        </div>
        <input type="file" accept=".xls,.xlsx" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </FormSection>

      <FormSection title="Datos de Prueba Utilizados (Globales)" icon={<Layers size={22} />}>
        <StyledTextarea
            label="Registro de datos de entrada, parámetros, usuarios, etc., comunes a varias pruebas."
            id="datosDePrueba"
            rows={5}
            className="font-mono text-xs"
            placeholder="Ej: Usuario: test_user | Contraseña: pwd | Pedido ID: 12345 | Filtro aplicado: Fecha='2025-04-22'"
            value={formData.datosDePrueba}
            onChange={(e) => handleInputChange("datosDePrueba", e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1.5">Estos son datos generales. Los datos específicos de un caso se pueden detallar dentro de cada tarjeta de caso de prueba si es necesario.</p>
      </FormSection>
      
      <FormSection title="Logs Relevantes" icon={<FileTextIcon size={22} />}>
        <StyledTextarea
            label="Extractos de logs que ayuden a entender comportamientos o errores."
            id="logsRelevantes"
            rows={10}
            className="font-mono text-xs bg-gray-900 text-green-400 placeholder-gray-500 rounded-md p-4" // Mejorado estilo consola
            placeholder={`Ejemplo:\n[INFO] 2025-05-16 10:30:00 - User 'albope' logged in.\n[ERROR] 2025-05-16 10:32:15 - Service 'X' failed: Timeout after 30s.`}
            value={formData.logsRelevantes || ""}
            onChange={(e) => handleInputChange("logsRelevantes", e.target.value)}
        />
      </FormSection>

      <FormSection title="Resumen de Resultados" icon={<BarChart3 size={22} />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
            <StyledInput label="Total de Pruebas" id="totalTests" type="number" min={0} value={formData.summary.totalTests} onChange={(e) => handleInputChange("summary", { ...formData.summary, totalTests: e.target.value })} />
            <StyledInput label="Pruebas Exitosas" id="successfulTests" type="number" min={0} max={Number(formData.summary.totalTests) || undefined} value={formData.summary.successfulTests} onChange={(e) => handleInputChange("summary", { ...formData.summary, successfulTests: e.target.value })} />
            <StyledInput label="Pruebas Fallidas" id="failedTests" type="number" min={0} max={Number(formData.summary.totalTests) || undefined} value={formData.summary.failedTests} onChange={(e) => handleInputChange("summary", { ...formData.summary, failedTests: e.target.value })} />
        </div>
        <StyledTextarea
            label="Observaciones del Resumen"
            id="observations"
            rows={4} // Un poco más de espacio
            placeholder="Breve resumen, notas adicionales sobre los resultados globales, o cualquier impedimento encontrado."
            value={formData.summary.observations}
            onChange={(e) => handleInputChange("summary", { ...formData.summary, observations: e.target.value })}
        />
      </FormSection>

      <FormSection title="Incidencias Detectadas" icon={<AlertOctagon size={22} />}>
        <div className="flex items-center gap-4 mb-3"> {/* mb-3 añadido */}
            <label className="block text-sm font-medium text-gray-700 whitespace-nowrap">¿Se detectaron incidencias?</label>
            <div className="flex items-center gap-3">
                {(["Sí", "No"] as const).map(option => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => handleInputChange("hasIncidences", option === "Sí")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm
                            ${(formData.hasIncidences && option === "Sí") || (!formData.hasIncidences && option === "No")
                                ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-400'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400'
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
              <div key={i} className="p-4 rounded-lg border bg-red-50/40 border-red-300 relative space-y-4 shadow">
                 <button type="button" onClick={() => removeIncidence(i)} className="absolute top-2.5 right-2.5 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors" title="Eliminar incidencia"><XCircle size={20}/></button>
                 <h5 className="text-sm font-semibold text-red-700">Incidencia #{i + 1}</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <StyledInput label="ID Prueba Relacionada" id={`inc-id-${i}`} placeholder="Ej: CASO-005" value={inc.id} onChange={(e) => handleIncidenceChange(i, "id", e.target.value)} />
                  <StyledInput label="Estado Incidencia" id={`inc-status-${i}`} placeholder="Ej: Reportada, Corregida" value={inc.status} onChange={(e) => handleIncidenceChange(i, "status", e.target.value)} />
                </div>
                <StyledTextarea label="Descripción Incidencia" id={`inc-desc-${i}`} rows={3} placeholder="Describe brevemente el problema" value={inc.description} onChange={(e) => handleIncidenceChange(i, "description", e.target.value)} />
                <StyledInput label="Impacto" id={`inc-impact-${i}`} placeholder="Ej: Crítico, Alto, Medio" value={inc.impact} onChange={(e) => handleIncidenceChange(i, "impact", e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={addIncidence} className="inline-flex items-center mt-2 px-3.5 py-2 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 shadow-sm"><PlusCircle size={16} className="mr-1.5" /> Añadir incidencia</button>
          </div>
        )}
      </FormSection>
      
      <FormSection title="Conclusiones Finales" icon={<CheckCircle2 size={22} />}>
        <StyledTextarea
            label="Evaluación final del ciclo de pruebas y próximos pasos recomendados."
            id="conclusion"
            rows={5}
            className={isExampleConclusion ? "italic text-gray-400" : ""}
            placeholder={EXAMPLE_CONCLUSION}
            value={formData.conclusion}
            onChange={(e) => handleInputChange("conclusion", e.target.value)}
        />
      </FormSection>

      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 pt-8 border-t border-gray-300"> {/* Aumentado mt y gap */}
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-800 bg-white rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium flex items-center justify-center"
        >
          <Trash2 size={16} className="mr-2" />
          Reiniciar Formulario
        </button>
        <button
          type="button"
          onClick={onGenerate}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-base font-semibold flex items-center justify-center"
        >
          <FileCheckIcon size={18} className="mr-2" />
          Generar Reporte
        </button>
      </div>
    </div>
  );
}

// --- Sub-componente para Tarjeta de Caso de Prueba ---
// (Definición de BatteryTestCaseCard como la tenías, pero aplicando las correcciones de tipo dentro si es necesario)
interface BatteryTestCaseCardProps {
    test: BatteryTest;
    index: number;
    onTestChange: (index: number, field: keyof BatteryTest, value: string) => void;
    onRemoveTest: (index: number) => void;
    onDuplicateTest: (index: number) => void;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>; // Tipo corregido
    allTests: BatteryTest[]; 
}

const BatteryTestCaseCard: React.FC<BatteryTestCaseCardProps> = ({
    test, index, onTestChange, onRemoveTest, onDuplicateTest, setFormData, allTests
}) => {

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        try {
            const b64s = await Promise.all(files.map(readFileAsBase64));
            setFormData((prev: FormData) => { // CORRECCIÓN: Tipo explícito para prev
                const updatedTests = prev.batteryTests.map((t, i) => {
                    if (i === index) {
                        return { ...t, images: [...(t.images || []), ...b64s] };
                    }
                    return t;
                });
                return { ...prev, batteryTests: updatedTests };
            });
        } catch (error) {
            console.error("Error al leer imágenes:", error);
            alert("Hubo un error al cargar una o más imágenes.");
        } finally {
            if (e.target) e.target.value = "";
        }
    };

    const handleRemoveImage = (imgIndex: number) => {
        setFormData((prev: FormData) => { // CORRECCIÓN: Tipo explícito para prev
            const updatedTests = prev.batteryTests.map((t, i) => {
                if (i === index) {
                    const updatedImages = t.images?.filter((_, idx) => idx !== imgIndex);
                    return { ...t, images: updatedImages };
                }
                return t;
            });
            return { ...prev, batteryTests: updatedTests };
        });
    };
    
    let statusBorderColor = "border-gray-300"; // Default
    let statusTextColor = "text-gray-600";
    let statusBgColor = "bg-gray-100";

    if (test.testStatus === "Exitoso") {
        statusBorderColor = "border-green-400";
        statusTextColor = "text-green-700";
        statusBgColor = "bg-green-50";
    } else if (test.testStatus === "Fallido") {
        statusBorderColor = "border-red-400";
        statusTextColor = "text-red-700";
        statusBgColor = "bg-red-50";
    } else if (test.testStatus === "Bloqueado") {
        statusBorderColor = "border-yellow-400";
        statusTextColor = "text-yellow-700";
        statusBgColor = "bg-yellow-50";
    }


    return (
        <div className={`p-5 rounded-xl border-2 ${statusBorderColor} ${statusBgColor} shadow-md space-y-4 relative group`}>
            <div className="flex justify-between items-center pb-2 mb-3 border-b ${statusBorderColor}">
                <span className={`text-sm font-semibold ${statusTextColor} px-2.5 py-1 rounded-md`}>
                    ID Caso: {test.id || `Caso #${index + 1}`}
                </span>
                <div className="flex space-x-1">
                    <Tippy content="Duplicar Caso de Prueba">
                        <button type="button" onClick={() => onDuplicateTest(index)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"><Copy size={16} /></button>
                    </Tippy>
                    <Tippy content="Eliminar Caso de Prueba">
                        <button type="button" onClick={() => onRemoveTest(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"><Trash2 size={16} /></button>
                    </Tippy>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <StyledInput label="ID Prueba (Editable)" id={`test-id-${index}`} placeholder="Ej: CASO-001" value={test.id} onChange={(e) => onTestChange(index, "id", e.target.value)} />
                <StyledInput label="Versión Probada" id={`test-version-${index}`} placeholder="Ej: v1.2.0" value={test.testVersion} onChange={(e) => onTestChange(index, "testVersion", e.target.value)} />
            </div>
            <StyledTextarea label="Descripción del Caso" id={`test-desc-${index}`} rows={2} placeholder="Describe el objetivo de la prueba" value={test.description} onChange={(e) => onTestChange(index, "description", e.target.value)} />
            <StyledTextarea label="Pasos para Reproducir" id={`test-steps-${index}`} rows={4} placeholder="1. Ir a...\n2. Hacer clic en...\n3. Verificar que..." value={test.steps} onChange={(e) => onTestChange(index, "steps", e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <StyledTextarea label="Resultado Esperado" id={`test-expected-${index}`} rows={3} placeholder="Lo que debería suceder" value={test.expectedResult} onChange={(e) => onTestChange(index, "expectedResult", e.target.value)} />
                <StyledTextarea label="Resultado Obtenido" id={`test-obtained-${index}`} rows={3} placeholder="Lo que sucedió realmente (usa ❌ o ✅)" value={test.obtainedResult} onChange={(e) => onTestChange(index, "obtainedResult", e.target.value)} />
            </div>
            <StyledSelect label="Estado del Caso" id={`test-status-${index}`} value={test.testStatus} onChange={(e) => onTestChange(index, "testStatus", e.target.value)}>
                <option value="Pendiente">Pendiente</option>
                <option value="Exitoso">Exitoso ✅</option>
                <option value="Fallido">Fallido ❌</option>
                <option value="Bloqueado">Bloqueado 🚧</option>
                <option value="No aplica">No aplica ➖</option>
            </StyledSelect>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Evidencias (Imágenes)</label>
                <input
                    type="file"
                    accept="image/*,.jpeg,.jpg,.png,.gif"
                    multiple
                    className="block w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={handleImageUpload}
                />
                 {test.images && test.images.length > 0 && (
                    <div className="mt-3.5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {test.images.map((src, i) => (
                            <div key={i} className="relative aspect-square rounded-md overflow-hidden border-2 border-gray-200 shadow-sm group/image hover:border-blue-400 transition-all">
                                <Image src={src} alt={`Evidencia ${index + 1}-${i + 1}`} layout="fill" objectFit="cover" unoptimized={true} className="group-hover/image:scale-105 transition-transform duration-300" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(i)}
                                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover/image:opacity-100 transition-opacity focus:opacity-100"
                                    title="Eliminar esta imagen"
                                >
                                    <XCircle size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {test.images && test.images.length > 0 && (
                    <div className="text-right mt-2.5">
                        <button type="button" onClick={() => downloadImagesZip([test])} className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium hover:underline"><Download size={14} className="mr-1" /> Descargar ZIP ({test.images.length})</button>
                    </div>
                )}
            </div>
        </div>
    );
};